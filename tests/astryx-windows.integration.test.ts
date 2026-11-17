import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {tmpdir} from 'node:os';
import path from 'node:path';
import lock from '../astryx-offline-lock.json';
const run=promisify(execFile);
test('installed Windows Astryx starter builds using bundled Node and native esbuild without npm or the upstream CLI',{skip:process.platform!=='win32',timeout:120000},async t=>{
 const resources=path.join(path.dirname(process.execPath),'resources'),archive=path.join(resources,'ned/astryx',lock.archive.name);
 assert.equal(createHash('sha256').update(await readFile(archive)).digest('hex'),lock.archive.sha256);
 const root=await mkdtemp(path.join(tmpdir(),'ned-astryx-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const quote=(s:string)=>"'"+s.replaceAll("'","''")+"'";
 // Avoid inheriting PowerShell 7's Archive module into Windows PowerShell 5,
 // whose .NET Framework lacks its three-argument ExtractToDirectory overload.
 const command='Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('+quote(archive)+', '+quote(root)+')';
 await run('powershell.exe',['-NoLogo','-NoProfile','-EncodedCommand',Buffer.from(command,'utf16le').toString('base64')]);
 const kit=path.join(root,'Ned-Astryx'),manifest=JSON.parse(await readFile(path.join(kit,'NED-KIT-MANIFEST.json'),'utf8'));
 for(const file of manifest.files)assert.equal(createHash('sha256').update(await readFile(path.join(kit,file.path))).digest('hex'),file.sha256,file.path);
 // Remove the prepared outputs so this verifies a real Windows rebuild.
 await rm(path.join(kit,'dist'),{recursive:true,force:true});
 const result=await run(process.execPath,[path.join(kit,'build.mjs')],{cwd:kit,env:{...process.env,ELECTRON_RUN_AS_NODE:'1',ESBUILD_BINARY_PATH:''},timeout:60000});
 assert.match(result.stdout,/ASTRYX_BUILD_OK/);
 for(const file of ['dist/main.js','dist/main.css'])assert.ok((await stat(path.join(kit,file))).size>1000);
 assert.match(await readFile(path.join(kit,'index.html'),'utf8'),/connect-src 'none'/);
 assert.equal(manifest.platform,'win32-x64');
});
test('installed source-built editor has Ned menu/About content and corresponding-source provenance',{skip:process.platform!=='win32',timeout:30000},async()=>{
 const resources=path.join(path.dirname(process.execPath),'resources'),bytes=await readFile(path.join(resources,'zed/Zed.exe'));
 for(const text of ['About Ned','Quit Ned','Ned 0.3.8 · rebuild 1'])assert.ok(bytes.includes(Buffer.from(text)),text);
 for(const text of ['About Zed','Quit Zed'])assert.ok(!bytes.includes(Buffer.from(text)),text);
 const record=JSON.parse(await readFile(path.join(resources,'ned/editor-branding.json'),'utf8'));
 assert.equal(record.modifiedSha256,createHash('sha256').update(bytes).digest('hex'));
 const changes=JSON.parse(await readFile(path.join(resources,'ned/sources/NED_EDITOR_CHANGES.json'),'utf8'));
 assert.deepEqual(changes,record.sourceChanges);
 assert.match(await readFile(path.join(resources,'ned/sources/NED_EDITOR_SOURCE.txt'),'utf8'),/offline TGZ/);
 // Exercise the newly compiled PE loader; discard printenv output rather than logging credentials.
 const loaded=await run(path.join(resources,'zed/Zed.exe'),['--printenv'],{env:{...process.env,ELECTRON_RUN_AS_NODE:undefined},timeout:15000,maxBuffer:4*1024*1024});
 assert.equal(loaded.stderr,'');
});
