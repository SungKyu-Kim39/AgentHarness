import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ProjectFiles, inspectBatchRecovery, inspectIncompleteBatchJournals } from '../src/main/files';
import { Redactor } from '../src/main/config';
import { configSchema } from '../src/shared/contracts';
import { PythonVenvManager, parseRequirementsText, validatePackageSpec } from '../distribution/python-venv';
import { DataApps } from '../distribution/data-apps';
import { ProjectCheckpoints } from '../distribution/checkpoints';
import { WorktreeSandbox } from '../distribution/worktree-sandbox';
import { randomUUID } from 'node:crypto';
import { HostTools } from '../distribution/host-tools';
import { SpecWorkflow } from '../distribution/spec-workflow';
import { AstAuditTools } from '../distribution/ast-audit';
import { DocumentTools } from '../distribution/document-tools';
import { DiagramTools, buildDrawioXml, mermaidToDrawioSpec } from '../distribution/diagram-tools';
import { ApiTools } from '../distribution/api-tools';
import { OfflineSkills } from '../src/main/skills';
import { automaticSkillContext, hideUnrequestedTools, specializedToolRequested } from '../src/main/skill-routing';

async function makeTempWorkspace(t: { after(fn: () => Promise<void>): void }, prefix: string) {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));
  const root = path.join(dir, 'root');
  const project = path.join(dir, 'project');
  await mkdir(root, { recursive: true });
  await mkdir(project, { recursive: true });
  t.after(() => rm(dir, { recursive: true, force: true }));
  return { dir, root, project };
}

test('contracts.ts accepts optional intranet python PyPI config and rejects unsafe URLs', () => {
  const valid = configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'sk-test-token', id: 'qwen3' },
    python: {
      respectSystemPipConfig: true,
      indexUrl: 'http://pypi.internal.local/simple',
      extraIndexUrls: ['https://packages.company.local/simple'],
      trustedHosts: ['pypi.internal.local', 'packages.company.local:8443'],
      allowPackageInstall: true,
    },
  });
  assert.equal(valid.python?.indexUrl, 'http://pypi.internal.local/simple');
  assert.equal(valid.python?.respectSystemPipConfig, true);
  assert.deepEqual(valid.python?.trustedHosts, ['pypi.internal.local', 'packages.company.local:8443']);

  assert.throws(() => configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'sk-test-token', id: 'qwen3' },
    python: { indexUrl: 'http://user:pass@pypi.internal/simple' },
  }));
  assert.throws(() => configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'sk-test-token', id: 'qwen3' },
    python: { trustedHosts: ['bad host;rm -rf'] },
  }));
});

test('PythonVenvManager validates PEP 508 specs, creates .venv, runs scripts offline, and inspects package APIs', { skip: process.platform === 'win32' }, async t => {
  assert.equal(validatePackageSpec('numpy>=1.26.0,<3.0'), 'numpy>=1.26.0,<3.0');
  assert.equal(validatePackageSpec('marimo[sql]==0.10.0'), 'marimo[sql]==0.10.0');
  assert.throws(() => validatePackageSpec('https://evil.example/pkg.whl'));
  assert.throws(() => validatePackageSpec('git+https://github.com/org/repo.git'));
  assert.throws(() => validatePackageSpec('--index-url=http://evil'));
  assert.throws(() => parseRequirementsText('numpy\n-r secret.txt\n'));
  assert.deepEqual(parseRequirementsText('# comment\nnumpy>=1.26 # inline\npandas==2.2.0\n'), ['numpy>=1.26', 'pandas==2.2.0']);

  const { root, project } = await makeTempWorkspace(t, 'ned-venv-');
  const mgr = new PythonVenvManager(root, '', { approve: async () => true });
  t.after(() => mgr.close());

  const before = await mgr.manage('ses1', project, { operation: 'status' });
  assert.equal((before as any).venv.exists, false);

  await assert.rejects(mgr.manage('ses1', project, { operation: 'install', packages: ['numpy==1.26.4'] }), /HTTPS 미러/);
  const created = await mgr.manage('ses1', project, { operation: 'create' });
  assert.equal((created as any).status, 'ok');
  assert.equal((created as any).created, true);

  // Install a synthetic internal company package into .venv site-packages to test offline Context7 inspector
  const venvPath = (created as any).path as string;
  const pyBin = (created as any).python as string;
  const sitePkg = execFileSync(pyBin, ['-c', 'import sysconfig; print(sysconfig.get_paths()["purelib"])'], { encoding: 'utf8' }).trim();
  const pkgDir = path.join(sitePkg, 'corp_sdk');
  const distInfo = path.join(sitePkg, 'corp_sdk-2.4.1.dist-info');
  await mkdir(pkgDir, { recursive: true });
  await mkdir(distInfo, { recursive: true });
  await writeFile(path.join(distInfo, 'METADATA'), 'Metadata-Version: 2.1\nName: corp-sdk\nVersion: 2.4.1\nSummary: Internal telemetry SDK\n');
  await writeFile(path.join(distInfo, 'top_level.txt'), 'corp_sdk\n');
  await writeFile(
    path.join(pkgDir, '__init__.py'),
    '"""Corporate internal telemetry client."""\n\nclass TelemetryClient:\n    """Connects to intranet collector."""\n    def emit(self, metric: str, value: float, tags: dict[str, str] | None = None) -> bool:\n        """Emit a single metric point."""\n        return True\n',
  );

  const marker = path.join(project, 'startup-executed');
  await writeFile(path.join(sitePkg, 'ned-audit.pth'), `import pathlib; pathlib.Path(${JSON.stringify(marker)}).touch()\n`);
  const missingSymbol = await mgr.inspectPackageDocs(project, { package: 'corp-sdk', symbol: 'not_exported' });
  assert.deepEqual(missingSymbol.matches, []);
  await assert.rejects(readFile(marker), { code: 'ENOENT' });
  await rm(path.join(sitePkg, 'ned-audit.pth'));
  const docs = await mgr.inspectPackageDocs(project, { package: 'corp-sdk', symbol: 'TelemetryClient.emit' });
  assert.equal(docs.status, 'ok');
  assert.equal(docs.version, '2.4.1');
  assert.equal(docs.mode, 'static-ast');
  assert.ok(docs.matches.some((m: any) => m.name === 'emit' && m.signature.includes('metric: str')));

  await writeFile(path.join(project, 'hello.py'), 'import corp_sdk\nprint("SDK_OK", corp_sdk.TelemetryClient().emit("cpu", 0.5))\n');
  const ran = await mgr.manage('ses1', project, { operation: 'run', script: 'hello.py' });
  assert.equal((ran as any).exitCode, 0);
  assert.match((ran as any).output, /SDK_OK True/);
});

