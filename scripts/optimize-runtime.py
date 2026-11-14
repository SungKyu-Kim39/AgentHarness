"""Build-PC only: lossless pure-Python SDK packing; no package pruning or runtime downloads."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import zipfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def inventory(root):
    return [{'path': p.relative_to(root).as_posix(), 'sha256': digest(p.read_bytes())}
            for p in sorted(root.rglob('*')) if p.is_file() and p != root / 'manifest.json']


def remove_source_caches(root):
    removed = []
    for file in sorted(root.rglob('*.pyc')):
        if file.parent.name != '__pycache__':
            continue
        name = file.name.split('.cpython-', 1)[0] + '.py'
        source = file.parent.parent / name
        if source.is_file() and not source.is_symlink():
            removed.append({'path': file.relative_to(root).as_posix(), 'bytes': file.stat().st_size})
            file.unlink()
    for directory in sorted(root.rglob('__pycache__'), reverse=True):
        if directory.is_dir() and not any(directory.iterdir()):
            directory.rmdir()
    return {'files': len(removed), 'bytes': sum(f['bytes'] for f in removed), 'canonicalSourcePreserved': True}


def pack_sdks(site):
    archive = site / 'ned-sdk-code.zip'
    if archive.exists():
        raise RuntimeError('Optimize a fresh verified staging tree, not an already packed runtime')
    packages = []
    entries = []
    for directory in sorted(site.iterdir()):
        if not directory.is_dir() or directory.name.endswith('.dist-info'):
            continue
        if directory.name != 'lark_oapi' and not directory.name.startswith('volcenginesdk'):
            continue
        files = sorted(p for p in directory.rglob('*') if p.is_file())
        # Asset-bearing/native/path-sensitive packages remain untouched.
        if not files or any(p.is_symlink() or p.suffix != '.py' or b'__file__' in p.read_bytes() for p in files):
            continue
        for file in files:
            relative = file.relative_to(site).as_posix()
            if not relative.isascii() or '..' in Path(relative).parts:
                raise RuntimeError('Unsafe SDK source path')
            entries.append((relative, file.read_bytes()))
        packages.append(directory)
    if not entries:
        return {'packages': [], 'files': 0, 'originalBytes': 0, 'archiveBytes': 0}
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
        for relative, data in entries:
            info = zipfile.ZipInfo(relative, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            output.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(archive) as output:
        if output.testzip() is not None or output.namelist() != [name for name, _ in entries]:
            raise RuntimeError('SDK archive index/CRC mismatch')
        for name, data in entries:
            if output.read(name) != data:
                raise RuntimeError('SDK source changed while packing: ' + name)
    (site / 'ned-sdk-code.pth').write_text('ned-sdk-code.zip\n', encoding='ascii')
    result = {'packages': [p.name for p in packages], 'files': len(entries),
              'originalBytes': sum(len(data) for _, data in entries),
              'archiveBytes': archive.stat().st_size, 'archiveSha256': digest(archive.read_bytes()),
              'everySourceByteVerified': True, 'nativeAndAssetPackagesUnchanged': True}
    # Delete only after every ZIP member is proven byte-identical.
    for directory in packages:
        shutil.rmtree(directory)
    return result


def optimize(resources, source_output):
    runtime = resources / 'runtime/windows-x64'
    report = {'schemaVersion': 1, 'method': 'lossless pure-Python ZIP import and offline source handover',
              'windowsExecutionVerified': False, 'sourceArchives': [], 'components': {}}
    report['sourceCacheRemoval'] = remove_source_caches(runtime)
    sdk = pack_sdks(runtime / 'openviking/python/Lib/site-packages')
    report['sdkPacking'] = sdk
    source_output.mkdir(parents=True, exist_ok=True)
    for component in ['openviking', 'mcp', 'rea', 'agent-desktop']:
        base = runtime / component
        manifest = base / 'manifest.json'
        before = manifest.read_bytes()
        data = json.loads(before)
        for p in sorted(base.rglob('*')):
            # Preserve runtime data archives (e.g. botocore JSON). Move only named source distributions.
            if p.is_file() and p.name.endswith(('.tar.gz', '.tgz')) and ('-source.' in p.name or p.name == 'source.tar.gz'):
                target = source_output / (component + '-' + p.name)
                shutil.copyfile(p, target)
                if digest(p.read_bytes()) != digest(target.read_bytes()):
                    raise RuntimeError('Source handover copy mismatch')
                report['sourceArchives'].append({'component': component, 'originalPath': p.relative_to(resources).as_posix(),
                                                'handoverFile': target.name, 'sha256': digest(target.read_bytes()), 'bytes': target.stat().st_size})
                p.unlink()
        data['files'] = inventory(base)
        encoded = (json.dumps(data, indent=2) + '\n').encode()
        manifest.write_bytes(encoded)
        report['components'][component] = {'originalManifestSha256': digest(before), 'manifestSha256': digest(encoded), 'files': len(data['files'])}
    report['sourceArchivesRetainedInOfflineHandover'] = True
    report['payloadFilesAvoided'] = max(0, sdk['files'] - 2) + report['sourceCacheRemoval']['files']
    report['installedBytesAvoided'] = sdk['originalBytes'] - sdk['archiveBytes'] + sum(s['bytes'] for s in report['sourceArchives']) + report['sourceCacheRemoval']['bytes']
    (resources / 'ned/runtime-optimization.json').write_text(json.dumps(report, indent=2) + '\n')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('resources', type=Path)
    parser.add_argument('source_output', type=Path)
    args = parser.parse_args()
    print(json.dumps(optimize(args.resources, args.source_output), indent=2))
