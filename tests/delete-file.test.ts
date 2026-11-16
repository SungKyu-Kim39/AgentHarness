import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, lstat, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HostTools } from '../distribution/host-tools';
import { ProjectFiles } from '../src/main/files';
import { Redactor } from '../src/main/config';
import { PermissionPolicy } from '../distribution/ned/permission-policy';

async function fixture(t: { after(fn: () => Promise<unknown>): void }, overrides: Record<string, unknown> = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-delete-'));
  const project = path.join(root, 'project'), data = path.join(root, 'data'); await mkdir(project);
  const host = new HostTools(data, root, { project: async () => project, knowledge: () => undefined,
    redactor: new Redactor(), approve: async () => true, ...overrides });
  t.after(async () => { await host.close(); await rm(root, { recursive: true, force: true }); });
  return { root, project, data, host };
}

test('file deletion waits for approval, checks editor buffers and preserves exact recovery content', async t => {
  let entered!: () => void, approve!: (approved: boolean) => void; const ready = new Promise<void>(resolve => { entered = resolve; });
  let checks = 0;
  const f = await fixture(t, { approve: async (message: string, detail: string) => {
    assert.match(message, /파일 삭제 승인/); assert.match(detail, /파일이 삭제됩니다/);
    entered(); return new Promise<boolean>(resolve => { approve = resolve; });
  }, validateEdit: async (_session: string, _project: string, proposal: any) => { assert.equal(proposal.operation, 'delete'); checks++; } });
  const original = '\uFEFF원래 내용\r\n'; await writeFile(path.join(f.project, 'obsolete.cpp'), original);
  const work = f.host.call('delete_file', { path: 'obsolete.cpp' }, 's'); await ready;
  assert.equal(await readFile(path.join(f.project, 'obsolete.cpp'), 'utf8'), original);
  approve(true); const result = JSON.parse(await work);
  assert.equal(result.status, 'deleted'); assert.equal(result.after, null); assert.equal(checks, 2);
  await assert.rejects(lstat(path.join(f.project, 'obsolete.cpp')), { code: 'ENOENT' });
  const snapshot = JSON.parse(await readFile(path.join(f.data, 'snapshots/s', result.snapshot + '.json'), 'utf8'));
  assert.equal(snapshot.operation, 'delete'); assert.equal(snapshot.before, original);
  // The saved text can reconstruct every original byte, including BOM/CRLF.
  assert.deepEqual(Buffer.from(snapshot.before), Buffer.from(original));
  assert.deepEqual(await readdir(f.project), []);
});

test('empty files are removed; empty propose_edit content still creates an empty file', async t => {
  const f = await fixture(t);
  await f.host.call('propose_edit', { path: 'empty.txt', content: '' }, 's');
  assert.equal((await lstat(path.join(f.project, 'empty.txt'))).size, 0);
  assert.equal(JSON.parse(await f.host.call('delete_file', { path: 'empty.txt' }, 's')).status, 'deleted');
  await assert.rejects(f.host.call('delete_file', { path: 'empty.txt' }, 's'), /없습니다/);
});

test('denial, cancellation and unsaved editor changes never remove the file', async t => {
  const denied = await fixture(t, { approve: async () => false });
  await writeFile(path.join(denied.project, 'keep.txt'), 'keep');
  await assert.rejects(denied.host.call('delete_file', { path: 'keep.txt' }, 's'), /거절/);
  assert.equal(await readFile(path.join(denied.project, 'keep.txt'), 'utf8'), 'keep');
  let entered!: () => void, decide!: (approved: boolean) => void; const ready = new Promise<void>(r => { entered = r; });
  const cancelled = await fixture(t, { approve: async () => { entered(); return new Promise<boolean>(r => { decide = r; }); } });
  await writeFile(path.join(cancelled.project, 'keep.txt'), 'keep');
  const pending = cancelled.host.call('delete_file', { path: 'keep.txt' }, 's'); await ready;
  cancelled.host.cancelSession('s'); decide(true); await assert.rejects(pending, /중지/);
  assert.equal(await readFile(path.join(cancelled.project, 'keep.txt'), 'utf8'), 'keep');
  let checks = 0;
  const dirty = await fixture(t, { validateEdit: async () => { if (++checks === 2) throw new Error('미저장 버퍼'); } });
  await writeFile(path.join(dirty.project, 'keep.txt'), 'keep');
  await assert.rejects(dirty.host.call('delete_file', { path: 'keep.txt' }, 's'), /미저장/);
  assert.equal(await readFile(path.join(dirty.project, 'keep.txt'), 'utf8'), 'keep');
});

