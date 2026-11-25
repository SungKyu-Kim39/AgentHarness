import { requestJSON } from './http-request';
import pythonRuntime from '../../python-runtime-lock.json';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, readdir, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { atomicJSON } from './config';
import { OpenVikingGateway } from './openviking-gateway';
import { vikingErrorCode, sanitizeVikingDiagnostic } from './openviking-errors';
import { verifyFiles } from './parallel-files';
import { PersonalKnowledge } from './personal-knowledge';
import { migrateVikingNamespace, backupVikingAccount, vikingAccount } from './openviking-namespace';
import type { AgentConfig, AppState } from '../shared/contracts';
const personalNotes = 'viking://user/local-user/resources/ned-personal';
const personalMemories = 'viking://user/local-user/memories';
export type KnowledgeScope = 'project' | 'personal';
export interface MemoryRecallItem { uri: string; abstract?: string; score?: number }
export interface MemoryRecallResult { profile?: string; items: MemoryRecallItem[] }
export function savedKnowledgeId(title: string) {
  return createHash('sha256').update(title.trim().normalize('NFC')).digest('hex').slice(0, 24);
}
function knowledgeNoteRoot(scope: KnowledgeScope, project: string) {
  return scope === 'personal' ? personalNotes : knowledgeRoot(project) + '/ned-notes';
}
function knowledgeNoteUri(scope: KnowledgeScope, project: string, id: string) {
  if (!/^[a-f0-9]{24}$/.test(id)) throw new Error('저장된 지식 ID가 올바르지 않습니다.');
  return knowledgeNoteRoot(scope, project) + '/' + id + '.md';
}
function isSafePersonalMemoryUri(uri: string) {
  return uri.startsWith(personalMemories + '/') && !/(?:^|\/)\.{1,2}(?:\/|$)|[%\\\x00-\x1f?#]/.test(uri);
}
export type MemoryTaskStatus = { status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'not_found' | 'unknown'; error?: string };
export interface MemoryCommitResult { taskId?: string; skipped?: boolean; reason?: string; archiveUri?: string }
export interface KnowledgeService {
  state(): NonNullable<AppState['knowledge']>;
  isReady?(): boolean;
  configure(config?: AgentConfig): Promise<void>;
  search(project: string, query: string, limit: number, signal?: AbortSignal): Promise<string>;
  read(project: string, uri: string, signal?: AbortSignal): Promise<string>;
  index(project: string, filename: string, content: string, signal?: AbortSignal): Promise<string>;
  close(): Promise<void>;
  personalSearch?(query: string, limit: number): Promise<string>;
  personalRead?(uri: string): Promise<string>;
  saveNote?(scope: KnowledgeScope, project: string, title: string, content: string, id: string, signal?: AbortSignal): Promise<string>;
  deleteNote?(scope: KnowledgeScope, project: string, id: string, signal?: AbortSignal): Promise<string>;
  listNotes?(scope: KnowledgeScope, project: string, signal?: AbortSignal): Promise<string>;
  ensureMemorySession?(sessionId: string, signal?: AbortSignal): Promise<void>;
  appendSessionMessages?(sessionId: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, signal?: AbortSignal): Promise<void>;
  commitMemorySession?(sessionId: string, timeoutMs?: number): Promise<MemoryCommitResult>;
  getTaskStatus?(taskId: string, timeoutMs?: number): Promise<MemoryTaskStatus>;
  recallMemories?(query: string, limit?: number, timeoutMs?: number): Promise<MemoryRecallResult>;
}
export interface VikingLaunch { executable: string; launcher: string; cwd: string; diagnostic?: (text: string) => void; semanticDebounceMs?: number; semanticRetryDelayMs?: number }
type SemanticRefreshEntry = { timer: ReturnType<typeof setTimeout>; recursive: boolean; kind: 'note' | 'index' };
type StartupStage = 'bundle' | 'configuration' | 'process' | 'health' | 'namespace';
type StartupCode = 'OV_BUNDLE' | 'OV_CONFIGURATION' | 'OV_PROCESS_START' | 'OV_PROCESS_EXIT' | 'OV_HEALTH_TIMEOUT' | 'OV_NAMESPACE';
type StartupDetail = { osError?: string; exitCode?: number; exitHex?: string; signal?: string; hint?: string; healthStatus?: number };
class StartupFailure extends Error {
  constructor(readonly code: StartupCode, readonly detail: StartupDetail = {}) { super(code); }
}
// Persist only categories and numeric status. Raw Python output can contain
// request data and is deliberately excluded from production diagnostics.
function startupHint(stderr: string) {
  if (/Ned tokenizer (?:cache|data)/.test(stderr)) return 'tokenizer_cache';
  if (/DLL load failed|WinError (?:126|127|193)|cannot load library/i.test(stderr)) return 'native_library';
  if (/ModuleNotFoundError|No module named/.test(stderr)) return 'python_module';
  if (/ValidationError|validation error/i.test(stderr)) return 'configuration';
  if (/PermissionError|WinError 5|Access is denied/i.test(stderr)) return 'permission';
  if (/outbound connection is not an approved|external DNS is disabled/.test(stderr)) return 'network_policy';
  return undefined;
}
function osError(error: unknown) {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return typeof code === 'string' && /^[A-Z][A-Z0-9_]{0,31}$/.test(code) ? code : undefined;
}
const pause = (ms: number) => new Promise(r => setTimeout(r, ms));
export function knowledgeRoot(project: string) {
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(project)) throw new Error('프로젝트 지식 범위가 올바르지 않습니다.');
  return `viking://resources/ned/${project}`;
}
export function scopedKnowledgeUri(project: string, uri: string) {
  const root = knowledgeRoot(project);
  if (!uri.startsWith(root + '/') || /(?:^|\/)\.{1,2}(?:\/|$)|[%\\\x00-\x1f?#]/.test(uri)) throw new Error('다른 프로젝트의 지식 경로는 읽을 수 없습니다.');
  return uri;
}
export class OpenVikingService implements KnowledgeService {
  private value: NonNullable<AppState['knowledge']> = { status: 'unconfigured', indexedFiles: 0 };
  private process?: ChildProcess; private gateway?: OpenVikingGateway; private configFile?: string;
  private account = 'ned';
  private maintenance = false;
  private baseUrl = ''; private token = ''; private exited = true; private expectedExit = false;
  private operation = Promise.resolve(); private stopped?: Promise<void>;
  private diagnosticWrites = Promise.resolve();
  private modelEvents: unknown[] = [];
  private requestEvents: unknown[] = [];
  private diagnosticSecrets: string[] = [];
  private personal?: PersonalKnowledge;
  private writingNotes = new Set<string>();
  private semanticTimers = new Map<string, SemanticRefreshEntry>();
  private namespaceAbort?: AbortController;
  private startupStage: StartupStage = 'bundle';
  constructor(private runtime: string, private data: string, private changed: () => void, private testLaunch?: VikingLaunch) {}
  state() { return structuredClone(this.value); }
  isReady() { return this.value.status === 'ready' && !this.exited && !this.maintenance; }
  localPorts() { return [this.baseUrl, this.gateway?.baseUrl].filter((u): u is string => !!u).map(u => Number(new URL(u).port)); }
  modelActivity() { return this.gateway?.activity() ?? { completion: 0, embedding: 0 }; }
  async studioConnection(): Promise<{ baseUrl: string; headers: Record<string, string> }> {
    this.ready();
    if (this.maintenance) throw new Error('자료 이관 중에는 Studio를 열 수 없습니다.');
    await this.request('/health', undefined, 3000);
    this.ready();
    // Explicit human-operated Studio may manage this private account, including
    // imported user areas. This connection is never exposed to model/ACP tools.
    return { baseUrl: this.baseUrl, headers: { ...this.credentials('local-user'), 'X-OpenViking-Role': 'admin' } };
  }
  private update(status: NonNullable<AppState['knowledge']>['status'], message?: string) { this.value.status = status; this.value.message = message; this.changed(); }
  configure(config?: AgentConfig) {
    this.namespaceAbort?.abort();
    const namespaceAbort = new AbortController(); this.namespaceAbort = namespaceAbort;
    this.operation = this.operation.catch(() => {}).then(async () => {
      await this.stop();
      if (!config?.openViking) { this.value.embedding = undefined; this.update('unconfigured', 'JSON에 OpenViking 임베딩 모델을 설정하세요.'); return; }
      this.value.embedding = { baseUrl: config.openViking.embedding.baseUrl, id: config.openViking.embedding.id, dimension: config.openViking.embedding.dimension };
      if (!config.openViking.enabled) { this.update('disabled'); return; }
      this.update('starting');
      try {
        await migrateVikingNamespace(path.join(this.data, 'openviking'), {
          start: (workspace, account) => this.start(config, workspace, account, true), stop: () => this.stop(),
          request: (route, options) => this.request(route, options?.body, false, options?.method, options?.signal),
          backup: (file, signal) => backupVikingAccount(this.baseUrl, this.credentials('local-user'), file, signal),
        }, namespaceAbort.signal).catch(error => { this.startupStage = 'namespace'; throw new StartupFailure('OV_NAMESPACE', { osError: osError(error) }); });
        namespaceAbort.signal.throwIfAborted();
        await this.start(config); this.update('ready');
        await this.writeStartupStatus({ status: 'ready', stage: 'health' });

      }
      catch (error) {
        const failure = error instanceof StartupFailure ? error : new StartupFailure(
          this.startupStage === 'bundle' ? 'OV_BUNDLE' : this.startupStage === 'configuration' ? 'OV_CONFIGURATION' : 'OV_PROCESS_START',
          { osError: osError(error) },
        );
        let stopConfirmed = true;
        await this.stop().catch(() => { stopConfirmed = false; });
        const recorded = await this.writeStartupStatus({ status: 'error', stage: this.startupStage, code: failure.code, ...failure.detail, stopConfirmed });
        const labels: Record<StartupCode, string> = {
          OV_BUNDLE: 'OpenViking 번들 파일을 읽거나 검증하지 못했습니다.',
          OV_CONFIGURATION: 'OpenViking 실행 설정을 준비하지 못했습니다.',
          OV_PROCESS_START: 'OpenViking Python 프로세스를 실행하지 못했습니다.',
          OV_PROCESS_EXIT: 'OpenViking이 준비되기 전에 Python 프로세스가 종료되었습니다.',
          OV_HEALTH_TIMEOUT: 'OpenViking의 로컬 준비 확인 시간이 초과되었습니다.',
          OV_NAMESPACE: 'OpenViking 저장소 이름 이관을 완료하지 못했습니다. 원본과 이관 사본을 보존했습니다. 폴더를 직접 변경하지 말고 namespace-migration.json과 진단 상태를 확인하세요.',
        };
        const detail = [failure.code, failure.detail.osError, failure.detail.exitHex, failure.detail.hint].filter(Boolean).join(', ');
        this.update('error', labels[failure.code] + ' [' + detail + ']' +
          (recorded ? ' 진단 파일: 사용자 데이터 폴더의 openviking/startup-status.json' : ' 진단 파일도 저장하지 못했습니다.') +
          (stopConfirmed ? '' : ' 프로세스 종료를 확인하지 못했습니다. 앱을 종료하고 확인하세요.'));
      }
    });
    return this.operation;
  }
  private async writeStartupStatus(detail: Record<string, unknown>) {
    try { await atomicJSON(path.join(this.data, 'openviking', 'startup-status.json'), { schemaVersion: 1, recordedAt: new Date().toISOString(), ...detail }); return true; }
    catch { return false; }
  }
  private async resolveLaunch(): Promise<VikingLaunch> {
    if (this.testLaunch) return this.testLaunch;
    const platform = process.platform === 'win32' ? 'windows-x64' : 'linux-x64';
    const root = path.join(this.runtime, platform, 'openviking');
    const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
    if (manifest.version !== pythonRuntime.openViking.version || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('OpenViking 번들 없음');
    this.update('starting', '지식 서비스 파일을 확인하고 있습니다.');
    await verifyFiles(root, manifest.files, (done,total) => {
      if (done === total || done % 100 === 0) this.update('starting', `지식 서비스 파일 확인 ${done}/${total}`);
    });
    return { executable: path.join(root, 'python', process.platform === 'win32' ? 'python.exe' : 'bin/python3'), launcher: path.join(root, 'launch.py'), cwd: root };
  }
  private async start(config: AgentConfig, workspace = path.join(this.data, 'openviking', 'data'), account = vikingAccount, maintenance = false) {
    this.account = account; this.maintenance = maintenance;
    this.startupStage = 'bundle';
    const launch = await this.resolveLaunch();
    this.personal = new PersonalKnowledge(path.join(this.data, 'openviking'),
      (user, route, options) => this.request(route, options?.body, false, options?.method, options?.signal, user));
    this.startupStage = 'configuration';
    const folder = path.join(this.data, 'openviking'); await mkdir(folder, { recursive: true, mode: 0o700 });
    this.gateway = new OpenVikingGateway(config, event => {
      this.modelEvents.push(event); this.modelEvents = this.modelEvents.slice(-20);
      const events = structuredClone(this.modelEvents);
      this.diagnosticWrites = this.diagnosticWrites.catch(() => {}).then(() => atomicJSON(path.join(folder, 'model-status.json'), { schemaVersion: 1, events }));
    }); await this.gateway.start();
    const reserve = createServer(); await new Promise<void>((resolve, reject) => { reserve.once('error', reject); reserve.listen(0, '127.0.0.1', resolve); });
    const address = reserve.address(); if (!address || typeof address === 'string') throw new Error('포트 할당 실패');
    const port = address.port; await new Promise<void>(resolve => reserve.close(() => resolve()));
    this.baseUrl = `http://127.0.0.1:${port}`; this.token = randomBytes(32).toString('hex');
    const gateway = this.gateway; const embedding = config.openViking!.embedding; const vlm = config.openViking!.vlm ?? config.model;
    this.diagnosticSecrets = [this.token, gateway.token, embedding.apiKey, vlm.apiKey, config.model.apiKey].filter(Boolean);
    for (const stale of await readdir(folder).catch(() => [])) {
      if (/^runtime-[a-f0-9]{16}\.json$/.test(stale)) await unlink(path.join(folder, stale)).catch(() => {});
    }
    this.configFile = path.join(folder, `runtime-${randomBytes(8).toString('hex')}.json`);
    await atomicJSON(this.configFile, {
      storage: { workspace, agfs: { backend: 'local' }, vectordb: { backend: 'local', name: 'context' } },
      server: { host: '127.0.0.1', port, workers: 1, auth_mode: 'trusted', root_api_key: this.token },
      embedding: { dense: { provider: 'openai', api_base: gateway.baseUrl, api_key: gateway.token, model: embedding.id, dimension: embedding.dimension } },
      vlm: { provider: 'openai', api_base: gateway.baseUrl, api_key: gateway.token, model: vlm.id, timeout: 86400, file_processing_timeout: 86400 },
      telemetry: { tracer: { enabled: false } },
    });
    this.expectedExit = false; this.exited = false;
    this.startupStage = 'process';
    this.update('starting', '지식 서비스 프로세스를 시작하고 있습니다.');
    let launchError: string | undefined; let stderr = ''; let lastHealthStatus: number | undefined;
    this.process = spawn(launch.executable, ['-I', '-B', launch.launcher, '--config', this.configFile, '--port', String(port)], {
      cwd: launch.cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
      env: { SYSTEMROOT: process.env.SYSTEMROOT ?? process.env.SystemRoot, SystemRoot: process.env.SystemRoot ?? process.env.SYSTEMROOT, WINDIR: process.env.WINDIR, TEMP: process.env.TEMP, TMP: process.env.TMP,
        PATH: path.dirname(launch.executable), HOME: folder, USERPROFILE: folder, APPDATA: folder, LOCALAPPDATA: folder,
        PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8',
        HF_HUB_OFFLINE: '1', TRANSFORMERS_OFFLINE: '1', HF_HUB_DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1', OTEL_SDK_DISABLED: 'true',
        LITELLM_LOCAL_MODEL_COST_MAP: 'True', LITELLM_TELEMETRY: 'False', NO_PROXY: '127.0.0.1,localhost',
        TIKTOKEN_CACHE_DIR: path.join(launch.cwd, 'tokenizers'),
      },
    });
    this.process.stdout!.on('data', () => {}); this.process.stderr!.on('data', bytes => {
      const text = bytes.toString(); stderr = (stderr + text).slice(-32768); launch.diagnostic?.(text);
    });
    this.process.once('error', error => { launchError = osError(error) ?? 'UNKNOWN'; this.exited = true; if (!this.expectedExit) this.update('error', 'OpenViking 프로세스를 실행할 수 없습니다.'); });
    this.process.once('exit', () => { this.exited = true; if (!this.expectedExit) this.update('error', 'OpenViking이 종료되었습니다. 설정에서 다시 시작할 수 있습니다.'); });
    const deadline = Date.now() + 45000;
    this.startupStage = 'health';
    this.update('starting', '지식 서비스의 응답을 확인하고 있습니다.');
    while (Date.now() < deadline && !this.exited) {
      this.namespaceAbort?.signal.throwIfAborted();
      try { const response = await this.request('/health', undefined, 1000); if (response) return; }
      catch (error) { const status = (error as { status?: number })?.status; if (typeof status === 'number' && Number.isInteger(status)) lastHealthStatus = status; }
      await pause(200);
    }
    if (launchError) { this.startupStage = 'process'; throw new StartupFailure('OV_PROCESS_START', { osError: launchError }); }
    if (this.exited) {
      this.startupStage = 'process';
      const code = this.process.exitCode;
      throw new StartupFailure('OV_PROCESS_EXIT', { ...(code === null ? {} : { exitCode: code, exitHex: '0x' + (code >>> 0).toString(16).padStart(8, '0') }),
        ...(this.process.signalCode ? { signal: this.process.signalCode } : {}), hint: startupHint(stderr) });
    }
    throw new StartupFailure('OV_HEALTH_TIMEOUT', { healthStatus: lastHealthStatus, hint: startupHint(stderr) });
  }
  private credentials(user: string, admin = false): Record<string, string> {
    // Migration asserts account maintenance before tools are ready. Studio adds
    // its own human-only role separately; normal model sessions retain USER scope.
    return { Authorization: `Bearer ${this.token}`, 'X-API-Key': this.token, 'X-OpenViking-Account': this.account,
      'X-OpenViking-User': user, ...(this.maintenance || admin ? { 'X-OpenViking-Role': 'admin' } : {}) };
  }
  private recordRequestDiagnostic(method: string, route: string, status: number | undefined, code: string, detail: string) {
    if (route === '/health') return;
    const safeRoute = sanitizeVikingDiagnostic(route, this.diagnosticSecrets, 200);
    const safeDetail = sanitizeVikingDiagnostic(detail, this.diagnosticSecrets, 500);
    const line = `HTTP ${status ?? 'ERR'} ${safeRoute}`;
    if (this.testLaunch?.diagnostic) this.testLaunch.diagnostic(`${line}: ${safeDetail}`);
    this.requestEvents.push({ recordedAt: new Date().toISOString(), method, route: safeRoute, ...(status === undefined ? {} : { httpStatus: status }), code, summary: line, detail: safeDetail });
    this.requestEvents = this.requestEvents.slice(-30);
    const events = structuredClone(this.requestEvents);
    const file = path.join(this.data, 'openviking', 'request-diagnostics.json');
    this.diagnosticWrites = this.diagnosticWrites.catch(() => {}).then(() => atomicJSON(file, { schemaVersion: 1, events }));
  }
  private async request(route: string, body?: unknown, timeout: number | false = false, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', signal?: AbortSignal, user = 'local-user', options: { admin?: boolean; quiet404?: boolean } = {}): Promise<any> {
    const form = body instanceof FormData;
    const verb = method ?? (body === undefined ? 'GET' : 'POST');
    const headers = { ...this.credentials(user, options.admin), ...(form ? {} : { 'Content-Type': 'application/json' }) };
    let response: Awaited<ReturnType<typeof requestJSON>> | Response;
    try {
      response = timeout === false && !form
        ? await requestJSON(this.baseUrl + route, { method: verb, headers, body: body === undefined ? undefined : JSON.stringify(body), signal })
        : await fetch(this.baseUrl + route, { method: verb, redirect: 'error', headers, body: body === undefined ? undefined : form ? body : JSON.stringify(body), signal: timeout === false ? signal : signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout) });
    } catch (error) {
      const raw = error instanceof Error ? `${error.name}: ${error.message} ${(error as NodeJS.ErrnoException).code ?? ''}` : String(error);
      const code = vikingErrorCode(raw);
      this.recordRequestDiagnostic(verb, route, undefined, code, raw);
      throw new Error(code);
    }
    if (!response.ok) {
      const detail = await response.text();
      const code = vikingErrorCode(detail, response.status);
      if (!(options.quiet404 && response.status === 404)) this.recordRequestDiagnostic(verb, route, response.status, code, detail);
      throw Object.assign(new Error(code), { status: response.status });
    }
    const text = await response.text(); if (text.length > 8 * 1024 * 1024) throw new Error('지식 응답 크기 초과');
    const json = JSON.parse(text);
    if (json.status === 'error') {
      const code = vikingErrorCode(text, response.status);
      this.recordRequestDiagnostic(verb, route, response.status, code, text);
      throw new Error(code);
    }
    return json;
  }
  private ready() { if (this.value.status !== 'ready' || this.exited) throw new Error('OpenViking이 준비되지 않았습니다. 모델·번들 설정을 확인하세요.'); }
  private async noteExists(uri: string, signal?: AbortSignal, timeout: number | false = false) {
    return this.request('/api/v1/fs/stat?uri=' + encodeURIComponent(uri), undefined, timeout, 'GET', signal, 'local-user', { quiet404: true }).then(() => true, error => {
      if (error?.status === 404) return false;
      throw error;
    });
  }
  private semanticDebounceMs() { return this.testLaunch?.semanticDebounceMs ?? 1500; }
  private semanticRetryDelayMs() { return this.testLaunch?.semanticRetryDelayMs ?? 2500; }
  private cancelSemanticRefresh(uri: string) {
    const existing = this.semanticTimers.get(uri);
    if (existing) { clearTimeout(existing.timer); this.semanticTimers.delete(uri); }
  }
  private cancelChildSemanticRefreshes(parentUri: string) {
    const prefix = parentUri.replace(/\/+$/, '') + '/';
    for (const [key, entry] of this.semanticTimers) {
      if (key.startsWith(prefix)) {
        clearTimeout(entry.timer);
        this.semanticTimers.delete(key);
      }
    }
  }
  private hasPendingParentRefresh(uri: string) {
    for (const [key, entry] of this.semanticTimers) {
      if (entry.recursive && uri.startsWith(key.replace(/\/+$/, '') + '/')) return true;
    }
    return false;
  }
  private runSemanticRefresh(uri: string, kind: 'note' | 'index', route: string, execute: () => Promise<unknown>, attempt = 1) {
    if (!this.isReady()) return;
    if (kind === 'note' && this.writingNotes.has(uri)) {
      this.scheduleSemanticTimer(uri, false, kind, this.semanticDebounceMs(), () => this.runSemanticRefresh(uri, kind, route, execute, attempt));
      return;
    }
    void execute().catch(error => {
      const status = typeof (error as { status?: unknown })?.status === 'number' ? (error as { status: number }).status : undefined;
      const reason = error instanceof Error ? error.message : String(error);
      const isConflict = status === 409 || reason === 'OV_CONFLICT';
      if (isConflict && attempt === 1 && this.isReady()) {
        this.recordRequestDiagnostic('POST', route, status ?? 409, 'OV_SEMANTIC_RETRY', `semantic_refresh(${kind}) conflict on ${uri}; scheduling retry`);
        this.scheduleSemanticTimer(uri, kind === 'index', kind, this.semanticRetryDelayMs(), () => this.runSemanticRefresh(uri, kind, route, execute, 2));
        return;
      }
      this.recordRequestDiagnostic('POST', route, status, 'OV_SEMANTIC_REFRESH_FAILED', `semantic_refresh(${kind}) failed on ${uri} (attempt ${attempt}): ${reason}`);
    });
  }
  private scheduleSemanticTimer(uri: string, recursive: boolean, kind: 'note' | 'index', delayMs: number, task: () => void) {
    this.cancelSemanticRefresh(uri);
    const timer = setTimeout(() => {
      this.semanticTimers.delete(uri);
      task();
    }, delayMs);
    timer.unref();
    this.semanticTimers.set(uri, { timer, recursive, kind });
  }
  private scheduleNoteSemanticRefresh(uri: string, body: string) {
    if (!this.isReady() || this.hasPendingParentRefresh(uri)) return;
    // Debounce slightly so rapid consecutive updates/deletes to the same note
    // do not collide with OpenViking's AGFS path lock while VLM runs.
    this.scheduleSemanticTimer(uri, false, 'note', this.semanticDebounceMs(), () => {
      this.runSemanticRefresh(uri, 'note', '/api/v1/content/write', () =>
        this.request('/api/v1/content/write', {
          uri, content: body, mode: 'replace', wait: false, processing_mode: 'semantic_and_vectors', edit_source: 'manual',
        }, 15000, 'POST'),
      );
    });
  }
  private scheduleIndexSemanticRefresh(target: string) {
    if (!this.isReady() || this.hasPendingParentRefresh(target)) return;
    this.cancelChildSemanticRefreshes(target);
    this.scheduleSemanticTimer(target, true, 'index', this.semanticDebounceMs(), () => {
      this.cancelChildSemanticRefreshes(target);
      this.runSemanticRefresh(target, 'index', '/api/v1/content/reindex', () =>
        this.request('/api/v1/content/reindex', {
          uri: target, mode: 'semantic_and_vectors', force: true, wait: false, recursive: true,
        }, 15000, 'POST', undefined, 'local-user', { admin: true }),
      );
    });
  }
  async personalSearch(query: string, limit: number) {
    this.ready();
    const imported = JSON.parse(await this.personal!.search(query, limit));
    const merged: Array<{ uri: string; abstract?: string; score?: number }> = [...(imported.results ?? [])];
    const personalNotesAvailable = await this.noteExists(personalNotes);
    if (personalNotesAvailable) {
      const response = await this.request('/api/v1/search/find', { query, target_uri: personalNotes, limit, read_content: false });
      const matches = (response.result?.resources ?? []).filter((item: {uri?: string}) => typeof item.uri === 'string' && item.uri.startsWith(personalNotes + '/'));
      merged.push(...matches.map(({uri, abstract, score}: {uri: string; abstract?: string; score?: number}) => ({uri, abstract, score})));
    }
    const personalMemoriesAvailable = await this.noteExists(personalMemories);
    if (personalMemoriesAvailable) {
      const response = await this.request('/api/v1/search/find', { query, target_uri: personalMemories, limit, read_content: false }).catch(() => undefined);
      const raw = [...(response?.result?.memories ?? []), ...(response?.result?.resources ?? [])];
      const matches = raw.filter((item: {uri?: string}) => typeof item.uri === 'string' && isSafePersonalMemoryUri(item.uri));
      merged.push(...matches.map(({uri, abstract, score}: {uri: string; abstract?: string; score?: number}) => ({uri, abstract, score})));
    }
    const deduped = new Map<string, { uri: string; abstract?: string; score?: number }>();
    for (const item of merged) {
      const existing = deduped.get(item.uri);
      if (!existing || (item.score ?? 0) > (existing.score ?? 0)) deduped.set(item.uri, item);
    }
    const results = [...deduped.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limit);
    return JSON.stringify({ ...imported, personalNotesAvailable, personalMemoriesAvailable, results });
  }
  async personalRead(uri: string) {
    this.ready();
    if (uri.startsWith(personalNotes + '/') && /^[a-f0-9]{24}\.md$/.test(uri.slice(personalNotes.length + 1)))
      return JSON.stringify(await this.request('/api/v1/content/read?uri=' + encodeURIComponent(uri) + '&limit=300'));
    if (isSafePersonalMemoryUri(uri))
      return JSON.stringify(await this.request('/api/v1/content/read?uri=' + encodeURIComponent(uri) + '&limit=300'));
    return this.personal!.read(uri);
  }
  async saveNote(scope: KnowledgeScope, project: string, title: string, content: string, id: string, signal?: AbortSignal) {
    this.ready();
    const root = knowledgeNoteRoot(scope, project);
    const uri = knowledgeNoteUri(scope, project, id);
    if (this.writingNotes.has(uri)) throw new Error('해당 지식을 변경하는 다른 작업이 있습니다.');
    this.writingNotes.add(uri);
    try {
      for (const folder of scope === 'personal' ? ['viking://user/local-user/resources', root] : ['viking://resources/ned', knowledgeRoot(project), root]) {
        if (!await this.noteExists(folder, signal)) {
          try { await this.request('/api/v1/fs/mkdir', { uri: folder }, false, 'POST', signal); }
          catch (error) { if ((error as {status?: number}).status !== 409 || !await this.noteExists(folder, signal)) throw error; }
        }
      }
      const mode = await this.noteExists(uri, signal) ? 'replace' : 'create';
      const body = '# ' + title + '\n\n' + content;
      await this.request('/api/v1/content/write', {
        uri, content: body, mode, wait: true, processing_mode: 'vectors_only', edit_source: 'manual'
      }, false, 'POST', signal);
      this.scheduleNoteSemanticRefresh(uri, body);
      return JSON.stringify({ status: 'saved', scope, id, uri, title, semanticRefresh: 'queued' });
    } finally { this.writingNotes.delete(uri); }
  }
  async deleteNote(scope: KnowledgeScope, project: string, id: string, signal?: AbortSignal) {
    this.ready();
    const uri = knowledgeNoteUri(scope, project, id);
    if (this.writingNotes.has(uri)) throw new Error('해당 지식을 변경하는 다른 작업이 있습니다.');
    this.writingNotes.add(uri);
    try {
      if (await this.noteExists(uri, signal)) await this.request('/api/v1/fs?uri=' + encodeURIComponent(uri) + '&wait=true', undefined, false, 'DELETE', signal);
      this.cancelSemanticRefresh(uri);
      return JSON.stringify({ status: 'deleted', scope, id, uri });
    } finally { this.writingNotes.delete(uri); }
  }
  async listNotes(scope: KnowledgeScope, project: string, signal?: AbortSignal) {
    this.ready();
    const root = knowledgeNoteRoot(scope, project);
    if (!await this.noteExists(root, signal)) return JSON.stringify({ scope, entries: [] });
    const result = await this.request('/api/v1/fs/ls?uri=' + encodeURIComponent(root) + '&limit=100', undefined, false, 'GET', signal);
    return JSON.stringify({ scope, root, entries: result.result });
  }
  async search(project: string, query: string, limit: number, signal?: AbortSignal) {
    this.ready(); const root = knowledgeRoot(project);
    const result = await this.request('/api/v1/search/find', { query, target_uri: root, limit, read_content: false }, false, 'POST', signal);
    const matches = result.result ?? result;
    return JSON.stringify({ source: 'OpenViking', project, results: matches });
  }
  async read(project: string, uri: string, signal?: AbortSignal) {
    this.ready(); const scoped = scopedKnowledgeUri(project, uri);
    return JSON.stringify(await this.request('/api/v1/content/read?uri=' + encodeURIComponent(scoped) + '&limit=300', undefined, false, 'GET', signal));
  }
  async index(project: string, filename: string, content: string, signal?: AbortSignal) {
    this.ready();
    if (Buffer.byteLength(content) > 2 * 1024 * 1024) throw new Error('2 MiB 이하 텍스트만 색인할 수 있습니다.');
    const form = new FormData(); form.append('file', new Blob([content], { type: 'text/plain' }), path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '_') + '.txt');
    const response = await fetch(this.baseUrl + '/api/v1/resources/temp_upload', { method: 'POST', redirect: 'error', headers: this.credentials('local-user'), body: form, signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000) });
    if (!response.ok) {
      const detail = await response.text();
      const code = vikingErrorCode(detail, response.status);
      this.recordRequestDiagnostic('POST', '/api/v1/resources/temp_upload', response.status, code, detail);
      throw new Error(`OpenViking 파일 전달 실패 [${code}]`);
    }
    const upload = await response.json(); const id = upload.result?.temp_file_id ?? upload.temp_file_id;
    if (typeof id !== 'string') throw new Error('OpenViking 업로드 확인 실패');
    const target = knowledgeRoot(project) + '/' + createHash('sha256').update(filename).digest('hex').slice(0, 20);
    await this.request('/api/v1/resources', { temp_file_id: id, to: target, wait: true, reason: '사용자가 선택한 프로젝트 텍스트 파일', processing_mode: 'vectors_only' }, false, 'POST', signal);
    this.scheduleIndexSemanticRefresh(target);
    this.value.indexedFiles++; this.changed(); return `OpenViking 색인 완료: ${filename} (VLM 의미 요약 백그라운드 진행)`;
  }
  async ensureMemorySession(sessionId: string, signal?: AbortSignal) {
    this.ready();
    try {
      await this.request('/api/v1/sessions', {
        session_id: sessionId,
        auto_commit_policy: {
          pending_token_threshold: 80000,
          message_count_threshold: 24,
          idle_timeout_seconds: 1800,
          min_commit_interval_seconds: 60,
        },
      }, 15000, 'POST', signal);
    } catch (error) {
      if ((error as { status?: number })?.status !== 409) throw error;
    }
  }
  async appendSessionMessages(sessionId: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, signal?: AbortSignal) {
    this.ready();
    if (!messages.length) return;
    await this.request(`/api/v1/sessions/${encodeURIComponent(sessionId)}/messages/batch`, { messages }, 15000, 'POST', signal);
  }
  async commitMemorySession(sessionId: string, timeoutMs = 15000): Promise<MemoryCommitResult> {
    this.ready();
    const response = await this.request(`/api/v1/sessions/${encodeURIComponent(sessionId)}/commit`, {}, timeoutMs, 'POST');
    const res = response?.result ?? response;
    const taskId = typeof res?.task_id === 'string' && res.task_id ? res.task_id : undefined;
    const status = typeof res?.status === 'string' ? res.status.toLowerCase() : undefined;
    const reason = typeof res?.reason === 'string' ? res.reason : undefined;
    const archiveUri = typeof res?.archive_uri === 'string' ? res.archive_uri : undefined;
    const skipped = status === 'skipped' || reason === 'no_messages';
    return {
      ...(taskId ? { taskId } : {}),
      ...(skipped ? { skipped: true } : {}),
      ...(reason ? { reason } : {}),
      ...(archiveUri ? { archiveUri } : {}),
    };
  }
  async getTaskStatus(taskId: string, timeoutMs = 5000): Promise<MemoryTaskStatus> {
    this.ready();
    if (!/^[a-zA-Z0-9._:-]{1,128}$/.test(taskId)) return { status: 'unknown' };
    try {
      const response = await this.request(`/api/v1/tasks/${encodeURIComponent(taskId)}`, undefined, timeoutMs, 'GET', undefined, 'local-user', { quiet404: true });
      const raw = String(response?.result?.status ?? response?.status ?? '').toLowerCase();
      const error = typeof response?.result?.error === 'string' ? response.result.error : undefined;
      if (raw === 'pending' || raw === 'queued') return { status: 'pending' };
      if (raw === 'running' || raw === 'processing') return { status: 'running' };
      if (raw === 'completed' || raw === 'succeeded' || raw === 'done') return { status: 'completed' };
      if (raw === 'failed' || raw === 'error') return { status: 'failed', error };
      if (raw === 'cancelled' || raw === 'canceled') return { status: 'cancelled', error };
      return { status: 'unknown', error };
    } catch (error) {
      if ((error as { status?: number })?.status === 404) return { status: 'not_found' };
      throw error;
    }
  }
  async recallMemories(query: string, limit = 5, timeoutMs = 4000): Promise<MemoryRecallResult> {
    if (!this.isReady()) return { items: [] };
    const exists = await this.noteExists(personalMemories, undefined, Math.min(timeoutMs, 1500)).catch(() => false);
    if (!exists) return { items: [] };
    const [searchRes, profileRes] = await Promise.all([
      this.request('/api/v1/search/find', { query, target_uri: personalMemories, limit, read_content: false }, timeoutMs, 'POST').catch(() => undefined),
      this.request('/api/v1/content/read?uri=' + encodeURIComponent(personalMemories + '/profile.md') + '&limit=80', undefined, Math.min(timeoutMs, 2000), 'GET', undefined, 'local-user', { quiet404: true }).catch(() => undefined),
    ]);
    const raw = [...(searchRes?.result?.memories ?? []), ...(searchRes?.result?.resources ?? [])];
    const seen = new Set<string>();
    const items: MemoryRecallItem[] = [];
    for (const entry of raw) {
      if (typeof entry?.uri !== 'string' || !isSafePersonalMemoryUri(entry.uri) || seen.has(entry.uri)) continue;
      if (entry.uri === personalMemories + '/profile.md') continue;
      seen.add(entry.uri);
      items.push({
        uri: entry.uri,
        abstract: typeof entry.abstract === 'string' ? entry.abstract : undefined,
        score: typeof entry.score === 'number' ? entry.score : undefined,
      });
    }
    const profileText = typeof profileRes?.result === 'string'
      ? profileRes.result
      : typeof profileRes?.result?.content === 'string'
        ? profileRes.result.content
        : undefined;
    return {
      ...(profileText && profileText.trim() ? { profile: profileText.trim() } : {}),
      items: items.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limit),
    };
  }
  private async stop() {
    this.expectedExit = true;
    const pendingSemantic = this.semanticTimers.size;
    for (const entry of this.semanticTimers.values()) clearTimeout(entry.timer);
    this.semanticTimers.clear();
    if (pendingSemantic > 0) {
      this.recordRequestDiagnostic('POST', '/api/v1/content/semantic-refresh', undefined, 'OV_SEMANTIC_PENDING_SHUTDOWN', `OpenViking stopped with ${pendingSemantic} pending semantic refresh task(s)`);
    }
    await this.personal?.close(); this.personal = undefined;
    await this.diagnosticWrites.catch(() => {});
    const child = this.process;
    if (child && !this.exited) {
      this.update('stopping');
      await new Promise<void>((resolve, reject) => {
        const force = setTimeout(() => child.kill('SIGKILL'), 8000);
        const timeout = setTimeout(() => { reject(new Error('OpenViking 프로세스 종료를 확인하지 못했습니다.')); }, 15000);
        child.once('exit', () => { clearTimeout(force); clearTimeout(timeout); resolve(); });
        child.stdin?.end();
      });
    }
    this.process = undefined; await this.gateway?.close(); this.gateway = undefined;
    if (this.configFile) await unlink(this.configFile).catch(() => {}); this.configFile = undefined;
  }
  async close() { this.namespaceAbort?.abort(); if (this.stopped) return this.stopped; this.stopped = this.operation.catch(() => {}).then(() => this.stop()); return this.stopped; }
}
