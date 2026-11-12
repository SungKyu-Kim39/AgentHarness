import { createServer, request, type Server } from 'node:http';
import type { Credentials } from './native-control';

/** Native API boundary: no global config writes, remote connections or saved approvals. */
export class SidecarProxy {
  private server?: Server;
  constructor(private backend: Credentials, private sessions?: { cancelSession(session: string): void; resumeSession(session: string): void }) {}
  async start(): Promise<Credentials> {
    this.server = createServer(async (req, res) => {
      const auth = 'Basic ' + Buffer.from('opencode:' + this.backend.password).toString('base64');
      if (req.headers.authorization !== auth) { res.writeHead(401).end(); return; }
      try {
        const target = new URL(req.url ?? '/', this.backend.url);
        const pathname = decodeURIComponent(target.pathname).replace(/\/{2,}/g, '/');
        const operation = /^\/api\/session\/([^/]+)\/(interrupt|prompt)$/.exec(pathname);
        if (req.method === 'POST' && operation) {
          if (operation[2] === 'interrupt') this.sessions?.cancelSession(operation[1]);
          else this.sessions?.resumeSession(operation[1]);
        }
        const modifying = !['GET', 'HEAD', 'OPTIONS'].includes(req.method ?? '');
        if (modifying && (
          /^\/api\/(?:experimental\/(?:config|mcp)|config|integration|credential|plugin|mcp|pty|shell|schedule|server|permission\/saved)(?:\/|$)/.test(pathname) ||
          /^\/api\/session\/[^/]+\/(?:shell|command|move|background|synthetic)(?:\/|$)/.test(pathname) ||
          pathname === '/api/experimental/session/import'
        )) { res.writeHead(403, { 'Content-Type': 'application/json' }).end('{"message":"L-Vibe 앱 정책으로 이 실행·설정 변경 경로가 차단되었습니다."}'); return; }
        const chunks: Buffer[] = []; let size = 0;
        for await (const bytes of req) { size += bytes.length; if (size > 8 * 1024 * 1024) throw new Error('Request too large'); chunks.push(bytes); }
        let body = Buffer.concat(chunks);
        if (body.length && /application\/json/i.test(req.headers['content-type'] ?? '')) {
          const document = JSON.parse(body.toString());
          if (document.permissions !== undefined) {
            if (req.method === 'POST' && pathname === '/api/session' && (document.permissions === null || (Array.isArray(document.permissions) && document.permissions.length === 0))) delete document.permissions;
            else { res.writeHead(403).end(); return; }
          }
          if (/^\/api\/session\/[^/]+\/permission\/[^/]+\/reply$/.test(pathname) && document.decision === 'always') document.decision = 'once';
          body = Buffer.from(JSON.stringify(document));
        }
        const upstream = request(target, { method: req.method, headers: { ...req.headers, host: new URL(this.backend.url).host, authorization: auth, 'accept-encoding': 'identity', 'content-length': String(body.length) } }, response => {
          const headers = { ...response.headers }; delete headers['transfer-encoding'];
          // Config/model documents may contain ephemeral gateway tokens. Keep them native too.
          if (req.method === 'GET' && /^\/api\/(?:config|provider|model)(?:\/|$)/.test(pathname)) {
            const pieces: Buffer[] = []; let bytes = 0;
            response.on('data', chunk => { bytes += chunk.length; if (bytes > 8 * 1024 * 1024) response.destroy(); else pieces.push(chunk); });
            response.on('end', () => {
              try {
                const clean = JSON.stringify(JSON.parse(Buffer.concat(pieces).toString()), (key, value) => /^(apikey|authorization|password|token)$/i.test(key) ? undefined : value);
                delete headers['content-length']; res.writeHead(response.statusCode ?? 502, headers).end(clean);
              } catch { res.writeHead(502).end(); }
            });
          } else { res.writeHead(response.statusCode ?? 502, headers); response.pipe(res); }
          response.on('error', () => res.destroy());
        });
        req.once('aborted', () => upstream.destroy()); res.once('close', () => upstream.destroy());
        upstream.once('error', () => { if (!res.headersSent) res.writeHead(502).end(); else res.destroy(); });
        upstream.end(body);
      } catch { if (!res.headersSent) res.writeHead(400).end(); else res.destroy(); }
    });
    await new Promise<void>((resolve, reject) => { this.server!.once('error', reject); this.server!.listen(0, '127.0.0.1', resolve); });
    const address = this.server.address(); if (!address || typeof address === 'string') throw new Error('API 중계 포트 할당 실패');
    return { url: `http://127.0.0.1:${address.port}`, password: this.backend.password };
  }
  async close() {
    this.server?.closeAllConnections();
    await new Promise<void>(resolve => { if (!this.server?.listening) resolve(); else this.server.close(() => resolve()); });
  }
}
