// Build-machine only. Never replace an already published patch artifact.
import { readFile,writeFile,mkdir,rm,cp,stat,access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { createPackage,extractAll,extractFile,listPackage,statFile } from '@electron/asar';
import fuses from '@electron/fuses';
import { verifyAsciiTree,verifyAsciiTar } from './package-paths.mjs';
import { verifyBundledHost } from './ned-host-smoke.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
if(execFileSync('git',['diff','HEAD','--name-only'],{encoding:'utf8'}).trim())throw new Error('Commit source before producing the patch');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const baseline='d0c7cd698f1357231d10012ca9e534588ce4b7b02adefd22d581c09a5765562e';
const exeHash='a183132ed243fbe91e831c62d8275f5955e2468ee3fdf97b814e231b0bf0d10e';
const base=path.resolve('.cache/ned/host-baseline-0.3.3');
const output=path.resolve('.cache/ned/jsonc-startup-fix-1'),app=path.resolve('.cache/ned/jsonc-startup-fix-app');
const archive=path.resolve('downloads/Ned-jsonc-startup-fix-1.tgz');
if(await access(archive).then(()=>true,()=>false))throw new Error('Immutable patch output already exists');
if(hash(await readFile(base+'/resources/app.asar'))!==baseline||hash(await readFile(base+'/Ned.exe'))!==exeHash)throw new Error('Wrong published 0.3.3 baseline');
const wire=await fuses.getCurrentFuseWire(base+'/Ned.exe');
if(wire[fuses.FuseV1Options.EnableEmbeddedAsarIntegrityValidation]!==48)throw new Error('Archive-only patch incompatible with original binary');
let reproduced=false;
try { verifyBundledHost(extractFile(base+'/resources/app.asar','main.cjs')); }
catch(error) { if(!String(error.message).includes('UNBUNDLED_HOST_IMPORT: ./impl/format'))throw error;reproduced=true; }
if(!reproduced)throw new Error('Expected baseline failure not reproduced');
execFileSync(process.execPath,['scripts/ned-build.mjs'],{stdio:'inherit'});
const metadata=JSON.parse(await readFile('.cache/ned/app/package.json','utf8'));
if(metadata.version!=='0.3.3')throw new Error('Patch must retain the target host version');
await rm(output,{recursive:true,force:true});await rm(app,{recursive:true,force:true});await mkdir(output,{recursive:true});await mkdir(app,{recursive:true});
extractAll(base+'/resources/app.asar',app);
await cp('.cache/ned/app/main.cjs',app+'/main.cjs');
await createPackage(app,output+'/app.asar');
const hostModuleSmoke=verifyBundledHost(extractFile(output+'/app.asar','main.cjs'));
// The archive retains every original entry, with only main.cjs permitted to change.
const entries=listPackage(base+'/resources/app.asar');
if(JSON.stringify(entries)!==JSON.stringify(listPackage(output+'/app.asar')))throw new Error('Archive file list changed');
for(const entry of entries) {
  const name=entry.slice(1);
  if(name==='main.cjs'||statFile(base+'/resources/app.asar',name).files)continue;
  if(!extractFile(base+'/resources/app.asar',name).equals(extractFile(output+'/app.asar',name)))throw new Error('Unexpected archive entry change');
}
const manifest={schemaVersion:1,product:'Ned',targetVersion:'0.3.3',fixId:'ned-jsonc-startup-1',sourceCommit,exeSha256:exeHash,baselineAsarSha256:[baseline],updatedAsarSha256:hash(await readFile(output+'/app.asar')),integrityFuseDisabledInOriginalBinary:true,hostModuleSmoke,windowsAcceptance:false,changes:['Bundle the static JSONC ESM implementation and all parser/edit/format dependencies','Run isolated module initialization against the actual ASAR before publication']};
const raw=Buffer.from(JSON.stringify(manifest,null,2)+'\n');await writeFile(output+'/manifest.json',raw);
await writeFile(output+'/apply-jsonc-fix.py',(await readFile('distribution/ned/apply-jsonc-fix.py','utf8')).replace('__MANIFEST_SHA256__',hash(raw)));
for(const [name,args] of [['APPLY_FIX',''],['ROLLBACK_FIX',' --rollback']])await writeFile(output+'/'+name+'.cmd','@echo off\r\nsetlocal\r\nset "NED_FIX_PY=%LOCALAPPDATA%\\Programs\\Ned\\resources\\runtime\\windows-x64\\openviking\\python\\python.exe"\r\nif not exist "%NED_FIX_PY%" (echo NED_BUNDLED_PYTHON_NOT_FOUND & pause & exit /b 1)\r\n"%NED_FIX_PY%" -I -S -B "%~dp0apply-jsonc-fix.py"'+args+'\r\nset "NED_FIX_EXIT=%ERRORLEVEL%"\r\necho EXIT_CODE=%NED_FIX_EXIT%\r\npause\r\nexit /b %NED_FIX_EXIT%\r\n');
await cp('docs/ned-jsonc-startup-fix-1.txt',output+'/README.txt');await cp('LICENSE',output+'/LICENSE.txt');
await verifyAsciiTree(output);
execFileSync('tar',['-czf',archive,'-C',output,'.']);verifyAsciiTar(archive);
const bytes=(await stat(archive)).size,sha256=hash(await readFile(archive));
await writeFile(archive+'.sha256',sha256+'  '+path.basename(archive)+'\n');
await writeFile('downloads/Ned-jsonc-startup-fix-1-manifest.json',JSON.stringify({...manifest,archiveBytes:bytes,archiveSha256:sha256},null,2)+'\n');
console.log(JSON.stringify({bytes,sha256,updatedAsarSha256:manifest.updatedAsarSha256}));
