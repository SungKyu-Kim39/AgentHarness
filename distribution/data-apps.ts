import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import http from 'node:http';
import { lstat, mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { OwnedCommand } from './owned-command';

export type DataAppFramework = 'marimo' | 'streamlit' | 'uvicorn' | 'http';
export interface DataAppInput {
  operation: 'start' | 'status' | 'stop';
  id?: string;
  framework?: DataAppFramework;
  entry?: string;
  args?: string[];
}

interface PreviewServer {
  id: string;
  session: string;
  project: string;
  framework: DataAppFramework;
  entry: string;
  port: number;
  url: string;
  state: 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';
  controller: AbortController;
  task: Promise<void>;
  logs: string;
  exitCode?: number | null;
  error?: string;
}

const UVICORN_TARGET = /^[A-Za-z_][A-Za-z0-9_.]*:[A-Za-z_][A-Za-z0-9_]*$/;

async function allocateLoopbackPort(reserved: Set<number>): Promise<number> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const port = await new Promise<number>((resolve, reject) => {
      const server = createServer();
      server.unref();
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        const chosen = addr && typeof addr !== 'string' ? addr.port : 0;
        server.close(() => resolve(chosen));
      });
    });
    if (port > 0 && !reserved.has(port)) return port;
  }
  throw new Error('사용 가능한 로컬 루프백 포트를 할당하지 못했습니다.');
}

async function waitForHttpReady(url: string, timeoutMs: number, signal: AbortSignal): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline && !signal.aborted) {
    const ok = await new Promise<boolean>(resolve => {
      const req = http.get(url, { timeout: 1000 }, res => {
        res.resume();
        resolve(true);
      });
      req.once('error', () => resolve(false));
      req.once('timeout', () => { req.destroy(); resolve(false); });
    });
    if (ok) return true;
    await new Promise(r => setTimeout(r, 250));
  }
  return false;
}

/** Local loopback-only preview servers for marimo, Streamlit, Uvicorn, or static files. */
export class DataApps {
  private commands: OwnedCommand;
  private abort = new AbortController();
  private servers = new Map<string, PreviewServer>();

  constructor(
    private root: string,
    private resources: string,
    private options: {
      approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
      resolvePython(project: string): Promise<{ kind: 'venv' | 'conda'; prefix: string; python: string }>;
      reservedPorts?: () => number[];
    },
  ) {
    this.commands = new OwnedCommand(resources);
  }

  ports(): number[] {
    return [...this.servers.values()]
      .filter(s => s.state === 'starting' || s.state === 'running')
      .map(s => s.port);
  }

  private sanitize(s: PreviewServer) {
    return {
      id: s.id,
      framework: s.framework,
      entry: s.entry,
      url: s.url,
      status: s.state,
      logs: s.logs.slice(-8000),
      ...(s.exitCode !== undefined ? { exitCode: s.exitCode } : {}),
      ...(s.error ? { error: s.error } : {}),
    };
  }

