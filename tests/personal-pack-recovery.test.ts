import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const exec = promisify(execFile);
const python = process.env.NED_TEST_PYTHON ?? path.resolve('.cache/openviking/env-linux/bin/python3');
test('SDK validates and isolates a 13242-file legacy archive without changing content; tampered source is rejected', { skip: !existsSync(python), timeout: 120000 }, async t => {
  const work = await mkdtemp(path.join(tmpdir(), 'ned-pack-large-')); t.after(() => rm(work, { recursive: true, force: true }));
  const archive = path.join(work, 'source.ovpack'), output = path.join(work, 'recovered.ovpack');
  const code = String.raw`
import hashlib,json,sys,zipfile
sha=lambda b:hashlib.sha256(b).hexdigest()
entries=[dict(path='',kind='directory',user_id='default'),dict(path='resources',kind='directory',user_id='default')]; data={}
for i in range(13242):
 p='resources/note-%05d.md'%i; b=('Reference %d\n'%i).encode();data[p]=b;entries.append(dict(path=p,kind='file',user_id='default',size=len(b),sha256=sha(b)))
records=[dict(path=e['path'],size=e['size'],sha256=e['sha256']) for e in entries if e['kind']=='file']
manifest=dict(format_version=3,kind='openviking.ovpack',root=dict(name='default',uri='viking://user/default',user_id='default'),entries=entries,content_sha256=sha(json.dumps(records,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()),index=dict(records=dict(path='_ovpack/index_records.jsonl',count=0,sha256=sha(b''))))
with zipfile.ZipFile(sys.argv[1],'w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('default/',b'');z.writestr('default/files/',b'');z.writestr('default/files/resources/',b'')
 for p,b in data.items():z.writestr('default/files/'+p,b)
 z.writestr('default/_ovpack/index_records.jsonl',b'');z.writestr('default/_ovpack/manifest.json',json.dumps(manifest))
`;
  await exec(python, ['-I', '-B', '-c', code, archive]);
  const script = process.env.NED_TEST_RECOVERY_SCRIPT ?? path.resolve('distribution/personal-pack-recovery.py');
  const launcher = process.env.NED_TEST_LAUNCHER ?? path.resolve('scripts/openviking-launch.py');
  const tokenizers = process.env.NED_TEST_TOKENIZERS ?? path.resolve('vendor/runtime/windows-x64/openviking/tokenizers');
  const user = 'ned-import-' + '1'.repeat(32);
  const result = await exec(python, ['-I', '-B', script, archive, output, user, launcher, tokenizers], { timeout: 100000, maxBuffer: 1024 * 1024 });
  assert.equal(JSON.parse(result.stdout).root, 'viking://user/' + user);
  await exec(python, ['-I', '-B', '-c', String.raw`
import json,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as a, zipfile.ZipFile(sys.argv[2]) as b:
 old={n[len('default/files/'):]:a.read(n) for n in a.namelist() if n.startswith('default/files/') and not n.endswith('/')}
 new={n[len(sys.argv[3]+'/files/'):]:b.read(n) for n in b.namelist() if n.startswith(sys.argv[3]+'/files/') and not n.endswith('/')}
 assert len(old)==13242 and old==new
`, archive, output, user]);
  const bad = path.join(work, 'bad.ovpack');
  await exec(python, ['-I', '-B', '-c', String.raw`
import sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as a,zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as b:
 for n in a.namelist():b.writestr(n,b'TAMPERED' if n=='default/files/resources/note-00000.md' else a.read(n))
`, archive, bad]);
  await assert.rejects(exec(python, ['-I', '-B', script, bad, path.join(work, 'must-not-exist.ovpack'), user, launcher, tokenizers], { timeout: 100000 }));
  assert.equal(existsSync(path.join(work, 'must-not-exist.ovpack')), false);
});
