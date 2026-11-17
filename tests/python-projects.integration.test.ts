import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PythonProjects } from '../distribution/python-projects';
import { OpenVikingService } from '../src/main/openviking';
import { configSchema } from '../src/shared/contracts';
const python = path.resolve('.cache/openviking/env-linux/bin/python3');
test('the selected project interpreter is actually indexed and recalled by OpenViking; reusing it does not reindex', { skip: process.platform === 'win32' || !existsSync(python), timeout: 120000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-conda-viking-')), project = path.join(root, 'project'), installation = path.join(root, 'conda');
  const calls: string[] = [];
  const endpoint = createServer(async (req, res) => {
    let raw = ''; for await (const bytes of req) raw += bytes; const body = JSON.parse(raw); calls.push(req.url!);
    const inputs = Array.isArray(body.input) ? body.input : [body.input];
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(req.url === '/v1/embeddings'
      ? { data: inputs.map((_: unknown, index: number) => ({ index, embedding: [0.1, 0.2, 0.3, 0.4] })), model: body.model, usage: { prompt_tokens: 4, total_tokens: 4 } }
      : { choices: [{ message: { content: 'Synthetic note.' }, finish_reason: 'stop' }], usage: { prompt_tokens: 4, completion_tokens: 4, total_tokens: 8 } }));
  });
  await new Promise<void>(r => endpoint.listen(0, '127.0.0.1', r));
  const data = path.join(root, 'data'); await mkdir(data); await mkdir(project);
  await cp('vendor/runtime/windows-x64/openviking/tokenizers', path.join(data, 'tokenizers'), { recursive: true });
  const service = new OpenVikingService(data, data, () => {}, { executable: python, launcher: path.resolve('scripts/openviking-launch.py'), cwd: data });
  let projects: PythonProjects | undefined;
  t.after(async () => { await projects?.close(); await service.close(); endpoint.closeAllConnections(); await new Promise<void>(r => endpoint.close(() => r())); await rm(root, { recursive: true, force: true }); });
  const baseUrl = 'http://127.0.0.1:' + (endpoint.address() as { port: number }).port + '/v1';
  await service.configure(configSchema.parse({ schemaVersion: 2, model: { id: 'test-chat', apiKey: 'test-only', baseUrl }, openViking: { enabled: true, embedding: { id: 'test-embedding', apiKey: 'test-only', baseUrl, dimension: 4 } } }));
  assert.equal(service.state().status, 'ready');
  await mkdir(path.join(installation, 'bin'), { recursive: true }); await mkdir(path.join(installation, 'etc/profile.d'), { recursive: true }); await mkdir(path.join(installation, 'conda-meta'));
  await writeFile(path.join(installation, 'bin/python'), '# fixture'); await writeFile(path.join(installation, 'conda-meta/history'), 'fixture'); await writeFile(path.join(installation, 'etc/profile.d/conda.sh'), '# fixture');
  await writeFile(path.join(installation, 'bin/conda'), '#!/bin/sh\nprintf \'%s\\n\' \'{"envs":[]}\'\n', { mode: 0o755 });
  projects = new PythonProjects(root, '', { approve: async () => true, roots: async () => [installation], choose: async (_p, envs) => envs[0].id, knowledge: () => service });
  const before = calls.length; await projects.choose(project); await projects.close(); projects = undefined;
  const projectID = createHash('sha256').update(project).digest('hex').slice(0, 32);
  const record = JSON.parse(await readFile(path.join(root, 'python-projects', projectID + '.json'), 'utf8')); assert.equal(record.memory, 'ready');
  const result = JSON.parse(await service.search(projectID, 'Project Python environment', 10));
  let found = false;
  for (const item of result.results?.resources ?? []) {
    const content = await service.read(projectID, item.uri);
    if (content.includes(installation) && content.includes(record.revision)) found = true;
  }
  assert.equal(found, true, JSON.stringify(result));
  assert.ok(calls.slice(before).length > 0); assert.ok(calls.slice(before).every(route => ['/v1/embeddings', '/v1/chat/completions'].includes(route)));
  const connection=await service.studioConnection();
  const settled=await fetch(connection.baseUrl+'/api/v1/system/wait',{method:'POST',headers:{...connection.headers,'Content-Type':'application/json'},body:'{}'});
  assert.equal(settled.status,200);
  const completed = calls.length;
  projects = new PythonProjects(root, '', { approve: async () => true, roots: async () => [installation], choose: async () => { throw new Error('Saved choice must be reused'); }, knowledge: () => service });
  assert.equal((await projects.choose(project)).remembered, true); await projects.close(); projects = undefined; assert.equal(calls.length, completed);
  t.diagnostic('Actual OpenViking 0.5.5 persisted/retrieved the user-selected project environment. Its normal SDK indexing made embedding/completion requests; reusing the verified choice made no further model requests.');
});
