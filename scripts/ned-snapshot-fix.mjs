// Build-machine-only repair for immutable, explicitly pinned host archives.
import {readFile,writeFile,mkdir,rm,cp,stat,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {createPackage,extractAll,extractFile,listPackage,statFile} from '@electron/asar';
import fuses from '@electron/fuses';
import {verifyAsciiTree,verifyAsciiTar} from './package-paths.mjs';
import {verifyBundledHost} from './ned-host-smoke.mjs';
import {snapshotBytePatch} from './ned-snapshot-byte-patch.mjs';
import {verifySnapshotBackport} from './ned-snapshot-smoke.mjs';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
if(execFileSync('git',['diff','HEAD','--name-only'],{encoding:'utf8'}).trim())throw new Error('Commit source before bundling');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const archive=path.resolve('downloads/Ned-desktop-snapshot-fix-1.tgz');
if(await access(archive).then(()=>true,()=>false))throw new Error('Immutable patch already exists');
if(JSON.parse(await readFile('package.json','utf8')).version!=='0.3.5')throw new Error('Historical builder requires the 0.3.5 source');
execFileSync(process.execPath,['scripts/ned-build.mjs'],{stdio:'inherit'});
const compiled=await readFile('.cache/ned/app/main.cjs');
const output=path.resolve('.cache/ned/desktop-snapshot-fix-1');await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
const targets=[];
for(const [version,exeSha256,baseline] of [
 ['0.3.4','55bda2ec91e02ef08b6b801551e6ac6cfc1e832a08145dcfca8fa876259efda8','a33199e61ab6f9c09f2a2b64cef65398e458d5bc90f70d4ac0749d5d1d654da5'],
 ['0.3.5','60a1564e850535d95e2e8f5b3680ba4539a2e8c2a0714d0a19e50efbfe8031b3','a2e2b9c174a9bdc4963c5cfbe731b5659f4acf360ca147f04624e910fa0fc817'],
]){
 const base=path.resolve('.cache/ned/host-baseline-'+version),original=base+'/resources/app.asar';
 if(sha(await readFile(base+'/Ned.exe'))!==exeSha256||sha(await readFile(original))!==baseline)throw new Error('Wrong original installer bytes');
 const wire=await fuses.getCurrentFuseWire(base+'/Ned.exe');
 if(wire[fuses.FuseV1Options.EnableEmbeddedAsarIntegrityValidation]!==48)throw new Error('ASAR-only patch unsupported by original binary');
 const app=path.resolve('.cache/ned/snapshot-patch-app-'+version);await rm(app,{recursive:true,force:true});await mkdir(app,{recursive:true});extractAll(original,app);
 const updated=snapshotBytePatch(extractFile(original,'main.cjs'),compiled);
 verifyBundledHost(updated);await writeFile(app+'/main.cjs',updated);
 const payloadFile='host-'+version+'.asar';await createPackage(app,output+'/'+payloadFile);
 const hostModuleSmoke=verifyBundledHost(extractFile(output+'/'+payloadFile,'main.cjs'));
 const snapshotContractSmoke=await verifySnapshotBackport(extractFile(original,'main.cjs'),extractFile(output+'/'+payloadFile,'main.cjs'));
 const entries=listPackage(original).sort();
 if(JSON.stringify(entries)!==JSON.stringify(listPackage(output+'/'+payloadFile).sort()))throw new Error('Archive entries changed');
 for(const entry of entries){const name=entry.slice(1);if(name==='main.cjs'||statFile(original,name).files)continue;
  if(!extractFile(original,name).equals(extractFile(output+'/'+payloadFile,name)))throw new Error('Unexpected file change');}
 targets.push({targetVersion:version,payloadFile,exeSha256,baselineAsarSha256:[baseline],updatedAsarSha256:sha(await readFile(output+'/'+payloadFile)),onlySnapshotBlockChanged:true,hostModuleSmoke,snapshotContractSmoke});
}
const manifest={schemaVersion:1,product:'Ned',fixId:'ned-desktop-snapshot-1',sourceCommit,targets,windowsAcceptance:false};
const raw=Buffer.from(JSON.stringify(manifest,null,2)+'\n');await writeFile(output+'/manifest.json',raw);
await writeFile(output+'/apply-snapshot-fix.py',(await readFile('distribution/ned/apply-snapshot-fix.py','utf8')).replace('__MANIFEST_SHA256__',sha(raw)));
for(const[name,args]of[['APPLY_FIX',''],['ROLLBACK_FIX',' --rollback']])await writeFile(output+'/'+name+'.cmd','@echo off\r\nsetlocal\r\nset "NED_FIX_PY=%LOCALAPPDATA%\\Programs\\Ned\\resources\\runtime\\windows-x64\\openviking\\python\\python.exe"\r\nif not exist "%NED_FIX_PY%" (echo NED_BUNDLED_PYTHON_NOT_FOUND & pause & exit /b 1)\r\n"%NED_FIX_PY%" -I -S -B "%~dp0apply-snapshot-fix.py"'+args+'\r\nset "NED_FIX_EXIT=%ERRORLEVEL%"\r\necho EXIT_CODE=%NED_FIX_EXIT%\r\npause\r\nexit /b %NED_FIX_EXIT%\r\n');
await cp('docs/ned-snapshot-fix-1.txt',output+'/README.txt');await cp('LICENSE',output+'/LICENSE.txt');await verifyAsciiTree(output);
execFileSync('tar',['-czf',archive,'-C',output,'.']);verifyAsciiTar(archive);
const bytes=(await stat(archive)).size,archiveSha256=sha(await readFile(archive));
await writeFile(archive+'.sha256',archiveSha256+'  '+path.basename(archive)+'\n');
await writeFile('downloads/Ned-desktop-snapshot-fix-1-manifest.json',JSON.stringify({...manifest,archiveBytes:bytes,archiveSha256},null,2)+'\n');
console.log(JSON.stringify({bytes,archiveSha256,targets}));
