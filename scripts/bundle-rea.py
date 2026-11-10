"""Build-PC only: stage the pinned static REA runtime and all resolved packages."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
STAGE = ROOT / '.cache/rea-stage'
TARGET = ROOT / 'vendor/runtime/windows-x64/rea'
LOCK = ROOT / 'rea-runtime-lock.json'

def main():
    if sys.argv[1] == 'verify':
        manifest = json.loads((TARGET / 'manifest.json').read_text())
        for file in manifest['files']:
            if hashlib.sha256((TARGET / file['path']).read_bytes()).hexdigest() != file['sha256']:
                raise RuntimeError('REA runtime integrity mismatch: ' + file['path'])
        print('Verified REA:', len(manifest['files']), 'files')
        return
    if sys.argv[1] != 'fetch': raise RuntimeError('Usage: bundle-rea.py fetch|verify')
    if not LOCK.exists():
        lock = json.loads((STAGE / 'package-lock.json').read_text())
        lock['name'] = 'l-vibe-rea-runtime'
        lock['packages']['']['dependencies']['rea-agents'] = '6.8.0'
        LOCK.write_text(json.dumps(lock, indent=2) + '\n')
    STAGE.mkdir(parents=True, exist_ok=True)
    (STAGE / 'package.json').write_text(json.dumps({'name': 'l-vibe-rea-runtime', 'private': True, 'dependencies': {'rea-agents': '6.8.0'}}) + '\n')
    shutil.copyfile(LOCK, STAGE / 'package-lock.json')
    if not (STAGE / 'node_modules/rea-agents/package.json').exists():
        subprocess.run(['npm', 'ci', '--omit=dev', '--ignore-scripts', '--os=win32', '--cpu=x64', '--no-audit', '--no-fund', '--prefix', str(STAGE)], check=True)
    if json.loads((STAGE / 'node_modules/rea-agents/package.json').read_text())['version'] != '6.8.0':
        raise RuntimeError('REA version changed')
    shutil.rmtree(TARGET, ignore_errors=True)
    shutil.copytree(STAGE / 'node_modules/rea-agents', TARGET)
    shutil.copytree(STAGE / 'node_modules', TARGET / 'node_modules', ignore=shutil.ignore_patterns('rea-agents', '.bin', '.package-lock.json'))
    files = [{'path': str(p.relative_to(TARGET)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(TARGET.rglob('*')) if p.is_file()]
    (TARGET / 'manifest.json').write_text(json.dumps({'version': '6.8.0', 'source': 'https://github.com/morluto/rea', 'mode': 'static-only', 'files': files}, indent=2) + '\n')
    print('Bundled REA 6.8.0:', len(files), 'files')

if __name__ == '__main__': main()
