"""Build PC only. Fixed Ghidra/JDK archives, licenses, sources and file hashes."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache/ghidra'
LOCK = ROOT / 'ghidra-runtime-lock.json'

def digest(file):
    h = hashlib.sha256()
    with file.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''): h.update(chunk)
    return h.hexdigest()

def main():
    lock = json.loads(LOCK.read_text())
    CACHE.mkdir(parents=True, exist_ok=True)
    for item in lock['artifacts']:
        file = CACHE / item['file']
        if not file.exists(): urllib.request.urlretrieve(item['url'], file)
        if file.stat().st_size != item['bytes'] or digest(file) != item['sha256']: raise RuntimeError('Archive integrity: ' + item['file'])
    target = Path(sys.argv[1])
    if target.exists(): shutil.rmtree(target)
    target.mkdir(parents=True)
    omitted = {'files': 0, 'bytes': 0, 'categories': ['JDK development jmods/source ZIP', 'optional Ghidra extension ZIPs and standalone documentation', 'non-Windows native executables']}
    for kind in ['ghidra', 'jdk']:
        item = next(i for i in lock['artifacts'] if i['kind'] == kind)
        with zipfile.ZipFile(CACHE / item['file']) as z:
            for entry in z.infolist():
                parts = entry.filename.rstrip('/').split('/')
                if any(p in ('..', '.') or not p.isascii() for p in parts): raise RuntimeError('Archive path')
                relative = Path(*parts[1:])
                # Compiler modules, java/javac and all legal notices remain. Development
                # jmods and Java source ZIP are not needed by headless analysis.
                skip = kind == 'jdk' and (parts[1:2] == ['jmods'] or str(relative).replace('\\', '/') == 'lib/src.zip')
                if kind == 'ghidra':
                    skip = parts[1:2] in (['Extensions'], ['docs']) or any(parts[i] == 'os' and parts[i+1].startswith(('linux_', 'mac_', 'freebsd_')) for i in range(len(parts)-1))
                if skip:
                    if not entry.is_dir(): omitted['files'] += 1; omitted['bytes'] += entry.file_size
                    continue
                output = target / kind / relative
                if entry.is_dir(): output.mkdir(parents=True, exist_ok=True)
                else:
                    output.parent.mkdir(parents=True, exist_ok=True)
                    with z.open(entry) as src, output.open('wb') as dst: shutil.copyfileobj(src, dst)
    classes = CACHE / 'guard-classes'; classes.mkdir(exist_ok=True)
    subprocess.run(['java', str(ROOT / 'scripts/CompileGhidraGuard.java'), str(ROOT / 'distribution/NedOfflineNetworkGuard.java'), str(classes)], check=True)
    with zipfile.ZipFile(target / 'network-guard.jar', 'w', zipfile.ZIP_DEFLATED) as out:
        info = zipfile.ZipInfo('NedOfflineNetworkGuard.class', (2026, 1, 1, 0, 0, 0))
        out.writestr(info, (classes / info.filename).read_bytes())
    shutil.copyfile(ROOT / 'distribution/NedOfflineNetworkGuard.java', target / 'NedOfflineNetworkGuard.java')
    shutil.copyfile(LOCK, target / 'upstream-lock.json')
    files = [{'path': p.relative_to(target).as_posix(), 'sha256': digest(p)} for p in sorted(target.rglob('*')) if p.is_file()]
    manifest = {'version': lock['ghidraVersion'], 'jdkVersion': lock['jdkVersion'], 'mode': 'headless-static-only', 'omitted': omitted, 'files': files}
    (target / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({'manifestSha256': digest(target / 'manifest.json'), 'files': len(files), 'bytes': sum(p.stat().st_size for p in target.rglob('*') if p.is_file())}))

if __name__ == '__main__': main()
