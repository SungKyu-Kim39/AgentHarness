import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { atomicJSON } from '../src/main/config';
import type { Proposal } from '../src/shared/contracts';
import { OwnedCommand } from './owned-command';

const isWin = process.platform === 'win32';
const sha = (v: string | Buffer) => createHash('sha256').update(v).digest('hex');
const CHECKPOINT_ID = /^[a-f0-9]{7,40}$/;
const MAX_CHECKPOINT_FILE_BYTES = 2 * 1024 * 1024;
const EXCLUDE_RULES = [
  '.git/',
  '.venv/',
  'node_modules/',
  'dist/',
  'build/',
  'vendor/',
  '.ned/',
  '.zed/',
  '.opencode/',
  '.vscode/',
  '.cache/',
  '__pycache__/',
  '*.pyc',
  '*.exe',
  '*.dll',
  '*.so',
  '*.dylib',
  '*.zip',
  '*.tgz',
  '*.tar.gz',
].join('\n') + '\n';

export interface CheckpointInput {
  operation: 'list' | 'create' | 'diff' | 'restore';
  checkpointId?: string;
  label?: string;
  limit?: number;
}

export interface CheckpointRestoreHooks {
  approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
  validateEdit?: (session: string, project: string, proposal: Proposal, signal?: AbortSignal) => Promise<void>;
}

/** Shadow-Git turn checkpoints stored outside the project's own .git history. */
export class ProjectCheckpoints {
  private commands: OwnedCommand;
  private abort = new AbortController();
  private turnRecorded = new Set<string>();
  private busy = new Set<string>();

  constructor(
    private root: string,
    private resources: string,
    private options: {
      gitBinary?: string;
    } = {},
  ) {
    this.commands = new OwnedCommand(resources);
  }

  private gitExecutable(): string {
    if (this.options.gitBinary) return this.options.gitBinary;
    if (isWin) return path.join(this.resources, 'runtime/windows-x64/mcp/git/cmd/git.exe');
    return 'git';
  }

  private repoDir(project: string): string {
    return path.join(this.root, 'checkpoints', sha(project).slice(0, 32) + '.git');
  }

