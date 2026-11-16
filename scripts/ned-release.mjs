// Reuse audited fixed runtimes, rebuild all Ned-authored executable JS from current source.
import { readFile,writeFile,mkdir,rm,cp,access } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createPackage } from '@electron/asar';
import { fileHash,verifyManifest } from './installer-audit.mjs';
import { verifyBundledHost } from './ned-host-smoke.mjs';
import { updateReleaseSupervisor } from './release-supervisor.mjs';

const base={name:'Ned-0.3.6-rebuild1-win-x64.exe',bytes:1176899012,sha256:'4ee7e8809c1a838e593c3654e99b1f37715fb625216290b7d89613463ea52252',sourceCommit:'5dab50279b91fdb0bb135793df699b57410c6e3d'};
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const exists=file=>access(file).then(()=>true,()=>false);
async function ghidraInputs(root){return Object.fromEntries(await Promise.all(['ghidra-runtime-lock.json','scripts/bundle-ghidra.py','scripts/CompileGhidraGuard.java','distribution/NedOfflineNetworkGuard.java'].map(async file=>[file,await fileHash(path.join(root,file))])));}
export async function prepareRelease(root,cache,staged,version,seven,record=false) {
 if(!['0.3.7','0.3.8'].includes(version))throw Error('Review a new runtime baseline before the next release');
 const baseline=await json(path.join(root,'downloads/Ned-0.3.6-rebuild1-installer-audit.json'));
 if(baseline.installer.sha256!==base.sha256||baseline.sourceCommit!==base.sourceCommit)throw Error('Wrong audited runtime baseline');
 const lockFile=path.join(root,'release-runtime-lock.json');
 if(!record){
  const lock=await json(lockFile),proof=await json(path.join(staged,'resources/ned/runtime-optimization.json'));
  if(lock.version!==version||lock.baseline.sha256!==base.sha256||lock.optimizerSha256!==await fileHash(path.join(root,'scripts/optimize-runtime.py'))||lock.reportSha256!==await fileHash(path.join(staged,'resources/ned/runtime-optimization.json')))throw Error('Stale prepared runtime; run release-prepare and review its lock first');
  if(version==='0.3.8'&&lock.supervisorSha256!==await fileHash(path.join(root,'scripts/sidecar-supervisor.py')))throw Error('Stale process supervisor; rebuild and review its runtime manifest');
  if(version==='0.3.8'&&JSON.stringify(lock.ghidraInputs)!==JSON.stringify(await ghidraInputs(root)))throw Error('Stale Ghidra inputs; rebuild and review its runtime manifest');
  for(const [name,item]of Object.entries(lock.components))await verifyManifest(path.join(staged,'resources/runtime/windows-x64',name),item.manifestSha256,name==='mcp');
  return {lock,proof};
 }
 const installer=await exists(path.join(root,'release/ned',base.name))?path.join(root,'release/ned',base.name):path.join(root,'downloads',base.name);
 if(await fileHash(installer)!==base.sha256)throw Error('Baseline installer hash mismatch; restore the exact LFS artifact');
 await rm(staged,{recursive:true,force:true});await mkdir(staged,{recursive:true});
 execFileSync(seven,['x','-y','-o'+staged,installer],{stdio:'ignore'});
 await rm(path.join(staged,'$PLUGINSDIR'),{recursive:true,force:true});await rm(path.join(staged,'Uninstall Ned.exe'),{force:true});
 for(const name of ['openviking','mcp','rea','agent-desktop'])await verifyManifest(path.join(staged,'resources/runtime/windows-x64',name),baseline.components[name].manifestSha256,name==='mcp');
 execFileSync('python3',[path.join(root,'scripts/upgrade-openviking.py'),'apply',path.join(staged,'resources/runtime/windows-x64/openviking')],{cwd:root,stdio:'inherit'});
 const sources=path.join(cache,'handover-sources');await rm(sources,{recursive:true,force:true});await mkdir(sources,{recursive:true});
 const report=execFileSync('python3',[path.join(root,'scripts/optimize-runtime.py'),path.join(staged,'resources'),sources],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
 const proof=JSON.parse(report);
 if(version==='0.3.8'){
  execFileSync('python3',[path.join(root,'scripts/bundle-ghidra.py'),path.join(staged,'resources/runtime/windows-x64/ghidra')],{cwd:root,stdio:'inherit'});
  const ghidraManifest=path.join(staged,'resources/runtime/windows-x64/ghidra/manifest.json');
  proof.components.ghidra={originalManifestSha256:await fileHash(ghidraManifest),manifestSha256:await fileHash(ghidraManifest),files:(await json(ghidraManifest)).files.length};
 }
 const supervisorSha256=version==='0.3.8'?await updateReleaseSupervisor(root,staged,proof):undefined;
 const lock={schemaVersion:1,version,supervisorSha256,baseline:base,optimizerSha256:await fileHash(path.join(root,'scripts/optimize-runtime.py')),reportSha256:await fileHash(path.join(staged,'resources/ned/runtime-optimization.json')),components:proof.components,ghidraInputs:await ghidraInputs(root)};
 await writeFile(lockFile,JSON.stringify(lock,null,2)+'\n');
 console.log(`Runtime prepared: ${proof.payloadFilesAvoided} file writes and ${proof.installedBytesAvoided} installed bytes avoided.`);
 return {lock,proof};
}

export async function refreshReleaseHost(root,cache,staged,version,sourceCommit) {
 const changes=execFileSync('git',['diff','HEAD','--name-only','--','src','distribution','scripts','package.json','package-lock.json','skills-lock.json','reviewed-skills-lock.json','release-runtime-lock.json','python-runtime-lock.json','openviking-upgrade-lock.json','ghidra-runtime-lock.json','vendor/skills'],{cwd:root,encoding:'utf8'}).trim();
 if(changes)throw Error('Commit reviewed executable and bundle inputs before release build: '+changes);
 execFileSync(process.execPath,[path.join(root,'scripts/prepare-acp.mjs')],{cwd:root,stdio:'inherit'});
 execFileSync(process.execPath,[path.join(root,'scripts/ned-build.mjs')],{cwd:root,stdio:'inherit'});
 const app=path.join(cache,'release-asar');await rm(app,{recursive:true,force:true});await mkdir(app,{recursive:true});
 for(const name of ['main.cjs','package.json'])await cp(path.join(cache,'app',name),path.join(app,name));
 const smoke=verifyBundledHost(await readFile(path.join(app,'main.cjs')));
 // Fully bundled host needs only Electron/builtins: do not copy unused React/CLI development dependencies into ASAR.
 await createPackage(app,path.join(staged,'resources/app.asar'));
 const resources=path.join(staged,'resources/ned');
 await cp(path.join(cache,'app/agent.cjs'),path.join(resources,'agent.cjs'));
 await cp(path.join(cache,'app/ACP-THIRD-PARTY-NOTICES.txt'),path.join(resources,'licenses/ACP-THIRD-PARTY-NOTICES.txt'));
 await rm(path.join(resources,'skills'),{recursive:true,force:true});await cp(path.join(root,'vendor/skills'),path.join(resources,'skills'),{recursive:true});
 for(const [from,to]of [['scripts/sidecar-supervisor.py','python-supervisor.py'],['distribution/python-runner.py','python-runner.py'],['docs/python-conda.md','python-conda.md'],['distribution/rea-ghidra-worker.mjs','rea-ghidra-worker.mjs'],['skills-lock.json','skills-lock.json'],['agent-config.example.json','agent-config.example.json'],['docs/offline-setup.md','GETTING_STARTED.md'],['docs/skills-0.3.7.md','SKILLS_GUIDE.md'],['docs/license-policy.md','LICENSE_POLICY.md'],['THIRD_PARTY_NOTICES.md','licenses/THIRD_PARTY_NOTICES.md'],['distribution/personal-pack-recovery.py','personal-pack-recovery.py'],['docs/git-and-binary-analysis.md','git-and-binary-analysis.md'],['docs/extension-guide.md','extension-guide.md'],['docs/openviking-studio.md','openviking-studio.md'],['docs/compaction-troubleshooting.md','compaction-troubleshooting.md'],['docs/openviking-personal-migration.md','openviking-personal-migration.md']])await cp(path.join(root,from),path.join(resources,to));
 const astryxFile=path.join(root,'astryx-offline-lock.json');
 if(await exists(astryxFile)){
  const astryx=await json(astryxFile),archive=path.join(root,'downloads/astryx',astryx.archive.name);
  if(await fileHash(archive)!==astryx.archive.sha256)throw Error('Astryx offline kit hash mismatch');
  for(const input of astryx.starterInputs)if(await fileHash(path.join(root,input.path))!==input.sha256)throw Error('Stale Astryx kit input');
  await mkdir(path.join(resources,'astryx'),{recursive:true});
  await cp(archive,path.join(resources,'astryx',astryx.archive.name));
  await cp(astryxFile,path.join(resources,'astryx/astryx-offline-lock.json'));
  for(const file of ['astryx.md','zed-native-agent.md'])await cp(path.join(root,'docs',file),path.join(resources,file));
 }
 await cp(path.join(root,'release-runtime-lock.json'),path.join(resources,'locks/release-runtime.json'));
 const info={schemaVersion:1,product:'Ned',version,buildRevision:process.env.NED_BUILD_REVISION||undefined,sourceCommit,baselineRuntime:base,hostBuiltFromSource:true,acpBuiltFromPinnedSource:true,upstreamAcpSourceLockSha256:await fileHash(path.join(root,'ned-acp-lock.json')),buildDependencyLockSha256:await fileHash(path.join(root,'scripts/acp-build/package-lock.json')),hostModuleSmoke:smoke,windowsAcceptance:false};
 await writeFile(path.join(resources,'build-info.json'),JSON.stringify(info,null,2)+'\n');
 return info;
}
