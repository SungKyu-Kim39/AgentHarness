"""App-owned, key-free Zed startup probe. Never reads personal editor settings."""
import ctypes
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import uuid

ALLOWED_SOURCE_SHA256 = "df3dffa0dc5f42853861f87190d359929a7e97e4cb628b0ca3595364d6698da7"
CATEGORIES = {
    'data_directory_initialized_early': r'set_custom_data_dir called after',
    'create_data_directory': r'failed to create custom data directory',
    'canonicalize_data_directory': r'failed to canonicalize custom data',
    'local_app_data': r'failed to determine LocalAppData',
    'roaming_app_data': r'failed to determine RoamingAppData',
    'home_directory': r'failed to determine home directory',
    'graphics': r'failed to initialize DirectX|D3D|DXGI|Vulkan',
    'permission': r'Access is denied|Permission denied|os error 5',
    'environment_missing': r'NotPresent|Missing environment variable',
    'panic': r'panicked at',
}


def classify(text, sources):
    locations = []
    # Extract only the Rust panic header, never the following error/payload lines.
    for m in re.finditer(r'panicked at ([^\r\n]+?\.rs):(\d+)(?::(\d+))?', text):
        raw = m[1].replace('\\', '/').strip(" '\"")
        relative = raw[raw.find('crates/'):] if 'crates/' in raw else raw
        row = {'line': int(m[2])}
        if m[3]: row['column'] = int(m[3])
        if relative in sources:
            row['source'] = relative
        else:
            row['sourceHash'] = hashlib.sha256(raw.encode()).hexdigest()
        if row not in locations: locations.append(row)
    return {'markers': [k for k, p in CATEGORIES.items() if re.search(p, text, re.I)], 'panicLocations': locations[:8]}


FOLDER_PROBE = r'''
import ctypes,json,os,uuid
from pathlib import Path
shell=ctypes.WinDLL('shell32');ole=ctypes.WinDLL('ole32')
shell.SHGetKnownFolderPath.argtypes=[ctypes.c_void_p,ctypes.c_uint32,ctypes.c_void_p,ctypes.POINTER(ctypes.c_void_p)]
shell.SHGetKnownFolderPath.restype=ctypes.c_int32
ole.CoTaskMemFree.argtypes=[ctypes.c_void_p]
result={}
for name,guid in [('profile','5E6C858F-0E22-4760-9AFE-EA3317B67173'),('local','F1B32785-6FBA-4FCF-9D55-7B8E7F157091'),('roaming','3EB685DB-65F9-4CF6-A03A-E3EF65729F3D')]:
    value=ctypes.c_void_p();g=ctypes.create_string_buffer(uuid.UUID(guid).bytes_le)
    hr=shell.SHGetKnownFolderPath(g,0,None,ctypes.byref(value))
    row={'hresult':'0x%08x'%(hr&0xffffffff)}
    if hr==0 and value.value:
        p=Path(ctypes.wstring_at(value));row['exists']=p.is_dir()
        try:row['insidePrivateHome']=os.path.commonpath([str(p.absolute()),os.environ['USERPROFILE']]).lower()==os.environ['USERPROFILE'].lower()
        except ValueError:row['insidePrivateHome']=False
        ole.CoTaskMemFree(value)
    result[name]=row
print(json.dumps(result))
'''


def profile_env(base, aligned):
    data = base / 'data'; home = base / 'home'
    roaming = home / 'AppData' / 'Roaming' if aligned else base / 'roaming'
    local = home / 'AppData' / 'Local' if aligned else base / 'local'
    for p in [data / 'config', home, roaming, local, base / 'tmp', base / 'empty-project']:
        p.mkdir(parents=True, exist_ok=True)
    env = {}
    for k in ['SystemRoot','SYSTEMROOT','WINDIR','SystemDrive','ProgramFiles','ProgramFiles(x86)','ProgramW6432','ProgramData','PATHEXT','LANG','LC_ALL']:
        if k in os.environ: env[k] = os.environ[k]
    system = Path(os.environ.get('SystemRoot', r'C:\Windows'))
    env.update({'HOME': str(home), 'USERPROFILE': str(home), 'APPDATA': str(roaming), 'LOCALAPPDATA': str(local),
                'TEMP':str(base/'tmp'),'TMP':str(base/'tmp'), 'ComSpec':str(system/'System32/cmd.exe'),
                'PATH':os.pathsep.join(str(system/p) for p in ['System32','','System32/Wbem','System32/WindowsPowerShell/v1.0']),
                'DO_NOT_TRACK':'1','OTEL_SDK_DISABLED':'true'})
    for key in ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','http_proxy','https_proxy','all_proxy']:
        env[key] = 'http://127.0.0.1:9'
    env['NO_PROXY'] = ''; env['no_proxy'] = ''
    for key, part in [('XDG_CONFIG_HOME','config-home'),('XDG_DATA_HOME','data'),('XDG_CACHE_HOME','cache'),('XDG_STATE_HOME','state')]:
        env[key] = str(base/part); (base/part).mkdir(exist_ok=True)
    settings = {'auto_update':False,'telemetry':{'diagnostics':False,'metrics':False},'proxy':'http://127.0.0.1:9','server_url':'http://127.0.0.1:9',
                'credentials_url':'http://127.0.0.1:9','auto_install_extensions':{'html':False},'suggest_extensions':False,'language_servers':[],
                'enable_language_server':False,'granted_extension_capabilities':[],'prettier':{'allowed':False},'agent_servers':{},'context_servers':{},
                'restore_on_startup':'empty_tab','load_direnv':'disabled','title_bar':{'show_onboarding_banner':False,'show_sign_in':False}}
    (data/'config/settings.json').write_text(json.dumps(settings),encoding='utf-8')
    return data,env


