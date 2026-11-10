"""Build-PC only: freeze complete Windows MCP packages, never copy a venv.

The employee installation runs only the staged interpreter, modules and binaries.
No package manager, remote Git skill or runtime downloader is invoked there.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)
CACHE = Path('.cache/mcp-build')
DEST = Path('vendor/runtime/windows-x64/mcp')
LOCK = Path('mcp-runtime-lock.json')
REQS = {
    'serena': ['serena-agent==2.1.0'],
    'git': ['mcp-server-git==2026.11.4'],
    'markitdown': ['markitdown[pdf,docx,pptx,xlsx,xls]==0.1.9', 'mcp==2.3.0', 'uvicorn', 'requests'],
    'duckdb': ['mcp-server-motherduck==1.1.0'],
}
ARCHIVES = {
    'clangd': {'version': '23.1.0', 'url': 'https://github.com/clangd/clangd/releases/download/23.1.0/clangd-windows-23.1.0.zip'},
    'git': {'version': '2.56.0.windows.4', 'url': 'https://github.com/git-for-windows/git/releases/download/v2.56.0.windows.4/MinGit-2.56.0.4-64-bit.zip'},
    'browser': {'version': '157.0.8103.50', 'url': 'https://storage.googleapis.com/chrome-for-testing-public/157.0.8103.50/win64/chrome-win64.zip'},
}
NATIVE_PACKAGES = {'msvc-runtime': {'version': '14.51.36231', 'url': 'https://files.pythonhosted.org/packages/98/33/be9ef68901200813fc174a06758b4ae48ca4eb58fa783280dd879d5fd048/msvc_runtime-14.51.36231-cp312-cp312-win_amd64.whl', 'sha256': '89f70d1a37bb64164cdb09d02dd82d6b1400e1310be2995b4ed5a9f23efe2222', 'license': 'Microsoft Visual Studio 2022 Distributable Code; bundled license applies; unmodified app-local DLLs'}}
SOURCE_ARCHIVES = {
    'serena': {'url': 'https://files.pythonhosted.org/packages/32/ef/872f87ec7bff916d0653a9bc061e80b1b9ad3fa9d408903fdbea6a9a3ac4/serena_agent-2.1.0.tar.gz', 'sha256': '312c8c7cb3fa70e3fa7fe4685e09594e31e9a9d7d090d59136a0faf2fa939a91', 'releaseTag': 'v2.1.0', 'commit': '5e4f5cd173c7ff3eed37ee3f1de6c266b937c5dc'},
    'git': {'url': 'https://codeload.github.com/git-for-windows/git/tar.gz/v2.56.0.windows.4', 'sha256': '34f83d6af52f09b997e295db337ede5bbd1613db4405c4b32a05fc9c5363758c'},
    'proxy-tools': {'file': 'distribution/mcp/wheels/proxy_tools-0.1.0.tar.gz', 'sha256': 'ccb3751f529c047e2d8a58440d86b205303cf0fe8146f784d1cbcd94f0a28010'},
}
def sha(data): return hashlib.sha256(data).hexdigest()
def save(file, value):
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
def fetch(url, file, expected=None):
    file.parent.mkdir(parents=True, exist_ok=True)
    if file.exists():
        value = sha(file.read_bytes())
        if not expected or value == expected: return value
        file.replace(file.with_suffix(file.suffix + '.' + value[:12] + '.invalid'))
    if expected:
        for folder in ['.cache/python-bundle', '.cache/openviking/wheels-win']:
            candidate = Path(folder) / file.name
            if candidate.is_file() and sha(candidate.read_bytes()) == expected:
                shutil.copyfile(candidate, file); return expected
    for attempt in range(3):
        temporary = file.with_suffix(file.suffix + '.part')
        with urllib.request.urlopen(url, timeout=120) as response, temporary.open('wb') as output:
            declared = response.headers.get('Content-Length')
            shutil.copyfileobj(response, output)
        data = temporary.read_bytes(); value = sha(data)
        if (declared and len(data) != int(declared)) or (expected and value != expected):
            if attempt == 2: raise RuntimeError('Source hash/length mismatch: ' + file.name)
            temporary.unlink(); continue
        temporary.replace(file); return value
def run(args): subprocess.run(args, check=True, stdout=subprocess.DEVNULL)

def prepare_node():
    folder = Path('.cache/mcp-node'); folder.mkdir(parents=True, exist_ok=True)
    pinned = Path('mcp-node-lock.json').read_bytes(); data = json.loads(pinned)
    existing = (folder / 'package-lock.json').read_bytes() if (folder / 'package-lock.json').exists() else None
    save(folder / 'package.json', {**data['packages'][''], 'private': True})
    (folder / 'package-lock.json').write_bytes(pinned)
    if existing != pinned or not (folder / 'node_modules/@playwright/mcp/cli.js').exists():
        subprocess.run(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], cwd=folder, check=True, env={**os.environ, 'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD': '1'})

REQUIRED = ['python/python.exe', 'python/msvcp140.dll', 'python/msvcp140_1.dll', 'licenses/MSVC-runtime-LICENSE.txt', 'git/cmd/git.exe', 'clangd/clangd_23.1.0/bin/clangd.exe', 'browser/chrome-win64/chrome.exe', 'mcp-python-worker.py', 'mcp-node-worker.cjs', 'node/@playwright/mcp/cli.js', 'node/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js', 'site/serena/serena/mcp.py', 'site/git/mcp_server_git/server.py', 'site/markitdown/markitdown_mcp/__main__.py', 'site/duckdb/mcp_server_motherduck/server.py']
def stage_native(lock):
    lock.setdefault('nativePackages', NATIVE_PACKAGES)
    for name, info in lock['nativePackages'].items():
        if name != 'msvc-runtime': raise RuntimeError('Unreviewed native package')
        wheel = CACHE / info['url'].rsplit('/', 1)[-1]; fetch(info['url'], wheel, info['sha256'])
        with zipfile.ZipFile(wheel) as archive:
            for member in archive.namelist():
                if '.data/data/' in member and member.lower().endswith('.dll'):
                    target = DEST / 'python' / Path(member).name
                    target.write_bytes(archive.read(member))
                if member.endswith('.dist-info/licenses/LICENSE'):
                    target = DEST / 'licenses/MSVC-runtime-LICENSE.txt'; target.parent.mkdir(exist_ok=True); target.write_bytes(archive.read(member))
def write_manifest(lock):
    stage_native(lock)
    lock.setdefault('sourceArchives', SOURCE_ARCHIVES)
    save(DEST / 'licenses/native-packages.json', lock['nativePackages'])
    for script in ['mcp-python-worker.py', 'mcp-node-worker.cjs']:
        shutil.copyfile(Path('scripts', script), DEST / script)
    save(DEST / 'licenses/packages.json', lock['services'])
    files = [{'path': p.relative_to(DEST).as_posix(), 'sha256': sha(p.read_bytes())} for p in sorted(DEST.rglob('*')) if p.is_file() and p != DEST / 'manifest.json' and '__pycache__' not in p.parts]
    missing = [p for p in REQUIRED if not (DEST / p).is_file()]
    save(DEST / 'manifest.json', {'schemaVersion': 1, 'complete': not missing, 'missing': missing, 'services': ['serena', 'git', 'playwright', 'markitdown', 'devtools', 'duckdb'], 'versions': {'serena': '2.1.0', 'git': '2026.11.4', 'playwright': '0.0.85', 'markitdown': '0.0.1a8', 'devtools': '1.12.0', 'duckdb': '1.1.0'}, 'files': files})
    lock['manifestSha256'] = sha((DEST / 'manifest.json').read_bytes()); save(LOCK, lock)
    print('MCP runtime staged:', len(files), 'files; complete:', not missing, '; missing:', ', '.join(missing))

def resolve(service):
    from packaging.markers import default_environment
    from packaging.requirements import Requirement
    folder = CACHE / service; folder.mkdir(parents=True, exist_ok=True)
    input = folder / 'requirements.in'; input.write_text('\n'.join(REQS[service]) + '\n')
    pinned = Path('distribution/mcp/requirements') / (service + '-windows.txt')
    if not pinned.exists():
        run(['uv', 'pip', 'compile', '--quiet', '--no-header', '--no-annotate', '--generate-hashes', '--python-version', '3.12', '--python-platform', 'x86_64-pc-windows-msvc', '-o', str(pinned), str(input)])
    # pip --platform otherwise evaluates sys_platform markers on Linux.
    env = {**default_environment(), 'sys_platform': 'win32', 'platform_system': 'Windows', 'os_name': 'nt', 'platform_machine': 'AMD64', 'python_version': '3.12', 'python_full_version': '3.12.16'}
    requirements = []
    for block in re.split(r'\n(?=\S)', pinned.read_text()):
        block = block.strip()
        if not block or block.startswith('#'): continue
        logical = block.replace('\\\n', ' ')
        head = logical.split(' --hash=', 1)[0].strip()
        req = Requirement(head)
        if req.marker and not req.marker.evaluate(env): continue
        req.marker = None
        hashes = re.findall(r'--hash=sha256:[a-f0-9]+', logical)
        requirements.append(str(req) + ' ' + ' '.join(hashes))
    resolved = folder / 'resolved.txt'
    pure = CACHE / 'pure-wheels'; pure.mkdir(exist_ok=True)
    if service == 'serena' and not list(pure.glob('proxy_tools-*.whl')):
        run([sys.executable, '-m', 'pip', 'wheel', '--quiet', '--no-deps', '--wheel-dir', str(pure), 'proxy-tools==0.1.0'])
    for wheel in pure.glob('*.whl'):
        key = wheel.name.split('-')[0].replace('_', '-')
        for i, requirement in enumerate(requirements):
            name = Requirement(requirement.split(' --hash=', 1)[0]).name.replace('_', '-')
            if name == key: requirements[i] = requirement.split(' --hash=', 1)[0] + ' --hash=sha256:' + sha(wheel.read_bytes())
    resolved.write_text('\n'.join(requirements) + '\n')
    report = folder / 'resolution.json'
    run([sys.executable, '-m', 'pip', 'install', '--quiet', '--dry-run', '--ignore-installed', '--no-deps', '--require-hashes', '--only-binary=:all:', '--platform', 'win_amd64', '--python-version', '3.12', '--implementation', 'cp', '--abi', 'cp312', '--find-links', str(pure), '--target', str(folder / 'unused'), '--report', str(report), '-r', str(resolved)])
    packages = []
    for item in json.loads(report.read_text())['install']:
        info, meta = item['download_info'], item['metadata']
        url = 'build-cache:' + info['url'].rsplit('/', 1)[-1] if info['url'].startswith('file:') else info['url']
        packages.append({'name': meta['name'], 'version': meta['version'], 'url': url, 'sha256': info['archive_info']['hashes']['sha256'], 'license': meta.get('license_expression') or meta.get('license') or 'Bundled dist-info license'})
    if service == 'markitdown':
        data = json.load(urllib.request.urlopen('https://pypi.org/pypi/markitdown-mcp/0.0.1a8/json'))
        wheel = next(f for f in data['urls'] if f['filename'].endswith('.whl'))
        packages.append({'name': 'markitdown-mcp', 'version': '0.0.1a8', 'url': wheel['url'], 'sha256': wheel['digests']['sha256'], 'license': 'MIT', 'adaptation': 'Local converters only; cloud, video and OCR extras excluded'})
    return service, packages

def unpack(service, packages, sources):
    site = DEST / 'site' / service
    shutil.rmtree(site, ignore_errors=True); site.mkdir(parents=True)
    for package in packages:
        url = package['url']; filename = url.split(':', 1)[1] if url.startswith('build-cache:') else url.rsplit('/', 1)[-1]
        if url.startswith('file:'):
            source = Path(urllib.request.url2pathname(url[5:])); cached = CACHE / 'wheels' / filename
            cached.parent.mkdir(exist_ok=True); shutil.copyfile(source, cached)
            package['url'] = 'build-cache:' + filename
        elif url.startswith('build-cache:'):
            cached = CACHE / 'wheels' / filename
            if not cached.exists():
                cached.parent.mkdir(exist_ok=True); shutil.copyfile(Path('distribution/mcp/wheels') / filename, cached)
        else:
            cached = CACHE / 'wheels' / filename; fetch(url, cached, package['sha256'])
        if sha(cached.read_bytes()) != package['sha256']: raise RuntimeError('Wheel hash mismatch')
        with zipfile.ZipFile(cached) as archive:
            for item in archive.infolist():
                if item.is_dir(): continue
                parts = Path(item.filename).parts
                if '..' in parts or Path(item.filename).is_absolute(): raise RuntimeError('Unsafe wheel path')
                relative = item.filename
                if '.data/' in relative:
                    _, section, *rest = parts
                    if section not in ('purelib', 'platlib'): continue
                    relative = '/'.join(rest)
                target = site / relative; target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(archive.read(item))
    if service == 'serena':
        source = sources['serena']; fetch(source['url'], DEST / 'licenses/serena-agent-2.1.0-source.tar.gz', source['sha256'])
        proxy = sources['proxy-tools']
        if sha(Path(proxy['file']).read_bytes()) != proxy['sha256']: raise RuntimeError('Pure wheel source archive changed')
        shutil.copyfile(proxy['file'], DEST / 'licenses/proxy-tools-0.1.0-source.tar.gz')

def main():
    mode = sys.argv[1]; CACHE.mkdir(parents=True, exist_ok=True)
    if mode == 'resolve':
        pure = CACHE / 'pure-wheels'; pure.mkdir(exist_ok=True)
        for wheel in Path('distribution/mcp/wheels').glob('*.whl'): shutil.copyfile(wheel, pure / wheel.name)
        records = dict(ThreadPoolExecutor(max_workers=4).map(resolve, REQS))
        save(LOCK, {'schemaVersion': 1, 'services': records, 'archives': ARCHIVES, 'nativePackages': NATIVE_PACKAGES, 'sourceArchives': SOURCE_ARCHIVES})
        print('Resolved MCP Python services:', ', '.join(records)); return
    lock = json.loads(LOCK.read_text())
    if mode == 'verify':
        manifest = DEST / 'manifest.json'
        if sha(manifest.read_bytes()) != lock['manifestSha256']: raise RuntimeError('MCP manifest mismatch')
        data = json.loads(manifest.read_text())
        missing = [p for p in REQUIRED if not (DEST / p).is_file()]
        if not data['complete'] or missing: raise RuntimeError('Six-MCP installer refused: runtime bundle is incomplete; missing: ' + ', '.join(missing))
        for item in data['files']:
            if sha((DEST / item['path']).read_bytes()) != item['sha256']: raise RuntimeError('MCP runtime file changed: ' + item['path'])
        print('Verified staged MCP runtime bundles'); return
    if mode == 'refresh': write_manifest(lock); return
    if mode not in ('fetch', 'fetch-without-browser'): raise RuntimeError('Usage: bundle-mcp.py resolve|fetch|fetch-without-browser|refresh|verify')
    DEST.mkdir(parents=True, exist_ok=True)
    python_lock = json.loads(Path('python-runtime-lock.json').read_text())['python']
    archive = Path('.cache/python-bundle/python.tar.gz'); fetch(python_lock['url'], archive, python_lock['sha256'])
    if not (DEST / 'python/python.exe').exists():
        with tarfile.open(archive) as source: source.extractall(DEST, filter='data')
        shutil.rmtree(DEST / 'python/Lib/site-packages', ignore_errors=True)
    sources = lock.setdefault('sourceArchives', SOURCE_ARCHIVES)
    for name, packages in lock['services'].items(): unpack(name, packages, sources)
    prepare_node()
    node = DEST / 'node'; shutil.rmtree(node, ignore_errors=True)
    shutil.copytree('.cache/mcp-node/node_modules', node, ignore=shutil.ignore_patterns('.bin', '.package-lock.json'))
    for name, info in lock['archives'].items():
        if name == 'browser' and mode == 'fetch-without-browser': continue
        archive = CACHE / (name + '.zip'); info['sha256'] = fetch(info['url'], archive, info.get('sha256'))
        target = DEST / name; shutil.rmtree(target, ignore_errors=True); target.mkdir()
        with zipfile.ZipFile(archive) as source: source.extractall(target)
    fetch(sources['git']['url'], DEST / 'licenses/git-for-windows-2.56.0.windows.4-source.tar.gz', sources['git']['sha256'])
    write_manifest(lock)
if __name__ == '__main__': main()
