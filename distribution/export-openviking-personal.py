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


SAFE_ERROR_CODES = frozenset({
    "ABORTED", "ALREADY_EXISTS", "CONFLICT", "DEADLINE_EXCEEDED", "FAILED_PRECONDITION",
    "INTERNAL", "INVALID_ARGUMENT", "INVALID_URI", "NOT_FOUND", "NOT_INITIALIZED",
    "PERMISSION_DENIED", "PROCESSING_ERROR", "RESOURCE_EXHAUSTED", "SESSION_EXPIRED",
    "UNAUTHENTICATED", "UNAVAILABLE", "UNIMPLEMENTED", "UNKNOWN",
})
MAX_PROBE_BODY = 128 * 1024


def local_connection(base_url, api_key, account, user):
    parsed = urllib.parse.urlsplit(base_url)
    if (parsed.scheme != "http" or parsed.hostname not in ("127.0.0.1", "localhost")
            or parsed.username or parsed.password or parsed.path not in ("", "/")
            or parsed.query or parsed.fragment or not parsed.port):
        raise ValueError("Use a loopback HTTP URL with an explicit port.")
    for value in (account, user):
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,127}", value):
            raise ValueError("Invalid account/user ID.")
    if user == "local-user":
        raise ValueError("Export a legacy user, not Ned's active local-user.")
    origin = f"http://127.0.0.1:{parsed.port}"
    headers = {"Content-Type": "application/json", "X-OpenViking-Account": account,
               "X-OpenViking-User": user}
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
        headers["X-API-Key"] = api_key
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    return origin, headers, opener, "viking://user/" + user


def listing_route(uri):
    # Same read permission and scope as export. Avoid stat's extra count/lock/metadata
    # work: preflight needs only directory readability, not index or lock status.
    return "/api/v1/fs/ls?" + urllib.parse.urlencode({
        "uri": uri, "simple": "true", "recursive": "false", "node_limit": 1,
        "output": "original", "include_abstract": "false", "include_overview": "false",
    })


def bounded_json(response):
    raw = response.read(MAX_PROBE_BODY + 1)
    if len(raw) > MAX_PROBE_BODY:
        raise ValueError("OV_RESPONSE_SIZE")
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise ValueError("OV_RESPONSE_FORMAT")
    return value


def safe_error(error):
    # Never report raw HTTP reason, headers, traceback, message or details.
    try:
        body = bounded_json(error)
    except (ValueError, OSError):
        return {}
    code = body.get("error", {}).get("code") if isinstance(body.get("error"), dict) else None
    return {"serverCode": code} if isinstance(code, str) and code in SAFE_ERROR_CODES else {}


def diagnose_export(base_url, api_key, account, user):
    origin, headers, opener, uri = local_connection(base_url, api_key, account, user)
    report = {"schemaVersion": 1, "probe": "Ned legacy export readiness", "revision": 2,
              "exportRequested": False, "sourceWritesRequested": False, "results": []}
    routes = [("health", "/health"), ("ready", "/ready"),
              ("stat", "/api/v1/fs/stat?" + urllib.parse.urlencode({"uri": uri})),
              ("list", listing_route(uri))]
    for stage, route in routes:
        row = {"stage": stage}
        try:
            request = urllib.request.Request(origin + route, headers=headers, method="GET")
            with opener.open(request, timeout=30) as response:
                row["httpStatus"] = response.status
                body = bounded_json(response)
            row["responseValid"] = True
            if stage == "health":
                version = body.get("version")
                if isinstance(version, str) and re.fullmatch(r"[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,4}", version):
                    row["version"] = version
                if isinstance(body.get("healthy"), bool): row["healthy"] = body["healthy"]
                if body.get("auth_mode") in ("dev", "trusted", "api_key", "ldap", "oidc"):
                    row["authMode"] = body["auth_mode"]
                if body.get("role") in ("root", "admin", "user"): row["role"] = body["role"]
                for key, selected in (("account_id", account), ("user_id", user)):
                    if isinstance(body.get(key), str): row[key + "MatchesRequested"] = body[key] == selected
            elif stage == "list":
                row["readable"] = body.get("status") == "ok" and isinstance(body.get("result"), list)
            elif stage == "stat":
                row["readable"] = body.get("status") == "ok" and isinstance(body.get("result"), dict)
            else:
                row["ready"] = body.get("status") in ("ok", "ready")
        except urllib.error.HTTPError as error:
            row.update(httpStatus=error.code, **safe_error(error))
            error.close()
        except (ValueError, OSError, urllib.error.URLError):
            row["responseValid"] = False
        report["results"].append(row)
    return report


