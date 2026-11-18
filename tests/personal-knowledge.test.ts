import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { PersonalKnowledge } from '../src/main/personal-knowledge';
const execute = promisify(execFile);
const rootURI = 'viking://user/default';
async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-personal-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const archive = path.join(root, 'legacy.ovpack');
  const paths = ['memories/preference.md', 'resources/design.md', 'skills/example/SKILL.md', 'sessions/past.json', 'privacy/current.json', 'peers/codex.tool@local/memories/entity.md'];
  await execute('python3', ['-I', '-B', '-c', `import json,sys,zipfile
user=sys.argv[2]; paths=json.loads(sys.argv[3])
m={'kind':'openviking.ovpack','format_version':3,'root':{'name':user,'uri':'viking://user/'+user},'entries':[{'path':'','kind':'directory'}]+[{'path':p,'kind':'file'} for p in paths]}
with zipfile.ZipFile(sys.argv[1],'w') as z:
 z.writestr(user+'/_ovpack/manifest.json',json.dumps(m))
 for p in paths:z.writestr(user+'/files/'+p,'synthetic private data')
 if sys.argv[4]=='true':z.writestr(user+'/../outside.txt','reject')
`, archive, 'default', JSON.stringify(paths), 'false']);
  return { root, archive };
}

test('existing ready personal knowledge remains searchable without importing or revealing excluded roots', async t => {
  const { root } = await fixture(t);
  const registry = path.join(root, 'personal-imports.json');
  const resources = rootURI + '/resources';
  const entry = { sha256: '0'.repeat(64), root: rootURI, roots: [resources], status: 'ready', files: 1, importedAt: '2026-11-01' };
  const snapshot = JSON.stringify({ schemaVersion: 1, entries: [entry, { ...entry, status: 'failed' }] });
  await writeFile(registry, snapshot);
  const manager = new PersonalKnowledge(root, async (user, route, options) => {
    assert.equal(user, 'default');
    if (route === '/api/v1/search/find') {
      assert.deepEqual(options?.body, { query: 'known', target_uri: resources, limit: 3, read_content: false });
      return { result: { resources: [{ uri: resources + '/hit.md' }, { uri: rootURI + '/sessions/raw.json' }] } };
    }
    assert.match(route, /^\/api\/v1\/content\/read\?/);
    return { result: { content: 'known preference' } };
  });
  assert.deepEqual(JSON.parse(await manager.search('known', 3)).results, [{ uri: resources + '/hit.md' }]);
  assert.match(await manager.read(resources + '/hit.md'), /known preference/);
  await assert.rejects(manager.read(rootURI + '/sessions/raw.json'));
  await manager.close();
  assert.equal(await readFile(registry, 'utf8'), snapshot);
});

