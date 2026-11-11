"""Export a user subtree through the local OpenViking API; never edits its DB."""
import argparse
import datetime
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import urllib.error
import urllib.parse
import urllib.request
import zipfile

MAX_PACK = 512 * 1024 * 1024


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def export_user(base_url, api_key, account, user, output):
    parsed = urllib.parse.urlsplit(base_url)
    if (parsed.scheme != "http" or parsed.hostname not in ("127.0.0.1", "localhost")
            or parsed.username or parsed.password or parsed.path not in ("", "/")
            or parsed.query or parsed.fragment or not parsed.port):
        raise ValueError("Use a loopback HTTP URL with an explicit port.")
    for value in (account, user):
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,127}", value):
            raise ValueError("Invalid account/user ID.")
    if user == "local-user":
        raise ValueError("Export a legacy user, not L-Vibe's active local-user.")
    output = Path(output).absolute()
    partial = output.with_name(output.name + ".partial")
    checksum = output.with_name(output.name + '.sha256')
    if output.exists() or partial.exists() or checksum.exists():
        raise ValueError("Output exists. Choose a new filename; nothing was overwritten.")
    headers = {"Content-Type": "application/json", "X-OpenViking-Account": account,
               "X-OpenViking-User": user}
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
        headers["X-API-Key"] = api_key
    request = urllib.request.Request(
        f"http://127.0.0.1:{parsed.port}/api/v1/pack/export",
        data=json.dumps({"uri": "viking://user/" + user, "include_vectors": True}).encode(),
        headers=headers, method="POST")
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    digest = hashlib.sha256(); size = 0
    created_partial = False
    created_output = False
    completed = False
    try:
        with partial.open("xb") as stream:
            created_partial = True
            os.chmod(partial, 0o600)
            with opener.open(request, timeout=300) as response:
                if response.status != 200:
                    raise ValueError("Export did not return HTTP 200.")
                while block := response.read(1024 * 1024):
                    size += len(block)
                    if size > MAX_PACK:
                        raise ValueError("Export exceeds the 512 MiB import limit.")
                    digest.update(block); stream.write(block)
        with zipfile.ZipFile(partial) as archive:
            manifest_path = user + "/_ovpack/manifest.json"
            if archive.getinfo(manifest_path).file_size > 8 * 1024 * 1024:
                raise ValueError("Manifest exceeds the supported size.")
            manifest = json.loads(archive.read(manifest_path))
            if (manifest.get("kind") != "openviking.ovpack"
                    or manifest.get("format_version") != 3
                    or manifest.get("root", {}).get("uri") != "viking://user/" + user):
                raise ValueError("Unexpected OVPack user scope or format.")
        # Exclusive creation also works on removable FAT/exFAT media.
        with output.open('xb') as destination, partial.open('rb') as source:
            created_output = True
            os.chmod(output, 0o600)
            shutil.copyfileobj(source, destination, 1024 * 1024)
        partial.unlink()
        with checksum.open("x", encoding="utf-8") as stream:
            stream.write(digest.hexdigest() + "  " + output.name + "\n")
        completed = True
        return {"status": "exported", "file": str(output), "bytes": size,
                "sha256": digest.hexdigest(), "root": "viking://user/" + user,
                "formatVersion": 3, "vectorsRequested": True}
    finally:
        if created_partial:
            partial.unlink(missing_ok=True)
        if created_output and not completed:
            output.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:1935")
    parser.add_argument("--account", default="default")
    parser.add_argument("--user", default="default")
    parser.add_argument("--output")
    args = parser.parse_args()
    filename = "openviking-personal-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S") + ".ovpack"
    output = Path(args.output) if args.output else Path(__file__).resolve().with_name(filename)
    print("Keep the legacy OpenViking running; pause other writes during export.")
    print("The package contains private data. Keep it locally; do not send it to support or GitHub.")
    key = getpass.getpass("Legacy OpenViking API key (Enter if authentication is disabled): ")
    try:
        print(json.dumps(export_user(args.base_url, key, args.account, args.user, output), indent=2))
    except urllib.error.HTTPError as error:
        print("EXPORT_FAILED HTTP_" + str(error.code)); raise SystemExit(1)
    except Exception:
        print("EXPORT_FAILED: Check the local server, authentication, user scope, output path and OVPack v3 support.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
