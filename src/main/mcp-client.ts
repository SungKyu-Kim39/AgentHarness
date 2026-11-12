import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export interface McpContent { type: string; text?: string; data?: string; mimeType?: string; [key: string]: unknown }
export interface McpToolResult { content: McpContent[]; isError?: boolean; structuredContent?: unknown }
export interface McpLaunch {
  executable: string; args: string[]; cwd: string; env: NodeJS.ProcessEnv;
  allowedTools: readonly string[]; timeout?: number; diagnostic?: (text: string) => void;
}
/** Private stdio client. No sampling, elicitation, remote roots or server-selected execution. */
export class PrivateMcpClient {
  private child?: ChildProcessWithoutNullStreams;
  private sequence = 0; private buffer = ''; private bytes = 0;
  private pending = new Map<number, { resolve(result: any): void; reject(error: Error): void; cleanup(): void }>();
  private exited?: Promise<void>; private startTask?: Promise<void>; private closing?: Promise<void>;
  private closed = false; private uncertain = false;
  constructor(readonly launch: McpLaunch) {}
  get stoppingUnconfirmed() { return this.uncertain; }
  get stopping() { return !!this.closing; }
  private rejectPending(message: string) { for (const request of this.pending.values()) { request.cleanup(); request.reject(new Error(message)); } this.pending.clear(); }
  async start() {
    if (this.startTask) return this.startTask;
    this.startTask = this.open(); return this.startTask;
  }
  private async open() {
    if (this.closed || this.uncertain) throw new Error('중지된 MCP 실행은 다시 사용할 수 없습니다.');
    const child = spawn(this.launch.executable, this.launch.args, { cwd: this.launch.cwd, env: this.launch.env, windowsHide: true, stdio: 'pipe', detached: process.platform !== 'win32', shell: false });
    this.child = child;
    child.stdout.setEncoding('utf8');
    this.exited = new Promise<void>(resolve => {
      child.once('exit', () => { this.rejectPending('MCP 프로세스가 종료되었습니다.'); resolve(); });
      child.once('error', () => { this.rejectPending('고정 MCP 실행 파일을 시작하지 못했습니다.'); resolve(); });
    });
    child.stderr.on('data', data => this.launch.diagnostic?.(data.toString()));
    child.stdout.on('data', data => {
      this.bytes += Buffer.byteLength(data); this.buffer += data;
      if (this.buffer.length > 8 * 1024 * 1024 || this.bytes > 32 * 1024 * 1024) { this.rejectPending('MCP 응답 크기 제한 초과'); void this.close().catch(() => {}); return; }
      const lines = this.buffer.split('\n'); this.buffer = lines.pop()!;
      for (const line of lines) {
        let message: any; try { message = JSON.parse(line); } catch { continue; }
        if (message.jsonrpc !== '2.0') continue;
        if (message.method && message.id !== undefined) {
          const reply = message.method === 'roots/list'
            ? { jsonrpc: '2.0', id: message.id, result: { roots: [{ uri: pathToFileURL(this.launch.cwd).href, name: 'Ned controlled snapshot' }] } }
            : { jsonrpc: '2.0', id: message.id, error: { code: -32601, message: 'Ned does not provide sampling, elicitation or execution to MCP servers' } };
          child.stdin.write(JSON.stringify(reply) + '\n'); continue;
        }
        const request = this.pending.get(message.id); if (!request) continue;
        this.pending.delete(message.id); request.cleanup();
        if (message.error) request.reject(new Error('MCP 요청이 거절되었습니다.')); else request.resolve(message.result);
      }
    });
    try {
      const hello = await this.rpc('initialize', { protocolVersion: '2025-06-18', capabilities: { roots: { listChanged: false } }, clientInfo: { name: 'Ned guarded offline host', version: '0.2.2' } });
      if (typeof hello?.protocolVersion !== 'string' || !hello.serverInfo) throw new Error('MCP 초기화 응답 오류');
      child.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');
      const catalog = await this.rpc('tools/list', {});
      if (!Array.isArray(catalog?.tools)) throw new Error('MCP 도구 목록 오류');
      for (const name of this.launch.allowedTools) if (!catalog.tools.some((tool: { name: string }) => tool.name === name)) throw new Error(`고정 MCP에서 검토한 도구를 찾지 못했습니다: ${name}`);
    } catch (error) { await this.close(); throw error; }
  }
  private rpc(method: string, params: unknown, signal?: AbortSignal): Promise<any> {
    if (!this.child || this.closed || this.uncertain || this.child.exitCode !== null) return Promise.reject(new Error('MCP 실행이 준비되지 않았습니다.'));
    signal?.throwIfAborted(); const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const cancel = () => { this.pending.delete(id); cleanup(); void this.close().then(() => reject(new Error('MCP 실행을 중지했습니다.')), reject); };
      const timer = setTimeout(cancel, this.launch.timeout ?? 60000);
      const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', cancel); };
      this.pending.set(id, { resolve, reject, cleanup }); signal?.addEventListener('abort', cancel, { once: true });
      this.child!.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n', error => { if (error) { this.pending.delete(id); cleanup(); reject(new Error('MCP 입력 전달 실패')); } });
    });
  }
  async call(name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<McpToolResult> {
    if (!this.launch.allowedTools.includes(name)) throw new Error('승인 중계에 등록되지 않은 MCP 도구입니다.');
    await this.start(); signal?.throwIfAborted(); this.bytes = 0;
    const result = await this.rpc('tools/call', { name, arguments: structuredClone(args) }, signal);
    if (!Array.isArray(result?.content) || result.content.some((item: McpContent) => item.type === 'text' ? typeof item.text !== 'string' : item.type !== 'image' || !['image/png', 'image/jpeg'].includes(item.mimeType ?? '') || typeof item.data !== 'string' || item.data.length > 6 * 1024 * 1024 || !/^[A-Za-z0-9+/]*={0,2}$/.test(item.data))) throw new Error('지원하지 않는 MCP 응답 형식입니다.');
    return result;
  }
  close() {
    if (this.closing) return this.closing;
    this.closing = this.stop(); return this.closing;
  }
  private async stop() {
    this.closed = true; this.rejectPending('MCP 실행을 중지했습니다.'); const child = this.child; if (!child) return;
    child.stdin.end();
    const kill = () => {
      if (child.exitCode !== null || !child.pid) return;
      try { if (process.platform === 'win32') child.kill('SIGKILL'); else process.kill(-child.pid, 'SIGKILL'); } catch { /* exit is still confirmed below */ }
    };
    const force = setTimeout(kill, 1500);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([this.exited, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('MCP 프로세스 종료를 확인하지 못했습니다. 새 실행을 차단합니다.')), 7000); })]);
    } catch (error) { this.uncertain = true; throw error; }
    finally { clearTimeout(force); clearTimeout(timeout); }
  }
}
