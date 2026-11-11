import { readFile, writeFile, mkdir, mkdtemp, rename, rm, access, readdir, symlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPatches, digest } from '../distribution/patches.mjs';
import { verifyAsciiTree, verifyAsciiGitTree } from './package-paths.mjs';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(project, '.cache/l-vibe-desktop');
const preparedSource = path.join(cache, 'source');
const lock = JSON.parse(await readFile(path.join(project, 'upstream-lock.json'), 'utf8'));
const version = JSON.parse(await readFile(path.join(project, 'package.json'), 'utf8')).version;
const overlays = ['distribution/patches.mjs', 'distribution/l-vibe-environment.ts', 'distribution/native-control.ts', 'distribution/host-tools.ts', 'distribution/sidecar-proxy.ts', 'distribution/native-startup.ts', 'distribution/native-background-service.ts', 'distribution/native-pack.ts', 'src/shared/contracts.ts', 'src/main/config.ts', 'src/main/files.ts', 'src/main/skills.ts', 'src/main/model-gateway.ts', 'src/main/openviking.ts', 'src/main/openviking-gateway.ts', 'src/main/openviking-skills.ts', 'distribution/windows-installer.nsh', 'distribution/windows-installer.nsi', 'assets/lig-icon.png', 'assets/lig-icon.ico'];
overlays.push('src/main/mcp-client.ts', 'src/main/mcp-extensions.ts', 'src/main/browser-proxy.ts', 'scripts/mcp-python-worker.py', 'scripts/mcp-node-worker.cjs', 'mcp-runtime-lock.json', 'mcp-node-lock.json');
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
    // Keep already-installed build dependencies when an overlay is revised.
    // Relative Bun workspace links retain their layout in the replacement tree.
    async function keepDependencies(relative = '', depth = 0) {
      if (depth > 4) return;
      const entries = await readdir(path.join(preparedSource, relative), { withFileTypes: true }).catch(() => []);
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const next = path.join(relative, entry.name);
        if (entry.name === 'node_modules' || next === path.join('packages', 'cli', 'dist')) {
          await mkdir(path.dirname(path.join(stage, next)), { recursive: true });
          await rename(path.join(preparedSource, next), path.join(stage, next));
        } else if (!['.git', '.cache', 'out', 'dist'].includes(entry.name)) await keepDependencies(next, depth + 1);
      }
    }
    await keepDependencies();
    await rm(preparedSource, { recursive: true, force: true }); await rename(stage, preparedSource);
  } finally { await rm(stage, { recursive: true, force: true }); }
  await verify();
}
const mode = process.argv[2];
if (mode === 'prepare') await prepare();
else if (mode === 'verify') await verify();
else if (mode === 'build' || mode === 'package' || mode === 'dev') {
  if (mode === 'package') {
    execFileSync('python3', [path.join(project, 'scripts/bundle-mcp.py'), 'verify'], { cwd: project, stdio: 'inherit' });
    verifyAsciiGitTree(project, 'HEAD');
    await verifyAsciiTree(path.join(project, 'vendor/runtime/windows-x64'));
    await verifyAsciiTree(path.join(project, 'vendor/skills'));
  }
  await verify();
  const readiness = JSON.parse(await readFile(path.join(project, 'distribution/readiness.json'), 'utf8'));
  if (readiness.releaseReady !== true) console.warn('Building a validation candidate; Windows release acceptance is pending.');
  const executable = process.env.L_VIBE_BUN ?? path.join(project, '.cache/build-tools/node_modules/@oven/bun-linux-x64/bin/bun');
  const bun = execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim();
  if (bun !== lock.bunVersion) throw new Error(`Build requires Bun ${lock.bunVersion}, got ${bun}`);
  const bin = path.join(cache, 'tools/bin'); await mkdir(bin, { recursive: true });
  for (const name of ['bun', 'bunx']) { await rm(path.join(bin, name), { force: true }); await symlink(executable, path.join(bin, name)); }
  execFileSync(executable, ['run', mode === 'package' ? 'pack' : mode], { cwd: path.join(preparedSource, 'packages/desktop'), stdio: 'inherit', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, L_VIBE_RELEASE_DIR: path.join(project, 'release/desktop'), OPENCODE_VERSION: version, OPENCODE_CHANNEL: 'prod', OPENCODE_TARGET: process.env.OPENCODE_TARGET ?? 'windows-x64' } });
} else throw new Error('Usage: node scripts/desktop.mjs prepare|verify|dev|build|package');
