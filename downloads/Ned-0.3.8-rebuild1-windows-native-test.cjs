var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tests/git-tools.test.ts
var import_node_test = require("node:test");
var import_strict = __toESM(require("node:assert/strict"), 1);
var import_node_child_process2 = require("node:child_process");
var import_node_util = require("node:util");
var import_promises3 = require("node:fs/promises");
var import_node_os = require("node:os");
var import_node_path3 = __toESM(require("node:path"), 1);

// distribution/git-tools.ts
var import_node_child_process = require("node:child_process");
var import_node_crypto2 = require("node:crypto");
var import_node_fs = require("node:fs");
var import_promises2 = require("node:fs/promises");
var import_node_path2 = __toESM(require("node:path"), 1);

// src/main/files.ts
var import_node_path = __toESM(require("node:path"), 1);
var import_node_crypto = require("node:crypto");
var import_promises = require("node:fs/promises");
var MAX_FILE = 2 * 1024 * 1024;
var hash = (value) => (0, import_node_crypto.createHash)("sha256").update(value).digest("hex");
var protectedParts = /* @__PURE__ */ new Set([".git", ".opencode", ".zed", "node_modules"]);
var ProjectFiles = class {
  constructor(root) {
    this.root = root;
  }
  async resolve(relative, writing = false) {
    if (!relative || import_node_path.default.isAbsolute(relative) || relative.includes("\0") || relative.includes(":") || relative.includes("\\"))
      throw new Error("\uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC758 \uC0C1\uB300 \uACBD\uB85C\uB9CC \uD5C8\uC6A9\uD569\uB2C8\uB2E4.");
    const parts = relative.split("/");
    if (parts.some(
      (p) => !p || p === ".." || p === "." || /[. ]$/.test(p) || /[\x00-\x1f<>"|?*]/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)
    ))
      throw new Error("\uD5C8\uC6A9\uB418\uC9C0 \uC54A\uB294 \uACBD\uB85C\uC785\uB2C8\uB2E4.");
    if (writing && (parts.some((p) => protectedParts.has(p.toLowerCase())) || /^(opencode\.jsonc?|\.mcp\.json)$/i.test(parts.at(-1))))
      throw new Error("\uC2E4\uD589 \uC124\uC815\uACFC \uB0B4\uBD80 \uAD00\uB9AC \uD30C\uC77C\uC758 \uC218\uC815\uC740 \uCC28\uB2E8\uB429\uB2C8\uB2E4.");
    const root = await (0, import_promises.realpath)(this.root);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      cursor = import_node_path.default.join(cursor, parts[i]);
      const stat2 = await (0, import_promises.lstat)(cursor).catch((e) => {
        if (writing && e.code === "ENOENT") return void 0;
        throw e;
      });
      if (stat2?.isSymbolicLink())
        throw new Error(
          "\uC2EC\uBCFC\uB9AD \uB9C1\uD06C\xB7junction\uC744 \uD1B5\uD55C \uACBD\uB85C\uB294 \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
        );
      if (stat2) {
        const rel = import_node_path.default.relative(root, await (0, import_promises.realpath)(cursor));
        if (rel.startsWith("..") || import_node_path.default.isAbsolute(rel))
          throw new Error("\uD504\uB85C\uC81D\uD2B8 \uBC94\uC704\uB97C \uBC97\uC5B4\uB0AC\uC2B5\uB2C8\uB2E4.");
      }
    }
    return cursor;
  }
  async read(relative) {
    const file = await this.resolve(relative);
    const stat2 = await (0, import_promises.lstat)(file);
    if (!stat2.isFile() || stat2.size > MAX_FILE)
      throw new Error("2 MiB \uC774\uD558\uC758 \uC77C\uBC18 \uD14D\uC2A4\uD2B8 \uD30C\uC77C\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    const bytes = await (0, import_promises.readFile)(file);
    if (bytes.includes(0))
      throw new Error("\uBC14\uC774\uB108\uB9AC \uD30C\uC77C\uC740 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    return bytes.toString("utf8");
  }
  async list() {
    const files = [];
    const visit2 = async (relative, depth) => {
      if (depth > 12 || files.length >= 4e3) return;
      for (const entry of await (0, import_promises.readdir)(import_node_path.default.join(this.root, relative), {
        withFileTypes: true
      })) {
        if (entry.isSymbolicLink() || protectedParts.has(entry.name.toLowerCase()) || ["dist", "build", ".venv", "vendor"].includes(entry.name.toLowerCase()))
          continue;
        const next = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await visit2(next, depth + 1);
        else if (entry.isFile()) files.push(next);
        if (files.length >= 4e3) break;
      }
    };
    await visit2("", 0);
    return files.sort();
  }
  async propose(callId, relative, after) {
    if (Buffer.byteLength(after) > MAX_FILE || after.includes("\0"))
      throw new Error("\uD14D\uC2A4\uD2B8 \uBCC0\uACBD \uD06C\uAE30 \uC81C\uD55C\uC744 \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4.");
    await this.resolve(relative, true);
    const before = await this.read(relative).catch(
      (e) => {
        if (e.code === "ENOENT") return "";
        throw e;
      }
    );
    const exists = await (0, import_promises.lstat)(await this.resolve(relative, true)).then(
      () => true,
      () => false
    );
    return {
      id: (0, import_node_crypto.randomUUID)(),
      callId,
      path: relative,
      before,
      after,
      baseHash: `${exists ? "file" : "missing"}:${hash(before)}`,
      status: "pending"
    };
  }
  async apply(proposal, signal) {
    signal?.throwIfAborted();
    if (proposal.status !== "pending")
      throw new Error("\uC720\uD6A8\uD55C \uB300\uAE30 \uC911 \uC81C\uC548\uC774 \uC544\uB2D9\uB2C8\uB2E4.");
    const fresh = await this.propose(
      proposal.callId,
      proposal.path,
      proposal.after
    );
    if (fresh.baseHash !== proposal.baseHash) {
      proposal.status = "conflict";
      proposal.result = "\uC678\uBD80 \uBCC0\uACBD\uC744 \uBC1C\uACAC\uD588\uC2B5\uB2C8\uB2E4. \uC0C8 \uC81C\uC548\uC744 \uB9CC\uB4E0 \uB4A4 \uB2E4\uC2DC \uC2B9\uC778\uD574\uC57C \uD569\uB2C8\uB2E4.";
      throw new Error(proposal.result);
    }
    const target = await this.resolve(proposal.path, true);
    signal?.throwIfAborted();
    if (proposal.operation === "delete") {
      const held = import_node_path.default.join(import_node_path.default.dirname(target), `.ned-delete-${(0, import_node_crypto.randomUUID)()}.tmp`);
      let captured = false;
      try {
        await this.resolve(proposal.path, true);
        signal?.throwIfAborted();
        await (0, import_promises.rename)(target, held);
        captured = true;
        await this.resolve(proposal.path, true);
        const stat2 = await (0, import_promises.lstat)(held);
        if (!stat2.isFile() || stat2.isSymbolicLink() || stat2.size > MAX_FILE || !(await (0, import_promises.readFile)(held)).equals(Buffer.from(proposal.before, "utf8"))) {
          proposal.status = "conflict";
          throw new Error("\uC2B9\uC778 \uD6C4 \uC678\uBD80 \uBCC0\uACBD\uC744 \uBC1C\uACAC\uD574 \uC0AD\uC81C\uB97C \uC911\uB2E8\uD588\uC2B5\uB2C8\uB2E4.");
        }
        signal?.throwIfAborted();
        await (0, import_promises.unlink)(held);
        captured = false;
        const exists = await (0, import_promises.lstat)(target).then(() => true, (error) => {
          if (error.code === "ENOENT") return false;
          throw error;
        });
        if (exists) throw new Error("\uC6D0\uB798 \uD30C\uC77C\uC740 \uC0AD\uC81C\uB410\uC9C0\uB9CC \uAC19\uC740 \uACBD\uB85C\uC5D0 \uC0C8 \uD30C\uC77C\uC774 \uC0DD\uACBC\uC2B5\uB2C8\uB2E4. \uC790\uB3D9 \uC7AC\uC0AD\uC81C\uD558\uC9C0 \uB9D0\uACE0 \uD655\uC778\uD558\uC138\uC694.");
        proposal.status = "applied";
        proposal.result = `\uC0AD\uC81C \uD655\uC778 \xB7 \uC6D0\uBCF8 SHA-256 ${hash(proposal.before)}`;
        return proposal.result;
      } catch (error) {
        if (captured) {
          try {
            await (0, import_promises.link)(held, target);
            await (0, import_promises.unlink)(held);
          } catch {
            throw new Error(`\uC0AD\uC81C\uB97C \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC6D0\uB798 \uD56D\uBAA9\uC744 ${import_node_path.default.basename(held)}\uC5D0 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4. \uC0C8 \uD30C\uC77C\uC744 \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.`);
          }
        }
        throw error;
      }
    }
    await (0, import_promises.mkdir)(import_node_path.default.dirname(target), { recursive: true, mode: 448 });
    await this.resolve(proposal.path, true);
    const temp = import_node_path.default.join(
      import_node_path.default.dirname(target),
      `.ned-${(0, import_node_crypto.randomUUID)()}.tmp`
    );
    try {
      const mode = await (0, import_promises.lstat)(target).then(
        (s) => s.mode,
        () => 384
      );
      await (0, import_promises.writeFile)(temp, proposal.after, { mode, flag: "wx" });
      const check = await this.propose(
        proposal.callId,
        proposal.path,
        proposal.after
      );
      if (check.baseHash !== proposal.baseHash) {
        proposal.status = "conflict";
        throw new Error("\uC2B9\uC778 \uD6C4 \uC678\uBD80 \uBCC0\uACBD\uC73C\uB85C \uC801\uC6A9\uC744 \uC911\uB2E8\uD588\uC2B5\uB2C8\uB2E4.");
      }
      await this.resolve(proposal.path, true);
      signal?.throwIfAborted();
      await (0, import_promises.rename)(temp, target);
      const actual = await this.read(proposal.path);
      if (actual !== proposal.after)
        throw new Error("\uAE30\uB85D \uD6C4 \uC2E4\uC81C \uD30C\uC77C \uB0B4\uC6A9\uC774 \uB2E4\uB985\uB2C8\uB2E4.");
      proposal.status = "applied";
      proposal.result = `\uC800\uC7A5 \uD655\uC778 \xB7 SHA-256 ${hash(actual)}`;
      return proposal.result;
    } finally {
      await (0, import_promises.unlink)(temp).catch(() => {
      });
    }
  }
  async proposeDelete(callId, relative) {
    const proposal = await this.propose(callId, relative, "");
    if (!proposal.baseHash.startsWith("file:")) throw new Error("\uC0AD\uC81C\uD560 \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
    const bytes = await (0, import_promises.readFile)(await this.resolve(relative, true));
    if (!bytes.equals(Buffer.from(proposal.before, "utf8"))) throw new Error("UTF-8 \uD14D\uC2A4\uD2B8 \uD30C\uC77C\uB9CC \uC0AD\uC81C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC678\uBD80 \uBCC0\uACBD \uC5EC\uBD80\uB3C4 \uD655\uC778\uD558\uC138\uC694.");
    return { ...proposal, operation: "delete" };
  }
};

// distribution/git-tools.ts
var digest = (bytes) => (0, import_node_crypto2.createHash)("sha256").update(bytes).digest("hex");
var oid = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/;
var GitTools = class {
  constructor(root, resources3, approve, verify, binary2 = import_node_path2.default.join(resources3, "runtime/windows-x64/mcp/git/cmd/git.exe")) {
    this.root = root;
    this.resources = resources3;
    this.approve = approve;
    this.verify = verify;
    this.binary = binary2;
  }
  busy = false;
  stopped = false;
  uncertain = false;
  children = /* @__PURE__ */ new Set();
  abort = new AbortController();
  async run(project, work, args, signal, extra = {}) {
    signal = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    signal?.throwIfAborted();
    if (this.stopped || this.uncertain) throw new Error("Git \uC2E4\uD589\uC774 \uC911\uC9C0\uB418\uC5C8\uAC70\uB098 \uC774\uC804 \uD504\uB85C\uC138\uC2A4 \uC885\uB8CC\uAC00 \uD655\uC778\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
    const env = {
      HOME: work,
      USERPROFILE: work,
      APPDATA: work,
      LOCALAPPDATA: work,
      TEMP: work,
      TMP: work,
      PATH: import_node_path2.default.dirname(this.binary),
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_SYSTEM: import_node_path2.default.join(work, "empty"),
      GIT_CONFIG_GLOBAL: import_node_path2.default.join(work, "empty"),
      GIT_TERMINAL_PROMPT: "0",
      GIT_ATTR_NOSYSTEM: "1",
      GIT_LITERAL_PATHSPECS: "1",
      GIT_OPTIONAL_LOCKS: "0",
      LC_ALL: "C",
      ...extra
    };
    for (const key of ["SystemRoot", "SYSTEMROOT", "WINDIR"]) if (process.env[key]) env[key] = process.env[key];
    const fixed = [
      "-c",
      "core.hooksPath=" + import_node_path2.default.join(work, "hooks"),
      "-c",
      "core.fsmonitor=false",
      "-c",
      "core.untrackedCache=false",
      "-c",
      "core.attributesFile=" + import_node_path2.default.join(work, "empty"),
      "-c",
      "commit.gpgSign=false",
      "-c",
      "tag.gpgSign=false",
      "-c",
      "credential.helper=",
      "-c",
      "protocol.allow=never",
      "-c",
      "core.pager=cat",
      ...args
    ];
    const supervised = process.platform === "win32";
    const executable = supervised ? import_node_path2.default.join(this.resources, "runtime/windows-x64/openviking/python/python.exe") : this.binary;
    const argv = supervised ? ["-I", "-B", import_node_path2.default.join(this.resources, "runtime/windows-x64/openviking/sidecar-supervisor.py"), this.binary, ...fixed] : fixed;
    const child = (0, import_node_child_process.spawn)(executable, argv, { cwd: project, env, windowsHide: true, shell: false, detached: !supervised, stdio: "pipe" });
    this.children.add(child);
    child.stdin.on("error", () => {
    });
    let output = Buffer.alloc(0), overflow = false, aborted = false;
    let confirm;
    let rejectStop;
    const stop = () => {
      aborted = true;
      if (supervised) child.stdin.end();
      else if (child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
        }
      }
      confirm ??= setTimeout(() => {
        this.uncertain = true;
        child.kill("SIGKILL");
        rejectStop?.(new Error("Git \uC790\uC2DD \uD504\uB85C\uC138\uC2A4 \uC885\uB8CC \uD655\uC778 \uC2E4\uD328. \uC0C8 \uC2E4\uD589\uC744 \uCC28\uB2E8\uD569\uB2C8\uB2E4."));
      }, 8e3);
    };
    const collect = (bytes) => {
      if (output.length + bytes.length > 8 * 1024 * 1024) {
        overflow = true;
        stop();
      } else output = Buffer.concat([output, bytes]);
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", () => {
    });
    const timer = setTimeout(stop, 6e4);
    signal?.addEventListener("abort", stop, { once: true });
    if (signal?.aborted) stop();
    try {
      const code = await new Promise((resolve, reject) => {
        rejectStop = reject;
        child.once("error", reject);
        child.once("close", resolve);
      });
      if (this.uncertain) throw new Error("Git \uC790\uC2DD \uD504\uB85C\uC138\uC2A4 \uC885\uB8CC \uD655\uC778 \uC2E4\uD328. \uC0C8 \uC2E4\uD589\uC744 \uCC28\uB2E8\uD569\uB2C8\uB2E4.");
      if (aborted || signal?.aborted || overflow) throw new Error("Git \uC2E4\uD589\uC744 \uC911\uC9C0\uD588\uC2B5\uB2C8\uB2E4. \uCEE4\uBC0B \uB2E8\uACC4\uC600\uB2E4\uBA74 git_inspect\uB85C \uC2E4\uC81C HEAD\uB97C \uD655\uC778\uD558\uC138\uC694.");
      return { code, text: output.toString("utf8"), bytes: output };
    } finally {
      clearTimeout(timer);
      clearTimeout(confirm);
      signal?.removeEventListener("abort", stop);
      if (!this.uncertain) this.children.delete(child);
    }
  }
  async execute(project, operation, paths, message, author, signal, current) {
    if (this.busy || this.stopped || this.uncertain) throw new Error("\uB2E4\uB978 Git \uC791\uC5C5\uC774 \uC2E4\uD589 \uC911\uC774\uAC70\uB098 \uC885\uB8CC\uAC00 \uD655\uC778\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
    this.busy = true;
    let work, lock, lockPath;
    try {
      await this.verify();
      signal?.throwIfAborted();
      const binaryHash = digest(await (0, import_promises2.readFile)(this.binary));
      await (0, import_promises2.mkdir)(import_node_path2.default.join(this.root, "git-operations"), { recursive: true, mode: 448 });
      work = await (0, import_promises2.mkdtemp)(import_node_path2.default.join(this.root, "git-operations/op-"));
      await (0, import_promises2.mkdir)(import_node_path2.default.join(work, "hooks"));
      await (0, import_promises2.writeFile)(import_node_path2.default.join(work, "empty"), "");
      const gitDir = import_node_path2.default.join(project, ".git");
      const meta = await (0, import_promises2.lstat)(gitDir);
      if (!meta.isDirectory() || meta.isSymbolicLink() || await (0, import_promises2.realpath)(gitDir) !== import_node_path2.default.resolve(gitDir)) throw new Error("\uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8\uC758 \uC77C\uBC18 .git \uB514\uB809\uD130\uB9AC\uB9CC \uC9C0\uC6D0\uD569\uB2C8\uB2E4. worktree\xB7submodule \uC5F0\uACB0\uC740 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      for (const name of ["commondir", "gitdir", "objects/info/alternates", "objects/info/http-alternates", "shallow", "info/grafts", "MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "rebase-merge", "rebase-apply"]) {
        if (await (0, import_promises2.lstat)(import_node_path2.default.join(gitDir, name)).then(() => true, () => false)) throw new Error("\uC5F0\uACB0\uB41C \uC800\uC7A5\uC18C, shallow \uC800\uC7A5\uC18C \uB610\uB294 \uBCD1\uD569\xB7rebase \uC9C4\uD589 \uC911\uC5D0\uB294 Git \uC4F0\uAE30\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      }
      for (const name of ["HEAD", "config", "index", "objects", "refs", "packed-refs"]) {
        const info = await (0, import_promises2.lstat)(import_node_path2.default.join(gitDir, name)).catch(() => void 0);
        if (info?.isSymbolicLink()) throw new Error("Git \uBA54\uD0C0\uB370\uC774\uD130 \uB9C1\uD06C\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      }
      let metadataCount = 0;
      const inspectMetadata = async (folder) => {
        for (const entry of await (0, import_promises2.readdir)(folder, { withFileTypes: true }).catch((e) => {
          if (e.code === "ENOENT") return [];
          throw e;
        })) {
          if (++metadataCount > 1e5) throw new Error("Git \uBA54\uD0C0\uB370\uC774\uD130 \uD30C\uC77C \uC218 \uC81C\uD55C\uC744 \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4.");
          if (entry.isSymbolicLink()) throw new Error("Git \uBA54\uD0C0\uB370\uC774\uD130 \uB9C1\uD06C\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
          if (entry.isDirectory()) await inspectMetadata(import_node_path2.default.join(folder, entry.name));
        }
      };
      for (const name of ["objects", "refs", "info"]) await inspectMetadata(import_node_path2.default.join(gitDir, name));
      const git = async (args, extra) => {
        const result = await this.run(project, work, args, signal, extra);
        if (result.code !== 0) throw new Error("Git \uBA85\uB839 \uC2E4\uD328: " + args[0] + " (exit " + result.code + "). \uC800\uC7A5\uC18C \uC0C1\uD0DC\uC640 \uC0AC\uC6A9\uC790 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uC138\uC694.");
        return result;
      };
      const config = await this.run(work, work, ["config", "--file", import_node_path2.default.join(gitDir, "config"), "--no-includes", "--null", "--list"], signal);
      if (config.code !== 0) throw new Error("Git \uC800\uC7A5\uC18C \uC124\uC815\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      const settings = new Map(config.text.split("\0").filter(Boolean).map((row) => {
        const i = row.indexOf("\n");
        return [row.slice(0, i).toLowerCase(), row.slice(i + 1)];
      }));
      if ([...settings.keys()].some((key) => /^(?:include\.|includeif\.|extensions\.|core\.worktree$)/.test(key)) || settings.get("core.bare") === "true") throw new Error("include\xB7\uD655\uC7A5 \uD615\uC2DD\xB7\uC678\uBD80 worktree \uC124\uC815\uC774 \uC788\uB294 \uC800\uC7A5\uC18C\uB294 Git \uC4F0\uAE30\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      const branch = (await git(["symbolic-ref", "--quiet", "HEAD"])).text.trim();
      if (!/^refs\/heads\/[A-Za-z0-9_./-]+$/.test(branch) || branch.includes("..") || branch.endsWith("/") || branch.split("/").some((p) => !p || p.endsWith(".lock"))) throw new Error("\uC77C\uBC18 \uB85C\uCEEC \uBE0C\uB79C\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694. detached HEAD\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      const headResult = await this.run(project, work, ["rev-parse", "--verify", "HEAD"], signal);
      const head = headResult.code === 0 ? headResult.text.trim() : void 0;
      if (head && !oid.test(head)) throw new Error("Git HEAD \uD615\uC2DD \uC624\uB958");
      const indexPath = import_node_path2.default.join(gitDir, "index");
      if (((await (0, import_promises2.lstat)(indexPath).catch(() => void 0))?.size ?? 0) > 64 * 1024 * 1024) throw new Error("Git index \uD06C\uAE30 \uC81C\uD55C\uC744 \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4.");
      const originalIndex = await (0, import_promises2.readFile)(indexPath).catch((e) => {
        if (e.code === "ENOENT") return void 0;
        throw e;
      });
      const configBytes = await (0, import_promises2.readFile)(import_node_path2.default.join(gitDir, "config"));
      const files = new ProjectFiles(project), selected = [];
      const indexRecords = (await git(["ls-files", "--stage", "-z"])).text.split("\0").filter(Boolean).map((line) => {
        const match = /^(\d+) ([a-f0-9]+) (\d)\t([\s\S]+)$/.exec(line);
        if (!match || match[3] !== "0") throw new Error("\uCDA9\uB3CC \uC911\uC778 Git index\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        return { mode: match[1], hash: match[2], path: match[4] };
      });
      for (const name of [...new Set(paths)]) {
        const absolute = await files.resolve(name, true);
        const tracked = indexRecords.find((r) => r.path === name);
        if (tracked && !["100644", "100755"].includes(tracked.mode)) throw new Error("\uB9C1\uD06C\xB7submodule\uC740 \uC2A4\uD14C\uC774\uC9D5\uD558\uAC70\uB098 \uCEE4\uBC0B\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        if (operation === "commit") {
          selected.push(tracked ?? { path: name, mode: "0" });
          continue;
        }
        const info = await (0, import_promises2.lstat)(absolute).catch((e) => {
          if (e.code === "ENOENT") return void 0;
          throw e;
        });
        if (!info) {
          if (!tracked) throw new Error("\uC0AD\uC81C\uD560 \uCD94\uC801 \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: " + name);
          selected.push({ path: name, mode: "0" });
          continue;
        }
        if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024 * 1024) throw new Error("64 MiB \uC774\uD558 \uC77C\uBC18 \uD30C\uC77C\uB9CC \uC2A4\uD14C\uC774\uC9D5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
        if (!tracked && (await this.run(project, work, ["check-ignore", "--quiet", "--", name], signal)).code === 0) throw new Error("Git\uC5D0\uC11C \uBB34\uC2DC\uD55C \uD30C\uC77C\uC740 \uC790\uB3D9 \uCD94\uAC00\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: " + name);
        const attr = (await git(["check-attr", "-z", "filter", "--", name])).text.split("\0");
        if (attr[2] !== "unspecified" && attr[2] !== "unset") throw new Error("\uC678\uBD80 clean/LFS \uD544\uD130\uAC00 \uD544\uC694\uD55C \uD30C\uC77C\uC740 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: " + name);
        selected.push({ path: name, mode: tracked?.mode ?? (process.platform !== "win32" && info.mode & 73 ? "100755" : "100644"), bytes: await (0, import_promises2.readFile)(absolute) });
      }
      const identity = author ?? { name: settings.get("user.name") ?? "", email: settings.get("user.email") ?? "" };
      if (operation === "commit" && (!/^[^\x00-\x1f<>]{1,200}$/.test(identity.name) || !/^[^\s<>@]+@[^\s<>@]+$/.test(identity.email))) throw new Error("\uCEE4\uBC0B \uC791\uC131\uC790 \uC774\uB984\uACFC \uC774\uBA54\uC77C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uC800\uC7A5\uC18C\uC758 user.name\xB7user.email \uB610\uB294 \uC0AC\uC6A9\uC790\uAC00 \uC81C\uACF5\uD55C author\uB97C \uC0AC\uC6A9\uD558\uC138\uC694. \uC784\uC758 \uC791\uC131\uC790\uB294 \uB9CC\uB4E4\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      const staged = await git(["diff", "--cached", "--no-ext-diff", "--no-textconv", "--stat", "--", ...selected.map((x) => x.path)]);
      if (operation === "commit" && !staged.text.trim()) throw new Error("\uC120\uD0DD\uD55C \uD30C\uC77C\uC758 \uC2A4\uD14C\uC774\uC9D5\uB41C \uBCC0\uACBD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 git_stage\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.");
      const detail = JSON.stringify({
        project,
        branch,
        head: head ?? "(initial commit)",
        operation,
        execution: { executable: this.binary, binarySha256: binaryHash, cwd: project, shell: false, privateEnvironment: true, commands: operation === "stage" ? ["hash-object --no-filters", "update-index --cacheinfo/--force-remove (temporary index)", "publish index with index.lock"] : ["read-tree (temporary index)", "update-index (selected staged entries)", "write-tree", "commit-tree -F fixed-message-file", "update-ref (compare-and-swap HEAD)"] },
        paths: selected.map((x) => ({ path: x.path, mode: x.mode, sha256: x.bytes ? digest(x.bytes) : x.hash ?? "(delete)" })),
        ...operation === "commit" ? { message, author: identity, stagedSummary: staged.text } : {},
        policy: "Explicit paths only; other staged files retained; no hooks, signing, shell, remote or custom filters."
      }, null, 2);
      if (!await this.approve(operation === "stage" ? "Git \uC2A4\uD14C\uC774\uC9D5 \uC2B9\uC778" : "Git \uCEE4\uBC0B \uC2B9\uC778", detail, signal)) throw new Error("Git \uC791\uC5C5\uC774 \uAC70\uC808\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      signal?.throwIfAborted();
      const checkRequest = async () => {
        signal?.throwIfAborted();
        if (current && !await current()) throw new Error("\uB300\uD654 \uC694\uCCAD\uC774\uB098 \uD504\uB85C\uC81D\uD2B8\uAC00 \uBCC0\uACBD\uB418\uC5B4 Git \uC4F0\uAE30\uB97C \uBCF4\uB958\uD569\uB2C8\uB2E4.");
      };
      await checkRequest();
      if (binaryHash !== digest(await (0, import_promises2.readFile)(this.binary))) throw new Error("\uC2B9\uC778 \uD6C4 Git \uC2E4\uD589 \uD30C\uC77C\uC774 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      if (!configBytes.equals(await (0, import_promises2.readFile)(import_node_path2.default.join(gitDir, "config")))) throw new Error("\uC2B9\uC778 \uD6C4 Git \uC124\uC815\uC774 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uD655\uC778\uD558\uC138\uC694.");
      const nowHead = await this.run(project, work, ["rev-parse", "--verify", "HEAD"], signal);
      if ((nowHead.code === 0 ? nowHead.text.trim() : void 0) !== head || (await git(["symbolic-ref", "--quiet", "HEAD"])).text.trim() !== branch) throw new Error("\uC2B9\uC778 \uD6C4 \uBE0C\uB79C\uCE58 \uB610\uB294 HEAD\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      const pendingLock = import_node_path2.default.join(gitDir, "index.lock");
      lock = await (0, import_promises2.open)(pendingLock, "wx", 384);
      lockPath = pendingLock;
      const currentIndex = await (0, import_promises2.readFile)(indexPath).catch((e) => {
        if (e.code === "ENOENT") return void 0;
        throw e;
      });
      if ((currentIndex ? digest(currentIndex) : "") !== (originalIndex ? digest(originalIndex) : "")) throw new Error("\uC2B9\uC778 \uD6C4 Git index\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uC2A4\uD14C\uC774\uC9D5\uC744 \uBCF4\uC874\uD558\uACE0 \uC911\uB2E8\uD569\uB2C8\uB2E4.");
      const temporaryIndex = import_node_path2.default.join(work, "index");
      if (operation === "stage" && originalIndex) await (0, import_promises2.copyFile)(indexPath, temporaryIndex, import_node_fs.constants.COPYFILE_EXCL);
      else await git(["read-tree", head ?? "--empty"], { GIT_INDEX_FILE: temporaryIndex });
      for (const item of selected) {
        signal?.throwIfAborted();
        if (operation === "stage") {
          const current2 = await (0, import_promises2.readFile)(await files.resolve(item.path, true)).catch((e) => {
            if (e.code === "ENOENT") return void 0;
            throw e;
          });
          if ((current2 ? digest(current2) : "") !== (item.bytes ? digest(item.bytes) : "")) throw new Error("\uC2B9\uC778 \uD6C4 \uD30C\uC77C\uC774 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4: " + item.path);
          if (item.bytes) {
            const source = import_node_path2.default.join(work, "source");
            await (0, import_promises2.writeFile)(source, item.bytes);
            item.hash = (await git(["hash-object", "-w", "--no-filters", source])).text.trim();
          }
        }
        if (item.mode === "0") await git(["update-index", "--force-remove", "--", item.path], { GIT_INDEX_FILE: temporaryIndex });
        else {
          if (!oid.test(item.hash ?? "")) throw new Error("Git object \uD615\uC2DD \uC624\uB958");
          await git(["update-index", "--add", "--cacheinfo", item.mode, item.hash, item.path], { GIT_INDEX_FILE: temporaryIndex });
        }
      }
      if (operation === "stage") {
        await checkRequest();
        await lock.writeFile(await (0, import_promises2.readFile)(temporaryIndex));
        await lock.sync();
        await lock.close();
        lock = void 0;
        await (0, import_promises2.rename)(lockPath, indexPath);
        lockPath = void 0;
        return { status: "staged", paths: selected.map((x) => x.path), otherStagedFilesPreserved: true, lineEndings: "approved-file-bytes" };
      }
      const tree = (await git(["write-tree"], { GIT_INDEX_FILE: temporaryIndex })).text.trim();
      const messageFile = import_node_path2.default.join(work, "message");
      await (0, import_promises2.writeFile)(messageFile, message);
      const commit = (await git(["commit-tree", tree, ...head ? ["-p", head] : [], "-F", messageFile], {
        GIT_AUTHOR_NAME: identity.name,
        GIT_AUTHOR_EMAIL: identity.email,
        GIT_COMMITTER_NAME: identity.name,
        GIT_COMMITTER_EMAIL: identity.email
      })).text.trim();
      if (!oid.test(commit)) throw new Error("Git \uCEE4\uBC0B \uD655\uC778 \uC2E4\uD328");
      await checkRequest();
      await git(["update-ref", "-m", "Ned: selected-path commit", branch, commit, head ?? "0".repeat(commit.length)]);
      return { status: "committed", commit, branch, paths: selected.map((x) => x.path), otherStagedFilesPreserved: true, hooksExecuted: false, pushed: false };
    } finally {
      await lock?.close();
      if (lockPath) await (0, import_promises2.rm)(lockPath, { force: true });
      if (work && !this.uncertain) await (0, import_promises2.rm)(work, { recursive: true, force: true });
      this.busy = false;
    }
  }
  async close() {
    this.stopped = true;
    this.abort.abort();
    await Promise.all([...this.children].map((child) => new Promise((resolve, reject) => {
      if (child.exitCode !== null || child.signalCode !== null) {
        resolve();
        return;
      }
      const timer = setTimeout(() => {
        this.uncertain = true;
        reject(new Error("Git \uC2E4\uD589 \uC885\uB8CC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."));
      }, 9e3);
      child.once("close", () => {
        clearTimeout(timer);
        resolve();
      });
    })));
  }
};

// tests/git-tools.test.ts
var exec = (0, import_node_util.promisify)(import_node_child_process2.execFile);
var binary = process.env.NED_TEST_GIT ?? (process.platform === "win32" ? void 0 : "/usr/bin/git");
async function fixture(t, approve = async () => true) {
  const root = await (0, import_promises3.realpath)(await (0, import_promises3.mkdtemp)(import_node_path3.default.join((0, import_node_os.tmpdir)(), "ned-git-test-"))), project = import_node_path3.default.join(root, "project");
  await (0, import_promises3.mkdir)(project);
  const git = (args) => exec(binary, args, { cwd: project, env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: import_node_path3.default.join(root, "missing"), GIT_TERMINAL_PROMPT: "0" } });
  await git(["init", "-b", "main"]);
  await git(["config", "user.name", "Ned Git Fixture"]);
  await git(["config", "user.email", "fixture@example.invalid"]);
  const tools = new GitTools(root, process.env.NED_TEST_RESOURCES ?? "", approve, async () => {
  }, binary);
  t.after(async () => {
    await tools.close();
    await (0, import_promises3.rm)(root, { recursive: true, force: true });
  });
  return { root, project, git, tools };
}
(0, import_node_test.test)("real Git selected-path commits preserve unrelated staging, working edits, deletions and disabled hooks", { skip: !binary }, async (t) => {
  const { root, project, git, tools } = await fixture(t);
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, "selected.txt"), "initial\n");
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, "other.txt"), "original\n");
  await git(["add", "."]);
  await git(["commit", "-m", "initial"]);
  const marker = import_node_path3.default.join(root, "HOOK_RAN").replaceAll("\\", "/");
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, ".git/hooks/pre-commit"), '#!/bin/sh\necho ran > "' + marker + '"\n', { mode: 493 });
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, ".git/hooks/reference-transaction"), '#!/bin/sh\necho ran > "' + marker + '"\n', { mode: 493 });
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, "other.txt"), "user staged this\n");
  await git(["add", "other.txt"]);
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, "selected.txt"), "approved bytes\r\n");
  import_strict.default.equal((await tools.execute(project, "stage", ["selected.txt"])).status, "staged");
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, "selected.txt"), "later unsaved-to-index edit\n");
  const beforeIndex = await (0, import_promises3.readFile)(import_node_path3.default.join(project, ".git/index"));
  const result = await tools.execute(project, "commit", ["selected.txt"], "Commit only selected");
  import_strict.default.equal(result.status, "committed");
  import_strict.default.match(result.commit, /^[a-f0-9]{40}$/);
  import_strict.default.equal((await git(["show", "HEAD:selected.txt"])).stdout, "approved bytes\r\n");
  import_strict.default.equal((await git(["show", "HEAD:other.txt"])).stdout, "original\n");
  import_strict.default.equal((await git(["diff", "--cached", "--name-only"])).stdout.trim(), "other.txt");
  import_strict.default.deepEqual(await (0, import_promises3.readFile)(import_node_path3.default.join(project, ".git/index")), beforeIndex);
  import_strict.default.equal(await (0, import_promises3.readFile)(marker).then(() => true, () => false), false);
  await (0, import_promises3.rm)(import_node_path3.default.join(project, "selected.txt"));
  await tools.execute(project, "stage", ["selected.txt"]);
  await tools.execute(project, "commit", ["selected.txt"], "Remove selected");
  import_strict.default.equal((await git(["ls-tree", "--name-only", "HEAD"])).stdout.trim(), "other.txt");
});
(0, import_node_test.test)("initial commit, author validation, permission denial and index lock ownership", { skip: !binary }, async (t) => {
  let allowed = false;
  const { project, git, tools } = await fixture(t, async () => allowed);
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, "new.txt"), "new\n");
  await import_strict.default.rejects(tools.execute(project, "stage", ["new.txt"]), /거절/);
  allowed = true;
  await tools.execute(project, "stage", ["new.txt"]);
  await git(["config", "--unset", "user.email"]);
  await import_strict.default.rejects(tools.execute(project, "commit", ["new.txt"], "first"), /작성자/);
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, ".git/index.lock"), "external lock");
  await import_strict.default.rejects(tools.execute(project, "commit", ["new.txt"], "first", { name: "User", email: "user@example.invalid" }), /EEXIST/);
  import_strict.default.equal(await (0, import_promises3.readFile)(import_node_path3.default.join(project, ".git/index.lock"), "utf8"), "external lock");
  await (0, import_promises3.rm)(import_node_path3.default.join(project, ".git/index.lock"));
  import_strict.default.equal((await tools.execute(project, "commit", ["new.txt"], "first", { name: "User", email: "user@example.invalid" })).status, "committed");
});
(0, import_node_test.test)("changed approved inputs, configuration includes and executable clean filters are blocked", { skip: !binary }, async (t) => {
  let mutate;
  const { project, git, tools } = await fixture(t, async () => {
    await mutate?.();
    return true;
  });
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, "file.txt"), "before");
  mutate = () => (0, import_promises3.writeFile)(import_node_path3.default.join(project, "file.txt"), "after");
  await import_strict.default.rejects(tools.execute(project, "stage", ["file.txt"]), /승인 후 파일/);
  mutate = void 0;
  await (0, import_promises3.writeFile)(import_node_path3.default.join(project, ".gitattributes"), "*.txt filter=unsafe\n");
  await git(["config", "filter.unsafe.clean", "this-command-must-never-run"]);
  await import_strict.default.rejects(tools.execute(project, "stage", ["file.txt"]), /필터/);
  await git(["config", "include.path", "../external-config"]);
  await import_strict.default.rejects(tools.execute(project, "stage", ["file.txt"]), /include/);
});

