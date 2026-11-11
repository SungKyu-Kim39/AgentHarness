import { readFile, writeFile, mkdir, cp, rm, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileHash, verifyInstallerAudit } from './installer-audit.mjs';
import { verifyAsciiTree, verifyAsciiGitTree, verifyAsciiTar } from './package-paths.mjs';
const project = path.resolve(import.meta.dirname, '..');
const output = path.join(project, 'release/desktop');
const version = JSON.parse(await readFile(path.join(project, 'package.json'), 'utf8')).version;
const folder = `L-Vibe-${version}-windows-x64`;
const root = path.join(output, folder);
const exe = `L-Vibe-${version}-win-x64.exe`;
if ((await stat(path.join(output, exe))).size < 10 * 1024 * 1024) throw new Error('Full installer is missing');
execFileSync('python3', [path.join(project, 'scripts/bundle-mcp.py'), 'verify'], { cwd: project, stdio: 'inherit' });
execFileSync('git', ['diff', '--quiet'], { cwd: project });
execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: project });
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: project, encoding: 'utf8' }).trim();
verifyAsciiGitTree(project, commit);
await rm(root, { recursive: true, force: true });
await mkdir(path.join(root, 'licenses'), { recursive: true });
await mkdir(path.join(root, 'source'), { recursive: true });
await cp(path.join(output, exe), path.join(root, exe));
await cp(path.join(project, 'agent-config.example.json'), path.join(root, 'agent-config.json'));
await cp(path.join(project, 'docs/offline-setup.md'), path.join(root, 'GETTING_STARTED.txt'));
await cp(path.join(project, `docs/validation-${version}.md`), path.join(root, 'VALIDATION_REPORT.md'));
for (const [from, to] of [
  ['docs/configuration-recovery.md', 'CONFIGURATION_RECOVERY.txt'], ['docs/license-policy.md', 'LICENSE_POLICY.txt'],
  ['docs/windows-diagnostics.md', 'WINDOWS_DIAGNOSTICS.txt'], ['docs/model-controls.md', 'MODEL_CONTROLS.txt'], ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md'],
  ['distribution/openviking-import-check.py', 'openviking-import-check.py'], ['distribution/check-openviking.cmd', 'CHECK_OPENVIKING.cmd'],
  ['distribution/export-openviking-personal.py', 'export-openviking-personal.py'], ['distribution/export-openviking-personal.cmd', 'EXPORT_PERSONAL.cmd'],
  ['docs/openviking-personal-migration.md', 'PERSONAL_KNOWLEDGE_MIGRATION.txt'],
]) await cp(path.join(project, from), path.join(root, to));
const checkCommand = path.join(root, 'CHECK_OPENVIKING.cmd');
await writeFile(checkCommand, (await readFile(checkCommand, 'utf8')).replace(/\r?\n/g, '\r\n'));
const exportCommand = path.join(root, 'EXPORT_PERSONAL.cmd');
await writeFile(exportCommand, (await readFile(exportCommand, 'utf8')).replace(/\r?\n/g, '\r\n'));
const audit = JSON.parse(await readFile(path.join(project, '.cache/packaged-runtime-audit.json'), 'utf8'));
await verifyInstallerAudit(audit, path.join(output, exe));
const upstream = JSON.parse(await readFile(path.join(project, 'upstream-lock.json'), 'utf8'));
if (await fileHash(path.join(project, '.cache/l-vibe-desktop/source/LICENSE')) !== upstream.files.LICENSE) throw new Error('OpenCode license differs from the locked upstream source');
await cp(path.join(project, '.cache/packaged-runtime-audit.json'), path.join(root, 'runtime-audit.json'));
await cp(path.join(project, 'distribution/readiness.json'), path.join(root, 'READINESS.json'));
for (const [from, to] of [
  ['LICENSE', 'L-Vibe-LICENSE'], ['.cache/l-vibe-desktop/source/LICENSE', 'OpenCode-LICENSE'],
  ['vendor/runtime/windows-x64/openviking/licenses/openviking-0.5.4-source.tar.gz', 'OpenViking-0.5.4-corresponding-source.tar.gz'],
  ['vendor/runtime/windows-x64/openviking/licenses/packages.json', 'Python-packages.json'],
  ['vendor/runtime/windows-x64/rea/LICENSE', 'REA-LICENSE'], ['vendor/runtime/windows-x64/rea/THIRD_PARTY_NOTICES.md', 'REA-THIRD_PARTY-NOTICES.md'],
  ['distribution/methodology/aegis-LICENSE', 'Aegis-LICENSE'], ['distribution/methodology/conductor-LICENSE', 'Conductor-LICENSE'],
]) await cp(path.join(project, from), path.join(root, 'licenses', to));
for (const file of ['upstream-lock.json', 'desktop-runtime-lock.json', 'python-runtime-lock.json', 'tokenizer-runtime-lock.json', 'rea-runtime-lock.json', 'skills-lock.json', 'mcp-runtime-lock.json', 'mcp-node-lock.json'])
  await cp(path.join(project, file), path.join(root, 'licenses', file));
const sourceArchive = path.join(root, 'source', 'L-Vibe-' + commit.slice(0, 12) + '-source.tgz');
execFileSync('git', ['archive', '--format=tar.gz', '--output', sourceArchive, commit], { cwd: project });
verifyAsciiTar(sourceArchive);
const readiness = JSON.parse(await readFile(path.join(project, 'distribution/readiness.json'), 'utf8'));
await writeFile(path.join(root, 'bundle-manifest.json'), JSON.stringify({
  name: 'L-Vibe', version, architecture: 'windows-x64', sourceCommit: commit,
  createdAt: new Date().toISOString(), releaseReady: readiness.releaseReady,
  setup: ['extract TGZ', 'run installer EXE', 'edit and save the JSON opened by the installer', 'launch L-Vibe'],
  requiresEmployeePackageInstall: false, includesModelWeights: false, includesRealCredentials: false,
  pathEncoding: 'ascii',
  documents: { gettingStarted: 'GETTING_STARTED.txt', validation: 'VALIDATION_REPORT.md', readiness: 'READINESS.json',
    configuration: 'CONFIGURATION_RECOVERY.txt', licensePolicy: 'LICENSE_POLICY.txt', diagnostics: 'WINDOWS_DIAGNOSTICS.txt', modelControls: 'MODEL_CONTROLS.txt', personalMigration: 'PERSONAL_KNOWLEDGE_MIGRATION.txt' },
  components: { desktop: 'OpenCode 2.2.6', electron: '44.9.1', python: '3.12.16', openViking: '0.5.4', graphify: '0.9.105', rea: '6.8.0', mcp: JSON.parse(await readFile(path.join(project, 'vendor/runtime/windows-x64/mcp/manifest.json'), 'utf8')).versions },
}, null, 2) + '\n');
const checksums = [];
await verifyAsciiTree(root);
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
try { verifyAsciiTar(archive); }
catch (error) { await rm(archive, { force: true }); await rm(archive + '.sha256', { force: true }); throw error; }
const digest = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(archive + '.sha256', digest + '  ' + path.basename(archive) + '\n');
console.log(JSON.stringify({ archive, bytes: (await stat(archive)).size, sha256: digest, commit, releaseReady: readiness.releaseReady }, null, 2));
