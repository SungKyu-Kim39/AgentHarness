import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { vikingErrorCode, sanitizeVikingDiagnostic } from '../src/main/openviking-errors';
import { OpenVikingGateway } from '../src/main/openviking-gateway';
import { OpenVikingService, savedKnowledgeId } from '../src/main/openviking';
import { configSchema } from '../src/shared/contracts';
import { ReaGhidra } from '../distribution/rea-ghidra';

test('vikingErrorCode classifies forbidden, timeout, embedding, tls and server errors instead of masking as OV_REQUEST', () => {
  assert.equal(vikingErrorCode('Access forbidden for scope', 403), 'OV_FORBIDDEN');
  assert.equal(vikingErrorCode('HTTP 403 denied'), 'OV_FORBIDDEN');
  assert.equal(vikingErrorCode('Gateway timeout', 504), 'OV_TIMEOUT');
  assert.equal(vikingErrorCode('request timed out ETIMEDOUT'), 'OV_TIMEOUT');
  assert.equal(vikingErrorCode('UNABLE_TO_VERIFY_LEAF_SIGNATURE certificate error', 500), 'OV_TLS');
  assert.equal(vikingErrorCode('embedding model not found', 500), 'OV_EMBEDDING');
  assert.equal(vikingErrorCode('사내 임베딩 HTTP 500: 실패 [OV_EMBEDDING]', 500), 'OV_EMBEDDING');
  assert.equal(vikingErrorCode('vector dimension mismatch', 500), 'OV_EMBEDDING_DIMENSION');
  assert.equal(vikingErrorCode('Internal Server Error', 500), 'OV_SERVER_ERROR');
  assert.equal(vikingErrorCode('Service Unavailable', 503), 'OV_SERVER_ERROR');
  assert.equal(vikingErrorCode('Resource missing', 404), 'OV_NOT_FOUND');
  assert.equal(vikingErrorCode('Already exists', 409), 'OV_CONFLICT');
  assert.equal(vikingErrorCode('Unknown opaque error', 400), 'OV_REQUEST');
});

test('sanitizeVikingDiagnostic masks secrets, tokens and personal paths within 500 characters', () => {
  const raw = 'Error with secret-key-999 Bearer tok_abc123 at C:\\Users\\alice\\Documents\\file.txt and /home/bob/work ' + 'x'.repeat(800);
  const cleaned = sanitizeVikingDiagnostic(raw, ['secret-key-999']);
  assert.ok(cleaned.length <= 500);
  assert.ok(!cleaned.includes('secret-key-999'));
  assert.ok(!cleaned.includes('tok_abc123'));
  assert.ok(!cleaned.includes('alice'));
  assert.ok(!cleaned.includes('bob'));
  assert.match(cleaned, /C:\\Users\\<redacted>/);
  assert.match(cleaned, /\/<redacted>/);
});

test('OpenVikingGateway tags embedding connection and HTTP errors with explicit OV_* codes', async t => {
  let upstreamStatus = 500;
  const server = createServer(async (req, res) => {
    for await (const _ of req) {}
    res.writeHead(upstreamStatus, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: { message: 'model not found' } }));
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const port = (server.address() as { port: number }).port;
  const config = configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'secret-llm', id: 'llm' },
    openViking: { enabled: true, embedding: { baseUrl: `http://127.0.0.1:${port}/v1`, apiKey: 'secret-embed', id: 'BGE', dimension: 4 } },
  });
  const gateway = new OpenVikingGateway(config);
  await gateway.start();
  t.after(() => gateway.close());

  const invoke = () => fetch(gateway.baseUrl + '/embeddings', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + gateway.token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'BGE', input: ['hello'] }),
  });

  let res = await invoke();
  assert.equal(res.status, 502);
  let text = await res.text();
  assert.match(text, /\[OV_EMBEDDING\]/);
  assert.equal(vikingErrorCode(text, 500), 'OV_EMBEDDING');

  upstreamStatus = 403;
  res = await invoke();
  text = await res.text();
  assert.match(text, /\[OV_FORBIDDEN\]/);
  assert.equal(vikingErrorCode(text, 500), 'OV_FORBIDDEN');

  server.closeAllConnections();
  await new Promise<void>(r => server.close(() => r()));
  res = await invoke();
  text = await res.text();
  assert.match(text, /\[OV_EMBEDDING\]/);
});

