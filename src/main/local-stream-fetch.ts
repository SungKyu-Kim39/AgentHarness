import { request } from 'node:http';
import { Readable } from 'node:stream';
/** Local ACP transport without hidden fetch header/body deadlines or redirects. */
export function localStreamFetch(origin: string): typeof fetch {
  const base = new URL(origin);
  if (base.hostname !== '127.0.0.1' || base.protocol !== 'http:') throw new Error('Private engine required');
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const target = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    if (target.origin !== base.origin) throw new Error('ACP origin denied');
    return new Promise<Response>((resolve, reject) => {
      const headers = Object.fromEntries(new Headers(init?.headers).entries());
      const req = request(target, { method: init?.method ?? 'GET', headers, agent: false }, incoming => {
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(incoming.headers)) if (value !== undefined) responseHeaders.set(key, Array.isArray(value) ? value.join(', ') : value);
        const status = incoming.statusCode ?? 502;
        if (status >= 300 && status < 400) { incoming.destroy(); reject(new Error('ACP redirects denied')); return; }
        incoming.once('close', () => init?.signal?.removeEventListener('abort', cancel));
        resolve(new Response([204,205,304].includes(status) ? null : Readable.toWeb(incoming) as ReadableStream<Uint8Array>, { status, headers: responseHeaders }));
      });
      const cancel = () => req.destroy(init?.signal?.reason instanceof Error ? init.signal.reason : new Error('Cancelled'));
      req.setTimeout(0); req.on('socket', socket => socket.setKeepAlive(true, 60000));
      req.once('error', error => { init?.signal?.removeEventListener('abort', cancel); reject(error); });
      if (init?.signal?.aborted) { cancel(); return; }
      init?.signal?.addEventListener('abort', cancel, { once: true });
      const body = init?.body;
      if (body instanceof ReadableStream) Readable.fromWeb(body as any).on('error', error => req.destroy(error)).pipe(req);
      else if (body === undefined || body === null) req.end();
      else if (typeof body === 'string' || body instanceof Uint8Array) req.end(body);
      else { req.destroy(); reject(new Error('Unsupported ACP request body')); }
    });
  }) as typeof fetch;
}
