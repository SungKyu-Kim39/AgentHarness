import { randomUUID } from 'node:crypto';
import http, { type Server } from 'node:http';
import path from 'node:path';
import YAML from 'yaml';
import { isDeepStrictEqual } from 'node:util';
import { ProjectFiles } from '../src/main/files';
import { requestJSON } from '../src/main/http-request';

export interface ApiMockInput {
  operation: 'start' | 'status' | 'stop';
  id?: string;
  specPath?: string;
}

export interface ApiContractTestInput {
  specPath: string;
  baseUrl: string;
  methods?: Array<'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>;
  maxRequests?: number;
  headers?: Record<string, string>;
  useSchemathesis?: boolean;
}

interface ParsedRoute {
  method: string;
  template: string;
  regex: RegExp;
  operation: Record<string, any>;
}

interface MockServerEntry {
  id: string;
  session: string;
  project: string;
  specPath: string;
  port: number;
  url: string;
  server: Server;
  routes: ParsedRoute[];
  closing?: Promise<void>;
  requests: Array<{ at: string; method: string; path: string; status: number }>;
}

function parseOpenApi(text: string, specPath: string): Record<string, any> {
  const doc = /\.json$/i.test(specPath) ? JSON.parse(text) : YAML.parse(text, { maxAliasCount: 0 });
  if (!doc || typeof doc !== 'object' || (!doc.openapi && !doc.swagger) || !doc.paths || typeof doc.paths !== 'object') {
    throw new Error('유효한 OpenAPI 3.x 또는 Swagger 2.0 명세(paths 포함)가 아닙니다.');
  }
  return doc;
}

function resolveRef(doc: Record<string, any>, schema: any, depth = 0): any {
  if (!schema || typeof schema !== 'object' || depth > 8) return schema;
  if (typeof schema.$ref === 'string' && schema.$ref.startsWith('#/')) {
    const parts = schema.$ref.slice(2).split('/').map((p: string) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
    let cur: any = doc;
    for (const part of parts) cur = cur?.[part];
    return resolveRef(doc, cur, depth + 1);
  }
  return schema;
}

function synthesizeFromSchema(doc: Record<string, any>, rawSchema: any, depth = 0): any {
  if (depth > 6) return null;
  const schema = resolveRef(doc, rawSchema, depth);
  if (!schema || typeof schema !== 'object') return {};
  if (schema.example !== undefined) return schema.example;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  if (schema.default !== undefined) return schema.default;
  if (schema.type === 'object' || schema.properties) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(schema.properties ?? {})) {
      out[k] = synthesizeFromSchema(doc, v, depth + 1);
    }
    return out;
  }
  if (schema.type === 'array') {
    return [synthesizeFromSchema(doc, schema.items, depth + 1)];
  }
  if (schema.type === 'integer') return 1;
  if (schema.type === 'number') return 1.5;
  if (schema.type === 'boolean') return true;
  if (schema.format === 'date-time') return '2026-01-01T00:00:00Z';
  if (schema.format === 'date') return '2026-01-01';
  if (schema.format === 'email') return 'user@example.local';
  if (schema.format === 'uuid') return '00000000-0000-4000-8000-000000000001';
  return 'sample';
}

function pickSuccessResponse(doc: Record<string, any>, operation: Record<string, any>): { status: number; body: any } {
  const responses = operation.responses ?? {};
  const statusKey = Object.keys(responses).find(k => /^2\d\d$/.test(k)) ?? Object.keys(responses)[0] ?? '200';
  const status = /^[2-5]\d{2}$/.test(statusKey) ? Number(statusKey) : 200;
  const resp = resolveRef(doc, responses[statusKey]);
  if (!resp) return { status, body: { ok: true } };
  // OpenAPI 3
  const jsonContent = resp.content?.['application/json'];
  if (jsonContent) {
    if (jsonContent.example !== undefined) return { status, body: jsonContent.example };
    if (jsonContent.examples && typeof jsonContent.examples === 'object') {
      const first = Object.values(jsonContent.examples)[0] as any;
      if (first?.value !== undefined) return { status, body: first.value };
    }
    if (jsonContent.schema) return { status, body: synthesizeFromSchema(doc, jsonContent.schema) };
  }
  // Swagger 2
  if (resp.schema) return { status, body: synthesizeFromSchema(doc, resp.schema) };
  return { status, body: { ok: true } };
}