// tests/external-read.test.ts
var import_node_test2 = require("node:test");
var import_strict2 = __toESM(require("node:assert/strict"), 1);
var import_promises5 = require("node:fs/promises");
var import_node_os2 = require("node:os");
var import_node_path5 = __toESM(require("node:path"), 1);

// distribution/external-read.ts
var import_promises4 = require("node:fs/promises");
var import_node_path4 = __toESM(require("node:path"), 1);
var ExternalRead = class {
  constructor(fullAccess, protectedRoots) {
    this.fullAccess = fullAccess;
    this.protectedRoots = protectedRoots;
  }
  check(signal) {
    signal?.throwIfAborted();
    if (!this.fullAccess()) throw new Error("\uD504\uB85C\uC81D\uD2B8 \uC678\uBD80 \uC77D\uAE30\uB294 Ned \uC804\uCCB4 \uAD8C\uD55C \uBAA8\uB4DC\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
  }
  async target(input, signal) {
    this.check(signal);
    if (!import_node_path4.default.isAbsolute(input) || /[\x00-\x1f]/.test(input) || /^(?:\\\\|\/\/)/.test(input) || process.platform === "win32" && /:/.test(input.slice(2))) throw new Error("\uB85C\uCEEC \uD30C\uC77C\uC758 \uC808\uB300 \uACBD\uB85C\uB97C \uC9C0\uC815\uD558\uC138\uC694. \uB124\uD2B8\uC6CC\uD06C \uACBD\uB85C\xB7\uC7A5\uCE58\xB7\uB300\uCCB4 \uB370\uC774\uD130 \uC2A4\uD2B8\uB9BC\uC740 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    const target = await (0, import_promises4.realpath)(input);
    for (const root of this.protectedRoots) {
      const relative = import_node_path4.default.relative(await (0, import_promises4.realpath)(root).catch(() => import_node_path4.default.resolve(root)), target);
      if (!relative || !relative.startsWith(".." + import_node_path4.default.sep) && relative !== ".." && !import_node_path4.default.isAbsolute(relative)) throw new Error("Ned\uC758 \uD0A4\xB7\uC2E4\uD589 \uC790\uACA9\uC99D\uBA85\uC774 \uC788\uB294 \uC571 \uAD00\uB9AC \uACBD\uB85C\uB294 \uC678\uBD80 \uC77D\uAE30\uC5D0 \uB178\uCD9C\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    }
    this.check(signal);
    return target;
  }
  async read(input, signal) {
    const target = await this.target(input, signal), info = await (0, import_promises4.lstat)(target);
    if (!info.isFile() || info.size > 2 * 1024 * 1024) throw new Error("2 MiB \uC774\uD558\uC758 \uC77C\uBC18 UTF-8 \uD14D\uC2A4\uD2B8 \uD30C\uC77C\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    const file = await (0, import_promises4.open)(target, "r");
    try {
      const stat2 = await file.stat();
      if (!stat2.isFile() || stat2.size > 2 * 1024 * 1024) throw new Error("\uD30C\uC77C \uC885\uB958 \uB610\uB294 \uD06C\uAE30\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      const bytes = Buffer.alloc(2 * 1024 * 1024 + 1);
      let bytesRead = 0;
      while (bytesRead < bytes.length) {
        this.check(signal);
        const next = await file.read(bytes, bytesRead, bytes.length - bytesRead, bytesRead);
        if (!next.bytesRead) break;
        bytesRead += next.bytesRead;
      }
      if (bytesRead > 2 * 1024 * 1024 || bytes.subarray(0, bytesRead).includes(0)) throw new Error("\uC77C\uBC18 UTF-8 \uD14D\uC2A4\uD2B8 \uD30C\uC77C\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, bytesRead));
      this.check(signal);
      return JSON.stringify({ path: input, resolvedPath: target, readOnly: true, text });
    } finally {
      await file.close();
    }
  }
  async list(input, signal) {
    const target = await this.target(input, signal);
    if (!(await (0, import_promises4.lstat)(target)).isDirectory()) throw new Error("\uD3F4\uB354\uC758 \uC808\uB300 \uACBD\uB85C\uB97C \uC9C0\uC815\uD558\uC138\uC694.");
    const entries = await (0, import_promises4.readdir)(target, { withFileTypes: true });
    this.check(signal);
    return JSON.stringify({
      path: input,
      resolvedPath: target,
      readOnly: true,
      truncated: entries.length > 1e3,
      entries: entries.slice(0, 1e3).map((e) => ({ name: e.name, kind: e.isSymbolicLink() ? "link" : e.isDirectory() ? "directory" : e.isFile() ? "file" : "other" }))
    });
  }
};

// tests/external-read.test.ts
(0, import_node_test2.test)("full access reads external UTF-8 and lists one directory; revoked modes and managed secrets remain blocked", async (t) => {
  const root = await (0, import_promises5.mkdtemp)(import_node_path5.default.join((0, import_node_os2.tmpdir)(), "ned-external-"));
  t.after(() => (0, import_promises5.rm)(root, { recursive: true, force: true }));
  const protectedDir = import_node_path5.default.join(root, "private");
  await (0, import_promises5.mkdir)(protectedDir);
  await (0, import_promises5.writeFile)(import_node_path5.default.join(protectedDir, "credentials"), "never expose");
  const note = import_node_path5.default.join(root, "note.md");
  await (0, import_promises5.writeFile)(note, "\uC678\uBD80 \uCC38\uC870 \uBB38\uC11C\n");
  let full = false;
  const reader = new ExternalRead(() => full, [protectedDir]);
  await import_strict2.default.rejects(reader.read(note), /전체 권한/);
  full = true;
  import_strict2.default.equal(JSON.parse(await reader.read(note)).text, "\uC678\uBD80 \uCC38\uC870 \uBB38\uC11C\n");
  import_strict2.default.ok(JSON.parse(await reader.list(root)).entries.some((e) => e.name === "note.md"));
  await import_strict2.default.rejects(reader.read(import_node_path5.default.join(protectedDir, "credentials")), /앱 관리/);
  await import_strict2.default.rejects(reader.read("//server/share/note.md"), /로컬/);
  await (0, import_promises5.writeFile)(import_node_path5.default.join(root, "binary"), Buffer.from([0, 1, 2]));
  await import_strict2.default.rejects(reader.read(import_node_path5.default.join(root, "binary")), /UTF-8/);
  full = false;
  await import_strict2.default.rejects(reader.list(root), /전체 권한/);
  full = true;
  const abort = new AbortController();
  abort.abort();
  await import_strict2.default.rejects(reader.read(note, abort.signal));
});

// tests/personal-pack-recovery.test.ts
var import_node_test3 = require("node:test");
var import_strict3 = __toESM(require("node:assert/strict"), 1);
var import_node_child_process3 = require("node:child_process");
var import_node_util2 = require("node:util");
var import_node_fs2 = require("node:fs");
var import_promises6 = require("node:fs/promises");
var import_node_os3 = require("node:os");
var import_node_path6 = __toESM(require("node:path"), 1);
var exec2 = (0, import_node_util2.promisify)(import_node_child_process3.execFile);
var python = process.env.NED_TEST_PYTHON ?? import_node_path6.default.resolve(".cache/openviking/env-linux/bin/python3");
(0, import_node_test3.test)("SDK validates and isolates a 13242-file legacy archive without changing content; tampered source is rejected", { skip: !(0, import_node_fs2.existsSync)(python), timeout: 12e4 }, async (t) => {
  const work = await (0, import_promises6.mkdtemp)(import_node_path6.default.join((0, import_node_os3.tmpdir)(), "ned-pack-large-"));
  t.after(() => (0, import_promises6.rm)(work, { recursive: true, force: true }));
  const archive = import_node_path6.default.join(work, "source.ovpack"), output = import_node_path6.default.join(work, "recovered.ovpack");
  const code = String.raw`
import hashlib,json,sys,zipfile
sha=lambda b:hashlib.sha256(b).hexdigest()
entries=[dict(path='',kind='directory',user_id='default'),dict(path='resources',kind='directory',user_id='default')]; data={}
for i in range(13242):
 p='resources/note-%05d.md'%i; b=('Reference %d\n'%i).encode();data[p]=b;entries.append(dict(path=p,kind='file',user_id='default',size=len(b),sha256=sha(b)))
records=[dict(path=e['path'],size=e['size'],sha256=e['sha256']) for e in entries if e['kind']=='file']
manifest=dict(format_version=3,kind='openviking.ovpack',root=dict(name='default',uri='viking://user/default',user_id='default'),entries=entries,content_sha256=sha(json.dumps(records,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()),index=dict(records=dict(path='_ovpack/index_records.jsonl',count=0,sha256=sha(b''))))
with zipfile.ZipFile(sys.argv[1],'w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('default/',b'');z.writestr('default/files/',b'');z.writestr('default/files/resources/',b'')
 for p,b in data.items():z.writestr('default/files/'+p,b)
 z.writestr('default/_ovpack/index_records.jsonl',b'');z.writestr('default/_ovpack/manifest.json',json.dumps(manifest))
`;
  await exec2(python, ["-I", "-B", "-c", code, archive]);
  const script = process.env.NED_TEST_RECOVERY_SCRIPT ?? import_node_path6.default.resolve("distribution/personal-pack-recovery.py");
  const launcher = process.env.NED_TEST_LAUNCHER ?? import_node_path6.default.resolve("scripts/openviking-launch.py");
  const tokenizers = process.env.NED_TEST_TOKENIZERS ?? import_node_path6.default.resolve("vendor/runtime/windows-x64/openviking/tokenizers");
  const user = "ned-import-" + "1".repeat(32);
  const result = await exec2(python, ["-I", "-B", script, archive, output, user, launcher, tokenizers], { timeout: 1e5, maxBuffer: 1024 * 1024 });
  import_strict3.default.equal(JSON.parse(result.stdout).root, "viking://user/" + user);
  await exec2(python, ["-I", "-B", "-c", String.raw`
import json,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as a, zipfile.ZipFile(sys.argv[2]) as b:
 old={n[len('default/files/'):]:a.read(n) for n in a.namelist() if n.startswith('default/files/') and not n.endswith('/')}
 new={n[len(sys.argv[3]+'/files/'):]:b.read(n) for n in b.namelist() if n.startswith(sys.argv[3]+'/files/') and not n.endswith('/')}
 assert len(old)==13242 and old==new
`, archive, output, user]);
  const bad = import_node_path6.default.join(work, "bad.ovpack");
  await exec2(python, ["-I", "-B", "-c", String.raw`
import sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as a,zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as b:
 for n in a.namelist():b.writestr(n,b'TAMPERED' if n=='default/files/resources/note-00000.md' else a.read(n))
`, archive, bad]);
  await import_strict3.default.rejects(exec2(python, ["-I", "-B", script, bad, import_node_path6.default.join(work, "must-not-exist.ovpack"), user, launcher, tokenizers], { timeout: 1e5 }));
  import_strict3.default.equal((0, import_node_fs2.existsSync)(import_node_path6.default.join(work, "must-not-exist.ovpack")), false);
});

// tests/ghidra-network.test.ts
var import_node_test4 = require("node:test");
var import_strict4 = __toESM(require("node:assert/strict"), 1);
var import_node_fs3 = require("node:fs");
var import_node_child_process4 = require("node:child_process");
var import_node_util3 = require("node:util");
var import_node_net = require("node:net");
var import_promises7 = require("node:fs/promises");
var import_node_path7 = __toESM(require("node:path"), 1);
var import_node_os4 = require("node:os");
var exec3 = (0, import_node_util3.promisify)(import_node_child_process4.execFile);
var resources = process.env.NED_TEST_RESOURCES ?? import_node_path7.default.resolve("release/ned/win-unpacked/resources");
var javaHome = process.env.NED_TEST_JAVA ?? import_node_path7.default.resolve(".cache/ghidra/linux-java/jdk-21.0.13+9");
var java = import_node_path7.default.join(javaHome, "bin", process.platform === "win32" ? "java.exe" : "java");
(0, import_node_test4.test)("pinned Java guard denies external DNS/socket and removal while allowing actual loopback IPC", { skip: !(0, import_node_fs3.existsSync)(java), timeout: 3e4 }, async (t) => {
  const root = await (0, import_promises7.mkdtemp)(import_node_path7.default.join((0, import_node_os4.tmpdir)(), "ned-java-guard-")), server = (0, import_node_net.createServer)((s) => s.end());
  t.after(async () => {
    server.close();
    await (0, import_promises7.rm)(root, { recursive: true, force: true });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const source = import_node_path7.default.join(root, "GuardProbe.java");
  await (0, import_promises7.writeFile)(source, `import java.net.*; public class GuardProbe { public static void main(String[] args) throws Exception {
    try (Socket local = new Socket("127.0.0.1", Integer.parseInt(args[0]))) { System.out.println("LOOPBACK_OK"); }
    try { new Socket("example.invalid", 443); throw new AssertionError("network guard missing"); }
    catch (SecurityException expected) { System.out.println(expected.getMessage()); }
    try { System.setSecurityManager(null); throw new AssertionError("guard removable"); }
    catch (SecurityException expected) { System.out.println(expected.getMessage()); }
  }}
`);
  const guard2 = import_node_path7.default.join(resources, "runtime/windows-x64/ghidra/network-guard.jar");
  await exec3(import_node_path7.default.join(javaHome, "bin", process.platform === "win32" ? "javac.exe" : "javac"), ["-d", root, source], { timeout: 25e3 });
  const result = await exec3(java, ["-Xbootclasspath/a:" + guard2, "-Djava.security.manager=NedOfflineNetworkGuard", "-cp", root, "GuardProbe", String(server.address().port)], { timeout: 25e3 });
  import_strict4.default.match(result.stdout, /LOOPBACK_OK/);
  import_strict4.default.match(result.stdout, /NED_GHIDRA_EXTERNAL_NETWORK_BLOCKED/);
  import_strict4.default.match(result.stdout, /NED_GHIDRA_NETWORK_GUARD_LOCKED/);
});

// tests/rea-ghidra.integration.test.ts
var import_node_test5 = require("node:test");
var import_strict5 = __toESM(require("node:assert/strict"), 1);
var import_node_fs4 = require("node:fs");
var import_promises9 = require("node:fs/promises");
var import_node_path9 = __toESM(require("node:path"), 1);
var import_node_os5 = require("node:os");

// distribution/rea-ghidra.ts
var import_node_crypto3 = require("node:crypto");
var import_promises8 = require("node:fs/promises");
var import_node_path8 = __toESM(require("node:path"), 1);

// src/main/mcp-client.ts
var import_node_child_process5 = require("node:child_process");
var import_node_url = require("node:url");
var PrivateMcpClient = class {
  constructor(launch) {
    this.launch = launch;
  }
  child;
  sequence = 0;
  buffer = "";
  bytes = 0;
  pending = /* @__PURE__ */ new Map();
  exited;
  startTask;
  closing;
  failure;
  get failureCode() {
    return this.failure;
  }
  closed = false;
  uncertain = false;
  get available() {
    return !!this.child && !this.closed && !this.uncertain && !this.closing && this.child.exitCode === null && this.child.signalCode === null;
  }
  get stoppingUnconfirmed() {
    return this.uncertain;
  }
  get stopping() {
    return !!this.closing;
  }
  rejectPending(message) {
    for (const request4 of this.pending.values()) {
      request4.cleanup();
      request4.reject(new Error(message));
    }
    this.pending.clear();
  }
  async start() {
    if (this.startTask) return this.startTask;
    this.startTask = this.open();
    return this.startTask;
  }
  async open() {
    if (this.closed || this.uncertain) throw new Error("\uC911\uC9C0\uB41C MCP \uC2E4\uD589\uC740 \uB2E4\uC2DC \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    const child = (0, import_node_child_process5.spawn)(this.launch.executable, this.launch.args, { cwd: this.launch.cwd, env: this.launch.env, windowsHide: true, stdio: "pipe", detached: process.platform !== "win32", shell: false });
    this.child = child;
    child.stdin.on("error", () => {
      this.failure ??= "input-failed";
      this.rejectPending("MCP \uC785\uB825 \uC804\uB2EC \uC2E4\uD328");
    });
    child.stdout.setEncoding("utf8");
    this.exited = new Promise((resolve) => {
      child.once("exit", () => {
        this.failure ??= "process-exited";
        this.rejectPending("MCP \uD504\uB85C\uC138\uC2A4\uAC00 \uC885\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        resolve();
      });
      child.once("error", () => {
        this.failure ??= "start-failed";
        this.rejectPending("\uACE0\uC815 MCP \uC2E4\uD589 \uD30C\uC77C\uC744 \uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
        resolve();
      });
    });
    child.stderr.on("data", (data) => this.launch.diagnostic?.(data.toString()));
    child.stdout.on("data", (data) => {
      this.bytes += Buffer.byteLength(data);
      this.buffer += data;
      if (this.buffer.length > 8 * 1024 * 1024 || this.bytes > 32 * 1024 * 1024) {
        this.failure = "output-limit";
        this.rejectPending("MCP \uC751\uB2F5 \uD06C\uAE30 \uC81C\uD55C \uCD08\uACFC");
        void this.close().catch(() => {
        });
        return;
      }
      const lines = this.buffer.split("\n");
      this.buffer = lines.pop();
      for (const line of lines) {
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          continue;
        }
        if (message.jsonrpc !== "2.0") continue;
        if (message.method && message.id !== void 0) {
          const reply = message.method === "roots/list" ? { jsonrpc: "2.0", id: message.id, result: { roots: [{ uri: (0, import_node_url.pathToFileURL)(this.launch.cwd).href, name: "Ned controlled snapshot" }] } } : { jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Ned does not provide sampling, elicitation or execution to MCP servers" } };
          child.stdin.write(JSON.stringify(reply) + "\n");
          continue;
        }
        const request4 = this.pending.get(message.id);
        if (!request4) continue;
        this.pending.delete(message.id);
        request4.cleanup();
        if (message.error) request4.reject(new Error("MCP \uC694\uCCAD\uC774 \uAC70\uC808\uB418\uC5C8\uC2B5\uB2C8\uB2E4."));
        else request4.resolve(message.result);
      }
    });
    try {
      const hello = await this.rpc("initialize", { protocolVersion: "2025-06-18", capabilities: { roots: { listChanged: false } }, clientInfo: { name: "Ned guarded offline host", version: "0.2.2" } });
      if (typeof hello?.protocolVersion !== "string" || !hello.serverInfo) throw new Error("MCP \uCD08\uAE30\uD654 \uC751\uB2F5 \uC624\uB958");
      child.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');
      const catalog = await this.rpc("tools/list", {});
      if (!Array.isArray(catalog?.tools)) throw new Error("MCP \uB3C4\uAD6C \uBAA9\uB85D \uC624\uB958");
      for (const name of this.launch.allowedTools) if (!catalog.tools.some((tool) => tool.name === name)) throw new Error(`\uACE0\uC815 MCP\uC5D0\uC11C \uAC80\uD1A0\uD55C \uB3C4\uAD6C\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: ${name}`);
    } catch (error) {
      await this.close();
      throw error;
    }
  }
  rpc(method, params, signal) {
    if (!this.child || this.closed || this.uncertain || this.child.exitCode !== null) return Promise.reject(new Error("MCP \uC2E4\uD589\uC774 \uC900\uBE44\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."));
    signal?.throwIfAborted();
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const cancel = () => {
        this.failure ??= signal?.aborted ? "cancelled" : "timeout";
        this.pending.delete(id);
        cleanup();
        void this.close().then(() => reject(new Error("MCP \uC2E4\uD589\uC744 \uC911\uC9C0\uD588\uC2B5\uB2C8\uB2E4.")), reject);
      };
      const timer = setTimeout(cancel, this.launch.timeout ?? 6e4);
      const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
      };
      this.pending.set(id, { resolve, reject, cleanup });
      signal?.addEventListener("abort", cancel, { once: true });
      this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n", (error) => {
        if (error) {
          this.failure ??= "input-failed";
          this.pending.delete(id);
          cleanup();
          reject(new Error("MCP \uC785\uB825 \uC804\uB2EC \uC2E4\uD328"));
        }
      });
    });
  }
  async call(name, args, signal) {
    if (!this.launch.allowedTools.includes(name)) throw new Error("\uC2B9\uC778 \uC911\uACC4\uC5D0 \uB4F1\uB85D\uB418\uC9C0 \uC54A\uC740 MCP \uB3C4\uAD6C\uC785\uB2C8\uB2E4.");
    await this.start();
    signal?.throwIfAborted();
    this.bytes = 0;
    const result = await this.rpc("tools/call", { name, arguments: structuredClone(args) }, signal);
    if (!Array.isArray(result?.content) || result.content.some((item) => item.type === "text" ? typeof item.text !== "string" : item.type !== "image" || !["image/png", "image/jpeg"].includes(item.mimeType ?? "") || typeof item.data !== "string" || item.data.length > 6 * 1024 * 1024 || !/^[A-Za-z0-9+/]*={0,2}$/.test(item.data))) throw new Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 MCP \uC751\uB2F5 \uD615\uC2DD\uC785\uB2C8\uB2E4.");
    return result;
  }
  close() {
    if (this.closing) return this.closing;
    this.closing = this.stop();
    return this.closing;
  }
  async stop() {
    this.closed = true;
    this.rejectPending("MCP \uC2E4\uD589\uC744 \uC911\uC9C0\uD588\uC2B5\uB2C8\uB2E4.");
    const child = this.child;
    if (!child) return;
    child.stdin.end();
    const kill = () => {
      if (child.exitCode !== null || !child.pid) return;
      try {
        if (process.platform === "win32") child.kill("SIGKILL");
        else process.kill(-child.pid, "SIGKILL");
      } catch {
      }
    };
    const force = setTimeout(kill, 1500);
    let timeout;
    try {
      await Promise.race([this.exited, new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("MCP \uD504\uB85C\uC138\uC2A4 \uC885\uB8CC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC0C8 \uC2E4\uD589\uC744 \uCC28\uB2E8\uD569\uB2C8\uB2E4.")), 7e3);
      })]);
    } catch (error) {
      this.uncertain = true;
      throw error;
    } finally {
      clearTimeout(force);
      clearTimeout(timeout);
    }
  }
};

// release-runtime-lock.json
var release_runtime_lock_default = {
  schemaVersion: 1,
  version: "0.3.8",
  baseline: {
    name: "Ned-0.3.6-rebuild1-win-x64.exe",
    bytes: 1176899012,
    sha256: "4ee7e8809c1a838e593c3654e99b1f37715fb625216290b7d89613463ea52252",
    sourceCommit: "5dab50279b91fdb0bb135793df699b57410c6e3d"
  },
  optimizerSha256: "6b9a223237c968bb6669e35429a2f619b8d46716c1c830f497386e4ea7256de3",
  reportSha256: "8b1d4091206bba375e5d603868fb40544c03f4e84461d772b665f52c48e1baf2",
  components: {
    openviking: {
      originalManifestSha256: "bd4d0e02913ce85d78d8b26b4cc016001043982ba280c2793b9bc0cf7a766d71",
      manifestSha256: "8ee132a83b1bd421620a5b8f4f5ae97c868d2b33a8e2b1a871e001825b2de7a0",
      files: 25295
    },
    mcp: {
      originalManifestSha256: "7a6d874cf3b0496b9cab29df216a8c3f55a71e0d4313a1907a79731349bcb27f",
      manifestSha256: "e9ca7b287740bf0de0cdef850209ba1082fdb0c5e79773e11458c0a1a72915f9",
      files: 21028
    },
    rea: {
      originalManifestSha256: "abee46b2136c20c176d5c495cff0ef1c2675fa618c3ed4daaecba957756b6f28",
      manifestSha256: "96b22a192568d40c14a7a0563b3af9b9f2c03b29e9bab255a42e0af7b6a89523",
      files: 9012
    },
    "agent-desktop": {
      originalManifestSha256: "e5f2ae573ad07e4643ffb712ba2eb65a9d315dedb0c0a40a4a1340fcd01fa6b7",
      manifestSha256: "5e20ba52fc353efa79e8e551ebd29b31d8499d09f859c1b2e0988999577a4685",
      files: 4
    },
    ghidra: {
      originalManifestSha256: "c59be72fd4c4c765f6b1a6f950d452e730ef46fb1667cfecb41073a568bfa2f3",
      manifestSha256: "c59be72fd4c4c765f6b1a6f950d452e730ef46fb1667cfecb41073a568bfa2f3",
      files: 3659
    }
  },
  ghidraInputs: {
    "ghidra-runtime-lock.json": "b8617e462c52ca3939945c496dfc440c955c3c33f8e6d0312ac00a788fcc2ca3",
    "scripts/bundle-ghidra.py": "143686cd4a89d17b9bcbdba34a43a9344f3458bdf1f4602860b5492039d3aa29",
    "scripts/CompileGhidraGuard.java": "692dcdce5c3394580746b1e85824a857241f4c3666f3f661286373668b8b59e6",
    "distribution/NedOfflineNetworkGuard.java": "f88062fdb7dabbdb416bfdf1b8e320f538aef643d3d34fa308595badcaa25e0a"
  },
  supervisorSha256: "e9b13ee63a9bfd44f8b8bb5753ce5ae7d3ba1242dcb5c34710cff88fd12a88b7"
};

// distribution/rea-ghidra.ts
var operations = {
  functions: "list_procedures",
  decompile: "procedure_pseudo_code",
  assembly: "procedure_assembly",
  callers: "procedure_callers",
  callees: "procedure_callees",
  references: "procedure_references",
  info: "procedure_info"
};
var ReaGhidra = class {
  constructor(root, resources3, approve, launch) {
    this.root = root;
    this.resources = resources3;
    this.approve = approve;
    this.launch = launch;
  }
  sessions = /* @__PURE__ */ new Map();
  busy = false;
  stopped = false;
  uncertain = false;
  verified;
  abort = new AbortController();
  async verify() {
    if (this.launch) return;
    return this.verified ??= (async () => {
      for (const name of ["rea", "ghidra"]) {
        const base = import_node_path8.default.join(this.resources, "runtime/windows-x64", name), bytes = await (0, import_promises8.readFile)(import_node_path8.default.join(base, "manifest.json"));
        const expected = release_runtime_lock_default.components[name]?.manifestSha256;
        if (!expected || (0, import_node_crypto3.createHash)("sha256").update(bytes).digest("hex") !== expected) throw new Error("REA/Ghidra \uACE0\uC815 manifest\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        const manifest = JSON.parse(bytes.toString()), expectedFiles = /* @__PURE__ */ new Set(["manifest.json", ...manifest.files.map((f) => f.path)]);
        const walk = async (folder = "") => {
          for (const entry of await (0, import_promises8.readdir)(import_node_path8.default.join(base, folder), { withFileTypes: true })) {
            const relative = folder ? folder + "/" + entry.name : entry.name;
            if (entry.isSymbolicLink()) throw new Error("REA/Ghidra \uB7F0\uD0C0\uC784 \uB9C1\uD06C\uB294 \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
            if (entry.isDirectory()) await walk(relative);
            else if (!entry.isFile() || !expectedFiles.has(relative)) throw new Error("REA/Ghidra manifest \uC678 \uD30C\uC77C\uC740 \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
          }
        };
        await walk();
        for (const item of manifest.files) {
          if (typeof item.path !== "string" || import_node_path8.default.isAbsolute(item.path) || item.path.includes("\\") || item.path.split("/").some((part) => !part || part === "." || part === "..")) throw new Error("REA/Ghidra manifest \uACBD\uB85C \uC624\uB958");
          const file = import_node_path8.default.join(base, item.path), info = await (0, import_promises8.lstat)(file);
          if (!info.isFile() || info.isSymbolicLink() || (0, import_node_crypto3.createHash)("sha256").update(await (0, import_promises8.readFile)(file)).digest("hex") !== item.sha256) throw new Error("REA/Ghidra \uBC88\uB4E4 \uBB34\uACB0\uC131 \uD655\uC778 \uC2E4\uD328");
        }
      }
    })();
  }
  async call(session, project, input, signal) {
    signal = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    if (this.busy || this.stopped || this.uncertain) throw new Error("Ghidra \uBD84\uC11D\uC774 \uC2E4\uD589 \uC911\uC774\uAC70\uB098 \uC774\uC804 \uC2E4\uD589\uC758 \uC885\uB8CC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    if (input.operation !== "functions" && !input.procedure) throw new Error("\uBA3C\uC800 functions \uACB0\uACFC\uC5D0\uC11C \uD568\uC218\uBA85 \uB610\uB294 \uC8FC\uC18C\uB97C \uD655\uC778\uD558\uACE0 procedure\uB97C \uC9C0\uC815\uD558\uC138\uC694.");
    this.busy = true;
    try {
      signal?.throwIfAborted();
      await this.verify();
      const source = await new ProjectFiles(project).resolve(input.path), info = await (0, import_promises8.lstat)(source);
      if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024 * 1024) throw new Error("64 MiB \uC774\uD558\uC758 \uD504\uB85C\uC81D\uD2B8 \uBC14\uC774\uB108\uB9AC\uB9CC \uBD84\uC11D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
      const bytes = await (0, import_promises8.readFile)(source);
      if (bytes.length > 64 * 1024 * 1024) throw new Error("\uBC14\uC774\uB108\uB9AC \uD06C\uAE30\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      const hash2 = (0, import_node_crypto3.createHash)("sha256").update(bytes).digest("hex"), key = JSON.stringify([project, input.path, hash2]);
      let current = this.sessions.get(session);
      if (current?.key !== key) {
        if (current) {
          await this.dispose(current);
          this.sessions.delete(session);
        }
        if (this.sessions.size >= 2) {
          const [id, oldest] = this.sessions.entries().next().value;
          await this.dispose(oldest);
          this.sessions.delete(id);
        }
        if (!await this.approve("REA Ghidra \uC815\uC801 \uBD84\uC11D \uC2B9\uC778", `\uB300\uD654: ${session}
\uD504\uB85C\uC81D\uD2B8: ${project}
\uB300\uC0C1: ${input.path}
SHA-256: ${hash2}
\uBC88\uB4E4 Ghidra 12.1.4\uC640 Java 21\uB85C \uBCF5\uC0AC\uBCF8\uC744 \uBD84\uC11D\uD569\uB2C8\uB2E4. \uBC14\uC774\uB108\uB9AC\uB294 \uC2E4\uD589\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBD84\uC11D \uCE90\uC2DC\uB294 Ned\uC758 \uC784\uC2DC \uD3F4\uB354\uC5D0\uB9CC \uC0DD\uC131\uD558\uBA70 \uC678\uBD80 \uB124\uD2B8\uC6CC\uD06C\uB294 Java \uAC00\uB4DC\uB85C \uCC28\uB2E8\uD569\uB2C8\uB2E4. \uC6D0\uBCF8\xB7\uD504\uB85C\uC81D\uD2B8 \uD30C\uC77C\uC740 \uBCC0\uACBD\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`, signal)) throw new Error("Ghidra \uBD84\uC11D\uC774 \uAC70\uC808\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        signal?.throwIfAborted();
        if (this.stopped) throw new Error("Ned \uC885\uB8CC \uC911\uC5D0\uB294 Ghidra \uBD84\uC11D\uC744 \uC2DC\uC791\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        if ((0, import_node_crypto3.createHash)("sha256").update(await (0, import_promises8.readFile)(source)).digest("hex") !== hash2) throw new Error("\uC2B9\uC778 \uD6C4 \uBC14\uC774\uB108\uB9AC\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uBD84\uC11D\uC744 \uC694\uCCAD\uD558\uC138\uC694.");
        signal?.throwIfAborted();
        await (0, import_promises8.mkdir)(import_node_path8.default.join(this.root, "ghidra-analysis"), { recursive: true, mode: 448 });
        const work = await (0, import_promises8.mkdtemp)(import_node_path8.default.join(this.root, "ghidra-analysis/session-"));
        const target = import_node_path8.default.join(work, "target.bin");
        await (0, import_promises8.writeFile)(target, bytes, { mode: 384 });
        const base = import_node_path8.default.join(this.resources, "runtime/windows-x64");
        const launch = this.launch ?? { rea: import_node_path8.default.join(base, "rea/scripts/rea.mjs"), ghidra: import_node_path8.default.join(base, "ghidra/ghidra"), java: import_node_path8.default.join(base, "ghidra/jdk"), guard: import_node_path8.default.join(base, "ghidra/network-guard.jar"), worker: import_node_path8.default.join(this.resources, "ned/rea-ghidra-worker.mjs") };
        const env = {
          HOME: work,
          USERPROFILE: work,
          APPDATA: work,
          LOCALAPPDATA: work,
          XDG_CONFIG_HOME: work,
          XDG_CACHE_HOME: work,
          TEMP: work,
          TMP: work,
          TMPDIR: work,
          ELECTRON_RUN_AS_NODE: "1",
          DO_NOT_TRACK: "1",
          REA_ANALYSIS_PROVIDER: "ghidra",
          GHIDRA_INSTALL_DIR: launch.ghidra,
          JAVA_HOME: launch.java,
          JAVA_TOOL_OPTIONS: '"-Xbootclasspath/a:' + launch.guard + '" -Djava.security.manager=NedOfflineNetworkGuard',
          PATH: import_node_path8.default.join(launch.java, "bin") + import_node_path8.default.delimiter + (process.platform === "win32" ? import_node_path8.default.join(process.env.SystemRoot ?? "C:\\Windows", "System32") : "/usr/bin:/bin")
        };
        for (const k of ["SystemRoot", "SYSTEMROOT", "WINDIR", "COMSPEC", "ComSpec"]) if (process.env[k]) env[k] = process.env[k];
        const node = launch.executable ?? process.execPath;
        const executable = process.platform === "win32" ? import_node_path8.default.join(base, "openviking/python/python.exe") : node;
        const args = process.platform === "win32" ? ["-I", "-B", import_node_path8.default.join(base, "openviking/sidecar-supervisor.py"), node, launch.worker, launch.rea, launch.guard] : [launch.worker, launch.rea, launch.guard];
        current = { key, work, client: new PrivateMcpClient({ executable, args, cwd: work, env, allowedTools: ["open_binary", "close_binary", ...Object.values(operations)], timeout: 3e5, diagnostic: launch.diagnostic }) };
        this.sessions.set(session, current);
        const opened = await current.client.call("open_binary", { path: target, provider_id: "ghidra" }, signal);
        if (opened.isError) {
          await this.dispose(current);
          this.sessions.delete(session);
          return JSON.stringify({ source: "morluto/rea", provider: "ghidra", isError: true, result: opened });
        }
      }
      const tool = operations[input.operation];
      const result = await current.client.call(tool, input.operation === "functions" ? {} : { procedure: input.procedure }, signal);
      return JSON.stringify({ source: "morluto/rea", provider: "ghidra", targetSha256: hash2, tool, targetExecuted: false, result });
    } catch (error) {
      const current = this.sessions.get(session);
      if (current && (signal?.aborted || !current.client.available)) {
        await this.dispose(current);
        this.sessions.delete(session);
      }
      throw error;
    } finally {
      this.busy = false;
    }
  }
  async dispose(current) {
    try {
      await current.client.close();
    } catch (error) {
      this.uncertain = true;
      throw error;
    }
    await (0, import_promises8.rm)(current.work, { recursive: true, force: true });
  }
  async cancel(session) {
    const current = this.sessions.get(session);
    if (current) {
      await this.dispose(current);
      this.sessions.delete(session);
    }
  }
  async close() {
    this.stopped = true;
    this.abort.abort();
    for (const [id] of this.sessions) await this.cancel(id);
  }
};

// tests/rea-ghidra.integration.test.ts
var resources2 = process.env.NED_TEST_RESOURCES ?? import_node_path9.default.resolve("release/ned/win-unpacked/resources");
var ghidra = process.env.NED_TEST_GHIDRA ?? import_node_path9.default.resolve(".cache/ghidra/source/ghidra_12.1.4_PUBLIC");
var java2 = process.env.NED_TEST_JAVA ?? import_node_path9.default.resolve(".cache/ghidra/linux-java/jdk-21.0.13+9");
var rea = import_node_path9.default.join(resources2, "runtime/windows-x64/rea/scripts/rea.mjs");
var guard = import_node_path9.default.join(resources2, "runtime/windows-x64/ghidra/network-guard.jar");
function tinyPE() {
  const b = Buffer.alloc(1024);
  b.write("MZ");
  b.writeUInt32LE(128, 60);
  b.write("PE\0\0", 128, "binary");
  const coff = 132, opt = 152;
  b.writeUInt16LE(34404, coff);
  b.writeUInt16LE(1, coff + 2);
  b.writeUInt16LE(240, coff + 16);
  b.writeUInt16LE(34, coff + 18);
  b.writeUInt16LE(523, opt);
  b.writeUInt32LE(512, opt + 4);
  b.writeUInt32LE(4096, opt + 16);
  b.writeUInt32LE(4096, opt + 20);
  b.writeBigUInt64LE(0x140000000n, opt + 24);
  b.writeUInt32LE(4096, opt + 32);
  b.writeUInt32LE(512, opt + 36);
  b.writeUInt16LE(6, opt + 40);
  b.writeUInt16LE(6, opt + 48);
  b.writeUInt32LE(8192, opt + 56);
  b.writeUInt32LE(512, opt + 60);
  b.writeUInt16LE(3, opt + 68);
  for (const offset of [72, 88]) b.writeBigUInt64LE(1048576n, opt + offset);
  for (const offset of [80, 96]) b.writeBigUInt64LE(4096n, opt + offset);
  b.writeUInt32LE(16, opt + 108);
  const section = opt + 240;
  b.write(".text", section);
  b.writeUInt32LE(6, section + 8);
  b.writeUInt32LE(4096, section + 12);
  b.writeUInt32LE(512, section + 16);
  b.writeUInt32LE(512, section + 20);
  b.writeUInt32LE(1610612768, section + 36);
  Buffer.from([184, 11, 0, 0, 0, 195]).copy(b, 512);
  return b;
}
(0, import_node_test5.test)("late Ghidra approval cannot start an analysis after Ned closes", async (t) => {
  const root = await (0, import_promises9.mkdtemp)(import_node_path9.default.join((0, import_node_os5.tmpdir)(), "ned-ghidra-stop-")), project = import_node_path9.default.join(root, "project");
  await (0, import_promises9.mkdir)(project);
  t.after(() => (0, import_promises9.rm)(root, { recursive: true, force: true }));
  await (0, import_promises9.writeFile)(import_node_path9.default.join(project, "target.exe"), tinyPE());
  let entered, release;
  const ready = new Promise((r) => {
    entered = r;
  }), decision = new Promise((r) => {
    release = r;
  });
  const analysis = new ReaGhidra(root, "", async () => {
    entered();
    return decision;
  }, { rea: "not-started", ghidra: "not-started", java: "not-started", guard: "not-started", worker: "not-started" });
  const run2 = analysis.call("late", project, { path: "target.exe", operation: "functions" });
  const rejected = import_strict5.default.rejects(run2, /abort/i);
  await ready;
  await analysis.close();
  release(true);
  await rejected;
  import_strict5.default.equal((0, import_node_fs4.existsSync)(import_node_path9.default.join(root, "ghidra-analysis")), false);
});
(0, import_node_test5.test)("REA opens an actual PE with Ghidra, lists functions and decompiles without executing the target", { skip: !(0, import_node_fs4.existsSync)(rea) || !(0, import_node_fs4.existsSync)(guard) || !(0, import_node_fs4.existsSync)(java2) || !(0, import_node_fs4.existsSync)(ghidra), timeout: 3e5 }, async (t) => {
  const root = await (0, import_promises9.mkdtemp)(import_node_path9.default.join((0, import_node_os5.tmpdir)(), "ned-ghidra-live-")), project = import_node_path9.default.join(root, "project");
  await (0, import_promises9.mkdir)(project);
  if (process.platform !== "win32") {
    await (0, import_promises9.chmod)(import_node_path9.default.join(ghidra, "support/analyzeHeadless"), 493);
    await (0, import_promises9.chmod)(import_node_path9.default.join(ghidra, "support/launch.sh"), 493);
    for (const name of await (0, import_promises9.readdir)(import_node_path9.default.join(ghidra, "Ghidra/Features/Decompiler/os/linux_x86_64"))) await (0, import_promises9.chmod)(import_node_path9.default.join(ghidra, "Ghidra/Features/Decompiler/os/linux_x86_64", name), 493);
  }
  const target = import_node_path9.default.join(project, "calculation.exe");
  await (0, import_promises9.writeFile)(target, tinyPE());
  const original = await (0, import_promises9.readFile)(target);
  let diagnostics = "", approvals = 0;
  const analysis = new ReaGhidra(root, resources2, async () => {
    approvals++;
    return true;
  }, { rea, ghidra, java: java2, guard, worker: process.env.NED_TEST_GHIDRA_WORKER ?? import_node_path9.default.resolve("distribution/rea-ghidra-worker.mjs"), diagnostic: (text) => {
    diagnostics = (diagnostics + text).slice(-1e4);
  } });
  t.after(async () => {
    await analysis.close();
    await (0, import_promises9.rm)(root, { recursive: true, force: true });
  });
  const functions = JSON.parse(await analysis.call("session-a", project, { path: "calculation.exe", operation: "functions" }));
  import_strict5.default.ok(!functions.isError && !functions.result?.isError, JSON.stringify(functions) + "\n" + diagnostics);
  import_strict5.default.ok(JSON.stringify(functions).includes("140001000"), JSON.stringify(functions));
  const decompiled = JSON.parse(await analysis.call("session-a", project, { path: "calculation.exe", operation: "decompile", procedure: "entry" }));
  import_strict5.default.ok(!decompiled.result.isError, JSON.stringify(decompiled));
  import_strict5.default.match(JSON.stringify(decompiled), /(?:return[^;]{0,60}(?:0xb|11)|0xb)/i);
  import_strict5.default.equal(approvals, 1);
  import_strict5.default.equal(decompiled.targetExecuted, false);
  import_strict5.default.deepEqual(await (0, import_promises9.readFile)(target), original);
  t.diagnostic("Real REA 6.8.0 / Ghidra 12.1.4 decompiled a synthetic PE; original binary was never executed or modified.");
});

// tests/zed-native.test.ts
var import_node_test6 = require("node:test");
var import_strict6 = __toESM(require("node:assert/strict"), 1);
var import_node_http4 = require("node:http");
var import_promises13 = require("node:fs/promises");
var import_node_path14 = __toESM(require("node:path"), 1);
var import_node_os6 = require("node:os");

// distribution/ned/zed-models.ts
var import_node_http2 = require("node:http");
var import_node_crypto5 = require("node:crypto");

// src/main/model-gateway.ts
var import_node_http = require("node:http");
var import_node_https = require("node:https");
var import_node_crypto4 = require("node:crypto");

// src/main/compaction-policy.ts
var nudge = "The previous response did not fill in the required summary template. Do not call tools. Return the summary as text using the exact section headings from the template.";
var content = (message) => typeof message?.content === "string" ? message.content : Array.isArray(message?.content) ? message.content.filter((p) => p.type === "text").map((p) => p.text).join("\n") : "";
var instruction = (message) => message?.role === "user" && (content(message).startsWith("You MUST summarize the conversation above into a structured summary") || content(message).startsWith("Update the existing checkpoint in the conversation above into one consolidated summary.")) && content(message).includes("## Next Move") && content(message).includes("## Relevant Files") && content(message).includes("Do not continue the task or call tools.");
function isCompaction(body) {
  if (!Array.isArray(body?.messages)) return false;
  const last = body.messages.at(-1);
  return instruction(last) || last?.role === "user" && content(last) === nudge && instruction(body.messages.at(-2));
}
function summaryRequest(body, outputLimit, retry, disableThinking) {
  const supplied = body.max_completion_tokens ?? body.max_tokens;
  const ceiling = typeof supplied === "number" && supplied > 0 ? Math.min(supplied, outputLimit) : outputLimit;
  const target = Math.max(32, Math.floor(ceiling * (retry ? 0.2 : 0.4)));
  const prompt = `\uB300\uD654\uB97C \uB2E4\uC74C \uC791\uC5C5\uC790\uAC00 \uC774\uC5B4\uAC08 \uC694\uC57D\uC73C\uB85C \uC815\uB9AC\uD558\uC138\uC694. ${target} \uD1A0\uD070 \uC774\uB0B4\uB85C \uC9E7\uAC8C \uC791\uC131\uD558\uC138\uC694. \uC124\uBA85\xB7\uCD94\uB860\xB7\uCF54\uB4DC \uBCF5\uC0AC\xB7\uB3C4\uAD6C \uD638\uCD9C\uC744 \uC0DD\uB7B5\uD558\uACE0, \uBBF8\uD574\uACB0 \uC0AC\uC6A9\uC790 \uC694\uAD6C\xB7\uACB0\uC815\xB7\uD604\uC7AC \uC791\uC5C5 \uC0C1\uD0DC\xB7\uB2E4\uC74C \uD589\uB3D9\xB7\uD544\uC218 \uACBD\uB85C\uB9CC \uBCF4\uC874\uD558\uC138\uC694. \uD30C\uC77C\uC5D0\uC11C \uB2E4\uC2DC \uD655\uC778\uD560 \uC0C1\uC138 \uB0B4\uC6A9\uC740 \uACBD\uB85C\uB85C \uB300\uC2E0\uD558\uC138\uC694. \uB2E4\uC74C \uC81C\uBAA9\uC744 \uADF8\uB300\uB85C \uC0AC\uC6A9\uD558\uACE0 \uBD88\uD544\uC694\uD55C \uC808\uC740 \uC0DD\uB7B5\uD558\uC138\uC694:
## Objective
## Requirements
## Decisions
## Work State
### Completed
### Active
### Blocked
## Next Move
## Relevant Files
## Important Context`;
  const messages = body.messages.slice();
  const index = instruction(messages.at(-1)) ? messages.length - 1 : messages.length - 2;
  messages[index] = { role: "user", content: prompt };
  const result = { ...body, messages, tool_choice: "none", ...disableThinking ? {
    reasoning_effort: "none",
    chat_template_kwargs: { ...body.chat_template_kwargs, enable_thinking: false }
  } : {} };
  delete result.tools;
  delete result.functions;
  delete result.function_call;
  if (body.max_completion_tokens !== void 0) {
    result.max_completion_tokens = ceiling;
    delete result.max_tokens;
  } else result.max_tokens = ceiling;
  return result;
}
function summaryOutcome(bytes, streaming) {
  try {
    const replies = streaming ? bytes.toString("utf8").split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).filter((line) => line && line !== "[DONE]").map((line) => JSON.parse(line)) : [JSON.parse(bytes.toString("utf8"))];
    let terminal = "", text = "";
    for (const reply of replies) {
      if (reply.error) return "invalid";
      for (const choice of reply.choices ?? []) {
        if (choice.index !== void 0 && choice.index !== 0) return "invalid";
        const message = choice.delta ?? choice.message;
        if (message?.tool_calls?.length || message?.function_call) return "invalid";
        if (typeof message?.content === "string") text += message.content;
        if (choice.finish_reason) terminal = choice.finish_reason;
      }
    }
    return terminal === "length" ? "length" : terminal === "stop" && text.trim() ? "complete" : "invalid";
  } catch {
    return "invalid";
  }
}
function addUsage(previous, current) {
  if (!previous) return current;
  const result = { ...current };
  for (const [key, value] of Object.entries(previous)) {
    if (["prompt_tokens", "completion_tokens", "total_tokens", "input_tokens", "output_tokens", "cached_tokens", "reasoning_tokens", "audio_tokens", "accepted_prediction_tokens", "rejected_prediction_tokens"].includes(key) && typeof value === "number" && Number.isFinite(value))
      result[key] = value + (typeof current?.[key] === "number" ? current[key] : 0);
    else if (["prompt_tokens_details", "completion_tokens_details", "input_tokens_details", "output_tokens_details"].includes(key) && value && typeof value === "object" && !Array.isArray(value)) result[key] = addUsage(value, current?.[key]);
  }
  return result;
}
function summaryUsage(bytes, streaming) {
  try {
    const data = streaming ? bytes.toString("utf8").split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).filter((line) => line && line !== "[DONE]").map((line) => JSON.parse(line)) : [JSON.parse(bytes.toString("utf8"))];
    return data.slice().reverse().find((reply) => reply.usage)?.usage;
  } catch {
    return void 0;
  }
}
function withSummaryUsage(bytes, streaming, previous) {
  if (!previous) return bytes;
  if (!streaming) {
    const reply = JSON.parse(bytes.toString("utf8"));
    return Buffer.from(JSON.stringify({ ...reply, usage: addUsage(previous, reply.usage) }));
  }
  let merged = false;
  const result = bytes.toString("utf8").replace(/^data:([^\r\n]*)/gm, (line, raw) => {
    if (!raw.trim() || raw.trim() === "[DONE]") return line;
    const reply = JSON.parse(raw);
    if (!reply.usage) return line;
    merged = true;
    return "data: " + JSON.stringify({ ...reply, usage: addUsage(previous, reply.usage) });
  });
  return merged ? Buffer.from(result) : bytes;
}

// src/main/model-http-error.ts
var fields = ["messages", "tools", "tool_choice", "parallel_tool_calls", "max_tokens", "max_completion_tokens", "reasoning_effort", "chat_template_kwargs", "response_format", "stream", "stream_options", "temperature", "model"];
function modelRequestShape(body) {
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const roles = Object.fromEntries(["system", "developer", "user", "assistant", "tool"].map((role) => [role, messages.filter((m) => m?.role === role).length]));
  return {
    messages: messages.length,
    roles,
    tools: Array.isArray(body?.tools) ? body.tools.length : 0,
    fields: fields.filter((field) => Object.hasOwn(body ?? {}, field)),
    streaming: body?.stream === true,
    ...Number.isSafeInteger(body?.max_tokens) ? { maxTokens: body.max_tokens } : {},
    ...Number.isSafeInteger(body?.max_completion_tokens) ? { maxCompletionTokens: body.max_completion_tokens } : {}
  };
}
function classifyModelHttpError(raw) {
  let value;
  try {
    value = JSON.parse(raw.slice(0, 65536));
  } catch {
    return { reason: "unclassified" };
  }
  const error = value?.error ?? value;
  const text = [error?.message, error?.type, typeof error?.code === "string" ? error.code : void 0].filter((v) => typeof v === "string").join(" ").slice(0, 16e3).toLowerCase();
  const param = typeof error?.param === "string" && fields.includes(error.param) ? error.param : void 0;
  const reason = /too many|overload|server.{0,16}busy|concurren|queue.{0,30}(?:full|limit|exceed)|rate.?limit|capacity.{0,16}(?:exceed|limit)|max_num_seqs/.test(text) ? "capacity" : /out of memory|insufficient.{0,16}memory|kv.?cache.{0,30}(?:full|space|memory|exceed)/.test(text) ? "memory" : /context.{0,30}(?:length|limit|window)|input.{0,20}token.{0,20}(?:exceed|limit|long)|prompt.{0,20}(?:too long|exceed)/.test(text) ? "context-limit" : /max_(?:completion_)?tokens.{0,60}(?:exceed|greater|less|must|limit|maximum)|max.?output.?tokens/.test(text) ? "output-limit" : /(?:system|developer).{0,40}(?:message|role)|roles? must alternate|chat.{0,12}template/.test(text) ? "message-format" : /tool.{0,50}(?:schema|parser|choice|required|support|invalid)|function.{0,25}(?:schema|name|invalid)/.test(text) ? "tool-format" : /model.{0,50}(?:not found|does not exist|unknown|invalid|not available)/.test(text) ? "model-id" : /extra inputs|extra_forbidden|unsupported|unknown parameter|unrecognized|not permitted|unexpected keyword|reasoning_effort/.test(text) ? "unsupported-option" : /unauthori|api.?key|authentication|permission denied/.test(text) ? "authentication" : "unclassified";
  return { reason, ...param ? { field: param } : {} };
}
function modelHttpExplanation(reason) {
  return {
    capacity: "\uC11C\uBC84\uAC00 \uB3D9\uC2DC \uC694\uCCAD\xB7\uB300\uAE30\uC5F4 \uD55C\uB3C4\uC640 \uAD00\uB828\uB41C \uC624\uB958\uB97C \uBC18\uD658\uD588\uC2B5\uB2C8\uB2E4.",
    memory: "\uC11C\uBC84\uAC00 \uBAA8\uB378 \uBA54\uBAA8\uB9AC\xB7KV \uCE90\uC2DC \uBD80\uC871\uC744 \uBC18\uD658\uD588\uC2B5\uB2C8\uB2E4.",
    "context-limit": "\uC11C\uBC84\uAC00 \uC785\uB825 \uBB38\uB9E5 \uD55C\uB3C4 \uCD08\uACFC\uB97C \uBC18\uD658\uD588\uC2B5\uB2C8\uB2E4.",
    "output-limit": "\uC11C\uBC84\uAC00 \uCD9C\uB825 \uD1A0\uD070 \uC124\uC815\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "message-format": "\uC11C\uBC84\uAC00 \uBA54\uC2DC\uC9C0 \uC5ED\uD560\xB7\uB300\uD654 \uD15C\uD50C\uB9BF \uD615\uC2DD\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "tool-format": "\uC11C\uBC84\uAC00 \uB3C4\uAD6C \uC815\uC758\xB7\uB3C4\uAD6C \uC120\uD0DD \uD615\uC2DD\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "model-id": "\uC11C\uBC84\uAC00 \uBAA8\uB378 ID\uB97C \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "unsupported-option": "\uC11C\uBC84\uAC00 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC694\uCCAD \uC635\uC158\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    authentication: "\uC11C\uBC84\uAC00 \uC778\uC99D\xB7\uC811\uADFC \uAD8C\uD55C\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    unclassified: "\uC11C\uBC84\uC758 \uAD6C\uCCB4\uC801\uC778 \uAC70\uC808 \uC0AC\uC720\uB97C \uC548\uC804\uD558\uAC8C \uBD84\uB958\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
  }[reason] ?? "";
}

// src/main/model-gateway.ts
var duration = (value, fallback) => value === false ? false : typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 864e5 ? value : fallback;
var ModelGateway = class {
  constructor(config, transport = {}, diagnostic, skillContext, outputLimit = 4096, behavior = "ned") {
    this.config = config;
    this.transport = transport;
    this.diagnostic = diagnostic;
    this.skillContext = skillContext;
    this.outputLimit = outputLimit;
    this.behavior = behavior;
  }
  token = (0, import_node_crypto4.randomBytes)(32).toString("hex");
  baseUrl = "";
  server;
  requests = /* @__PURE__ */ new Set();
  async start() {
    this.server = (0, import_node_http.createServer)(async (req, res) => {
      if (req.headers.authorization !== `Bearer ${this.token}`) {
        res.writeHead(401).end();
        return;
      }
      if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
        res.writeHead(403).end();
        return;
      }
      const abort = new AbortController();
      this.requests.add(abort);
      const started = Date.now();
      const timers = /* @__PURE__ */ new Map();
      let upstream, finished = false, phase = "request";
      let requestBytes = 0, responseBytes = 0, streaming = false, upstreamStatus;
      let httpError, requestShape;
      const cleanup = () => {
        for (const t of timers.values()) clearTimeout(t);
        timers.clear();
        this.requests.delete(abort);
      };
      const fail = (code, message, http = 502, error) => {
        if (finished) return;
        finished = true;
        cleanup();
        const osCode = error?.code;
        this.diagnostic?.({
          schemaVersion: 1,
          recordedAt: (/* @__PURE__ */ new Date()).toISOString(),
          code,
          phase,
          elapsedMs: Date.now() - started,
          requestBytes,
          responseBytes,
          streaming,
          ...upstreamStatus ? { upstreamStatus } : {},
          ...httpError ? { httpError } : {},
          ...requestShape ? { requestShape } : {},
          ...typeof osCode === "string" && /^[A-Z0-9_]{1,32}$/.test(osCode) ? { osError: osCode } : {}
        });
        upstream?.destroy();
        if (res.destroyed) return;
        const body = JSON.stringify({ error: { message: message + " [" + code + "]", type: "ned_gateway", code } });
        if (res.headersSent) {
          res.end("data: " + body + "\n\n");
        } else res.writeHead(http, { "Content-Type": "application/json" }).end(body);
      };
      const timer = (name, ms, code) => {
        const old = timers.get(name);
        if (old) clearTimeout(old);
        timers.delete(name);
        if (ms !== false) timers.set(name, setTimeout(() => fail(code, "\uC0AC\uB0B4 \uBAA8\uB378 \uC751\uB2F5 \uB300\uAE30 \uC2DC\uAC04\uC774 \uCD08\uACFC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", 504), ms));
      };
      abort.signal.addEventListener("abort", () => {
        if (!finished) {
          finished = true;
          cleanup();
          upstream?.destroy();
          if (!res.destroyed) res.destroy();
        }
      }, { once: true });
      res.once("close", () => {
        if (!finished) abort.abort();
      });
      try {
        const chunks = [];
        for await (const chunk of req) {
          requestBytes += chunk.length;
          if (requestBytes > 32 * 1024 * 1024) {
            fail("LV_MODEL_REQUEST_SIZE", "\uBAA8\uB378 \uC694\uCCAD\uC774 32 MiB \uC81C\uD55C\uC744 \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4.", 413);
            return;
          }
          chunks.push(chunk);
        }
        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString());
        } catch {
          fail("LV_MODEL_REQUEST_JSON", "\uBAA8\uB378 \uC694\uCCAD JSON\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", 400);
          return;
        }
        if (body?.model !== this.config.model.id) {
          finished = true;
          cleanup();
          res.writeHead(403).end();
          return;
        }
        const compacting = this.behavior === "ned" && isCompaction(body), policy = this.config.compaction;
        const summaryLimit = Math.min(this.outputLimit, policy?.maxOutputTokens ?? 8192);
        const original = body;
        const withoutThinking = (policy?.disableQwenThinking ?? true) && /qwen/i.test(this.config.model.id);
        if (compacting) body = summaryRequest(original, summaryLimit, false, withoutThinking);
        const guidance = this.behavior === "native" || compacting || body.tool_choice === "none" ? void 0 : await this.skillContext?.(body.messages, requestBytes);
        if (guidance && Array.isArray(body.messages)) {
          const first = body.messages[0];
          if (first?.role === "system" && typeof first.content === "string")
            body.messages = [{ ...first, content: first.content + "\n\n" + guidance }, ...body.messages.slice(1)];
          else if (first?.role === "system" && Array.isArray(first.content) && first.content.every((part) => part?.type === "text" && typeof part.text === "string"))
            body.messages = [{ ...first, content: [...first.content, { type: "text", text: guidance }] }, ...body.messages.slice(1)];
          else body.messages = [{ role: "system", content: guidance }, ...body.messages];
        }
        if (abort.signal.aborted) return;
        const target = new URL(this.config.model.baseUrl.replace(/\/$/, "") + "/chat/completions");
        const totalMs = duration(this.transport.timeout, false);
        const headerMs = duration(this.transport.headerTimeout, false);
        const chunkMs = duration(this.transport.chunkTimeout, false);
        phase = "headers";
        timer("total", totalMs, "LV_MODEL_TOTAL_TIMEOUT");
        let attempt = 0, previousUsage;
        const dispatch = (requestBody) => {
          requestShape = modelRequestShape(requestBody);
          const bytes = Buffer.from(JSON.stringify(requestBody));
          requestBytes = bytes.length;
          const currentAttempt = ++attempt;
          timer("headers", headerMs, "LV_MODEL_HEADER_TIMEOUT");
          upstream = (target.protocol === "https:" ? import_node_https.request : import_node_http.request)(target, {
            method: "POST",
            agent: false,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.model.apiKey}`, "Content-Length": String(bytes.length) }
          }, (response) => {
            if (finished) {
              response.destroy();
              return;
            }
            const old = timers.get("headers");
            if (old) clearTimeout(old);
            timers.delete("headers");
            upstreamStatus = response.statusCode ?? 502;
            if (upstreamStatus < 200 || upstreamStatus >= 300) {
              const chunks2 = [];
              let size = 0, reported = false;
              const report = () => {
                if (reported || finished || currentAttempt !== attempt) return;
                reported = true;
                clearTimeout(errorTimer);
                httpError = classifyModelHttpError(Buffer.concat(chunks2).toString("utf8"));
                fail("LV_MODEL_HTTP", `\uC0AC\uB0B4 \uBAA8\uB378 HTTP ${upstreamStatus}: ${modelHttpExplanation(httpError.reason)}`, upstreamStatus >= 400 ? upstreamStatus : 502);
              };
              const errorTimer = setTimeout(report, 2e3);
              timers.set("http-error", errorTimer);
              response.on("data", (chunk) => {
                size += chunk.length;
                responseBytes += chunk.length;
                if (size <= 65536) chunks2.push(chunk);
                else report();
              });
              response.once("end", report);
              response.once("error", report);
              response.once("aborted", report);
              return;
            }
            phase = "body";
            const type = String(response.headers["content-type"] ?? "application/json");
            streaming = /^text\/event-stream(?:;|$)/i.test(type);
            const buffered = [];
            timer("chunk", chunkMs, "LV_MODEL_CHUNK_TIMEOUT");
            if (streaming && !compacting) res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
            let attemptBytes = 0;
            response.on("data", (chunk) => {
              if (finished || currentAttempt !== attempt) return;
              responseBytes += chunk.length;
              timer("chunk", chunkMs, "LV_MODEL_CHUNK_TIMEOUT");
              if (!streaming || compacting) {
                attemptBytes += chunk.length;
                if (attemptBytes > 32 * 1024 * 1024) {
                  fail("LV_MODEL_RESPONSE_SIZE", "\uBAA8\uB378 \uC751\uB2F5 \uD06C\uAE30 \uC81C\uD55C\uC744 \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4.");
                  response.destroy();
                  return;
                }
                buffered.push(chunk);
              }
            });
            response.once("aborted", () => {
              if (currentAttempt === attempt) fail("LV_MODEL_UPSTREAM_RESET", "\uC0AC\uB0B4 \uBAA8\uB378\uC774 \uC751\uB2F5\uC744 \uB05D\uB0B4\uAE30 \uC804\uC5D0 \uC5F0\uACB0\uC744 \uC885\uB8CC\uD588\uC2B5\uB2C8\uB2E4.");
            });
            response.once("error", (error) => {
              if (currentAttempt === attempt) fail("LV_MODEL_UPSTREAM_RESET", "\uC0AC\uB0B4 \uBAA8\uB378 \uC751\uB2F5 \uC5F0\uACB0\uC774 \uB04A\uACBC\uC2B5\uB2C8\uB2E4.", 502, error);
            });
            response.once("end", () => {
              if (finished || currentAttempt !== attempt) return;
              if (compacting) {
                const result = summaryOutcome(Buffer.concat(buffered), streaming);
                if (result === "length" && attempt === 1 && (policy?.retryOnLength ?? true) && !abort.signal.aborted) {
                  previousUsage = summaryUsage(Buffer.concat(buffered), streaming);
                  this.diagnostic?.({
                    schemaVersion: 1,
                    recordedAt: (/* @__PURE__ */ new Date()).toISOString(),
                    code: "NED_COMPACTION_RETRY",
                    phase: "body",
                    elapsedMs: Date.now() - started,
                    requestBytes,
                    responseBytes,
                    streaming,
                    attempts: attempt
                  });
                  const old2 = timers.get("chunk");
                  if (old2) clearTimeout(old2);
                  timers.delete("chunk");
                  phase = "headers";
                  dispatch(summaryRequest(original, summaryLimit, true, withoutThinking));
                  return;
                }
                if (result !== "complete") {
                  fail(result === "length" ? "NED_COMPACTION_OUTPUT_LIMIT" : "NED_COMPACTION_INCOMPLETE", result === "length" ? "\uC694\uC57D \uCD9C\uB825 \uD55C\uB3C4\uB97C \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uB300\uD654\uB294 \uC720\uC9C0\uD569\uB2C8\uB2E4. \uBAA8\uB378 limit.output\uACFC \uC11C\uBC84 \uCD9C\uB825 \uD55C\uB3C4\xB7thinking \uC9C0\uC6D0\uC744 \uD655\uC778\uD558\uACE0 \uC694\uC57D\uC744 \uB2E4\uC2DC \uC694\uCCAD\uD558\uC138\uC694." : "\uC644\uC804\uD55C \uC694\uC57D\uC744 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uB300\uD654\uB294 \uC720\uC9C0\uD558\uBA70 \uC798\uB9B0 \uACB0\uACFC\uB098 \uB3C4\uAD6C \uD638\uCD9C\uC740 \uC801\uC6A9\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", 422);
                  return;
                }
              }
              finished = true;
              cleanup();
              if (streaming && compacting) res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" }).end(withSummaryUsage(Buffer.concat(buffered), true, previousUsage));
              else if (streaming) res.end();
              else res.writeHead(200, { "Content-Type": type }).end(compacting ? withSummaryUsage(Buffer.concat(buffered), false, previousUsage) : Buffer.concat(buffered));
            });
            if (streaming && !compacting) response.pipe(res, { end: false });
          });
          upstream.on("socket", (socket) => socket.setKeepAlive(true, 6e4));
          upstream.once("error", (error) => {
            if (currentAttempt === attempt) fail("LV_MODEL_CONNECTION", "\uC0AC\uB0B4 \uBAA8\uB378\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.", 502, error);
          });
          upstream.end(bytes);
        };
        dispatch(body);
      } catch (error) {
        if (!res.destroyed) fail("LV_MODEL_CONNECTION", "\uC0AC\uB0B4 \uBAA8\uB378 \uC694\uCCAD\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.", 502, error);
        else {
          finished = true;
          cleanup();
        }
      }
    });
    this.server.requestTimeout = 0;
    await new Promise((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", resolve);
    });
    const address = this.server.address();
    if (!address || typeof address === "string") throw new Error("\uBAA8\uB378 \uC911\uACC4 \uD3EC\uD2B8 \uD560\uB2F9 \uC2E4\uD328");
    this.baseUrl = `http://127.0.0.1:${address.port}/v1`;
  }
  async close() {
    for (const request4 of this.requests) request4.abort();
    this.server?.closeAllConnections();
    await new Promise((resolve) => {
      if (!this.server?.listening) resolve();
      else this.server.close(() => resolve());
    });
  }
};

// distribution/ned/zed-models.ts
function wireOptions(options) {
  const names = { parallelToolCalls: "parallel_tool_calls", reasoningEffort: "reasoning_effort", topP: "top_p", topK: "top_k", minP: "min_p", presencePenalty: "presence_penalty", frequencyPenalty: "frequency_penalty" };
  return Object.fromEntries(Object.entries(options).filter(([key]) => !["model", "messages", "tools", "tool_choice", "stream", "baseURL", "apiKey", "APIKey", "headers", "timeout", "headerTimeout", "chunkTimeout"].includes(key)).map(([key, value]) => [names[key] ?? key, value]));
}
var ZedModels = class {
  constructor(config, diagnostic) {
    this.config = config;
    this.diagnostic = diagnostic;
  }
  server;
  gateways = [];
  requests = /* @__PURE__ */ new Set();
  connection;
  stopped = false;
  ready;
  start() {
    if (this.stopped) return Promise.reject(Error("Zed \uBAA8\uB378 \uC5F0\uACB0\uC744 \uC911\uC9C0\uD588\uC2B5\uB2C8\uB2E4."));
    return this.ready ??= this.boot();
  }
  async boot() {
    const models = this.config.models ?? [{ ...this.config.model, name: this.config.model.id }];
    const entries = /* @__PURE__ */ new Map();
    const catalog = [];
    try {
      for (const model of models) {
        if (this.stopped) throw Error("Zed \uBAA8\uB378 \uC5F0\uACB0\uC744 \uC911\uC9C0\uD588\uC2B5\uB2C8\uB2E4.");
        const provider = model.providerID ? this.config.providers?.[model.providerID] : void 0;
        const definition = model.modelKey ? provider?.models[model.modelKey] : void 0;
        const settings = { ...provider?.settings, ...definition?.settings };
        const gateway = new ModelGateway({ ...this.config, model }, { timeout: settings.timeout, headerTimeout: settings.headerTimeout, chunkTimeout: settings.chunkTimeout }, this.diagnostic, void 0, definition?.limit?.output ?? 4096, "native");
        this.gateways.push(gateway);
        await gateway.start();
        const name = "model_" + (0, import_node_crypto5.createHash)("sha256").update(JSON.stringify([model.name, model.providerID, model.modelKey, model.id])).digest("hex").slice(0, 24);
        const options = wireOptions({ ...settings, ...definition?.body });
        entries.set(name, { id: model.id, gateway, options });
        catalog.push({
          name,
          display_name: model.name,
          max_tokens: definition?.limit?.context ?? 32768,
          max_output_tokens: definition?.limit?.output ?? 4096,
          capabilities: { tools: definition?.capabilities?.tools ?? true, images: !!definition?.capabilities?.input?.includes("image"), parallel_tool_calls: !!options.parallel_tool_calls, chat_completions: true, max_tokens_parameter: true }
        });
      }
      const token = (0, import_node_crypto5.randomBytes)(32).toString("hex");
      this.server = (0, import_node_http2.createServer)(async (req, res) => {
        if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
          res.writeHead(403).end();
          return;
        }
        if (req.headers.authorization !== "Bearer " + token) {
          res.writeHead(401).end();
          return;
        }
        let upstream;
        const cancel = () => {
          upstream?.destroy();
          if (upstream) this.requests.delete(upstream);
        };
        res.once("close", cancel);
        req.once("aborted", cancel);
        try {
          const chunks = [];
          let size = 0;
          for await (const bytes of req) {
            size += bytes.length;
            if (size > 32 * 1024 * 1024) {
              res.writeHead(413).end();
              return;
            }
            chunks.push(bytes);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          const selected2 = entries.get(body.model);
          if (!selected2) {
            res.writeHead(403).end();
            return;
          }
          if (this.stopped || res.destroyed) return;
          const data = Buffer.from(JSON.stringify({ ...body, ...selected2.options, model: selected2.id }));
          upstream = (0, import_node_http2.request)(selected2.gateway.baseUrl + "/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + selected2.gateway.token, "Content-Type": "application/json", "Content-Length": data.length } }, (response) => {
            res.writeHead(response.statusCode ?? 502, { "Content-Type": response.headers["content-type"] ?? "application/json", "Cache-Control": "no-store" });
            response.on("error", () => res.destroy());
            response.pipe(res);
          });
          this.requests.add(upstream);
          upstream.once("close", () => {
            if (upstream) this.requests.delete(upstream);
          });
          upstream.once("error", () => {
            if (!res.headersSent) res.writeHead(502).end(JSON.stringify({ error: { message: "Zed \uBAA8\uB378 \uC5F0\uACB0 \uC2E4\uD328", code: "NED_ZED_MODEL_TRANSPORT" } }));
            else res.destroy();
          });
          upstream.end(data);
        } catch {
          if (!res.headersSent) res.writeHead(400).end();
          else res.destroy();
        }
      });
      this.server.requestTimeout = 0;
      await new Promise((resolve, reject) => {
        this.server.once("error", reject);
        this.server.listen(0, "127.0.0.1", resolve);
      });
      if (this.stopped) throw Error("Zed \uBAA8\uB378 \uC5F0\uACB0\uC744 \uC911\uC9C0\uD588\uC2B5\uB2C8\uB2E4.");
      const address = this.server.address();
      if (!address || typeof address === "string") throw Error("Zed \uBAA8\uB378 \uD3EC\uD2B8 \uD560\uB2F9 \uC2E4\uD328");
      const selected = models.findIndex((m) => m.name === this.config.defaultModel);
      this.connection = { baseUrl: `http://127.0.0.1:${address.port}/v1`, token, models: catalog, defaultModel: catalog[Math.max(0, selected)].name };
      return this.connection;
    } catch (error) {
      await this.dispose();
      throw error;
    }
  }
  ports() {
    return [...this.gateways.map((g) => Number(new URL(g.baseUrl || "http://127.0.0.1:1").port)), ...this.connection ? [Number(new URL(this.connection.baseUrl).port)] : []];
  }
  async dispose() {
    for (const operation of this.requests) operation.destroy();
    this.server?.closeAllConnections();
    await new Promise((r) => {
      if (!this.server?.listening) r();
      else this.server.close(() => r());
    });
    await Promise.all(this.gateways.map((g) => g.close()));
  }
  async close() {
    this.stopped = true;
    await this.ready?.catch(() => {
    });
    await this.dispose();
  }
};

// distribution/ned/profile.ts
var import_node_path13 = __toESM(require("node:path"), 1);
var import_promises12 = require("node:fs/promises");
var import_node_http3 = require("node:http");

// distribution/ned/agent-launch.ts
var import_node_path10 = __toESM(require("node:path"), 1);
function agentLaunch(executable, agent, descriptor, platform = process.platform) {
  const env = { ELECTRON_RUN_AS_NODE: "1" };
  if (platform !== "win32") return { command: executable, args: [agent, descriptor], env };
  const paths = import_node_path10.default.win32;
  if (![executable, agent, descriptor].every((value) => paths.isAbsolute(value))) throw new Error("Managed agent paths must be absolute");
  const resources3 = paths.dirname(paths.dirname(agent));
  return {
    command: paths.join(resources3, "runtime/windows-x64/openviking/python/python.exe"),
    args: ["-I", "-B", paths.join(resources3, "runtime/windows-x64/openviking/sidecar-supervisor.py"), executable, agent, descriptor],
    env
  };
}

// distribution/ned/editor-instructions.ts
var import_node_fs5 = require("node:fs");
var import_promises10 = require("node:fs/promises");
var import_node_path11 = __toESM(require("node:path"), 1);
var koreanInstructions = `## Speak Korean

You must speak or write only in Korean.

You may use English words for technical terms or proper nouns that are difficult to replace.

Never use other languages, such as Chinese or Japanese.`;
async function ensureEditorInstructions(directory) {
  const file = import_node_path11.default.join(directory, "AGENTS.md");
  const existing = await (0, import_promises10.lstat)(file).catch((error) => {
    if (error.code === "ENOENT") return void 0;
    throw error;
  });
  if (existing && (!existing.isFile() || existing.isSymbolicLink() || existing.size > 1024 * 1024)) throw new Error("Ned AGENTS.md \uD30C\uC77C \uD615\uC2DD \uB610\uB294 \uACBD\uB85C\uB97C \uD655\uC778\uD558\uC138\uC694.");
  const before = existing ? await (0, import_promises10.readFile)(file, "utf8") : "";
  if (before.replace(/\r\n/g, "\n").includes(koreanInstructions)) return;
  const separator = !before || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const handle = await (0, import_promises10.open)(file, import_node_fs5.constants.O_CREAT | import_node_fs5.constants.O_WRONLY | import_node_fs5.constants.O_APPEND | (import_node_fs5.constants.O_NOFOLLOW ?? 0), 384);
  try {
    await handle.writeFile(separator + koreanInstructions + "\n", "utf8");
  } finally {
    await handle.close();
  }
}

// distribution/ned/editor-preferences.ts
var import_node_path12 = __toESM(require("node:path"), 1);
var import_promises11 = require("node:fs/promises");
var import_node_crypto6 = require("node:crypto");

// node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += "\n";
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "	";
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += "\n";
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      // tokens: []{}:,
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      // strings
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      // comments
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      // numbers
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      // found a minus, followed by a number so
      // we fall through to proceed with scanning
      // numbers
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      // literals and unknown symbols
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes2) {
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

// node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + " ".repeat(index);
    })
  },
  "	": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + "	".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "	".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + "	".repeat(index);
    })
  }
};
var supportedEols = ["\n", "\r", "\r\n"];

// node_modules/jsonc-parser/lib/esm/impl/format.js
function format(documentText, range, options) {
  let initialIndentLevel;
  let formatText;
  let formatTextStart;
  let rangeStart;
  let rangeEnd;
  if (range) {
    rangeStart = range.offset;
    rangeEnd = rangeStart + range.length;
    formatTextStart = rangeStart;
    while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
      formatTextStart--;
    }
    let endOffset = rangeEnd;
    while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
      endOffset++;
    }
    formatText = documentText.substring(formatTextStart, endOffset);
    initialIndentLevel = computeIndentLevel(formatText, options);
  } else {
    formatText = documentText;
    initialIndentLevel = 0;
    formatTextStart = 0;
    rangeStart = 0;
    rangeEnd = documentText.length;
  }
  const eol = getEOL(options, documentText);
  const eolFastPathSupported = supportedEols.includes(eol);
  let numberLineBreaks = 0;
  let indentLevel = 0;
  let indentValue;
  if (options.insertSpaces) {
    indentValue = cachedSpaces[options.tabSize || 4] ?? repeat(cachedSpaces[1], options.tabSize || 4);
  } else {
    indentValue = "	";
  }
  const indentType = indentValue === "	" ? "	" : " ";
  let scanner = createScanner(formatText, false);
  let hasError = false;
  function newLinesAndIndent() {
    if (numberLineBreaks > 1) {
      return repeat(eol, numberLineBreaks) + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    const amountOfSpaces = indentValue.length * (initialIndentLevel + indentLevel);
    if (!eolFastPathSupported || amountOfSpaces > cachedBreakLinesWithSpaces[indentType][eol].length) {
      return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    if (amountOfSpaces <= 0) {
      return eol;
    }
    return cachedBreakLinesWithSpaces[indentType][eol][amountOfSpaces];
  }
  function scanNext() {
    let token = scanner.scan();
    numberLineBreaks = 0;
    while (token === 15 || token === 14) {
      if (token === 14 && options.keepLines) {
        numberLineBreaks += 1;
      } else if (token === 14) {
        numberLineBreaks = 1;
      }
      token = scanner.scan();
    }
    hasError = token === 16 || scanner.getTokenError() !== 0;
    return token;
  }
  const editOperations = [];
  function addEdit(text, startOffset, endOffset) {
    if (!hasError && (!range || startOffset < rangeEnd && endOffset > rangeStart) && documentText.substring(startOffset, endOffset) !== text) {
      editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
    }
  }
  let firstToken = scanNext();
  if (options.keepLines && numberLineBreaks > 0) {
    addEdit(repeat(eol, numberLineBreaks), 0, 0);
  }
  if (firstToken !== 17) {
    let firstTokenStart = scanner.getTokenOffset() + formatTextStart;
    let initialIndent = indentValue.length * initialIndentLevel < 20 && options.insertSpaces ? cachedSpaces[indentValue.length * initialIndentLevel] : repeat(indentValue, initialIndentLevel);
    addEdit(initialIndent, formatTextStart, firstTokenStart);
  }
  while (firstToken !== 17) {
    let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
    let secondToken = scanNext();
    let replaceContent = "";
    let needsLineBreak = false;
    while (numberLineBreaks === 0 && (secondToken === 12 || secondToken === 13)) {
      let commentTokenStart = scanner.getTokenOffset() + formatTextStart;
      addEdit(cachedSpaces[1], firstTokenEnd, commentTokenStart);
      firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
      needsLineBreak = secondToken === 12;
      replaceContent = needsLineBreak ? newLinesAndIndent() : "";
      secondToken = scanNext();
    }
    if (secondToken === 2) {
      if (firstToken !== 1) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 1) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else if (secondToken === 4) {
      if (firstToken !== 3) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 3) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else {
      switch (firstToken) {
        case 3:
        case 1:
          indentLevel++;
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 5:
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 12:
          replaceContent = newLinesAndIndent();
          break;
        case 13:
          if (numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 6:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 10:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (secondToken === 6 && !needsLineBreak) {
            replaceContent = "";
          }
          break;
        case 7:
        case 8:
        case 9:
        case 11:
        case 2:
        case 4:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else {
            if ((secondToken === 12 || secondToken === 13) && !needsLineBreak) {
              replaceContent = cachedSpaces[1];
            } else if (secondToken !== 5 && secondToken !== 17) {
              hasError = true;
            }
          }
          break;
        case 16:
          hasError = true;
          break;
      }
      if (numberLineBreaks > 0 && (secondToken === 12 || secondToken === 13)) {
        replaceContent = newLinesAndIndent();
      }
    }
    if (secondToken === 17) {
      if (options.keepLines && numberLineBreaks > 0) {
        replaceContent = newLinesAndIndent();
      } else {
        replaceContent = options.insertFinalNewline ? eol : "";
      }
    }
    const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
    addEdit(replaceContent, firstTokenEnd, secondTokenStart);
    firstToken = secondToken;
  }
  return editOperations;
}
function repeat(s, count) {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += s;
  }
  return result;
}
function computeIndentLevel(content2, options) {
  let i = 0;
  let nChars = 0;
  const tabSize = options.tabSize || 4;
  while (i < content2.length) {
    let ch = content2.charAt(i);
    if (ch === cachedSpaces[1]) {
      nChars++;
    } else if (ch === "	") {
      nChars += tabSize;
    } else {
      break;
    }
    i++;
  }
  return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === "\r") {
      if (i + 1 < text.length && text.charAt(i + 1) === "\n") {
        return "\r\n";
      }
      return "\r";
    } else if (ch === "\n") {
      return "\n";
    }
  }
  return options && options.eol || "\n";
}
function isEOL(text, offset) {
  return "\r\n".indexOf(text.charAt(offset)) !== -1;
}

