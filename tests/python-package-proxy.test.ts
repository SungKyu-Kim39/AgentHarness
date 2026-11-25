import assert from 'node:assert/strict';
import { once } from 'node:events';
import { connect, createServer } from 'node:net';
import { test } from 'node:test';
import { openPythonPackageProxy } from '../distribution/python-package-proxy';
import { pythonConfigSchema } from '../src/shared/contracts';

test('Python download proxy only connects to configured HTTPS origins with a current install credential', async t => {
  let accepted = 0;
  const upstream = createServer(socket => {
    accepted++;
    socket.end();
  });
  upstream.listen(0, '127.0.0.1');
  await once(upstream, 'listening');
  t.after(() => new Promise<void>(resolve => upstream.close(() => resolve())));
  const port = (upstream.address() as { port: number }).port;

  const abort = new AbortController();
  const proxy = await openPythonPackageProxy([new URL('https://127.0.0.1:' + port)], abort.signal);
  t.after(() => proxy.close());
  const local = new URL(proxy.url);
  const auth = 'Proxy-Authorization: Basic ' + Buffer.from(local.username + ':' + local.password).toString('base64') + '\r\n';
  async function probe(method: string, target: string, credentials: string) {
    const client = connect({ host: '127.0.0.1', port: Number(local.port) });
    await once(client, 'connect');
    const status = once(client, 'data');
    client.write(`${method} ${target} HTTP/1.1\r\nHost: ${target}\r\n${credentials}\r\n`);
    try { return String((await status)[0]).split('\r\n')[0]; }
    finally { client.destroy(); }
  }
  assert.match(await probe('CONNECT', `127.0.0.1:${port}`, ''), /407/);
  assert.match(await probe('CONNECT', 'unapproved.invalid:443', auth), /403/);
  assert.match(await probe('CONNECT', `127.0.0.1:${port === 443 ? 444 : 443}`, auth), /403/);
  assert.match(await probe('GET', `http://127.0.0.1:${port}/`, auth), /403/);
  assert.equal(accepted, 0);
  assert.match(await probe('CONNECT', `127.0.0.1:${port}`, auth), /200/);
  assert.equal(accepted, 1);
  abort.abort();
  await proxy.close();

  for (const url of ['http://mirror.example', 'https://mirror.example/subpath', 'https://mirror.example/?private', 'not a URL']) {
    assert.equal(pythonConfigSchema.safeParse({ wheelDownloadOrigins: [url] }).success, false);
  }
  assert.equal(pythonConfigSchema.safeParse({ wheelDownloadOrigins: ['https://mirror.example:8443'] }).success, true);
});
