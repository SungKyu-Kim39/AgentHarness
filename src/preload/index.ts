import { contextBridge, ipcRenderer } from "electron";
import type { AppState, VibeAPI, Request } from "../shared/contracts";
const api: VibeAPI = Object.freeze({
  invoke: (request: Request) => ipcRenderer.invoke("ned:invoke", request),
  subscribe: (listener: (state: AppState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: AppState) =>
      listener(state);
    ipcRenderer.on("ned:state", handler);
    return () => {
      ipcRenderer.removeListener("ned:state", handler);
    };
  },
});
contextBridge.exposeInMainWorld("vibe", api);
