import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PermissionPolicy } from '../distribution/ned/permission-policy';
import { HostTools, type EditDecision } from '../distribution/host-tools';
import { Redactor } from '../src/main/config';
import { NativeRuntime } from '../distribution/native-control';

test('explicit persistent modes cover edits and effects; malformed settings never silently grant authority', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-permissions-')); t.after(() => rm(root, { recursive:true, force:true }));
  const policy = new PermissionPolicy(root); await policy.load(); let prompts = 0;
  const prompt = async () => { prompts++; return false; };
  assert.equal(await policy.decide('edit', undefined, true, prompt), false);
  await policy.set('edits');
  assert.equal(await policy.decide('edit', undefined, true, prompt), true);
  assert.equal(await policy.decide('effect', undefined, true, prompt), false);
  await policy.set('full');
  for (const kind of ['edit','effect'] as const) assert.equal(await policy.decide(kind, undefined, true, prompt), true);
  const reloaded = new PermissionPolicy(root); await reloaded.load(); assert.equal(reloaded.mode, 'full');
  assert.equal(reloaded.revision,policy.revision);
  assert.equal(prompts, 2);
  await assert.rejects(policy.set('anything')); assert.equal(policy.mode, 'full');
  await writeFile(policy.file, '{"schemaVersion":1,"mode":"full","plugins":["untrusted"]}');
  await assert.rejects(new PermissionPolicy(root).load());
  await rm(policy.file); await writeFile(path.join(root,'outside.json'), '{"schemaVersion":1,"mode":"full"}');
  await symlink(path.join(root,'outside.json'),policy.file);
  await assert.rejects(new PermissionPolicy(root).load());
});

test('stale or concurrently queued editor defaults cannot raise the global permission mode', async t => {
  const root=await mkdtemp(path.join(tmpdir(),'ned-policy-revisions-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const policy=new PermissionPolicy(root);const old=policy.revision;
  const first=policy.set('full',old),second=assert.rejects(policy.set('edits',old));
  await first;await second;assert.equal(policy.mode,'full');
  const fullRevision=policy.revision;await policy.set('ask');
  await assert.rejects(policy.set('full',fullRevision));assert.equal(policy.mode,'ask');
});

test('status keeps a consistent mode/revision during save while new effects are suspended', async t => {
  const root=await mkdtemp(path.join(tmpdir(),'ned-policy-status-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const policy=new PermissionPolicy(root);await policy.set('full');const previous=policy.revision;
  const changing=policy.set('ask');await Promise.resolve();
  assert.equal(policy.mode,'full');assert.equal(policy.revision,previous);
  await assert.rejects(policy.decide('effect',undefined,true,async()=>true),/적용 중/);
  await changing;assert.equal(policy.mode,'ask');assert.equal(policy.revision,previous+1);
});

test('full mode covers the runtime effect gate; restart suspension and failed persistence fail closed', async t => {
  const root=await mkdtemp(path.join(tmpdir(),'ned-runtime-mode-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const policy=new PermissionPolicy(root);await policy.set('full');let prompts=0;
  const runtime=new NativeRuntime(root,root,{isEncryptionAvailable:()=>true,encryptString:Buffer.from,decryptString:b=>b.toString()},async()=>{prompts++;return false},undefined,policy);
  assert.equal(await runtime.approveOperation('Desktop 동작 승인','fixture'),true);
  assert.equal(await runtime.approveOperation('Visual Studio 빌드 실행 승인','fixture'),true);
  assert.equal(await runtime.approveOperation('프로젝트 지식 색인 승인','fixture'),true);assert.equal(prompts,0);
  runtime.pauseApprovals(true);assert.equal(await runtime.approveOperation('Desktop 동작 승인','fixture'),false);
  runtime.pauseApprovals(false);await runtime.setPermissionMode('edits');
  assert.equal(await runtime.approveOperation('Desktop 동작 승인','fixture'),false);assert.equal(prompts,1);
  await rm(policy.file);await mkdir(policy.file);
  await assert.rejects(policy.set('full'));assert.equal(policy.mode,'ask');
  await rm(policy.file,{recursive:true});await policy.set('ask');
  const reloaded=new PermissionPolicy(root);await reloaded.load();assert.equal(reloaded.mode,'ask');
});

test('mode changes abort pending dialogs and delayed file writes; full mode retains project and conflict checks', async t => {
  const root=await mkdtemp(path.join(tmpdir(),'ned-mode-tools-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const project=path.join(root,'project');await mkdir(project);
  const policy=new PermissionPolicy(path.join(root,'data'));await policy.set('full');let prompts=0;
  let release!:()=>void, entered!:()=>void;
  const waiting=new Promise<void>(r=>entered=r),resume=new Promise<void>(r=>release=r);
  const host=new HostTools(path.join(root,'data'),root,{project:async()=>project,permissionSignal:()=>policy.signal,
    approve:(m,d,s)=>policy.decide('effect',s,true,async()=>{prompts++;return false}),
    approveEdit:(m,d,s)=>policy.decide<EditDecision>('edit',s,{approved:true,autoApproveRequest:false},async()=>{prompts++;return{approved:false,autoApproveRequest:false}}),
    validateEdit:async(_s,_p,proposal)=>{if(proposal.path==='delayed.txt'){entered();await resume}},knowledge:()=>undefined,redactor:new Redactor()});
  t.after(()=>host.close());
  await host.call('propose_edit',{path:'one.txt',content:'allowed'},'s');
  assert.equal(await readFile(path.join(project,'one.txt'),'utf8'),'allowed');assert.equal(prompts,0);
  await assert.rejects(host.call('propose_edit',{path:'../outside.txt',content:'blocked'},'s'));
  await assert.rejects(host.call('propose_edit',{path:'.zed/settings.json',content:'{}'},'s'));
  const delayed=host.call('propose_edit',{path:'delayed.txt',content:'blocked'},'s');await waiting;
  await policy.set('ask');release();await assert.rejects(delayed);
  await assert.rejects(readFile(path.join(project,'delayed.txt')));
  await assert.rejects(host.call('propose_edit',{path:'denied.txt',content:'blocked'},'s'));assert.equal(prompts,1);
  let dialogSignal:AbortSignal|undefined;
  const pending=policy.decide('effect',undefined,true,async signal=>{dialogSignal=signal;await new Promise<void>(resolve=>signal.addEventListener('abort',()=>resolve(),{once:true}));return true;});
  const rejected = assert.rejects(pending);
  await policy.set('full');assert.equal(dialogSignal?.aborted,true);await rejected;
});
