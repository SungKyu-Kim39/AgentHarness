import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { realpath, lstat } from 'node:fs/promises';
import path from 'node:path';

/** Bounded file IO; do not drop integrity checks or saturate employee disks. */
export async function verifyFiles(root: string, files: Array<{ path: string; sha256: string }>, progress?: (done: number, total: number) => void) {
  const base = await realpath(root); let next = 0, done = 0, failed=false;
  const settled=await Promise.allSettled(Array.from({ length: Math.min(4, files.length) }, async () => {
    try { while (!failed && next < files.length) {
      const file = files[next++];
      if (!file || typeof file.path !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256) || path.isAbsolute(file.path) || /[\\:\x00-\x1f]/.test(file.path) || file.path.split('/').some(p => !p || p === '.' || p === '..')) throw Error('번들 파일 경로 오류');
      const target = await realpath(path.join(base, file.path)), relative = path.relative(base, target);
      if (relative.startsWith('..') || path.isAbsolute(relative) || !(await lstat(target)).isFile()) throw Error('번들 파일 범위 오류');
      const hash = createHash('sha256');
      for await (const chunk of createReadStream(target)) hash.update(chunk);
      if (hash.digest('hex') !== file.sha256) throw Error('번들 파일 무결성 오류');
      progress?.(++done, files.length);
    } } catch(error){failed=true;throw error;}
  }));
  const failure=settled.find(result=>result.status==='rejected');if(failure?.status==='rejected')throw failure.reason;
}
