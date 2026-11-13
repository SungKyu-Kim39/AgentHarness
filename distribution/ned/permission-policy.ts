import path from 'node:path';
import { lstat, readFile } from 'node:fs/promises';
import { atomicJSON } from '../../src/main/config';

export const permissionModes = [
  { value: 'ask', name: '승인 요청', description: '파일 수정·빌드·지식 전달·데스크톱 도구를 실행하기 전에 확인합니다.' },
  { value: 'edits', name: '프로젝트 파일 자동 승인', description: '선택한 프로젝트의 파일 수정은 자동 승인합니다. 빌드·지식 전달·데스크톱은 확인합니다.' },
  { value: 'full', name: '전체 권한', description: 'Ned가 지원하는 파일 수정·빌드·지식·데스크톱 도구의 승인창을 생략합니다. 재시작 후에도 유지됩니다.' },
] as const;
export type PermissionMode = typeof permissionModes[number]['value'];
export function permissionMode(value: unknown): PermissionMode {
  if (!permissionModes.some(mode => mode.value === value)) throw new Error('지원하지 않는 Ned 권한 모드입니다.');
  return value as PermissionMode;
}
export const permissionConfigId = 'ned.permissions';
export function permissionOption(mode: PermissionMode, revision: number) {
  // Zed persists selector defaults by ID. A new policy revision invalidates stale defaults.
  return { id: permissionConfigId + '.' + revision, name: '권한', category: '_ned_permissions', type: 'select', currentValue: mode,
    description: 'Ned 전체에 적용하며 업데이트·재시작 후에도 유지합니다. 프로젝트 범위·충돌·중지는 계속 검사합니다.', options: permissionModes };
}

/** User-selected authority; never inferred from model text or project configuration. */
export class PermissionPolicy {
  private current: PermissionMode = 'ask';
  private persisted?: PermissionMode;
  private generation = 0;
  private controller = new AbortController();
  private queue: Promise<unknown> = Promise.resolve();
  private saving = false;
  private listeners = new Set<() => void>();
  readonly file: string;
  constructor(root: string) { this.file = path.join(root, 'permissions.json'); }
  get mode() { return this.current; }
  get revision() { return this.generation; }
  get signal() { return this.controller.signal; }
  onChange(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  private changed() { for (const listener of this.listeners) listener(); }
  async load() {
    const stat = await lstat(this.file).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return undefined; throw error; });
    if (!stat) return;
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096) throw new Error('Ned 권한 설정 파일을 확인하세요. 기존 파일을 보존했습니다.');
    let saved: any;
    try { saved = JSON.parse(await readFile(this.file, 'utf8')); }
    catch { throw new Error('Ned 권한 설정의 JSON 문법을 확인하세요. 기존 파일을 보존했습니다.'); }
    if (!saved || saved.schemaVersion !== 1 || Object.keys(saved).some(key => !['schemaVersion', 'mode', 'revision'].includes(key))) throw new Error('Ned 권한 설정 형식을 확인하세요.');
    if (saved.revision !== undefined && (!Number.isSafeInteger(saved.revision) || saved.revision < 0)) throw new Error('Ned 권한 설정 버전을 확인하세요.');
    this.current = permissionMode(saved.mode);
    this.generation = saved.revision ?? 0;
    this.persisted = this.current;
  }
  async set(value: unknown, expectedRevision?: number) {
    const next = permissionMode(value);
    const work = this.queue.then(async () => {
      if (expectedRevision !== undefined && expectedRevision !== this.generation) throw new Error('권한 설정이 변경되었습니다. 최신 메뉴에서 다시 선택하세요.');
      if (next === this.current && next === this.persisted) return;
      if (this.generation >= Number.MAX_SAFE_INTEGER) throw new Error('Ned 권한 설정 버전을 확인하세요.');
      this.saving = true; this.controller.abort(); this.controller = new AbortController(); this.current = 'ask';
      this.generation++;
      try {
        const stat = await lstat(this.file).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return undefined; throw error; });
        if (stat && (!stat.isFile() || stat.isSymbolicLink())) throw new Error('권한 설정 파일의 링크나 폴더를 덮어쓸 수 없습니다.');
        await atomicJSON(this.file, { schemaVersion: 1, mode: next, revision: this.generation });
        this.current = next;
        this.persisted = next;
      } finally { this.saving = false; this.changed(); }
    });
    this.queue = work.catch(() => {}); return work;
  }
  async decide<T>(kind: 'edit' | 'effect', signal: AbortSignal | undefined, accepted: T, prompt: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const combined = signal ? AbortSignal.any([signal, this.signal]) : this.signal;
    combined.throwIfAborted();
    if (this.saving) throw new Error('Ned 권한 설정을 적용 중입니다.');
    const automatic = this.current === 'full' || (kind === 'edit' && this.current === 'edits');
    const result = automatic ? accepted : await prompt(combined);
    combined.throwIfAborted(); return result;
  }
}
