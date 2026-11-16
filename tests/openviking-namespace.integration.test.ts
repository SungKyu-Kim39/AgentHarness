import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mkdtemp, cp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { OpenVikingService } from '../src/main/openviking';
import { loadBundledSkillPackages } from '../src/main/openviking-skills';
import { previousVikingAccount, previousSkillOwner, previousSkillHash } from '../src/main/openviking-namespace';
import { configSchema } from '../src/shared/contracts';

const currentPython = path.resolve('.cache/openviking/env-linux/bin/python3');
const previousPython = path.resolve('.cache/openviking/env-0.5.4/bin/python3');
const sha = (v: string | Buffer) => createHash('sha256').update(v).digest('hex');
test('real 0.5.4 account migrates through 0.5.5 with project/personal search, renamed packages and intact raw backup',
  { skip: !existsSync(currentPython) || !existsSync(previousPython), timeout: 300000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-viking-upgrade-'));
  const services: OpenVikingService[] = []; let diagnostics = '';
  t.after(async () => { for (const service of services) await service.close(); await rm(root, { recursive: true, force: true }); });
  const modelRequests: string[] = [];
  const endpoint = createServer(async (req, res) => {
    let raw = ''; for await (const bytes of req) raw += bytes;
    modelRequests.push(req.url!); const body = JSON.parse(raw);
    const payload = req.url === '/v1/embeddings'
      ? { object: 'list', model: 'embed-test', data: (Array.isArray(body.input) ? body.input : [body.input]).map((_: unknown, index: number) => ({ object: 'embedding', index, embedding: [0.5, 0.25, 0.125, 0.75] })), usage: { prompt_tokens: 1, total_tokens: 1 } }
      : { id: 'test', object: 'chat.completion', model: 'llm-test', choices: [{ index: 0, message: { role: 'assistant', content: 'Local test document.' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } };
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(payload));
  });
  await new Promise<void>(resolve => endpoint.listen(0, '127.0.0.1', resolve));
  t.after(() => { endpoint.closeAllConnections(); endpoint.close(); });
  const baseUrl = `http://127.0.0.1:${(endpoint.address() as { port: number }).port}/v1`;
  const config = configSchema.parse({ schemaVersion: 2, model: { baseUrl, apiKey: 'synthetic-llm', id: 'llm-test' }, openViking: { enabled: true, embedding: { baseUrl, apiKey: 'synthetic-embedding', id: 'embed-test', dimension: 4 } } });
  const bundle = path.join(root, 'resources/ned/skills'); await mkdir(bundle, { recursive: true });
  const manifest = JSON.parse(await readFile('vendor/skills/manifest.json', 'utf8'));
  manifest.skills = manifest.skills.filter((s: { id: string }) => ['cpp-testing', 'ab-testing'].includes(s.id));
  for (const entry of manifest.skills) await cp(path.join('vendor/skills', entry.directory), path.join(bundle, entry.directory), { recursive: true });
  const bytes = JSON.stringify(manifest); await writeFile(path.join(bundle, 'manifest.json'), bytes);
  await writeFile(path.join(bundle, '../skills-lock.json'), JSON.stringify({ schemaVersion: 1, count: 2, manifestSha256: sha(bytes) }));
  await cp('vendor/runtime/windows-x64/openviking/tokenizers', path.join(root, 'tokenizers'), { recursive: true });
  const make = (executable: string, skills?: string) => {
    const service = new OpenVikingService(root, root, () => {}, { executable, launcher: path.resolve('scripts/openviking-launch.py'), cwd: root, diagnostic: text => { diagnostics += text; } }, skills);
    services.push(service); return service;
  };
  const old = make(previousPython), internal = old as any;
  await internal.start(config, path.join(root, 'openviking/data'), previousVikingAccount, true); internal.update('ready');
  await old.index('p1', 'protocol.md', 'Legacy project reconnect interval is seven seconds.').catch(error => assert.fail(String(error) + '\n' + diagnostics.slice(-10000)));
  const request = (route: string, body?: unknown) => internal.request(route, body, false);
  await request('/api/v1/fs/mv', { from_uri: 'viking://resources/ned', to_uri: 'viking://resources/' + previousVikingAccount });
  const personalRequest = (route: string, body?: unknown) => internal.request(route, body, false, undefined, undefined, 'default');
  await personalRequest('/api/v1/fs/mkdir', { uri: 'viking://user/default/resources' });
  await personalRequest('/api/v1/content/write', { uri: 'viking://user/default/resources/rules.md', content: 'Personal rule: preserve the existing compiler version.', mode: 'create', wait: true, processing_mode: 'vectors_only' });
  await writeFile(path.join(root, 'openviking/personal-imports.json'), JSON.stringify({ schemaVersion: 1, entries: [{ sha256: 'a'.repeat(64), root: 'viking://user/default', roots: ['viking://user/default/resources'], status: 'ready', files: 1, importedAt: new Date().toISOString() }] }));
  const registry = { schemaVersion: 1, entries: {} as Record<string, { revision: string; bundleHash: string }> };
  for (const pkg of await loadBundledSkillPackages(bundle)) {
    const form = new FormData(); form.append('file', new Blob([new Uint8Array(pkg.archive)]), pkg.name + '.zip');
    const upload = await request('/api/v1/resources/temp_upload', form);
    await request('/api/v1/skills', { temp_file_id: upload.result.temp_file_id, target_uri: 'viking://agent/skills', wait: true,
      source_metadata: { [previousSkillOwner]: 'bundled-skills', [previousSkillHash]: pkg.hash } });
    const name = previousVikingAccount + '-' + pkg.id;
    await request('/api/v1/fs/mv', { from_uri: 'viking://agent/skills/' + pkg.name, to_uri: 'viking://agent/skills/' + name });
    const remote = await request('/api/v1/skills/' + name + '?target_uri=viking%3A%2F%2Fagent%2Fskills&include_integrity=true&include_files=true&include_source=true');
    registry.entries[pkg.id] = { revision: remote.result.revision, bundleHash: pkg.hash };
  }
  await writeFile(path.join(root, 'openviking/bundled-skills.json'), JSON.stringify(registry));
  await request('/api/v1/system/wait', {}); await old.close();
  const originalFile = path.join(root, 'openviking/data/viking', previousVikingAccount, 'user/default/resources/rules.md');
  const originalBytes = await readFile(originalFile);
  const current = make(currentPython, bundle); await current.configure(config);
  assert.equal(current.state().status, 'ready', JSON.stringify(current.state()) + diagnostics.slice(-10000));
  const deadline = Date.now() + 180000;
  while (['pending', 'registering'].includes(current.state().skills?.status ?? '') && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 100));
  if (current.state().skills?.status !== 'ready') {
    const debug = [];
    for (const pkg of await loadBundledSkillPackages(bundle)) {
      const remote = await (current as any).request('/api/v1/skills/' + pkg.name + '?target_uri=viking%3A%2F%2Fagent%2Fskills&include_integrity=true&include_files=true&include_source=true');
      debug.push({ id: pkg.id, before: registry.entries[pkg.id], after: { revision: remote.result.revision, source: remote.result.source,
        files: remote.result.files.map((f: any) => ({ path: f.path, sha256: f.sha256 })) } });
    }
    assert.fail(JSON.stringify({ state: current.state().skills, debug }));
  }
  assert.equal(current.state().skills?.status, 'ready', JSON.stringify(current.state().skills) + diagnostics.slice(-10000));
  const found = JSON.parse(await current.search('p1', 'reconnect', 3));
  assert.match(JSON.stringify(found), /viking:\/\/resources\/ned\/p1/);
  await assert.rejects(current.read('p2', 'viking://resources/ned/p1/file'));
  assert.match(await current.personalSearch('compiler', 3), /rules\.md/);
  assert.match(await current.personalRead('viking://user/default/resources/rules.md'), /preserve/);
  const journal = JSON.parse(await readFile(path.join(root, 'openviking/namespace-migration.json'), 'utf8'));
  assert.equal(journal.phase, 'ready');
  assert.deepEqual(await readFile(path.join(root, 'openviking/namespace-backups', journal.id, 'original/viking', previousVikingAccount, 'user/default/resources/rules.md')), originalBytes);
  const accounts = await readdir(path.join(root, 'openviking/data/viking')); assert.ok(accounts.includes('ned')); assert.ok(!accounts.includes(previousVikingAccount));
  const names = await readdir(path.join(root, 'openviking/data/viking/ned/agent/skills'));
  assert.ok(names.includes('ned-cpp-testing') && names.includes('ned-ab-testing')); assert.ok(names.every(n => !n.startsWith(previousVikingAccount)));
  const before = modelRequests.length; await current.configure(config);
  while (['pending', 'registering'].includes(current.state().skills?.status ?? '') && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(current.state().skills?.status, 'ready', diagnostics.slice(-10000));
  assert.equal(modelRequests.length, before, 'unchanged restart must not re-index migrated skill packages');
});
