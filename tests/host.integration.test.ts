import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { Host } from "../src/main/host";
import { ConfigVault } from "../src/main/config";
import type { AppState } from "../src/shared/contracts";
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
test(
  "real engine repetition stops; manual replay stays in the same session without tools",
  { skip: !existsSync("vendor/runtime/linux-x64/opencode"), timeout: 90000 },
  async (t) => {
    const root = await mkdtemp(path.join(tmpdir(), "l-vibe-host-"));
    let cleanupHost: Host | undefined;
    let cleanupModel: ReturnType<typeof createServer> | undefined;
    t.after(async () => {
      try {
        await cleanupHost?.close();
      } finally {
        cleanupModel?.closeAllConnections();
        if (cleanupModel?.listening)
          await new Promise<void>((resolve) => cleanupModel!.close(() => resolve()));
        await rm(root, { recursive: true, force: true });
      }
    });
    const project = path.join(root, "project");
    await mkdir(project);
    await writeFile(path.join(project, "main.c"), "unchanged");
    const requests: any[] = [];
    let replays = 0;
    const model = createServer(async (req, res) => {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw);
      requests.push(body);
      if (body.tool_choice === "none") {
        replays++;
        res.writeHead(200, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: "assistant",
                  content:
                    "확인된 도구 실행은 없습니다. 요청한 작업은 아직 완료되지 않았습니다.",
                },
              },
            ],
          }),
        );
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });
      const content = "계속해서 같은 설명이 반복되는 문장입니다.".repeat(4);
      res.write(
        `data: ${JSON.stringify({ id: "loop", object: "chat.completion.chunk", created: 1, model: "test", choices: [{ index: 0, delta: { role: "assistant", content }, finish_reason: null }] })}\n\n`,
      );
      // Intentionally keep generation open so stop must abort an actual in-flight request.
    });
    cleanupModel = model;
    await new Promise<void>((resolve) => model.listen(0, "127.0.0.1", resolve));
    const address = model.address();
    assert.ok(address && typeof address !== "string");
    // Test double for the Electron-only DPAPI boundary; real encryption is covered separately.
    const vault = new ConfigVault(path.join(root, "data"), {
      isEncryptionAvailable: () => true,
      encryptString: (x) => Buffer.from(x).reverse(),
      decryptString: (x) => Buffer.from(x).reverse().toString(),
    });
    await vault.importText(
      JSON.stringify({
        schemaVersion: 1,
        model: {
          baseUrl: `http://127.0.0.1:${address.port}/v1`,
          apiKey: "synthetic-host-secret",
          id: "test",
        },
      }),
      false,
    );
    let state: AppState | undefined;
    const host = new Host({
      data: path.join(root, "data"),
      runtime: path.resolve("vendor/runtime"),
      methodologies: path.resolve("vendor/sources"),
      vault,
      chooseProject: async () => project,
      chooseConfig: async () => undefined,
      changed: (s) => {
        state = s;
      },
    });
    cleanupHost = host;
    await host.initialize();
    assert.equal((await host.handle({ action: "openProject" })).ok, true);
    const sessionId = host.state().activeSessionId;
    assert.equal(
      (
        await host.handle({
          action: "send",
          text: "반복하지 말고 작업 내용을 설명해줘.",
        })
      ).ok,
      true,
    );
    const deadline = Date.now() + 45000;
    while (state?.phase !== "stopped" && Date.now() < deadline)
      await pause(100);
    assert.equal(state?.phase, "stopped", state?.notice);
    assert.match(state?.notice ?? "", /반복/);
    assert.equal(replays, 0, "replay must never start automatically");
    assert.equal((await host.handle({ action: "replay" })).ok, true);
    while (host.state().phase === "replaying" && Date.now() < deadline)
      await pause(50);
    assert.equal(state?.phase, "stopped");
    assert.equal(host.state().activeSessionId, sessionId);
    assert.equal(replays, 1);
    assert.equal(state?.sessions[0].messages.at(-1)?.replay, true);
    assert.equal(state?.sessions[0].tools.length, 0);
    assert.equal(
      await readFile(path.join(project, "main.c"), "utf8"),
      "unchanged",
    );
    assert.equal(
      "tools" in requests.find((r) => r.tool_choice === "none"),
      false,
    );
    assert.equal(
      JSON.stringify(state).includes("synthetic-host-secret"),
      false,
    );
  },
);
test("malformed history is preserved and cannot be overwritten by new work", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "l-vibe-corrupt-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const original = '{"schemaVersion":1,"projects":[],"sessions":[null]}';
  await writeFile(path.join(root, "history.json"), original);
  const vault = new ConfigVault(root, {
    isEncryptionAvailable: () => false,
    encryptString: () => Buffer.alloc(0),
    decryptString: () => "",
  });
  const host = new Host({
    data: root,
    runtime: "",
    methodologies: "",
    vault,
    chooseProject: async () => root,
    chooseConfig: async () => undefined,
    changed: () => {},
  });
  await host.initialize();
  assert.deepEqual(host.state().sessions, []);
  assert.equal((await host.handle({ action: "openProject" })).ok, false);
  await host.close();
  assert.equal(
    await readFile(path.join(root, "history.json"), "utf8"),
    original,
  );
});