const schemaKeywords = new Set([
  'type', 'nullable', 'required', 'properties', 'items', 'additionalProperties', 'enum', 'const', 'allOf',
  'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'minItems', 'maxItems',
  'title', 'description', 'default', 'example', 'examples', 'readOnly', 'writeOnly', 'deprecated', 'externalDocs', '$comment',
]);

function validateJsonAgainstSchema(doc: Record<string, any>, source: any, value: unknown, direction: 'request' | 'response') {
  const errors: string[] = [];
  const incomplete = new Set<string>();
  let remaining = 20_000;
  const error = (detail: string) => { if (errors.length < 20) errors.push(detail); };
  const check = (raw: any, data: unknown, pointer: string, depth: number) => {
    if (--remaining < 0 || depth > 24) { incomplete.add('스키마 검사 상한에 도달했습니다.'); return; }
    if (raw === true) return;
    if (raw === false) { error(`${pointer}: schema rejects this value`); return; }
    if (raw?.$ref && (typeof raw.$ref !== 'string' || !raw.$ref.startsWith('#/') ||
        Object.keys(raw).some(key => key !== '$ref' && !['title', 'description'].includes(key)))) {
      incomplete.add('외부 참조 또는 추가 조건이 있는 $ref를 확인할 수 없습니다.');
      return;
    }
    const schema = resolveRef(doc, raw);
    if (!schema || typeof schema !== 'object' || Array.isArray(schema) || schema.$ref) {
      incomplete.add('지원되지 않거나 해석할 수 없는 스키마입니다.');
      return;
    }
    for (const key of Object.keys(schema)) {
      if (!schemaKeywords.has(key) && !key.startsWith('x-') && incomplete.size < 20) incomplete.add('지원하지 않는 스키마 조건: ' + key);
    }
    const actual = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data;
    if (schema.type) {
      const expected = Array.isArray(schema.type) ? schema.type : [schema.type];
      if (!expected.includes(actual) && !(expected.includes('integer') && Number.isInteger(data)) && !(data === null && schema.nullable === true)) {
        error(`${pointer}: expected ${expected.join(' or ')}, got ${actual}`);
        return;
      }
    }
    if (Array.isArray(schema.enum) && !schema.enum.some((candidate: unknown) => isDeepStrictEqual(candidate, data))) error(`${pointer}: value is outside enum`);
    if ('const' in schema && !isDeepStrictEqual(schema.const, data)) error(`${pointer}: value differs from const`);
    for (const child of Array.isArray(schema.allOf) ? schema.allOf : []) check(child, data, pointer, depth + 1);
    if (actual === 'object') {
      const fields = data as Record<string, unknown>;
      const properties = schema.properties ?? {};
      for (const key of Array.isArray(schema.required) ? schema.required : []) {
        const property = resolveRef(doc, Object.hasOwn(properties, key) ? properties[key] : undefined);
        if ((direction === 'request' && property?.readOnly) || (direction === 'response' && property?.writeOnly)) continue;
        if (!Object.hasOwn(fields, key)) error(`${pointer}.${key}: missing required property`);
      }
      for (const [key, field] of Object.entries(fields)) {
        if (remaining < 0) break;
        if (Object.hasOwn(properties, key)) check(properties[key], field, `${pointer}.${key}`, depth + 1);
        else if (schema.additionalProperties === false) error(`${pointer}.${key}: additional property is not allowed`);
        else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') check(schema.additionalProperties, field, `${pointer}.${key}`, depth + 1);
      }
    } else if (Array.isArray(data)) {
      if (data.length < schema.minItems || data.length > schema.maxItems) error(`${pointer}: array length is outside the allowed range`);
      if ('items' in schema) for (const [index, item] of data.entries()) {
        check(schema.items, item, `${pointer}[${index}]`, depth + 1);
        if (remaining < 0) break;
      }
    } else if (typeof data === 'string') {
      const length = [...data].length;
      if (length < schema.minLength || length > schema.maxLength) error(`${pointer}: string length is outside the allowed range`);
    } else if (typeof data === 'number') {
      if (data < schema.minimum || data > schema.maximum ||
          (typeof schema.exclusiveMinimum === 'number' ? data <= schema.exclusiveMinimum : schema.exclusiveMinimum === true && data === schema.minimum) ||
          (typeof schema.exclusiveMaximum === 'number' ? data >= schema.exclusiveMaximum : schema.exclusiveMaximum === true && data === schema.maximum)) {
        error(`${pointer}: number is outside the allowed range`);
      }
    }
  };
  check(source, value, '$', 0);
  return { errors, incomplete: [...incomplete] };
}

