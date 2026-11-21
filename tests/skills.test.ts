import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HostTools } from '../distribution/host-tools';
import { Redactor } from '../src/main/config';
import { NativeRuntime } from '../distribution/native-control';
import { configSchema } from '../src/shared/contracts';
import { automaticSkillContext } from '../src/main/skill-routing';

const additions = ['agent-desktop', 'agent-desktop-windows', 'cpp-pro', 'cpp-testing', 'legacy-modernizer', 'codebase-onboarding', 'api-design', 'database-migrations', 'error-handling-patterns', 'architecture-decision-records', 'differential-review', 'session-handoff', 'explore-data', 'validate-data', 'data-visualization', 'statistical-analysis', 'ab-testing', 'web-design-guidelines', 'astryx'];

async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-offline-skills-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, 'project'), resources = path.join(root, 'resources');
  await mkdir(project); await cp('vendor/skills', path.join(resources, 'ned/skills'), { recursive: true });
  const tools = new HostTools(path.join(root, 'data'), resources, {
    project: async () => project,
    approve: async () => { throw new Error('A static skill must not request an execution approval'); },
    knowledge: () => undefined,
    redactor: new Redactor(),
  });
  await tools.skills.load();
  return { tools, resources, root, project };
}

test('the native broker reads every new offline skill and reference without invoking an executor', async t => {
  const { tools, resources } = await fixture(t);
  const manifest = JSON.parse(await readFile(path.join(resources, 'ned/skills/manifest.json'), 'utf8'));
  const catalog = JSON.parse(await tools.call('skill_catalog', {}, 'test-session'));
  const lock = JSON.parse(await readFile('skills-lock.json','utf8'));
  assert.equal(catalog.length, lock.count);
  assert.equal(lock.count,74);
  const reviewed = JSON.parse(await readFile('reviewed-skills-lock.json','utf8')).skills.map((skill: { id: string })=>skill.id);
  for (const id of [...additions,...reviewed]) {
    assert.ok(catalog.some((skill: { id: string }) => skill.id === id));
    const entry = manifest.skills.find((skill: { id: string }) => skill.id === id);
    assert.ok(entry.files.some((file: { path: string }) => file.path === 'LICENSE'));
    const main = await tools.call('read_skill', { id }, 'test-session');
    assert.ok(main.includes('Ned offline adaptation'));
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
  const license = await readFile(path.join(resources, 'ned/skills/differential-review/LICENSE'), 'utf8');
  assert.ok(license.includes('Attribution-ShareAlike 4.0 International'));
});

test('the native skill reader rejects tampered documents, scripts and path escapes', async t => {
  const { tools, resources } = await fixture(t);
  const file = path.join(resources, 'ned/skills/cpp-pro/SKILL.md');
  await writeFile(file, (await readFile(file, 'utf8')) + '\nUnreviewed instruction\n');
  await assert.rejects(tools.call('read_skill', { id: 'cpp-pro' }, 'test-session'), /해시 불일치/);
  await assert.rejects(tools.call('read_skill', { id: 'cpp-pro', document: '../api-design/SKILL.md' }, 'test-session'), /문서만 읽을 수/);
  await assert.rejects(tools.call('read_skill', { id: 'cpp-pro', document: 'scripts/install.py' }, 'test-session'), /문서만 읽을 수/);
});

const cli = path.resolve('.cache/opencode/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode');
test('the real pinned v2 engine discovers the offline skill bundle from the installation resources', { skip: !existsSync(cli), timeout: 60000 }, async t => {
  const { root, resources, project } = await fixture(t);
  const manifest = JSON.parse(await readFile(path.join(resources, 'ned/skills/manifest.json'), 'utf8'));
  const expected = manifest.skills.map((skill: { id: string }) => skill.id).sort();
  const config = configSchema.parse({ model: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'synthetic-offline-only', id: 'test-only' } });
  const runtime = new NativeRuntime(path.join(root, 'native-data'), resources, { isEncryptionAvailable: () => true, encryptString: Buffer.from, decryptString: b => b.toString() });
  t.after(() => runtime.close()); await runtime.initialize(config); await runtime.authorizeProject(project);
  const connection = await runtime.connection([cli]);
  // Catalog endpoints can return before asynchronous plugin activation finishes.
  let catalog: Array<{ id: string; name: string; content: string }> = [];
  const deadline = Date.now() + 20000;
  do {
    const response = await fetch(connection.url + '/api/skill?location[directory]=' + encodeURIComponent(project), { headers: { Authorization: 'Basic ' + Buffer.from('opencode:' + connection.password).toString('base64') } });
    const text = await response.text(); assert.equal(response.status, 200, text);
    catalog = JSON.parse(text).data;
    if (expected.every((id: string) => catalog.some(entry => entry.id === id))) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  assert.deepEqual(catalog.map(entry => entry.id).sort(), expected);
  for (const id of additions) {
    const skill = catalog.find(entry => entry.id === id);
    assert.ok(skill, `${id} is missing from real Desktop engine discovery: ${JSON.stringify(catalog.map(entry => ({ id: entry.id, name: entry.name })))}`);
    assert.ok(skill.content.includes('Ned offline adaptation'));
  }
});

test('a user global skill stays available after the installed resources are replaced', async t => {
  const { tools, resources, root } = await fixture(t);
  const data = path.join(root, 'data');
  const folder = path.join(data, 'skills', 'team-review');
  const entry = path.join(folder, 'SKILL.md');
  const source = '---\nname: team-review\ndescription: 사내 리뷰 기준으로 검토합니다.\n---\nUse the review checklist.';
  await mkdir(path.join(folder, 'references'), { recursive: true });
  await writeFile(entry, source);
  await writeFile(path.join(folder, 'references', 'review.md'), 'review reference');
  await writeFile(path.join(folder, 'run.cmd'), '@echo off');
  for (const id of ['goal-framing', 'invalid-global']) {
    await mkdir(path.join(data, 'skills', id));
    await writeFile(path.join(data, 'skills', id, 'SKILL.md'), source);
  }
  await writeFile(path.join(data, 'skills', 'goal-framing', 'SKILL.md'), source.replace('team-review', 'goal-framing'));

  await tools.skills.load();
  const catalog = JSON.parse(await tools.call('skill_catalog', {}, 'first-session'));
  assert.deepEqual(catalog.filter((skill: { scope?: string }) => skill.scope === 'user'),
    [{ id: 'team-review', name: 'team-review', description: '사내 리뷰 기준으로 검토합니다.', scope: 'user' }]);

  await rm(path.join(resources, 'ned/skills'), { recursive: true });
  await cp('vendor/skills', path.join(resources, 'ned/skills'), { recursive: true });
  const otherProject = path.join(root, 'second-project');
  await mkdir(otherProject);
  const upgraded = new HostTools(data, resources, { project: async () => otherProject, approve: async () => false, knowledge: () => undefined, redactor: new Redactor() });
  await upgraded.skills.load();
  assert.match(await upgraded.call('read_skill', { id: 'team-review' }, 'other-project-session'), /Use the review checklist/);
  assert.match(await upgraded.call('read_skill', { id: 'team-review', document: 'references/review.md' }, 'other-project-session'), /review reference/);
  const guidance = await automaticSkillContext(upgraded.skills, [{ role: 'user', content: 'team-review 스킬을 적용해줘' }]);
  assert.match(guidance ?? '', /Automatically loaded user skill: team-review/);
  for (const document of ['../goal-framing/SKILL.md', 'run.cmd']) {
    await assert.rejects(upgraded.call('read_skill', { id: 'team-review', document }, 'other-project-session'));
  }
  assert.equal(await readFile(entry, 'utf8'), source);
});

test('managed project skills are isolated and take precedence over user globals', async t => {
  const { tools, root } = await fixture(t);
  const first = path.join(root,'first'), second = path.join(root,'second');
  for (const [folder, body] of [
    [path.join(first,'.ned/skills/mine'),'project'],
    [path.join(second,'.agents/skills/mine'),'compatibility home'],
    [path.join(root,'data/skills/mine'),'global'],
  ]) {
    await mkdir(folder,{recursive:true});
    await writeFile(path.join(folder,'SKILL.md'),'---\nname: mine\ndescription: a local skill\n---\n'+body);
  }
  await tools.skills.load();
  assert.match(await tools.skills.read('mine','SKILL.md',0,first), /\nproject$/);
  assert.match(await tools.skills.read('mine','SKILL.md',0,second), /\nglobal$/);
  assert.equal((await tools.skills.userCatalog(first))[0].scope,'project');
  assert.equal((await tools.skills.userCatalog(second))[0].scope,'user');
});
