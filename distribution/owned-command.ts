import { spawn } from 'node:child_process';
import path from 'node:path';

export type CommandSpec = { executable: string; args: string[]; cwd: string; env: NodeJS.ProcessEnv };
export type CommandResult = { exitCode: number | null; output: string; stdout: string; outputTruncated: boolean; cancelled: boolean };
/** Internal process owner; never accepts executable/shell strings from the model. */
export class OwnedCommand {
  private abort = new AbortController();
  private active = new Set<Promise<CommandResult>>();
  private uncertain = false;
  get stoppingUnconfirmed() { return this.uncertain; }
  constructor(private resources: string) {}
  run(spec: CommandSpec, signal?: AbortSignal, timeout: number | false = false, progress?: (output: string, truncated: boolean) => void) {
    if (this.uncertain || this.abort.signal.aborted) throw new Error('이전 Python 프로세스 종료가 확인되지 않았거나 Ned가 종료 중입니다.');
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    const task = this.execute(structuredClone(spec), combined, timeout, progress); this.active.add(task);
    void task.finally(() => this.active.delete(task)).catch(() => {}); return task;
  }
  private async execute(spec: CommandSpec, signal: AbortSignal, timeout: number | false, progress?: (output: string, truncated: boolean) => void): Promise<CommandResult> {
    signal.throwIfAborted();
    const windows = process.platform === 'win32';
    const executable = windows ? path.join(this.resources, 'runtime/windows-x64/openviking/python/python.exe') : spec.executable;
    const args = windows ? ['-I', '-B', path.join(this.resources, 'runtime/windows-x64/openviking/sidecar-supervisor.py'), spec.executable, ...spec.args] : spec.args;
    const child = spawn(executable, args, { cwd: spec.cwd, env: spec.env, shell: false, windowsHide: true, stdio: 'pipe', detached: !windows });
    child.stdin.on('error', () => {});
    let output = '', stdout = '', outputTruncated = false, cancelled = false;
    let force: NodeJS.Timeout | undefined, confirm: NodeJS.Timeout | undefined, deadline: NodeJS.Timeout | undefined;
    let rejectStop: ((error: Error) => void) | undefined;
    const kill = () => {
      if (!child.pid) return;
      try { if (windows) child.kill('SIGKILL'); else process.kill(-child.pid, 'SIGKILL'); } catch {}
    };
    const stop = () => {
      if (cancelled) return; cancelled = true;
      if (windows) child.stdin.end(); else kill();
      force = setTimeout(kill, 1500);
      confirm = setTimeout(() => { this.uncertain = true; rejectStop?.(new Error('Python 자식 프로세스 종료를 확인하지 못했습니다. 새 실행을 차단합니다.')); }, 8000);
    };
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    const append = (bytes: string) => { output += bytes; if (output.length > 160000) { output = output.slice(-160000); outputTruncated = true; } try { progress?.(output, outputTruncated); } catch { stop(); } };
    child.stdout.on('data', (bytes: string) => { stdout = (stdout + bytes).slice(-160000); append(bytes); }); child.stderr.on('data', append);
    signal.addEventListener('abort', stop, { once: true }); if (signal.aborted) stop();
    if (timeout !== false) deadline = setTimeout(stop, timeout);
    try {
      const exitCode = await new Promise<number | null>((resolve, reject) => {
        rejectStop = reject;
        child.once('error', () => { if (child.pid && child.exitCode === null && child.signalCode === null) this.uncertain = true; reject(new Error('고정된 Python·Conda 실행기를 시작하지 못했습니다. 설치 경로와 실행 권한을 확인하세요.')); });
        child.once('close', resolve);
      });
      return { exitCode, output, stdout, outputTruncated, cancelled };
    } finally { signal.removeEventListener('abort', stop); clearTimeout(force); clearTimeout(confirm); clearTimeout(deadline); }
  }
  async close() {
    this.abort.abort(); await Promise.allSettled([...this.active]);
    if (this.uncertain) throw new Error('Python 실행 종료를 확인하지 못했습니다.');
  }
}