test('a file changed during approval survives and requires a fresh proposal', async t => {
  let project = '';
  const f = await fixture(t, { approve: async () => { await writeFile(path.join(project, 'keep.txt'), 'external change'); return true; } }); project = f.project;
  await writeFile(path.join(f.project, 'keep.txt'), 'approved original');
  await assert.rejects(f.host.call('delete_file', { path: 'keep.txt' }, 's'), /외부 변경/);
  assert.equal(await readFile(path.join(f.project, 'keep.txt'), 'utf8'), 'external change');
});

test('protection covers folders, links, settings, invalid UTF-8 and binary/oversized files before approval', async t => {
  let prompts = 0;
  const f = await fixture(t, { approve: async () => { prompts++; return true; } });
  await mkdir(path.join(f.project, 'folder')); await mkdir(path.join(f.project, '.zed'));
  await writeFile(path.join(f.project, '.zed/settings.json'), '{}');
  await writeFile(path.join(f.project, 'bad.bin'), Buffer.from([0, 1, 2]));
  await writeFile(path.join(f.project, 'invalid.txt'), Buffer.from([255, 254, 128]));
  await writeFile(path.join(f.project, 'large.txt'), 'x'.repeat(2 * 1024 * 1024 + 1));
  const outside = path.join(f.root, 'outside.txt'); await writeFile(outside, 'outside'); await symlink(outside, path.join(f.project, 'link.txt'));
  for (const name of ['folder', '.zed/settings.json', 'bad.bin', 'invalid.txt', 'large.txt', 'link.txt', '../outside.txt', 'missing.txt']) {
    await assert.rejects(f.host.call('delete_file', { path: name }, 's'), name);
  }
  assert.equal(prompts, 0); assert.equal(await readFile(outside, 'utf8'), 'outside');
});

test('persistent edits/full permission modes cover deletion without an extra prompt', async t => {
  for (const mode of ['ask', 'edits', 'full'] as const) {
    const policyRoot = await mkdtemp(path.join(tmpdir(), 'ned-delete-policy-')); t.after(() => rm(policyRoot, { recursive: true, force: true }));
    const policy = new PermissionPolicy(policyRoot); await policy.set(mode); let prompts = 0;
    const f = await fixture(t, { permissionSignal: () => policy.signal,
      approveEdit: (_message: string, _detail: string, signal: AbortSignal) => policy.decide('edit', signal, { approved: true, autoApproveRequest: false }, async () => { prompts++; return { approved: false, autoApproveRequest: false }; }) });
    await writeFile(path.join(f.project, 'old.txt'), 'old');
    if (mode === 'ask') {
      await assert.rejects(f.host.call('delete_file', { path: 'old.txt' }, 's'), /거절/); assert.equal(prompts, 1);
    } else {
      assert.equal(JSON.parse(await f.host.call('delete_file', { path: 'old.txt' }, 's')).status, 'deleted'); assert.equal(prompts, 0);
    }
  }
});

test('large deletions show a bounded preview and a full source hash while saving the complete snapshot', async t => {
  const original = '한글'.repeat(40000);
  const f = await fixture(t, { approve: async (_message: string, detail: string) => { assert.ok(detail.length < 60000); assert.match(detail, /원본 SHA-256:/); assert.match(detail, /이하 생략/); return true; } });
  await writeFile(path.join(f.project, 'large-source.txt'), original);
  const result = JSON.parse(await f.host.call('delete_file', { path: 'large-source.txt' }, 's'));
  assert.equal(result.before, original);
});

test('a rejected deletion proposal never behaves as a file rewrite', async t => {
  const f = await fixture(t); const files = new ProjectFiles(f.project);
  await writeFile(path.join(f.project, 'keep.txt'), 'keep');
  const proposal = await files.proposeDelete('call', 'keep.txt'); proposal.status = 'rejected';
  await assert.rejects(files.apply(proposal), /유효한 대기/);
  assert.equal(await readFile(path.join(f.project, 'keep.txt'), 'utf8'), 'keep');
});

test('a failed recovery snapshot prevents deletion', async t => {
  const f = await fixture(t);
  await mkdir(f.data, { recursive: true });
  await writeFile(path.join(f.data, 'snapshots'), 'not a directory');
  await writeFile(path.join(f.project, 'keep.txt'), 'recoverable original');
  await assert.rejects(f.host.call('delete_file', { path: 'keep.txt' }, 's'));
  assert.equal(await readFile(path.join(f.project, 'keep.txt'), 'utf8'), 'recoverable original');
  assert.deepEqual(await readdir(f.project), ['keep.txt']);
});
