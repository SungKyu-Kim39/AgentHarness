import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,cp,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {seedBundledSkills,preparedSkillFiles} from '../src/main/skill-seed';
const sha=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex');
async function fixture(t:any){
 const root=await mkdtemp(path.join(tmpdir(),'ned-seed-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const bundle=path.join(root,'skills');await mkdir(bundle);await cp('vendor/skills/cpp-testing',path.join(bundle,'cpp-testing'),{recursive:true});
 const manifest=JSON.parse(await readFile('vendor/skills/manifest.json','utf8'));manifest.skills=manifest.skills.filter((s:any)=>s.id==='cpp-testing');
 const save=async()=>{const bytes=JSON.stringify(manifest);await writeFile(path.join(bundle,'manifest.json'),bytes);await writeFile(path.join(root,'skills-lock.json'),JSON.stringify({schemaVersion:1,count:1,manifestSha256:sha(bytes)}));};await save();
 const workspace=path.join(root,'openviking/data'),state=path.join(root,'openviking/bundled-skills.json');
 const run=()=>seedBundledSkills(bundle,workspace,state,()=>{},new AbortController().signal);
 return {root,bundle,manifest,workspace,state,run,save,installed:path.join(workspace,'viking/ned/agent/skills/ned-cpp-testing')};
}
test('prepared skills work without model/HTTP registration, restart reuses and changed files update with backup',async t=>{
 const {bundle,manifest,run,save,installed}=await fixture(t);
 let result=await run();assert.equal(result.status,'ready');assert.equal(result.installed,1);assert.equal(result.indexStatus,'not-indexed');
 assert.match(await readFile(path.join(installed,'.abstract.md'),'utf8'),/ned-cpp-testing/);
 result=await run();assert.equal(result.reused,1);assert.equal(result.installed,0);
 const document=await readFile(path.join(bundle,'cpp-testing/SKILL.md'),'utf8')+'\nUpdated default.\n';await writeFile(path.join(bundle,'cpp-testing/SKILL.md'),document);manifest.skills[0].files.find((f:any)=>f.path==='SKILL.md').sha256=sha(document);await save();
 result=await run();assert.equal(result.updated,1);assert.equal(result.status,'ready');
 await writeFile(path.join(installed,'SKILL.md'),'USER EDIT');result=await run();assert.deepEqual(result.conflicts,['cpp-testing']);assert.equal(await readFile(path.join(installed,'SKILL.md'),'utf8'),'USER EDIT');
});

test('legacy SDK frontmatter and user additions are retained, interrupted replacement restores the recorded original',async t=>{
 const f=await fixture(t);await f.run();
 const before=await readFile(path.join(f.installed,'SKILL.md'),'utf8');
 await writeFile(path.join(f.installed,'SKILL.md'),before.replace('name: ned-cpp-testing',"name: 'ned-cpp-testing'"));
 await rm(f.state.replace(/\.json$/,'-seed.json'));let result=await f.run();assert.equal(result.reused,1);
 await writeFile(path.join(f.installed,'MY-NOTES.md'),'User notes');
 const update=await readFile(path.join(f.bundle,'cpp-testing/SKILL.md'),'utf8')+'\nPackage update\n';await writeFile(path.join(f.bundle,'cpp-testing/SKILL.md'),update);f.manifest.skills[0].files.find((x:any)=>x.path==='SKILL.md').sha256=sha(update);await f.save();
 result=await f.run();assert.deepEqual(result.conflicts,['cpp-testing']);assert.equal(await readFile(path.join(f.installed,'MY-NOTES.md'),'utf8'),'User notes');
 const {rename}=await import('node:fs/promises');const {randomUUID}=await import('node:crypto');
 const backup=randomUUID(),stage='.ned-stage-'+randomUUID(),root=path.dirname(f.installed),backups=path.resolve(f.workspace,'..','skill-backups');await mkdir(backups,{recursive:true});
 await rename(f.installed,path.join(backups,backup));await mkdir(path.join(root,stage));await writeFile(path.join(root,stage,'partial'),'incomplete');
 await writeFile(path.join(root,'.ned-update-cpp-testing.json'),JSON.stringify({backup,stage}));
 result=await f.run();assert.deepEqual(result.conflicts,['cpp-testing']);assert.equal(await readFile(path.join(f.installed,'MY-NOTES.md'),'utf8'),'User notes');
});
test('packaged seed is used only when it matches the source bundle, and tampering preserves installed user data',async t=>{
 const f=await fixture(t);const {loadBundledSkillPackages}=await import('../src/main/openviking-skills');const packages=await loadBundledSkillPackages(f.bundle);
 const seed=path.join(f.root,'skill-seed');await mkdir(seed);
 for(const pkg of packages)for(const [name,bytes]of preparedSkillFiles(pkg)){const file=path.join(seed,pkg.name,name);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,bytes);}
 await writeFile(path.join(seed,'manifest.json'),JSON.stringify({schemaVersion:1,openViking:'0.5.5',count:1,sourceManifestSha256:sha(await readFile(path.join(f.bundle,'manifest.json')))}));
 assert.equal((await f.run()).installed,1);await writeFile(path.join(seed,packages[0].name,'SKILL.md'),'DAMAGED');
 const original=await readFile(path.join(f.installed,'SKILL.md'),'utf8');const result=await f.run();assert.deepEqual(result.failed,['cpp-testing']);assert.equal(await readFile(path.join(f.installed,'SKILL.md'),'utf8'),original);
});
test('user-edited YAML metadata is a protected conflict even when the document body is unchanged',async t=>{
 const f=await fixture(t);await f.run();const file=path.join(f.installed,'SKILL.md');const before=await readFile(file,'utf8');await writeFile(file,before.replace('name: ned-cpp-testing','name: ned-cpp-testing\nmetadata:\n  user_note: keep'));
 await rm(f.state.replace(/\.json$/,'-seed.json'));const state=await f.run();assert.deepEqual(state.conflicts,['cpp-testing']);assert.match(await readFile(file,'utf8'),/user_note: keep/);
});
for(const edited of [false,true])test(`a migrated pristine legacy package is replaced from verified hashes; later edits remain protected (${edited})`,async t=>{
 const {rename}=await import('node:fs/promises');const f=await fixture(t);await f.run();
 const file=path.join(f.installed,'SKILL.md');await writeFile(file,(await readFile(file,'utf8')).replace('name: ned-cpp-testing','name: l-vibe-cpp-testing'));
 await rename(path.join(f.installed,'NED-BUNDLE.json'),path.join(f.installed,'L-VIBE-BUNDLE.json'));
 const record=JSON.parse(await readFile(f.state.replace(/\.json$/,'-seed.json'),'utf8'));const names=Object.keys(record.entries['cpp-testing'].files).map(name=>name==='NED-BUNDLE.json'?'L-VIBE-BUNDLE.json':name);const verifiedFiles=Object.fromEntries(await Promise.all(names.map(async name=>[name,sha(await readFile(path.join(f.installed,name)))])));
 await rm(f.state.replace(/\.json$/,'-seed.json'));await writeFile(f.state,JSON.stringify({schemaVersion:1,entries:{'cpp-testing':{bundleHash:'previous-package-hash',revision:'verified-by-sdk-migration',verifiedFiles}}}));
 if(edited)await writeFile(file,(await readFile(file,'utf8'))+'\nUSER EDIT');const state=await f.run();
 if(edited){assert.deepEqual(state.conflicts,['cpp-testing']);assert.match(await readFile(file,'utf8'),/USER EDIT/);}else{assert.equal(state.updated,1);assert.equal(state.status,'ready');assert.ok((await readFile(path.join(f.installed,'NED-BUNDLE.json'))).length>0);}
});
