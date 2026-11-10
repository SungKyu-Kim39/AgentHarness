import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { OpenVikingService } from '../src/main/openviking';
import { configSchema } from '../src/shared/contracts';
const executable = path.resolve('.cache/openviking/env-linux/bin/python3');
test('real pinned OpenViking starts/stops and keeps project knowledge scoped', { skip: !existsSync(executable), timeout: 120000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-viking-')); t.after(() => rm(root, { recursive: true, force: true }));
  const requests: string[] = [];
  const endpoint = createServer(async (req, res) => {
    let raw = ''; for await (const bytes of req) raw += bytes;
    requests.push(req.url!); const body = JSON.parse(raw);
    if (req.url === '/v1/chat/completions') {
      assert.equal(body.model, 'llm-test'); assert.equal(req.headers.authorization, 'Bearer viking-test-key');
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ id: 'viking-description', object: 'chat.completion', model: 'llm-test', choices: [{ index: 0, message: { role: 'assistant', content: 'Scoped local project document.' }, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } })); return;
    }
    if (req.url !== '/v1/embeddings') { res.writeHead(400).end('{}'); return; }
    assert.equal(body.model, 'embed-test'); assert.equal(req.headers.authorization, 'Bearer embedding-test-key');
    const input = Array.isArray(body.input) ? body.input : [body.input];
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ object: 'list', model: 'embed-test', data: input.map((_: unknown, index: number) => ({ object: 'embedding', index, embedding: [0.5, 0.25, 0.125, 0.75] })), usage: { prompt_tokens: 10, total_tokens: 10 } }));
  });
  await new Promise<void>(resolve => endpoint.listen(0, '127.0.0.1', resolve)); t.after(() => { endpoint.closeAllConnections(); endpoint.close(); });
  const port = (endpoint.address() as { port: number }).port;
  const baseUrl = `http://127.0.0.1:${port}/v1`;
  const config = configSchema.parse({ schemaVersion: 2, model: { baseUrl, apiKey: 'viking-test-key', id: 'llm-test' }, openViking: { enabled: true, embedding: { baseUrl, apiKey: 'embedding-test-key', id: 'embed-test', dimension: 4 } } });
  let diagnostics = '';
  const viking = new OpenVikingService(root, root, () => {}, { executable, launcher: path.resolve('scripts/openviking-launch.py'), cwd: root, diagnostic: text => { diagnostics += text; } });
  t.after(() => viking.close()); await viking.configure(config);
  assert.equal(viking.state().status, 'ready', diagnostics);
  await viking.index('p1', 'hello.txt', 'L-Vibe tests local project knowledge.').catch(error => assert.fail(error.message + '\n' + diagnostics));
  const found = await viking.search('p1', 'L-Vibe', 3);
  assert.ok(found.includes('p1'), found);
  await assert.rejects(viking.read('p2', 'viking://resources/l-vibe/p1/file.txt'));
  assert.ok(requests.every(route => ['/v1/embeddings', '/v1/chat/completions'].includes(route)), JSON.stringify(requests));
  await viking.close();
});
