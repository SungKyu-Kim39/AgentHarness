/** Explicit build-PC integration suite. Runs the real pinned servers/binaries.
 * No employee PC installation is performed. See docs/mcp-integration-plan.md.
 */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { McpExtensions } from '../src/main/mcp-extensions';
import type { McpToolResult } from '../src/main/mcp-client';
const root = process.cwd(), exec = promisify(execFile);
const phase = process.argv[2] ?? 'all';
assert.ok(['all', 'files', 'semantic', 'browser'].includes(phase));
const temporary = await mkdtemp(path.join(tmpdir(), 'lvm-'));
const project = path.join(temporary, 'project'); await mkdir(project);
const outside = path.join(temporary, 'secret.h'); await writeFile(outside, 'int OUTSIDE_SECRET_FUNCTION() { return 77; }\n');
await writeFile(path.join(project, 'sum.h'), 'int sum(int a, int b);\n');
await writeFile(path.join(project, 'sum.cpp'), '#include "sum.h"\nint sum(int a, int b) { return a+b; }\n#ifdef EXPLICIT_BUILD_VALUE\nint configured_symbol() { return EXPLICIT_BUILD_VALUE; }\n#endif\n');
await writeFile(path.join(project, 'main.cpp'), '#include "sum.h"\nint main() { return sum(1, 2); }\n');
await writeFile(path.join(project, 'outside.cpp'), `#include "${outside}"\n`);
await writeFile(path.join(project, 'compile_commands.json'), JSON.stringify(['sum.cpp', 'main.cpp', 'outside.cpp'].map(file => ({ directory: project, file, arguments: ['clang++', '-D', 'EXPLICIT_BUILD_VALUE=9', '-I', project, '-std=c++20', '-fplugin=/untrusted-plugin', '-c', file] }))));
await mkdir(path.join(project, '.SeReNa')); await writeFile(path.join(project, '.SeReNa/project.local.yml'), 'agent_interface: REPL\nactivation_command: /untrusted-activation\n');
await writeFile(path.join(project, '.clangd'), 'CompileFlags:\n  Add: [-fplugin=/untrusted-plugin]\n');
await writeFile(path.join(project, 'data.csv'), 'name,value\na,2\nb,3\n');
await writeFile(path.join(project, 'note.md'), '# 오프라인 문서\n\n실제 변환 확인.\n');
await mkdir(path.join(project, 'vendor')); await writeFile(path.join(project, 'vendor/tracked.txt'), 'tracked dependency fixture');
await exec(path.join(root, '.cache/mcp-linux/markitdown/bin/python'), ['-I', '-c', `
import sys,zipfile
from pathlib import Path
from openpyxl import Workbook
from pptx import Presentation
p=Path(sys.argv[1])
w=Workbook();w.active.append(['OFFICE_FIXTURE',42]);w.save(p/'sample.xlsx')
r=Presentation();s=r.slides.add_slide(r.slide_layouts[0]);s.shapes.title.text='OFFICE_FIXTURE';r.save(p/'sample.pptx')
with zipfile.ZipFile(p/'sample.docx','w') as z:
 z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
 z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
 z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>OFFICE_FIXTURE</w:t></w:r></w:p></w:body></w:document>')
objects=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
stream=b'BT /F1 14 Tf 20 260 Td (OFFICE_FIXTURE) Tj ET';objects.append(b'<< /Length '+str(len(stream)).encode()+b' >>\\nstream\\n'+stream+b'\\nendstream')
data=b'%PDF-1.4\\n';offsets=[]
for i,o in enumerate(objects,1): offsets.append(len(data));data+=str(i).encode()+b' 0 obj\\n'+o+b'\\nendobj\\n'
xref=len(data);data+=b'xref\\n0 6\\n0000000000 65535 f \\n'+b''.join(('%010d 00000 n \\n'%n).encode() for n in offsets)+b'trailer\\n<< /Size 6 /Root 1 0 R >>\\nstartxref\\n'+str(xref).encode()+b'\\n%%EOF\\n';(p/'sample.pdf').write_bytes(data)
`, project]);
await exec(path.join(root, '.cache/mcp-linux/duckdb/bin/python'), ['-I', '-c', 'import duckdb,sys;from pathlib import Path;p=Path(sys.argv[1]);c=duckdb.connect(str(p/"sample.duckdb"));c.execute("CREATE TABLE values_table AS SELECT 5 AS value");c.execute("COPY values_table TO ? (FORMAT PARQUET)",[str(p/"sample.parquet")]);c.close()', project]);
await exec('/usr/bin/git', ['init', project]);
await exec('/usr/bin/git', ['-C', project, 'add', '.']);
await exec('/usr/bin/git', ['-C', project, '-c', 'user.name=Integration Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'fixture']);
await exec('/usr/bin/git', ['-C', project, 'config', 'core.fsmonitor', '/untrusted-fsmonitor']);
await writeFile(path.join(project, 'note.md'), '# 변경된 오프라인 문서\n\n실제 변환 확인.\n');
const versions = await readdir(path.join(root, '.cache/mcp-linux/serena/lib'));
const version = versions.find(v => v.startsWith('python'))!;
let diagnostics = '';
const manager = new McpExtensions(path.join(temporary, 'state'), root, {
  approve: async () => true, diagnostic: text => { diagnostics = (diagnostics + text).slice(-2 * 1024 * 1024); },
  paths: {
    python: service => path.join(root, '.cache/mcp-linux', ['playwright', 'devtools'].includes(service) ? 'git' : service, 'bin/python'),
    site: service => path.join(root, '.cache/mcp-linux', service, 'lib', version, 'site-packages'),
    git: '/usr/bin/git', clangd: path.join(root, '.cache/mcp-linux/clangd/clangd_23.1.0/bin/clangd'),
    browser: '/usr/lib/chromium/chromium', node: path.join(root, '.cache/mcp-node/node_modules'),
    pythonWorker: path.join(root, 'scripts/mcp-python-worker.py'), nodeWorker: path.join(root, 'scripts/mcp-node-worker.cjs'),
    supervisor: path.join(root, 'scripts/sidecar-supervisor.py'), testNoSandbox: true,
  },
});
const text = (result: McpToolResult) => result.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
async function call(name: string, args: unknown, expected?: RegExp) {
  diagnostics = ''; const result = await manager.call(name, args, project);
  if (result.isError) throw new Error(text(result));
  if (expected) assert.match(text(result), expected);
  console.log('PASS', name, JSON.stringify(args).slice(0, 130)); return result;
}
let hits = 0, rejectedHits = 0, mutations = 0;
const forbidden = createServer((_req, res) => { rejectedHits++; res.end('forbidden'); });
await new Promise<void>(r => forbidden.listen(0, '127.0.0.1', r));
const forbiddenPort = (forbidden.address() as {port: number}).port;
const page = createServer((req, res) => {
  hits++; res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!['GET', 'HEAD'].includes(req.method ?? '')) mutations++;
  res.end(`<html><title>Offline fixture</title><h1>Ned 로컬 검증</h1><button>계속</button><script>console.error('LOCAL_CONSOLE_FIXTURE');fetch('http://127.0.0.1:${forbiddenPort}/secret').catch(()=>{});fetch('/mutation',{method:'POST'}).catch(()=>{});</script></html>`);
});
await new Promise<void>(r => page.listen(0, '127.0.0.1', r));
const pagePort = (page.address() as {port: number}).port;
try {
  if (phase === 'all' || phase === 'files') {
  const gitStatus = await call('git_inspect', { operation: 'status' }, /note.md/);
  assert.doesNotMatch(text(gitStatus), /deleted:.*(?:vendor|\.SeReNa|\.clangd)/);
  await call('git_inspect', { operation: 'diff' }, /변경된/);
  await call('git_inspect', { operation: 'log' }, /fixture/);
  await call('git_inspect', { operation: 'show' }, /fixture/);
  assert.match(await readFile(path.join(project, '.git/config'), 'utf8'), /untrusted-fsmonitor/);
  await call('document_read', { path: 'note.md' }, /오프라인/);
  for (const ext of ['docx', 'pptx', 'xlsx', 'pdf']) await call('document_read', { path: 'sample.' + ext }, /OFFICE\\?_FIXTURE/);
  await call('data_query', { paths: ['data.csv'], sql: 'SELECT sum(value) AS total FROM input_0' }, /5/);
  await call('data_query', { paths: ['sample.parquet'], sql: 'SELECT value FROM input_0' }, /5/);
  const beforeDB = await readFile(path.join(project, 'sample.duckdb'));
  await call('data_query', { paths: ['sample.duckdb'], sql: 'SELECT value FROM values_table' }, /5/);
  assert.deepEqual(await readFile(path.join(project, 'sample.duckdb')), beforeDB);
  for (const sql of ['CREATE TABLE escaped(i INT)', 'SELECT 1; SELECT 2', `SELECT * FROM read_blob('${outside}')`, 'SELECT * FROM read_csv_auto(\'https://example.invalid/x\')', "SET enable_external_access=true"]) {
    const result = await manager.call('data_query', { paths: ['data.csv'], sql }, project);
    assert.equal(result.isError, true, sql); console.log('PASS denied SQL:', sql.slice(0, 85));
  }
  await assert.rejects(() => manager.call('document_read', { path: '../secret.h' }, project));
  }
  if (phase === 'all' || phase === 'semantic') {
  const overview = await call('semantic_symbols', { operation: 'overview', path: 'sum.cpp' }, /sum/);
  assert.match(text(overview), /configured_symbol/); assert.match(text(overview), /compileDatabaseProvided.*true/);
  await call('semantic_symbols', { operation: 'definition', path: 'sum.cpp', symbol: 'sum' }, /return a\+b/);
  await call('semantic_symbols', { operation: 'references', path: 'sum.cpp', symbol: 'sum' }, /main/);
  const bounded = await call('semantic_symbols', { operation: 'overview', path: 'outside.cpp' });
  assert.doesNotMatch(text(bounded), /OUTSIDE_SECRET_FUNCTION/);
  }
  if (phase === 'all' || phase === 'browser') {
  for (const backend of ['playwright', 'devtools']) {
    const result = await call('browser_check', { url: `http://127.0.0.1:${pagePort}/`, backend, screenshot: true, performance: backend === 'devtools' }, /Ned 로컬 검증/);
    assert.match(text(result), /LOCAL_CONSOLE_FIXTURE/);
    assert.ok(result.content.some(c => c.type === 'image' && c.data && c.data.length > 100));
    if (backend === 'devtools') assert.match(text(result), /trace|LCP/i);
  }
  assert.ok(hits > 0); assert.equal(rejectedHits, 0); assert.equal(mutations, 0);
  const before = hits;
  const denied = new McpExtensions(path.join(temporary, 'denied'), root, { approve: async () => false, paths: manager.options.paths });
  await assert.rejects(() => denied.call('browser_check', { url: `http://127.0.0.1:${pagePort}/`, backend: 'playwright' }, project), /취소/);
  await denied.close(); assert.equal(hits, before);
  const reserved = new McpExtensions(path.join(temporary, 'reserved'), root, { approve: async () => true, paths: manager.options.paths, reservedPorts: () => [pagePort] });
  await assert.rejects(() => reserved.call('browser_check', { url: `http://127.0.0.1:${pagePort}/`, backend: 'devtools' }, project), /개발 페이지/);
  await reserved.close(); assert.equal(hits, before);
  }
  console.log('PASS real MCP integration phase:', phase);
} catch (error) {
  await writeFile(path.join(root, '.cache/mcp-live-last.log'), diagnostics);
  console.error(diagnostics.slice(-3000)); throw error;
} finally {
  await manager.close(); page.closeAllConnections(); forbidden.closeAllConnections(); page.close(); forbidden.close();
  const processes = await exec('/usr/bin/ps', ['-eo', 'args=']);
  assert.ok(!processes.stdout.split('\n').some(line => line.includes(temporary)), 'MCP/browser child process remained after confirmed stop');
  await rm(temporary, { recursive: true, force: true });
}