// node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object2 = {};
      onValue(object2);
      previousParents.push(currentParent);
      currentParent = object2;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentParent = { type: "array", offset: -1, length: -1, children: [], parent: void 0 };
  function ensurePropertyComplete(endOffset) {
    if (currentParent.type === "property") {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent;
    }
  }
  function onValue(valueNode) {
    currentParent.children.push(valueNode);
    return valueNode;
  }
  const visitor = {
    onObjectBegin: (offset) => {
      currentParent = onValue({ type: "object", offset, length: -1, parent: currentParent, children: [] });
    },
    onObjectProperty: (name, offset, length) => {
      currentParent = onValue({ type: "property", offset, length: -1, parent: currentParent, children: [] });
      currentParent.children.push({ type: "string", value: name, offset, length, parent: currentParent });
    },
    onObjectEnd: (offset, length) => {
      ensurePropertyComplete(offset + length);
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset, length) => {
      currentParent = onValue({ type: "array", offset, length: -1, parent: currentParent, children: [] });
    },
    onArrayEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value, offset, length) => {
      onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep, offset, length) => {
      if (currentParent.type === "property") {
        if (sep === ":") {
          currentParent.colonOffset = offset;
        } else if (sep === ",") {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  const result = currentParent.children[0];
  if (result) {
    delete result.parent;
  }
  return result;
}
function findNodeAtLocation(root, path16) {
  if (!root) {
    return void 0;
  }
  let node = root;
  for (let segment of path16) {
    if (typeof segment === "string") {
      if (node.type !== "object" || !Array.isArray(node.children)) {
        return void 0;
      }
      let found = false;
      for (const propertyNode of node.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment && propertyNode.children.length === 2) {
          node = propertyNode.children[1];
          found = true;
          break;
        }
      }
      if (!found) {
        return void 0;
      }
    } else {
      const index = segment;
      if (node.type !== "array" || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
        return void 0;
      }
      node = node.children[index];
    }
  }
  return node;
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(
            14
            /* ParseErrorCode.InvalidUnicode */
          );
          break;
        case 5:
          handleError(
            15
            /* ParseErrorCode.InvalidEscapeCharacter */
          );
          break;
        case 3:
          handleError(
            13
            /* ParseErrorCode.UnexpectedEndOfNumber */
          );
          break;
        case 1:
          if (!disallowComments) {
            handleError(
              11
              /* ParseErrorCode.UnexpectedEndOfComment */
            );
          }
          break;
        case 2:
          handleError(
            12
            /* ParseErrorCode.UnexpectedEndOfString */
          );
          break;
        case 6:
          handleError(
            16
            /* ParseErrorCode.InvalidCharacter */
          );
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(
              10
              /* ParseErrorCode.InvalidCommentToken */
            );
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(
            1
            /* ParseErrorCode.InvalidSymbol */
          );
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(
            2
            /* ParseErrorCode.InvalidNumberFormat */
          );
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
    } else {
      handleError(5, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [
        2
        /* SyntaxKind.CloseBraceToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(4, [], [
          4,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(8, [
        4
        /* SyntaxKind.CloseBracketToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray();
      case 1:
        return parseObject();
      case 10:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}
function getNodeType(value) {
  switch (typeof value) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "object": {
      if (!value) {
        return "null";
      } else if (Array.isArray(value)) {
        return "array";
      }
      return "object";
    }
    default:
      return "null";
  }
}

// node_modules/jsonc-parser/lib/esm/impl/edit.js
function setProperty(text, originalPath, value, options) {
  const path16 = originalPath.slice();
  const errors = [];
  const root = parseTree(text, errors);
  let parent = void 0;
  let lastSegment = void 0;
  while (path16.length > 0) {
    lastSegment = path16.pop();
    parent = findNodeAtLocation(root, path16);
    if (parent === void 0 && value !== void 0) {
      if (typeof lastSegment === "string") {
        value = { [lastSegment]: value };
      } else {
        value = [value];
      }
    } else {
      break;
    }
  }
  if (!parent) {
    if (value === void 0) {
      throw new Error("Can not delete in empty document");
    }
    return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, options);
  } else if (parent.type === "object" && typeof lastSegment === "string" && Array.isArray(parent.children)) {
    const existing = findNodeAtLocation(parent, [lastSegment]);
    if (existing !== void 0) {
      if (value === void 0) {
        if (!existing.parent) {
          throw new Error("Malformed AST");
        }
        const propertyIndex = parent.children.indexOf(existing.parent);
        let removeBegin;
        let removeEnd = existing.parent.offset + existing.parent.length;
        if (propertyIndex > 0) {
          let previous = parent.children[propertyIndex - 1];
          removeBegin = previous.offset + previous.length;
        } else {
          removeBegin = parent.offset + 1;
          if (parent.children.length > 1) {
            let next = parent.children[1];
            removeEnd = next.offset;
          }
        }
        return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: "" }, options);
      } else {
        return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, options);
      }
    } else {
      if (value === void 0) {
        return [];
      }
      const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
      const index = options.getInsertionIndex ? options.getInsertionIndex(parent.children.map((p) => p.children[0].value)) : parent.children.length;
      let edit;
      if (index > 0) {
        let previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      } else if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty + "," };
      }
      return withFormatting(text, edit, options);
    }
  } else if (parent.type === "array" && typeof lastSegment === "number" && Array.isArray(parent.children)) {
    const insertIndex = lastSegment;
    if (insertIndex === -1) {
      const newProperty = `${JSON.stringify(value)}`;
      let edit;
      if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        const previous = parent.children[parent.children.length - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else if (value === void 0 && parent.children.length >= 0) {
      const removalIndex = lastSegment;
      const toRemove = parent.children[removalIndex];
      let edit;
      if (parent.children.length === 1) {
        edit = { offset: parent.offset + 1, length: parent.length - 2, content: "" };
      } else if (parent.children.length - 1 === removalIndex) {
        let previous = parent.children[removalIndex - 1];
        let offset = previous.offset + previous.length;
        let parentEndOffset = parent.offset + parent.length;
        edit = { offset, length: parentEndOffset - 2 - offset, content: "" };
      } else {
        edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: "" };
      }
      return withFormatting(text, edit, options);
    } else if (value !== void 0) {
      let edit;
      const newProperty = `${JSON.stringify(value)}`;
      if (!options.isArrayInsertion && parent.children.length > lastSegment) {
        const toModify = parent.children[lastSegment];
        edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
      } else if (parent.children.length === 0 || lastSegment === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + "," };
      } else {
        const index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
        const previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else {
      throw new Error(`Can not ${value === void 0 ? "remove" : options.isArrayInsertion ? "insert" : "modify"} Array index ${insertIndex} as length is not sufficient`);
    }
  } else {
    throw new Error(`Can not add ${typeof lastSegment !== "number" ? "index" : "property"} to parent of type ${parent.type}`);
  }
}
function withFormatting(text, edit, options) {
  if (!options.formattingOptions) {
    return [edit];
  }
  let newText = applyEdit(text, edit);
  let begin = edit.offset;
  let end = edit.offset + edit.content.length;
  if (edit.length === 0 || edit.content.length === 0) {
    while (begin > 0 && !isEOL(newText, begin - 1)) {
      begin--;
    }
    while (end < newText.length && !isEOL(newText, end)) {
      end++;
    }
  }
  const edits = format(newText, { offset: begin, length: end - begin }, { ...options.formattingOptions, keepLines: false });
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit2 = edits[i];
    newText = applyEdit(newText, edit2);
    begin = Math.min(begin, edit2.offset);
    end = Math.max(end, edit2.offset + edit2.length);
    end += edit2.content.length - edit2.length;
  }
  const editLength = text.length - (newText.length - end) - begin;
  return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
  return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}

// node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError2) {
  ScanError2[ScanError2["None"] = 0] = "None";
  ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
  ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
  ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
  ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
  ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
  ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind2) {
  SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
  SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
  SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
  SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
  SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
  SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
  SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
  SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
  SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
  SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
  SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
  SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
  SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
  SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
  SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var parse2 = parse;
var parseTree2 = parseTree;
var ParseErrorCode;
(function(ParseErrorCode2) {
  ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
  ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
  ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
  ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
  ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
  ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
  ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
  ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
  ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
  ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
  ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
function modify(text, path16, value, options) {
  return setProperty(text, path16, value, options);
}
function applyEdits(text, edits) {
  let sortedEdits = edits.slice(0).sort((a, b) => {
    const diff = a.offset - b.offset;
    if (diff === 0) {
      return a.length - b.length;
    }
    return diff;
  });
  let lastModifiedOffset = text.length;
  for (let i = sortedEdits.length - 1; i >= 0; i--) {
    let e = sortedEdits[i];
    if (e.offset + e.length <= lastModifiedOffset) {
      text = applyEdit(text, e);
    } else {
      throw new Error("Overlapping edit");
    }
    lastModifiedOffset = e.offset;
  }
  return text;
}

// distribution/ned/editor-preferences.ts
var uiKeys = /* @__PURE__ */ new Set([
  "theme",
  "icon_theme",
  "buffer_font_family",
  "buffer_font_fallbacks",
  "buffer_font_size",
  "buffer_font_weight",
  "buffer_font_features",
  "buffer_line_height",
  "agent_ui_font_family",
  "agent_ui_font_size",
  "agent_buffer_font_family",
  "agent_buffer_font_size",
  "git_commit_buffer_font_size",
  "mermaid_font_family",
  "ui_font_family",
  "ui_font_fallbacks",
  "ui_font_size",
  "ui_font_weight",
  "ui_font_features",
  "tab_size",
  "hard_tabs",
  "vim_mode",
  "base_keymap",
  "relative_line_numbers",
  "preferred_line_length",
  "soft_wrap",
  "show_whitespaces",
  "cursor_blink",
  "cursor_shape",
  "scrollbar",
  "gutter",
  "minimap",
  "indent_guides",
  "project_panel",
  "outline_panel",
  "git_panel",
  "tab_bar",
  "status_bar",
  "tabs",
  "toolbar",
  "centered_layout",
  "window_decorations",
  "use_system_window_tabs",
  "autosave",
  "auto_signature_help",
  "hover_popover_enabled",
  "inlay_hints",
  "inlay_hints_modifiers",
  "multi_cursor_modifier",
  "seed_search_query_from_cursor"
]);
var nestedUI = {
  agent: ["dock", "button", "flexible", "default_width", "default_height", "max_content_width", "threads_sidebar", "expand_edit_card", "expand_terminal_card", "thinking_display", "use_modifier_to_send", "message_editor_min_lines", "show_turn_stats", "show_merge_conflict_indicator", "notify_when_agent_waiting", "play_sound_when_agent_done", "prevent_idle_sleep"],
  collaboration_panel: ["dock", "default_width", "default_height"],
  notification_panel: ["dock", "default_width", "default_height"],
  title_bar: ["show_branch_name", "show_project_items", "show_menus", "show_project_name", "show_user_picture"],
  terminal: ["dock", "button", "default_width", "default_height", "font_family", "font_fallbacks", "font_size", "font_features", "font_weight", "line_height", "cursor_shape", "blinking", "scrollbar"]
};
var languageUI = ["tab_size", "hard_tabs", "preferred_line_length", "soft_wrap", "show_whitespaces", "inlay_hints", "indent_guides"];
var object = (value) => !!value && typeof value === "object" && !Array.isArray(value);
function decode(text, name) {
  text = text.replace(/^\ufeff/, "");
  const errors = [];
  const value = parse2(text, errors, { allowTrailingComma: true, allowEmptyContent: true });
  const tree = parseTree2(text, [], { allowTrailingComma: true, allowEmptyContent: true });
  let duplicate = false;
  const visit2 = (node) => {
    if (!node) return;
    if (node.type === "object") {
      const names = node.children?.map((p) => p.children[0].value) ?? [];
      if (new Set(names).size !== names.length) duplicate = true;
    }
    node.children?.forEach(visit2);
  };
  visit2(tree);
  if (value === void 0 && !errors.length) return {};
  if (errors.length || duplicate || !object(value)) throw new Error(`\uD3B8\uC9D1\uAE30 ${name} \uC124\uC815\uC758 JSONC \uBB38\uBC95\uC744 \uD655\uC778\uD558\uC138\uC694. \uAE30\uC874 \uD30C\uC77C\uC744 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.`);
  return value;
}
async function readOwned(file) {
  const info = await (0, import_promises11.lstat)(file).catch((error) => {
    if (error.code === "ENOENT") return void 0;
    throw error;
  });
  if (!info) return void 0;
  if (!info.isFile() || info.isSymbolicLink() || info.size > 2 * 1024 * 1024) throw new Error("\uD3B8\uC9D1\uAE30 \uC124\uC815\uC740 \uC571 \uC18C\uC720 \uD3F4\uB354\uC758 \uC77C\uBC18 \uD30C\uC77C\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.");
  return (0, import_promises11.readFile)(file, "utf8");
}
async function editorPreferences(data, managed) {
  const file = import_node_path12.default.join(data, "config/settings.json"), original = await readOwned(file);
  const legacy = original === void 0 ? await readOwned(import_node_path12.default.join(data, "appearance.json")) : void 0;
  const saved = original === void 0 ? {} : decode(original, "settings.json");
  const fallback = legacy === void 0 ? {} : decode(legacy, "appearance.json");
  const chosen = original === void 0 ? fallback : saved;
  const desired = /* @__PURE__ */ Object.create(null);
  for (const key of uiKeys) if (Object.hasOwn(chosen, key)) desired[key] = chosen[key];
  for (const [group, keys] of Object.entries(nestedUI)) if (object(chosen[group])) {
    desired[group] = Object.fromEntries(keys.filter((key) => Object.hasOwn(chosen[group], key)).map((key) => [key, chosen[group][key]]));
  }
  if (object(chosen.languages)) desired.languages = Object.fromEntries(Object.entries(chosen.languages).filter(([, v]) => object(v)).map(([name, v]) => [name, Object.fromEntries(languageUI.filter((k) => Object.hasOwn(v, k)).map((k) => [k, v[k]]))]));
  for (const [key, value] of Object.entries(managed)) {
    if (key === "restore_on_startup" && ["none", "empty_tab", "last_workspace", "last_session", "launchpad"].includes(chosen[key])) desired[key] = chosen[key];
    else if (key === "languages") {
      desired.languages ??= {};
      for (const [language, settings] of Object.entries(value)) desired.languages[language] = { ...desired.languages[language], ...settings };
    } else desired[key] = object(value) ? { ...desired[key], ...value } : value;
  }
  const native = managed.language_models?.openai_compatible?.Intranet;
  if (native && chosen.language_models?.openai_compatible?.Intranet && object(chosen.agent)) {
    if (["write", "ask", "minimal"].includes(chosen.agent.default_profile)) desired.agent.default_profile = chosen.agent.default_profile;
    const selected = chosen.agent.default_model;
    if (object(selected) && selected.provider === "Intranet" && native.available_models.some((m) => m.name === selected.model))
      desired.agent.default_model = Object.fromEntries(["provider", "model", "enable_thinking", "effort", "speed"].filter((k) => Object.hasOwn(selected, k)).map((k) => [k, selected[k]]));
  }
  const bom = original?.startsWith("\uFEFF") ? "\uFEFF" : "";
  let updated = (original ?? "{}\n").slice(bom.length);
  if (!parseTree2(updated, [], { allowTrailingComma: true, allowEmptyContent: true })) updated += "\n{}\n";
  const options = { formattingOptions: { insertSpaces: true, tabSize: 2, eol: updated.includes("\r\n") ? "\r\n" : "\n" } };
  const reconcile = (at, before, after) => {
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    if (object(before) && object(after)) {
      for (const key of Object.keys(before)) if (!Object.hasOwn(after, key)) updated = applyEdits(updated, modify(updated, [...at, key], void 0, options));
      for (const [key, value] of Object.entries(after)) reconcile([...at, key], before[key], value);
    } else updated = applyEdits(updated, modify(updated, at, after, options));
  };
  reconcile([], saved, desired);
  const result = bom + updated;
  if (original !== void 0 && result !== original) {
    await (0, import_promises11.writeFile)(import_node_path12.default.join(data, "config/settings.before-ned-0.3.3.jsonc"), original, { flag: "wx", mode: 384 }).catch((error) => {
      if (error.code !== "EEXIST") throw error;
    });
  }
  return result;
}
async function ensureEditorKeymap(file) {
  if (await readOwned(file) !== void 0) return;
  await (0, import_promises11.writeFile)(file, JSON.stringify([{ context: "Workspace", bindings: { "ctrl-shift-a": ["agent::NewExternalAgentThread", { agent: "Ned" }] } }], null, 2) + "\n", { flag: "wx", mode: 384 }).catch((error) => {
    if (error.code !== "EEXIST") throw error;
  });
}
async function writeEditorPreferences(file, text) {
  const temp = file + "." + (0, import_node_crypto6.randomUUID)() + ".tmp";
  try {
    await (0, import_promises11.writeFile)(temp, text, { flag: "wx", mode: 384 });
    await (0, import_promises11.rename)(temp, file);
  } finally {
    await (0, import_promises11.unlink)(temp).catch(() => {
    });
  }
}

// distribution/ned/profile.ts
var EditorNetwork = class {
  server;
  active = /* @__PURE__ */ new Set();
  async start(modelBaseUrl) {
    const allowed = modelBaseUrl ? new URL(modelBaseUrl) : void 0;
    if (allowed && (allowed.protocol !== "http:" || allowed.hostname !== "127.0.0.1" || allowed.pathname !== "/v1" || allowed.username || allowed.password || allowed.search || allowed.hash)) throw new Error("\uC571 \uC18C\uC720\uC758 \uB85C\uCEEC Zed \uBAA8\uB378 \uC8FC\uC18C\uB9CC \uD5C8\uC6A9\uD569\uB2C8\uB2E4.");
    this.server = (0, import_node_http3.createServer)((req, res) => {
      let target;
      try {
        target = new URL(req.url ?? "");
      } catch {
        res.writeHead(403).end();
        return;
      }
      if (!allowed || req.method !== "POST" || target.origin !== allowed.origin || target.pathname !== "/v1/chat/completions" || target.search || target.hash || target.username || target.password) {
        res.writeHead(403).end("Ned offline editor");
        return;
      }
      const operation = (0, import_node_http3.request)(allowed.origin + "/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", ...req.headers.authorization ? { Authorization: req.headers.authorization } : {} } }, (response) => {
        res.writeHead(response.statusCode ?? 502, { "Content-Type": response.headers["content-type"] ?? "application/json", "Cache-Control": "no-store" });
        response.on("error", () => res.destroy());
        response.pipe(res);
      });
      this.active.add(operation);
      operation.once("close", () => this.active.delete(operation));
      operation.on("error", () => {
        if (!res.headersSent) res.writeHead(502).end();
        else res.destroy();
      });
      res.once("close", () => operation.destroy());
      req.once("aborted", () => operation.destroy());
      req.pipe(operation);
    });
    this.server.requestTimeout = 0;
    this.server.on("connect", (_req, socket) => {
      socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n", () => socket.destroy());
    });
    await new Promise((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", resolve);
    });
    const address = this.server.address();
    if (!address || typeof address === "string") throw new Error("Editor proxy failed");
    return "http://127.0.0.1:" + address.port;
  }
  async close() {
    for (const operation of this.active) operation.destroy();
    this.server?.closeAllConnections();
    await new Promise((resolve) => {
      if (!this.server?.listening) resolve();
      else this.server.close(() => resolve());
    });
  }
};
function editorSettings(executable, agent, descriptor, proxy, clangd, platform = process.platform, native) {
  return {
    telemetry: { diagnostics: false, metrics: false },
    auto_update: false,
    restore_on_startup: "launchpad",
    // Avoid the native picker callback crash in the managed Windows editor.
    // Ned's tray picker uses the host's real Windows shell profile instead.
    ...platform === "win32" ? { use_system_path_prompts: false } : {},
    proxy,
    server_url: proxy,
    credentials_url: "http://127.0.0.1:1/ned-private-credentials",
    auto_install_extensions: { html: false },
    suggest_extensions: false,
    granted_extension_capabilities: [],
    language_servers: [],
    format_on_save: "off",
    features: { edit_prediction_provider: "none" },
    show_edit_predictions: false,
    enable_language_server: false,
    enable_semantic_tokens: false,
    languages: {
      C: { language_servers: clangd ? ["clangd"] : [], enable_language_server: !!clangd },
      "C++": { language_servers: clangd ? ["clangd"] : [], enable_language_server: !!clangd }
    },
    lsp: clangd ? { clangd: { binary: { path: clangd, arguments: ["--background-index", "--clang-tidy=false"], ignore_system_version: false } } } : {},
    collaboration_panel: { button: false },
    notification_panel: { button: false },
    title_bar: { show_onboarding_banner: false, show_sign_in: false },
    agent: { default_profile: native ? "write" : "ask", enable_feedback: false, ...native ? { default_model: { provider: "Intranet", model: native.defaultModel }, profiles: Object.fromEntries(["write", "ask", "minimal"].map((id) => [id, { enable_all_context_servers: false, context_servers: {}, tools: { fetch: false, search_web: false } }])) } : {} },
    ...native ? { language_models: { openai_compatible: { Intranet: { api_url: native.baseUrl, available_models: native.models } } } } : {},
    agent_servers: { Ned: { type: "custom", ...agentLaunch(executable, agent, descriptor) } },
    context_servers: {},
    session: { trust_all_worktrees: false, restore_unsaved_buffers: true },
    prettier: { allowed: false },
    // No per-user shell startup or shell environment extraction for the agent.
    load_direnv: "disabled"
  };
}
async function prepareEditor(root, executable, resources3, descriptor, proxy, native) {
  const data = import_node_path13.default.join(root, "editor"), home = import_node_path13.default.join(data, "home");
  await (0, import_promises12.mkdir)(import_node_path13.default.join(data, "config"), { recursive: true, mode: 448 });
  await ensureEditorInstructions(import_node_path13.default.join(data, "config"));
  for (const directory of ["home", "home/AppData/Local", "home/AppData/Roaming", "home/AppData/LocalLow", "home/Desktop", "home/Documents", "home/Downloads", "roaming", "local", "config-home", "data", "cache", "state", "tmp"]) await (0, import_promises12.mkdir)(import_node_path13.default.join(data, directory), { recursive: true, mode: 448 });
  const clangd = process.platform === "win32" ? import_node_path13.default.join(resources3, "runtime/windows-x64/mcp/clangd/clangd_23.1.0/bin/clangd.exe") : void 0;
  const settings = await editorPreferences(data, editorSettings(executable, import_node_path13.default.join(resources3, "ned/agent.cjs"), descriptor, proxy, clangd, process.platform, native));
  await writeEditorPreferences(import_node_path13.default.join(data, "config/settings.json"), settings);
  await ensureEditorKeymap(import_node_path13.default.join(data, "config/keymap.json"));
  const env = {};
  for (const key of ["SystemRoot", "SYSTEMROOT", "WINDIR", "SystemDrive", "ProgramFiles", "ProgramFiles(x86)", "ProgramW6432", "ProgramData", "PATHEXT", "LANG", "LC_ALL", "DISPLAY", "WAYLAND_DISPLAY", "XAUTHORITY", "DBUS_SESSION_BUS_ADDRESS", "XDG_RUNTIME_DIR"])
    if (process.env[key]) env[key] = process.env[key];
  return { data, env: {
    ...env,
    HOME: home,
    USERPROFILE: home,
    APPDATA: import_node_path13.default.join(home, "AppData", "Roaming"),
    LOCALAPPDATA: import_node_path13.default.join(home, "AppData", "Local"),
    XDG_CONFIG_HOME: import_node_path13.default.join(data, "config-home"),
    XDG_DATA_HOME: import_node_path13.default.join(data, "data"),
    XDG_CACHE_HOME: import_node_path13.default.join(data, "cache"),
    XDG_STATE_HOME: import_node_path13.default.join(data, "state"),
    PATH: process.platform === "win32" ? ["System32", "", "System32/Wbem", "System32/WindowsPowerShell/v1.0"].map((p) => import_node_path13.default.join(process.env.SystemRoot ?? "C:\\Windows", p)).join(import_node_path13.default.delimiter) : "/usr/bin:/bin",
    ...process.platform === "win32" ? { ComSpec: import_node_path13.default.join(process.env.SystemRoot ?? "C:\\Windows", "System32/cmd.exe") } : {},
    TEMP: import_node_path13.default.join(data, "tmp"),
    TMP: import_node_path13.default.join(data, "tmp"),
    HTTP_PROXY: proxy,
    HTTPS_PROXY: proxy,
    ALL_PROXY: proxy,
    http_proxy: proxy,
    https_proxy: proxy,
    all_proxy: proxy,
    NO_PROXY: "",
    no_proxy: "",
    DO_NOT_TRACK: "1",
    OTEL_SDK_DISABLED: "true",
    ...native ? { INTRANET_API_KEY: native.token } : {}
  } };
}

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object2) => {
    const keys = [];
    for (const key in object2) {
      if (Object.prototype.hasOwnProperty.call(object2, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path16, errorMaps, issueData } = params;
  const fullPath = [...path16, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path16, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path16;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// src/shared/contracts.ts
var endpoint = external_exports.string().trim().url().superRefine((value, ctx) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    return;
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || /\/(?:embeddings|chat\/completions)\/?$/.test(url.pathname)) {
    ctx.addIssue({ code: external_exports.ZodIssueCode.custom, message: "\uC778\uC99D \uC815\uBCF4 \uC5C6\uC774 API \uAE30\uC900 \uACBD\uB85C(/v1 \uB4F1)\uB97C \uC9C0\uC815\uD558\uC138\uC694." });
  }
});
var openVikingSchema = external_exports.object({
  enabled: external_exports.boolean().default(true),
  embedding: external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256), dimension: external_exports.number().int().min(1).max(65536) }).strict(),
  vlm: external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256) }).strict().optional()
}).strict();
var modelSchema = external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256) }).strict();
var namedModelSchema = modelSchema.extend({ name: external_exports.string().trim().min(1).max(128), providerID: external_exports.string().optional(), modelKey: external_exports.string().optional() }).strict();
var providerSettings = external_exports.object({
  baseURL: endpoint,
  apiKey: external_exports.string().trim().min(1).max(8192).optional(),
  APIKey: external_exports.string().trim().min(1).max(8192).optional()
}).passthrough().superRefine((data, ctx) => {
  if (!data.apiKey && !data.APIKey) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["apiKey"], message: "settings.apiKey \uB610\uB294 APIKey\uB97C \uC785\uB825\uD558\uC138\uC694." });
  if (data.apiKey && data.APIKey && data.apiKey !== data.APIKey) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["APIKey"], message: "apiKey\uC640 APIKey\uC758 \uAC12\uC774 \uB2E4\uB985\uB2C8\uB2E4." });
});
var overlayFields = {
  settings: external_exports.record(external_exports.unknown()).optional(),
  body: external_exports.record(external_exports.unknown()).optional(),
  options: external_exports.record(external_exports.unknown()).optional()
};
function normalizeOverlay(value) {
  const { options } = value;
  if (!options) return value;
  const { chat_template_kwargs, extraBody, ...settings } = options;
  return {
    ...value,
    options: void 0,
    settings: { ...settings, ...value.settings },
    body: {
      ...extraBody && typeof extraBody === "object" && !Array.isArray(extraBody) ? extraBody : {},
      ...chat_template_kwargs === void 0 ? {} : { chat_template_kwargs },
      ...value.body
    }
  };
}
var variantID = external_exports.string().trim().min(1).max(128);
var variantOverlay = external_exports.object({ ...overlayFields, headers: external_exports.record(external_exports.string()).optional() }).passthrough().transform(({ settings, body, options, headers, ...legacy }) => normalizeOverlay({ settings, body, headers, options: { ...legacy, ...options } }));
var variantsSchema = external_exports.union([
  external_exports.array(external_exports.object({ id: variantID, ...overlayFields, headers: external_exports.record(external_exports.string()).optional() }).strict().transform(normalizeOverlay)).max(32),
  external_exports.record(variantID, variantOverlay).transform((value) => Object.entries(value).map(([id, overlay]) => ({ id, ...overlay })))
]).superRefine((value, ctx) => {
  if (value.length > 32 || new Set(value.map((v) => v.id)).size !== value.length)
    ctx.addIssue({ code: external_exports.ZodIssueCode.custom, message: "variant ID\uB294 \uACE0\uC720\uD574\uC57C \uD558\uBA70 32\uAC1C \uC774\uD558\uB85C \uC9C0\uC815\uD558\uC138\uC694." });
});
var providerModel = external_exports.object({
  name: external_exports.string().min(1).max(128).optional(),
  modelID: external_exports.string().min(1).max(256).optional(),
  capabilities: external_exports.object({ tools: external_exports.boolean().optional(), input: external_exports.array(external_exports.enum(["text", "image", "audio", "video", "pdf"])).optional(), output: external_exports.array(external_exports.enum(["text", "image", "audio", "video", "pdf"])).optional() }).passthrough().optional(),
  cost: external_exports.object({ input: external_exports.number().nonnegative(), output: external_exports.number().nonnegative(), cache: external_exports.object({ read: external_exports.number().nonnegative(), write: external_exports.number().nonnegative() }).optional() }).optional(),
  limit: external_exports.object({ context: external_exports.number().int().positive().optional(), input: external_exports.number().int().positive().optional(), output: external_exports.number().int().positive().optional() }).optional(),
  ...overlayFields,
  variants: variantsSchema.optional()
}).passthrough().transform(normalizeOverlay);
var providerSchema = external_exports.object({
  name: external_exports.string().min(1).max(128).optional(),
  package: external_exports.literal("@opencode/ai/providers/openai-compatible").default("@opencode/ai/providers/openai-compatible"),
  env: external_exports.array(external_exports.string().min(1).max(128)).max(32).optional(),
  settings: providerSettings,
  models: external_exports.record(external_exports.string().min(1).max(256).refine((value) => !value.includes("#")), providerModel).refine((value) => Object.keys(value).length > 0 && Object.keys(value).length <= 32)
}).strict();
var selectionSchema = external_exports.union([external_exports.string().min(3), external_exports.object({ providerID: external_exports.string().min(1), model: external_exports.string().min(1), variant: external_exports.string().optional() }).strict()]);
var rawConfigSchema = external_exports.object({
  schemaVersion: external_exports.union([external_exports.literal(1), external_exports.literal(2)]).default(2),
  model: external_exports.union([modelSchema, selectionSchema]).optional(),
  providers: external_exports.record(external_exports.string().min(1).max(128).refine((value) => !/[\/#]/.test(value)), providerSchema).optional(),
  models: external_exports.array(namedModelSchema).min(1).max(32).optional(),
  defaultModel: external_exports.string().max(128).optional(),
  defaultVariant: variantID.optional(),
  openViking: openVikingSchema.optional(),
  compaction: external_exports.object({ maxOutputTokens: external_exports.number().int().min(256).max(65536).default(8192), retryOnLength: external_exports.boolean().default(true), disableQwenThinking: external_exports.boolean().default(true) }).strict().optional()
}).strict();
var configSchema = rawConfigSchema.superRefine((data, ctx) => {
  if (!data.model && !data.models?.length && !Object.keys(data.providers ?? {}).length) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["providers"], message: "LLM \uBAA8\uB378\uC744 \uD55C \uAC1C \uC774\uC0C1 \uB4F1\uB85D\uD558\uC138\uC694." });
  if (data.models && new Set(data.models.map((m) => m.name)).size !== data.models.length) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["models"], message: "LLM \uD45C\uC2DC \uC774\uB984\uC740 \uACE0\uC720\uD574\uC57C \uD569\uB2C8\uB2E4." });
  if (data.defaultModel && !data.providers && !data.models?.some((m) => m.name === data.defaultModel)) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["defaultModel"], message: "\uB4F1\uB85D\uB41C \uBAA8\uB378 \uC774\uB984\uC744 \uC120\uD0DD\uD558\uC138\uC694." });
  if (data.model && (typeof data.model === "string" || "providerID" in data.model)) {
    const selection = typeof data.model === "string" ? { providerID: data.model.split("/")[0], model: data.model.slice(data.model.indexOf("/") + 1) } : data.model;
    const definition = data.providers?.[selection.providerID]?.models[selection.model];
    if ("variant" in selection && selection.variant && definition?.variants && !definition.variants.some((v) => v.id === selection.variant)) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["model", "variant"], message: "\uB4F1\uB85D\uB41C variant ID\uB97C \uC9C0\uC815\uD558\uC138\uC694." });
    if (!definition) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["model"], message: "\uB4F1\uB85D\uB41C providers\uC640 models\uC758 \uBCC4\uCE6D\uC744 \uC9C0\uC815\uD558\uC138\uC694." });
  }
}).transform((data) => {
  const fromProviders = Object.entries(data.providers ?? {}).flatMap(([providerID, provider]) => Object.entries(provider.models).map(([modelKey, definition]) => ({
    name: `${provider.name ?? providerID} \xB7 ${definition.name ?? modelKey}`.slice(0, 128),
    providerID,
    modelKey,
    baseUrl: provider.settings.baseURL,
    apiKey: provider.settings.apiKey ?? provider.settings.APIKey,
    id: definition.modelID ?? modelKey
  })));
  const models = fromProviders.length ? fromProviders.map((m, index) => ({ ...m, name: `${m.name.slice(0, 119)} [${index + 1}]` })) : data.models;
  const selection = typeof data.model === "string" ? { providerID: data.model.split("/")[0], model: data.model.slice(data.model.indexOf("/") + 1) } : data.model && "providerID" in data.model ? data.model : void 0;
  const model = models?.find((m) => selection ? m.providerID === selection.providerID && m.modelKey === selection.model : m.name === data.defaultModel) ?? models?.[0] ?? data.model;
  return { ...data, ...selection && "variant" in selection && selection.variant ? { defaultVariant: selection.variant } : {}, ...models ? { models, defaultModel: models.find((m) => m === model)?.name ?? data.defaultModel } : {}, model: { baseUrl: model.baseUrl, apiKey: model.apiKey, id: model.id } };
});
var requestSchema = external_exports.discriminatedUnion("action", [
  external_exports.object({ action: external_exports.literal("state") }).strict(),
  external_exports.object({ action: external_exports.literal("importConfig"), replace: external_exports.boolean() }).strict(),
  external_exports.object({ action: external_exports.literal("openProject") }).strict(),
  external_exports.object({ action: external_exports.literal("newSession"), projectId: external_exports.string().max(128) }).strict(),
  external_exports.object({
    action: external_exports.literal("selectSession"),
    sessionId: external_exports.string().max(128)
  }).strict(),
  external_exports.object({
    action: external_exports.literal("send"),
    text: external_exports.string().trim().min(1).max(32e3)
  }).strict(),
  external_exports.object({ action: external_exports.literal("stop") }).strict(),
  external_exports.object({ action: external_exports.literal("replay") }).strict(),
  external_exports.object({
    action: external_exports.literal("approve"),
    proposalId: external_exports.string().max(128),
    decision: external_exports.enum(["once", "session", "reject"])
  }).strict(),
  external_exports.object({ action: external_exports.literal("resetApproval") }).strict(),
  external_exports.object({ action: external_exports.literal("selectModel"), name: external_exports.string().min(1).max(128) }).strict(),
  external_exports.object({ action: external_exports.literal("indexKnowledge"), path: external_exports.string().min(1).max(4096) }).strict(),
  external_exports.object({ action: external_exports.literal("readFile"), path: external_exports.string().max(4096) }).strict()
]);

