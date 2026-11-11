import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { OpenVikingService, type VikingLaunch } from '../src/main/openviking';
import { configSchema } from '../src/shared/contracts';

const config = configSchema.parse({ schemaVersion: 2,
  model: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'synthetic-llm-private-key', id: 'llm-test' },
  openViking: { enabled: true, embedding: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'synthetic-embedding-private-key', id: 'embed-test', dimension: 4 } },
});

for (const scenario of ['bundle', 'spawn', 'python'] as const) {
  test(`OpenViking startup identifies ${scenario} failure without persisting raw diagnostics or credentials`, async t => {
    const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-startup-'));
    const data = path.join(root, 'data'); await mkdir(data);
    let service: OpenVikingService | undefined;
    t.after(async () => { await service?.close(); await rm(root, { recursive: true, force: true }); });
    let launch: VikingLaunch | undefined;
    if (scenario !== 'bundle') {
      const launcher = path.join(root, 'probe.py');
      await writeFile(launcher, "import sys\nsys.stderr.write('ModuleNotFoundError: No module named missing_module\\nBearer synthetic-llm-private-key\\nsynthetic-embedding-private-key\\nPRIVATE_DOCUMENT_TEXT\\n')\nsys.exit(23)\n");
      const executable = scenario === 'spawn' ? path.join(root, 'missing-python.exe') : execFileSync('python3', ['-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' }).trim();
      launch = { executable, launcher, cwd: root };
    }
    service = new OpenVikingService(path.join(root, 'runtime'), data, () => {}, launch);
    await service.configure(config);
    assert.equal(service.state().status, 'error');
    const text = await readFile(path.join(data, 'openviking/startup-status.json'), 'utf8');
    const record = JSON.parse(text);
    assert.equal(record.schemaVersion, 1);
    assert.equal(record.status, 'error');
    assert.equal(record.stopConfirmed, true);
    if (scenario === 'bundle') {
      assert.equal(record.code, 'OV_BUNDLE'); assert.equal(record.stage, 'bundle'); assert.equal(record.osError, 'ENOENT');
    } else if (scenario === 'spawn') {
      assert.equal(record.code, 'OV_PROCESS_START'); assert.equal(record.stage, 'process'); assert.equal(record.osError, 'ENOENT');
    } else {
      assert.equal(record.code, 'OV_PROCESS_EXIT'); assert.equal(record.stage, 'process');
      assert.equal(record.exitCode, 23); assert.equal(record.exitHex, '0x00000017'); assert.equal(record.hint, 'python_module');
    }
    const output = text + JSON.stringify(service.state());
    for (const secret of ['synthetic-llm-private-key', 'synthetic-embedding-private-key', 'PRIVATE_DOCUMENT_TEXT', 'missing_module'])
      assert.ok(!output.includes(secret));
    assert.match(service.state().message!, new RegExp(record.code));
    assert.deepEqual(await readdir(path.join(data, 'openviking')), ['startup-status.json']);
  });
}