test('DataApps starts a loopback-only HTTP preview server and cleans it up cleanly', { skip: process.platform === 'win32' }, async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-dataapp-');
  await writeFile(path.join(project, 'index.html'), '<h1>Ned Local Dashboard</h1>');
  const apps = new DataApps(root, '', {
    approve: async () => true,
    resolvePython: async () => ({ kind: 'venv', prefix: project, python: 'python3' }),
  });
  t.after(() => apps.close());

  const started = await apps.call('ses1', project, { operation: 'start', framework: 'http', entry: '.' }) as { id: string; url: string; ready?: boolean; status: string };
  assert.equal(started.ready, true);
  assert.match(started.url, /^http:\/\/127\.0\.0\.1:\d+$/);
  const body = await new Promise<string>((resolve, reject) => {
    http.get(started.url + '/index.html', res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve(data));
    }).once('error', reject);
  });
  assert.match(body, /Ned Local Dashboard/);

  apps.cancel('ses1');
  await apps.stopped('ses1');
  await assert.rejects(fetch(started.url));
});

test('ProjectCheckpoints records shadow Git history without creating project .git and restores safely', { skip: process.platform === 'win32' }, async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-cp-');
  await writeFile(path.join(project, 'app.ts'), 'export const v = 1;\n');
  const cp = new ProjectCheckpoints(root, '');
  t.after(() => cp.close());

  const c1 = await cp.create(project, 'initial');
  assert.equal(c1.status, 'created');
  // Verify user's project has NO .git created
  assert.equal(await lstat(path.join(project, '.git')).then(() => true, () => false), false);

  await writeFile(path.join(project, 'app.ts'), 'export const v = 2;\n');
  await writeFile(path.join(project, 'extra.ts'), 'export const extra = true;\n');

  const diff = await cp.diff(project, c1.checkpointId);
  assert.equal(diff.changedCount, 2);

  let validated = 0;
  const restored = await cp.restore('ses1', project, c1.checkpointId, {
    approve: async () => true,
    validateEdit: async () => { validated++; },
  });
  assert.equal(restored.status, 'restored');
  assert.equal(validated, 4); // pre-approval + pre-apply for 2 files
  assert.equal(await readFile(path.join(project, 'app.ts'), 'utf8'), 'export const v = 1;\n');
  assert.equal(await lstat(path.join(project, 'extra.ts')).then(() => true, () => false), false);
});

