import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { configSchema } from '../src/shared/contracts';
import { NativeRuntime } from '../distribution/native-control';
import { AgentOwner } from '../distribution/ned/owner';
import { migrateLegacy, migrationNeedsBootstrap } from '../distribution/ned/migration';
import { editorSettings } from '../distribution/ned/profile';
import { PermissionPolicy } from '../distribution/ned/permission-policy';
const cli = path.resolve('.cache/l-vibe-desktop/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode');
const bridge = path.resolve('.cache/ned/app/agent.cjs');

test('Ned migration preserves encrypted settings and history without replacing existing data', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-migrate-')); t.after(() => rm(root, { recursive: true, force: true }));
  const old = path.join(root, 'L-Vibe'), target = path.join(root, 'Ned');
  await mkdir(path.join(old, 'runtime/data'), { recursive: true }); await writeFile(path.join(old, 'settings.enc.json'), 'encrypted-fixture');
  await writeFile(path.join(old, 'Local State'), JSON.stringify({ os_crypt: { encrypted_key: 'DPAPI-protected-fixture' } }));
  assert.equal(migrationNeedsBootstrap(old, target), true);
  await writeFile(path.join(old, 'runtime/data/history.db'), 'closed-database-fixture');
  await assert.rejects(migrateLegacy(old, target, async () => true), /종료/);
  assert.equal(existsSync(target), false);
  assert.equal(await migrateLegacy(old, target, async () => false), 'migrated');
  assert.equal(migrationNeedsBootstrap(old, target), false);
  assert.equal(await readFile(path.join(target, 'Local State'), 'utf8'), await readFile(path.join(old, 'Local State'), 'utf8'));
  assert.equal(await readFile(path.join(target, 'runtime/data/history.db'), 'utf8'), 'closed-database-fixture');
  assert.equal(await readFile(path.join(old, 'settings.enc.json'), 'utf8'), 'encrypted-fixture');
  await writeFile(path.join(target, 'settings.enc.json'), 'new-state');
  assert.equal(await migrateLegacy(old, target, async () => false), 'existing');
  assert.equal(await readFile(path.join(target, 'settings.enc.json'), 'utf8'), 'new-state');
  const target2 = path.join(root, 'Ned2'); await symlink(path.join(old, 'settings.enc.json'), path.join(old, 'link'));
  await assert.rejects(migrateLegacy(old, target2, async () => false), /링크/);
  assert.equal(existsSync(target2), false);
});
test('managed editor does not include model secrets or download-enabled extensions', () => {
  const settings = editorSettings('/Ned.exe', '/agent.cjs', '/private/descriptor.json', 'http://127.0.0.1:9', '/clangd.exe');
  assert.equal(settings.auto_update, false); assert.deepEqual(settings.telemetry, { diagnostics: false, metrics: false });
  assert.deepEqual(settings.granted_extension_capabilities, []);
  assert.equal(settings.agent_servers.Ned.env.ELECTRON_RUN_AS_NODE, '1');
  assert.deepEqual(settings.language_servers, []);
  assert.equal(settings.languages['C++'].language_servers[0], 'clangd');
  assert.equal(settings.agent_servers.Ned.args[1], '/private/descriptor.json');
});
test('real Ned ACP attaches to one managed engine, advertises models and checks unsaved buffers before approved edits',
 { skip: !existsSync(cli) || !existsSync(bridge), timeout: 120000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-acp-'));
  const project = path.join(root, 'project'), data = path.join(root, 'data');
  await mkdir(project); await mkdir(data); await writeFile(path.join(project, 'main.c'), 'int main() { return 0; }\r\n');
  let turn = 0, step = 0, approvals = 0, bufferReads = 0, dirty = false;
  const wire: any[] = [];
  const model = createServer(async (req, res) => {
    let text = ''; for await (const bytes of req) text += bytes; const body = JSON.parse(text); wire.push(body);
    if (!body.stream || !body.tools?.length) { res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ id: 'aux', object: 'chat.completion', model: body.model, choices: [{ index: 0, message: { role: 'assistant', content: 'Ned test' }, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } })); return; }
    let delta: any = { role: 'assistant', content: 'Ned verified.' }, finish = 'stop';
    const sequence = turn === 0 ? [['read_file', { path: 'main.c' }], ['propose_edit', { path: 'main.c', content: 'int main() { return 7; }\n' }]] : [['propose_edit', { path: 'main.c', content: 'int main() { return 9; }\n' }]];
    if (step < sequence.length) {
      const [suffix, args] = sequence[step++];
      const name = body.tools.map((x: any) => x.function.name).find((x: string) => x.endsWith('_' + suffix));
      delta = { role: 'assistant', tool_calls: [{ index: 0, id: 'ned-' + turn + '-' + step, type: 'function', function: { name, arguments: JSON.stringify(args) } }] }; finish = 'tool_calls';
    }
    const chunk = (d: any, f: any) => ({ id: 'c', object: 'chat.completion.chunk', created: 1, model: body.model, choices: [{ index: 0, delta: d, finish_reason: f }] });
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end('data: ' + JSON.stringify(chunk(delta, null)) + '\n\ndata: ' + JSON.stringify(chunk({}, finish)) + '\n\ndata: [DONE]\n\n');
  });
  await new Promise<void>(r => model.listen(0, '127.0.0.1', r));
  const port = (model.address() as { port: number }).port;
  const config = configSchema.parse({ model: { providerID: 'p', model: 'b' }, providers: { p: { settings: { baseURL: 'http://127.0.0.1:' + port + '/v1', APIKey: 'synthetic-ned-secret' }, models: {
    a: { name: 'A', modelID: 'wire-a', capabilities: { tools: true } },
    b: { name: 'B', modelID: 'wire-b', capabilities: { tools: true } },
  } } } });
  const policy = new PermissionPolicy(data); await policy.load();
  const runtime = new NativeRuntime(data, path.join(root, 'resources'), { isEncryptionAvailable: () => true, encryptString: Buffer.from, decryptString: b => b.toString() }, async () => { approvals++; return true; }, undefined, policy);
  let owner: AgentOwner | undefined; let child: ReturnType<typeof spawn> | undefined;
  t.after(async () => { child?.kill(); await owner?.close(); await runtime.close(); model.closeAllConnections(); await new Promise<void>(r => model.close(() => r())); await rm(root, { recursive: true, force: true }); });
  await runtime.initialize(config); await runtime.authorizeProject(project);
  const credentials = await runtime.connection([cli]);
  owner = new AgentOwner(data, runtime, credentials, async selected => selected === project);
  const traces: string[] = [];
  (runtime as any).proxy.server.on('request', (req: any, res: any) => { res.once('finish', () => traces.push(req.method + ' ' + req.url + ' ' + res.statusCode)); });
  const descriptor = await owner.start();
  runtime.setEditorCheck((session, directory, proposal, signal) => owner!.checkBuffer(session, directory, proposal, signal));
  const executable = process.env.NED_TEST_AGENT_EXECUTABLE ?? process.execPath;
  const supervised = process.env.NED_TEST_AGENT_SUPERVISED === '1';
  child = spawn(supervised ? 'python3' : executable, supervised ? ['-I', '-B', path.resolve('scripts/sidecar-supervisor.py'), executable, bridge, descriptor] : [bridge, descriptor], { stdio: 'pipe', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } });
  let serial = 0, stderr = '';
  const pending = new Map<number, { resolve(value: any): void; reject(error: Error): void; method: string }>();
  const updates: any[] = [];
  const request = (method: string, params: unknown) => new Promise<any>((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject, method }); child!.stdin!.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); });
  child.stderr!.on('data', bytes => { stderr += bytes; });
  child.once('exit', () => { for (const entry of pending.values()) entry.reject(new Error('Bridge exited: ' + stderr)); });
  createInterface({ input: child.stdout! }).on('line', line => {
    const message = JSON.parse(line);
    if (message.method === 'fs/read_text_file') {
      bufferReads++;
      void readFile(path.join(project, 'main.c'), 'utf8').then(content => child!.stdin!.write(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: { content: dirty ? 'unsaved editor text' : content.replaceAll('\r\n', '\n') } }) + '\n'));
    } else if (message.method) updates.push(message);
    else { const entry = pending.get(message.id); pending.delete(message.id); if (message.error) entry?.reject(new Error(entry?.method + ": " + JSON.stringify(message.error) + "\n" + traces.join("\n"))); else entry?.resolve(message.result); }
  });
  const init = await request('initialize', { protocolVersion: 1, clientCapabilities: { fs: { readTextFile: true, writeTextFile: false }, terminal: false }, clientInfo: { name: 'ned-fixture', version: '1' } });
  assert.equal(init.agentInfo.name, 'Ned');
  await assert.rejects(request('session/new', { cwd: project, mcpServers: [{ name: 'untrusted', command: 'anything', args: [], env: [] }] }), /Ned-managed/);
  await assert.rejects(request('session/new', { cwd: data, mcpServers: [] }), /앱 관리 경로/);
  await assert.rejects(request('session/prompt', { sessionId: 'forged-session', prompt: [] }), /Session not attached/);
  const created = await request('session/new', { cwd: project, mcpServers: [] });
  assert.ok(created.sessionId); assert.ok(JSON.stringify(created.configOptions).includes('wire') || JSON.stringify(created.configOptions).includes('p/'));
  assert.equal(created.configOptions.find((option:any)=>option.category==='_ned_permissions').currentValue,'ask');
  await assert.rejects(request('session/set_config_option',{sessionId:'forged-session',configId:'ned.permissions',value:'full'}),/Session not attached/);
  await request('session/prompt', { sessionId: created.sessionId, prompt: [{ type: 'text', text: 'Read main.c and change the return value to 7.' }] });
  assert.equal(await readFile(path.join(project, 'main.c'), 'utf8'), 'int main() { return 7; }\n');
  assert.equal(approvals, 1); assert.ok(bufferReads >= 2);
  assert.ok(wire.every(body => body.model === 'wire-b'));
  const advertised = wire.flatMap(body => (body.tools ?? []).map((tool: any) => tool.function.name));
  assert.ok(advertised.includes('ned_host_read_file'));
  assert.ok(advertised.every((name: string) => !/l[_-]vibe/i.test(name)));

  const changed = await request('session/set_config_option',{sessionId:created.sessionId,configId:created.configOptions.find((option:any)=>option.category==='_ned_permissions').id,value:'full'});
  assert.equal(changed.configOptions.find((option:any)=>option.category==='_ned_permissions').currentValue,'full');
  assert.ok(changed.configOptions.some((option:any)=>option.category==='model'));
  assert.equal(runtime.permissionStatus().mode,'full');
  const selectedModel=changed.configOptions.find((option:any)=>option.category==='model');
  const modelResponse=await request('session/set_config_option',{sessionId:created.sessionId,configId:selectedModel.id,value:selectedModel.currentValue});
  assert.equal(modelResponse.configOptions.find((option:any)=>option.category==='_ned_permissions').currentValue,'full');
  dirty = true; turn++; step = 0;
  await request('session/prompt', { sessionId: created.sessionId, prompt: [{ type: 'text', text: 'Now change the return value to 9.' }] });
  assert.equal(await readFile(path.join(project, 'main.c'), 'utf8'), 'int main() { return 7; }\n');
  assert.equal(approvals, 1);
  dirty=false;turn++;step=0;
  await request('session/prompt',{sessionId:created.sessionId,prompt:[{type:'text',text:'Change the saved file to 9.'}]});
  assert.equal(await readFile(path.join(project,'main.c'),'utf8'),'int main() { return 9; }\n');
  assert.equal(approvals,1);
  const reloaded=new PermissionPolicy(data);await reloaded.load();assert.equal(reloaded.mode,'full');
  const beforeNativeChange=updates.length;
  await runtime.setPermissionMode('ask');
  for (let attempt=0;attempt<100 && !updates.slice(beforeNativeChange).some(message=>message.params?.update?.configOptions?.some((option:any)=>option.category==='_ned_permissions' && option.currentValue==='ask'));attempt++) await new Promise(resolve=>setTimeout(resolve,10));
  assert.ok(updates.slice(beforeNativeChange).some(message=>message.params?.update?.sessionUpdate==='config_option_update' && message.params.update.configOptions.some((option:any)=>option.category==='_ned_permissions' && option.currentValue==='ask')));
  const stalePermission=changed.configOptions.find((option:any)=>option.category==='_ned_permissions');
  await assert.rejects(request('session/set_config_option',{sessionId:created.sessionId,configId:stalePermission.id,value:'full'}),/권한 설정이 변경/);
  assert.equal(runtime.permissionStatus().mode,'ask');
  const another=await request('session/new',{cwd:project,mcpServers:[]});
  const freshPermission=another.configOptions.find((option:any)=>option.category==='_ned_permissions');
  assert.equal(freshPermission.currentValue,'ask');assert.notEqual(freshPermission.id,stalePermission.id);
  assert.ok(JSON.stringify(updates).includes('Ned verified.'));
  assert.ok(!JSON.stringify(updates).includes('synthetic-ned-secret'));
});
