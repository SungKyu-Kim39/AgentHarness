import { BrowserWindow, session } from 'electron';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { studioCsp, studioHeaders, studioOrigin, studioRenderProbe, studioRequestAllowed, type StudioConnection } from './studio-policy';

/** Isolated UI for the already-owned sidecar. Credentials never enter page JS. */
export class OpenVikingStudio {
  private window?: BrowserWindow;
  private opening?: Promise<void>;
  private generation = 0;
  constructor(private diagnostic: (event: { code:string; httpStatus?:number }) => void = () => {}) {}
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
    await isolated.setProxy({ mode: 'direct' });
    if (generation !== this.generation) return;
    isolated.setPermissionRequestHandler((_wc, _permission, answer) => answer(false));
    isolated.setPermissionCheckHandler(() => false);
    isolated.on('will-download', event => event.preventDefault());
    isolated.webRequest.onBeforeRequest((details, answer) => answer({ cancel: details.url !== failureUrl &&
      (!studioRequestAllowed(origin, details.url) || details.resourceType === 'mainFrame' && !new URL(details.url).pathname.startsWith('/studio/')) }));
    isolated.webRequest.onBeforeSendHeaders((details, answer) => {
      const headers = studioHeaders(connection, details.url, details.requestHeaders);
      answer({ cancel: details.url !== failureUrl && !studioRequestAllowed(origin, details.url), requestHeaders: headers });
    });
    isolated.webRequest.onHeadersReceived((details, answer) => {
      if(details.statusCode>=400){lastCode=details.statusCode===401||details.statusCode===403?'STUDIO_AUTH':'STUDIO_RESOURCE';this.diagnostic({code:lastCode,httpStatus:details.statusCode});}
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
    const showFailure = async (code: string) => {
      if (!alive() || failureUrl) return;
      clearInterval(timer);
      this.diagnostic({ code });
      const html = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Ned · OpenViking Studio</title><main style="font-family:Segoe UI,sans-serif;padding:40px"><h1>OpenViking Studio를 표시하지 못했습니다.</h1><p>진단 코드: ${code}</p><p>Ned의 대화와 코드 작업은 계속 사용할 수 있습니다.</p><p><a href="${studioUrl}">다시 불러오기</a></p></main>`;
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
          clearInterval(timer); ready = true; this.diagnostic({ code: 'STUDIO_READY' });
          if (!visible) { visible = true; window.show(); window.focus(); }
        } else if (state === 'credential-storage') {
          await showFailure('STUDIO_CREDENTIAL_STORAGE');
        } else if (state === 'auth' || state === 'api') {
          await showFailure(state === 'auth' ? 'STUDIO_AUTH' : 'STUDIO_RESOURCE');
        } else if (Date.now() - shownAt > 15000) {
          await showFailure(lastCode);
        }
      } catch {
        if (Date.now() - shownAt > 15000) await showFailure('STUDIO_SCRIPT');
      } finally { checking = false; }
    };
    const load = () => {
      if (loading) return loading;
      loading = (async () => {
        clearInterval(timer);
        failureUrl = undefined; ready = false; lastCode = 'STUDIO_RENDER_TIMEOUT';
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
    window.webContents.on('console-message', (_event: any, ...args: any[]) => {
      if (ready) return;
      const message = typeof _event?.message === 'string' ? _event.message : args.find(v => typeof v === 'string') ?? '';
      if (/Content Security Policy|Refused to (?:load|execute)/i.test(message)) lastCode = 'STUDIO_POLICY';
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