test('WorktreeSandbox isolates parallel edits to the same file, diffs, applies safely, and discards', { skip: process.platform === 'win32' }, async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-wt-');
  execFileSync('git', ['init'], { cwd: project });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: project });
  execFileSync('git', ['config', 'user.email', 'test@example.local'], { cwd: project });
  await writeFile(path.join(project, 'core.ts'), 'export const mode = "base";\n');
  execFileSync('git', ['add', 'core.ts'], { cwd: project });
  execFileSync('git', ['commit', '-m', 'init'], { cwd: project });

  const sandbox = new WorktreeSandbox(root, '');
  t.after(() => sandbox.close());

  const wtA = await sandbox.create(project, 'option-A');
  const wtB = await sandbox.create(project, 'option-B');
  await writeFile(path.join(wtA.path, 'core.ts'), 'export const mode = "A";\n');
  await writeFile(path.join(wtB.path, 'core.ts'), 'export const mode = "B";\n');

  const diffA = await sandbox.diff(project, wtA.id);
  assert.equal(diffA.changedCount, 1);
  assert.match(diffA.diffPreview, /mode = "A"/);

  const applied = await sandbox.apply('ses1', project, wtA.id, { approve: async () => true });
  assert.equal(applied.status, 'applied');
  assert.equal(await readFile(path.join(project, 'core.ts'), 'utf8'), 'export const mode = "A";\n');

  await assert.rejects(sandbox.apply('ses1', project, wtB.id, { approve: async () => true }), /기준 커밋 이후/);
  assert.equal(await readFile(path.join(project, 'core.ts'), 'utf8'), 'export const mode = "A";\n');

  await sandbox.discard(project, wtA.id);
  await sandbox.discard(project, wtB.id);
  assert.equal((await sandbox.list(project)).worktrees.length, 0);
});

test('SpecWorkflow initializes specs/<feature>/, tracks REQ coverage, and verifies completion', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-spec-');
  const wf = new SpecWorkflow(root);
  const hooks = { approve: async () => true };

  const init = await wf.call('ses1', project, { operation: 'init', feature: 'offline-sync', title: 'Offline Sync', goal: 'Sync data safely' }, hooks);
  assert.equal(init.status, 'created');
  assert.equal((init as any).createdFiles.length, 3);

  const v1 = await wf.call('ses1', project, { operation: 'verify', feature: 'offline-sync' }, hooks);
  assert.equal(v1.status, 'incomplete');
  assert.equal((v1 as any).pendingTasksCount, 3);

  await writeFile(path.join(project, 'sync.ts'), 'export const ok = true;\n');
  await writeFile(
    path.join(project, 'specs/offline-sync/tasks.md'),
    '- [x] T01 (REQ-01) 구현 `sync.ts`\n- [x] T02 (REQ-02) 경계 처리 `sync.ts`\n',
  );
  const v2 = await wf.call('ses1', project, { operation: 'verify', feature: 'offline-sync' }, hooks);
  assert.equal(v2.status, 'verified');
  assert.equal((v2 as any).issues.length, 0);
});

test('AstAuditTools performs structural search/rewrite and catches security/secret/quality issues offline', { skip: process.platform === 'win32' }, async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-ast-');
  await writeFile(
    path.join(project, 'service.py'),
    [
      'import subprocess',
      'API_KEY = "sk_live_9876543210abcdef123456"',
      'DUMMY_KEY = "example_placeholder_123456"',
      'def run_cmd(cmd, items=[]):',
      '    try:',
      '        return subprocess.run(cmd, shell=True)',
      '    except:',
      '        return old_log("failed")',
    ].join('\n') + '\n',
  );

  const tools = new AstAuditTools(root, '');
  t.after(() => tools.close());

  const preview = await tools.astSearch('ses1', project, { language: 'python', pattern: 'old_log($MSG)', rewrite: 'new_logger($MSG)', apply: false }, { approve: async () => true });
  assert.equal(preview.matchCount, 1);
  assert.equal(preview.applied, false);

  const applied = await tools.astSearch('ses1', project, { language: 'python', pattern: 'old_log($MSG)', rewrite: 'new_logger($MSG)', apply: true }, { approve: async () => true });
  assert.equal(applied.status, 'applied');
  assert.match(await readFile(path.join(project, 'service.py'), 'utf8'), /new_logger\("failed"\)/);

  const audit = await tools.audit(project, { categories: ['security', 'secrets', 'quality'] });
  const rules = new Set(audit.findings.map((f: any) => f.rule));
  assert.ok(rules.has('SAST-SHELL-TRUE'));
  assert.ok(rules.has('SEC-HARDCODED-SECRET'));
  assert.ok(rules.has('PY-BARE-EXCEPT'));
  assert.ok(rules.has('PY-MUTABLE-DEFAULT'));
  // Placeholder secret must not trigger
  assert.equal(audit.findings.filter((f: any) => f.rule === 'SEC-HARDCODED-SECRET').length, 1);
});

test('DocumentTools creates and reads Korean HWPX documents and blocks macro formats', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-doc-');
  const stageNode = path.resolve('.cache/workspace-tools-stage/node');
  const hasKordoc = await lstat(path.join(stageNode, 'node_modules/kordoc/dist/index.js')).then(() => true, () => false);
  const docs = new DocumentTools(root, '', {
    approve: async () => true,
    ...(hasKordoc ? { nodeDir: stageNode } : {}),
  });
  t.after(() => docs.close());

  await assert.rejects(
    docs.write('ses1', project, { format: 'xlsx', outputPath: 'macro.xlsm', spec: {} }),
    /확장자는 \.xlsx/,
  );

  const written = await docs.write('ses1', project, {
    format: 'hwpx',
    outputPath: 'reports/weekly.hwpx',
    spec: { title: '주간 업무 보고', markdown: '# 주간 업무 보고\n\n- 사내 PyPI 연동 완료\n- 한글 문서 자동화 검증' },
  });
  assert.equal(written.status, 'written');
  assert.ok(written.bytes > 100);

  const readBack = await docs.readExtended(project, { path: 'reports/weekly.hwpx' });
  assert.equal(readBack.status, 'ok');
  assert.match(readBack.markdown, /주간 업무 보고/);
  assert.match(readBack.markdown, /사내 PyPI/);
});

