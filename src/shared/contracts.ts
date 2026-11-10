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
const namedModelSchema = modelSchema.extend({ name: z.string().trim().min(1).max(128), providerID: z.string().optional(), modelKey: z.string().optional() }).strict();
const providerSettings = z.object({
  baseURL: endpoint, apiKey: z.string().trim().min(1).max(8192).optional(), APIKey: z.string().trim().min(1).max(8192).optional(),
}).passthrough().superRefine((data, ctx) => {
  if (!data.apiKey && !data.APIKey) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['apiKey'], message: 'settings.apiKey 또는 APIKey를 입력하세요.' });
  if (data.apiKey && data.APIKey && data.apiKey !== data.APIKey) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['APIKey'], message: 'apiKey와 APIKey의 값이 다릅니다.' });
});
const providerModel = z.object({
  name: z.string().min(1).max(128).optional(), modelID: z.string().min(1).max(256).optional(),
  capabilities: z.object({ tools: z.boolean().optional(), input: z.array(z.enum(['text', 'image', 'audio', 'video', 'pdf'])).optional(), output: z.array(z.enum(['text', 'image', 'audio', 'video', 'pdf'])).optional() }).passthrough().optional(),
  cost: z.object({ input: z.number().nonnegative(), output: z.number().nonnegative(), cache: z.object({ read: z.number().nonnegative(), write: z.number().nonnegative() }).optional() }).optional(),
  limit: z.object({ context: z.number().int().positive().optional(), input: z.number().int().positive().optional(), output: z.number().int().positive().optional() }).optional(),
  settings: z.record(z.unknown()).optional(),
}).passthrough();
const providerSchema = z.object({
  name: z.string().min(1).max(128).optional(), package: z.literal('@opencode/ai/providers/openai-compatible').default('@opencode/ai/providers/openai-compatible'),
  env: z.array(z.string().min(1).max(128)).max(32).optional(), settings: providerSettings,
  models: z.record(z.string().min(1).max(256).refine(value => !value.includes('#')), providerModel).refine(value => Object.keys(value).length > 0 && Object.keys(value).length <= 32),
}).strict();
const selectionSchema = z.union([z.string().min(3), z.object({ providerID: z.string().min(1), model: z.string().min(1), variant: z.string().optional() }).strict()]);
const rawConfigSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2)]).default(2), model: z.union([modelSchema, selectionSchema]).optional(),
  providers: z.record(z.string().min(1).max(128).refine(value => !/[\/#]/.test(value)), providerSchema).optional(),
  models: z.array(namedModelSchema).min(1).max(32).optional(), defaultModel: z.string().max(128).optional(), openViking: openVikingSchema.optional(),
}).strict();
type RawConfig = z.infer<typeof rawConfigSchema>;
type ConfiguredModel = z.infer<typeof namedModelSchema>;
export type AgentConfig = Omit<RawConfig, 'model' | 'models'> & { model: z.infer<typeof modelSchema>; models?: ConfiguredModel[] };
export const configSchema = rawConfigSchema.superRefine((data, ctx) => {
  if (!data.model && !data.models?.length && !Object.keys(data.providers ?? {}).length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['providers'], message: 'LLM 모델을 한 개 이상 등록하세요.' });
  if (data.models && new Set(data.models.map(m => m.name)).size !== data.models.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['models'], message: 'LLM 표시 이름은 고유해야 합니다.' });
  if (data.defaultModel && !data.providers && !data.models?.some(m => m.name === data.defaultModel)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['defaultModel'], message: '등록된 모델 이름을 선택하세요.' });
  if (data.model && (typeof data.model === 'string' || 'providerID' in data.model)) {
    const selection = typeof data.model === 'string' ? { providerID: data.model.split('/')[0], model: data.model.slice(data.model.indexOf('/') + 1) } : data.model;
    if (!data.providers?.[selection.providerID]?.models[selection.model]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['model'], message: '등록된 providers와 models의 별칭을 지정하세요.' });
  }
}).transform((data): AgentConfig => {
  const fromProviders = Object.entries(data.providers ?? {}).flatMap(([providerID, provider]) => Object.entries(provider.models).map(([modelKey, definition]) => ({
    name: `${provider.name ?? providerID} · ${definition.name ?? modelKey}`.slice(0, 128), providerID, modelKey,
    baseUrl: provider.settings.baseURL, apiKey: (provider.settings.apiKey ?? provider.settings.APIKey)!, id: definition.modelID ?? modelKey,
  })));
  const models = fromProviders.length ? fromProviders.map((m, index) => ({ ...m, name: `${m.name.slice(0, 119)} [${index + 1}]` })) : data.models;
  const selection = typeof data.model === 'string' ? { providerID: data.model.split('/')[0], model: data.model.slice(data.model.indexOf('/') + 1) } : data.model && 'providerID' in data.model ? data.model : undefined;
  const model = models?.find(m => selection ? m.providerID === selection.providerID && m.modelKey === selection.model : m.name === data.defaultModel) ?? models?.[0] ?? (data.model as z.infer<typeof modelSchema>);
  return { ...data, ...(models ? { models, defaultModel: models.find(m => m === model)?.name ?? data.defaultModel } : {}), model: { baseUrl: model.baseUrl, apiKey: model.apiKey, id: model.id } };
});
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
  knowledge?: { status: 'unconfigured' | 'disabled' | 'starting' | 'ready' | 'stopping' | 'error'; message?: string; embedding?: { baseUrl: string; id: string; dimension: number }; indexedFiles: number;
    skills?: { status: 'pending' | 'registering' | 'ready' | 'error'; registered: number; total: number; conflicts: string[]; failed: string[]; message?: string } };
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
