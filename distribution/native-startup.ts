import { app, dialog, safeStorage, Menu, Tray, nativeImage } from 'electron';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prepareNative, replaceConfiguration, getRuntime } from './l-vibe-control.mjs';

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
    approveEdit: async (message, detail, signal) => {
      if (detail.length > 60000) return { approved: false, autoApproveRequest: false };
      const abort = new AbortController(); const cancel = () => abort.abort(); app.once('before-quit', cancel);
      try {
        const combined = signal ? AbortSignal.any([signal, abort.signal]) : abort.signal;
        const result = await dialog.showMessageBox({ type: 'question', title: 'L-Vibe 파일 수정 승인', message, detail,
          buttons: ['거절', '승인'], defaultId: 0, cancelId: 0, noLink: true, signal: combined,
          checkboxLabel: '이번 요청의 프로젝트 파일 수정 자동 승인 (새 요청·중지·재시작 시 해제)', checkboxChecked: false });
        return { approved: !combined.aborted && result.response === 1, autoApproveRequest: !combined.aborted && result.response === 1 && result.checkboxChecked };
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
      { label: 'OpenViking 기본 스킬 등록 상태', click: async () => {
        const state = getRuntime().status().knowledge;
        const skills = state?.skills;
        await dialog.showMessageBox({ type: skills?.status === 'error' ? 'warning' : 'info', title: 'L-Vibe 기본 스킬',
          message: skills ? `OpenViking 기본 스킬 ${skills.registered}/${skills.total}개 · ${skills.status}` : `OpenViking ${state?.status ?? '설정 필요'}`,
          detail: skills?.message ?? 'JSON의 임베딩 모델을 설정하면 기본 스킬을 로컬 OpenViking skills에 자동 등록합니다. 사용자 대화와 프로젝트 파일은 자동 등록하지 않습니다.',
        });
      } },
      { label: '모델 설정 JSON 가져와 교체 후 재시작', click: async () => {
        const result = await dialog.showOpenDialog({ title: '저장된 모델 설정을 교체할 JSON 선택', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
        if (result.canceled) return;
        try {
          await replaceConfiguration(await readFile(result.filePaths[0], 'utf8'));
          app.relaunch(); app.quit();
        } catch (error) { await dialog.showMessageBox({ type: 'error', title: 'L-Vibe 설정', message: error instanceof Error ? error.message : '설정을 가져오지 못했습니다.' }); }
      } },
      { label: '개인 공통 지식 가져오기 (.ovpack)', click: async () => {
        const result = await dialog.showOpenDialog({ title: '기존 OpenViking 사용자 영역의 OVPack 선택', properties: ['openFile'], filters: [{ name: 'OpenViking personal knowledge', extensions: ['ovpack'] }] });
        if (result.canceled) return;
        try {
          const imported = await getRuntime().importPersonalKnowledge(result.filePaths[0]);
          await dialog.showMessageBox({ type: 'info', title: 'L-Vibe 개인 지식', message: imported.status === 'already-imported' ? '이미 가져온 개인 지식입니다.' : '개인 지식을 가져왔습니다.',
            detail: `${imported.root}\n모든 프로젝트에서 개인 지식 검색 도구로 조회할 수 있습니다. 실제 검색 결과를 확인하세요.` });
        } catch (error) { await dialog.showMessageBox({ type: 'error', title: 'L-Vibe 개인 지식', message: error instanceof Error ? error.message : '개인 지식을 가져오지 못했습니다.' }); }
      } },
      { label: '개인 공통 지식 가져오기 상태', click: async () => {
        try {
          const entries = await getRuntime().personalKnowledgeStatus();
          await dialog.showMessageBox({ type: 'info', title: 'L-Vibe 개인 지식', message: `가져오기 완료 ${entries.filter(e => e.status === 'ready').length}개 영역`,
            detail: entries.map(e => `${e.root} · ${e.status} · ${e.files} files`).join('\n') || '가져온 개인 지식이 없습니다.' });
        } catch { await dialog.showMessageBox({ type: 'warning', title: 'L-Vibe 개인 지식', message: 'OpenViking 실행 상태와 개인 지식 등록 기록을 확인하세요.' }); }
      } },
      { type: 'separator' },
      { label: 'L-Vibe 종료', click: () => app.quit() },
    ]));
    app.once('will-quit', () => tray.destroy());
  }
  return ready;
}