def export_user(base_url, api_key, account, user, output, include_vectors=True):
    origin, headers, opener, uri = local_connection(base_url, api_key, account, user)
    output = Path(output).absolute()
    partial = output.with_name(output.name + ".partial")
    checksum = output.with_name(output.name + '.sha256')
    if output.exists() or partial.exists() or checksum.exists():
        raise ValueError("Output exists. Choose a new filename; nothing was overwritten.")
    request = urllib.request.Request(
        origin + "/api/v1/pack/export",
        data=json.dumps({"uri": uri, "include_vectors": include_vectors}).encode(),
        headers=headers, method="POST")
    # The official export API still independently authenticates and checks scope.
    # Never skip a failed auth/list check or retry an uncertain pack request.
    preflight = urllib.request.Request(origin + listing_route(uri), headers=headers, method="GET")
    try:
        with opener.open(preflight, timeout=30) as response:
            body = bounded_json(response)
        if body.get("status") != "ok" or not isinstance(body.get("result"), list):
            raise ValueError("OV_PREFLIGHT_RESPONSE")
    except urllib.error.HTTPError as error:
        error.export_stage = "EXPORT_PREFLIGHT"
        raise
    digest = hashlib.sha256(); size = 0
    created_partial = False
    created_output = False
    completed = False
    try:
        with partial.open("xb") as stream:
            created_partial = True
            os.chmod(partial, 0o600)
            with opener.open(request, timeout=None) as response:
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
                "formatVersion": 3, "vectorsRequested": include_vectors}
    except urllib.error.HTTPError as error:
        error.export_stage = "EXPORT_PACK"
        raise
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
    parser.add_argument("--without-vectors", action="store_true", help="Export documents/memories without vector snapshots; Ned will recompute embeddings.")
    parser.add_argument("--diagnose-only", action="store_true", help="Read health/ready/stat/list only; prints safe metadata without exporting private data.")
    args = parser.parse_args()
    filename = "openviking-personal-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S") + ".ovpack"
    output = Path(args.output) if args.output else Path(__file__).resolve().with_name(filename)
    print("Keep the legacy OpenViking running; pause other writes during export.")
    print("The package contains private data. Keep it locally; do not send it to support or GitHub.")
    print("Use the OLD OpenViking server key (root_api_key or a matching user key), NOT an LLM/embedding key.")
    key = getpass.getpass("Legacy OpenViking API key (Enter if authentication is disabled): ")
    try:
        if args.diagnose_only:
            print(json.dumps(diagnose_export(args.base_url, key, args.account, args.user), indent=2))
            return
        print(json.dumps(export_user(args.base_url, key, args.account, args.user, output, include_vectors=not args.without_vectors), indent=2))
    except urllib.error.HTTPError as error:
        stage = getattr(error, "export_stage", "EXPORT_REQUEST")
        print(stage + " HTTP_" + str(error.code))
        details = safe_error(error); error.close()
        if details: print("OV_SERVER_CODE=" + details["serverCode"])
        if error.code == 401:
            print("OV_AUTH: The OLD local OpenViking server rejected authentication. Enter its own key; do not use the intranet model key. Authentication was not disabled.")
        elif error.code == 403:
            print("OV_SCOPE: The authenticated key is not allowed to read this account/user. Use an authorized user key for the selected account/user; root-key access depends on the OLD server auth mode.")
        elif error.code == 404:
            print("OV_NOT_FOUND: Check the server port and account/user IDs. No source data was modified.")
        elif error.code >= 500:
            print("OV_SERVER: The OLD server failed internally. No HTTP status alone identifies the cause.")
            if stage == "EXPORT_PACK" and not args.without_vectors:
                print("If vector snapshot export fails, rerun EXPORT_PERSONAL.cmd --without-vectors with a new output name. Content is retained; destination embeddings will be recomputed.")
            if stage == "EXPORT_PREFLIGHT":
                print("Vector settings do not affect preflight. Run CHECK_EXPORT.cmd and share only its safe diagnostic JSON.")
            else:
                print("Run CHECK_EXPORT.cmd. If export still fails, inspect the OLD server traceback locally; do not share keys or private contents.")
        raise SystemExit(1)
    except Exception:
        print("EXPORT_FAILED: Check the local server, authentication, user scope, output path and OVPack v3 support.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
