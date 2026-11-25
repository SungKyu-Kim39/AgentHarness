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
  link,
  mkdir,
} from "node:fs/promises";
import type { Proposal } from "../shared/contracts";
const MAX_FILE = 2 * 1024 * 1024;
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const protectedParts = new Set([".git", ".opencode", ".zed", ".ned", ".vscode", "node_modules"]);
export class ProjectFiles {
  constructor(readonly root: string) {}
  async resolve(relative: string, writing = false, options?: { allowMissing?: boolean }): Promise<string> {
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
    const allowMissing = writing || options?.allowMissing === true;
    const root = await realpath(this.root);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      cursor = path.join(cursor, parts[i]);
      const stat = await lstat(cursor).catch((e: NodeJS.ErrnoException) => {
        if (allowMissing && e.code === "ENOENT") return undefined;
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
  async createGeneratedFile(relative: string, bytes: Buffer, signal?: AbortSignal) {
    if (!bytes.length || bytes.length > 64 * 1024 * 1024) throw new Error('생성 파일 크기가 허용 범위를 벗어났습니다.');
    signal?.throwIfAborted();
    const target = await this.resolve(relative, true);
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await this.resolve(relative, true);
    const temp = path.join(path.dirname(target), `.ned-${randomUUID()}.tmp`);
    try {
      await writeFile(temp, bytes, { flag: 'wx', mode: 0o600 });
      await this.resolve(relative, true);
      signal?.throwIfAborted();
      await link(temp, target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new Error('대상 파일이 이미 있습니다. 기존 파일을 보존했으니 새 출력 경로를 지정하세요.');
      throw error;
    } finally {
      await unlink(temp).catch(() => {});
    }
  }

  async readStrictUtf8(relative: string) {
    const file = await this.resolve(relative);
    const stat = await lstat(file);
    if (!stat.isFile() || stat.size > MAX_FILE)
      throw new Error("2 MiB 이하의 일반 텍스트 파일만 읽을 수 있습니다.");
    const bytes = await readFile(file);
    if (bytes.includes(0))
      throw new Error("바이너리 파일은 지원하지 않습니다.");
    const text = bytes.toString("utf8");
    if (!bytes.equals(Buffer.from(text, "utf8")))
      throw new Error("UTF-8 텍스트 파일만 수정할 수 있습니다. 파일 인코딩(예: CP949/EUC-KR)을 UTF-8로 변환·저장한 뒤 다시 요청하세요.");
    return text;
  }
  async propose(
    callId: string,
    relative: string,
    after: string,
  ): Promise<Proposal> {
    if (Buffer.byteLength(after) > MAX_FILE || after.includes("\0"))
      throw new Error("텍스트 변경 크기 제한을 초과했습니다.");
    await this.resolve(relative, true);
    const before = await this.readStrictUtf8(relative).catch(
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
    if (proposal.operation === "delete") {
      const held = path.join(path.dirname(target), `.ned-delete-${randomUUID()}.tmp`);
      let captured = false;
      try {
        await this.resolve(proposal.path, true);
        signal?.throwIfAborted();
        // Capture the directory entry atomically, then verify the captured bytes.
        // A concurrent replacement is restored without overwriting a new file.
        await rename(target, held); captured = true;
        await this.resolve(proposal.path, true);
        const stat = await lstat(held);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE ||
          !(await readFile(held)).equals(Buffer.from(proposal.before, "utf8"))) {
          proposal.status = "conflict";
          throw new Error("승인 후 외부 변경을 발견해 삭제를 중단했습니다.");
        }
        signal?.throwIfAborted();
        await unlink(held); captured = false;
        const exists = await lstat(target).then(() => true, (error: NodeJS.ErrnoException) => {
          if (error.code === "ENOENT") return false;
          throw error;
        });
        if (exists) throw new Error("원래 파일은 삭제됐지만 같은 경로에 새 파일이 생겼습니다. 자동 재삭제하지 말고 확인하세요.");
        proposal.status = "applied";
        proposal.result = `삭제 확인 · 원본 SHA-256 ${hash(proposal.before)}`;
        return proposal.result;
      } catch (error) {
        if (captured) {
          try { await link(held, target); await unlink(held); }
          catch { throw new Error(`삭제를 완료하지 못했습니다. 원래 항목을 ${path.basename(held)}에 보존했습니다. 새 파일을 덮어쓰지 않았습니다.`); }
        }
        throw error;
      }
    }
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await this.resolve(proposal.path, true);
    const temp = path.join(
      path.dirname(target),
      `.ned-${randomUUID()}.tmp`,
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
  async proposeDelete(callId: string, relative: string): Promise<Proposal> {
    const proposal = await this.propose(callId, relative, "");
    if (!proposal.baseHash.startsWith("file:")) throw new Error("삭제할 파일이 없습니다.");
    const bytes = await readFile(await this.resolve(relative, true));
    if (!bytes.equals(Buffer.from(proposal.before, "utf8"))) throw new Error("UTF-8 텍스트 파일만 삭제할 수 있습니다. 외부 변경 여부도 확인하세요.");
    return { ...proposal, operation: "delete" };
  }
  async proposePatch(
    callId: string,
    relative: string,
    edits: TextPatchEdit[],
  ): Promise<{ proposal: Proposal; replacements: number }> {
    await this.resolve(relative, true);
    const before = await this.readStrictUtf8(relative);
    const { after, replacements } = applyTextEdits(before, edits);
    if (Buffer.byteLength(after) > MAX_FILE || after.includes("\0"))
      throw new Error("텍스트 변경 크기 제한을 초과했습니다.");
    return {
      replacements,
      proposal: {
        id: randomUUID(),
        callId,
        path: relative,
        before,
        after,
        baseHash: `file:${hash(before)}`,
        status: "pending",
      },
    };
  }
  async applyBatch(
    proposals: Proposal[],
    options: {
      snapshot?: (proposal: Proposal) => Promise<void>;
      validate?: (proposal: Proposal) => Promise<void>;
      signal?: AbortSignal;
    } = {},
  ): Promise<void> {
    const applied: Proposal[] = [];
    try {
      for (const proposal of proposals) {
        options.signal?.throwIfAborted();
        await options.validate?.(proposal);
        await options.snapshot?.(proposal);
        await this.apply(proposal, options.signal);
        applied.push(proposal);
      }
    } catch (error) {
      const rollbackFailures: string[] = [];
      for (let i = applied.length - 1; i >= 0; i--) {
        const done = applied[i];
        try {
          if (done.operation === "delete" || done.baseHash.startsWith("file:")) {
            const revert = await this.propose(randomUUID(), done.path, done.before);
            await this.apply(revert);
          } else {
            const revert = await this.proposeDelete(randomUUID(), done.path);
            await this.apply(revert);
          }
        } catch {
          rollbackFailures.push(`${done.path} (snapshot ${done.id})`);
        }
      }
      const baseMsg = error instanceof Error ? error.message : String(error);
      if (applied.length === 0) throw error;
      if (rollbackFailures.length > 0) {
        throw new Error(
          `다중 파일 적용 중 오류가 발생했고 일부 파일 복구에 실패했습니다(${rollbackFailures.join(", ")}). 스냅샷을 확인하세요. 원인: ${baseMsg}`,
        );
      }
      throw new Error(
        `다중 파일 적용 중 오류가 발생해 먼저 반영한 ${applied.length}개 파일을 원래 상태로 복구했습니다. 원인: ${baseMsg}`,
      );
    }
  }
}

export interface TextPatchEdit {
  oldText: string;
  newText: string;
  startLine?: number;
  endLine?: number;
  replaceAll?: boolean;
}

function lineOffsets(text: string): number[] {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") offsets.push(i + 1);
  }
  return offsets;
}

function findOccurrences(haystack: string, needle: string): number[] {
  const hits: number[] = [];
  let cursor = 0;
  while (cursor <= haystack.length - needle.length) {
    const index = haystack.indexOf(needle, cursor);
    if (index < 0) break;
    hits.push(index);
    cursor = index + needle.length;
  }
  return hits;
}

export function applyTextEdits(
  before: string,
  edits: TextPatchEdit[],
): { after: string; replacements: number } {
  if (!Array.isArray(edits) || edits.length === 0)
    throw new Error("적용할 부분 편집 항목이 최소 1개 이상 필요합니다.");
  const usesCrlf = before.includes("\r\n");
  const normalizeEol = (value: string) =>
    usesCrlf
      ? value.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n")
      : value.replace(/\r\n/g, "\n");
  let current = before;
  let totalReplacements = 0;
  for (let idx = 0; idx < edits.length; idx++) {
    const edit = edits[idx];
    if (!edit.oldText)
      throw new Error(`편집 #${idx + 1}의 oldText는 비어 있을 수 없습니다.`);
    if (edit.oldText.includes("\0") || edit.newText.includes("\0"))
      throw new Error("NUL 바이트는 텍스트 편집에 사용할 수 없습니다.");
    const offsets = lineOffsets(current);
    const totalLines = offsets.length;
    let windowStart = 0;
    let windowEnd = current.length;
    if (edit.startLine !== undefined || edit.endLine !== undefined) {
      const startLine = edit.startLine ?? 1;
      const endLine = edit.endLine ?? totalLines;
      if (
        !Number.isInteger(startLine) ||
        !Number.isInteger(endLine) ||
        startLine < 1 ||
        endLine < startLine ||
        startLine > totalLines
      )
        throw new Error(
          `편집 #${idx + 1}의 줄 범위(${startLine}~${endLine})가 파일 줄 수(${totalLines})와 맞지 않습니다.`,
        );
      windowStart = offsets[startLine - 1];
      windowEnd = endLine < totalLines ? offsets[endLine] : current.length;
    }
    const slice = current.slice(windowStart, windowEnd);
    let needle = edit.oldText;
    let replacement = edit.newText;
    let hits = findOccurrences(slice, needle);
    if (hits.length === 0) {
      const normalizedNeedle = normalizeEol(edit.oldText);
      if (normalizedNeedle !== needle) {
        hits = findOccurrences(slice, normalizedNeedle);
        if (hits.length > 0) {
          needle = normalizedNeedle;
          replacement = normalizeEol(edit.newText);
        }
      }
    }
    if (hits.length === 0)
      throw new Error(
        `편집 #${idx + 1}의 oldText를 파일에서 찾지 못했습니다. 최신 파일을 다시 읽고 정확한 원문을 지정하세요.`,
      );
    if (hits.length > 1 && !edit.replaceAll)
      throw new Error(
        `편집 #${idx + 1}의 oldText가 ${hits.length}곳에서 일치해 모호합니다. 주변 문맥을 더 포함하거나 startLine/endLine 또는 replaceAll을 지정하세요.`,
      );
    const updatedSlice = edit.replaceAll
      ? slice.split(needle).join(replacement)
      : slice.slice(0, hits[0]) + replacement + slice.slice(hits[0] + needle.length);
    current =
      current.slice(0, windowStart) + updatedSlice + current.slice(windowEnd);
    totalReplacements += edit.replaceAll ? hits.length : 1;
  }
  if (current === before)
    throw new Error("부분 편집 결과 변경된 내용이 없습니다.");
  return { after: current, replacements: totalReplacements };
}
