import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { crc32 } from 'node:zlib';
import path from 'node:path';
import { vikingErrorCode } from './openviking-errors';
import { atomicJSON } from './config';
import type { SkillEntry } from './skills';

const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export const bundledSkillsRoot = 'viking://agent/skills';
export interface SkillRegistration {
  status: 'pending' | 'registering' | 'ready' | 'error';
  registered: number; total: number; conflicts: string[]; failed: string[]; message?: string;
  current?: { id: string; stage: string }; errors?: Array<{ id: string; stage: string; code: string; httpStatus?: number }>;
}
export type SkillTransport = (route: string, options?: { method?: 'GET' | 'POST' | 'PUT'; body?: unknown; signal?: AbortSignal }) => Promise<any>;
interface Package { id: string; name: string; hash: string; archive: Buffer; body: string; files: Map<string, Buffer>; source: string; commit: string }
interface RecordEntry { bundleHash: string; revision: string }
interface RegistrationState { schemaVersion: 1; entries: Record<string, RecordEntry> }
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

export async function loadBundledSkillPackages(root: string): Promise<Package[]> {
  const manifestBytes = await readFile(path.join(root, 'manifest.json'));
  const lock = JSON.parse(await readFile(path.join(root, '..', 'skills-lock.json'), 'utf8'));
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  if (lock.schemaVersion !== 1 || lock.manifestSha256 !== digest(manifestBytes) || manifest.schemaVersion !== 1 || !Array.isArray(manifest.skills) || lock.count !== manifest.skills.length) throw new Error('기본 스킬 목록 무결성 오류');
  const base = await realpath(root), ids = new Set<string>(); const packages: Package[] = [];
  for (const entry of manifest.skills as SkillEntry[]) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || entry.id.length > 56 || ids.has(entry.id) || entry.directory !== entry.id || !Array.isArray(entry.files) || entry.files.length > 500) throw new Error('기본 스킬 형식 오류');
    ids.add(entry.id); const name = 'l-vibe-' + entry.id, files = new Map<string, Buffer>(); let total = 0;
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
    const body = `# L-Vibe bundled skill: ${entry.id}\n\n${entry.adapter}\n\nThis is static guidance. It does not install an executor, grant permissions or upload personal conversations. Use the local L-Vibe skill catalog ID ${entry.id} for the reviewed original package.\n\n${bodyOf(main.toString('utf8'))}`;
    files.set('SKILL.md', Buffer.from(`---\nname: ${name}\ndescription: ${JSON.stringify(entry.description)}\n---\n\n${body}\n`));
    files.set('L-VIBE-BUNDLE.json', Buffer.from(JSON.stringify({ schemaVersion: 1, id: entry.id, source: entry.source, commit: entry.commit, license: entry.license, files: entry.files }, null, 2) + '\n'));
    const bytes = archive(files, name);
    packages.push({ id: entry.id, name, hash: digest(bytes), archive: bytes, body, files, source: entry.source, commit: entry.commit });
  }
  return packages;
}

async function installed(transport: SkillTransport, name: string, signal: AbortSignal) {
  try {
    const reply = await transport(`/api/v1/skills/${name}?target_uri=${encodeURIComponent(bundledSkillsRoot)}&include_content=true&include_files=true&include_integrity=true&include_source=true`, { signal });
    const result = reply.result;
    if (typeof result?.revision !== 'string' || typeof result?.content !== 'string' || !Array.isArray(result?.files)) throw new Error('스킬 등록 결과 형식 오류');
    return result as { revision: string; content: string; source?: Record<string, string>; files: Array<{ path: string; sha256?: string; is_dir?: boolean }> };
  } catch (error) {
    if ((error as { status?: number }).status === 404) return undefined;
    throw error;
  }
}

function matches(pkg: Package, remote: NonNullable<Awaited<ReturnType<typeof installed>>>) {
  if (bodyOf(remote.content) !== pkg.body.trim()) return false;
  for (const [name, bytes] of pkg.files) if (name !== 'SKILL.md' && remote.files.find(f => f.path === name)?.sha256 !== digest(bytes)) return false;
  return true;
}

