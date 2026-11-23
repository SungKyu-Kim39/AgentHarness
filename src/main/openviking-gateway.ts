import { createServer, type Server } from 'node:http';
import { requestJSON } from './http-request';
import { randomBytes } from 'node:crypto';
import type { AgentConfig } from '../shared/contracts';
import { classifyModelHttpError, modelRequestShape, modelHttpExplanation } from './model-http-error';
/** Keeps real embedding/VLM keys out of OpenViking's config, environment and diagnostics. */
export class OpenVikingGateway {
  readonly token = randomBytes(32).toString('hex');
  baseUrl = ''; private server?: Server; private pending = new Set<AbortController>();
  private counts = { completion: 0, embedding: 0 };
  activity() { return { ...this.counts }; }
  constructor(private config: AgentConfig, private diagnostic?: (event: { schemaVersion: number; recordedAt: string; kind: string; code: string; httpStatus?: number; httpError?: ReturnType<typeof classifyModelHttpError>; requestShape?: ReturnType<typeof modelRequestShape> }) => void) {}
  async start() {
    if (!this.config.openViking) throw new Error('OpenViking 임베딩 설정이 없습니다.');
    this.server = createServer(async (req, res) => {
      if (req.headers.authorization !== `Bearer ${this.token}`) { res.writeHead(401).end(); return; }
      const embedding = req.method === 'POST' && req.url === '/v1/embeddings';
      const completion = req.method === 'POST' && req.url === '/v1/chat/completions';
      if (!embedding && !completion) { res.writeHead(403).end(); return; }
      let httpError: ReturnType<typeof classifyModelHttpError> | undefined, shape: ReturnType<typeof modelRequestShape> | undefined;
      const report = (code: string, httpStatus?: number) => this.diagnostic?.({ schemaVersion: 1, recordedAt: new Date().toISOString(), kind: embedding ? 'embedding' : 'completion', code, ...(httpStatus ? { httpStatus } : {}), ...(httpError ? { httpError } : {}), ...(shape ? { requestShape: shape } : {}) });
      const target = embedding ? this.config.openViking!.embedding : this.config.openViking!.vlm ?? this.config.model;
      const controller = new AbortController(); this.pending.add(controller); res.once('close', () => controller.abort());
      const kind = embedding ? 'embedding' : 'completion'; this.counts[kind]++;
      try {
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 4 * 1024 * 1024) throw new Error(); chunks.push(chunk); }
        const body = JSON.parse(Buffer.concat(chunks).toString());
        shape = modelRequestShape(body);
        if (body.model !== target.id) { res.writeHead(403).end(); return; }
        // This service only performs text indexing. No fetch, image URLs or tool execution.
        if (completion && (body.tools?.length || body.messages?.some((m: any) => typeof m.content !== 'string' && m.content?.some((p: any) => p.type !== 'text')))) { res.writeHead(403).end(); return; }
        // Fixed-size local embedding APIs commonly reject OpenAI-only dimension reduction
        // and base64 encoding. Ask for float vectors and validate the configured size.
        if (embedding) { delete body.dimensions; body.encoding_format = 'float'; }
        const upstream = await requestJSON(target.baseUrl.replace(/\/$/, '') + (embedding ? '/embeddings' : '/chat/completions'), {
          method: 'POST', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${target.apiKey}` }, body: JSON.stringify(body),
        });
        if (!upstream.ok) {
          httpError = classifyModelHttpError(await upstream.text());
          report('OV_MODEL_HTTP', upstream.status);
          const tag = upstream.status === 401 ? 'OV_AUTH' : upstream.status === 403 ? 'OV_FORBIDDEN' : upstream.status === 504 ? 'OV_TIMEOUT' : embedding ? 'OV_EMBEDDING' : 'OV_SERVER_ERROR';
          res.writeHead(502).end(JSON.stringify({ error: { message: `사내 ${embedding ? '임베딩' : '모델'} HTTP ${upstream.status}: ${modelHttpExplanation(httpError.reason)} [${tag}]` } })); return;
        }
        if (embedding) {
          const result = await upstream.json() as any;
          const expected = this.config.openViking!.embedding.dimension;
          const count = typeof body.input === 'string' ? 1 : Array.isArray(body.input) ? body.input.length : -1;
          if (!Array.isArray(result?.data) || result.data.length !== count || result.data.some((item: any) => !Array.isArray(item?.embedding) || item.embedding.length !== expected || item.embedding.some((v: unknown) => typeof v !== 'number' || !Number.isFinite(v)))) {
            report('OV_EMBEDDING_DIMENSION'); res.writeHead(502).end('{"error":{"message":"OV_EMBEDDING_DIMENSION"}}'); return;
          }
          report('OV_MODEL_OK'); res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(result)); return;
        }
        report('OV_MODEL_OK');
        res.writeHead(200, { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' });
        if (upstream.body) { const reader = upstream.body.getReader(); while (true) { const next = await reader.read(); if (next.done) break; res.write(next.value); } }
        res.end();
      } catch (error) {
        const info = [error instanceof Error ? error.message : '', (error as NodeJS.ErrnoException)?.code ?? '', (error as { cause?: { code?: string; message?: string } })?.cause?.code ?? '', (error as { cause?: { message?: string } })?.cause?.message ?? ''].join(' ');
        const isTls = /CERT_|UNABLE_TO_VERIFY|SELF_SIGNED|ERR_TLS|certificate|ssl|tls/i.test(info);
        const isTimeout = /ETIMEDOUT|ESOCKETTIMEDOUT|TimeoutError|timed?\s*out/i.test(info);
        const code = isTls ? 'OV_TLS' : isTimeout ? 'OV_TIMEOUT' : embedding ? 'OV_EMBEDDING' : 'OV_CONNECTION';
        if (!controller.signal.aborted) report(isTls ? 'OV_TLS' : isTimeout ? 'OV_TIMEOUT' : 'OV_MODEL_CONNECTION');
        if (!res.headersSent) res.writeHead(isTimeout ? 504 : 502).end(JSON.stringify({ error: { message: `사내 ${embedding ? '임베딩' : '지식'} 모델 연결 오류 [${code}]` } }));
        else res.destroy();
      }
      finally { this.counts[kind]--; this.pending.delete(controller); }
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
