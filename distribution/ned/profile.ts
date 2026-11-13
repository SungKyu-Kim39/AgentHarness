import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { agentLaunch } from './agent-launch';
import { ensureEditorInstructions } from './editor-instructions';
import { editorPreferences, ensureEditorKeymap, writeEditorPreferences } from './editor-preferences';

/** All managed editor HTTP and CONNECT requests are denied. Agent traffic uses stdio. */
export class EditorNetwork {
  private server?: Server;
  async start() {
    this.server = createServer((_req, res) => res.writeHead(403).end('Ned offline editor'));
    this.server.on('connect', (_req, socket) => { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n', () => socket.destroy()); });
    await new Promise<void>((resolve, reject) => { this.server!.once('error', reject); this.server!.listen(0, '127.0.0.1', resolve); });
    const address = this.server.address(); if (!address || typeof address === 'string') throw new Error('Editor proxy failed');
    return 'http://127.0.0.1:' + address.port;
  }
  async close() { this.server?.closeAllConnections(); await new Promise<void>(resolve => { if (!this.server?.listening) resolve(); else this.server.close(() => resolve()); }); }
}
export function editorSettings(executable: string, agent: string, descriptor: string, proxy: string, clangd?: string) {
  return {
    telemetry: { diagnostics: false, metrics: false }, auto_update: false,
    restore_on_startup: 'launchpad',
    proxy, server_url: proxy, credentials_url: 'http://127.0.0.1:1/ned-private-credentials',
    auto_install_extensions: { html: false }, suggest_extensions: false,
    granted_extension_capabilities: [], language_servers: [], format_on_save: 'off',
    features: { edit_prediction_provider: 'none' }, show_edit_predictions: false,
    enable_language_server: false, enable_semantic_tokens: false,
    languages: {
      C: { language_servers: clangd ? ['clangd'] : [], enable_language_server: !!clangd },
      'C++': { language_servers: clangd ? ['clangd'] : [], enable_language_server: !!clangd },
    },
    lsp: clangd ? { clangd: { binary: { path: clangd, arguments: ['--background-index', '--clang-tidy=false'], ignore_system_version: false } } } : {},
    collaboration_panel: { button: false }, notification_panel: { button: false },
    title_bar: { show_onboarding_banner: false, show_sign_in: false },
    agent: { default_profile: 'ask', enable_feedback: false },
    agent_servers: { Ned: { type: 'custom', ...agentLaunch(executable, agent, descriptor) } },
    context_servers: {}, session: { trust_all_worktrees: false, restore_unsaved_buffers: true }, prettier: { allowed: false },
    // No per-user shell startup or shell environment extraction for the agent.
    load_direnv: 'disabled',
  };
}
export async function prepareEditor(root: string, executable: string, resources: string, descriptor: string, proxy: string) {
  const data = path.join(root, 'editor'), home = path.join(data, 'home');
  await mkdir(path.join(data, 'config'), { recursive: true, mode: 0o700 });
  await ensureEditorInstructions(path.join(data, 'config'));
  for (const directory of ['home', 'home/AppData/Local', 'home/AppData/Roaming', 'home/AppData/LocalLow', 'home/Desktop', 'home/Documents', 'home/Downloads', 'roaming', 'local', 'config-home', 'data', 'cache', 'state', 'tmp']) await mkdir(path.join(data, directory), { recursive: true, mode: 0o700 });
  const clangd = process.platform === 'win32' ? path.join(resources, 'runtime/windows-x64/mcp/clangd/clangd_23.1.0/bin/clangd.exe') : undefined;
  const settings = await editorPreferences(data,editorSettings(executable,path.join(resources,'ned/agent.cjs'),descriptor,proxy,clangd));
  await writeEditorPreferences(path.join(data,'config/settings.json'),settings);
  await ensureEditorKeymap(path.join(data,'config/keymap.json'));
  const env: NodeJS.ProcessEnv = {};
  for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'SystemDrive', 'ProgramFiles', 'ProgramFiles(x86)', 'ProgramW6432', 'ProgramData', 'PATHEXT', 'LANG', 'LC_ALL', 'DISPLAY', 'WAYLAND_DISPLAY', 'XAUTHORITY', 'DBUS_SESSION_BUS_ADDRESS', 'XDG_RUNTIME_DIR'])
    if (process.env[key]) env[key] = process.env[key];
  return { data, env: { ...env,
    HOME: home, USERPROFILE: home, APPDATA: path.join(home, 'AppData', 'Roaming'), LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
    XDG_CONFIG_HOME: path.join(data, 'config-home'), XDG_DATA_HOME: path.join(data, 'data'), XDG_CACHE_HOME: path.join(data, 'cache'), XDG_STATE_HOME: path.join(data, 'state'),
    PATH: process.platform === 'win32' ? ['System32', '', 'System32/Wbem', 'System32/WindowsPowerShell/v1.0'].map(p => path.join(process.env.SystemRoot ?? 'C:\\Windows', p)).join(path.delimiter) : '/usr/bin:/bin',
    ...(process.platform === 'win32' ? { ComSpec: path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/cmd.exe') } : {}),
    TEMP: path.join(data, 'tmp'), TMP: path.join(data, 'tmp'),
    HTTP_PROXY: proxy, HTTPS_PROXY: proxy, ALL_PROXY: proxy, http_proxy: proxy, https_proxy: proxy, all_proxy: proxy, NO_PROXY: '', no_proxy: '',
    DO_NOT_TRACK: '1', OTEL_SDK_DISABLED: 'true',
  } };
}
