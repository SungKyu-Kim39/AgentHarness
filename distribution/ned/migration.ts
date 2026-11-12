import { lstat, readdir, mkdir, copyFile, rename, rm, rmdir, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { atomicJSON } from '../../src/main/config';
const execute = promisify(execFile);
async function exists(file: string) { return access(file).then(() => true, () => false); }
/** Transactional copy: original survives, existing Ned state is never overwritten. */
export async function migrateLegacy(legacy: string, target: string, isRunning?: () => Promise<boolean>) {
  if (await exists(path.join(target, 'settings.enc.json')) || await exists(path.join(target, 'migration.json'))) return 'existing';
  if (!await exists(path.join(legacy, 'settings.enc.json'))) return 'absent';
  if (await exists(target) && (await readdir(target)).length) throw new Error('Ned 데이터 폴더가 비어 있지 않습니다. 기존 데이터를 자동으로 덮어쓰지 않습니다.');
  const running = isRunning ?? (async () => {
    if (process.platform !== 'win32') return false;
    const system = process.env.SystemRoot ?? 'C:\\Windows';
    const result = await execute(path.join(system, 'System32/tasklist.exe'), ['/FI', 'IMAGENAME eq L-Vibe.exe', '/FO', 'CSV', '/NH'], { windowsHide: true, timeout: 10000 });
    return /"L-Vibe.exe"/i.test(result.stdout);
  });
  if (await running()) throw new Error('기존 L-Vibe를 완전히 종료한 뒤 Ned를 실행하세요.');
  const stage = target + '-migration-' + randomUUID();
  async function copy(source: string, destination: string) {
    const stat = await lstat(source);
    if (stat.isSymbolicLink()) throw new Error('이전 데이터에 링크가 있어 자동 이관하지 않았습니다.');
    if (stat.isDirectory()) {
      await mkdir(destination, { recursive: true, mode: 0o700 });
      for (const entry of await readdir(source)) {
        // Runtime sockets/lock files and Electron caches are regenerated.
        if (['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'GPUCache', 'Code Cache', 'Cache'].includes(entry)) continue;
        await copy(path.join(source, entry), path.join(destination, entry));
      }
    } else if (stat.isFile()) await copyFile(source, destination);
    else throw new Error('이전 데이터에 복사할 수 없는 특수 파일이 있습니다.');
  }
  try {
    await copy(legacy, stage);
    if (await running()) throw new Error('L-Vibe가 실행되어 이관을 취소했습니다.');
    await atomicJSON(path.join(stage, 'migration.json'), { schemaVersion: 1, source: legacy, preservedOriginal: true, copiedAt: new Date().toISOString() });
    if (await exists(target)) await rmdir(target);
    await rename(stage, target); return 'migrated';
  } finally { await rm(stage, { recursive: true, force: true }); }
}
