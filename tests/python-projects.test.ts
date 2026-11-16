import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PythonProjects } from '../distribution/python-projects';
const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);
async function fixture(t: { after(fn: () => Promise<void>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-conda-choice-')), manager = path.join(root, 'Conda installation'), project = path.join(root, 'project');
  t.after(() => rm(root, { recursive: true, force: true })); await mkdir(project);
  const prefixes = [manager, path.join(manager, 'envs/analysis')];
  for (const prefix of prefixes) { await mkdir(path.join(prefix, 'bin'), { recursive: true }); await mkdir(path.join(prefix, 'conda-meta')); await writeFile(path.join(prefix, 'conda-meta/history'), 'fixture'); await writeFile(path.join(prefix, 'bin/python'), '# fixture interpreter\n'); }
  await mkdir(path.join(manager, 'etc/profile.d'), { recursive: true }); await writeFile(path.join(manager, 'etc/profile.d/conda.sh'), '# fixture activation\n');
  const payload = JSON.stringify({ envs: prefixes });
  await writeFile(path.join(manager, 'bin/conda'), '#!/bin/sh\nprintf \'%s\\n\' \'' + payload.replaceAll("'", "'\\''") + '\'\n', { mode: 0o755 });
  return { root, manager, project, prefixes };
}
test('user choice is remembered per project and mirrored as versioned OpenViking data; restart does not ask again', { skip: process.platform === 'win32' }, async t => {
  const { root, manager, project, prefixes } = await fixture(t); let selections = 0; const notes: Array<{ project: string; name: string; content: string }> = [];
  const options = { approve: async () => true, roots: async () => [manager], choose: async (_p: string, environments: any[]) => { selections++; return environments.find(e => e.prefix === prefixes[1]).id; }, knowledge: () => ({ index: async (project: string, name: string, content: string) => { notes.push({ project, name, content }); return 'indexed'; } }) as any };
  const first = new PythonProjects(root, '', options); const selected = await first.choose(project); assert.equal(selected.environment.prefix, prefixes[1]); await first.close();
  assert.equal(notes.length, 1); assert.equal(notes[0].project, hash(project)); assert.match(notes[0].name, /^ned-python-environment-[a-f0-9-]+\.md$/); assert.ok(notes[0].content.includes(prefixes[1]));
  const second = new PythonProjects(root, '', { ...options, choose: async () => { throw new Error('must reuse the saved user decision'); } });
  assert.equal((await second.choose(project)).environment.prefix, prefixes[1]); assert.equal(selections, 1);
  await rm(path.join(prefixes[1], 'bin/python')); await assert.rejects(second.choose(project), /자동 전환하지/); await second.close();
  const other = path.join(root, 'other'); await mkdir(other); const third = new PythonProjects(root, '', { ...options, choose: async (_p, envs) => { selections++; return envs[0].id; } });
  await third.choose(other); await third.close(); assert.equal(selections, 2); assert.equal(notes[1].project, hash(other));
});
test('late environment selection cannot persist after shutdown; malformed choices remain untouched', { skip: process.platform === 'win32' }, async t => {
  const { root, manager, project } = await fixture(t); let enter!: () => void, release!: (id: string) => void, id = '';
  const entered = new Promise<void>(r => { enter = r; }), decision = new Promise<string>(r => { release = r; });
  const picker = new PythonProjects(root, '', { approve: async () => true, roots: async () => [manager], choose: async (_p, envs) => { id = envs[0].id; enter(); return decision; }, knowledge: () => undefined });
  const request = picker.choose(project); const rejected = assert.rejects(request, /abort/i); await entered; await picker.close(); release(id); await rejected;
  const file = path.join(root, 'python-projects', hash(project) + '.json'); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, '{invalid');
  const next = new PythonProjects(root, '', { approve: async () => true, roots: async () => [manager], choose: async () => undefined, knowledge: () => undefined });
  await assert.rejects(next.choose(project)); assert.equal(await readFile(file, 'utf8'), '{invalid'); await next.close();
});
