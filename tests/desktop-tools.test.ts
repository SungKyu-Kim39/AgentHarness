import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, symlink, copyFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { DesktopTools, permittedDesktopWindow } from '../distribution/desktop-tools';
const target = { id:'w-test',pid:1234,app_name:'Notepad',process_instance:'p1',title:'fixture' };
const reply = (data: unknown) => ({ content:[{type:'text',text:JSON.stringify({ok:true,data})}],structuredContent:{ok:true,data} });
test('desktop scope rejects managed, system and terminal windows', () => {
  assert.equal(permittedDesktopWindow(target), true);
  for (const app_name of ['Ned','L-Vibe','Zed','Windows Terminal','cmd.exe','powershell.exe','explorer.exe','consent.exe','OpenCode','agent-desktop']) assert.equal(permittedDesktopWindow({...target,app_name}),false,app_name);
  assert.equal(permittedDesktopWindow({...target,pid:process.pid}),false);
});
test('desktop refs, project and native approval bind each action; changed identities and unknown arguments fail closed', async t => {
  const root = await mkdtemp(path.join(tmpdir(),'ned-desktop-')); t.after(()=>rm(root,{recursive:true,force:true}));
  let approvals=0, allow=true, live={...target};let lastDetail=''; const calls:string[]=[];
  const tools = new DesktopTools(root,root,async (_title,detail)=>{approvals++;lastDetail=detail;return allow;});
  const home=path.join(root,'private');await mkdir(home);
  const client={ call:async(name:string,args:any)=>{ calls.push(name); return name==='desktop_list_windows'? reply([live,{...live,id:'own',app_name:'Ned'}]):name==='desktop_snapshot'?reply({window:live,tree:{ref_id:'@s1:e1',children:[{ref_id:'@s1:e2',role:'button',name:'Save fixture'}]}}):reply({applied:args}); },close:async()=>{} };
  (tools as any).sessions.set('s',{client,home,project:'/project',refs:new Map()});
  await assert.rejects(tools.call('desktop_click',{ref_id:'@forged:e1'},'s','/project'),/qualified ref/);assert.equal(approvals,0);
  await tools.call('desktop_snapshot',{window_id:target.id},'s','/project');
  await tools.call('desktop_click',{ref_id:'@s1:e2'},'s','/project');assert.equal(approvals,2);assert.ok(lastDetail.includes('Save fixture'));assert.ok(lastDetail.includes('button'));
  await assert.rejects(tools.call('desktop_click',{ref_id:'@s1:e2'},'s','/other'),/프로젝트/);
  await assert.rejects(tools.call('desktop_click',{ref_id:'@s1:e2',force:true},'s','/project'));
  await assert.rejects(tools.call('desktop_snapshot',{window_id:'own'},'s','/project'),/대상 창/);
  allow=false;const before=calls.filter(c=>c==='desktop_click').length;
  await assert.rejects(tools.call('desktop_click',{ref_id:'@s1:e2'},'s','/project'),/거절/);assert.equal(calls.filter(c=>c==='desktop_click').length,before);
  allow=true;live={...live,process_instance:'replacement'};
  await assert.rejects(tools.call('desktop_click',{ref_id:'@s1:e2'},'s','/project'),/바뀌/);
  await tools.cancel('s');await assert.rejects(tools.call('desktop_status',{},'s','/project'),/중지/);
});
test('real pinned agent-desktop MCP starts with a private home and reports capabilities without internet or a model',
 {skip:process.platform!=='linux'||!existsSync('vendor/runtime/linux-x64/agent-desktop/agent-desktop'),timeout:30000},async t=>{
  const root=await mkdtemp(path.join(tmpdir(),'ned-desktop-real-'));t.after(()=>rm(root,{recursive:true,force:true}));
  await mkdir(path.join(root,'resources/runtime/linux-x64'),{recursive:true});await mkdir(path.join(root,'resources/ned/locks'),{recursive:true});
  await symlink(path.resolve('vendor/runtime/linux-x64/agent-desktop'),path.join(root,'resources/runtime/linux-x64/agent-desktop'));
  await copyFile('agent-desktop-lock.json',path.join(root,'resources/ned/locks/agent-desktop.json'));
  const tools=new DesktopTools(root,path.join(root,'resources'),async()=>true);t.after(()=>tools.close());
  const result=await tools.call('desktop_status',{},'s','/fixture');const body=JSON.stringify(result);
  assert.match(body,/1\.2\.0/);assert.match(body,/permissions|accessibility/);
  const context=(tools as any).sessions.get('s');assert.ok(context.home.startsWith(path.join(root,'desktop')));
  await tools.cancel('s');assert.equal(existsSync(context.home),false);
});
test('a closed desktop client is disposed before a fresh observation; uncertain actions are never replayed',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-desktop-recover-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const tools=new DesktopTools(root,root,async()=>true);t.after(()=>tools.close());
 let disposed=0,created=0,clicks=0;
 const broken={available:true,call:async(name:string)=>{if(name==='desktop_list_windows')return reply([target]);clicks++;broken.available=false;throw Error('transport lost')},close:async()=>{disposed++}};
 const oldHome=path.join(root,'old');await mkdir(oldHome);
 (tools as any).sessions.set('s',{client:broken,home:oldHome,project:'/p',refs:new Map([['@s1:e2',{window:target}]])});
 (tools as any).create=async(project:string)=>{created++;return{client:{available:true,call:async(name:string)=>name==='desktop_list_windows'?reply([target]):name==='desktop_snapshot'?reply({window:target,tree:{ref_id:'@fresh:e1'}}):reply({}),close:async()=>{}},home:path.join(root,'fresh'),project,refs:new Map()}};
 await assert.rejects(tools.call('desktop_click',{ref_id:'@s1:e2'},'s','/p'),/DESKTOP_CONNECTION_CLOSED/);
 assert.equal(clicks,1);assert.equal(disposed,1);assert.equal(existsSync(oldHome),false);
 await assert.rejects(tools.call('desktop_focus_window',{window_id:target.id},'s','/p'),/snapshot/);
 await tools.call('desktop_status',{},'s','/p');assert.equal(created,1);
 await assert.rejects(tools.call('desktop_get',{ref_id:'@s1:e2'},'s','/p'),/qualified ref/);
 await tools.call('desktop_snapshot',{window_id:target.id},'s','/p');
 await tools.call('desktop_focus_window',{window_id:target.id},'s','/p');assert.equal(clicks,1);
});
test('unconfirmed desktop stop blocks replacement processes and app launch',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-desktop-stop-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const tools=new DesktopTools(root,root,async()=>true);
 (tools as any).sessions.set('s',{client:{available:false,close:async()=>{throw Error('exit unknown')}},home:root,project:'/p',refs:new Map()});
 await assert.rejects(tools.call('desktop_status',{},'s','/p'),/exit unknown/);
 await assert.rejects(tools.call('desktop_launch',{app:'calculator'},'s','/p'),/종료가 불명확/);
});
test('GUI launch freezes a reviewed executable, needs separate native approval and never claims UI verification',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-desktop-launch-'));t.after(()=>rm(root,{recursive:true,force:true}));
 let allow=false,launches=0,detail='';const plan={executable:'C:\\Windows\\System32\\calc.exe',cwd:'C:\\Windows\\System32',arguments:[],sha256:'fixed'};
 const tools=new DesktopTools(root,root,async(_title,d)=>{detail=d;return allow});
 (tools as any).launcher={prepare:async()=>plan,launch:async(p:unknown)=>{assert.deepEqual(p,plan);launches++;return{status:'started',pid:9,windowVerified:false}}};
 await assert.rejects(tools.call('desktop_launch',{app:'calculator',args:['/run']},'s','/p'));
 await assert.rejects(tools.call('desktop_launch',{app:'calculator'},'s','/p'),/거절/);assert.equal(launches,0);
 allow=true;const result=await tools.call('desktop_launch',{app:'calculator'},'s','/p');assert.equal(launches,1);assert.match(detail,/calc.exe/);assert.match(result.content[0].text!,/"windowVerified":false/);
});
test('cancelling during GUI preparation prevents dispatch without closing user apps',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-desktop-launch-cancel-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const tools=new DesktopTools(root,root,async()=>{throw Error('approval after cancellation')});
 let prepared!:()=>void,release!:()=>void;const entered=new Promise<void>(r=>prepared=r),wait=new Promise<void>(r=>release=r);let launches=0;
 (tools as any).launcher={prepare:async()=>{prepared();await wait;return{}},launch:async()=>{launches++;return{}}};
 const work=tools.call('desktop_launch',{app:'calculator'},'s','/p');await entered;await tools.cancel('s');release();
 await assert.rejects(work,/abort/i);assert.equal(launches,0);await tools.close();
});
