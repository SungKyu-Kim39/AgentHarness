import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
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
