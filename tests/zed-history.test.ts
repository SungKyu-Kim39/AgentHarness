import {test} from 'node:test';import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';import {mkdtemp,mkdir,rm,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {zstdCompressSync,zstdDecompressSync} from 'node:zlib';
import {importZedHistory} from '../distribution/ned/zed-history';
test('Zed history merges committed WAL rows, preserves source, removes prior grants, deduplicates and never overwrites conflicts',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-zed-import-'));t.after(()=>rm(root,{recursive:true,force:true}));const editor=path.join(root,'editor');await mkdir(editor);
 const source=path.join(root,'threads.db'),db=new DatabaseSync(source);t.after(()=>db.close());db.exec('PRAGMA journal_mode=WAL; CREATE TABLE threads(id TEXT PRIMARY KEY,summary TEXT,updated_at TEXT,data_type TEXT,data BLOB)');
 const bytes=zstdCompressSync(Buffer.from(JSON.stringify({version:'0.3.0',title:'original',messages:[],model:{provider:'private'},sandbox_grants:{allow_fs_write_all:true}})));
 db.prepare('INSERT INTO threads VALUES(?,?,?,?,?)').run('t1','original','2026-01-01','zstd',bytes);
 const report=await importZedHistory(source,editor);assert.equal(report.imported,1);assert.equal(report.unsupported,0);
 const out=new DatabaseSync(path.join(editor,'threads/threads.db'));t.after(()=>out.close());const thread=JSON.parse(zstdDecompressSync(out.prepare('SELECT data FROM threads').get()!.data as Uint8Array).toString());assert.deepEqual(thread.sandbox_grants,{});assert.equal(thread.model,null);
 assert.deepEqual(Buffer.from(db.prepare('SELECT data FROM threads').get()!.data as Uint8Array),bytes);
 const second=await importZedHistory(source,editor);assert.equal(second.duplicates,1);assert.ok((await readFile(second.backup!)).length>0);
 out.prepare('UPDATE threads SET summary=?').run('NED USER EDIT');const third=await importZedHistory(source,editor);assert.equal(third.conflicts,1);assert.equal(out.prepare('SELECT summary FROM threads').get()!.summary,'NED USER EDIT');
});
test('older target tables gain known metadata columns and unsupported rows leave the original unchanged',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-zed-schema-'));t.after(()=>rm(root,{recursive:true,force:true}));const editor=path.join(root,'editor');await mkdir(path.join(editor,'threads'),{recursive:true});
 const source=path.join(root,'threads.db'),input=new DatabaseSync(source);const target=new DatabaseSync(path.join(editor,'threads/threads.db'));t.after(()=>{input.close();target.close();});
 const basic='CREATE TABLE threads(id TEXT PRIMARY KEY,summary TEXT,updated_at TEXT,data_type TEXT,data BLOB';input.exec(basic+',parent_id TEXT,folder_paths TEXT,folder_paths_order TEXT,created_at TEXT)');target.exec(basic+')');
 const data=Buffer.from(JSON.stringify({version:'0.3.0',messages:[],model:null,sandbox_grants:{}}));const put=input.prepare('INSERT INTO threads VALUES(?,?,?,?,?,?,?,?,?)');
 put.run('parent','Original','2026-01-01','json',data,null,'["C:\\\\project"]','[0]','2025-01-01');
 put.run('child','Child','2026-01-01','json',data,'parent',null,null,null);
 put.run('new-version','Unsupported','2026-01-01','json',Buffer.from('{"version":"future","messages":[]}'),null,null,null,null);
 const result=await importZedHistory(source,editor);assert.equal(result.imported,2);assert.equal(result.unsupported,1);
 assert.equal(target.prepare('SELECT parent_id FROM threads WHERE id=?').get('child')!.parent_id,'parent');assert.equal(target.prepare('SELECT created_at FROM threads WHERE id=?').get('parent')!.created_at,'2025-01-01');
 assert.equal(input.prepare('SELECT count(*) AS n FROM threads').get()!.n,3);
});
test('a hard-linked source and linked backup directory cannot redirect writes into original data',async t=>{
 const {link,symlink}=await import('node:fs/promises');const root=await mkdtemp(path.join(tmpdir(),'ned-zed-links-'));t.after(()=>rm(root,{recursive:true,force:true}));const editor=path.join(root,'editor');await mkdir(path.join(editor,'threads'),{recursive:true});
 const source=path.join(root,'threads.db'),db=new DatabaseSync(source);db.exec('CREATE TABLE threads(id TEXT,summary TEXT,updated_at TEXT,data_type TEXT,data BLOB)');db.close();const original=await readFile(source);
 const target=path.join(editor,'threads/threads.db');await link(source,target);await assert.rejects(importZedHistory(source,editor),/자신/);assert.deepEqual(await readFile(source),original);
 await rm(target);await rm(path.join(editor,'history-backups'),{recursive:true});const external=path.join(root,'external');await mkdir(external);await symlink(external,path.join(editor,'history-backups'),'dir');await assert.rejects(importZedHistory(source,editor),/저장 경로/);assert.deepEqual(await readFile(source),original);
});
