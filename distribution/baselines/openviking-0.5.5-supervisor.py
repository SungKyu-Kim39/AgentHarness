"""Own the engine and every descendant with a Windows Job Object.

Only the native host supplies argv. No shell parsing or global service registration.
Closing the parent's stdin closes engine stdin; a forced supervisor exit closes
the kill-on-close Job handle as well, including on an Electron crash.
"""
import ctypes
from ctypes import wintypes
import os
import subprocess
import sys
import threading

def own_job():
    if os.name != 'nt': return None
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    class BASIC(ctypes.Structure):
        _fields_ = [('ProcessTime', ctypes.c_int64), ('JobTime', ctypes.c_int64), ('LimitFlags', wintypes.DWORD),
                    ('MinWS', ctypes.c_size_t), ('MaxWS', ctypes.c_size_t), ('ActiveLimit', wintypes.DWORD),
                    ('Affinity', ctypes.c_size_t), ('Priority', wintypes.DWORD), ('Scheduling', wintypes.DWORD)]
    class IO(ctypes.Structure):
        _fields_ = [(name, ctypes.c_uint64) for name in ['ReadOps', 'WriteOps', 'OtherOps', 'ReadBytes', 'WriteBytes', 'OtherBytes']]
    class EXTENDED(ctypes.Structure):
        _fields_ = [('Basic', BASIC), ('IO', IO), ('ProcessMemory', ctypes.c_size_t), ('JobMemory', ctypes.c_size_t),
                    ('PeakProcess', ctypes.c_size_t), ('PeakJob', ctypes.c_size_t)]
    kernel.CreateJobObjectW.restype = wintypes.HANDLE
    kernel.SetInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
    kernel.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    kernel.GetCurrentProcess.restype = wintypes.HANDLE
    handle = kernel.CreateJobObjectW(None, None)
    limits = EXTENDED(); limits.Basic.LimitFlags = 0x00002000
    if not handle or not kernel.SetInformationJobObject(handle, 9, ctypes.byref(limits), ctypes.sizeof(limits)):
        raise ctypes.WinError(ctypes.get_last_error())
    if not kernel.AssignProcessToJobObject(handle, kernel.GetCurrentProcess()):
        raise ctypes.WinError(ctypes.get_last_error())
    return handle  # Keep alive until process exit; CloseHandle would kill this process too.

def main():
    job = own_job()
    child = subprocess.Popen(sys.argv[1:], stdin=subprocess.PIPE, stdout=sys.stdout.buffer, stderr=sys.stderr.buffer,
                             creationflags=0x08000000 if os.name == 'nt' else 0)
    def watch_parent():
        try:
            while True:
                data = sys.stdin.buffer.read1(65536)
                if not data: break
                child.stdin.write(data)
                child.stdin.flush()
        finally:
            child.stdin.close()
            try: child.wait(timeout=5)
            except subprocess.TimeoutExpired: child.terminate()
    threading.Thread(target=watch_parent, daemon=True).start()
    sys.exit(child.wait())

if __name__ == '__main__': main()
