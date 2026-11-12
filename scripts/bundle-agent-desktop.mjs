// Build machine only. No package manager or network access on employee PCs.
import { readFile, writeFile, mkdir, cp, readdir, chmod } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const version = '1.2.0', commit = '2b0a7334fc111730454b726e6800aa41cdafc093';
const artifacts = [
  { file: 'windows.tar.gz', platform: 'windows-x64', url: `https://github.com/vercel-labs/agent-desktop/releases/download/v${version}/agent-desktop-v${version}-x86_64-pc-windows-msvc.tar.gz`, sha256: 'a4199f741a441cedd349bf56c5eba01783b1261258b498efeb7ec9945220c3e8' },
  { file: 'linux.tar.gz', platform: 'linux-x64', url: `https://github.com/vercel-labs/agent-desktop/releases/download/v${version}/agent-desktop-v${version}-x86_64-unknown-linux-gnu.tar.gz`, sha256: '591ae7f4a38479dc045df97e27447c0c8b530441730ab6b990e27c813162af44' },
  { file: 'source.tar.gz', url: `https://codeload.github.com/vercel-labs/agent-desktop/tar.gz/${commit}`, sha256: 'b8e5c536ba6e66f2e82b6863c198e06f1d11fcdfc100d44de0a871a38a82dc7f' },
];
await mkdir('.cache/agent-desktop', { recursive: true });
for (const item of [...artifacts].sort((a, b) => Number(!!a.platform) - Number(!!b.platform))) {
  const archive = '.cache/agent-desktop/' + item.file;
  let bytes = await readFile(archive).catch(() => undefined);
  if (!bytes) { const response = await fetch(item.url); if (!response.ok) throw new Error('agent-desktop download failed'); bytes = Buffer.from(await response.arrayBuffer()); await writeFile(archive, bytes); }
  if (hash(bytes) !== item.sha256) throw new Error('agent-desktop archive integrity mismatch');
  const target = item.platform ? `vendor/runtime/${item.platform}/agent-desktop` : '.cache/agent-desktop/source';
  await mkdir(target, { recursive: true });
  const names = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n');
  if (names.some(n => n.startsWith('/') || n.split('/').includes('..') || /[^\x20-\x7e]/.test(n))) throw new Error('Unsafe archive paths');
  execFileSync('tar', ['-xzf', archive, ...(item.platform ? [] : ['--strip-components=1']), '-C', target]);
  if (item.platform) {
    await cp('.cache/agent-desktop/source/LICENSE', target + '/LICENSE.txt');
    await cp('.cache/agent-desktop/source.tar.gz', target + '/source.tar.gz');
    if (item.platform === 'windows-x64') {
      const runtime = 'vendor/runtime/windows-x64/openviking/python';
      const dll = await readFile(runtime + '/vcruntime140.dll');
      if (hash(dll) !== 'd5e4d9a3e835fa679450145d6a7d94e36573a509317111904d9b3712c30d9066') throw new Error('Pinned Microsoft runtime dependency changed');
      await writeFile(target + '/vcruntime140.dll', dll);
      await cp(runtime + '/LICENSE.txt', target + '/LICENSE.CPython-Windows.txt');
    }
    const files = [];
    for (const name of (await readdir(target)).filter(n => n !== 'manifest.json').sort()) { const data = await readFile(path.join(target, name)); files.push({ path: name, sha256: hash(data) }); }
    await writeFile(target + '/manifest.json', JSON.stringify({ schemaVersion: 1, version, commit, files }, null, 2) + '\n');
    if (item.platform === 'linux-x64') await chmod(target + '/agent-desktop', 0o755);
  }
}
const manifests = {};
for (const platform of ['windows-x64', 'linux-x64']) manifests[platform] = hash(await readFile(`vendor/runtime/${platform}/agent-desktop/manifest.json`));
await writeFile('agent-desktop-lock.json', JSON.stringify({ schemaVersion: 1, manifests, windowsRuntime: { file: 'vcruntime140.dll', sha256: 'd5e4d9a3e835fa679450145d6a7d94e36573a509317111904d9b3712c30d9066', source: 'Pinned CPython standalone Windows runtime; see python-runtime-lock.json', license: 'Microsoft Distributable Code; see LICENSE.CPython-Windows.txt' }, repository: 'https://github.com/vercel-labs/agent-desktop', version, commit, license: 'Apache-2.0', artifacts }, null, 2) + '\n');
console.log('Pinned agent-desktop native runtimes verified.');
