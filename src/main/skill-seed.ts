import { createHash, randomUUID } from 'node:crypto';
import { readFile, mkdir, lstat, readdir, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { atomicJSON } from './config';
import { loadBundledSkillPackages, type SkillRegistration } from './openviking-skills';
import { previousSkillOwner } from './openviking-namespace';

type SeedPackage = Awaited<ReturnType<typeof loadBundledSkillPackages>>[number];
function sameSkillDocument(text:string, pkg:SeedPackage) {
  const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if(!match||match[2].trim()!==pkg.body.trim())return false;
  const doc=parseDocument(match[1],{uniqueKeys:true});
  if(doc.errors.length||doc.warnings.length)return false;
  const meta=doc.toJS({maxAliasCount:0});
  return meta&&Object.keys(meta).length===2&&meta.name===pkg.name&&meta.description===pkg.description;
}
export function preparedSkillFiles(pkg:SeedPackage){
  const files=new Map(pkg.files);
  files.set('.source.json',Buffer.from(JSON.stringify({type:'ned-bundle',source:'offline-bundle',ned_owner:'bundled-skills',ned_bundle_sha256:pkg.hash,ned_id:pkg.id,upstream_source:pkg.source,upstream_commit:pkg.commit},null,2)+'\n'));
  files.set('.abstract.md',Buffer.from('name: '+pkg.name+'\ndescription: '+JSON.stringify(pkg.description)+'\n'));
  files.set('.overview.md',Buffer.from(pkg.body+'\n'));return files;
}
async function untrackedFiles(folder:string, expected:Set<string>, prefix=''):Promise<boolean>{
  for(const entry of await readdir(folder,{withFileTypes:true})){
    if(entry.isSymbolicLink())return true;const rel=prefix?prefix+'/'+entry.name:entry.name;
    if(['.source.json','.abstract.md','.overview.md','.meta.json'].includes(entry.name))continue;
    if(entry.isDirectory()){if(await untrackedFiles(path.join(folder,entry.name),expected,rel))return true;}else if(!expected.has(rel))return true;
  }return false;
}
const hash = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
async function regular(file: string) {
  const info = await lstat(file).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return undefined; throw e; });
  if (info && (!info.isFile() || info.isSymbolicLink() || info.size > 8 * 1024 * 1024)) throw Error('기본 스킬 저장 경로 오류');
  return info ? readFile(file) : undefined;
}
async function directory(folder: string) {
  const info = await lstat(folder).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return undefined; throw e; });
  if (info && (!info.isDirectory() || info.isSymbolicLink())) throw Error('기본 스킬 저장 경로 오류');
  if (!info) await mkdir(folder, { mode: 0o700 });
}
async function hashes(folder: string, names: string[]) {
  const result: Record<string,string> = {};
  for (const name of names) {
    if (!name || path.isAbsolute(name) || /[\\:\x00-\x1f]/.test(name) || name.split('/').some(part=>!part||part==='.'||part==='..')) throw Error('기본 스킬 기록 경로 오류');
    let parent = folder;
    for (const part of name.split('/').slice(0,-1)) { parent = path.join(parent,part); const s=await lstat(parent); if(!s.isDirectory()||s.isSymbolicLink())throw Error('기본 스킬 저장 경로 오류'); }
    const bytes = await regular(path.join(folder,name)); if (!bytes) return undefined;
    result[name] = hash(bytes);
  }
  return result;
}
/** Only while OpenViking is stopped. No model/API calls, vectors, user config or private knowledge. */
export async function seedBundledSkills(bundle: string, workspace: string, stateFile: string, progress: (state: SkillRegistration) => void, signal: AbortSignal) {
  const packages = await loadBundledSkillPackages(bundle);
  const preparedRoot = path.join(path.dirname(bundle), 'skill-seed');
  const preparedManifest = await regular(path.join(preparedRoot, 'manifest.json'));
  if (preparedManifest) {
    const manifest = JSON.parse(preparedManifest.toString());
    if (manifest.schemaVersion !== 1 || manifest.openViking !== '0.5.5' || manifest.count !== packages.length || manifest.sourceManifestSha256 !== hash(await readFile(path.join(bundle, 'manifest.json')))) throw Error('설치된 기본 스킬 준비 묶음이 일치하지 않습니다.');
  }
  const recordFile = stateFile.replace(/\.json$/, '-seed.json');
  const bytes = await regular(recordFile);
  const saved = bytes ? JSON.parse(bytes.toString()) : { schemaVersion: 1, entries: {} };
  if (saved.schemaVersion !== 1 || !saved.entries || Array.isArray(saved.entries) || typeof saved.entries !== 'object') throw Error('기본 스킬 준비 기록 오류. 기존 기록을 보존했습니다.');
  for(const value of Object.values(saved.entries) as any[])if(!value||!/^[a-f0-9]{64}$/.test(value.bundleHash)||!value.files||Array.isArray(value.files)||typeof value.files!=='object'||Object.values(value.files).some(v=>typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v)))throw Error('기본 스킬 준비 기록 오류. 기존 기록을 보존했습니다.');
  // Preserve the previous successful count while distinguishing this run's checks.
  const previousBytes=await regular(stateFile);const previous=previousBytes?JSON.parse(previousBytes.toString()):undefined;
  const confirmed=new Set(packages.filter(p=>saved.entries[p.id]?.bundleHash===p.hash).map(p=>p.id));
  const state: SkillRegistration = { previousRegistered: Object.keys(previous?.entries??saved.entries).filter(id=>packages.some(p=>p.id===id)).length, status:'registering', registered:confirmed.size, total:packages.length, conflicts:[], failed:[], errors:[], checked:0, reused:0, installed:0, updated:0, indexStatus:'not-indexed' };
  if(state.previousRegistered)state.indexStatus='unverified';
  let root = workspace;
  await mkdir(path.dirname(root),{recursive:true,mode:0o700});
  await directory(path.dirname(root));
  for (const part of ['', 'viking', 'ned', 'agent', 'skills']) { root=part?path.join(root,part):root; await directory(root); }
  for (const pkg of packages) {
    signal.throwIfAborted(); state.current={id:pkg.id,stage:'local-verify'}; state.message=`이전 확인 ${state.previousRegistered}개 · 이번 로컬 확인 ${state.checked}/${state.total}`; progress(structuredClone(state));
    const target=path.join(root,pkg.name); let stage: string | undefined;
    try {
      const files=preparedSkillFiles(pkg);
      if (preparedManifest) {
        const actual = await hashes(preparedRoot, [...files.keys()].map(name => pkg.name+'/'+name));
        if (!actual || [...files].some(([name, bytes]) => actual[pkg.name+'/'+name] !== hash(bytes))) throw Error('기본 스킬 준비 파일 무결성 오류');
        for (const name of files.keys()) files.set(name, (await regular(path.join(preparedRoot,pkg.name,name)))!);
      }
      // An interrupted replacement restores the old package before retrying. The
      // journal contains only app-generated basenames, never arbitrary paths.
      const journal = path.join(root,'.ned-update-'+pkg.id+'.json');
      const pending = await regular(journal);
      const backups = path.resolve(workspace,'..','skill-backups');
      if (pending) {
        const record = JSON.parse(pending.toString());
        if (!/^\.ned-stage-[a-f0-9-]{36}$/.test(record.stage) || !/^[a-f0-9-]{36}$/.test(record.backup)) throw Error('기본 스킬 복구 기록 오류');
        await directory(backups);
        if (!(await lstat(target).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return undefined;throw e;}))) await rename(path.join(backups,record.backup),target);
        await rm(path.join(root,record.stage),{recursive:true,force:true});
        await rm(journal);
      }
      const info=await lstat(target).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return undefined;throw e;});
      if(info && (!info.isDirectory()||info.isSymbolicLink()))throw Error('기본 스킬 저장 경로 오류');
      const sourceBytes=info?await regular(path.join(target,'.source.json')):undefined;
      const owner=sourceBytes?JSON.parse(sourceBytes.toString()):undefined;
      const owned=(owner?.ned_owner??owner?.[previousSkillOwner])==='bundled-skills';
      if(owned)files.set('.source.json',Buffer.from(JSON.stringify({...owner,...JSON.parse(files.get('.source.json')!.toString())},null,2)+'\n'));
      const actual=info?await hashes(target,[...pkg.files.keys()]):undefined;
      const original=Object.fromEntries([...pkg.files].map(([name,b])=>[name,hash(b)]));
      const existingDocument=info?(await regular(path.join(target,'SKILL.md')))?.toString():undefined;
      const same=actual && existingDocument && sameSkillDocument(existingDocument,pkg) && Object.keys(original).filter(name=>name!=='SKILL.md').every(name=>actual[name]===original[name]);
      if(info && !owned) { state.conflicts.push(pkg.id); continue; }
      if(info && same) { state.reused!++; }
      else {
        if(info) {
          const previous=saved.entries[pkg.id];
          const before=previous?.files?await hashes(target,Object.keys(previous.files)):undefined;
          if(!previous?.files || !before || !Object.entries(previous.files).every(([name,value])=>before[name]===value)) { state.conflicts.push(pkg.id); continue; }
          const extras=await untrackedFiles(target,new Set(Object.keys(previous.files)));if(extras){state.conflicts.push(pkg.id);continue;}
        }
        stage=path.join(root,'.ned-stage-'+randomUUID()); await mkdir(stage,{mode:0o700});
        for(const [name,b]of files){await mkdir(path.dirname(path.join(stage,name)),{recursive:true,mode:0o700});await writeFile(path.join(stage,name),b,{flag:'wx',mode:0o600});}
        signal.throwIfAborted();
        if(info) {
          const backup=path.join(backups,randomUUID());await directory(backups);
          await atomicJSON(journal,{stage:path.basename(stage),backup:path.basename(backup)});
          await rename(target,backup);
          try{await rename(stage,target);}catch(e){await rename(backup,target);throw e;}
          await rm(journal);
          state.updated!++;
        }else{await rename(stage,target);state.installed!++;}
        stage=undefined;
      }
      if(info&&same)await atomicJSON(path.join(target,'.source.json'),JSON.parse(files.get('.source.json')!.toString()));
      saved.entries[pkg.id]={bundleHash:pkg.hash,files:same?actual:original};
      await atomicJSON(recordFile,saved); if(!confirmed.has(pkg.id))state.registered++;
    }catch{state.failed.push(pkg.id);state.errors!.push({id:pkg.id,stage:'local-verify',code:'OV_SKILL_LOCAL'});}
    finally{if((state.failed.includes(pkg.id)||state.conflicts.includes(pkg.id))&&confirmed.has(pkg.id))state.registered--;if(stage)await rm(stage,{recursive:true,force:true});state.checked!++;progress(structuredClone(state));}
  }
  state.current=undefined;state.status=state.failed.length||state.conflicts.length?'error':'ready';
  state.message=`기본 스킬 ${state.registered}/${state.total}개 로컬 준비 · 재사용 ${state.reused} · 신규 ${state.installed} · 갱신 ${state.updated}. 검색 색인 상태와 별개이며 대화는 바로 사용할 수 있습니다.`;
  if(state.conflicts.length)state.message+='\n원본 보존 충돌: '+state.conflicts.join(', ');
  if(state.failed.length)state.message+='\n확인 실패: '+state.failed.join(', ');
  progress(structuredClone(state));return state;
}
