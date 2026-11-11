import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

test('offline OpenViking repair preserves user data, rejects tampering and rolls back interrupted writes', () => {
  const script = String.raw`
import hashlib, importlib.util, json, pathlib, sys, tempfile
spec = importlib.util.spec_from_file_location('l_vibe_fix', sys.argv[1])
fix = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fix)
sha = lambda b: hashlib.sha256(b).hexdigest()
completed = []
for scenario in ['apply', 'tampered-payload', 'unknown-installation', 'resume', 'rollback']:
    with tempfile.TemporaryDirectory(prefix='l-vibe-fix-test-') as folder:
        root = pathlib.Path(folder)
        payload = root / 'payload'
        install = root / 'install'
        data = root / 'data'
        runtime = install / 'resources/runtime/windows-x64/openviking'
        for directory in [payload, runtime, data / 'openviking/data']:
            directory.mkdir(parents=True)
        (data / 'settings.enc.json').write_bytes(b'PRIVATE_ENCRYPTED_CONFIGURATION')
        (data / 'openviking/data/knowledge.bin').write_bytes(b'PRIVATE_KNOWLEDGE')
        old = b'original launcher\n'
        new = b'updated launcher\n'
        old_manifest = json.dumps({'files': [{'path': 'launch.py', 'sha256': sha(old)}]}).encode()
        new_manifest = json.dumps({'files': [{'path': 'launch.py', 'sha256': sha(new)}]}).encode()
        fix.OLD_MANIFEST, fix.OLD_LAUNCH = sha(old_manifest), sha(old)
        fix.NEW_MANIFEST, fix.NEW_LAUNCH = sha(new_manifest), sha(new)
        for name, content in [('launch.py', new), ('original-launch.py', old), ('manifest.json', new_manifest)]:
            (payload / name).write_bytes(content)
        (runtime / 'launch.py').write_bytes(new if scenario == 'resume' else old)
        (runtime / 'manifest.json').write_bytes(old_manifest)
        original_replace = fix.replace
        if scenario == 'tampered-payload':
            (payload / 'launch.py').write_bytes(b'UNREVIEWED_CODE')
        if scenario == 'unknown-installation':
            (runtime / 'manifest.json').write_bytes(b'UNKNOWN_INSTALLATION')
        if scenario == 'rollback':
            failed = [False]
            def injected(file, source):
                if file.name == 'manifest.json' and not failed[0]:
                    failed[0] = True
                    raise OSError('simulated manifest replacement failure')
                return original_replace(file, source)
            fix.replace = injected
        try:
            if scenario in ['tampered-payload', 'unknown-installation', 'rollback']:
                try:
                    fix.apply(payload, install, data)
                    raise AssertionError('Expected the repair to fail safely')
                except (RuntimeError, OSError):
                    pass
                assert (runtime / 'launch.py').read_bytes() == old
                assert (runtime / 'manifest.json').read_bytes() == (b'UNKNOWN_INSTALLATION' if scenario == 'unknown-installation' else old_manifest)
            else:
                result = fix.apply(payload, install, data)
                assert result['status'] == 'applied'
                backup = pathlib.Path(result['backup'])
                assert (backup / 'launch.py').read_bytes() == old
                assert (backup / 'manifest.json').read_bytes() == old_manifest
                assert (runtime / 'launch.py').read_bytes() == new
                assert (runtime / 'manifest.json').read_bytes() == new_manifest
                assert fix.apply(payload, install, data)['status'] == 'already-applied'
        finally:
            fix.replace = original_replace
        assert (data / 'settings.enc.json').read_bytes() == b'PRIVATE_ENCRYPTED_CONFIGURATION'
        assert (data / 'openviking/data/knowledge.bin').read_bytes() == b'PRIVATE_KNOWLEDGE'
        completed.append(scenario)
print(json.dumps(completed))
`;
  const result = JSON.parse(execFileSync('python3', ['-I', '-B', '-c', script, path.resolve('distribution/openviking-loopback-fix.py')], { encoding: 'utf8', timeout: 15000 }));
  assert.deepEqual(result, ['apply', 'tampered-payload', 'unknown-installation', 'resume', 'rollback']);
});
