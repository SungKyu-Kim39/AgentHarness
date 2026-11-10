"""L-Vibe-owned supervisor for the unmodified, pinned OpenViking distribution.

One worker, no bot, no activation commands, no inherited user configuration.
The parent owns stdin; EOF requests shutdown. Windows Job Objects terminate
descendants if this process is terminated or the parent disappears.
"""
import argparse
import ctypes
import json
import os
import signal
import socket
import sys
import threading
from urllib.parse import urlsplit


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
    from openviking.server.app import create_app
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