// tests/zed-native.test.ts
async function fixture2(t) {
  const calls = [];
  let mode = "normal";
  let enter, closed;
  const entered = new Promise((r) => enter = r), cancelled = new Promise((r) => closed = r);
  const upstream = (0, import_node_http4.createServer)(async (req, res) => {
    let text = "";
    for await (const chunk of req) text += chunk;
    const body = JSON.parse(text);
    calls.push({ path: req.url, authorization: req.headers.authorization, body });
    if (mode === "queue") {
      enter();
      res.once("close", closed);
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ choices: [{ message: { role: "assistant", content: req.url }, finish_reason: isCompaction(body) ? "length" : "stop" }] }));
  });
  await new Promise((r) => upstream.listen(0, "127.0.0.1", r));
  const url = "http://127.0.0.1:" + upstream.address().port;
  const config = configSchema.parse({ schemaVersion: 2, model: { providerID: "second", model: "m" }, providers: { first: { name: "First", settings: { baseURL: url + "/first/v1", APIKey: "PRIVATE_FIRST_KEY" }, models: { m: { name: "First Qwen", modelID: "Qwen-same", options: { parallelToolCalls: true, reasoningEffort: "none", chat_template_kwargs: { enable_thinking: false } }, limit: { context: 65536, output: 8192 } } } }, second: { name: "Second", settings: { baseURL: url + "/second/v1", APIKey: "PRIVATE_SECOND_KEY" }, models: { m: { name: "Second Qwen", modelID: "Qwen-same" } } } } });
  const broker = new ZedModels(config), connection = await broker.start(), network = new EditorNetwork(), proxy = await network.start(connection.baseUrl);
  t.after(async () => {
    await network.close();
    await broker.close();
    upstream.closeAllConnections();
    await new Promise((r) => upstream.close(() => r()));
  });
  const post = (body, target = connection.baseUrl + "/chat/completions", token = connection.token, method = "POST") => new Promise((resolve, reject) => {
    const operation = (0, import_node_http4.request)(proxy, { method, path: target, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" } }, (res) => {
      let data = "";
      res.on("data", (d) => data += d);
      res.on("end", () => resolve({ status: res.statusCode, body: data && res.headers["content-type"]?.includes("application/json") ? JSON.parse(data) : data }));
    });
    operation.once("error", reject);
    operation.end(JSON.stringify(body));
  });
  return { broker, connection, network, proxy, calls, config, post, entered, cancelled, queue: () => mode = "queue" };
}
(0, import_node_test6.test)("native Zed can use each configured model through its owned proxy without Ned instructions, tools or compaction retries", async (t) => {
  const f = await fixture2(t);
  import_strict6.default.equal(f.connection.models.length, 2);
  import_strict6.default.notEqual(f.connection.models[0].name, f.connection.models[1].name);
  import_strict6.default.equal(f.connection.defaultModel, f.connection.models[1].name);
  const messages = [{ role: "system", content: "Native Zed system instructions" }, { role: "user", content: "Read this project." }], tools = [{ type: "function", function: { name: "read_file", parameters: { type: "object", properties: {} } } }];
  for (let i = 0; i < 2; i++) import_strict6.default.equal((await f.post({ model: f.connection.models[i].name, messages, tools })).status, 200);
  import_strict6.default.equal(f.calls[0].path, "/first/v1/chat/completions");
  import_strict6.default.equal(f.calls[1].path, "/second/v1/chat/completions");
  import_strict6.default.equal(f.calls[0].authorization, "Bearer PRIVATE_FIRST_KEY");
  import_strict6.default.equal(f.calls[1].authorization, "Bearer PRIVATE_SECOND_KEY");
  import_strict6.default.deepEqual(f.calls[0].body.messages, messages);
  import_strict6.default.deepEqual(f.calls[0].body.tools, tools);
  import_strict6.default.equal(f.calls[0].body.model, "Qwen-same");
  import_strict6.default.equal(f.calls[0].body.parallel_tool_calls, true);
  import_strict6.default.equal(f.calls[0].body.chat_template_kwargs.enable_thinking, false);
  const instruction2 = "You MUST summarize the conversation above into a structured summary.\n## Next Move\n## Relevant Files\nDo not continue the task or call tools.";
  const summary = { model: f.connection.models[1].name, messages: [{ role: "user", content: instruction2 }], tools, max_tokens: 12e3 };
  import_strict6.default.equal(isCompaction(summary), true);
  const result = await f.post(summary);
  import_strict6.default.equal(result.body.choices[0].finish_reason, "length");
  import_strict6.default.equal(f.calls.length, 3);
  import_strict6.default.deepEqual(f.calls[2].body.messages, summary.messages);
  import_strict6.default.deepEqual(f.calls[2].body.tools, tools);
  import_strict6.default.equal(f.calls[2].body.max_tokens, 12e3);
  import_strict6.default.equal((await f.post({ model: "unconfigured" })).status, 403);
  import_strict6.default.equal((await f.post({ model: f.connection.defaultModel }, void 0, "wrong")).status, 401);
  for (const target of ["http://example.invalid/v1/chat/completions", f.connection.baseUrl + "/models", f.connection.baseUrl + "/api/session", "http://127.0.0.1:1/v1/chat/completions"]) import_strict6.default.equal((await f.post({}, target)).status, 403);
  import_strict6.default.equal(f.calls.length, 3);
});
(0, import_node_test6.test)("native editor settings contain only a run credential and preserve valid Zed model/profile/UI choices after restart", async (t) => {
  const f = await fixture2(t), root = await (0, import_promises13.mkdtemp)(import_node_path14.default.join((0, import_node_os6.tmpdir)(), "ned-zed-settings-"));
  t.after(() => (0, import_promises13.rm)(root, { recursive: true, force: true }));
  const profile = await prepareEditor(root, "/Ned.exe", "/resources", "/descriptor", f.proxy, f.connection), file = import_node_path14.default.join(profile.data, "config/settings.json");
  let saved = JSON.parse(await (0, import_promises13.readFile)(file, "utf8"));
  import_strict6.default.equal(profile.env.INTRANET_API_KEY, f.connection.token);
  import_strict6.default.deepEqual(Object.keys(saved.agent_servers), ["Ned"]);
  import_strict6.default.equal(saved.agent.default_profile, "write");
  import_strict6.default.equal(saved.agent.default_model.provider, "Intranet");
  import_strict6.default.deepEqual(saved.context_servers, {});
  import_strict6.default.equal(saved.agent.profiles.write.enable_all_context_servers, false);
  import_strict6.default.equal(saved.agent.profiles.write.tools.fetch, false);
  import_strict6.default.equal(saved.agent.profiles.write.tools.search_web, false);
  for (const secret of ["PRIVATE_FIRST_KEY", "PRIVATE_SECOND_KEY", f.connection.token]) import_strict6.default.ok(!JSON.stringify(saved).includes(secret));
  saved.agent.default_profile = "ask";
  saved.agent.default_model.model = f.connection.models[0].name;
  saved.buffer_font_size = 23;
  saved.agent.dock = "left";
  await (0, import_promises13.writeFile)(file, JSON.stringify(saved));
  await prepareEditor(root, "/Ned.exe", "/resources", "/descriptor", f.proxy, { ...f.connection, baseUrl: "http://127.0.0.1:12345/v1", token: "next-run-token" });
  saved = JSON.parse(await (0, import_promises13.readFile)(file, "utf8"));
  import_strict6.default.equal(saved.agent.default_profile, "ask");
  import_strict6.default.equal(saved.agent.default_model.model, f.connection.models[0].name);
  import_strict6.default.equal(saved.buffer_font_size, 23);
  import_strict6.default.equal(saved.agent.dock, "left");
  import_strict6.default.equal(saved.language_models.openai_compatible.Intranet.api_url, "http://127.0.0.1:12345/v1");
});
(0, import_node_test6.test)("closing a queued native model request reaches the upstream and leaves no private model listeners", { timeout: 1e4 }, async (t) => {
  const f = await fixture2(t);
  f.queue();
  const pending = fetch(f.connection.baseUrl + "/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + f.connection.token }, body: JSON.stringify({ model: f.connection.defaultModel, messages: [] }) });
  const caught = import_strict6.default.rejects(pending);
  await f.entered;
  const ports = f.broker.ports();
  await f.broker.close();
  await caught;
  await f.cancelled;
  for (const port of ports) await import_strict6.default.rejects(fetch("http://127.0.0.1:" + port));
  await import_strict6.default.rejects(f.broker.start(), /중지/);
});

// tests/astryx-windows.integration.test.ts
var import_node_test7 = require("node:test");
var import_strict7 = __toESM(require("node:assert/strict"), 1);
var import_promises14 = require("node:fs/promises");
var import_node_crypto7 = require("node:crypto");
var import_node_child_process6 = require("node:child_process");
var import_node_util4 = require("node:util");
var import_node_os7 = require("node:os");
var import_node_path15 = __toESM(require("node:path"), 1);

// astryx-offline-lock.json
var astryx_offline_lock_default = {
  schemaVersion: 1,
  version: "0.7.16",
  skillCommit: "5a3fd39483c1890150dbb46372f65e5a82739373",
  packages: {
    core: {
      version: "0.7.16",
      url: "https://registry.npmjs.org/@astryxdesign/core/-/core-0.7.16.tgz",
      integrity: "sha512-3FFQGIOiRVczlrBtRH/Pm4TQwl6FVTCkMhGfljVcxjGBY1AJ4yhx6fRFnP7Nw/Wjaic1vne2TbJ7HW00d3vK2Q==",
      license: "MIT",
      sha256: "d5f00933d8cfd82ad52bf64129b373d58eb5d34d7a5db2bcaa01daaa3367f262",
      bytes: 7935256
    },
    cli: {
      version: "0.7.16",
      url: "https://registry.npmjs.org/@astryxdesign/cli/-/cli-0.7.16.tgz",
      integrity: "sha512-lksV0SdKjlE+Mi12VD1loDN3KE65NYnO7RqhLZ+tXaxQuUi+ccND2vLcLTZex3X/6j1FOH1cdZlhQc+LJIo73g==",
      license: "MIT",
      sha256: "95921261d2334cb46cd38124ce2ace1a6f3ce011a036a810d250763b7b8e9968",
      bytes: 5650808
    }
  },
  dependencyLockSha256: "3165eb81c822249a9cf1ffd4a6c50c2e3001274ce6b39f88a02d23821d81af20",
  starterInputs: [
    {
      path: "distribution/astryx-starter/BUILD.cmd",
      sha256: "d0fd85714377cabff461f10801fce965499012747b862aa3ee3995d5029443f3"
    },
    {
      path: "distribution/astryx-starter/BUILD.ps1",
      sha256: "05e931672599f848eecdf3482d5637b9ef6ab652fdeb8a7986db3a5775fb5525"
    },
    {
      path: "distribution/astryx-starter/LICENSE-Ned.txt",
      sha256: "199d7205ecbe460bc14a005ea9f542050fd4bc855e7bae4f40b27c14f56b9c8c"
    },
    {
      path: "distribution/astryx-starter/README.md",
      sha256: "be8137bf719bc8ae58d7e7ae1d83a07638125719486b37b291c229b449485e15"
    },
    {
      path: "distribution/astryx-starter/build.mjs",
      sha256: "43c4ad127f5382a7571b62178b7b18f761e66a5f50329627f514ef2333a56c48"
    },
    {
      path: "distribution/astryx-starter/index.html",
      sha256: "e8b852aa47e30d53a7372dd52ffb1691bf088c07d9c3079255fbbc780b5a1f21"
    },
    {
      path: "distribution/astryx-starter/package-lock.json",
      sha256: "3165eb81c822249a9cf1ffd4a6c50c2e3001274ce6b39f88a02d23821d81af20"
    },
    {
      path: "distribution/astryx-starter/package.json",
      sha256: "63c0653cf15abfb735b4e0df80f780b31363063891f13f5b22ba25d6be76d332"
    },
    {
      path: "distribution/astryx-starter/src/main.tsx",
      sha256: "f130aa183c514ba40d3e147fd8a3148c4fc71e31b684ed533f3f18cb329ed56c"
    }
  ],
  archive: {
    name: "Ned-Astryx-0.7.16-windows-x64.zip",
    bytes: 24922585,
    sha256: "70aa74491bc66c7eee3612c24a4903a7832fc018f6de33f739afd1c32df77162"
  },
  referenceCount: 281,
  installedFiles: 10351,
  cliExecuted: false
};

// tests/astryx-windows.integration.test.ts
var run = (0, import_node_util4.promisify)(import_node_child_process6.execFile);
(0, import_node_test7.test)("installed Windows Astryx starter builds using bundled Node and native esbuild without npm or the upstream CLI", { skip: process.platform !== "win32", timeout: 12e4 }, async (t) => {
  const resources3 = import_node_path15.default.join(import_node_path15.default.dirname(process.execPath), "resources"), archive = import_node_path15.default.join(resources3, "ned/astryx", astryx_offline_lock_default.archive.name);
  import_strict7.default.equal((0, import_node_crypto7.createHash)("sha256").update(await (0, import_promises14.readFile)(archive)).digest("hex"), astryx_offline_lock_default.archive.sha256);
  const root = await (0, import_promises14.mkdtemp)(import_node_path15.default.join((0, import_node_os7.tmpdir)(), "ned-astryx-"));
  t.after(() => (0, import_promises14.rm)(root, { recursive: true, force: true }));
  const quote = (s) => "'" + s.replaceAll("'", "''") + "'";
  const command = "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory(" + quote(archive) + ", " + quote(root) + ")";
  await run("powershell.exe", ["-NoLogo", "-NoProfile", "-EncodedCommand", Buffer.from(command, "utf16le").toString("base64")]);
  const kit = import_node_path15.default.join(root, "Ned-Astryx"), manifest = JSON.parse(await (0, import_promises14.readFile)(import_node_path15.default.join(kit, "NED-KIT-MANIFEST.json"), "utf8"));
  for (const file of manifest.files) import_strict7.default.equal((0, import_node_crypto7.createHash)("sha256").update(await (0, import_promises14.readFile)(import_node_path15.default.join(kit, file.path))).digest("hex"), file.sha256, file.path);
  await (0, import_promises14.rm)(import_node_path15.default.join(kit, "dist"), { recursive: true, force: true });
  const result = await run(process.execPath, [import_node_path15.default.join(kit, "build.mjs")], { cwd: kit, env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", ESBUILD_BINARY_PATH: "" }, timeout: 6e4 });
  import_strict7.default.match(result.stdout, /ASTRYX_BUILD_OK/);
  for (const file of ["dist/main.js", "dist/main.css"]) import_strict7.default.ok((await (0, import_promises14.stat)(import_node_path15.default.join(kit, file))).size > 1e3);
  import_strict7.default.match(await (0, import_promises14.readFile)(import_node_path15.default.join(kit, "index.html"), "utf8"), /connect-src 'none'/);
  import_strict7.default.equal(manifest.platform, "win32-x64");
});
(0, import_node_test7.test)("installed source-built editor has Ned menu/About content and corresponding source", { skip: process.platform !== "win32" }, async () => {
  const resources3 = import_node_path15.default.join(import_node_path15.default.dirname(process.execPath), "resources"), bytes = await (0, import_promises14.readFile)(import_node_path15.default.join(resources3, "zed/Zed.exe"));
  for (const text of ["About Ned", "Quit Ned", "Ned 0.3.8 \xB7 rebuild 1"]) import_strict7.default.ok(bytes.includes(Buffer.from(text)), text);
  for (const text of ["About Zed", "Quit Zed"]) import_strict7.default.ok(!bytes.includes(Buffer.from(text)), text);
  const record = JSON.parse(await (0, import_promises14.readFile)(import_node_path15.default.join(resources3, "ned/editor-branding.json"), "utf8"));
  import_strict7.default.equal(record.modifiedSha256, (0, import_node_crypto7.createHash)("sha256").update(bytes).digest("hex"));
  const source = record.sourceBuild.files.find((f) => f.name.endsWith(".tar.gz"));
  import_strict7.default.equal((0, import_node_crypto7.createHash)("sha256").update(await (0, import_promises14.readFile)(import_node_path15.default.join(resources3, "ned/sources", source.name))).digest("hex"), source.sha256);
});
