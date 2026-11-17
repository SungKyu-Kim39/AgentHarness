import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { prepareEditor } from '../distribution/ned/profile';

const exec = promisify(execFile);
const resources = process.env.NED_TEST_NODE && path.join(path.dirname(process.env.NED_TEST_NODE), 'resources');

test('the installed editor Git command trusts only the selected repository in Ned’s watched config', {
  skip: process.platform !== 'win32' || !resources,
}, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-editor-git-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repositories = [path.join(root, 'project with spaces'), path.join(root, 'other project')];
  for (const repository of repositories) await mkdir(repository);
  const profile = await prepareEditor(root, process.execPath, resources!, 'test-descriptor', 'http://127.0.0.1:9');
  const config = path.join(profile.data, 'config', 'git', 'config');
  assert.equal(profile.env.GIT_CONFIG_GLOBAL, config);
  const where = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'where.exe');
  const located = await exec(where, ['git.exe'], { env: profile.env, cwd: profile.env.HOME });
  const bundled = path.join(resources!, 'runtime', 'windows-x64', 'mcp', 'git', 'cmd', 'git.exe');
  assert.equal(await realpath(located.stdout.trim().split(/\r?\n/)[0]), await realpath(bundled));

  const git = (cwd: string, args: string[], checkOwnership = false) =>
    exec('git', args, { cwd, env: { ...profile.env, ...(checkOwnership ? { GIT_TEST_ASSUME_DIFFERENT_OWNER: '1' } : {}) } });
  for (const repository of repositories) {
    await git(repository, ['init', '--quiet']);
    await assert.rejects(git(repository, ['status', '--porcelain'], true), /dubious ownership/i);
  }

  // This is the argv Zed’s Trust Directory button passes to its git_config operation.
  const selected = await realpath(repositories[0]);
  await git(selected, ['config', '--global', '--add', 'safe.directory', selected]);
  assert.equal((await git(selected, ['config', '--global', '--get-all', 'safe.directory'])).stdout.trim(), selected);
  assert.match(await readFile(config, 'utf8'), /\[safe\]/);
  await git(selected, ['status', '--porcelain'], true);
  await assert.rejects(git(repositories[1], ['status', '--porcelain'], true), /dubious ownership/i);
  await assert.rejects(git(selected, ['ls-remote', repositories[1]]), /transport 'file' not allowed/i);

  const restarted = await prepareEditor(root, process.execPath, resources!, 'next-descriptor', 'http://127.0.0.1:9');
  const entries = await exec('git', ['config', '--global', '--get-all', 'safe.directory'], { cwd: selected, env: restarted.env });
  assert.equal(entries.stdout.trim(), selected);
});
