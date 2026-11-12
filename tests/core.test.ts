import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  symlink,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import {
  configSchema,
  requestSchema,
  type Session,
} from "../src/shared/contracts";
import { ConfigVault, Redactor, type Cipher } from "../src/main/config";
import { ProjectFiles } from "../src/main/files";
import { Lifecycle } from "../src/main/lifecycle";
import { detectRepetition } from "../src/main/repetition";
import { ToolBroker } from "../src/main/broker";
import { History } from "../src/main/history";
import { replayMessages } from "../src/main/replay";
import { Methodologies } from "../src/main/adapters";
import { existsSync } from "node:fs";
export const config = {
  schemaVersion: 1 as const,
  model: {
    baseUrl: "http://127.0.0.1:3210/v1",
    apiKey: "test-secret-only-not-a-real-key",
    id: "registered-model-id",
  },
};
export function testCipher(): Cipher {
  const key = randomBytes(32);
  return {
    isEncryptionAvailable: () => true,
    encryptString: (value) => {
      const iv = randomBytes(12),
        cipher = createCipheriv("aes-256-gcm", key, iv);
      const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
    },
    decryptString: (value) => {
      const decipher = createDecipheriv(
        "aes-256-gcm",
        key,
        value.subarray(0, 12),
      );
      decipher.setAuthTag(value.subarray(12, 28));
      return Buffer.concat([
        decipher.update(value.subarray(28)),
        decipher.final(),
      ]).toString();
    },
  };
}
async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), "l-vibe-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const session = (): Session => ({
  id: "s1",
  title: "test",
  projectId: "p1",
  at: new Date().toISOString(),
  messages: [],
  tools: [],
  proposals: [],
});
test("configuration requires explicit model ID and API base URL", () => {
  assert.equal(configSchema.safeParse(config).success, true);
  for (const baseUrl of [
    "file:///etc",
    "https://user:pass@server/v1",
    "http://server/v1?key=x",
    "http://server/v1/chat/completions",
    "ftp://server/v1",
  ])
    assert.equal(
      configSchema.safeParse({ ...config, model: { ...config.model, baseUrl } })
        .success,
      false,
      baseUrl,
    );
  assert.equal(
    configSchema.safeParse({ ...config, model: { ...config.model, id: "" } })
      .success,
    false,
  );
});
test("IPC rejects secret fields, unrecognized operations and oversized requests", () => {
  assert.equal(
    requestSchema.safeParse({ action: "send", text: "hi", apiKey: "secret" })
      .success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ action: "exec", command: "whoami" }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ action: "send", text: "x".repeat(32001) })
      .success,
    false,
  );
});
test("first import encrypts config and deletes only staged plaintext", async (t) => {
  const root = await fixture(t),
    cipher = testCipher(),
    vault = new ConfigVault(root, cipher);
  await writeFile(vault.staging, JSON.stringify(config));
  assert.deepEqual(await vault.load(), config);
  assert.equal(
    (await readFile(vault.file, "utf8")).includes(config.model.apiKey),
    false,
  );
  await assert.rejects(readFile(vault.staging));
  assert.deepEqual(await vault.load(), config);
  await assert.rejects(vault.importText(JSON.stringify(config), false));
});
test("damaged or undecryptable settings remain unchanged", async (t) => {
  const root = await fixture(t),
    vault = new ConfigVault(root, testCipher());
  await vault.importText(JSON.stringify(config), false);
  const original = await readFile(vault.file);
  await assert.rejects(new ConfigVault(root, testCipher()).load(), /복호화/);
  assert.deepEqual(await readFile(vault.file), original);
  await writeFile(vault.file, "{damaged");
  await writeFile(vault.staging, JSON.stringify(config));
  await assert.rejects(vault.load());
  assert.equal(await readFile(vault.file, "utf8"), "{damaged");
});
test("unavailable user encryption never falls back to plaintext", async (t) => {
  const root = await fixture(t),
    cipher = testCipher();
  cipher.isEncryptionAvailable = () => false;
  const vault = new ConfigVault(root, cipher);
  await assert.rejects(vault.importText(JSON.stringify(config), true));
  await assert.rejects(readFile(vault.file));
});
test("path traversal, symlinks, Windows aliases and execution config edits are denied", async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, "project"));
  await writeFile(path.join(root, "outside.txt"), "outside");
  await symlink(root, path.join(root, "project", "link"));
  const files = new ProjectFiles(path.join(root, "project"));
  for (const value of [
    "../outside.txt",
    "/etc/passwd",
    "C:\\Windows\\x",
    "link/outside.txt",
    "file:stream",
    "dir/../x",
    "CON.txt",
    ".git /config",
    "file.",
  ])
    await assert.rejects(files.resolve(value, true), Error, value);
  for (const value of [
    ".git/config",
    ".opencode/x.js",
    ".zed/settings.json",
    ".ZeD/tasks.json",
    "opencode.json",
    ".mcp.json",
  ])
    await assert.rejects(files.resolve(value, true));
});
test("a proposal cannot change a file before apply; snapshots work without Git", async (t) => {
  const root = await fixture(t),
    files = new ProjectFiles(root);
  await writeFile(path.join(root, "main.c"), "before");
  const proposal = await files.propose("call1", "main.c", "after");
  assert.equal(await files.read("main.c"), "before");
  assert.equal(proposal.before, "before");
  await files.apply(proposal);
  assert.equal(await files.read("main.c"), "after");
  assert.equal(proposal.status, "applied");
  await assert.rejects(files.apply(proposal));
});
test("external changes including missing-to-empty-file changes invalidate approval", async (t) => {
  const root = await fixture(t),
    files = new ProjectFiles(root);
  await writeFile(path.join(root, "file"), "a");
  const p = await files.propose("c1", "file", "b");
  await writeFile(path.join(root, "file"), "external");
  await assert.rejects(files.apply(p), /외부 변경/);
  assert.equal(await files.read("file"), "external");
  const missing = await files.propose("c2", "new", "new");
  await writeFile(path.join(root, "new"), "");
  await assert.rejects(files.apply(missing));
  assert.equal(missing.status, "conflict");
});
test("approved project artifacts can create nested directories", async (t) => {
  const files = new ProjectFiles(await fixture(t));
  const p = await files.propose("c", "conductor/tracks/port/spec.md", "# Spec");
  await files.apply(p);
  assert.equal(await files.read(p.path), "# Spec");
});
test("repetition detects sentence and phrase loops but excludes fenced and indented code", () => {
  const sentence = "충분히 길이가 긴 동일한 설명 문장입니다.";
  assert.ok(detectRepetition(sentence.repeat(4)));
  assert.equal(detectRepetition(sentence.repeat(3)), undefined);
  assert.ok(detectRepetition("반복되는문구".repeat(5)));
  assert.ok(detectRepetition("abcdef".repeat(5) + "partial"));
  assert.equal(
    detectRepetition("```c\n" + sentence.repeat(8) + "\n```"),
    undefined,
  );
  assert.equal(
    detectRepetition("~~~\n" + sentence.repeat(8) + "\n~~~"),
    undefined,
  );
  assert.equal(detectRepetition("    " + sentence.repeat(8)), undefined);
});
test("unknown stop state blocks new execution and replay", () => {
  const life = new Lifecycle();
  life.start();
  life.stopping();
  life.confirmStop(true, false, 0, 0);
  assert.equal(life.phase, "unconfirmed");
  assert.throws(() => life.start());
  assert.throws(() => life.replay());
  life.stopping();
  life.confirmStop(true, true, 1, 0);
  assert.equal(life.phase, "unconfirmed");
  life.stopping();
  life.confirmStop(true, true, 0, 1);
  assert.equal(life.phase, "unconfirmed");
  life.stopping();
  life.confirmStop(true, true, 0, 0);
  life.replay();
  assert.equal(life.phase, "replaying");
});
test("replay context contains user requests and successful tool results only", () => {
  const s = session();
  s.messages.push(
    { id: "u", role: "user", text: "request", at: "1" },
    { id: "a", role: "assistant", text: "looping text", at: "3" },
  );
  s.tools.push(
    {
      id: "t",
      tool: "read_file",
      target: "a.c",
      at: "2",
      status: "success",
      result: "verified output",
    },
    {
      id: "f",
      tool: "propose_edit",
      target: "b.c",
      at: "4",
      status: "failed",
      result: "not verified",
    },
  );
  const serialized = JSON.stringify(replayMessages(s));
  assert.ok(serialized.includes("verified output"));
  assert.ok(!serialized.includes("looping text"));
  assert.ok(!serialized.includes("not verified"));
});
test("secrets are removed from output and persisted history", async (t) => {
  const root = await fixture(t),
    redactor = new Redactor();
  redactor.add(config.model.apiKey);
  assert.equal(redactor.text("Bearer foobar123"), "Bearer [REDACTED]");
  const h = new History(path.join(root, "history.json"), redactor),
    s = session();
  s.messages.push({
    id: "m",
    role: "user",
    text: config.model.apiKey,
    at: "1",
  });
  h.sessions.push(s);
  await h.save();
  assert.ok(
    !(await readFile(path.join(root, "history.json"), "utf8")).includes(
      config.model.apiKey,
    ),
  );
});
test("history corruption and future schemas are preserved", async (t) => {
  const root = await fixture(t),
    file = path.join(root, "history.json"),
    h = new History(file, new Redactor());
  for (const text of [
    "{bad",
    '{"schemaVersion":99,"projects":[],"sessions":[]}',
  ]) {
    await writeFile(file, text);
    await assert.rejects(h.load());
    assert.equal(await readFile(file, "utf8"), text);
  }
});
test("MCP broker requires run credentials and exposes no execution or REPL tools", async (t) => {
  const files = new ProjectFiles(await fixture(t));
  const broker = new ToolBroker(
    files,
    session(),
    () => {},
    new Redactor(),
    async () => "methodology",
  );
  await broker.start();
  t.after(() => broker.close());
  assert.equal(
    (await fetch(broker.url, { method: "POST", body: "{}" })).status,
    401,
  );
  const response = await fetch(broker.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${broker.token}` },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  const names = (await response.json()).result.tools.map(
    (t: { name: string }) => t.name,
  );
  assert.deepEqual(names, [
    "list_files",
    "read_file",
    "search_text",
    "propose_edit",
    "methodology",
  ]);
  await assert.rejects(broker.call("bash", { command: "touch bad" }));
  await assert.rejects(broker.call("serena_repl", {}));
});
test("MCP edits wait for approval and stop revokes pending approvals", async (t) => {
  const files = new ProjectFiles(await fixture(t));
  await writeFile(path.join(files.root, "file"), "before");
  const s = session();
  const broker = new ToolBroker(
    files,
    s,
    () => {},
    new Redactor(),
    async () => "",
  );
  t.after(() => broker.close());
  const editing = broker.call("propose_edit", {
    path: "file",
    content: "after",
  });
  while (!s.proposals.length) await new Promise((r) => setTimeout(r, 5));
  assert.equal(await files.read("file"), "before");
  assert.equal(s.tools[0].status, "approval");
  broker.approve(s.proposals[0].id, "once");
  await editing;
  assert.equal(await files.read("file"), "after");
  const cancelled = broker.call("propose_edit", {
    path: "file",
    content: "should-not-write",
  });
  while (s.proposals.length < 2) await new Promise((r) => setTimeout(r, 5));
  broker.stop();
  await assert.rejects(cancelled);
  assert.equal(await files.read("file"), "after");
  await assert.rejects(broker.call("read_file", { path: "file" }));
  assert.equal(broker.sessionApproval, false);
});
test(
  "methodology exposes selected original skills and rejects executable or traversing documents",
  { skip: !existsSync("vendor/sources/aegis/README.md") },
  async (t) => {
    const adapter = new Methodologies(
      path.resolve("vendor/sources"),
      new ProjectFiles(await fixture(t)),
    );
    assert.match(
      await adapter.read("aegis", "skills/writing-plans/SKILL.md"),
      /writing-plans/,
    );
    assert.match(
      await adapter.read("conductor", "skills/conductor-status/SKILL.md"),
      /conductor-status/,
    );
    await assert.rejects(adapter.read("aegis", "../../package.json"));
    await assert.rejects(adapter.read("aegis", "skills/update-aegis/SKILL.md"));
  },
);
