"""L-Vibe-owned supervisor for the pinned OpenViking distribution.

One worker, no bot, no activation commands, no inherited user configuration.
The parent owns stdin; EOF requests shutdown. Windows Job Objects terminate
descendants if this process is terminated or the parent disappears.
"""
import argparse
import ctypes
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import socket
import sys
import threading
from urllib.parse import urlsplit


def configure_model_queue_wait():
    """Wait for the configured intranet VLM queue; the parent owns cancellation.

    The pinned SDK validates a positive numeric timeout in its JSON schema.
    Its OpenAI backend and HTTPX support None, so adapt the backend config
    after schema validation. Installed third-party package files are untouched.
    """
    from openviking.models.vlm.backends.openai_vlm import OpenAIVLM
    original = OpenAIVLM.__init__
    if getattr(original, "_l_vibe_queue_wait", False):
        return
    def initialize(self, config):
        original(self, {**config, "timeout": None})
    initialize._l_vibe_queue_wait = True
    OpenAIVLM.__init__ = initialize


def configure_user_pack_import():
    """Do not mkdir the virtual user container when importing a user root.

    OVPack still validates the archive, scope, owner, destination write access
    and conflict policy before reaching this parent helper. No ACL bypass or
    general mkdir change is introduced. Installed SDK source stays unchanged.
    """
    import inspect
    from openviking.storage.ovpack import operations
    original = operations._ensure_parent_exists
    source = inspect.getsource(original).replace("\r\n", "\n")
    if hashlib.sha256(source.encode()).hexdigest() != "91a8134aabc54256c30963c1d565295eaf8b11e9ded02dca53854c0349af27a7":
        raise RuntimeError("L-Vibe: unsupported OVPack parent helper")
    async def ensure_parent(viking_fs, parent, ctx):
        if parent == "viking://user":
            return
        return await original(viking_fs, parent, ctx)
    operations._ensure_parent_exists = ensure_parent


def configure_tokenizers(directory=None):
    """Use authenticated bundled data; never repair a cache by downloading."""
    root = Path(directory or Path(__file__).resolve().parent / "tokenizers").resolve()
    try:
        metadata = json.loads((root / "assets.json").read_text(encoding="utf-8"))
        if not isinstance(metadata, dict) or metadata.get("schemaVersion") != 1 or metadata.get("version") != "0.14.0" or len(metadata.get("assets", [])) != 6:
            raise ValueError("unsupported catalog")
        assets = {}
        for item in metadata["assets"]:
            url, filename, expected = item["url"], item["path"], item["sha256"]
            if not isinstance(url, str) or not re.fullmatch(r"[0-9a-f]{40}", filename) or not re.fullmatch(r"[0-9a-f]{64}", expected):
                raise ValueError("invalid catalog entry")
            if filename != hashlib.sha1(url.encode("utf-8"), usedforsecurity=False).hexdigest() or url in assets:
                raise ValueError("invalid cache key")
            file = root / filename
            if hashlib.sha256(file.read_bytes()).hexdigest() != expected:
                raise ValueError("data hash mismatch")
            assets[url] = (file, expected)
    except (OSError, ValueError, KeyError, TypeError):
        raise RuntimeError("L-Vibe tokenizer cache is missing or corrupt. Apply the offline tokenizer repair or reinstall the complete bundle.") from None
    os.environ["TIKTOKEN_CACHE_DIR"] = str(root)
    # LiteLLM otherwise replaces TIKTOKEN_CACHE_DIR during its own import.
    os.environ["CUSTOM_TIKTOKEN_CACHE_DIR"] = str(root)
    import tiktoken.load

    def read_bundled(blobpath, expected_hash=None):
        entry = assets.get(blobpath)
        if entry is None or (expected_hash is not None and expected_hash != entry[1]):
            raise RuntimeError("L-Vibe tokenizer data is not in the offline catalog; downloading is disabled.")
        try:
            content = entry[0].read_bytes()
        except OSError:
            raise RuntimeError("L-Vibe tokenizer cache is missing; downloading is disabled.") from None
        if hashlib.sha256(content).hexdigest() != entry[1]:
            raise RuntimeError("L-Vibe tokenizer cache is corrupt; downloading is disabled.")
        return content

    tiktoken.load.read_file_cached = read_bundled
    return metadata["encodings"]


