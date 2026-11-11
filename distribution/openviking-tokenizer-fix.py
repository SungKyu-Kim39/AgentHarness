"""Offline cumulative repair. Only pinned runtime files are changed, with rollback."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import sys
import tempfile
import uuid

DESCRIPTOR_SHA = "@DESCRIPTOR_SHA@"


def digest(file):
    with file.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def safe_path(root, relative):
    parts = PurePosixPath(relative).parts
    if not parts or "\\" in relative or ":" in relative or PurePosixPath(relative).is_absolute() or any(p in (".", "..") for p in parts):
        raise RuntimeError("Unsafe runtime repair path")
    target = root.joinpath(*parts)
    if not target.resolve().is_relative_to(root.resolve()):
        raise RuntimeError("Runtime repair path escapes its directory")
    return target


def replace(target, source):
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix="l-vibe-fix-", suffix=".tmp", delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(source.read_bytes())
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, target)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def ensure_closed():
    if os.name != "nt":
        return
    command = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "System32/tasklist.exe"
    result = subprocess.run([str(command), "/FI", "IMAGENAME eq L-Vibe.exe", "/FO", "CSV", "/NH"], capture_output=True, timeout=30)
    if result.returncode or b'"l-vibe.exe"' in result.stdout.lower():
        raise RuntimeError("Close L-Vibe completely before applying the repair.")


def apply(payload, install, data):
    ensure_closed()
    descriptor = payload / "PATCH-MANIFEST.json"
    if digest(descriptor) != DESCRIPTOR_SHA:
        raise RuntimeError("Repair descriptor checksum mismatch. No files were changed.")
    info = json.loads(descriptor.read_text(encoding="utf-8"))
    runtime = install / "resources/runtime/windows-x64/openviking"
    current = runtime / "manifest.json"
    current_sha = digest(current)
    if current_sha not in info["baseManifests"] + [info["newManifestSha256"]]:
        raise RuntimeError("Unsupported installed manifest. No files were changed.")
    old_files = {f["path"]: f["sha256"] for f in json.loads(current.read_text(encoding="utf-8"))["files"]}
    new_manifest = payload / "new-manifest.json"
    if digest(new_manifest) != info["newManifestSha256"]:
        raise RuntimeError("Repair manifest checksum mismatch")
    new_files = {f["path"]: f["sha256"] for f in json.loads(new_manifest.read_text(encoding="utf-8"))["files"]}
    changes = []
    complete = current_sha == info["newManifestSha256"]
    for item in info["files"]:
        target = safe_path(runtime, item["path"])
        source = safe_path(payload, item["payload"])
        if target.exists() and not target.is_file():
            raise RuntimeError("Runtime repair target is not a file. No files were changed.")
        if new_files.get(item["path"]) != item["sha256"] or digest(source) != item["sha256"]:
            raise RuntimeError("Repair payload checksum mismatch")
        actual = digest(target) if target.is_file() else None
        complete = complete and actual == item["sha256"]
        # tiktoken removes hash-mismatched wheel caches before attempting its
        # forbidden download. These three known caches may legitimately be absent.
        allowed = {item["sha256"], old_files.get(item["path"])}
        if current_sha != info["newManifestSha256"] and actual not in allowed and not (actual is None and item.get("repairMissingCache")):
            raise RuntimeError("Unexpected installed runtime file. No files were changed.")
        if actual is None and item["path"] in old_files and not item.get("repairMissingCache") and current_sha != info["newManifestSha256"]:
            raise RuntimeError("Required installed runtime file is missing")
        changes.append((target, source))
    if complete:
        return {"status": "already-applied"}
    backup = data / "openviking/patch-backups" / ("tokenizer-fix-1-" + uuid.uuid4().hex)
    backup.mkdir(parents=True, exist_ok=False)
    changes.append((current, new_manifest))
    originals = []
    for index, (target, source) in enumerate(changes):
        previous = backup / (str(index).zfill(3) + ".bin") if target.is_file() else None
        if previous is not None:
            shutil.copyfile(target, previous)
        originals.append((target, previous))
    (backup / "BACKUP.json").write_text(json.dumps([{"path": str(target.relative_to(runtime)), "file": previous.name if previous else None} for target, previous in originals], indent=2), encoding="utf-8")
    try:
        for target, source in changes:
            replace(target, source)
            if digest(target) != digest(source):
                raise RuntimeError("Installed repair verification failed")
    except BaseException:
        try:
            for target, previous in reversed(originals):
                if previous is None:
                    target.unlink(missing_ok=True)
                else:
                    replace(target, previous)
        except BaseException:
            raise RuntimeError("Repair and rollback failed. Keep the backup: " + str(backup)) from None
        raise
    return {"status": "applied", "backup": str(backup), "tokenizers": 7}


def main():
    if os.name != "nt" or not os.environ.get("LOCALAPPDATA") or not os.environ.get("APPDATA"):
        raise RuntimeError("Run APPLY_FIX.cmd on the installed Windows PC.")
    print(json.dumps(apply(Path(__file__).resolve().parent, Path(os.environ["LOCALAPPDATA"]) / "Programs/L-Vibe", Path(os.environ["APPDATA"]) / "L-Vibe"), indent=2))
    print("Run CHECK_IMPORT.cmd, then launch L-Vibe. Model settings and user data were preserved.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("L-Vibe repair failed: " + str(error), file=sys.stderr)
        sys.exit(1)
