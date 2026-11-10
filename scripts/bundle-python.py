"""Build-PC only: freeze and assemble a Windows Python distribution, not a copied venv."""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile

ROOT = Path('vendor/runtime/windows-x64/openviking')
CACHE = Path('.cache/python-bundle')
LOCK = Path('python-runtime-lock.json')
PYTHON_URL = 'https://github.com/astral-sh/python-build-standalone/releases/download/20261026/cpython-3.12.16+20261026-x86_64-pc-windows-msvc-install_only_stripped.tar.gz'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def download(url):
    with urllib.request.urlopen(url, timeout=120) as response:
        return response.read()

def save_json(file, data):
    Path(file).write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

def main():
    mode = sys.argv[1]
    if mode == 'verify':
        lock = json.loads(LOCK.read_text())
        manifest = ROOT / 'manifest.json'
        if digest(manifest.read_bytes()) != lock['manifestSha256']:
            raise RuntimeError('Python runtime manifest changed')
        data = json.loads(manifest.read_text())
        for entry in data['files']:
            if digest((ROOT / entry['path']).read_bytes()) != entry['sha256']:
                raise RuntimeError('Python runtime hash mismatch: ' + entry['path'])
        print('Verified Python runtime:', len(data['files']), 'files')
        return
    if mode != 'fetch':
        raise RuntimeError('Usage: bundle-python.py fetch|verify')
    CACHE.mkdir(parents=True, exist_ok=True)
    if LOCK.exists():
        lock = json.loads(LOCK.read_text())
    else:
        report = CACHE / 'resolution.json'
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--quiet', '--dry-run', '--ignore-installed', '--only-binary=:all:', '--platform', 'win_amd64', '--python-version', '3.12', '--implementation', 'cp', '--abi', 'cp312', '--target', str(CACHE / 'unused'), '--report', str(report), 'openviking==0.5.4', 'graphifyy[mcp]==0.9.105'], check=True)
        resolved = json.loads(report.read_text())
        packages = []
        for entry in resolved['install']:
            meta, info = entry['metadata'], entry['download_info']
            packages.append({'name': meta['name'], 'version': meta['version'], 'url': info['url'], 'sha256': info['archive_info']['hashes']['sha256'], 'license': meta.get('license_expression') or meta.get('license') or 'See bundled dist-info license files'})
        lock = {'schemaVersion': 1, 'python': {'version': '3.12.16', 'url': PYTHON_URL}, 'packages': sorted(packages, key=lambda p: p['name'].lower())}
    archive = CACHE / 'python.tar.gz'
    if not archive.exists():
        archive.write_bytes(download(lock['python']['url']))
    current = digest(archive.read_bytes())
    if lock['python'].get('sha256', current) != current:
        raise RuntimeError('Portable Python archive changed')
    lock['python']['sha256'] = current
    ROOT.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive) as source:
        source.extractall(ROOT, filter='data')
    site = ROOT / 'python/Lib/site-packages'
    site.mkdir(parents=True, exist_ok=True)
    def fetch_wheel(package):
        filename = package['url'].rsplit('/', 1)[-1]
        file = CACHE / filename
        cached = Path('.cache/openviking/wheels-win') / filename
        if not file.exists():
            if cached.exists(): shutil.copyfile(cached, file)
            else: file.write_bytes(download(package['url']))
        if digest(file.read_bytes()) != package['sha256']:
            raise RuntimeError('Wheel integrity mismatch: ' + package['name'])
        return file
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        wheels = list(pool.map(fetch_wheel, lock['packages']))
    for wheel in wheels:
        with zipfile.ZipFile(wheel) as package:
            for entry in package.infolist():
                name = entry.filename
                if name.endswith('/'):
                    continue
                parts = Path(name).parts
                if '..' in parts or Path(name).is_absolute():
                    raise RuntimeError('Unsafe wheel member')
                if '.data/' in name:
                    _, section, *rest = parts
                    if section not in ('purelib', 'platlib'):
                        continue
                    name = '/'.join(rest)
                target = site / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(package.read(entry))
    for script in ['openviking-launch.py', 'analysis-worker.py', 'rea-supervisor.py', 'sidecar-supervisor.py']:
        file = Path('scripts') / script
        if file.exists(): shutil.copyfile(file, ROOT / script.replace('openviking-launch.py', 'launch.py'))
    source_url = 'https://files.pythonhosted.org/packages/63/78/24eed6038a59b14d8856019c31c50b880fdc11391e61d5fe081fc17a14f9/openviking-0.5.4.tar.gz'
    source = CACHE / 'openviking-0.5.4.tar.gz'
    if not source.exists(): source.write_bytes(download(source_url))
    if digest(source.read_bytes()) != '97e6ac2a7f6c5522206c3a1e1e2ed59cbfa62d7ec890451ee726376dea321147':
        raise RuntimeError('OpenViking corresponding source integrity mismatch')
    (ROOT / 'licenses').mkdir(exist_ok=True)
    shutil.copyfile(source, ROOT / 'licenses/openviking-0.5.4-source.tar.gz')
    save_json(ROOT / 'licenses/packages.json', lock['packages'])
    files = [{'path': str(p.relative_to(ROOT)).replace(os.sep, '/'), 'sha256': digest(p.read_bytes())} for p in sorted(ROOT.rglob('*')) if p.is_file() and p.name != 'manifest.json' and '__pycache__' not in p.parts]
    save_json(ROOT / 'manifest.json', {'schemaVersion': 1, 'version': '0.5.4', 'graphifyVersion': '0.9.105', 'files': files})
    lock['manifestSha256'] = digest((ROOT / 'manifest.json').read_bytes())
    save_json(LOCK, lock)
    print('Bundled Python', lock['python']['version'], 'with', len(lock['packages']), 'pinned Windows wheels;', len(files), 'files')

if __name__ == '__main__':
    main()