test('DiagramTools generates valid editable .drawio XML from structured spec and Mermaid flowchart', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-diag-');
  const diag = new DiagramTools(root, '', { approve: async () => true });
  t.after(() => diag.close());

  const spec = mermaidToDrawioSpec('flowchart LR\n  A[사용자 요청] --> B[Ned 호스트]\n  B -.->|승인| C[사내 PyPI]');
  assert.equal(spec.direction, 'LR');
  assert.equal(spec.nodes.length, 3);
  assert.equal(spec.edges?.length, 2);

  const xml = buildDrawioXml({ ...spec, title: 'Ned <0.4.0> 구성도', groups: [{ id: 'g1', label: '호스트 경계' }] });
  assert.match(xml, /<mxfile host="Ned"/);
  assert.match(xml, /Ned &lt;0\.4\.0&gt; 구성도/);

  const res = await diag.generate('ses1', project, { format: 'drawio', outputPath: 'docs/arch.drawio', source: spec });
  assert.equal(res.status, 'written');
  const saved = await readFile(path.join(project, 'docs/arch.drawio'), 'utf8');
  assert.match(saved, /사용자 요청/);
  assert.match(saved, /사내 PyPI/);
  await assert.rejects(diag.generate('ses1', project, { format: 'drawio', outputPath: 'docs/arch.drawio', source: spec }), /이미 있습니다/);
  assert.equal(await readFile(path.join(project, 'docs/arch.drawio'), 'utf8'), saved);
});

test('ApiTools runs local OpenAPI mock server, verifies schema contracts, and gates mutating methods explicitly', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-api-');
  const specYaml = [
    'openapi: 3.0.3',
    'info:',
    '  title: Intranet Sample API',
    '  version: "1.0"',
    'paths:',
    '  /items/{id}:',
    '    get:',
    '      parameters:',
    '        - name: id',
    '          in: path',
    '          required: true',
    '          schema: { type: integer, example: 42 }',
    '      responses:',
    '        "200":',
    '          description: ok',
    '          content:',
    '            application/json:',
    '              schema:',
    '                type: object',
    '                required: [id, name]',
    '                properties:',
    '                  id: { type: integer, example: 42 }',
    '                  name: { type: string, example: "sensor-A" }',
    '    post:',
    '      responses:',
    '        "201":',
    '          description: created',
  ].join('\n');
  await writeFile(path.join(project, 'openapi.yaml'), specYaml);

  let explicitCalls = 0;
  const api = new ApiTools('', {
    approve: async () => true,
    approveExplicit: async () => { explicitCalls++; return true; },
  });
  t.after(() => api.close());

  const mock = await api.mock('ses1', project, { operation: 'start', specPath: 'openapi.yaml' });
  assert.equal(mock.status, 'running');

  const check = await api.contractTest('ses1', project, { specPath: 'openapi.yaml', baseUrl: mock.url!, methods: ['GET'] });
  assert.equal(check.status, 'passed');
  assert.equal(check.passed, 1);
  assert.equal(explicitCalls, 0);

  const mutCheck = await api.contractTest('ses1', project, { specPath: 'openapi.yaml', baseUrl: mock.url!, methods: ['POST'] });
  assert.equal(mutCheck.status, 'passed');
  assert.equal(explicitCalls, 1);

  await assert.rejects(api.contractTest('other', project, { specPath: 'openapi.yaml', baseUrl: mock.url! }), /현재 대화/);
  await assert.rejects(api.contractTest('ses1', project, { specPath: 'openapi.yaml', baseUrl: mock.url!, useSchemathesis: true }), /비활성화/);
  api.cancel('ses1');
  await api.stopped('ses1');
  await assert.rejects(fetch(mock.url!));
});

