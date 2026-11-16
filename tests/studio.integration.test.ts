import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { OpenVikingService } from '../src/main/openviking';
import { configSchema } from '../src/shared/contracts';
import { studioCsp, studioOrigin, studioRequestAllowed } from '../distribution/ned/studio-policy';
const python = path.resolve('.cache/openviking/env-linux/bin/python3');
const browserPath = process.env.NED_TEST_BROWSER ?? '/usr/bin/chromium';
test('actual bundled Studio renders with injected private-account headers and no external access', { skip: !existsSync(python) || !existsSync(browserPath), timeout: 90000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-studio-')); await cp('vendor/runtime/windows-x64/openviking/tokenizers', path.join(root, 'tokenizers'), { recursive: true });
  const service = new OpenVikingService(root, root, () => {}, { executable: python, launcher: path.resolve('scripts/openviking-launch.py'), cwd: root });
  t.after(async () => { await service.close(); await rm(root, { recursive: true, force: true }); });
  await assert.rejects(service.studioConnection(), /준비/);
  await service.configure(configSchema.parse({ model: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'synthetic-vlm', id: 'test' }, openViking: { embedding: { baseUrl: 'http://127.0.0.1:9/v1', apiKey: 'synthetic-embedding', id: 'test', dimension: 4 } } }));
  assert.equal(service.state().status, 'ready', service.state().message);
  const connection = await service.studioConnection(), origin = studioOrigin(connection);
  assert.equal(connection.headers['X-OpenViking-Account'], 'ned'); assert.equal(connection.headers['X-OpenViking-Role'], 'admin');
  const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] }); t.after(() => browser.close());
  const context = await browser.newContext(); const denied: string[] = [];
  await context.route('**/*', async route => {
    const url = route.request().url();
    if (!studioRequestAllowed(origin, url)) { denied.push(new URL(url).origin); await route.abort(); return; }
    const response = await route.fetch({ headers: { ...route.request().headers(), ...connection.headers }, maxRedirects: 0 });
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': studioCsp } });
  });
  const page = await context.newPage(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/studio/', { waitUntil: 'networkidle' });
  const text = await page.locator('body').innerText();
  assert.ok(text.length > 40, text); assert.match(text, /OpenViking|Workspace|Skills|Dashboard/i);
  assert.deepEqual(errors, []);
  const leak = await page.evaluate(() => ({ text: document.body.innerText, storage: JSON.stringify(localStorage) }));
  for (const value of Object.values(connection.headers)) if (value.length > 20) assert.ok(!JSON.stringify(leak).includes(value));
  assert.ok(denied.every(value => value === origin), 'all external attempts must be blocked before dispatch');
  t.diagnostic('Actual OpenViking 0.5.5 Studio SPA rendered in isolated Chromium. Electron window/tray and real Windows GUI acceptance remain separate.');
});
