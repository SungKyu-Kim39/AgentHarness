import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { OwnedCommand } from './owned-command';

const isWin = process.platform === 'win32';
const available = (file: string) => lstat(file).then(s => s.isFile() && !s.isSymbolicLink(), () => false);
const sha = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

export type WritableDocumentFormat = 'xlsx' | 'docx' | 'pptx' | 'hwpx';

export interface DocumentReadExtendedInput {
  path: string;
  mode?: 'markdown' | 'tables' | 'docling';
  pages?: string;
}

export interface DocumentWriteInput {
  format: WritableDocumentFormat;
  outputPath: string;
  templatePath?: string;
  spec: Record<string, unknown>;
}

/** Bidirectional Korean HWP/HWPX and MS Office (XLSX, DOCX, PPTX) + precise PDF table extraction. */
export class DocumentTools {
  private commands: OwnedCommand;
  private abort = new AbortController();

  constructor(
    private root: string,
    private resources: string,
    private options: {
      approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
      pythonExecutable?: string;
      officeWorkerScript?: string;
      kordocWorkerScript?: string;
      siteDirs?: string[];
      nodeDir?: string;
      resolveVenvPython?: (project: string) => Promise<{ kind: 'venv' | 'conda'; prefix: string; python: string } | undefined>;
      verifyWorkspaceTools?: () => Promise<void>;
    },
  ) {
    this.commands = new OwnedCommand(resources);
  }

  private async pythonBin(): Promise<string> {
    if (this.options.pythonExecutable) return this.options.pythonExecutable;
    if (isWin) {
      const mcpPy = path.join(this.resources, 'runtime/windows-x64/mcp/python/python.exe');
      if (await available(mcpPy)) return mcpPy;
      return path.join(this.resources, 'runtime/windows-x64/openviking/python/python.exe');
    }
    return 'python3';
  }

  private async officeWorkerPath(): Promise<string> {
    if (this.options.officeWorkerScript) return this.options.officeWorkerScript;
    const bundled = path.join(this.resources, 'ned/office-worker.py');
    if (await available(bundled)) return bundled;
    return path.resolve(typeof __dirname === 'string' ? __dirname : path.join(process.cwd(), 'distribution'), 'office-worker.py');
  }

  private async kordocWorkerPath(): Promise<string> {
    if (this.options.kordocWorkerScript) return this.options.kordocWorkerScript;
    const bundled = path.join(this.resources, 'ned/kordoc-worker.mjs');
    if (await available(bundled)) return bundled;
    return path.resolve(typeof __dirname === 'string' ? __dirname : path.join(process.cwd(), 'distribution'), 'kordoc-worker.mjs');
  }

  private sites(): string[] {
    if (this.options.siteDirs) return this.options.siteDirs;
    return [path.join(this.resources, 'runtime/windows-x64/workspace-tools/site')];
  }

  private nodeDir(): string {
    return this.options.nodeDir ?? path.join(this.resources, 'runtime/windows-x64/workspace-tools/node');
  }

