import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { PersonalKnowledge } from '../src/main/personal-knowledge';
import type { SkillTransport } from '../src/main/openviking-skills';
const execute = promisify(execFile);
const rootURI = 'viking://user/default';
async function fixture(t: { after(fn: () => Promise<unknown>): void }, user = 'default', unsafe = false) {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-personal-')); t.after(() => rm(root, { recursive: true, force: true }));
  const archive = path.join(root, 'legacy.ovpack');
  const paths = ['memories/preference.md', 'resources/design.md', 'skills/example/SKILL.md', 'sessions/past.json', 'privacy/current.json', 'peers/codex.tool@local/memories/entity.md'];
  await execute('python3', ['-I', '-B', '-c', `import json,sys,zipfile
user=sys.argv[2]; paths=json.loads(sys.argv[3])
m={'kind':'openviking.ovpack','format_version':3,'root':{'name':user,'uri':'viking://user/'+user},'entries':[{'path':'','kind':'directory'}]+[{'path':p,'kind':'file'} for p in paths]}
with zipfile.ZipFile(sys.argv[1],'w') as z:
 z.writestr(user+'/_ovpack/manifest.json',json.dumps(m))
 for p in paths:z.writestr(user+'/files/'+p,'synthetic private data')
 if sys.argv[4]=='true':z.writestr(user+'/../outside.txt','reject')
`, archive, user, JSON.stringify(paths), String(unsafe)]);
  const requests: Array<{ route: string; options?: Parameters<SkillTransport>[1] }> = [];
  const transport: SkillTransport = async (route, options) => {
    options?.signal?.throwIfAborted(); requests.push({ route, options });
    if (route === '/api/v1/resources/temp_upload') return { result: { temp_file_id: 'uploaded-pack' } };
    if (route === '/api/v1/system/wait') return { result: {} };
    if (route === '/api/v1/system/consistency') return { result: { ok: true } };
    if (route === '/api/v1/pack/import') return { result: { uri: rootURI } };
    if (route.startsWith('/api/v1/search/find')) {
      const target = (options!.body as any).target_uri;
      return { result: { memories: [{ uri: target + '/hit.md', abstract: 'Known preference', score: 0.9 }], resources: [
        { uri: rootURI + '/sessions/raw.json', abstract: 'must not leak', score: 1 },
        { uri: rootURI + '/privacy/current.json', abstract: 'must not leak', score: 1 },
        { uri: 'viking://resources/other/file', abstract: 'must not leak', score: 1 },
      ], skills: [] } };
    }
    return { status: 'ok', result: { content: 'synthetic imported preference' } };
  };
  const manager = new PersonalKnowledge(path.join(root, 'data'), 'python3', (user, route, options) => { assert.equal(user, 'default'); return transport(route, options); }); t.after(() => manager.close());
  return { root, archive, manager, transport, requests };
}

test('personal import binds approval to a snapshot, preserves the pack and registers only allowed read roots', async t => {
  const f = await fixture(t); const original = await readFile(f.archive); let approvals = 0;
  const imported = await f.manager.import(f.archive, async (_message, detail) => {
    approvals++; assert.ok(detail.includes(rootURI)); assert.ok(detail.includes('SHA-256'));
    await writeFile(f.archive, 'changed after preview'); return true;
  });
  assert.equal(imported.status, 'imported'); assert.equal(approvals, 1);
  const retained = path.join(f.root, 'data', 'personal-' + imported.sha256 + '.ovpack');
  assert.deepEqual(await readFile(retained), original);
  assert.deepEqual(f.requests.find(r => r.route === '/api/v1/pack/import')!.options!.body,
    { temp_file_id: 'uploaded-pack', parent: 'viking://user', on_conflict: 'fail', vector_mode: 'auto' });
  assert.equal((await f.manager.status())[0].status, 'ready');
  const found = JSON.parse(await f.manager.search('preference', 10));
  assert.equal(found.scope, 'personal'); assert.equal(found.results.length, 4);
  assert.ok(!JSON.stringify(found).includes('must not leak'));
  for (const uri of [rootURI+'/sessions/raw.json', rootURI+'/privacy/current.json', rootURI+'/memories/../privacy/x', rootURI+'/memories/%2e%2e/x', 'viking://resources/project/file'])
    await assert.rejects(f.manager.read(uri), /범위/);
  assert.ok((await f.manager.read(rootURI + '/memories/preference.md')).includes('synthetic'));
  await writeFile(f.archive, original);
  const before = f.requests.filter(r => r.route === '/api/v1/pack/import').length;
  assert.equal((await f.manager.import(f.archive, async () => { throw Error('must not ask again'); })).status, 'already-imported');
  assert.equal(f.requests.filter(r => r.route === '/api/v1/pack/import').length, before);
});

