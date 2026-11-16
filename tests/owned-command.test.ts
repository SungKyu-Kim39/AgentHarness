import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OwnedCommand } from '../distribution/owned-command';
test('owned execution preserves fragmented UTF-8, bounds output and propagates the real exit code', { skip: process.platform === 'win32' }, async t => {
  const owner = new OwnedCommand(''); t.after(() => owner.close());
  const result = await owner.run({ executable: process.execPath, args: ['-e', `const b=Buffer.from('한국어');process.stdout.write(b.subarray(0,2));setTimeout(()=>{process.stdout.write(b.subarray(2));process.exitCode=7},20)`], cwd: process.cwd(), env: {} });
  assert.equal(result.exitCode, 7); assert.equal(result.output, '한국어'); assert.equal(result.stdout, '한국어');
  const large = await owner.run({ executable: process.execPath, args: ['-e', "process.stdout.write('x'.repeat(200000))"], cwd: process.cwd(), env: {} });
  assert.equal(large.output.length, 160000); assert.equal(large.outputTruncated, true);
});
test('user cancellation confirms the owned command exits before returning and close prevents new runs', { skip: process.platform === 'win32', timeout: 10000 }, async () => {
  const owner = new OwnedCommand(''), abort = new AbortController();
  const run = owner.run({ executable: process.execPath, args: ['-e', 'setInterval(()=>{},1000)'], cwd: process.cwd(), env: {} }, abort.signal);
  setTimeout(() => abort.abort(), 75); const stopped = await run;
  assert.equal(stopped.cancelled, true); assert.equal(owner.stoppingUnconfirmed, false);
  await owner.close(); assert.throws(() => owner.run({ executable: process.execPath, args: [], cwd: process.cwd(), env: {} }), /종료 중/);
});
