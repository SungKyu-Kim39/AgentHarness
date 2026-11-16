import { spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';

const digest = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const oid = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/;
type Selection = { path: string; mode: string; hash?: string; bytes?: Buffer };
/** Local Git writes only. No shell, hooks, signing, credentials, remote or filters. */
export class GitTools {
  private busy = false;
  private stopped = false;
  private uncertain = false;
  private children = new Set<ChildProcess>();
  private abort = new AbortController();
  constructor(private root: string, private resources: string,
    private approve: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>,
    private verify: () => Promise<void>, private binary = path.join(resources, 'runtime/windows-x64/mcp/git/cmd/git.exe')) {}

  private async run(project: string, work: string, args: string[], signal?: AbortSignal, extra: NodeJS.ProcessEnv = {}) {
    signal = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    signal?.throwIfAborted();
    if (this.stopped || this.uncertain) throw new Error('Git 실행이 중지되었거나 이전 프로세스 종료가 확인되지 않았습니다.');
    const env: NodeJS.ProcessEnv = {
      HOME: work, USERPROFILE: work, APPDATA: work, LOCALAPPDATA: work, TEMP: work, TMP: work,
      PATH: path.dirname(this.binary), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_SYSTEM: path.join(work, 'empty'),
      GIT_CONFIG_GLOBAL: path.join(work, 'empty'), GIT_TERMINAL_PROMPT: '0', GIT_ATTR_NOSYSTEM: '1',
      GIT_LITERAL_PATHSPECS: '1', GIT_OPTIONAL_LOCKS: '0', LC_ALL: 'C', ...extra,
    };
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR']) if (process.env[key]) env[key] = process.env[key];
    const fixed = ['-c', 'core.hooksPath=' + path.join(work, 'hooks'), '-c', 'core.fsmonitor=false',
      '-c', 'core.untrackedCache=false', '-c', 'core.attributesFile=' + path.join(work, 'empty'),
      '-c', 'commit.gpgSign=false', '-c', 'tag.gpgSign=false', '-c', 'credential.helper=',
      '-c', 'protocol.allow=never', '-c', 'core.pager=cat', ...args];
    const supervised = process.platform === 'win32';
    const executable = supervised ? path.join(this.resources, 'runtime/windows-x64/openviking/python/python.exe') : this.binary;
    const argv = supervised ? ['-I', '-B', path.join(this.resources, 'runtime/windows-x64/openviking/sidecar-supervisor.py'), this.binary, ...fixed] : fixed;
    const child = spawn(executable, argv, { cwd: project, env, windowsHide: true, shell: false, detached: !supervised, stdio: 'pipe' });
    this.children.add(child); child.stdin.on('error', () => {});
    let output = Buffer.alloc(0), overflow = false, aborted = false;
    let confirm: NodeJS.Timeout | undefined;
    let rejectStop: ((error: Error) => void) | undefined;
    const stop = () => {
      aborted = true;
      if (supervised) child.stdin.end();
      else if (child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
      confirm ??= setTimeout(() => { this.uncertain = true; child.kill('SIGKILL'); rejectStop?.(new Error('Git 자식 프로세스 종료 확인 실패. 새 실행을 차단합니다.')); }, 8000);
    };
    const collect = (bytes: Buffer) => { if (output.length + bytes.length > 8 * 1024 * 1024) { overflow = true; stop(); } else output = Buffer.concat([output, bytes]); };
    child.stdout.on('data', collect); child.stderr.on('data', () => {});
    const timer = setTimeout(stop, 60000); // Local Git command budget; never a model-queue deadline.
    signal?.addEventListener('abort', stop, { once: true }); if (signal?.aborted) stop();
    try {
      const code = await new Promise<number | null>((resolve, reject) => { rejectStop = reject; child.once('error', reject); child.once('close', resolve); });
      if (this.uncertain) throw new Error('Git 자식 프로세스 종료 확인 실패. 새 실행을 차단합니다.');
      if (aborted || signal?.aborted || overflow) throw new Error('Git 실행을 중지했습니다. 커밋 단계였다면 git_inspect로 실제 HEAD를 확인하세요.');
      return { code, text: output.toString('utf8'), bytes: output };
    } finally {
      clearTimeout(timer); clearTimeout(confirm); signal?.removeEventListener('abort', stop); if (!this.uncertain) this.children.delete(child);
    }
  }
  async execute(project: string, operation: 'stage' | 'commit', paths: string[], message?: string,
    author?: { name: string; email: string }, signal?: AbortSignal, current?: () => Promise<boolean>) {
    if (this.busy || this.stopped || this.uncertain) throw new Error('다른 Git 작업이 실행 중이거나 종료가 확인되지 않았습니다.');
    this.busy = true;
    let work: string | undefined, lock: Awaited<ReturnType<typeof open>> | undefined, lockPath: string | undefined;
    try {
      await this.verify(); signal?.throwIfAborted();
      const binaryHash = digest(await readFile(this.binary));
      await mkdir(path.join(this.root, 'git-operations'), { recursive: true, mode: 0o700 });
      work = await mkdtemp(path.join(this.root, 'git-operations/op-'));
      await mkdir(path.join(work, 'hooks')); await writeFile(path.join(work, 'empty'), '');
      const gitDir = path.join(project, '.git');
      const meta = await lstat(gitDir);
      if (!meta.isDirectory() || meta.isSymbolicLink() || await realpath(gitDir) !== path.resolve(gitDir)) throw new Error('프로젝트 루트의 일반 .git 디렉터리만 지원합니다. worktree·submodule 연결은 지원하지 않습니다.');
      for (const name of ['commondir', 'gitdir', 'objects/info/alternates', 'objects/info/http-alternates', 'shallow', 'info/grafts', 'MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply']) {
        if (await lstat(path.join(gitDir, name)).then(() => true, () => false)) throw new Error('연결된 저장소, shallow 저장소 또는 병합·rebase 진행 중에는 Git 쓰기를 지원하지 않습니다.');
      }
      // Never follow repository metadata links into another repository.
      for (const name of ['HEAD', 'config', 'index', 'objects', 'refs', 'packed-refs']) {
        const info = await lstat(path.join(gitDir, name)).catch(() => undefined);
        if (info?.isSymbolicLink()) throw new Error('Git 메타데이터 링크는 지원하지 않습니다.');
      }
      let metadataCount = 0;
      const inspectMetadata = async (folder: string) => {
        for (const entry of await readdir(folder, { withFileTypes: true }).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return []; throw e; })) {
          if (++metadataCount > 100000) throw new Error('Git 메타데이터 파일 수 제한을 초과했습니다.');
          if (entry.isSymbolicLink()) throw new Error('Git 메타데이터 링크는 지원하지 않습니다.');
          if (entry.isDirectory()) await inspectMetadata(path.join(folder, entry.name));
        }
      };
      for (const name of ['objects', 'refs', 'info']) await inspectMetadata(path.join(gitDir, name));
      const git = async (args: string[], extra?: NodeJS.ProcessEnv) => {
        const result = await this.run(project, work!, args, signal, extra);
        if (result.code !== 0) throw new Error('Git 명령 실패: ' + args[0] + ' (exit ' + result.code + '). 저장소 상태와 사용자 정보를 확인하세요.');
        return result;
      };
      const config = await this.run(work, work, ['config', '--file', path.join(gitDir, 'config'), '--no-includes', '--null', '--list'], signal);
      if (config.code !== 0) throw new Error('Git 저장소 설정을 읽지 못했습니다.');
      const settings = new Map(config.text.split('\0').filter(Boolean).map(row => { const i = row.indexOf('\n'); return [row.slice(0, i).toLowerCase(), row.slice(i + 1)]; }));
      if ([...settings.keys()].some(key => /^(?:include\.|includeif\.|extensions\.|core\.worktree$)/.test(key)) || settings.get('core.bare') === 'true') throw new Error('include·확장 형식·외부 worktree 설정이 있는 저장소는 Git 쓰기를 지원하지 않습니다.');
      const branch = (await git(['symbolic-ref', '--quiet', 'HEAD'])).text.trim();
      if (!/^refs\/heads\/[A-Za-z0-9_./-]+$/.test(branch) || branch.includes('..') || branch.endsWith('/') || branch.split('/').some(p => !p || p.endsWith('.lock'))) throw new Error('일반 로컬 브랜치를 선택하세요. detached HEAD는 지원하지 않습니다.');
      const headResult = await this.run(project, work, ['rev-parse', '--verify', 'HEAD'], signal);
      const head = headResult.code === 0 ? headResult.text.trim() : undefined;
      if (head && !oid.test(head)) throw new Error('Git HEAD 형식 오류');
      const indexPath = path.join(gitDir, 'index');
      if (((await lstat(indexPath).catch(() => undefined))?.size ?? 0) > 64 * 1024 * 1024) throw new Error('Git index 크기 제한을 초과했습니다.');
      const originalIndex = await readFile(indexPath).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return undefined; throw e; });
      const configBytes = await readFile(path.join(gitDir, 'config'));
      const files = new ProjectFiles(project), selected: Selection[] = [];
      const indexRecords = (await git(['ls-files', '--stage', '-z'])).text.split('\0').filter(Boolean).map(line => {
        const match = /^(\d+) ([a-f0-9]+) (\d)\t([\s\S]+)$/.exec(line);
        if (!match || match[3] !== '0') throw new Error('충돌 중인 Git index는 지원하지 않습니다.');
        return { mode: match[1], hash: match[2], path: match[4] };
      });
      for (const name of [...new Set(paths)]) {
        const absolute = await files.resolve(name, true);
        const tracked = indexRecords.find(r => r.path === name);
        if (tracked && !['100644', '100755'].includes(tracked.mode)) throw new Error('링크·submodule은 스테이징하거나 커밋할 수 없습니다.');
        if (operation === 'commit') { selected.push(tracked ?? { path: name, mode: '0' }); continue; }
        const info = await lstat(absolute).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return undefined; throw e; });
        if (!info) { if (!tracked) throw new Error('삭제할 추적 파일이 없습니다: ' + name); selected.push({ path: name, mode: '0' }); continue; }
        if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024 * 1024) throw new Error('64 MiB 이하 일반 파일만 스테이징할 수 있습니다.');
        if (!tracked && (await this.run(project, work, ['check-ignore', '--quiet', '--', name], signal)).code === 0) throw new Error('Git에서 무시한 파일은 자동 추가하지 않습니다: ' + name);
        const attr = (await git(['check-attr', '-z', 'filter', '--', name])).text.split('\0');
        if (attr[2] !== 'unspecified' && attr[2] !== 'unset') throw new Error('외부 clean/LFS 필터가 필요한 파일은 지원하지 않습니다: ' + name);
        selected.push({ path: name, mode: tracked?.mode ?? (process.platform !== 'win32' && info.mode & 0o111 ? '100755' : '100644'), bytes: await readFile(absolute) });
      }
      const identity = author ?? { name: settings.get('user.name') ?? '', email: settings.get('user.email') ?? '' };
      if (operation === 'commit' && (!/^[^\x00-\x1f<>]{1,200}$/.test(identity.name) || !/^[^\s<>@]+@[^\s<>@]+$/.test(identity.email))) throw new Error('커밋 작성자 이름과 이메일이 필요합니다. 저장소의 user.name·user.email 또는 사용자가 제공한 author를 사용하세요. 임의 작성자는 만들지 않습니다.');
      const staged = await git(['diff', '--cached', '--no-ext-diff', '--no-textconv', '--stat', '--', ...selected.map(x => x.path)]);
      if (operation === 'commit' && !staged.text.trim()) throw new Error('선택한 파일의 스테이징된 변경이 없습니다. 먼저 git_stage를 사용하세요.');
      const detail = JSON.stringify({ project, branch, head: head ?? '(initial commit)', operation,
        execution: { executable: this.binary, binarySha256: binaryHash, cwd: project, shell: false, privateEnvironment: true, commands: operation === 'stage' ? ['hash-object --no-filters', 'update-index --cacheinfo/--force-remove (temporary index)', 'publish index with index.lock'] : ['read-tree (temporary index)', 'update-index (selected staged entries)', 'write-tree', 'commit-tree -F fixed-message-file', 'update-ref (compare-and-swap HEAD)'] },
        paths: selected.map(x => ({ path: x.path, mode: x.mode, sha256: x.bytes ? digest(x.bytes) : x.hash ?? '(delete)' })), ...(operation === 'commit' ? { message, author: identity, stagedSummary: staged.text } : {}), policy: 'Explicit paths only; other staged files retained; no hooks, signing, shell, remote or custom filters.' }, null, 2);
      if (!await this.approve(operation === 'stage' ? 'Git 스테이징 승인' : 'Git 커밋 승인', detail, signal)) throw new Error('Git 작업이 거절되었습니다.');
      signal?.throwIfAborted();
      const checkRequest = async () => { signal?.throwIfAborted(); if (current && !await current()) throw new Error('대화 요청이나 프로젝트가 변경되어 Git 쓰기를 보류합니다.'); };
      await checkRequest();
      if (binaryHash !== digest(await readFile(this.binary))) throw new Error('승인 후 Git 실행 파일이 변경되었습니다.');
      if (!configBytes.equals(await readFile(path.join(gitDir, 'config')))) throw new Error('승인 후 Git 설정이 변경되었습니다. 다시 확인하세요.');
      const nowHead = await this.run(project, work, ['rev-parse', '--verify', 'HEAD'], signal);
      if ((nowHead.code === 0 ? nowHead.text.trim() : undefined) !== head || (await git(['symbolic-ref', '--quiet', 'HEAD'])).text.trim() !== branch) throw new Error('승인 후 브랜치 또는 HEAD가 변경되었습니다.');
      const pendingLock = path.join(gitDir, 'index.lock'); lock = await open(pendingLock, 'wx', 0o600); lockPath = pendingLock;
      const currentIndex = await readFile(indexPath).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return undefined; throw e; });
      if ((currentIndex ? digest(currentIndex) : '') !== (originalIndex ? digest(originalIndex) : '')) throw new Error('승인 후 Git index가 변경되었습니다. 다른 스테이징을 보존하고 중단합니다.');
      const temporaryIndex = path.join(work, 'index');
      if (operation === 'stage' && originalIndex) await copyFile(indexPath, temporaryIndex, constants.COPYFILE_EXCL);
      else await git(['read-tree', head ?? '--empty'], { GIT_INDEX_FILE: temporaryIndex });
      for (const item of selected) {
        signal?.throwIfAborted();
        if (operation === 'stage') {
          const current = await readFile(await files.resolve(item.path, true)).catch((e: NodeJS.ErrnoException) => { if (e.code === 'ENOENT') return undefined; throw e; });
          if ((current ? digest(current) : '') !== (item.bytes ? digest(item.bytes) : '')) throw new Error('승인 후 파일이 변경되었습니다: ' + item.path);
          if (item.bytes) {
            // Fixed snapshot plus --no-filters avoids executing arbitrary clean programs.
            // Built-in EOL conversion is intentionally not applied; the approved bytes are staged.
            const source = path.join(work, 'source'); await writeFile(source, item.bytes);
            item.hash = (await git(['hash-object', '-w', '--no-filters', source])).text.trim();
          }
        }
        if (item.mode === '0') await git(['update-index', '--force-remove', '--', item.path], { GIT_INDEX_FILE: temporaryIndex });
        else { if (!oid.test(item.hash ?? '')) throw new Error('Git object 형식 오류'); await git(['update-index', '--add', '--cacheinfo', item.mode, item.hash!, item.path], { GIT_INDEX_FILE: temporaryIndex }); }
      }
      if (operation === 'stage') {
        await checkRequest();
        await lock.writeFile(await readFile(temporaryIndex)); await lock.sync(); await lock.close(); lock = undefined;
        await rename(lockPath, indexPath); lockPath = undefined;
        return { status: 'staged', paths: selected.map(x => x.path), otherStagedFilesPreserved: true, lineEndings: 'approved-file-bytes' };
      }
      const tree = (await git(['write-tree'], { GIT_INDEX_FILE: temporaryIndex })).text.trim();
      const messageFile = path.join(work, 'message'); await writeFile(messageFile, message!);
      const commit = (await git(['commit-tree', tree, ...(head ? ['-p', head] : []), '-F', messageFile], {
        GIT_AUTHOR_NAME: identity.name, GIT_AUTHOR_EMAIL: identity.email, GIT_COMMITTER_NAME: identity.name, GIT_COMMITTER_EMAIL: identity.email,
      })).text.trim();
      if (!oid.test(commit)) throw new Error('Git 커밋 확인 실패');
      // Compare-and-swap prevents replacing a concurrent commit. Original index is untouched.
      await checkRequest();
      await git(['update-ref', '-m', 'Ned: selected-path commit', branch, commit, head ?? '0'.repeat(commit.length)]);
      return { status: 'committed', commit, branch, paths: selected.map(x => x.path), otherStagedFilesPreserved: true, hooksExecuted: false, pushed: false };
    } finally {
      await lock?.close(); if (lockPath) await rm(lockPath, { force: true });
      if (work && !this.uncertain) await rm(work, { recursive: true, force: true });
      this.busy = false;
    }
  }
  async close() {
    this.stopped = true; this.abort.abort();
    await Promise.all([...this.children].map(child => new Promise<void>((resolve, reject) => {
      if (child.exitCode !== null || child.signalCode !== null) { resolve(); return; }
      const timer = setTimeout(() => { this.uncertain = true; reject(new Error('Git 실행 종료를 확인하지 못했습니다.')); }, 9000);
      child.once('close', () => { clearTimeout(timer); resolve(); });
    })));
  }
}