test('the offline exporter only calls the selected local export API and never overwrites output', async t => {
  const f = await fixture(t); const pack = await readFile(f.archive); let calls = 0;
  const server = createServer(async (req, res) => {
    calls++;
    if (req.method === 'GET') { assert.ok(req.url?.startsWith('/api/v1/fs/ls?')); assert.equal(req.headers.authorization, 'Bearer synthetic-local-key'); res.writeHead(200).end(JSON.stringify({status:'ok',result:[]})); return; }
    assert.equal(req.method, 'POST'); assert.equal(req.url, '/api/v1/pack/export');
    assert.equal(req.headers.authorization, 'Bearer synthetic-local-key');
    let text = ''; for await (const chunk of req) text += chunk;
    assert.deepEqual(JSON.parse(text), { uri: rootURI, include_vectors: true });
    res.writeHead(200, { 'Content-Type': 'application/zip' }).end(pack);
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  t.after(() => new Promise<void>(r => { server.closeAllConnections(); server.close(() => r()); }));
  const base = 'http://127.0.0.1:' + (server.address() as { port: number }).port;
  const out = path.join(f.root, 'exported.ovpack');
  const code = `import importlib.util,sys,json
spec=importlib.util.spec_from_file_location('exporter',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
try: print(json.dumps(m.export_user(sys.argv[2],'synthetic-local-key','default','default',sys.argv[3])))
except ValueError: print('REJECTED')
`;
  const run = (url: string) => execute('python3', ['-I', '-B', '-c', code, path.resolve('distribution/export-openviking-personal.py'), url, out]);
  assert.equal(JSON.parse((await run(base)).stdout).status, 'exported');
  assert.deepEqual(await readFile(out), pack); assert.ok((await readFile(out+'.sha256', 'utf8')).includes('exported.ovpack'));
  assert.equal((await run(base)).stdout.trim(), 'REJECTED');
  assert.equal((await run('http://external.invalid:1935')).stdout.trim(), 'REJECTED');
  assert.equal(calls, 2);
});

test('legacy export separates auth and pack HTTP failures, supports explicit no-vector mode and removes partial output',async t=>{
 const f=await fixture(t);let failAt='auth';const calls:any[]=[];
 const server=createServer(async(req,res)=>{calls.push(req.method);if(req.method==='GET'){res.writeHead(failAt==='auth'?401:200).end(JSON.stringify({status:'ok',result:[]}));return;}let raw='';for await(const b of req)raw+=b;assert.equal(JSON.parse(raw).include_vectors,false);res.writeHead(500).end('private server detail');});
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise<void>(r=>{server.closeAllConnections();server.close(()=>r());}));
 const base='http://127.0.0.1:'+(server.address() as any).port,out=path.join(f.root,'failed.ovpack');
 const code=`import importlib.util,sys,urllib.error,os
spec=importlib.util.spec_from_file_location('exporter',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
try:m.export_user(sys.argv[2],'synthetic-local-key','default','default',sys.argv[3],include_vectors=False)
except urllib.error.HTTPError as e:print(e.export_stage, e.code)
print(os.path.exists(sys.argv[3]),os.path.exists(sys.argv[3]+'.partial'))
`;
 const run=()=>execute('python3',['-I','-B','-c',code,path.resolve('distribution/export-openviking-personal.py'),base,out]);
 assert.match((await run()).stdout,/EXPORT_PREFLIGHT 401\nFalse False/);assert.deepEqual(calls,['GET']);
 failAt='pack';assert.match((await run()).stdout,/EXPORT_PACK 500\nFalse False/);assert.deepEqual(calls,['GET','GET','POST']);
});

test('export diagnostic reveals only fixed metadata and the exporter uses authenticated minimal listing instead of failing stat',async t=>{
 const f=await fixture(t),pack=await readFile(f.archive);let authFailure=false,invalidList=false,packCalls=0;const calls:string[]=[];
 const secret='DO_NOT_REPORT_PRIVATE_KEY',privateText='PRIVATE_DOCUMENT_NAME_AND_CONTENT';
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url!,'http://localhost');calls.push(req.method+' '+url.pathname);
  assert.equal(req.headers.authorization,'Bearer '+secret);assert.equal(req.headers['x-openviking-account'],'default');assert.equal(req.headers['x-openviking-user'],'default');
  res.setHeader('Content-Type','application/json');
  if(url.pathname==='/health'){res.end(JSON.stringify({version:'0.5.0',healthy:true,auth_mode:'trusted',role:'user',account_id:'default',user_id:'default',private:privateText}));return;}
  if(url.pathname==='/ready'){res.writeHead(503).end(JSON.stringify({status:'not_ready',checks:{agfs:{status:'error',checks:{filesystem:secret}},vectordb:'error: '+privateText,embedding:'ok',private:privateText}}));return;}
  if(url.pathname==='/api/v1/fs/stat'){res.writeHead(500).end(JSON.stringify({error:{code:'INTERNAL',message:secret,details:privateText}}));return;}
  if(url.pathname==='/api/v1/fs/ls'){
   assert.equal(url.searchParams.get('simple'),'true');assert.equal(url.searchParams.get('node_limit'),'1');assert.equal(url.searchParams.get('include_abstract'),'false');assert.equal(url.searchParams.get('recursive'),'false');
   res.writeHead(authFailure?403:200).end(JSON.stringify(authFailure?{error:{code:'PERMISSION_DENIED',message:secret}}:invalidList?{status:'error',error:{code:'INTERNAL',message:secret}}:{status:'ok',result:[privateText]}));return;
  }
  assert.equal(req.method,'POST');assert.equal(url.pathname,'/api/v1/pack/export');packCalls++;res.end(pack);
 });
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise<void>(r=>{server.closeAllConnections();server.close(()=>r())}));
 const base='http://127.0.0.1:'+(server.address() as any).port,out=path.join(f.root,'new.ovpack');
 const program=`import importlib.util,sys,json,urllib.error
spec=importlib.util.spec_from_file_location('exporter',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
if sys.argv[4]=='diagnose':print(json.dumps(m.diagnose_export(sys.argv[2],'${secret}','default','default')))
else:
 try:print(json.dumps(m.export_user(sys.argv[2],'${secret}','default','default',sys.argv[3])))
 except urllib.error.HTTPError as e:print(e.export_stage,e.code)
 except ValueError:print('REJECTED_RESPONSE')
`;
 const run=(mode:string)=>execute('python3',['-I','-S','-B','-c',program,path.resolve('distribution/export-openviking-personal.py'),base,out,mode]);
 const diagnostic=(await run('diagnose')).stdout;assert.doesNotMatch(diagnostic,new RegExp(secret+'|'+privateText));const report=JSON.parse(diagnostic);assert.equal(report.exportRequested,false);assert.equal(report.results[1].httpStatus,503);assert.equal(report.results[1].ready,false);assert.deepEqual(report.results[1].checks,{agfs:'error',vectordb:'error',embedding:'ok'});assert.equal(report.results[2].httpStatus,500);assert.equal(report.results[2].serverCode,'INTERNAL');assert.equal(report.results[3].readable,true);assert.equal(packCalls,0);await assert.rejects(readFile(out));
 calls.length=0;assert.equal(JSON.parse((await run('export')).stdout).status,'exported');assert.deepEqual(calls,['GET /api/v1/fs/ls','POST /api/v1/pack/export']);assert.deepEqual(await readFile(out),pack);
 await rm(out);await rm(out+'.sha256');invalidList=true;assert.match((await run('export')).stdout,/REJECTED_RESPONSE/);assert.equal(packCalls,1);await assert.rejects(readFile(out));
 invalidList=false;authFailure=true;assert.match((await run('export')).stdout,/EXPORT_PREFLIGHT 403/);assert.equal(packCalls,1);
});
