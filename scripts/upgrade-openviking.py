"""Build-PC only: upgrade a verified Python bundle, with fixed offline inputs.

prepare downloads the reviewed artifacts; apply never uses the network. The old
installer and release metadata remain unchanged. Wheel ownership and Windows
dependency markers are checked before a new manifest is accepted.
"""
import argparse
import csv
import email
import hashlib
import io
import json
from pathlib import Path
import shutil
import urllib.request
import zipfile
from packaging.markers import default_environment
from packaging.requirements import Requirement
from packaging.utils import canonicalize_name

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache/openviking/upgrade-0.5.5'
LOCK = ROOT / 'openviking-upgrade-lock.json'
BASE_MANIFEST = '6b62b83f14351ca5450e281410070b0f443e17f0d8a4756706f658ffba339ee7'
ARTIFACTS = [
    dict(name='openviking', version='0.5.5', filename='openviking-0.5.5-cp310-abi3-win_amd64.whl',
         url='https://files.pythonhosted.org/packages/60/2c/234a1e3cc5cf9061f6ac590fb99f440fb9f98f2440038a074a8707657007/openviking-0.5.5-cp310-abi3-win_amd64.whl',
         sha256='42b55e84fd5a67d33813a6e3cfed483353751d576fee3ec9f449cca1a412334c'),
]

def digest(value):
    return hashlib.sha256(value).hexdigest()

def save(file, data):
    file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def fetch(item):
    file = CACHE / item['filename']
    if not file.exists():
        with urllib.request.urlopen(item['url'], timeout=120) as response:
            file.write_bytes(response.read())
    if digest(file.read_bytes()) != item['sha256']:
        raise RuntimeError('Pinned upgrade artifact mismatch: ' + item['filename'])
    return file

def metadata(archive):
    name = next(n for n in archive.namelist() if n.endswith('.dist-info/METADATA'))
    return email.message_from_bytes(archive.read(name))

def prepare():
    CACHE.mkdir(parents=True, exist_ok=True)
    # The direct dependency changed in 0.5.5; all other existing pins are kept.
    with urllib.request.urlopen('https://pypi.org/pypi/litellm/1.103.10/json', timeout=30) as response:
        info = json.load(response)
    wheel = next(f for f in info['urls'] if f['filename'].endswith('win_amd64.whl'))
    items = ARTIFACTS + [dict(name='litellm', version='1.103.10', filename=wheel['filename'], url=wheel['url'], sha256=wheel['digests']['sha256'])]
    if items[1]['sha256'] != 'adbcbb663a9cc96331de0f6ddd60e81d883288b901b7a4f6fbbfeb66edb669cd':
        raise RuntimeError('LiteLLM artifact differs from reviewed release')
    source = dict(filename='openviking-0.5.5.tar.gz', url='https://files.pythonhosted.org/packages/0f/d8/858cceeba435f6983ed6d05992c6a4ec9315b47045fba53d8c47699ce7a5/openviking-0.5.5.tar.gz',
                  sha256='038fa5cdd1c175ce7e8e08791fad999fda08f65a5ac7326ab1aa3b1a471d1d7d')
    for item in [*items, source]:
        fetch(item)
    save(LOCK, dict(schemaVersion=1, version='0.5.5', baselineManifestSha256=BASE_MANIFEST, packages=items, source=source))

