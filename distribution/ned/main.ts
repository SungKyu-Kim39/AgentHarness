import { app, dialog, safeStorage, Menu, Tray, nativeImage, shell } from 'electron';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { readFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { prepareNative, getRuntime, replaceConfiguration } from '../native-control';
import { AgentOwner } from './owner';
import { EditorNetwork, prepareEditor } from './profile';
import { migrateLegacy } from './migration';
declare const NED_VERSION: string;
app.setName('Ned');
app.setAppUserModelId('com.lig.ned');
for (const flag of ['disable-background-networking', 'disable-component-update', 'disable-sync', 'disable-domain-reliability']) app.commandLine.appendSwitch(flag);
const appData = app.getPath('appData');
const root = path.join(appData, 'Ned');
const resources = app.isPackaged ? process.resourcesPath : path.resolve('.cache/ned/resources');
let tray: Tray | undefined, editor: ChildProcess | undefined, owner: AgentOwner | undefined;
const network = new EditorNetwork();
let quitting = false, closed = false;
if (!app.requestSingleInstanceLock()) app.exit(0);
app.on('window-all-closed', () => {});
app.on('second-instance', () => { void dialog.showMessageBox({ title: 'Ned', message: 'Ned가 실행 중입니다. 열려 있는 편집기 또는 알림 영역의 Ned 메뉴를 사용하세요.' }); });
function errorMessage(error: unknown) {
  // Do not surface raw process/HTTP errors containing URLs, paths or credentials.
  return error instanceof Error && !/https?:\/\/|api.?key|Bearer |Basic /i.test(error.message) ? error.message.slice(0, 2000) : '서비스 상태를 확인하세요. 설정이나 키를 로그에 복사하지 마세요.';
}
async function shutdown() {
  if (closed) return;
  quitting = true;
  try {
    // Ask the editor to close normally; its own close UI protects unsaved buffers.
    if (editor?.exitCode === null) throw new Error('편집기에서 저장을 확인한 뒤 창을 닫아 주세요. 편집기 종료와 함께 Ned 서비스도 종료됩니다.');
    await owner?.close(); await getRuntime().close(); await network.close();
    closed = true; tray?.destroy();
  } catch (error) {
    quitting = false;
    await dialog.showMessageBox({ type: 'warning', title: 'Ned 종료', message: errorMessage(error) });
    throw error;
  }
}
app.on('before-quit', event => {
  if (closed) return;
  event.preventDefault();
  if (!quitting) void shutdown().then(() => app.quit()).catch(() => {});
});
async function chooseProject() {
  const selection = await dialog.showOpenDialog({ title: 'Ned에서 작업할 프로젝트 폴더 선택', properties: ['openDirectory'] });
  return selection.canceled ? undefined : selection.filePaths[0];
}
async function start() {
  await migrateLegacy(path.join(appData, 'L-Vibe'), root);
  await mkdir(root, { recursive: true, mode: 0o700 });
  app.setPath('userData', root);
  await app.whenReady();
  const approve = async (message: string, detail: string, signal?: AbortSignal) => {
    if (detail.length > 60000) return false;
    const result = await dialog.showMessageBox({ type: 'question', title: 'Ned 승인', message, detail,
      buttons: ['거절', '이번만 승인'], defaultId: 0, cancelId: 0, noLink: true, signal });
    return !signal?.aborted && result.response === 1;
  };
  const ready = await prepareNative({
    root, resources, cipher: safeStorage, approve,
    approveEdit: async (message, detail, signal) => {
      if (detail.length > 60000) return { approved: false, autoApproveRequest: false };
      const result = await dialog.showMessageBox({ type: 'question', title: 'Ned 파일 수정 승인', message, detail,
        buttons: ['거절', '승인'], defaultId: 0, cancelId: 0, noLink: true, signal,
        checkboxLabel: '이번 요청의 파일 수정 자동 승인 (새 요청·중지·재시작 시 해제)', checkboxChecked: false });
      return { approved: !signal?.aborted && result.response === 1, autoApproveRequest: !signal?.aborted && result.response === 1 && result.checkboxChecked };
    },
    decide: async (message, stored) => {
      const buttons = stored ? ['다시 확인', '설정 JSON 가져와 교체', '종료'] : ['JSON 편집', '다시 확인', '설정 JSON 가져오기', '종료'];
      const result = await dialog.showMessageBox({ type: 'warning', title: 'Ned 설정', message, buttons, cancelId: buttons.length - 1, noLink: true });
      return stored ? (['retry', 'import', 'cancel'] as const)[result.response] : (['edit', 'retry', 'import', 'cancel'] as const)[result.response];
    },
    select: async () => {
      const result = await dialog.showOpenDialog({ title: 'Ned 모델 설정 JSON 선택', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
      return result.canceled ? undefined : result.filePaths[0];
    },
    edit: file => {
      if (process.platform === 'win32') execFile(path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/notepad.exe'), [file]);
      else void shell.openPath(file);
    },
  });
  if (!ready) { closed = true; app.quit(); return; }
  const runtime = getRuntime();
  const project = await chooseProject();
  if (!project) { await runtime.close(); closed = true; app.quit(); return; }
  await runtime.authorizeProject(project);
  const connection = await runtime.connection([path.join(resources, process.platform === 'win32' ? 'opencode-cli.exe' : 'opencode-cli')]);
  const confirmed = new Set([await runtime.canonicalProject(project)]);
  owner = new AgentOwner(root, runtime, connection, async directory => {
    if (confirmed.has(directory)) return true;
    if (!await approve('Ned 프로젝트 접근 승인', directory + '\n이 폴더 안의 읽기·검색을 허용합니다. AI 수정과 빌드는 별도로 승인합니다.')) return false;
    confirmed.add(directory); return true;
  });
  const descriptor = await owner.start();
  runtime.setEditorCheck((session, directory, proposal, signal) => owner!.checkBuffer(session, directory, proposal, signal));
  const proxy = await network.start();
  const profile = await prepareEditor(root, process.execPath, resources, descriptor, proxy);
  const binary = path.join(resources, process.platform === 'win32' ? 'zed/Zed.exe' : 'zed/zed.app/libexec/zed-editor');
  await access(binary);
  const icon = path.join(resources, 'ned', process.platform === 'win32' ? 'icon.ico' : 'icon.png');
  tray = new Tray(nativeImage.createFromPath(icon)); tray.setToolTip('Ned');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Ned ' + NED_VERSION + ' · Zed + OpenCode', enabled: false },
    { label: '사용 안내', click: () => { void shell.openPath(path.join(resources, 'ned/GETTING_STARTED.md')); } },
    { label: 'OpenViking / 기본 스킬 등록 상태', click: async () => {
      const state = runtime.status().knowledge, skills = state?.skills;
      await dialog.showMessageBox({ title: 'Ned 지식 서비스', message: skills ? `OpenViking 스킬 ${skills.registered}/${skills.total} · ${skills.status}` : `OpenViking ${state?.status ?? '설정 필요'}`,
        detail: skills?.message ?? '개인 대화는 자동 업로드하지 않습니다.' });
    } },
    { label: '설정 JSON 가져와 교체 (편집기 종료 후 재실행)', click: async () => {
      const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
      if (result.canceled) return;
      try { await replaceConfiguration(await readFile(result.filePaths[0], 'utf8'));
        await dialog.showMessageBox({ title: 'Ned 설정', message: '설정을 암호화 저장했습니다. 편집기에서 파일을 저장하고 Ned를 종료한 뒤 다시 실행하면 적용됩니다.' });
      } catch (error) { await dialog.showMessageBox({ type: 'error', title: 'Ned 설정', message: errorMessage(error) }); }
    } },
    { label: '개인 공통 지식 가져오기 (.ovpack)', click: async () => {
      const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'OpenViking pack', extensions: ['ovpack'] }] });
      if (result.canceled) return;
      try { const imported = await runtime.importPersonalKnowledge(result.filePaths[0]); await dialog.showMessageBox({ title: 'Ned 개인 지식', message: imported.status, detail: imported.root }); }
      catch (error) { await dialog.showMessageBox({ title: 'Ned 개인 지식', type: 'error', message: errorMessage(error) }); }
    } },
    { type: 'separator' },
    { label: '종료 안내', click: () => { void dialog.showMessageBox({ title: 'Ned 종료', message: 'Zed 편집기에서 파일을 저장하고 모든 창을 닫으면 OpenCode·OpenViking과 함께 종료됩니다.' }); } },
  ]));
  editor = spawn(binary, ['--foreground', '--user-data-dir', profile.data, project], { cwd: project, env: profile.env, windowsHide: false, stdio: ['ignore', 'pipe', 'pipe'] });
  // Upstream diagnostic streams are not persisted: project text may occur there.
  editor.stdout?.on('data', () => {}); editor.stderr?.on('data', () => {});
  let started = false;
  const notice = setTimeout(() => { started = true; }, 3000);
  editor.once('error', () => { clearTimeout(notice); void dialog.showMessageBox({ type: 'error', title: 'Ned 편집기', message: '번들 Zed를 실행할 수 없습니다. 설치 리소스와 OS 요구사항을 확인하세요.' }).then(() => shutdown()).then(() => app.quit()).catch(() => {}); });
  editor.once('exit', () => {
    clearTimeout(notice);
    const complete = async () => {
      if (!started) await dialog.showMessageBox({ type: 'warning', title: 'Ned 편집기', message: '편집기가 바로 종료되었습니다. 개인 Zed가 실행 중이면 완전히 종료한 뒤 Ned를 다시 실행하세요.' });
      await shutdown(); app.quit();
    };
    void complete().catch(() => {});
  });
}
start().catch(async error => {
  await app.whenReady();
  await dialog.showMessageBox({ type: 'error', title: 'Ned 시작 실패', message: errorMessage(error) });
  try { await owner?.close(); await getRuntime().close(); await network.close(); } catch {}
  closed = true; app.quit();
});
