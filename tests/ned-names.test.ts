import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { engineConfiguration, providerID } from '../distribution/native-control';
import { hostTools } from '../distribution/host-tools';
import { managedResource } from '../distribution/ned/resources';
import { configSchema } from '../src/shared/contracts';
import { OfflineSkills } from '../src/main/skills';
import { loadBundledSkillPackages } from '../src/main/openviking-skills';
import { knowledgeRoot } from '../src/main/openviking';

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

test('Ned resources never fall back to obsolete product directories', async t => {
 const root = await mkdtemp(path.join(tmpdir(), 'ned-resources-')); t.after(() => rm(root, { recursive: true, force: true }));
 await mkdir(path.join(root, 'l-vibe/skills'), { recursive: true });
 assert.equal(managedResource(root, 'skills'), path.join(root, 'ned/skills'));
 await mkdir(path.join(root, 'ned/skills'), { recursive: true });
 assert.equal(managedResource(root, 'skills'), path.join(root, 'ned/skills'));
 await writeFile(path.join(root, 'ned/agent-config.example.json'), '{}');
 assert.equal(managedResource(root, 'agent-config.example.json'), path.join(root, 'ned/agent-config.example.json'));
});

test('all new OpenViking packages, metadata filenames and project URIs use Ned', async t => {
 const root = await mkdtemp(path.join(tmpdir(), 'ned-package-names-')); t.after(() => rm(root, { recursive: true, force: true }));
 await cp('vendor/skills', path.join(root, 'skills'), { recursive: true }); await cp('skills-lock.json', path.join(root, 'skills-lock.json'));
 const packages = await loadBundledSkillPackages(path.join(root, 'skills'));
 assert.equal(packages.length, 79);
 for (const pkg of packages) {
  assert.equal(pkg.name, 'ned-' + pkg.id);
  assert.ok(pkg.files.has('NED-BUNDLE.json'));
  for (const name of pkg.files.keys()) assert.doesNotMatch(name, /l[_-]vibe/i);
  assert.doesNotMatch(pkg.archive.toString('utf8'), /l[_-]vibe/i, pkg.id);
 }
 assert.equal(knowledgeRoot('p1'), 'viking://resources/ned/p1');
});

test('Goldfish engine configuration exposes only project reads and EGM reads without the normal memory guidance',()=>{
 const config=configSchema.parse({model:{baseUrl:'http://127.0.0.1:9/v1',apiKey:'synthetic',id:'test'}});
 const models:any=[{provider:'ned_test',name:'test',id:'test',gateway:{baseUrl:'http://127.0.0.1:19/v1',token:'local-only'}}];
 const engine=engineConfiguration(config,models,[],undefined,{url:'http://127.0.0.1:29',token:'local-only'});
 const goldfish=(engine.agents as any)['ned-goldfish'];assert.match(goldfish.system,/NED_EGM_GOLDFISH_V1/);assert.doesNotMatch(goldfish.system,/personal_knowledge_search|automaticSkillPolicy/);
 assert.deepEqual(goldfish.permissions.filter((p:any)=>p.effect==='allow').map((p:any)=>p.action).sort(),['ned_host_list_files','ned_host_read_file','ned_host_read_skill']);
});
