import { request as httpRequest, type IncomingMessage, type ClientRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

/** Buffered JSON transport with no elapsed-time deadline or redirect following. */
export function requestJSON(url: string, options: { method?: string; headers?: Record<string, string>; body?: string; signal?: AbortSignal; maxBytes?: number } = {}): Promise<Response> {
  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Unsupported HTTP protocol');
  return new Promise((resolve, reject) => {
    let request: ClientRequest | undefined, response: IncomingMessage | undefined, settled = false;
    const cleanup = () => options.signal?.removeEventListener('abort', cancel);
    const fail = (error: unknown) => { if (settled) return; settled = true; cleanup(); request?.destroy(); response?.destroy(); reject(error); };
    const cancel = () => fail(options.signal?.reason ?? new DOMException('Request cancelled', 'AbortError'));
    if (options.signal?.aborted) { cancel(); return; }
    options.signal?.addEventListener('abort', cancel, { once: true });
    const body = options.body === undefined ? undefined : Buffer.from(options.body);
    try {
      request = (target.protocol === 'https:' ? httpsRequest : httpRequest)(target, { method: options.method ?? 'POST', agent: false,
        headers: { ...options.headers, ...(body ? { 'Content-Length': String(body.length) } : {}) } }, incoming => {
        response = incoming; const chunks: Buffer[] = []; let size = 0;
        incoming.on('data', (bytes: Buffer) => { size += bytes.length; if (size > (options.maxBytes ?? 32 * 1024 * 1024)) fail(new Error('HTTP response exceeds size limit')); else chunks.push(bytes); });
        incoming.once('aborted', () => fail(new Error('HTTP response connection closed unexpectedly')));
        incoming.once('error', fail);
        incoming.once('end', () => {
          if (settled) return;
          try {
            const status = incoming.statusCode ?? 502;
            const value = new Response([204, 205, 304].includes(status) ? null : Buffer.concat(chunks), { status,
              headers: { 'Content-Type': String(incoming.headers['content-type'] ?? 'application/json') } });
            settled = true; cleanup(); resolve(value);
          } catch (error) { fail(error); }
        });
      });
      request.on('socket', socket => socket.setKeepAlive(true, 60000));
      request.once('error', fail); request.end(body);
    } catch (error) { fail(error); }
  });
}
