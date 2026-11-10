import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { BrowserProxy } from '../src/main/browser-proxy';
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
  for (const url of ['file:///etc/passwd', 'http://127.0.0.2:1234/', 'http://user:pass@localhost:1234/', `http://localhost:${port}/`])
    assert.throws(() => BrowserProxy.target(url, [port]));
});

test('project snapshots exclude executable configuration directories regardless of Windows casing', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-case-')); t.after(() => rm(root, { recursive: true, force: true }));
  for (const name of ['.GIT', '.OpenCode', 'Node_Modules', 'BUILD', '.VENV']) { await mkdir(path.join(root, name)); await writeFile(path.join(root, name, 'injected.txt'), 'untrusted'); }
  await writeFile(path.join(root, 'main.cpp'), 'int main() {}');
  assert.deepEqual(await new ProjectFiles(root).list(), ['main.cpp']);
});
