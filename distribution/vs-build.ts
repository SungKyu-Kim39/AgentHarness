import path from 'node:path';
import { access, readFile, readdir } from 'node:fs/promises';
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { ProjectFiles } from '../src/main/files';
const execute = promisify(execFile);
type Toolchain = { name: string; version: string; installation: string; msbuild: string };
type Target = { path: string; configurations: Array<{ configuration: string; platform: string }>; toolsets: string[]; sdkVersions: string[] };
const exists = (p: string) => access(p).then(() => true, () => false);
const sha = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
const safeName = (s: string) => /^[a-zA-Z0-9_. +()-]{1,100}$/.test(s);
function configurations(text: string, solution: boolean) {
  const values = solution
    ? [...(text.match(/GlobalSection\(SolutionConfigurationPlatforms\)[\s\S]*?EndGlobalSection/)?.[0] ?? '').matchAll(/^\s*([^=\r\n]+?)\s*=/gm)].map(m => m[1].trim())
    : [...text.matchAll(/<ProjectConfiguration\s+Include=["']([^"']+)["']/g)].map(m => m[1]);
  return [...new Set(values)].map(value => {
    const parts = value.split('|'); return { configuration: parts[0], platform: parts[1] };
  }).filter(p => p.platform && safeName(p.configuration) && safeName(p.platform));
}
export class VisualStudioBuild {
  private active = false;
  private unconfirmed = false;
  private children = new Set<ChildProcess>();
  constructor(private resources: string, private approve: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>,
    private discover: () => Promise<Toolchain[]> = VisualStudioBuild.discover) {}
  static async discover(): Promise<Toolchain[]> {
    if (process.platform !== 'win32') return [];
    const base = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)';
    const vswhere = path.join(base, 'Microsoft Visual Studio/Installer/vswhere.exe');
    if (!await exists(vswhere)) return [];
    const result = await execute(vswhere, ['-all', '-products', '*', '-version', '[15.0,17.0)', '-requires', 'Microsoft.Component.MSBuild', '-format', 'json', '-utf8'], { windowsHide: true, timeout: 15000, maxBuffer: 1024 * 1024 });
    const list: Toolchain[] = [];
    for (const instance of JSON.parse(result.stdout)) {
      if (typeof instance.installationPath !== 'string' || !path.isAbsolute(instance.installationPath)) continue;
      for (const relative of ['MSBuild/Current/Bin/amd64/MSBuild.exe', 'MSBuild/Current/Bin/MSBuild.exe', 'MSBuild/15.0/Bin/amd64/MSBuild.exe', 'MSBuild/15.0/Bin/MSBuild.exe']) {
        const msbuild = path.join(instance.installationPath, relative);
        if (await exists(msbuild)) { list.push({ name: instance.displayName ?? 'Visual Studio', version: String(instance.installationVersion), installation: instance.installationPath, msbuild }); break; }
      }
    }
    return list;
  }
  async inspect(project: string) {
    const files = new ProjectFiles(project), listed = await files.list(), targets: Target[] = [];
    for (const filename of listed.filter(f => /\.(sln|vcxproj)$/i.test(f)).slice(0, 100)) {
      const text = await files.read(filename);
      const configs = configurations(text, /\.sln$/i.test(filename));
      const toolsets = [...new Set([...text.matchAll(/<PlatformToolset>([^<]+)<\/PlatformToolset>/g)].map(m => m[1]))];
      const sdkVersions = [...new Set([...text.matchAll(/<WindowsTargetPlatformVersion>([^<]+)<\/WindowsTargetPlatformVersion>/g)].map(m => m[1]))];
      targets.push({ path: filename, configurations: configs, toolsets, sdkVersions });
    }
    return { toolchains: await this.discover(), targets, limitation: 'Installed Visual Studio 2017/2019 MSBuild only. Missing C++ workloads, SDKs or third-party libraries are reported by the build. No restore, download or automatic retarget.' };
  }
  private async inputs(project: string) {
    const files = new ProjectFiles(project), map: Record<string, string> = {};
    for (const name of (await files.list()).filter(p => /\.(sln|vcxproj|props|targets|csproj)$/i.test(p))) {
      const text = await files.read(name); map[name] = sha(text);
      // Outside-root solution/project references require selecting a broader root first.
      const refs = /\.sln$/i.test(name) ? [...text.matchAll(/^Project\([^\r\n]+?=\s*"[^"]*",\s*"([^"]+)"/gm)].map(m => m[1])
        : [...text.matchAll(/<ProjectReference\s+Include=["']([^"']+)["']/g)].map(m => m[1]);
      for (const ref of refs) {
        if (ref.includes('$') || ref.includes('%') || /[\x00-\x1f]/.test(ref)) throw new Error('프로젝트 참조 경로를 정적으로 확인할 수 없습니다.');
        const resolved = path.resolve(project, path.dirname(name), ref.replaceAll('\\', '/'));
        const relative = path.relative(project, resolved);
        if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('프로젝트 참조가 선택한 폴더 밖에 있습니다. 상위 공통 폴더를 프로젝트로 선택하세요.');
      }
    }
    return JSON.stringify(map);
  }
  async build(project: string, input: { target: string; configuration: string; platform: string; toolchain: number }, signal?: AbortSignal) {
    if (this.active || this.unconfirmed) throw new Error('이전 빌드가 실행 중이거나 종료가 확인되지 않았습니다.');
    this.active = true;
    try {
      signal?.throwIfAborted();
      const report = await this.inspect(project), tool = report.toolchains[input.toolchain], target = report.targets.find(t => t.path === input.target);
      if (!tool || !target || !target.configurations.some(c => c.configuration === input.configuration && c.platform === input.platform)) throw new Error('먼저 inspect_build로 확인한 도구와 구성만 빌드할 수 있습니다.');
      const executable = tool.msbuild, args = [path.join(project, target.path), '/t:Build', '/p:Configuration=' + input.configuration, '/p:Platform=' + input.platform, '/m', '/nr:false', '/p:UseSharedCompilation=false', '/nologo', '/verbosity:minimal'];
      const env: NodeJS.ProcessEnv = {};
      for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'ProgramFiles', 'ProgramFiles(x86)', 'ProgramW6432', 'COMSPEC'])
        if (process.env[key]) env[key] = process.env[key];
      env.PATH = path.dirname(executable) + path.delimiter + path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32');
      env.MSBUILDDISABLENODEREUSE = '1'; env.DOTNET_CLI_TELEMETRY_OPTOUT = '1'; env.DOTNET_NOLOGO = '1';
      const original = await this.inputs(project), binaryHash = sha(await readFile(executable));
      const frozen = { executable, arguments: args, cwd: project, environment: env, target: target.path, configuration: input.configuration, platform: input.platform, binarySha256: binaryHash };
      if (!await this.approve('Visual Studio 빌드 실행 승인', JSON.stringify(frozen, null, 2) + '\n프로젝트의 빌드 이벤트와 사용자 정의 targets도 실행됩니다. SDK 설치·구성 변경·패키지 복원은 자동으로 수행하지 않습니다.', signal)) throw new Error('빌드 실행이 거절되었습니다.');
      signal?.throwIfAborted();
      if (original !== await this.inputs(project) || binaryHash !== sha(await readFile(executable))) throw new Error('승인 후 빌드 입력이 변경되었습니다. 다시 확인하고 승인해야 합니다.');
      if (process.platform !== 'win32') throw new Error('실제 MSBuild 실행은 Windows에서 지원합니다.');
      const python = path.join(this.resources, 'runtime/windows-x64/openviking/python/python.exe');
      const supervisor = path.join(this.resources, 'runtime/windows-x64/openviking/sidecar-supervisor.py');
      const child = spawn(python, ['-I', '-B', supervisor, executable, ...args], { cwd: project, env, windowsHide: true, stdio: 'pipe' }); this.children.add(child);
      let output = '', overflow = false;
      const append = (bytes: Buffer) => { output += bytes.toString(); if (output.length > 120000) { overflow = true; output = output.slice(-120000); } };
      child.stdout.on('data', append); child.stderr.on('data', append);
      let force: NodeJS.Timeout | undefined, confirm: NodeJS.Timeout | undefined;
      const stop = () => { child.stdin.end(); force = setTimeout(() => child.kill('SIGKILL'), 7000); };
      signal?.addEventListener('abort', stop, { once: true });
      if (signal?.aborted) stop();
      try {
        const code = await new Promise<number | null>((resolve, reject) => {
          child.once('error', reject); child.once('exit', resolve);
          const onAbort = () => { confirm = setTimeout(() => { this.unconfirmed = true; reject(new Error('빌드 자식 프로세스 종료를 확인하지 못했습니다. 새 빌드를 차단합니다.')); }, 10000); };
          signal?.addEventListener('abort', onAbort, { once: true });
          if (signal?.aborted) onAbort();
          child.once('close', () => signal?.removeEventListener('abort', onAbort));
        });
        signal?.throwIfAborted();
        return { status: code === 0 ? 'succeeded' : 'failed', exitCode: code, invocation: frozen, output, outputTruncated: overflow };
      } finally {
        signal?.removeEventListener('abort', stop); if (force) clearTimeout(force); if (confirm) clearTimeout(confirm);
        if (child.exitCode !== null || child.signalCode !== null) this.children.delete(child);
      }
    } finally { this.active = false; }
  }
  async close() {
    for (const child of this.children) child.stdin?.end();
    await Promise.all([...this.children].map(child => new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { child.kill('SIGKILL'); this.unconfirmed = true; reject(new Error('빌드 종료 확인 실패')); }, 9000);
      child.once('exit', () => { clearTimeout(timer); this.children.delete(child); resolve(); });
    })));
  }
}
