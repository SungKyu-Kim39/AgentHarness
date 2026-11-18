import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getMakeNsisPath } from 'app-builder-lib/out/toolsets/windows.js';

test('the Ned installer preserves Windows user global skills on upgrade', {
  skip: process.platform !== 'win32' || process.env.GITHUB_ACTIONS !== 'true',
}, async t => {
  const root = await mkdtemp(path.join(process.env.RUNNER_TEMP, 'ned-skills-update-'));
  const stage = path.join(root, 'stage'), install = path.join(root, 'installed');
  const skills = path.join(process.env.APPDATA, 'Ned', 'skills');
  const userSkill = path.join(skills, 'preservation-' + randomUUID());
  t.after(async () => {
    const uninstaller = path.join(install, 'Uninstall Ned.exe');
    if (await access(uninstaller).then(() => true, () => false))
      spawnSync(uninstaller, ['/S', '_?=' + install], { timeout: 30000, windowsHide: true });
    await rm(userSkill, { recursive: true, force: true });
    await rm(root, { recursive: true, force: true });
  });
  for (const file of ['Ned.exe', 'resources/app.asar', 'resources/ned/agent.cjs', 'resources/zed/Zed.exe',
    'resources/zed/bin/zed.exe', 'resources/ned/agent-config.example.json',
    'resources/runtime/windows-x64/openviking/python/Lib/urllib/parse.py',
    'resources/runtime/windows-x64/openviking/python/Lib/site-packages/win32/lib/pywin32_bootstrap.py',
    'resources/runtime/windows-x64/agent-desktop/agent-desktop.exe']) {
    await mkdir(path.dirname(path.join(stage, file)), { recursive: true });
    await writeFile(path.join(stage, file), 'fixture');
  }
  const compiler = await getMakeNsisPath('0.0.0');
  const run = (exe, args, env) => spawnSync(exe, args, { env, timeout: 60000, windowsHide: true, encoding: 'utf8' });
  const build = version => {
    const exe = path.join(root, `Ned-${version}.exe`);
    const result = run(compiler.path, ['-V2', '-DNED_VERSION=' + version, '-DNED_APP_DIR=' + stage,
      '-DNED_OUT_FILE=' + exe, '-DNED_ICON=' + path.resolve('assets/ned-icon.ico'), path.resolve('distribution/ned/installer.nsi')],
    { ...process.env, ...compiler.env });
    assert.equal(result.status, 0, result.error?.message ?? result.stderr);
    return exe;
  };
  const installTo = (exe, dir) => run(exe, ['/S', '/D=' + dir]);
  assert.equal(installTo(build('0.3.10'), install).status, 0);
  await mkdir(path.join(userSkill, 'references'), { recursive: true });
  const original = '---\nname: ' + path.basename(userSkill) + '\ndescription: 사용자 리뷰 지침\n---\nkeep this skill';
  await writeFile(path.join(userSkill, 'SKILL.md'), original);
  await writeFile(path.join(userSkill, 'references/checklist.md'), 'checklist');
  await writeFile(path.join(stage, 'Ned.exe'), 'second installer payload');
  const upgrade = build('0.3.11');
  assert.equal(installTo(upgrade, install).status, 0);
  assert.equal(await readFile(path.join(install, 'Ned.exe'), 'utf8'), 'second installer payload');
  assert.equal(await readFile(path.join(userSkill, 'SKILL.md'), 'utf8'), original);
  assert.equal(await readFile(path.join(userSkill, 'references/checklist.md'), 'utf8'), 'checklist');
  const badPath = path.join(skills, 'INSTALLATION_MUST_NOT_BE_CREATED');
  assert.notEqual(installTo(upgrade, badPath).status, 0);
  await assert.rejects(access(badPath), { code: 'ENOENT' });
});
