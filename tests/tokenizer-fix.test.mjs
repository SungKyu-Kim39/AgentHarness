import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

test('cumulative tokenizer repair restores deleted wheel caches and rolls back without changing user data', () => {
  const script = String.raw`
import hashlib, importlib.util, json, pathlib, sys, tempfile
spec = importlib.util.spec_from_file_location('fix', sys.argv[1])
fix = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fix)
sha = lambda b: hashlib.sha256(b).hexdigest()
complete = []
for scenario in ['old-cache-deleted', 'unpatched-base', 'tampered', 'unknown', 'rollback', 'resume']:
    with tempfile.TemporaryDirectory(prefix='l-vibe-token-fix-') as folder:
        root = pathlib.Path(folder); payload = root/'payload'; install = root/'install'; data = root/'data'
        runtime = install/'resources/runtime/windows-x64/openviking'
        for p in [payload, runtime, data]: p.mkdir(parents=True)
        (data/'settings.enc.json').write_bytes(b'PRIVATE_CONFIGURATION')
        (data/'knowledge.db').write_bytes(b'PRIVATE_KNOWLEDGE')
        old_launch, new_launch = b'old-launch', b'new-launch'
        old_cache, new_cache = b'old-CRLF\r\n', b'canonical-LF\n'
        old = json.dumps({'files':[{'path':'launch.py','sha256':sha(old_launch)}, {'path':'wheel-cache','sha256':sha(old_cache)}]}).encode()
        alternate = json.dumps({'files':[{'path':'launch.py','sha256':sha(old_launch)}, {'path':'wheel-cache','sha256':sha(old_cache)}], 'oldBase':True}).encode()
        new = json.dumps({'files':[{'path':'launch.py','sha256':sha(new_launch)}, {'path':'wheel-cache','sha256':sha(new_cache)}, {'path':'tokenizers/data','sha256':sha(new_cache)}]}).encode()
        files = []
        for index,(name,content) in enumerate([('launch.py',new_launch),('wheel-cache',new_cache),('tokenizers/data',new_cache)]):
            part = str(index)+'.bin';(payload/part).write_bytes(content)
            files.append({'path':name,'sha256':sha(content),'payload':part,'repairMissingCache':name=='wheel-cache'})
        descriptor = json.dumps({'baseManifests':[sha(old),sha(alternate)],'newManifestSha256':sha(new),'files':files}).encode()
        (payload/'PATCH-MANIFEST.json').write_bytes(descriptor);fix.DESCRIPTOR_SHA=sha(descriptor)
        (payload/'new-manifest.json').write_bytes(new)
        (runtime/'manifest.json').write_bytes(alternate if scenario=='unpatched-base' else old)
        (runtime/'launch.py').write_bytes(new_launch if scenario=='resume' else old_launch)
        if scenario!='old-cache-deleted': (runtime/'wheel-cache').write_bytes(old_cache)
        if scenario=='tampered': (payload/'0.bin').write_bytes(b'UNREVIEWED_CODE')
        if scenario=='unknown': (runtime/'manifest.json').write_bytes(b'UNKNOWN_INSTALL')
        original_replace=fix.replace
        failed=[False]
        if scenario=='rollback':
            def injected(target,source):
                if target.name=='manifest.json' and not failed[0]:
                    failed[0]=True;raise OSError('manifest write failed')
                return original_replace(target,source)
            fix.replace=injected
        try:
            if scenario in ['tampered','unknown','rollback']:
                try:
                    fix.apply(payload,install,data);raise AssertionError('unsafe repair succeeded')
                except (RuntimeError,OSError): pass
                assert (runtime/'launch.py').read_bytes()==old_launch
                assert not (runtime/'tokenizers/data').exists()
                assert (runtime/'manifest.json').read_bytes()==(b'UNKNOWN_INSTALL' if scenario=='unknown' else old)
            else:
                assert fix.apply(payload,install,data)['status']=='applied'
                assert (runtime/'wheel-cache').read_bytes()==new_cache
                assert (runtime/'tokenizers/data').read_bytes()==new_cache
                assert fix.digest(runtime/'manifest.json')==sha(new)
                assert fix.apply(payload,install,data)['status']=='already-applied'
        finally: fix.replace=original_replace
        assert (data/'settings.enc.json').read_bytes()==b'PRIVATE_CONFIGURATION'
        assert (data/'knowledge.db').read_bytes()==b'PRIVATE_KNOWLEDGE'
        complete.append(scenario)
print(json.dumps(complete))
`;
  const cases = JSON.parse(execFileSync('python3', ['-I', '-B', '-c', script, path.resolve('distribution/openviking-tokenizer-fix.py')], { encoding: 'utf8', timeout: 15000 }));
  assert.deepEqual(cases, ['old-cache-deleted', 'unpatched-base', 'tampered', 'unknown', 'rollback', 'resume']);
});