def process_probe(binary, args, cwd, env, sources, seconds):
    # Reuse the bundled supervisor: it creates a kill-on-close Windows Job
    # before starting Zed, including any diagnostic crash-handler children.
    supervisor = Path(sys.executable).resolve().parent.parent/'sidecar-supervisor.py'
    child = subprocess.Popen([sys.executable,'-I','-B',str(supervisor),str(binary),*args],cwd=cwd,env=env,
                             stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,creationflags=0x08000000)
    retained = [b'', b'']
    def drain(stream, index):
        while True:
            block = stream.read(8192)
            if not block: break
            retained[index] = (retained[index]+block)[-131072:]
    readers = [threading.Thread(target=drain,args=(child.stdout,0),daemon=True),threading.Thread(target=drain,args=(child.stderr,1),daemon=True)]
    for reader in readers: reader.start()
    alive = False
    try: child.wait(timeout=seconds)
    except subprocess.TimeoutExpired:
        alive = True; child.kill(); child.wait(timeout=10)
    finally:
        child.stdin.close()
    for reader in readers: reader.join(timeout=5)
    text = b'\n'.join(retained).decode('utf-8',errors='replace')
    return {'aliveAtProbeEnd':alive,'exitCode':None if alive else child.returncode,**classify(text,sources)}


def main():
    if os.name != 'nt': raise ValueError('WINDOWS_ONLY')
    source_bytes = Path(__file__).with_name('zed-sources.json').read_bytes()
    if hashlib.sha256(source_bytes).hexdigest() != ALLOWED_SOURCE_SHA256: raise ValueError('SOURCE_LIST_INTEGRITY')
    sources = set(json.loads(source_bytes))
    runtime = Path(sys.executable).resolve().parent.parent
    resources = runtime.parents[2]
    binary = resources/'zed/Zed.exe'
    if not binary.is_file(): raise ValueError('EDITOR_NOT_FOUND')
    system = Path(os.environ.get('SystemRoot',r'C:\Windows'))
    listing = subprocess.run([str(system/'System32/tasklist.exe'),'/FO','CSV','/NH'],capture_output=True,encoding='utf-8',errors='replace',check=True).stdout
    if re.search(r'^"(?:Ned|Zed)\.exe"',listing,re.I|re.M): raise ValueError('CLOSE_NED_AND_ZED_FIRST')
    folder = Path(os.environ['APPDATA'])/'Ned/diagnostics'; folder.mkdir(parents=True,exist_ok=True)
    report = {'schemaVersion':1,'probe':'Ned editor profile comparison','existingSettingsChanged':False,'modelsStarted':False,'results':[]}
    with tempfile.TemporaryDirectory(prefix='editor-probe-',dir=folder) as temp:
        for aligned in [False,True]:
            base = Path(temp)/('standard-layout' if aligned else 'current-layout')
            data,env = profile_env(base,aligned)
            known = subprocess.run([sys.executable,'-I','-B','-c',FOLDER_PROBE],cwd=base,env=env,capture_output=True,timeout=15)
            result = {'layout':'standard' if aligned else 'current'}
            result['knownFolders'] = json.loads(known.stdout) if known.returncode==0 else {'probeFailed':True}
            result['initialization'] = process_probe(binary,['--foreground','--user-data-dir',str(data),'--system-specs'],base,env,sources,15)
            if aligned or result['initialization']['exitCode']==0:
                result['window'] = process_probe(binary,['--foreground','--user-data-dir',str(data),str(base/'empty-project')],base,env,sources,5)
            report['results'].append(result)
            print(json.dumps(result,ensure_ascii=True,indent=2),flush=True)
    (folder/'editor-probe-status.json').write_text(json.dumps(report,ensure_ascii=True,indent=2)+'\n',encoding='utf-8')
    print('PROBE_COMPLETE; sanitized report: %APPDATA%\\Ned\\diagnostics\\editor-probe-status.json')


if __name__=='__main__':
    try: main()
    except Exception as error:
        # No exception text, command lines, environment or raw process streams.
        code = str(error) if isinstance(error,ValueError) and re.fullmatch(r'[A-Z_]{1,64}',str(error)) else 'PROBE_FAILED'
        print(code); sys.exit(1)
