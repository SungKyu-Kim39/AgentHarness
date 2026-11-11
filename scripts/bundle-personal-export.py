"""Build a small, source-bound offline export helper (no user data)."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
files = {
    "EXPORT_PERSONAL.cmd": "distribution/export-openviking-personal.cmd",
    "export-openviking-personal.py": "distribution/export-openviking-personal.py",
    "README.txt": "distribution/personal-export-readme.txt",
}
commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
payloads = {}
for target, source in files.items():
    data = (root / source).read_bytes()
    committed = subprocess.check_output(["git", "show", commit + ":" + source], cwd=root)
    if data != committed:
        raise RuntimeError("Commit the exact export helper source before bundling")
    if target.endswith(".cmd"):
        data = data.decode("ascii").replace("\r\n", "\n").replace("\n", "\r\n").encode("ascii")
    payloads[target] = data
manifest = {"schemaVersion": 1, "sourceCommit": commit, "requiresEmployeePackageInstall": False,
            "includesUserData": False, "files": {name: hashlib.sha256(data).hexdigest() for name, data in payloads.items()}}
payloads["manifest.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
output = root / "release/desktop/L-Vibe-personal-export-1.zip"
output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for name, data in payloads.items():
        assert name.isascii()
        archive.writestr("L-Vibe-personal-export-1/" + name, data)
with zipfile.ZipFile(output) as archive:
    assert len(archive.infolist()) == 4
    for name, data in payloads.items():
        assert archive.read("L-Vibe-personal-export-1/" + name) == data
digest = hashlib.file_digest(output.open("rb"), "sha256").hexdigest()
output.with_name(output.name + ".sha256").write_text(digest + "  " + output.name + "\n")
audit = {**manifest, "archive": output.name, "bytes": output.stat().st_size, "sha256": digest,
         "asciiPaths": True, "verifiedArchiveFiles": 4}
output.with_name("L-Vibe-personal-export-1-audit.json").write_text(json.dumps(audit, indent=2) + "\n")
print(json.dumps(audit, indent=2))
