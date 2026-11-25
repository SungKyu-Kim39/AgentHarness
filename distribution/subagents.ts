import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { atomicJSON } from "../src/main/config";
import { skills as reviewedEgmSkills } from "../egm-lock.json";
export type SubagentRole = "research" | "worker" | "goldfish";
type State =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "stopped"
  | "unconfirmed";
type Entry = {
  id: string;
  parent: string;
  request: string;
  project: string;
  role: SubagentRole;
  title: string;
  writes: string[];
  reviewer?: string;
  worktreeId?: string;
  worktreePath?: string;
  state: State;
  createdAt: number;
  endedAt?: number;
  notified?: boolean;
};
type Job = Entry & {
  admitted?: boolean;
  prompt?: string;
  model?: unknown;
  abort?: AbortController;
  work?: Promise<void>;
  result?: string;
};
export const subagentReadTools = new Set([
  "list_files",
  "read_file",
  "search_text",
  "read_external_file",
  "list_external_directory",
  "skill_catalog",
  "read_skill",
  "read_methodology",
  "knowledge_search",
  "knowledge_read",
  "personal_knowledge_search",
  "personal_knowledge_read",
  "git_inspect",
  "inspect_build",
  "graphify_analyze",
  "rea_inspect",
  "rea_ghidra",
  "semantic_symbols",
  "document_read",
  "data_query",
  "browser_check",
  "python_package_docs",
  "ast_search",
  "code_audit",
  "spec_workflow",
]);
export const goldfishReadTools = new Set(["read_file", "list_files", "read_skill"]);
export const goldfishReviewers = new Set(["codebase_details","comprehension","design_critic","implementation_readiness","inventive_catalyst","structural","style","zoom_out"]);
const editing = new Set(["propose_edit", "patch_file", "delete_file"]);
const active = (j: Job) =>
  ["queued", "running", "unconfirmed"].includes(j.state);
const valid = (s: unknown): s is string =>
  typeof s === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(s);