  private workerEnv(work: string, asNode = false): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = {
      ...(asNode ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
      TEMP: work,
      TMP: work,
      TMPDIR: work,
      HOME: work,
      USERPROFILE: work,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
      PYTHONDONTWRITEBYTECODE: '1',
      DO_NOT_TRACK: '1',
      HF_HUB_OFFLINE: '1',
    };
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'PATH']) if (process.env[key]) env[key] = process.env[key];
    return env;
  }

  private async copyChecked(source: string, dest: string, maxBytes = 64 * 1024 * 1024) {
    const stat = await lstat(source);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxBytes) {
      throw new Error('문서 입력은 64 MiB 이하의 일반 파일이어야 합니다.');
    }
    await mkdir(path.dirname(dest), { recursive: true, mode: 0o700 });
    await copyFile(source, dest);
  }

  async readExtended(project: string, input: DocumentReadExtendedInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    await this.options.verifyWorkspaceTools?.();
    const files = new ProjectFiles(project);
    const resolved = await files.resolve(input.path);
    const ext = path.extname(input.path).toLowerCase();

    await mkdir(path.join(this.root, 'doc-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'doc-work/read-'));
    try {
      const staged = path.join(work, 'input', path.basename(resolved));
      await this.copyChecked(resolved, staged);

      if (ext === '.hwp' || ext === '.hwpx') {
        const reqFile = path.join(work, 'request.json');
        await writeFile(reqFile, JSON.stringify({
          action: 'read',
          input: staged,
          nodeDir: this.nodeDir(),
          python: await this.pythonBin(),
        }), { mode: 0o600 });
        const res = await this.commands.run(
          { executable: process.execPath, args: [await this.kordocWorkerPath(), reqFile], cwd: work, env: this.workerEnv(work, true) },
          combined,
          60000,
        );
        if (res.exitCode !== 0) throw new Error(`한글 문서 읽기 실패: ${res.output.slice(0, 1000)}`);
        return JSON.parse(res.stdout);
      }

      if (input.mode === 'tables' && ext === '.pdf') {
        const reqFile = path.join(work, 'request.json');
        await writeFile(reqFile, JSON.stringify({
          action: 'read_pdf_tables',
          work,
          sites: this.sites(),
          input: staged,
          pages: input.pages,
        }), { mode: 0o600 });
        const res = await this.commands.run(
          { executable: await this.pythonBin(), args: ['-I', '-B', await this.officeWorkerPath(), reqFile], cwd: work, env: this.workerEnv(work) },
          combined,
          90000,
        );
        if (res.exitCode !== 0) throw new Error(`PDF 표 추출 실패: ${res.output.slice(0, 1000)}`);
        return JSON.parse(res.stdout);
      }

      if (input.mode === 'docling') {
        const pyEnv = await this.options.resolveVenvPython?.(project);
        if (!pyEnv) throw new Error('Docling 정밀 추출은 프로젝트 .venv에 docling이 설치되어 있을 때 사용할 수 있습니다.');
        const script = [
          'import json, sys',
          'from docling.document_converter import DocumentConverter',
          'res = DocumentConverter().convert(sys.argv[1])',
          'print(json.dumps({"status": "ok", "engine": "docling", "markdown": res.document.export_to_markdown()[:120000]}, ensure_ascii=False))',
        ].join('\n');
        const res = await this.commands.run(
          { executable: pyEnv.python, args: ['-B', '-c', script, staged], cwd: work, env: this.workerEnv(work) },
          combined,
          180000,
        );
        if (res.exitCode !== 0) throw new Error(`Docling 변환 실패 (프로젝트 .venv에 docling이 설치되어 있는지 확인하세요): ${res.output.slice(0, 1000)}`);
        return JSON.parse(res.stdout);
      }

      throw new Error('지원하지 않는 확장 문서 읽기 조합입니다.');
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async write(_session: string, project: string, input: DocumentWriteInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    await this.options.verifyWorkspaceTools?.();

    const expectedExt = '.' + input.format;
    if (path.extname(input.outputPath).toLowerCase() !== expectedExt) {
      throw new Error(`출력 파일 확장자는 ${expectedExt}여야 합니다 (매크로 포맷 .xlsm/.docm/.pptm 차단).`);
    }
    const files = new ProjectFiles(project);
    const targetPath = await files.resolve(input.outputPath, true);
    if (await lstat(targetPath).then(() => true, (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return false;
      throw error;
    })) throw new Error('대상 파일이 이미 있습니다. 새 출력 경로를 지정하세요.');

    await mkdir(path.join(this.root, 'doc-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'doc-work/write-'));
    try {
      let stagedTemplate: string | undefined;
      if (input.templatePath) {
        if (path.extname(input.templatePath).toLowerCase() !== expectedExt) {
          throw new Error(`템플릿 파일 확장자도 ${expectedExt}여야 합니다.`);
        }
        const resolvedTpl = await files.resolve(input.templatePath);
        stagedTemplate = path.join(work, 'input/template' + expectedExt);
        await this.copyChecked(resolvedTpl, stagedTemplate);
      }

      // Stage any local project images referenced by docx blocks or pptx slides
      const images: Record<string, string> = {};
      const stageImage = async (rel: unknown) => {
        if (typeof rel !== 'string' || !rel || images[rel]) return;
        if (!/\.(png|jpe?g|gif|bmp)$/i.test(rel)) return;
        const resolvedImg = await files.resolve(rel);
        const dest = path.join(work, 'input/images', `${Object.keys(images).length}${path.extname(rel).toLowerCase()}`);
        await this.copyChecked(resolvedImg, dest, 16 * 1024 * 1024);
        images[rel] = dest;
      };
      const blocks = Array.isArray(input.spec.blocks) ? input.spec.blocks : [];
      for (const block of blocks) if (block && typeof block === 'object' && (block as any).type === 'image') await stageImage((block as any).path);
      const slides = Array.isArray(input.spec.slides) ? input.spec.slides : [];
      for (const slide of slides) if (slide && typeof slide === 'object' && (slide as any).image) await stageImage((slide as any).image);

      const stagedOut = path.join(work, 'output/result' + expectedExt);
      const reqFile = path.join(work, 'request.json');
      let workerResult: Record<string, unknown>;

      if (input.format === 'hwpx') {
        await writeFile(reqFile, JSON.stringify({
          action: 'write',
          template: stagedTemplate,
          output: stagedOut,
          spec: input.spec,
          nodeDir: this.nodeDir(),
          python: await this.pythonBin(),
        }), { mode: 0o600 });
        const res = await this.commands.run(
          { executable: process.execPath, args: [await this.kordocWorkerPath(), reqFile], cwd: work, env: this.workerEnv(work, true) },
          combined,
          60000,
        );
        if (res.exitCode !== 0) throw new Error(`HWPX 문서 생성 실패: ${res.output.slice(0, 1000)}`);
        workerResult = JSON.parse(res.stdout);
      } else {
        await writeFile(reqFile, JSON.stringify({
          action: 'write_' + input.format,
          work,
          sites: this.sites(),
          template: stagedTemplate,
          output: stagedOut,
          images,
          spec: input.spec,
        }), { mode: 0o600 });
        const res = await this.commands.run(
          { executable: await this.pythonBin(), args: ['-I', '-B', await this.officeWorkerPath(), reqFile], cwd: work, env: this.workerEnv(work) },
          combined,
          90000,
        );
        if (res.exitCode !== 0) throw new Error(`${input.format.toUpperCase()} 문서 생성 실패: ${res.output.slice(0, 1000)}`);
        workerResult = JSON.parse(res.stdout);
      }

      const generatedBytes = await readFile(stagedOut);
      const outHash = sha(generatedBytes);
      const ok = await this.options.approve(
        `문서 파일 생성 승인: ${input.outputPath}`,
        `프로젝트: ${project}\n형식: ${input.format.toUpperCase()}\n출력 경로: ${input.outputPath}\n${input.templatePath ? `템플릿: ${input.templatePath}\n` : ''}생성 크기: ${generatedBytes.length} bytes\nSHA-256: ${outHash}`,
        combined,
      );
      if (!ok) throw new Error('문서 파일 생성을 취소했습니다.');
      combined.throwIfAborted();

      await files.createGeneratedFile(input.outputPath, generatedBytes, combined);

      return {
        ...workerResult,
        status: 'written',
        path: input.outputPath,
        bytes: generatedBytes.length,
        sha256: outHash,
      };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async close() {
    this.abort.abort();
    await this.commands.close();
  }
}
