import { randomBytes, randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { atomicJSON } from '../src/main/config';
import type { Proposal } from '../src/shared/contracts';
import { OwnedCommand } from './owned-command';

const isWin = process.platform === 'win32';

export interface WorktreeRecord {
  id: string;
  project: string;
  path: string;
  baseCommit: string;
  label: string;
  createdAt: string;
}

export interface WorktreeSandboxInput {
  operation: 'list' | 'create' | 'diff' | 'apply' | 'discard';
  id?: string;
  label?: string;
}

export interface WorktreeApplyHooks {
  approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
  validateEdit?: (session: string, project: string, proposal: Proposal, signal?: AbortSignal) => Promise<void>;
}

/** Isolated git worktree sandboxes for parallel worker subagents and side-by-side experiments. */
export class WorktreeSandbox {
  private commands: OwnedCommand;
  private abort = new AbortController();
  private records = new Map<string, WorktreeRecord>();
  private loading?: Promise<void>;

  constructor(
    private root: string,
    private resources: string,
    private options: { gitBinary?: string } = {},
  ) {
    this.commands = new OwnedCommand(resources);
  }

  private gitExecutable(): string {
    if (this.options.gitBinary) return this.options.gitBinary;
    if (isWin) return path.join(this.resources, 'runtime/windows-x64/mcp/git/cmd/git.exe');
    return 'git';
  }

  private indexFile() {
    return path.join(this.root, 'worktrees/index.json');
  }

  private ensureLoaded() {
    return this.loading ??= this.loadIndex();
  }

  private async loadIndex() {
    const raw = await readFile(this.indexFile(), 'utf8').catch(() => undefined);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.worktrees)) {
        for (const item of parsed.worktrees) {
          if (item && /^wt-[a-f0-9]{12}$/.test(item.id) && typeof item.project === 'string' && path.isAbsolute(item.project) &&
              item.path === path.join(this.root, 'worktrees', item.id) && /^[a-f0-9]{40,64}$/.test(item.baseCommit)) {
            this.records.set(item.id, item);
          }
        }
      }
    } catch {}
  }

  private async saveIndex() {
    await atomicJSON(this.indexFile(), { schemaVersion: 1, worktrees: [...this.records.values()] });
  }

  private async runGit(cwd: string, work: string, args: string[], signal?: AbortSignal, maxStdoutBytes?: number) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    const empty = path.join(work, 'empty');
    const hooks = path.join(work, 'hooks');
    await mkdir(hooks, { recursive: true, mode: 0o700 });
    await writeFile(empty, '').catch(() => {});
    const binary = this.gitExecutable();
    const env: NodeJS.ProcessEnv = {
      HOME: work,
      USERPROFILE: work,
      APPDATA: work,
      LOCALAPPDATA: work,
      TEMP: work,
      TMP: work,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_SYSTEM: empty,
      GIT_CONFIG_GLOBAL: empty,
      GIT_TERMINAL_PROMPT: '0',
      GIT_ATTR_NOSYSTEM: '1',
      GIT_LITERAL_PATHSPECS: '1',
      GIT_OPTIONAL_LOCKS: '0',
      LC_ALL: 'C',
      PATH: path.isAbsolute(binary) ? path.dirname(binary) : process.env.PATH,
    };
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR']) if (process.env[key]) env[key] = process.env[key];
    const fixed = [
      '-c', 'core.hooksPath=' + hooks,
      '-c', 'core.fsmonitor=false',
      '-c', 'core.untrackedCache=false',
      '-c', 'core.attributesFile=' + empty,
      '-c', 'commit.gpgSign=false',
      '-c', 'tag.gpgSign=false',
      '-c', 'credential.helper=',
      '-c', 'protocol.allow=never',
      '-c', 'core.pager=cat',
      ...args,
    ];
    return this.commands.run({ executable: binary, args: fixed, cwd, env }, combined, 60000, undefined, maxStdoutBytes);
  }

  async create(project: string, label = 'sandbox', signal?: AbortSignal): Promise<WorktreeRecord> {
    await this.ensureLoaded();
    const gitDir = path.join(project, '.git');
    if (!(await lstat(gitDir).then(s => s.isDirectory(), () => false)) ||
        !(await lstat(path.join(gitDir, 'config')).then(s => s.isFile(), () => false))) {
      throw new Error('git worktree 격리 샌드박스는 일반 Git 저장소 프로젝트에서 사용할 수 있습니다.');
    }
    const existingForProject = [...this.records.values()].filter(r => r.project === project);
    if (existingForProject.length >= 6) {
      throw new Error('프로젝트당 활성 worktree 샌드박스는 최대 6개입니다. 사용하지 않는 샌드박스를 먼저 정리(discard)하세요.');
    }
    await mkdir(path.join(this.root, 'worktree-ops'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'worktree-ops/add-'));
    try {
      const config = await this.runGit(project, work, ['config', '--local', '--no-includes', '--name-only', '--null', '--list'], signal);
      if (config.exitCode !== 0 || config.outputTruncated || config.stdout.split('\0').some(key => /^(?:filter\.|include|diff\.|extensions\.|core\.worktree$)/i.test(key))) {
        throw new Error('외부 실행·공유 설정을 사용하는 Git 저장소는 Worktree 샌드박스에서 지원하지 않습니다.');
      }
      const head = await this.runGit(project, work, ['rev-parse', '--verify', 'HEAD'], signal);
      if (head.exitCode !== 0) throw new Error('worktree를 생성하려면 최소 1개의 Git 커밋(HEAD)이 필요합니다.');
      const baseCommit = head.stdout.trim();
      const id = 'wt-' + randomBytes(6).toString('hex');
      const wtPath = path.join(this.root, 'worktrees', id);
      await mkdir(path.dirname(wtPath), { recursive: true, mode: 0o700 });
      const add = await this.runGit(project, work, ['worktree', 'add', '--detach', wtPath, baseCommit], signal);
      if (add.exitCode !== 0) {
        throw new Error(`git worktree 생성 실패: ${add.output.slice(0, 800)}`);
      }
      const record: WorktreeRecord = {
        id,
        project,
        path: wtPath,
        baseCommit,
        label: label.replace(/[\r\n\0]+/g, ' ').trim().slice(0, 120) || 'sandbox',
        createdAt: new Date().toISOString(),
      };
      this.records.set(id, record);
      await this.saveIndex();
      return record;
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async get(project: string, id: string): Promise<WorktreeRecord> {
    await this.ensureLoaded();
    const record = this.records.get(id);
    if (!record || record.project !== project) {
      throw new Error(`현재 프로젝트에 속한 유효한 worktree 샌드박스를 찾지 못했습니다: ${id}`);
    }
    const baseReal = await realpath(path.join(this.root, 'worktrees')).catch(() => undefined);
    const stat = await lstat(record.path).catch(() => undefined);
    const entryReal = await realpath(record.path).catch(() => undefined);
    if (!baseReal || !stat?.isDirectory() || stat.isSymbolicLink() || entryReal !== path.join(baseReal, record.id)) {
      throw new Error(`현재 프로젝트에 속한 유효한 worktree 샌드박스를 찾지 못했습니다: ${id}`);
    }
    return record;
  }

  async list(project: string) {
    await this.ensureLoaded();
    const items: Array<WorktreeRecord & { exists: boolean }> = [];
    for (const record of this.records.values()) {
      if (record.project !== project) continue;
      const exists = await lstat(record.path).then(s => s.isDirectory() && !s.isSymbolicLink(), () => false);
      items.push({ ...record, exists });
    }
    return { status: 'ok', worktrees: items };
  }

  private async collectChanges(record: WorktreeRecord, work: string, signal?: AbortSignal) {
    const status = await this.runGit(record.path, work, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames'], signal);
    if (status.exitCode !== 0 || status.outputTruncated) throw new Error(`worktree 상태 조회 실패: ${status.output.slice(0, 500)}`);
    const changes: Array<{ kind: 'added' | 'modified' | 'deleted'; path: string }> = [];
    for (const token of status.stdout.split('\0').filter(Boolean)) {
      const code = token.slice(0, 2);
      const rel = token.slice(3).replaceAll('\\', '/');
      if (!rel) continue;
      // Added in index then deleted in working tree results in no net file change.
      if (code === 'AD') continue;
      if (code === '??' || code.includes('A')) changes.push({ kind: 'added', path: rel });
      else if (code[1] === 'D' || (code[0] === 'D' && code[1] === ' ')) changes.push({ kind: 'deleted', path: rel });
      else changes.push({ kind: 'modified', path: rel });
    }
    return changes;
  }

  async diff(project: string, id: string, signal?: AbortSignal) {
    const record = await this.get(project, id);
    await mkdir(path.join(this.root, 'worktree-ops'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'worktree-ops/diff-'));
    try {
      const changes = await this.collectChanges(record, work, signal);
      const diffRes = await this.runGit(record.path, work, ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', record.baseCommit], signal);
      let preview = diffRes.stdout;
      const wtFiles = new ProjectFiles(record.path);
      for (const item of changes.filter(c => c.kind === 'added')) {
        if (preview.length >= 16000) break;
        const body = await wtFiles.read(item.path).catch(() => '(binary or unreadable)');
        preview += `\n--- /dev/null\n+++ b/${item.path}\n${body.slice(0, 2000)}\n`;
      }
      return {
        status: 'ok',
        id: record.id,
        label: record.label,
        baseCommit: record.baseCommit,
        changedCount: changes.length,
        changes: changes.slice(0, 200),
        diffPreview: preview.slice(0, 16000),
        diffTruncated: diffRes.outputTruncated || preview.length > 16000,
      };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async apply(session: string, project: string, id: string, hooks: WorktreeApplyHooks, signal?: AbortSignal) {
    const record = await this.get(project, id);
    await mkdir(path.join(this.root, 'worktree-ops'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'worktree-ops/apply-'));
    try {
      const changes = await this.collectChanges(record, work, signal);
      if (!changes.length) {
        return { status: 'noop', id: record.id, message: 'worktree에 반영할 변경 사항이 없습니다.' };
      }
      const wtFiles = new ProjectFiles(record.path);
      const mainFiles = new ProjectFiles(project);
      const proposals: Proposal[] = [];
      for (const item of changes) {
        const proposal = item.kind === 'deleted'
          ? await mainFiles.proposeDelete(randomUUID(), item.path)
          : await mainFiles.propose(randomUUID(), item.path, await wtFiles.readStrictUtf8(item.path));
        const tree = await this.runGit(record.path, work, ['ls-tree', '-z', record.baseCommit, '--', item.path], signal);
        if (tree.exitCode !== 0 || tree.outputTruncated) throw new Error(`worktree 기준 파일 확인 실패: ${item.path}`);
        if (tree.stdout) {
          if (!/^100(?:644|755) blob /.test(tree.stdout)) throw new Error(`일반 텍스트 파일만 반영할 수 있습니다: ${item.path}`);
          const base = await this.runGit(record.path, work, ['show', `${record.baseCommit}:${item.path}`], signal, 2 * 1024 * 1024 + 65536);
          if (base.exitCode !== 0 || base.outputTruncated || !proposal.baseHash.startsWith('file:') || base.stdout.replace(/\r\n/g, '\n') !== proposal.before.replace(/\r\n/g, '\n')) {
            throw new Error(`기준 커밋 이후 본 프로젝트 파일이 바뀌어 적용하지 않았습니다: ${item.path}`);
          }
        } else if (!proposal.baseHash.startsWith('missing:')) {
          throw new Error(`본 프로젝트의 새 파일과 충돌하여 적용하지 않았습니다: ${item.path}`);
        }
        await hooks.validateEdit?.(session, project, proposal, signal);
        proposals.push(proposal);
      }
      const summary = changes
        .slice(0, 50)
        .map(c => `${c.kind}: ${c.path}`)
        .join('\n');
      const ok = await hooks.approve(
        `Worktree 샌드박스 변경 반영 (${record.id})`,
        `프로젝트: ${project}\n샌드박스: ${record.id} (${record.label})\n기준 커밋: ${record.baseCommit.slice(0, 8)}\n반영 파일(${proposals.length}개):\n${summary}`,
        signal,
      );
      if (!ok) throw new Error('Worktree 변경 반영을 취소했습니다.');
      signal?.throwIfAborted();
      await mainFiles.applyBatch(proposals, {
        signal,
        validate: proposal => hooks.validateEdit?.(session, project, proposal, signal) ?? Promise.resolve(),
        snapshot: proposal => atomicJSON(path.join(this.root, 'snapshots', session, proposal.id + '.json'), proposal),
        journal: { dir: path.join(this.root, 'batch-journals'), operation: 'worktree_sandbox_apply', session },
      });
      return {
        status: 'applied',
        id: record.id,
        appliedFiles: proposals.length,
        paths: proposals.map(p => p.path),
      };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async discard(project: string, id: string, signal?: AbortSignal) {
    await this.ensureLoaded();
    const record = this.records.get(id);
    if (!record || record.project !== project) {
      throw new Error(`현재 프로젝트에 속한 유효한 worktree 샌드박스를 찾지 못했습니다: ${id}`);
    }
    const stat = await lstat(record.path).catch(() => undefined);
    await mkdir(path.join(this.root, 'worktree-ops'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'worktree-ops/rm-'));
    try {
      if (!stat) {
        const pruned = await this.runGit(project, work, ['worktree', 'prune'], signal);
        if (pruned.exitCode !== 0) throw new Error('누락된 Worktree 정리를 확인하지 못했습니다. 작업 기록을 유지합니다.');
      } else {
        await this.get(project, id);
        const removed = await this.runGit(project, work, ['worktree', 'remove', '--force', record.path], signal);
        if (removed.exitCode !== 0) throw new Error('Worktree 제거를 확인하지 못했습니다. 작업 기록을 유지합니다.');
      }
      this.records.delete(id);
      await this.saveIndex();
      return { status: 'discarded', id };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async close() {
    this.abort.abort();
    await this.commands.close();
  }
}
