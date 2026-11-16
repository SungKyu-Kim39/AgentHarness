import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
const cache=path.resolve('.cache/ned/first-chat-fix');
test('actual patched 0.3.7 gateway accepts one-system guidance and safely identifies an upstream rejection', {skip:!existsSync(path.join(cache,'gateway-test.cjs'))}, async t=>{
  const Gateway=createRequire(import.meta.url)(path.join(cache,'gateway-test.cjs'));let busy=false;
  const server=createServer(async(req,res)=>{let raw='';for await(const b of req)raw+=b;const body=JSON.parse(raw);
    if(busy){res.writeHead(400).end(JSON.stringify({error:{message:'queue capacity exceeded PRIVATE_KEY'}}));return;}
    assert.equal(body.messages.filter(m=>m.role==='system').length,1);assert.match(body.messages[0].content,/Existing policy/);assert.match(body.messages[0].content,/Reviewed skill/);
    res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({choices:[{message:{content:'ok'},finish_reason:'stop'}]}));
  });await new Promise(r=>server.listen(0,'127.0.0.1',r));const events=[];
  const gateway=new Gateway({schemaVersion:2,model:{id:'test',apiKey:'PRIVATE_KEY',baseUrl:'http://127.0.0.1:'+server.address().port+'/v1'}},{},event=>events.push(event),async()=>'Reviewed skill');await gateway.start();
  t.after(async()=>{await gateway.close();server.closeAllConnections();await new Promise(r=>server.close(r));});
  const request=()=>fetch(gateway.baseUrl+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+gateway.token},body:JSON.stringify({model:'test',messages:[{role:'system',content:'Existing policy'},{role:'user',content:'Synthetic request'}]})});
  const first=await request();assert.equal(first.status,200);await first.text();busy=true;
  const rejected=await request();assert.equal(rejected.status,400);assert.ok(!(await rejected.text()).includes('PRIVATE_KEY'));
  assert.equal(events[0].httpError.reason,'capacity');assert.equal(events[0].requestShape.roles.system,1);assert.ok(!JSON.stringify(events).includes('PRIVATE_KEY'));
});
test('first-chat repair is idempotent, rejects tampering and rolls back without changing user files',{skip:!existsSync(path.join(cache,'Ned-first-chat-fix-1/apply-fix.py'))},async()=>{
  await promisify(execFile)('python3',['-I','-B','-c',String.raw`
import hashlib,importlib.util,json,pathlib,shutil,sys,tempfile
base=pathlib.Path(sys.argv[1]);spec=importlib.util.spec_from_file_location('patch',base/'Ned-first-chat-fix-1/apply-fix.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
manifest=json.loads((base/'Ned-first-chat-fix-1/manifest.json').read_text());payload=base/'Ned-first-chat-fix-1'
with tempfile.TemporaryDirectory(prefix='ned-first-chat-test-') as d:
 app=pathlib.Path(d);(app/'resources').mkdir();(app/'Ned.exe').write_bytes(b'test-exe');manifest['exeSha256']=hashlib.sha256(b'test-exe').hexdigest()
 shutil.copyfile(sys.argv[2],app/'resources/app.asar');(app/'settings.enc.json').write_bytes(b'preserve-encrypted-settings')
 assert m.apply(app,payload,manifest)['status']=='applied'
 assert m.apply(app,payload,manifest)['status']=='already-applied'
 assert (app/'settings.enc.json').read_bytes()==b'preserve-encrypted-settings'
 assert m.apply(app,payload,manifest,True)['status']=='rolled-back'
 assert m.digest(app/'resources/app.asar') in manifest['baselineAsarSha256']
 (app/'resources/app.asar').write_bytes(b'external change')
 try:m.apply(app,payload,manifest)
 except ValueError as e:assert str(e)=='UNEXPECTED_HOST_VERSION'
 else:raise AssertionError('Unexpected host was overwritten')
`,cache,path.resolve('.cache/ned/model-400-baseline/resources/app.asar')]);
});
