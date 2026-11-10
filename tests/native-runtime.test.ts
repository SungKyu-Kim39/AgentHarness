import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { configSchema } from '../src/shared/contracts';
import { NativeRuntime, engineConfiguration, providerID } from '../distribution/native-control';

test('native model bindings hide actual keys and select the configured default', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-native-')); t.after(() => rm(root, { recursive: true, force: true }));
  const config = configSchema.parse({ schemaVersion: 2, models: [
    { name: 'A', id: 'model/a', baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'actual-secret-A' },
    { name: 'B', id: 'model-b', baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'actual-secret-B' },
  ], defaultModel: 'B' });
  const runtime = new NativeRuntime(root, root, { isEncryptionAvailable: () => true, encryptString: Buffer.from, decryptString: b => b.toString() });
  t.after(() => runtime.close()); await runtime.initialize(config);
  assert.deepEqual(runtime.status().models.map(m => m.name), ['A', 'B']);
  const gateway = { baseUrl: 'http://127.0.0.1:12345/v1', token: 'ephemeral-token' };
  const document = engineConfiguration(config, config.models!.map(m => ({ ...m, provider: providerID(m.name), gateway: gateway as never })));
  assert.equal(document.model.providerID, providerID('B'));
  assert.equal(document.model.model, 'model-b');
  assert.ok(!JSON.stringify(document).includes('actual-secret'));
  assert.equal(document.providers[providerID('A')].package, '@opencode/ai/providers/openai-compatible');
});

const cli = path.resolve('.cache/l-vibe-desktop/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode');
test('OpenCode provider format accepts APIKey and preserves model aliases, IDs, capabilities and cost', () => {
  const input = { model: { providerID: 'Internal provider', model: 'model-1' }, providers: {
    'Internal provider': { name: 'Internal provider', package: '@opencode/ai/providers/openai-compatible', env: ['VLLM_KEY_1'],
      settings: { baseURL: 'https://llm.internal.example/v1', APIKey: 'synthetic-provider-secret' },
      models: { 'model-1': { name: 'Internal model', modelID: 'exact-wire-id', capabilities: { tools: true, input: ['text', 'image'], output: ['text'] }, cost: { input: 0.1, output: 0.5, cache: { read: 0.01, write: 0.125 } } } },
    },
  } };
  const config = configSchema.parse(input);
  assert.equal(config.model.apiKey, 'synthetic-provider-secret');
  assert.equal(config.model.id, 'exact-wire-id');
  const m = config.models![0];
  const document = engineConfiguration(config, [{ provider: m.providerID!, id: m.modelKey!, name: m.name, gateway: { baseUrl: 'http://127.0.0.1:12345/v1', token: 'run-token' } as never }]);
  assert.deepEqual(document.model, { providerID: 'Internal provider', model: 'model-1' });
  assert.equal(document.providers['Internal provider'].models['model-1'].modelID, 'exact-wire-id');
  assert.deepEqual(document.providers['Internal provider'].models['model-1'].capabilities, input.providers['Internal provider'].models['model-1'].capabilities);
  assert.deepEqual(document.providers['Internal provider'].models['model-1'].cost, input.providers['Internal provider'].models['model-1'].cost);
  assert.ok(!JSON.stringify(document).includes('synthetic-provider-secret'));
  assert.deepEqual(configSchema.parse(JSON.parse(JSON.stringify(config))).models, config.models);
});
test('real v2 engine is authenticated, private and exits when the native host closes', { skip: !existsSync(cli), timeout: 120000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-v2-')); t.after(() => rm(root, { recursive: true, force: true }));
  for (const name of ['config', 'data', 'cache', 'state']) await mkdir(path.join(root, 'runtime', name), { recursive: true });
  const config = configSchema.parse({ schemaVersion: 2, models: [{ name: 'offline-test', id: 'test-model', baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'test-only-secret' }] });
  const runtime = new NativeRuntime(root, root, { isEncryptionAvailable: () => true, encryptString: Buffer.from, decryptString: b => b.toString() });
  t.after(() => runtime.close()); await runtime.initialize(config);
  const connection = await runtime.connection([cli]);
  const auth = { Authorization: 'Basic ' + Buffer.from('opencode:' + connection.password).toString('base64') };
  assert.equal((await fetch(connection.url + '/api/provider')).status, 401);
  const response = await fetch(connection.url + '/api/provider', { headers: auth });
  const catalog = await response.text(); assert.equal(response.status, 200, catalog);
  assert.ok(catalog.includes('offline-test'), catalog);
  assert.ok(!catalog.includes('test-only-secret'));
  await runtime.close();
  await assert.rejects(fetch(connection.url + '/api/provider', { headers: auth, signal: AbortSignal.timeout(1000) }));
});

