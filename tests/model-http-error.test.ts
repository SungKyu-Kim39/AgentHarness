import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { ModelGateway } from '../src/main/model-gateway';
import { classifyModelHttpError, modelRequestShape } from '../src/main/model-http-error';
test('HTTP classification reveals fixed categories and counts without echoing private server errors or credentials', () => {
  const secret = 'PRIVATE-CODE-AND-KEY';
  for (const [message, reason] of [
    ['queue limit exceeded ' + secret, 'capacity'], ['maximum context length is 32768 ' + secret, 'context-limit'],
    ['Only one system message is supported ' + secret, 'message-format'], ['tool_choice auto requires tools ' + secret, 'tool-format'],
    ['unsupported reasoning_effort ' + secret, 'unsupported-option'], ['some unknown private failure ' + secret, 'unclassified'],
  ]) {
    const result = classifyModelHttpError(JSON.stringify({ error: { message, param: 'model', api_key: secret } }));
    assert.equal(result.reason, reason); assert.ok(!JSON.stringify(result).includes(secret));
  }
  const shape = modelRequestShape({ model: secret, messages: [{ role: 'system', content: secret }, { role: 'user', content: secret }], tools: [{ function: { name: secret } }], reasoning_effort: secret, max_tokens: 4096 });
  assert.equal(shape.roles.system, 1); assert.equal(shape.tools, 1); assert.ok(!JSON.stringify(shape).includes(secret));
});
test('single-system chat templates accept the first guided request; a real upstream 400 is classified without an automatic retry', async t => {
  let mode = 'single-system', calls = 0;
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const bytes of req) raw += bytes;
    const body = JSON.parse(raw); calls++;
    if (mode === 'busy') { res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: { message: 'queue limit exceeded, private-key-in-error', code: 'private-server-code' } })); return; }
    if (body.messages.filter((m: any) => m.role === 'system').length > 1) { res.writeHead(400).end(JSON.stringify({ error: { message: 'Only one system message is supported' } })); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }] }));
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const events: unknown[] = [];
  const gateway = new ModelGateway({ schemaVersion: 2, model: { id: 'test', baseUrl: 'http://127.0.0.1:' + (server.address() as { port: number }).port + '/v1', apiKey: 'private-key' } }, {}, e => events.push(e), async () => 'Reviewed skill guidance');
  await gateway.start(); t.after(async () => { await gateway.close(); server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); });
  const request = () => fetch(gateway.baseUrl + '/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + gateway.token }, body: JSON.stringify({ model: 'test', messages: [{ role: 'system', content: 'Existing policy' }, { role: 'user', content: 'Synthetic first request' }], tools: [] }) });
  const first = await request(); assert.equal(first.status, 200); await first.text();
  mode = 'busy'; const rejected = await request(); assert.equal(rejected.status, 400); const text = await rejected.text();
  assert.match(text, /대기열/); assert.ok(!text.includes('private-key')); assert.equal(calls, 2);
  assert.equal((events[0] as any).httpError.reason, 'capacity'); assert.equal((events[0] as any).requestShape.roles.system, 1);
  assert.ok(!JSON.stringify(events).includes('private-key'));
});
