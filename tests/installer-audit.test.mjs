import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileHash, verifyManifest, verifyInstallerAudit } from '../scripts/installer-audit.mjs';

async function temporary(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-installer-audit-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function save(root, file, value) {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(value));
  return target;
}
test('installer payload verification rejects changed files and incomplete MCP bundles', async t => {
  const root = await temporary(t);
  await writeFile(path.join(root, 'runtime.dll'), 'original payload');
  const data = { complete: true, missing: [], files: [{ path: 'runtime.dll', sha256: await fileHash(path.join(root, 'runtime.dll')) }] };
  const manifest = await save(root, 'manifest.json', data);
  assert.equal((await verifyManifest(root, await fileHash(manifest), true)).files, 1);
  await writeFile(path.join(root, 'runtime.dll'), 'modified payload');
  await assert.rejects(verifyManifest(root, await fileHash(manifest), true), /hash mismatch/);
  await save(root, 'manifest.json', { ...data, complete: false, missing: ['browser/chrome.exe'] });
  await assert.rejects(verifyManifest(root, await fileHash(manifest), true), /incomplete/);
});
test('installer manifest cannot verify paths outside its own payload', async t => {
  const root = await temporary(t);
  for (const relative of ['../outside', '/outside', 'nested\\outside']) {
    const manifest = await save(root, 'manifest.json', { files: [{ path: relative, sha256: '0'.repeat(64) }] });
    await assert.rejects(verifyManifest(root, await fileHash(manifest)), /Invalid packaged manifest path/);
  }
});
test('offline bundling rejects an audit from another EXE, staging, or runtime version', async t => {
  const root = await temporary(t);
  const installer = path.join(root, 'L-Vibe-0.2.2-win-x64.exe');
  await writeFile(installer, 'original installer');
  await save(root, 'package.json', { version: '0.2.2' });
  const audit = { schemaVersion: 1, verifiedFrom: 'installer-archive', version: '0.2.2', paths: { encoding: 'ascii' }, installer: { name: path.basename(installer), bytes: 18, sha256: await fileHash(installer) } };
  for (const [name, file] of [['openviking', 'python-runtime-lock.json'], ['mcp', 'mcp-runtime-lock.json'], ['skills', 'skills-lock.json']]) {
    audit[name] = { manifestSha256: name.padEnd(64, '0') };
    await save(root, file, audit[name]);
  }
  const rea = await save(root, 'vendor/runtime/windows-x64/rea/manifest.json', { files: [] });
  audit.rea = { manifestSha256: await fileHash(rea) };
  const staged = '.cache/l-vibe-desktop/source/packages/desktop/dist/win-unpacked/';
  for (const [key, file] of [['appAsarSha256', 'resources/app.asar'], ['appExeSha256', 'L-Vibe.exe']]) {
    const target = await save(root, staged + file, { fixture: file });
    audit[key] = await fileHash(target);
  }
  const cli = path.join(root, '.cache/l-vibe-desktop/source/packages/cli/dist/cli-windows-x64-baseline/bin/opencode.exe');
  await mkdir(path.dirname(cli), { recursive: true }); await writeFile(cli, 'pinned CLI');
  audit.cliSha256 = await fileHash(cli);
  await verifyInstallerAudit(audit, installer, root);
  await assert.rejects(verifyInstallerAudit({ ...audit, verifiedFrom: 'staging' }, installer, root), /missing or stale/);
  await assert.rejects(verifyInstallerAudit({ ...audit, paths: undefined }, installer, root), /ASCII path/);
  await writeFile(installer, 'modified installer');
  await assert.rejects(verifyInstallerAudit(audit, installer, root), /missing or stale/);
  await writeFile(installer, 'original installer');
  await save(root, staged + 'resources/app.asar', { fixture: 'changed app' });
  await assert.rejects(verifyInstallerAudit(audit, installer, root), /stale for resources\/app.asar/);
  await save(root, staged + 'resources/app.asar', { fixture: 'resources/app.asar' });
  await save(root, 'python-runtime-lock.json', { manifestSha256: 'new runtime' });
  await assert.rejects(verifyInstallerAudit(audit, installer, root), /stale for openviking/);
});
