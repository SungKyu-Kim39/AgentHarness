import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {build} from 'esbuild';
const compiled=await build({entryPoints:['distribution/ned/studio.ts'],bundle:true,write:false,platform:'node',format:'cjs',target:'node22',external:['electron']});
const require=createRequire(import.meta.url);
function fixture(proxy=Promise.resolve(),load=()=>Promise.resolve(),options={}) {
 const windows=[],hooks={},diagnostics=[];let cleared=0,tick,now=1000;const state=options.state??{};class Clock extends Date {static now(){return now;}}
 const isolated={setProxy:()=>proxy,setPermissionRequestHandler(){},setPermissionCheckHandler(){},on(){},clearStorageData:async()=>{cleared++;},webRequest:Object.fromEntries(['onBeforeRequest','onBeforeSendHeaders','onHeadersReceived'].map(key=>[key,handler=>{hooks[key]=handler;}]))};
 class Window extends EventEmitter {
  destroyed=false;focused=0;visible=false;webContents=new EventEmitter();
  constructor(options){super();this.options=options;this.webContents.setWindowOpenHandler=handler=>{this.popup=handler;};this.webContents.executeJavaScript=async script=>{assert.ok(!script.includes('private-run-token'));this.bootstrap=script;if(script.includes('sidebar-wrapper'))return state.phase ?? 'waiting';if(script.includes('data-slot'))return state.dom ?? {url:'http://127.0.0.1:12345/studio/',readyState:'complete',appExists:true,childCount:1,dataSlots:['loading-shell'],textSnippet:'Loading Studio'};};windows.push(this);}
  setMenu(){}show(){this.visible=true;}isVisible(){return this.visible;}focus(){this.focused++;}isDestroyed(){return this.destroyed;}
  loadURL(url){assert.ok(!url.endsWith('/health'));this.url=url;return load();}destroy(){this.destroyed=true;this.emit('closed');}
 }
 const electron={BrowserWindow:Window,session:{fromPartition:name=>{assert.ok(!name.startsWith('persist:'));return isolated;}}};
 const module={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,__dirname: '/app',require:name=>name==='electron'?electron:require(name),URL,Date:Clock,setInterval:fn=>{tick=fn;return {unref(){}};},clearInterval(){tick=undefined;}});
 return {studio:new module.exports.OpenVikingStudio(event=>diagnostics.push(event)),windows,hooks,diagnostics,cleared:()=>cleared,advance:async ms=>{now+=ms;tick?.();await new Promise(resolve=>setImmediate(resolve));}};
}
const connection={baseUrl:'http://127.0.0.1:12345',headers:{Authorization:'Bearer private-run-token','X-OpenViking-Account':'ned','X-OpenViking-Role':'admin','X-API-Key':'private-run-token'}};
test('Studio reuses one isolated window and injects credentials only to its private origin',async()=>{
 const f=fixture();await Promise.all([f.studio.open(connection,'icon'),f.studio.open(connection,'icon')]);
 assert.equal(f.windows.length,1);const w=f.windows[0];assert.equal(w.url,connection.baseUrl+'/studio/');assert.ok(!w.url.includes('private-run-token'));
 assert.equal(w.options.webPreferences.sandbox,true);assert.equal(w.options.webPreferences.nodeIntegration,false);assert.equal(w.options.webPreferences.contextIsolation,true);
 let answer;f.hooks.onBeforeSendHeaders({url:connection.baseUrl+'/api/v1/fs/ls',requestHeaders:{'x-openviking-role':'root','x-api-key':'attacker'}},value=>{answer=value;});
 assert.equal(answer.cancel,false);assert.equal(answer.requestHeaders['X-OpenViking-Role'],'admin');assert.equal(answer.requestHeaders['x-api-key'],undefined);
 f.hooks.onBeforeSendHeaders({url:'https://external.invalid/',requestHeaders:{}},value=>{answer=value;});assert.equal(answer.cancel,true);assert.equal(answer.requestHeaders.Authorization,undefined);
 assert.equal(w.popup().action,'deny');f.studio.close();assert.equal(w.destroyed,true);assert.equal(f.cleared(),1);assert.equal(f.hooks.onBeforeSendHeaders,null);
});
test('closing during proxy preparation cannot create a late Studio window',async()=>{
 let ready;const f=fixture(new Promise(resolve=>{ready=resolve;}));const opening=f.studio.open(connection,'icon');f.studio.close();ready();await opening;assert.equal(f.windows.length,0);
});
test('closing during navigation cancels the window without reopening or a false loading error',async()=>{
 let reject;const f=fixture(Promise.resolve(),()=>new Promise((_resolve,r)=>{reject=r;}));const opening=f.studio.open(connection,'icon');
 await new Promise(resolve=>setImmediate(resolve));f.studio.close();reject(new Error('navigation cancelled'));await opening;assert.equal(f.windows.length,1);assert.equal(f.windows[0].destroyed,true);
});

