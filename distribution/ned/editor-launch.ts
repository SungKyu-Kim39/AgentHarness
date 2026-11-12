import path from 'node:path';
/** A blank launch never treats the app's working directory as a project. */
export function editorLaunch(data: string, platform: NodeJS.Platform = process.platform) {
  const paths = platform === 'win32' ? path.win32 : path.posix;
  if (!paths.isAbsolute(data)) throw new Error('Editor data directory must be absolute');
  return { args: [...(platform === 'win32' ? ['--foreground'] : []), '--user-data-dir', data], cwd: paths.join(data, 'home') };
}
