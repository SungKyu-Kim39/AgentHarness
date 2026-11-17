"""Build machine only: restore immutable inputs, never regenerate pins from the network."""
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent.parent

def fetch(url, target, expected, size=None):
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists() or target.stat().st_size < 512 and target.read_bytes().startswith(b'version https://git-lfs.github.com/spec/v1'):
        part = target.with_suffix(target.suffix + '.part')
        with urllib.request.urlopen(url, timeout=120) as response, part.open('wb') as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
        part.replace(target)
    h = hashlib.sha256()
    with target.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    if h.hexdigest() != expected or size is not None and target.stat().st_size != size:
        raise RuntimeError('Release input integrity mismatch: ' + target.name)
    print('Verified input:', target.name, target.stat().st_size)

if __name__ == '__main__':
    baseline = json.loads((ROOT / 'release-runtime-lock.json').read_text())['baseline']
    fetch('https://media.githubusercontent.com/media/SungKyu-Kim39/AgentHarness/1392b93209ac9c9ba764eab52f099da1129bcbcc/downloads/' + baseline['name'],
          ROOT / 'downloads' / baseline['name'], baseline['sha256'], baseline['bytes'])
    lock = json.loads((ROOT / 'openviking-upgrade-lock.json').read_text())
    for item in [*lock['packages'], lock['source']]:
        fetch(item['url'], ROOT / '.cache/openviking/upgrade-0.5.5' / item['filename'], item['sha256'])
