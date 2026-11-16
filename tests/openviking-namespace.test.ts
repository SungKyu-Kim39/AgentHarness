import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, rename, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { migrateVikingNamespace, previousVikingAccount, previousSkillOwner, previousSkillHash } from '../src/main/openviking-namespace';

async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const folder = await mkdtemp(path.join(tmpdir(), 'ned-namespace-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const active = path.join(folder, 'data');
  await mkdir(path.join(active, 'viking', previousVikingAccount), { recursive: true });
  await mkdir(path.join(active, 'viking', previousVikingAccount, 'agent'), { recursive: true });
  await writeFile(path.join(active, 'viking', previousVikingAccount, 'agent', 'custom-user-note.md'), 'private agent data outside OVPack backup');
  await writeFile(path.join(active, 'original-index.bin'), Buffer.from([0, 255, 17, 31]));
  let workspace = '', account = '', stopped = true; const calls: string[] = [];
  const uris = new Set<string>();
  const runtime = {
    async start(work: string, owner: string) {
      assert.equal(stopped, true); workspace = work; account = owner; stopped = false;
      await mkdir(path.join(work, 'viking', owner), { recursive: true }); calls.push('start:' + owner);
    },
    async stop() { stopped = true; },
    async backup(file: string) {
      assert.equal(account, previousVikingAccount);
      await writeFile(file, 'private SDK backup'); calls.push('backup');
    },
    async request(route: string, options?: { body?: unknown; method?: string }) {
      calls.push(route); const body = options?.body as any;
      if (route.endsWith('/temp_upload')) {
        assert.ok(body instanceof FormData); return { result: { temp_file_id: 'owned-staged-upload' } };
      }
      if (route.endsWith('/restore')) {
        assert.notEqual(workspace, active); assert.equal(account, 'ned');
        assert.deepEqual(body, { temp_file_id: 'owned-staged-upload', on_conflict: 'overwrite', vector_mode: 'auto' });
        uris.add('viking://resources/' + previousVikingAccount);
        await writeFile(path.join(workspace, 'restored-note.md'), 'project and personal data preserved'); return {};
      }
      if (route.startsWith('/api/v1/fs/stat?')) {
        const uri = new URLSearchParams(route.split('?')[1]).get('uri')!;
        if (!uris.has(uri)) throw Object.assign(new Error('missing'), { status: 404 }); return {};
      }
      if (route.endsWith('/mv')) { assert.ok(uris.has(body.from_uri)); uris.delete(body.from_uri); uris.add(body.to_uri); return {}; }
      if (route.startsWith('/api/v1/skills?')) return { result: { skills: [{ name: previousVikingAccount + '-cpp-pro' }, { name: 'personal-custom' }] } };
      if (route.startsWith('/api/v1/skills/')) {
        uris.add('viking://agent/skills/' + previousVikingAccount + '-cpp-pro');
        return { result: { source: { [previousSkillOwner]: 'bundled-skills' } } };
      }
      if (route.endsWith('/consistency')) return { result: { ok: true } };
      return {};
    },
  };
  return { folder, active, runtime, calls, uris };
}

test('account migration commits verified SDK restore, moves URIs and preserves original index bytes', async t => {
  const f = await fixture(t);
  await migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal);
  const journal = JSON.parse(await readFile(path.join(f.folder, 'namespace-migration.json'), 'utf8'));
  assert.equal(journal.phase, 'ready');
  assert.equal(await readFile(path.join(f.active, 'restored-note.md'), 'utf8'), 'project and personal data preserved');
  assert.deepEqual(await readFile(path.join(f.folder, 'namespace-backups', journal.id, 'original', 'original-index.bin')), Buffer.from([0, 255, 17, 31]));
  assert.deepEqual(await readdir(path.join(f.active, 'viking')), ['ned']);
  assert.equal(await readFile(path.join(f.active, 'viking/ned/agent/custom-user-note.md'), 'utf8'), 'private agent data outside OVPack backup');
  assert.ok(f.calls.includes('/api/v1/content/reindex'));
  assert.ok(f.uris.has('viking://resources/ned')); assert.ok(f.uris.has('viking://agent/skills/ned-cpp-pro'));
  const before = f.calls.length;
  await migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal);
  assert.equal(f.calls.length, before, 'completed migrations must not re-export or re-index');
});

