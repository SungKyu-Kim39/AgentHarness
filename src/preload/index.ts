import { contextBridge, ipcRenderer } from "electron";
import type { AppState, VibeAPI, Request } from "../shared/contracts";
const api: VibeAPI = Object.freeze({
  invoke: (request: Request) => ipcRenderer.invoke("l-vibe:invoke", request),
  subscribe: (listener: (state: AppState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: AppState) =>
      listener(state);
    ipcRenderer.on("l-vibe:state", handler);
    return () => {
      ipcRenderer.removeListener("l-vibe:state", handler);
    };
  },
});
contextBridge.exposeInMainWorld("vibe", api);
