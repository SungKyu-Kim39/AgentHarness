import { createServer, request as httpRequest, type ClientRequest, type Server } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { randomBytes } from 'node:crypto';
import type { AgentConfig } from '../shared/contracts';

export interface ModelTransport {
  timeout?: unknown;
  headerTimeout?: unknown;
  chunkTimeout?: unknown;
}
export interface ModelFailure {
  schemaVersion: 1; recordedAt: string; code: string; phase: string;
  elapsedMs: number; requestBytes: number; responseBytes: number; streaming: boolean;
  upstreamStatus?: number; osError?: string;
}
const duration = (value: unknown, fallback: number): number | false =>
  value === false ? false : typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 86400000 ? value : fallback;

/** Exact-endpoint transport. Neither response bodies nor credentials enter diagnostics. */
export class ModelGateway {
  readonly token = randomBytes(32).toString('hex');
  baseUrl = '';
  private server?: Server;
  private requests = new Set<AbortController>();
  constructor(private config: AgentConfig, private transport: ModelTransport = {}, private diagnostic?: (event: ModelFailure) => void) {}
  async start() {
    this.server = createServer(async (req, res) => {
      if (req.headers.authorization !== `Bearer ${this.token}`) { res.writeHead(401).end(); return; }
      if (req.method !== 'POST' || req.url !== '/v1/chat/completions') { res.writeHead(403).end(); return; }
      const abort = new AbortController(); this.requests.add(abort);
      const started = Date.now(); const timers = new Map<string, ReturnType<typeof setTimeout>>();
      let upstream: ClientRequest | undefined, finished = false, phase = 'request';
      let requestBytes = 0, responseBytes = 0, streaming = false, upstreamStatus: number | undefined;
      const cleanup = () => { for (const t of timers.values()) clearTimeout(t); timers.clear(); this.requests.delete(abort); };
      const fail = (code: string, message: string, http = 502, error?: unknown) => {
        if (finished) return; finished = true; cleanup();
        const osCode = (error as NodeJS.ErrnoException)?.code;
        this.diagnostic?.({ schemaVersion: 1, recordedAt: new Date().toISOString(), code, phase, elapsedMs: Date.now()-started,
          requestBytes, responseBytes, streaming, ...(upstreamStatus ? { upstreamStatus } : {}),
          ...(typeof osCode === 'string' && /^[A-Z0-9_]{1,32}$/.test(osCode) ? { osError: osCode } : {}) });
        upstream?.destroy();
        if (res.destroyed) return;
        const body = JSON.stringify({ error: { message: message + ' [' + code + ']', type: 'l_vibe_gateway', code } });
        if (res.headersSent) { res.end('data: ' + body + '\n\n'); }
        else res.writeHead(http, { 'Content-Type': 'application/json' }).end(body);
      };
      const timer = (name: string, ms: number | false, code: string) => {
        const old = timers.get(name); if (old) clearTimeout(old); timers.delete(name);
        if (ms !== false) timers.set(name, setTimeout(() => fail(code, '사내 모델 응답 대기 시간이 초과되었습니다.', 504), ms));
      };
      abort.signal.addEventListener('abort', () => { if (!finished) { finished = true; cleanup(); upstream?.destroy(); if (!res.destroyed) res.destroy(); } }, { once: true });
      res.once('close', () => { if (!finished) abort.abort(); });
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          requestBytes += chunk.length;
          if (requestBytes > 32 * 1024 * 1024) { fail('LV_MODEL_REQUEST_SIZE', '모델 요청이 32 MiB 제한을 초과했습니다.', 413); return; }
          chunks.push(chunk);
        }
        let body: any;
        try { body = JSON.parse(Buffer.concat(chunks).toString()); }
        catch { fail('LV_MODEL_REQUEST_JSON', '모델 요청 JSON이 올바르지 않습니다.', 400); return; }
        if (body?.model !== this.config.model.id) { finished = true; cleanup(); res.writeHead(403).end(); return; }
        const bytes = Buffer.from(JSON.stringify(body));
        const target = new URL(this.config.model.baseUrl.replace(/\/$/, '') + '/chat/completions');
        const totalMs = duration(this.transport.timeout, 900000);
        const headerMs = duration(this.transport.headerTimeout, 300000);
        const chunkMs = duration(this.transport.chunkTimeout, 900000);
        phase = 'headers';
        timer('total', totalMs, 'LV_MODEL_TOTAL_TIMEOUT'); timer('headers', headerMs, 'LV_MODEL_HEADER_TIMEOUT');
        upstream = (target.protocol === 'https:' ? httpsRequest : httpRequest)(target, {
          method: 'POST', agent: false,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.model.apiKey}`, 'Content-Length': String(bytes.length) },
        }, response => {
          if (finished) { response.destroy(); return; }
          const old = timers.get('headers'); if (old) clearTimeout(old); timers.delete('headers');
          upstreamStatus = response.statusCode ?? 502;
          if (upstreamStatus < 200 || upstreamStatus >= 300) {
            response.resume(); fail('LV_MODEL_HTTP', `사내 모델 HTTP ${upstreamStatus}`, upstreamStatus >= 400 ? upstreamStatus : 502); return;
          }
          phase = 'body';
          const type = String(response.headers['content-type'] ?? 'application/json');
          streaming = /^text\/event-stream(?:;|$)/i.test(type);
          const buffered: Buffer[] = [];
          timer('chunk', chunkMs, 'LV_MODEL_CHUNK_TIMEOUT');
          if (streaming) res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
          response.on('data', (chunk: Buffer) => {
            if (finished) return;
            responseBytes += chunk.length; timer('chunk', chunkMs, 'LV_MODEL_CHUNK_TIMEOUT');
            if (!streaming) {
              if (responseBytes > 32 * 1024 * 1024) { fail('LV_MODEL_RESPONSE_SIZE', '모델 응답 크기 제한을 초과했습니다.'); response.destroy(); return; }
              buffered.push(chunk);
            }
          });
          response.once('aborted', () => fail('LV_MODEL_UPSTREAM_RESET', '사내 모델이 응답을 끝내기 전에 연결을 종료했습니다.'));
          response.once('error', error => fail('LV_MODEL_UPSTREAM_RESET', '사내 모델 응답 연결이 끊겼습니다.', 502, error));
          response.once('end', () => {
            if (finished) return; finished = true; cleanup();
            if (streaming) res.end();
            else res.writeHead(200, { 'Content-Type': type }).end(Buffer.concat(buffered));
          });
          if (streaming) response.pipe(res, { end: false });
        });
        upstream.once('error', error => fail('LV_MODEL_CONNECTION', '사내 모델에 연결하지 못했습니다.', 502, error));
        upstream.end(bytes);
      } catch (error) { if (!res.destroyed) fail('LV_MODEL_CONNECTION', '사내 모델 요청을 완료하지 못했습니다.', 502, error); else { finished = true; cleanup(); } }
    });
    this.server.requestTimeout = 0;
    await new Promise<void>((resolve, reject) => { this.server!.once('error', reject); this.server!.listen(0, '127.0.0.1', resolve); });
    const address = this.server.address(); if (!address || typeof address === 'string') throw new Error('모델 중계 포트 할당 실패');
    this.baseUrl = `http://127.0.0.1:${address.port}/v1`;
  }
  async close() {
    for (const request of this.requests) request.abort(); this.server?.closeAllConnections();
    await new Promise<void>(resolve => { if (!this.server?.listening) resolve(); else this.server.close(() => resolve()); });
  }
}
