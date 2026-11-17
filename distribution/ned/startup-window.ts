import { BrowserWindow } from 'electron';
import { atomicJSON } from '../../src/main/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { startupDocument, startupLabels, type StartupPhase } from './startup-view';
/** Presentation only: no preload, IPC, filesystem API, credentials or network in the renderer. */
export class StartupWindow {
  private window?: BrowserWindow; private closed=false; private dialogs=0; private phase:StartupPhase='launch';
  private detail='';
  private started=Date.now(); private stageStarted=this.started; private timer?: ReturnType<typeof setInterval>;
  private timings: Array<{phase:StartupPhase;elapsedMs:number;cpuUserUs:number;cpuSystemUs:number}>=[]; private cpu=process.cpuUsage();
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
    if(this.closed)return;
    if(this.dialogs===0)win.show();this.render();
    this.timer=setInterval(()=>this.render(),1000);this.timer.unref();
  }
  setPhase(phase:StartupPhase, detail='') {
    if(phase!==this.phase){const usage=process.cpuUsage(this.cpu);this.timings.push({phase:this.phase,elapsedMs:Date.now()-this.stageStarted,cpuUserUs:usage.user,cpuSystemUs:usage.system});this.cpu=process.cpuUsage();this.stageStarted=Date.now();}
    this.phase=phase;this.detail=detail;this.render();
  }
  private render() {
    const win=this.window;if(this.closed||!win||win.isDestroyed())return;
    const elapsed=`전체 ${Math.floor((Date.now()-this.started)/1000)}초 · 현재 단계 ${Math.floor((Date.now()-this.stageStarted)/1000)}초`;
    void win.webContents.executeJavaScript('document.getElementById("stage").textContent = '+JSON.stringify(startupLabels[this.phase]+(this.detail?' · '+this.detail:''))+';document.getElementById("elapsed").textContent = '+JSON.stringify(elapsed)).catch(()=>{});
  }
  async saveTiming(root:string){const usage=process.cpuUsage(this.cpu);const phases=[...this.timings,{phase:this.phase,elapsedMs:Date.now()-this.stageStarted,cpuUserUs:usage.user,cpuSystemUs:usage.system}];await atomicJSON(path.join(root,'startup-timing.json'),{schemaVersion:1,recordedAt:new Date().toISOString(),elapsedMs:Date.now()-this.started,phases,measurement:'host phases; editor spawn is not first visible frame'}).catch(()=>{});}
  async duringDialog<T>(task:()=>Promise<T>):Promise<T> {
    this.dialogs++;this.window?.hide();
    try{return await task();}finally{this.dialogs--;if(!this.closed&&this.dialogs===0)this.window?.show();}
  }
  close(){clearInterval(this.timer);this.closed=true;this.window?.destroy();this.window=undefined;}
}
