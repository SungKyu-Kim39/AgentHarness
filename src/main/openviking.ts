import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { atomicJSON } from './config';
import { OpenVikingGateway } from './openviking-gateway';
import { registerBundledSkills } from './openviking-skills';
import type { AgentConfig, AppState } from '../shared/contracts';
export interface KnowledgeService {
  state(): NonNullable<AppState['knowledge']>;
  configure(config?: AgentConfig): Promise<void>;
  search(project: string, query: string, limit: number): Promise<string>;
  read(project: string, uri: string): Promise<string>;
  index(project: string, filename: string, content: string): Promise<string>;
  close(): Promise<void>;
}
export interface VikingLaunch { executable: string; launcher: string; cwd: string; diagnostic?: (text: string) => void }
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
  private registration?: Promise<void>; private registrationAbort?: AbortController;
  constructor(private runtime: string, private data: string, private changed: () => void, private testLaunch?: VikingLaunch, private skillBundle?: string) {}
  state() { return structuredClone(this.value); }
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
        if (this.skillBundle) {
          const abort = new AbortController(); this.registrationAbort = abort;
          this.value.skills = { status: 'pending', registered: 0, total: 0, conflicts: [], failed: [] }; this.changed();
          this.registration = registerBundledSkills({ bundle: this.skillBundle, stateFile: path.join(this.data, 'openviking/bundled-skills.json'), signal: abort.signal,
            transport: (route, options) => this.request(route, options?.body, 120000, options?.method, options?.signal),
            progress: state => { if (!abort.signal.aborted) { this.value.skills = state; this.changed(); } },
          }).then(() => {}, () => {
            if (!abort.signal.aborted) { this.value.skills = { ...this.value.skills!, status: 'error', message: '기본 스킬 등록을 완료하지 못했습니다. 번들·등록 기록·사내 임베딩 설정을 확인하세요. 다음 실행에서 재시도합니다.' }; this.changed(); }
          });
        }
      }
      catch { await this.stop().catch(() => {}); this.update('error', 'OpenViking 시작에 실패했습니다. 번들 무결성·모델 설정과 실행 환경을 확인하세요.'); }
    });
    return this.operation;
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
    const launch = await this.resolveLaunch();
    const folder = path.join(this.data, 'openviking'); await mkdir(folder, { recursive: true, mode: 0o700 });
    this.gateway = new OpenVikingGateway(config); await this.gateway.start();
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
    this.process = spawn(launch.executable, ['-I', '-B', launch.launcher, '--config', this.configFile, '--port', String(port)], {
      cwd: launch.cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
      env: { SYSTEMROOT: process.env.SYSTEMROOT, WINDIR: process.env.WINDIR, TEMP: process.env.TEMP, TMP: process.env.TMP,
        PATH: path.dirname(launch.executable), HOME: folder, USERPROFILE: folder, APPDATA: folder, LOCALAPPDATA: folder,
        HF_HUB_OFFLINE: '1', TRANSFORMERS_OFFLINE: '1', HF_HUB_DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1', OTEL_SDK_DISABLED: 'true',
        LITELLM_LOCAL_MODEL_COST_MAP: 'True', LITELLM_TELEMETRY: 'False', NO_PROXY: '127.0.0.1,localhost',
        TIKTOKEN_CACHE_DIR: path.join(launch.cwd, 'tokenizers'),
      },
    });
    this.process.stdout!.on('data', () => {}); this.process.stderr!.on('data', bytes => launch.diagnostic?.(bytes.toString()));
    this.process.once('error', () => { this.exited = true; if (!this.expectedExit) this.update('error', 'OpenViking 프로세스를 실행할 수 없습니다.'); });
    this.process.once('exit', () => { this.exited = true; if (!this.expectedExit) this.update('error', 'OpenViking이 종료되었습니다. 설정에서 다시 시작할 수 있습니다.'); });
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline && !this.exited) {
      try { const response = await this.request('/health', undefined, 1000); if (response) return; } catch {}
      await pause(200);
    }
    throw new Error('OpenViking 준비 시간 초과');
  }
  private async request(route: string, body?: unknown, timeout = 120000, method?: 'GET' | 'POST' | 'PUT', signal?: AbortSignal): Promise<any> {
    const form = body instanceof FormData;
    const response = await fetch(this.baseUrl + route, { method: method ?? (body === undefined ? 'GET' : 'POST'), redirect: 'error', headers: { Authorization: `Bearer ${this.token}`, 'X-API-Key': this.token, 'X-OpenViking-Account': 'l-vibe', 'X-OpenViking-User': 'local-user', ...(form ? {} : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : form ? body : JSON.stringify(body), signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout) });
    if (!response.ok) throw Object.assign(new Error(`OpenViking HTTP ${response.status}`), { status: response.status });
    const text = await response.text(); if (text.length > 8 * 1024 * 1024) throw new Error('지식 응답 크기 초과');
    const json = JSON.parse(text); if (json.status === 'error') throw new Error('OpenViking 요청 실패'); return json;
  }
  private ready() { if (this.value.status !== 'ready' || this.exited) throw new Error('OpenViking이 준비되지 않았습니다. 모델·번들 설정을 확인하세요.'); }
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
    this.registrationAbort?.abort(); await this.registration?.catch(() => {});
    this.registration = undefined; this.registrationAbort = undefined;
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
