import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { build } from 'esbuild';
const require=createRequire(import.meta.url);
async function fixture(){
  const windows=[],sessions=[];
  class Window extends EventEmitter{
    constructor(options){super();this.options=options;this.destroyed=false;this.shown=0;this.webContents=new EventEmitter();this.webContents.setWindowOpenHandler=fn=>this.popup=fn;windows.push(this)}
    removeMenu(){} isDestroyed(){return this.destroyed} close(){if(!this.destroyed){this.destroyed=true;this.emit('closed')}}
    async loadURL(url){this.url=url}show(){this.shown++}focus(){}
  }
  const electron={BrowserWindow:Window,session:{fromPartition(name){const s={name,setPermissionRequestHandler(fn){this.permission=fn},webRequest:{onBeforeRequest(filter,fn){s.filter=filter;s.request=fn}},async clearStorageData(){}};sessions.push(s);return s}}};
  const result=await build({entryPoints:['distribution/ned/python-selector.ts'],bundle:true,platform:'node',format:'cjs',write:false,external:['electron']});
  const module={exports:{}};vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:id=>id==='electron'?electron:require(id),process,Buffer,URL,encodeURIComponent});
  return {choose:module.exports.selectPythonEnvironment,windows,sessions};
}
test('environment choice accepts only an offered ID, isolates the renderer and escapes project/environment text',async()=>{
  const f=await fixture(),id='a'.repeat(32);
  const pending=f.choose('/resources','</script><script>untrusted()</script>',[{id,name:'</script><script>unsafe()</script>',prefix:'D:\\Conda\\analysis'}]);
  const win=f.windows[0],html=decodeURIComponent(win.url.split(',',2)[1]);
  assert.equal(win.options.webPreferences.nodeIntegration,false);assert.equal(win.options.webPreferences.contextIsolation,true);assert.equal(win.options.webPreferences.sandbox,true);assert.equal(win.popup({url:'https://example.invalid'}).action,'deny');
  assert.ok(!html.includes('</script><script>untrusted'));assert.match(html,/\\u003c/);
  let prevented=false;win.webContents.emit('will-navigate',{preventDefault(){prevented=true}},'https://example.invalid');assert.equal(prevented,true);assert.equal(win.destroyed,false);
  const prefix=html.match(/ned-python-select:[a-f0-9]+\//)[0];
  win.webContents.emit('will-navigate',{preventDefault(){}},prefix+'not-an-environment');assert.equal(win.destroyed,false);
  win.webContents.emit('will-navigate',{preventDefault(){}},prefix+id);assert.equal(await pending,id);assert.equal(win.destroyed,true);
  let cancelled=false;f.sessions[0].request({url:'https://example.invalid'},r=>cancelled=r.cancel);assert.equal(cancelled,true);
});
test('shutdown cancels the environment decision and cannot show a late selection window',async()=>{
  const f=await fixture(),abort=new AbortController();const pending=f.choose('/resources','project',[],abort.signal);abort.abort();assert.equal(await pending,undefined);await Promise.resolve();assert.equal(f.windows[0].shown,0);
});
