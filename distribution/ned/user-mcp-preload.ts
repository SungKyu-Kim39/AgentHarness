import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nedMcp', {
  request: (action: string, input?: unknown) => ipcRenderer.invoke('ned-user-mcp', action, input),
});
