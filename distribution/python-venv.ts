import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PythonConfig } from '../src/shared/contracts';
import { ProjectFiles } from '../src/main/files';
import { OwnedCommand } from './owned-command';
import type { PythonEnvironment } from './python-projects';

const isWin = process.platform === 'win32';
const available = (file: string) => lstat(file).then(s => s.isFile() && !s.isSymbolicLink(), () => false);
const PEP508_PACKAGE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}(?:\[[A-Za-z0-9._,-]{1,128}\])?(?:(?:==|!=|<=|>=|<|>|~=|===)[A-Za-z0-9.*+!_-]{1,64}(?:,(?:==|!=|<=|>=|<|>|~=|===)[A-Za-z0-9.*+!_-]{1,64})*)?$/;
const PACKAGE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export type VenvOperation = 'status' | 'create' | 'install' | 'uninstall' | 'freeze' | 'run' | 'test';
export interface VenvInput {
  operation: VenvOperation;
  packages?: string[];
  requirementsPath?: string;
  script?: string;
  args?: string[];
}
export interface PackageDocsInput {
  package: string;
  symbol?: string;
  query?: string;
  maxChars?: number;
}

export function validatePackageSpec(spec: string): string {
  const trimmed = spec.trim();
  if (!trimmed || trimmed.startsWith('-') || /[\s\0\\/:@]|(?:\.\.)/.test(trimmed) || !PEP508_PACKAGE.test(trimmed)) {
    throw new Error(`허용되지 않는 Python 패키지 지정자입니다: ${trimmed.slice(0, 80)} (표준 PEP 508 이름/버전 제약만 허용하며 URL·VCS·로컬 경로는 차단합니다.)`);
  }
  return trimmed;
}

export function parseRequirementsText(content: string): string[] {
  const specs: string[] = [];
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('-')) {
      throw new Error(`requirements 파일의 옵션 지시어(${line.slice(0, 40)})는 보안상 허용하지 않습니다. 표준 패키지 목록만 지원합니다.`);
    }
    specs.push(validatePackageSpec(line));
    if (specs.length > 100) throw new Error('한 번에 설치할 수 있는 패키지는 최대 100개입니다.');
  }
  return specs;
}

export class PythonVenvManager {
  private commands: OwnedCommand;
  private abort = new AbortController();
  private busyProjects = new Set<string>();

  constructor(
    private root: string,
    private resources: string,
    private options: {
      approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
      pythonConfig?: () => PythonConfig | undefined;
      savedConda?: (project: string) => Promise<PythonEnvironment | undefined>;
      basePython?: () => Promise<string | undefined>;
      inspectorScript?: string;
    },
  ) {
    this.commands = new OwnedCommand(resources);
  }

  private venvDir(project: string) {
    return path.join(project, '.venv');
  }

  private venvPython(venvRoot: string) {
    return path.join(venvRoot, isWin ? 'Scripts/python.exe' : 'bin/python');
  }

  private async verifyVenvPath(project: string): Promise<{ exists: boolean; venvRoot: string; python: string }> {
    const canonicalProject = await realpath(project);
    const venvRoot = path.join(canonicalProject, '.venv');
    const info = await lstat(venvRoot).catch((e: NodeJS.ErrnoException) => (e.code === 'ENOENT' ? undefined : Promise.reject(e)));
    if (!info) return { exists: false, venvRoot, python: this.venvPython(venvRoot) };
    if (info.isSymbolicLink() || !info.isDirectory()) {
      throw new Error('프로젝트 .venv 경로는 심볼릭 링크가 아닌 일반 디렉터리여야 합니다.');
    }
    const python = this.venvPython(venvRoot);
    const pyStat = await lstat(python).catch(() => undefined);
    if (!pyStat || (!isWin && pyStat.isSymbolicLink() && !(await realpath(python).then(() => true, () => false))) || (isWin && pyStat.isSymbolicLink())) {
      return { exists: false, venvRoot, python };
    }
    return { exists: true, venvRoot, python };
  }

