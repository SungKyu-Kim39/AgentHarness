import { requestJSON } from './http-request';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { atomicJSON } from './config';
import { OpenVikingGateway } from './openviking-gateway';
import { vikingErrorCode } from './openviking-errors';
import { registerBundledSkills } from './openviking-skills';
import { PersonalKnowledge } from './personal-knowledge';
import type { AgentConfig, AppState } from '../shared/contracts';
export interface KnowledgeService {
  state(): NonNullable<AppState['knowledge']>;
  configure(config?: AgentConfig): Promise<void>;
  search(project: string, query: string, limit: number): Promise<string>;
  read(project: string, uri: string): Promise<string>;
  index(project: string, filename: string, content: string): Promise<string>;
  close(): Promise<void>;
  personalSearch?(query: string, limit: number): Promise<string>;
  personalRead?(uri: string): Promise<string>;
}
export interface VikingLaunch { executable: string; launcher: string; cwd: string; diagnostic?: (text: string) => void }
type StartupStage = 'bundle' | 'configuration' | 'process' | 'health';
type StartupCode = 'OV_BUNDLE' | 'OV_CONFIGURATION' | 'OV_PROCESS_START' | 'OV_PROCESS_EXIT' | 'OV_HEALTH_TIMEOUT';
type StartupDetail = { osError?: string; exitCode?: number; exitHex?: string; signal?: string; hint?: string; healthStatus?: number };
class StartupFailure extends Error {
  constructor(readonly code: StartupCode, readonly detail: StartupDetail = {}) { super(code); }
}
// Persist only categories and numeric status. Raw Python output can contain
// request data and is deliberately excluded from production diagnostics.
function startupHint(stderr: string) {
  if (/(?:Ned|L-Vibe) tokenizer (?:cache|data)/.test(stderr)) return 'tokenizer_cache';
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
  return `viking://resources/l-vibe/${project}`;
}
export function scopedKnowledgeUri(project: string, uri: string) {
  const root = knowledgeRoot(project);
  if (!uri.startsWith(root + '/') || /(?:^|\/)\.{1,2}(?:\/|$)|[%\\\x00-\x1f?#]/.test(uri)) throw new Error('다른 프로젝트의 지식 경로는 읽을 수 없습니다.');
  return uri;
}
export class OpenVikingService implements KnowledgeService {
  private value: NonNullable<AppState['knowledge']> = { status: 'unconfigured', indexedFiles: 0 };
  private process?: ChildProcess; private gateway?: OpenVikingGateway; private configFile?: string;
  private baseUrl = ''; private token = ''; private exited = true; private expectedExit = false;
  private operation = Promise.resolve(); private stopped?: Promise<void>;
  private diagnosticWrites = Promise.resolve();
  private modelEvents: unknown[] = [];
  private registration?: Promise<void>; private registrationAbort?: AbortController;
  private personal?: PersonalKnowledge;
  private startupStage: StartupStage = 'bundle';
  constructor(private runtime: string, private data: string, private changed: () => void, private testLaunch?: VikingLaunch, private skillBundle?: string) {}
  state() { return structuredClone(this.value); }
  localPorts() { return [this.baseUrl, this.gateway?.baseUrl].filter((u): u is string => !!u).map(u => Number(new URL(u).port)); }
  private update(status: NonNullable<AppState['knowledge']>['status'], message?: string) { this.value.status = status; this.value.message = message; this.changed(); }
  configure(config?: AgentConfig) {
    this.operation = this.operation.catch(() => {}).then(async () => {
      await this.stop();
      this.value.skills = undefined;
      if (!config?.openViking) { this.value.embedding = undefined; this.update('unconfigured', 'JSON에 OpenViking 임베딩 모델을 설정하세요.'); return; }
      this.value.embedding = { baseUrl: config.openViking.embedding.baseUrl, id: config.openViking.embedding.id, dimension: config.openViking.embedding.dimension };
      if (!config.openViking.enabled) { this.update('disabled'); return; }
      this.update('starting');
      try {
        await this.start(config); this.update('ready');
        await this.writeStartupStatus({ status: 'ready', stage: 'health' });
        this.beginSkillRegistration();
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
        };
        const detail = [failure.code, failure.detail.osError, failure.detail.exitHex, failure.detail.hint].filter(Boolean).join(', ');
        this.update('error', labels[failure.code] + ' [' + detail + ']' +
          (recorded ? ' 진단 파일: 사용자 데이터 폴더의 openviking/startup-status.json' : ' 진단 파일도 저장하지 못했습니다.') +
          (stopConfirmed ? '' : ' 프로세스 종료를 확인하지 못했습니다. 앱을 종료하고 확인하세요.'));
      }
    });
    return this.operation;
  }
  async retryBundledSkills() {
    this.ready();
    if (['pending', 'registering'].includes(this.value.skills?.status ?? '')) throw new Error('기본 스킬 등록이 진행 중입니다. 현재 단계와 모델 상태를 먼저 확인하세요.');
    await this.registration;
    this.ready();
    this.beginSkillRegistration();
  }
  private beginSkillRegistration() {
    if (!this.skillBundle) return;
    const abort = new AbortController(); this.registrationAbort = abort;
    this.value.skills = { status: 'pending', registered: 0, total: 0, conflicts: [], failed: [] }; this.changed();
    const publish = (state: NonNullable<NonNullable<AppState['knowledge']>['skills']>) => {
      if (abort.signal.aborted) return;
      this.value.skills = state; this.changed();
      const snapshot = structuredClone(state);
      this.diagnosticWrites = this.diagnosticWrites.catch(() => {}).then(() => atomicJSON(path.join(this.data, 'openviking/skills-status.json'),
        { schemaVersion: 1, recordedAt: new Date().toISOString(), ...snapshot }));
    };
    this.registration = registerBundledSkills({ bundle: this.skillBundle, stateFile: path.join(this.data, 'openviking/bundled-skills.json'), signal: abort.signal,
      transport: (route, options) => this.request(route, options?.body, false, options?.method, options?.signal), progress: publish,
    }).then(() => {}, () => {
      if (!abort.signal.aborted) publish({ ...this.value.skills!, status: 'error', message: 'OV_SKILL_SETUP: 번들 또는 등록 기록을 확인하세요. 기존 기록을 삭제하지 마세요.' });
    });
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
    if (manifest.version !== '0.5.4' || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('OpenViking 번들 없음');
    for (const f of manifest.files) {
      if (typeof f.path !== 'string' || path.isAbsolute(f.path) || f.path.split('/').includes('..') || createHash('sha256').update(await readFile(path.join(root, f.path))).digest('hex') !== f.sha256) throw new Error('OpenViking 번들 무결성 오류');
    }
    return { executable: path.join(root, 'python', process.platform === 'win32' ? 'python.exe' : 'bin/python3'), launcher: path.join(root, 'launch.py'), cwd: root };
  }
  private async start(config: AgentConfig) {
    this.startupStage = 'bundle';
    const launch = await this.resolveLaunch();
    this.personal = new PersonalKnowledge(path.join(this.data, 'openviking'), launch.executable,
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
    this.configFile = path.join(folder, `runtime-${randomBytes(8).toString('hex')}.json`);
    await atomicJSON(this.configFile, {
      storage: { workspace: path.join(folder, 'data'), agfs: { backend: 'local' }, vectordb: { backend: 'local', name: 'context' } },
      server: { host: '127.0.0.1', port, workers: 1, auth_mode: 'trusted', root_api_key: this.token },
      embedding: { dense: { provider: 'openai', api_base: gateway.baseUrl, api_key: gateway.token, model: embedding.id, dimension: embedding.dimension } },
      vlm: { provider: 'openai', api_base: gateway.baseUrl, api_key: gateway.token, model: vlm.id },
      telemetry: { tracer: { enabled: false } },
    });
    this.expectedExit = false; this.exited = false;
    this.startupStage = 'process';
    let launchError: string | undefined; let stderr = ''; let lastHealthStatus: number | undefined;
    this.process = spawn(launch.executable, ['-I', '-B', launch.launcher, '--config', this.configFile, '--port', String(port)], {
      cwd: launch.cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
      env: { SYSTEMROOT: process.env.SYSTEMROOT, WINDIR: process.env.WINDIR, TEMP: process.env.TEMP, TMP: process.env.TMP,
        PATH: path.dirname(launch.executable), HOME: folder, USERPROFILE: folder, APPDATA: folder, LOCALAPPDATA: folder,
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
    while (Date.now() < deadline && !this.exited) {
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
  private async request(route: string, body?: unknown, timeout: number | false = false, method?: 'GET' | 'POST' | 'PUT', signal?: AbortSignal, user = 'local-user'): Promise<any> {
    const form = body instanceof FormData;
    const headers = { Authorization: `Bearer ${this.token}`, 'X-API-Key': this.token, 'X-OpenViking-Account': 'l-vibe', 'X-OpenViking-User': user, ...(form ? {} : { 'Content-Type': 'application/json' }) };
    const response = timeout === false && !form
      ? await requestJSON(this.baseUrl + route, { method: method ?? (body === undefined ? 'GET' : 'POST'), headers, body: body === undefined ? undefined : JSON.stringify(body), signal })
      : await fetch(this.baseUrl + route, { method: method ?? (body === undefined ? 'GET' : 'POST'), redirect: 'error', headers, body: body === undefined ? undefined : form ? body : JSON.stringify(body), signal: timeout === false ? signal : signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout) });
    if (!response.ok) {
      const detail = await response.text();
      if (this.testLaunch?.diagnostic) this.testLaunch.diagnostic(`HTTP ${response.status} ${route}: ${detail}`);
      throw Object.assign(new Error(vikingErrorCode(detail)), { status: response.status });
    }
    const text = await response.text(); if (text.length > 8 * 1024 * 1024) throw new Error('지식 응답 크기 초과');
    const json = JSON.parse(text); if (json.status === 'error') throw new Error(vikingErrorCode(text)); return json;
  }
  private ready() { if (this.value.status !== 'ready' || this.exited) throw new Error('OpenViking이 준비되지 않았습니다. 모델·번들 설정을 확인하세요.'); }
  async importPersonal(file: string, approve: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>) {
    this.ready(); return this.personal!.import(file, approve);
  }
  async personalStatus() { this.ready(); return this.personal!.status(); }
  async personalSearch(query: string, limit: number) { this.ready(); return this.personal!.search(query, limit); }
  async personalRead(uri: string) { this.ready(); return this.personal!.read(uri); }
  async search(project: string, query: string, limit: number) {
    this.ready(); const root = knowledgeRoot(project);
    const result = await this.request('/api/v1/search/find', { query, target_uri: root, limit, read_content: false });
    const matches = result.result ?? result;
    return JSON.stringify({ source: 'OpenViking', project, results: matches });
  }
  async read(project: string, uri: string) {
    this.ready(); const scoped = scopedKnowledgeUri(project, uri);
    return JSON.stringify(await this.request('/api/v1/content/read?uri=' + encodeURIComponent(scoped) + '&limit=300'));
  }
  async index(project: string, filename: string, content: string) {
    this.ready();
    if (Buffer.byteLength(content) > 2 * 1024 * 1024) throw new Error('2 MiB 이하 텍스트만 색인할 수 있습니다.');
    const form = new FormData(); form.append('file', new Blob([content], { type: 'text/plain' }), path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '_') + '.txt');
    const response = await fetch(this.baseUrl + '/api/v1/resources/temp_upload', { method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${this.token}`, 'X-API-Key': this.token, 'X-OpenViking-Account': 'l-vibe', 'X-OpenViking-User': 'local-user' }, body: form, signal: AbortSignal.timeout(30000) });
    if (!response.ok) { this.testLaunch?.diagnostic?.(`Upload HTTP ${response.status}: ${await response.text()}`); throw new Error('OpenViking 파일 전달 실패'); }
    const upload = await response.json(); const id = upload.result?.temp_file_id ?? upload.temp_file_id;
    if (typeof id !== 'string') throw new Error('OpenViking 업로드 확인 실패');
    const target = knowledgeRoot(project) + '/' + createHash('sha256').update(filename).digest('hex').slice(0, 20);
    await this.request('/api/v1/resources', { temp_file_id: id, to: target, wait: true, reason: '사용자가 선택한 프로젝트 텍스트 파일', processing_mode: 'vectors_only' });
    this.value.indexedFiles++; this.changed(); return `OpenViking 색인 완료: ${filename}`;
  }
  private async stop() {
    this.expectedExit = true;
    await this.personal?.close(); this.personal = undefined;
    this.registrationAbort?.abort(); await this.registration?.catch(() => {});
    this.registration = undefined; this.registrationAbort = undefined;
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
  async close() { if (this.stopped) return this.stopped; this.stopped = this.operation.catch(() => {}).then(() => this.stop()); return this.stopped; }
}
