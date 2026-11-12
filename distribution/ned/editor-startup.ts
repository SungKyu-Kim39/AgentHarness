import { spawn } from 'node:child_process';
import { open, stat } from 'node:fs/promises';
import path from 'node:path';
import { atomicJSON } from '../../src/main/config';

const patterns: Array<[string, RegExp]> = [
  ['graphics', /failed to initialize DirectX|D3D|DXGI_ERROR|no suitable graphics|Vulkan/i],
  ['permission', /Access is denied|Permission denied|os error 5/i],
  ['cli_helper', /zed-cli|failed to.*(?:cli path|askpass)/i],
  ['profile', /failed to create.*director|failed to.*(?:database|db)|database.*locked/i],
  ['arguments', /unexpected argument|unrecognized option|invalid value.*user-data-dir/i],
  ['panic', /panicked at|thread .* panicked/i],
];
export function editorExitDetail(code: number | null, signal: string | null, text: string) {
  const hex = code === null ? undefined : '0x' + (code >>> 0).toString(16).padStart(8, '0');
  const markers = patterns.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const loader = hex === '0xc0000135' ? 'missing_dll' : hex === '0xc000007b' ? 'invalid_binary' : hex === '0xc0000142' ? 'dll_initialization' : hex === '0xc000001d' ? 'unsupported_instruction' : undefined;
  return { exitCode: code, exitHex: hex, signal, markers, ...(loader ? { loader } : {}) };
}
/** Only a bounded tail of this run's app-owned log is inspected. Raw text is never persisted. */
export async function editorLogMarkers(data: string, startedAt: number) {
  const file = path.join(data, 'logs/Zed.log');
  try {
    const info = await stat(file); if (info.mtimeMs < startedAt - 1000) return '';
    const handle = await open(file, 'r');
    try { const bytes = Buffer.alloc(Math.min(info.size, 65536)); const { bytesRead } = await handle.read(bytes, 0, bytes.length, Math.max(0, info.size - bytes.length)); return bytes.subarray(0, bytesRead).toString(); }
    finally { await handle.close(); }
  } catch { return ''; }
}
export async function recordEditorExit(root: string, binary: string, data: string, env: NodeJS.ProcessEnv, startedAt: number, code: number | null, signal: string | null, output: string, osError?: string) {
  const detail = editorExitDetail(code, signal, output + '\n' + await editorLogMarkers(data, startedAt));
  let loaderProbe: 'passed' | 'failed' | 'not_run' = 'not_run';
  // --printenv exits before GUI initialization. Its secret-free result is discarded.
  if (process.platform === 'win32' && Date.now() - startedAt < 15000) {
    loaderProbe = await new Promise<'passed' | 'failed'>(resolve => {
      const child = spawn(binary, ['--printenv'], { cwd: path.dirname(binary), env, windowsHide: true, stdio: 'ignore' });
      const timer = setTimeout(() => { child.kill(); resolve('failed'); }, 10000);
      child.once('error', () => { clearTimeout(timer); resolve('failed'); });
      child.once('exit', value => { clearTimeout(timer); resolve(value === 0 ? 'passed' : 'failed'); });
    });
  }
  const report = { schemaVersion: 1, recordedAt: new Date().toISOString(), elapsedMs: Date.now() - startedAt, platform: process.platform, ...detail,
    ...(osError && /^[A-Z0-9_]{1,32}$/.test(osError) ? { osError } : {}), loaderProbe };
  await atomicJSON(path.join(root, 'editor-startup-status.json'), report);
  return report;
}

export async function checkEditorFiles(root: string, resources: string) {
  const files = process.platform === 'win32' ? ['zed/Zed.exe', 'zed/bin/zed.exe'] : ['zed/zed.app/libexec/zed-editor'];
  const missing: string[] = [];
  for (const relative of files) {
    try { if (!(await stat(path.join(resources, relative))).isFile()) missing.push(relative); }
    catch { missing.push(relative); }
  }
  if (missing.length) {
    await atomicJSON(path.join(root, 'editor-startup-status.json'), { schemaVersion: 1, recordedAt: new Date().toISOString(), code: 'EDITOR_BUNDLE_MISSING', missing });
    throw new Error('EDITOR_BUNDLE_MISSING: 번들 편집기 파일이 없습니다. 설치 위치와 설치 완료 여부를 확인하세요. 진단: editor-startup-status.json');
  }
}