  private async resolveBasePython(project: string): Promise<string> {
    if (this.options.basePython) {
      const injected = await this.options.basePython();
      if (injected) return injected;
    }
    const saved = await this.options.savedConda?.(project);
    if (saved?.python && await available(saved.python)) return saved.python;
    if (isWin) {
      const candidates = [
        path.join(this.resources, 'runtime/windows-x64/mcp/python/python.exe'),
        path.join(this.resources, 'runtime/windows-x64/openviking/python/python.exe'),
      ];
      for (const candidate of candidates) {
        if (await available(candidate)) return candidate;
      }
      throw new Error('가상환경을 생성할 Python 인터프리터를 찾지 못했습니다. 번들 런타임 또는 Conda 환경을 확인하세요.');
    }
    for (const candidate of ['/usr/bin/python3', '/usr/local/bin/python3', 'python3']) {
      if (candidate === 'python3' || await available(candidate)) return candidate;
    }
    throw new Error('Python 3 인터프리터를 찾지 못했습니다.');
  }

  async resolveProjectPython(project: string): Promise<{ kind: 'venv' | 'conda'; prefix: string; python: string }> {
    const venv = await this.verifyVenvPath(project);
    if (venv.exists) return { kind: 'venv', prefix: venv.venvRoot, python: venv.python };
    const conda = await this.options.savedConda?.(project);
    if (conda?.python) return { kind: 'conda', prefix: conda.prefix, python: conda.python };
    throw new Error('프로젝트 .venv 또는 선택된 Conda 환경이 없습니다. manage_python_venv(operation: "create")로 .venv를 만들거나 choose_python_environment로 Conda 환경을 선택하세요.');
  }

  private buildPipEnv(work: string, config?: PythonConfig): { env: NodeJS.ProcessEnv; extraArgs: string[]; summary: string } {
    const respectSystem = config?.respectSystemPipConfig !== false;
    const env: NodeJS.ProcessEnv = {
      TEMP: work,
      TMP: work,
      TMPDIR: work,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
      PYTHONDONTWRITEBYTECODE: '1',
      PIP_DISABLE_PIP_VERSION_CHECK: '1',
      PIP_NO_INPUT: '1',
    };
    const passthrough = [
      'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA',
      'HOME', 'ProgramData', 'ProgramFiles', 'ProgramFiles(x86)', 'COMSPEC', 'PATH',
      'REQUESTS_CA_BUNDLE', 'SSL_CERT_FILE', 'SSL_CERT_DIR',
    ];
    if (respectSystem) {
      passthrough.push('PIP_INDEX_URL', 'PIP_EXTRA_INDEX_URL', 'PIP_TRUSTED_HOST', 'PIP_CONFIG_FILE', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'no_proxy');
    } else {
      env.PIP_CONFIG_FILE = isWin ? 'NUL' : '/dev/null';
    }
    for (const key of passthrough) {
      if (process.env[key]) env[key] = process.env[key];
    }
    const extraArgs: string[] = [];
    if (config?.indexUrl) extraArgs.push('--index-url', config.indexUrl);
    for (const extra of config?.extraIndexUrls ?? []) extraArgs.push('--extra-index-url', extra);
    for (const host of config?.trustedHosts ?? []) extraArgs.push('--trusted-host', host);
    const summaryParts = [
      `respectSystemPipConfig=${respectSystem}`,
      ...(config?.indexUrl ? [`indexUrl=${config.indexUrl}`] : []),
      ...(config?.extraIndexUrls?.length ? [`extraIndexUrls=${config.extraIndexUrls.join(', ')}`] : []),
      ...(config?.trustedHosts?.length ? [`trustedHosts=${config.trustedHosts.join(', ')}`] : []),
    ];
    return { env, extraArgs, summary: summaryParts.join(' · ') };
  }

