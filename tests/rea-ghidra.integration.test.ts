import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir, chmod } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { ReaGhidra } from '../distribution/rea-ghidra';
const resources = process.env.NED_TEST_RESOURCES ?? path.resolve('release/ned/win-unpacked/resources');
const ghidra = process.env.NED_TEST_GHIDRA ?? path.resolve('.cache/ghidra/source/ghidra_12.1.4_PUBLIC');
const java = process.env.NED_TEST_JAVA ?? path.resolve('.cache/ghidra/linux-java/jdk-21.0.13+9');
const rea = path.join(resources, 'runtime/windows-x64/rea/scripts/rea.mjs');
const guard = path.join(resources, 'runtime/windows-x64/ghidra/network-guard.jar');
function tinyPE() {
  const b = Buffer.alloc(1024); b.write('MZ'); b.writeUInt32LE(128, 60); b.write('PE\0\0', 128, 'binary');
  const coff = 132, opt = 152; b.writeUInt16LE(0x8664, coff); b.writeUInt16LE(1, coff + 2); b.writeUInt16LE(240, coff + 16); b.writeUInt16LE(0x22, coff + 18);
  b.writeUInt16LE(0x20b, opt); b.writeUInt32LE(512, opt + 4); b.writeUInt32LE(4096, opt + 16); b.writeUInt32LE(4096, opt + 20); b.writeBigUInt64LE(0x140000000n, opt + 24);
  b.writeUInt32LE(4096, opt + 32); b.writeUInt32LE(512, opt + 36); b.writeUInt16LE(6, opt + 40); b.writeUInt16LE(6, opt + 48); b.writeUInt32LE(8192, opt + 56); b.writeUInt32LE(512, opt + 60); b.writeUInt16LE(3, opt + 68);
  for (const offset of [72, 88]) b.writeBigUInt64LE(1048576n, opt + offset);
  for (const offset of [80, 96]) b.writeBigUInt64LE(4096n, opt + offset);
  b.writeUInt32LE(16, opt + 108); const section = opt + 240; b.write('.text', section); b.writeUInt32LE(6, section + 8); b.writeUInt32LE(4096, section + 12); b.writeUInt32LE(512, section + 16); b.writeUInt32LE(512, section + 20); b.writeUInt32LE(0x60000020, section + 36);
  Buffer.from([0xb8, 0x0b, 0, 0, 0, 0xc3]).copy(b, 512); return b;
}
test('late Ghidra approval cannot start an analysis after Ned closes', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-ghidra-stop-')), project = path.join(root, 'project'); await mkdir(project);
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(project, 'target.exe'), tinyPE());
  let entered!: () => void, release!: (value: boolean) => void;
  const ready = new Promise<void>(r => { entered = r; }), decision = new Promise<boolean>(r => { release = r; });
  const analysis = new ReaGhidra(root, '', async () => { entered(); return decision; }, { rea: 'not-started', ghidra: 'not-started', java: 'not-started', guard: 'not-started', worker: 'not-started' });
  const run = analysis.call('late', project, { path: 'target.exe', operation: 'functions' });
  const rejected = assert.rejects(run, /abort/i); await ready; await analysis.close(); release(true); await rejected;
  assert.equal(existsSync(path.join(root, 'ghidra-analysis')), false);
});
test('REA opens an actual PE with Ghidra, lists functions and decompiles without executing the target', { skip: !existsSync(rea) || !existsSync(guard) || !existsSync(java) || !existsSync(ghidra), timeout: 300000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-ghidra-live-')), project = path.join(root, 'project'); await mkdir(project);
  if (process.platform !== 'win32') {
    await chmod(path.join(ghidra, 'support/analyzeHeadless'), 0o755);
    await chmod(path.join(ghidra, 'support/launch.sh'), 0o755);
    for (const name of await readdir(path.join(ghidra, 'Ghidra/Features/Decompiler/os/linux_x86_64'))) await chmod(path.join(ghidra, 'Ghidra/Features/Decompiler/os/linux_x86_64', name), 0o755);
  }
  const target = path.join(project, 'calculation.exe'); await writeFile(target, tinyPE()); const original = await readFile(target);
  let diagnostics = '', approvals = 0;
  const analysis = new ReaGhidra(root, resources, async () => { approvals++; return true; }, { rea, ghidra, java, guard, worker: process.env.NED_TEST_GHIDRA_WORKER ?? path.resolve('distribution/rea-ghidra-worker.mjs'), diagnostic: text => { diagnostics = (diagnostics + text).slice(-10000); } });
  t.after(async () => { await analysis.close(); await rm(root, { recursive: true, force: true }); });
  const functions = JSON.parse(await analysis.call('session-a', project, { path: 'calculation.exe', operation: 'functions' }));
  assert.ok(!functions.isError && !functions.result?.isError, JSON.stringify(functions) + '\n' + diagnostics);
  assert.ok(JSON.stringify(functions).includes('140001000'), JSON.stringify(functions));
  const decompiled = JSON.parse(await analysis.call('session-a', project, { path: 'calculation.exe', operation: 'decompile', procedure: 'entry' }));
  assert.ok(!decompiled.result.isError, JSON.stringify(decompiled));
  assert.match(JSON.stringify(decompiled), /(?:return[^;]{0,60}(?:0xb|11)|0xb)/i);
  assert.equal(approvals, 1); assert.equal(decompiled.targetExecuted, false); assert.deepEqual(await readFile(target), original);
  t.diagnostic('Real REA 6.8.0 / Ghidra 12.1.4 decompiled a synthetic PE; original binary was never executed or modified.');
});
