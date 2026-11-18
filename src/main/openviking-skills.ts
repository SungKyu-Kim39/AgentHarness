import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { crc32 } from 'node:zlib';
import path from 'node:path';
import type { SkillEntry } from './skills';

const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export type SkillTransport = (route: string, options?: { method?: 'GET' | 'POST' | 'PUT'; body?: unknown; signal?: AbortSignal }) => Promise<any>;
interface Package { id: string; name: string; description: string; hash: string; archive: Buffer; body: string; files: Map<string, Buffer>; source: string; commit: string }
const bodyOf = (text: string) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
function safeRelative(value: string) {
  if (!value || path.isAbsolute(value) || /[\\:\x00-\x1f]/.test(value) || value.split('/').some(p => !p || p === '.' || p === '..')) throw new Error('기본 스킬 경로 오류');
  return value;
}

/** Stored ZIP, bounded static files only; no archiver subprocess or runtime download. */
function archive(files: Map<string, Buffer>, name: string) {
  const local: Buffer[] = [], central: Buffer[] = []; let offset = 0;
  for (const [relative, bytes] of files) {
    const filename = Buffer.from(name + '/' + safeRelative(relative)); const crc = crc32(bytes);
    const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt16LE(33, 12);
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(bytes.length, 18); header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(filename.length, 26);
    const directory = Buffer.alloc(46); directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x800, 8); directory.writeUInt16LE(33, 14);
    directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(bytes.length, 20); directory.writeUInt32LE(bytes.length, 24); directory.writeUInt16LE(filename.length, 28); directory.writeUInt32LE(offset, 42);
    local.push(header, filename, bytes); central.push(directory, filename); offset += header.length + filename.length + bytes.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.size, 8); end.writeUInt16LE(files.size, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export async function loadBundledSkillPackages(root: string, lockFile = path.join(root, '..', 'skills-lock.json')): Promise<Package[]> {
  const manifestBytes = await readFile(path.join(root, 'manifest.json'));
  const lock = JSON.parse(await readFile(lockFile, 'utf8'));
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  if (lock.schemaVersion !== 1 || lock.manifestSha256 !== digest(manifestBytes) || manifest.schemaVersion !== 1 || !Array.isArray(manifest.skills) || lock.count !== manifest.skills.length) throw new Error('기본 스킬 목록 무결성 오류');
  const base = await realpath(root), ids = new Set<string>(); const packages: Package[] = [];
  for (const entry of manifest.skills as SkillEntry[]) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || entry.id.length > 56 || ids.has(entry.id) || entry.directory !== entry.id || !Array.isArray(entry.files) || entry.files.length > 500) throw new Error('기본 스킬 형식 오류');
    ids.add(entry.id); const name = 'ned-' + entry.id, files = new Map<string, Buffer>(); let total = 0;
    for (const file of entry.files) {
      const relative = safeRelative(file.path);
      if (!/\.(md|txt)$/i.test(relative) && !/^(LICENSE|COPYING)$/i.test(path.posix.basename(relative))) throw new Error('실행형 스킬 파일 차단');
      const resolved = await realpath(path.join(base, entry.directory, relative));
      const within = path.relative(path.join(base, entry.directory), resolved);
      if (within.startsWith('..') || path.isAbsolute(within) || files.has(relative)) throw new Error('기본 스킬 범위 오류');
      const bytes = await readFile(resolved); total += bytes.length;
      if (total > 8 * 1024 * 1024 || digest(bytes) !== file.sha256) throw new Error('기본 스킬 파일 무결성 오류');
      files.set(relative, bytes);
    }
    const main = files.get('SKILL.md'); if (!main) throw new Error('기본 스킬 본문 없음');
    const body = `# Ned bundled skill: ${entry.id}\n\n${entry.adapter}\n\nThis is static guidance. It does not install an executor, grant permissions or upload personal conversations. Use the local Ned skill catalog ID ${entry.id} for the reviewed original package.\n\n${bodyOf(main.toString('utf8'))}`;
    files.set('SKILL.md', Buffer.from(`---\nname: ${name}\ndescription: ${JSON.stringify(entry.description)}\n---\n\n${body}\n`));
    files.set('NED-BUNDLE.json', Buffer.from(JSON.stringify({ schemaVersion: 1, id: entry.id, source: entry.source, commit: entry.commit, license: entry.license, files: entry.files }, null, 2) + '\n'));
    const bytes = archive(files, name);
    packages.push({ id: entry.id, name, description: entry.description, hash: digest(bytes), archive: bytes, body, files, source: entry.source, commit: entry.commit });
  }
  return packages;
}