test('SDK-generated summaries can refresh an owned revision but changed source files cannot', async t => {
  for (const changedSource of [false, true]) {
    const f = await fixture(t); let reindexed = false; const request = f.runtime.request;
    const original = { schemaVersion: 1, entries: { 'cpp-pro': { revision: 'before', bundleHash: 'a'.repeat(64) } } };
    await writeFile(path.join(f.folder, 'bundled-skills.json'), JSON.stringify(original));
    f.runtime.request = async (route, options) => {
      if (route.includes('/skills/')) {
        await request(route, options);
        return { result: { revision: reindexed ? 'after' : 'before', source: { [previousSkillOwner]: 'bundled-skills', [previousSkillHash]: 'a'.repeat(64) },
          files: [{ path: 'SKILL.md', sha256: changedSource && reindexed ? 'edited' : 'unchanged' }, { path: '.abstract.md', sha256: reindexed ? 'new summary' : 'old summary' }] } };
      }
      if (route.endsWith('/reindex')) reindexed = true;
      return request(route, options);
    };
    if (changedSource) {
      await assert.rejects(migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal), /SKILL_CHANGED/);
      assert.deepEqual(JSON.parse(await readFile(path.join(f.folder, 'bundled-skills.json'), 'utf8')), original);
      assert.ok((await readdir(path.join(f.active, 'viking'))).includes(previousVikingAccount));
    } else {
      await migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal);
      assert.equal(JSON.parse(await readFile(path.join(f.folder, 'bundled-skills.json'), 'utf8')).entries['cpp-pro'].revision, 'after');
    }
  }
});

test('restore/index failure and cancellation leave the active original and retain private staging', async t => {
  for (const cancel of [false, true]) {
    const f = await fixture(t), abort = new AbortController(), request = f.runtime.request;
    f.runtime.request = async (route, options) => {
      if (route.endsWith('/consistency')) {
        if (cancel) abort.abort();
        return { result: { ok: false } };
      }
      return request(route, options);
    };
    await assert.rejects(migrateVikingNamespace(f.folder, f.runtime, abort.signal));
    assert.deepEqual(await readFile(path.join(f.active, 'original-index.bin')), Buffer.from([0, 255, 17, 31]));
    assert.deepEqual(await readdir(path.join(f.active, 'viking')), [previousVikingAccount]);
    const journal = JSON.parse(await readFile(path.join(f.folder, 'namespace-migration.json'), 'utf8'));
    assert.equal(journal.phase, 'failed');
    assert.equal(await readFile(path.join(f.folder, 'namespace-backups', journal.id, 'snapshot.ovpack'), 'utf8'), 'private SDK backup');
  }
});

test('unknown target accounts, symlinks and malformed journals cannot trigger overwrite', async t => {
  const f = await fixture(t);
  await mkdir(path.join(f.active, 'viking/ned'));
  await assert.rejects(migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal), /CONFLICT/);
  assert.equal(f.calls.length, 0);
  await rm(path.join(f.active, 'viking/ned'), { recursive: true });
  await symlink(f.folder, path.join(f.active, 'link'), 'dir');
  await assert.rejects(migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal), /PATH/);
  await rm(path.join(f.active, 'link'));
  await writeFile(path.join(f.folder, 'namespace-migration.json'), '{bad');
  await assert.rejects(migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal));
  assert.equal(f.calls.length, 0);
});

test('interruption between workspace renames resumes only the recorded verified staging', async t => {
  const f = await fixture(t), id = 'a'.repeat(32), backup = path.join(f.folder, 'namespace-backups', id);
  await mkdir(path.join(backup, 'staged/viking/ned'), { recursive: true });
  await writeFile(path.join(backup, 'staged/restored-note.md'), 'checked');
  await rename(f.active, path.join(backup, 'original'));
  await writeFile(path.join(f.folder, 'namespace-migration.json'), JSON.stringify({ schemaVersion: 1, id, phase: 'committing' }));
  await migrateVikingNamespace(f.folder, f.runtime, new AbortController().signal);
  assert.equal(await readFile(path.join(f.active, 'restored-note.md'), 'utf8'), 'checked'); assert.equal(f.calls.length, 0);
  assert.equal(JSON.parse(await readFile(path.join(f.folder, 'namespace-migration.json'), 'utf8')).phase, 'ready');
});
