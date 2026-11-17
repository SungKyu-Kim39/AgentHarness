import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { createServer, request, type ClientRequest, type Server } from 'node:http';
import { validateManagedZedSettings } from './zed-settings';
import { terminalShell, ensureTerminalTasks } from './terminal';
import type { ZedConnection } from './zed-models';
import { agentLaunch } from './agent-launch';
import { ensureEditorInstructions } from './editor-instructions';
import { editorPreferences, ensureEditorKeymap, writeEditorPreferences } from './editor-preferences';

/** Editor HTTP is limited to the run-owned native-agent model endpoint. */
export class EditorNetwork {
  private server?: Server;
  private active = new Set<ClientRequest>();
  constructor(private diagnostic:(code:string)=>void=()=>{}){}
  async start(modelBaseUrl?: string) {
    const allowed = modelBaseUrl ? new URL(modelBaseUrl) : undefined;
    if (allowed && (allowed.protocol !== 'http:' || allowed.hostname !== '127.0.0.1' || allowed.pathname !== '/v1' || allowed.username || allowed.password || allowed.search || allowed.hash)) throw new Error('앱 소유의 로컬 Zed 모델 주소만 허용합니다.');
    this.server = createServer((req, res) => {
      let target: URL;
      try {
        const address=this.server?.address();const own=address&&typeof address!=='string'?`http://127.0.0.1:${address.port}`:undefined;
        target = new URL(req.url ?? '',own);
        if((req.url??'').startsWith('/')&&! [new URL(own!).host,allowed?.host].includes(req.headers.host)){this.diagnostic('EDITOR_PROXY_HOST');res.writeHead(403).end('Ned offline editor');return;}
      } catch { this.diagnostic('EDITOR_PROXY_URL');res.writeHead(403).end('Ned offline editor'); return; }
      const address=this.server?.address(),own=address&&typeof address!=='string'?`http://127.0.0.1:${address.port}`:'';
      if (!allowed || req.method !== 'POST' || ![allowed.origin,own].includes(target.origin) || target.pathname !== '/v1/chat/completions' || target.search || target.hash || target.username || target.password) { this.diagnostic('EDITOR_PROXY_ROUTE');res.writeHead(403).end('Ned offline editor'); return; }
      const operation = request(allowed.origin + '/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}) } }, response => {
        res.writeHead(response.statusCode ?? 502, { 'Content-Type': response.headers['content-type'] ?? 'application/json', 'Cache-Control': 'no-store' });
        response.on('error', () => res.destroy()); response.pipe(res);
      });
      this.active.add(operation); operation.once('close', () => this.active.delete(operation));
      operation.on('error', () => { if (!res.headersSent) res.writeHead(502).end(); else res.destroy(); });
      res.once('close', () => operation.destroy()); req.once('aborted', () => operation.destroy()); req.pipe(operation);
    });
    this.server.requestTimeout = 0;
    this.server.on('connect', (_req, socket) => { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n', () => socket.destroy()); });
    await new Promise<void>((resolve, reject) => { this.server!.once('error', reject); this.server!.listen(0, '127.0.0.1', resolve); });
    const address = this.server.address(); if (!address || typeof address === 'string') throw new Error('Editor proxy failed');
    return 'http://127.0.0.1:' + address.port;
  }
  async close() { for (const operation of this.active) operation.destroy(); this.server?.closeAllConnections(); await new Promise<void>(resolve => { if (!this.server?.listening) resolve(); else this.server.close(() => resolve()); }); }
}
export function editorSettings(executable: string, agent: string, descriptor: string, proxy: string, clangd?: string, platform: NodeJS.Platform = process.platform, native?: Pick<ZedConnection, 'baseUrl' | 'models' | 'defaultModel'>) {
  return {
    telemetry: { diagnostics: false, metrics: false }, auto_update: false,
    restore_on_startup: 'launchpad',
    ...(platform === 'win32' ? { terminal: { shell: terminalShell('powershell'), working_directory: 'current_project_directory' } } : {}),
    // Avoid the native picker callback crash in the managed Windows editor.
    // Ned's tray picker uses the host's real Windows shell profile instead.
    ...(platform === 'win32' ? { use_system_path_prompts: false } : {}),
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
    agent: { default_profile: native ? 'write' : 'ask', enable_feedback: false, ...(native ? { default_model: { provider: 'Intranet', model: native.defaultModel }, profiles: Object.fromEntries(['write', 'ask', 'minimal'].map(id => [id, { name: ({write:'Write',ask:'Ask',minimal:'Minimal'} as Record<string,string>)[id], enable_all_context_servers: false, context_servers: {}, tools: { fetch: false, search_web: false } }])) } : {}) },
    ...(native ? { language_models: { openai_compatible: { Intranet: { api_url: proxy.replace(/\/$/,'')+'/v1', available_models: native.models } } } } : {}),
    agent_servers: { Ned: { type: 'custom', ...agentLaunch(executable, agent, descriptor) } },
    context_servers: {}, session: { trust_all_worktrees: false, restore_unsaved_buffers: true }, prettier: { allowed: false },
    // No per-user shell startup or shell environment extraction for the agent.
    load_direnv: 'disabled',
  };
}
export async function prepareEditor(root: string, executable: string, resources: string, descriptor: string, proxy: string, native?: ZedConnection) {
  const data = path.join(root, 'editor'), home = path.join(data, 'home');
  await mkdir(path.join(data, 'config'), { recursive: true, mode: 0o700 });
  await ensureEditorInstructions(path.join(data, 'config'));
  for (const directory of ['home', 'home/AppData/Local', 'home/AppData/Roaming', 'home/AppData/LocalLow', 'home/Desktop', 'home/Documents', 'home/Downloads', 'roaming', 'local', 'config-home', 'data', 'cache', 'state', 'tmp']) await mkdir(path.join(data, directory), { recursive: true, mode: 0o700 });
  const clangd = process.platform === 'win32' ? path.join(resources, 'runtime/windows-x64/mcp/clangd/clangd_23.1.0/bin/clangd.exe') : undefined;
  const settings = await editorPreferences(data,editorSettings(executable,path.join(resources,'ned/agent.cjs'),descriptor,proxy,clangd,process.platform,native));
  validateManagedZedSettings(settings);
  await writeEditorPreferences(path.join(data,'config/settings.json'),settings);
  await ensureEditorKeymap(path.join(data,'config/keymap.json'));
  const env: NodeJS.ProcessEnv = {};
  for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'SystemDrive', 'ProgramFiles', 'ProgramFiles(x86)', 'ProgramW6432', 'ProgramData', 'PATHEXT', 'LANG', 'LC_ALL', 'DISPLAY', 'WAYLAND_DISPLAY', 'XAUTHORITY', 'DBUS_SESSION_BUS_ADDRESS', 'XDG_RUNTIME_DIR'])
    if (process.env[key]) env[key] = process.env[key];
  const systemRoot = process.env.SystemRoot ?? 'C:\\Windows';
  const gitConfig = path.join(data, 'config/git/config');
  if (process.platform === 'win32') {
    // Zed watches config/git/config and refreshes Git access on changes.
    await mkdir(path.dirname(gitConfig), { recursive: true, mode: 0o700 });
  }
  return { data, env: { ...env,
    HOME: home, USERPROFILE: home, APPDATA: path.join(home, 'AppData', 'Roaming'), LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
    XDG_CONFIG_HOME: path.join(data, 'config-home'), XDG_DATA_HOME: path.join(data, 'data'), XDG_CACHE_HOME: path.join(data, 'cache'), XDG_STATE_HOME: path.join(data, 'state'),
    PATH: process.platform === 'win32'
      ? [path.join(resources, 'runtime/windows-x64/mcp/git/cmd'),
          ...['System32', '', 'System32/Wbem', 'System32/WindowsPowerShell/v1.0'].map(p => path.join(systemRoot, p))].join(path.delimiter)
      : '/usr/bin:/bin',
    ...(process.platform === 'win32' ? {
      ComSpec: path.join(systemRoot, 'System32/cmd.exe'),
      GIT_CONFIG_GLOBAL: gitConfig,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_ALLOW_PROTOCOL: '',
      GIT_TERMINAL_PROMPT: '0',
    } : {}),
    TEMP: path.join(data, 'tmp'), TMP: path.join(data, 'tmp'),
    HTTP_PROXY: proxy, HTTPS_PROXY: proxy, ALL_PROXY: proxy, http_proxy: proxy, https_proxy: proxy, all_proxy: proxy, NO_PROXY: '', no_proxy: '',
    DO_NOT_TRACK: '1', OTEL_SDK_DISABLED: 'true',
    ...(native ? { INTRANET_API_KEY: native.token } : {}),
  } };
}
