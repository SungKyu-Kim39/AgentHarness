import { BrowserWindow, session } from 'electron';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import {
  STUDIO_RENDER_TIMEOUT_MS,
  sanitizeStudioUrl,
  studioCsp,
  studioDiagnosticProbe,
  studioHeaders,
  studioOrigin,
  studioRenderProbe,
  studioRequestAllowed,
  type StudioConnection,
} from './studio-policy';

export interface StudioDomSummary {
  url?: string;
  readyState?: string;
  appExists: boolean;
  childCount: number;
  dataSlots: string[];
  textSnippet: string;
}

export interface StudioDiagnosticEvent {
  code: string;
  httpStatus?: number;
  blockedUrls?: string[];
  loadFailures?: Array<{ url: string; errorCode: number; errorDescription: string; isMainFrame: boolean }>;
  consoleMessages?: Array<{ level: string; message: string; source?: string; line?: number }>;
  domSummary?: StudioDomSummary;
}

function sanitizeStudioText(text: string) {
  return text
    .replace(/Bearer\s+[A-Za-z0-9_.~+/=-]+/gi, 'Bearer [REDACTED]')
    .replace(/(?:api[_-]?key|x-api-key|token|password)\s*[:=]\s*["']?[^\s"',;]+/gi, '[REDACTED]')
    .replace(/[A-Za-z]:\\Users\\[^\\\s"']+/gi, 'C:\\Users\\<redacted>')
    .replace(/\/(?:home|Users)\/[^/\s"']+/g, '/<redacted>')
    .slice(0, 300);
}

/** Isolated UI for the already-owned sidecar. Credentials never enter page JS. */
export class OpenVikingStudio {
  private window?: BrowserWindow;
  private opening?: Promise<void>;
  private generation = 0;
  constructor(private diagnostic: (event: StudioDiagnosticEvent) => void = () => {}) {}
  async open(connection: StudioConnection, icon: string) {
    if (this.opening) { await this.opening; if (this.window?.isVisible()) this.window.focus(); return; }
    const pending = this.create(connection, icon); this.opening = pending;
    try { await pending; } finally { if (this.opening === pending) this.opening = undefined; }
  }
  private async create(connection: StudioConnection, icon: string) {
    const generation = this.generation;
    let visible = false;
    const origin = studioOrigin(connection);
    if (this.window && !this.window.isDestroyed()) { if (this.window.isVisible()) this.window.focus(); return; }
    const isolated = session.fromPartition('ned-studio-' + randomUUID());
    const studioUrl = origin + '/studio/';
    let failureUrl: string | undefined;
    let lastCode = 'STUDIO_RENDER_TIMEOUT';
    let blockedUrls: string[] = [];
    let loadFailures: NonNullable<StudioDiagnosticEvent['loadFailures']> = [];
    let consoleMessages: NonNullable<StudioDiagnosticEvent['consoleMessages']> = [];
    const diagnosticContext = (): Omit<StudioDiagnosticEvent, 'code' | 'httpStatus' | 'domSummary'> => ({
      ...(blockedUrls.length ? { blockedUrls: [...blockedUrls] } : {}),
      ...(loadFailures.length ? { loadFailures: [...loadFailures] } : {}),
      ...(consoleMessages.length ? { consoleMessages: [...consoleMessages] } : {}),
    });
    await isolated.setProxy({ mode: 'direct' });
    if (generation !== this.generation) return;
    isolated.setPermissionRequestHandler((_wc, _permission, answer) => answer(false));
    isolated.setPermissionCheckHandler(() => false);
    isolated.on('will-download', event => event.preventDefault());
    isolated.webRequest.onBeforeRequest((details, answer) => {
      let mainFrameAllowed = true;
      if (details.resourceType === 'mainFrame') {
        try {
          const pathname = new URL(details.url).pathname;
          mainFrameAllowed = pathname === '/studio' || pathname.startsWith('/studio/');
        } catch { mainFrameAllowed = false; }
      }
      const cancel = details.url !== failureUrl && (!studioRequestAllowed(origin, details.url) || !mainFrameAllowed);
      if (cancel) {
        const entry = `${details.resourceType ?? 'other'}:${sanitizeStudioUrl(details.url)}`;
        if (blockedUrls.length < 20 && !blockedUrls.includes(entry)) blockedUrls.push(entry);
        if (lastCode === 'STUDIO_RENDER_TIMEOUT') lastCode = 'STUDIO_BLOCKED_REQUEST';
      }
      answer({ cancel });
    });
    isolated.webRequest.onBeforeSendHeaders((details, answer) => {
      const headers = studioHeaders(connection, details.url, details.requestHeaders);
      answer({ cancel: details.url !== failureUrl && !studioRequestAllowed(origin, details.url), requestHeaders: headers });
    });
    isolated.webRequest.onHeadersReceived((details, answer) => {
      if (details.statusCode >= 400) {
        lastCode = details.statusCode === 401 || details.statusCode === 403 ? 'STUDIO_AUTH' : 'STUDIO_RESOURCE';
        this.diagnostic({ code: lastCode, httpStatus: details.statusCode, ...diagnosticContext() });
      }
      const headers = { ...details.responseHeaders };
      for (const key of Object.keys(headers)) if (/^content-security-policy(?:-report-only)?$/i.test(key)) delete headers[key];
      answer({ responseHeaders: { ...headers, 'Content-Security-Policy': [studioCsp], 'Referrer-Policy': ['no-referrer'] } });
    });
    const window = new BrowserWindow({ width: 1180, height: 800, minWidth: 760, minHeight: 500, show: false, title: 'Ned · OpenViking Studio', icon,
      webPreferences: { session: isolated, preload: path.join(__dirname, 'studio-preload.cjs'),
        additionalArguments: ['--ned-studio-origin=' + origin], contextIsolation: true, sandbox: true, nodeIntegration: false, devTools: false, webSecurity: true, backgroundThrottling: false } });
    this.window = window; window.setMenu(null);
    let timer: ReturnType<typeof setInterval> | undefined;
    let loading: Promise<void> | undefined;
    let checking = false, shownAt = 0, ready = false;
    const alive = () => generation === this.generation && !window.isDestroyed();
    const captureDom = async (): Promise<StudioDomSummary | undefined> => {
      if (!alive()) return undefined;
      try {
        const summary = await window.webContents.executeJavaScript(studioDiagnosticProbe);
        if (summary && typeof summary === 'object' && typeof summary.appExists === 'boolean') return summary as StudioDomSummary;
      } catch { /* Renderer may be gone or unresponsive during failure capture. */ }
      return undefined;
    };
    const showFailure = async (code: string) => {
      if (!alive() || failureUrl) return;
      clearInterval(timer);
      const domSummary = await captureDom();
      if (!alive() || failureUrl) return;
      this.diagnostic({ code, ...diagnosticContext(), ...(domSummary ? { domSummary } : {}) });
      const html = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Ned · OpenViking Studio</title><main style="font-family:Segoe UI,sans-serif;padding:40px"><h1>OpenViking Studio를 표시하지 못했습니다.</h1><p>진단 코드: ${code}</p><p>상세 진단 파일: %APPDATA%\\Ned\\openviking\\studio-status.json</p><p>Ned의 대화와 코드 작업은 계속 사용할 수 있습니다.</p><p><a href="${studioUrl}">다시 불러오기</a></p></main>`;
      failureUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
      await window.loadURL(failureUrl).catch(() => {});
      if (alive()) { visible = true; window.show(); window.focus(); }
    };
    const inspect = async () => {
      if (checking || !alive() || failureUrl) return;
      checking = true;
      try {
        const state = await window.webContents.executeJavaScript(studioRenderProbe);
        if (!alive() || failureUrl) return;
        if (state === 'ready') {
          clearInterval(timer); ready = true; this.diagnostic({ code: 'STUDIO_READY', ...diagnosticContext() });
          if (!visible) { visible = true; window.show(); window.focus(); }
        } else if (state === 'credential-storage') {
          await showFailure('STUDIO_CREDENTIAL_STORAGE');
        } else if (state === 'auth' || state === 'api') {
          await showFailure(state === 'auth' ? 'STUDIO_AUTH' : 'STUDIO_RESOURCE');
        } else if (Date.now() - shownAt > STUDIO_RENDER_TIMEOUT_MS) {
          await showFailure(lastCode);
        }
      } catch {
        if (Date.now() - shownAt > STUDIO_RENDER_TIMEOUT_MS) await showFailure('STUDIO_SCRIPT');
      } finally { checking = false; }
    };
    const load = () => {
      if (loading) return loading;
      loading = (async () => {
        clearInterval(timer);
        failureUrl = undefined; ready = false; lastCode = 'STUDIO_RENDER_TIMEOUT';
        blockedUrls = []; loadFailures = []; consoleMessages = [];
        try {
          await window.loadURL(studioUrl);
        } catch {
          if (alive()) await showFailure(lastCode === 'STUDIO_RENDER_TIMEOUT' ? 'STUDIO_NAVIGATION' : lastCode);
          return;
        }
        if (!alive() || failureUrl) return;
        shownAt = Date.now();
        timer = setInterval(() => { void inspect(); }, 750); timer.unref();
        void inspect();
      })().finally(() => { loading = undefined; });
      return loading;
    };
    window.webContents.on('render-process-gone', () => {
      ready = false;
      void showFailure('STUDIO_RENDERER_EXIT');
    });
    window.webContents.on('did-fail-load', (_event: any, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean) => {
      if (errorCode === -3 || validatedURL === failureUrl) return;
      if (loadFailures.length < 10) {
        loadFailures.push({
          url: sanitizeStudioUrl(String(validatedURL ?? '')),
          errorCode: Number(errorCode),
          errorDescription: sanitizeStudioText(String(errorDescription ?? '')),
          isMainFrame: Boolean(isMainFrame),
        });
      }
      if (isMainFrame && lastCode === 'STUDIO_RENDER_TIMEOUT') lastCode = 'STUDIO_NAVIGATION';
    });
    window.webContents.on('console-message', (_event: any, ...args: any[]) => {
      const eventObj = _event && typeof _event.message === 'string' ? _event : undefined;
      const rawLevel = eventObj ? eventObj.level : args[0];
      const message = eventObj ? eventObj.message : String(args[1] ?? args.find(v => typeof v === 'string') ?? '');
      const line = eventObj ? eventObj.lineNumber : (typeof args[2] === 'number' ? args[2] : undefined);
      const source = eventObj ? eventObj.sourceId : (typeof args[3] === 'string' ? args[3] : undefined);
      const level = typeof rawLevel === 'string' ? rawLevel : rawLevel === 3 ? 'error' : rawLevel === 2 ? 'warning' : rawLevel === 1 ? 'info' : 'verbose';
      if ((level === 'error' || level === 'warning') && consoleMessages.length < 20) {
        consoleMessages.push({
          level,
          message: sanitizeStudioText(message),
          ...(source ? { source: sanitizeStudioUrl(source) } : {}),
          ...(typeof line === 'number' && Number.isFinite(line) ? { line } : {}),
        });
      }
      if (!ready && /Content Security Policy|Refused to (?:load|execute)/i.test(message)) lastCode = 'STUDIO_POLICY';
    });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    const navigate = (event: Electron.Event, url: string) => {
      if (failureUrl) {
        event.preventDefault();
        if (url === studioUrl) void load();
      } else if (!studioRequestAllowed(origin, url) || !new URL(url).pathname.startsWith('/studio')) event.preventDefault();
    };
    window.webContents.on('will-navigate', navigate); window.webContents.on('will-redirect', navigate);
    window.on('closed', () => {
      clearInterval(timer);
      if (this.window === window) this.window = undefined;
      isolated.webRequest.onBeforeRequest(null); isolated.webRequest.onBeforeSendHeaders(null); isolated.webRequest.onHeadersReceived(null);
      void isolated.clearStorageData().catch(() => {});
    });
    await load();
  }
  close() { this.generation++; if (this.window && !this.window.isDestroyed()) this.window.destroy(); this.window = undefined; }
}
