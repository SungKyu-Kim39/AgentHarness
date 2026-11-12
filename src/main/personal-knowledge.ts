import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, openAsBlob } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';
import { atomicJSON } from './config';
import type { SkillTransport } from './openviking-skills';

const exec = promisify(execFile);
const rootPattern = /^viking:\/\/user\/(?!local-user$)[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const MAX_PACK = 512 * 1024 * 1024;
const entrySchema = z.object({
  sha256: z.string().regex(/^[a-f0-9]{64}$/), root: z.string().regex(rootPattern),
  roots: z.array(z.string()).max(64), status: z.enum(['importing', 'ready', 'failed']),
  files: z.number().int().nonnegative(), importedAt: z.string(),
}).strict();
const registrySchema = z.object({ schemaVersion: z.literal(1), entries: z.array(entrySchema).max(32) }).strict();
type Entry = z.infer<typeof entrySchema>;
type Preview = { root: string; roots: string[]; files: number; bytes: number };
export type PersonalTransport = (user: string, route: string, options?: Parameters<SkillTransport>[1]) => Promise<any>;

// Stdlib-only inspection, never extracts or executes archive contents. The SDK
// performs the full OVPack checksums/namespace validation before importing.
export const inspectPersonalPackPython = String.raw`
import json, re, stat, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
    infos = z.infolist()
    if not infos or len(infos) > 200000: raise ValueError('OVPACK_ENTRIES')
    names = set(); total = 0
    for i in infos:
        n = i.filename
        if n in names or chr(92) in n or n.startswith('/') or ':' in n or any(x in ('.', '..') for x in n.rstrip('/').split('/')): raise ValueError('OVPACK_PATH')
        if stat.S_ISLNK(i.external_attr >> 16) or i.flag_bits & 1: raise ValueError('OVPACK_LINK')
        names.add(n); total += i.file_size
        if total > 2147483648: raise ValueError('OVPACK_EXPANDED_SIZE')
    top = {n.split('/')[0] for n in names}
    if len(top) != 1: raise ValueError('OVPACK_ROOT')
    base = next(iter(top)); p = base + '/_ovpack/manifest.json'
    if z.getinfo(p).file_size > 8388608: raise ValueError('OVPACK_MANIFEST_SIZE')
    m = json.loads(z.read(p))
    root = m.get('root', {}).get('uri', '')
    if m.get('format_version') != 3 or m.get('kind') != 'openviking.ovpack': raise ValueError('OVPACK_VERSION')
    if not re.fullmatch(r'viking://user/(?!local-user$)[A-Za-z0-9][A-Za-z0-9_-]{0,127}', root): raise ValueError('OVPACK_USER_ROOT')
    if m['root'].get('name') != base or root.rsplit('/', 1)[-1] != base: raise ValueError('OVPACK_ROOT_NAME')
    entries = m.get('entries', [])
    if not isinstance(entries, list): raise ValueError('OVPACK_MANIFEST_ENTRIES')
    roots = set(); files = 0
    for e in entries:
        rel = e.get('path', '')
        if not isinstance(rel, str) or chr(92) in rel or rel.startswith('/') or any(x in ('.','..') for x in rel.split('/')): raise ValueError('OVPACK_MANIFEST_PATH')
        parts = rel.split('/')
        if parts[0] in ('memories','resources','skills'): roots.add(root + '/' + parts[0])
        if len(parts) >= 3 and parts[0] == 'peers' and parts[2] == 'memories' and re.fullmatch(r'[A-Za-z0-9_.@-]{1,255}', parts[1]) and parts[1] not in ('.','..') and parts[1].count('@') <= 1: roots.add(root + '/peers/' + parts[1] + '/memories')
        if e.get('kind') == 'file': files += 1
    if not roots or len(roots) > 64: raise ValueError('OVPACK_SEARCH_ROOTS')
    print(json.dumps(dict(root=root, roots=sorted(roots), files=files, bytes=total)))
`;

function validRoot(root: string, base: string) {
  if (root === base + '/memories' || root === base + '/resources' || root === base + '/skills') return true;
  if (!root.startsWith(base + '/peers/')) return false;
  const parts = root.slice((base + '/peers/').length).split('/');
  return parts.length === 2 && parts[1] === 'memories' && /^[A-Za-z0-9_.@-]{1,255}$/.test(parts[0]) &&
    !['.', '..'].includes(parts[0]) && (parts[0].match(/@/g)?.length ?? 0) <= 1;
}
function uriAllowed(uri: string, roots: string[]) {
  return !/[%\\\x00-\x1f?#]/.test(uri) && !/(?:^|\/)\.{1,2}(?:\/|$)/.test(uri) &&
    roots.some(root => uri === root || uri.startsWith(root + '/'));
}

export class PersonalKnowledge {
  private operation: Promise<unknown> = Promise.resolve();
  private abort = new AbortController();
  constructor(private directory: string, private python: string, private transport: PersonalTransport) {}
  private request(root: string, route: string, options?: Parameters<SkillTransport>[1]) {
    if (!rootPattern.test(root)) throw new Error('개인 지식 사용자 범위가 올바르지 않습니다.');
    return this.transport(root.slice('viking://user/'.length), route, options);
  }
  private get file() { return path.join(this.directory, 'personal-imports.json'); }
  private async registry() {
    let raw: string;
    try { raw = await readFile(this.file, 'utf8'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { schemaVersion: 1 as const, entries: [] as Entry[] }; throw error; }
    const registry = registrySchema.parse(JSON.parse(raw));
    if (registry.entries.some(e => e.roots.some(r => !validRoot(r, e.root)))) throw new Error('개인 지식 등록 기록의 범위가 올바르지 않습니다.');
    return registry;
  }
  async status() {
    const registry = await this.registry();
    return registry.entries.map(({ sha256, root, status, files, importedAt }) => ({ sha256, root, status, files, importedAt }));
  }
  private async verifyIndex(entry: Pick<Entry, 'root' | 'roots'>, signal: AbortSignal) {
    // OVPack import enqueues embedding work; HTTP success is not search readiness.
    // The wait API has no default deadline, preserving long intranet model queues.
    await this.request(entry.root, '/api/v1/system/wait', { method: 'POST', body: {}, signal });
    for (const uri of entry.roots) {
      const report = await this.request(entry.root, '/api/v1/system/consistency', { method: 'POST', body: { uri }, signal });
      if (report.result?.ok !== true) throw new Error('OV_PERSONAL_INDEX_INCOMPLETE');
    }
  }
  import(file: string, approve: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>) {
    const run = this.operation.then(() => this.importOne(file, approve));
    this.operation = run.catch(() => {}); return run;
  }
  private async importOne(file: string, approve: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>) {
    const signal = this.abort.signal; signal.throwIfAborted();
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_PACK || info.size === 0) throw new Error('512 MiB 이하의 일반 .ovpack 파일을 선택하세요.');
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const stage = await mkdtemp(path.join(this.directory, 'personal-import-'));
    const snapshot = path.join(stage, 'source.ovpack');
    try {
      await copyFile(file, snapshot);
      if ((await lstat(snapshot)).size > MAX_PACK) throw new Error('가져오기 파일 크기가 제한을 초과했습니다.');
      const digest = createHash('sha256');
      for await (const bytes of createReadStream(snapshot)) { signal.throwIfAborted(); digest.update(bytes); }
      const sha256 = digest.digest('hex');
      let preview: Preview;
      try {
        const result = await exec(this.python, ['-I', '-B', '-c', inspectPersonalPackPython, snapshot], { windowsHide: true, timeout: 30000, maxBuffer: 1024 * 1024, signal });
        preview = JSON.parse(result.stdout);
        if (!rootPattern.test(preview.root) || !Array.isArray(preview.roots) || preview.roots.some(r => !validRoot(r, preview.root))) throw new Error();
      } catch { throw new Error('사용자 영역을 내보낸 OVPack v3인지 확인하세요. 전체 DB 백업이나 잘못된 압축 파일은 가져올 수 없습니다.'); }
      const registry = await this.registry();
      const existing = registry.entries.find(e => e.sha256 === sha256);
      if (existing?.status === 'ready') {
        await this.request(existing.root, '/api/v1/fs/stat?uri=' + encodeURIComponent(existing.root), { signal });
        await this.verifyIndex(existing, signal);
        return { status: 'already-imported', root: existing.root, sha256 };
      }
      if (existing || registry.entries.some(e => e.root === preview.root)) throw new Error('같은 사용자 영역의 가져오기 기록이 있습니다. 기존 자료와 실패 상태를 보존했으며 자동 덮어쓰기는 하지 않습니다.');
      if (registry.entries.length >= 32) throw new Error('개인 지식 가져오기 개수 제한에 도달했습니다.');
      const approved = await approve('개인 공통 지식 가져오기',
        `선택한 파일: ${file}\n원본 사용자 영역: ${preview.root}\n파일: ${preview.files}개\nSHA-256: ${sha256}\n\nL-Vibe의 개인 저장소에 가져와 모든 프로젝트에서 읽기 전용으로 검색합니다. 기존 대상은 덮어쓰지 않습니다. 벡터는 호환될 때 재사용하고, 필요하면 설정한 사내 임베딩 API로 재계산합니다. 대화/개인정보 관리 자료는 보존하되 검색 도구에는 노출하지 않습니다. 사용자 스킬은 자료로만 보존하며 실행형 플러그인으로 설치하지 않습니다.`, signal);
      if (!approved || signal.aborted) throw new Error('개인 지식 가져오기를 취소했습니다.');
      const archive = path.join(this.directory, 'personal-' + sha256 + '.ovpack');
      await rename(snapshot, archive);
      const entry: Entry = { sha256, root: preview.root, roots: preview.roots, files: preview.files, status: 'importing', importedAt: new Date().toISOString() };
      registry.entries.push(entry); await atomicJSON(this.file, registry);
      let stageName = 'OV_PERSONAL_UPLOAD';
      try {
        const form = new FormData(); form.append('file', await openAsBlob(archive), 'personal.ovpack');
        const upload = await this.request(entry.root, '/api/v1/resources/temp_upload', { method: 'POST', body: form, signal });
        const id = upload.result?.temp_file_id;
        if (typeof id !== 'string') throw new Error('개인 지식 파일 전달 확인 실패');
        stageName = 'OV_PERSONAL_IMPORT';
        const imported = await this.request(entry.root, '/api/v1/pack/import', { method: 'POST', body: { temp_file_id: id, parent: 'viking://user', on_conflict: 'fail', vector_mode: 'auto' }, signal });
        if (imported.result?.uri !== entry.root) throw new Error('개인 지식 가져오기 경로 확인 실패');
        stageName = 'OV_PERSONAL_INDEX';
        await this.verifyIndex(entry, signal);
        stageName = 'OV_PERSONAL_VERIFY';
        await this.request(entry.root, '/api/v1/fs/stat?uri=' + encodeURIComponent(entry.root), { signal });
        signal.throwIfAborted(); entry.status = 'ready'; await atomicJSON(this.file, registry);
        return { status: 'imported', root: entry.root, sha256, files: entry.files };
      } catch (error) {
        entry.status = 'failed'; await atomicJSON(this.file, registry);
        const http = (error as { status?: number })?.status;
        const code = stageName + (Number.isInteger(http) ? ' HTTP ' + http : '');
        throw new Error('개인 지식 가져오기를 완료하지 못했습니다. [' + code + '] 원본 OVPack과 실패 기록은 보존했습니다. 기존 대상 충돌·OVPack 검증·임베딩 연결을 확인하세요. 자동 재시도나 덮어쓰기는 하지 않습니다.');
      }
    } finally { await rm(stage, { recursive: true, force: true }); }
  }
  private async roots() { return (await this.registry()).entries.filter(e => e.status === 'ready').flatMap(e => e.roots); }
  async search(query: string, limit: number) {
    const roots = await this.roots(), hits: any[] = [];
    for (const root of roots) {
      const base = root.split('/').slice(0, 4).join('/');
      const response = await this.request(base, '/api/v1/search/find', { method: 'POST', body: { query, target_uri: root, limit, read_content: false }, signal: this.abort.signal });
      const result = response.result;
      for (const item of [...(result?.memories ?? []), ...(result?.resources ?? []), ...(result?.skills ?? [])])
        if (typeof item.uri === 'string' && uriAllowed(item.uri, [root])) hits.push({ uri: item.uri, abstract: item.abstract, score: item.score });
    }
    const seen = new Set<string>();
    const results = hits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).filter(h => !seen.has(h.uri) && !!seen.add(h.uri)).slice(0, limit);
    return JSON.stringify({ source: 'OpenViking', scope: 'personal', importedAreas: (await this.registry()).entries.filter(e => e.status === 'ready').length, results });
  }
  async read(uri: string) {
    if (!uriAllowed(uri, await this.roots())) throw new Error('가져오기가 완료된 개인 기억·자료·스킬 범위만 읽을 수 있습니다.');
    const base = uri.split('/').slice(0, 4).join('/');
    return JSON.stringify(await this.request(base, '/api/v1/content/read?uri=' + encodeURIComponent(uri) + '&limit=300', { signal: this.abort.signal }));
  }
  async close() { this.abort.abort(); await this.operation; }
}
