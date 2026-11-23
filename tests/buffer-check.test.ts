import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { normalizeBufferText, buffersMatch, verifyEditorBuffer } from '../distribution/ned/buffer-check';
import { ProjectFiles } from '../src/main/files';

test('normalizeBufferText matches Zed BOM removal and CRLF/CR line-ending normalization', () => {
  assert.equal(normalizeBufferText('\uFEFFline1\r\nline2\rline3\n'), 'line1\nline2\nline3\n');
  assert.equal(buffersMatch('line1\nline2\nline3\n', '\uFEFFline1\r\nline2\rline3\n'), true);
  assert.equal(buffersMatch('line1\nline2-edited\n', '\uFEFFline1\r\nline2\r\n'), false);
});

test('verifyEditorBuffer accepts UTF-8 BOM files and recovers when Zed BufferStore reloads after a disk write', async () => {
  const bomResult = await verifyEditorBuffer(
    async () => ({ content: '#include <stdio.h>\nint main() { return 0; }\n' }),
    { before: '\uFEFF#include <stdio.h>\r\nint main() { return 0; }\r\n' },
    { retryDelaysMs: [1, 1] },
  );
  assert.deepEqual(bomResult, { matches: true, attempts: 1 });

  let reads = 0;
  const staleThenFresh = await verifyEditorBuffer(
    async () => {
      reads++;
      return { content: reads < 3 ? 'old cached text\n' : 'updated text\n' };
    },
    { before: 'updated text\r\n' },
    { retryDelaysMs: [1, 1, 1] },
  );
  assert.deepEqual(staleThenFresh, { matches: true, attempts: 3 });

  const missingNewFile = await verifyEditorBuffer(
    async () => { throw Object.assign(new Error('not found'), { code: -32002 }); },
    { before: '', missing: true },
    { retryDelaysMs: [1] },
  );
  assert.deepEqual(missingNewFile, { matches: true, attempts: 1 });
});

test('verifyEditorBuffer still blocks genuinely dirty editor buffers with safe non-content diagnostics', async () => {
  const dirty = await verifyEditorBuffer(
    async () => ({ content: 'unsaved editor edit\n' }),
    { before: 'saved disk text\n' },
    { retryDelaysMs: [1, 1] },
  );
  assert.equal(dirty.matches, false);
  assert.equal(dirty.attempts, 3);
  assert.equal(dirty.editorLength, 'unsaved editor edit\n'.length);
  assert.equal(dirty.diskLength, 'saved disk text\n'.length);
  assert.equal(dirty.diskHasBom, false);
  assert.equal(dirty.diskHasStandaloneCr, false);
});

test('ProjectFiles rejects non-UTF-8 (CP949/EUC-KR) files before buffer guard and preserves UTF-8 BOM on patch', async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ned-buffer-check-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const files = new ProjectFiles(dir);

  // CP949/EUC-KR bytes for "한글" (C7 D1 B1 DB) — no null bytes, invalid UTF-8.
  await writeFile(path.join(dir, 'legacy-cp949.txt'), Buffer.from([0x61, 0x20, 0xc7, 0xd1, 0xb1, 0xdb, 0x0a]));
  await assert.rejects(files.propose('c1', 'legacy-cp949.txt', 'replaced'), /UTF-8 텍스트 파일만 수정할 수 있습니다/);
  await assert.rejects(
    files.proposePatch('c2', 'legacy-cp949.txt', [{ oldText: 'a', newText: 'b' }]),
    /UTF-8 텍스트 파일만 수정할 수 있습니다/,
  );

  // Valid UTF-8 with BOM patches cleanly and preserves BOM.
  await writeFile(path.join(dir, 'bom.cpp'), Buffer.from('\uFEFFint a = 1;\r\nint b = 2;\r\n', 'utf8'));
  const { proposal } = await files.proposePatch('c3', 'bom.cpp', [{ oldText: 'int a = 1;', newText: 'int a = 42;', startLine: 1, endLine: 1 }]);
  await files.apply(proposal);
  const saved = await readFile(path.join(dir, 'bom.cpp'));
  assert.deepEqual(saved.subarray(0, 3), Buffer.from([0xef, 0xbb, 0xbf]));
  assert.equal(saved.toString('utf8'), '\uFEFFint a = 42;\r\nint b = 2;\r\n');
});
