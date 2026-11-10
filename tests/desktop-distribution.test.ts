import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transform } from 'esbuild';
import { planPatches, applyPatches, digest } from '../distribution/patches.mjs';
const execute = promisify(execFile);
const project = path.resolve('.');
const original = path.join(project, '.cache/opencode-desktop/source');
const lock = JSON.parse(await readFile(path.join(project, 'upstream-lock.json'), 'utf8')) as { files: Record<string, string> };
async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-distribution-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of Object.keys(lock.files)) { await mkdir(path.dirname(path.join(root, file)), { recursive: true }); await cp(path.join(original, file), path.join(root, file)); }
  return root;
}
test('locked real upstream accepts a deterministic, syntactically valid Desktop patch plan', { skip: !existsSync(original) }, async t => {
  const root = await fixture(t);
  const first = await planPatches(root, project), second = await planPatches(root, project);
  assert.ok(first.changes.size > 10);
  assert.deepEqual([...first.changes].map(([f,b]) => [f,digest(b)]), [...second.changes].map(([f,b]) => [f,digest(b)]));
  for (const [file, bytes] of first.changes) if (file.endsWith('.ts')) await transform(bytes.toString(), { loader: 'ts', target: 'esnext', format: 'esm' });
  const manifest = await applyPatches(root, project);
  for (const [file, sha] of Object.entries(manifest.files)) assert.equal(digest(await readFile(path.join(root, file))), sha);
  // The official authentication boundary is reused byte-for-byte.
  const auth = 'packages/desktop/src/main/service/sidecar-credentials.ts';
  assert.equal(digest(await readFile(path.join(root, auth))), lock.files[auth]);
});
test('mixed upstream versions are rejected before any Desktop file is changed', { skip: !existsSync(original) }, async t => {
  const root = await fixture(t);
  const desktop = 'packages/desktop/src/main/constants.ts';
  const before = await readFile(path.join(root, desktop));
  await writeFile(path.join(root, 'packages/schema/src/config.ts'), '// incompatible upstream');
  await assert.rejects(applyPatches(root, project), /hash mismatch/);
  assert.deepEqual(await readFile(path.join(root, desktop)), before);
  assert.equal(existsSync(path.join(root, '.l-vibe-patches.json')), false);
});
test('startup scopes configuration to app data and leaves HOME/USERPROFILE unchanged', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-native-env-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const moduleURL = pathToFileURL(path.join(project, 'distribution/l-vibe-environment.ts')).href;
  const program = `import { configureLVibeEnvironment } from ${JSON.stringify(moduleURL)}; configureLVibeEnvironment(${JSON.stringify(root)}); console.log(JSON.stringify({home:process.env.HOME,profile:process.env.USERPROFILE,config:process.env.XDG_CONFIG_HOME,content:JSON.parse(process.env.OPENCODE_CONFIG_CONTENT),external:process.env.OPENCODE_CONFIG}));`;
  const { stdout } = await execute(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', program], { cwd: project, env: { ...process.env, HOME: '/unchanged-home', USERPROFILE: 'C:\\unchanged-profile', OPENCODE_CONFIG: '/must-not-load/personal.json', OPENCODE_CONFIG_CONTENT: '{"plugins":["remote-plugin"]}' } });
  const result = JSON.parse(stdout);
  assert.equal(result.home, '/unchanged-home'); assert.equal(result.profile, 'C:\\unchanged-profile');
  assert.equal(result.config, path.join(root, 'runtime/config')); assert.equal(result.external, undefined);
  assert.equal(result.content.update, 'disable'); assert.equal(result.content.share, 'disabled');
  assert.deepEqual(result.content.plugins, []);
  assert.deepEqual(result.content.permissions, [{ action: '*', resource: '*', effect: 'deny' }]);
  assert.ok(result.content.policies.every((p: { effect: string }) => p.effect === 'deny'));
});
