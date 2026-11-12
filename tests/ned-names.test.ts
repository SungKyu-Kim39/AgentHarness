import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { engineConfiguration, providerID } from '../distribution/native-control';
import { hostTools } from '../distribution/host-tools';
import { managedResource } from '../distribution/ned/resources';
import { configSchema } from '../src/shared/contracts';
import { OfflineSkills } from '../src/main/skills';

test('every model-visible host tool has a matching Ned-only MCP and permission identity', () => {
 const config = configSchema.parse({ model: { baseUrl: 'http://127.0.0.1:19350/v1', apiKey: 'synthetic-key', id: 'coding' } });
 const models: any = [{ provider: providerID('Coding'), name: 'Coding', id: 'coding', gateway: { baseUrl: 'http://127.0.0.1:19351/v1', token: 'local-only' } }];
 const engine = engineConfiguration(config, models, [], '/resources/ned/skills', { url: 'http://127.0.0.1:19352', token: 'local-only' });
 assert.deepEqual(Object.keys(engine.mcp!.servers), ['ned_host']);
 const expected = hostTools.map(tool => 'ned_host_' + tool.name);
 for (const name of expected) {
  assert.ok(engine.policies.some(p => p.action === 'tool.use' && p.resource === name + ':*' && p.effect === 'allow'), name);
  assert.ok(engine.permissions.some(p => p.action === name && p.effect === 'allow'), name);
 }
 assert.equal(new Set(expected).size, hostTools.length);
 assert.doesNotMatch(JSON.stringify(engine), /l[_-]vibe/i);
 assert.match(models[0].provider, /^ned_/);
});

test('all bundled skill documents exposed by the host use current Ned branding', async () => {
 const skills = new OfflineSkills(path.resolve('vendor/skills')); await skills.load();
 const manifest = JSON.parse(await readFile('vendor/skills/manifest.json', 'utf8'));
 for (const skill of manifest.skills) for (const file of skill.files) {
  if (!/\.md$/i.test(file.path)) continue;
  const text = await skills.read(skill.id, file.path);
  assert.doesNotMatch(text, /l[_-]vibe/i, skill.id + '/' + file.path);
 }
});

test('new Ned resources take precedence while upgrades still read legacy app-owned resources', async t => {
 const root = await mkdtemp(path.join(tmpdir(), 'ned-resources-')); t.after(() => rm(root, { recursive: true, force: true }));
 await mkdir(path.join(root, 'l-vibe/skills'), { recursive: true });
 assert.equal(managedResource(root, 'skills'), path.join(root, 'l-vibe/skills'));
 await mkdir(path.join(root, 'ned/skills'), { recursive: true });
 assert.equal(managedResource(root, 'skills'), path.join(root, 'ned/skills'));
 await writeFile(path.join(root, 'ned/agent-config.example.json'), '{}');
 assert.equal(managedResource(root, 'agent-config.example.json'), path.join(root, 'ned/agent-config.example.json'));
});
