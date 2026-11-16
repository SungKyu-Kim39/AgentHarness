var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
      const stat = await (0, import_promises.lstat)(cursor).catch((e) => {
        if (writing && e.code === "ENOENT") return void 0;
        throw e;
      });
      if (stat?.isSymbolicLink())
        throw new Error(
          "\uC2EC\uBCFC\uB9AD \uB9C1\uD06C\xB7junction\uC744 \uD1B5\uD55C \uACBD\uB85C\uB294 \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
        );
      if (stat) {
        const rel = import_node_path.default.relative(root, await (0, import_promises.realpath)(cursor));
        if (rel.startsWith("..") || import_node_path.default.isAbsolute(rel))
          throw new Error("\uD504\uB85C\uC81D\uD2B8 \uBC94\uC704\uB97C \uBC97\uC5B4\uB0AC\uC2B5\uB2C8\uB2E4.");
      }
    }
    return cursor;
  }
  async read(relative) {
    const file = await this.resolve(relative);
    const stat = await (0, import_promises.lstat)(file);
    if (!stat.isFile() || stat.size > MAX_FILE)
      throw new Error("2 MiB \uC774\uD558\uC758 \uC77C\uBC18 \uD14D\uC2A4\uD2B8 \uD30C\uC77C\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    const bytes = await (0, import_promises.readFile)(file);
    if (bytes.includes(0))
      throw new Error("\uBC14\uC774\uB108\uB9AC \uD30C\uC77C\uC740 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    return bytes.toString("utf8");
  }
  async list() {
    const files = [];
    const visit = async (relative, depth) => {
      if (depth > 12 || files.length >= 4e3) return;
      for (const entry of await (0, import_promises.readdir)(import_node_path.default.join(this.root, relative), {
        withFileTypes: true
      })) {
        if (entry.isSymbolicLink() || protectedParts.has(entry.name.toLowerCase()) || ["dist", "build", ".venv", "vendor"].includes(entry.name.toLowerCase()))
          continue;
        const next = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await visit(next, depth + 1);
        else if (entry.isFile()) files.push(next);
        if (files.length >= 4e3) break;
      }
    };
    await visit("", 0);
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
        const stat = await (0, import_promises.lstat)(held);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE || !(await (0, import_promises.readFile)(held)).equals(Buffer.from(proposal.before, "utf8"))) {
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
  const root = await (0, import_promises3.mkdtemp)(import_node_path3.default.join((0, import_node_os.tmpdir)(), "ned-git-test-")), project = import_node_path3.default.join(root, "project");
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
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > 2 * 1024 * 1024) throw new Error("\uD30C\uC77C \uC885\uB958 \uB610\uB294 \uD06C\uAE30\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
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
    for (const request of this.pending.values()) {
      request.cleanup();
      request.reject(new Error(message));
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
        const request = this.pending.get(message.id);
        if (!request) continue;
        this.pending.delete(message.id);
        request.cleanup();
        if (message.error) request.reject(new Error("MCP \uC694\uCCAD\uC774 \uAC70\uC808\uB418\uC5C8\uC2B5\uB2C8\uB2E4."));
        else request.resolve(message.result);
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
  reportSha256: "f3828cc1c2ff1a02e435297ce5ec5f6f843e62ab33d89e0a6c87b54a4bd6a537",
  components: {
    openviking: {
      originalManifestSha256: "bd4d0e02913ce85d78d8b26b4cc016001043982ba280c2793b9bc0cf7a766d71",
      manifestSha256: "d11f6caf6e1b807f74a87213c7a0f9654e2ac6b582ec1c7c4b3765c19edf2cb3",
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
  }
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
  const run = analysis.call("late", project, { path: "target.exe", operation: "functions" });
  const rejected = import_strict5.default.rejects(run, /abort/i);
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
