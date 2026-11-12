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
