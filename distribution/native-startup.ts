import { app, dialog, safeStorage, Menu, Tray, nativeImage } from 'electron';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prepareNative, replaceConfiguration } from './l-vibe-control.mjs';

export async function prepareLVibe() {
  const resources = app.isPackaged ? process.resourcesPath : path.resolve(import.meta.dirname, '../../resources');
  const ready = await prepareNative({
    root: app.getPath('userData'), resources, cipher: safeStorage,
    approve: async (message, detail, signal) => {
      if (detail.length > 60000) return false;
      const abort = new AbortController(); const cancel = () => abort.abort(); app.once('before-quit', cancel);
      try {
        const combined = signal ? AbortSignal.any([signal, abort.signal]) : abort.signal;
        const result = await dialog.showMessageBox({ type: 'question', title: 'L-Vibe 승인', message, detail, buttons: ['거절', '이번만 승인'], defaultId: 0, cancelId: 0, noLink: true, signal: combined });
        return !combined.aborted && result.response === 1;
      } finally { app.off('before-quit', cancel); }
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
  if (ready && process.platform === 'win32') {
    const tray = new Tray(nativeImage.createFromPath(path.join(app.getAppPath(), 'resources/icons/icon.ico')));
    tray.setToolTip('L-Vibe');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '모델 설정 JSON 가져와 교체 후 재시작', click: async () => {
        const result = await dialog.showOpenDialog({ title: '저장된 모델 설정을 교체할 JSON 선택', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
        if (result.canceled) return;
        try {
          await replaceConfiguration(await readFile(result.filePaths[0], 'utf8'));
          app.relaunch(); app.quit();
        } catch (error) { await dialog.showMessageBox({ type: 'error', title: 'L-Vibe 설정', message: error instanceof Error ? error.message : '설정을 가져오지 못했습니다.' }); }
      } },
      { type: 'separator' },
      { label: 'L-Vibe 종료', click: () => app.quit() },
    ]));
    app.once('will-quit', () => tray.destroy());
  }
  return ready;
}
