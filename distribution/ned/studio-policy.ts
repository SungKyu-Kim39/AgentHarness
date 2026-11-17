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
export function studioBootstrap(origin: string) {
  studioOrigin({ baseUrl: origin, headers: {} });
  // A public sentinel satisfies the upstream key-presence UI check. It cannot
  // authenticate anything: every actual request header is replaced by the host.
  const connection = { baseUrl: origin, accountId: 'ned', userId: 'local-user', apiKey: '', adminApiKey: 'ned-managed-by-host', authMode: 'trusted', serviceSelection: 'opensource' };
  return `if(location.origin!==${JSON.stringify(origin)})throw new Error('Studio origin');
localStorage.setItem('ov_console_connection',${JSON.stringify(JSON.stringify(connection))});
localStorage.setItem('ov_console_connection_profiles',${JSON.stringify(JSON.stringify({ activeId: 'ned-managed', profiles: [{ id: 'ned-managed', name: 'Ned', connection, workbenchIdentity: { accountId: 'ned', userId: 'local-user', apiKey: '' } }] }))});
localStorage.setItem('ov_studio_setup','complete');
localStorage.setItem('ov_studio_entry_profile:ned-managed','workbench');
localStorage.setItem('i18nextLng','en');
sessionStorage.setItem('ov_studio_workspace_selected','selected');`;
}
