import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
test('cumulative host patch preserves and rolls back the exact original or startup-patched host', async () => {
const code = String.raw`import importlib.util,sys,tempfile,hashlib
from pathlib import Path
spec=importlib.util.spec_from_file_location('fix',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
sha=lambda b:hashlib.sha256(b).hexdigest()
for original in (b'original',b'startup-fix'):
 with tempfile.TemporaryDirectory() as folder:
  p=Path(folder);app=p/'app';payload=p/'payload';(app/'resources').mkdir(parents=True);payload.mkdir()
  (app/'Ned.exe').write_bytes(b'exe');(app/'resources/app.asar').write_bytes(original);(payload/'app.asar').write_bytes(b'updated')
  secret=p/'settings.enc.json';secret.write_bytes(b'private-settings')
  manifest=dict(exeSha256=sha(b'exe'),baselineAsarSha256=[sha(b'original'),sha(b'startup-fix')],updatedAsarSha256=sha(b'updated'),fixId='fixture')
  assert m.apply(app,payload,manifest)['status']=='applied'
  assert m.apply(app,payload,manifest)['status']=='already-applied'
  assert (app/'resources/app.asar.ned-config-restart-1.backup').read_bytes()==original
  assert m.apply(app,payload,manifest,True)['status']=='rolled-back'
  assert (app/'resources/app.asar').read_bytes()==original
  assert m.apply(app,payload,manifest,True)['status']=='already-rolled-back'
  (payload/'app.asar').write_bytes(b'tampered')
  try:m.apply(app,payload,manifest);raise AssertionError('tamper accepted')
  except ValueError as e:assert str(e)=='PATCH_INTEGRITY_FAILED'
  assert secret.read_bytes()==b'private-settings'
  (app/'resources/app.asar').write_bytes(b'unknown')
  try:m.apply(app,payload,manifest);raise AssertionError('unknown accepted')
  except ValueError as e:assert str(e)=='UNEXPECTED_HOST_VERSION'
print('CUMULATIVE_PATCH_AND_ROLLBACK_OK')`;
const { stdout } = await promisify(execFile)('python3', ['-I', '-B', '-c', code, path.resolve('distribution/ned/apply-host-fix.py')]);
assert.match(stdout, /CUMULATIVE_PATCH_AND_ROLLBACK_OK/);
});
