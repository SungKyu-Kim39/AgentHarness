import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { OwnedCommand, type CommandResult } from './owned-command';
import { terminalShell, type TerminalKind } from './ned/terminal';

// PowerShell may wait for end-of-input before it evaluates an encoded
// command. Keep the supervisor's control pipe open, but give the shell EOF.
// Run with a user's ordinary Windows environment, never the private engine credentials.
export function terminalEnvironment(parent: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const omitted = new Set(Object.entries(parent).find(([name]) => name.toUpperCase() === 'NED_TERMINAL_ENV_EXCLUDE')?.[1]?.split(',').map(name => name.trim().toUpperCase()) ?? []);
  const knownNames: Record<string, string> = { PATH: 'Path', SYSTEMROOT: 'SystemRoot', COMSPEC: 'ComSpec', PSMODULEPATH: 'PSModulePath', PROGRAMFILES: 'ProgramFiles', PROGRAMW6432: 'ProgramW6432' };
  const result: NodeJS.ProcessEnv = Object.create(null);
  for (const [name, value] of Object.entries(parent)) {
    const key = name.toUpperCase();
    if (value === undefined || omitted.has(key) ||
        /^(?:NED_|OPENCODE_|ELECTRON_|NODE_OPTIONS$|NODE_PATH$|PYTHONPATH$|PYTHONHOME$|GIT_|AWS_|AZURE_|GOOGLE_APPLICATION_CREDENTIALS$|SSH_AUTH_SOCK$)/.test(key) ||
        /(?:API_?KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL|AUTHORIZATION)/.test(key)) continue;
    result[knownNames[key] ?? key] = value;
  }
  return result;
}

const noninteractiveLaunch = 'import subprocess,sys; sys.exit(subprocess.call(sys.argv[1:], stdin=subprocess.DEVNULL))';

type Job = {
  id: string;
  session: string;
  project: string;
  shell: TerminalKind;
  controller: AbortController;
  task: Promise<void>;
  result?: CommandResult;
  error?: 'start-failed' | 'stop-unconfirmed' | 'stopped';
  output?: string;
  outputTruncated?: boolean;
};

export class TerminalJobs {
  private readonly jobs = new Map<string, Job>();
  private readonly commands: OwnedCommand;
  constructor(private readonly data: string, private readonly resources: string) {
    this.commands = new OwnedCommand(resources);
  }

  async start(session: string, project: string, shell: TerminalKind, command: string, requestSignal?: AbortSignal, authority?: AbortSignal) {
    if (process.platform !== 'win32') throw new Error('CMD와 Windows PowerShell은 Windows에서 사용할 수 있습니다.');
    if (!/^[a-z]:[\\/]/i.test(project)) throw new Error('로컬 드라이브의 프로젝트에서 터미널 명령을 실행할 수 있습니다.');
    requestSignal?.throwIfAborted();
    if ([...this.jobs.values()].some(job => job.session === session && !job.result && !job.error)) {
      throw new Error('현재 대화의 터미널 명령이 실행 중입니다.');
    }
    for (const [id, job] of this.jobs) {
      if (this.jobs.size < 64) break;
      if (job.result || (job.error && job.error !== 'stop-unconfirmed')) this.jobs.delete(id);
    }
    if (this.jobs.size >= 64) throw new Error('동시에 실행할 수 있는 Ned 터미널 작업 수를 초과했습니다.');
    const id = randomUUID(), controller = new AbortController();
    const job: Job = { id, session, project, shell, controller, task: Promise.resolve() };
    this.jobs.set(id, job);
    const signal = authority ? AbortSignal.any([authority, controller.signal]) : controller.signal;
    job.task = this.execute(job, command, signal);
    return this.preview(job);
  }