  async call(session: string, project: string, input: DataAppInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();

    if (input.operation === 'status') {
      if (input.id) {
        const s = this.servers.get(input.id);
        if (!s || s.session !== session || s.project !== project) throw new Error('현재 대화·프로젝트가 시작한 프리뷰 서버만 조회할 수 있습니다.');
        return this.sanitize(s);
      }
      return {
        servers: [...this.servers.values()]
          .filter(s => s.session === session && s.project === project)
          .map(s => this.sanitize(s)),
      };
    }

    if (input.operation === 'stop') {
      if (!input.id) throw new Error('중지할 프리뷰 서버 ID가 필요합니다.');
      const s = this.servers.get(input.id);
      if (!s || s.session !== session || s.project !== project) throw new Error('현재 대화·프로젝트가 시작한 프리뷰 서버만 중지할 수 있습니다.');
      if (s.state === 'starting' || s.state === 'running') {
        s.state = 'stopping';
        s.controller.abort();
      }
      await s.task;
      return this.sanitize(s);
    }

    // operation === 'start'
    if (input.args?.length) throw new Error('프리뷰 서버는 호스트가 정한 실행 옵션만 사용합니다.');
    const activeCount = [...this.servers.values()].filter(s => ['starting', 'running', 'stopping'].includes(s.state)).length;
    if (activeCount >= 2) throw new Error('동시에 실행할 수 있는 로컬 프리뷰 서버는 최대 2개입니다. 기존 서버를 중지하세요.');
    const framework = input.framework ?? 'marimo';
    const entry = input.entry?.trim();
    if (!entry) throw new Error('실행할 앱 진입점(entry)을 지정하세요.');
    const files = new ProjectFiles(project);
    const python = await this.options.resolvePython(project);

    const reserved = new Set([...(this.options.reservedPorts?.() ?? []), ...this.ports()]);
    const port = await allocateLoopbackPort(reserved);
    let args: string[];
    let resolvedEntry = entry;
    if (framework === 'marimo') {
      if (!/\.py$/i.test(entry)) throw new Error('marimo 앱은 프로젝트 내부 .py 파일을 지정하세요.');
      resolvedEntry = await files.resolve(entry);
      args = ['-B', '-m', 'marimo', 'run', resolvedEntry, '--host', '127.0.0.1', '--port', String(port), '--headless', '--no-token'];
    } else if (framework === 'streamlit') {
      if (!/\.py$/i.test(entry)) throw new Error('Streamlit 앱은 프로젝트 내부 .py 파일을 지정하세요.');
      resolvedEntry = await files.resolve(entry);
      args = ['-B', '-m', 'streamlit', 'run', resolvedEntry, '--server.address', '127.0.0.1', '--server.port', String(port), '--server.headless', 'true', '--browser.gatherUsageStats', 'false'];
    } else if (framework === 'uvicorn') {
      if (!UVICORN_TARGET.test(entry)) throw new Error('uvicorn 진입점은 module:app 형식이어야 합니다.');
      args = ['-B', '-m', 'uvicorn', entry, '--host', '127.0.0.1', '--port', String(port)];
    } else {
      const dir = entry === '.' ? project : await files.resolve(entry);
      if (!(await lstat(dir)).isDirectory()) throw new Error('정적 HTTP 프리뷰 대상은 프로젝트 내부 디렉터리여야 합니다.');
      resolvedEntry = dir;
      args = ['-B', '-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', dir];
    }

    const url = `http://127.0.0.1:${port}`;
    const ok = await this.options.approve(
      `로컬 데이터 앱 프리뷰 시작 (${framework})`,
      `프로젝트: ${project}\n프레임워크: ${framework}\n진입점: ${entry}\n로컬 주소: ${url} (127.0.0.1 루프백 전용)\n인터프리터: ${python.python}\n\n외부 네트워크 바인딩과 통계 전송을 비활성화한 상태로 시작합니다. 기동 후 browser_check로 화면과 콘솔 오류를 점검할 수 있습니다.`,
      combined,
    );
    if (!ok) throw new Error('로컬 데이터 앱 프리뷰 시작을 취소했습니다.');
    combined.throwIfAborted();

    await mkdir(path.join(this.root, 'data-app-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'data-app-work/app-'));
    const env: NodeJS.ProcessEnv = {
      TEMP: work,
      TMP: work,
      TMPDIR: work,
      VIRTUAL_ENV: python.prefix,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
      PYTHONDONTWRITEBYTECODE: '1',
      PIP_NO_INDEX: '1',
      STREAMLIT_BROWSER_GATHER_USAGE_STATS: 'false',
      STREAMLIT_SERVER_HEADLESS: 'true',
      MARIMO_SKIP_UPDATE_CHECK: '1',
      DO_NOT_TRACK: '1',
      HF_HUB_OFFLINE: '1',
    };
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'HOME', 'PATH']) {
      if (process.env[key]) env[key] = process.env[key];
    }

    const id = randomUUID();
    const controller = new AbortController();
    const jobSignal = AbortSignal.any([controller.signal, this.abort.signal]);
    const cancelStart = () => controller.abort();
    combined.addEventListener('abort', cancelStart, { once: true });
    if (combined.aborted) cancelStart();
    const entryObj: PreviewServer = {
      id,
      session,
      project,
      framework,
      entry,
      port,
      url,
      state: 'starting',
      controller,
      logs: '',
      task: Promise.resolve(),
    };
    this.servers.set(id, entryObj);
    entryObj.task = (async () => {
      try {
        const res = await this.commands.run(
          { executable: python.python, args, cwd: project, env },
          jobSignal,
          false,
          output => { entryObj.logs = output.slice(-16000); },
        );
        entryObj.exitCode = res.exitCode;
        entryObj.state = res.cancelled || entryObj.state === 'stopping' ? 'stopped' : res.exitCode === 0 ? 'stopped' : 'failed';
      } catch (err) {
        entryObj.state = jobSignal.aborted ? 'stopped' : 'failed';
        entryObj.error = err instanceof Error ? err.message : 'Preview server failed';
      } finally {
        await rm(work, { recursive: true, force: true }).catch(() => {});
      }
    })();

    try {
      const ready = await Promise.race([waitForHttpReady(url, 12000, jobSignal), entryObj.task.then(() => false)]);
      combined.throwIfAborted();
      if (ready && entryObj.state === 'starting') {
        entryObj.state = 'running';
        return { ...this.sanitize(entryObj), ready: true };
      }
      throw new Error(`로컬 프리뷰 서버 시작 실패: ${entryObj.logs.slice(-1000) || entryObj.error || '루프백 응답을 확인하지 못했습니다.'}`);
    } finally {
      combined.removeEventListener('abort', cancelStart);
      if (entryObj.state !== 'running') {
        controller.abort();
        await entryObj.task;
      }
    }
  }

  cancel(session: string) {
    for (const s of this.servers.values()) {
      if (s.session === session && (s.state === 'starting' || s.state === 'running')) {
        s.state = 'stopping';
        s.controller.abort();
      }
    }
  }

  async stopped(session: string) {
    await Promise.all([...this.servers.values()].filter(s => s.session === session).map(s => s.task));
    if (this.commands.stoppingUnconfirmed) throw new Error('프리뷰 프로세스 종료를 확인하지 못했습니다.');
  }

  async close() {
    this.abort.abort();
    for (const s of this.servers.values()) {
      if (s.state === 'starting' || s.state === 'running') {
        s.state = 'stopping';
        s.controller.abort();
      }
    }
    await this.commands.close();
    await Promise.allSettled([...this.servers.values()].map(s => s.task));
  }
}
