import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { ModelGateway } from "../src/main/model-gateway";
test("model gateway allows only the configured model and endpoint and refuses redirects", async (t) => {
  let calls = 0;
  let redirect = false;
  let authorization = "";
  const upstream = createServer(async (req, res) => {
    calls++;
    authorization = req.headers.authorization ?? "";
    assert.equal(req.url, "/intranet/v1/chat/completions");
    for await (const _chunk of req) {
      /* consume body */
    }
    if (redirect) {
      res.writeHead(302, { Location: "https://example.invalid/stolen" }).end();
      return;
    }
    res
      .writeHead(200, { "Content-Type": "application/json" })
      .end('{"choices":[{"message":{"content":"ok"}}]}');
  });
  await new Promise<void>((resolve) =>
    upstream.listen(0, "127.0.0.1", resolve),
  );
  const address = upstream.address();
  assert.ok(address && typeof address !== "string");
  t.after(() => {
    upstream.closeAllConnections();
    upstream.close();
  });
  const gateway = new ModelGateway({
    schemaVersion: 1,
    model: {
      baseUrl: `http://127.0.0.1:${address.port}/intranet/v1`,
      apiKey: "test-key-only-in-host",
      id: "allowed-id",
    },
  });
  await gateway.start();
  t.after(() => gateway.close());
  const post = (route: string, model = "allowed-id", token = gateway.token) =>
    fetch(gateway.baseUrl + route, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ model, messages: [] }),
    });
  assert.equal(
    (await post("/chat/completions", "allowed-id", "wrong-token")).status,
    401,
  );
  assert.equal((await post("/models")).status, 403);
  assert.equal((await post("/chat/completions", "other-model")).status, 403);
  assert.equal(calls, 0);
  assert.equal((await post("/chat/completions")).status, 200);
  assert.equal(authorization, "Bearer test-key-only-in-host");
  redirect = true;
  assert.equal((await post("/chat/completions")).status, 502);
  assert.equal(calls, 2);
});

async function transportFixture(t: any, handler: import('node:http').RequestListener, options: import('../src/main/model-gateway').ModelTransport = {}) {
  const failures: import('../src/main/model-gateway').ModelFailure[] = [];
  const upstream = createServer(handler);
  await new Promise<void>(r => upstream.listen(0, '127.0.0.1', r));
  t.after(() => { upstream.closeAllConnections(); upstream.close(); });
  const gateway = new ModelGateway({ schemaVersion: 2, model: { baseUrl: `http://127.0.0.1:${(upstream.address() as any).port}/v1`, apiKey: 'never-log-this-secret', id: 'test' } }, options, event => failures.push(event));
  await gateway.start(); t.after(() => gateway.close());
  return { gateway, failures, post: (extra = {}) => fetch(gateway.baseUrl + '/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + gateway.token }, body: JSON.stringify({ model: 'test', messages: [], ...extra }) }) };
}

test('gateway header and total deadlines return structured errors without resetting the client', async t => {
  for (const [options, code] of [ [{ headerTimeout: 60, timeout: false }, 'LV_MODEL_HEADER_TIMEOUT'], [{ headerTimeout: false, timeout: 60 }, 'LV_MODEL_TOTAL_TIMEOUT'] ] as const) {
    const { post, failures } = await transportFixture(t, async req => { for await (const _ of req) {} }, options);
    const result = await post(); assert.equal(result.status, 504);
    assert.equal((await result.json()).error.code, code);
    assert.equal(failures.length, 1); assert.equal(failures[0].phase, 'headers');
    assert.ok(!JSON.stringify(failures).includes('never-log-this-secret'));
  }
});

test('gateway buffers incomplete JSON and reports an upstream reset as a complete error document', async t => {
  const { post, failures } = await transportFixture(t, async (req, res) => {
    for await (const _ of req) {}
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.write('{"choices":[');
    setTimeout(() => res.destroy(), 30);
  });
  const result = await post(); assert.equal(result.status, 502);
  assert.equal((await result.json()).error.code, 'LV_MODEL_UPSTREAM_RESET');
  assert.equal(failures.length, 1);
});

test('gateway streaming reset and idle timeout are explicit SSE errors, never a success marker', async t => {
  for (const reset of [true, false]) {
    const { post, failures } = await transportFixture(t, async (req, res) => {
      for await (const _ of req) {}
      res.writeHead(200, { 'Content-Type': 'text/event-stream' }); res.write('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n');
      if (reset) setTimeout(() => res.destroy(), 30);
    }, { chunkTimeout: 60 });
    const response = await post(); const text = await response.text();
    assert.ok(text.includes('partial'));
    assert.ok(text.includes(reset ? 'LV_MODEL_UPSTREAM_RESET' : 'LV_MODEL_CHUNK_TIMEOUT'), text);
    assert.ok(!text.includes('[DONE]')); assert.equal(failures.length, 1);
  }
});

test('gateway accepts compaction-sized input above the former 4 MiB cap and cancellation reaches upstream', async t => {
  let received = 0, stopped!: () => void;
  const disconnected = new Promise<void>(r => { stopped = r; });
  const { gateway, post, failures } = await transportFixture(t, async (req, res) => {
    for await (const chunk of req) received += chunk.length;
    res.writeHead(200, { 'Content-Type': 'text/event-stream' }); res.write('data: {"choices":[]}\n\n');
    res.once('close', stopped);
  });
  const response = await post({ messages: [{ role: 'user', content: 'x'.repeat(5 * 1024 * 1024) }] });
  assert.ok(received > 4 * 1024 * 1024);
  await gateway.close();
  await Promise.race([disconnected, new Promise((_, reject) => setTimeout(() => reject(new Error('Upstream did not stop')), 1500).unref())]);
  await assert.rejects(response.text()); assert.equal(failures.length, 0);
});
