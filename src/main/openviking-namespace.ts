import { randomBytes, createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, rename, cp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { atomicJSON } from './config';
import type { SkillTransport } from './openviking-skills';
import { request as httpRequest } from 'node:http';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

export const vikingAccount = 'ned';
// Read-only compatibility identifiers. Never use these for new registrations.
export const previousVikingAccount = 'l-vibe';
export const previousSkillPrefix = previousVikingAccount + '-';
export const previousSkillOwner = 'l_vibe_owner';
export const previousSkillHash = 'l_vibe_bundle_sha256';

/** Private local binary export with cancellation, a size bound and no queue deadline. */
export async function backupVikingAccount(baseUrl: string, headers: Record<string, string>, file: string, signal: AbortSignal) {
  const target = new URL('/api/v1/pack/backup', baseUrl);
  if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1') throw new Error('OV_NAMESPACE_ENDPOINT');
  const attempt = (vectors: boolean) => new Promise<boolean>((resolve, reject) => {
    signal.throwIfAborted();
    const body = JSON.stringify({ include_vectors: vectors });
    const req = httpRequest(target, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': String(Buffer.byteLength(body)) }, signal }, res => {
      if (res.statusCode !== 200) {
        let error = ''; res.on('data', b => { if (error.length < 65536) error += b.toString(); else res.destroy(); });
        res.once('error', reject);
        res.once('end', () => {
          // An incomplete old index is preserved in the original workspace;
          // export its files and let the SDK rebuild the staged index instead.
          if (vectors && res.statusCode === 400 && error.includes('Cannot export incomplete OpenViking vector index snapshot')) resolve(false);
          else reject(new Error('OV_NAMESPACE_EXPORT'));
        }); return;
      }
      let size = 0;
      const bound = new Transform({ transform(chunk, _encoding, done) {
        size += chunk.length; done(size > 2 * 1024 * 1024 * 1024 ? new Error('OV_NAMESPACE_SIZE') : null, chunk);
      } });
      pipeline(res, bound, createWriteStream(file, { flags: 'wx', mode: 0o600 }), { signal }).then(() => resolve(true), reject);
    });
    req.on('socket', socket => socket.setKeepAlive(true, 60000)); req.once('error', reject); req.end(body);
  });
  if (!await attempt(true)) await attempt(false);
}

interface MigrationRecord {
  schemaVersion: 1; id: string; phase: 'exporting' | 'restoring' | 'committing' | 'ready' | 'failed';
  registry?: boolean;
}
interface SkillRecords { schemaVersion: 1; entries: Record<string, { bundleHash: string; revision: string }> }
function skillRecords(bytes: Buffer): SkillRecords {
  const value = JSON.parse(bytes.toString('utf8'));
  if (value.schemaVersion !== 1 || !value.entries || Array.isArray(value.entries) || typeof value.entries !== 'object' ||
    Object.values(value.entries).some((e: any) => typeof e?.bundleHash !== 'string' || typeof e?.revision !== 'string')) throw new Error('OV_NAMESPACE_REGISTRY');
  return value;
}
async function smallFile(file: string) {
  const stat = await lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error('OV_NAMESPACE_STATE');
  return readFile(file);
}
const fingerprint = (remote: any) => {
  if (!Array.isArray(remote?.files)) throw new Error('OV_NAMESPACE_SKILLS');
  // The SDK legitimately regenerates semantic summaries during a move/reindex.
  // Package source and reference files must stay unchanged.
  return JSON.stringify(remote.files.filter((f: any) => !f.is_dir && !/(^|\/)\.(abstract|overview)\.md$/.test(f.path))
    .map((f: any) => ({ path: f.path, sha256: f.sha256 })).sort((a: any, b: any) => a.path.localeCompare(b.path)));
};
interface MigrationRuntime {
  start(workspace: string, account: string): Promise<void>;
  stop(): Promise<void>;
  backup(file: string, signal: AbortSignal): Promise<void>;
  request: SkillTransport;
}
async function directory(file: string) {
  try {
    const stat = await lstat(file);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('OV_NAMESPACE_PATH');
    return true;
  } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false; throw error; }
}
async function exists(file: string) {
  try { await lstat(file); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false; throw error; }
}
async function noLinks(folder: string) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name), stat = await lstat(file);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) throw new Error('OV_NAMESPACE_PATH');
    if (stat.isDirectory()) await noLinks(file);
  }
}

/** Migrate through the pinned SDK, never rename an account without its vector index.
 * The original workspace stays byte-for-byte intact in a private backup directory.
 * Only a fully restored, checked and stopped staging workspace becomes active.
 */
