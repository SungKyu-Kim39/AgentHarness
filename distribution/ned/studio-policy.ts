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
export const studioCsp = "default-src 'self'; script-src 'self' blob: 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'";
