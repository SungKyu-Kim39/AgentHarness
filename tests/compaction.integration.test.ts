import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { NativeRuntime } from '../distribution/native-control';
import { configSchema } from '../src/shared/contracts';
const cli = path.resolve(process.env.NED_TEST_ENGINE ?? '.cache/opencode/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode');
test('real engine compaction recovers from length once and commits only the final summary', { skip: !existsSync(cli), timeout: 90000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-compact-')); const project = path.join(root, 'project'); await mkdir(project);
  let summaryCalls = 0; const calls: any[] = [];
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw); calls.push(body);
    const summary = body.tool_choice === 'none' && body.messages?.at(-1)?.content?.includes('## Objective');
    if (summary) summaryCalls++;
    const content = summary ? summaryCalls === 1 ? 'TRUNCATED_DRAFT_NEVER_COMMIT' : '## Objective\nKeep the compiler version.\n## Next Move\nRun the pending tests.' : 'Conversation ready.';
    const finish = summary && summaryCalls === 1 ? 'length' : 'stop';
    if (!body.stream) { res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ id: 'test', choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: finish }] })); return; }
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const chunk = (delta: unknown, finish_reason: unknown) => ({ id: 'test', object: 'chat.completion.chunk', choices: [{ index: 0, delta, finish_reason }] });
    res.end('data: ' + JSON.stringify(chunk({ content }, null)) + '\n\ndata: ' + JSON.stringify(chunk({}, finish)) + '\n\ndata: [DONE]\n\n');
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const runtime = new NativeRuntime(path.join(root, 'data'), path.join(root, 'resources'), { isEncryptionAvailable: () => true, encryptString: Buffer.from, decryptString: b => b.toString() });
  t.after(async () => { await runtime.close(); server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); await rm(root, { recursive: true, force: true }); });
  await runtime.initialize(configSchema.parse({ model: { providerID: 'p', model: 'm' }, providers: { p: { settings: { baseURL: `http://127.0.0.1:${(server.address() as any).port}/v1`, apiKey: 'synthetic' }, models: { m: { modelID: 'Qwen-test', limit: { context: 32768, output: 4096 } } } } } }));
  await runtime.authorizeProject(project); const connection = await runtime.connection([cli]);
  const headers = { Authorization: 'Basic ' + Buffer.from('opencode:' + connection.password).toString('base64'), 'Content-Type': 'application/json' };
  const api = async (route: string, body?: unknown) => {
    const response = await fetch(connection.url + route, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await response.text(); assert.ok(response.ok, text); return text ? JSON.parse(text) : undefined;
  };
  const created = await api('/api/session', { title: 'Compaction regression', location: { directory: project }, model: { providerID: 'p', id: 'm' } });
  const route = '/api/session/' + created.data.id;
  await api(route + '/prompt', { text: 'Keep the compiler version; tests remain pending.' });
  const waitFor = async (predicate: (data: any) => boolean) => {
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) { const data = await api(route + '/message?limit=100'); if (predicate(data)) return data; await new Promise(r => setTimeout(r, 100)); }
    assert.fail('Engine did not reach the expected state');
  };
  await waitFor(data => JSON.stringify(data).includes('Conversation ready.'));
  await api(route + '/compact', {});
  const data = await waitFor(data => data.data.some((m: any) => m.type === 'compaction' && ['completed', 'failed'].includes(m.status)));
  const compact = data.data.find((m: any) => m.type === 'compaction');
  assert.equal(compact.status, 'completed', JSON.stringify({ compact, summaryCalls, calls: calls.map(c => ({ tools: c.tools?.length, choice: c.tool_choice, last: c.messages?.slice(-2).map((m: any) => ({ role: m.role, type: typeof m.content, text: JSON.stringify(m.content).slice(0, 260) })) })) })); assert.equal(summaryCalls, 2);
  assert.match(JSON.stringify(compact), /Keep the compiler/); assert.ok(!JSON.stringify(data).includes('TRUNCATED_DRAFT_NEVER_COMMIT'));
  assert.ok(calls.filter(c => c.tool_choice === 'none').every(c => !c.tools && c.reasoning_effort === 'none'));
});