function relative(s: string) {
  const p = s.replaceAll("\\", "/");
  if (
    !p ||
    p.startsWith("/") ||
    /[:\x00-\x1f]/.test(p) ||
    p.split("/").some((x) => !x || x === "." || x === "..")
  )
    throw Error("하위 Agent 수정 대상은 프로젝트 상대 파일 경로여야 합니다.");
  return process.platform === "win32" ? p.toLowerCase() : p;
}
/** Host-owned child sessions. The engine receives no unrestricted task/command executor. */
export class Subagents {
  private jobs = new Map<string, Job>();
  private closed = false;
  private ready = false;
  private epochs = new Map<string, number>();
  private saving: Promise<unknown> = Promise.resolve();
  private blocked = new Set<string>();
  private stopping = new Map<string, Promise<void>>();
  constructor(
    private root: string,
    private api: (
      route: string,
      body?: unknown,
      signal?: AbortSignal,
    ) => Promise<any>,
    private project: (id: string) => Promise<string>,
    private request: (id: string) => Promise<string>,
    private createWorktree?: (project: string, label: string, signal?: AbortSignal) => Promise<{ id: string; path: string }>,
  ) {}
  private file() {
    return path.join(this.root, "subagents.json");
  }
  async load() {
    const bytes = await readFile(this.file()).catch(
      (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOENT") return;
        throw e;
      },
    );
    if (!bytes) return;
    if (bytes.length > 8 * 1024 * 1024)
      throw Error(
        "하위 Agent 기록 크기를 확인하세요. 기존 기록을 보존했습니다.",
      );
    const data = JSON.parse(bytes.toString());
    if (
      data.schemaVersion !== 1 ||
      !Array.isArray(data.jobs) ||
      data.jobs.length > 2000
    )
      throw Error("하위 Agent 기록 형식 오류. 기존 기록을 보존했습니다.");
    for (const j of data.jobs) {
      if (
        !valid(j.id) ||
        !valid(j.parent) ||
        !valid(j.request) ||
        !["research", "worker", "goldfish"].includes(j.role) ||
        (j.role === "goldfish" && (!goldfishReviewers.has(j.reviewer) || j.writes?.length !== 0)) ||
        typeof j.title !== "string" ||
        j.title.length > 200 ||
        typeof j.project !== "string" ||
        !path.isAbsolute(j.project) ||
        !Array.isArray(j.writes) ||
        j.writes.length > 100 ||
        j.writes.some(
          (p: unknown) => typeof p !== "string" || relative(p) !== p,
        ) ||
        ![
          "queued",
          "running",
          "completed",
          "failed",
          "stopped",
          "unconfirmed",
        ].includes(j.state) ||
        !Number.isFinite(j.createdAt) ||
        this.jobs.has(j.id)
      )
        throw Error("하위 Agent 기록을 확인하세요. 기존 기록을 보존했습니다.");
      this.jobs.set(j.id, {
        id: j.id,
        parent: j.parent,
        request: j.request,
        project: j.project,
        role: j.role,
        reviewer: j.reviewer,
        ...(typeof j.worktreeId === "string" ? { worktreeId: j.worktreeId } : {}),
        ...(typeof j.worktreePath === "string" ? { worktreePath: j.worktreePath } : {}),
        title: j.title,
        writes: j.writes,
        state: j.state,
        createdAt: j.createdAt,
        endedAt: j.endedAt,
        notified: j.notified,
      });
    }
  }
  private save() {
    const operation = this.saving.then(async () => {
      const records = [...this.jobs.values()];
      const retired = new Set<string>();
      const snapshot = () => ({
        schemaVersion: 1,
        jobs: records.filter(j => !retired.has(j.id)).map(
          ({ admitted, prompt, model, abort, work, result, ...j }) => j,
        ),
      });
      let next = snapshot();
      if (Buffer.byteLength(JSON.stringify(next, null, 2)) > 4 * 1024 * 1024) {
        const old = records.filter(j => !active(j) && !j.work)
          .sort((a, b) => (a.endedAt ?? a.createdAt) - (b.endedAt ?? b.createdAt));
        for (const j of old.slice(0, Math.ceil(old.length / 2))) retired.add(j.id);
        next = snapshot();
        if (Buffer.byteLength(JSON.stringify(next, null, 2)) > 4 * 1024 * 1024) {
          throw Error("하위 Agent 기록 크기 한도입니다. 기존 기록을 보존했습니다.");
        }
      }
      await atomicJSON(this.file(), next);
      for (const id of retired) this.jobs.delete(id);
    });
    this.saving = operation.catch(() => {});
    return operation;
  }
  private async info(id: string, signal?: AbortSignal) {
    const r = await this.api(
      "/api/session/" + encodeURIComponent(id),
      undefined,
      signal,
    );
    if (!r?.data || r.data.id !== id) throw Error("하위 Agent 세션 확인 실패");
    return r.data;
  }
  async recover() {
    for (const j of this.jobs.values())
      if (active(j)) await this.stopJob(j, true);
    if (this.closed) throw Error("하위 Agent 실행을 중지했습니다.");
    this.ready = true;
  }
  async scope(
    session: string,
    tool: string,
    args: unknown,
  ): Promise<{ session: string; signal?: AbortSignal; contextText?: string; projectOverride?: string }> {
    if (!this.ready)
      throw Error("하위 Agent 실행 준비·복구를 확인하고 있습니다.");
    const j = this.jobs.get(session);
    if (j) {
      if (
        this.closed ||
        j.state !== "running" ||
        !j.abort ||
        j.abort.signal.aborted ||
        this.blocked.has(j.parent)
      )
        throw Error("중지된 하위 Agent입니다.");
      const info = await this.info(session);
      if (
        info.parentID !== j.parent ||
        info.agent !== "ned-" + j.role ||
        (await this.project(session)) !== j.project ||
        (await this.project(j.parent)) !== j.project ||
        (await this.request(j.parent)) !== j.request
      )
        throw Error("하위 Agent의 부모 요청·프로젝트 범위가 바뀌었습니다.");
      if(j.role === "goldfish") {
        if(!goldfishReadTools.has(tool))throw Error("Goldfish는 지정 자료를 읽고 검토 결과만 반환합니다.");
        if(tool === "read_skill" && !reviewedEgmSkills.includes(String((args as any)?.id ?? "")))throw Error("Goldfish는 EGM 지침만 읽을 수 있습니다.");
        if(tool === "read_file" && /(?:^|[\\/])(?:\.env(?:\..*)?|AGENTS\.md|CLAUDE\.md|GEMINI\.md)$/i.test(String((args as any)?.path ?? "")))throw Error("Goldfish의 비밀·자동 프로젝트 지침 읽기를 차단했습니다.");
      }
      if (
        !subagentReadTools.has(tool) &&
        !(j.role === "worker" && editing.has(tool))
      )
        throw Error(
          "이 하위 Agent에는 해당 도구 권한이 없습니다. 빌드·Git 변경·환경 선택·GUI·추가 위임은 주 Agent가 처리합니다.",
        );
      if (tool === "ast_search" && (args as any)?.apply === true)
        throw Error("하위 Agent에서는 AST 읽기 전용 검색만 허용됩니다.");
      if (tool === "spec_workflow" && (args as any)?.operation === "init")
        throw Error("하위 Agent에서는 Spec 조회·검증만 허용됩니다.");
      if (
        editing.has(tool) &&
        !j.writes.includes(relative(String((args as any)?.path ?? "")))
      )
        throw Error("이 파일은 하위 Agent에 할당한 수정 대상이 아닙니다.");
      const contextText = [j.title, j.prompt ?? ""].filter(Boolean).join("\n");
      return {
        session: j.parent,
        signal: j.abort.signal,
        ...(contextText ? { contextText } : {}),
        ...(j.worktreePath ? { projectOverride: j.worktreePath } : {}),
      };
    }
    const info = await this.info(session);
    if (info.parentID)
      throw Error("Ned 호스트가 생성·소유한 하위 Agent만 허용합니다.");
    if (this.closed || this.blocked.has(session))
      throw Error("하위 작업 중지가 확인되지 않아 새 작업을 보류합니다.");
    if (editing.has(tool)) {
      const p = relative(String((args as any)?.path ?? "")),
        project = await this.project(session);
      if (
        [...this.jobs.values()].some(
          (j) =>
            j.project === project &&
            !j.worktreePath &&
            active(j) &&
            j.role === "worker" &&
            j.writes.includes(p),
        )
      )
        throw Error(
          "하위 Agent가 수정 중인 파일입니다. 완료·중지 후 수정하세요.",
        );
    }
    return { session };
  }
  async spawn(
    parent: string,
    input: {
      role: SubagentRole;
      title: string;
      prompt: string;
      reviewer?: string;
      writePaths: string[];
      isolation?: "shared" | "worktree";
    },
    signal?: AbortSignal,
  ) {
    const epoch = this.epochs.get(parent) ?? 0;
    const current = () =>
      this.ready &&
      !this.closed &&
      !this.blocked.has(parent) &&
      (this.epochs.get(parent) ?? 0) === epoch &&
      !signal?.aborted;
    if (!current()) throw Error("하위 Agent 실행을 중지했습니다.");
    const info = await this.info(parent);
    if (info.parentID) throw Error("하위 Agent의 재위임은 허용하지 않습니다.");
    const project = await this.project(parent),
      request = await this.request(parent),
      writes = [...new Set(input.writePaths.map(relative))];
    const isolation = input.isolation ?? "shared";
    if (isolation === "worktree" && input.role !== "worker")
      throw Error("git worktree 격리 모드는 구현 하위 Agent(worker)에서만 사용할 수 있습니다.");
    if (input.role === "worker" && !writes.length)
      throw Error("구현 하위 Agent에는 수정할 파일을 지정하세요.");
    if (input.role === "goldfish" && (!goldfishReviewers.has(input.reviewer ?? "") || writes.length)) throw Error("Goldfish 검토자와 읽기 전용 범위를 확인하세요.");
    if (input.role === "research" && writes.length)
      throw Error("조사 하위 Agent에는 수정 파일을 할당할 수 없습니다.");
    if (
      isolation !== "worktree" &&
      [...this.jobs.values()].some(
        (j) =>
          j.project === project &&
          !j.worktreePath &&
          active(j) &&
          j.writes.some((p) => writes.includes(p)),
      )
    )
      throw Error("다른 하위 작업과 수정 파일이 겹칩니다.");
    if (this.jobs.size >= 2000) {
      const terminal = [...this.jobs.values()]
        .filter((j) => !active(j) && !j.work)
        .sort((a, b) => (a.endedAt ?? a.createdAt) - (b.endedAt ?? b.createdAt));
      for (const old of terminal) {
        if (this.jobs.size <= 1000) break;
        this.jobs.delete(old.id);
      }
    }
    if (this.jobs.size >= 2000)
      throw Error(
        "하위 작업 기록 한도에 도달했습니다. 기존 기록을 보존했습니다.",
      );
    if ([...this.jobs.values()].filter((j) => active(j)).length >= 32)
      throw Error(
        "대기 중인 하위 작업이 많습니다. 기존 작업을 완료하거나 중지하세요.",
      );
    if (!current()) throw Error("하위 Agent 실행을 중지했습니다.");
    let worktreeId: string | undefined;
    let worktreePath: string | undefined;
    if (isolation === "worktree") {
      if (!this.createWorktree) throw Error("Worktree 샌드박스가 연결되지 않았습니다.");
      const wt = await this.createWorktree(project, input.title, signal);
      worktreeId = wt.id;
      worktreePath = wt.path;
    }
    const j: Job = {
      id: "ses_ned_" + randomBytes(16).toString("hex"),
      parent,
      request,
      project,
      role: input.role,
      reviewer: input.reviewer,
      worktreeId,
      worktreePath,
      title: input.title,
      writes,
      state: "queued",
      createdAt: Date.now(),
      prompt: input.role === "goldfish" ? `Read read_skill id=egm-review-loop document=references/bundle/agents/${input.reviewer}.md in full first. Use only the target and explicitly supplied references. No parent history or memory is available. Return evidence and incomplete required reads.\n\n${input.prompt}` : input.prompt,
      model: info.model,
      abort: new AbortController(),
    };
    this.jobs.set(j.id, j);
    try {
      await this.save();
    } catch (e) {
      this.jobs.delete(j.id);
      throw e;
    }
    if (!current() || j.state !== "queued") {
      j.abort?.abort();
      j.state = "stopped";
      await this.save();
      throw Error("하위 Agent 시작 전에 작업이 중지되었습니다.");
    }
    j.admitted = true;
    this.drain();
    return this.view(j);
  }
  private drain() {
    if (this.closed || !this.ready) return;
    for (const j of this.jobs.values())
      if (
        j.state === "queued" &&
        j.admitted &&
        !this.blocked.has(j.parent) &&
        [...this.jobs.values()].filter(
          (k) => k.work || k.state === "unconfirmed",
        ).length < 2
      ) {
        j.state = "running";
        j.work = this.run(j).finally(() => {
          j.work = undefined;
          this.drain();
        });
      }
  }
  private async run(j: Job) {
    try {
      await this.save();
      if ((await this.request(j.parent)) !== j.request)
        throw Error("NED_SUBAGENT_STALE");
      j.abort!.signal.throwIfAborted();
      await this.api(
        "/api/session",
        {
          id: j.id,
          parentID: j.parent,
          agent: "ned-" + j.role,
          model: j.model,
          title: j.title,
        },
        AbortSignal.timeout(15000),
      );
      j.abort!.signal.throwIfAborted();
      await this.api(
        "/api/session/" + j.id + "/prompt",
        {
          text:
            "Ned 하위 작업입니다. 부모 프로젝트·권한을 따르세요. 보고서는 한국어로 작성하세요. 재위임·빌드·Git 변경·환경 선택·데스크톱 조작은 주 Agent에게 맡기세요. " +
            (j.role === "goldfish"
              ? "독립 EGM Goldfish 검토입니다. 제공한 자료만 읽고 검토 결과를 반환하세요. 프로젝트를 수정하거나 기억을 조회하지 마세요."
              : j.role === "research"
              ? "조사 전용이며 프로젝트를 수정하지 마세요."
              : "수정 가능한 정확한 파일: " +
                j.writes.join(", ") +
                ". 다른 파일을 바꾸지 마세요.") +
            "\n\n" +
            j.prompt,
        },
        AbortSignal.timeout(15000),
      );
      await this.api(
        "/api/experimental/session/" + j.id + "/wait",
        {},
        j.abort!.signal,
      );
      j.abort!.signal.throwIfAborted();
      const messages = await this.api(
        "/api/session/" + j.id + "/message?limit=100&order=desc",
        undefined,
        j.abort!.signal,
      );
      const assistant = messages.data?.find(
        (m: any) => m.type === "assistant" && m.time?.completed !== undefined,
      );
      if (!assistant || assistant.error)
        throw Error("NED_SUBAGENT_MODEL_FAILED");
      j.result =
        assistant.content
          ?.filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("\n\n") || "텍스트 결과 없이 하위 작업을 완료했습니다.";
      j.state = "completed";
    } catch {
      if (j.abort?.signal.aborted) {
        if (j.state !== "unconfirmed") j.state = "stopped";
      } else {
        try {
          await this.halt(j);
          j.state = "failed";
        } catch {
          j.state = "unconfirmed";
          this.blocked.add(j.parent);
        }
      }
    } finally {
      j.endedAt = Date.now();
      j.prompt = undefined;
      await this.save().catch(() => {
        j.state = "unconfirmed";
        this.blocked.add(j.parent);
      });
      if (
        !this.closed &&
        !this.blocked.has(j.parent) &&
        !j.abort?.signal.aborted &&
        ["completed", "failed"].includes(j.state) &&
        (await this.request(j.parent).then(
          (r) => r === j.request,
          () => false,
        ))
      ) {
        await this.api(
          "/api/session/" + j.parent + "/synthetic",
          {
            id: "msg_ned_" + j.id.slice(4),
            text:
              "Ned 하위 작업 결과입니다. 참고 자료로 검토하고 실제 결과를 통합하세요.\n" +
              JSON.stringify({
                ...this.view(j),
                result: j.result?.slice(0, 32000),
              }),
            description: j.title,
            metadata: { source: "ned-subagent", childID: j.id, state: j.state },
          },
          AbortSignal.timeout(15000),
        ).then(
          () => {
            j.notified = true;
          },
          () => {},
        );
        await this.save().catch(() => {});
      }
    }
  }
  private view(j: Job) {
    return {
      id: j.id,
      sessionID: j.id,
      parentSessionID: j.parent,
      role: j.role,
      title: j.title,
      state: j.state,
      writePaths: j.writes,
      ...(j.worktreeId ? { worktreeId: j.worktreeId } : {}),
      createdAt: j.createdAt,
      endedAt: j.endedAt,
    };
  }
  async status(
    parent: string,
    id?: string,
    waitMs = 0,
    offset = 0,
  ): Promise<
    Array<
      ReturnType<Subagents["view"]> & {
        olderTasks?: number;
        result?: string;
        offset?: number;
        totalCharacters?: number;
        nextOffset?: number;
      }
    >
  > {
    const all = [...this.jobs.values()].filter((j) => j.parent === parent),
      list = id ? [this.owned(parent, id)] : all.slice(-50);
    if (waitMs && list.some((j) => j.work))
      await Promise.race([
        Promise.allSettled(list.map((j) => j.work)),
        new Promise((r) => {
          setTimeout(r, waitMs).unref();
        }),
      ]);
    if (!id)
      return list.map((j) => ({
        ...this.view(j),
        ...(all.length > 50 ? { olderTasks: all.length - 50 } : {}),
      }));
    const j = list[0];
    let result = j.result;
    if (result === undefined && j.state === "completed")
      result = await this.api(
        "/api/session/" + j.id + "/message?limit=100&order=desc",
      ).then(
        (r) =>
          r.data
            ?.find(
              (m: any) =>
                m.type === "assistant" && m.time?.completed !== undefined,
            )
            ?.content?.filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join("\n\n") ?? "결과 없음",
      );
    return [
      {
        ...this.view(j),
        ...(result !== undefined
          ? {
              result: result.slice(offset, offset + 32000),
              offset,
              totalCharacters: result.length,
              ...(offset + 32000 < result.length
                ? { nextOffset: offset + 32000 }
                : {}),
            }
          : {}),
      },
    ];
  }
  private owned(parent: string, id: string) {
    const j = this.jobs.get(id);
    if (!j || j.parent !== parent)
      throw Error("이 대화가 소유한 하위 작업이 아닙니다.");
    return j;
  }
  private async halt(j: Job) {
    const signal = AbortSignal.timeout(15000),
      existing = await this.api(
        "/api/session/" + j.id,
        undefined,
        signal,
      ).catch((e) => {
        if (e?.status === 404) return undefined;
        throw e;
      });
    if (existing) {
      if (
        existing.data?.parentID !== j.parent ||
        existing.data?.agent !== "ned-" + j.role
      )
        throw Error("NED_SUBAGENT_OWNER");
      await this.api("/api/session/" + j.id + "/interrupt", {}, signal);
      await this.api("/api/experimental/session/" + j.id + "/wait", {}, signal);
    }
  }
  private async stopJob(j: Job, recovery = false) {
    const terminal = ["completed", "failed", "stopped"].includes(j.state);
    if (terminal && !j.work) return;
    j.abort?.abort();
    if (j.state === "queued") {
      j.state = "stopped";
      j.endedAt = Date.now();
      await this.save();
      return;
    }
    this.blocked.add(j.parent);
    try {
      if (j.work) await j.work;
      if (!terminal) {
        await this.halt(j);
        j.state = "stopped";
        j.endedAt = Date.now();
        await this.save();
      }
      if (
        !this.stopping.has(j.parent) &&
        ![...this.jobs.values()].some(
          (k) => k.parent === j.parent && k.state === "unconfirmed",
        )
      )
        this.blocked.delete(j.parent);
    } catch {
      j.state = "unconfirmed";
      await this.save().catch(() => {});
      throw Error(
        "하위 Agent 중지를 확인하지 못했습니다. 새 실행을 보류합니다.",
      );
    }
  }
  async stop(parent: string, id: string) {
    const j = this.owned(parent, id);
    await this.stopJob(j);
    return this.view(j);
  }
  async stopParent(parent: string): Promise<void> {
    const existing = this.stopping.get(parent);
    if (existing) return existing;
    this.epochs.set(parent, (this.epochs.get(parent) ?? 0) + 1);
    this.blocked.add(parent);
    const operation = (async () => {
      try {
        await Promise.all(
          [...this.jobs.values()]
            .filter((j) => j.parent === parent && (active(j) || j.work))
            .map((j) => this.stopJob(j)),
        );
        this.blocked.delete(parent);
      } catch (e) {
        this.blocked.add(parent);
        throw e;
      } finally {
        this.stopping.delete(parent);
      }
    })();
    this.stopping.set(parent, operation);
    return operation;
  }
  async close() {
    this.closed = true;
    await Promise.all(
      [
        ...new Set(
          [...this.jobs.values()]
            .filter((j) => active(j) || j.work)
            .map((j) => j.parent),
        ),
      ].map((p) => this.stopParent(p)),
    );
    await this.saving;
  }
}
