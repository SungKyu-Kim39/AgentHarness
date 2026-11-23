import { BrowserWindow, session } from 'electron';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import type { PythonEnvironment } from '../python-projects';

/** User decision, independent of automatic execution permission. No preload/API keys. */
export function selectPythonEnvironment(resources: string, project: string, environments: PythonEnvironment[], signal?: AbortSignal): Promise<string | undefined> {
  signal?.throwIfAborted();
  const nonce = randomBytes(24).toString('hex'), prefix = 'ned-python-select:' + nonce + '/';
  const privateSession = session.fromPartition('ned-python-choice-' + nonce, { cache: false });
  privateSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  privateSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'file:///*', 'ws://*/*', 'wss://*/*'] }, (_details, callback) => callback({ cancel: true }));
  const data = JSON.stringify({ project, environments: environments.map(({ id, name, prefix }) => ({ id, name, prefix })) }).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'"><title>Ned Python 환경 선택</title><style nonce="${nonce}">body{font:15px 'Segoe UI',sans-serif;padding:24px;background:#f7f8fa;color:#18212b}h1{font-size:22px;margin:0 0 12px}p{line-height:1.6;overflow-wrap:anywhere}select{width:100%;height:210px;background:white;padding:8px;border:1px solid #bac1cb;border-radius:6px}option{padding:7px}footer{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}button{padding:9px 18px;border:1px solid #aeb8c4;border-radius:6px;background:white}#use{background:#172a45;color:white}#use:disabled{opacity:.4}</style><h1>프로젝트의 Python 환경 선택</h1><p id="project"></p><p>이 프로젝트에서 계속 사용할 Conda 환경을 선택하세요. 로컬 설정과 활성화된 OpenViking에 선택 내용을 기록합니다. 실행할 때는 선택한 환경을 활성화합니다.</p><select id="env" size="7" aria-label="Conda 환경"></select><footer><button id="manual">다른 Conda 설치 찾기</button><button id="cancel">취소</button><button id="use" disabled>이 환경 사용</button></footer><script nonce="${nonce}">const data=${data};document.getElementById('project').textContent=data.project;const list=document.getElementById('env');for(const e of data.environments){const o=document.createElement('option');o.value=e.id;o.textContent=e.name+' — '+e.prefix;list.append(o)}list.selectedIndex=-1;const use=document.getElementById('use');list.onchange=()=>use.disabled=list.selectedIndex<0;use.onclick=()=>{if(list.selectedIndex>=0)location.href=${JSON.stringify(prefix)}+list.value};document.getElementById('manual').onclick=()=>location.href=${JSON.stringify(prefix)}+'__manual__';document.getElementById('cancel').onclick=()=>location.href=${JSON.stringify(prefix)}+'cancel';</script></html>`;
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({ width: 800, height: 550, minWidth: 640, minHeight: 500, title: 'Ned Python 환경 선택', show: false, alwaysOnTop: true, icon: path.join(resources, 'ned/icon.ico'), webPreferences: { session: privateSession, sandbox: true, contextIsolation: true, nodeIntegration: false, devTools: false } });
    win.removeMenu(); win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    let finished = false;
    const finish = (id?: string) => { if (finished) return; finished = true; signal?.removeEventListener('abort', cancel); if (!win.isDestroyed()) win.close(); resolve(id); };
    const cancel = () => finish();
    win.webContents.on('will-navigate', (event, url) => {
      event.preventDefault(); if (!url.startsWith(prefix)) return;
      const id = url.slice(prefix.length);
      if (id === 'cancel') finish(); else if (id === '__manual__') finish(id); else if (environments.some(e => e.id === id)) finish(id);
    });
    win.webContents.on('will-redirect', event => event.preventDefault());
    win.once('closed', () => { finish(); void privateSession.clearStorageData().catch(() => {}); });
    signal?.addEventListener('abort', cancel, { once: true }); if (signal?.aborted) { cancel(); return; }
    void win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html)).then(() => { if (!finished && !win.isDestroyed()) { win.setAlwaysOnTop(true, 'screen-saver'); win.show(); win.moveTop(); win.focus(); } }, error => { finish(); reject(error); });
  });
}
