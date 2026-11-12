import { app, dialog, safeStorage, Menu, Tray, nativeImage, shell } from 'electron';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { readFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { prepareNative, getRuntime, replaceConfiguration } from '../native-control';
import { StartupWindow } from './startup-window';
import { recordEditorExit, checkEditorFiles } from './editor-startup';
import { AgentOwner } from './owner';
import { EditorNetwork, prepareEditor } from './profile';
import { migrateLegacy, migrationNeedsBootstrap } from './migration';
declare const NED_VERSION: string;
app.setName('Ned');
app.setAppUserModelId('com.lig.ned');
for (const flag of ['disable-background-networking', 'disable-component-update', 'disable-sync', 'disable-domain-reliability']) app.commandLine.appendSwitch(flag);
const appData = app.getPath('appData');
const root = path.join(appData, 'Ned');
// A migrated vault must use its copied Electron Local State encryption key.
// The initial copying process uses another profile, then exits before touching the vault.
const legacy = path.join(appData, 'L-Vibe');
const bootstrap = migrationNeedsBootstrap(legacy, root);
const launcherData = bootstrap ? path.join(process.env.LOCALAPPDATA ?? appData, 'Ned-Launcher') : root;
mkdirSync(launcherData, { recursive: true, mode: 0o700 }); app.setPath('userData', launcherData);
const resources = app.isPackaged ? process.resourcesPath : path.resolve(process.env.NED_DEV_RESOURCES ?? '.cache/ned/resources');
let tray: Tray | undefined, editor: ChildProcess | undefined, owner: AgentOwner | undefined;
const network = new EditorNetwork();
let quitting = false, closed = false;
const startup = new StartupWindow();
const messageBox = (options: Electron.MessageBoxOptions) => startup.duringDialog(() => dialog.showMessageBox(options));
const openDialog = (options: Electron.OpenDialogOptions) => startup.duringDialog(() => dialog.showOpenDialog(options));
if (!app.requestSingleInstanceLock()) app.exit(0);
app.on('window-all-closed', () => {});
app.on('second-instance', () => { void messageBox({ title: 'Ned', message: 'Ned가 실행 중입니다. 열려 있는 편집기 또는 알림 영역의 Ned 메뉴를 사용하세요.' }); });
function errorMessage(error: unknown) {
  // Do not surface raw process/HTTP errors containing URLs, paths or credentials.
  return error instanceof Error && !/https?:\/\/|api.?key|Bearer |Basic /i.test(error.message) ? error.message.slice(0, 2000) : '서비스 상태를 확인하세요. 설정이나 키를 로그에 복사하지 마세요.';
}
async function shutdown() {
  if (closed) return;
  quitting = true;
  try {
    // Ask the editor to close normally; its own close UI protects unsaved buffers.
    if (editor && editor.exitCode === null && editor.signalCode === null) throw new Error('편집기에서 저장을 확인한 뒤 창을 닫아 주세요. 편집기 종료와 함께 Ned 서비스도 종료됩니다.');
    await owner?.close(); await getRuntime().close(); await network.close();
    closed = true; startup.close(); tray?.destroy();
  } catch (error) {
    quitting = false;
    await messageBox({ type: 'warning', title: 'Ned 종료', message: errorMessage(error) });
    throw error;
  }
}
app.on('before-quit', event => {
  if (closed) return;
  event.preventDefault();
  if (!quitting) void shutdown().then(() => app.quit()).catch(() => {});
});
async function chooseProject() {
  const selection = await openDialog({ title: 'Ned에서 작업할 프로젝트 폴더 선택', properties: ['openDirectory'] });
  return selection.canceled ? undefined : selection.filePaths[0];
}
async function start() {
  await app.whenReady();
  await startup.open(resources); startup.setPhase('migration');
  await migrateLegacy(legacy, root);
  if (bootstrap) { closed = true; startup.close(); app.relaunch(); app.quit(); return; }
  await mkdir(root, { recursive: true, mode: 0o700 });
  await app.whenReady();
  if (process.platform === 'win32') {
    const running = await new Promise<string>((resolve, reject) => execFile(path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/tasklist.exe'), ['/FI', 'IMAGENAME eq Zed.exe', '/FO', 'CSV', '/NH'], { windowsHide: true, timeout: 10000 }, (error, stdout) => error ? reject(error) : resolve(stdout)));
    if (/"Zed.exe"/i.test(running)) throw new Error('기존 Zed를 완전히 종료한 뒤 Ned를 실행하세요. 개인 편집기 인스턴스에 연결하지 않습니다.');
  }
  await checkEditorFiles(root, resources);
  const approve = async (message: string, detail: string, signal?: AbortSignal) => {
    if (detail.length > 60000) return false;
    const result = await messageBox({ type: 'question', title: 'Ned 승인', message, detail,
      buttons: ['거절', '이번만 승인'], defaultId: 0, cancelId: 0, noLink: true, signal });
    return !signal?.aborted && result.response === 1;
  };
  startup.setPhase('configuration');
  const ready = await prepareNative({
    root, resources, cipher: safeStorage, approve,
    approveEdit: async (message, detail, signal) => {
      if (detail.length > 60000) return { approved: false, autoApproveRequest: false };
      const result = await messageBox({ type: 'question', title: 'Ned 파일 수정 승인', message, detail,
        buttons: ['거절', '승인'], defaultId: 0, cancelId: 0, noLink: true, signal,
        checkboxLabel: '이번 요청의 파일 수정 자동 승인 (새 요청·중지·재시작 시 해제)', checkboxChecked: false });
      return { approved: !signal?.aborted && result.response === 1, autoApproveRequest: !signal?.aborted && result.response === 1 && result.checkboxChecked };
    },
    decide: async (message, stored) => {
      const buttons = stored ? ['다시 확인', '설정 JSON 가져와 교체', '종료'] : ['JSON 편집', '다시 확인', '설정 JSON 가져오기', '종료'];
      const result = await messageBox({ type: 'warning', title: 'Ned 설정', message, buttons, cancelId: buttons.length - 1, noLink: true });
      return stored ? (['retry', 'import', 'cancel'] as const)[result.response] : (['edit', 'retry', 'import', 'cancel'] as const)[result.response];
    },
    select: async () => {
      const result = await openDialog({ title: 'Ned 모델 설정 JSON 선택', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
      return result.canceled ? undefined : result.filePaths[0];
    },
    edit: file => {
      if (process.platform === 'win32') execFile(path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/notepad.exe'), [file]);
      else void shell.openPath(file);
    },
  });
  if (!ready) { closed = true; startup.close(); app.quit(); return; }
  const runtime = getRuntime();
  const project = await chooseProject();
  if (!project) { await runtime.close(); closed = true; startup.close(); app.quit(); return; }
  startup.setPhase('engine');
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
      await messageBox({ title: 'Ned 지식 서비스', message: skills ? `OpenViking 스킬 ${skills.registered}/${skills.total} · ${skills.status}` : `OpenViking ${state?.status ?? '설정 필요'}`,
        detail: (skills?.current ? skills.current.id + ' · ' + skills.current.stage + '\n' : '') + (skills?.message ?? '개인 대화는 자동 업로드하지 않습니다.') + '\n진단: %APPDATA%\\Ned\\openviking\\skills-status.json / model-status.json' });
    } },
    { label: 'OpenViking 기본 스킬 등록 재확인', click: async () => { try { await runtime.retryKnowledgeSkills(); } catch (error) { await messageBox({ title: 'Ned 스킬', message: errorMessage(error) }); } } },
    { label: '설정 JSON 가져와 교체 (편집기 종료 후 재실행)', click: async () => {
      const result = await openDialog({ properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
      if (result.canceled) return;
      try { await replaceConfiguration(await readFile(result.filePaths[0], 'utf8'));
        await messageBox({ title: 'Ned 설정', message: '설정을 암호화 저장했습니다. 편집기에서 파일을 저장하고 Ned를 종료한 뒤 다시 실행하면 적용됩니다.' });
      } catch (error) { await messageBox({ type: 'error', title: 'Ned 설정', message: errorMessage(error) }); }
    } },
    { label: '개인 공통 지식 가져오기 (.ovpack)', click: async () => {
      const result = await openDialog({ properties: ['openFile'], filters: [{ name: 'OpenViking pack', extensions: ['ovpack'] }] });
      if (result.canceled) return;
      try { const imported = await runtime.importPersonalKnowledge(result.filePaths[0]); await messageBox({ title: 'Ned 개인 지식', message: imported.status, detail: imported.root }); }
      catch (error) { await messageBox({ title: 'Ned 개인 지식', type: 'error', message: errorMessage(error) }); }
    } },
    { label: '개인 공통 지식 가져오기 상태', click: async () => { try { const state = await runtime.personalKnowledgeStatus(); await messageBox({ title: 'Ned 개인 지식 상태', message: state.length ? '개인 자료 가져오기 상태' : '가져온 개인 자료가 없습니다.', detail: JSON.stringify(state, null, 2) + '\nimporting은 색인 준비 중입니다. ready는 검색 영역 색인 검증까지 완료한 상태입니다.' }); } catch (error) { await messageBox({ title: 'Ned 개인 지식', message: errorMessage(error) }); } } },
    { type: 'separator' },
    { label: '종료 안내', click: () => { void messageBox({ title: 'Ned 종료', message: 'Zed 편집기에서 파일을 저장하고 모든 창을 닫으면 OpenCode·OpenViking과 함께 종료됩니다.' }); } },
  ]));
  startup.setPhase('editor');
  editor = spawn(binary, [...(process.platform === 'win32' ? ['--foreground'] : []), '--user-data-dir', profile.data, project], { cwd: project, env: profile.env, windowsHide: false, stdio: ['ignore', 'pipe', 'pipe'] });
  editor.once('spawn', () => startup.close());
  const startedAt = Date.now(); let diagnostic = '', spawnError: string | undefined;
  // Bounded in-memory classification; upstream text is never saved or displayed.
  const collect = (bytes: Buffer) => { diagnostic = (diagnostic + bytes.toString()).slice(-65536); };
  editor.stdout?.on('data', collect); editor.stderr?.on('data', collect);
  editor.once('error', error => { spawnError = (error as NodeJS.ErrnoException).code; });
  // close fires once after either a failed spawn or process exit and stream closure.
  editor.once('close', (code, signal) => {
    const complete = async () => {
      const report = await recordEditorExit(root, binary, profile.data, profile.env, startedAt, code, signal, diagnostic, spawnError).catch(() => undefined);
      if (spawnError || code !== 0 || signal || Date.now() - startedAt < 3000) {
        await messageBox({ type: 'warning', title: 'Ned 편집기 시작 진단',
          message: '편집기가 종료되었습니다. 실제 종료 상태를 확인해야 합니다.',
          detail: JSON.stringify(report ?? { code: 'EDITOR_DIAGNOSTIC_WRITE_FAILED' }, null, 2) + '\n진단 파일: %APPDATA%\\Ned\\editor-startup-status.json\n개인 Zed 실행 여부만으로 원인을 단정하지 않습니다. 진단 파일에는 설정·키·코드·원본 로그가 포함되지 않습니다.' });
      }
      editor = undefined;
      await shutdown(); app.quit();
    };
    void complete().catch(() => {});
  });
}
start().catch(async error => {
  await app.whenReady();
  startup.close();
  await messageBox({ type: 'error', title: 'Ned 시작 실패', message: errorMessage(error) });
  try { await owner?.close(); await getRuntime().close(); await network.close(); } catch {}
  closed = true; app.quit();
});
