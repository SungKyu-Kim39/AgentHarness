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
import { verifyManifest, fileHash } from './installer-audit.mjs';
import { brandEditor, verifyEditorIcon } from './ned-editor-branding.mjs';
import { verifyBundledHost } from './ned-host-smoke.mjs';
import { prepareRebuild, rebuildBaseline, payloadInventory } from './ned-rebuild.mjs';
const root = path.resolve(import.meta.dirname, '..');
const json = async p => JSON.parse(await readFile(p, 'utf8'));
const version = (await json(path.join(root,'package.json'))).version;
const revision=process.env.NED_BUILD_REVISION ?? '';
if(revision && revision!=='rebuild1')throw new Error('Unsupported build revision');
const artifactVersion=version+(revision?'-'+revision:'');
const output = path.join(root,'release/ned');
const cache = path.join(root,'.cache/ned');
const staged = path.join(output,'win-unpacked');
const installer = path.join(output,`Ned-${artifactVersion}-win-x64.exe`);
const mode = process.argv[2];
const buildCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const run = (command,args,options={}) => execFileSync(command,args,{cwd:root,stdio:'inherit',...options});
const exists = p => access(p).then(()=>true,()=>false);
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
  const branded=brandEditor(await readFile(path.join(payload,'Zed.exe')),await readFile(path.join(root,'assets/ned-icon.ico')));
  await writeFile(path.join(payload,'Zed.exe'),branded.bytes);
  await writeFile(path.join(cache,'editor-branding.json'),JSON.stringify(branded.record,null,2)+'\n');
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
    directories:{app:path.join(cache,'app'),output},files:['main.cjs','package.json'],asar:true,npmRebuild:false,publish:null,
    win:{target:'dir',signAndEditExecutable:false,icon:path.join(root,'assets/ned-icon.ico')},
    extraResources:[
      {from:path.join(root,'vendor/runtime'),to:'runtime',filter:['windows-x64/openviking/**/*','windows-x64/rea/**/*','windows-x64/mcp/**/*','windows-x64/agent-desktop/**/*']},
      {from:path.join(root,'vendor/skills'),to:'ned/skills',filter:['**/*','!doc-coauthoring{,/**/*}']},
      {from:path.join(root,'distribution/methodology'),to:'ned/methodology'},
      {from:path.join(root,'agent-config.example.json'),to:'ned/agent-config.example.json'},
      {from:path.join(root,'skills-lock.json'),to:'ned/skills-lock.json'},
      {from:path.join(root,'LICENSE'),to:'ned/licenses/Ned-MIT.txt'},
      {from:path.join(root,'node_modules/jsonc-parser/LICENSE.md'),to:'ned/licenses/jsonc-parser-MIT.txt'},
      {from:path.join(cache,'editor-branding.json'),to:'ned/editor-branding.json'},
      {from:path.join(root,'.cache/l-vibe-desktop/source/LICENSE'),to:'ned/licenses/OpenCode-MIT.txt'},
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
      {from:path.join(root,'.cache/l-vibe-desktop/source/packages/cli/dist/cli-windows-x64-baseline/bin/opencode.exe'),to:'opencode-cli.exe'},
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
    let payloadHashes;
    if(await exists(path.join(staged,'Ned.exe'))) {
      payloadHashes=Object.fromEntries(await Promise.all(compared.map(async file=>[file,await fileHash(path.join(staged,file))])));
      await writeFile(checkpointFile,JSON.stringify({sourceCommit:buildCommit,version,installerSha256,payloadHashes},null,2)+'\n');
    } else {
      const checkpoint=await json(checkpointFile);
      if(checkpoint.sourceCommit!==buildCommit||checkpoint.version!==version||checkpoint.installerSha256!==installerSha256||compared.some(file=>typeof checkpoint.payloadHashes?.[file]!=='string'))throw new Error('Stale installer audit checkpoint; regenerate staging first');
      payloadHashes=checkpoint.payloadHashes;
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
    verifyEditorIcon(await readFile(path.join(resources,'zed/Zed.exe')),await readFile(path.join(root,'assets/ned-icon.ico')));
    const baseline=revision?await rebuildBaseline(root,version,revision):undefined;
    const components={};
    for(const name of ['openviking','mcp','rea','agent-desktop','skills']) {
      const folder=name==='skills'?'ned/skills':'runtime/windows-x64/'+name;
      const original=name==='skills'?path.join(root,'vendor/skills'):path.join(root,'vendor/runtime/windows-x64',name);
      components[name]=await verifyManifest(path.join(resources,folder),baseline?baseline.components[name].manifestSha256:await fileHash(path.join(original,'manifest.json')),name==='mcp');
    }
    let rebuild;
    if(revision){
      const proof=await json(path.join(cache,revision,'provenance.json'));
      if(proof.sourceCommit!==buildCommit||proof.buildRevision!==revision)throw new Error('Stale rebuild provenance');
      const actual=await payloadInventory(extracted),generatedInstallerFiles={};
      for(const name of ['$PLUGINSDIR/System.dll','Uninstall Ned.exe']){
        if(!actual[name])throw new Error('Missing generated installer file: '+name);
        generatedInstallerFiles[name]=actual[name];delete actual[name];
      }
      if(JSON.stringify(Object.entries(actual).sort())!==JSON.stringify(Object.entries(proof.payloadInventory).sort()))throw new Error('Installer payload differs from the rebuilt staging');
      const {payloadInventory:_,...summary}=proof;rebuild={...summary,generatedInstallerFiles};
    }
    const report={buildRevision:revision||undefined,rebuild,sourceCommit:buildCommit,schemaVersion:1,product:'Ned',version,verifiedFrom:'installer-archive',os:process.platform,createdAt:new Date().toISOString(),installer:{name:path.basename(installer),bytes:(await stat(installer)).size,sha256:await fileHash(installer)},paths,components,editorBranding,hostModuleSmoke,windowsAcceptance:false};
    await writeFile(path.join(output,'installer-audit.json'),JSON.stringify(report,null,2)+'\n');return report;
  } finally {await rm(extracted,{recursive:true,force:true});}
}
async function bundle() {
  const report=await json(path.join(output,'installer-audit.json'));
  if(report.installer.sha256!==await fileHash(installer)) throw new Error('Stale audit');
  const name=`Ned-${artifactVersion}-windows-x64`, stage=path.join(output,name);
  await rm(stage,{recursive:true,force:true});await mkdir(stage,{recursive:true});
  await cp(installer,path.join(stage,path.basename(installer)));
  for(const [from,to] of [['agent-config.example.json','agent-config.json'],['docs/offline-setup.md','GETTING_STARTED.md'],['docs/ned-introduction.md','INTRODUCTION.md'],[`docs/validation-${version}.md`,'VALIDATION_REPORT.md'],['distribution/readiness.json','READINESS.json'],['docs/license-policy.md','LICENSE_POLICY.md'],['LICENSE','LICENSE-Ned.txt']]) await cp(path.join(root,from),path.join(stage,to));
  await cp(path.join(output,'installer-audit.json'),path.join(stage,'INSTALLER_AUDIT.json'));
  for(const [from,to] of [['docs/configuration-recovery.md','CONFIGURATION_RECOVERY.txt'],['docs/windows-diagnostics.md','WINDOWS_DIAGNOSTICS.txt'],['docs/model-controls.md','MODEL_CONTROLS.txt'],['docs/openviking-personal-migration.md','PERSONAL_KNOWLEDGE_MIGRATION.txt'],['THIRD_PARTY_NOTICES.md','THIRD_PARTY_NOTICES.md'],['distribution/openviking-import-check.py','openviking-import-check.py'],['distribution/export-openviking-personal.py','export-openviking-personal.py'],['distribution/export-openviking-personal.cmd','EXPORT_PERSONAL.cmd'],['distribution/export-openviking-personal-no-vectors.cmd','EXPORT_PERSONAL_NO_VECTORS.cmd'],['distribution/ned/agent-probe.py','agent-probe.py'],['distribution/ned/check-agent.cmd','CHECK_AGENT.cmd'],['distribution/ned/desktop-probe.ps1','desktop-probe.ps1'],['docs/approval-modes.md','APPROVAL_MODES.md'],['docs/agent-desktop.md','DESKTOP_GUIDE.md']]) await cp(path.join(root,from),path.join(stage,to));
  await writeFile(path.join(stage,'CHECK_DESKTOP.cmd'),'@echo off\r\npowershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0desktop-probe.ps1"\r\necho EXIT_CODE=%ERRORLEVEL%\r\npause\r\n');
  await cp(path.join(root,'distribution/export-openviking-check.cmd'),path.join(stage,'CHECK_EXPORT.cmd'));
  await writeFile(path.join(stage,'CHECK_OPENVIKING.cmd'),(await readFile(path.join(root,'distribution/check-openviking.cmd'),'utf8')).replaceAll('L-Vibe','Ned').replaceAll('L_VIBE','NED'));

  await mkdir(path.join(stage,'source'),{recursive:true});
  const commit=report.sourceCommit;
  const source=path.join(stage,'source',`Ned-${commit.slice(0,12)}-source.tgz`);
  run('git',['archive','--format=tar.gz','--output='+source,commit,':(exclude)downloads']);
  const files=await verifyAsciiTree(stage);verifyAsciiTar(source);
  const archive=path.join(output,name+'.tgz');run('tar',['-czf',archive,'-C',output,name]);
  verifyAsciiTar(archive);
  const sha=await fileHash(archive);await writeFile(archive+'.sha256',sha+'  '+path.basename(archive)+'\n');
  await writeFile(path.join(output,'bundle-manifest.json'),JSON.stringify({product:'Ned',version,buildRevision:revision||undefined,sourceCommit:commit,archive:path.basename(archive),bytes:(await stat(archive)).size,sha256:sha,files,installer:report.installer},null,2)+'\n');
}
if(mode==='rebuild') {
  if(!revision)throw new Error('Set NED_BUILD_REVISION for a same-version rebuild');
  const seven=await getPath7za();
  await prepareRebuild(root,cache,staged,version,revision,buildCommit,seven);
  const nsis=await getMakeNsisPath('0.0.0');
  run(nsis.path,['-V2','-DNED_VERSION='+version,'-DNED_APP_DIR='+staged,'-DNED_OUT_FILE='+installer,'-DNED_ICON='+path.join(root,'assets/ned-icon.ico'),path.join(root,'distribution/ned/installer.nsi')],{env:{...process.env,...nsis.env}});
  await audit();
}
else if(mode==='package') {if(revision)throw new Error('Use rebuild for a repair revision');await packageApp();await audit();}
else if(mode==='stage') await packageApp(false);
else if(mode==='audit') await audit();
else if(mode==='bundle') await bundle();
else if(mode==='dev') {await prepareZed();run(process.execPath,['scripts/ned-build.mjs']);if(process.platform!=='win32') throw new Error('Managed native development requires Windows; use the ACP integration tests on Linux.');run(path.join(root,'node_modules/electron/dist/electron.exe'),[path.join(cache,'app')],{env:{...process.env,NED_DEV_RESOURCES:path.join(staged,'resources')}});}
else if(mode==='prepare') await prepareZed();
else throw new Error('Usage: ned-package.mjs prepare|package|stage|rebuild|audit|bundle');