test('declined, malformed and active-user packs cannot reach the import API', async t => {
  const f = await fixture(t);
  await assert.rejects(f.manager.import(f.archive, async () => false), /취소/);
  assert.equal(f.requests.length, 0); assert.deepEqual(await f.manager.status(), []);
  for (const [user, unsafe] of [['local-user', false], ['default', true]] as const) {
    const bad = await fixture(t, user, unsafe);
    await assert.rejects(bad.manager.import(bad.archive, async () => { throw Error('must not ask'); }), /OVPack/);
    assert.equal(bad.requests.length, 0);
  }
});

test('an interrupted or conflicting import stays failed, preserves its archive and cannot be searched or overwritten', async t => {
  const f = await fixture(t);
  const manager = new PersonalKnowledge(path.join(f.root, 'failed'), 'python3', async (user, route, options) => {
    assert.equal(user, 'default');
    if (route === '/api/v1/system/wait') return { result: {} };
    if (route === '/api/v1/system/consistency') return { result: { ok: true } };
    if (route === '/api/v1/pack/import') throw Object.assign(new Error('synthetic HTTP 409'), { status: 409 });
    return f.transport(route, options);
  });t.after(() => manager.close());
  await assert.rejects(manager.import(f.archive, async () => true), /완료하지 못/);
  const entries = await manager.status(); assert.equal(entries[0].status, 'failed');
  assert.deepEqual(await readFile(path.join(f.root, 'failed', 'personal-' + entries[0].sha256 + '.ovpack')), await readFile(f.archive));
  assert.equal(JSON.parse(await manager.search('x', 5)).results.length, 0);
  await assert.rejects(manager.import(f.archive, async () => true), /덮어쓰기/);
  await assert.rejects(manager.read(rootURI + '/memories/x'), /범위/);
});

test('shutdown revokes even a late approval without uploading a private archive', async t => {
  const f = await fixture(t); let entered!: () => void; let approve!: (value: boolean) => void;
  const waiting = new Promise<void>(resolve => { entered = resolve; });
  const importing = f.manager.import(f.archive, async () => { entered(); return new Promise<boolean>(resolve => { approve = resolve; }); });
  await waiting; const closing = f.manager.close(); approve(true);
  await assert.rejects(importing, /취소/); await closing; assert.equal(f.requests.length, 0);
});

test('the offline exporter only calls the selected local export API and never overwrites output', async t => {
  const f = await fixture(t); const pack = await readFile(f.archive); let calls = 0;
  const server = createServer(async (req, res) => {
    calls++;
    if (req.method === 'GET') { assert.ok(req.url?.startsWith('/api/v1/fs/stat?')); assert.equal(req.headers.authorization, 'Bearer synthetic-local-key'); res.writeHead(200).end('{}'); return; }
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
 const server=createServer(async(req,res)=>{calls.push(req.method);if(req.method==='GET'){res.writeHead(failAt==='auth'?401:200).end('{}');return;}let raw='';for await(const b of req)raw+=b;assert.equal(JSON.parse(raw).include_vectors,false);res.writeHead(500).end('private server detail');});
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

test('personal imports wait for actual indexing and never advertise ready when consistency fails',async t=>{
 const f=await fixture(t);let release!:()=>void,waiting=false,consistent=false;
 const gate=new Promise<void>(r=>{release=r;});
 const manager=new PersonalKnowledge(path.join(f.root,'index-data'),'python3',async(_user,route,opts)=>{
   if(route==='/api/v1/system/wait'){waiting=true;await gate;return {result:{}};}
   if(route==='/api/v1/system/consistency')return {result:{ok:consistent}};
   return f.transport(route,opts);
 });t.after(()=>manager.close());
 const pending=manager.import(f.archive,async()=>true);
 while(!waiting)await new Promise(r=>setTimeout(r,5));assert.equal((await manager.status())[0].status,'importing');
 release();await assert.rejects(pending,/OV_PERSONAL_INDEX/);assert.equal((await manager.status())[0].status,'failed');
 assert.equal(JSON.parse(await manager.search('compiler',3)).results.length,0);
});
