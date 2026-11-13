"""Repair compact desktop snapshot handling in pinned Ned hosts; preserve user data."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

MANIFEST_SHA256 = '__MANIFEST_SHA256__'


def digest(file):
    h = hashlib.sha256()
    with Path(file).open('rb') as stream:
        while block := stream.read(8 * 1024 * 1024): h.update(block)
    return h.hexdigest()


def regular(file):
    info = Path(file).lstat()
    return Path(file).is_file() and not Path(file).is_symlink() and not (getattr(info, 'st_file_attributes', 0) & 0x400)


def apply(app, payload, manifest, rollback=False):
    app = Path(app); payload = Path(payload)
    target = app/'resources/app.asar'; backup = app/'resources/app.asar.ned-snapshot-1.backup'; exe = app/'Ned.exe'
    if not exe.is_file() or not target.is_file() or not regular(exe) or not regular(target) or digest(exe) != manifest['exeSha256']:
        raise ValueError('NOT_THE_TARGET_NED_INSTALLATION')
    baselines = manifest['baselineAsarSha256']; new = manifest['updatedAsarSha256']; current = digest(target)
    if rollback:
        if current in baselines: return {'status':'already-rolled-back','fixId':manifest['fixId']}
        if current != new or not backup.is_file() or not regular(backup) or digest(backup) not in baselines: raise ValueError('ROLLBACK_BASELINE_MISMATCH')
        source = backup; expected = digest(backup)
    else:
        if current == new: return {'status':'already-applied','fixId':manifest['fixId']}
        if current not in baselines: raise ValueError('UNEXPECTED_HOST_VERSION')
        old = current
        name = manifest['payloadFile']
        if name not in ('host-0.3.4.asar','host-0.3.5.asar'): raise ValueError('INVALID_PAYLOAD_NAME')
        source = payload/name; expected = new
        if not source.is_file() or not regular(source) or digest(source) != new: raise ValueError('PATCH_INTEGRITY_FAILED')
        if backup.exists():
            if not regular(backup) or digest(backup) != old: raise ValueError('BACKUP_CONFLICT')
        else:
            # Preserve the exact archive needed to reverse this one patch.
            with backup.open('xb') as output, target.open('rb') as original:
                shutil.copyfileobj(original,output,8*1024*1024); output.flush(); os.fsync(output.fileno())
            if digest(backup) != old: raise ValueError('BACKUP_INTEGRITY_FAILED')
    fd, temporary = tempfile.mkstemp(prefix='.ned-snapshot-',dir=target.parent)
    try:
        with os.fdopen(fd,'wb') as output, source.open('rb') as original:
            shutil.copyfileobj(original,output,8*1024*1024); output.flush(); os.fsync(output.fileno())
        if digest(temporary) != expected or digest(target) != current: raise ValueError('HOST_CHANGED_DURING_PATCH')
        os.replace(temporary,target)
    finally:
        Path(temporary).unlink(missing_ok=True)
    return {'status':'rolled-back' if rollback else 'applied','fixId':manifest['fixId'],'hostSha256':digest(target),'settingsChanged':False}


def main():
    if os.name != 'nt': raise ValueError('WINDOWS_ONLY')
    if sys.argv[1:] not in ([],['--rollback']): raise ValueError('INVALID_ARGUMENTS')
    folder = Path(__file__).resolve().parent
    raw = (folder/'manifest.json').read_bytes()
    if hashlib.sha256(raw).hexdigest() != MANIFEST_SHA256: raise ValueError('MANIFEST_INTEGRITY_FAILED')
    manifest = json.loads(raw)
    system = Path(os.environ.get('SystemRoot',r'C:\Windows'))
    listing = subprocess.run([str(system/'System32/tasklist.exe'),'/FO','CSV','/NH'],capture_output=True,encoding='utf-8',errors='replace',check=True).stdout
    if re.search(r'^"(?:Ned|Zed)\.exe"',listing,re.I|re.M): raise ValueError('CLOSE_NED_AND_ZED_FIRST')
    app = Path(os.environ['LOCALAPPDATA'])/'Programs/Ned'
    if not regular(app/'Ned.exe'): raise ValueError('NOT_THE_TARGET_NED_INSTALLATION')
    exe_sha = digest(app/'Ned.exe')
    choices = [target for target in manifest['targets'] if target['exeSha256'] == exe_sha]
    if len(choices) != 1: raise ValueError('NOT_THE_TARGET_NED_INSTALLATION')
    selected = dict(choices[0],fixId=manifest['fixId'])
    print(json.dumps(apply(app,folder,selected,bool(sys.argv[1:])),indent=2))


if __name__=='__main__':
    try: main()
    except Exception as error:
        code = str(error) if isinstance(error,ValueError) and re.fullmatch(r'[A-Z_]{1,64}',str(error)) else 'PATCH_FAILED'
        print(json.dumps({'status':'error','code':code}));sys.exit(1)
