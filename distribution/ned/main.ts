import { app, dialog, safeStorage, Menu, Tray, nativeImage, shell } from 'electron';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { readFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { prepareNative, getRuntime, replaceConfiguration } from '../native-control';
import { editorLaunch } from './editor-launch';
import { ProjectOpener, projectOpenCommand, dispatchProject } from './project-open';
import { requestEditorClose } from './editor-close';
import { ConfigurationRestart } from './configuration-restart';
import { atomicJSON } from '../../src/main/config';
import { importZedHistory } from './zed-history';
import { StartupWindow } from './startup-window';
import { OpenVikingStudio } from './studio';
import { selectPythonEnvironment } from './python-selector';
import { recordEditorExit, checkEditorFiles, editorExitPresentation } from './editor-startup';
import { AgentOwner } from './owner';
import { EditorNetwork, prepareEditor } from './profile';
import { migrateLegacy, migrationNeedsBootstrap } from './migration';
import { PermissionPolicy, permissionModes, type PermissionMode } from './permission-policy';
import { withTopmostDialogOwner } from './topmost-dialog';
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
const network = new EditorNetwork(code => { void atomicJSON(path.join(root,'editor-network-status.json'),{schemaVersion:1,recordedAt:new Date().toISOString(),code}).catch(()=>{}); });
let quitting = false, closed = false;
let trayMenu: Menu | undefined;
const configurationRestart = new ConfigurationRestart(replaceConfiguration, () => requestEditorClose(editor), () => {
  if (!tray || tray.isDestroyed()) return;
  const pending = configurationRestart.pending;
  getRuntime().pauseApprovals(pending);
  const importing = trayMenu?.getMenuItemById('config-import');
  if (importing) importing.enabled = !configurationRestart.busy && !pending;
  const cancel = trayMenu?.getMenuItemById('config-restart-cancel');
  if (cancel) { cancel.visible = pending; cancel.enabled = !configurationRestart.busy; }
  tray.setToolTip(pending ? 'Ned · 설정 적용 대기: 편집기 저장·닫기 확인' : 'Ned');
  if (trayMenu) tray.setContextMenu(trayMenu);
});
const startup = new StartupWindow();
const studio = new OpenVikingStudio(event => { void atomicJSON(path.join(root,'openviking/studio-status.json'),{schemaVersion:1,recordedAt:new Date().toISOString(),...event}).catch(()=>{}); });
const messageBox = (options: Electron.MessageBoxOptions) => startup.duringDialog(() => withTopmostDialogOwner(owner => dialog.showMessageBox(owner, options)));
const openDialog = (options: Electron.OpenDialogOptions) => startup.duringDialog(() => withTopmostDialogOwner(owner => dialog.showOpenDialog(owner, options)));
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
    studio.close(); await owner?.close(); await getRuntime().close(); await network.close();
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
  const permissions = new PermissionPolicy(root); await permissions.load();
  const approve = async (message: string, detail: string, signal?: AbortSignal) => {
    if (configurationRestart.pending || detail.length > 60000) return false;
    const result = await messageBox({ type: 'question', title: 'Ned 승인', message, detail,
      buttons: ['거절', '이번만 승인'], defaultId: 0, cancelId: 0, noLink: true, signal });
    return !signal?.aborted && result.response === 1;
  };
  startup.setPhase('configuration');
  const ready = await prepareNative({
    root, resources, cipher: safeStorage, approve, permissions, progress: (phase,detail) => startup.setPhase(phase,detail),
    approveEdit: async (message, detail, signal) => {
      if (configurationRestart.pending || detail.length > 60000) return { approved: false, autoApproveRequest: false };
      const result = await messageBox({ type: 'question', title: 'Ned 파일 변경 승인', message, detail,
        buttons: ['거절', '이번 수정 승인', '현재 대화·프로젝트 자동 승인'], defaultId: 0, cancelId: 0, noLink: true, signal,
        checkboxLabel: '이번 요청의 파일 수정 자동 승인 (새 요청·중지·재시작 시 해제)', checkboxChecked: false });
      return { approved: !signal?.aborted && (result.response === 1 || result.response === 2), autoApproveRequest: !signal?.aborted && result.response === 1 && result.checkboxChecked, autoApproveSession: !signal?.aborted && result.response === 2 };
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
  runtime.setPythonSelector((project, environments, signal) => startup.duringDialog(() => selectPythonEnvironment(resources, project, environments, signal)),
    async (_project, signal) => {
      signal?.throwIfAborted();
      const result = await openDialog({ title: 'Conda 설치 루트 폴더 선택', buttonLabel: 'Conda 설치 폴더 선택', properties: ['openDirectory', 'dontAddToRecent'] });
      signal?.throwIfAborted(); return result.canceled ? undefined : result.filePaths[0];
    });
  runtime.onKnowledgeChange(() => { if (runtime.status().knowledge?.status !== 'ready') studio.close(); });
  startup.setPhase('engine');
  const connection = await runtime.connection([path.join(resources, process.platform === 'win32' ? 'opencode-cli.exe' : 'opencode-cli')]);
  const confirmed = new Set<string>();
  owner = new AgentOwner(root, runtime, connection, async directory => {
    if (confirmed.has(directory)) return true;
    if (!await runtime.approveOperation('Ned 프로젝트 접근 승인', directory + '\n이 폴더 안의 읽기·검색을 허용합니다. 이후 동작은 선택한 Ned 권한 모드를 따릅니다.')) return false;
    confirmed.add(directory); return true;
  });
  const descriptor = await owner.start();
  runtime.setEditorCheck((session, directory, proposal, signal) => owner!.checkBuffer(session, directory, proposal, signal));
  const nativeZed = await runtime.zedConnection();
  const proxy = await network.start(nativeZed.baseUrl);
  startup.setPhase('profile');
  const profile = await prepareEditor(root, process.execPath, resources, descriptor, proxy, nativeZed);
  const binary = path.join(resources, process.platform === 'win32' ? 'zed/Zed.exe' : 'zed/zed.app/libexec/zed-editor');
  await access(binary);
  const icon = path.join(resources, 'ned', process.platform === 'win32' ? 'icon.ico' : 'icon.png');
  tray = new Tray(nativeImage.createFromPath(icon)); tray.setToolTip('Ned');
  const updatePermissionMenu = () => {
    for (const mode of permissionModes) {
      const item = trayMenu?.getMenuItemById('permission-' + mode.value);
      if (item) item.checked = permissions.mode === mode.value;
    }
    const item = trayMenu?.getMenuItemById('permissions');
    if (item) item.label = '권한 · ' + permissionModes.find(mode => mode.value === permissions.mode)!.name;
    tray?.setToolTip('Ned · ' + permissionModes.find(mode => mode.value === permissions.mode)!.name);
    if (trayMenu) tray?.setContextMenu(trayMenu);
  };
  const setPermission = async (mode: PermissionMode) => {
    try { await runtime.setPermissionMode(mode); }
    catch (error) { await messageBox({ type: 'error', title: 'Ned 권한 설정', message: errorMessage(error) }); }
    updatePermissionMenu();
  };
  const projectOpener = new ProjectOpener();
  const openProject = async () => {
    try {
      await projectOpener.open({
        alive: () => !!editor && editor.exitCode === null && editor.signalCode === null && !quitting && !configurationRestart.pending,
        choose: async () => {
          const result = await openDialog({ title: 'Ned 프로젝트 폴더 열기', defaultPath: app.getPath('documents'), properties: ['openDirectory'] });
          return result.canceled ? undefined : result.filePaths[0];
        },
        canonical: directory => runtime.canonicalProject(directory),
        dispatch: directory => dispatchProject(projectOpenCommand(resources, profile.data, directory), profile.env),
        selected: directory => { confirmed.add(directory); },
      });
    } catch (error) { await messageBox({ type: 'error', title: 'Ned 프로젝트 열기', message: errorMessage(error) }); }
  };
  permissions.onChange(updatePermissionMenu);
  trayMenu = Menu.buildFromTemplate([
    { label: 'Ned ' + NED_VERSION + ' · Zed + OpenCode', enabled: false },
    { label: '프로젝트 폴더 열기', click: openProject },
    { id: 'permissions', label: '권한', submenu: [
      ...permissionModes.map(mode => ({ id: 'permission-' + mode.value, label: mode.name, type: 'radio' as const, checked: permissions.mode === mode.value, click: () => setPermission(mode.value) })),
      { type: 'separator' },
      { label: '선택한 모드는 업데이트·재시작 후에도 유지됩니다.', enabled: false },
      { label: '전체 권한: 지원 도구의 승인창 생략', enabled: false },
    ] },
    { label: '기존 Zed Agent 대화 가져오기', click: async () => {
      const chosen=await openDialog({title:'기존 Zed의 threads.db 선택',defaultPath:path.join(process.env.LOCALAPPDATA ?? root,'Zed/threads/threads.db'),properties:['openFile'],filters:[{name:'Zed 대화 DB',extensions:['db']}]});
      if(chosen.canceled)return;
      const decision=await messageBox({title:'Zed 대화 가져오기',message:'원본을 변경하지 않고 Ned 대화에 병합합니다. 같은 ID의 다른 대화는 덮어쓰지 않습니다.',detail:'기존 Zed를 종료하세요. Ned DB는 먼저 백업합니다. 가져온 대화는 Ned 재시작 후 목록에서 확인할 수 있습니다. 이전 모델 선택과 승인 권한은 승계하지 않습니다.',buttons:['취소','가져오기'],defaultId:0,cancelId:0});
      if(decision.response!==1)return;
      try { const report=await importZedHistory(chosen.filePaths[0],profile.data);await messageBox({title:'Ned 대화 가져오기',message:`가져오기 ${report.imported}개 · 중복 ${report.duplicates}개 · 충돌 ${report.conflicts}개 · 지원하지 않는 항목 ${report.unsupported}개`,detail:'Ned를 재시작하면 대화 목록에 반영됩니다. 백업은 Ned 편집기 데이터의 history-backups 폴더에 보존됩니다.'}); }
      catch(error){await messageBox({type:'error',title:'Ned 대화 가져오기',message:errorMessage(error)});}
    } },
    { label: '사용 안내', submenu: [
      { label: '설치와 첫 실행', click: () => { void shell.openPath(path.join(resources, 'ned/GETTING_STARTED.md')); } },
      { label: '요약 출력 한도 오류 해결', click: () => { void shell.openPath(path.join(resources, 'ned/compaction-troubleshooting.md')); } },
      { label: 'OpenViking Studio 사용', click: () => { void shell.openPath(path.join(resources, 'ned/openviking-studio.md')); } },
      { label: NED_VERSION.split(' ')[0] + ' 변경 사항', click: () => { void shell.openPath(path.join(resources, 'ned/changes-' + NED_VERSION.split(' ')[0] + '.md')); } },
      { label: '지식 저장·검색 안내', click: () => { void shell.openPath(path.join(resources, 'ned/knowledge-notes.md')); } },
      { label: '기존 Zed 대화 가져오기 안내', click: () => { void shell.openPath(path.join(resources, 'ned/zed-history-import.md')); } },
      { label: 'EGM 설계·검토 사용', click: () => { void shell.openPath(path.join(resources, 'ned/egm.md')); } },
      { label: '새 스킬·MCP 추가 방법', click: () => { void shell.openPath(path.join(resources, 'ned/extension-guide.md')); } },
      { label: 'Python·Conda 실행과 환경 기억', click: () => { void shell.openPath(path.join(resources, 'ned/python-conda.md')); } },
      { label: 'Git 커밋·Ghidra·외부 자료 읽기', click: () => { void shell.openPath(path.join(resources, 'ned/git-and-binary-analysis.md')); } },
    ] },
    { label: '모든 자동 승인 해제 · 승인 요청으로 전환', click: () => setPermission('ask') },
    {
      label: (() => {
        const mem = runtime.status().memory;
        if (!mem?.enabled) return '자동 대화 기억 · 꺼짐 (설정 JSON으로 변경)';
        return `자동 대화 기억 · 켜짐 (${mem.commitEveryTurns}턴마다 추출${mem.autoRecall ? ' · 자동 회상' : ' · 수동 검색'})`;
      })(),
      enabled: false,
    },
    { label: 'OpenViking Studio 열기', click: async () => {
      try {
        if (quitting || configurationRestart.pending) return;
        const connection = await runtime.studioConnection();
        if (!quitting && !configurationRestart.pending) await studio.open(connection, icon);
      }
      catch (error) { await messageBox({ type: 'warning', title: 'Ned · OpenViking Studio', message: errorMessage(error) }); }
    } },
    { id: 'config-import', label: '설정 JSON 가져와 적용 (자동 재시작)', click: async () => {
      if (configurationRestart.busy || configurationRestart.pending) return;
      const result = await openDialog({ title: '설정 JSON 가져오기 · 적용 후 자동 재시작', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
      if (result.canceled) return;
      try { await configurationRestart.import(await readFile(result.filePaths[0], 'utf8')); }
      catch (error) { await messageBox({ type: 'error', title: 'Ned 설정', message: errorMessage(error) }); }
    } },
    { id: 'config-restart-cancel', label: '설정 적용 재시작 대기 취소', visible: false, click: () => configurationRestart.cancel() },
    { type: 'separator' },
    { label: '종료 안내', click: () => { void messageBox({ title: 'Ned 종료', message: 'Zed 편집기에서 파일을 저장하고 모든 창을 닫으면 OpenCode·OpenViking과 함께 종료됩니다.' }); } },
  ]);
  tray.setContextMenu(trayMenu);
  updatePermissionMenu();
  startup.setPhase('editor');
  const launch = editorLaunch(profile.data);
  editor = spawn(binary, launch.args, { cwd: launch.cwd, env: profile.env, windowsHide: false, stdio: ['ignore', 'pipe', 'pipe'] });
  editor.once('spawn', () => { void startup.saveTiming(root); startup.close(); });
  const startedAt = Date.now(); let diagnostic = '', spawnError: string | undefined;
  // Bounded in-memory classification; upstream text is never saved or displayed.
  const collect = (bytes: Buffer) => { diagnostic = (diagnostic + bytes.toString()).slice(-65536); };
  editor.stdout?.on('data', collect); editor.stderr?.on('data', collect);
  editor.once('error', error => { spawnError = (error as NodeJS.ErrnoException).code; });
  // close fires once after either a failed spawn or process exit and stream closure.
  editor.once('close', (code, signal) => {
    const complete = async () => {
      const report = await recordEditorExit(root, binary, profile.data, profile.env, startedAt, code, signal, diagnostic, spawnError).catch(() => undefined);
      const cleanExit = !spawnError && code === 0 && !signal;
      if (!cleanExit || (!configurationRestart.pending && !configurationRestart.busy && Date.now() - startedAt < 3000)) {
        await messageBox({ type: 'warning', ...editorExitPresentation(Date.now() - startedAt, code),
          detail: JSON.stringify(report ?? { code: 'EDITOR_DIAGNOSTIC_WRITE_FAILED' }, null, 2) + '\n진단 파일: ' + path.join(root, 'editor-startup-status.json') + '\n설정·키·사용자 코드·원본 로그는 포함하지 않습니다.' });
      }
      editor = undefined;
      if (!await configurationRestart.finish(cleanExit, shutdown, () => app.relaunch())) await shutdown();
      app.quit();
    };
    void complete().catch(() => {});
  });
}
start().catch(async error => {
  await app.whenReady();
  startup.close();
  await messageBox({ type: 'error', title: 'Ned 시작 실패', message: errorMessage(error) });
  try { studio.close(); await owner?.close(); await getRuntime().close(); await network.close(); } catch {}
  closed = true; app.quit();
});
