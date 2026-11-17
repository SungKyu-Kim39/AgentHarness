import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Subagents } from "../distribution/subagents";
async function fixture(t: any) {
  const root = await mkdtemp(path.join(tmpdir(), "ned-subagent-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, "project"),
    sessions = new Map<string, any>([
      [
        "root",
        {
          id: "root",
          location: { directory: project },
          agent: "build",
          model: { providerID: "p", id: "m" },
        },
      ],
    ]),
    notifications: any[] = [],
    created: any[] = [], prompts: any[] = [],
    pending = new Map<string, Array<() => void>>();
  let request = "msg_request",
    stopFails = false;
  const api = async (
    route: string,
    body?: any,
    signal?: AbortSignal,
  ): Promise<any> => {
    signal?.throwIfAborted();
    if (route === "/api/session") {
      const info = {
        ...body,
        location: { directory: project },
        running: false,
      };
      sessions.set(body.id, info);
      created.push(body);
      return { data: info };
    }
    const id = route.match(/\/session\/([^/?]+)/)?.[1];
    if (!id || !sessions.has(id))
      throw Object.assign(Error("missing"), { status: 404 });
    const info = sessions.get(id);
    if (route.endsWith("/prompt")) {
      prompts.push(body);
      info.running = true;
      return { data: { id: "msg_child" } };
    }
    if (route.endsWith("/synthetic")) {
      notifications.push(body);
      return {};
    }
    if (route.endsWith("/interrupt")) {
      if (stopFails) throw Error("stop not confirmed");
      info.running = false;
      for (const r of pending.get(id) ?? []) r();
      return {};
    }
    if (route.endsWith("/wait")) {
      if (!info.running) return;
      await new Promise<void>((resolve, reject) => {
        const r = () => {
          signal?.removeEventListener("abort", abort);
          resolve();
        };
        const abort = () => reject(Error("aborted"));
        signal?.addEventListener("abort", abort, { once: true });
        pending.set(id, [...(pending.get(id) ?? []), r]);
      });
      return;
    }
    if (route.includes("/message?"))
      return {
        data: info.result
          ? [
              {
                type: "assistant",
                time: { completed: 1 },
                content: [{ type: "text", text: info.result }],
              },
            ]
          : [],
      };
    return { data: info };
  };
  const agents = new Subagents(
    root,
    api,
    async (id) => {
      if (!sessions.has(id)) throw Error("unknown");
      return sessions.get(id).location.directory;
    },
    async () => request,
  );
  await agents.load();
  await agents.recover();
  t.after(() => agents.close().catch(() => {}));
  const wait = async (p: () => boolean) => {
    const end = Date.now() + 3000;
    while (!p()) {
      assert.ok(Date.now() < end, "fixture progress");
      await new Promise((r) => setTimeout(r, 5));
    }
  };
  return {
    agents,
    root,
    project,
    sessions,
    created,
    prompts,
    notifications,
    api,
    wait,
    setRequest: (s: string) => (request = s),
    failStop: (v: boolean) => (stopFails = v),
    complete: (id: string, text: string) => {
      const s = sessions.get(id);
      s.result = text;
      s.running = false;
      for (const r of pending.get(id) ?? []) r();
    },
  };
}
test("two host-owned child requests run, further work queues, write ownership and parent request stay bound, and results return automatically", async (t) => {
  const f = await fixture(t);
  const [a, b] = await Promise.all([
    f.agents.spawn("root", {
      role: "research",
      title: "조사",
      prompt: "Read the module",
      writePaths: [],
    }),
    f.agents.spawn("root", {
      role: "worker",
      title: "구현",
      prompt: "Update a",
      writePaths: ["a.ts"],
    }),
  ]);
  const c = await f.agents.spawn("root", {
    role: "worker",
    title: "다음 구현",
    prompt: "Update b",
    writePaths: ["b.ts"],
  });
  await f.wait(
    () =>
      f.created.length === 2 &&
      f.sessions.get(a.id)?.running &&
      f.sessions.get(b.id)?.running,
  );
  assert.equal(c.state, "queued");
  assert.ok(
    f.created.every((x) => x.parentID === "root" && x.model.id === "m"),
  );
  assert.equal((await f.agents.scope(a.id, "read_file", {})).session, "root");
  await assert.rejects(
    f.agents.scope(a.id, "propose_edit", { path: "a.ts" }),
    /권한/,
  );
  await assert.rejects(f.agents.scope(b.id, "spawn_subagent", {}), /권한/);
  await assert.rejects(
    f.agents.scope(b.id, "propose_edit", { path: "b.ts" }),
    /할당/,
  );
  await assert.rejects(
    f.agents.scope("root", "propose_edit", { path: "a.ts" }),
    /수정 중/,
  );
  await assert.rejects(
    f.agents.spawn("root", {
      role: "worker",
      title: "충돌",
      prompt: "duplicate",
      writePaths: ["a.ts"],
    }),
    /겹칩니다/,
  );
  f.complete(a.id, "정의·참조 조사 결과");
  await f.wait(() => f.created.length === 3 && f.sessions.get(c.id)?.running);
  assert.equal(f.notifications.length, 1);
  assert.equal(f.notifications[0].metadata.childID, a.id);
  f.complete(b.id, "a.ts 수정 완료");
  f.complete(c.id, "b.ts 수정 완료");
  await f.wait(() => f.notifications.length === 3);
  const list = await f.agents.status("root");
  assert.ok(list.every((x) => x.state === "completed"));
  assert.ok(!("result" in list[1]));
  assert.match((await f.agents.status("root", b.id))[0].result!, /수정 완료/);
  assert.equal(
    (await f.agents.scope("root", "propose_edit", { path: "a.ts" })).session,
    "root",
  );
  assert.ok(
    !(await readFile(path.join(f.root, "subagents.json"), "utf8")).includes(
      "Read the module",
    ),
    "queue prompts are not duplicated into receipts",
  );
});
test("parent stop cancels queued and running work, prevents late completion wakeups, and an unconfirmed stop blocks new work until retry", async (t) => {
  const f = await fixture(t),
    a = await f.agents.spawn("root", {
      role: "research",
      title: "대기",
      prompt: "Wait",
      writePaths: [],
    });
  await f.wait(() => f.sessions.get(a.id)?.running);
  f.failStop(true);
  await assert.rejects(f.agents.stopParent("root"), /중지를 확인/);
  await assert.rejects(
    f.agents.spawn("root", {
      role: "research",
      title: "새 작업",
      prompt: "Read",
      writePaths: [],
    }),
    /중지/,
  );
  assert.equal((await f.agents.status("root", a.id))[0].state, "unconfirmed");
  f.failStop(false);
  await f.agents.stopParent("root");
  assert.equal((await f.agents.status("root", a.id))[0].state, "stopped");
  assert.equal(f.notifications.length, 0);
  const b = await f.agents.spawn("root", {
    role: "worker",
    title: "요청 고정",
    prompt: "Edit",
    writePaths: ["a.ts"],
  });
  await f.wait(() => f.sessions.get(b.id)?.running);
  f.setRequest("msg_next");
  await assert.rejects(
    f.agents.scope(b.id, "propose_edit", { path: "a.ts" }),
    /부모 요청/,
  );
  await f.agents.stopParent("root");
  await assert.rejects(f.agents.status("another", b.id), /소유/);
});
test("restored in-flight receipts cannot execute tools and recovery verifies actual engine ownership before interrupting", async (t) => {
  const f = await fixture(t),
    id = "ses_ned_previous";
  f.sessions.set(id, {
    id,
    parentID: "root",
    agent: "ned-research",
    location: { directory: f.project },
    running: true,
  });
  await writeFile(
    path.join(f.root, "subagents.json"),
    JSON.stringify({
      schemaVersion: 1,
      jobs: [
        {
          id,
          parent: "root",
          request: "msg_old",
          project: f.project,
          role: "research",
          title: "이전 작업",
          writes: [],
          state: "running",
          createdAt: 1,
        },
      ],
    }),
  );
  const restored = new Subagents(
    f.root,
    f.api,
    async () => f.project,
    async () => "msg_old",
  );
  await restored.load();
  await assert.rejects(restored.scope(id, "read_file", {}), /준비|중지/);
  await restored.recover();
  assert.equal((await restored.status("root", id))[0].state, "stopped");
  await restored.close();
  await writeFile(path.join(f.root, "subagents.json"), "{broken");
  const bad = new Subagents(
    f.root,
    f.api,
    async () => f.project,
    async () => "msg_old",
  );
  await assert.rejects(bad.load());
  assert.equal(
    await readFile(path.join(f.root, "subagents.json"), "utf8"),
    "{broken",
  );
});

test("stopping during admission rejects the old request, and long child results are paged without bloating task lists", async (t) => {
  const f = await fixture(t);
  let release!: () => void, entered!: () => void;
  const gate = new Promise<void>((r) => (release = r)),
    started = new Promise<void>((r) => (entered = r));
  const manager = new Subagents(
    path.join(f.root, "race"),
    f.api,
    async () => {
      entered();
      await gate;
      return f.project;
    },
    async () => "msg_request",
  );
  await manager.recover();
  const admission = manager.spawn("root", {
    role: "research",
    title: "입장 중지",
    prompt: "Read",
    writePaths: [],
  });
  const rejected = assert.rejects(admission, /중지/);
  await started;
  await manager.stopParent("root");
  release();
  await rejected;
  assert.equal(f.created.length, 0);
  await manager.close();
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    f.agents.spawn(
      "root",
      { role: "research", title: "취소됨", prompt: "Read", writePaths: [] },
      abort.signal,
    ),
    /중지/,
  );
  const a = await f.agents.spawn("root", {
    role: "research",
    title: "긴 결과",
    prompt: "Read",
    writePaths: [],
  });
  await f.wait(() => f.sessions.get(a.id)?.running);
  const text = "한".repeat(65000);
  f.complete(a.id, text);
  await f.wait(() => f.notifications.length === 1);
  const first = (await f.agents.status("root", a.id))[0];
  assert.equal(first.result?.length, 32000);
  assert.equal(first.nextOffset, 32000);
  assert.equal(first.totalCharacters, 65000);
  assert.equal(
    (await f.agents.status("root", a.id, 0, 64000))[0].result?.length,
    1000,
  );
  assert.ok(!("result" in (await f.agents.status("root"))[0]));
});

test('Goldfish gets a fresh reviewer request and host refuses memory, edits, secret files and non-EGM skills',async t=>{
 const f=await fixture(t);
 await assert.rejects(f.agents.spawn('root',{role:'goldfish',reviewer:'unknown',title:'review',prompt:'target',writePaths:[]}),/검토자/);
 await assert.rejects(f.agents.spawn('root',{role:'goldfish',reviewer:'structural',title:'review',prompt:'target',writePaths:['a.ts']}),/읽기 전용/);
 const job=await f.agents.spawn('root',{role:'goldfish',reviewer:'structural',title:'구조 검토',prompt:'Review only src/a.ts with the provided design.',writePaths:[]});
 await f.wait(()=>f.sessions.get(job.id)?.running);
 assert.equal(f.created[0].agent,'ned-goldfish');assert.equal(f.created[0].messages,undefined);
 assert.match(f.prompts[0].text,/references\/bundle\/agents\/structural.md/);
 assert.equal((await f.agents.scope(job.id,'read_file',{path:'src/a.ts'})).session,'root');
 assert.equal((await f.agents.scope(job.id,'read_skill',{id:'egm-review-loop'})).session,'root');
 for(const tool of ['propose_edit','delete_file','knowledge_search','personal_knowledge_search','spawn_subagent','build_project'])await assert.rejects(f.agents.scope(job.id,tool,{path:'src/a.ts'}),/Goldfish/);
 await assert.rejects(f.agents.scope(job.id,'read_skill',{id:'session-handoff'}),/EGM/);
 for(const file of ['.env','sub/AGENTS.md','CLAUDE.md'])await assert.rejects(f.agents.scope(job.id,'read_file',{path:file}),/Goldfish/);
 f.complete(job.id,'Required reads completed; no structural findings.');await f.wait(()=>f.notifications.length===1);
});
