import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { connect, type Socket } from 'node:net';

/** Limit pip's HTTPS connections to the origins configured and approved for this install. */
export async function openPythonPackageProxy(origins: URL[], signal: AbortSignal) {
  signal.throwIfAborted();
  const allowed = new Set(origins.map(origin => origin.origin));
  const secret = randomBytes(24).toString('hex');
  const expected = Buffer.from('Basic ' + Buffer.from('ned:' + secret).toString('base64'));
  const sockets = new Set<Socket>();
  const track = (socket: Socket) => {
    sockets.add(socket);
    socket.once('close', () => { sockets.delete(socket); });
  };
  const server = createServer((_request, response) => response.writeHead(403).end());
  server.on('connection', track);
  server.on('connect', (request, client, head) => {
    const actual = Buffer.from(request.headers['proxy-authorization'] ?? '');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      client.end('HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="Ned"\r\n\r\n');
      return;
    }
    const authority = request.url ?? '';
    let url: URL;
    try {
      if (!/^(?:\[[0-9a-f:]+\]|[a-z0-9.-]+):[0-9]{1,5}$/i.test(authority)) throw Error();
      url = new URL('https://' + authority);
      if (!allowed.has(url.origin)) throw Error();
    } catch {
      client.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return;
    }
    const upstream = connect({ host: url.hostname.replace(/^\[|\]$/g, ''), port: Number(url.port || 443) });
    track(upstream);
    upstream.setTimeout(10000, () => upstream.destroy());
    upstream.on('error', () => client.destroy());
    upstream.once('close', () => client.destroy());
    client.on('error', () => upstream.destroy());
    client.once('close', () => upstream.destroy());
    upstream.once('connect', () => {
      upstream.setTimeout(0);
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head.length) upstream.write(head);
      client.pipe(upstream).pipe(client);
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('사내 Python 패키지 중계 포트를 열지 못했습니다.');
  }
  let stopping: Promise<void> | undefined;
  const close = () => stopping ??= new Promise<void>(resolve => {
    signal.removeEventListener('abort', abort);
    for (const socket of sockets) socket.destroy();
    server.close(() => resolve());
  });
  const abort = () => { void close(); };
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) { await close(); signal.throwIfAborted(); }
  return {
    url: `http://ned:${secret}@127.0.0.1:${address.port}`,
    redact: (output: string) => output.replaceAll(secret, '[REDACTED]'),
    close,
  };
}
