import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { configSchema } from '../src/shared/contracts';
import { PythonVenvManager, parseRequirementsText, validatePackageSpec } from '../distribution/python-venv';
import { DataApps } from '../distribution/data-apps';
import { ProjectCheckpoints } from '../distribution/checkpoints';
import { WorktreeSandbox } from '../distribution/worktree-sandbox';
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

  const stopped = await apps.call('ses1', project, { operation: 'stop', id: started.id }) as { status: string };
  assert.equal(stopped.status, 'stopped');
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

  const check = await api.contractTest(project, { specPath: 'openapi.yaml', baseUrl: mock.url!, methods: ['GET'] });
  assert.equal(check.status, 'passed');
  assert.equal(check.passed, 1);
  assert.equal(explicitCalls, 0);

  const mutCheck = await api.contractTest(project, { specPath: 'openapi.yaml', baseUrl: mock.url!, methods: ['POST'] });
  assert.equal(mutCheck.status, 'passed');
  assert.equal(explicitCalls, 1);

  await api.mock('ses1', project, { operation: 'stop', id: mock.id });
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
