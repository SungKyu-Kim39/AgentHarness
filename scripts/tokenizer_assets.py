"""Build-time staging of fixed tokenizer data, including the canonical LiteLLM cache."""
import ast
import hashlib
import json
from pathlib import Path
import shutil
import tarfile
import urllib.request

PROJECT = Path(__file__).resolve().parent.parent
LOCK = PROJECT / "tokenizer-runtime-lock.json"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def cache_name(url):
    return hashlib.sha1(url.encode("utf-8"), usedforsecurity=False).hexdigest()


def stage(runtime):
    runtime = Path(runtime)
    lock = json.loads(LOCK.read_text(encoding="utf-8"))
    source = runtime / "python/Lib/site-packages/tiktoken_ext/openai_public.py"
    tree = ast.parse(source.read_text(encoding="utf-8"))
    required = {}
    encodings = None
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "ENCODING_CONSTRUCTORS" for t in node.targets):
            encodings = {ast.literal_eval(key) for key in node.value.keys}
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Name):
            continue
        kwargs = {k.arg: ast.literal_eval(k.value) for k in node.keywords}
        if node.func.id == "load_tiktoken_bpe":
            required[ast.literal_eval(node.args[0])] = kwargs["expected_hash"]
        elif node.func.id == "data_gym_to_mergeable_bpe_ranks":
            required[kwargs["vocab_bpe_file"]] = kwargs["vocab_bpe_hash"]
            required[kwargs["encoder_json_file"]] = kwargs["encoder_json_hash"]
    pinned = {a["url"]: a["sha256"] for a in lock["assets"]}
    if required != pinned or encodings != set(lock["encodings"]):
        raise RuntimeError("Tokenizer lock differs from the pinned encoding constructors")
    output = runtime / "tokenizers"
    output.mkdir(parents=True, exist_ok=True)
    cache = PROJECT / ".cache/tokenizer-assets"
    cache.mkdir(parents=True, exist_ok=True)
    records = []
    vendor = runtime / "python/Lib/site-packages/litellm/litellm_core_utils/tokenizers"
    repaired = []
    for item in lock["assets"]:
        name = cache_name(item["url"])
        cached = cache / name
        source_archive = next(a for a in lock["archives"] if item["url"].rsplit("/", 1)[-1] in a["members"])
        if not cached.is_file() or sha(cached.read_bytes()) != item["sha256"]:
            archive = cache / source_archive["url"].rsplit("/", 1)[-1]
            if not archive.is_file() or sha(archive.read_bytes()) != source_archive["sha256"]:
                with urllib.request.urlopen(source_archive["url"], timeout=60) as response:
                    archive.write_bytes(response.read())
            if sha(archive.read_bytes()) != source_archive["sha256"]:
                raise RuntimeError("Tokenizer source archive hash mismatch")
            with tarfile.open(archive) as source_tar:
                data = source_tar.extractfile(source_archive["members"][item["url"].rsplit("/", 1)[-1]]).read()
            if sha(data) != item["sha256"]:
                raise RuntimeError("Official tokenizer data hash mismatch: " + name)
            cached.write_bytes(data)
        data = cached.read_bytes()
        if sha(data) != item["sha256"]:
            raise RuntimeError("Tokenizer build cache is damaged: " + name)
        # Write bytes, never text: upstream Windows-built wheel data can have
        # CRLF and fail tiktoken's canonical SHA-256, triggering a re-download.
        (output / name).write_bytes(data)
        if (vendor / name).is_file():
            (vendor / name).write_bytes(data)
            repaired.append((vendor / name).relative_to(runtime).as_posix())
        records.append({**item, "path": name, "bytes": len(data), "sourceArchive": source_archive["url"], "sourceArchiveSha256": source_archive["sha256"]})
    licenses = list((runtime / "python/Lib/site-packages").glob("tiktoken-*.dist-info/licenses/LICENSE"))
    if len(licenses) != 1:
        raise RuntimeError("Pinned tiktoken license is missing")
    shutil.copyfile(licenses[0], output / "LICENSE.tiktoken.txt")
    shutil.copyfile(PROJECT / "distribution/GPT-2-LICENSE.txt", output / "LICENSE.gpt2.txt")
    metadata = {"schemaVersion": 1, "package": lock["package"], "version": lock["version"],
                "lockSha256": sha(LOCK.read_bytes()), "encodings": lock["encodings"], "assets": records,
                "canonicalVendorFiles": repaired, "licenses": ["LICENSE.tiktoken.txt", "LICENSE.gpt2.txt"],
                "vendorRepairReason": "Replace CRLF rank files with bytes matching upstream tiktoken SHA-256; no third-party code changes."}
    (output / "assets.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print("Staged tokenizer data:", len(records), "assets;", len(lock["encodings"]), "encodings;", len(repaired), "canonical vendor files")
    return metadata


if __name__ == "__main__":
    import sys
    stage(Path(sys.argv[1]) if len(sys.argv) > 1 else PROJECT / "vendor/runtime/windows-x64/openviking")
