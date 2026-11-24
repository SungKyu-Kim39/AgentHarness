import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { applyTextEdits } from '../src/main/files';
import { HostTools, type EditDecision } from '../distribution/host-tools';
import { PermissionPolicy } from '../distribution/ned/permission-policy';
import { Redactor } from '../src/main/config';

test('applyTextEdits supports partial hunks, CRLF preservation, line ranges, replaceAll, and rejects missing/ambiguous/no-op edits', () => {
  const lf = ['line 1', 'function greet() {', '  return "old";', '}', 'line 5'].join('\n') + '\n';
  const single = applyTextEdits(lf, [{ oldText: '  return "old";', newText: '  return "new";' }]);
  assert.equal(single.replacements, 1);
  assert.equal(single.after, ['line 1', 'function greet() {', '  return "new";', '}', 'line 5'].join('\n') + '\n');

  // Windows CRLF file edited with LF oldText/newText preserves CRLF
  const crlf = 'alpha\r\nbeta\r\ngamma\r\ndelta\r\n';
  const crlfPatched = applyTextEdits(crlf, [{ oldText: 'beta\ngamma', newText: 'BETA\nGAMMA' }]);
  assert.equal(crlfPatched.after, 'alpha\r\nBETA\r\nGAMMA\r\ndelta\r\n');

  // Ambiguous match rejected unless disambiguated by startLine/endLine or replaceAll
  const repeated = ['a = 1', 'keep()', 'a = 1', 'end()'].join('\n');
  assert.throws(() => applyTextEdits(repeated, [{ oldText: 'a = 1', newText: 'a = 2' }]), /2곳에서 일치해 모호/);
  const scoped = applyTextEdits(repeated, [{ oldText: 'a = 1', newText: 'a = 2', startLine: 3, endLine: 4 }]);
  assert.equal(scoped.after, ['a = 1', 'keep()', 'a = 2', 'end()'].join('\n'));
  const all = applyTextEdits(repeated, [{ oldText: 'a = 1', newText: 'a = 2', replaceAll: true }]);
  assert.equal(all.replacements, 2);
  assert.equal(all.after, ['a = 2', 'keep()', 'a = 2', 'end()'].join('\n'));

  // Sequential multi-hunk patch
  const multi = applyTextEdits('one\ntwo\nthree\nfour\n', [
    { oldText: 'two', newText: 'TWO' },
    { oldText: 'four', newText: 'FOUR' },
  ]);
  assert.equal(multi.replacements, 2);
  assert.equal(multi.after, 'one\nTWO\nthree\nFOUR\n');

  // Missing text and no-op rejected cleanly
  assert.throws(() => applyTextEdits(lf, [{ oldText: 'not present', newText: 'x' }]), /찾지 못했습니다/);
  assert.throws(() => applyTextEdits(lf, [{ oldText: 'line 1', newText: 'line 1' }]), /변경된 내용이 없습니다/);
});

