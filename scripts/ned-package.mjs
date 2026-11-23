import {editorVersion} from './ned-editor-version.mjs';
import { readFile, writeFile, mkdir, cp, rm, stat, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { getMakeNsisPath } from 'app-builder-lib/out/toolsets/windows.js';
import { getPath7za } from 'app-builder-lib/out/toolsets/7zip.js';
import { extractFile } from '@electron/asar';
import * as PE from 'pe-library';
import { Data, Resource } from 'resedit';
import { verifyAsciiTree, verifyAsciiTar } from './package-paths.mjs';
import { verifyManifest, fileHash, payloadInventory } from './installer-audit.mjs';
import { brandEditor, verifyEditorIcon } from './ned-editor-branding.mjs';
import { verifyBundledHost } from './ned-host-smoke.mjs';
import { prepareRelease, refreshReleaseHost } from './ned-release.mjs';
import {nedSigning} from './ned-signing.mjs';
import {installSourceEditor,verifySourceEditor} from './ned-source-editor.mjs';
const root = path.resolve(import.meta.dirname, '..');
const json = async p => JSON.parse(await readFile(p, 'utf8'));
const version = (await json(path.join(root,'package.json'))).version;
const revision=process.env.NED_BUILD_REVISION ?? '';
if(revision && revision!=='rebuild1')throw new Error('Unsupported build revision');
const artifactVersion=version+(revision?'-'+revision:'');
const vendorEditor = process.env.NED_VENDOR_EDITOR === '1';
const output = path.join(root,vendorEditor ? 'release/ned-vendor' : 'release/ned');
const cache = path.join(root,'.cache/ned');
process.env.ELECTRON_BUILDER_CACHE ??= path.join(cache,'builder-cache');
const staged = path.join(output,'win-unpacked');
const installer = path.join(output,`Ned-${artifactVersion}-win-x64.exe`);
const mode = process.argv[2];
const signing = nedSigning();
const fullRelease = ['0.3.7','0.3.8','0.3.9','0.3.10','0.3.11','0.3.12'].includes(version);
const ghidraRelease = ['0.3.8','0.3.9','0.3.10','0.3.11','0.3.12'].includes(version);
const modernRelease = ['0.3.9','0.3.10','0.3.11','0.3.12'].includes(version);
const sourceEditorRelease = (version==='0.3.8'&&revision==='rebuild1') || modernRelease;
if(['0.3.7','0.3.8','0.3.12'].includes(version) && !revision && ['release','package','bundle'].includes(mode))throw new Error('Published release artifacts are immutable; use NED_BUILD_REVISION=rebuild1 for the reviewed runtime update');
const verifierCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const buildCommit=process.env.NED_REBUILT_SOURCE_COMMIT ?? verifierCommit;
if(buildCommit!==verifierCommit && (!revision || !['audit','bundle'].includes(mode) || !/^[0-9a-f]{40}$/.test(buildCommit)))throw new Error('Source override is only for audited rebuild resumption');
const run = (command,args,options={}) => execFileSync(command,args,{cwd:root,stdio:'inherit',...options});
const exists = p => access(p).then(()=>true,()=>false);
function releaseDoc(file) { return path.join(root,'docs',file); }
async function prepareZed() {
  const lock = await json(path.join(root,'ned-runtime-lock.json'));
  for (const item of lock.artifacts) {
    const filename = path.join(cache,'archives',item.file);
    if (!await exists(filename)) {
      await mkdir(path.dirname(filename),{recursive:true});
      const response=await fetch(item.url);if(!response.ok) throw new Error('Build artifact download failed: '+item.file);
      const pieces=[];let count=0;
      for await(const chunk of response.body) {count+=chunk.length;if(count>item.bytes) throw new Error('Oversized build artifact');pieces.push(chunk);}
      const bytes=Buffer.concat(pieces);if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256) throw new Error('Downloaded artifact integrity mismatch');
      await writeFile(filename,bytes);
    }
    if ((await stat(filename)).size !== item.bytes || await fileHash(filename) !== item.sha256) throw new Error('Zed integrity mismatch: '+item.file);
  }
  for(const [file,directory,strip] of [['zed-source-v1.28.1.tar.gz','zed-source',true],['zed-linux-x86_64.tar.gz','zed-linux',false]]) {
    if(!await exists(path.join(cache,directory))) {await mkdir(path.join(cache,directory),{recursive:true});run('tar',['-xzf',path.join(cache,'archives',file),...(strip?['--strip-components=1']:[]),'-C',path.join(cache,directory)]);}
  }
  const destination=path.join(cache,'zed-extract');
  if (!await exists(path.join(destination,'code$GetInstallDir/Zed.exe'))) {
    const tool=process.env.NED_INNOEXTRACT ?? path.join(cache,'tools/innoextract-build/innoextract');
    run(tool,['--silent','--extract','--output-dir',destination,path.join(cache,'archives/Zed-x86_64.exe')],{
      env:{...process.env,LD_LIBRARY_PATH:path.join(cache,'tools/deps/usr/lib/x86_64-linux-gnu')},
    });
  }
  const payload=path.join(cache,'zed-payload');
  await rm(payload,{recursive:true,force:true});await cp(path.join(destination,'app'),payload,{recursive:true});
  await cp(path.join(destination,'code$GetInstallDir'),payload,{recursive:true});
  await rm(path.join(payload,'tools/auto_update_helper.exe'),{force:true});
  const editor = path.join(payload,'Zed.exe');
  if (vendorEditor) {
    if (process.platform !== 'win32') throw Error('Vendor signature verification requires a Windows release machine.');
    run('powershell.exe',['-NoProfile','-NonInteractive','-Command',
      'if ((Get-AuthenticodeSignature -LiteralPath $env:NED_VENDOR_ZED).Status -ne "Valid") { exit 1 }'],
      {env:{...process.env,NED_VENDOR_ZED:editor}});
    const hash = await fileHash(editor);
    await writeFile(path.join(cache,'editor-branding.json'),JSON.stringify({
      schemaVersion:1,component:'Zed v1.28.1 original editor',vendorOriginal:true,originalSha256:hash,modifiedSha256:hash,
      authenticode:'verified unchanged Windows vendor signature'
    },null,2)+'\n');
  } else {
    const branded=brandEditor(await readFile(editor),await readFile(path.join(root,'assets/ned-icon.ico')));
    await writeFile(editor,branded.bytes);
    await writeFile(path.join(cache,'editor-branding.json'),JSON.stringify(branded.record,null,2)+'\n');
  }
  await access(path.join(payload,'Zed.exe'));
  await verifyAsciiTree(payload);return payload;
}
async function stamp() {
  const filename=path.join(staged,'Ned.exe');
  const exe=PE.NtExecutable.from(await readFile(filename),{ignoreCert:true});
  const resources=PE.NtExecutableResource.from(exe);
  const icon=Data.IconFile.from(await readFile(path.join(root,'assets/ned-icon.ico')));
  const groups=Resource.IconGroupEntry.fromEntries(resources.entries);
  for (const group of groups) Resource.IconGroupEntry.replaceIconsForResource(resources.entries,group.id,group.lang,icon.icons.map(i=>i.data));
  const vi=Resource.VersionInfo.fromEntries(resources.entries)[0] ?? Resource.VersionInfo.createEmpty();
  vi.setFileVersion(...version.split('.').map(Number),0,1033);
  vi.setProductVersion(...version.split('.').map(Number),0,1033);
  vi.setStringValues({lang:1033,codepage:1200},{FileDescription:'Ned',ProductName:'Ned',InternalName:'Ned',OriginalFilename:'Ned.exe',ProductVersion:version});
  vi.outputToResourceEntries(resources.entries); resources.outputResource(exe);
  await writeFile(filename,Buffer.from(exe.generate()));
  const check=PE.NtExecutableResource.from(PE.NtExecutable.from(await readFile(filename)));
  if (Resource.IconGroupEntry.fromEntries(check.entries)[0]?.icons.length !== icon.icons.length) throw new Error('Ned executable icon missing');
}
async function packageApp(compileInstaller=true) {
  const zed=await prepareZed();
  run(process.execPath,['scripts/bundle-agent-desktop.mjs']);
  run(process.execPath,['scripts/ned-build.mjs']);
  await mkdir(output,{recursive:true});
  const config={
    appId:'com.lig.ned',productName:'Ned',electronVersion:(await json(path.join(root,'upstream-lock.json'))).electronVersion,
    directories:{app:path.join(cache,'app'),output},files:['main.cjs','studio-preload.cjs','package.json'],asar:true,npmRebuild:false,publish:null,
    win:{target:'dir',signAndEditExecutable:false,icon:path.join(root,'assets/ned-icon.ico')},
    extraResources:[
      {from:path.join(root,'vendor/runtime'),to:'runtime',filter:['windows-x64/openviking/**/*','windows-x64/rea/**/*','windows-x64/mcp/**/*','windows-x64/agent-desktop/**/*','windows-x64/ghidra/**/*']},
      {from:path.join(root,'vendor/skills'),to:'ned/skills',filter:['**/*','!doc-coauthoring{,/**/*}']},
      {from:path.join(root,'distribution/methodology'),to:'ned/methodology'},
      {from:path.join(root,'agent-config.example.json'),to:'ned/agent-config.example.json'},
      {from:path.join(root,'skills-lock.json'),to:'ned/skills-lock.json'},
      ...['egm-lock.json','studio-assets-lock.json'].map(file=>({from:path.join(root,file),to:'ned/locks/'+file})),
      ...['egm.md','zed-history-import.md','changes-'+version+'.md'].map(file=>({from:path.join(root,'docs',file),to:'ned/'+file})),
      {from:path.join(root,'distribution/rea-ghidra-worker.mjs'),to:'ned/rea-ghidra-worker.mjs'},
      {from:path.join(root,'scripts/sidecar-supervisor.py'),to:'ned/python-supervisor.py'},
      {from:path.join(root,'distribution/python-runner.py'),to:'ned/python-runner.py'},
      {from:path.join(root,'docs/python-conda.md'),to:'ned/python-conda.md'},
      {from:path.join(root,'docs/git-and-binary-analysis.md'),to:'ned/git-and-binary-analysis.md'},
      {from:path.join(root,'LICENSE'),to:'ned/licenses/Ned-MIT.txt'},
      {from:path.join(root,'node_modules/jsonc-parser/LICENSE.md'),to:'ned/licenses/jsonc-parser-MIT.txt'},
      {from:path.join(root,'node_modules/yaml/LICENSE'),to:'ned/licenses/yaml-ISC.txt'},
      {from:path.join(cache,'editor-branding.json'),to:'ned/editor-branding.json'},
      {from:path.join(root,'.cache/opencode/source/LICENSE'),to:'ned/licenses/OpenCode-MIT.txt'},
      {from:path.join(root,'THIRD_PARTY_NOTICES.md'),to:'ned/licenses/THIRD_PARTY_NOTICES.md'},
      {from:path.join(cache,'app/agent.cjs'),to:'ned/agent.cjs'},
      {from:path.join(cache,'app/ACP-THIRD-PARTY-NOTICES.txt'),to:'ned/licenses/ACP-THIRD-PARTY-NOTICES.txt'},
      {from:path.join(root,'ned-runtime-lock.json'),to:'ned/locks/zed.json'},
      {from:path.join(root,'agent-desktop-lock.json'),to:'ned/locks/agent-desktop.json'},
      {from:path.join(root,'ned-acp-lock.json'),to:'ned/locks/acp.json'},
      {from:path.join(root,'assets/ned-icon.png'),to:'ned/icon.png'},{from:path.join(root,'assets/ned-icon.ico'),to:'ned/icon.ico'},
      {from:path.join(root,'docs/offline-setup.md'),to:'ned/GETTING_STARTED.md'},
      {from:path.join(root,'docs/license-policy.md'),to:'ned/LICENSE_POLICY.md'},
      {from:path.join(cache,'zed-source/LICENSE-GPL'),to:'ned/licenses/Zed-GPL.txt'},
      {from:path.join(cache,'zed-source/LICENSE-APACHE'),to:'ned/licenses/Zed-Apache.txt'},
      {from:path.join(cache,'zed-linux/zed.app/licenses.md'),to:'ned/licenses/Zed-third-party.md'},
      {from:path.join(cache,'archives/zed-source-v1.28.1.tar.gz'),to:'ned/sources/zed-source-v1.28.1.tar.gz'},
      {from:path.join(cache,'zed-source/Cargo.lock'),to:'ned/licenses/Zed-Cargo.lock'},
      {from:zed,to:'zed'},
      {from:path.join(root,'.cache/opencode/source/packages/cli/dist/cli-windows-x64-baseline/bin/opencode.exe'),to:'opencode-cli.exe'},
    ],
  };
  const configuration=path.join(cache,'builder.json');await writeFile(configuration,JSON.stringify(config,null,2));
  run(process.execPath,['node_modules/electron-builder/out/cli/cli.js','--win','--dir','--x64','--publish','never','--config',configuration]);
  await stamp(); await verifyAsciiTree(staged);
  if(!compileInstaller)return;
  const nsis=await getMakeNsisPath('0.0.0');
  run(nsis.path,['-V2','-DNED_VERSION='+version,'-DNED_APP_DIR='+staged,'-DNED_OUT_FILE='+installer,'-DNED_ICON='+path.join(root,'assets/ned-icon.ico'),path.join(root,'distribution/ned/installer.nsi')],{env:{...process.env,...nsis.env}});
}
async function audit() {
  const extracted=path.join(cache,'installer-audit');
  await rm(extracted,{recursive:true,force:true});await mkdir(extracted,{recursive:true});
  try {
    const seven=await getPath7za();run(seven,['t',installer]);
    const compared=['Ned.exe','resources/app.asar','resources/ned/agent.cjs','resources/ned/icon.ico','resources/zed/Zed.exe','resources/ned/editor-branding.json'];
    const checkpointFile=path.join(cache,'installer-audit-checkpoint-'+artifactVersion+'.json');
    const installerSha256=await fileHash(installer);
    let payloadHashes, completePayload;
    if(await exists(path.join(staged,'Ned.exe'))) {
      payloadHashes=Object.fromEntries(await Promise.all(compared.map(async file=>[file,await fileHash(path.join(staged,file))])));
      if(fullRelease)completePayload=await payloadInventory(staged);
      await writeFile(checkpointFile,JSON.stringify({sourceCommit:buildCommit,version,installerSha256,payloadHashes,completePayload},null,2)+'\n');
    } else {
      const checkpoint=await json(checkpointFile);
      if(checkpoint.sourceCommit!==buildCommit||checkpoint.version!==version||checkpoint.installerSha256!==installerSha256||compared.some(file=>typeof checkpoint.payloadHashes?.[file]!=='string'))throw new Error('Stale installer audit checkpoint; regenerate staging first');
      payloadHashes=checkpoint.payloadHashes;
      completePayload=checkpoint.completePayload;
    }
    // Optional build-machine cleanup after archive integrity passes; retain exact payload hashes for comparison.
    if(process.env.NED_AUDIT_DISCARD_STAGE==='1') await rm(staged,{recursive:true,force:true});
    run(seven,['x','-y','-o'+extracted,installer],{stdio:'ignore'});
    const paths=await verifyAsciiTree(extracted), resources=path.join(extracted,'resources');
    const app=JSON.parse(extractFile(path.join(resources,'app.asar'),'package.json'));
    if (app.name!=='ned'||app.version!==version) throw new Error('Wrong app in installer');
    const hostModuleSmoke=verifyBundledHost(extractFile(path.join(resources,'app.asar'),'main.cjs'));
    for(const file of compared)
      if(await fileHash(path.join(extracted,file))!==payloadHashes[file]) throw new Error('Installer bytes differ: '+file);
    const editorBranding=await json(path.join(resources,'ned/editor-branding.json'));
    if(editorBranding.modifiedSha256!==await fileHash(path.join(resources,'zed/Zed.exe')))throw new Error('Managed editor branding hash mismatch');
    if (!editorBranding.vendorOriginal) verifyEditorIcon(await readFile(path.join(resources,'zed/Zed.exe')),await readFile(path.join(root,'assets/ned-icon.ico')));
    if (signing) { signing.verify(installer); signing.verify(path.join(extracted,'Ned.exe')); signing.verify(path.join(extracted,'Uninstall Ned.exe')); if (!editorBranding.vendorOriginal) signing.verify(path.join(resources,'zed/Zed.exe')); }
    const sourceEditor=!editorBranding.vendorOriginal && sourceEditorRelease?await verifySourceEditor(root,resources):undefined;
    if(modernRelease)for(const file of ['egm-lock.json','studio-assets-lock.json'])if(await fileHash(path.join(root,file))!==await fileHash(path.join(resources,'ned/locks',file)))throw Error('Installed feature lock mismatch: '+file);
    if(['0.3.10','0.3.11','0.3.12'].includes(version))for(const file of ['skill-seed','personal-pack-recovery.py'])
      if(await exists(path.join(resources,'ned',file)))throw Error('Removed OpenViking resource still in installer: '+file);
    let astryx;
    if(sourceEditorRelease){
      const lock=await json(path.join(root,'astryx-offline-lock.json'));
      if(await fileHash(path.join(resources,'ned/astryx',lock.archive.name))!==lock.archive.sha256||await fileHash(path.join(resources,'ned/astryx/astryx-offline-lock.json'))!==await fileHash(path.join(root,'astryx-offline-lock.json')))throw Error('Installed Astryx assets differ from the reviewed lock');
      astryx={version:lock.version,archive:lock.archive,referenceCount:lock.referenceCount,upstreamCliExecuted:false};
    }
    const released=fullRelease?await json(path.join(root,'release-runtime-lock.json')):undefined;
    const components={};
    for(const name of ['openviking','mcp','rea','agent-desktop',...(ghidraRelease?['ghidra']:[]),'skills']) {
      const folder=name==='skills'?'ned/skills':'runtime/windows-x64/'+name;
      const original=name==='skills'?path.join(root,'vendor/skills'):path.join(root,'vendor/runtime/windows-x64',name);
      components[name]=await verifyManifest(path.join(resources,folder),name!=='skills'&&released?released.components[name].manifestSha256:await fileHash(path.join(original,'manifest.json')),name==='mcp');
    }
    const runtimeOptimization=released?await json(path.join(resources,'ned/runtime-optimization.json')):undefined;
    if(released&&await fileHash(path.join(resources,'ned/runtime-optimization.json'))!==released.reportSha256)throw Error('Wrong optimization report');
    let payloadComparison;
    if(released){
      if(!completePayload)throw Error('Missing complete payload checkpoint');
      const actual=await payloadInventory(extracted),generatedInstallerFiles={};
      for(const name of ['$PLUGINSDIR/System.dll','$PLUGINSDIR/nsDialogs.dll','$PLUGINSDIR/modern-wizard.bmp','Uninstall Ned.exe']){
        if(!actual[name])throw Error('Missing installer-generated file: '+name);
        generatedInstallerFiles[name]=actual[name];delete actual[name];
      }
      const different=[...new Set([...Object.keys(actual),...Object.keys(completePayload)])].filter(name=>actual[name]!==completePayload[name]);
      if(different.length)throw Error('Complete installer payload mismatch: '+different.slice(0,10).join(', '));
      const bytes=Buffer.from(JSON.stringify({schemaVersion:1,product:'Ned',version,sourceCommit:buildCommit,files:Object.fromEntries(Object.entries(actual).sort(([a],[b])=>a.localeCompare(b)))},null,2)+'\n');
      await writeFile(path.join(output,'payload-manifest.json'),bytes);
      payloadComparison={files:Object.keys(actual).length,allStagedBytesVerified:true,manifestSha256:createHash('sha256').update(bytes).digest('hex'),generatedInstallerFiles};
    }
    const report={auditSourceCommit:verifierCommit,buildRevision:revision||undefined,runtimeOptimization,payloadComparison,sourceCommit:buildCommit,schemaVersion:1,product:'Ned',version,verifiedFrom:'installer-archive',os:process.platform,createdAt:new Date().toISOString(),installer:{name:path.basename(installer),bytes:(await stat(installer)).size,sha256:await fileHash(installer)},paths,components,editorBranding,sourceEditor,astryx,hostModuleSmoke,windowsAcceptance:false};
    await writeFile(path.join(output,'installer-audit.json'),JSON.stringify(report,null,2)+'\n');return report;
  } finally {await rm(extracted,{recursive:true,force:true});}
}
async function bundle() {
  const report=await json(path.join(output,'installer-audit.json'));
  if(report.installer.sha256!==await fileHash(installer)) throw new Error('Stale audit');
  const name=`Ned-${artifactVersion}-windows-x64`, stage=path.join(output,name);
  await rm(stage,{recursive:true,force:true});await mkdir(stage,{recursive:true});
  await cp(installer,path.join(stage,path.basename(installer)));
  for(const [from,to] of [['agent-config.example.json','agent-config.json'],['docs/offline-setup.md','GETTING_STARTED.md'],['docs/ned-introduction.md','INTRODUCTION.md'],[await releaseDoc(`validation-${artifactVersion}.md`),'VALIDATION_REPORT.md'],['distribution/readiness.json','READINESS.json'],['docs/license-policy.md','LICENSE_POLICY.md'],['LICENSE','LICENSE-Ned.txt']]) await cp(path.isAbsolute(from)?from:path.join(root,from),path.join(stage,to));
  await cp(path.join(output,'installer-audit.json'),path.join(stage,'INSTALLER_AUDIT.json'));
  if(fullRelease)await cp(path.join(root,'docs/bundled-skills.md'),path.join(stage,'SKILLS_GUIDE.md'));
  if(fullRelease)await cp(path.join(root,'docs/openviking-0.5.5-update.md'),path.join(stage,'OPENVIKING_UPDATE.md'));
  if(ghidraRelease)for(const [from,to] of [['docs/python-conda.md','python-conda.md'],['docs/git-and-binary-analysis.md','git-and-binary-analysis.md'],['docs/extension-guide.md','extension-guide.md'],['docs/openviking-studio.md','openviking-studio.md'],['docs/compaction-troubleshooting.md','compaction-troubleshooting.md'],['docs/openviking-personal-migration.md','openviking-personal-migration.md']])await cp(path.isAbsolute(from)?from:path.join(root,from),path.join(stage,to));
  if(report.payloadComparison){
    if(await fileHash(path.join(output,'payload-manifest.json'))!==report.payloadComparison.manifestSha256)throw Error('Stale complete payload manifest');
    await cp(path.join(output,'payload-manifest.json'),path.join(stage,'PAYLOAD_MANIFEST.json'));
  }
  for(const [from,to] of [['docs/configuration-recovery.md','CONFIGURATION_RECOVERY.txt'],['docs/windows-diagnostics.md','WINDOWS_DIAGNOSTICS.txt'],['docs/model-controls.md','MODEL_CONTROLS.txt'],['docs/openviking-personal-migration.md','PERSONAL_KNOWLEDGE_MIGRATION.txt'],['THIRD_PARTY_NOTICES.md','THIRD_PARTY_NOTICES.md'],['distribution/openviking-import-check.py','openviking-import-check.py'],['distribution/export-openviking-personal.py','export-openviking-personal.py'],['distribution/export-openviking-personal.cmd','EXPORT_PERSONAL.cmd'],['distribution/export-openviking-personal-no-vectors.cmd','EXPORT_PERSONAL_NO_VECTORS.cmd'],['distribution/ned/agent-probe.py','agent-probe.py'],['distribution/ned/check-agent.cmd','CHECK_AGENT.cmd'],['distribution/ned/desktop-probe.ps1','desktop-probe.ps1'],['docs/ned-user-guide.md','USER_GUIDE.md'],['docs/approval-modes.md','APPROVAL_MODES.md'],['docs/agent-desktop.md','DESKTOP_GUIDE.md']]) await cp(path.isAbsolute(from)?from:path.join(root,from),path.join(stage,to));
  await writeFile(path.join(stage,'CHECK_DESKTOP.cmd'),'@echo off\r\npowershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0desktop-probe.ps1"\r\necho EXIT_CODE=%ERRORLEVEL%\r\npause\r\n');
  await cp(path.join(root,'distribution/export-openviking-check.cmd'),path.join(stage,'CHECK_EXPORT.cmd'));
  await writeFile(path.join(stage,'CHECK_OPENVIKING.cmd'),(await readFile(path.join(root,'distribution/check-openviking.cmd'),'utf8')).replaceAll('L-Vibe','Ned').replaceAll('L_VIBE','NED'));

  await mkdir(path.join(stage,'source'),{recursive:true});
  if(report.runtimeOptimization)for(const item of report.runtimeOptimization.sourceArchives){
    const sourceFile=path.join(cache,'handover-sources',item.handoverFile);
    if(await fileHash(sourceFile)!==item.sha256)throw Error('Offline corresponding-source handover is incomplete');
    await cp(sourceFile,path.join(stage,'source',item.handoverFile));
  }
  if(ghidraRelease)for(const item of (await json(path.join(root,'ghidra-runtime-lock.json'))).artifacts.filter(a=>a.kind.endsWith('-source'))){
    const file=path.join(root,'.cache/ghidra',item.file);if(await fileHash(file)!==item.sha256)throw Error('Ghidra/JDK corresponding source hash mismatch');await cp(file,path.join(stage,'source',item.file));
  }
  if(sourceEditorRelease){
    await cp(path.join(root,'docs/zed-native-agent.md'),path.join(stage,'ZED_NATIVE_AGENT.md'));
    await cp(path.join(root,'docs/subagents.md'),path.join(stage,'SUBAGENTS.md'));
    if(modernRelease)for(const file of ['egm.md','zed-history-import.md','changes-'+version+'.md'])await cp(await releaseDoc(file),path.join(stage,file));
    await cp(path.join(root,'docs/astryx.md'),path.join(stage,'ASTRYX.md'));
    await mkdir(path.join(stage,'astryx'),{recursive:true});
    const astryx=await json(path.join(root,'astryx-offline-lock.json'));
    const kit=path.join(root,'downloads/astryx',astryx.archive.name);if(await fileHash(kit)!==astryx.archive.sha256)throw Error('Astryx kit hash mismatch');
    await cp(kit,path.join(stage,'astryx',astryx.archive.name));
    if (report.editorBranding?.vendorOriginal) {
      const lock = await json(path.join(root,'ned-runtime-lock.json'));
      const original = lock.artifacts.find(item => item.file === 'zed-source-v1.28.1.tar.gz');
      const archive = path.join(cache,'archives',original.file);
      if (await fileHash(archive) !== original.sha256) throw Error('Vendor corresponding source hash mismatch');
      await cp(archive,path.join(stage,'source',original.file));
    } else {
      const saved=process.env.NED_BUILD_REVISION;
      let editor;
      if(version==='0.3.12'&&revision==='rebuild1'){delete process.env.NED_BUILD_REVISION;try{editor=await editorVersion(root);}finally{process.env.NED_BUILD_REVISION=saved;}}
      else editor=await editorVersion(root);
      await cp(path.join(root,'downloads/editor',editor.archive),path.join(stage,'source',editor.archive));
    }
  }
  if(['0.3.11','0.3.12'].includes(version)) for(const file of ['knowledge-notes.md','changes-'+version+'.md']) await cp(await releaseDoc(file),path.join(stage,file));
  const commit=report.sourceCommit;
  const source=path.join(stage,'source',`Ned-${commit.slice(0,12)}-source.tgz`);
  run('git',['archive','--format=tar.gz','--output='+source,commit,':(exclude)downloads']);
  if(report.auditSourceCommit && report.auditSourceCommit!==commit){
    const auditSource=path.join(stage,'source',`Ned-audit-${report.auditSourceCommit.slice(0,12)}-source.tgz`);
    run('git',['archive','--format=tar.gz','--output='+auditSource,report.auditSourceCommit,':(exclude)downloads']);verifyAsciiTar(auditSource);
  }
  if(verifierCommit!==commit&&verifierCommit!==report.auditSourceCommit){
    const bundleSource=path.join(stage,'source',`Ned-bundle-${verifierCommit.slice(0,12)}-source.tgz`);
    run('git',['archive','--format=tar.gz','--output='+bundleSource,verifierCommit,':(exclude)downloads']);verifyAsciiTar(bundleSource);
  }
  const files=await verifyAsciiTree(stage);verifyAsciiTar(source);
  const archive=path.join(output,name+'.tgz');run('tar',['-czf',archive,'-C',output,name]);
  verifyAsciiTar(archive);
  const sha=await fileHash(archive);await writeFile(archive+'.sha256',sha+'  '+path.basename(archive)+'\n');
  await writeFile(path.join(output,'bundle-manifest.json'),JSON.stringify({product:'Ned',version,buildRevision:revision||undefined,auditSourceCommit:report.auditSourceCommit,bundleSourceCommit:verifierCommit,sourceCommit:commit,archive:path.basename(archive),bytes:(await stat(archive)).size,sha256:sha,files,installer:report.installer},null,2)+'\n');
}
if(mode==='release-prepare') {
  await prepareRelease(root,cache,staged,version,await getPath7za(),true);
}
else if(mode==='release') {
  const seven = await getPath7za();
  await prepareRelease(root,cache,staged,version,seven);
  await refreshReleaseHost(root,cache,staged,version,buildCommit);
  const editorRecord = path.join(staged,'resources/ned/editor-branding.json');
  if (vendorEditor) {
    const payload = await prepareZed(), destination = path.join(staged,'resources/zed');
    await rm(destination,{recursive:true,force:true}); await cp(payload,destination,{recursive:true});
    await cp(path.join(cache,'editor-branding.json'),editorRecord);
  } else if (sourceEditorRelease) {
    await installSourceEditor(root,staged);
  }
  await stamp();
  if (signing) {
    signing.sign(path.join(staged,'Ned.exe'));
    if (!vendorEditor) {
      const editor = path.join(staged,'resources/zed/Zed.exe');
      signing.sign(editor);
      const record = await json(editorRecord);
      record.modifiedSha256 = await fileHash(editor);
      record.authenticode = 'verified Ned enterprise Authenticode signature';
      await writeFile(editorRecord,JSON.stringify(record,null,2)+'\n');
    }
  }
  await verifyAsciiTree(staged);
  const nsis=await getMakeNsisPath('0.0.0');
  const buildInstaller = (filename, flags = []) => {
    run(nsis.path,[process.env.NED_VERBOSE_INSTALLER==='1'?'-V4':'-V2','-DNED_VERSION='+version,'-DNED_APP_DIR='+staged,'-DNED_OUT_FILE='+filename,
      '-DNED_ICON='+path.join(root,'assets/ned-icon.ico'),...flags,...(signing?.nsis ?? []),path.join(root,'distribution/ned/installer.nsi')],{env:{...process.env,...nsis.env}});
    signing?.sign(filename);
  };
  buildInstaller(installer);
  await audit();
}
else if(mode==='package') {if(revision)throw new Error('Use release for a repair revision');await packageApp();await audit();}
else if(mode==='stage') await packageApp(false);
else if(mode==='audit') await audit();
else if(mode==='bundle') await bundle();
else if(mode==='dev') {await prepareZed();run(process.execPath,['scripts/ned-build.mjs']);if(process.platform!=='win32') throw new Error('Managed native development requires Windows; use the ACP integration tests on Linux.');run(path.join(root,'node_modules/electron/dist/electron.exe'),[path.join(cache,'app')],{env:{...process.env,NED_DEV_RESOURCES:path.join(staged,'resources')}});}
else if(mode==='prepare') await prepareZed();
else throw new Error('Usage: ned-package.mjs prepare|package|stage|release|audit|bundle');
