import path from 'node:path';
import { mkdir, mkdtemp, lstat, readFile, writeFile, readdir, rm, open, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { ProjectFiles } from './files';
import { PrivateMcpClient, type McpToolResult } from './mcp-client';
import { BrowserProxy } from './browser-proxy';
import runtimeLock from '../../mcp-runtime-lock.json';

export interface ExtensionTool { name: string; description: string; inputSchema: Record<string, unknown> }
const str = { type: 'string' };
const obj = (properties: Record<string, unknown>, required: string[]) => ({ type: 'object', properties, required, additionalProperties: false });
export const extensionTools: ExtensionTool[] = [
  { name: 'semantic_symbols', description: 'Actual read-only Serena + pinned clangd C/C++ overview, definition or references, in a controlled project snapshot. Reports compile/SDK limitations. On failure explicitly label text-search fallback.', inputSchema: obj({ operation: { type: 'string', enum: ['overview', 'definition', 'references'] }, path: str, symbol: str }, ['operation', 'path']) },
  { name: 'git_inspect', description: 'Actual Git MCP status, diff, log or show in a sanitized repository snapshot. No commit, checkout, hooks, network or repository changes.', inputSchema: obj({ operation: { type: 'string', enum: ['status', 'diff', 'staged', 'log', 'show'] }, revision: str }, ['operation']) },
  { name: 'document_read', description: 'Actual MarkItDown MCP converts a selected local PDF, DOCX, PPTX, XLSX, XLS, CSV or text file to Markdown. No URL, cloud, OCR, macros or document editing.', inputSchema: obj({ path: str }, ['path']) },
  { name: 'data_query', description: 'Actual DuckDB Local MCP: one SELECT over copied CSV/TSV/Parquet inputs (views input_0, input_1, ...) or one local .duckdb database. No HTTP, extensions, external files, SQL settings or writes. Up to 200 rows.', inputSchema: obj({ paths: { type: 'array', items: str, minItems: 1, maxItems: 8 }, sql: str }, ['paths', 'sql']) },
  { name: 'browser_check', description: 'Actual Playwright or Chrome DevTools MCP checks one local HTTP development page after native approval. Returns accessibility snapshot and console errors; optional screenshot and DevTools performance trace with reload. Isolated browser, one origin, GET/HEAD only; no clicks, JavaScript tools, uploads, internet or personal profiles.', inputSchema: obj({ url: str, backend: { type: 'string', enum: ['playwright', 'devtools'] }, screenshot: { type: 'boolean' }, performance: { type: 'boolean' } }, ['url', 'backend']) },
];
const relative = z.string().min(1).max(4096);
export interface ExtensionPaths { python: (service: string) => string; site: (service: string) => string; git: string; clangd: string; browser: string; node: string; pythonWorker: string; nodeWorker: string; supervisor: string; testNoSandbox?: boolean }
export class McpExtensions {
  private clients = new Set<PrivateMcpClient>();
  private stopping = new Set<Promise<void>>();
  private stopped = false; private uncertain = false;
  private verified?: Promise<void>;
  constructor(readonly root: string, readonly resources: string, readonly options: { approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>; reservedPorts?(): number[]; paths?: ExtensionPaths; diagnostic?(text: string): void }) {}
  private paths(): ExtensionPaths {
    if (this.options.paths) return this.options.paths;
    const base = path.join(this.resources, 'runtime/windows-x64/mcp');
    return { python: () => path.join(base, 'python/python.exe'), site: service => path.join(base, 'site', service), git: path.join(base, 'git/cmd/git.exe'), clangd: path.join(base, 'clangd/clangd_23.1.0/bin/clangd.exe'), browser: path.join(base, 'browser/chrome-win64/chrome.exe'), node: path.join(base, 'node'), pythonWorker: path.join(base, 'mcp-python-worker.py'), nodeWorker: path.join(base, 'mcp-node-worker.cjs'), supervisor: path.join(this.resources, 'runtime/windows-x64/openviking/sidecar-supervisor.py') };
  }
  private verify() {
    if (this.options.paths) return Promise.resolve(); // Build-PC integration fixture only.
    return this.verified ??= (async () => {
      const base = path.join(this.resources, 'runtime/windows-x64/mcp');
      const bytes = await readFile(path.join(base, 'manifest.json'));
      if (createHash('sha256').update(bytes).digest('hex') !== runtimeLock.manifestSha256) throw new Error('MCP 번들 manifest가 고정된 빌드와 다릅니다.');
      const manifest = JSON.parse(bytes.toString());
      if (!manifest.complete) throw new Error('MCP 런타임 번들이 완성되지 않았습니다.');
      const expected = new Set<string>(['manifest.json', ...manifest.files.map((f: { path: string }) => f.path)]);
      const visit = async (folder = '') => {
        for (const entry of await readdir(path.join(base, folder), { withFileTypes: true })) {
          const relative = folder ? folder + '/' + entry.name : entry.name;
          if (entry.isSymbolicLink()) throw new Error('MCP 런타임 링크는 허용하지 않습니다.');
          if (entry.isDirectory()) await visit(relative);
          else if (!entry.isFile() || !expected.has(relative)) throw new Error('고정 manifest에 없는 MCP 런타임 파일입니다.');
        }
      };
      await visit();
      for (const item of manifest.files) {
        if (typeof item.path !== 'string' || item.path.includes('\\') || item.path.split('/').some((p: string) => !p || p === '..' || p === '.') || path.isAbsolute(item.path)) throw new Error('MCP manifest 경로 오류');
        const file = path.join(base, item.path); const stat = await lstat(file);
        if (!stat.isFile() || stat.isSymbolicLink() || createHash('sha256').update(await readFile(file)).digest('hex') !== item.sha256) throw new Error('MCP 런타임 무결성 검사 실패');
      }
    })();
  }
  private async copy(source: string, target: string, budget: { bytes: number }, max = 64 * 1024 * 1024) {
    if (!(await lstat(source)).isFile()) throw new Error('MCP 입력은 일반 파일이어야 합니다.');
    const file = await open(source, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > max || budget.bytes + stat.size > 256 * 1024 * 1024) throw new Error('MCP 복사 입력 크기 제한을 초과했습니다.');
      const limit = Math.min(max, 256 * 1024 * 1024 - budget.bytes); const chunks: Buffer[] = []; let bytes = 0;
      while (true) {
        const chunk = Buffer.alloc(Math.min(64 * 1024, limit - bytes + 1));
        const result = await file.read(chunk); if (!result.bytesRead) break;
        bytes += result.bytesRead; if (bytes > limit) throw new Error('MCP 복사 도중 입력 크기 제한을 초과했습니다.');
        chunks.push(chunk.subarray(0, result.bytesRead));
      }
      const data = Buffer.concat(chunks);
      budget.bytes += data.length; await mkdir(path.dirname(target), { recursive: true, mode: 0o700 }); await writeFile(target, data, { mode: 0o600 });
    } finally { await file.close(); }
  }
  private async snapshot(project: string, work: string, git = false, budget = { bytes: 0 }) {
    const files = new ProjectFiles(project); const source = path.join(work, 'source');
    await mkdir(source, { recursive: true, mode: 0o700 });
    for (const relative of await files.list()) {
      if (!git && (relative.split('/').some(p => ['.serena', '.clangd', '.cache', '.vscode', '.idea'].includes(p.toLowerCase())) || /(^|\/)(opencode\.jsonc?|\.mcp\.json|compile_flags\.txt)$/i.test(relative))) continue;
      const original = await files.resolve(relative); const stat = await lstat(original);
      if (stat.isFile() && stat.size <= 2 * 1024 * 1024) await this.copy(original, path.join(source, relative), budget, 2 * 1024 * 1024);
    }
    if (git) {
      const metadata = await files.resolve('.git');
      if (!(await lstat(metadata)).isDirectory()) throw new Error('프로젝트 안의 일반 .git 디렉터리가 필요합니다. 외부 worktree는 지원하지 않습니다.');
      let count = 0;
      const visit = async (relative: string, depth: number) => {
        if (depth > 12) throw new Error('Git 메타데이터 깊이 제한 초과');
        const resolved = await files.resolve('.git/' + relative); const stat = await lstat(resolved);
        if (stat.isDirectory()) for (const entry of await readdir(resolved)) await visit(relative + '/' + entry, depth + 1);
        else {
          if (++count > 20000 || /(^|\/)(alternates|http-alternates|commondir|gitdir|config|hooks)$/.test(relative)) throw new Error('외부 Git 저장소 연결 또는 비정상 메타데이터는 허용하지 않습니다.');
          await this.copy(resolved, path.join(source, '.git', relative), budget);
        }
      };
      for (const relative of ['HEAD', 'index', 'objects', 'refs', 'packed-refs', 'shallow']) {
        if (await access(path.join(metadata, relative)).then(() => true, () => false)) await visit(relative, 0);
      }
      await writeFile(path.join(source, '.git/config'), '[core]\nrepositoryformatversion = 0\nbare = false\nfilemode = false\nhooksPath = /dev/null\n');
    }
    return source;
  }
  async call(name: string, args: unknown, project: string, signal?: AbortSignal): Promise<McpToolResult> {
    if (this.stopped || this.uncertain || this.stopping.size || [...this.clients].some(c => c.stopping)) throw new Error('MCP 종료가 확인되지 않았거나 앱이 중지되었습니다. 새 실행을 차단합니다.');
    signal?.throwIfAborted();
    await this.verify(); signal?.throwIfAborted();
    const base = path.join(this.root, 'mcp-work'); await mkdir(base, { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(base, 'run-')); const paths = this.paths(); const files = new ProjectFiles(project);
    let client: PrivateMcpClient | undefined; let proxy: BrowserProxy | undefined;
    const abort = () => {
      if (!client) return;
      const stop = client.close(); this.stopping.add(stop);
      void stop.catch(() => { this.uncertain = true; }).finally(() => this.stopping.delete(stop));
    };
    try {
      let service: string; let tool: string; let parameters: Record<string, unknown>; let note = ''; let screenshot = false; let performance = false;
      const gitBudget = { bytes: 0 };
      let extra: Record<string, unknown> = {};
      if (name === 'git_inspect') {
        const a = z.object({ operation: z.enum(['status', 'diff', 'staged', 'log', 'show']), revision: z.string().regex(/^[a-zA-Z0-9_./~^{}@+-]{1,128}$/).refine(s => !s.startsWith('-')).optional() }).strict().parse(args);
        const source = await this.snapshot(project, work, true, gitBudget); service = 'git';
        tool = { status: 'git_status', diff: 'git_diff_unstaged', staged: 'git_diff_staged', log: 'git_log', show: 'git_show' }[a.operation];
        parameters = { repo_path: source, ...(a.operation === 'show' ? { revision: a.revision ?? 'HEAD' } : {}), ...(a.operation === 'log' ? { max_count: 20 } : {}) };
        note = 'Sanitized repository snapshot; original repository and config untouched. Tracked files are copied from the index (up to 20,000 files, 64 MiB/file, 256 MiB total). Untracked discovery is limited to the host file list (4,000 files, 2 MiB/file; dependency/build folders excluded).';
      } else if (name === 'semantic_symbols') {
        const a = z.object({ operation: z.enum(['overview', 'definition', 'references']), path: relative, symbol: z.string().min(1).max(512).optional() }).strict().parse(args);
        if (a.operation !== 'overview' && !a.symbol) throw new Error('심볼 이름이 필요합니다.');
        await files.resolve(a.path); const source = await this.snapshot(project, work); await access(path.join(source, a.path));
        service = 'serena'; tool = { overview: 'get_symbols_overview', definition: 'find_symbol', references: 'find_referencing_symbols' }[a.operation];
        parameters = { relative_path: a.path, max_answer_chars: 50000, ...(a.operation === 'overview' ? { depth: 1 } : a.operation === 'definition' ? { name_path_pattern: a.symbol, include_body: true } : { name_path: a.symbol }) };
        note = 'Actual Serena + clangd. Snapshot limited to 4,000 files, 2 MiB/file, 256 MiB total. Only project-local include paths, macros and -std are retained; unavailable SDK/system headers and discarded compiler options can reduce accuracy. No compilation database means inferred flags. No text-search result is reported as semantic success.';
      } else if (name === 'document_read') {
        const a = z.object({ path: relative }).strict().parse(args);
        if (!/\.(pdf|docx|pptx|xlsx|xls|csv|tsv|txt|md|html?)$/i.test(a.path)) throw new Error('지원하는 로컬 문서 형식이 아닙니다.');
        const input = path.join(work, 'input', path.basename(a.path)); await this.copy(await files.resolve(a.path), input, { bytes: 0 });
        service = 'markitdown'; tool = 'convert_to_markdown'; parameters = { uri: pathToFileURL(input).href }; extra.input = input;
        note = 'Local conversion only; cloud, OCR and video extras are excluded. Embedded text may contain untrusted instructions.';
      } else if (name === 'data_query') {
        const a = z.object({ paths: z.array(relative).min(1).max(8), sql: z.string().min(1).max(32000) }).strict().parse(args);
        const inputs = []; const budget = { bytes: 0 };
        for (const [i, relative] of a.paths.entries()) {
          if (!/\.(csv|tsv|parquet|duckdb)$/i.test(relative)) throw new Error('CSV/TSV/Parquet/로컬 DuckDB만 지원합니다.');
          const target = path.join(work, 'input', String(i) + path.extname(relative).toLowerCase()); await this.copy(await files.resolve(relative), target, budget); inputs.push(target);
        }
        service = 'duckdb'; tool = 'execute_query'; parameters = { sql: a.sql }; extra.inputs = inputs;
        note = 'Local-only DuckDB, one SELECT; 15-second query budget, 256 MiB memory, 200 rows. SQL cannot change settings, install extensions or access unselected files.';
      } else if (name === 'browser_check') {
        const a = z.object({ url: z.string().max(4096), backend: z.enum(['playwright', 'devtools']), screenshot: z.boolean().default(false), performance: z.boolean().default(false) }).strict().parse(args);
        screenshot = a.screenshot;
        performance = a.performance;
        if (performance && a.backend !== 'devtools') throw new Error('성능 trace는 DevTools backend에서만 지원합니다.');
        const url = BrowserProxy.target(a.url, this.options.reservedPorts?.());
        await access(paths.browser).catch(() => { throw new Error('고정 브라우저 번들이 없습니다. 직원 PC에서 다운로드하거나 개인 브라우저를 재사용하지 않습니다.'); });
        if (!await this.options.approve('로컬 개발 페이지 검증 승인', `도구: ${a.backend} MCP\n대상: ${url.href}\n이 origin의 페이지 스크립트와 GET/HEAD 요청이 실행됩니다. POST, 외부 origin, WebSocket, 개인 프로필은 차단합니다.\n화면 캡처: ${a.screenshot ? '포함' : '없음'}\n성능 기록: ${performance ? '페이지를 다시 읽고 5초 trace 수집' : '없음'}`, signal)) throw new Error('브라우저 검증을 취소했습니다.');
        signal?.throwIfAborted(); if (this.stopped) throw new Error('앱이 중지되었습니다.');
        proxy = new BrowserProxy(url); await proxy.start(); service = a.backend;
        extra = { browser: paths.browser, proxy: proxy.url, origin: url.origin, node: paths.node, testNoSandbox: paths.testNoSandbox === true };
        tool = service === 'playwright' ? 'browser_navigate' : 'navigate_page';
        parameters = service === 'playwright' ? { url: url.href } : { type: 'url', url: url.href, timeout: 15000 };
        note = `Local development page only (${url.origin}); isolated browser; no interaction or JavaScript execution tools exposed.`;
      } else throw new Error('등록되지 않은 확장 도구입니다.');
      signal?.throwIfAborted(); if (this.stopped) throw new Error('앱이 중지되었습니다.');
      const config = path.join(work, 'worker.json');
      await writeFile(config, JSON.stringify({ service, work, site: paths.site(service), project, git: paths.git, clangd: paths.clangd, trace: !!this.options.paths, ...extra }), { mode: 0o600 });
      const node = ['playwright', 'devtools'].includes(service);
      const executable = node ? process.execPath : paths.python(service);
      const argv = node ? [paths.nodeWorker, config] : ['-I', '-B', paths.pythonWorker, config];
      const binary = process.platform === 'win32' ? paths.python(service) : executable;
      const launchArgs = process.platform === 'win32' ? ['-I', '-B', paths.supervisor, executable, ...argv] : argv;
      const env: NodeJS.ProcessEnv = { HOME: work, USERPROFILE: work, APPDATA: work, LOCALAPPDATA: work, PATH: path.dirname(paths.git), TEMP: work, TMP: work, ELECTRON_RUN_AS_NODE: '1', PYTHONDONTWRITEBYTECODE: '1', DO_NOT_TRACK: '1' };
      for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR']) if (process.env[key]) env[key] = process.env[key];
      const allowedTools = service === 'playwright' ? ['browser_navigate', 'browser_snapshot', 'browser_console_messages', 'browser_take_screenshot', 'browser_close'] : service === 'devtools' ? ['navigate_page', 'take_snapshot', 'list_console_messages', 'take_screenshot', 'performance_start_trace', 'close_page'] : service === 'git' ? [tool, 'ned_snapshot_tracked_paths'] : [tool];
      client = new PrivateMcpClient({ executable: binary, args: launchArgs, cwd: work, env, allowedTools, timeout: 90000, diagnostic: this.options.diagnostic });
      this.clients.add(client); signal?.addEventListener('abort', abort, { once: true }); signal?.throwIfAborted();
      if (service === 'git') {
        const index = await client.call('ned_snapshot_tracked_paths', {}, signal);
        if (index.isError) throw new Error('Git index의 읽기 범위를 확인하지 못했습니다.');
        const tracked = z.array(relative).max(20000).parse(JSON.parse(index.content.filter(c => c.type === 'text').map(c => c.text).join('')));
        for (const relative of tracked) {
          signal?.throwIfAborted();
          if (relative.split('/').some(p => p.toLowerCase() === '.git')) throw new Error('Git index가 내부 관리 경로를 가리킵니다.');
          const original = await files.resolve(relative).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return undefined; throw error; });
          const target = path.join(work, 'source', relative);
          if (original && !await access(target).then(() => true, () => false)) await this.copy(original, target, gitBudget);
        }
      }
      const result = await client.call(tool, parameters, signal);
      if (service === 'serena') {
        const context = await readFile(path.join(work, 'analysis-context.json'), 'utf8').catch(() => '{}');
        result.content.unshift({ type: 'text', text: 'Compilation context: ' + context });
      }
      if (node && !result.isError) {
        const append = (next: McpToolResult) => { result.content.push(...next.content); if (next.isError) result.isError = true; };
        if (performance) {
          const trace = await client.call('performance_start_trace', { reload: true, autoStop: true, ignoreCache: false }, signal);
          append(trace);
        }
        append(await client.call(service === 'playwright' ? 'browser_snapshot' : 'take_snapshot', {}, signal));
        append(await client.call(service === 'playwright' ? 'browser_console_messages' : 'list_console_messages', service === 'playwright' ? { level: 'error' } : { types: ['error', 'warn'], pageSize: 30 }, signal));
        if (screenshot)
          append(await client.call(service === 'playwright' ? 'browser_take_screenshot' : 'take_screenshot', service === 'playwright' ? { type: 'png', fullPage: false } : { format: 'png' }, signal));
        note += ` Blocked proxy requests: ${proxy!.blocked}.`;
      }
      result.content.unshift({ type: 'text', text: `Source: ${service} MCP\n${note}\n` });
      return result;
    } finally {
      signal?.removeEventListener('abort', abort);
      try { await client?.close(); } catch (error) { this.uncertain = true; throw error; }
      finally { if (client) this.clients.delete(client); await proxy?.close(); if (!this.uncertain) await rm(work, { recursive: true, force: true }); }
    }
  }
  async close() {
    this.stopped = true;
    const results = await Promise.allSettled([...this.clients].map(client => client.close()));
    if (results.some(r => r.status === 'rejected')) { this.uncertain = true; throw new Error('MCP 자식 프로세스 중지를 확인하지 못했습니다.'); }
  }
}
