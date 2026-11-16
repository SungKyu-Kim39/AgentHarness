import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
const execute = promisify(execFile), python = process.env.NED_TEST_CURRENT_PYTHON ?? path.resolve('.cache/openviking/env-linux/bin/python3');
test('Python worker uses the selected interpreter and project imports; metacharacter arguments remain data and failures propagate', { skip: !existsSync(python), timeout: 30000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-python-worker-')), project = path.join(root, 'project with spaces'); await mkdir(project);
  t.after(() => rm(root, { recursive: true, force: true }));
  const prefix = (await execute(python, ['-I', '-B', '-c', 'import sys; print(sys.prefix)'])).stdout.trim();
  const source = path.join(project, 'main.py'), request = path.join(root, 'request.json');
  await writeFile(path.join(project, 'helper.py'), 'value = 11\n');
  await writeFile(source, 'import json,sys,helper\nprint(json.dumps(dict(value=helper.value,args=sys.argv[1:],prefix=sys.prefix)))\nraise SystemExit(7)\n');
  const data = { prefix, project, action: 'run', script: source, scriptSha256: createHash('sha256').update(await readFile(source)).digest('hex'), args: ['literal & command', '%PATH%', '한국어', '-c', 'not Python code'] };
  await writeFile(request, JSON.stringify(data));
  const worker = process.env.NED_TEST_PYTHON_RUNNER ?? path.resolve('distribution/python-runner.py');
  const env = { ...process.env, CONDA_PREFIX: prefix, PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8', PYTHONNOUSERSITE: '1' };
  await assert.rejects(execute(python, ['-I', '-B', worker, request], { env }), (error: any) => {
    assert.equal(error.code, 7); const result = JSON.parse(error.stdout); assert.equal(result.value, 11); assert.equal(result.prefix, prefix); assert.deepEqual(result.args, data.args); return true;
  });
  await writeFile(source, 'raise AssertionError("must not execute changed source")\n');
  await assert.rejects(execute(python, ['-I', '-B', worker, request], { env }), (error: any) => /NED_PYTHON_SOURCE_CHANGED/.test(error.stderr));
  await assert.rejects(execute(python, ['-I', '-B', worker, request], { env: { ...env, CONDA_PREFIX: root } }), (error: any) => /NED_PYTHON_ENVIRONMENT_MISMATCH/.test(error.stderr));
});
