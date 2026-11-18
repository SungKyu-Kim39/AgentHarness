import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, realpath, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HostTools } from '../distribution/host-tools';
import { Redactor } from '../src/main/config';

const sourcePython = process.env.NED_SHELL_TEST_PYTHON;
const installedNode = process.env.NED_TEST_NODE;

test('the host runs both approved Windows shells and stops only this conversation’s job', {
  skip: process.platform !== 'win32' || !(sourcePython || installedNode),
}, async t => {
  const data = await mkdtemp(path.join(tmpdir(), 'ned-shell-'));
  const projectDirectory = path.join(data, 'project with spaces');
  await mkdir(projectDirectory);
  const project = await realpath(projectDirectory);
  const resources = installedNode ? path.join(path.dirname(installedNode), 'resources') : path.join(data, 'resources');
  if (!installedNode) {
    const runtime = path.join(resources, 'runtime/windows-x64/openviking');
    await mkdir(runtime, { recursive: true });
    await symlink(path.dirname(sourcePython!), path.join(runtime, 'python'), 'junction');
    await mkdir(path.join(resources, 'ned'));
    await cp('scripts/sidecar-supervisor.py', path.join(resources, 'ned/python-supervisor.py'));
  }
  let approved = false;
  const host = new HostTools(data, resources, {
    project: async () => project, knowledge: () => undefined, redactor: new Redactor(),
    approve: async (_title, detail) => {
      assert.ok(detail.startsWith(project + '\n\n'));
      return approved;
    },
  });
  t.after(async () => { try { await host.close(); } finally { await rm(data, { recursive: true, force: true }); } });
  await host.start();
  const call = async (name: string, args: unknown, session = 'shell-session') => JSON.parse(await host.call(name, args, session));
  await assert.rejects(call('run_terminal', { shell: 'cmd', command: 'echo should not run' }), /승인되지 않았습니다/);
  approved = true;
  for (const [shell, command, exitCode] of [
    ['cmd', 'cd\r\necho quoted "hello world"\r\nexit /b 7', 7],
    ['powershell', '(Get-Location).Path; Write-Output \'quoted "hello world"\'; exit 9', 9],
  ] as const) {
    const { id } = await call('run_terminal', { shell, command });
    let result = await call('terminal_status', { id, waitMs: 30000 });
    if (result.status === 'running') result = await call('terminal_status', { id, waitMs: 30000 });
    assert.equal(result.exitCode, exitCode, JSON.stringify(result));
    assert.ok(result.output.toLowerCase().includes(project.toLowerCase()), result.output);
    assert.match(result.output, /quoted "hello world"/);
  }
  const { id } = await call('run_terminal', { shell: 'powershell', command: 'Start-Sleep -Seconds 20' });
  await assert.rejects(call('stop_terminal', { id }, 'another-session'), /현재 대화/);
  assert.equal((await call('stop_terminal', { id })).status, 'stopped');
});
