import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {existsSync} from 'node:fs';import path from 'node:path';import {tmpdir} from 'node:os';
import {execFile} from 'node:child_process';import{promisify}from'node:util';
import {getMakeNsisPath} from 'app-builder-lib/out/toolsets/windows.js';
const run=promisify(execFile),wine=path.resolve('.cache/wine-runtime/bin/wine');
test('compiled installer imports only EXEDIR config, preserves encrypted settings and falls back to its template',
 {skip:process.platform!=='linux'||!existsSync(wine)||!existsSync('.cache/wine-runtime/lib/wine/x86_64-windows/kernel32.dll'),timeout:180000},async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-installer-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const payload=path.join(root,'payload'),deployment=path.join(root,'deployment'),cwd=path.join(root,'different-cwd'),prefix=path.join(root,'wine');
 for(const dir of [payload,deployment,cwd])await mkdir(dir);
 const files=['Ned.exe','resources/zed/Zed.exe','resources/zed/bin/zed.exe','resources/app.asar','resources/runtime/windows-x64/openviking/python/Lib/urllib/parse.py','resources/runtime/windows-x64/openviking/python/Lib/site-packages/win32/lib/pywin32_bootstrap.py','resources/runtime/windows-x64/agent-desktop/agent-desktop.exe'];
 for(const relative of files){await mkdir(path.dirname(path.join(payload,relative)),{recursive:true});await writeFile(path.join(payload,relative),'fixture');}
 await mkdir(path.join(payload,'resources/ned'),{recursive:true});await writeFile(path.join(payload,'resources/ned/agent-config.example.json'),'template-fixture');
 const nsis=await getMakeNsisPath('0.0.0'),exe=path.join(deployment,'Ned-test.exe');
 await run(nsis.path,['-V2','-DNED_VERSION=0.3.3','-DNED_APP_DIR='+payload,'-DNED_OUT_FILE='+exe,'-DNED_ICON='+path.resolve('assets/ned-icon.ico'),path.resolve('distribution/ned/installer.nsi')],{env:{...process.env,...nsis.env},maxBuffer:1024*1024});
 const env={...process.env,WINEPREFIX:prefix,WINEDEBUG:'-all',WINEDLLOVERRIDES:'mscoree,mshtml=d'};delete env.DISPLAY;
 const output=await run(wine,['cmd.exe','/c','echo %APPDATA%'],{cwd,env,timeout:60000});
 const roaming=output.stdout.trim().split(/\r?\n/).find(s=>/^[A-Z]:\\/.test(s));assert.ok(roaming);
 const userData=path.join(prefix,'drive_c',...roaming.slice(3).split('\\'),'Ned'),staged=path.join(userData,'config-import.json');
 const installed=path.join(root,'install'),winInstalled='Z:'+installed.replaceAll('/','\\');
 await writeFile(path.join(cwd,'agent-config.json'),'must-not-use-cwd');
 const install=()=>run(wine,[exe,'/S','/D='+winInstalled],{cwd,env,timeout:45000});
 await install();assert.equal(await readFile(staged,'utf8'),'template-fixture');
 await rm(staged);await writeFile(path.join(deployment,'agent-config.json'),'provided-fixture');
 await install();assert.equal(await readFile(staged,'utf8'),'provided-fixture');assert.equal(await readFile(path.join(deployment,'agent-config.json'),'utf8'),'provided-fixture');
 await rm(staged);await writeFile(path.join(userData,'settings.enc.json'),'saved-encrypted-fixture');
 await install();assert.equal(await readFile(path.join(userData,'settings.enc.json'),'utf8'),'saved-encrypted-fixture');await assert.rejects(access(staged));
 await rm(path.join(userData,'settings.enc.json'));await rm(path.join(deployment,'agent-config.json'));await mkdir(path.join(deployment,'agent-config.json'));await writeFile(path.join(deployment,'agent-config.json/not-a-config.txt'),'fixture');
 // Directory sources must not be silently accepted as a user JSON file.
 const invalid=await install().then(()=>0,error=>error.code);assert.equal(invalid,1);
});
