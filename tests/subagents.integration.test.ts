import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NativeRuntime } from "../distribution/native-control";
import { configSchema } from "../src/shared/contracts";
const engine =
  process.env.NED_TEST_ENGINE ??
  path.resolve(
    ".cache/opencode/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode",
  );
test(
  "real Ned engine delegates research and edits to two controlled children, returns results, and stops a silent queued child",
  { skip: !existsSync(engine), timeout: 120000 },
  async (t) => {
    const root = await mkdtemp(path.join(tmpdir(), "ned-real-subagents-")),
      project = path.join(root, "project");
    await mkdir(project);
    await writeFile(path.join(project, "main.c"), "int main() { return 0; }\n");
    t.after(() => rm(root, { recursive: true, force: true }));
    let parentSpawned = false,
      queueChild = false,
      childQueued!: () => void;
    const pending = new Promise<void>((r) => (childQueued = r));
    let childDisconnected!: () => void;
    const disconnected = new Promise<void>((r) => (childDisconnected = r));
    const calls: any[] = [];
    const stages = new Map<string, number>();
    const model = createServer(async (req, res) => {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw),
        all = JSON.stringify(body.messages),
        child = all.includes("You are a Ned child agent"),
        worker = child && all.includes("WORKER_MARKER"),
        key = child ? (worker ? "worker" : "research") : "parent";
      calls.push({ body, key });
      const names = (body.tools ?? []).map((x: any) => x.function.name);
      if (!body.stream || !body.tools?.length) {
        res.writeHead(200, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            id: "meta",
            choices: [
              {
                message: { role: "assistant", content: "제목" },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 3,
              completion_tokens: 2,
              total_tokens: 5,
            },
          }),
        );
        return;
      }
      if (child && queueChild) {
        childQueued();
        res.once("close", childDisconnected);
        return;
      }
      let delta: any = {
          role: "assistant",
          content: child
            ? worker
              ? "WORKER_RESULT_CONFIRMED"
              : "RESEARCH_RESULT_CONFIRMED"
            : "PARENT_WAITING_FOR_RESULTS",
        },
        finish = "stop";
      const invoke = (items: Array<[string, any]>) => {
        delta = {
          role: "assistant",
          tool_calls: items.map(([name, args], index) => ({
            index,
            id: "call_" + key + "_" + (stages.get(key) ?? 0) + "_" + index,
            type: "function",
            function: { name, arguments: JSON.stringify(args) },
          })),
        };
        finish = "tool_calls";
      };
      if (!child && !parentSpawned) {
        parentSpawned = true;
        assert.ok(names.includes("ned_host_spawn_subagent"));
        invoke([
          [
            "ned_host_spawn_subagent",
            {
              role: "research",
              title: "함수 조사",
              prompt:
                "RESEARCH_MARKER: read main.c and report the existing behavior.",
            },
          ],
          [
            "ned_host_spawn_subagent",
            {
              role: "worker",
              title: "함수 구현",
              prompt:
                "WORKER_MARKER: read main.c then change return 0 to return 7.",
              writePaths: ["main.c"],
            },
          ],
        ]);
      } else if (child) {
        const stage = stages.get(key) ?? 0;
        assert.ok(!names.includes("ned_host_spawn_subagent"));
        if (!worker) assert.ok(!names.includes("ned_host_propose_edit"));
        if (stage === 0) invoke([["ned_host_read_file", { path: "main.c" }]]);
        else if (worker && stage === 1)
          invoke([
            [
              "ned_host_propose_edit",
              { path: "main.c", content: "int main() { return 7; }\n" },
            ],
          ]);
        stages.set(key, stage + 1);
      } else if (
        all.includes("RESEARCH_RESULT_CONFIRMED") &&
        all.includes("WORKER_RESULT_CONFIRMED")
      )
        delta.content = "PARENT_INTEGRATED_CONFIRMED";
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      const chunk = (d: any, f: any) =>
        JSON.stringify({
          id: "completion",
          object: "chat.completion.chunk",
          created: 1,
          model: body.model,
          choices: [{ index: 0, delta: d, finish_reason: f }],
        });
      res.end(
        "data: " +
          chunk(delta, null) +
          "\n\ndata: " +
          chunk({}, finish) +
          "\n\ndata: [DONE]\n\n",
      );
    });
    await new Promise<void>((r) => model.listen(0, "127.0.0.1", r));
    t.after(() => {
      model.closeAllConnections();
      model.close();
    });
    const url = "http://127.0.0.1:" + (model.address() as any).port + "/v1",
      config = configSchema.parse({
        model: {
          baseUrl: url,
          apiKey: "synthetic-subagents",
          id: "test-model",
        },
      });
    let approvals = 0,
      editorChecks: string[] = [];
    const runtime = new NativeRuntime(
      path.join(root, "data"),
      process.env.NED_TEST_RESOURCES ?? path.join(root, "resources"),
      {
        isEncryptionAvailable: () => true,
        encryptString: Buffer.from,
        decryptString: (b) => b.toString(),
      },
      async () => {
        approvals++;
        return true;
      },
    );
    t.after(() => runtime.close());
    runtime.setEditorCheck(async (session) => {
      editorChecks.push(session);
    });
    await runtime.initialize(config);
    await runtime.authorizeProject(project);
    const connection = await runtime.connection([engine]);
    const headers = {
      Authorization:
        "Basic " +
        Buffer.from("opencode:" + connection.password).toString("base64"),
      "Content-Type": "application/json",
    };
    const api = async (route: string, body?: unknown) => {
      const r = await fetch(connection.url + route, {
        method: body === undefined ? "GET" : "POST",
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const txt = await r.text();
      assert.ok(r.ok, r.status + ": " + txt);
      return txt ? JSON.parse(txt) : undefined;
    };
    const created = await api("/api/session", {
        title: "Parent delegation",
        location: { directory: project },
      }),
      id = created.data.id;
    await api("/api/session/" + id + "/prompt", {
      text: "Delegate independent research and implementation tasks, then integrate their confirmed results.",
    });
    const wait = async (check: () => Promise<boolean>, label: string) => {
      const end = Date.now() + 60000;
      while (!(await check())) {
        assert.ok(
          Date.now() < end,
          label +
            "\n" +
            JSON.stringify(
              calls.map((c) => ({
                key: c.key,
                tools: c.body.tools?.map((t: any) => t.function.name),
              })),
            ),
        );
        await new Promise((r) => setTimeout(r, 100));
      }
    };
    await wait(
      async () =>
        JSON.stringify(
          await api("/api/session/" + id + "/message?limit=100"),
        ).includes("PARENT_INTEGRATED_CONFIRMED"),
      "child results did not reach parent",
    );
    assert.equal(
      await readFile(path.join(project, "main.c"), "utf8"),
      "int main() { return 7; }\n",
    );
    assert.equal(approvals, 1);
    assert.ok(editorChecks.length && editorChecks.every((x) => x === id));
    const children = await api("/api/session?parentID=" + id + "&limit=100");
    assert.equal(children.data.length, 2);
    assert.ok(
      children.data.every(
        (s: any) =>
          s.parentID === id && ["ned-research", "ned-worker"].includes(s.agent),
      ),
    );
    const manager = (runtime as any).subagents;
    queueChild = true;
    const queued = await manager.spawn(id, {
      role: "research",
      title: "사내 대기열",
      prompt: "Research and wait",
      writePaths: [],
    });
    await pending;
    await runtime.interruptSession(id);
    await disconnected;
    assert.equal((await manager.status(id, queued.id))[0].state, "stopped");
    const after = calls.length;
    await new Promise((r) => setTimeout(r, 150));
    assert.equal(
      calls.length,
      after,
      "stopping a child must not wake the cancelled parent",
    );
  },
);