def windows_job():
    if os.name != "nt":
        return None
    from ctypes import wintypes
    class Basic(ctypes.Structure):
        _fields_ = [("user", ctypes.c_int64), ("job", ctypes.c_int64),
                    ("flags", wintypes.DWORD), ("min", ctypes.c_size_t),
                    ("max", ctypes.c_size_t), ("active", wintypes.DWORD),
                    ("affinity", ctypes.c_size_t), ("priority", wintypes.DWORD),
                    ("scheduling", wintypes.DWORD)]
    class IO(ctypes.Structure):
        _fields_ = [(name, ctypes.c_uint64) for name in ["read_ops", "write_ops", "other_ops", "read_bytes", "write_bytes", "other_bytes"]]
    class Extended(ctypes.Structure):
        _fields_ = [("basic", Basic), ("io", IO), ("process_memory", ctypes.c_size_t),
                    ("job_memory", ctypes.c_size_t), ("peak_process", ctypes.c_size_t), ("peak_job", ctypes.c_size_t)]
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateJobObjectW.argtypes = [ctypes.c_void_p, wintypes.LPCWSTR]
    kernel.CreateJobObjectW.restype = wintypes.HANDLE
    kernel.SetInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
    kernel.SetInformationJobObject.restype = wintypes.BOOL
    kernel.GetCurrentProcess.restype = wintypes.HANDLE
    kernel.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    kernel.AssignProcessToJobObject.restype = wintypes.BOOL
    handle = kernel.CreateJobObjectW(None, None)
    info = Extended(); info.basic.flags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
    if not handle or not kernel.SetInformationJobObject(handle, 9, ctypes.byref(info), ctypes.sizeof(info)) or not kernel.AssignProcessToJobObject(handle, kernel.GetCurrentProcess()):
        raise RuntimeError("Windows process lifetime containment failed")
    return handle


def windows_socketpair(original_connect, family=None, type=socket.SOCK_STREAM, proto=0):
    """Create a private Windows loopback pair without relaxing the connect guard.

    Windows CPython implements socketpair using a short-lived TCP listener.
    asyncio needs this pair for its self-pipe. Only this function's newly
    created client may bypass the guard, to this function's listener address.
    Other threads and ordinary loopback connects remain under the policy.
    """
    family = socket.AF_INET if family is None else family
    if family not in (socket.AF_INET, socket.AF_INET6) or type != socket.SOCK_STREAM or proto not in (0, socket.IPPROTO_TCP):
        raise ValueError("L-Vibe: unsupported Windows socketpair parameters")
    host = "127.0.0.1" if family == socket.AF_INET else "::1"
    listener = socket.socket(family, type, proto)
    client = server = None
    try:
        listener.settimeout(5)
        listener.bind((host, 0))
        listener.listen(1)
        client = socket.socket(family, type, proto)
        client.settimeout(5)
        address = listener.getsockname()
        original_connect(client, address)
        server, peer = listener.accept()
        if peer != client.getsockname() or client.getpeername() != server.getsockname():
            raise ConnectionError("L-Vibe: Windows socketpair peer verification failed")
        client.settimeout(socket.getdefaulttimeout())
        server.settimeout(socket.getdefaulttimeout())
        return server, client
    except BaseException:
        if server is not None:
            server.close()
        if client is not None:
            client.close()
        raise
    finally:
        listener.close()


def restrict_python_network(config):
    # Defense in depth for Python HTTP/DNS. Native socket behavior still requires
    # the Windows network acceptance test; this is not an OS firewall.
    gateway = urlsplit(config["embedding"]["dense"]["api_base"])
    allowed = ("127.0.0.1", gateway.port)
    original_connect = socket.socket.connect
    original_connect_ex = socket.socket.connect_ex
    original_getaddrinfo = socket.getaddrinfo
    def check(address):
        if not isinstance(address, tuple) or address[:2] != allowed:
            raise PermissionError("L-Vibe: outbound connection is not an approved model gateway")
    def connect(sock, address):
        check(address); return original_connect(sock, address)
    def connect_ex(sock, address):
        check(address); return original_connect_ex(sock, address)
    def getaddrinfo(host, port, *args, **kwargs):
        if host not in ("127.0.0.1", None):
            raise PermissionError("L-Vibe: external DNS is disabled")
        return original_getaddrinfo(host, port, *args, **kwargs)
    socket.socket.connect = connect
    socket.socket.connect_ex = connect_ex
    socket.getaddrinfo = getaddrinfo
    if os.name == "nt":
        # Do not allow arbitrary localhost ports or temporarily restore the
        # global connect function: both would bypass the host's port boundary.
        socket.socketpair = lambda family=None, type=socket.SOCK_STREAM, proto=0: windows_socketpair(original_connect, family, type, proto)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True)
    parser.add_argument("--port", required=True, type=int)
    args = parser.parse_args()
    with open(args.config, encoding="utf-8") as stream:
        config = json.load(stream)
    os.environ["OPENVIKING_CONFIG_FILE"] = args.config
    job_handle = windows_job()  # Keep the handle alive until process exit.
    restrict_python_network(config)
    configure_tokenizers(os.environ.get("TIKTOKEN_CACHE_DIR"))
    from openviking.server.app import create_app
    configure_model_queue_wait()
    configure_user_pack_import()
    from openviking.server.config import load_server_config
    import uvicorn
    server_config = load_server_config()
    server = uvicorn.Server(uvicorn.Config(create_app(server_config), host="127.0.0.1", port=args.port, workers=1, access_log=False, log_level="error"))
    def parent_watch():
        sys.stdin.buffer.read()
        server.should_exit = True
    threading.Thread(target=parent_watch, name="l-vibe-parent-watch", daemon=True).start()
    server.run()
    _ = job_handle


if __name__ == "__main__":
    main()
