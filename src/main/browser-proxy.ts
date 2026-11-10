import { createServer, request, type Server } from 'node:http';
import type { Socket } from 'node:net';

/** Per-inspection proxy: one approved local development origin, GET/HEAD only.
 * No CONNECT, WebSocket, credentials, DNS resolution or access to host services.
 */
export class BrowserProxy {
  private server?: Server;
  private sockets = new Set<Socket>();
  blocked = 0;
  url = '';
  static target(value: string, reserved: readonly number[] = []) {
    const url = new URL(value);
    if (url.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(url.hostname) || !url.port || url.username || url.password || url.hash || reserved.includes(Number(url.port)))
      throw new Error('브라우저 검증은 앱 내부 포트를 제외한 http://localhost:포트 또는 http://127.0.0.1:포트 개발 페이지에 한정됩니다.');
    return url;
  }
  constructor(readonly target: URL) {}
  async start() {
    this.server = createServer((req, res) => {
      let url: URL;
      try { url = new URL(req.url ?? ''); } catch { this.blocked++; res.writeHead(403).end(); return; }
      if (url.origin !== this.target.origin || url.username || url.password || !['GET', 'HEAD'].includes(req.method ?? '')) { this.blocked++; res.writeHead(403).end(); return; }
      const headers: Record<string, string | string[] | undefined> = { ...req.headers, host: url.host };
      for (const key of ['authorization', 'proxy-authorization', 'cookie', 'connection', 'upgrade', 'proxy-connection']) delete headers[key];
      const upstream = request({ hostname: '127.0.0.1', port: Number(this.target.port), method: req.method, path: url.pathname + url.search, headers, timeout: 15000 }, response => {
        const output = { ...response.headers }; delete output['set-cookie'];
        res.writeHead(response.statusCode ?? 502, output);
        let bytes = 0;
        response.on('data', chunk => { bytes += chunk.length; if (bytes > 20 * 1024 * 1024) { response.destroy(); res.destroy(); } });
        response.pipe(res);
      });
      upstream.on('timeout', () => upstream.destroy());
      upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
      req.on('aborted', () => upstream.destroy()); res.on('close', () => upstream.destroy()); req.pipe(upstream);
    });
    this.server.on('connect', (_req, socket) => { this.blocked++; socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); });
    this.server.on('upgrade', (_req, socket) => { this.blocked++; socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); });
    this.server.on('connection', socket => { this.sockets.add(socket); socket.on('close', () => this.sockets.delete(socket)); });
    await new Promise<void>((resolve, reject) => { this.server!.once('error', reject); this.server!.listen(0, '127.0.0.1', resolve); });
    const address = this.server.address(); if (!address || typeof address === 'string') throw new Error('브라우저 프록시 시작 실패');
    this.url = `http://127.0.0.1:${address.port}`;
  }
  async close() {
    for (const socket of this.sockets) socket.destroy();
    await new Promise<void>(resolve => { if (!this.server?.listening) resolve(); else this.server.close(() => resolve()); });
  }
}
