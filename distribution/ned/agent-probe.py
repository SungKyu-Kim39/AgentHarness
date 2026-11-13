"""App-owned runtime/ACP startup probes. No sessions, prompts, model calls or config edits."""
import hashlib
import json
import os
from pathlib import Path
import re
import runpy
import subprocess
import sys
import threading
import time

MARKERS = ('SyntaxError', 'ReferenceError', 'TypeError', 'Cannot find module', 'MODULE_NOT_FOUND',
           'ERR_MODULE_NOT_FOUND', 'Access is denied', 'Permission denied', 'bad option',
           'not supported', 'Ned agent connection failed', 'Unable to open nul', 'stdio',
           'uv_pipe', 'EINVAL', 'ELECTRON_RUN_AS_NODE', 'NODE_OPTIONS', 'Unrecognized', 'FATAL')

def summary(data):
    text = data.decode('utf-8', errors='replace')
    return {'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'markers': [marker for marker in MARKERS if marker.lower() in text.lower()]}


def probe(command, env, acp=False):
    report = {'kind': 'acp-initialize' if acp else 'node-version'}
    output = [bytearray(), bytearray()]
    child = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             env=env, creationflags=0x08000000 if os.name == 'nt' else 0)
    def drain(stream, index):
        while block := stream.read1(65536):
            if len(output[index]) < 1048576: output[index].extend(block[:1048576-len(output[index])])
    threads = [threading.Thread(target=drain, args=(child.stdout, 0), daemon=True),
               threading.Thread(target=drain, args=(child.stderr, 1), daemon=True)]
    for thread in threads: thread.start()
    initialized = False
    try:
        if acp:
            request = {'jsonrpc':'2.0','id':1,'method':'initialize','params':{'protocolVersion':1,
                       'clientCapabilities':{'fs':{'readTextFile':False,'writeTextFile':False},'terminal':False},
                       'clientInfo':{'name':'ned-private-startup-probe','version':'1'}}}
            try: child.stdin.write((json.dumps(request)+'\n').encode()); child.stdin.flush()
            except (BrokenPipeError, OSError): pass
        until = time.monotonic() + 20
        while time.monotonic() < until:
            if acp:
                for line in bytes(output[0]).splitlines():
                    try:
                        message = json.loads(line)
                        if message.get('id') == 1:
                            initialized = isinstance(message.get('result'), dict) and message['result'].get('protocolVersion') == 1
                            report['initializeResponse'] = 'ok' if initialized else 'protocol-error'
                    except (ValueError, AttributeError): pass
                if 'initializeResponse' in report: break
            if child.poll() is not None: break
            time.sleep(.05)
        report['exitCodeBeforeCleanup'] = child.poll()
        report['aliveAtCheck'] = child.poll() is None
        if acp: report['initialized'] = initialized
        else: report['nodeVersionReceived'] = bool(re.fullmatch(rb'v?\d+\.\d+\.\d+\s*', bytes(output[0])))
    finally:
        try: child.stdin.close()
        except (OSError, BrokenPipeError): pass
        try: child.wait(timeout=5)
        except subprocess.TimeoutExpired:
            report['probeChildStopped'] = True
            child.kill(); child.wait(timeout=5)
        for thread in threads: thread.join(timeout=2)
    if not acp: report['nodeVersionReceived'] = bool(re.fullmatch(rb'v?\d+\.\d+\.\d+\s*', bytes(output[0])))
    report['exitCodeAfterProbeCleanup'] = child.returncode
    report['stdoutBytes'] = len(output[0]); report['stderr'] = summary(bytes(output[1]))
    return report


def main():
    if os.name != 'nt': raise ValueError('WINDOWS_ONLY')
    import winreg
    app = Path(os.environ['LOCALAPPDATA'])/'Programs/Ned'
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r'Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned') as key:
            value, kind = winreg.QueryValueEx(key, 'InstallLocation')
            if kind == winreg.REG_SZ and isinstance(value, str) and value:
                app = Path(value)
    except FileNotFoundError:
        pass
    root = Path(os.environ['APPDATA'])/'Ned'
    resources = app/'resources'
    exe = app/'Ned.exe'; bridge = resources/'ned/agent.cjs'; descriptor = root/'runtime/ned-agent.json'
    report = {'schemaVersion':1,'probe':'Ned agent runtime and shell comparison',
              'settingsChanged':False,'sessionsCreated':False,'modelsPrompted':False,
              'files':{'executable':exe.is_file(),'agent':bridge.is_file(),'ownerDescriptor':descriptor.is_file()},'results':[]}
    if not exe.is_file(): raise ValueError('NED_EXECUTABLE_MISSING')
    # The diagnostic owns only its own process tree, never the existing Ned/editor.
    job = runpy.run_path(str(resources/'runtime/windows-x64/openviking/sidecar-supervisor.py'))['own_job']()
    env = dict(os.environ); env['ELECTRON_RUN_AS_NODE'] = '1'
    for name in ('NODE_OPTIONS','NODE_EXTRA_CA_CERTS','ELECTRON_NO_ASAR'): env.pop(name, None)
    report['results'].append({'launch':'direct-node', **probe([str(exe),'-p','process.versions.node'],env)})
    if bridge.is_file() and descriptor.is_file():
        report['results'].append({'launch':'direct-acp', **probe([str(exe),str(bridge),str(descriptor)],env,True)})
        powershell = Path(env.get('SystemRoot',r'C:\Windows'))/'System32/WindowsPowerShell/v1.0/powershell.exe'
        if powershell.is_file():
            quote = lambda arg: "'"+str(arg).replace("'","''")+"'"
            command = '& '+' '.join(quote(arg) for arg in (exe,bridge,descriptor))
            report['results'].append({'launch':'powershell-acp', **probe([str(powershell),'-NoLogo','-NoProfile','-NonInteractive','-Command',command],env,True)})
    else: report['ownerHint'] = 'KEEP_NED_RUNNING_FOR_ACP_CHECK'
    directory = root/'diagnostics'; directory.mkdir(parents=True,exist_ok=True)
    (directory/'agent-probe-status.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,indent=2))


if __name__ == '__main__':
    try: main()
    except Exception as error:
        code = str(error) if isinstance(error,ValueError) and re.fullmatch('[A-Z_]{1,64}',str(error)) else 'AGENT_PROBE_FAILED'
        print(json.dumps({'status':'error','code':code})); sys.exit(1)
