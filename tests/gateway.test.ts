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
