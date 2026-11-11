import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile, mkdir, mkdtemp, rm, stat, open } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { extractFile, listPackage } from '@electron/asar';
import { getPath7za } from 'app-builder-lib/out/toolsets/7zip.js';
import { assertAsciiPath, verifyAsciiTree } from './package-paths.mjs';

const project = path.resolve(import.meta.dirname, '..');
const json = async file => JSON.parse(await readFile(file, 'utf8'));
export async function fileHash(file) {
  const hash = createHash('sha256');
  for await (const bytes of createReadStream(file)) hash.update(bytes);
  return hash.digest('hex');
}
async function checkHash(file, expected) {
  if (await fileHash(file) !== expected) throw new Error('Packaged file hash mismatch: ' + file);
}
export async function verifyManifest(root, expected, complete = false) {
  const manifest = path.join(root, 'manifest.json');
  await checkHash(manifest, expected);
  const data = await json(manifest);
  if (complete && (data.complete !== true || data.missing?.length)) throw new Error('Packaged MCP runtime is incomplete');
  const files = data.skills ? data.skills.flatMap(skill => skill.files.map(file => ({ ...file, path: skill.directory + '/' + file.path }))) : data.files;
  if (!Array.isArray(files) || files.length === 0) throw new Error('Empty packaged manifest: ' + root);
  const seen = new Set();
  for (const file of files) {
    if (typeof file.path !== 'string' || file.path.includes('\\') || path.posix.isAbsolute(file.path) || file.path.split('/').some(p => !p || p === '.' || p === '..') || seen.has(file.path)) throw new Error('Invalid packaged manifest path: ' + file.path);
    seen.add(file.path);
    await checkHash(path.join(root, file.path), file.sha256);
  }
  return { manifestSha256: expected, files: files.length, ...(data.skills ? { count: data.skills.length } : {}) };
}
async function windowsX64(file) {
  const input = await open(file, 'r');
  try {
    const header = Buffer.alloc(4096);
    const { bytesRead } = await input.read(header, 0, header.length, 0);
    const offset = bytesRead >= 64 ? header.readUInt32LE(60) : bytesRead;
    if (header.toString('ascii', 0, 2) !== 'MZ' || offset + 6 > bytesRead || header.readUInt32LE(offset) !== 0x4550 || header.readUInt16LE(offset + 4) !== 0x8664) throw new Error('Expected Windows AMD64 executable: ' + file);
  } finally { await input.close(); }
}
async function expectedComponents(root) {
  return {
    openviking: (await json(path.join(root, 'python-runtime-lock.json'))).manifestSha256,
    mcp: (await json(path.join(root, 'mcp-runtime-lock.json'))).manifestSha256,
    skills: (await json(path.join(root, 'skills-lock.json'))).manifestSha256,
    rea: await fileHash(path.join(root, 'vendor/runtime/windows-x64/rea/manifest.json')),
  };
}
export async function verifyInstallerAudit(audit, installer, root = project) {
  const version = (await json(path.join(root, 'package.json'))).version;
  if (audit.schemaVersion !== 1 || audit.verifiedFrom !== 'installer-archive' || audit.version !== version || audit.installer?.name !== path.basename(installer) || audit.installer?.bytes !== (await stat(installer)).size || audit.installer?.sha256 !== await fileHash(installer)) throw new Error('Installer audit is missing or stale for this EXE');
  if (audit.paths?.encoding !== 'ascii') throw new Error('Installer audit has no verified ASCII path policy');
  for (const [name, expected] of Object.entries(await expectedComponents(root))) if (audit[name]?.manifestSha256 !== expected) throw new Error('Installer audit is stale for ' + name);
  const staged = path.join(root, '.cache/l-vibe-desktop/source/packages/desktop/dist/win-unpacked');
  for (const [key, file] of [['appAsarSha256', 'resources/app.asar'], ['appExeSha256', 'L-Vibe.exe']]) if (audit[key] !== await fileHash(path.join(staged, file))) throw new Error('Installer audit is stale for ' + file);
  const cli = path.join(root, '.cache/l-vibe-desktop/source/packages/cli/dist/cli-windows-x64-baseline/bin/opencode.exe');
  if (audit.cliSha256 !== await fileHash(cli)) throw new Error('Installer audit is stale for the Windows CLI');
}
async function auditInstaller(installer) {
  const output = path.join(project, '.cache/packaged-runtime-audit.json');
  await mkdir(path.dirname(output), { recursive: true });
  await rm(output, { force: true });
  const extracted = await mkdtemp(path.join(project, '.cache/installer-audit-'));
  try {
    const sevenZip = await getPath7za();
    for (const [mode, args] of [['test', ['t', installer]], ['extract', ['x', '-y', '-o' + extracted, installer]]]) {
      const log = await open(path.join(project, '.cache/installer-' + mode + '.log'), 'w');
      try { execFileSync(sevenZip, args, { stdio: ['ignore', log.fd, log.fd] }); }
      finally { await log.close(); }
    }
    const resources = path.join(extracted, 'resources');
    const paths = await verifyAsciiTree(extracted);
    const asarPaths = listPackage(path.join(resources, 'app.asar'));
    for (const name of asarPaths) assertAsciiPath(name);
    const version = (await json(path.join(project, 'package.json'))).version;
    const app = JSON.parse(extractFile(path.join(resources, 'app.asar'), 'package.json').toString());
    if (app.name !== 'l-vibe' || app.version !== version) throw new Error('Installer contains a different app or version');
    await windowsX64(path.join(extracted, 'L-Vibe.exe'));
    const audit = { schemaVersion: 1, verifiedFrom: 'installer-archive', version, createdAt: new Date().toISOString(), platform: process.platform + '-' + process.arch, installer: { name: path.basename(installer), bytes: (await stat(installer)).size, sha256: await fileHash(installer) } };
    audit.paths = { ...paths, asarEntries: asarPaths.length };
    audit.appAsarSha256 = await fileHash(path.join(resources, 'app.asar'));
    audit.appExeSha256 = await fileHash(path.join(extracted, 'L-Vibe.exe'));
    for (const [name, expected] of Object.entries(await expectedComponents(project))) {
      const folder = name === 'skills' ? path.join(resources, 'l-vibe/skills') : path.join(resources, 'runtime/windows-x64', name);
      audit[name] = await verifyManifest(folder, expected, name === 'mcp');
    }
    if (audit.skills.count !== (await json(path.join(project, 'skills-lock.json'))).count) throw new Error('Installer skill count mismatch');
    for (const name of ['agent-config.example.json', 'skills-lock.json']) await checkHash(path.join(resources, 'l-vibe', name), await fileHash(path.join(project, name)));
    const cli = path.join(resources, 'opencode-cli.exe');
    await windowsX64(cli);
    audit.cliSha256 = await fileHash(cli);
    await verifyInstallerAudit(audit, installer);
    await writeFile(output, JSON.stringify(audit, null, 2) + '\n');
    console.log(JSON.stringify(audit, null, 2));
  } finally { await rm(extracted, { recursive: true, force: true }); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const version = (await json(path.join(project, 'package.json'))).version;
  await auditInstaller(path.resolve(process.argv[2] ?? path.join(project, 'release/desktop', `L-Vibe-${version}-win-x64.exe`)));
}
