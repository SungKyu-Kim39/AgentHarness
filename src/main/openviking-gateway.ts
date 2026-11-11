import { createServer, type Server } from 'node:http';
import { requestJSON } from './http-request';
import { randomBytes } from 'node:crypto';
import type { AgentConfig } from '../shared/contracts';
/** Keeps real embedding/VLM keys out of OpenViking's config, environment and diagnostics. */
export class OpenVikingGateway {
  readonly token = randomBytes(32).toString('hex');
  baseUrl = ''; private server?: Server; private pending = new Set<AbortController>();
  constructor(private config: AgentConfig) {}
  async start() {
    if (!this.config.openViking) throw new Error('OpenViking 임베딩 설정이 없습니다.');
    this.server = createServer(async (req, res) => {
      if (req.headers.authorization !== `Bearer ${this.token}`) { res.writeHead(401).end(); return; }
      const embedding = req.method === 'POST' && req.url === '/v1/embeddings';
      const completion = req.method === 'POST' && req.url === '/v1/chat/completions';
      if (!embedding && !completion) { res.writeHead(403).end(); return; }
      const target = embedding ? this.config.openViking!.embedding : this.config.openViking!.vlm ?? this.config.model;
      const controller = new AbortController(); this.pending.add(controller); res.once('close', () => controller.abort());
      try {
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 4 * 1024 * 1024) throw new Error(); chunks.push(chunk); }
        const body = JSON.parse(Buffer.concat(chunks).toString());
        if (body.model !== target.id) { res.writeHead(403).end(); return; }
        // This service only performs text indexing. No fetch, image URLs or tool execution.
        if (completion && (body.tools?.length || body.messages?.some((m: any) => typeof m.content !== 'string' && m.content?.some((p: any) => p.type !== 'text')))) { res.writeHead(403).end(); return; }
        const upstream = await requestJSON(target.baseUrl.replace(/\/$/, '') + (embedding ? '/embeddings' : '/chat/completions'), {
          method: 'POST', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${target.apiKey}` }, body: JSON.stringify(body),
        });
        if (!upstream.ok) { res.writeHead(502).end(JSON.stringify({ error: { message: `사내 ${embedding ? '임베딩' : '모델'} HTTP ${upstream.status}` } })); return; }
        res.writeHead(200, { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' });
        if (upstream.body) { const reader = upstream.body.getReader(); while (true) { const next = await reader.read(); if (next.done) break; res.write(next.value); } }
        res.end();
      } catch { if (!res.headersSent) res.writeHead(502).end('{"error":{"message":"지식 모델 연결 오류"}}'); else res.destroy(); }
      finally { this.pending.delete(controller); }
    });
    await new Promise<void>((resolve, reject) => { this.server!.once('error', reject); this.server!.listen(0, '127.0.0.1', resolve); });
    const a = this.server.address(); if (!a || typeof a === 'string') throw new Error('지식 모델 중계 포트 할당 실패');
    this.baseUrl = `http://127.0.0.1:${a.port}/v1`;
  }
  async close() {
    for (const pending of this.pending) pending.abort(); this.server?.closeAllConnections();
    await new Promise<void>(resolve => { if (this.server?.listening) this.server.close(() => resolve()); else resolve(); });
  }
}
