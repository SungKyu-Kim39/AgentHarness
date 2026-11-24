import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ExternalRead } from '../distribution/external-read';
import { PermissionPolicy } from '../distribution/ned/permission-policy';
import { HostTools } from '../distribution/host-tools';
import { Redactor } from '../src/main/config';

test('external reads prompt in ask/edits modes, auto-approve in full mode, and always block protected paths and external writes', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-external-')); t.after(() => rm(root, { recursive: true, force: true }));
  const protectedDir = path.join(root, 'private'); await mkdir(protectedDir);
  const skillsDir = path.join(protectedDir, 'skills'); await mkdir(skillsDir);
  await writeFile(path.join(protectedDir, 'credentials'), 'never expose');
  await writeFile(path.join(skillsDir, 'custom.md'), 'global skill');
  const note = path.join(root, 'note.md'); await writeFile(note, '외부 참조 문서\n');
  const policy = new PermissionPolicy(path.join(root, 'policy'));
  let prompts = 0, allowPrompt = false;
  const approve = (_m: string, _d: string, s?: AbortSignal) => policy.decide('effect', s, true, async () => { prompts++; return allowPrompt; });
  const reader = new ExternalRead(approve, [protectedDir]);

  // ask mode: denied -> rejected, approved -> allowed
  await assert.rejects(reader.read(note), /승인되지 않았습니다/);
  assert.equal(prompts, 1);
  allowPrompt = true;
  assert.equal(JSON.parse(await reader.read(note)).text, '외부 참조 문서\n');
  assert.equal(prompts, 2);

  // edits mode: still prompts for external reads
  await policy.set('edits');
  allowPrompt = false;
  await assert.rejects(reader.list(root), /승인되지 않았습니다/);
  assert.equal(prompts, 3);
  allowPrompt = true;
  assert.ok(JSON.parse(await reader.list(root)).entries.some((e: { name: string }) => e.name === 'note.md'));
  assert.equal(prompts, 4);

  // full mode: auto-approves with no prompt
  await policy.set('full');
  allowPrompt = false;
  assert.equal(JSON.parse(await reader.read(note)).text, '외부 참조 문서\n');
  assert.ok(JSON.parse(await reader.list(root)).entries.some((e: { name: string }) => e.name === 'note.md'));
  assert.equal(prompts, 4);

  // protected paths (including Ned root/skills) rejected before any approval prompt
  await policy.set('ask');
  await assert.rejects(reader.read(path.join(protectedDir, 'credentials')), /앱 관리/);
  await assert.rejects(reader.read(path.join(skillsDir, 'custom.md')), /앱 관리/);
  assert.equal(prompts, 4);

  await policy.set('full');
  await assert.rejects(reader.read('//server/share/note.md'), /로컬/);
  await writeFile(path.join(root, 'binary'), Buffer.from([0, 1, 2])); await assert.rejects(reader.read(path.join(root, 'binary')), /UTF-8/);
  const abort = new AbortController(); abort.abort(); await assert.rejects(reader.read(note, abort.signal));

  // External writes remain unconditionally blocked via HostTools even in full mode
  const project = path.join(root, 'project'); await mkdir(project);
  const host = new HostTools(protectedDir, path.join(root, 'resources'), {
    project: async () => project, permissionSignal: () => policy.signal,
    approve, knowledge: () => undefined, redactor: new Redactor(),
  });
  t.after(() => host.close());
  await assert.rejects(host.call('propose_edit', { path: note, content: 'overwrite' }, 's'), /상대 경로/);
  await assert.rejects(host.call('delete_file', { path: '../note.md' }, 's'), /허용되지 않는 경로/);

  const fakeHome = path.join(root, 'fake-home');
  const fakeLocalAppData = path.join(root, 'fake-localappdata');
  const sshKey = path.join(fakeHome, '.ssh', 'id_ed25519');
  const launcherState = path.join(fakeLocalAppData, 'Ned-Launcher', 'state.json');
  const legacyLvibe = path.join(root, 'L-Vibe', 'settings.enc.json');
  await mkdir(path.dirname(sshKey), { recursive: true }); await writeFile(sshKey, 'private-ssh');
  await mkdir(path.dirname(launcherState), { recursive: true }); await writeFile(launcherState, '{}');
  await mkdir(path.dirname(legacyLvibe), { recursive: true }); await writeFile(legacyLvibe, '{}');

  const prevUserProfile = process.env.USERPROFILE;
  const prevLocalAppData = process.env.LOCALAPPDATA;
  process.env.USERPROFILE = fakeHome;
  process.env.LOCALAPPDATA = fakeLocalAppData;
  try {
    for (const blocked of [sshKey, launcherState, legacyLvibe]) {
      await assert.rejects(host.call('read_external_file', { path: blocked }, 's'), /앱 관리/);
    }
  } finally {
    if (prevUserProfile === undefined) delete process.env.USERPROFILE; else process.env.USERPROFILE = prevUserProfile;
    if (prevLocalAppData === undefined) delete process.env.LOCALAPPDATA; else process.env.LOCALAPPDATA = prevLocalAppData;
  }
});
