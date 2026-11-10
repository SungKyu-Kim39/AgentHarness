import { readFile, writeFile, mkdir, mkdtemp, rename, rm, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPatches, digest } from '../distribution/patches.mjs';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(project, '.cache/l-vibe-desktop');
const preparedSource = path.join(cache, 'source');
const lock = JSON.parse(await readFile(path.join(project, 'upstream-lock.json'), 'utf8'));
const overlays = ['distribution/patches.mjs', 'distribution/l-vibe-environment.ts', 'distribution/windows-installer.nsh', 'assets/lig-icon.png', 'assets/lig-icon.ico'];
async function fingerprint() { return digest(Buffer.concat(await Promise.all(overlays.map(f => readFile(path.join(project, f)))))); }
async function verify() {
  const manifest = JSON.parse(await readFile(path.join(preparedSource, '.l-vibe-patches.json'), 'utf8'));
  if (manifest.upstreamCommit !== lock.commit || manifest.overlayFingerprint !== await fingerprint()) throw new Error('Desktop patch version changed; run npm run desktop:prepare');
  for (const [file, sha] of Object.entries(manifest.files)) if (digest(await readFile(path.join(preparedSource, file))) !== sha) throw new Error(`Prepared Desktop file changed: ${file}`);
  for (const [file, sha] of Object.entries(lock.files)) if (!(file in manifest.files) && digest(await readFile(path.join(preparedSource, file))) !== sha) throw new Error(`Upstream boundary changed: ${file}`);
  console.log(`Verified L-Vibe Desktop foundation: ${lock.tag} @ ${lock.commit}; ${Object.keys(manifest.files).length} patched files.`);
}
async function prepare() {
  await mkdir(cache, { recursive: true });
  try { await access(path.join(preparedSource, '.l-vibe-patches.json')); await verify(); return; }
  catch { /* Rebuild a stale generated tree from the archive; never patch it twice. */ }
  const archive = path.join(cache, 'upstream.tar.gz');
  const existing = path.join(project, '.cache/opencode-desktop/upstream.tar.gz');
  let bytes = await readFile(archive).catch(() => readFile(existing).catch(() => undefined));
  if (!bytes) {
    const response = await fetch(lock.archive.url, { signal: AbortSignal.timeout(180000) });
    if (!response.ok) throw new Error(`Upstream download HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (digest(bytes) !== lock.archive.sha256) throw new Error('Upstream archive integrity mismatch');
  await writeFile(archive, bytes);
  const stage = await mkdtemp(path.join(cache, 'stage-'));
  try {
    execFileSync('tar', ['-xzf', archive, '--strip-components=1', '-C', stage]);
    const manifest = await applyPatches(stage, project);
    manifest.overlayFingerprint = await fingerprint();
    await writeFile(path.join(stage, '.l-vibe-patches.json'), JSON.stringify(manifest, null, 2) + '\n');
    await rm(preparedSource, { recursive: true, force: true }); await rename(stage, preparedSource);
  } finally { await rm(stage, { recursive: true, force: true }); }
  await verify();
}
const mode = process.argv[2];
if (mode === 'prepare') await prepare();
else if (mode === 'verify') await verify();
else if (mode === 'build' || mode === 'package' || mode === 'dev') {
  await verify();
  const readiness = JSON.parse(await readFile(path.join(project, 'distribution/readiness.json'), 'utf8'));
  if (readiness.releaseReady !== true) throw new Error('L-Vibe Desktop is not release-ready:\n- ' + readiness.blockers.join('\n- '));
  const bun = execFileSync('bun', ['--version'], { encoding: 'utf8' }).trim();
  if (bun !== lock.bunVersion) throw new Error(`Build requires Bun ${lock.bunVersion}, got ${bun}`);
  execFileSync('bun', ['run', mode === 'package' ? 'pack' : mode], { cwd: path.join(preparedSource, 'packages/desktop'), stdio: 'inherit', env: { ...process.env, OPENCODE_CHANNEL: 'prod', OPENCODE_TARGET: 'bun-windows-x64' } });
} else throw new Error('Usage: node scripts/desktop.mjs prepare|verify|dev|build|package');
