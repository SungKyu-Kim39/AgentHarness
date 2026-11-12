"""Read-only Windows desktop runtime diagnosis. No launches, focus, screenshots or model requests."""
import hashlib,json,os,re,runpy,subprocess,sys,tempfile,threading,time
from pathlib import Path
EXPECTED_MANIFEST = 'e5f2ae573ad07e4643ffb712ba2eb65a9d315dedb0c0a40a4a1340fcd01fa6b7'
MARKERS=('timed out','UI Automation','ACCESS_DENIED','PERM_DENIED','permission','DLL','HOME','lease','busy','INVALID_ARGS','INVALID_STATE')

def safe(reply):
    if not isinstance(reply,dict):return {'validEnvelope':False}
    result=reply.get('structuredContent',reply)
    if not isinstance(result,dict):return {'validEnvelope':False}
    if 'ok' not in result:
        for c in result.get('content',[]):
            if c.get('type')=='text':
                try:result=json.loads(c['text']);break
                except (ValueError,TypeError):pass
    error=result.get('error') or {}
    message=str(error.get('message','')) if isinstance(error,dict) else ''
    data=result.get('data');report={'ok':result.get('ok') is True,'isError':reply.get('isError',False)}
    code=error.get('code') if isinstance(error,dict) else None
    if isinstance(code,str) and re.fullmatch('[A-Z0-9_]{1,80}',code):report['errorCode']=code
    report['markers']=[m for m in MARKERS if m.lower() in message.lower()]
    if isinstance(data,list):report['windowCount']=len(data)
    if isinstance(data,dict):
        if isinstance(data.get('windows'),list):report['windowCount']=len(data['windows'])
        if isinstance(data.get('permissions'),dict):
            report['permissionFields']=sorted(data['permissions'])
        if isinstance(data.get('version'),str) and re.fullmatch(r'[0-9.]{1,32}',data['version']):report['version']=data['version']
    return report

class Child:
    def __init__(self,command,env,cwd):
        self.child=subprocess.Popen(command,cwd=cwd,env=env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,creationflags=0x08000000)
        self.lines=[];self.stderr=bytearray();self.partial=bytearray()
        def stdout():
            while block:=self.child.stdout.read1(65536):
                self.partial.extend(block)
                while b'\n' in self.partial:
                    line,_,remaining=self.partial.partition(b'\n');self.partial=bytearray(remaining)
                    if len(self.lines)<200:
                        try:self.lines.append(json.loads(line))
                        except ValueError:pass
                if len(self.partial)>8*1024*1024:return
        def stderr():
            while block:=self.child.stderr.read1(65536):
                if len(self.stderr)<65536:self.stderr.extend(block[:65536-len(self.stderr)])
        self.threads=[threading.Thread(target=stdout,daemon=True),threading.Thread(target=stderr,daemon=True)]
        for t in self.threads:t.start()
    def rpc(self,method,params,number,seconds=15):
        start=time.monotonic()
        try:self.child.stdin.write((json.dumps({'jsonrpc':'2.0','id':number,'method':method,'params':params})+'\n').encode());self.child.stdin.flush()
        except (OSError,BrokenPipeError):return {'stage':method,'inputFailed':True}
        while time.monotonic()-start<seconds:
            for reply in list(self.lines):
                if isinstance(reply,dict) and reply.get('id')==number:
                    result=reply.get('result');report={'stage':method,'response':True,'elapsedMs':int((time.monotonic()-start)*1000)}
                    if method=='tools/call':report.update(safe(result))
                    elif method=='tools/list':report['tools']=len(result.get('tools',[])) if isinstance(result,dict) else 0
                    else:report['initialized']=isinstance(result,dict) and bool(result.get('serverInfo'))
                    return report
            if self.child.poll() is not None:break
            time.sleep(.05)
        return {'stage':method,'response':False,'alive':self.child.poll() is None,'exitCode':self.child.poll(),'elapsedMs':int((time.monotonic()-start)*1000)}
    def finish(self):
        try:self.child.stdin.close()
        except (OSError,BrokenPipeError):pass
        try:self.child.wait(timeout=3)
        except subprocess.TimeoutExpired:self.child.kill();self.child.wait(timeout=5)
        for t in self.threads:t.join(timeout=1)
        text=self.stderr.decode('utf-8',errors='replace')
        return {'exitAfterProbeCleanup':self.child.returncode,'stderrBytes':len(self.stderr),'stderrMarkers':[m for m in MARKERS if m.lower() in text.lower()]}

