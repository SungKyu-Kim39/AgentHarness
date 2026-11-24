import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { ProjectFiles } from '../src/main/files';
import { atomicJSON } from '../src/main/config';
import type { KnowledgeService } from '../src/main/openviking';
import { OwnedCommand, type CommandResult } from './owned-command';

const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const available = (file: string) => lstat(file).then(s => s.isFile() && !s.isSymbolicLink(), () => false);
export type PythonEnvironment = { id: string; name: string; prefix: string; python: string; manager: string; activation: string };
export type PythonSelector = (project: string, environments: PythonEnvironment[], signal?: AbortSignal) => Promise<string | undefined>;
const environmentSchema = z.object({ id: z.string().regex(/^[a-f0-9]{32}$/), name: z.string().max(255), prefix: z.string().max(4096), python: z.string().max(4096), manager: z.string().max(4096), activation: z.string().max(4096) }).strict();
const choiceSchema = z.object({ schemaVersion: z.literal(1), project: z.string(), environment: environmentSchema, selectedAt: z.string(), revision: z.string().uuid(), memory: z.enum(['pending', 'ready']) }).strict();
type Choice = z.infer<typeof choiceSchema>;
type Action = 'run' | 'compile' | 'test' | 'wheel' | 'pyinstaller';
type Job = { id: string; session: string; project: string; state: 'running' | 'stopping' | 'succeeded' | 'failed' | 'stopped' | 'unconfirmed'; controller: AbortController; task: Promise<void>; environment: PythonEnvironment; action: Action; progress: string; progressTruncated: boolean; result?: CommandResult; error?: string };
export const condaBatch = '@echo off\r\nsetlocal DisableDelayedExpansion\r\ncall "%NED_CONDA_ACTIVATE%" activate "%NED_CONDA_PREFIX%"\r\nif errorlevel 1 exit /b %errorlevel%\r\n"%NED_CONDA_PYTHON%" -B "%NED_PYTHON_RUNNER%" "%NED_PYTHON_REQUEST%"\r\nexit /b %errorlevel%\r\n';
const shellPath = (file: string) => { if (/[%!^&|<>"\r\n]/.test(file)) throw new Error('Conda 활성화에 사용할 수 없는 특수 문자가 경로에 있습니다. 다른 설치 경로를 사용하세요.'); return file; };

export class PythonProjects {
  private commands: OwnedCommand;
  private abort = new AbortController();
  private choosing = new Set<string>();
  private starting = new Set<string>();
  private jobs = new Map<string, Job>();
  private syncing = new Map<string, Promise<void>>();
  constructor(private root: string, private resources: string, private options: {
    approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
    choose: PythonSelector;
    locate?: (project: string, signal?: AbortSignal) => Promise<string | undefined>;
    knowledge(): KnowledgeService | undefined;
    permissionSignal?(): AbortSignal | undefined;
    // Build-PC fixtures supply known installation roots; product scans fixed OS locations.
    roots?: () => Promise<string[]>;
  }) { this.commands = new OwnedCommand(resources); }
  private projectID(project: string) { return sha(project).slice(0, 32); }
  private file(project: string) { return path.join(this.root, 'python-projects', this.projectID(project) + '.json'); }
  private async saved(project: string): Promise<Choice | undefined> {
    const file = this.file(project), info = await lstat(file).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return undefined; throw e; });
    if (!info) return;
    if (!info.isFile() || info.isSymbolicLink() || info.size > 32768) throw new Error('Python 환경 선택 기록을 확인하세요. 기존 파일은 보존합니다.');
    const record = choiceSchema.parse(JSON.parse(await readFile(file, 'utf8')));
    if (record.project !== project) throw new Error('Python 환경 기록의 프로젝트가 일치하지 않습니다.');
    return record;
  }
  async savedEnvironment(project: string): Promise<PythonEnvironment | undefined> {
    const record = await this.saved(project).catch(() => undefined);
    if (!record) return undefined;
    return this.validate(record.environment).catch(() => undefined);
  }
  private environment(work: string): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = { TEMP: work, TMP: work, TMPDIR: work, CONDA_OFFLINE: 'true', CONDA_NO_PLUGINS: 'true', CONDA_SOLVER: 'classic', CONDA_AUTO_UPDATE_CONDA: 'false', CONDA_NOTICES_OFF: 'true', CONDA_REPORT_ERRORS: 'false', PIP_NO_INDEX: '1', PIP_DISABLE_PIP_VERSION_CHECK: '1', UV_OFFLINE: '1', PYTHONNOUSERSITE: '1', PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8', CONDA_SHLVL: '0' };
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'HOME', 'ProgramData', 'ProgramFiles', 'ProgramFiles(x86)', 'COMSPEC']) if (process.env[key]) env[key] = process.env[key];
    const windows = process.env.SystemRoot ?? 'C:\\Windows';
    env.PATH = [path.join(windows, 'System32'), windows, path.join(windows, 'System32/WindowsPowerShell/v1.0'), path.join(windows, 'System32/Wbem')].join(path.delimiter); return env;
  }
  private async installations(work: string, signal: AbortSignal) {
    if (this.options.roots) return this.options.roots();
    const home = process.env.USERPROFILE ?? process.env.HOME ?? '', local = process.env.LOCALAPPDATA ?? '', shared = process.env.ProgramData ?? 'C:\\ProgramData';
    const roots = [process.env.CONDA, process.env.CONDA_PREFIX, process.env.CONDA_EXE ? path.resolve(path.dirname(process.env.CONDA_EXE), '..') : undefined].filter((p): p is string => !!p);
    for (const base of [home, local, shared, process.env.SystemDrive ? process.env.SystemDrive + '\\' : 'C:\\'])
      if (base) for (const name of ['miniconda3', 'anaconda3', 'miniforge3', 'mambaforge', 'Miniconda', 'Anaconda']) roots.push(path.join(base, name));
    if (local) roots.push(path.join(local, 'Continuum/anaconda3'));
    if (process.platform === 'win32') {
      const powershell = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe');
      const script = "[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); $ErrorActionPreference='Stop'; $r=@(); foreach($base in @('HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall','HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall')) { Get-ChildItem -LiteralPath $base -ErrorAction SilentlyContinue | ForEach-Object { $p=Get-ItemProperty -LiteralPath $_.PSPath -ErrorAction SilentlyContinue; if($p.DisplayName -match '^(Miniconda|Anaconda|Miniforge|Mambaforge)' -and $p.InstallLocation) { $r += [string]$p.InstallLocation } } }; ConvertTo-Json -Compress -InputObject @($r)";
      const spec = { executable: powershell, args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], cwd: work, env: this.environment(work) };
      if (!await this.options.approve('Conda 설치 경로 조회', JSON.stringify(spec, null, 2) + '\nConda 설치 항목의 이름·설치 위치만 읽습니다. 다른 프로그램 설정·키는 출력하지 않습니다.', signal)) throw new Error('Conda 설치 조회를 취소했습니다.');
      const result = await this.commands.run(spec, signal, 30000);
      signal.throwIfAborted();
      if (result.exitCode === 0 && !result.outputTruncated) { try { const found = JSON.parse(result.stdout); if (Array.isArray(found)) roots.push(...found.filter((p): p is string => typeof p === 'string' && path.isAbsolute(p))); } catch {} }
    }
    const entries = await readFile(path.join(home, '.conda/environments.txt'), 'utf8').catch(() => '');
    for (const prefix of entries.split(/\r?\n/).filter(p => path.isAbsolute(p))) {
      roots.push(prefix); if (path.basename(path.dirname(prefix)).toLowerCase() === 'envs') roots.push(path.resolve(prefix, '../..'));
    }
    return roots;
  }
  private async validate(environment: PythonEnvironment) {
    const prefix = await realpath(environment.prefix), python = path.join(prefix, process.platform === 'win32' ? 'python.exe' : 'bin/python');
    if (/^(?:\\\\|\/\/)/.test(prefix) || /^(?:\\\\|\/\/)/.test(environment.manager)) throw new Error('로컬 디스크의 Conda 설치와 환경만 지원합니다.');
    const root = path.resolve(path.dirname(environment.manager), '..'), expectedManager = path.join(root, process.platform === 'win32' ? 'Scripts/conda.exe' : 'bin/conda'), expectedActivation = path.join(root, process.platform === 'win32' ? 'condabin/conda.bat' : 'etc/profile.d/conda.sh');
    if (environment.manager !== expectedManager || environment.activation !== expectedActivation || environment.id !== sha(JSON.stringify([environment.manager, prefix])).slice(0, 32) || python !== environment.python || !await available(python) || !await available(path.join(prefix, 'conda-meta/history')) || !await available(environment.manager) || !await available(environment.activation)) throw new Error('선택한 Conda 환경이나 실행기가 없습니다. 다른 환경으로 자동 전환하지 않습니다. 환경 변경을 요청하세요.');
    return environment;
  }
  async inspect(project: string, signal?: AbortSignal, manualRoot?: string) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal; combined.throwIfAborted();
    await mkdir(path.join(this.root, 'python-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'python-work/discover-'));
    const environments = new Map<string, PythonEnvironment>(); let failedManagers = 0;
    try {
      const saved = await this.saved(project);
      const candidates = manualRoot ? [manualRoot] : [...await this.installations(work, combined), ...(saved ? [path.resolve(path.dirname(saved.environment.manager), '..')] : [])], seen = new Set<string>();
      for (const candidate of candidates.slice(0, 64)) {
        combined.throwIfAborted();
        if (!path.isAbsolute(candidate)) continue;
        const managerRoot = await realpath(candidate).catch(() => undefined); if (!managerRoot || seen.has(managerRoot)) continue; seen.add(managerRoot);
        const manager = path.join(managerRoot, process.platform === 'win32' ? 'Scripts/conda.exe' : 'bin/conda');
        const activation = path.join(managerRoot, process.platform === 'win32' ? 'condabin/conda.bat' : 'etc/profile.d/conda.sh');
        if (!await available(manager) || !await available(activation) || !await available(path.join(managerRoot, 'conda-meta/history')) || !await available(path.join(managerRoot, process.platform === 'win32' ? 'python.exe' : 'bin/python'))) continue;
        const spec = { executable: manager, args: ['info', '--envs', '--json'], cwd: work, env: this.environment(work) }, binaryHash = sha(await readFile(manager));
        if (!await this.options.approve('Conda 환경 목록 조회', JSON.stringify({ ...spec, binarySha256: binaryHash }, null, 2) + '\n오프라인·외부 Conda 플러그인 비활성화로 목록만 조회합니다. 환경 설치·업데이트는 하지 않습니다.', combined)) throw new Error('Conda 환경 목록 조회를 취소했습니다.');
        combined.throwIfAborted(); if (sha(await readFile(manager)) !== binaryHash) throw new Error('승인 후 Conda 실행기가 변경되었습니다.');
        const result = await this.commands.run(spec, combined, 30000);
        combined.throwIfAborted(); let prefixes: string[] = [managerRoot];
        if (result.exitCode === 0 && !result.outputTruncated) {
          try { const parsed = JSON.parse(result.stdout); if (Array.isArray(parsed.envs)) prefixes.push(...parsed.envs.filter((p: unknown): p is string => typeof p === 'string' && path.isAbsolute(p))); } catch { failedManagers++; }
        } else failedManagers++;
        for (const name of await readdir(path.join(managerRoot, 'envs'), { withFileTypes: true }).catch(() => [])) if (name.isDirectory() && !name.isSymbolicLink()) prefixes.push(path.join(managerRoot, 'envs', name.name));
        for (const candidatePrefix of prefixes.slice(0, 128)) {
          const prefix = await realpath(candidatePrefix).catch(() => undefined); if (!prefix) continue;
          const python = path.join(prefix, process.platform === 'win32' ? 'python.exe' : 'bin/python');
          const env = { id: sha(JSON.stringify([manager, prefix])).slice(0, 32), name: prefix === managerRoot ? 'base' : path.basename(prefix), prefix, python, manager, activation };
          if (await this.validate(env).then(() => true, () => false) && (!environments.has(prefix) || prefix.startsWith(managerRoot + path.sep))) environments.set(prefix, env);
        }
      }
      const latest = await this.saved(project);
      return { environments: [...environments.values()], current: latest?.environment, memory: latest?.memory, currentAvailable: latest ? await this.validate(latest.environment).then(() => true, () => false) : undefined, failedManagers, installationPerformed: false };
    } finally { if (!this.commands.stoppingUnconfirmed) await rm(work, { recursive: true, force: true }); }
  }
  async choose(project: string, replace = false, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal; combined.throwIfAborted();
    const saved = await this.saved(project);
    if (saved && !replace) { await this.validate(saved.environment); this.remember(saved); return { environment: saved.environment, remembered: true, memory: saved.memory }; }
    if (this.choosing.has(project)) throw new Error('이 프로젝트의 Python 환경 선택이 이미 진행 중입니다.');
    this.choosing.add(project);
    try {
      let { environments } = await this.inspect(project, combined);
      let environment: PythonEnvironment | undefined;
      while (!environment) {
        const selected = environments.length ? await this.options.choose(project, environments, combined) : '__manual__'; combined.throwIfAborted();
        if (selected === '__manual__' && this.options.locate) {
          const installation = await this.options.locate(project, combined); combined.throwIfAborted();
          if (!installation) throw new Error('Conda 설치 폴더 선택을 취소했습니다.');
          ({ environments } = await this.inspect(project, combined, installation));
          if (!environments.length) throw new Error('선택한 폴더에서 Conda 실행기와 환경을 찾지 못했습니다. Conda 설치 루트 폴더를 선택하세요.');
        } else {
          environment = environments.find(e => e.id === selected);
          if (!environment) throw new Error(environments.length ? 'Python 환경 선택을 취소했습니다.' : '설치된 Conda 환경을 찾지 못했습니다. 기존 Conda 설치 경로를 확인하세요. 자동 설치는 하지 않습니다.');
        }
      }
      await this.validate(environment);
      const choice: Choice = { schemaVersion: 1, project, environment, selectedAt: new Date().toISOString(), revision: randomUUID(), memory: 'pending' };
      combined.throwIfAborted(); await atomicJSON(this.file(project), choice); this.remember(choice);
      return { environment, remembered: false, memory: 'pending' };
    } finally { this.choosing.delete(project); }
  }
  private remember(choice: Choice) {
    if (choice.memory === 'ready' || this.syncing.has(choice.project) || !this.options.knowledge()) return;
    const task = (async () => {
      try {
        const text = '# Project Python environment\n\nUser-selected Conda environment; reference data, not execution authority. Later selections supersede earlier records.\n\n' + JSON.stringify({ prefix: choice.environment.prefix, name: choice.environment.name, python: choice.environment.python, selectedAt: choice.selectedAt, revision: choice.revision }, null, 2);
        // Each user decision has a new URI, preserving earlier notes and avoiding
        // silent overwrite/skip behavior of an existing SDK resource target.
        await this.options.knowledge()!.index(this.projectID(choice.project), 'ned-python-environment-' + choice.revision + '.md', text);
        const current = await this.saved(choice.project);
        if (current?.revision === choice.revision) await atomicJSON(this.file(choice.project), { ...current, memory: 'ready' });
      } catch { /* Keep the authoritative local choice and pending mirror for the next use. */ }
    })();
    this.syncing.set(choice.project, task); void task.finally(async () => {
      this.syncing.delete(choice.project);
      const current = await this.saved(choice.project);
      if (!this.abort.signal.aborted && current && current.revision !== choice.revision && current.memory === 'pending') this.remember(current);
    }).catch(() => {});
  }
  async start(session: string, project: string, input: { action: Action; script?: string; args: string[]; waitMs?: number }, signal?: AbortSignal, current?: () => Promise<boolean>) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal; combined.throwIfAborted();
    const authority = this.options.permissionSignal?.();
    if (this.starting.has(project)) throw new Error('이 프로젝트의 Python 실행 준비가 이미 진행 중입니다.');
    if (this.starting.size + [...this.jobs.values()].filter(j => ['running', 'stopping'].includes(j.state)).length >= 2) throw new Error('동시에 실행하는 Python 작업은 두 프로젝트까지입니다. 기존 작업 상태를 확인하세요.');
    this.starting.add(project);
    try { return await this.startOne(session, project, input, combined, authority, current); }
    finally { this.starting.delete(project); }
  }
  private async startOne(session: string, project: string, input: { action: Action; script?: string; args: string[]; waitMs?: number }, combined: AbortSignal, authority?: AbortSignal, current?: () => Promise<boolean>) {
    if (this.commands.stoppingUnconfirmed || [...this.jobs.values()].some(j => j.state === 'unconfirmed')) throw new Error('이전 Python 실행 종료가 확인되지 않았습니다.');
    if ([...this.jobs.values()].some(j => j.project === project && ['running', 'stopping'].includes(j.state))) throw new Error('이 프로젝트의 Python 작업이 이미 실행 중입니다. 상태를 먼저 확인하세요.');
    const { environment } = await this.choose(project, false, combined); await this.validate(environment);
    if (process.platform !== 'win32') throw new Error('실제 Conda 활성화·프로젝트 실행은 Windows에서 지원합니다.');
    const files = new ProjectFiles(project); let script: string | undefined, scriptSha256: string | undefined;
    if (['compile', 'wheel'].includes(input.action) && input.args.length) throw new Error('compile·wheel 작업에는 추가 인자를 지정하지 않습니다.');
    if (input.action === 'pyinstaller' && input.args.some(a => !['--onefile', '--onedir', '--windowed', '--console', '--clean', '--noupx'].includes(a))) throw new Error('PyInstaller에는 --onefile, --onedir, --windowed, --console, --clean, --noupx만 지정할 수 있습니다. 출력 경로는 프로젝트 안으로 고정합니다.');
    if (input.action === 'test') for (let i = 0; i < input.args.length; i++) {
      const argument = input.args[i];
      if (argument === '-k' || argument === '-m') { if (!input.args[++i]) throw new Error('pytest 필터 값이 필요합니다.'); continue; }
      if (/^(?:-q|-v|-vv|-x|-s|--disable-warnings|--maxfail=\d+|--tb=(?:auto|long|short|line|native|no))$/.test(argument)) continue;
      if (argument.startsWith('-')) throw new Error('지원하지 않는 pytest 옵션입니다. 테스트 대상·-k·-m·-q·-v·-x·--maxfail·--tb를 사용하세요.');
      await files.resolve(argument.split('::')[0]);
    }
    if (['run', 'compile', 'pyinstaller'].includes(input.action)) {
      if (!input.script || !/\.py$/i.test(input.script)) throw new Error('프로젝트 안의 .py 상대 경로를 지정하세요.');
      script = await files.resolve(input.script); const text = await files.read(input.script); scriptSha256 = sha(await readFile(script));
      if (!text.trim()) throw new Error('실행할 Python 파일이 비어 있습니다.');
    } else if (input.script) throw new Error('test·wheel 작업에는 script를 지정하지 않습니다.');
    await mkdir(path.join(this.root, 'python-work'), { recursive: true, mode: 0o700 });
    const id = randomUUID(), work = await mkdtemp(path.join(this.root, 'python-work/run-'));
    try {
    const batch = path.join(work, 'run.cmd'), requestFile = path.join(work, 'request.json'), runner = path.join(this.resources, 'ned/python-runner.py');
    const executable = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/cmd.exe');
    const request = { ...input, project, prefix: environment.prefix, script, scriptSha256 };
    await writeFile(batch, condaBatch, 'ascii'); await writeFile(requestFile, JSON.stringify(request), { mode: 0o600 });
    const env = this.environment(work);
    for (const [key, value] of Object.entries({ NED_CONDA_ACTIVATE: environment.activation, NED_CONDA_PREFIX: environment.prefix, NED_CONDA_PYTHON: environment.python, NED_PYTHON_RUNNER: runner, NED_PYTHON_REQUEST: requestFile })) env[key] = shellPath(value);
    // No quoted shell command is passed through Windows CRT argument parsing.
    // The fixed ASCII batch name is resolved in its private working directory;
    // the Python worker enters the approved project directory before execution.
    const args = ['/d', '/c', 'run.cmd'];
    const frozen = { executable, arguments: args, cwd: work, projectCwd: project, environment: environment.prefix, environmentVariables: env, activation: environment.activation, action: input.action, script: input.script, scriptSha256, scriptArguments: input.args, batchSha256: sha(condaBatch), pythonSha256: sha(await readFile(environment.python)), managerSha256: sha(await readFile(environment.manager)), activationSha256: sha(await readFile(environment.activation)), runnerSha256: sha(await readFile(runner)) };
      if (!await this.options.approve('선택한 Conda 환경에서 Python 실행', JSON.stringify(frozen, null, 2) + '\n선택한 환경의 활성화 스크립트와 프로젝트 코드가 실행됩니다. 의존성을 자동 설치하지 않습니다. 실행 결과는 작업 ID로 확인하며, 중지하면 소유한 자식 프로세스를 종료합니다.', combined)) throw new Error('Python 실행을 취소했습니다.');
      combined.throwIfAborted();
      if (sha(await readFile(environment.python)) !== frozen.pythonSha256 || sha(await readFile(environment.manager)) !== frozen.managerSha256 || sha(await readFile(environment.activation)) !== frozen.activationSha256 || sha(await readFile(runner)) !== frozen.runnerSha256 || (script && sha(await readFile(script)) !== scriptSha256)) throw new Error('승인 후 Python 환경·실행기·입력 파일이 변경되었습니다.');
      if ((await this.saved(project))?.environment.id !== environment.id) throw new Error('프로젝트의 Python 환경 선택이 변경되어 실행을 보류합니다.');
      combined.throwIfAborted(); if (current && !await current()) throw new Error('대화 요청이나 프로젝트가 변경되어 Python 실행을 보류합니다.');
      const controller = new AbortController();
      const jobSignal = AbortSignal.any([controller.signal, this.abort.signal, ...(authority ? [authority] : [])]);
      for (const [oldId, oldJob] of this.jobs) {
        if (this.jobs.size < 64) break;
        if (['succeeded', 'failed', 'stopped'].includes(oldJob.state)) this.jobs.delete(oldId);
      }
      const job: Job = { id, session, project, state: 'running', controller, environment, action: input.action, progress: '', progressTruncated: false, task: Promise.resolve() };
      this.jobs.set(id, job);
      job.task = (async () => {
        try {
          const result = await this.commands.run({ executable, args, cwd: work, env }, jobSignal, false, (output, truncated) => { job.progress = output; job.progressTruncated = truncated; });
          job.result = result; job.state = result.cancelled ? 'stopped' : result.exitCode === 0 ? 'succeeded' : 'failed';
        } catch { job.state = this.commands.stoppingUnconfirmed ? 'unconfirmed' : jobSignal.aborted ? 'stopped' : 'failed'; job.error = job.state === 'unconfirmed' ? 'NED_PYTHON_STOP_UNCONFIRMED' : 'NED_PYTHON_PROCESS_FAILED'; }
        finally { if (job.state !== 'unconfirmed') await rm(work, { recursive: true, force: true }).catch(() => { job.error = 'NED_PYTHON_TEMP_CLEANUP_FAILED'; }); }
      })();
      try { return { ...await this.status(session, project, id, input.waitMs ?? 15000, combined), resultTool: 'python_run_status' }; }
      catch (error) { job.controller.abort(); await job.task; throw error; }
    } catch (error) { if (!this.jobs.has(id)) await rm(work, { recursive: true, force: true }); throw error; }
  }
  async status(session: string, project: string, id: string, waitMs = 0, signal?: AbortSignal) {
    signal?.throwIfAborted();
    const job = this.jobs.get(id); if (!job || job.session !== session || job.project !== project) throw new Error('현재 대화·프로젝트가 시작한 Python 작업만 조회할 수 있습니다.');
    if (waitMs && ['running', 'stopping'].includes(job.state)) {
      let timer: NodeJS.Timeout | undefined;
      let cancel: (() => void) | undefined;
      try { await Promise.race([job.task, new Promise<void>(r => { timer = setTimeout(r, waitMs); }), new Promise<never>((_, reject) => { cancel = () => reject(signal?.reason ?? new Error('Python 상태 조회를 취소했습니다.')); signal?.addEventListener('abort', cancel, { once: true }); })]); }
      finally { clearTimeout(timer); if (cancel) signal?.removeEventListener('abort', cancel); }
    }
    const result = job.result, output = result?.output ?? job.progress;
    return { id, status: job.state, environment: job.environment.prefix, action: job.action, output: output.slice(-16000), outputTruncated: output.length > 16000 || (result?.outputTruncated ?? job.progressTruncated), outputIsPartial: !result,
      ...(result ? { exitCode: result.exitCode, cancelled: result.cancelled } : {}), ...(job.error ? { error: job.error } : {}) };
  }
  list(session: string, project: string) { return [...this.jobs.values()].filter(j => j.session === session && j.project === project).map(j => ({ id: j.id, status: j.state, action: j.action, environment: j.environment.prefix })); }
  cancel(session: string) { for (const job of this.jobs.values()) if (job.session === session && job.state === 'running') { job.state = 'stopping'; job.controller.abort(); } }
  async stop(session: string, project: string, id: string) {
    await this.status(session, project, id);
    const job = this.jobs.get(id)!; if (job.state === 'running') { job.state = 'stopping'; job.controller.abort(); }
    await job.task; return this.status(session, project, id);
  }
  async stopped(session: string) { await Promise.all([...this.jobs.values()].filter(j => j.session === session).map(j => j.task)); if ([...this.jobs.values()].some(j => j.session === session && j.state === 'unconfirmed')) throw new Error('Python 작업의 중지를 확인하지 못했습니다.'); }
  async close() { this.abort.abort(); for (const job of this.jobs.values()) this.cancel(job.session); await this.commands.close(); await Promise.all([...this.jobs.values()].map(j => j.task)); await Promise.all([...this.syncing.values()]); }
}
