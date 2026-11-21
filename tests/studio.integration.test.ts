import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { OpenVikingService } from '../src/main/openviking';
import { configSchema } from '../src/shared/contracts';
import { initializeStudioStorage, studioCsp, studioHeaders, studioOrigin, studioRenderProbe, studioRequestAllowed } from '../distribution/ned/studio-policy';
const python = path.resolve('.cache/openviking/env-linux/bin/python3');
const browserPath = process.env.NED_TEST_BROWSER ?? '/usr/bin/chromium';
test('actual bundled Studio renders with injected private-account headers and no external access', { skip: !existsSync(python) || !existsSync(browserPath), timeout: 90000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-studio-')); await cp('vendor/runtime/windows-x64/openviking/tokenizers', path.join(root, 'tokenizers'), { recursive: true });
  const service = new OpenVikingService(root, root, () => {}, { executable: python, launcher: path.resolve('scripts/openviking-launch.py'), cwd: root });
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  t.after(async () => { await browser?.close(); await service.close(); await rm(root, { recursive: true, force: true }); });
  await assert.rejects(service.studioConnection(), /준비/);
  await service.configure(configSchema.parse({ model: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'synthetic-vlm', id: 'test' }, openViking: { embedding: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'synthetic-embedding', id: 'test', dimension: 4 } } }));
  assert.equal(service.state().status, 'ready', service.state().message);
  const connection = await service.studioConnection(), origin = studioOrigin(connection);
  assert.equal(connection.headers['X-OpenViking-Account'], 'ned'); assert.equal(connection.headers['X-OpenViking-Role'], 'admin');
  browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext(); const denied: string[] = [];
  await context.route('**/*', async route => {
    const url = route.request().url();
    if (!studioRequestAllowed(origin, url)) { denied.push(new URL(url).origin); await route.abort(); return; }
    try {
      const response = await route.fetch({ headers: studioHeaders(connection, url, route.request().headers()), maxRedirects: 0 });
      await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': studioCsp } });
    } catch { await route.abort().catch(() => {}); }
  });
  const page = await context.newPage(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript({ content: `(${initializeStudioStorage.toString()})(location.origin, localStorage, sessionStorage);` });
  await page.goto(origin + '/studio/', { waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(studioRenderProbe), 'ready');
  const text = await page.locator('body').innerText();
  assert.ok(text.length > 40, text); assert.match(text, /OpenViking|Workspace|Skills|Dashboard/i);
  const listing = await page.evaluate(async () => {
    const response = await fetch('/api/v1/system/status'); return { status: response.status, body: await response.json() };
  });
  assert.equal(listing.status, 200); assert.equal(listing.body.status, 'ok');
  assert.ok(!text.includes('Choose a service'), 'managed Studio must skip connection onboarding');
  assert.ok(!text.includes('Configure trusted authentication'), 'host-managed authentication must reach the workspace');
  await page.getByRole('link', { name: 'Filesystem', exact: true }).click();
  await page.waitForLoadState('networkidle');
  assert.ok(!await page.getByText('Configure trusted authentication').count());
  assert.deepEqual(errors, []);
  const leak = await page.evaluate(() => ({ text: document.body.innerText, storage: JSON.stringify(localStorage) }));
  for (const value of Object.values(connection.headers)) if (value.length > 20) assert.ok(!JSON.stringify(leak).includes(value));
  assert.ok(denied.every(value => value === origin), 'all external attempts must be blocked before dispatch');
  t.diagnostic('Actual OpenViking 0.5.5 Studio SPA rendered in isolated Chromium. Electron window/tray and real Windows GUI acceptance remain separate.');
});
