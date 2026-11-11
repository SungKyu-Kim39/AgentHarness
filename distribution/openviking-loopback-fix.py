"""Offline, reversible launcher update for the pinned L-Vibe Python bundle.

The build replaces checksum placeholders. Only launch.py and manifest.json are
updated; encrypted model settings, knowledge data and project files are not read.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import uuid

OLD_MANIFEST = "@OLD_MANIFEST@"
OLD_LAUNCH = "@OLD_LAUNCH@"
NEW_MANIFEST = "@NEW_MANIFEST@"
NEW_LAUNCH = "@NEW_LAUNCH@"


def digest(file):
    with Path(file).open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def replace(file, source):
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=file.parent, prefix="l-vibe-fix-", suffix=".tmp", delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(source.read_bytes())
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, file)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def ensure_closed():
    if os.name != "nt":
        return
    tasklist = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "System32/tasklist.exe"
    result = subprocess.run([str(tasklist), "/FI", "IMAGENAME eq L-Vibe.exe", "/FO", "CSV", "/NH"], capture_output=True, timeout=30)
    if result.returncode or b'"l-vibe.exe"' in result.stdout.lower():
        raise RuntimeError("Close L-Vibe completely before applying this fix.")


def apply(payload, install, data):
    ensure_closed()
    runtime = install / "resources/runtime/windows-x64/openviking"
    manifest = runtime / "manifest.json"
    launch = runtime / "launch.py"
    for name, expected in [("manifest.json", NEW_MANIFEST), ("launch.py", NEW_LAUNCH), ("original-launch.py", OLD_LAUNCH)]:
        if digest(payload / name) != expected:
            raise RuntimeError("Fix payload checksum mismatch: " + name)
    current_manifest, current_launch = digest(manifest), digest(launch)
    if current_manifest == NEW_MANIFEST and current_launch == NEW_LAUNCH:
        return {"status": "already-applied"}
    if current_manifest != OLD_MANIFEST or current_launch not in (OLD_LAUNCH, NEW_LAUNCH):
        raise RuntimeError("This installation does not match the supported bundle. No files were changed.")
    # The second state resumes an interrupted launcher-then-manifest update.
    backup = data / "openviking/patch-backups" / ("loopback-fix-1-" + uuid.uuid4().hex)
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copyfile(manifest, backup / "manifest.json")
    shutil.copyfile(payload / "original-launch.py", backup / "launch.py")
    try:
        replace(launch, payload / "launch.py")
        replace(manifest, payload / "manifest.json")
        if digest(launch) != NEW_LAUNCH or digest(manifest) != NEW_MANIFEST:
            raise RuntimeError("Installed fix verification failed")
    except BaseException:
        try:
            replace(launch, backup / "launch.py")
            replace(manifest, backup / "manifest.json")
        except BaseException:
            raise RuntimeError("Update and rollback failed. Preserve the baseline backup: " + str(backup)) from None
        raise
    return {"status": "applied", "backup": str(backup)}


def main():
    if os.name != "nt":
        raise RuntimeError("Run APPLY_FIX.cmd on the installed Windows PC.")
    if not os.environ.get("LOCALAPPDATA") or not os.environ.get("APPDATA"):
        raise RuntimeError("Windows user data paths are unavailable.")
    result = apply(Path(__file__).resolve().parent, Path(os.environ["LOCALAPPDATA"]) / "Programs/L-Vibe", Path(os.environ["APPDATA"]) / "L-Vibe")
    print(json.dumps(result, indent=2))
    print("Launch L-Vibe again. Your saved model settings and knowledge data were preserved.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("L-Vibe fix failed: " + str(error), file=sys.stderr)
        sys.exit(1)
