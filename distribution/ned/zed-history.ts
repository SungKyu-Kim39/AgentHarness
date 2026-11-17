import { DatabaseSync, backup } from 'node:sqlite';
import { zstdCompressSync, zstdDecompressSync } from 'node:zlib';
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const columns=['id','summary','updated_at','data_type','data','parent_id','folder_paths','folder_paths_order','created_at'];
const schema=`CREATE TABLE IF NOT EXISTS threads (id TEXT PRIMARY KEY, summary TEXT NOT NULL, updated_at TEXT NOT NULL, data_type TEXT NOT NULL, data BLOB NOT NULL, parent_id TEXT, folder_paths TEXT, folder_paths_order TEXT, created_at TEXT)`;
async function safeFile(file:string, optional=false) {
  const info=await lstat(file).catch((e:NodeJS.ErrnoException)=>{if(optional&&e.code==='ENOENT')return undefined;throw e;});
  if(info&&(!info.isFile()||info.isSymbolicLink()||info.size>1024*1024*1024))throw Error('대화 DB는 1 GiB 이하의 로컬 일반 파일이어야 합니다.');
  return info;
}
const active=new Set<string>();
/** No source configuration, raw logs, model keys or inherited sandbox grants are imported. */
export async function importZedHistory(source:string, editorData:string) {
  const key=process.platform==='win32'?path.resolve(editorData).toLowerCase():path.resolve(editorData);
  if(active.has(key))throw Error('대화 가져오기가 진행 중입니다. 완료 후 다시 시도하세요.');
  active.add(key);try{return await importHistorySnapshot(source,editorData);}finally{active.delete(key);}
}
async function importHistorySnapshot(source:string, editorData:string) {
  if(!path.isAbsolute(source)||/^\\\\|^\/\//.test(source)||path.extname(source).toLowerCase()!=='.db')throw Error('로컬 Zed threads.db 파일을 선택하세요.');
  const sourceInfo=(await safeFile(source))!;
  const folder=path.join(editorData,'threads'), target=path.join(folder,'threads.db');
  if(path.resolve(source)===path.resolve(target))throw Error('Ned 자신의 대화 DB는 가져올 수 없습니다.');
  const backupRoot=path.join(editorData,'history-backups');
  for(const dir of [editorData,folder,backupRoot]){const s=await lstat(dir).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return undefined;throw e;});if(s&&(!s.isDirectory()||s.isSymbolicLink()))throw Error('Ned 대화 저장 경로 오류');if(!s)await mkdir(dir,{mode:0o700});}
  const existing=await safeFile(target,true);
  if(existing&&existing.dev===sourceInfo.dev&&existing.ino===sourceInfo.ino)throw Error('Ned 자신의 대화 DB는 가져올 수 없습니다.');
  const store=path.join(backupRoot,randomUUID());await mkdir(store,{mode:0o700});
  let input:DatabaseSync|undefined, snapshot:DatabaseSync|undefined, output:DatabaseSync|undefined;
  let committed=false;
  const result={imported:0,duplicates:0,conflicts:0,unsupported:0,backup:existing?path.join(store,'ned-before.db'):undefined};
  try {
    input=new DatabaseSync(source,{readOnly:true});
    // SQLite backup includes committed WAL pages and observes a coherent read snapshot.
    await backup(input,path.join(store,'zed-source.db'));input.close();input=undefined;
    snapshot=new DatabaseSync(path.join(store,'zed-source.db'),{readOnly:true});
    const names=new Set(snapshot.prepare('PRAGMA table_info(threads)').all().map(r=>String(r.name)));
    if(!columns.slice(0,5).every(c=>names.has(c)))throw Error('지원하지 않는 Zed 대화 DB 형식입니다. 원본은 변경하지 않았습니다.');
    const count=Number(snapshot.prepare('SELECT count(*) AS n FROM threads').get()!.n);if(count>20000)throw Error('대화가 20,000개를 초과합니다. 나누어 가져올 수 있는지 확인하세요.');
    output=new DatabaseSync(target);output.exec('PRAGMA busy_timeout=3000');
    if(existing)await backup(output,result.backup!);
    output.exec('BEGIN IMMEDIATE');
    try {
    output.exec(schema);
    const dest=new Set(output.prepare('PRAGMA table_info(threads)').all().map(r=>String(r.name)));
    if(!columns.slice(0,5).every(c=>dest.has(c)))throw Error('Ned 대화 DB 형식을 확인하세요. 원본과 백업을 보존했습니다.');
    for(const name of columns.slice(5))if(!dest.has(name)){output.exec(`ALTER TABLE threads ADD COLUMN ${name} TEXT`);dest.add(name);}
    const fields=columns.filter(c=>dest.has(c));
    const insert=output.prepare(`INSERT INTO threads (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')})`);
    const exists=output.prepare('SELECT summary, updated_at, data_type, data FROM threads WHERE id=?');
    const rows=snapshot.prepare('SELECT '+columns.map(c=>names.has(c)?c:`NULL AS ${c}`).join(',')+' FROM threads');
      for(const row of rows.iterate()) {
        try{
          if(typeof row.id!=='string'||row.id.length>256||typeof row.summary!=='string'||typeof row.updated_at!=='string'||!(row.data instanceof Uint8Array)||row.data.length>16*1024*1024||!['json','zstd'].includes(String(row.data_type)))throw Error();
          const plain=row.data_type==='zstd'?zstdDecompressSync(row.data,{maxOutputLength:32*1024*1024}):Buffer.from(row.data);
          const thread=JSON.parse(plain.toString());
          if(thread.version!=='0.3.0'||!Array.isArray(thread.messages))throw Error();
          thread.sandbox_grants={};thread.model=null;
          const encoded=Buffer.from(JSON.stringify(thread)); row.data=row.data_type==='zstd'?zstdCompressSync(encoded):encoded;
          const prior=exists.get(row.id);
          if(prior){if(prior.summary===row.summary&&prior.updated_at===row.updated_at&&prior.data_type===row.data_type&&Buffer.from(prior.data as Uint8Array).equals(row.data))result.duplicates++;else result.conflicts++;continue;}
        }catch{result.unsupported++;continue;}
        insert.run(...fields.map(c=>row[c] as string|number|Uint8Array|null));result.imported++;
      }
      output.exec('COMMIT');committed=true;
    }catch(e){output.exec('ROLLBACK');throw e;}
    return result;
  }finally{input?.close();snapshot?.close();output?.close();if(!existing&&!committed)await rm(target,{force:true});}
}
