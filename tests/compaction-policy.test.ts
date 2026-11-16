import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { ModelGateway } from '../src/main/model-gateway';
import { isCompaction, summaryRequest, summaryOutcome, summaryUsage, withSummaryUsage } from '../src/main/compaction-policy';
const instruction = 'You MUST summarize the conversation above into a structured summary that will be given to another agent to resume the work.\n' + 'pinned template and rules '.repeat(80) + '\n## Next Move\n## Relevant Files\nDo not continue the task or call tools.';
const request = { model: 'Qwen-test', stream: true, max_tokens: 4096, reasoning_effort: 'xhigh', chat_template_kwargs: { enable_thinking: true, preserved: 1 }, messages: [{ role: 'user', content: 'Keep the compiler version. Need tests next.' }, { role: 'user', content: instruction }] };
const sse = (text: string, finish = 'stop', tool = false) => 'data: ' + JSON.stringify({ id: 'test', choices: [{ index: 0, delta: tool ? { tool_calls: [{ id: 'bad' }] } : { content: text }, finish_reason: null }] }) + '\n\ndata: ' + JSON.stringify({ id: 'test', choices: [{ index: 0, delta: {}, finish_reason: finish }] }) + '\n\ndata: [DONE]\n\n';
test('summary detection excludes normal work and transcript copies; shaping preserves history and never raises the engine ceiling', () => {
  assert.equal(isCompaction(request), true);
  // The pinned real engine retains ordinary tool definitions in an unchanged
  // transcript. Summary instructions must still remove them before dispatch.
  assert.equal(isCompaction({ ...request, tools: [{ type: 'function' }] }), true);
  assert.equal(isCompaction({ ...request, messages: [...request.messages, { role: 'user', content: 'Continue editing.' }] }), false);
  assert.equal(isCompaction({ ...request, messages: [{ role: 'tool', content: instruction }] }), false);
  const shaped = summaryRequest(request, 8192, false, true);
  assert.equal(shaped.max_tokens, 4096); assert.equal(shaped.reasoning_effort, 'none'); assert.equal(shaped.chat_template_kwargs.preserved, 1);
  assert.deepEqual(shaped.messages[0], request.messages[0]); assert.equal(request.chat_template_kwargs.enable_thinking, true);
  assert.ok(Buffer.byteLength(shaped.messages.at(-1).content) < Buffer.byteLength(instruction));
  assert.equal(shaped.tools, undefined); assert.equal(shaped.tool_choice, 'none');
  assert.equal(summaryOutcome(Buffer.from(sse('partial', 'length')), true), 'length');
  assert.equal(summaryOutcome(Buffer.from(sse('complete')), true), 'complete');
  assert.equal(summaryOutcome(Buffer.from(sse('bad', 'stop', true)), true), 'invalid');
  assert.equal(summaryOutcome(Buffer.from('data: {"choices":[]}\n\n'), true), 'invalid');
  const completion = summaryRequest({ ...request, max_completion_tokens: 2048 }, 8192, false, false);
  assert.equal(completion.max_completion_tokens, 2048); assert.equal(completion.max_tokens, undefined);
});
test('cancelling a silent retry closes its upstream request without another model call', async t => {
  let calls = 0, entered!: () => void, closed!: () => void;
  const ready = new Promise<void>(r => { entered = r; }), stopped = new Promise<void>(r => { closed = r; });
  const upstream = createServer(async (req, res) => {
    for await (const _chunk of req) { /* consume only the synthetic request */ }
    if (++calls === 1) { res.writeHead(200, { 'Content-Type': 'text/event-stream' }).end(sse('truncated', 'length')); return; }
    res.once('close', closed); entered();
  });
  await new Promise<void>(r => upstream.listen(0, '127.0.0.1', r));
  const gateway = new ModelGateway({ schemaVersion: 2, model: { baseUrl: `http://127.0.0.1:${(upstream.address() as any).port}/v1`, id: 'Qwen-test', apiKey: 'synthetic' } });
  await gateway.start(); t.after(async () => { await gateway.close(); upstream.closeAllConnections(); await new Promise<void>(r => upstream.close(() => r())); });
  const abort = new AbortController();
  const pending = fetch(gateway.baseUrl + '/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + gateway.token }, body: JSON.stringify(request), signal: abort.signal });
  await ready; abort.abort(); await assert.rejects(pending); await stopped; assert.equal(calls, 2);
});
test('reported usage from the truncated call is included in final retry accounting', () => {
  const first = { prompt_tokens: 100, completion_tokens: 4096, total_tokens: 4196, completion_tokens_details: { reasoning_tokens: 3000 } };
  const final = Buffer.from('data: ' + JSON.stringify({ choices: [], usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150, completion_tokens_details: { reasoning_tokens: 0 } } }) + '\n\ndata: [DONE]\n\n');
  const result = summaryUsage(withSummaryUsage(final, true, first), true);
  assert.equal(result.prompt_tokens, 200); assert.equal(result.completion_tokens, 4146); assert.equal(result.total_tokens, 4346); assert.equal(result.completion_tokens_details.reasoning_tokens, 3000);
});
async function fixture(t: any, finishes: string[], extra: Record<string, unknown> = {}) {
  const calls: any[] = []; const server = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    calls.push(JSON.parse(raw)); res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const text = sse(calls.length === 1 ? 'INCOMPLETE_PRIVATE_DRAFT' : '## Objective\n보존된 최종 요약', finishes[Math.min(calls.length - 1, finishes.length - 1)]);
    const bytes = Buffer.from(text); res.write(bytes.subarray(0, 83)); res.end(bytes.subarray(83));
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const gateway = new ModelGateway({ schemaVersion: 2, model: { baseUrl: `http://127.0.0.1:${(server.address() as any).port}/v1`, id: 'Qwen-test', apiKey: 'synthetic' }, ...extra } as any);
  await gateway.start(); t.after(async () => { await gateway.close(); server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); });
  const post = (body: unknown, signal?: AbortSignal) => fetch(gateway.baseUrl + '/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + gateway.token }, body: JSON.stringify(body), signal });
  return { calls, post };
}
test('length-truncated summary is retried once without tools; only the completed response reaches the engine', async t => {
  const f = await fixture(t, ['length', 'stop']); const response = await f.post(request); const text = await response.text();
  assert.equal(response.status, 200); assert.equal(f.calls.length, 2); assert.ok(!text.includes('INCOMPLETE_PRIVATE_DRAFT'));
  assert.match(text, /보존된 최종 요약/); assert.ok(f.calls[1].messages.at(-1).content.includes('819 토큰'));
  for (const call of f.calls) { assert.equal(call.tools, undefined); assert.equal(call.tool_choice, 'none'); assert.equal(call.max_tokens, 4096); }
});
test('repeated length failure remains an error; disabling retry never resubmits and ordinary generation is untouched', async t => {
  const f = await fixture(t, ['length']); const response = await f.post(request); const text = await response.text();
  assert.equal(response.status, 422); assert.match(text, /NED_COMPACTION_OUTPUT_LIMIT/); assert.ok(!text.includes('INCOMPLETE_PRIVATE_DRAFT')); assert.equal(f.calls.length, 2);
  const disabled = await fixture(t, ['length'], { compaction: { maxOutputTokens: 2048, retryOnLength: false, disableQwenThinking: false } });
  assert.equal((await disabled.post(request)).status, 422); assert.equal(disabled.calls.length, 1); assert.equal(disabled.calls[0].max_tokens, 2048); assert.equal(disabled.calls[0].reasoning_effort, 'xhigh');
  const ordinary = await fixture(t, ['length']); const normal = { ...request, messages: [{ role: 'user', content: 'Continue editing the source.' }], tools: [{ type: 'function', function: { name: 'read' } }] };
  const reply = await ordinary.post(normal); assert.equal(reply.status, 200); assert.match(await reply.text(), /INCOMPLETE_PRIVATE_DRAFT/);
  assert.equal(ordinary.calls.length, 1); assert.deepEqual(ordinary.calls[0], normal);
});
