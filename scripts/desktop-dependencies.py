"""Build-PC only. Acquire the exact published CLI and Windows native prebuild."""
import base64
import concurrent.futures
import hashlib
import json
from pathlib import Path
import shutil
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache/desktop-artifacts'
SOURCE = ROOT / '.cache/l-vibe-desktop/source'
LOCK = ROOT / 'desktop-runtime-lock.json'
PACKAGES = [('@opencode/cli-windows-x64-baseline', '2.2.6'),
            ('@opencode/cli-linux-x64-baseline', '2.2.6'),
            ('@lydell/node-pty-win32-x64', '1.2.0-beta.12')]

def download(url):
    with urllib.request.urlopen(url, timeout=180) as response:
        return response.read()

def acquire(item):
    name, version = item
    cached_meta = CACHE / (name.replace('/', '-') + '.json')
    metadata = json.loads(cached_meta.read_text()) if cached_meta.exists() else json.loads(download('https://registry.npmjs.org/' + name + '/' + version))
    cached_meta.write_text(json.dumps(metadata, indent=2) + '\n')
    dist = metadata['dist']
    archive = CACHE / (name.replace('/', '-') + '-' + version + '.tgz')
    if not archive.exists(): archive.write_bytes(download(dist['tarball']))
    data = archive.read_bytes()
    actual = 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode()
    if actual != dist['integrity']: raise RuntimeError('Package integrity mismatch: ' + name)
    if name.startswith('@opencode/'):
        target = SOURCE / 'packages/cli/dist' / name.split('/')[1]
    else:
        target = SOURCE / 'node_modules' / name
    target.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive) as package:
        members = package.getmembers()
        members = [entry for entry in members if entry.name.rstrip('/') != 'package']
        for entry in members:
            if not entry.name.startswith('package/'): raise RuntimeError('Unexpected package member')
            entry.name = entry.name[len('package/'):]
        package.extractall(target, members=members, filter='data')
    if name == '@opencode/cli-linux-x64-baseline': (target / 'bin/opencode').chmod(0o755)
    print('Prepared', name, version, flush=True)
    return {'name': name, 'version': version, 'url': dist['tarball'], 'integrity': actual,
            'sha256': hashlib.sha256(data).hexdigest(), 'license': metadata['license']}

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        packages = list(pool.map(acquire, PACKAGES))
    # The GitHub API tarball endpoint is unavailable on the build network. The
    # official codeload archive must have EXACTLY the integrity in upstream bun.lock.
    url = 'https://codeload.github.com/anomalyco/ghostty-web/legacy.tar.gz/e91e38a9ceb13c566ddfa15185a9393849f712a9'
    archive = CACHE / 'ghostty.tar.gz'
    if not archive.exists(): archive.write_bytes(download(url))
    data = archive.read_bytes()
    integrity = 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode()
    expected = 'sha512-EUTn6D7Pc61P8EA4qFiy1KNXW8ORr23mkerDdyZR6ngDh0do/m1QP++t/uzzw6kRpxMes1gRifxjbTvdU7w++Q=='
    if integrity != expected: raise RuntimeError('Ghostty archive differs from upstream lock')
    target = SOURCE / 'node_modules/ghostty-web'
    target.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive) as package:
        members = package.getmembers()
        for entry in members: entry.name = '/'.join(entry.name.split('/')[1:])
        package.extractall(target, members=members, filter='data')
    if not (target / 'dist/ghostty-web.js').exists(): raise RuntimeError('Ghostty prebuilt library missing')
    packages.append({'name': 'ghostty-web', 'commit': 'e91e38a9ceb13c566ddfa15185a9393849f712a9',
                     'url': url, 'integrity': integrity, 'sha256': hashlib.sha256(data).hexdigest(), 'license': 'MIT'})
    LOCK.write_text(json.dumps({'schemaVersion': 1, 'packages': packages}, indent=2) + '\n')

if __name__ == '__main__': main()
