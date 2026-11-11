import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { requestJSON } from '../src/main/http-request';
import { configSchema } from '../src/shared/contracts';
import { NativeRuntime } from '../distribution/native-control';

const cli = path.resolve('.cache/l-vibe-desktop/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode');
const python = path.resolve('.cache/openviking/env-linux/bin/python3');

test('deadline-free JSON transport cancels while the server is silent and does not follow redirects', async t => {
  let closed!: () => void; const cancelled = new Promise<void>(r => { closed = r; });
  let received!: () => void; const pending = new Promise<void>(r => { received = r; });
  const server = createServer(async (req, res) => {
    for await (const _ of req) {}
    if (req.url === '/redirect') { res.writeHead(302, { Location: 'http://example.invalid/' }).end(); return; }
    res.once('close', closed); received();
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r)); t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  assert.equal((await requestJSON(base + '/redirect')).status, 302);
  const controller = new AbortController(); const request = requestJSON(base + '/queue', { signal: controller.signal });
  await pending; controller.abort(); await assert.rejects(request, /abort/i);
  await Promise.race([cancelled, new Promise((_, reject) => setTimeout(() => reject(new Error('Silent upstream was not cancelled')), 1500).unref())]);
});

test('pinned OpenViking OpenAI backend disables both SDK and HTTPX response deadlines', { skip: !existsSync(python), timeout: 120000 }, async () => {
  const code = `import importlib.util,os,sys
os.environ['LITELLM_LOCAL_MODEL_COST_MAP']='True'
spec=importlib.util.spec_from_file_location('launcher',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
m.configure_tokenizers(sys.argv[2]);m.configure_model_queue_wait();m.configure_model_queue_wait()
from openviking.models.vlm.backends.openai_vlm import OpenAIVLM
v=OpenAIVLM({'model':'test','api_base':'http://127.0.0.1:9/v1','api_key':'synthetic','provider':'openai','timeout':1})
assert v.timeout is None
assert v.get_client().timeout is None
assert v._http_client_kwargs()['timeout'] is None
a=v._build_async_client()
assert a.timeout is None
for c in (v.get_client(), a):
    assert all(getattr(c._client.timeout, k) is None for k in ('connect','read','write','pool'))
import asyncio
asyncio.run(a.close())
v.get_client().close()
print('VLM_QUEUE_WAIT_OK')
`;
  const { stdout } = await promisify(execFile)(python, ['-I', '-B', '-c', code, path.resolve('scripts/openviking-launch.py'), path.resolve('vendor/runtime/windows-x64/openviking/tokenizers')], { timeout: 120000 });
  assert.ok(stdout.includes('VLM_QUEUE_WAIT_OK'));
});

test('real engine waits beyond the former 180-second deadline and user stop closes a silent queued model request', { skip: !existsSync(cli), timeout: 300000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-long-queue-')); t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, 'project'); await mkdir(project);
  let hold = false, received!: () => void, closed!: () => void;
  const pending = new Promise<void>(r => { received = r; }), disconnected = new Promise<void>(r => { closed = r; });
  const server = createServer(async (req, res) => {
    let text = ''; for await (const bytes of req) text += bytes;
    const body = JSON.parse(text);
    const reply = () => {
      if (res.destroyed) return;
      const content = 'Queued model response complete.';
      if (!body.stream) { res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ id: 'aux', object: 'chat.completion', model: body.model, choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }], usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 } })); return; }
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      const chunk = (delta: any, finish_reason: any) => ({ id: 'queued', object: 'chat.completion.chunk', created: 1, model: body.model, choices: [{ index: 0, delta, finish_reason }] });
      res.end('data: ' + JSON.stringify(chunk({ role: 'assistant', content }, null)) + '\n\ndata: ' + JSON.stringify(chunk({}, 'stop')) + '\n\ndata: [DONE]\n\n');
    };
    if (body.stream && body.tools?.length) {
      if (hold) { res.once('close', closed); received(); return; }
      const timer = setTimeout(reply, 185000); res.once('close', () => clearTimeout(timer)); return;
    }
    reply();
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r)); t.after(() => { server.closeAllConnections(); server.close(); });
  const config = configSchema.parse({ model: { providerID: 'p', model: 'm' }, providers: { p: { settings: { baseURL: `http://127.0.0.1:${(server.address() as any).port}/v1`, apiKey: 'synthetic' }, models: { m: { capabilities: { tools: true } } } } } });
  const runtime = new NativeRuntime(path.join(root, 'data'), path.join(root, 'resources'), { isEncryptionAvailable: () => true, encryptString: Buffer.from, decryptString: b => b.toString() });
  t.after(() => runtime.close()); await runtime.initialize(config); await runtime.authorizeProject(project);
  const connection = await runtime.connection([cli]);
  const headers = { Authorization: 'Basic ' + Buffer.from('opencode:' + connection.password).toString('base64'), 'Content-Type': 'application/json' };
  const api = async (route: string, body?: unknown) => { const r = await fetch(connection.url + route, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body) }); const text = await r.text(); assert.ok(r.ok, r.status + ': ' + text); return text ? JSON.parse(text) : undefined; };
  // Location activation is independent of the provider's response queue.
  const ready = Date.now() + 60000;
  while (true) { const r = await fetch(connection.url + '/api/model', { headers }); await r.text(); if (r.ok) break; assert.ok(Date.now() < ready, 'Engine activation failed'); await new Promise(r => setTimeout(r, 200)); }
  const session = await api('/api/session', { title: 'Queue validation', location: { directory: project }, model: { providerID: 'p', id: 'm' } });
  const started = Date.now(); await api('/api/session/' + session.data.id + '/prompt', { text: 'Reply when the server is ready.' });
  let complete = false; const deadline = Date.now() + 210000;
  while (Date.now() < deadline) {
    const messages = JSON.stringify(await api('/api/session/' + session.data.id + '/message?limit=100'));
    if (messages.includes('Queued model response complete.')) { complete = true; break; }
    await new Promise(r => setTimeout(r, 500));
  }
  assert.ok(complete, 'Queued response must complete'); assert.ok(Date.now() - started >= 185000);
  hold = true; await new Promise(r => setTimeout(r, 150));
  await api('/api/session/' + session.data.id + '/prompt', { text: 'Wait for another queued response.' }); await pending;
  await api('/api/session/' + session.data.id + '/interrupt', {});
  await Promise.race([disconnected, new Promise((_, reject) => setTimeout(() => reject(new Error('User stop did not close queued request')), 10000).unref())]);
});
