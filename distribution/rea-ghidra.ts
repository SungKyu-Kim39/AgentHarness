import { createHash } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { PrivateMcpClient } from '../src/main/mcp-client';
import releaseLock from '../release-runtime-lock.json';

const operations = {
  functions: 'list_procedures', decompile: 'procedure_pseudo_code', assembly: 'procedure_assembly',
  callers: 'procedure_callers', callees: 'procedure_callees', references: 'procedure_references', info: 'procedure_info',
} as const;
type Input = { path: string; operation: keyof typeof operations; procedure?: string };
type Launch = { rea: string; ghidra: string; java: string; guard: string; worker: string; executable?: string; diagnostic?: (text: string) => void };
type Session = { key: string; client: PrivateMcpClient; work: string };
export class ReaGhidra {
  private sessions = new Map<string, Session>();
  private busy = false;
  private stopped = false;
  private uncertain = false;
  private verified?: Promise<string>;
  private abort = new AbortController();
  constructor(private root: string, private resources: string,
    private approve: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>, private launch?: Launch) {}
  async verifiedRuntime(): Promise<string> {
    const runtime = path.join(this.resources, 'runtime/windows-x64');
    if (this.launch) return runtime;
    const current = this.verified ??= (async () => {
      if (path.relative(runtime, await realpath(runtime))) throw new Error('REA/Ghidra 런타임 링크는 허용하지 않습니다.');
      for (const name of ['rea', 'ghidra']) {
        const base = path.join(runtime, name);
        const info = await lstat(base);
        if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('REA/Ghidra 런타임 폴더가 올바르지 않습니다.');
        const record = await lstat(path.join(base, 'manifest.json'));
        if (!record.isFile() || record.isSymbolicLink()) throw new Error('REA/Ghidra manifest 파일이 올바르지 않습니다.');
        const bytes = await readFile(path.join(base, 'manifest.json'));
        const expected = (releaseLock.components as Record<string, { manifestSha256: string }>)[name]?.manifestSha256;
        if (!expected || createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('REA/Ghidra 고정 manifest가 일치하지 않습니다.');
        const manifest = JSON.parse(bytes.toString()), expectedFiles = new Set(['manifest.json', ...manifest.files.map((f: { path: string }) => f.path)]);
        const walk = async (folder = '') => {
          for (const entry of await readdir(path.join(base, folder), { withFileTypes: true })) {
            const relative = folder ? folder + '/' + entry.name : entry.name;
            if (entry.isSymbolicLink()) throw new Error('REA/Ghidra 런타임 링크는 허용하지 않습니다.');
            if (entry.isDirectory()) await walk(relative);
            else if (!entry.isFile() || !expectedFiles.has(relative)) throw new Error('REA/Ghidra manifest 외 파일은 허용하지 않습니다.');
          }
        };
        await walk();
        for (const item of manifest.files) {
          if (typeof item.path !== 'string' || path.isAbsolute(item.path) || item.path.includes('\\') || item.path.split('/').some((part: string) => !part || part === '.' || part === '..')) throw new Error('REA/Ghidra manifest 경로 오류');
          const file = path.join(base, item.path), info = await lstat(file);
          if (!info.isFile() || info.isSymbolicLink() || createHash('sha256').update(await readFile(file)).digest('hex') !== item.sha256) throw new Error('REA/Ghidra 번들 무결성 확인 실패');
        }
      }
      return runtime;
    })();
    try { return await current; }
    catch (error) { if (this.verified === current) this.verified = undefined; throw error; }
  }
  async call(session: string, project: string, input: Input, signal?: AbortSignal) {
    signal = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    if (this.busy || this.stopped || this.uncertain) throw new Error('Ghidra 분석이 실행 중이거나 이전 실행의 종료를 확인하지 못했습니다.');
    if (input.operation !== 'functions' && !input.procedure) throw new Error('먼저 functions 결과에서 함수명 또는 주소를 확인하고 procedure를 지정하세요.');
    this.busy = true;
    try {
      signal?.throwIfAborted(); const runtime = await this.verifiedRuntime();
      const source = await new ProjectFiles(project).resolve(input.path), info = await lstat(source);
      if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024 * 1024) throw new Error('64 MiB 이하의 프로젝트 바이너리만 분석할 수 있습니다.');
      const bytes = await readFile(source); if (bytes.length > 64 * 1024 * 1024) throw new Error('바이너리 크기가 변경되었습니다.');
      const hash = createHash('sha256').update(bytes).digest('hex'), key = JSON.stringify([project, input.path, hash]);
      let current = this.sessions.get(session);
      if (current?.key !== key) {
        if (current) { await this.dispose(current); this.sessions.delete(session); }
        if (this.sessions.size >= 2) {
          const [id, oldest] = this.sessions.entries().next().value!;
          await this.dispose(oldest); this.sessions.delete(id);
        }
        if (!await this.approve('REA Ghidra 정적 분석 승인', `대화: ${session}\n프로젝트: ${project}\n대상: ${input.path}\nSHA-256: ${hash}\n번들 Ghidra 12.1.4와 Java 21로 복사본을 분석합니다. 바이너리는 실행하지 않습니다. 분석 캐시는 Ned의 임시 폴더에만 생성하며 외부 네트워크는 Java 가드로 차단합니다. 원본·프로젝트 파일은 변경하지 않습니다.`, signal)) throw new Error('Ghidra 분석이 거절되었습니다.');
        signal?.throwIfAborted();
        if (this.stopped) throw new Error('Ned 종료 중에는 Ghidra 분석을 시작할 수 없습니다.');
        if (createHash('sha256').update(await readFile(source)).digest('hex') !== hash) throw new Error('승인 후 바이너리가 변경되었습니다. 다시 분석을 요청하세요.');
        signal?.throwIfAborted();
        await mkdir(path.join(this.root, 'ghidra-analysis'), { recursive: true, mode: 0o700 });
        const work = await mkdtemp(path.join(this.root, 'ghidra-analysis/session-'));
        const target = path.join(work, 'target.bin'); await writeFile(target, bytes, { mode: 0o600 });
        const base = path.join(this.resources, 'runtime/windows-x64');
        const launch = this.launch ?? { rea: path.join(runtime, 'rea/scripts/rea.mjs'), ghidra: path.join(runtime, 'ghidra/ghidra'), java: path.join(runtime, 'ghidra/jdk'), guard: path.join(runtime, 'ghidra/network-guard.jar'), worker: path.join(this.resources, 'ned/rea-ghidra-worker.mjs') };
        const env: NodeJS.ProcessEnv = {
          HOME: work, USERPROFILE: work, APPDATA: work, LOCALAPPDATA: work, XDG_CONFIG_HOME: work, XDG_CACHE_HOME: work,
          TEMP: work, TMP: work, TMPDIR: work, ELECTRON_RUN_AS_NODE: '1', DO_NOT_TRACK: '1',
          REA_ANALYSIS_PROVIDER: 'ghidra', GHIDRA_INSTALL_DIR: launch.ghidra, JAVA_HOME: launch.java,
          JAVA_TOOL_OPTIONS: '"-Xbootclasspath/a:' + launch.guard + '" -Djava.security.manager=NedOfflineNetworkGuard',
          PATH: path.join(launch.java, 'bin') + path.delimiter + (process.platform === 'win32' ? path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32') : '/usr/bin:/bin'),
        };
        for (const k of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'ComSpec']) if (process.env[k]) env[k] = process.env[k];
        const node = launch.executable ?? process.execPath;
        const executable = process.platform === 'win32' ? path.join(base, 'openviking/python/python.exe') : node;
        const args = process.platform === 'win32' ? ['-I', '-B', path.join(base, 'openviking/sidecar-supervisor.py'), node, launch.worker, launch.rea, launch.guard] : [launch.worker, launch.rea, launch.guard];
        current = { key, work, client: new PrivateMcpClient({ executable, args, cwd: work, env, allowedTools: ['open_binary', 'close_binary', ...Object.values(operations)], timeout: 300000, diagnostic: launch.diagnostic }) };
        this.sessions.set(session, current);
        const opened = await current.client.call('open_binary', { path: target, provider_id: 'ghidra' }, signal);
        if (opened.isError) { await this.dispose(current); this.sessions.delete(session); return JSON.stringify({ source: 'morluto/rea', provider: 'ghidra', isError: true, result: opened }); }
      }
      const tool = operations[input.operation];
      const result = await current!.client.call(tool, input.operation === 'functions' ? {} : { procedure: input.procedure }, signal);
      return JSON.stringify({ source: 'morluto/rea', provider: 'ghidra', targetSha256: hash, tool, targetExecuted: false, result });
    } catch (error) {
      const current = this.sessions.get(session);
      if (current && (signal?.aborted || !current.client.available)) { this.sessions.delete(session); await this.dispose(current); }
      throw error;
    } finally { this.busy = false; }
  }
  private async dispose(current: Session) {
    try { await current.client.close(); }
    catch (error) { this.uncertain = true; throw error; }
    await rm(current.work, { recursive: true, force: true, maxRetries: 4, retryDelay: 50 });
  }
  async cancel(session: string) {
    const current = this.sessions.get(session);
    if (!current) return;
    this.sessions.delete(session);
    await this.dispose(current);
  }
  async close() { this.stopped = true; this.abort.abort(); for (const id of [...this.sessions.keys()]) await this.cancel(id); }
}
