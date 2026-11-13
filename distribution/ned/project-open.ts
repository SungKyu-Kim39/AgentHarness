import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execute = promisify(execFile);

/** The host owns the real Windows shell picker; the editor retains its private home. */
export function projectOpenCommand(resources: string, data: string, directory: string, platform: NodeJS.Platform = process.platform) {
  const paths = platform === 'win32' ? path.win32 : path.posix;
  for (const value of [resources, data, directory]) if (!paths.isAbsolute(value) || value.includes('\0')) throw new Error('Absolute project paths required');
  return {
    file: paths.join(resources, platform === 'win32' ? 'zed/bin/zed.exe' : 'zed/zed.app/bin/zed'),
    args: ['--user-data-dir', data, '--reuse', '--', directory],
    cwd: paths.join(data, 'home'),
  };
}
export class ProjectOpener {
  private busy = false;
  async open(options: {
    alive: () => boolean;
    choose: () => Promise<string | undefined>;
    canonical: (directory: string) => Promise<string>;
    dispatch: (directory: string) => Promise<void>;
    selected: (directory: string) => void;
  }) {
    if (this.busy || !options.alive()) return;
    this.busy = true;
    try {
      const selected = await options.choose();
      if (!selected) return;
      const directory = await options.canonical(selected);
      if (!options.alive()) throw new Error('편집기가 종료되었습니다. Ned를 다시 실행하세요.');
      await options.dispatch(directory);
      if (!options.alive()) throw new Error('편집기가 종료되었습니다. Ned를 다시 실행하세요.');
      options.selected(directory);
    } finally { this.busy = false; }
  }
}
export async function dispatchProject(command: ReturnType<typeof projectOpenCommand>, env: NodeJS.ProcessEnv) {
  // Fixed bundled executable and argv; no shell, personal launcher or PATH discovery.
  await execute(command.file, command.args, { cwd: command.cwd, env, windowsHide: true, timeout: 30000, maxBuffer: 65536 });
}
