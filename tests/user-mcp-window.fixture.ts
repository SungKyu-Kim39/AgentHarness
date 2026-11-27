import assert from 'node:assert/strict';
import { createServer } from 'node:https';
import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { app, BrowserWindow } from 'electron';
import { UserMcp } from '../distribution/user-mcp';
import { UserMcpWindow } from '../distribution/ned/user-mcp-window';
const fixture = process.env.NED_MCP_UI_FIXTURE_ROOT;
if (!fixture) throw Error('MCP GUI fixture directory is required');
for (const flag of ['disable-background-networking', 'disable-component-update', 'disable-sync', 'disable-domain-reliability']) app.commandLine.appendSwitch(flag);
app.setPath('userData', path.join(fixture, 'gui-data'));
const model = createServer({
  key: readFileSync(path.join(fixture, 'test-key.pem')),
  cert: readFileSync(path.join(fixture, 'test-cert.pem')),
}, async (req, res) => {
  let text = '';
  for await (const chunk of req) text += chunk;
  const call = JSON.parse(text);
  if (call.method === 'notifications/initialized') { res.writeHead(202).end(); return; }
  const result = call.method === 'initialize'
    ? { protocolVersion: '2025-11-25', capabilities: { tools: {} } }
    : call.method === 'tools/list'
    ? { tools: [{ name: 'fixture_search', inputSchema: { type: 'object' } }] }
    : undefined;
  assert.ok(result, 'registration must only initialize and discover');
  res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ jsonrpc: '2.0', id: call.id, result }));
});
const cipher = { isEncryptionAvailable: () => true, encryptString: (value: string) => Buffer.from(value).reverse(), decryptString: (value: Buffer) => Buffer.from(value).reverse().toString() };
app.whenReady().then(async () => {
  await new Promise<void>(resolve => model.listen(0, '127.0.0.1', resolve));
  const { port } = model.address() as { port: number };
  const registry = new UserMcp(fixture, cipher);
  const manager = new UserMcpWindow();
  await registry.load();
  manager.open(registry, '');
  const [window] = BrowserWindow.getAllWindows();
  await new Promise<void>((resolve, reject) => {
    window.webContents.once('preload-error', (_event, _path, error) => reject(error));
    window.webContents.once('did-finish-load', resolve);
    window.once('closed', () => reject(Error('Management window closed before loading')));
  });
  const result = await window.webContents.executeJavaScript(`(async () => {
    const get = id => document.getElementById(id);
    const until = async match => {
      for (let tries=0; tries<100; tries++) {
        if (match()) return;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      throw Error(get('message').textContent);
    };
    await until(() => get('entries').textContent.includes('등록된 MCP가 없습니다'));
    get('add').click();
    get('name').value = '사내 검색'; get('id').value = 'team-search';
    get('url').value = 'https://192.0.2.42/mcp';
    get('check').click();
    await until(() => get('message').textContent.includes('사내 사설 IP 또는 이 PC'));
    get('url').value = 'https://127.0.0.1:${port}/mcp';
    get('check').click();
    await until(() => get('toolChoices').textContent.includes('fixture_search'));
    get('toolChoices').querySelector('input').click();
    get('save').click();
    await until(() => get('entries').textContent.includes('/mcp-team-search'));
    const toggle = get('entries').querySelector('input[type=checkbox]');
    if (toggle.checked) throw Error('expected a manual enable');
    toggle.click();
    await until(() => get('message').textContent.includes('사용을 켰습니다'));
    return { registered: get('entries').textContent.includes('사내 검색'), checked: get('entries').querySelector('input[type=checkbox]').checked };
  })()`);
  assert.deepEqual(result, { registered: true, checked: true });
  assert.equal(registry.commands()[0].name, 'mcp-team-search');
  const encrypted = await readFile(path.join(fixture, 'user-mcp.enc.json'), 'utf8');
  assert.doesNotMatch(encrypted, /team-search/);
  const loaded = new UserMcp(fixture, cipher);
  await loaded.load();
  assert.equal(loaded.commands()[0].name, 'mcp-team-search');
  manager.close(); registry.close(); model.closeAllConnections(); model.close();
  await writeFile(path.join(fixture, 'result.json'), JSON.stringify({ electron: process.versions.electron, loadedFromAsar: app.getAppPath().endsWith('.asar'), ...result, persistence: true, transport: 'https-loopback' }) + '\n');
  app.exit(0);
}).catch(error => { process.stderr.write(error.stack + '\n'); app.exit(1); });
