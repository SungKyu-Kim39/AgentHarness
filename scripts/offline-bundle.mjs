import { readFile, writeFile, mkdir, cp, rm, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const project = path.resolve(import.meta.dirname, '..');
const output = path.join(project, 'release/desktop');
const version = JSON.parse(await readFile(path.join(project, 'package.json'), 'utf8')).version;
const folder = `L-Vibe-${version}-windows-x64`;
const root = path.join(output, folder);
const exe = `L-Vibe-${version}-win-x64.exe`;
if ((await stat(path.join(output, exe))).size < 10 * 1024 * 1024) throw new Error('Full installer is missing');
execFileSync('git', ['diff', '--quiet'], { cwd: project });
execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: project });
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: project, encoding: 'utf8' }).trim();
await rm(root, { recursive: true, force: true });
await mkdir(path.join(root, 'licenses'), { recursive: true });
await mkdir(path.join(root, 'source'), { recursive: true });
await cp(path.join(output, exe), path.join(root, exe));
await cp(path.join(project, 'agent-config.example.json'), path.join(root, 'agent-config.json'));
await cp(path.join(project, 'docs/offline-setup.md'), path.join(root, '시작하기.txt'));
await cp(path.join(project, `docs/validation-${version}.md`), path.join(root, '검증보고서.md'));
await cp(path.join(project, '.cache/packaged-runtime-audit.json'), path.join(root, 'runtime-audit.json'));
await cp(path.join(project, 'distribution/readiness.json'), path.join(root, '검증상태.json'));
for (const [from, to] of [
  ['LICENSE', 'L-Vibe-LICENSE'], ['.cache/opencode-desktop/source/LICENSE', 'OpenCode-LICENSE'],
  ['vendor/runtime/windows-x64/openviking/licenses/openviking-0.5.4-source.tar.gz', 'OpenViking-0.5.4-corresponding-source.tar.gz'],
  ['vendor/runtime/windows-x64/openviking/licenses/packages.json', 'Python-packages.json'],
  ['vendor/runtime/windows-x64/rea/LICENSE', 'REA-LICENSE'], ['vendor/runtime/windows-x64/rea/THIRD_PARTY_NOTICES.md', 'REA-THIRD_PARTY-NOTICES.md'],
  ['distribution/methodology/aegis-LICENSE', 'Aegis-LICENSE'], ['distribution/methodology/conductor-LICENSE', 'Conductor-LICENSE'],
]) await cp(path.join(project, from), path.join(root, 'licenses', to));
for (const file of ['upstream-lock.json', 'desktop-runtime-lock.json', 'python-runtime-lock.json', 'rea-runtime-lock.json', 'skills-lock.json'])
  await cp(path.join(project, file), path.join(root, 'licenses', file));
execFileSync('git', ['archive', '--format=tar.gz', '--output', path.join(root, 'source', 'L-Vibe-' + commit.slice(0, 12) + '-source.tgz'), commit], { cwd: project });
const readiness = JSON.parse(await readFile(path.join(project, 'distribution/readiness.json'), 'utf8'));
await writeFile(path.join(root, 'bundle-manifest.json'), JSON.stringify({
  name: 'L-Vibe', version, architecture: 'windows-x64', sourceCommit: commit,
  createdAt: new Date().toISOString(), releaseReady: readiness.releaseReady,
  setup: ['extract TGZ', 'run installer EXE', 'edit and save the JSON opened by the installer', 'launch L-Vibe'],
  requiresEmployeePackageInstall: false, includesModelWeights: false, includesRealCredentials: false,
  components: { desktop: 'OpenCode 2.2.6', electron: '44.9.1', python: '3.12.16', openViking: '0.5.4', graphify: '0.9.105', rea: '6.8.0' },
}, null, 2) + '\n');
const checksums = [];
async function files(relative = '') {
  for (const item of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const name = path.posix.join(relative, item.name);
    if (item.isDirectory()) await files(name);
    else if (item.isFile()) checksums.push(createHash('sha256').update(await readFile(path.join(root, name))).digest('hex') + '  ' + name);
  }
}
await files(); await writeFile(path.join(root, 'SHA256SUMS.txt'), checksums.sort().join('\n') + '\n');
const archive = path.join(output, folder + '.tgz');
execFileSync('tar', ['-I', 'gzip -1', '-cf', archive, '-C', output, folder], { stdio: 'inherit' });
const digest = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(archive + '.sha256', digest + '  ' + path.basename(archive) + '\n');
console.log(JSON.stringify({ archive, bytes: (await stat(archive)).size, sha256: digest, commit, releaseReady: readiness.releaseReady }, null, 2));