  private async runGit(
    project: string,
    gitDir: string,
    work: string,
    args: string[],
    signal?: AbortSignal,
    options: { omitWorkTree?: boolean; indexFile?: string; maxStdoutBytes?: number } = {},
  ) {
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
      GIT_DIR: gitDir,
      ...(options.omitWorkTree ? {} : { GIT_WORK_TREE: project }),
      ...(options.indexFile ? { GIT_INDEX_FILE: options.indexFile } : {}),
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
      '-c', 'core.autocrlf=false',
      '-c', 'core.safecrlf=false',
      '-c', 'commit.gpgSign=false',
      '-c', 'tag.gpgSign=false',
      '-c', 'credential.helper=',
      '-c', 'protocol.allow=never',
      '-c', 'core.pager=cat',
      '-c', 'user.name=Ned Checkpoint',
      '-c', 'user.email=checkpoint@ned.local',
      ...args,
    ];
    return this.commands.run({ executable: binary, args: fixed, cwd: project, env }, combined, 60000, undefined, options.maxStdoutBytes);
  }

  private async ensureRepo(project: string, work: string, signal?: AbortSignal): Promise<string> {
    const gitDir = this.repoDir(project);
    const head = path.join(gitDir, 'HEAD');
    const exists = await lstat(head).then(s => s.isFile(), () => false);
    if (!exists) {
      await mkdir(gitDir, { recursive: true, mode: 0o700 });
      const init = await this.runGit(project, gitDir, work, ['init', '--bare'], signal, { omitWorkTree: true });
      if (init.exitCode !== 0) throw new Error(`체크포인트 저장소 초기화 실패: ${init.output.slice(0, 500)}`);
      await this.runGit(project, gitDir, work, ['config', 'core.bare', 'false'], signal, { omitWorkTree: true });
      await this.runGit(project, gitDir, work, ['config', 'core.worktree', project], signal, { omitWorkTree: true });
    }
    await mkdir(path.join(gitDir, 'info'), { recursive: true, mode: 0o700 });
    await writeFile(path.join(gitDir, 'info/exclude'), EXCLUDE_RULES, 'utf8');
    return gitDir;
  }

  private async stageProjectFiles(project: string, gitDir: string, work: string, signal?: AbortSignal, indexFile?: string) {
    const files = new ProjectFiles(project);
    const listed = await files.list();
    const eligible: string[] = [];
    let skippedLarge = 0;
    for (const rel of listed) {
      if (/(?:^|\/)(?:\.env(?:\..*)?|\.npmrc|\.pypirc|\.netrc|\.git-credentials)$|\.(?:pem|key|pfx|p12)$/i.test(rel)) continue;
      const resolved = await files.resolve(rel, true).catch(() => undefined);
      if (!resolved) continue;
      const stat = await lstat(resolved).catch(() => undefined);
      if (!stat?.isFile() || stat.isSymbolicLink()) continue;
      if (stat.size > MAX_CHECKPOINT_FILE_BYTES) {
        skippedLarge++;
        continue;
      }
      if (await files.readStrictUtf8(rel).catch(() => undefined) === undefined) continue;
      eligible.push(rel);
    }
    const gitOpts = indexFile ? { indexFile } : {};
    // Clear index first so deletions are accurately reflected in the shadow commit.
    const reset = await this.runGit(project, gitDir, work, ['read-tree', '--empty'], signal, gitOpts);
    if (reset.exitCode !== 0) throw new Error('체크포인트 임시 인덱스를 초기화하지 못했습니다.');
    const batchSize = 200;
    for (let i = 0; i < eligible.length; i += batchSize) {
      const chunk = eligible.slice(i, i + batchSize);
      const added = await this.runGit(project, gitDir, work, ['add', '-f', '--', ...chunk], signal, gitOpts);
      if (added.exitCode !== 0) throw new Error(`체크포인트 인덱싱 실패: ${added.output.slice(0, 500)}`);
    }
    return { indexedFiles: eligible.length, skippedLarge };
  }

  private async createLocked(project: string, label: string, work: string, signal?: AbortSignal) {
    const gitDir = await this.ensureRepo(project, work, signal);
    const { indexedFiles, skippedLarge } = await this.stageProjectFiles(project, gitDir, work, signal);
    const hasHead = (await this.runGit(project, gitDir, work, ['rev-parse', '--verify', 'HEAD'], signal)).exitCode === 0;
    if (hasHead) {
      const diff = await this.runGit(project, gitDir, work, ['diff', '--cached', '--quiet'], signal);
      if (diff.exitCode === 0) {
        const headId = (await this.runGit(project, gitDir, work, ['rev-parse', 'HEAD'], signal)).stdout.trim();
        return { status: 'unchanged', checkpointId: headId, shortId: headId.slice(0, 8), label, indexedFiles, skippedLarge };
      }
    }
    const safeLabel = label.replace(/[\r\n\0]+/g, ' ').trim().slice(0, 160) || 'checkpoint';
    const commit = await this.runGit(project, gitDir, work, ['commit', '--allow-empty', '-m', safeLabel], signal);
    if (commit.exitCode !== 0) throw new Error(`체크포인트 저장 실패: ${commit.output.slice(0, 600)}`);
    const id = (await this.runGit(project, gitDir, work, ['rev-parse', 'HEAD'], signal)).stdout.trim();
    return { status: 'created', checkpointId: id, shortId: id.slice(0, 8), label: safeLabel, indexedFiles, skippedLarge };
  }

  async create(project: string, label = 'manual', signal?: AbortSignal) {
    if (this.busy.has(project)) throw new Error('이 프로젝트의 체크포인트 작업이 이미 진행 중입니다.');
    this.busy.add(project);
    await mkdir(path.join(this.root, 'checkpoint-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'checkpoint-work/op-'));
    try {
      return await this.createLocked(project, label, work, signal);
    } finally {
      this.busy.delete(project);
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async autoCheckpointBeforeEdit(session: string, project: string, requestId: string | undefined, signal?: AbortSignal) {
    const key = `${session}:${project}:${requestId ?? 'default'}`;
    if (this.turnRecorded.has(key) || this.busy.has(project)) return undefined;
    this.turnRecorded.add(key);
    if (this.turnRecorded.size > 512) {
      const first = this.turnRecorded.values().next().value;
      if (first) this.turnRecorded.delete(first);
    }
    try {
      return await this.create(project, `auto-turn:${session.slice(0, 12)}`, signal);
    } catch {
      return undefined;
    }
  }

  async list(project: string, limit = 20, signal?: AbortSignal) {
    const gitDir = this.repoDir(project);
    const exists = await lstat(path.join(gitDir, 'HEAD')).then(s => s.isFile(), () => false);
    if (!exists) return { status: 'ok', checkpoints: [] };
    await mkdir(path.join(this.root, 'checkpoint-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'checkpoint-work/ls-'));
    try {
      const capped = Math.min(100, Math.max(1, limit));
      const log = await this.runGit(project, gitDir, work, ['log', `-n`, String(capped), '--format=%H%x09%cI%x09%s'], signal);
      if (log.exitCode !== 0) return { status: 'ok', checkpoints: [] };
      const checkpoints = log.stdout
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const [id, at, ...rest] = line.split('\t');
          return { id, shortId: id.slice(0, 8), at, label: rest.join('\t') };
        });
      return { status: 'ok', checkpoints };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  private async resolveCheckpointCommit(project: string, gitDir: string, work: string, checkpointId: string, signal?: AbortSignal): Promise<string> {
    if (!CHECKPOINT_ID.test(checkpointId)) throw new Error('유효한 체크포인트 ID(7~40자리 hex)를 지정하세요.');
    const rev = await this.runGit(project, gitDir, work, ['rev-parse', '--verify', `${checkpointId}^{commit}`], signal);
    if (rev.exitCode !== 0) throw new Error(`체크포인트를 찾지 못했습니다: ${checkpointId}`);
    return rev.stdout.trim();
  }

  async diff(project: string, checkpointId: string, signal?: AbortSignal) {
    const gitDir = this.repoDir(project);
    const exists = await lstat(path.join(gitDir, 'HEAD')).then(s => s.isFile(), () => false);
    if (!exists) throw new Error('이 프로젝트에 저장된 체크포인트가 없습니다.');
    await mkdir(path.join(this.root, 'checkpoint-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'checkpoint-work/diff-'));
    try {
      const indexFile = path.join(work, 'index');
      const commit = await this.resolveCheckpointCommit(project, gitDir, work, checkpointId, signal);
      await this.stageProjectFiles(project, gitDir, work, signal, indexFile);
      const status = await this.runGit(project, gitDir, work, ['diff', '--cached', '--name-status', '--no-renames', commit], signal, { indexFile });
      const changes = status.stdout
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(line => {
          const [code, ...parts] = line.split('\t');
          return { change: code, path: parts.join('\t') };
        });
      const patch = await this.runGit(project, gitDir, work, ['diff', '--cached', '--no-renames', commit], signal, { indexFile });
      return {
        status: 'ok',
        checkpointId: commit,
        shortId: commit.slice(0, 8),
        changedCount: changes.length,
        changes: changes.slice(0, 200),
        diffPreview: patch.stdout.slice(0, 16000),
        diffTruncated: patch.stdout.length > 16000,
      };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async restore(session: string, project: string, checkpointId: string, hooks: CheckpointRestoreHooks, signal?: AbortSignal) {
    if (this.busy.has(project)) throw new Error('이 프로젝트의 체크포인트 작업이 이미 진행 중입니다.');
    const gitDir = this.repoDir(project);
    const exists = await lstat(path.join(gitDir, 'HEAD')).then(s => s.isFile(), () => false);
    if (!exists) throw new Error('이 프로젝트에 저장된 체크포인트가 없습니다.');

    this.busy.add(project);
    await mkdir(path.join(this.root, 'checkpoint-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'checkpoint-work/restore-'));
    try {
      const commit = await this.resolveCheckpointCommit(project, gitDir, work, checkpointId, signal);
      const indexFile = path.join(work, 'index');
      await this.stageProjectFiles(project, gitDir, work, signal, indexFile);
      // Compare current staged state against target checkpoint:
      // A in (commit -> current) means added after checkpoint -> delete to restore.
      // D in (commit -> current) means deleted after checkpoint -> recreate from commit.
      // M in (commit -> current) means modified after checkpoint -> overwrite from commit.
      const status = await this.runGit(project, gitDir, work, ['diff', '--cached', '--name-status', '-z', '--no-renames', commit], signal, { indexFile });
      if (status.exitCode !== 0 || status.outputTruncated) throw new Error('복원할 파일 목록을 모두 확인하지 못했습니다.');
      const fields = status.stdout.split('\0');
      const entries: Array<{ code: string; relPath: string }> = [];
      for (let i = 0; i < fields.length - 1; i += 2) {
        const code = fields[i];
        const relPath = fields[i + 1];
        if (!relPath || !['A', 'D', 'M'].includes(code)) throw new Error('지원하지 않는 체크포인트 변경 항목이 있습니다.');
        entries.push({ code, relPath });
      }
      if (!entries.length) {
        return { status: 'noop', checkpointId: commit, message: '현재 프로젝트 상태가 선택한 체크포인트와 동일합니다.' };
      }

      const files = new ProjectFiles(project);
      const proposals: Proposal[] = [];
      for (const entry of entries) {
        if (entry.code === 'A') {
          const proposal = await files.proposeDelete(randomUUID(), entry.relPath);
          await hooks.validateEdit?.(session, project, proposal, signal);
          proposals.push(proposal);
        } else if (entry.code === 'M' || entry.code === 'D') {
          const blob = await this.runGit(project, gitDir, work, ['show', `${commit}:${entry.relPath}`], signal, { maxStdoutBytes: MAX_CHECKPOINT_FILE_BYTES + 65536 });
          if (blob.exitCode !== 0 || blob.outputTruncated || blob.stdout.includes('\0')) throw new Error(`체크포인트 파일 복원 읽기 실패: ${entry.relPath}`);
          const proposal = await files.propose(randomUUID(), entry.relPath, blob.stdout);
          await hooks.validateEdit?.(session, project, proposal, signal);
          proposals.push(proposal);
        }
      }

      const summary = entries
        .slice(0, 50)
        .map(e => `${e.code === 'A' ? '삭제(복원)' : e.code === 'D' ? '재생성' : '되돌리기'}: ${e.relPath}`)
        .join('\n');
      const ok = await hooks.approve(
        `프로젝트 체크포인트 복원 (${commit.slice(0, 8)})`,
        `프로젝트: ${project}\n대상 체크포인트: ${commit}\n변경 파일(${proposals.length}개):\n${summary}${entries.length > 50 ? '\n...(이하 생략)' : ''}`,
        signal,
      );
      if (!ok) throw new Error('체크포인트 복원을 취소했습니다.');
      signal?.throwIfAborted();

      // Save a safety checkpoint only after target validation and user approval, while holding this.busy.
      const safety = await this.createLocked(project, `pre-restore:${commit.slice(0, 8)}`, work, signal);

      await files.applyBatch(proposals, {
        signal,
        validate: proposal => hooks.validateEdit?.(session, project, proposal, signal) ?? Promise.resolve(),
        snapshot: proposal => atomicJSON(path.join(this.root, 'snapshots', session, proposal.id + '.json'), proposal),
        journal: { dir: path.join(this.root, 'batch-journals'), operation: 'project_checkpoint_restore', session },
      });
      return {
        status: 'restored',
        checkpointId: commit,
        shortId: commit.slice(0, 8),
        restoredFiles: proposals.length,
        safetyCheckpointId: safety.checkpointId,
        paths: proposals.map(p => p.path).slice(0, 100),
      };
    } finally {
      this.busy.delete(project);
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async close() {
    this.abort.abort();
    await this.commands.close();
  }
}