test('skill-routing automatically selects 0.4.0 skills and conditionally gates specialized 0.4.0 tools', async () => {
  const skills = new OfflineSkills(path.resolve('vendor/skills'));
  await skills.load();
  assert.equal(skills.catalog().length, 79);

  const pypiCtx = await automaticSkillContext(skills, [{ role: 'user', content: '사내 PyPI로 numpy 설치하고 패키지 API 문서 확인해줘' }]);
  assert.match(pypiCtx ?? '', /python-intranet-venv/);

  const hwpCtx = await automaticSkillContext(skills, [{ role: 'user', content: '주간보고 HWPX 양식 채우고 엑셀 보고서 만들어줘' }]);
  assert.match(hwpCtx ?? '', /korean-office-docs/);

  const diagCtx = await automaticSkillContext(skills, [{ role: 'user', content: '시스템 아키텍처 drawio 설계도 그려줘' }]);
  assert.match(diagCtx ?? '', /architecture-diagramming/);

  assert.equal(specializedToolRequested('ned_host_document_write', '함수 버그 고쳐줘'), false);
  assert.equal(specializedToolRequested('ned_host_document_write', '엑셀 보고서 생성해줘'), true);
  assert.equal(specializedToolRequested('ned_host_diagram_generate', '일반 리팩터링'), false);
  assert.equal(specializedToolRequested('ned_host_diagram_generate', 'Mermaid 다이어그램 그려줘'), true);
  assert.equal(specializedToolRequested('ned_host_api_mock_server', '일반 코드 수정'), false);
  assert.equal(specializedToolRequested('ned_host_api_mock_server', 'Swagger 명세로 Mock 서버 띄워줘'), true);

  const body = {
    messages: [{ role: 'user', content: '이 함수의 null 체크 버그를 고쳐줘' }],
    tools: [
      { function: { name: 'ned_host_patch_file' } },
      { function: { name: 'ned_host_document_write' } },
      { function: { name: 'ned_host_diagram_generate' } },
      { function: { name: 'ned_host_api_mock_server' } },
    ],
  };
  hideUnrequestedTools(body);
  assert.deepEqual(body.tools.map(t => t.function?.name), ['ned_host_patch_file']);
});

test('ProjectCheckpoints and WorktreeSandbox handle >160 KB files and roll back partial multi-file failures', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-rebuild2-tx-');

  const largeBefore = 'L'.repeat(210_000) + '\noriginal-tail\n';
  const largeAfter = 'M'.repeat(210_000) + '\nupdated-tail\n';
  await writeFile(path.join(project, 'a-large.txt'), largeBefore);
  await writeFile(path.join(project, 'b-second.txt'), 'second-v1\n');

  const cp = new ProjectCheckpoints(root, root);
  t.after(() => cp.close());
  const c1 = await cp.create(project, 'v1-large');
  assert.equal(c1.status, 'created');

  // Invalid checkpoint ID must fail before creating any bogus pre-restore commit.
  await assert.rejects(
    cp.restore('ses1', project, 'deadbeef', { approve: async () => true }),
    /찾지 못했습니다/,
  );
  assert.equal((await cp.list(project)).checkpoints.length, 1);

  await writeFile(path.join(project, 'a-large.txt'), largeAfter);
  await writeFile(path.join(project, 'b-second.txt'), 'second-v2\n');

  // Fail during apply of the second file -> first file must roll back to largeAfter.
  let applyValidateCalls = 0;
  await assert.rejects(
    cp.restore('ses1', project, c1.checkpointId, {
      approve: async () => true,
      validateEdit: async (_s, _p, proposal) => {
        applyValidateCalls++;
        // First 2 calls are pre-approval validation; 4th call is second file during applyBatch.
        if (applyValidateCalls === 4 && proposal.path === 'b-second.txt') {
          throw new Error('simulated mid-batch buffer conflict');
        }
      },
    }),
    /원래 상태로 복구했습니다/,
  );
  assert.equal(await readFile(path.join(project, 'a-large.txt'), 'utf8'), largeAfter);
  assert.equal(await readFile(path.join(project, 'b-second.txt'), 'utf8'), 'second-v2\n');

  // Clean restore of >160 KB file succeeds without stdout truncation.
  const restored = await cp.restore('ses1', project, c1.checkpointId, { approve: async () => true });
  assert.equal(restored.status, 'restored');
  assert.equal(await readFile(path.join(project, 'a-large.txt'), 'utf8'), largeBefore);
  assert.equal(await readFile(path.join(project, 'b-second.txt'), 'utf8'), 'second-v1\n');

  // WorktreeSandbox: >160 KB apply + rollback + stale directory discard.
  const gitEnv = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 't@local', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 't@local' };
  execFileSync('git', ['init'], { cwd: project, env: gitEnv });
  execFileSync('git', ['add', 'a-large.txt', 'b-second.txt'], { cwd: project, env: gitEnv });
  execFileSync('git', ['commit', '-m', 'init'], { cwd: project, env: gitEnv });

  const wt = new WorktreeSandbox(root, root);
  t.after(() => wt.close());
  const rec = await wt.create(project, 'large-exp');
  await writeFile(path.join(rec.path, 'a-large.txt'), largeAfter);
  await writeFile(path.join(rec.path, 'b-second.txt'), 'second-wt\n');

  let wtValidateCalls = 0;
  await assert.rejects(
    wt.apply('ses1', project, rec.id, {
      approve: async () => true,
      validateEdit: async (_s, _p, proposal) => {
        wtValidateCalls++;
        if (wtValidateCalls === 4 && proposal.path === 'b-second.txt') {
          throw new Error('simulated worktree apply failure');
        }
      },
    }),
    /원래 상태로 복구했습니다/,
  );
  assert.equal(await readFile(path.join(project, 'a-large.txt'), 'utf8'), largeBefore);

  const applied = await wt.apply('ses1', project, rec.id, { approve: async () => true });
  assert.equal(applied.status, 'applied');
  assert.equal(await readFile(path.join(project, 'a-large.txt'), 'utf8'), largeAfter);
  assert.equal(await readFile(path.join(project, 'b-second.txt'), 'utf8'), 'second-wt\n');

  // Manually deleting the worktree folder still lets discard() prune the stale index entry.
  await rm(rec.path, { recursive: true, force: true });
  const discarded = await wt.discard(project, rec.id);
  assert.equal(discarded.status, 'discarded');
  assert.equal((await wt.list(project)).worktrees.length, 0);
});