  private buildOfflineEnv(work: string, venvRoot?: string): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = {
      TEMP: work,
      TMP: work,
      TMPDIR: work,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
      PYTHONDONTWRITEBYTECODE: '1',
      PIP_NO_INDEX: '1',
      PIP_DISABLE_PIP_VERSION_CHECK: '1',
      UV_OFFLINE: '1',
      DO_NOT_TRACK: '1',
      HF_HUB_OFFLINE: '1',
    };
    if (venvRoot) env.VIRTUAL_ENV = venvRoot;
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'HOME', 'PATH']) {
      if (process.env[key]) env[key] = process.env[key];
    }
    return env;
  }

  async manage(session: string, project: string, input: VenvInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    const config = this.options.pythonConfig?.();
    const venv = await this.verifyVenvPath(project);
    await mkdir(path.join(this.root, 'python-venv-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'python-venv-work/op-'));
    try {
      if (input.operation === 'status') {
        let version: string | undefined;
        let packages: Array<{ name: string; version: string }> = [];
        if (venv.exists) {
          const ver = await this.commands.run({ executable: venv.python, args: ['--version'], cwd: project, env: this.buildOfflineEnv(work, venv.venvRoot) }, combined, 15000);
          if (ver.exitCode === 0) version = ver.output.trim();
          const list = await this.commands.run({ executable: venv.python, args: ['-m', 'pip', 'list', '--format=json', '--disable-pip-version-check'], cwd: project, env: this.buildOfflineEnv(work, venv.venvRoot) }, combined, 30000);
          if (list.exitCode === 0) {
            try { packages = JSON.parse(list.stdout); } catch {}
          }
        }
        const savedConda = await this.options.savedConda?.(project);
        return {
          status: 'ok',
          project,
          venv: { exists: venv.exists, path: venv.venvRoot, python: venv.python, version, packageCount: packages.length, packagesSample: packages.slice(0, 60) },
          savedConda: savedConda ? { name: savedConda.name, prefix: savedConda.prefix } : undefined,
          pipPolicy: {
            allowPackageInstall: config?.allowPackageInstall !== false,
            respectSystemPipConfig: config?.respectSystemPipConfig !== false,
            indexUrl: config?.indexUrl,
            extraIndexUrls: config?.extraIndexUrls ?? [],
            trustedHosts: config?.trustedHosts ?? [],
          },
        };
      }

      if (input.operation === 'freeze') {
        const target = await this.resolveProjectPython(project);
        const list = await this.commands.run({ executable: target.python, args: ['-m', 'pip', 'list', '--format=json', '--disable-pip-version-check'], cwd: project, env: this.buildOfflineEnv(work, target.prefix) }, combined, 30000);
        if (list.exitCode !== 0) throw new Error(`패키지 목록 조회 실패 (exit ${list.exitCode}): ${list.output.slice(0, 1000)}`);
        const packages = JSON.parse(list.stdout);
        return { status: 'ok', kind: target.kind, prefix: target.prefix, count: packages.length, packages };
      }

      if (this.busyProjects.has(project)) throw new Error('이 프로젝트의 .venv 작업이 이미 진행 중입니다.');
      this.busyProjects.add(project);
      try {
        if (input.operation === 'create') {
          if (venv.exists) {
            return { status: 'ok', created: false, message: '이미 프로젝트 .venv가 존재합니다.', path: venv.venvRoot, python: venv.python };
          }
          const basePython = await this.resolveBasePython(project);
          const args = ['-m', 'venv', ...(isWin ? ['--copies'] : []), venv.venvRoot];
          const ok = await this.options.approve(
            '프로젝트 Python 가상환경(.venv) 생성',
            `프로젝트: ${project}\n대상 경로: ${venv.venvRoot}\n기준 인터프리터: ${basePython}\n명령: ${basePython} ${args.join(' ')}\n\n프로젝트 내부에 격리된 .venv를 생성합니다.`,
            combined,
          );
          if (!ok) throw new Error('프로젝트 .venv 생성을 취소했습니다.');
          combined.throwIfAborted();
          const res = await this.commands.run({ executable: basePython, args, cwd: project, env: this.buildOfflineEnv(work) }, combined, 120000);
          if (res.exitCode !== 0) throw new Error(`가상환경 생성 실패 (exit ${res.exitCode}): ${res.output.slice(0, 1500)}`);
          const verified = await this.verifyVenvPath(project);
          if (!verified.exists) throw new Error('가상환경 생성 후 Python 실행 파일을 확인하지 못했습니다.');
          return { status: 'ok', created: true, path: verified.venvRoot, python: verified.python, basePython };
        }

        if (input.operation === 'install') {
          if (config?.allowPackageInstall === false) {
            throw new Error('Ned 설정(python.allowPackageInstall=false)에 의해 패키지 설치가 비활성화되어 있습니다.');
          }
          const specs: string[] = [];
          for (const pkg of input.packages ?? []) specs.push(validatePackageSpec(pkg));
          if (input.requirementsPath) {
            const files = new ProjectFiles(project);
            const content = await files.read(input.requirementsPath);
            specs.push(...parseRequirementsText(content));
          }
          if (!specs.length) throw new Error('설치할 패키지 목록(packages) 또는 requirementsPath를 지정하세요.');
          if (specs.length > 100) throw new Error('한 번에 설치할 수 있는 패키지는 최대 100개입니다.');
          const uniqueSpecs = [...new Set(specs)];

          if (!venv.exists) {
            const basePython = await this.resolveBasePython(project);
            const createArgs = ['-m', 'venv', ...(isWin ? ['--copies'] : []), venv.venvRoot];
            const okCreate = await this.options.approve(
              '프로젝트 .venv 자동 생성 및 패키지 설치',
              `프로젝트: ${project}\n대상 .venv: ${venv.venvRoot}\n기준 인터프리터: ${basePython}\n설치 패키지(${uniqueSpecs.length}개): ${uniqueSpecs.join(', ')}\n\n프로젝트 .venv를 생성한 뒤 사내 PyPI 설정으로 패키지를 설치합니다.`,
              combined,
            );
            if (!okCreate) throw new Error('가상환경 생성 및 패키지 설치를 취소했습니다.');
            combined.throwIfAborted();
            const created = await this.commands.run({ executable: basePython, args: createArgs, cwd: project, env: this.buildOfflineEnv(work) }, combined, 120000);
            if (created.exitCode !== 0) throw new Error(`가상환경 생성 실패 (exit ${created.exitCode}): ${created.output.slice(0, 1500)}`);
          } else {
            const { summary } = this.buildPipEnv(work, config);
            const ok = await this.options.approve(
              '사내 PyPI 패키지 설치 (.venv)',
              `프로젝트: ${project}\n대상 .venv: ${venv.venvRoot}\n설치 패키지(${uniqueSpecs.length}개): ${uniqueSpecs.join(', ')}\nPyPI 정책: ${summary}\n\n프로젝트 내부 .venv에만 패키지를 설치합니다.`,
              combined,
            );
            if (!ok) throw new Error('패키지 설치를 취소했습니다.');
          }
          combined.throwIfAborted();
          const verified = await this.verifyVenvPath(project);
          if (!verified.exists) throw new Error('프로젝트 .venv를 확인하지 못했습니다.');
          const { env, extraArgs, summary } = this.buildPipEnv(work, config);
          const args = ['-m', 'pip', 'install', '--no-input', '--disable-pip-version-check', ...extraArgs, '--', ...uniqueSpecs];
          const result = await this.commands.run({ executable: verified.python, args, cwd: project, env }, combined, 300000);
          return {
            status: result.exitCode === 0 ? 'ok' : 'failed',
            exitCode: result.exitCode,
            packages: uniqueSpecs,
            venv: verified.venvRoot,
            pipPolicy: summary,
            output: result.output.slice(-12000),
            outputTruncated: result.outputTruncated,
          };
        }

        if (input.operation === 'uninstall') {
          if (!venv.exists) throw new Error('프로젝트 .venv가 존재하지 않습니다.');
          const names = (input.packages ?? []).map(p => p.trim());
          if (!names.length || names.some(n => !PACKAGE_NAME.test(n))) {
            throw new Error('제거할 유효한 패키지 이름을 하나 이상 지정하세요.');
          }
          const ok = await this.options.approve(
            '프로젝트 .venv 패키지 제거',
            `프로젝트: ${project}\n대상 .venv: ${venv.venvRoot}\n제거 패키지: ${names.join(', ')}`,
            combined,
          );
          if (!ok) throw new Error('패키지 제거를 취소했습니다.');
          combined.throwIfAborted();
          const res = await this.commands.run({ executable: venv.python, args: ['-m', 'pip', 'uninstall', '-y', '--', ...names], cwd: project, env: this.buildOfflineEnv(work, venv.venvRoot) }, combined, 120000);
          return {
            status: res.exitCode === 0 ? 'ok' : 'failed',
            exitCode: res.exitCode,
            removed: names,
            output: res.output.slice(-8000),
          };
        }

        if (input.operation === 'run' || input.operation === 'test') {
          if (!venv.exists) throw new Error('프로젝트 .venv가 없습니다. 먼저 manage_python_venv(operation: "create")로 생성하세요.');
          const files = new ProjectFiles(project);
          const extra = (input.args ?? []).map(a => {
            if (a.includes('\0')) throw new Error('인자에 널 문자를 포함할 수 없습니다.');
            return a;
          });
          let args: string[];
          let label: string;
          if (input.operation === 'run') {
            if (!input.script || !/\.py$/i.test(input.script)) throw new Error('실행할 프로젝트 내 .py 파일 상대 경로를 지정하세요.');
            const resolvedScript = await files.resolve(input.script);
            args = ['-B', resolvedScript, ...extra];
            label = `.venv Python 스크립트 실행: ${input.script}`;
          } else {
            for (let i = 0; i < extra.length; i++) {
              const a = extra[i];
              if (a === '-k' || a === '-m') { if (!extra[++i]) throw new Error('pytest 필터 값이 필요합니다.'); continue; }
              if (/^(?:-q|-v|-vv|-x|-s|--disable-warnings|--maxfail=\d+|--tb=(?:auto|long|short|line|native|no))$/.test(a)) continue;
              if (a.startsWith('-')) throw new Error('지원하지 않는 pytest 옵션입니다.');
              await files.resolve(a.split('::')[0]);
            }
            args = ['-B', '-m', 'pytest', ...extra];
            label = '.venv pytest 실행';
          }
          const ok = await this.options.approve(label, `프로젝트: ${project}\n인터프리터: ${venv.python}\n인자: ${args.join(' ')}\n\n오프라인 실행 환경(PIP_NO_INDEX=1)으로 실행합니다.`, combined);
          if (!ok) throw new Error('Python 실행을 취소했습니다.');
          combined.throwIfAborted();
          const res = await this.commands.run({ executable: venv.python, args, cwd: project, env: this.buildOfflineEnv(work, venv.venvRoot) }, combined, 180000);
          return {
            status: res.exitCode === 0 ? 'ok' : 'failed',
            exitCode: res.exitCode,
            venv: venv.venvRoot,
            output: res.output.slice(-16000),
            outputTruncated: res.outputTruncated,
          };
        }

        throw new Error('지원하지 않는 .venv 작업입니다.');
      } finally {
        this.busyProjects.delete(project);
      }
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async inspectPackageDocs(project: string, input: PackageDocsInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    if (!PACKAGE_NAME.test(input.package.trim())) {
      throw new Error('유효한 Python 패키지 이름을 지정하세요.');
    }
    const target = await this.resolveProjectPython(project);
    const script = this.options.inspectorScript ?? path.join(this.resources, 'ned/python-inspector.py');
    const resolvedScript = await available(script) ? script : path.resolve(typeof __dirname === 'string' ? __dirname : path.join(process.cwd(), 'distribution'), 'python-inspector.py');
    await mkdir(path.join(this.root, 'python-inspect-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'python-inspect-work/doc-'));
    try {
      const reqFile = path.join(work, 'request.json');
      await writeFile(reqFile, JSON.stringify({
        envPrefix: target.prefix,
        package: input.package.trim(),
        symbol: input.symbol?.trim() || undefined,
        query: input.query?.trim() || undefined,
        maxChars: Math.min(48000, Math.max(1000, input.maxChars ?? 16000)),
      }), { mode: 0o600 });
      const res = await this.commands.run(
        { executable: target.python, args: ['-I', '-B', resolvedScript, reqFile], cwd: work, env: this.buildOfflineEnv(work, target.prefix) },
        combined,
        30000,
      );
      if (res.exitCode !== 0) {
        throw new Error(`패키지 API 조회 실패 (exit ${res.exitCode}): ${res.output.slice(0, 1200)}`);
      }
      return JSON.parse(res.stdout);
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async close() {
    this.abort.abort();
    await this.commands.close();
  }
}