test('real v2 model selection uses wire IDs and guarded MCP edits require native approval', { skip: !existsSync(cli), timeout: 120000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-v2-edit-')); t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, 'project'), data = path.join(root, 'data');
  await mkdir(project); await mkdir(data); await writeFile(path.join(project, 'main.c'), 'int main() { return 0; }\n');
  const calls: Array<{ url: string; body: any; auth?: string }> = []; let step = 0;
  const model = createServer(async (req, res) => {
    let text = ''; for await (const bytes of req) text += bytes;
    const body = JSON.parse(text); calls.push({ url: req.url!, body, auth: req.headers.authorization });
    if (!body.stream || !body.tools?.length) {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ id: 'aux', object: 'chat.completion', model: body.model, choices: [{ index: 0, message: { role: 'assistant', content: 'L-Vibe test title' }, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } })); return;
    }
    const sequence = [['read_file', { path: 'main.c' }], ['propose_edit', { path: 'main.c', content: 'int main() { return 7; }\n' }]] as const;
    let delta: unknown = { role: 'assistant', content: 'Native approval test complete.' }, finish = 'stop';
    if (step < sequence.length) {
      const [suffix, args] = sequence[step++]; const name = body.tools.map((tool: any) => tool.function.name).find((name: string) => name.endsWith('_' + suffix));
      if (!name) { res.writeHead(500).end(JSON.stringify({ error: { message: 'MCP tool not advertised: ' + suffix } })); return; }
      delta = { role: 'assistant', tool_calls: [{ index: 0, id: 'call-' + step, type: 'function', function: { name, arguments: JSON.stringify(args) } }] }; finish = 'tool_calls';
    }
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const chunk = (delta: unknown, finish_reason: string | null) => ({ id: 'completion-' + calls.length, object: 'chat.completion.chunk', created: 1, model: body.model, choices: [{ index: 0, delta, finish_reason }] });
    res.write('data: ' + JSON.stringify(chunk(delta, null)) + '\n\n'); res.write('data: ' + JSON.stringify(chunk({}, finish)) + '\n\n'); res.end('data: [DONE]\n\n');
  });
  await new Promise<void>(resolve => model.listen(0, '127.0.0.1', resolve)); t.after(() => { model.closeAllConnections(); model.close(); });
  const port = (model.address() as { port: number }).port;
  const config = configSchema.parse({ model: { providerID: 'test-provider', model: 'alias-b' }, providers: {
    'test-provider': { name: 'Test', settings: { baseURL: `http://127.0.0.1:${port}/v1`, APIKey: 'test-wire-key' }, models: {
      'alias-a': { name: 'A', modelID: 'wire-a', capabilities: { tools: true, input: ['text'], output: ['text'] } },
      'alias-b': { name: 'B', modelID: 'wire-b', capabilities: { tools: true, input: ['text', 'image'], output: ['text'] } },
    } },
  } });
  let approvals = 0;
  const runtime = new NativeRuntime(data, path.join(root, 'resources'), { isEncryptionAvailable: () => true, encryptString: Buffer.from, decryptString: b => b.toString() }, async () => {
    approvals++; assert.equal(await readFile(path.join(project, 'main.c'), 'utf8'), 'int main() { return 0; }\n'); return true;
  });
  t.after(() => runtime.close()); await runtime.initialize(config); await runtime.authorizeProject(project);
  const connection = await runtime.connection([cli]);
  const headers = { Authorization: 'Basic ' + Buffer.from('opencode:' + connection.password).toString('base64'), 'Content-Type': 'application/json' };
  const api = async (route: string, body?: unknown, method = 'POST') => {
    const response = await fetch(connection.url + route, { method: body === undefined ? 'GET' : method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await response.text(); assert.ok(response.ok, response.status + ': ' + text); return text ? JSON.parse(text) : undefined;
  };
  const catalog = await api('/api/model'); assert.ok(JSON.stringify(catalog).includes('alias-b'));
  const created = await api('/api/session', { title: 'Guarded edit', location: { directory: project }, model: { providerID: 'test-provider', id: 'alias-b' } });
  const id = created.data.id;
  const blocked = await fetch(connection.url + '/api/experimental/config', { method: 'PATCH', headers, body: '{"plugins":["untrusted"]}' }); assert.equal(blocked.status, 403);
  await api('/api/session/' + id + '/prompt', { text: 'Read main.c and change the return value to 7 using host tools.' });
  let messages = '';
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    messages = JSON.stringify(await api('/api/session/' + id + '/message?limit=100'));
    if (messages.includes('Native approval test complete.')) break;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(messages.includes('Native approval test complete.'), messages + '\nCalls: ' + JSON.stringify(calls.map(c => ({ model: c.body.model, tools: c.body.tools?.map((t: any) => t.function.name) }))));
  assert.equal(approvals, 1); assert.equal(await readFile(path.join(project, 'main.c'), 'utf8'), 'int main() { return 7; }\n');
  assert.ok(calls.length >= 3); assert.ok(calls.every(c => c.body.model === 'wire-b' && c.url === '/v1/chat/completions' && c.auth === 'Bearer test-wire-key'));
  const previousCalls = calls.length;
  await api('/api/session/' + id + '/model', { model: { providerID: 'test-provider', id: 'alias-a' } });
  await api('/api/session/' + id + '/prompt', { text: 'Respond using the other selected model.' });
  const switchDeadline = Date.now() + 15000;
  while (Date.now() < switchDeadline && !calls.slice(previousCalls).some(c => c.body.model === 'wire-a')) await new Promise(resolve => setTimeout(resolve, 100));
  assert.ok(calls.slice(previousCalls).some(c => c.body.model === 'wire-a'), 'Selected alias-a must reach server modelID wire-a');
});
