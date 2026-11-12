import { execFile, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
const execute = promisify(execFile);

/** Post WM_CLOSE only to unowned top-level windows of our exact live child process. */
export function editorCloseScript(pid: number) {
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error('편집기 프로세스를 확인하지 못했습니다.');
  return `
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class NedEditorClose {
  public delegate bool Visitor(IntPtr hwnd, IntPtr data);
  [DllImport("user32.dll")] public static extern bool EnumWindows(Visitor visitor, IntPtr data);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint processId);
  [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr hwnd, uint command);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll", SetLastError=true)] public static extern bool PostMessage(IntPtr hwnd, uint message, IntPtr wParam, IntPtr lParam);
}
'@
$script:matched = 0
$script:failed = $false
$visitor = [NedEditorClose+Visitor] {
  param([IntPtr] $hwnd, [IntPtr] $data)
  [uint32] $windowProcess = 0
  [void][NedEditorClose]::GetWindowThreadProcessId($hwnd, [ref] $windowProcess)
  if ($windowProcess -eq ${pid} -and [NedEditorClose]::IsWindowVisible($hwnd) -and [NedEditorClose]::GetWindow($hwnd, 4) -eq [IntPtr]::Zero) {
    $script:matched++
    if (-not [NedEditorClose]::PostMessage($hwnd, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero)) { $script:failed = $true }
  }
  return $true
}
if (-not [NedEditorClose]::EnumWindows($visitor, [IntPtr]::Zero) -or $script:matched -eq 0 -or $script:failed) { exit 1 }
`;
}
export async function requestEditorClose(editor: ChildProcess | undefined) {
  if (!editor || editor.exitCode !== null || editor.signalCode !== null || !editor.pid) return;
  if (process.platform !== 'win32') throw new Error('설정은 저장되었습니다. 편집기를 정상 종료하면 Ned가 자동으로 다시 실행됩니다.');
  const binary = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe');
  try {
    await execute(binary, ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(editorCloseScript(editor.pid), 'utf16le').toString('base64')],
      { windowsHide: true, timeout: 15000, maxBuffer: 16384 });
  } catch {
    // Timeout applies only to local PostMessage delivery, never to save prompts or model queues.
    if (editor.exitCode !== null || editor.signalCode !== null) return;
    throw new Error('설정은 저장되었습니다. 편집기의 저장·닫기 확인창을 완료하거나 모든 편집기 창을 닫으면 Ned가 자동으로 다시 실행됩니다. 강제 종료하지 않습니다.');
  }
}
