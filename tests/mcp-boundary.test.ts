import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { BrowserProxy } from '../src/main/browser-proxy';
import { McpExtensions } from '../src/main/mcp-extensions';
import { ProjectFiles } from '../src/main/files';

test('browser proxy forwards only the approved origin and refuses writes and alternate loopback ports', async t => {
  const calls: string[] = [];
  const target = createServer((req, res) => { calls.push(req.method!); assert.equal(req.headers.authorization, undefined); res.end('local fixture'); });
  await new Promise<void>(r => target.listen(0, '127.0.0.1', r));
  t.after(() => { target.closeAllConnections(); target.close(); });
  const port = (target.address() as {port: number}).port;
  const proxy = new BrowserProxy(BrowserProxy.target(`http://127.0.0.1:${port}/`)); await proxy.start(); t.after(() => proxy.close());
  const send = (url: string, method = 'GET') => new Promise<number>((resolve, reject) => {
    const req = request(proxy.url, { method, path: url, headers: { Authorization: 'synthetic-secret' } }, res => { res.resume(); res.once('end', () => resolve(res.statusCode!)); });
    req.once('error', reject); req.end();
  });
  assert.equal(await send(`http://127.0.0.1:${port}/`), 200);
  assert.equal(await send(`http://127.0.0.1:${port}/`, 'POST'), 403);
  assert.equal(await send(`http://127.0.0.1:${port + 1}/`), 403);
  assert.equal(await send('http://example.invalid/'), 403);
  assert.deepEqual(calls, ['GET']);
  for (const url of ['file:///etc/passwd', 'http://127.0.0.2:1234/', 'http://user:pass@localhost:1234/', `http://localhost:${port}/`, `http://[::1]:${port}/`])
    assert.throws(() => BrowserProxy.target(url, [port]));

  // IPv6 loopback target and localhost -> ::1 fallback when dev server binds only on ::1
  const ipv6Server = createServer((_req, res) => res.end('ipv6-local-fixture'));
  const ipv6Bound = await new Promise<boolean>(resolve => {
    ipv6Server.once('error', () => resolve(false));
    ipv6Server.listen(0, '::1', () => resolve(true));
  });
  if (ipv6Bound) {
    t.after(() => { ipv6Server.closeAllConnections(); ipv6Server.close(); });
    const v6Port = (ipv6Server.address() as { port: number }).port;
    const directV6 = new BrowserProxy(BrowserProxy.target(`http://[::1]:${v6Port}/`));
    await directV6.start();
    t.after(() => directV6.close());
    const v6Body = await new Promise<{ status: number; text: string }>((resolve, reject) => {
      const req = request(directV6.url, { method: 'GET', path: `http://[::1]:${v6Port}/` }, res => {
        let text = ''; res.on('data', chunk => { text += chunk; }); res.once('end', () => resolve({ status: res.statusCode!, text }));
      });
      req.once('error', reject); req.end();
    });
    assert.equal(v6Body.status, 200);
    assert.equal(v6Body.text, 'ipv6-local-fixture');

    const localhostV6 = new BrowserProxy(BrowserProxy.target(`http://localhost:${v6Port}/`));
    await localhostV6.start();
    t.after(() => localhostV6.close());
    const fallbackBody = await new Promise<{ status: number; text: string }>((resolve, reject) => {
      const req = request(localhostV6.url, { method: 'GET', path: `http://localhost:${v6Port}/` }, res => {
        let text = ''; res.on('data', chunk => { text += chunk; }); res.once('end', () => resolve({ status: res.statusCode!, text }));
      });
      req.once('error', reject); req.end();
    });
    assert.equal(fallbackBody.status, 200);
    assert.equal(fallbackBody.text, 'ipv6-local-fixture');
  }
});

test('project snapshots exclude executable configuration directories regardless of Windows casing', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-case-')); t.after(() => rm(root, { recursive: true, force: true }));
  for (const name of ['.GIT', '.OpenCode', 'Node_Modules', 'BUILD', '.VENV']) { await mkdir(path.join(root, name)); await writeFile(path.join(root, name, 'injected.txt'), 'untrusted'); }
  await writeFile(path.join(root, 'main.cpp'), 'int main() {}');
  assert.deepEqual(await new ProjectFiles(root).list(), ['main.cpp']);
});