test('code_audit and document_read(docling) require approval for project Python, and api_contract_test detects missing Content-Type', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-rebuild2-gates-');

  await writeFile(path.join(project, 'sample.py'), 'x = 1\n');
  let venvResolved = 0;
  let approvePrompts = 0;
  const auditTool = new AstAuditTools(root, root, {
    approve: async () => { approvePrompts++; return false; },
    resolveVenvPython: async () => {
      venvResolved++;
      return { kind: 'venv', prefix: path.join(project, '.venv'), python: 'python3' };
    },
  });
  t.after(() => auditTool.close());

  // Default read-only code_audit must NOT touch project .venv Python.
  const defaultReport = await auditTool.audit(project, {});
  assert.equal(defaultReport.status, 'ok');
  assert.equal(defaultReport.ruffUsed, false);
  assert.equal(venvResolved, 0);
  assert.equal(approvePrompts, 0);

  // Explicit venv-ruff requires host approval.
  await assert.rejects(auditTool.audit(project, { categories: ['venv-ruff'] }), /취소/);
  assert.equal(approvePrompts, 1);

  // document_read(mode: "docling") requires host approval before invoking project Python.
  await writeFile(path.join(project, 'doc.pdf'), '%PDF-1.4\n');
  let docApprove = 0;
  const docs = new DocumentTools(root, root, {
    approve: async () => { docApprove++; return false; },
    resolveVenvPython: async () => ({ kind: 'venv', prefix: path.join(project, '.venv'), python: 'python3' }),
  });
  t.after(() => docs.close());
  await assert.rejects(docs.readExtended(project, { path: 'doc.pdf', mode: 'docling' }), /취소/);
  assert.equal(docApprove, 1);

  // Missing Content-Type header must NOT be forged as application/json by requestJSON.
  const { createServer } = await import('node:http');
  const rawServer = createServer((req, res) => {
    if (req.url === '/items/1-a') {
      res.writeHead(200); // intentionally omit Content-Type
      res.end('{"id": 1}');
      return;
    }
    res.writeHead(404).end();
  });
  await new Promise<void>(resolve => rawServer.listen(0, '127.0.0.1', resolve));
  t.after(() => { rawServer.closeAllConnections(); rawServer.close(); });
  const port = (rawServer.address() as any).port;

  await writeFile(path.join(project, 'multi.yaml'), [
    'openapi: 3.0.3',
    'info:',
    '  title: Multi',
    '  version: 1.0.0',
    'paths:',
    '  /items/{id}-{sub}:',
    '    get:',
    '      parameters:',
    '        - name: id',
    '          in: path',
    '          example: 1',
    '        - name: sub',
    '          in: path',
    '          example: a',
    '      responses:',
    '        "200":',
    '          description: ok',
    '          content:',
    '            application/json:',
    '              schema:',
    '                type: object',
    '                required: [id]',
    '                properties:',
    '                  id: { type: integer }',
  ].join('\n'));
  const api = new ApiTools(root, { approve: async () => true, approveExplicit: async () => true });
  t.after(() => api.close());
  const ct = await api.contractTest('ses1', project, { specPath: 'multi.yaml', baseUrl: `http://127.0.0.1:${port}`, methods: ['GET'] });
  assert.equal(ct.status, 'failed');
  assert.match(ct.results[0].errors.join(';'), /Expected JSON response Content-Type/);

  // agent-config.example.json must match pythonConfigSchema safe defaults.
  const { configSchema } = await import('../src/shared/contracts');
  const example = configSchema.parse(JSON.parse(await readFile(path.resolve('agent-config.example.json'), 'utf8')));
  assert.equal(example.python?.allowPackageInstall, false);
  assert.equal(example.python?.respectSystemPipConfig, false);
});


