"""Build-PC only: stage pinned Windows x64 workspace tools (Office, PDF tables, AST, Bandit, kordoc, Mermaid).

Produces a deterministic SHA-256 manifest.json under resources/runtime/windows-x64/workspace-tools.
All packages are verified against workspace-tools-lock.json (SHA-256) and workspace-tools-node-lock.json (npm ci).
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache/workspace-tools'
LOCK = ROOT / 'workspace-tools-lock.json'
NODE_LOCK = ROOT / 'workspace-tools-node-lock.json'


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest_file(file: Path) -> str:
    h = hashlib.sha256()
    with file.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def fetch_wheel(url: str, dest: Path, expected_sha: str):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.is_file() and digest_file(dest) == expected_sha:
        return
    for attempt in range(3):
        tmp = dest.with_suffix(dest.suffix + '.part')
        with urllib.request.urlopen(url, timeout=120) as resp, tmp.open('wb') as out:
            shutil.copyfileobj(resp, out)
        actual = digest_file(tmp)
        if actual == expected_sha:
            tmp.replace(dest)
            return
        tmp.unlink(missing_ok=True)
        if attempt == 2:
            raise RuntimeError(f'Wheel hash mismatch for {dest.name}: expected {expected_sha}, got {actual}')


def stage_python(target_site: Path, packages: list):
    if target_site.exists():
        shutil.rmtree(target_site)
    target_site.mkdir(parents=True, exist_ok=True)
    wheel_dir = CACHE / 'wheels'
    for pkg in packages:
        filename = pkg['url'].rsplit('/', 1)[-1]
        wheel = wheel_dir / filename
        fetch_wheel(pkg['url'], wheel, pkg['sha256'])
        with zipfile.ZipFile(wheel) as z:
            for member in z.infolist():
                if member.is_dir():
                    continue
                parts = Path(member.filename).parts
                if any(p in ('..', '.') for p in parts) or not member.filename.isascii():
                    continue
                if '__pycache__' in parts or member.filename.endswith(('.pyc', '.pyo')):
                    continue
                # Extract pure site-packages entries and dist-info (including LICENSE notices)
                if '.data/' in member.filename:
                    continue
                out = target_site / member.filename
                out.parent.mkdir(parents=True, exist_ok=True)
                with z.open(member) as src, out.open('wb') as dst:
                    shutil.copyfileobj(src, dst)


def stage_node(target_node: Path):
    node_cache = CACHE / 'node-build'
    node_cache.mkdir(parents=True, exist_ok=True)
    pinned = NODE_LOCK.read_bytes()
    data = json.loads(pinned)
    (node_cache / 'package.json').write_text(json.dumps({**data['packages'][''], 'private': True}, indent=2) + '\n', encoding='utf-8')
    existing = (node_cache / 'package-lock.json').read_bytes() if (node_cache / 'package-lock.json').exists() else None
    (node_cache / 'package-lock.json').write_bytes(pinned)
    if existing != pinned or not (node_cache / 'node_modules/kordoc/package.json').exists() or not (node_cache / 'node_modules/mermaid/dist/mermaid.min.js').exists():
        subprocess.run(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], cwd=node_cache, check=True)

    if target_node.exists():
        shutil.rmtree(target_node)
    target_nm = target_node / 'node_modules'
    target_nm.mkdir(parents=True, exist_ok=True)

    # Copy kordoc and its minimal runtime dependencies (skip huge unrelated mermaid dev/chunk files)
    nm = node_cache / 'node_modules'
    # Copy mermaid single standalone minified bundle + package.json + LICENSE (~5MB instead of 40MB chunks)
    mermaid_dst = target_nm / 'mermaid'
    (mermaid_dst / 'dist').mkdir(parents=True, exist_ok=True)
    shutil.copyfile(nm / 'mermaid/dist/mermaid.min.js', mermaid_dst / 'dist/mermaid.min.js')
    shutil.copyfile(nm / 'mermaid/package.json', mermaid_dst / 'package.json')
    for lic in ('LICENSE', 'LICENSE.md', 'LICENSE.txt'):
        if (nm / 'mermaid' / lic).is_file():
            shutil.copyfile(nm / 'mermaid' / lic, mermaid_dst / lic)
            break

    # Resolve kordoc's dependency closure from package-lock.json so only kordoc runtime deps are copied
    packages_meta = data.get('packages', {})
    visited = set()
    queue = ['kordoc']
    while queue:
        pkg_name = queue.pop(0)
        if pkg_name in visited:
            continue
        visited.add(pkg_name)
        meta = packages_meta.get(f'node_modules/{pkg_name}')
        if not meta:
            continue
        for dep in (meta.get('dependencies') or {}).keys():
            if dep not in visited:
                queue.append(dep)

    for pkg_name in sorted(visited):
        src_dir = nm / pkg_name
        if not src_dir.is_dir():
            continue
        dst_dir = target_nm / pkg_name
        for p in sorted(src_dir.rglob('*')):
            if not p.is_file():
                continue
            rel = p.relative_to(src_dir).as_posix()
            if not rel.isascii() or rel.endswith('.map'):
                continue
            out = dst_dir / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(p, out)


def main():
    if len(sys.argv) < 2:
        raise SystemExit('Usage: bundle-workspace-tools.py <target-dir>')
    target = Path(sys.argv[1]).resolve()
    lock = json.loads(LOCK.read_text(encoding='utf-8'))
    CACHE.mkdir(parents=True, exist_ok=True)
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True, exist_ok=True)

    stage_python(target / 'site', lock['pythonPackages'])
    stage_node(target / 'node')

    shutil.copyfile(LOCK, target / 'workspace-tools-lock.json')
    shutil.copyfile(NODE_LOCK, target / 'workspace-tools-node-lock.json')

    files = [
        {'path': p.relative_to(target).as_posix(), 'sha256': digest_file(p)}
        for p in sorted(target.rglob('*'))
        if p.is_file() and p != target / 'manifest.json'
    ]
    manifest = {
        'schemaVersion': 1,
        'version': lock['version'],
        'pythonPackages': [{'name': p['name'], 'version': p['version'], 'license': p['license']} for p in lock['pythonPackages']],
        'nodePackages': lock['nodePackages'],
        'files': files,
    }
    manifest_bytes = (json.dumps(manifest, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
    (target / 'manifest.json').write_bytes(manifest_bytes)
    total_bytes = sum(p.stat().st_size for p in target.rglob('*') if p.is_file())
    print(json.dumps({'manifestSha256': digest_bytes(manifest_bytes), 'files': len(files), 'bytes': total_bytes}))


if __name__ == '__main__':
    main()