test('HostTools patch_file enforces permission modes, validateEdit, snapshots, protected paths and concise return payload', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-patch-file-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const data = path.join(root, 'data');
  const project = path.join(root, 'project');
  await mkdir(data);
  await mkdir(project);
  const original = 'header\nconst value = 1;\nfooter\n';
  await writeFile(path.join(project, 'app.ts'), original);

  const policy = new PermissionPolicy(data);
  let prompts = 0;
  let lastDetail = '';
  let allowPrompt = false;
  let validated = 0;
  const host = new HostTools(data, root, {
    project: async () => project,
    permissionSignal: () => policy.signal,
    approve: (_m, d, s) => policy.decide('effect', s, true, async () => { prompts++; lastDetail = d; return allowPrompt; }),
    approveEdit: (_m, d, s) => policy.decide<EditDecision>('edit', s, { approved: true, autoApproveRequest: false }, async () => {
      prompts++; lastDetail = d; return { approved: allowPrompt, autoApproveRequest: false };
    }),
    validateEdit: async () => { validated++; },
    knowledge: () => undefined,
    redactor: new Redactor(),
  });
  t.after(() => host.close());

  // ask mode: rejected when user denies
  await assert.rejects(
    host.call('patch_file', { path: 'app.ts', edits: [{ oldText: 'const value = 1;', newText: 'const value = 2;' }] }, 's1'),
    /거절/,
  );
  assert.equal(prompts, 1);
  assert.match(lastDetail, /\[편집 #1\]/);
  assert.equal(await readFile(path.join(project, 'app.ts'), 'utf8'), original);

  // ask mode: applied when user approves, saves full recovery snapshot
  allowPrompt = true;
  const res1 = JSON.parse(await host.call('patch_file', {
    path: 'app.ts',
    edits: [{ oldText: 'const value = 1;', newText: 'const value = 2;' }],
  }, 's1'));
  assert.equal(res1.status, 'applied');
  assert.equal(res1.operation, 'patch');
  assert.equal(res1.editsApplied, 1);
  assert.equal(res1.before, undefined);
  assert.equal(await readFile(path.join(project, 'app.ts'), 'utf8'), 'header\nconst value = 2;\nfooter\n');
  const snapshot = JSON.parse(await readFile(path.join(data, 'snapshots', 's1', res1.snapshot + '.json'), 'utf8'));
  assert.equal(snapshot.before, original);
  assert.equal(snapshot.after, 'header\nconst value = 2;\nfooter\n');
  assert.ok(validated >= 3);

  // edits mode: auto-approves without prompting
  await policy.set('edits');
  allowPrompt = false;
  const res2 = JSON.parse(await host.call('patch_file', {
    path: 'app.ts',
    edits: [{ oldText: 'const value = 2;', newText: 'const value = 3;' }],
  }, 's1'));
  assert.equal(res2.status, 'applied');
  assert.equal(prompts, 2);
  assert.equal(await readFile(path.join(project, 'app.ts'), 'utf8'), 'header\nconst value = 3;\nfooter\n');

  // Protected and outside-project paths blocked
  await assert.rejects(host.call('patch_file', { path: '../outside.txt', edits: [{ oldText: 'a', newText: 'b' }] }, 's1'), /허용되지 않는 경로/);
  await assert.rejects(host.call('patch_file', { path: '.zed/settings.json', edits: [{ oldText: 'a', newText: 'b' }] }, 's1'), /차단/);
});

test('large propose_edit and knowledge_index bound approval detail below 60,000 chars so dialogs are not silently rejected', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-large-detail-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, 'project');
  const data = path.join(root, 'data');
  const resources = path.join(root, 'resources');
  await mkdir(project, { recursive: true });
  await mkdir(data, { recursive: true });
  await mkdir(resources, { recursive: true });

  const largeBefore = 'A'.repeat(75000);
  const largeAfter = 'B'.repeat(75000);
  await writeFile(path.join(project, 'large.txt'), largeBefore);

  const observedDetails: string[] = [];
  let indexedContent = '';
  const fakeKnowledge = {
    state: () => ({ status: 'ready' as const, indexedFiles: 0 }),
    configure: async () => {},
    search: async () => '{}',
    read: async () => '{}',
    index: async (_p: string, _f: string, content: string) => { indexedContent = content; return 'ok'; },
    close: async () => {},
  };

  const host = new HostTools(data, resources, {
    project: async () => project,
    approve: async (_m, detail) => {
      observedDetails.push(detail);
      return detail.length <= 60000;
    },
    approveEdit: async (_m, detail) => {
      observedDetails.push(detail);
      return { approved: detail.length <= 60000, autoApproveRequest: false };
    },
    knowledge: () => fakeKnowledge,
    redactor: new Redactor(),
  });
  t.after(() => host.close());

  const editRes = JSON.parse(await host.call('propose_edit', { path: 'large.txt', content: largeAfter }, 's-large'));
  assert.equal(editRes.status, 'applied');
  assert.equal(await readFile(path.join(project, 'large.txt'), 'utf8'), largeAfter);
  assert.ok(observedDetails[0].length < 30000, `propose_edit detail too large: ${observedDetails[0].length}`);
  assert.match(observedDetails[0], /이하 생략/);
  assert.match(observedDetails[0], /변경 후 SHA-256:/);

  const indexRes = await host.call('knowledge_index', { path: 'large.txt' }, 's-large');
  assert.equal(indexRes, 'ok');
  assert.equal(indexedContent, largeAfter);
  assert.ok(observedDetails[1].length < 25000, `knowledge_index detail too large: ${observedDetails[1].length}`);
  assert.match(observedDetails[1], /이하 생략/);
});
