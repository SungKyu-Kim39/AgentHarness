import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { OpenVikingService } from '../src/main/openviking';
import { configSchema } from '../src/shared/contracts';
import { HostTools } from '../distribution/host-tools';
import { Redactor } from '../src/main/config';
const execute = promisify(execFile);
const executable = path.resolve('.cache/openviking/env-linux/bin/python3');
const legacyPackage = path.resolve('.cache/openviking-050-review/package');

for (const includeVectors of [true, false]) test(`real OpenViking 0.5.0 ${includeVectors ? 'vector' : 'no-vector'} export imports into 0.5.4 and personal knowledge is readable from two projects`,
  { skip: !existsSync(executable) || !existsSync(legacyPackage), timeout: 300000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-personal-live-'));
  const services:OpenVikingService[]=[];let tools:HostTools|undefined;let endpoint:ReturnType<typeof createServer>|undefined;
  t.after(async()=>{await tools?.close();for(const service of services)await service.close().catch(()=>{});endpoint?.closeAllConnections();await new Promise<void>(r=>{if(endpoint?.listening)endpoint.close(()=>r());else r();});await rm(root,{recursive:true,force:true});});
  const calls: string[] = [];
  endpoint = createServer(async (req, res) => {
    let raw='';for await(const chunk of req)raw+=chunk;
    const body=JSON.parse(raw);calls.push(req.url!);
    if(req.url==='/v1/embeddings') {
      const inputs=Array.isArray(body.input)?body.input:[body.input];
      res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({object:'list',model:body.model,data:inputs.map((_:unknown,index:number)=>({object:'embedding',index,embedding:[0.5,0.25,0.125,0.75]})),usage:{prompt_tokens:5,total_tokens:5}}));return;
    }
    res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({id:'summary',object:'chat.completion',model:body.model,choices:[{index:0,message:{role:'assistant',content:'Legacy personal reference.'},finish_reason:'stop'}],usage:{prompt_tokens:5,completion_tokens:4,total_tokens:9}}));
  });
  await new Promise<void>(r=>endpoint!.listen(0,'127.0.0.1',r));
  const baseUrl='http://127.0.0.1:'+(endpoint!.address() as {port:number}).port+'/v1';
  const config=configSchema.parse({schemaVersion:2,model:{baseUrl,apiKey:'test-only-llm-key',id:'llm-test'},openViking:{enabled:true,embedding:{baseUrl,apiKey:'test-only-embedding-key',id:'embed-test',dimension:4}}});
  let diagnostics='';
  const launcher=await readFile('scripts/openviking-launch.py','utf8');
  const legacyLauncher=path.join(root,'launch-050.py');
  await writeFile(legacyLauncher,launcher.replace('    from openviking.server.app import create_app',`    sys.path.insert(0, ${JSON.stringify(legacyPackage)})\n    from openviking.server.app import create_app`));
  const currentLauncher=path.join(root,'launch-current-test.py');
  await writeFile(currentLauncher,launcher.replace('    configure_user_pack_import()',`    configure_user_pack_import()
    from openviking.storage.ovpack import operations as test_pack_operations
    original_vector_action = test_pack_operations.choose_vector_restore_action
    async def trace_vector_action(*args, **kwargs):
        action = await original_vector_action(*args, **kwargs)
        print('L_VIBE_TEST_VECTOR_ACTION=' + action, file=sys.stderr, flush=True)
        return action
    test_pack_operations.choose_vector_restore_action = trace_vector_action`));
  const make=async(name:string,script:string)=>{
    const data=path.join(root,name);await mkdir(data,{recursive:true});
    await cp('vendor/runtime/windows-x64/openviking/tokenizers',path.join(data,'tokenizers'),{recursive:true});
    const service=new OpenVikingService(data,data,()=>{},{executable,launcher:script,cwd:data,diagnostic:text=>{diagnostics+=text;}});
    services.push(service);await service.configure(config);
    assert.equal(service.state().status,'ready',diagnostics.slice(-10000));return service;
  };
  const legacy=await make('legacy',legacyLauncher);
  const internals=legacy as unknown as {baseUrl:string;token:string};
  const api=async(route:string,body?:unknown)=>{
    const response=await fetch(internals.baseUrl+route,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+internals.token,'X-API-Key':internals.token,'X-OpenViking-Account':'default','X-OpenViking-User':'default','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(120000)});
    const text=await response.text();assert.ok(response.ok,response.status+': '+text+'\n'+diagnostics.slice(-8000));return JSON.parse(text);
  };
  await api('/api/v1/content/write',{uri:'viking://user/default/resources/legacy-note.md',content:'The preferred compiler for Project Amber is clang. Preserve VxWorks support.',mode:'create',wait:true,processing_mode:'vectors_only'});
  await api('/api/v1/content/write',{uri:'viking://user/default/memories/preferences/compiler.md',content:'Prefer clang for Project Amber.',mode:'create',wait:true,processing_mode:'vectors_only'});
  await api('/api/v1/content/write',{uri:'viking://user/default/peers/codex.tool@local/memories/preferences/errors.md',content:'Prefer explicit error codes in legacy modules.',mode:'create',wait:true,processing_mode:'vectors_only'});
  const archive=path.join(root,'legacy-personal.ovpack');
  const exportCode=`import sys,importlib.util,json
spec=importlib.util.spec_from_file_location('exporter',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
print(json.dumps(m.export_user(sys.argv[2],sys.argv[3],'default','default',sys.argv[4],include_vectors=${includeVectors ? 'True' : 'False'})))
`;
  await execute(executable,['-I','-B','-c',exportCode,path.resolve('distribution/export-openviking-personal.py'),internals.baseUrl,internals.token,archive],{timeout:120000});
  await legacy.close();
  let current=await make('current',currentLauncher);
  let approvals=0;
  let imported;
  try { imported=await current.importPersonal(archive,async()=>{approvals++;return true;}); }
  catch(error) { assert.fail(String(error)+'\n'+diagnostics.slice(-15000)); }
  assert.equal(imported.status,'imported');assert.equal(approvals,1);
  if(includeVectors) assert.ok(diagnostics.includes('L_VIBE_TEST_VECTOR_ACTION=restore'), 'SDK must restore the compatible vector snapshot\n'+diagnostics.slice(-15000));
  assert.equal((await current.personalStatus())[0].root,'viking://user/default');
  const currentInternals=current as unknown as {baseUrl:string;token:string};
  const forbidden=await fetch(currentInternals.baseUrl+'/api/v1/content/write',{method:'POST',headers:{Authorization:'Bearer '+currentInternals.token,'X-API-Key':currentInternals.token,'X-OpenViking-Account':'l-vibe','X-OpenViking-User':'local-user','Content-Type':'application/json'},body:JSON.stringify({uri:'viking://user/default/resources/legacy-note.md',content:'must not replace private knowledge',mode:'replace',wait:true,processing_mode:'vectors_only'})});
  assert.equal(forbidden.status,403,'the container fix must not bypass original-user ownership');
  assert.ok((await current.personalRead('viking://user/default/resources/legacy-note.md')).includes('Preserve VxWorks'));
  assert.ok((await current.personalRead('viking://user/default/peers/codex.tool@local/memories/preferences/errors.md')).includes('explicit error codes'));
  await assert.rejects(current.personalRead('viking://user/default/privacy/current.json'),/범위/);
  const projects=[path.join(root,'project-a'),path.join(root,'project-b')];
  for(const p of projects)await mkdir(p);
  tools=new HostTools(path.join(root,'host'),path.join(root,'resources'),{project:async id=>projects[id==='a'?0:1],approve:async()=>false,knowledge:()=>current,redactor:new Redactor()});
  for(const session of ['a','b']) {
    let found;
    try { found=JSON.parse(await tools.call('personal_knowledge_search',{query:'preferred compiler',limit:10},session)); }
    catch(error) { assert.fail(String(error)+'\n'+diagnostics.slice(-15000)); }
    assert.equal(found.scope,'personal');assert.ok(found.results.length>0,JSON.stringify(found)+'\n'+diagnostics.slice(-8000));
    assert.ok(found.results.some((r:{uri:string})=>r.uri.includes('memories/')||r.uri.includes('resources/')));
    assert.ok((await tools.call('personal_knowledge_read',{uri:'viking://user/default/resources/legacy-note.md'},session)).includes('clang'));
    await assert.rejects(tools.call('knowledge_read',{uri:'viking://user/default/resources/legacy-note.md'},session),/项目|프로젝트/);
  }
  await current.close();current=await make('current',path.resolve('scripts/openviking-launch.py'));
  assert.ok((await current.personalRead('viking://user/default/resources/legacy-note.md')).includes('VxWorks'));
  assert.equal((await current.importPersonal(archive,async()=>{throw Error('must be idempotent');})).status,'already-imported');
});
