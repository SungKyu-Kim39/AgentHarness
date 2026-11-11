import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const python = path.resolve('.cache/openviking/env-linux/bin/python3');
test('cold tokenizers and real SDK imports use only bundled data despite bad inherited cache settings', { skip: !existsSync(python) }, () => {
  const script = String.raw`
import asyncio, hashlib, importlib.util, json, os, pathlib, shutil, socket, sys, tempfile, urllib.request
with tempfile.TemporaryDirectory(prefix='l-vibe-cold-tokenizers-') as folder:
    root = pathlib.Path(folder)
    cache = root / 'owned-cache'
    shutil.copytree(sys.argv[2], cache)
    bad = root / 'bad-inherited-cache'
    bad.mkdir()
    metadata = json.loads((cache / 'assets.json').read_text())
    cl = next(a for a in metadata['assets'] if a['url'].endswith('/cl100k_base.tiktoken'))
    (bad / cl['path']).write_bytes((cache / cl['path']).read_bytes().replace(b'\n', b'\r\n'))
    os.environ.clear()
    os.environ.update({'HOME': str(root), 'USERPROFILE': str(root), 'APPDATA': str(root), 'LOCALAPPDATA': str(root),
                      'TEMP': str(root), 'TMP': str(root), 'TMPDIR': str(root),
                      'TIKTOKEN_CACHE_DIR': str(bad), 'CUSTOM_TIKTOKEN_CACHE_DIR': str(bad),
                      'LITELLM_LOCAL_MODEL_COST_MAP': 'True', 'LITELLM_TELEMETRY': 'False',
                      'HF_HUB_OFFLINE': '1', 'TRANSFORMERS_OFFLINE': '1', 'DO_NOT_TRACK': '1', 'OTEL_SDK_DISABLED': 'true'})
    tempfile.tempdir = None
    attempts = []
    def blocked(*args, **kwargs):
        attempts.append('network')
        raise AssertionError('Tokenizer or SDK attempted network access')
    import requests
    requests.sessions.Session.request = blocked
    urllib.request.urlopen = blocked
    socket.socket.connect = socket.socket.connect_ex = socket.getaddrinfo = blocked
    spec = importlib.util.spec_from_file_location('l_vibe_launch', sys.argv[1])
    launch = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(launch)
    names = launch.configure_tokenizers(cache)
    import tiktoken, tiktoken.load
    from openviking.server.app import create_app
    import litellm.litellm_core_utils.default_encoding
    for name in names:
        codec = tiktoken.get_encoding(name)
        text = 'L-Vibe offline Korean: 한글 테스트'
        assert codec.decode(codec.encode(text)) == text
    assert pathlib.Path(os.environ['TIKTOKEN_CACHE_DIR']) == cache
    assert pathlib.Path(os.environ['CUSTOM_TIKTOKEN_CACHE_DIR']) == cache
    loop = asyncio.get_event_loop()
    loop.close()
    # A late cache miss must fail locally without invoking tiktoken's downloader.
    file = cache / cl['path']
    original = file.read_bytes()
    file.unlink()
    for action in [lambda: tiktoken.load.read_file_cached(cl['url'], cl['sha256']), lambda: launch.configure_tokenizers(cache)]:
        try:
            action()
            raise AssertionError('Missing bundled data was accepted')
        except RuntimeError as error:
            assert 'tokenizer' in str(error)
    file.write_bytes(b'corrupt data')
    try:
        tiktoken.load.read_file_cached(cl['url'], cl['sha256'])
        raise AssertionError('Corrupted data was accepted')
    except RuntimeError:
        pass
    assert file.read_bytes() == b'corrupt data', 'Must not delete corrupt files and retry online'
    file.write_bytes(original)
    launch.configure_tokenizers(cache)
    try:
        tiktoken.load.read_file_cached('https://unbundled.example/encoding')
        raise AssertionError('Unbundled tokenizer attempted a fallback')
    except RuntimeError:
        pass
    assert len(attempts) == 0, attempts
    assert hashlib.sha256((bad / cl['path']).read_bytes()).hexdigest() != cl['sha256']
    print(json.dumps({'encodings': len(names), 'networkAttempts': len(attempts), 'realSdkImport': True, 'missingAndCorruptRejected': True}))
`;
  const stdout = execFileSync(python, ['-I', '-B', '-c', script, path.resolve('scripts/openviking-launch.py'), path.resolve('vendor/runtime/windows-x64/openviking/tokenizers')], { encoding: 'utf8', timeout: 90000 });
  const result = JSON.parse(stdout.trim().split('\n').at(-1));
  assert.deepEqual(result, { encodings: 7, networkAttempts: 0, realSdkImport: true, missingAndCorruptRejected: true });
});