/** Only app-owned packages are updated. User skills and edited copies are preserved. */
export async function registerBundledSkills(options: { bundle: string; stateFile: string; transport: SkillTransport; signal: AbortSignal; progress(state: SkillRegistration): void }) {
  const { signal, transport } = options;
  const packages = await loadBundledSkillPackages(options.bundle); signal.throwIfAborted();
  let saved: RegistrationState;
  try {
    saved = JSON.parse(await readFile(options.stateFile, 'utf8'));
    if (saved.schemaVersion !== 1 || !saved.entries || typeof saved.entries !== 'object' || Array.isArray(saved.entries) || Object.values(saved.entries).some(e => typeof e?.bundleHash !== 'string' || typeof e?.revision !== 'string')) throw new Error('기본 스킬 등록 기록 형식 오류');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    saved = { schemaVersion: 1, entries: {} };
  }
  const state: SkillRegistration = { status: 'registering', registered: 0, total: packages.length, conflicts: [], failed: [], errors: [] };
  const publish = () => options.progress(structuredClone(state)); publish();
  for (const pkg of packages) {
    signal.throwIfAborted();
    let stage = 'lookup';
    const step = (next: string) => { stage = next; state.current = { id: pkg.id, stage }; publish(); };
    step('lookup');
    try {
      let remote = await installed(transport, pkg.name, signal); const record = saved.entries[pkg.id];
      if (remote && (remote.source?.l_vibe_owner !== 'bundled-skills' || (record && (record.revision !== remote.revision || record.bundleHash !== remote.source.l_vibe_bundle_sha256)))) {
        state.conflicts.push(pkg.id); publish(); continue;
      }
      if (remote && remote.source?.l_vibe_bundle_sha256 === pkg.hash && !matches(pkg, remote)) {
        state.conflicts.push(pkg.id); publish(); continue;
      }
      if (!remote || remote.source?.l_vibe_bundle_sha256 !== pkg.hash) {
        // A changed bundle without a prior app record must not replace an existing package.
        if (remote && !record) { state.conflicts.push(pkg.id); publish(); continue; }
        const form = new FormData(); form.append('file', new Blob([new Uint8Array(pkg.archive)], { type: 'application/zip' }), pkg.name + '.zip');
        step('upload');
        const upload = await transport('/api/v1/resources/temp_upload', { method: 'POST', body: form, signal });
        const id = upload.result?.temp_file_id; if (typeof id !== 'string') throw new Error('스킬 업로드 확인 실패');
        step('import');
        await transport(remote ? `/api/v1/skills/${pkg.name}` : '/api/v1/skills', { method: remote ? 'PUT' : 'POST', signal, body: {
          temp_file_id: id, wait: true, target_uri: bundledSkillsRoot,
          source_metadata: { type: 'l-vibe-bundle', source: 'offline-bundle', l_vibe_owner: 'bundled-skills', l_vibe_bundle_sha256: pkg.hash, l_vibe_id: pkg.id, upstream_source: pkg.source, upstream_commit: pkg.commit },
        } });
        step('verify');
        remote = await installed(transport, pkg.name, signal);
        if (!remote || remote.source?.l_vibe_bundle_sha256 !== pkg.hash || !matches(pkg, remote)) throw Object.assign(new Error('등록된 스킬 내용 검증 실패'), { diagnosticCode: 'OV_SKILL_INTEGRITY' });
      }
      step('state');
      saved.entries[pkg.id] = { bundleHash: pkg.hash, revision: remote!.revision };
      signal.throwIfAborted(); await atomicJSON(options.stateFile, saved); state.registered++;
    } catch (error) {
      signal.throwIfAborted(); state.failed.push(pkg.id);
      const status = (error as { status?: number })?.status;
      const explicit = (error as { diagnosticCode?: string })?.diagnosticCode;
      state.errors!.push({ id: pkg.id, stage, code: ['OV_SKILL_INTEGRITY'].includes(explicit ?? '') ? explicit! : vikingErrorCode(error instanceof Error ? error.message : ''),
        ...(Number.isInteger(status) && status! >= 100 && status! <= 599 ? { httpStatus: status } : {}) });
    }
    publish();
  }
  state.current = undefined;
  state.status = state.conflicts.length || state.failed.length ? 'error' : 'ready';
  state.message = state.status === 'ready' ? `OpenViking 기본 스킬 ${state.registered}개 등록 확인` : `기본 스킬 ${state.registered}/${state.total}개 확인; 충돌 ${state.conflicts.length}개·실패 ${state.failed.length}개. 기존 내용은 보존하며 다음 실행에서 재확인합니다.`;
  if (state.errors?.length) state.message += '\n' + state.errors.map(e => `${e.id}: ${e.stage} ${e.code}${e.httpStatus ? ' HTTP ' + e.httpStatus : ''}`).join('\n');
  publish(); return state;
}
