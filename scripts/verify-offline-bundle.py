import hashlib
import io
import json
import pathlib
import subprocess
import tarfile

project = pathlib.Path(__file__).resolve().parent.parent
version = json.loads((project / 'package.json').read_text())['version']
folder = f'L-Vibe-{version}-windows-x64'
archive = project / 'release/desktop' / (folder + '.tgz')
expected_audit = json.loads((project / '.cache/packaged-runtime-audit.json').read_text())
digests = {}
payloads = {}
entries = 0
source_entries = 0

def ascii_path(value):
    assert value and all(32 <= ord(c) <= 126 for c in value), repr(value)

with tarfile.open(archive, 'r|gz') as tgz:
    for member in tgz:
        entries += 1
        ascii_path(member.name)
        if member.issym() or member.islnk():
            ascii_path(member.linkname)
        assert member.name == folder or member.name.startswith(folder + '/')
        if not member.isfile():
            assert member.isdir()
            continue
        name = member.name[len(folder) + 1:]
        assert name not in digests
        digest = hashlib.sha256()
        retain = name.endswith(('.json', '.md', '.txt', '.py', '.cmd')) or name.startswith('source/')
        pieces = []
        stream = tgz.extractfile(member)
        while block := stream.read(4 * 1024 * 1024):
            digest.update(block)
            if retain:
                pieces.append(block)
        digests[name] = digest.hexdigest()
        if retain:
            payloads[name] = b''.join(pieces)
        if name.startswith('source/'):
            with tarfile.open(fileobj=io.BytesIO(payloads[name]), mode='r:gz') as source:
                for entry in source:
                    ascii_path(entry.name)
                    if entry.issym() or entry.islnk():
                        ascii_path(entry.linkname)
                    source_entries += 1

required = {'GETTING_STARTED.txt', 'VALIDATION_REPORT.md', 'READINESS.json'}
assert required <= digests.keys()
manifest = json.loads(payloads['bundle-manifest.json'])
assert manifest['version'] == version and manifest['pathEncoding'] == 'ascii'
source_name = next(name for name in payloads if name.startswith('source/'))
assert payloads[source_name] == subprocess.check_output(['git', 'archive', '--format=tar.gz', manifest['sourceCommit']], cwd=project)
assert manifest['documents'] == dict(gettingStarted='GETTING_STARTED.txt', validation='VALIDATION_REPORT.md', readiness='READINESS.json', configuration='CONFIGURATION_RECOVERY.txt', licensePolicy='LICENSE_POLICY.txt', diagnostics='WINDOWS_DIAGNOSTICS.txt', modelControls='MODEL_CONTROLS.txt', personalMigration='PERSONAL_KNOWLEDGE_MIGRATION.txt')
assert manifest['releaseReady'] is False
assert json.loads(payloads['runtime-audit.json']) == expected_audit
assert json.loads(payloads['agent-config.json']) == json.loads((project / 'agent-config.example.json').read_text())
assert f'L-Vibe {version} Windows x64 설치' in payloads['GETTING_STARTED.txt'].decode('utf-8')
assert payloads['openviking-import-check.py'] == (project / 'distribution/openviking-import-check.py').read_bytes()
assert payloads['export-openviking-personal.py'] == (project / 'distribution/export-openviking-personal.py').read_bytes()
assert payloads['EXPORT_PERSONAL.cmd'].decode('ascii') == (project / 'distribution/export-openviking-personal.cmd').read_text().replace('\n', '\r\n')
assert payloads['PERSONAL_KNOWLEDGE_MIGRATION.txt'] == (project / 'docs/openviking-personal-migration.md').read_bytes()
assert payloads['CHECK_OPENVIKING.cmd'].decode('ascii') == (project / 'distribution/check-openviking.cmd').read_text().replace('\n', '\r\n')
assert 'WINDOWS_DIAGNOSTICS.txt' in payloads['GETTING_STARTED.txt'].decode('utf-8')
assert json.loads(payloads['READINESS.json'])['releaseReady'] is False
assert payloads['licenses/tokenizer-runtime-lock.json'] == (project / 'tokenizer-runtime-lock.json').read_bytes()
assert expected_audit['tokenizers']['assets'] == 6 and expected_audit['tokenizers']['encodings'] == 7
assert digests[f'L-Vibe-{version}-win-x64.exe'] == expected_audit['installer']['sha256']
checksums = {}
for line in payloads['SHA256SUMS.txt'].decode('utf-8').splitlines():
    digest, name = line.split('  ', 1)
    assert name not in checksums
    checksums[name] = digest
assert checksums == {name: digest for name, digest in digests.items() if name != 'SHA256SUMS.txt'}
assert len(digests) == 35 and len(checksums) == 34
digest = hashlib.file_digest(archive.open('rb'), 'sha256').hexdigest()
assert (archive.parent / (archive.name + '.sha256')).read_text().split()[0] == digest
result = dict(version=version, archive=archive.name, bytes=archive.stat().st_size, sha256=digest,
              sourceCommit=manifest['sourceCommit'], pathEncoding='ascii', entries=entries,
              files=len(digests), verifiedChecksums=len(checksums), sourceEntries=source_entries,
              documents=manifest['documents'], installer=expected_audit['installer'],
              configMatchesPlaceholderExample=True, releaseReady=False)
(project / '.cache/offline-bundle-audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
