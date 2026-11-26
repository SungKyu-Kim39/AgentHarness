import { lookup } from 'node:dns/promises';
import { request as httpRequest, type IncomingMessage } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { getCACertificates } from 'node:tls';
import { z } from 'zod';

const addressLimit = 2 * 1024 * 1024;
const protocolVersions = ['2025-11-25', '2025-06-18', '2025-03-26'];
export const remoteToolName = z.string().regex(/^[A-Za-z0-9_.-]{1,128}$/);
const authSchema = z.object({ header: z.enum(['Authorization', 'X-API-Key']), value: z.string().min(1).max(4096).regex(/^[\x20-\x7e]+$/) }).strict();
export const mcpEndpointSchema = z.object({
  url: z.string().trim().min(1).max(2048).transform((value, ctx) => {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw Error();
      const host = url.hostname.replace(/^\[|\]$/g, '');
      if (isIP(host) && !isIntranetAddress(host)) throw Error();
      return url.href;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '사내 HTTP(S) MCP 주소를 입력하세요.' });
      return z.NEVER;
    }
  }),
  auth: authSchema.optional(),
}).superRefine((value, ctx) => {
  if (value.auth && !value.url.startsWith('https:')) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['auth'], message: '인증 정보를 보내려면 HTTPS 주소가 필요합니다.' });
});
export type McpEndpoint = z.infer<typeof mcpEndpointSchema>;
export const remoteToolSchema = z.object({
  name: remoteToolName,
  description: z.string().max(12000).optional(),
  inputSchema: z.record(z.unknown()).refine(value => value.type === 'object' && Buffer.byteLength(JSON.stringify(value)) <= 24000),
  outputSchema: z.record(z.unknown()).optional(),
  annotations: z.record(z.unknown()).optional(),
});
export type RemoteTool = z.infer<typeof remoteToolSchema>;

type Address = { address: string; family: number };
export function isIntranetAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 6) return /^f[cd][0-9a-f]{2}:/i.test(address);
  if (family !== 4) return false;
  const [first, second] = address.split('.').map(Number);
  return first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}

async function resolveIntranet(hostname: string): Promise<Address> {
  const host = hostname.replace(/^\[|\]$/g, '');
  const resolved = await lookup(host, { all: true }).catch(() => { throw Error('사내 MCP 주소를 찾을 수 없습니다.'); });
  if (!resolved.length || resolved.some(({ address }) => !isIntranetAddress(address))) throw Error('사내 사설 주소로 연결되는 MCP만 등록할 수 있습니다.');
  return resolved[0]!;
}

async function withCancellation<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  let cancel!: () => void;
  const aborted = new Promise<never>((_, reject) => {
    cancel = () => reject(Error('사내 MCP 주소 확인이 중단됐습니다.'));
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
  });
  try { return await Promise.race([work, aborted]); }
  finally { signal.removeEventListener('abort', cancel); }
}

function parseMessage(raw: string, id: number): unknown {
  const doc = JSON.parse(raw);
  if (doc?.jsonrpc !== '2.0' || doc.id !== id || doc.method !== undefined) return undefined;
  if (doc.error) throw new RejectedMcpRequest();
  if (!Object.hasOwn(doc, 'result')) throw Error('사내 MCP 응답 형식이 올바르지 않습니다.');
  return doc.result;
}

class RejectedMcpRequest extends Error {
  constructor() { super('사내 MCP 서버가 요청을 거절했습니다.'); }
}