def main():
    if os.name!='nt':raise ValueError('WINDOWS_ONLY')
    app=Path(os.environ['LOCALAPPDATA'])/'Programs/Ned/resources'
    base=app/'runtime/windows-x64/agent-desktop';manifest=(base/'manifest.json').read_bytes()
    if hashlib.sha256(manifest).hexdigest()!=EXPECTED_MANIFEST:raise ValueError('UNEXPECTED_DESKTOP_BUNDLE')
    for item in json.loads(manifest)['files']:
        if hashlib.sha256((base/item['path']).read_bytes()).hexdigest()!=item['sha256']:raise ValueError('DESKTOP_INTEGRITY_FAILED')
    # Kill-on-close Job contains only this diagnostic and its children, never Ned or observed apps.
    job=runpy.run_path(str(app/'runtime/windows-x64/openviking/sidecar-supervisor.py'))['own_job']()
    root=Path(os.environ['APPDATA'])/'Ned/diagnostics';root.mkdir(parents=True,exist_ok=True)
    report={'schemaVersion':1,'probe':'Ned desktop native and MCP','modelsPrompted':False,'desktopActions':0,'results':[]}
    with tempfile.TemporaryDirectory(prefix='desktop-probe-',dir=root) as directory:
        home=Path(directory)
        for part in ('AppData/Local','AppData/Roaming','state','tmp'):(home/part).mkdir(parents=True,exist_ok=True)
        env={k:v for k,v in os.environ.items() if k in ('SystemRoot','SYSTEMROOT','WINDIR','SystemDrive','ProgramFiles','ProgramFiles(x86)','ProgramW6432','ProgramData')}
        env.update(HOME=str(home),USERPROFILE=str(home),APPDATA=str(home/'AppData/Roaming'),LOCALAPPDATA=str(home/'AppData/Local'),AGENT_DESKTOP_HOME=str(home/'state'),TEMP=str(home/'tmp'),TMP=str(home/'tmp'),PATH=str(Path(env.get('SystemRoot',r'C:\Windows'))/'System32'))
        exe=str(base/'agent-desktop.exe')
        for args in (['status'],['list-windows','--timeout-ms','5000']):
            child=Child([exe,*args],env,home);until=time.monotonic()+20
            while not child.lines and child.child.poll() is None and time.monotonic()<until:time.sleep(.05)
            data={'launch':'direct-cli','command':args[0],'response':bool(child.lines),'aliveAtCheck':child.child.poll() is None}
            if child.lines:data.update(safe(child.lines[0]))
            data.update(child.finish());report['results'].append(data)
        py=app/'runtime/windows-x64/openviking/python/python.exe';sup=app/'runtime/windows-x64/openviking/sidecar-supervisor.py'
        child=Child([str(py),'-I','-B',str(sup),exe,'mcp'],env,home)
        stages=[child.rpc('initialize',{'protocolVersion':'2025-06-18','capabilities':{},'clientInfo':{'name':'ned-desktop-probe','version':'1'}},1)]
        if stages[-1].get('initialized'):
            child.child.stdin.write(b'{"jsonrpc":"2.0","method":"notifications/initialized"}\n');child.child.stdin.flush()
            stages.append(child.rpc('tools/list',{},2))
            stages.append(child.rpc('tools/call',{'name':'desktop_status','arguments':{}},3,30))
        report['results'].append({'launch':'supervised-mcp','stages':stages,**child.finish()})
    (root/'desktop-probe-status.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,indent=2),flush=True)

if __name__=='__main__':
    try:main()
    except Exception as error:
        code=str(error) if isinstance(error,ValueError) and re.fullmatch('[A-Z_]{1,64}',str(error)) else 'DESKTOP_PROBE_FAILED'
        print(json.dumps({'status':'error','code':code}),flush=True);sys.exit(1)