test('batch rollback preserves a concurrent edit made after Ned applied the first file', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-rollback-conflict-');
  const firstPath = path.join(project, 'first.txt');
  const secondPath = path.join(project, 'second.txt');
  await writeFile(firstPath, 'first original');
  await writeFile(secondPath, 'second original');
  const files = new ProjectFiles(project);
  const first = await files.propose('batch', 'first.txt', 'Ned first');
  const second = await files.propose('batch', 'second.txt', 'Ned second');
  const journalDir = path.join(root, 'batch-journals');
  await assert.rejects(files.applyBatch([first, second], {
    journal: { dir: journalDir, operation: 'unit_test_batch', session: 'ses1', batchId: 'b-fail' },
    validate: async proposal => {
      if (proposal.path !== second.path) return;
      await writeFile(firstPath, 'new user changes');
      throw new Error('fixture second file conflict');
    },
  }), /일부 파일 복구에 실패했습니다/);
  assert.equal(await readFile(firstPath, 'utf8'), 'new user changes');
  assert.equal(await readFile(secondPath, 'utf8'), 'second original');

  const { inspectIncompleteBatchJournals } = await import('../src/main/files');
  const incomplete = await inspectIncompleteBatchJournals(journalDir);
  assert.equal(incomplete.length, 1);
  assert.equal(incomplete[0].id, 'b-fail');
  assert.equal(incomplete[0].status, 'rollback_failed');
  assert.equal(incomplete[0].entries[0].applied, true);
  assert.equal(incomplete[0].entries[0].reverted, undefined);
  const rawJournal = await readFile(path.join(journalDir, 'b-fail.json'), 'utf8');
  assert.ok(!rawJournal.includes('Ned first'), 'journal must not duplicate raw file content');
});

test('DataApps static HTTP preview enforces symlink/dotfile boundaries without requiring Python', { skip: process.platform === 'win32' }, async t => {
  const { dir, root, project } = await makeTempWorkspace(t, 'ned-static-http-');
  const { symlink } = await import('node:fs/promises');
  const outsideFile = path.join(dir, 'outside-secret.txt');
  await writeFile(outsideFile, 'OUTSIDE_SECRET_DATA');
  await writeFile(path.join(project, 'index.html'), '<h1>Safe Index</h1>');
  await mkdir(path.join(project, 'page'));
  await writeFile(path.join(project, 'page/index.html'), '<link rel="stylesheet" href="./style.css">');
  await writeFile(path.join(project, 'page/style.css'), 'body {}');
  await writeFile(path.join(project, '.env'), 'API_KEY=supersecret');
  await mkdir(path.join(project, '.git'), { recursive: true });
  await writeFile(path.join(project, '.git/config'), '[core]\n');
  await mkdir(path.join(project, '.ned'), { recursive: true });
  await writeFile(path.join(project, '.ned/private.txt'), 'private');
  await symlink(outsideFile, path.join(project, 'escape.txt'));

  let pythonResolved = 0;
  let approvals = 0;
  let openApproval!: (allowed: boolean) => void;
  let approvalEntered!: () => void;
  const pending = new Promise<boolean>(resolve => { openApproval = resolve; });
  const entered = new Promise<void>(resolve => { approvalEntered = resolve; });
  const apps = new DataApps(root, '', {
    approve: async () => {
      if (++approvals === 2) { approvalEntered(); return pending; }
      return true;
    },
    resolvePython: async () => { pythonResolved++; throw new Error('Python should not be required for static http'); },
  });
  t.after(() => apps.close());

  const started = await apps.call('ses1', project, { operation: 'start', framework: 'http', entry: '.' }) as { id: string; url: string; ready?: boolean };
  assert.equal(started.ready, true);
  assert.equal(pythonResolved, 0);

  const okIndex = await fetch(started.url + '/');
  assert.equal(okIndex.status, 200);
  assert.equal(okIndex.headers.get('x-content-type-options'), 'nosniff');
  assert.match(await okIndex.text(), /Safe Index/);

  const directory = await fetch(started.url + '/page?from=preview');
  assert.equal(new URL(directory.url).pathname, '/page/');
  assert.equal(new URL(directory.url).search, '?from=preview');
  assert.equal((await fetch(new URL('./style.css', directory.url))).status, 200);
  const running = apps.call('ses2', project, { operation: 'start', framework: 'http', entry: '.' });
  await entered;
  try {
    await assert.rejects(apps.call('ses3', project, { operation: 'start', framework: 'http', entry: '.' }), /최대 2개/);
  } finally {
    openApproval(true);
  }
  const second = await running as { id: string };
  await apps.call('ses2', project, { operation: 'stop', id: second.id });

  const headRes = await fetch(started.url + '/index.html', { method: 'HEAD' });
  assert.equal(headRes.status, 200);

  const postRes = await fetch(started.url + '/index.html', { method: 'POST' });
  assert.equal(postRes.status, 405);

  for (const blockedPath of ['/escape.txt', '/.env', '/.git/config', '/.ned/private.txt']) {
    const res = await fetch(started.url + blockedPath);
    assert.equal(res.status, 403, `expected 403 for ${blockedPath}, got ${res.status}`);
  }
  for (const rawPath of ['/../outside-secret.txt', '/%2e%2e/outside-secret.txt']) {
    const status = await new Promise<number>((resolve, reject) => {
      const u = new URL(started.url);
      http.get({ hostname: u.hostname, port: Number(u.port), path: rawPath }, res => {
        res.resume();
        resolve(res.statusCode ?? 0);
      }).once('error', reject);
    });
    assert.equal(status, 403, `expected 403 for raw ${rawPath}, got ${status}`);
  }

  await apps.call('ses1', project, { operation: 'stop', id: started.id });
  await assert.rejects(fetch(started.url + '/'));
});