  private async execute(job: Job, command: string, signal: AbortSignal) {
    const systemRoot = process.env.SystemRoot ?? 'C:\\Windows';
    const shell = terminalShell(job.shell, systemRoot);
    const python = path.join(this.resources, 'runtime/windows-x64/openviking/python/python.exe');
    const env = terminalEnvironment(process.env);
    env.SystemRoot = systemRoot;
    env.WINDIR = systemRoot;
    env.ComSpec = terminalShell('cmd', systemRoot).program;
    let batch: string | undefined;
    try {
      let args: string[];
      if (job.shell === 'powershell') {
        env.PSModulePath ??= [
          path.join(path.dirname(shell.program), 'Modules'),
          path.join(env.ProgramW6432 ?? env.ProgramFiles ?? path.join(path.parse(systemRoot).root, 'Program Files'), 'WindowsPowerShell', 'Modules'),
        ].join(path.delimiter);
        const script = "[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)\n$OutputEncoding = [Console]::OutputEncoding\n$global:LASTEXITCODE = 0\n& {\n" + command +
          "\n}\nif (-not $?) { if ($LASTEXITCODE) { exit $LASTEXITCODE }; exit 1 }; exit $LASTEXITCODE";
        args = [...shell.args, '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')];
      } else {
        const directory = path.join(this.data, 'terminal-jobs');
        await mkdir(directory, { recursive: true });
        batch = path.join(directory, job.id + '.cmd');
        await writeFile(batch, '@echo off\r\n@chcp 65001 >nul\r\n' + command.replace(/\r?\n/g, '\r\n') + '\r\n', { flag: 'wx', mode: 0o600 });
        env.NED_TERMINAL_BATCH = '"' + batch + '"';
        args = [...shell.args, '/Q', '/C', '%NED_TERMINAL_BATCH%'];
      }
      signal.throwIfAborted();
      job.result = await this.commands.run({ executable: python, args: ['-I', '-B', '-c', noninteractiveLaunch, shell.program, ...args], cwd: job.project, env }, signal, false, (output, truncated) => {
        job.output = output.slice(-12000);
        job.outputTruncated = truncated || output.length > 12000;
      });
    } catch {
      job.error = this.commands.stoppingUnconfirmed ? 'stop-unconfirmed' : signal.aborted ? 'stopped' : 'start-failed';
    } finally {
      if (batch) await rm(batch, { force: true }).catch(() => {});
    }
  }

  private owned(session: string, project: string, id: string) {
    const job = this.jobs.get(id);
    if (!job || job.session !== session || job.project !== project) throw new Error('현재 대화·프로젝트의 터미널 작업만 제어할 수 있습니다.');
    return job;
  }
  private preview(job: Job) {
    return { id: job.id, shell: job.shell, status: job.error ?? (job.result
      ? job.result.cancelled ? 'stopped' : 'finished'
      : job.controller.signal.aborted ? 'stopping' : 'running'),
    ...(job.result ? { exitCode: job.result.exitCode } : {}), output: job.output ?? '', outputTruncated: job.outputTruncated ?? false };
  }
  async status(session: string, project: string, id: string, waitMs: number, signal?: AbortSignal) {
    const job = this.owned(session, project, id);
    if (waitMs && !job.result && !job.error) {
      let timer: NodeJS.Timeout | undefined, abort: (() => void) | undefined;
      try {
        signal?.throwIfAborted();
        await Promise.race([job.task, new Promise<void>(resolve => {
          timer = setTimeout(resolve, waitMs);
          abort = resolve;
          signal?.addEventListener('abort', abort, { once: true });
        })]);
        signal?.throwIfAborted();
      } finally {
        clearTimeout(timer);
        if (abort) signal?.removeEventListener('abort', abort);
      }
    }
    return this.preview(job);
  }
  async stop(session: string, project: string, id: string) {
    const job = this.owned(session, project, id);
    job.controller.abort();
    await job.task;
    return this.preview(job);
  }
  cancel(session: string) {
    for (const job of this.jobs.values()) if (job.session === session) job.controller.abort();
  }
  async stopped(session: string) {
    const jobs = [...this.jobs.values()].filter(job => job.session === session);
    await Promise.all(jobs.map(job => job.task));
    if (jobs.some(job => job.error === 'stop-unconfirmed')) throw new Error('터미널 프로세스 종료를 확인하지 못했습니다.');
  }
  async close() {
    for (const job of this.jobs.values()) job.controller.abort();
    const closing = this.commands.close();
    await Promise.all([closing, ...[...this.jobs.values()].map(job => job.task)]);
  }
}
