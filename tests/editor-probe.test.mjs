import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
const run=promisify(execFile);
test('startup probe emits only pinned Rust source names and fixed categories, never panic payloads',async()=>{
 const code=String.raw`import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('probe',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
sources={'crates/paths/src/paths.rs'}
a=m.classify("thread 'main' panicked at C:\\private-machine\\crates\\paths\\src\\paths.rs:204:18:\nfailed to determine LocalAppData directory SECRET_KEY",sources)
b=m.classify("thread 'main' panicked at C:\\SECRET_KEY\\unknown.rs:8:2:\nSECRET_KEY",sources)
print(json.dumps([a,b]))`;
 const {stdout}=await run('python3',['-I','-B','-c',code,path.resolve('distribution/ned/editor-probe.py')]);
 assert.ok(!stdout.includes('SECRET_KEY'));assert.ok(!stdout.includes('private-machine'));
 const [a,b]=JSON.parse(stdout);assert.ok(a.markers.includes('local_app_data'));assert.equal(a.panicLocations[0].source,'crates/paths/src/paths.rs');assert.equal(a.panicLocations[0].line,204);assert.ok(b.panicLocations[0].sourceHash);assert.equal(b.panicLocations[0].source,undefined);
});
test('startup probe verifies its pinned source list and creates temporary profiles without a model or executable agent configuration',async()=>{
 const code=String.raw`import importlib.util,json,sys,tempfile,hashlib
from pathlib import Path
spec=importlib.util.spec_from_file_location('probe',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
b=Path(sys.argv[1]).with_name('zed-sources.json').read_bytes()
assert hashlib.sha256(b).hexdigest()==m.ALLOWED_SOURCE_SHA256
with tempfile.TemporaryDirectory() as temp:
 data,env=m.profile_env(Path(temp)/'standard',True)
 assert Path(env['USERPROFILE'],'AppData','Local').is_dir()
 assert Path(env['USERPROFILE'],'AppData','Roaming').is_dir()
 settings=json.loads((data/'config/settings.json').read_text())
 assert settings['restore_on_startup']=='empty_tab' and settings['agent_servers']=={} and settings['context_servers']=={}
 assert env['HTTP_PROXY']=='http://127.0.0.1:9'
 print('SAFE_PROFILE_OK')`;
 const {stdout}=await run('python3',['-I','-B','-c',code,path.resolve('distribution/ned/editor-probe.py')]);assert.match(stdout,/SAFE_PROFILE_OK/);
});