def apply(target, record=False):
    lock = json.loads(LOCK.read_text())
    manifest = target / 'manifest.json'
    if lock['schemaVersion'] != 1 or lock['version'] != '0.5.5' or lock['baselineManifestSha256'] != BASE_MANIFEST:
        raise RuntimeError('Unreviewed upgrade lock')
    before = json.loads(manifest.read_text())
    if digest(manifest.read_bytes()) != BASE_MANIFEST or before['version'] != '0.5.4':
        raise RuntimeError('Upgrade requires the exact verified unoptimized 0.5.4 baseline')
    for item in before['files']:
        if digest((target / item['path']).read_bytes()) != item['sha256']:
            raise RuntimeError('Baseline file changed: ' + item['path'])
    expected = {item['path'] for item in before['files']}
    actual = {p.relative_to(target).as_posix() for p in target.rglob('*') if p.is_file() and p != manifest and '__pycache__' not in p.parts}
    # The historical builder excluded these two nested manifest.json files.
    # They belong to OpenViking and are replaced by the pinned new wheel below.
    historical_extras = {'python/Lib/site-packages/openviking/system_assets/manifest.json',
                         'python/Lib/site-packages/openviking/web_studio/dist/manifest.json'}
    if expected - actual or actual - expected - historical_extras:
        raise RuntimeError('Baseline contains unexpected or missing files')
    site = target / 'python/Lib/site-packages'
    old_lock = json.loads((ROOT / 'python-runtime-lock.json').read_text())
    packages = {canonicalize_name(p['name']): p for p in old_lock['packages']}
    for item in lock['packages']:
        wheel = CACHE / item['filename']
        if digest(wheel.read_bytes()) != item['sha256']:
            raise RuntimeError('Offline upgrade wheel missing or corrupt')
        with zipfile.ZipFile(wheel) as archive:
            meta = metadata(archive)
            if canonicalize_name(meta['Name']) != item['name'] or meta['Version'] != item['version']:
                raise RuntimeError('Wheel metadata mismatch')
            old_meta = []
            for file in site.glob('*.dist-info/METADATA'):
                m = email.message_from_bytes(file.read_bytes())
                if canonicalize_name(m['Name']) == item['name']:
                    old_meta.append(file.parent)
            if len(old_meta) != 1:
                raise RuntimeError('Ambiguous installed distribution: ' + item['name'])
            record_file = old_meta[0] / 'RECORD'
            for row in csv.reader(io.StringIO(record_file.read_text())):
                rel = row[0]
                # Entry-point scripts are not shipped/used by Ned. Never follow
                # RECORD paths outside the reviewed site-packages directory.
                if not rel or '..' in Path(rel).parts or Path(rel).is_absolute():
                    continue
                file = site / rel
                if file.is_file():
                    file.unlink()
            shutil.rmtree(old_meta[0])
            for entry in archive.infolist():
                name = entry.filename
                if entry.is_dir():
                    continue
                if not name.isascii() or '..' in Path(name).parts or Path(name).is_absolute() or '\\' in name:
                    raise RuntimeError('Unsafe or non-ASCII wheel member')
                if '.data/' in name:
                    _, section, *rest = Path(name).parts
                    if section not in ('purelib', 'platlib'):
                        continue
                    name = '/'.join(rest)
                file = site / name
                file.parent.mkdir(parents=True, exist_ok=True)
                file.write_bytes(archive.read(entry))
            packages[item['name']] = dict(name=meta['Name'], version=item['version'], url=item['url'], sha256=item['sha256'],
                                          license=meta.get('License-Expression') or meta.get('License') or 'See bundled license')
    # Evaluate the full installed dependency graph for the target Windows Python.
    environment = default_environment()
    environment.update(sys_platform='win32', platform_system='Windows', os_name='nt', platform_machine='AMD64', python_version='3.12', python_full_version='3.12.16')
    for file in site.glob('*.dist-info/METADATA'):
        meta = email.message_from_bytes(file.read_bytes())
        for text in meta.get_all('Requires-Dist', []):
            req = Requirement(text)
            extras = ['', 'mcp'] if canonicalize_name(meta['Name']) == 'graphifyy' else ['']
            if req.marker and not any(req.marker.evaluate({**environment, 'extra': extra}) for extra in extras):
                continue
            dependency = packages.get(canonicalize_name(req.name))
            if dependency is None or dependency['version'] not in req.specifier:
                raise RuntimeError('Windows dependency closure failed: ' + meta['Name'] + ': ' + text)
    source = CACHE / lock['source']['filename']
    if digest(source.read_bytes()) != lock['source']['sha256']:
        raise RuntimeError('Corresponding source hash mismatch')
    previous = target / 'licenses/openviking-0.5.4-source.tar.gz'
    previous.unlink()
    shutil.copyfile(source, target / 'licenses/openviking-0.5.5-source.tar.gz')
    for script in ['openviking-launch.py', 'analysis-worker.py', 'sidecar-supervisor.py']:
        source_script = ROOT / 'scripts' / script
        if script == 'sidecar-supervisor.py' and lock.get('supervisorBaseline'):
            baseline = lock['supervisorBaseline']
            source_script = ROOT / baseline['file']
            if digest(source_script.read_bytes()) != baseline['sha256']:
                raise RuntimeError('Reviewed supervisor preimage differs')
        shutil.copyfile(source_script, target / script.replace('openviking-launch.py', 'launch.py'))
    updated = {**old_lock, 'openViking': {'version': lock['version'], 'source': lock['source']},
               'packages': sorted(packages.values(), key=lambda p: p['name'].lower())}
    save(target / 'licenses/packages.json', updated['packages'])
    files = [dict(path=p.relative_to(target).as_posix(), sha256=digest(p.read_bytes())) for p in sorted(target.rglob('*'))
             if p.is_file() and p != manifest and '__pycache__' not in p.parts]
    save(manifest, {**before, 'version': lock['version'], 'files': files})
    updated['manifestSha256'] = digest(manifest.read_bytes())
    if record:
        save(ROOT / 'python-runtime-lock.json', updated)
    elif updated['manifestSha256'] != old_lock['manifestSha256']:
        raise RuntimeError('Upgraded runtime differs from the reviewed target manifest')
    print(json.dumps(dict(version=lock['version'], packages=len(updated['packages']), files=len(files), manifestSha256=updated['manifestSha256'])))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['prepare', 'apply'])
    parser.add_argument('target', nargs='?', type=Path)
    parser.add_argument('--record', action='store_true')
    args = parser.parse_args()
    if args.mode == 'prepare':
        prepare()
    else:
        if args.target is None:
            parser.error('apply requires an isolated staging directory')
        apply(args.target.resolve(), args.record)
