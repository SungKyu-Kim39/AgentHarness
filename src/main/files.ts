import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import {
  realpath,
  lstat,
  readFile,
  readdir,
  writeFile,
  rename,
  unlink,
  mkdir,
} from "node:fs/promises";
import type { Proposal } from "../shared/contracts";
const MAX_FILE = 2 * 1024 * 1024;
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const protectedParts = new Set([".git", ".opencode", "node_modules"]);
export class ProjectFiles {
  constructor(readonly root: string) {}
  async resolve(relative: string, writing = false): Promise<string> {
    if (
      !relative ||
      path.isAbsolute(relative) ||
      relative.includes("\0") ||
      relative.includes(":") ||
      relative.includes("\\")
    )
      throw new Error("프로젝트 내부의 상대 경로만 허용합니다.");
    const parts = relative.split("/");
    if (
      parts.some(
        (p) =>
          !p ||
          p === ".." ||
          p === "." ||
          /[. ]$/.test(p) ||
          /[\x00-\x1f<>"|?*]/.test(p) ||
          /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p),
      )
    )
      throw new Error("허용되지 않는 경로입니다.");
    if (
      writing &&
      (parts.some((p) => protectedParts.has(p.toLowerCase())) ||
        /^(opencode\.jsonc?|\.mcp\.json)$/i.test(parts.at(-1)!))
    )
      throw new Error("실행 설정과 내부 관리 파일의 수정은 차단됩니다.");
    const root = await realpath(this.root);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      cursor = path.join(cursor, parts[i]);
      const stat = await lstat(cursor).catch((e: NodeJS.ErrnoException) => {
        if (writing && e.code === "ENOENT") return undefined;
        throw e;
      });
      if (stat?.isSymbolicLink())
        throw new Error(
          "심볼릭 링크·junction을 통한 경로는 허용하지 않습니다.",
        );
      if (stat) {
        const rel = path.relative(root, await realpath(cursor));
        if (rel.startsWith("..") || path.isAbsolute(rel))
          throw new Error("프로젝트 범위를 벗어났습니다.");
      }
    }
    return cursor;
  }
  async read(relative: string) {
    const file = await this.resolve(relative);
    const stat = await lstat(file);
    if (!stat.isFile() || stat.size > MAX_FILE)
      throw new Error("2 MiB 이하의 일반 텍스트 파일만 읽을 수 있습니다.");
    const bytes = await readFile(file);
    if (bytes.includes(0))
      throw new Error("바이너리 파일은 지원하지 않습니다.");
    return bytes.toString("utf8");
  }
  async list() {
    const files: string[] = [];
    const visit = async (relative: string, depth: number) => {
      if (depth > 12 || files.length >= 4000) return;
      for (const entry of await readdir(path.join(this.root, relative), {
        withFileTypes: true,
      })) {
        if (
          entry.isSymbolicLink() ||
          protectedParts.has(entry.name.toLowerCase()) ||
          ["dist", "build", ".venv", "vendor"].includes(entry.name.toLowerCase())
        )
          continue;
        const next = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await visit(next, depth + 1);
        else if (entry.isFile()) files.push(next);
        if (files.length >= 4000) break;
      }
    };
    await visit("", 0);
    return files.sort();
  }
  async propose(
    callId: string,
    relative: string,
    after: string,
  ): Promise<Proposal> {
    if (Buffer.byteLength(after) > MAX_FILE || after.includes("\0"))
      throw new Error("텍스트 변경 크기 제한을 초과했습니다.");
    await this.resolve(relative, true);
    const before = await this.read(relative).catch(
      (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOENT") return "";
        throw e;
      },
    );
    const exists = await lstat(await this.resolve(relative, true)).then(
      () => true,
      () => false,
    );
    return {
      id: randomUUID(),
      callId,
      path: relative,
      before,
      after,
      baseHash: `${exists ? "file" : "missing"}:${hash(before)}`,
      status: "pending",
    };
  }
  async apply(proposal: Proposal, signal?: AbortSignal) {
    signal?.throwIfAborted();
    if (proposal.status !== "pending")
      throw new Error("유효한 대기 중 제안이 아닙니다.");
    const fresh = await this.propose(
      proposal.callId,
      proposal.path,
      proposal.after,
    );
    if (fresh.baseHash !== proposal.baseHash) {
      proposal.status = "conflict";
      proposal.result =
        "외부 변경을 발견했습니다. 새 제안을 만든 뒤 다시 승인해야 합니다.";
      throw new Error(proposal.result);
    }
    const target = await this.resolve(proposal.path, true);
    signal?.throwIfAborted();
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await this.resolve(proposal.path, true);
    const temp = path.join(
      path.dirname(target),
      `.l-vibe-${randomUUID()}.tmp`,
    );
    try {
      const mode = await lstat(target).then(
        (s) => s.mode,
        () => 0o600,
      );
      await writeFile(temp, proposal.after, { mode, flag: "wx" });
      const check = await this.propose(
        proposal.callId,
        proposal.path,
        proposal.after,
      );
      if (check.baseHash !== proposal.baseHash) {
        proposal.status = "conflict";
        throw new Error("승인 후 외부 변경으로 적용을 중단했습니다.");
      }
      await this.resolve(proposal.path, true);
      signal?.throwIfAborted();
      await rename(temp, target);
      const actual = await this.read(proposal.path);
      if (actual !== proposal.after)
        throw new Error("기록 후 실제 파일 내용이 다릅니다.");
      proposal.status = "applied";
      proposal.result = `저장 확인 · SHA-256 ${hash(actual)}`;
      return proposal.result;
    } finally {
      await unlink(temp).catch(() => {});
    }
  }
}
