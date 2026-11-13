import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';import{tmpdir}from'node:os';
import { HostTools } from '../distribution/host-tools';import { Redactor } from '../src/main/config';
async function fixture(t:any) {
 const root=await mkdtemp(path.join(tmpdir(),'ned-session-grant-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const first=path.join(root,'project'),other=path.join(root,'other');await mkdir(first);await mkdir(other);
 let project=first, request='r1',prompts=0;
 const host=new HostTools(path.join(root,'data'),root,{project:async()=>project,request:async()=>request,approve:async()=>{throw Error('unexpected effect')},approveEdit:async()=>{prompts++;return{approved:true,autoApproveRequest:false,autoApproveSession:true}},knowledge:()=>undefined,redactor:new Redactor()});
 t.after(()=>host.close());
 return{host,first,other,setProject:(p:string)=>{project=p},newRequest:()=>{request+='x';host.resumeSession('s')},prompts:()=>prompts};
}
test('session/project edits stay granted across new messages, while snapshots and scope protections remain',async t=>{
 const f=await fixture(t);await f.host.call('propose_edit',{path:'first.txt',content:'first'},'s');f.newRequest();await f.host.call('propose_edit',{path:'second.txt',content:'second'},'s');
 assert.equal(f.prompts(),1);assert.equal(f.host.editApprovalStatus().mode,'session-project');
 assert.equal(await readFile(path.join(f.first,'second.txt'),'utf8'),'second');
 await assert.rejects(f.host.call('propose_edit',{path:'../outside.txt',content:'blocked'},'s'));
 await assert.rejects(f.host.call('propose_edit',{path:'.zed/settings.json',content:'{}'},'s'));
 f.host.revokeEditApproval();f.newRequest();await f.host.call('propose_edit',{path:'third.txt',content:'third'},'s');assert.equal(f.prompts(),2);
});
test('other sessions/projects, stop and new host instances cannot inherit the edit grant',async t=>{
 const f=await fixture(t);await f.host.call('propose_edit',{path:'one.txt',content:'one'},'s');
 await f.host.call('list_files',{},'other');assert.equal(f.host.editApprovalStatus().mode,'ask');
 await f.host.call('propose_edit',{path:'two.txt',content:'two'},'s');assert.equal(f.prompts(),2);
 f.setProject(f.other);await f.host.call('list_files',{},'s');assert.equal(f.host.editApprovalStatus().mode,'ask');
 await f.host.call('propose_edit',{path:'three.txt',content:'three'},'s');assert.equal(f.prompts(),3);
 f.host.cancelSession('s');assert.equal(f.host.editApprovalStatus().mode,'ask');f.host.resumeSession('s');await f.host.call('propose_edit',{path:'four.txt',content:'four'},'s');assert.equal(f.prompts(),4);
 const second=await fixture(t);assert.equal(second.host.editApprovalStatus().mode,'ask');
});
test('revocation while the editor is checking a proposal prevents a delayed write',async t=>{
 const f=await fixture(t);await f.host.call('propose_edit',{path:'one.txt',content:'one'},'s');
 let arrived!:()=>void,proceed!:()=>void;const entered=new Promise<void>(r=>arrived=r),pending=new Promise<void>(r=>proceed=r);
 (f.host as any).options.validateEdit=async()=>{arrived();await pending};
 const editing=f.host.call('propose_edit',{path:'blocked.txt',content:'blocked'},'s');await entered;f.host.revokeEditApproval();proceed();
 await assert.rejects(editing,/중지|보류|거절/);await assert.rejects(readFile(path.join(f.first,'blocked.txt')));
});
