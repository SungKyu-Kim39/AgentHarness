import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studioOrigin, studioRequestAllowed, studioCsp } from '../distribution/ned/studio-policy';
test('Studio allows only its exact private origin, bundled UI and non-admin API routes', () => {
  const origin = studioOrigin({ baseUrl: 'http://127.0.0.1:12345', headers: {} });
  for (const path of ['/studio/', '/studio/assets/code.js', '/health', '/api/v1/fs/ls?uri=viking%3A%2F%2Fuser', '/api/v1/skills']) assert.equal(studioRequestAllowed(origin, origin + path), true, path);
  for (const url of ['https://example.invalid/studio', 'http://127.0.0.1:12346/studio', 'http://localhost:12345/studio', origin + '/api/v1/admin/accounts', origin + '/mcp', origin + '/api/v1/config', origin + '/studio/%2e%2e/secret', 'file:///etc/passwd']) assert.equal(studioRequestAllowed(origin, url), false, url);
  for (const baseUrl of ['https://example.invalid', 'http://127.0.0.1', 'http://user:password@127.0.0.1:12345', origin + '/studio']) assert.throws(() => studioOrigin({ baseUrl, headers: {} }));
  assert.match(studioCsp, /connect-src 'self'/); assert.match(studioCsp, /object-src 'none'/);
});
