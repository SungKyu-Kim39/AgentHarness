// Run an isolated GUI fixture with the installed Electron runtime and exact installed preload bytes.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, copyFile, cp, link, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createPackage, extractFile } from '@electron/asar';
import { build } from 'esbuild';

const [installerRoot, fixtureRoot] = process.argv.slice(2);
if (!installerRoot || !fixtureRoot) throw Error('Expected installed Ned and temporary fixture folders');
const windows = process.platform === 'win32';
const image = path.join(fixtureRoot, 'ned-runtime');
const app = path.join(fixtureRoot, 'probe-app');
const resources = path.join(image, 'resources');
await mkdir(app, { recursive: true });
await mkdir(resources, { recursive: true });
const installedAsar = path.join(installerRoot, 'resources', 'app.asar');
await writeFile(path.join(app, 'user-mcp-preload.cjs'), extractFile(installedAsar, 'user-mcp-preload.cjs'));
await writeFile(path.join(app, 'package.json'), JSON.stringify({ name: 'ned-mcp-ui-probe', main: 'probe.cjs' }));
await build({ entryPoints: ['tests/user-mcp-window.fixture.ts'], outfile: path.join(app, 'probe.cjs'), bundle: true,
  platform: 'node', target: 'node22', format: 'cjs', external: ['electron'] });
await createPackage(app, path.join(resources, 'app.asar'));
for (const entry of await readdir(installerRoot, { withFileTypes: true })) {
  if (!entry.isFile() || entry.name === 'Uninstall Ned.exe') continue;
  const from = path.join(installerRoot, entry.name), to = path.join(image, entry.name);
  await link(from, to).catch(() => copyFile(from, to));
}
await cp(path.join(installerRoot, 'locales'), path.join(image, 'locales'), { recursive: true });
const testCert = path.join(fixtureRoot, 'test-cert.pem');
const testKey = path.join(fixtureRoot, 'test-key.pem');
const gitOpenSSL = path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Git', 'usr', 'bin', 'openssl.exe');
const openssl = windows && await access(gitOpenSSL).then(() => true, () => false) ? gitOpenSSL : 'openssl';
const tls = spawnSync(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2', '-subj', '/CN=localhost',
  '-addext', 'subjectAltName=IP:127.0.0.1,DNS:localhost', '-keyout', testKey, '-out', testCert], { shell: false, windowsHide: true, timeout: 15000 });
if (tls.error) throw tls.error;
assert.equal(tls.status, 0, tls.stderr?.toString() || 'Loopback HTTPS fixture certificate generation failed');
const env = { ...process.env, NED_MCP_UI_FIXTURE_ROOT: fixtureRoot, NODE_EXTRA_CA_CERTS: testCert };
delete env.ELECTRON_RUN_AS_NODE;
const executable = path.join(image, windows ? 'Ned.exe' : 'electron');
const flags = windows ? ['--disable-gpu'] : ['--no-sandbox', '--ozone-platform=headless', '--disable-gpu'];
const result = spawnSync(executable, flags, { env, timeout: 45000, windowsHide: true, stdio: 'inherit' });
if (result.error) throw result.error;
assert.equal(result.status, 0, 'Installed Ned management-window fixture did not finish');
const proof = JSON.parse(await readFile(path.join(fixtureRoot, 'result.json'), 'utf8'));
for (const key of ['loadedFromAsar', 'registered', 'checked', 'persistence']) assert.equal(proof[key], true, key);
assert.equal(proof.transport, 'https-loopback');
console.log(JSON.stringify(proof));
