import { Socket } from 'node:net';
import { randomUUID } from 'node:crypto';
const MAX = 16 * 1024 * 1024;
type Handler = (method: string, params: any) => Promise<unknown>;
/** Private, bounded JSON RPC. No default timeout: model queues are not clocks. */
export class Peer {
  private pending = new Map<string, { resolve(value: any): void; reject(error: Error): void }>();
  private buffer = Buffer.alloc(0);
  private ended = false;
  private closedHandlers: Array<() => void> = [];
  constructor(readonly socket: Socket, private handler: Handler) {
    socket.on('data', chunk => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      while (true) {
        const end = this.buffer.indexOf(10);
        if (end < 0) break;
        if (end > MAX) { socket.destroy(); return; }
        const line = this.buffer.subarray(0, end); this.buffer = this.buffer.subarray(end + 1);
        try { void this.receive(JSON.parse(line.toString())).catch(() => socket.destroy()); }
        catch { socket.destroy(); return; }
      }
      if (this.buffer.length > MAX) socket.destroy();
    });
    socket.on('error', () => {});
    socket.once('close', () => {
      this.ended = true;
      for (const p of this.pending.values()) p.reject(new Error('Ned connection closed'));
      this.pending.clear(); for (const fn of this.closedHandlers) fn();
    });
  }
  onClose(fn: () => void) { this.closedHandlers.push(fn); }
  private async receive(message: any) {
    if (!message || typeof message.id !== 'string' || message.id.length > 80) throw new Error('Invalid RPC');
    if (typeof message.method === 'string') {
      try { this.send({ id: message.id, result: await this.handler(message.method, message.params) }); }
      catch (error) { this.send({ id: message.id, error: error instanceof Error ? error.message.slice(0, 2000) : 'Request failed' }); }
    } else {
      const entry = this.pending.get(message.id); if (!entry) return;
      this.pending.delete(message.id);
      if (message.error) entry.reject(new Error(String(message.error)));
      else entry.resolve(message.result);
    }
  }
  private send(message: unknown) {
    if (this.ended) throw new Error('Ned connection closed');
    const bytes = Buffer.from(JSON.stringify(message) + '\n');
    if (bytes.length > MAX) throw new Error('Ned RPC message too large');
    this.socket.write(bytes);
  }
  call(method: string, params: unknown = {}, signal?: AbortSignal): Promise<any> {
    if (signal?.aborted) return Promise.reject(new Error('Cancelled'));
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const cancel = () => { this.pending.delete(id); reject(new Error('Cancelled')); };
      const done = () => signal?.removeEventListener('abort', cancel);
      this.pending.set(id, { resolve: value => { done(); resolve(value); }, reject: error => { done(); reject(error); } });
      signal?.addEventListener('abort', cancel, { once: true });
      try { this.send({ id, method, params }); }
      catch (error) { this.pending.delete(id); done(); reject(error); }
    });
  }
  close() { this.socket.destroy(); }
}
