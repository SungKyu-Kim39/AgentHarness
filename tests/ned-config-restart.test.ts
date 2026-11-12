import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { ConfigVault } from '../src/main/config';
import { ConfigurationRestart } from '../distribution/ned/configuration-restart';
import { editorCloseScript } from '../distribution/ned/editor-close';
import { agentLaunch } from '../distribution/ned/agent-launch';
import { NativeRuntime, engineConfiguration } from '../distribution/native-control';

const configuration = (name: string) => JSON.stringify({ schemaVersion: 2, model: { providerID: 'intranet', model: 'coding' }, providers: {
  intranet: { name: 'Intranet', settings: { baseURL: 'http://127.0.0.1:19350/v1', APIKey: 'synthetic-test-key' }, models: {
    coding: { name, modelID: name, capabilities: { tools: true }, limit: { context: 131072, output: 8192 } },
  } },
} });

test('import validates/encrypts first, asks for normal close, then reloads the new model in a fresh runtime', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-restart-')); t.after(() => rm(root, { recursive: true, force: true }));
  const key = randomBytes(32);
  const cipher = { isEncryptionAvailable: () => true,
    encryptString: (text: string) => { const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv); const bytes = Buffer.concat([c.update(text), c.final()]); return Buffer.concat([iv, c.getAuthTag(), bytes]); },
    decryptString: (bytes: Buffer) => { const d = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12)); d.setAuthTag(bytes.subarray(12, 28)); return Buffer.concat([d.update(bytes.subarray(28)), d.final()]).toString(); },
  };
  const vault = new ConfigVault(root, cipher); await vault.importText(configuration('old-model'), false);
  const events: string[] = [];
  const restart = new ConfigurationRestart(async text => { await vault.importText(text, true); events.push('encrypted'); }, async () => { events.push('wm-close'); });
  await restart.import(configuration('new-model'));
  assert.deepEqual(events, ['encrypted', 'wm-close']); assert.equal(restart.pending, true);
  assert.equal((await readFile(vault.file, 'utf8')).includes('synthetic-test-key'), false);
  await restart.finish(true, async () => { events.push('closed-services'); }, () => events.push('relaunch'));
  assert.deepEqual(events, ['encrypted', 'wm-close', 'closed-services', 'relaunch']);
  assert.equal(await restart.finish(true, async () => assert.fail('double cleanup'), () => assert.fail('double launch')), false);
  const fresh = new NativeRuntime(root, path.join(root, 'resources'), cipher); t.after(() => fresh.close());
  const config = await fresh.load(); assert.ok(config); await fresh.initialize(config);
  assert.deepEqual(fresh.status().models, [{ name: config.models![0].name, id: 'coding' }]);
  assert.match(fresh.status().models[0].name, /new-model/);
  const bindings = (fresh as any).models;
  const engine = engineConfiguration(config, bindings);
  assert.equal(engine.providers.intranet.models.coding.modelID, 'new-model');
  assert.equal(engine.providers.intranet.models.coding.limit.context, 131072);
});

test('invalid JSON or unavailable encryption keeps old settings and never requests editor close', async () => {
  for (const message of ['JSON 문법', '암호화']) {
    let close = 0;
    const restart = new ConfigurationRestart(async () => { throw new Error(message); }, async () => { close++; });
    await assert.rejects(restart.import('{}'), new RegExp(message));
    assert.equal(close, 0); assert.equal(restart.pending, false); assert.equal(restart.busy, false);
    assert.equal(await restart.finish(true, async () => assert.fail(), () => assert.fail()), false);
  }
});

test('save prompt cancellation leaves the editor and services live, permits explicit restart cancellation, and serializes imports', async () => {
  let resolve!: () => void, saves = 0, closes = 0;
  const saving = new Promise<void>(r => { resolve = r; });
  const restart = new ConfigurationRestart(async () => { saves++; await saving; }, async () => { closes++; });
  const importing = restart.import('first');
  await assert.rejects(restart.import('second'), /진행 중/); resolve(); await importing;
  assert.equal(saves, 1); assert.equal(closes, 1); assert.equal(restart.pending, true);
  await assert.rejects(restart.import('third'), /진행 중/);
  // No timer, forced kill, service cleanup or relaunch occurs merely because save/close is taking time.
  restart.cancel(); assert.equal(restart.pending, false);
  assert.equal(await restart.finish(true, async () => assert.fail(), () => assert.fail()), false);
});

test('failed close delivery remains pending; abnormal editor exit or unconfirmed shutdown never relaunches', async () => {
  const restart = new ConfigurationRestart(async () => {}, async () => { throw new Error('post failed'); });
  await assert.rejects(restart.import('valid'), /post failed/); assert.equal(restart.pending, true);
  assert.equal(await restart.finish(false, async () => assert.fail(), () => assert.fail()), false);
  assert.equal(restart.pending, false);
  await assert.rejects(restart.import('valid'), /post failed/);
  await assert.rejects(restart.finish(true, async () => { throw new Error('shutdown unconfirmed'); }, () => assert.fail('unsafe launch')), /shutdown unconfirmed/);
});

test('normal editor exit during a config write waits for its completion before cleanup and relaunch', async () => {
  let resolve!: () => void;
  const events: string[] = [];
  const restart = new ConfigurationRestart(() => new Promise<void>(r => { resolve = r; }), async () => { events.push('normal-close'); });
  const importing = restart.import('valid');
  const finishing = restart.finish(true, async () => { events.push('shutdown'); }, () => events.push('relaunch'));
  assert.deepEqual(events, []); resolve(); await importing;
  assert.equal(await finishing, true); assert.deepEqual(events, ['normal-close', 'shutdown', 'relaunch']);
});

test('Windows close script accepts only our numeric PID and posts normal WM_CLOSE without killing processes', () => {
  assert.throws(() => editorCloseScript(NaN)); assert.throws(() => editorCloseScript(-1));
  const script = editorCloseScript(12345);
  assert.match(script, /\$windowProcess -eq 12345/);
  assert.match(script, /GetWindow\(\$hwnd, 4\)/); // Skip owned/modal windows.
  assert.match(script, /PostMessage\(\$hwnd, 0x0010/);
  assert.doesNotMatch(script, /Stop-Process|taskkill|TerminateProcess|SendKeys|WM_QUIT|0x0012/i);
});

test('Windows ACP uses the bundled console supervisor with fixed argv and Electron Node mode', () => {
  const root = 'C:\\Users\\Test User\\Programs\\Ned';
  const executable = path.win32.join(root, 'Ned.exe'), agent = path.win32.join(root, 'resources/ned/agent.cjs');
  const descriptor = 'C:\\Users\\Test User\\AppData\\Roaming\\Ned\\runtime\\ned-agent.json';
  const launch = agentLaunch(executable, agent, descriptor, 'win32');
  assert.equal(launch.command, path.win32.join(root, 'resources/runtime/windows-x64/openviking/python/python.exe'));
  assert.deepEqual(launch.args, ['-I', '-B', path.win32.join(root, 'resources/runtime/windows-x64/openviking/sidecar-supervisor.py'), executable, agent, descriptor]);
  assert.equal(launch.env.ELECTRON_RUN_AS_NODE, '1');
  assert.throws(() => agentLaunch('relative.exe', agent, descriptor, 'win32'));
  assert.deepEqual(agentLaunch('/Ned', '/agent.cjs', '/descriptor.json', 'linux').args, ['/agent.cjs', '/descriptor.json']);
});
