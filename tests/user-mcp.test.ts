import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { UserMcp } from '../distribution/user-mcp';
import { isIntranetAddress, UserMcpHttp } from '../distribution/user-mcp-http';
import { SidecarProxy } from '../distribution/sidecar-proxy';
import { ModelGateway } from '../src/main/model-gateway';
import { isSessionMemoryOptOut } from '../src/main/session-memory';
import { mcpPromptWithTicket, userMcpModelToolName } from '../src/shared/user-mcp';

function listening(server: ReturnType<typeof createServer>) {
  return new Promise<number>(resolve => server.listen(0, '127.0.0.1', () => resolve((server.address() as { port: number }).port)));
}
function close(server: ReturnType<typeof createServer>) {
  server.closeAllConnections();
  return new Promise<void>(resolve => server.close(() => resolve()));
}
const cipher = {
  isEncryptionAvailable: () => true,
  encryptString: (text: string) => Buffer.from(text).reverse(),
  decryptString: (bytes: Buffer) => Buffer.from(bytes).reverse().toString(),
};
const unbounded = new AbortController().signal;
const rpcReply = (id: string | number, result: unknown) => JSON.stringify({ jsonrpc: '2.0', id, result });

function fakeMcp() {
  const calls: any[] = [];
  const requests: string[] = [];
  let toolVersion = 'string', responseLost = false, denied = false;
  const server = createServer(async (request, response) => {
    if (denied) { response.writeHead(401).end(); return; }
    if (request.method === 'DELETE') { response.writeHead(200).end(); return; }
    let raw = '';
    for await (const chunk of request) raw += chunk;
    const message = JSON.parse(raw);
    requests.push(message.method);
    if (message.method === 'initialize') {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Mcp-Session-Id': 'synthetic' })
        .end(rpcReply(message.id, { protocolVersion: '2025-06-18', capabilities: { tools: {} } }));
      return;
    }
    assert.equal(request.headers['mcp-session-id'], 'synthetic');
    assert.equal(request.headers['mcp-protocol-version'], '2025-06-18');
    if (message.method === 'notifications/initialized') { response.writeHead(202).end(); return; }
    if (message.method === 'tools/list') {
      const name = message.params.cursor ? 'unselected_tool' : 'synthetic_query';
      response.writeHead(200, { 'Content-Type': 'application/json' }).end(rpcReply(message.id, {
        tools: [{ name, inputSchema: { type: 'object', properties: { query: { type: toolVersion } } } }],
        ...(!message.params.cursor ? { nextCursor: 'another-page' } : {}),
      }));
      return;
    }
    assert.equal(message.method, 'tools/call');
    calls.push(message.params);
    if (responseLost) { response.destroy(); return; }
    response.writeHead(200, { 'Content-Type': 'text/event-stream' });
    response.write(': keepalive\r\n\r\n');
    response.end('data: ' + rpcReply(message.id, { content: [{ type: 'text', text: 'query done' }] }) + '\r\n\r\n');
  });
  return {
    server, calls, requests,
    changeTool: () => { toolVersion = 'number'; }, loseResponse: () => { responseLost = true; }, deny: () => { denied = true; },
  };
}

