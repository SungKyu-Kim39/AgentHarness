import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,readFile,rm,stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { editorExitDetail,recordEditorExit,editorLogMarkers,editorExitPresentation } from '../distribution/ned/editor-startup';
import { prepareEditor } from '../distribution/ned/profile';
test('editor diagnostics classify native loader and graphics failures without recording raw output',async t=>{
  const root=await mkdtemp(path.join(tmpdir(),'ned-editor-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const started=Date.now();await mkdir(path.join(root,'editor/logs'),{recursive:true});
  await writeFile(path.join(root,'editor/logs/Zed.log'),'secret-fixture: failed to initialize DirectX');
  assert.equal(editorExitDetail(-1073741515,null,'secret-fixture').loader,'missing_dll');
  const result=await recordEditorExit(root,'/not-used',path.join(root,'editor'),{},started,1,null,'another-secret');
  assert.deepEqual(result.markers,['graphics']);const saved=await readFile(path.join(root,'editor-startup-status.json'),'utf8');assert.ok(!saved.includes('secret'));
  assert.equal(await editorLogMarkers(path.join(root,'editor'),Date.now()+10000),'');
});
test('editor creates every private profile directory and retains no arbitrary parent model keys',async t=>{
  const root=await mkdtemp(path.join(tmpdir(),'ned-profile-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const original=process.env.NED_TEST_SECRET;process.env.NED_TEST_SECRET='fixture';
  try{const profile=await prepareEditor(root,'/Ned.exe','/resources','/descriptor','http://127.0.0.1:9');assert.equal((profile.env as NodeJS.ProcessEnv).NED_TEST_SECRET,undefined);
    for(const name of ['home','roaming','local','tmp','cache','state','config-home','data'])assert.equal((await stat(path.join(profile.data,name))).isDirectory(),true);
  }finally{if(original===undefined)delete process.env.NED_TEST_SECRET;else process.env.NED_TEST_SECRET=original;}
});

test('missing editor files fail before starting model services and record a safe installation code',async t=>{
 const {checkEditorFiles}=await import('../distribution/ned/editor-startup');
 const root=await mkdtemp(path.join(tmpdir(),'ned-missing-editor-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await assert.rejects(checkEditorFiles(root,path.join(root,'empty')),/EDITOR_BUNDLE_MISSING/);
 const state=JSON.parse(await readFile(path.join(root,'editor-startup-status.json'),'utf8'));assert.equal(state.code,'EDITOR_BUNDLE_MISSING');assert.ok(state.missing.length>0);
});

test('panic headers expose only pinned upstream source locations; arbitrary paths and payloads never enter diagnostics',()=>{
 const details=editorExitDetail(101,null,"thread 'main' panicked at C:\\build\\private\\crates\\paths\\src\\paths.rs:204:18:\nfailed to determine LocalAppData directory USER_SECRET");
 assert.ok(details.markers.includes('local_app_data'));assert.deepEqual(details.panicLocations,[{source:'crates/paths/src/paths.rs',line:204,column:18}]);assert.ok(!JSON.stringify(details).includes('USER_SECRET'));assert.ok(!JSON.stringify(details).includes('private'));
 const other=editorExitDetail(101,null,"thread 'main' panicked at C:\\USER_SECRET\\custom.rs:12:4:\nUSER_SECRET");assert.ok(other.panicLocations[0].sourceHash);assert.equal(other.panicLocations[0].source,undefined);assert.ok(!JSON.stringify(other).includes('USER_SECRET'));
});

test('Windows Known Folder relative AppData layout exists inside the private USERPROFILE',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-knownfolders-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const {env}=await prepareEditor(root,'/Ned.exe','/resources','/descriptor','http://127.0.0.1:9');
 assert.equal(env.APPDATA,path.join(env.USERPROFILE!,'AppData','Roaming'));
 assert.equal(env.LOCALAPPDATA,path.join(env.USERPROFILE!,'AppData','Local'));
 for(const folder of ['Local','Roaming','LocalLow'])assert.equal((await stat(path.join(env.USERPROFILE!,'AppData',folder))).isDirectory(),true);
 assert.equal(editorExitDetail(-1073741819,null,'').nativeFailure,'access_violation');
});
test('late Windows callback failure is classified without inventing a GPU or input-method cause',()=>{
 const detail=editorExitDetail(3221226525,null,'');
 assert.equal(detail.exitHex,'0xc000041d');assert.equal(detail.nativeFailure,'fatal_user_callback_exception');
 assert.equal(detail.loader,undefined);assert.deepEqual(detail.markers,[]);assert.deepEqual(detail.panicLocations,[]);
 assert.equal(editorExitDetail(-1073740771,null,'').nativeFailure,'fatal_user_callback_exception');
 const view=editorExitPresentation(1027558,3221226525);
 assert.equal(view.title,'Ned 편집기 종료 진단');assert.match(view.message,/원인을 단정할 수 없/);
 assert.equal(editorExitPresentation(405,101).title,'Ned 편집기 시작 진단');
});
