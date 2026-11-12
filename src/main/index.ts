import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  safeStorage,
  session,
} from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { requestSchema } from "../shared/contracts";
import { ConfigVault } from "./config";
import { Host } from "./host";
app.setName("Ned");
app.setPath("userData", path.join(app.getPath("appData"), "Ned"));
app.commandLine.appendSwitch("disable-background-networking");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("disable-sync");
app.commandLine.appendSwitch("disable-domain-reliability");
let window: BrowserWindow | undefined;
let host: Host | undefined;
let quitting = false;
const locked = app.requestSingleInstanceLock();
if (!locked) app.quit();
app.on("second-instance", () => {
  window?.show();
  window?.focus();
});
app.whenReady().then(async () => {
  if (!locked) return;
  const dev =
    !app.isPackaged &&
    process.env.L_VIBE_DEV_URL === "http://127.0.0.1:5173";
  const page = pathToFileURL(
    path.join(__dirname, "../renderer/index.html"),
  ).href;
  session.defaultSession.setPermissionRequestHandler(
    (_web, _permission, callback) => callback(false),
  );
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    callback({
      cancel: !(
        url.startsWith("file://") ||
        url.startsWith("data:") ||
        (dev && /^https?:\/\/127\.0\.0\.1:5173\//.test(url)) ||
        (dev && url.startsWith("ws://127.0.0.1:5173/"))
      ),
    });
  });
  window = new BrowserWindow({
    width: 1500,
    height: 960,
    minWidth: 1040,
    minHeight: 680,
    title: "Ned",
    icon: app.isPackaged ? path.join(process.resourcesPath, 'assets/ned-icon.png') : path.join(app.getAppPath(), 'assets/ned-icon.png'),
    backgroundColor: "#f7f8fa",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: false,
    },
  });
  window.removeMenu();
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event) => event.preventDefault());
  window.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  host = new Host({
    data: app.getPath("userData"),
    runtime: app.isPackaged
      ? path.join(process.resourcesPath, "runtime")
      : path.join(app.getAppPath(), "vendor/runtime"),
    methodologies: app.isPackaged
      ? path.join(process.resourcesPath, "methodologies")
      : path.join(app.getAppPath(), "vendor/sources"),
    skills: app.isPackaged ? path.join(process.resourcesPath, 'skills') : path.join(app.getAppPath(), 'vendor/skills'),
    vault: new ConfigVault(app.getPath("userData"), {
      isEncryptionAvailable: () =>
        safeStorage.isEncryptionAvailable() &&
        !(
          process.platform === "linux" &&
          safeStorage.getSelectedStorageBackend() === "basic_text"
        ),
      encryptString: (value) => safeStorage.encryptString(value),
      decryptString: (value) => safeStorage.decryptString(value),
    }),
    chooseProject: async () => {
      const result = await dialog.showOpenDialog(window!, {
        title: "프로젝트 폴더 선택",
        properties: ["openDirectory"],
      });
      return result.canceled ? undefined : result.filePaths[0];
    },
    chooseConfig: async () => {
      const result = await dialog.showOpenDialog(window!, {
        title: "모델 설정 JSON 가져오기",
        filters: [{ name: "JSON 설정", extensions: ["json"] }],
        properties: ["openFile"],
      });
      return result.canceled ? undefined : result.filePaths[0];
    },
    changed: (state) => {
      if (window && !window.isDestroyed())
        window.webContents.send("l-vibe:state", state);
    },
  });
  ipcMain.handle("l-vibe:invoke", async (event, input) => {
    if (
      event.sender !== window?.webContents ||
      event.senderFrame !== window.webContents.mainFrame ||
      (dev
        ? new URL(event.senderFrame.url).origin !== "http://127.0.0.1:5173"
        : event.senderFrame.url !== page)
    )
      return { ok: false, error: "허용되지 않는 IPC 출처입니다." };
    const parsed = requestSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: "IPC 요청 형식이 올바르지 않습니다." };
    return host!.handle(parsed.data);
  });
  await host.initialize();
  if (dev) await window.loadURL("http://127.0.0.1:5173");
  else await window.loadFile(path.join(__dirname, "../renderer/index.html"));
  window.show();
});
app.on("window-all-closed", () => app.quit());
app.on("before-quit", (event) => {
  if (!quitting && host) {
    event.preventDefault();
    quitting = true;
    void host.close().finally(() => app.quit());
  }
});
