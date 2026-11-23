import { BrowserWindow, screen } from 'electron';

/**
 * Provides an invisible always-on-top owner BrowserWindow centered on the active display
 * so native Windows dialogs (approval prompts and file/folder pickers) appear above Zed.
 */
export async function withTopmostDialogOwner<T>(task: (owner: BrowserWindow) => Promise<T>): Promise<T> {
  const workArea = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const x = Math.round(workArea.x + workArea.width / 2);
  const y = Math.round(workArea.y + workArea.height / 2);
  const owner = new BrowserWindow({
    x,
    y,
    width: 1,
    height: 1,
    show: false,
    frame: false,
    opacity: 0,
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: true,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, devTools: false },
  });
  try {
    owner.setAlwaysOnTop(true, 'screen-saver');
    owner.show();
    owner.moveTop();
    owner.focus();
    return await task(owner);
  } finally {
    if (!owner.isDestroyed()) owner.destroy();
  }
}