function jsonRequestContract(doc: Record<string, any>, operation: Record<string, any>) {
  if (operation.requestBody) {
    const body = resolveRef(doc, operation.requestBody);
    const schema = body?.content?.['application/json']?.schema;
    return { required: body?.required === true, schema, unsupported: schema === undefined };
  }
  const body = (Array.isArray(operation.parameters) ? operation.parameters : [])
    .map((parameter: any) => resolveRef(doc, parameter)).find((parameter: any) => parameter?.in === 'body');
  return body ? { required: body.required === true, schema: body.schema, unsupported: body.schema === undefined } : undefined;
}

function readMockBody(request: http.IncomingMessage): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let length = 0;
    request.on('data', (chunk: Buffer) => {
      length += chunk.length;
      if (length > 512 * 1024) { resolve(undefined); return; }
      chunks.push(chunk);
    });
    request.once('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.once('error', reject);
    request.once('aborted', reject);
  });
}

function buildRoutes(doc: Record<string, any>): ParsedRoute[] {
  const routes: ParsedRoute[] = [];
  const methods = new Set(['get', 'head', 'post', 'put', 'patch', 'delete']);
  for (const [template, pathItem] of Object.entries(doc.paths ?? {})) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    const escaped = template
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\{[^/{}]+\\\}/g, '[^/]+');
    const regex = new RegExp(`^${escaped}$`);
    for (const [method, operation] of Object.entries(pathItem as Record<string, any>)) {
      if (!methods.has(method.toLowerCase()) || !operation || typeof operation !== 'object') continue;
      routes.push({ method: method.toUpperCase(), template, regex, operation });
    }
  }
  return routes;
}

function isLoopbackHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === '127.0.0.1' || h === 'localhost' || h === '::1' || h === '[::1]';
}

/** Local OpenAPI/Swagger mock server and contract verification tools. */
export class ApiTools {
  private mocks = new Map<string, MockServerEntry>();
  private abort = new AbortController();

  constructor(
    _resources: string,
    private options: {
      approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
      approveExplicit?: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>;
      reservedPorts?: () => number[];
    },
  ) {}

  ports(): number[] {
    return [...this.mocks.values()].map(m => m.port);
  }