test('registered Streamable HTTP MCP is scoped to a single authenticated request and checks approval and catalog drift', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-user-mcp-'));
  const remote = fakeMcp();
  const port = await listening(remote.server);
  const connection = (server: { endpoint: { url: string } }) => new UserMcpHttp(server.endpoint, async () => ({ address: '127.0.0.1', family: 4 }));
  const registry = new UserMcp(root, cipher, connection);
  t.after(async () => { registry.close(); await close(remote.server); await rm(root, { recursive: true, force: true }); });
  await registry.load();
  const input = { id: 'team-search', name: '사내 검색', endpoint: { url: `http://mcp.internal.test:${port}/mcp` } };
  const checked = await registry.check(input, unbounded);
  assert.deepEqual(checked.tools.map(tool => tool.name), ['synthetic_query', 'unselected_tool']);
  await registry.register({ receipt: checked.receipt, names: ['synthetic_query'], replace: false });
  assert.deepEqual(registry.commands(), []);
  assert.deepEqual(remote.calls, []);
  await registry.toggle('team-search', true);
  assert.equal(registry.commands()[0].name, 'mcp-team-search');
  const encoded = await readFile(path.join(root, 'user-mcp.enc.json'), 'utf8');
  assert.doesNotMatch(encoded, /team-search|mcp\.internal\.test/);
  const reopened = new UserMcp(root, cipher);
  await reopened.load();
  assert.equal(reopened.commands()[0].name, 'mcp-team-search');
  assert.throws(() => registry.begin('forged', { id: 'msg1', text: mcpPromptWithTicket('0'.repeat(48), '/mcp-team-search hi') }));

  const ticket = registry.prepare('sessionA', 'team-search');
  const body = { id: 'msg1', text: mcpPromptWithTicket(ticket, '/mcp-team-search Find issue 123') };
  registry.begin('sessionA', body);
  assert.equal(body.text, '/mcp-team-search Find issue 123');
  assert.equal(isSessionMemoryOptOut(body.text), true);
  assert.deepEqual(registry.modelTools('sessionA', undefined)?.names, ['synthetic_query']);
  assert.equal(registry.modelTools('sessionB', 'sessionA'), undefined);
  const args = { grant: ticket, tool: 'synthetic_query', arguments: { query: 'issue 123' } };
  const readRequest = async () => 'msg1';
  const approve = async (_message: string, detail: string) => { assert.match(detail, /issue 123/); return true; };
  const redact = (text: string) => text;
  await assert.rejects(registry.call('sessionB', args, readRequest, approve, redact), /목록에서 선택/);
  await assert.rejects(registry.call('sessionA', args, async () => 'msg2', approve, redact), /요청이 변경/);
  await assert.rejects(registry.call('sessionA', { ...args, tool: 'unselected_tool' }, readRequest, approve, redact), /선택한 MCP 도구/);
  await assert.rejects(registry.call('sessionA', args, readRequest, async () => false, redact), /승인하지/);
  assert.deepEqual(remote.calls, []);
  assert.equal((await registry.call('sessionA', args, readRequest, approve, redact)).content[0].text, 'query done');
  assert.deepEqual(remote.calls, [{ name: 'synthetic_query', arguments: { query: 'issue 123' } }]);
  remote.changeTool();
  await assert.rejects(registry.call('sessionA', args, readRequest, approve, redact), /계약이 변경/);
  assert.equal(remote.calls.length, 1);
  await registry.toggle('team-search', false);
  assert.equal(registry.modelTools('sessionA', undefined), undefined);
  await assert.rejects(registry.call('sessionA', args, readRequest, approve, redact), /목록에서 선택/);
  await registry.toggle('team-search', true);
  const refreshed = await registry.check(input, unbounded);
  await registry.register({ receipt: refreshed.receipt, names: ['synthetic_query'], replace: true });
  const second = registry.prepare('sessionA', 'team-search');
  registry.begin('sessionA', { id: 'msg1', text: mcpPromptWithTicket(second, '/mcp-team-search hi') });
  remote.loseResponse();
  await assert.rejects(registry.call('sessionA', { ...args, grant: second }, readRequest, approve, redact), /실행 결과를 확인/);
  assert.equal(remote.calls.length, 2);
  registry.begin('sessionA', { id: 'msg3', text: '일반 요청' });
  assert.equal(registry.modelTools('sessionA', undefined), undefined);
  remote.deny();
  await assert.rejects(registry.check(input, unbounded), /인증 또는 접근 권한/);
});

test('address policy allows explicitly registered localhost, blocks internal ports and never follows redirects', async t => {
  for (const value of ['127.0.0.1', '169.254.1.2', '8.8.8.8', '::1', '::ffff:10.0.0.1']) assert.equal(isIntranetAddress(value), false);
  for (const value of ['10.1.1.1', '172.16.1.1', '192.168.1.1', 'fd20::1']) assert.equal(isIntranetAddress(value), true);
  assert.throws(() => new UserMcpHttp({ url: 'http://192.0.2.42/mcp' }));
  assert.doesNotThrow(() => new UserMcpHttp({ url: 'https://127.0.0.1:18081/mcp' }));
  assert.doesNotThrow(() => new UserMcpHttp({ url: 'http://[::1]:8081/mcp' }));
  assert.throws(() => new UserMcpHttp({ url: 'http://10.0.0.1/mcp', auth: { header: 'Authorization', value: 'Bearer fake-key' } }));
  let redirected = 0;
  const server = createServer((req, res) => {
    if (req.url === '/mcp') { res.writeHead(307, { Location: '/redirected' }).end(); return; }
    redirected++; res.writeHead(200).end();
  });
  const port = await listening(server);
  t.after(() => close(server));
  const client = new UserMcpHttp({ url: `http://127.0.0.1:${port}/mcp` });
  await assert.rejects(client.list(unbounded), /주소 이동/);
  const reserved = new UserMcpHttp({ url: `http://localhost:${port}/mcp` }, undefined, () => [port]);
  await assert.rejects(reserved.list(unbounded), /Ned 내부 서비스/);
  assert.equal(redirected, 0);
});

