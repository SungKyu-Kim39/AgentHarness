import { randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { atomicJSON } from '../src/main/config';
import type { Proposal } from '../src/shared/contracts';
import { OwnedCommand } from './owned-command';

const isWin = process.platform === 'win32';
const available = (file: string) => lstat(file).then(s => s.isFile() && !s.isSymbolicLink(), () => false);

export interface AstSearchInput {
  language: string;
  pattern: string;
  paths?: string[];
  rewrite?: string;
  apply?: boolean;
}

export interface CodeAuditInput {
  paths?: string[];
  categories?: Array<'security' | 'secrets' | 'quality' | 'venv-ruff'>;
}

export interface AstRewriteHooks {
  approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
  validateEdit?: (session: string, project: string, proposal: Proposal, signal?: AbortSignal) => Promise<void>;
}

/** Multilingual AST search/rewrite (ast-grep-py) and offline local security/quality auditing. */
export class AstAuditTools {
  private commands: OwnedCommand;
  private abort = new AbortController();

  constructor(
    private root: string,
    private resources: string,
    private options: {
      pythonExecutable?: string;
      workerScript?: string;
      siteDirs?: string[];
      resolveVenvPython?: (project: string) => Promise<{ kind: 'venv' | 'conda'; prefix: string; python: string } | undefined>;
      verifyWorkspaceTools?: () => Promise<void>;
    } = {},
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

  private async workerPath(): Promise<string> {
    if (this.options.workerScript) return this.options.workerScript;
    const bundled = path.join(this.resources, 'ned/ast-audit-worker.py');
    if (await available(bundled)) return bundled;
    return path.resolve(typeof __dirname === 'string' ? __dirname : path.join(process.cwd(), 'distribution'), 'ast-audit-worker.py');
  }

  private sites(): string[] {
    if (this.options.siteDirs) return this.options.siteDirs;
    return [path.join(this.resources, 'runtime/windows-x64/workspace-tools/site')];
  }

  private async stageSnapshot(project: string, work: string, requestedPaths?: string[]) {
    const files = new ProjectFiles(project);
    const source = path.join(work, 'source');
    await mkdir(source, { recursive: true, mode: 0o700 });
    const list = requestedPaths?.length ? requestedPaths : await files.list();
    let totalBytes = 0;
    const copied: string[] = [];
    for (const rel of list.slice(0, 400)) {
      const text = await files.read(rel).catch(() => undefined);
      if (text === undefined) continue;
      const bytes = Buffer.byteLength(text);
      if (totalBytes + bytes > 20 * 1024 * 1024) break;
      totalBytes += bytes;
      const dest = path.join(source, rel);
      await mkdir(path.dirname(dest), { recursive: true, mode: 0o700 });
      await writeFile(dest, text, 'utf8');
      copied.push(rel);
    }
    return { source, copied };
  }

  private workerEnv(work: string): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = {
      TEMP: work,
      TMP: work,
      TMPDIR: work,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
      PYTHONDONTWRITEBYTECODE: '1',
      DO_NOT_TRACK: '1',
      HF_HUB_OFFLINE: '1',
    };
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'PATH']) if (process.env[key]) env[key] = process.env[key];
    return env;
  }

  async astSearch(session: string, project: string, input: AstSearchInput, hooks: AstRewriteHooks, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    await this.options.verifyWorkspaceTools?.();
    await mkdir(path.join(this.root, 'ast-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'ast-work/search-'));
    try {
      const { source } = await this.stageSnapshot(project, work, input.paths);
      const reqFile = path.join(work, 'request.json');
      await writeFile(reqFile, JSON.stringify({
        mode: 'ast_search',
        work,
        source,
        sites: this.sites(),
        language: input.language,
        pattern: input.pattern,
        rewrite: input.rewrite,
        paths: input.paths,
      }), { mode: 0o600 });
      const res = await this.commands.run(
        { executable: await this.pythonBin(), args: ['-I', '-B', await this.workerPath(), reqFile], cwd: work, env: this.workerEnv(work) },
        combined,
        60000,
      );
      if (res.exitCode !== 0) throw new Error(`AST 검색 실패: ${res.output.slice(0, 1000)}`);
      const parsed = JSON.parse(res.stdout);
      if (parsed.status !== 'ok') throw new Error(parsed.error || 'AST 검색 오류');

      const rewrites: Array<{ path: string; before: string; after: string; replacements: number }> = parsed.rewrites ?? [];
      if (!input.apply || !input.rewrite || !rewrites.length) {
        return {
          status: 'ok',
          engine: parsed.engine,
          language: parsed.language,
          pattern: parsed.pattern,
          matchCount: parsed.matchCount,
          matches: parsed.matches,
          previewFiles: rewrites.map(r => ({ path: r.path, replacements: r.replacements })),
          applied: false,
        };
      }

      const files = new ProjectFiles(project);
      const proposals: Proposal[] = [];
      for (const rw of rewrites) {
        const proposal = await files.propose(randomUUID(), rw.path, rw.after);
        await hooks.validateEdit?.(session, project, proposal, combined);
        proposals.push(proposal);
      }
      const summary = rewrites.map(r => `- ${r.path} (${r.replacements}곳 치환)`).join('\n');
      const ok = await hooks.approve(
        `AST 구조 일괄 치환 승인 (${proposals.length}개 파일)`,
        `프로젝트: ${project}\n언어: ${input.language}\n패턴: ${input.pattern}\n치환: ${input.rewrite}\n\n대상 파일:\n${summary}`,
        combined,
      );
      if (!ok) throw new Error('AST 치환을 취소했습니다.');
      combined.throwIfAborted();
      for (const proposal of proposals) {
        await hooks.validateEdit?.(session, project, proposal, combined);
        await atomicJSON(path.join(this.root, 'snapshots', session, proposal.id + '.json'), proposal);
        await files.apply(proposal, combined);
      }
      return {
        status: 'applied',
        engine: parsed.engine,
        language: parsed.language,
        pattern: parsed.pattern,
        appliedFiles: proposals.length,
        paths: proposals.map(p => p.path),
        matchCount: parsed.matchCount,
      };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async audit(project: string, input: CodeAuditInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    await this.options.verifyWorkspaceTools?.();
    const categories = input.categories?.length ? input.categories : ['security', 'secrets', 'quality', 'venv-ruff'];
    await mkdir(path.join(this.root, 'audit-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'audit-work/scan-'));
    try {
      const { source } = await this.stageSnapshot(project, work, input.paths);
      const reqFile = path.join(work, 'request.json');
      await writeFile(reqFile, JSON.stringify({
        mode: 'code_audit',
        work,
        source,
        sites: this.sites(),
        paths: input.paths,
        categories,
      }), { mode: 0o600 });
      const res = await this.commands.run(
        { executable: await this.pythonBin(), args: ['-I', '-B', await this.workerPath(), reqFile], cwd: work, env: this.workerEnv(work) },
        combined,
        60000,
      );
      if (res.exitCode !== 0) throw new Error(`코드 정적 감사 실패: ${res.output.slice(0, 1000)}`);
      const report = JSON.parse(res.stdout);

      // Optionally merge project .venv ruff diagnostics offline when installed
      let ruffUsed = false;
      if (categories.includes('venv-ruff') && this.options.resolveVenvPython) {
        const pyEnv = await this.options.resolveVenvPython(project).catch(() => undefined);
        if (pyEnv) {
          const ruffRes = await this.commands.run(
            { executable: pyEnv.python, args: ['-B', '-m', 'ruff', 'check', '--output-format=json', ...(input.paths?.length ? input.paths : ['.'])], cwd: project, env: this.workerEnv(work) },
            combined,
            30000,
          ).catch(() => undefined);
          if (ruffRes && (ruffRes.exitCode === 0 || ruffRes.exitCode === 1) && ruffRes.stdout.trim().startsWith('[')) {
            try {
              const ruffItems = JSON.parse(ruffRes.stdout) as Array<{ code?: string; message?: string; filename?: string; location?: { row?: number } }>;
              ruffUsed = true;
              for (const item of ruffItems.slice(0, 100)) {
                const rel = item.filename ? path.relative(project, item.filename).replaceAll('\\', '/') : '';
                report.findings.push({
                  rule: `RUFF-${item.code ?? 'LINT'}`,
                  severity: 'low',
                  category: 'quality',
                  path: rel,
                  line: item.location?.row ?? 1,
                  message: item.message ?? '',
                });
                report.summary.low = (report.summary.low ?? 0) + 1;
                report.totalFindings = (report.totalFindings ?? 0) + 1;
              }
            } catch {}
          }
        }
      }
      return { ...report, ruffUsed };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async close() {
    this.abort.abort();
    await this.commands.close();
  }
}