  async mock(session: string, project: string, input: ApiMockInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();

    if (input.operation === 'status') {
      if (input.id) {
        const m = this.mocks.get(input.id);
        if (!m || m.session !== session || m.project !== project) throw new Error('현재 대화·프로젝트가 시작한 Mock 서버만 조회할 수 있습니다.');
        return { id: m.id, url: m.url, specPath: m.specPath, routeCount: m.routes.length, recentRequests: m.requests.slice(-30) };
      }
      return {
        servers: [...this.mocks.values()]
          .filter(m => m.session === session && m.project === project)
          .map(m => ({ id: m.id, url: m.url, specPath: m.specPath, routeCount: m.routes.length, requestCount: m.requests.length })),
      };
    }

    if (input.operation === 'stop') {
      if (!input.id) throw new Error('중지할 Mock 서버 ID를 지정하세요.');
      const m = this.mocks.get(input.id);
      if (!m || m.session !== session || m.project !== project) throw new Error('현재 대화·프로젝트가 시작한 Mock 서버만 중지할 수 있습니다.');
      await this.closeMock(m.id);
      return { status: 'stopped', id: m.id };
    }

    // start
    if (this.mocks.size >= 2) throw new Error('동시에 실행할 수 있는 로컬 Mock API 서버는 최대 2개입니다.');
    if (!input.specPath) throw new Error('OpenAPI/Swagger 명세 파일 경로(specPath)를 지정하세요.');
    const files = new ProjectFiles(project);
    const rawText = await files.read(input.specPath);
    const doc = parseOpenApi(rawText, input.specPath);
    const routes = buildRoutes(doc);
    if (!routes.length) throw new Error('명세에 등록된 HTTP 엔드포인트가 없습니다.');

    const ok = await this.options.approve(
      '로컬 OpenAPI Mock 서버 시작',
      `프로젝트: ${project}\n명세 파일: ${input.specPath}\n엔드포인트 수: ${routes.length}개\n바인딩: 127.0.0.1 (로컬 루프백 전용)`,
      combined,
    );
    if (!ok) throw new Error('로컬 Mock 서버 시작을 취소했습니다.');
    combined.throwIfAborted();

    const id = randomUUID();
    const requests: MockServerEntry['requests'] = [];
    const server = http.createServer({ requestTimeout: 15000 }, async (req, res) => {
      let reqUrl: URL;
      try { reqUrl = new URL(req.url ?? '/', 'http://127.0.0.1'); }
      catch { res.writeHead(400).end(); return; }
      const method = (req.method ?? 'GET').toUpperCase();
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      if (method === 'OPTIONS') { res.writeHead(204).end(); return; }
      const matched = routes.find(r => r.method === method && r.regex.test(reqUrl.pathname));
      if (!matched) {
        requests.push({ at: new Date().toISOString(), method, path: reqUrl.pathname, status: 404 });
        if (requests.length > 200) requests.shift();
        res.writeHead(404, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Not Found in OpenAPI spec', method, path: reqUrl.pathname }));
        return;
      }
      let status: number, body: string | undefined;
      try {
        const contract = jsonRequestContract(doc, matched.operation);
        if (contract) {
          const rawBody = await readMockBody(req);
          let rejected = 0;
          let details: string[] = [];
          if (rawBody === undefined) { rejected = 413; details = ['Request body is too large']; }
          else if (!rawBody && contract.required) { rejected = 400; details = ['Missing required request body']; }
          else if (rawBody && contract.unsupported) { rejected = 501; details = ['Request schema cannot be verified']; }
          else if (rawBody && !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] ?? '')) { rejected = 415; details = ['Expected application/json']; }
          else if (rawBody) {
            try {
              const verified = validateJsonAgainstSchema(doc, contract.schema, JSON.parse(rawBody), 'request');
              rejected = verified.errors.length ? 400 : verified.incomplete.length ? 501 : 0;
              details = [...verified.errors, ...verified.incomplete];
            } catch { rejected = 400; details = ['Request body is not valid JSON']; }
          }
          if (rejected) {
            requests.push({ at: new Date().toISOString(), method, path: reqUrl.pathname, status: rejected });
            if (requests.length > 200) requests.shift();
            res.writeHead(rejected, { 'Content-Type': 'application/json' }).end(JSON.stringify({ errors: details }));
            return;
          }
        } else req.resume();
        const picked = pickSuccessResponse(doc, matched.operation);
        status = picked.status;
        body = method === 'HEAD' || status === 204 || status === 304 ? undefined : JSON.stringify(picked.body);
      } catch { res.writeHead(500).end(); return; }
      requests.push({ at: new Date().toISOString(), method, path: reqUrl.pathname, status });
      if (requests.length > 200) requests.shift();
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(body);
    });

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const addr = server.address();
    if (!addr || typeof addr === 'string') {
      server.close();
      throw new Error('Mock 서버 포트 할당 실패');
    }
    const url = `http://127.0.0.1:${addr.port}`;
    this.mocks.set(id, { id, session, project, specPath: input.specPath, port: addr.port, url, server, routes, requests });
    if (combined.aborted) {
      await this.closeMock(id);
      combined.throwIfAborted();
    }
    return { status: 'running', id, url, specPath: input.specPath, routes: routes.map(r => `${r.method} ${r.template}`).slice(0, 60) };
  }

  async contractTest(session: string, project: string, input: ApiContractTestInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    if (input.useSchemathesis) throw new Error('Schemathesis 연동은 요청 상한과 대상 범위를 확인할 수 있을 때까지 비활성화되어 있습니다.');
    if (Object.keys(input.headers ?? {}).some(name => /^(host|connection|content-length|transfer-encoding|upgrade|proxy-)/i.test(name))) {
      throw new Error('요청 주소와 전송 방식을 바꾸는 HTTP 헤더는 지정할 수 없습니다.');
    }
    let parsedUrl: URL;
    try { parsedUrl = new URL(input.baseUrl); } catch { throw new Error('유효한 baseUrl을 지정하세요.'); }
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
      throw new Error('baseUrl은 인증 정보 없는 http/https 주소여야 합니다.');
    }

    const files = new ProjectFiles(project);
    const rawText = await files.read(input.specPath);
    const doc = parseOpenApi(rawText, input.specPath);
    const allowedMethods = new Set((input.methods?.length ? input.methods : ['GET', 'HEAD']).map(m => m.toUpperCase()));
    const hasMutating = [...allowedMethods].some(m => !['GET', 'HEAD'].includes(m));
    const loopback = isLoopbackHost(parsedUrl.hostname);
    const port = Number(parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80));
    const ownedMock = [...this.mocks.values()].find(mock => !mock.closing && parsedUrl.protocol === 'http:' && mock.port === port && loopback);
    if (ownedMock && (ownedMock.session !== session || ownedMock.project !== project)) {
      throw new Error('현재 대화·프로젝트에서 시작한 Mock만 검증할 수 있습니다.');
    }
    if (!ownedMock && loopback && this.options.reservedPorts?.().includes(port)) {
      throw new Error('Ned 내부 서비스는 API 계약 검증 대상이 될 수 없습니다.');
    }
    const maxRequests = Math.min(50, Math.max(1, input.maxRequests ?? 20));
    const routes = buildRoutes(doc).filter(r => allowedMethods.has(r.method)).slice(0, maxRequests);
    if (!routes.length) throw new Error('지정한 메서드 조건에 해당하는 명세 엔드포인트가 없습니다.');

    const prefix = parsedUrl.pathname.endsWith('/') ? parsedUrl.pathname : parsedUrl.pathname + '/';
    const targets = routes.map(route => {
      const filledPath = route.template.replace(/\{([^}]+)\}/g, (_m, name) => {
        const param = (route.operation.parameters ?? []).find((p: any) => p.name === name && p.in === 'path');
        const val = param?.example ?? param?.schema?.example ?? (param?.schema?.type === 'integer' ? '1' : 'sample');
        return encodeURIComponent(String(val));
      });
      if (!filledPath.startsWith('/') || filledPath.startsWith('//') || /[\\?#]/.test(filledPath)) {
        throw new Error('명세의 요청 경로는 승인할 서버 내부의 URL 경로여야 합니다.');
      }
      const reqUrl = new URL(parsedUrl.origin + prefix + filledPath.slice(1));
      if (reqUrl.origin !== parsedUrl.origin || !reqUrl.pathname.startsWith(prefix)) {
        throw new Error('명세의 요청 경로가 승인할 API 범위를 벗어납니다.');
      }
      return { route, reqUrl };
    });

    const explicit = !ownedMock || hasMutating;
    if (explicit && !this.options.approveExplicit) throw new Error('실제 API 호출에는 명시적 승인 기능이 필요합니다.');
    const approve = explicit ? this.options.approveExplicit! : this.options.approve;
    const ok = await approve(
      `API 계약 검증 실행 (${parsedUrl.host})`,
      `프로젝트: ${project}
명세 파일: ${input.specPath}
대상 서버: ${parsedUrl.origin}${prefix}
허용 메서드: ${[...allowedMethods].join(', ')}
최대 요청 수: ${targets.length}건`,
      combined,
    );
    if (!ok) throw new Error('API 계약 검증을 취소했습니다.');
    combined.throwIfAborted();

    const results: Array<{ method: string; template: string; url: string; status: number; passed: boolean; errors: string[]; incomplete: string[] }> = [];
    for (const { route, reqUrl } of targets) {
      combined.throwIfAborted();
      let reqBody: string | undefined;
      if (!['GET', 'HEAD'].includes(route.method)) {
        const bodySchema = jsonRequestContract(doc, route.operation)?.schema;
        if (bodySchema) reqBody = JSON.stringify(synthesizeFromSchema(doc, bodySchema));
      }
      const errors: string[] = [];
      const incomplete: string[] = [];
      let status = 0;
      try {
        const resp = await requestJSON(reqUrl.href, {
          method: route.method,
          headers: { Accept: 'application/json', ...input.headers, ...(reqBody ? { 'Content-Type': 'application/json' } : {}) },
          body: reqBody,
          maxBytes: 512 * 1024,
          signal: AbortSignal.any([combined, AbortSignal.timeout(10000)]),
        });
        status = resp.status;
        const responses = route.operation.responses ?? {};
        const respDef = resolveRef(doc, responses[String(status)] ?? responses[`${Math.floor(status / 100)}XX`] ?? responses.default);
        if (!respDef) {
          errors.push(`Undocumented HTTP status ${status}`);
        } else if (route.method !== 'HEAD') {
          const schema = respDef.content?.['application/json']?.schema ?? respDef.schema;
          if (schema !== undefined) {
            if (!(resp.headers.get('content-type') ?? '').toLowerCase().includes('json')) {
              errors.push(`Expected JSON response Content-Type, got "${resp.headers.get('content-type') ?? ''}"`);
            } else {
              try {
                const parsedBody = JSON.parse(await resp.text());
                const checked = validateJsonAgainstSchema(doc, schema, parsedBody, 'response');
                errors.push(...checked.errors);
                incomplete.push(...checked.incomplete);
              } catch {
                errors.push('Response body is not valid JSON');
              }
            }
          } else if (respDef.content && Object.keys(respDef.content).length) {
            incomplete.push('응답 본문의 미디어 형식 또는 스키마를 검증할 수 없습니다.');
          }
        }
      } catch (err) {
        combined.throwIfAborted();
        errors.push(`HTTP error: ${err instanceof Error ? err.message : String(err)}`);
      }
      results.push({ method: route.method, template: route.template, url: reqUrl.href, status, passed: errors.length === 0 && incomplete.length === 0, errors, incomplete });
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(result => result.errors.length > 0).length;
    return {
      status: failed ? 'failed' : passed === results.length ? 'passed' : 'incomplete',
      baseUrl: parsedUrl.origin,
      total: results.length,
      passed,
      failed,
      incomplete: results.length - failed - passed,
      results,
    };
  }

  private async closeMock(id: string) {
    const entry = this.mocks.get(id);
    if (!entry) return;
    if (!entry.closing) {
      entry.closing = new Promise<void>(resolve => entry.server.close(() => resolve()))
        .finally(() => this.mocks.delete(id));
      entry.server.closeAllConnections();
    }
    await entry.closing;
  }

  cancel(session: string) {
    for (const m of [...this.mocks.values()]) {
      if (m.session === session) void this.closeMock(m.id);
    }
  }

  async stopped(session: string) {
    await Promise.all([...this.mocks.values()].filter(m => m.session === session).map(m => m.closing));
  }

  async close() {
    this.abort.abort();
    await Promise.all([...this.mocks.keys()].map(id => this.closeMock(id)));
  }
}