test('prompt boundary strips the private ticket and the model sees only the selected MCP tool', async t => {
  let forwarded: any;
  const target = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    forwarded = JSON.parse(raw);
    res.writeHead(200, { 'Content-Type': 'application/json' }).end('{}');
  });
  const port = await listening(target);
  t.after(() => close(target));
  const proxy = new SidecarProxy({ url: `http://127.0.0.1:${port}`, password: 'fake' }, {
    cancelSession() {},
    resumeSession: (_session, body) => { assert.match(String(body?.text), /^NED_USER_MCP_TICKET:/); body!.text = 'visible request'; },
  });
  t.after(() => proxy.close());
  const local = await proxy.start();
  const result = await fetch(local.url + '/api/session/s/prompt', { method: 'POST', body: JSON.stringify({ id: 'msg1', text: mcpPromptWithTicket('a'.repeat(48), 'visible request') }), headers: { Authorization: 'Basic ' + Buffer.from('opencode:fake').toString('base64'), 'Content-Type': 'application/json' } });
  assert.equal(result.ok, true);
  await result.text();
  assert.deepEqual({ ...forwarded }, { id: 'msg1', text: 'visible request' });
  const model = new ModelGateway({ schemaVersion: 2, model: { id: 'model', apiKey: 'fake-model', baseUrl: `http://127.0.0.1:${port}/v1` } }, {}, undefined, undefined, 4096, 'ned', undefined, undefined,
    async session => session === 'selected' ? { grant: 'a'.repeat(48), names: ['synthetic_query'], guidance: 'bounded catalog' } : undefined);
  await model.start(); t.after(() => model.close());
  const invoke = (id: string, parent?: string) => fetch(model.baseUrl + '/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + model.token, 'x-opencode-session-id': id, ...(parent ? { 'x-opencode-parent-session-id': parent } : {}) }, body: JSON.stringify({ model: 'model', messages: [{ role: 'user', content: 'natural prompt' }], tools: [{ type: 'function', function: { name: userMcpModelToolName, parameters: { type: 'object', properties: { grant: {}, tool: {} } } } }] }) }).then(response => response.text());
  await invoke('ordinary');
  assert.deepEqual(forwarded.tools, []);
  await invoke('selected');
  assert.deepEqual(forwarded.tools[0].function.parameters.properties.tool.enum, ['synthetic_query']);
  assert.match(forwarded.messages[0].content, /bounded catalog/);
  await invoke('selected', 'parent');
  assert.deepEqual(forwarded.tools, []);
});

