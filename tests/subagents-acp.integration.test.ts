import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { NativeRuntime } from "../distribution/native-control";
import { AgentOwner } from "../distribution/ned/owner";
import { configSchema } from "../src/shared/contracts";
const engine =
  process.env.NED_TEST_ENGINE ??
  path.resolve(
    ".cache/opencode/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode",
  );
const resources = process.env.NED_TEST_RESOURCES,
  bridge = resources
    ? path.join(resources, "ned/agent.cjs")
    : path.resolve(".cache/ned/app/agent.cjs");
test(
  "a child finishing after the ACP prompt ends still delivers the parent integration answer to the editor exactly once",
  { skip: !existsSync(engine) || !existsSync(bridge), timeout: 30000 },
  async (t) => {
    const root = await mkdtemp(path.join(tmpdir(), "ned-subagent-acp-")),
      project = path.join(root, "project");
    await mkdir(project);
    await writeFile(path.join(project, "a.txt"), "input");
    let spawned = false,
      integrated = false;
    let releaseChild!: () => void;
    const childGate = new Promise<void>((r) => (releaseChild = r));
    t.after(() => releaseChild());
    const model = createServer(async (req, res) => {
      let raw = "";
      for await (const b of req) raw += b;
      const body = JSON.parse(raw),
        all = JSON.stringify(body.messages),
        child = all.includes("You are a Ned child agent");
      if (!body.stream || !body.tools?.length) {
        res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(
            JSON.stringify({
              choices: [
                {
                  message: { role: "assistant", content: "제목" },
                  finish_reason: "stop",
                },
              ],
            }),
          );
        return;
      }
      let delta: any = {
          role: "assistant",
          content: child ? "CHILD_UI_RESULT" : "PARENT_UI_WAITING",
        },
        finish = "stop";
      if (child) await childGate;
      else if (!spawned) {
        spawned = true;
        delta = {
          role: "assistant",
          tool_calls: [
            {
              index: 0,
              id: "spawn_ui",
              type: "function",
              function: {
                name: "ned_host_spawn_subagent",
                arguments: JSON.stringify({
                  role: "research",
                  title: "늦은 조사",
                  prompt: "Investigate the current code and report findings",
                  writePaths: [],
                }),
              },
            },
          ],
        };
        finish = "tool_calls";
      } else if (all.includes("CHILD_UI_RESULT")) {
        integrated = true;
        delta.content = "PARENT_UI_CONFIRMED";
      }
      const chunk = (d: any, f: any) =>
        JSON.stringify({
          id: "x",
          object: "chat.completion.chunk",
          created: 1,
          model: body.model,
          choices: [{ index: 0, delta: d, finish_reason: f }],
        });
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      res.end(
        "data: " +
          chunk(delta, null) +
          "\n\ndata: " +
          chunk({}, finish) +
          "\n\ndata: [DONE]\n\n",
      );
    });
    await new Promise<void>((r) => model.listen(0, "127.0.0.1", r));
    const runtime = new NativeRuntime(
      path.join(root, "data"),
      resources ?? path.join(root, "resources"),
      {
        isEncryptionAvailable: () => true,
        encryptString: Buffer.from,
        decryptString: (b) => b.toString(),
      },
    );
    let owner: AgentOwner | undefined,
      agent: ReturnType<typeof spawn> | undefined;
    t.after(async () => {
      agent?.kill();
      await owner?.close();
      await runtime.close();
      model.closeAllConnections();
      await new Promise<void>((r) => model.close(() => r()));
      await rm(root, { recursive: true, force: true });
    });
    await runtime.initialize(
      configSchema.parse({
        model: {
          baseUrl: "http://127.0.0.1:" + (model.address() as any).port + "/v1",
          apiKey: "synthetic",
          id: "test",
        },
      }),
    );
    await runtime.authorizeProject(project);
    const connection = await runtime.connection([engine]);
    owner = new AgentOwner(
      path.join(root, "owner"),
      runtime,
      connection,
      async () => true,
    );
    const descriptor = await owner.start();
    agent = spawn(process.execPath, [bridge, descriptor], {
      stdio: "pipe",
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    });
    let serial = 0;
    const pending = new Map<
        number,
        { resolve: (v: any) => void; reject: (e: Error) => void }
      >(),
      updates: any[] = [];
    const rpc = (method: string, params: any) =>
      new Promise<any>((resolve, reject) => {
        const id = ++serial;
        pending.set(id, { resolve, reject });
        agent!.stdin!.write(
          JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
        );
      });
    agent.stderr!.on("data", () => {});
    agent.once("exit", () => {
      for (const p of pending.values()) p.reject(Error("ACP exited"));
    });
    createInterface({ input: agent.stdout! }).on("line", (line) => {
      const m = JSON.parse(line);
      if (m.method) updates.push(m);
      else {
        const p = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) p?.reject(Error(JSON.stringify(m.error)));
        else p?.resolve(m.result);
      }
    });
    await rpc("initialize", {
      protocolVersion: 1,
      clientCapabilities: {},
      clientInfo: { name: "ned-fixture", version: "1" },
    });
    const session = await rpc("session/new", { cwd: project, mcpServers: [] });
    await rpc("session/prompt", {
      sessionId: session.sessionId,
      prompt: [
        { type: "text", text: "Delegate research, then integrate the result." },
      ],
    });
    assert.equal(
      integrated,
      false,
      "the initial ACP prompt must end before releasing the child",
    );
    releaseChild();
    const end = Date.now() + 6000;
    const text = () =>
      updates
        .filter(
          (m) =>
            m.method === "session/update" &&
            m.params.sessionId === session.sessionId &&
            m.params.update.sessionUpdate === "agent_message_chunk",
        )
        .map((m) => m.params.update.content.text)
        .join("");
    while (!text().includes("PARENT_UI_CONFIRMED") && Date.now() < end)
      await new Promise((r) => setTimeout(r, 30));
    assert.ok(integrated, "the engine parent should integrate the result");
    assert.equal(
      text().split("PARENT_UI_CONFIRMED").length - 1,
      1,
      "the editor must receive the late parent answer once",
    );
  },
);
