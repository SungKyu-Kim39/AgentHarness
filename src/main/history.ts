import { readFile } from "node:fs/promises";
import { atomicJSON, type Redactor } from "./config";
import type { Project, Session } from "../shared/contracts";
import { z } from "zod";
const text = z.string();
const historySchema = z.object({
  schemaVersion: z.literal(1),
  projects: z.array(z.object({ id: text, name: text, path: text })),
  sessions: z.array(
    z.object({
      id: text,
      title: text,
      projectId: text,
      at: text,
      messages: z.array(
        z.object({
          id: text,
          role: z.enum(["user", "assistant"]),
          text,
          at: text,
          replay: z.boolean().optional(),
        }),
      ),
      tools: z.array(
        z.object({
          id: text,
          tool: text,
          target: text,
          status: z.enum([
            "waiting",
            "approval",
            "running",
            "success",
            "failed",
          ]),
          result: text.optional(),
          at: text,
        }),
      ),
      proposals: z.array(
        z.object({
          id: text,
          callId: text,
          path: text,
          before: text,
          after: text,
          baseHash: text,
          status: z.enum(["pending", "applied", "rejected", "conflict"]),
          result: text.optional(),
        }),
      ),
    }),
  ),
});
export class History {
  projects: Project[] = [];
  sessions: Session[] = [];
  private writes = Promise.resolve();
  constructor(
    private file: string,
    private redactor: Redactor,
  ) {}
  async load() {
    const raw = await readFile(this.file, "utf8").catch(
      (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOENT") return undefined;
        throw e;
      },
    );
    if (!raw) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(
        "작업 기록이 손상되었습니다. 원본을 보존했으며 덮어쓰지 않습니다.",
      );
    }
    const parsed = historySchema.safeParse(data);
    if (!parsed.success)
      throw new Error(
        "지원하지 않거나 손상된 기록 형식입니다. 원본을 보존했습니다.",
      );
    this.projects = parsed.data.projects;
    this.sessions = parsed.data.sessions;
    for (const session of this.sessions) {
      for (const tool of session.tools)
        if (["waiting", "approval", "running"].includes(tool.status)) {
          tool.status = "failed";
          tool.result = "이전 실행 종료로 취소되었습니다.";
        }
      for (const proposal of session.proposals)
        if (proposal.status === "pending") {
          proposal.status = "rejected";
          proposal.result = "재실행 후 이전 승인은 유효하지 않습니다.";
        }
    }
  }
  save() {
    const snapshot = this.redactor.object({
      schemaVersion: 1,
      projects: this.projects,
      sessions: this.sessions,
    });
    this.writes = this.writes
      .catch(() => {})
      .then(() => atomicJSON(this.file, snapshot));
    return this.writes;
  }
}
