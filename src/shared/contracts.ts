import { z } from "zod";
const endpoint = z.string().trim().url().superRefine((value, ctx) => {
  let url: URL; try { url = new URL(value); } catch { return; }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || /\/(?:embeddings|chat\/completions)\/?$/.test(url.pathname)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: '인증 정보 없이 API 기준 경로(/v1 등)를 지정하세요.' });
  }
});
export const openVikingSchema = z.object({
  enabled: z.boolean().default(true),
  embedding: z.object({ baseUrl: endpoint, apiKey: z.string().trim().min(1).max(8192), id: z.string().trim().min(1).max(256), dimension: z.number().int().min(1).max(65536) }).strict(),
  vlm: z.object({ baseUrl: endpoint, apiKey: z.string().trim().min(1).max(8192), id: z.string().trim().min(1).max(256) }).strict().optional(),
}).strict();
const modelSchema = z.object({ baseUrl: endpoint, apiKey: z.string().trim().min(1).max(8192), id: z.string().trim().min(1).max(256) }).strict();
const namedModelSchema = modelSchema.extend({ name: z.string().trim().min(1).max(128) }).strict();
export const configSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2)]), model: modelSchema.optional(),
  models: z.array(namedModelSchema).min(1).max(32).optional(), defaultModel: z.string().max(128).optional(), openViking: openVikingSchema.optional(),
}).strict().superRefine((data, ctx) => {
  if (!data.model && !data.models?.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['models'], message: 'LLM 모델을 한 개 이상 등록하세요.' });
  if (data.models && new Set(data.models.map(m => m.name)).size !== data.models.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['models'], message: 'LLM 표시 이름은 고유해야 합니다.' });
  if (data.defaultModel && !data.models?.some(m => m.name === data.defaultModel)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['defaultModel'], message: '등록된 모델 이름을 선택하세요.' });
}).transform(data => ({ ...data, model: data.models?.find(m => m.name === data.defaultModel) ?? data.models?.[0] ?? data.model! }));
export type AgentConfig = z.infer<typeof configSchema>;
export type Phase =
  | "idle"
  | "running"
  | "stopping"
  | "stopped"
  | "unconfirmed"
  | "replaying";
export type ToolStatus =
  | "waiting"
  | "approval"
  | "running"
  | "success"
  | "failed";
export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
  replay?: boolean;
}
export interface ToolEvent {
  id: string;
  tool: string;
  target: string;
  status: ToolStatus;
  result?: string;
  at: string;
}
export interface Proposal {
  id: string;
  callId: string;
  path: string;
  before: string;
  after: string;
  baseHash: string;
  status: "pending" | "applied" | "rejected" | "conflict";
  result?: string;
}
export interface Project {
  id: string;
  name: string;
  path: string;
}
export interface Session {
  id: string;
  title: string;
  projectId: string;
  at: string;
  messages: Message[];
  tools: ToolEvent[];
  proposals: Proposal[];
}
export interface AppState {
  phase: Phase;
  projects: Project[];
  sessions: Session[];
  activeSessionId?: string;
  files: string[];
  model?: { name?: string; baseUrl: string; id: string };
  models?: Array<{ name: string; baseUrl: string; id: string }>;
  configError?: string;
  engine: "offline" | "starting" | "ready" | "error";
  notice?: string;
  sessionApproval: boolean;
  capabilities: { commands: false; serena: boolean; snapshots: true };
  knowledge?: { status: 'unconfigured' | 'disabled' | 'starting' | 'ready' | 'stopping' | 'error'; message?: string; embedding?: { baseUrl: string; id: string; dimension: number }; indexedFiles: number };
  skills?: Array<{ id: string; name: string; description: string }>;
}
export const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("state") }).strict(),
  z
    .object({ action: z.literal("importConfig"), replace: z.boolean() })
    .strict(),
  z.object({ action: z.literal("openProject") }).strict(),
  z
    .object({ action: z.literal("newSession"), projectId: z.string().max(128) })
    .strict(),
  z
    .object({
      action: z.literal("selectSession"),
      sessionId: z.string().max(128),
    })
    .strict(),
  z
    .object({
      action: z.literal("send"),
      text: z.string().trim().min(1).max(32000),
    })
    .strict(),
  z.object({ action: z.literal("stop") }).strict(),
  z.object({ action: z.literal("replay") }).strict(),
  z
    .object({
      action: z.literal("approve"),
      proposalId: z.string().max(128),
      decision: z.enum(["once", "session", "reject"]),
    })
    .strict(),
  z.object({ action: z.literal("resetApproval") }).strict(),
  z.object({ action: z.literal("selectModel"), name: z.string().min(1).max(128) }).strict(),
  z.object({ action: z.literal('indexKnowledge'), path: z.string().min(1).max(4096) }).strict(),
  z
    .object({ action: z.literal("readFile"), path: z.string().max(4096) })
    .strict(),
]);
export type Request = z.infer<typeof requestSchema>;
export interface Reply {
  ok: boolean;
  error?: string;
  content?: string;
}
export interface VibeAPI {
  invoke(request: Request): Promise<Reply & { state?: AppState }>;
  subscribe(listener: (state: AppState) => void): () => void;
}
declare global {
  interface Window {
    vibe?: VibeAPI;
  }
}
