import { BrowserWindow, session } from 'electron';
import { randomUUID } from 'node:crypto';
import { studioBootstrap, studioCsp, studioHeaders, studioOrigin, studioRequestAllowed, type StudioConnection } from './studio-policy';

/** Isolated UI for the already-owned sidecar. Credentials never enter page JS. */
export class OpenVikingStudio {
  private window?: BrowserWindow;
  private opening?: Promise<void>;
  private generation = 0;
  constructor(private diagnostic: (event: { code:string; httpStatus?:number }) => void = () => {}) {}
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
    let lastCode = 'STUDIO_RENDER_TIMEOUT';
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
      if(details.statusCode>=400){lastCode=details.statusCode===401||details.statusCode===403?'STUDIO_AUTH':'STUDIO_RESOURCE';this.diagnostic({code:lastCode,httpStatus:details.statusCode});}
      const headers = { ...details.responseHeaders };
      for (const key of Object.keys(headers)) if (/^content-security-policy(?:-report-only)?$/i.test(key)) delete headers[key];
      answer({ responseHeaders: { ...headers, 'Content-Security-Policy': [studioCsp], 'Referrer-Policy': ['no-referrer'] } });
    });
    const window = new BrowserWindow({ width: 1180, height: 800, minWidth: 760, minHeight: 500, show: false, title: 'Ned · OpenViking Studio', icon,
      webPreferences: { session: isolated, contextIsolation: true, sandbox: true, nodeIntegration: false, devTools: false, webSecurity: true } });
    this.window = window; window.setMenu(null);
    let timer: ReturnType<typeof setInterval> | undefined, checking=false, shownAt=0, ready=false, failed=false;
    const showFailure=async(code:string)=>{
      if(generation!==this.generation||window.isDestroyed())return;
      failed=true;this.diagnostic({code});
      // Controlled strings only: no raw HTTP errors, paths, storage, credentials or page logs.
      const text=`<main style="font-family:Segoe UI,Malgun Gothic,sans-serif;padding:40px;color:#222;background:white"><h1>OpenViking Studio를 표시하지 못했습니다.</h1><p>진단 코드: ${code}</p><p>Ned의 대화와 코드 작업은 계속 사용할 수 있습니다.</p><button id="ned-studio-retry">다시 불러오기</button></main>`;
      await window.webContents.executeJavaScript('document.body.innerHTML='+JSON.stringify(text)+';document.getElementById("ned-studio-retry").onclick=()=>{window.__nedStudioRetry=true}').catch(()=>{});
      window.show();window.focus();
    };
    window.webContents.on('render-process-gone',()=>{
      ready=false;lastCode='STUDIO_RENDERER_EXIT';this.diagnostic({code:lastCode});
      // Recreate the document after a renderer exit; the next inspection either
      // confirms an actual UI or presents the controlled retry page.
      shownAt=Date.now()-15001;
      void window.loadURL(origin+'/studio/').then(()=>showFailure(lastCode)).catch(()=>{});
    });
    window.webContents.on('console-message',(_event:any,...args:any[])=>{
      // Inspect only in memory. Persist one fixed category, never the message text.
      const message=typeof _event?.message==='string'?_event.message:args.find(v=>typeof v==='string')??'';
      if(/Content Security Policy|Refused to (?:load|execute)/i.test(message)){lastCode='STUDIO_POLICY';this.diagnostic({code:lastCode});}
    });
    const inspect=async()=>{
      if(checking||window.isDestroyed()||generation!==this.generation)return;checking=true;
      try{
        const state=await window.webContents.executeJavaScript('({retry:window.__nedStudioRetry===true,ready:!!document.querySelector("#app")&&document.querySelector("#app").children.length>0&&document.body.innerText.trim().length>40})');
        if(state?.retry){failed=false;ready=false;shownAt=Date.now();lastCode='STUDIO_RENDER_TIMEOUT';await window.webContents.executeJavaScript('window.__nedStudioRetry=false');await window.loadURL(origin+'/studio/');}
        else if(!failed&&state?.ready){if(!ready)this.diagnostic({code:'STUDIO_READY'});ready=true;shownAt=Date.now();}
        else if(!failed&&shownAt&&Date.now()-shownAt>15000){ready=false;await showFailure(lastCode);}
      }catch{if(shownAt&&!failed&&Date.now()-shownAt>15000)await showFailure('STUDIO_SCRIPT');}
      finally{checking=false;}
    };
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    const navigate = (event: Electron.Event, url: string) => { if (!studioRequestAllowed(origin, url) || !new URL(url).pathname.startsWith('/studio')) event.preventDefault(); };
    window.webContents.on('will-navigate', navigate); window.webContents.on('will-redirect', navigate);
    window.on('closed', () => {
      clearInterval(timer);
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
      if (generation === this.generation && !window.isDestroyed()) {
        shownAt=Date.now();window.show();window.focus();
        timer=setInterval(()=>{void inspect();},750);timer.unref();void inspect();
      }
    }
    catch { if (!window.isDestroyed()) window.destroy(); if (generation !== this.generation) return; throw new Error('OpenViking Studio 화면을 불러오지 못했습니다. 지식 서비스 상태를 확인하세요.'); }
  }
  close() { this.generation++; if (this.window && !this.window.isDestroyed()) this.window.destroy(); this.window = undefined; }
}
