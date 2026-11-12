import { constants } from 'node:fs';
import { lstat, open, readFile } from 'node:fs/promises';
import path from 'node:path';

export const koreanInstructions = `## Speak Korean

You must speak or write only in Korean.

You may use English words for technical terms or proper nouns that are difficult to replace.

Never use other languages, such as Chinese or Japanese.`;

/** Append the managed default once, preserving all existing user-authored instructions. */
export async function ensureEditorInstructions(directory: string) {
  const file = path.join(directory, 'AGENTS.md');
  const existing = await lstat(file).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  });
  if (existing && (!existing.isFile() || existing.isSymbolicLink() || existing.size > 1024 * 1024)) throw new Error('Ned AGENTS.md 파일 형식 또는 경로를 확인하세요.');
  const before = existing ? await readFile(file, 'utf8') : '';
  if (before.includes(koreanInstructions)) return;
  const separator = !before || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const handle = await open(file, constants.O_CREAT | constants.O_WRONLY | constants.O_APPEND | (constants.O_NOFOLLOW ?? 0), 0o600);
  try { await handle.writeFile(separator + koreanInstructions + '\n', 'utf8'); }
  finally { await handle.close(); }
}
