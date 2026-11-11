import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { verifyAsciiTree, verifyAsciiTar, verifyAsciiGitTree } from '../scripts/package-paths.mjs';

async function temporary(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-package-paths-'));
  t.after(() => rm(root, { recursive: true, force: true })); return root;
}
test('package names remain ASCII while Korean document content is preserved', async t => {
  const root = await temporary(t); await mkdir(path.join(root, 'docs'));
  await writeFile(path.join(root, 'docs/GETTING_STARTED.txt'), '설치 안내와 사용자 화면은 한국어를 사용할 수 있습니다.');
  assert.equal((await verifyAsciiTree(root)).files, 1);
  await writeFile(path.join(root, 'docs/시작하기.txt'), 'fixture');
  await assert.rejects(verifyAsciiTree(root), /printable ASCII/);
});
test('TGZ header inspection rejects Unicode paths rather than escaped listing text', async t => {
  const root = await temporary(t); const content = path.join(root, 'content'); await mkdir(content);
  const archive = path.join(root, 'bundle.tgz');
  await writeFile(path.join(content, 'READINESS.json'), '{}');
  execFileSync('tar', ['-czf', archive, '-C', content, '.']);
  assert.equal(verifyAsciiTar(archive).files, 1);
  await mkdir(path.join(content, '한글경로')); await writeFile(path.join(content, '한글경로/README.txt'), 'fixture');
  execFileSync('tar', ['-czf', archive, '-C', content, '.']);
  assert.throws(() => verifyAsciiTar(archive), /Non-ASCII package archive path/);
});
test('source archive inputs reject a committed non-ASCII filename', async t => {
  const root = await temporary(t); execFileSync('git', ['init', '-q', root]);
  await writeFile(path.join(root, 'README.md'), 'fixture');
  execFileSync('git', ['-C', root, 'add', '.']);
  execFileSync('git', ['-C', root, '-c', 'user.name=Fixture', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture']);
  assert.equal(verifyAsciiGitTree(root, 'HEAD').files, 1);
  await writeFile(path.join(root, '검증보고서.md'), 'fixture'); execFileSync('git', ['-C', root, 'add', '.']);
  execFileSync('git', ['-C', root, '-c', 'user.name=Fixture', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'invalid path']);
  assert.throws(() => verifyAsciiGitTree(root, 'HEAD'), /printable ASCII/);
});
