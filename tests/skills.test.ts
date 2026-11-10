import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HostTools } from '../distribution/host-tools';
import { Redactor } from '../src/main/config';

const additions = ['cpp-pro', 'cpp-testing', 'legacy-modernizer', 'codebase-onboarding', 'api-design', 'database-migrations', 'error-handling-patterns', 'architecture-decision-records', 'differential-review', 'session-handoff'];

async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-offline-skills-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, 'project'), resources = path.join(root, 'resources');
  await mkdir(project); await cp('vendor/skills', path.join(resources, 'l-vibe/skills'), { recursive: true });
  const tools = new HostTools(path.join(root, 'data'), resources, {
    project: async () => project,
    approve: async () => { throw new Error('A static skill must not request an execution approval'); },
    knowledge: () => undefined,
    redactor: new Redactor(),
  });
  await tools.skills.load();
  return { tools, resources };
}

test('the native broker reads every new offline skill and reference without invoking an executor', async t => {
  const { tools, resources } = await fixture(t);
  const manifest = JSON.parse(await readFile(path.join(resources, 'l-vibe/skills/manifest.json'), 'utf8'));
  const catalog = JSON.parse(await tools.call('skill_catalog', {}, 'test-session'));
  assert.equal(catalog.length, 28);
  for (const id of additions) {
    assert.ok(catalog.some((skill: { id: string }) => skill.id === id));
    const entry = manifest.skills.find((skill: { id: string }) => skill.id === id);
    assert.ok(entry.files.some((file: { path: string }) => file.path === 'LICENSE'));
    const main = await tools.call('read_skill', { id }, 'test-session');
    assert.ok(main.includes('L-Vibe offline adaptation'));
    assert.ok(main.includes('otherwise report verification as not run'));
    for (const file of entry.files) {
      assert.ok(/\.(md|txt)$|^(LICENSE|COPYING)$/i.test(file.path), file.path);
      if (!/\.md$/i.test(file.path)) continue;
      const content = await tools.call('read_skill', { id, document: file.path }, 'test-session');
      assert.ok(content.includes(`--- ${file.path} ---`));
      // A missing dependency must never cause a first-use online installation.
      assert.doesNotMatch(content, /\b(?:pip|npm|brew) install\b|\bnpx\s|FetchContent_Declare\s*\(|GIT_REPOSITORY\s+https?:/i);
    }
  }
  const cc = await tools.call('read_skill', { id: 'differential-review', document: 'LICENSE' }, 'test-session').catch(error => error.message);
  assert.match(cc, /문서만 읽을 수/); // license is shipped, but the document API exposes only md/txt
});

test('the native skill reader rejects tampered documents, scripts and path escapes', async t => {
  const { tools, resources } = await fixture(t);
  const file = path.join(resources, 'l-vibe/skills/cpp-pro/SKILL.md');
  await writeFile(file, (await readFile(file, 'utf8')) + '\nUnreviewed instruction\n');
  await assert.rejects(tools.call('read_skill', { id: 'cpp-pro' }, 'test-session'), /해시 불일치/);
  await assert.rejects(tools.call('read_skill', { id: 'cpp-pro', document: '../api-design/SKILL.md' }, 'test-session'), /문서만 읽을 수/);
  await assert.rejects(tools.call('read_skill', { id: 'cpp-pro', document: 'scripts/install.py' }, 'test-session'), /문서만 읽을 수/);
});
