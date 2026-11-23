import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STUDIO_RENDER_TIMEOUT_MS, sanitizeStudioUrl, studioHeaders, studioOrigin, studioRequestAllowed, studioResponseHeaders, studioStaticContentType, studioCsp } from '../distribution/ned/studio-policy';
test('Studio allows only its exact private origin, bundled UI, same-origin blobs and non-admin API routes', () => {
  const origin = studioOrigin({ baseUrl: 'http://127.0.0.1:12345', headers: {} });
  for (const path of ['/studio', '/studio/', '/studio/assets/code.js', '/health', '/api/v1/fs/ls?uri=viking%3A%2F%2Fuser', '/api/v1/skills']) assert.equal(studioRequestAllowed(origin, origin + path), true, path);
  assert.equal(studioRequestAllowed(origin, `blob:${origin}/550e8400-e29b-41d4-a716-446655440000`), true);
  assert.equal(studioRequestAllowed(origin, 'blob:https://example.invalid/550e8400-e29b-41d4-a716-446655440000'), false);
  for (const url of ['https://example.invalid/studio', 'http://127.0.0.1:12346/studio', 'http://localhost:12345/studio', origin + '/api/v1/admin/accounts', origin + '/mcp', origin + '/api/v1/config', origin + '/studio/%2e%2e/secret', 'file:///etc/passwd']) assert.equal(studioRequestAllowed(origin, url), false, url);
  for (const baseUrl of ['https://example.invalid', 'http://127.0.0.1', 'http://user:password@127.0.0.1:12345', origin + '/studio']) assert.throws(() => studioOrigin({ baseUrl, headers: {} }));
  const blobHeaders = studioHeaders({ baseUrl: origin, headers: { Authorization: 'Bearer secret' } }, `blob:${origin}/id`, {});
  assert.equal(blobHeaders.Authorization, undefined);
  assert.equal(STUDIO_RENDER_TIMEOUT_MS, 30000);
  assert.equal(sanitizeStudioUrl(`${origin}/api/v1/fs/ls?token=secret123&uri=viking://user`), `${origin}/api/v1/fs/ls?token=%5BREDACTED%5D&uri=viking%3A%2F%2Fuser`);
  assert.match(studioCsp, /connect-src 'self'/); assert.match(studioCsp, /object-src 'none'/); assert.match(studioCsp, /font-src 'self' data: blob:/);
});

test('Studio response headers normalize Windows-registry-corrupted JS/CSS/WASM MIME types without touching API or error responses', () => {
  const origin = studioOrigin({ baseUrl: 'http://127.0.0.1:12345', headers: {} });
  const jsHeaders = studioResponseHeaders(origin, origin + '/studio/assets/index-UnJqJNrj.js', 200, { 'content-type': ['text/plain; charset=utf-8'], 'Content-Security-Policy': ['default-src *'] });
  assert.deepEqual(jsHeaders['Content-Type'], ['text/javascript; charset=utf-8']);
  assert.equal(jsHeaders['content-type'], undefined);
  assert.deepEqual(jsHeaders['Content-Security-Policy'], [studioCsp]);
  assert.equal(studioStaticContentType(origin, origin + '/studio/assets/app.mjs', 200), 'text/javascript; charset=utf-8');
  assert.equal(studioStaticContentType(origin, origin + '/studio/assets/style.css', 200), 'text/css; charset=utf-8');
  assert.equal(studioStaticContentType(origin, origin + '/studio/assets/worker.wasm', 200), 'application/wasm');
  assert.equal(studioStaticContentType(origin, origin + '/studio/assets/logo.svg', 200), 'image/svg+xml');
  assert.equal(studioStaticContentType(origin, origin + '/studio/', 200), 'text/html; charset=utf-8');
  // API routes and non-2xx responses must keep server Content-Type untouched
  const apiHeaders = studioResponseHeaders(origin, origin + '/api/v1/fs/ls?path=file.js', 200, { 'content-type': ['application/json'] });
  assert.deepEqual(apiHeaders['content-type'], ['application/json']);
  assert.equal(apiHeaders['Content-Type'], undefined);
  assert.equal(studioStaticContentType(origin, origin + '/studio/assets/missing.js', 404), undefined);
});
