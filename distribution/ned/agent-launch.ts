import path from 'node:path';
/** Zed's Windows shell must track a console process, not the GUI-subsystem Electron image. */
export function agentLaunch(executable: string, agent: string, descriptor: string, platform: NodeJS.Platform = process.platform) {
  const env = { ELECTRON_RUN_AS_NODE: '1' };
  if (platform !== 'win32') return { command: executable, args: [agent, descriptor], env };
  const paths = path.win32;
  if (![executable, agent, descriptor].every(value => paths.isAbsolute(value))) throw new Error('Managed agent paths must be absolute');
  const resources = paths.dirname(paths.dirname(agent));
  return {
    command: paths.join(resources, 'runtime/windows-x64/openviking/python/python.exe'),
    args: ['-I', '-B', paths.join(resources, 'runtime/windows-x64/openviking/sidecar-supervisor.py'), executable, agent, descriptor],
    env,
  };
}