const installedEngine = process.env.NED_TEST_ENGINE;
const installedResources = process.env.NED_TEST_RESOURCES;
test('installed Ned ACP refreshes commands and executes only a slash-selected external MCP',
  { skip: !installedEngine || !installedResources, timeout: 60000 }, async t => {
    const { mkdir } = await import('node:fs/promises');
    const { spawn } = await import('node:child_process');
    const { createInterface } = await import('node:readline');
    const { NativeRuntime } = await import('../distribution/native-control');
    const { AgentOwner } = await import('../distribution/ned/owner');
    const root = await mkdtemp(path.join(tmpdir(), 'ned-installed-user-mcp-'));
    const project = path.join(root, 'project');
    await mkdir(project);
    const remote = fakeMcp(), remotePort = await listening(remote.server);
    const seen: Array<{ selected: boolean; request: string }> = [];
    let observed = false, approvals = 0;
    const model = createServer(async (request, response) => {
      let raw = '';
      for await (const chunk of request) raw += chunk;
      const body = JSON.parse(raw);
      const last = body.messages?.findLast((message: any) => message.role === 'user');
      const text = JSON.stringify(last?.content ?? '');
      assert.doesNotMatch(JSON.stringify(body.messages), /NED_USER_MCP_TICKET:/);
      const offered = body.tools?.find((tool: any) => tool.function?.name === userMcpModelToolName);
      if (text.includes('ordinary user request') || text.includes('selected user request')) seen.push({ selected: !!offered, request: text });
      if (!body.stream) {
        response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: '제목' }, finish_reason: 'stop' }] }));
        return;
      }
      let delta: any = { role: 'assistant', content: '완료' }, finish = 'stop';
      if (text.includes('selected user request') && offered && !observed) {
        observed = true;
        const grant = offered.function.parameters.properties.grant.enum[0];
        delta = { role: 'assistant', tool_calls: [{ index: 0, id: 'call_mcp_test', type: 'function', function: {
          name: userMcpModelToolName, arguments: JSON.stringify({ grant, tool: 'synthetic_query', arguments: { query: 'issue 123' } }),
        } }] };
        finish = 'tool_calls';
      }
      const chunk = (d: unknown, f: string | null) => 'data: ' + JSON.stringify({ id: 'x', object: 'chat.completion.chunk', created: 1, model: body.model, choices: [{ index: 0, delta: d, finish_reason: f }] }) + '\n\n';
      response.writeHead(200, { 'Content-Type': 'text/event-stream' }).end(chunk(delta, null) + chunk({}, finish) + 'data: [DONE]\n\n');
    });
    const modelPort = await listening(model);
    const data = path.join(root, 'data');
    const registry = new UserMcp(data, cipher, server => new UserMcpHttp(server.endpoint, async () => ({ address: '127.0.0.1', family: 4 })));
    const runtime = new NativeRuntime(data, installedResources!, cipher, async message => {
      if (message === '사용자 MCP 도구 실행') approvals++;
      return true;
    });
    Object.defineProperty(runtime, 'userMcp', { value: registry });
    let owner: InstanceType<typeof AgentOwner> | undefined, agent: ReturnType<typeof spawn> | undefined;
    t.after(async () => {
      agent?.kill();
      await owner?.close();
      await runtime.close();
      await Promise.all([close(remote.server), close(model)]);
      await rm(root, { recursive: true, force: true });
    });
    await runtime.initialize({ schemaVersion: 2, model: { baseUrl: `http://127.0.0.1:${modelPort}/v1`, id: 'test', apiKey: 'fixture-key' } });
    const checked = await registry.check({ id: 'team-query', name: '팀 조회', endpoint: { url: `http://mcp.internal.test:${remotePort}/mcp` } }, unbounded);
    await registry.register({ receipt: checked.receipt, names: ['synthetic_query'], replace: false });
    await runtime.authorizeProject(project);
    owner = new AgentOwner(path.join(root, 'owner'), runtime, await runtime.connection([installedEngine!]), async () => true);
    const descriptor = await owner.start();
    agent = spawn(process.execPath, [path.join(installedResources!, 'ned', 'agent.cjs'), descriptor], { stdio: 'pipe', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } });
    const updates: any[] = [];
    const pending = new Map<number, { resolve(value: any): void; reject(error: Error): void }>();
    let sequence = 0, agentError = '';
    agent.stderr!.on('data', bytes => { agentError = (agentError + bytes).slice(-1000); });
    agent.on('exit', (code) => { for (const item of pending.values()) item.reject(Error(`ACP exited (${code}): ${agentError}`)); });
    createInterface({ input: agent.stdout! }).on('line', line => {
      const message = JSON.parse(line);
      if (message.method) { updates.push(message); return; }
      const item = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) item?.reject(Error(message.error.message));
      else item?.resolve(message.result);
    });
    const rpc = (method: string, params: unknown) => new Promise<any>((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      agent!.stdin!.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
    const waitCommand = async (session: string, expected: boolean) => {
      for (let attempt = 0; attempt < 100; attempt++) {
        const commands = updates.slice().reverse().find(item => item.params?.sessionId === session && item.params?.update?.sessionUpdate === 'available_commands_update')?.params.update.availableCommands;
        if (commands?.some((item: any) => item.name === 'mcp-team-query') === expected) return commands;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      throw Error('ACP command catalogue did not update');
    };
    await rpc('initialize', { protocolVersion: 1, clientCapabilities: {} });
    const { sessionId } = await rpc('session/new', { cwd: project, mcpServers: [] });
    assert.ok((await waitCommand(sessionId, false)).some((item: any) => item.name === 'compact'));
    await registry.toggle('team-query', true);
    assert.ok((await waitCommand(sessionId, true)).some((item: any) => item.name === 'compact'));
    await rpc('session/prompt', { sessionId, prompt: [{ type: 'text', text: 'ordinary user request' }] });
    assert.equal(remote.calls.length, 0);
    await rpc('session/prompt', { sessionId, prompt: [{ type: 'text', text: '/mcp-team-query selected user request' }] });
    assert.equal(remote.calls.length, 1);
    assert.equal(approvals, 1);
    assert.ok(seen.some(entry => !entry.selected && entry.request.includes('ordinary user request')));
    assert.ok(seen.some(entry => entry.selected && entry.request.includes('selected user request')));
    await registry.toggle('team-query', false);
    await waitCommand(sessionId, false);
    await assert.rejects(rpc('session/prompt', { sessionId, prompt: [{ type: 'text', text: '/mcp-team-query after disable' }] }), /목록에서 다시 선택/);
    assert.equal(remote.calls.length, 1);
  });