test('OpenVikingService always writes sanitized request-diagnostics.json on API failure without testLaunch diagnostic hook', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-ov-diag-'));
  const data = path.join(root, 'data'); await mkdir(data);
  const launcher = path.join(root, 'fake-ov.py');
  await writeFile(launcher, [
    'import argparse, json, sys',
    'from http.server import BaseHTTPRequestHandler, HTTPServer',
    'p = argparse.ArgumentParser()',
    'p.add_argument("--config")',
    'p.add_argument("--port", type=int)',
    'args = p.parse_args()',
    'class H(BaseHTTPRequestHandler):',
    '  def log_message(self, *a): pass',
    '  def do_GET(self):',
    '    if self.path == "/health":',
    '      self.send_response(200); self.send_header("Content-Type","application/json"); self.end_headers()',
    '      self.wfile.write(b\'{"status":"ok"}\'); return',
    '    if self.path.startswith("/api/v1/fs/stat"):',
    '      self.send_response(404); self.end_headers(); self.wfile.write(b\'{"error":"not found"}\'); return',
    '    self.send_response(403); self.end_headers(); self.wfile.write(b\'{"error":"forbidden for C:\\\\Users\\\\alice\\\\secret Bearer raw-secret-token"}\')',
    '  def do_POST(self):',
    '    n = int(self.headers.get("Content-Length", "0"))',
    '    if n: self.rfile.read(n)',
    '    if self.path == "/api/v1/fs/mkdir":',
    '      self.send_response(200); self.send_header("Content-Type","application/json"); self.end_headers()',
    '      self.wfile.write(b\'{"status":"ok"}\'); return',
    '    self.send_response(500); self.send_header("Content-Type","application/json"); self.end_headers()',
    '    self.wfile.write(b\'{"error":"embedding connection failed for secret-embed-key at C:\\\\Users\\\\alice\\\\notes"}\')',
    'HTTPServer(("127.0.0.1", args.port), H).serve_forever()',
  ].join('\n'));
  const installedPython = process.env.NED_TEST_NODE
    ? path.join(path.dirname(process.env.NED_TEST_NODE), 'resources/runtime/windows-x64/openviking/python/python.exe')
    : undefined;
  const python = process.env.NED_TEST_CURRENT_PYTHON ?? installedPython ?? execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' }).trim();
  const config = configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'secret-llm-key', id: 'llm' },
    openViking: { enabled: true, embedding: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'secret-embed-key', id: 'embed', dimension: 4 } },
  });
  const service = new OpenVikingService(path.join(root, 'runtime'), data, () => {}, { executable: python, launcher, cwd: root });
  t.after(async () => { await service.close(); await rm(root, { recursive: true, force: true }); });
  await service.configure(config);
  assert.equal(service.state().status, 'ready');

  await assert.rejects(service.saveNote('project', 'proj1', 'Title', 'Body', savedKnowledgeId('Title')), /^Error: OV_EMBEDDING$/);
  await assert.rejects(service.read('proj1', 'viking://resources/ned/proj1/doc.md'), /^Error: OV_FORBIDDEN$/);
  await service.close();

  const rawDiag = await readFile(path.join(data, 'openviking', 'request-diagnostics.json'), 'utf8');
  assert.ok(!rawDiag.includes('secret-embed-key'));
  assert.ok(!rawDiag.includes('raw-secret-token'));
  assert.ok(!rawDiag.includes('alice'));
  const parsed = JSON.parse(rawDiag);
  assert.equal(parsed.schemaVersion, 1);
  assert.ok(parsed.events.some((e: any) => e.code === 'OV_EMBEDDING' && e.httpStatus === 500 && e.summary === 'HTTP 500 /api/v1/content/write'));
  assert.ok(parsed.events.some((e: any) => e.code === 'OV_FORBIDDEN' && e.httpStatus === 403 && e.route.startsWith('/api/v1/content/read')));
});

test('ReaGhidra ignores leftover 0.3.11 reversing pack folder and requires bundled runtime only', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-rea-unified-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const data = path.join(root, 'data');
  const resources = path.join(root, 'resources');
  // Simulate leftover 0.3.11 Core+pack folder in %APPDATA%\Ned\packs\reversing\0.3.11
  await mkdir(path.join(data, 'packs', 'reversing', '0.3.11', 'rea'), { recursive: true });
  await mkdir(path.join(data, 'packs', 'reversing', '0.3.11', 'ghidra'), { recursive: true });
  await mkdir(path.join(resources, 'runtime', 'windows-x64'), { recursive: true });
  const rea = new ReaGhidra(data, resources, async () => true);
  // Missing bundled runtime must fail without falling back to external pack folder
  await assert.rejects(rea.verifiedRuntime(), (error: NodeJS.ErrnoException) => error.code === 'ENOENT' || /REA\/Ghidra/.test(error.message));
});
