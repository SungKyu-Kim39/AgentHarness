"""Build the source-bound standalone Ned export repair; never include user data."""
import gzip
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile

root = Path(__file__).resolve().parent.parent
name = 'Ned-openviking-export-fix-2'
files = {
    'EXPORT_PERSONAL.cmd': 'distribution/export-openviking-personal.cmd',
    'EXPORT_PERSONAL_NO_VECTORS.cmd': 'distribution/export-openviking-personal-no-vectors.cmd',
    'CHECK_EXPORT.cmd': 'distribution/export-openviking-check.cmd',
    'export-openviking-personal.py': 'distribution/export-openviking-personal.py',
    'README.txt': 'distribution/personal-export-readme.txt',
    'LICENSE-Ned.txt': 'LICENSE',
}
commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
payloads = {}
for target, source in files.items():
    data = (root/source).read_bytes()
    if data != subprocess.check_output(['git', 'show', commit+':'+source], cwd=root):
        raise RuntimeError('Commit exact export helper source before bundling')
    if target.endswith('.cmd'):
        data = data.decode('ascii').replace('\r\n','\n').replace('\n','\r\n').encode('ascii')
    payloads[target] = data
manifest = {'schemaVersion': 1, 'tool': name, 'sourceCommit': commit,
            'includesUserData': False, 'requiresEmployeePackageInstall': False,
            'files': {key: hashlib.sha256(value).hexdigest() for key,value in payloads.items()}}
payloads['manifest.json'] = (json.dumps(manifest,indent=2)+'\n').encode()
output = root/'release/ned'/(name+'.tgz'); output.parent.mkdir(parents=True,exist_ok=True)
with output.open('wb') as stream, gzip.GzipFile(fileobj=stream,mode='wb',mtime=0) as gz, tarfile.open(fileobj=gz,mode='w') as archive:
    for relative,data in payloads.items():
        target = name+'/'+relative
        if not target.isascii(): raise ValueError('Non-ASCII package path')
        entry = tarfile.TarInfo(target); entry.size=len(data);entry.mode=0o644
        archive.addfile(entry,io.BytesIO(data))
with tarfile.open(output,'r:gz') as archive:
    members=archive.getmembers()
    assert len(members)==len(payloads) and all(item.isfile() and item.name.isascii() for item in members)
    for relative,data in payloads.items():assert archive.extractfile(name+'/'+relative).read()==data
sha=hashlib.sha256(output.read_bytes()).hexdigest()
output.with_name(output.name+'.sha256').write_text(sha+'  '+output.name+'\n')
audit={**manifest,'archive':output.name,'bytes':output.stat().st_size,'sha256':sha,'asciiPaths':True,'verifiedArchiveFiles':len(payloads)}
output.with_name(name+'-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
print(json.dumps(audit,indent=2))
