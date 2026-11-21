export interface StudioConnection { baseUrl: string; headers: Record<string, string> }
export function studioOrigin(connection: StudioConnection) {
  const url = new URL(connection.baseUrl);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.pathname !== '/' || url.search || url.hash || url.username || url.password)
    throw new Error('Ned가 관리하는 로컬 OpenViking만 열 수 있습니다.');
  return url.origin;
}
export function studioRequestAllowed(origin: string, value: string) {
  try {
    const url = new URL(value);
    if (url.origin !== origin || url.username || url.password || /%2f|%5c|%2e|\\/i.test(url.pathname)) return false;
    return url.pathname === '/studio' || url.pathname.startsWith('/studio/') || ['/health', '/ready', '/favicon.ico', '/favicon.png'].includes(url.pathname) ||
      /^\/api\/v1\/(fs|content|resources|skills|search|sessions|pack|observer|stats|tasks|console|privacy-configs)(\/|$)/.test(url.pathname) ||
      /^\/api\/v1\/system\/(status|wait|consistency)$/.test(url.pathname);
  } catch { return false; }
}
export const studioCsp = "default-src 'self'; script-src 'self' 'sha256-VOJLki7o5gkOb2u+he3o1ABQAVWyxBF7jGDloARlJ8Y=' blob: 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'";
export function studioHeaders(connection: StudioConnection, url: string, supplied: Record<string, string>) {
  const headers = { ...supplied };
  for (const key of Object.keys(headers)) if (/^(authorization$|x-api-key$|x-openviking-)/i.test(key)) delete headers[key];
  if (studioRequestAllowed(studioOrigin(connection), url)) Object.assign(headers, connection.headers);
  return headers;
}
/** Public connection hints only. The host injects all authentication headers. */
export function initializeStudioStorage(origin: string, local: Storage, page: Storage) {
  // A public sentinel satisfies the upstream key-presence UI check. It cannot
  // authenticate anything: every actual request header is replaced by the host.
  const connection = { baseUrl: origin, accountId: 'ned', userId: 'local-user', apiKey: '', adminApiKey: 'ned-managed-by-host', authMode: 'trusted', serviceSelection: 'opensource' };
  local.setItem('ov_console_connection', JSON.stringify(connection));
  local.setItem('ov_console_connection_profiles', JSON.stringify({ activeId: 'ned-managed', profiles: [{ id: 'ned-managed', name: 'Ned', connection, workbenchIdentity: { accountId: 'ned', userId: 'local-user', apiKey: '' } }] }));
  local.setItem('ov_studio_setup','complete');
  local.setItem('ov_studio_entry_profile:ned-managed','workbench');
  local.setItem('i18nextLng','en');
  page.setItem('ov_studio_workspace_selected','selected');
}



// The pinned SPA mounts its interface under #app. A text-only mount is
// the upstream credential-storage failure path, even in translated builds.
export const studioRenderProbe = `(async () => {
  const app = document.getElementById('app');
  if (!app) return 'waiting';
  if (app.querySelector('[data-slot="sidebar-wrapper"]')) {
    try {
      const response = await fetch('/api/v1/system/status', { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(3000) });
      if (response.status === 401 || response.status === 403) return 'auth';
      return response.ok && (await response.json()).status === 'ok' ? 'ready' : 'api';
    } catch { return 'waiting'; }
  }
  return !app.childElementCount && app.textContent.trim() ? 'credential-storage' : 'waiting';
})()`;
