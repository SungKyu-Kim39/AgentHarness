import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

const builtins: Record<string, string> = { calculator: 'calc.exe', calc: 'calc.exe', notepad: 'notepad.exe', paint: 'mspaint.exe' };
const forbidden = /^(?:ned|l-vibe|zed|opencode|agent-desktop|electron|cmd|powershell|pwsh|wt|conhost|openconsole|explorer|consent|taskmgr|regedit|mmc|rundll32|mshta|wscript|cscript|msiexec|control|regsvr32|python(?:w|\d+)?|node|bun)(?:\.exe)?$/i;
export interface DesktopLaunchPlan { executable: string; sha256: string; cwd: string; arguments: readonly string[] }
/** Only GUI executables, no shell strings, file/protocol associations, arguments or caller environment. */
export function validateGuiExecutable(bytes: Buffer, executable: string) {
  if (forbidden.test(path.win32.basename(executable))) throw new Error('관리형 앱·셸·스크립트 실행기·시스템 관리 도구는 Desktop 실행 대상이 아닙니다.');
  const header = bytes.length >= 64 && bytes.toString('ascii', 0, 2) === 'MZ' ? bytes.readUInt32LE(60) : -1;
  if (header < 64 || header + 96 > bytes.length || bytes.toString('ascii', header, header + 4) !== 'PE\0\0' ||
      bytes.readUInt16LE(header + 22) & 0x2000 || ![0x10b, 0x20b].includes(bytes.readUInt16LE(header + 24)) || bytes.readUInt16LE(header + 92) !== 2)
    throw new Error('Windows GUI .exe 파일만 실행할 수 있습니다.');
}
export class DesktopLauncher {
  async prepare(app: string): Promise<DesktopLaunchPlan> {
    if (process.platform !== 'win32') throw new Error('앱 실행은 Windows에서 지원합니다.');
    const executable = builtins[app.toLowerCase()] ? path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', builtins[app.toLowerCase()]) : app;
    if (!path.win32.isAbsolute(executable) || !/\.exe$/i.test(executable) || /^\\\\/.test(executable)) throw new Error('calculator/notepad/paint 또는 로컬 GUI .exe의 절대 경로를 지정하세요.');
    const resolved = await realpath(executable), stat = await lstat(resolved);
    if (!stat.isFile() || stat.size > 512 * 1024 * 1024) throw new Error('앱 실행 대상 파일을 확인하지 못했습니다.');
    const bytes = await readFile(resolved); validateGuiExecutable(bytes, resolved);
    return { executable: resolved, sha256: createHash('sha256').update(bytes).digest('hex'), cwd: path.dirname(resolved), arguments: [] };
  }
  async launch(plan: DesktopLaunchPlan, signal?: AbortSignal) {
    const confirmed = await this.prepare(plan.executable);
    if (JSON.stringify(confirmed) !== JSON.stringify(plan)) throw new Error('승인 뒤 실행 파일이 변경되었습니다.');
    signal?.throwIfAborted();
    const env: NodeJS.ProcessEnv = {};
    for (const key of ['SystemRoot','SYSTEMROOT','WINDIR','SystemDrive','ProgramFiles','ProgramFiles(x86)','ProgramW6432','ProgramData','USERPROFILE','APPDATA','LOCALAPPDATA','TEMP','TMP','HOMEDRIVE','HOMEPATH']) if (process.env[key]) env[key] = process.env[key];
    env.PATH = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32');
    // User GUI apps outlive Ned. Never put these in the kill-on-close MCP supervisor Job.
    return new Promise<{ status: 'started'; pid: number | undefined; windowVerified: false }>((resolve, reject) => {
      const child = spawn(plan.executable, [], { cwd: plan.cwd, env, shell: false, detached: true, stdio: 'ignore', windowsHide: false });
      child.once('error', () => reject(new Error('앱 실행 요청이 실패했습니다. 창 목록을 확인한 뒤 다시 결정하세요.')));
      child.once('spawn', () => { child.unref(); resolve({ status: 'started', pid: child.pid, windowVerified: false }); });
    });
  }
}
