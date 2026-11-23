export interface BufferCheckRequest {
  before: string;
  missing?: boolean;
}

export interface BufferCheckResult {
  matches: boolean;
  attempts: number;
  editorLength?: number;
  diskLength?: number;
  diskHasBom?: boolean;
  diskHasStandaloneCr?: boolean;
}

/**
 * Matches Zed's text loading normalization (`crates/file_content` BOM removal +
 * `crates/text` `LINE_SEPARATORS_REGEX` `\\r\\n|\\r` -> `\\n`) so clean saved
 * files with UTF-8 BOM or standalone CR are not falsely flagged as dirty.
 */
export function normalizeBufferText(text: string): string {
  const withoutBom = text.startsWith('\uFEFF') ? text.slice(1) : text;
  return withoutBom.replace(/\r\n|\r/g, '\n');
}

export function buffersMatch(editorContent: string, diskContent: string): boolean {
  return normalizeBufferText(editorContent) === normalizeBufferText(diskContent);
}

const DEFAULT_RETRY_DELAYS_MS = [120, 250, 400] as const;

function waitWithSignal(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(signal.reason ?? new Error('Aborted')); return; }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new Error('Aborted'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Verifies Zed's current in-memory buffer against the on-disk text.
 * Retries briefly on mismatch so Zed's background file-watcher reload can catch
 * up after an earlier disk write to a cached (even closed-tab) BufferStore entry.
 */
export async function verifyEditorBuffer(
  readTextFile: () => Promise<{ content?: unknown }>,
  params: BufferCheckRequest,
  options: { retryDelaysMs?: readonly number[]; signal?: AbortSignal } = {},
): Promise<BufferCheckResult> {
  const delays = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
  const disk = params.before;
  const diskHasBom = disk.startsWith('\uFEFF');
  const diskHasStandaloneCr = /\r(?!\n)/.test(disk);
  let lastEditorLength: number | undefined;
  let attempts = 0;

  for (let i = 0; i <= delays.length; i++) {
    attempts++;
    try {
      const result = await readTextFile();
      if (typeof result?.content === 'string') {
        lastEditorLength = result.content.length;
        if (buffersMatch(result.content, disk)) {
          return { matches: true, attempts };
        }
      } else {
        lastEditorLength = undefined;
      }
    } catch (error: any) {
      // ACP resource_not_found is acceptable only for a proposed new file.
      if (params.missing && error?.code === -32002) {
        return { matches: true, attempts };
      }
      throw new Error('편집기 버퍼 확인 실패. 파일을 저장한 뒤 다시 요청하세요.');
    }

    if (i < delays.length) {
      await waitWithSignal(delays[i], options.signal);
    }
  }

  return {
    matches: false,
    attempts,
    editorLength: lastEditorLength,
    diskLength: disk.length,
    diskHasBom,
    diskHasStandaloneCr,
  };
}