test('a blank document becomes an explicit diagnostic after 30s with DOM summary and retry can reach a rendered app',async()=>{
 const state={phase:'waiting'},f=fixture(Promise.resolve(),()=>Promise.resolve(),{state});
 await f.studio.open(connection,'icon');
 await f.advance(16000);
 assert.equal(f.diagnostics.length,0,'must not time out before 30 seconds');
 await f.advance(15000);
 const window=f.windows[0];
 assert.match(decodeURIComponent(window.url),/다시 불러오기/);
 assert.equal(f.diagnostics.at(-1).code,'STUDIO_RENDER_TIMEOUT');
 assert.equal(f.diagnostics.at(-1).domSummary.appExists,true);
 assert.deepEqual(f.diagnostics.at(-1).domSummary.dataSlots,['loading-shell']);
 let prevented=false;
 state.phase='ready';
 window.webContents.emit('will-navigate',{preventDefault:()=>{prevented=true;}},connection.baseUrl+'/studio/');
 await f.advance(750);assert.equal(prevented,true);assert.equal(window.url,connection.baseUrl+'/studio/');
 assert.equal(f.diagnostics.at(-1).code,'STUDIO_READY');
 f.studio.close();
});

test('blocked requests, did-fail-load, and console errors produce STUDIO_BLOCKED_REQUEST with sanitized diagnostics',async()=>{
 const state={phase:'waiting'},f=fixture(Promise.resolve(),()=>Promise.resolve(),{state});
 await f.studio.open(connection,'icon');
 const w=f.windows[0];
 let answer;
 f.hooks.onBeforeRequest({url:connection.baseUrl+'/api/v1/unknown/boot?token=secret-abc',resourceType:'xhr'},v=>{answer=v;});
 assert.equal(answer.cancel,true);
 w.webContents.emit('did-fail-load',{},-20,'ERR_BLOCKED_BY_CLIENT',connection.baseUrl+'/api/v1/unknown/boot',false);
 w.webContents.emit('console-message',{},3,'Failed fetch with Bearer private-run-token at C:\\Users\\alice\\work',42,connection.baseUrl+'/studio/assets/app.js');
 await f.advance(31000);
 const event=f.diagnostics.at(-1);
 assert.equal(event.code,'STUDIO_BLOCKED_REQUEST');
 assert.equal(event.blockedUrls.length,1);
 assert.match(event.blockedUrls[0],/xhr:http:\/\/127\.0\.0\.1:12345\/api\/v1\/unknown\/boot/);
 assert.ok(!JSON.stringify(event).includes('secret-abc'));
 assert.ok(!JSON.stringify(event).includes('private-run-token'));
 assert.ok(!JSON.stringify(event).includes('alice'));
 assert.equal(event.loadFailures.length,1);
 assert.equal(event.consoleMessages.length,1);
 assert.equal(event.consoleMessages[0].level,'error');
 f.studio.close();
});
