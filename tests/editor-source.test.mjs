import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
const archive=['.cache/ned/archives/zed-source-v1.28.1.tar.gz','release/ned/win-unpacked/resources/ned/sources/zed-source-v1.28.1.tar.gz'].map(p=>path.resolve(p)).find(p=>existsSync(p));
test('pinned editor source changes only the menu/About paths and preserves startup and quit implementation',{skip:!archive},async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-editor-source-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const prefix=execFileSync('tar',['-tzf',archive],{encoding:'utf8',maxBuffer:16*1024*1024}).split('\n')[0].replace(/\/$/,'');
 const originals={};
 for(const file of ['crates/zed/src/zed/app_menus.rs','crates/zed/src/zed.rs']){await mkdir(path.dirname(path.join(root,file)),{recursive:true});const bytes=execFileSync('tar',['-xOf',archive,prefix+'/'+file],{maxBuffer:2*1024*1024});await writeFile(path.join(root,file),bytes);originals[file]=bytes.toString();}
 await mkdir(path.join(root,'crates/zed/resources'),{recursive:true});
 execFileSync(process.execPath,['scripts/patch-ned-editor.mjs',root]);
 const before=originals['crates/zed/src/zed.rs'],after=await readFile(path.join(root,'crates/zed/src/zed.rs'),'utf8');
 const start=before.indexOf('fn open_about_window('),end=before.indexOf('\nfn quit(',start);
 assert.equal(after.slice(0,start),before.slice(0,start));assert.equal(after.slice(after.indexOf('\nfn quit(',start)),before.slice(end));
 assert.match(after,/Ned 0\.3\.8 · rebuild 1/);assert.match(after,/Based on Zed 1\.28\.1/);assert.match(after,/height: px\(420\.\)/);
 const menu=await readFile(path.join(root,'crates/zed/src/zed/app_menus.rs'),'utf8');assert.match(menu,/"About Ned"/);assert.match(menu,/"Quit Ned"/);assert.doesNotMatch(menu,/"About Zed"|"Quit Zed"/);
 assert.deepEqual(await readFile(path.join(root,'crates/zed/resources/ned-icon.png')),await readFile('assets/ned-icon.png'));
 assert.throws(()=>execFileSync(process.execPath,['scripts/patch-ned-editor.mjs',root],{stdio:'pipe'}),/Command failed/);
});