export async function migrateVikingNamespace(folder: string, runtime: MigrationRuntime, signal: AbortSignal) {
  const active = path.join(folder, 'data'), journal = path.join(folder, 'namespace-migration.json');
  let record: MigrationRecord | undefined;
  try {
    const stat = await lstat(journal);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096) throw new Error('OV_NAMESPACE_STATE');
    record = JSON.parse(await readFile(journal, 'utf8'));
    if (record?.schemaVersion !== 1 || !/^[a-f0-9]{32}$/.test(record.id) ||
      !['exporting', 'restoring', 'committing', 'ready', 'failed'].includes(record.phase)) throw new Error('OV_NAMESPACE_STATE');
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const paths = (id: string) => {
    const backup = path.join(folder, 'namespace-backups', id);
    return { backup, stage: path.join(backup, 'staged'), source: path.join(backup, 'read-source'), original: path.join(backup, 'original'), pack: path.join(backup, 'snapshot.ovpack') };
  };
  const save = async (phase: MigrationRecord['phase']) => { record!.phase = phase; await atomicJSON(journal, record); };
  const finishRegistry = async () => {
    if (!record?.registry) return;
    const base = paths(record.id).backup;
    const previous = await smallFile(path.join(base, 'bundled-skills.previous.json'));
    const next = await smallFile(path.join(base, 'bundled-skills.next.json'));
    skillRecords(previous); const parsed = skillRecords(next);
    const current = await smallFile(path.join(folder, 'bundled-skills.json'));
    const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
    if (hash(current) === hash(next)) return;
    if (hash(current) !== hash(previous)) throw new Error('OV_NAMESPACE_REGISTRY_CONFLICT');
    await atomicJSON(path.join(folder, 'bundled-skills.json'), parsed);
  };
  // Recover an interrupted two-rename commit, without merging or overwriting data.
  if (record?.phase === 'committing') {
    const p = paths(record.id);
    if (!await directory(p.backup)) throw new Error('OV_NAMESPACE_STATE');
    if (await exists(p.stage)) {
      if (!await directory(p.stage) || !await directory(path.join(p.stage, 'viking', vikingAccount)) ||
        await exists(path.join(p.stage, 'viking', previousVikingAccount))) throw new Error('OV_NAMESPACE_STATE');
      await noLinks(p.stage);
    }
    if (!await exists(active) && await directory(p.original) && await directory(p.stage)) await rename(p.stage, active);
    if (await directory(path.join(active, 'viking', vikingAccount)) && await directory(p.original) && !await exists(p.stage)) {
      await finishRegistry(); await save('ready'); return;
    }
    if (await directory(path.join(active, 'viking', previousVikingAccount)) && await directory(p.stage) && !await exists(p.original)) {
      await rename(active, p.original); await rename(p.stage, active); await finishRegistry(); await save('ready'); return;
    }
    throw new Error('OV_NAMESPACE_STATE');
  }
  if (!await directory(active)) return;
  const old = await directory(path.join(active, 'viking', previousVikingAccount));
  if (!old) return;
  if (await exists(path.join(active, 'viking', vikingAccount))) throw new Error('OV_NAMESPACE_CONFLICT');
  await noLinks(active); signal.throwIfAborted();
  // A failed attempt is retained. A retry uses a fresh isolated staging workspace.
  record = { schemaVersion: 1, id: randomBytes(16).toString('hex'), phase: 'exporting' };
  const p = paths(record.id);
  await mkdir(path.join(folder, 'namespace-backups'), { recursive: true, mode: 0o700 });
  if (!await directory(path.join(folder, 'namespace-backups'))) throw new Error('OV_NAMESPACE_PATH');
  await mkdir(p.backup, { mode: 0o700 }); await mkdir(p.stage, { mode: 0o700 });
  let registry: SkillRecords | undefined;
  try {
    const bytes = await smallFile(path.join(folder, 'bundled-skills.json')); registry = skillRecords(bytes);
    await writeFile(path.join(p.backup, 'bundled-skills.previous.json'), bytes, { flag: 'wx', mode: 0o600 }); record.registry = true;
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  await save('exporting');
  const call = async (route: string, body?: unknown) => {
    signal.throwIfAborted();
    return runtime.request(route, { ...(body === undefined ? {} : { method: 'POST', body }), signal });
  };
  const stat = async (uri: string) => {
    try { await call('/api/v1/fs/stat?uri=' + encodeURIComponent(uri)); return true; }
    catch (error) { if ((error as { status?: number }).status === 404) return false; throw error; }
  };
  try {
    // A newer SDK must never open the only copy of an older database.
    await cp(active, p.source, { recursive: true, force: false, errorOnExist: true, preserveTimestamps: true });
    signal.throwIfAborted();
    await runtime.start(p.source, previousVikingAccount);
    await call('/api/v1/system/wait', {});
    await runtime.backup(p.pack, signal);
    await runtime.stop(); signal.throwIfAborted();
    // OVPack backup intentionally covers resources/user only in 0.5.4/0.5.5.
    // Preserve the complete agent area separately while both SDKs are stopped,
    // then rebuild its index through the SDK under the new account identity.
    const agentSource = path.join(p.source, 'viking', previousVikingAccount, 'agent');
    const hasAgent = await directory(agentSource);
    if (hasAgent) {
      await mkdir(path.join(p.stage, 'viking', vikingAccount), { recursive: true, mode: 0o700 });
      await cp(agentSource, path.join(p.stage, 'viking', vikingAccount, 'agent'), { recursive: true, force: false, errorOnExist: true, preserveTimestamps: true });
    }
    await save('restoring'); await runtime.start(p.stage, vikingAccount);
    // Staging was created exclusively for this attempt. Overwrite is never used
    // against the user's active workspace or an existing destination account.
    const { openAsBlob } = await import('node:fs');
    const form = new FormData(); form.append('file', await openAsBlob(p.pack), 'snapshot.ovpack');
    const upload = await call('/api/v1/resources/temp_upload', form);
    const id = upload.result?.temp_file_id;
    if (typeof id !== 'string' || !id) throw new Error('OV_NAMESPACE_UPLOAD');
    await call('/api/v1/pack/restore', { temp_file_id: id, on_conflict: 'overwrite', vector_mode: 'auto' });
    await call('/api/v1/system/wait', {});
    const oldResources = 'viking://resources/' + previousVikingAccount, newResources = 'viking://resources/ned';
    if (await stat(oldResources)) {
      if (await stat(newResources)) throw new Error('OV_NAMESPACE_CONFLICT');
      await call('/api/v1/fs/mv', { from_uri: oldResources, to_uri: newResources });
    }
    const listed = await call('/api/v1/skills?target_uri=' + encodeURIComponent('viking://agent/skills') + '&node_limit=1000');
    if (!Array.isArray(listed.result?.skills)) throw new Error('OV_NAMESPACE_SKILLS');
    const moved: Array<{ id: string; name: string; fingerprint: string }> = [];
    const detail = (name: string) => call('/api/v1/skills/' + name + '?target_uri=' + encodeURIComponent('viking://agent/skills') + '&include_source=true&include_files=true&include_integrity=true');
    for (const skill of listed.result.skills) {
      const name = skill.name;
      if (typeof name !== 'string' || !name.startsWith(previousSkillPrefix) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) continue;
      const remote = await detail(name);
      if (remote.result?.source?.[previousSkillOwner] !== 'bundled-skills') continue;
      const from = 'viking://agent/skills/' + name, to = 'viking://agent/skills/ned-' + name.slice(previousSkillPrefix.length);
      if (await stat(to)) throw new Error('OV_NAMESPACE_CONFLICT');
      const id = name.slice(previousSkillPrefix.length), saved = registry?.entries[id];
      if (saved && saved.revision === remote.result.revision && saved.bundleHash === remote.result.source?.[previousSkillHash])
        moved.push({ id, name: 'ned-' + id, fingerprint: fingerprint(remote.result) });
      await call('/api/v1/fs/mv', { from_uri: from, to_uri: to });
    }
    if (hasAgent) await call('/api/v1/content/reindex', { uri: 'viking://agent/skills', mode: 'vectors_only', wait: true });
    await call('/api/v1/system/wait', {});
    for (const uri of ['viking://resources', 'viking://user', ...(hasAgent ? ['viking://agent/skills'] : [])]) {
      const result = await call('/api/v1/system/consistency', { uri });
      if (result.result?.ok !== true) throw new Error('OV_NAMESPACE_INDEX');
    }
    for (const item of moved) {
      const remote = await detail(item.name);
      if (fingerprint(remote.result) !== item.fingerprint || typeof remote.result.revision !== 'string') throw new Error('OV_NAMESPACE_SKILL_CHANGED');
      registry!.entries[item.id].revision = remote.result.revision;
    }
    if (registry) await writeFile(path.join(p.backup, 'bundled-skills.next.json'), JSON.stringify(registry, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    await runtime.stop(); signal.throwIfAborted();
    if (!await directory(path.join(p.stage, 'viking', vikingAccount)) || await exists(path.join(p.stage, 'viking', previousVikingAccount))) throw new Error('OV_NAMESPACE_VERIFY');
    await save('committing');
    await rename(active, p.original); await rename(p.stage, active); await finishRegistry(); await save('ready');
  } catch (error) {
    await runtime.stop();
    if (record.phase !== 'committing') await save('failed');
    throw error;
  }
}