test('NativeRuntime surfaces incomplete batch journals on startup and ast_search skips checkpoint when approval is denied', { skip: process.platform === 'win32' }, async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-batch-startup-');
  const resources = path.join(root, 'resources');
  await mkdir(resources, { recursive: true });
  await mkdir(path.join(root, 'batch-journals'), { recursive: true });
  await writeFile(path.join(root, 'batch-journals', 'crash-batch.json'), JSON.stringify({
    schemaVersion: 1,
    id: 'crash-batch',
    operation: 'project_checkpoint_restore',
    project,
    session: 'ses1',
    startedAt: '2026-11-25T00:00:00.000Z',
    updatedAt: '2026-11-25T00:00:01.000Z',
    status: 'in_progress',
    entries: [{ path: 'a.txt', operation: 'write', snapshotId: 'snap-1', baseHash: 'file:abc', applied: true }],
  }));

  const { NativeRuntime } = await import('../distribution/native-control');
  const runtime = new NativeRuntime(root, resources, {
    isEncryptionAvailable: () => true,
    encryptString: Buffer.from,
    decryptString: bytes => bytes.toString(),
  }, async () => false);
  t.after(() => runtime.close());

  await runtime.initialize(configSchema.parse({ model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'k', id: 'm' } }));
  assert.equal(runtime.status().incompleteBatches, 1);
  const recovery = JSON.parse(await readFile(path.join(root, 'batch-recovery-status.json'), 'utf8'));
  assert.equal(recovery.incompleteCount, 1);
  assert.equal(recovery.batches[0].id, 'crash-batch');
  assert.equal(recovery.batches[0].entries[0].state, 'unavailable');

  // Verify ast_search(apply: true) does NOT call beforeApply when user denies approval.
  await writeFile(path.join(project, 'demo.py'), 'old_call(1)\n');
  let beforeApplyCalls = 0;
  const astTools = new AstAuditTools(root, '');
  t.after(() => astTools.close());
  await assert.rejects(
    astTools.astSearch('ses1', project, { language: 'python', pattern: 'old_call($X)', rewrite: 'new_call($X)', apply: true }, {
      approve: async () => false,
      beforeApply: async () => { beforeApplyCalls++; },
    }),
    /취소/,
  );
  assert.equal(beforeApplyCalls, 0);
});


test('interrupted batch recovery uses file hashes even before the applied flag and preserves later user edits', async t => {
  const { root, project } = await makeTempWorkspace(t, 'ned-batch-recovery-');
  const canonical = await realpath(project);
  const files = new ProjectFiles(canonical);
  const journalDir = path.join(root, 'batch-journals');
  const snapshotDir = path.join(root, 'snapshots');
  const batchId = randomUUID();
  const target = path.join(canonical, 'sample.txt');
  await mkdir(journalDir);
  await mkdir(path.join(snapshotDir, 'ses1'), { recursive: true });
  await writeFile(target, 'before');
  const proposal = await files.propose('fixture', 'sample.txt', 'after');
  await writeFile(path.join(snapshotDir, 'ses1', proposal.id + '.json'), JSON.stringify(proposal));
  // The release can recover both new journals with result hashes and older ones with only a snapshot.
  await writeFile(path.join(journalDir, batchId + '.json'), JSON.stringify({
    schemaVersion: 1, id: batchId, operation: 'ast_search', project: canonical, session: 'ses1',
    startedAt: new Date().toISOString(), status: 'in_progress',
    entries: [{ path: proposal.path, operation: 'write', snapshotId: proposal.id, baseHash: proposal.baseHash, applied: false }],
  }));
  await files.apply(proposal);
  const [batch] = await inspectIncompleteBatchJournals(journalDir, canonical);
  assert.equal((await inspectBatchRecovery(batch, files, snapshotDir))[0].state, 'applied');
  let approval = false;
  const host = new HostTools(root, '', {
    project: async () => canonical, approve: async () => approval,
    redactor: new Redactor(), knowledge: () => undefined,
  });
  t.after(() => host.close());
  const recover = () => host.call('project_checkpoint', { operation: 'recover_batch', batchId }, 'ses1');
  await writeFile(target, 'user edit');
  assert.equal(JSON.parse(await recover()).status, 'blocked');
  assert.equal(await readFile(target, 'utf8'), 'user edit');
  await writeFile(target, 'after');
  await assert.rejects(recover(), /복구를 취소/);
  approval = true;
  assert.equal(JSON.parse(await recover()).restoredFiles, 1);
  assert.equal(await readFile(target, 'utf8'), 'before');
  assert.deepEqual(await inspectIncompleteBatchJournals(journalDir, canonical), []);
});
