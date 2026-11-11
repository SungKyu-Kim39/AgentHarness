import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import urllib.parse
import urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text())['version']
audit = json.loads((root / f'downloads/L-Vibe-{version}-bundle-audit.json').read_text())
base = 'https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/'

def clean_url(value):
    return urllib.parse.urlsplit(value)._replace(query='', fragment='').geturl()

def verify_installer():
    item = audit['installer']
    url = base + item['name']
    with urllib.request.urlopen(urllib.request.Request(url, method='HEAD'), timeout=60) as response:
        assert response.status == 200
        size = int(response.headers['Content-Length'])
        assert size == item['bytes'], size
        target = clean_url(response.geturl())
    request = urllib.request.Request(url, headers={'Range': 'bytes=0-65535'})
    with urllib.request.urlopen(request, timeout=60) as response:
        sample = response.read(65536)
        assert response.status in (200, 206) and len(sample) == 65536 and sample[:2] == b'MZ'
        status = response.status
    result = dict(name=item['name'], url=url, responseUrl=target, status=200, bytes=size,
                  method='HEAD size and PE header range; SHA-256 is the verified Git LFS object ID',
                  rangeStatus=status, sampledBytes=len(sample), gitLfsOid=item['sha256'])
    print(json.dumps(result), flush=True)
    return result

def verify_archive():
    url = base + audit['archive']
    digest = hashlib.sha256()
    size = 0
    with urllib.request.urlopen(url, timeout=60) as response:
        assert response.status == 200
        while block := response.read(4 * 1024 * 1024):
            size += len(block)
            digest.update(block)
        result = dict(name=audit['archive'], url=url, responseUrl=clean_url(response.geturl()),
                      status=response.status, bytes=size, sha256=digest.hexdigest(), method='full GET and streaming SHA-256')
    assert size == audit['bytes'] and result['sha256'] == audit['sha256'], result
    print(json.dumps(result), flush=True)
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
    jobs = [executor.submit(verify_installer), executor.submit(verify_archive)]
    files = [job.result() for job in jobs]
result = dict(version=version, verifiedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), files=files)
(root / '.cache/public-download-audit.json').write_text(json.dumps(result, indent=2) + '\n')
