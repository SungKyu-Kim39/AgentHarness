"""Ned build-owned adapter: validate an original OVPack, then isolate its user root.

Original content bytes and archive stay untouched. The pinned SDK validates both
packages. Vector metadata is rebuilt for the new identity, never relabelled.
"""
import hashlib
from contextlib import redirect_stdout
import json
import os
import re
import runpy
import shutil
import sys
import zipfile

def recover():
    source, target, user, launcher, tokenizers = sys.argv[1:]
    if not re.fullmatch(r"ned-import-[a-f0-9]{32}", user):
        raise ValueError("OV_RECOVERY_ID")
    os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"
    helper = runpy.run_path(launcher)
    helper["restrict_python_network"]({"embedding": {"dense": {"api_base": "http://127.0.0.1:1/v1"}}})
    helper["configure_tokenizers"](tokenizers)
    from openviking.storage.ovpack import operations as ov
    
    def validate(z):
        infos = z.infolist()
        base = ov.base_name_from_entries(infos)
        manifest = ov.read_manifest(z, base)
        ov.validate_manifest_root_matches_zip(manifest, base)
        uri = manifest["root"]["uri"]
        if not re.fullmatch(r"viking://user/[A-Za-z0-9][A-Za-z0-9_-]{0,127}", uri):
            raise ValueError("OV_RECOVERY_SCOPE")
        members = ov.validated_import_members(infos, base, uri)
        records = ov.validate_manifest_content(z, manifest, infos, base)
        ov.read_dense_vectors(z, manifest, base, records)
        return manifest, members
    
    with zipfile.ZipFile(source) as original:
        manifest, members = validate(original)
        source_root = manifest["root"]["uri"]
        manifest["root"].update(name=user, uri="viking://user/" + user, user_id=user)
        for entry in manifest["entries"]:
            entry["user_id"] = user
        manifest["index"] = {"records": {"path": ov.OVPACK_INDEX_RECORDS_PATH, "count": 0, "sha256": hashlib.sha256(b"").hexdigest()}}
        with zipfile.ZipFile(target, "x", zipfile.ZIP_DEFLATED, allowZip64=True) as out:
            out.writestr(user + "/", b"")
            out.writestr(user + "/files/", b"")
            for _, source_name, kind, relative in members:
                if kind not in {"directory", "file"} or not relative:
                    continue
                name = user + "/files/" + relative
                if kind == "directory":
                    out.writestr(name.rstrip("/") + "/", b"")
                else:
                    with original.open(source_name) as reader, out.open(name, "w", force_zip64=True) as writer:
                        shutil.copyfileobj(reader, writer, 1024 * 1024)
            out.writestr(user + "/" + ov.OVPACK_INDEX_RECORDS_PATH, b"")
            out.writestr(user + "/" + ov.OVPACK_MANIFEST_ZIP_LEAF, json.dumps(manifest, ensure_ascii=False).encode())
    with zipfile.ZipFile(target) as normalized:
        validate(normalized)
    return {"sourceRoot": source_root, "root": "viking://user/" + user, "contentBytesUnchanged": True}

if __name__ == "__main__":
    with redirect_stdout(sys.stderr):
        proof = recover()
    print(json.dumps(proof))