async function readResponse(response: IncomingMessage, id: number): Promise<unknown> {
  const media = String(response.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (media !== 'application/json' && media !== 'text/event-stream') throw Error('지원하지 않는 사내 MCP 응답 형식입니다.');
  let bytes = 0, pending = '';
  response.setEncoding('utf8');
  for await (const chunk of response) {
    bytes += Buffer.byteLength(chunk);
    if (bytes > addressLimit) throw Error('사내 MCP 응답 크기 제한을 초과했습니다.');
    pending += chunk;
    if (media !== 'text/event-stream') continue;
    let boundary: RegExpExecArray | null;
    while ((boundary = /\r?\n\r?\n/.exec(pending))) {
      const raw = pending.slice(0, boundary.index).split(/\r?\n/)
        .filter(line => line.startsWith('data:')).map(line => line.slice(5).replace(/^ /, '')).join('\n');
      pending = pending.slice(boundary.index + boundary[0].length);
      if (!raw) continue;
      const parsed = parseMessage(raw, id);
      if (parsed !== undefined) return parsed;
    }
  }
  if (media === 'application/json') {
    const parsed = parseMessage(pending, id);
    if (parsed !== undefined) return parsed;
  }
  throw Error('사내 MCP에서 요청에 대응하는 응답을 받지 못했습니다.');
}

/** The configured endpoint is the only destination for this connection. */
export class UserMcpHttp {
  private url: URL;
  private protocol = '2025-11-25';
  private sessionId?: string;
  private sequence = 0;
  private address?: Address;
  constructor(private endpoint: McpEndpoint, private resolve = resolveIntranet) {
    this.url = new URL(mcpEndpointSchema.parse(endpoint).url);
  }

  private async send(method: string, params: unknown, signal: AbortSignal, notification = false) {
    const id = ++this.sequence;
    const payload = Buffer.from(JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id }), method, params }));
    if (payload.byteLength > addressLimit) throw Error('사내 MCP 요청 크기 제한을 초과했습니다.');
    return this.request('POST', signal, payload, id, notification, method === 'initialize', method === 'tools/call');
  }

  private async request(method: 'POST' | 'DELETE', signal: AbortSignal, payload?: Buffer, id?: number, notification = false, initializing = false, toolCall = false) {
    const combined = AbortSignal.any([signal, AbortSignal.timeout(toolCall ? 120000 : 12000)]);
    combined.throwIfAborted();
    this.address ??= await withCancellation(this.resolve(this.url.hostname), combined);
    combined.throwIfAborted();
    const { address, family } = this.address;
    return new Promise<unknown>((resolve, reject) => {
      let sent = false;
      const failed = () => reject(Error(sent && toolCall ? '사내 MCP 요청의 실행 결과를 확인할 수 없습니다. 대상에서 결과를 확인한 뒤 다시 요청하세요.' : '사내 MCP 서버와 연결하지 못했습니다.'));
      const tls = this.url.protocol === 'https:';
      const request = (tls ? httpsRequest : httpRequest)(this.url, {
        method, agent: false, signal: combined, family,
        ...(tls ? { ca: [...getCACertificates('default'), ...getCACertificates('system')] } : {}),
        lookup: (_hostname, _options, callback) => callback(null, address, family),
        headers: {
          Accept: 'application/json, text/event-stream',
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': String(payload.byteLength) } : {}),
          ...(!initializing ? { 'MCP-Protocol-Version': this.protocol } : {}),
          ...(this.sessionId ? { 'Mcp-Session-Id': this.sessionId } : {}),
          ...(this.endpoint.auth ? { [this.endpoint.auth.header]: this.endpoint.auth.value } : {}),
        },
      }, response => {
        const status = response.statusCode ?? 0;
        if (status < 200 || status >= 300) {
          response.destroy();
          if (status === 401 || status === 403) reject(Error('사내 MCP 인증 또는 접근 권한을 확인하세요.'));
          else if (status >= 300 && status < 400) reject(Error('사내 MCP의 주소 이동 응답을 허용하지 않습니다. 최종 주소를 등록하세요.'));
          else if (toolCall && status >= 500) failed();
          else reject(Error(`사내 MCP 요청 실패 (HTTP ${status}).`));
          return;
        }
        const sessionId = response.headers['mcp-session-id'];
        if (initializing && sessionId !== undefined) {
          if (typeof sessionId !== 'string' || !/^[\x21-\x7e]{1,256}$/.test(sessionId)) {
            response.destroy(); reject(Error('사내 MCP 세션 응답이 올바르지 않습니다.')); return;
          }
          this.sessionId = sessionId;
        }
        if (method === 'DELETE' || notification) {
          response.destroy(); resolve(undefined); return;
        }
        void readResponse(response, id!).then(resolve, error => {
          if (toolCall && !(error instanceof RejectedMcpRequest)) failed();
          else reject(error instanceof SyntaxError ? Error('사내 MCP 응답 JSON이 올바르지 않습니다.') : error);
        }).finally(() => response.destroy());
      });
      request.once('error', failed);
      request.once('finish', () => { sent = true; });
      request.end(payload);
    });
  }

  async list(signal: AbortSignal): Promise<RemoteTool[]> {
    const combined = AbortSignal.any([signal, AbortSignal.timeout(25000)]);
    const hello = z.object({ protocolVersion: z.string(), capabilities: z.object({ tools: z.object({}).passthrough() }) })
      .safeParse(await this.send('initialize', { protocolVersion: this.protocol, capabilities: {}, clientInfo: { name: 'Ned', version: '0.4.2' } }, combined));
    if (!hello.success || !protocolVersions.includes(hello.data.protocolVersion)) throw Error('지원하는 Streamable HTTP MCP 서버인지 확인하세요.');
    this.protocol = hello.data.protocolVersion;
    await this.send('notifications/initialized', {}, combined, true);
    const all: RemoteTool[] = [];
    let cursor: string | undefined;
    const seen = new Set<string>();
    for (let page = 0; page < 8; page++) {
      const next = z.object({ tools: z.array(remoteToolSchema).max(128), nextCursor: z.string().min(1).max(1024).optional() })
        .safeParse(await this.send('tools/list', cursor ? { cursor } : {}, combined));
      if (!next.success || all.length + next.data.tools.length > 128) throw Error('사내 MCP 도구 목록의 형식 또는 크기가 올바르지 않습니다.');
      all.push(...next.data.tools);
      cursor = next.data.nextCursor;
      if (!cursor) {
        if (new Set(all.map(tool => tool.name)).size !== all.length) throw Error('서버에 이름이 같은 MCP 도구가 있습니다.');
        return all;
      }
      if (seen.has(cursor)) break;
      seen.add(cursor);
    }
    throw Error('사내 MCP 도구 목록을 끝까지 확인하지 못했습니다.');
  }

  call(name: string, args: Record<string, unknown>, signal: AbortSignal) {
    return this.send('tools/call', { name, arguments: args }, signal);
  }

  async close() {
    if (!this.sessionId) return;
    try { await this.request('DELETE', AbortSignal.timeout(2000)); }
    catch { /* Session DELETE is optional in Streamable HTTP. */ }
    finally { this.sessionId = undefined; }
  }
}
