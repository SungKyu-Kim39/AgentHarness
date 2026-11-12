import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
const exec=promisify(execFile);
test('archive patch accepts only the original host, is idempotent and reverses without touching credentials or data',async()=>{
 const code=String.raw`import importlib.util,sys,tempfile,hashlib
from pathlib import Path
spec=importlib.util.spec_from_file_location('fix',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
with tempfile.TemporaryDirectory() as folder:
 p=Path(folder);app=p/'app';payload=p/'payload';(app/'resources').mkdir(parents=True);payload.mkdir()
 (app/'Ned.exe').write_bytes(b'exe');(app/'resources/app.asar').write_bytes(b'original');(payload/'app.asar').write_bytes(b'updated')
 secret=p/'settings.enc.json';secret.write_bytes(b'private-user-settings')
 sha=lambda b:hashlib.sha256(b).hexdigest()
 manifest=dict(exeSha256=sha(b'exe'),baselineAsarSha256=sha(b'original'),updatedAsarSha256=sha(b'updated'),fixId='fixture')
 assert m.apply(app,payload,manifest)['status']=='applied'
 assert m.apply(app,payload,manifest)['status']=='already-applied'
 assert (app/'resources/app.asar.ned-startup-1.backup').read_bytes()==b'original'
 assert m.apply(app,payload,manifest,True)['status']=='rolled-back'
 assert m.apply(app,payload,manifest,True)['status']=='already-rolled-back'
 assert secret.read_bytes()==b'private-user-settings'
 (payload/'app.asar').write_bytes(b'corrupted')
 try:m.apply(app,payload,manifest);raise AssertionError('tamper accepted')
 except ValueError as e:assert str(e)=='PATCH_INTEGRITY_FAILED'
 assert (app/'resources/app.asar').read_bytes()==b'original'
 (payload/'app.asar').write_bytes(b'updated');(app/'resources/app.asar').write_bytes(b'unknown-version')
 try:m.apply(app,payload,manifest);raise AssertionError('version accepted')
 except ValueError as e:assert str(e)=='UNEXPECTED_HOST_VERSION'
 assert (app/'resources/app.asar').read_bytes()==b'unknown-version'
 print('PATCH_AND_ROLLBACK_OK')`;
 const {stdout}=await exec('python3',['-I','-B','-c',code,path.resolve('distribution/ned/apply-startup-fix.py')]);assert.match(stdout,/PATCH_AND_ROLLBACK_OK/);
});