test('browser_check resolves sibling packages from installed mcp/node directory without ancestor node_modules', async t => {
  const temp = await mkdtemp(path.join(tmpdir(), 'ned-mcp-node-layout-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const project = path.join(temp, 'project');
  const state = path.join(temp, 'state');
  const mcpBase = path.join(temp, 'resources/runtime/windows-x64/mcp');
  const browserBinary = path.join(mcpBase, 'browser/chrome-win64/chrome.exe');
  await mkdir(project, { recursive: true });
  await mkdir(path.dirname(browserBinary), { recursive: true });
  await writeFile(browserBinary, 'stub');
  await copyFile(path.resolve('scripts/mcp-node-worker.cjs'), path.join(mcpBase, 'mcp-node-worker.cjs'));

  // Reproduce the exact installed bundle layout: @playwright/mcp/cli.js requires sibling playwright-core/... under mcp/node/ (not node_modules/).
  await mkdir(path.join(mcpBase, 'node/@playwright/mcp'), { recursive: true });
  await mkdir(path.join(mcpBase, 'node/playwright-core/lib'), { recursive: true });
  await writeFile(path.join(mcpBase, 'node/playwright-core/lib/utilsBundle.js'), 'exports.marker = "sibling-resolved";\n');
  await writeFile(
    path.join(mcpBase, 'node/@playwright/mcp/cli.js'),
    `const sibling = require('playwright-core/lib/utilsBundle');
const readline = require('node:readline');
const send = msg => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...msg }) + '\\n');
const rl = readline.createInterface({ input: process.stdin });
rl.on('close', () => process.exit(0));
rl.on('line', line => {
  const m = JSON.parse(line);
  if (m.method === 'initialize') return send({ id: m.id, result: { protocolVersion: '2025-06-18', serverInfo: { name: 'pw-fixture', version: '1.0.0' } } });
  if (m.method === 'tools/list') return send({ id: m.id, result: { tools: ['browser_navigate', 'browser_snapshot', 'browser_console_messages', 'browser_take_screenshot', 'browser_close'].map(name => ({ name })) } });
  if (m.method === 'tools/call') {
    if (m.params.name === 'browser_navigate') return send({ id: m.id, result: { content: [{ type: 'text', text: 'Navigated (' + sibling.marker + ')' }] } });
    if (m.params.name === 'browser_snapshot') return send({ id: m.id, result: { content: [{ type: 'text', text: '- heading "Fixture"' }] } });
    if (m.params.name === 'browser_console_messages') return send({ id: m.id, result: { content: [{ type: 'text', text: '0 errors' }] } });
    if (m.params.name === 'browser_take_screenshot') return send({ id: m.id, result: { content: [{ type: 'image', mimeType: 'image/png', data: 'iVBORw0KGgo=' }] } });
  }
});
`,
  );

  const page = createServer((_req, res) => res.end('ok'));
  await new Promise<void>(r => page.listen(0, '127.0.0.1', r));
  t.after(() => { page.closeAllConnections(); page.close(); });
  const port = (page.address() as { port: number }).port;

  const testPython = process.platform === 'win32'
    ? (process.env.NED_TEST_CURRENT_PYTHON ? path.resolve(process.env.NED_TEST_CURRENT_PYTHON) : 'python')
    : process.execPath;

  const extensions = new McpExtensions(state, temp, {
    approve: async () => true,
    paths: {
      python: () => testPython,
      site: () => temp,
      git: process.execPath,
      clangd: browserBinary,
      browser: browserBinary,
      node: path.join(mcpBase, 'node'),
      pythonWorker: path.join(mcpBase, 'mcp-node-worker.cjs'),
      nodeWorker: path.join(mcpBase, 'mcp-node-worker.cjs'),
      supervisor: path.resolve('scripts/sidecar-supervisor.py'),
      testNoSandbox: true,
    },
  });
  t.after(() => extensions.close());

  const result = await extensions.call('browser_check', { url: `http://127.0.0.1:${port}/`, backend: 'playwright', screenshot: true }, project);
  assert.equal(result.isError, undefined);
  const combined = result.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
  assert.match(combined, /sibling-resolved/);
  assert.match(combined, /Source: playwright MCP/);
  assert.ok(result.content.some(c => c.type === 'image'));
});

test('browser_check records sanitized diagnostic markers without raw paths or secrets on worker exit', async t => {
  const temp = await mkdtemp(path.join(tmpdir(), 'ned-mcp-diag-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const project = path.join(temp, 'project');
  const state = path.join(temp, 'state');
  const mcpBase = path.join(temp, 'resources/runtime/windows-x64/mcp');
  const browserBinary = path.join(mcpBase, 'browser/chrome-win64/chrome.exe');
  await mkdir(project, { recursive: true });
  await mkdir(path.dirname(browserBinary), { recursive: true });
  await writeFile(browserBinary, 'stub');
  await copyFile(path.resolve('scripts/mcp-node-worker.cjs'), path.join(mcpBase, 'mcp-node-worker.cjs'));
  await mkdir(path.join(mcpBase, 'node/@playwright/mcp'), { recursive: true });
  await writeFile(
    path.join(mcpBase, 'node/@playwright/mcp/cli.js'),
    `console.error("Error: Cannot find module 'missing-pkg' MODULE_NOT_FOUND secret=sk-test-secret-123456"); process.exit(1);\n`,
  );

  const page = createServer((_req, res) => res.end('ok'));
  await new Promise<void>(r => page.listen(0, '127.0.0.1', r));
  t.after(() => { page.closeAllConnections(); page.close(); });
  const port = (page.address() as { port: number }).port;
  const testPython = process.platform === 'win32'
    ? (process.env.NED_TEST_CURRENT_PYTHON ? path.resolve(process.env.NED_TEST_CURRENT_PYTHON) : 'python')
    : process.execPath;

  const extensions = new McpExtensions(state, temp, {
    approve: async () => true,
    paths: {
      python: () => testPython,
      site: () => temp,
      git: process.execPath,
      clangd: browserBinary,
      browser: browserBinary,
      node: path.join(mcpBase, 'node'),
      pythonWorker: path.join(mcpBase, 'mcp-node-worker.cjs'),
      nodeWorker: path.join(mcpBase, 'mcp-node-worker.cjs'),
      supervisor: path.resolve('scripts/sidecar-supervisor.py'),
      testNoSandbox: true,
    },
  });
  t.after(() => extensions.close());

  await assert.rejects(
    () => extensions.call('browser_check', { url: `http://127.0.0.1:${port}/`, backend: 'playwright' }, project),
    /MCP 프로세스가 종료되었습니다\. \[MODULE_NOT_FOUND, Cannot find module\]/,
  );
  const rawDiag = await readFile(path.join(state, 'diagnostics/mcp-extensions-status.json'), 'utf8');
  assert.doesNotMatch(rawDiag, /sk-test-secret/);
  const parsed = JSON.parse(rawDiag);
  assert.equal(parsed.tool, 'browser_check');
  assert.equal(parsed.service, 'playwright');
  assert.equal(parsed.failureCode, 'process-exited');
  assert.deepEqual(parsed.markers, ['MODULE_NOT_FOUND', 'Cannot find module']);
});
