import { app, dialog, safeStorage } from 'electron';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { prepareNative } from './l-vibe-control.mjs';

export async function prepareLVibe() {
  const resources = app.isPackaged ? process.resourcesPath : path.resolve(import.meta.dirname, '../../resources');
  return prepareNative({
    root: app.getPath('userData'), resources, cipher: safeStorage,
    approve: async (message, detail) => {
      if (detail.length > 60000) return false;
      const result = await dialog.showMessageBox({ type: 'question', title: 'L-Vibe 승인', message, detail, buttons: ['거절', '이번만 승인'], defaultId: 0, cancelId: 0, noLink: true });
      return result.response === 1;
    },
    decide: async (message, stored) => {
      const buttons = stored ? ['다시 확인', '설정 JSON 가져와 교체', '종료'] : ['JSON 편집', '다시 확인', '설정 JSON 가져오기', '종료'];
      const result = await dialog.showMessageBox({ type: 'warning', title: 'L-Vibe 설정', message, buttons, cancelId: buttons.length - 1, noLink: true });
      return stored ? (['retry', 'import', 'cancel'] as const)[result.response] : (['edit', 'retry', 'import', 'cancel'] as const)[result.response];
    },
    select: async () => {
      const result = await dialog.showOpenDialog({ title: 'L-Vibe 설정 JSON 선택', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
      return result.canceled ? undefined : result.filePaths[0];
    },
    edit: file => { execFile(path.join(process.env.SystemRoot ?? process.env.SYSTEMROOT ?? 'C:\\Windows', 'System32/notepad.exe'), [file]); },
  });
}
