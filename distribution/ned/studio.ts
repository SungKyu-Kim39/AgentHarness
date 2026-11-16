import { BrowserWindow, session } from 'electron';
import { randomUUID } from 'node:crypto';
import { studioBootstrap, studioCsp, studioHeaders, studioOrigin, studioRequestAllowed, type StudioConnection } from './studio-policy';

/** Isolated UI for the already-owned sidecar. Credentials never enter page JS. */
export class OpenVikingStudio {
  private window?: BrowserWindow;
  private opening?: Promise<void>;
  private generation = 0;
  async open(connection: StudioConnection, icon: string) {
    if (this.opening) { await this.opening; this.window?.focus(); return; }
    const pending = this.create(connection, icon); this.opening = pending;
    try { await pending; } finally { if (this.opening === pending) this.opening = undefined; }
  }
  private async create(connection: StudioConnection, icon: string) {
    const generation = this.generation;
    const origin = studioOrigin(connection);
    if (this.window && !this.window.isDestroyed()) { this.window.show(); this.window.focus(); return; }
    const isolated = session.fromPartition('ned-studio-' + randomUUID());
    await isolated.setProxy({ mode: 'direct' });
    if (generation !== this.generation) return;
    isolated.setPermissionRequestHandler((_wc, _permission, answer) => answer(false));
    isolated.setPermissionCheckHandler(() => false);
    isolated.on('will-download', event => event.preventDefault());
    isolated.webRequest.onBeforeRequest((details, answer) => answer({ cancel: !studioRequestAllowed(origin, details.url) }));
    isolated.webRequest.onBeforeSendHeaders((details, answer) => {
      const headers = studioHeaders(connection, details.url, details.requestHeaders);
      answer({ cancel: !studioRequestAllowed(origin, details.url), requestHeaders: headers });
    });
    isolated.webRequest.onHeadersReceived((details, answer) => {
      const headers = { ...details.responseHeaders };
      for (const key of Object.keys(headers)) if (/^content-security-policy(?:-report-only)?$/i.test(key)) delete headers[key];
      answer({ responseHeaders: { ...headers, 'Content-Security-Policy': [studioCsp], 'Referrer-Policy': ['no-referrer'] } });
    });
    const window = new BrowserWindow({ width: 1180, height: 800, minWidth: 760, minHeight: 500, show: false, title: 'Ned · OpenViking Studio', icon,
      webPreferences: { session: isolated, contextIsolation: true, sandbox: true, nodeIntegration: false, devTools: false, webSecurity: true } });
    this.window = window; window.setMenu(null);
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    const navigate = (event: Electron.Event, url: string) => { if (!studioRequestAllowed(origin, url) || !new URL(url).pathname.startsWith('/studio')) event.preventDefault(); };
    window.webContents.on('will-navigate', navigate); window.webContents.on('will-redirect', navigate);
    window.on('closed', () => {
      if (this.window === window) this.window = undefined;
      isolated.webRequest.onBeforeRequest(null); isolated.webRequest.onBeforeSendHeaders(null); isolated.webRequest.onHeadersReceived(null);
      void isolated.clearStorageData().catch(() => {});
    });
    try {
      // Seed only public hints on a same-origin JSON page, before any Studio
      // application JS can initialize or overwrite its connection store.
      await window.loadURL(origin + '/health');
      if (generation !== this.generation) return;
      await window.webContents.executeJavaScript(studioBootstrap(origin));
      await window.loadURL(origin + '/studio/');
      if (generation === this.generation && !window.isDestroyed()) { window.show(); window.focus(); }
    }
    catch { if (!window.isDestroyed()) window.destroy(); if (generation !== this.generation) return; throw new Error('OpenViking Studio 화면을 불러오지 못했습니다. 지식 서비스 상태를 확인하세요.'); }
  }
  close() { this.generation++; if (this.window && !this.window.isDestroyed()) this.window.destroy(); this.window = undefined; }
}
