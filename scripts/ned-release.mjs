// Reuse audited fixed runtimes, rebuild all Ned-authored executable JS from current source.
import { readFile,writeFile,mkdir,rm,cp,access,readdir } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createPackage } from '@electron/asar';
import { fileHash,verifyManifest } from './installer-audit.mjs';
import { verifyBundledHost } from './ned-host-smoke.mjs';
import { updateReleaseLauncher, updateReleaseMcpNodeWorker, updateReleaseSupervisor } from './release-supervisor.mjs';
import { isReleaseVersion, isGhidraVersion, isModernVersion } from './release-policy.mjs';

const json=async file=>JSON.parse(await readFile(file,'utf8'));
const exists=file=>access(file).then(()=>true,()=>false);
async function ghidraInputs(root){return Object.fromEntries(await Promise.all(['ghidra-runtime-lock.json','scripts/bundle-ghidra.py','scripts/CompileGhidraGuard.java','distribution/NedOfflineNetworkGuard.java'].map(async file=>[file,await fileHash(path.join(root,file))])));}
export async function prepareRelease(root,cache,staged,version,seven,record=false) {
 if(!isReleaseVersion(version))throw Error('Review a new runtime baseline before the next release');
 const {url: _download, components, ...base}=await json(path.join(root,'scripts/ned-bootstrap-lock.json'));
 const lockFile=path.join(root,'release-runtime-lock.json');
 if(!record){
  const lock=await json(lockFile),proof=await json(path.join(staged,'resources/ned/runtime-optimization.json'));
  if(lock.version!==version||lock.baseline.sha256!==base.sha256||lock.optimizerSha256!==await fileHash(path.join(root,'scripts/optimize-runtime.py'))||lock.reportSha256!==await fileHash(path.join(staged,'resources/ned/runtime-optimization.json')))throw Error('Stale prepared runtime; run release-prepare and review its lock first');
  if(isGhidraVersion(version)&&lock.supervisorSha256!==await fileHash(path.join(root,'scripts/sidecar-supervisor.py')))throw Error('Stale process supervisor; rebuild and review its runtime manifest');
  if(isGhidraVersion(version)&&lock.launcherSha256&&lock.launcherSha256!==await fileHash(path.join(root,'scripts/openviking-launch.py')))throw Error('Stale OpenViking launcher; rebuild and review its runtime manifest');
  if(isGhidraVersion(version)&&lock.mcpNodeWorkerSha256&&lock.mcpNodeWorkerSha256!==await fileHash(path.join(root,'scripts/mcp-node-worker.cjs')))throw Error('Stale MCP node worker; rebuild and review its runtime manifest');
  if(isGhidraVersion(version)&&JSON.stringify(lock.ghidraInputs)!==JSON.stringify(await ghidraInputs(root)))throw Error('Stale Ghidra inputs; rebuild and review its runtime manifest');
  for(const [name,item]of Object.entries(lock.components))await verifyManifest(path.join(staged,'resources/runtime/windows-x64',name),item.manifestSha256,name==='mcp');
  return {lock,proof};
 }
 const installer=path.join(cache,'bootstrap','installer.exe');
 if(await fileHash(installer)!==base.sha256)throw Error('Baseline installer hash mismatch; run python3 scripts/release-inputs.py');
 await rm(staged,{recursive:true,force:true});await mkdir(staged,{recursive:true});
 execFileSync(seven,['x','-y','-o'+staged,installer],{stdio:'ignore'});
 await rm(path.join(staged,'$PLUGINSDIR'),{recursive:true,force:true});await rm(path.join(staged,'Uninstall Ned.exe'),{force:true});
 for(const name of ['openviking','mcp','rea','agent-desktop'])await verifyManifest(path.join(staged,'resources/runtime/windows-x64',name),components[name],name==='mcp');
 execFileSync('python3',[path.join(root,'scripts/upgrade-openviking.py'),'apply',path.join(staged,'resources/runtime/windows-x64/openviking')],{cwd:root,stdio:'inherit'});
 const sources=path.join(cache,'handover-sources');await rm(sources,{recursive:true,force:true});await mkdir(sources,{recursive:true});
 const report=execFileSync('python3',[path.join(root,'scripts/optimize-runtime.py'),path.join(staged,'resources'),sources],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
 const proof=JSON.parse(report);
 if(isGhidraVersion(version)){
  execFileSync('python3',[path.join(root,'scripts/bundle-ghidra.py'),path.join(staged,'resources/runtime/windows-x64/ghidra')],{cwd:root,stdio:'inherit'});
  const ghidraManifest=path.join(staged,'resources/runtime/windows-x64/ghidra/manifest.json');
  proof.components.ghidra={originalManifestSha256:await fileHash(ghidraManifest),manifestSha256:await fileHash(ghidraManifest),files:(await json(ghidraManifest)).files.length};
 }
 const supervisorSha256=isGhidraVersion(version)?await updateReleaseSupervisor(root,staged,proof):undefined;
 const launcherSha256=isGhidraVersion(version)?await updateReleaseLauncher(root,staged,proof):undefined;
 const mcpNodeWorkerSha256=isGhidraVersion(version)?await updateReleaseMcpNodeWorker(root,staged,proof):undefined;
 const lock={schemaVersion:1,version,supervisorSha256,launcherSha256,mcpNodeWorkerSha256,baseline:base,optimizerSha256:await fileHash(path.join(root,'scripts/optimize-runtime.py')),reportSha256:await fileHash(path.join(staged,'resources/ned/runtime-optimization.json')),components:proof.components,ghidraInputs:await ghidraInputs(root)};
 await writeFile(lockFile,JSON.stringify(lock,null,2)+'\n');
 console.log(`Runtime prepared: ${proof.payloadFilesAvoided} file writes and ${proof.installedBytesAvoided} installed bytes avoided.`);
 return {lock,proof};
}

export async function refreshReleaseHost(root,cache,staged,version,sourceCommit) {
 const changes=execFileSync('git',['diff','HEAD','--name-only','--','src','distribution','scripts','package.json','package-lock.json','skills-lock.json','reviewed-skills-lock.json','release-runtime-lock.json','python-runtime-lock.json','openviking-upgrade-lock.json','ghidra-runtime-lock.json','egm-lock.json','studio-assets-lock.json','vendor/skills'],{cwd:root,encoding:'utf8'}).trim();
 if(changes)throw Error('Commit reviewed executable and bundle inputs before release build: '+changes);
 execFileSync(process.execPath,[path.join(root,'scripts/prepare-acp.mjs')],{cwd:root,stdio:'inherit'});
 execFileSync(process.execPath,[path.join(root,'scripts/ned-build.mjs')],{cwd:root,stdio:'inherit'});
 const app=path.join(cache,'release-asar');await rm(app,{recursive:true,force:true});await mkdir(app,{recursive:true});
 for(const name of ['main.cjs','studio-preload.cjs','package.json'])await cp(path.join(cache,'app',name),path.join(app,name));
 const smoke=verifyBundledHost(await readFile(path.join(app,'main.cjs')));
 // Fully bundled host needs only Electron/builtins: do not copy unused React/CLI development dependencies into ASAR.
 await createPackage(app,path.join(staged,'resources/app.asar'));
 const resources=path.join(staged,'resources/ned');
 await cp(path.join(cache,'app/agent.cjs'),path.join(resources,'agent.cjs'));
 await cp(path.join(cache,'app/ACP-THIRD-PARTY-NOTICES.txt'),path.join(resources,'licenses/ACP-THIRD-PARTY-NOTICES.txt'));
 await rm(path.join(resources,'skills'),{recursive:true,force:true});await cp(path.join(root,'vendor/skills'),path.join(resources,'skills'),{recursive:true});
 await rm(path.join(resources,'skill-seed'),{recursive:true,force:true});
 await rm(path.join(resources,'personal-pack-recovery.py'),{force:true});
 for(const [from,to]of [['scripts/sidecar-supervisor.py','python-supervisor.py'],['distribution/python-runner.py','python-runner.py'],['docs/python-conda.md','python-conda.md'],['distribution/rea-ghidra-worker.mjs','rea-ghidra-worker.mjs'],['skills-lock.json','skills-lock.json'],['agent-config.example.json','agent-config.example.json'],['docs/offline-setup.md','GETTING_STARTED.md'],['docs/bundled-skills.md','SKILLS_GUIDE.md'],['docs/license-policy.md','LICENSE_POLICY.md'],['THIRD_PARTY_NOTICES.md','licenses/THIRD_PARTY_NOTICES.md'],['docs/git-and-binary-analysis.md','git-and-binary-analysis.md'],['docs/extension-guide.md','extension-guide.md'],['docs/openviking-studio.md','openviking-studio.md'],['docs/compaction-troubleshooting.md','compaction-troubleshooting.md'],['docs/openviking-personal-migration.md','openviking-personal-migration.md']])await cp(path.join(root,from),path.join(resources,to));
 const astryxFile=path.join(root,'astryx-offline-lock.json');
 if(await exists(astryxFile)){
  const astryx=await json(astryxFile),archive=path.join(root,'downloads/astryx',astryx.archive.name);
  if(await fileHash(archive)!==astryx.archive.sha256)throw Error('Astryx offline kit hash mismatch');
  for(const input of astryx.starterInputs)if(await fileHash(path.join(root,input.path))!==input.sha256)throw Error('Stale Astryx kit input');
  await mkdir(path.join(resources,'astryx'),{recursive:true});
  await cp(archive,path.join(resources,'astryx',astryx.archive.name));
  await cp(astryxFile,path.join(resources,'astryx/astryx-offline-lock.json'));
  for(const file of ['astryx.md','zed-native-agent.md','subagents.md',...(isModernVersion(version)?['egm.md','zed-history-import.md','changes-'+version+'.md','validation-'+version+'.md']:[])])await cp(path.join(root,'docs',file),path.join(resources,file));
 }
 if(isModernVersion(version))for(const file of await readdir(path.join(root,'docs')))if(file.endsWith('.md'))await cp(path.join(root,'docs',file),path.join(resources,file));
 if(isModernVersion(version))await cp(path.join(root,'node_modules/yaml/LICENSE'),path.join(resources,'licenses/yaml-ISC.txt'));
 if(isModernVersion(version))for(const file of ['egm-lock.json','studio-assets-lock.json'])await cp(path.join(root,file),path.join(resources,'locks',file));
 await cp(path.join(root,'release-runtime-lock.json'),path.join(resources,'locks/release-runtime.json'));
 const info={schemaVersion:1,product:'Ned',version,buildRevision:process.env.NED_BUILD_REVISION||undefined,sourceCommit,baselineRuntime:(await json(path.join(root,'release-runtime-lock.json'))).baseline,hostBuiltFromSource:true,acpBuiltFromPinnedSource:true,upstreamAcpSourceLockSha256:await fileHash(path.join(root,'ned-acp-lock.json')),buildDependencyLockSha256:await fileHash(path.join(root,'scripts/acp-build/package-lock.json')),hostModuleSmoke:smoke,windowsAcceptance:false};
 await writeFile(path.join(resources,'build-info.json'),JSON.stringify(info,null,2)+'\n');
 return info;
}
