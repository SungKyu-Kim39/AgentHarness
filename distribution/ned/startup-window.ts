import { BrowserWindow } from 'electron';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { startupDocument, startupLabels, type StartupPhase } from './startup-view';
/** Presentation only: no preload, IPC, filesystem API, credentials or network in the renderer. */
export class StartupWindow {
  private window?: BrowserWindow; private closed=false; private dialogs=0; private phase:StartupPhase='launch';
  async open(resources:string) {
    if(this.closed)return;
    const icon=await readFile(path.join(resources,'ned/icon.png')).then(b=>'data:image/png;base64,'+b.toString('base64')).catch(()=>'');
    if(this.closed)return;
    const win=new BrowserWindow({width:400,height:300,show:false,frame:false,resizable:false,minimizable:false,maximizable:false,closable:false,center:true,
      title:'Ned · 실행 중',backgroundColor:'#111111',icon:path.join(resources,'ned/icon.ico'),
      webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,devTools:false,spellcheck:false} });
    this.window=win;
    win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    win.webContents.on('will-navigate',event=>event.preventDefault());
    win.webContents.session.setPermissionCheckHandler(()=>false);
    win.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
    await win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(startupDocument(icon)));
    if(!this.closed&&this.dialogs===0)win.show();this.setPhase(this.phase);
  }
  setPhase(phase:StartupPhase) {
    this.phase=phase;const win=this.window;if(this.closed||!win||win.isDestroyed())return;
    const label=startupLabels[phase];
    void win.webContents.executeJavaScript('document.getElementById("stage").textContent = '+JSON.stringify(label)).catch(()=>{});
  }
  async duringDialog<T>(task:()=>Promise<T>):Promise<T> {
    this.dialogs++;this.window?.hide();
    try{return await task();}finally{this.dialogs--;if(!this.closed&&this.dialogs===0)this.window?.show();}
  }
  close(){this.closed=true;this.window?.destroy();this.window=undefined;}
}
