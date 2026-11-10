import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadBundledSkillPackages, registerBundledSkills, type SkillRegistration, type SkillTransport } from '../src/main/openviking-skills';
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-skill-registration-')); t.after(() => rm(root, { recursive: true, force: true }));
  const bundle = path.join(root, 'skills'); await mkdir(bundle);
  const all = JSON.parse(await readFile('vendor/skills/manifest.json', 'utf8'));
  const manifest = { ...all, skills: all.skills.filter((s: { id: string }) => ['cpp-testing', 'ab-testing'].includes(s.id)) };
  for (const entry of manifest.skills) await cp(path.join('vendor/skills', entry.directory), path.join(bundle, entry.directory), { recursive: true });
  const saveManifest = async () => {
    const bytes = JSON.stringify(manifest); await writeFile(path.join(bundle, 'manifest.json'), bytes);
    await writeFile(path.join(root, 'skills-lock.json'), JSON.stringify({ schemaVersion: 1, count: manifest.skills.length, manifestSha256: sha(bytes) }));
  };
  await saveManifest(); return { root, bundle, manifest, saveManifest, stateFile: path.join(root, 'data/bundled-skills.json') };
}
async function fakeServer(bundle: string) {
  let packages = await loadBundledSkillPackages(bundle), revision = 0;
  const remote = new Map<string, any>(); const writes: string[] = []; let failOnce = '';
  const transport: SkillTransport = async (route, options) => {
    options?.signal?.throwIfAborted();
    if (options?.body instanceof FormData) return { result: { temp_file_id: 'local-upload-only' } };
    if (options?.method === 'POST' || options?.method === 'PUT') {
      const body = options.body as any; const id = body.source_metadata.l_vibe_id;
      if (failOnce === id) { failOnce = ''; throw Object.assign(new Error('temporary model failure'), { status: 503 }); }
      const pkg = packages.find(p => p.id === id)!; writes.push(options.method + ':' + id);
      assert.equal(body.target_uri, 'viking://agent/skills'); assert.equal(body.wait, true); assert.equal(body.data, undefined);
      remote.set(pkg.name, { content: pkg.body, source: body.source_metadata, revision: String(++revision), files: [...pkg.files].map(([path, bytes]) => ({ path, sha256: sha(bytes) })) });
      return { result: { status: 'success' } };
    }
    const name = /^\/api\/v1\/skills\/([^?]+)/.exec(route)?.[1];
    if (!name || !remote.has(name)) throw Object.assign(new Error('not found'), { status: 404 });
    return { result: structuredClone(remote.get(name)) };
  };
  return { transport, remote, writes, refresh: async () => { packages = await loadBundledSkillPackages(bundle); }, failNext: (id: string) => { failOnce = id; } };
}
const options = (f: Awaited<ReturnType<typeof fixture>>, server: Awaited<ReturnType<typeof fakeServer>>) => ({ bundle: f.bundle, stateFile: f.stateFile, transport: server.transport, signal: new AbortController().signal, progress: (_state: SkillRegistration) => {} });

test('default skills register in the real skills namespace and unchanged restarts do not reimport', async t => {
  const f = await fixture(t), server = await fakeServer(f.bundle), o = options(f, server);
  assert.equal((await registerBundledSkills(o)).registered, 2); assert.equal(server.writes.length, 2);
  assert.equal((await registerBundledSkills(o)).status, 'ready'); assert.equal(server.writes.length, 2);
  const pkg = server.remote.get('l-vibe-ab-testing');
  assert.ok(pkg.files.some((f: { path: string }) => f.path === 'references/sample-size-guide.md'));
  assert.ok(pkg.files.some((f: { path: string }) => f.path === 'LICENSE'));
});

test('bundle updates replace pristine app copies and preserve externally edited or unowned skills', async t => {
  const f = await fixture(t), server = await fakeServer(f.bundle), o = options(f, server);
  await registerBundledSkills(o);
  const file = path.join(f.bundle, 'cpp-testing/SKILL.md'); const bytes = (await readFile(file, 'utf8')) + '\nReviewed new bundle.\n';
  await writeFile(file, bytes); f.manifest.skills.find((s: { id: string }) => s.id === 'cpp-testing').files.find((f: { path: string }) => f.path === 'SKILL.md').sha256 = sha(bytes);
  await f.saveManifest(); await server.refresh();
  assert.equal((await registerBundledSkills(o)).status, 'ready'); assert.ok(server.writes.includes('PUT:cpp-testing'));
  server.remote.get('l-vibe-cpp-testing').revision = 'external-edit';
  server.remote.get('l-vibe-ab-testing').source.l_vibe_owner = 'user';
  const before = server.writes.length, result = await registerBundledSkills(o);
  assert.deepEqual(result.conflicts.sort(), ['ab-testing', 'cpp-testing']); assert.equal(server.writes.length, before);
});

test('partial failures retry only unfinished imports and damaged records are never overwritten', async t => {
  const f = await fixture(t), server = await fakeServer(f.bundle), o = options(f, server); server.failNext('cpp-testing');
  assert.deepEqual((await registerBundledSkills(o)).failed, ['cpp-testing']);
  assert.equal((await registerBundledSkills(o)).status, 'ready'); assert.equal(server.writes.length, 2);
  await writeFile(f.stateFile, '{broken');
  await assert.rejects(registerBundledSkills(o)); assert.equal(await readFile(f.stateFile, 'utf8'), '{broken');
});

test('tampered bundles and cancellation cannot be marked as registered', async t => {
  const f = await fixture(t), server = await fakeServer(f.bundle), o = options(f, server);
  const abort = new AbortController(); abort.abort(); await assert.rejects(registerBundledSkills({ ...o, signal: abort.signal })); assert.equal(server.writes.length, 0);
  await writeFile(path.join(f.bundle, 'cpp-testing/SKILL.md'), 'tampered'); await assert.rejects(registerBundledSkills(o), /무결성/); assert.equal(server.writes.length, 0);
});
