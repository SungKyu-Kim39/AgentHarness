import { createServer, type Server } from 'node:net';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { chmod, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { Peer } from './rpc';
import { atomicJSON } from '../../src/main/config';
import type { NativeRuntime, Credentials } from '../native-control';
import type { Proposal } from '../../src/shared/contracts';

export class AgentOwner {
  private token = randomBytes(32).toString('hex');
  private server?: Server;
  private peers = new Set<Peer>();
  private sessions = new Map<string, Peer>();
  readonly descriptor: string;
  private endpoint = '';
  private stopping = false;
  private cancelled = new Set<Promise<void>>();
  constructor(private root: string, private runtime: NativeRuntime, private connection: Credentials,
    private selectProject: (directory: string) => Promise<boolean>) {
    this.descriptor = path.join(root, 'runtime', 'ned-agent.json');
  }
  async start() {
    await mkdir(path.dirname(this.descriptor), { recursive: true, mode: 0o700 });
    this.endpoint = process.platform === 'win32'
      ? '\\\\.\\pipe\\ned-' + this.token
      : path.join(this.root, 'runtime', 'agent-' + this.token.slice(0, 12) + '.sock');
    this.server = createServer(socket => {
      let authenticated = false;
      const authorized = new Set<string>();
      const attached = new Set<string>();
      const peer = new Peer(socket, async (method, params) => {
        if (!authenticated) {
          const offered = Buffer.from(String(params?.token ?? ''));
          const expected = Buffer.from(this.token);
          if (method !== 'hello' || offered.length !== expected.length || !timingSafeEqual(offered, expected)) {
            socket.destroy(); throw new Error('Unauthorized');
          }
          authenticated = true; return this.connection;
        }
        if (this.stopping) throw new Error('Ned is stopping');
        if (method === 'authorize') {
          if (typeof params?.cwd !== 'string' || !path.isAbsolute(params.cwd)) throw new Error('Absolute project directory required');
          const directory = await this.runtime.canonicalProject(params.cwd);
          if (!authorized.has(directory)) {
            if (!await this.selectProject(directory)) throw new Error('프로젝트 접근이 거절되었습니다.');
            await this.runtime.authorizeProject(directory); authorized.add(directory);
          }
          return { cwd: directory };
        }
        if (method === 'bind') {
          if (typeof params?.session !== 'string') throw new Error('Session required');
          const directory = await this.runtime.projectForSession(params.session);
          if (!authorized.has(directory)) throw new Error('프로젝트 범위가 확인되지 않았습니다.');
          const previous = this.sessions.get(params.session);
          if (previous && previous !== peer) throw new Error('다른 편집기에서 사용 중인 세션입니다.');
          await this.runtime.activateEditScope(params.session);
          this.sessions.set(params.session, peer); attached.add(params.session); return {};
        }
        if (method === 'cancel') {
          if (!attached.has(params?.session)) throw new Error('Session not attached');
          await this.runtime.interruptSession(params.session); return {};
        }
        throw new Error('Unsupported owner request');
      });
      this.peers.add(peer);
      const authenticationTimer = setTimeout(() => { if (!authenticated) peer.close(); }, 10000);
      peer.onClose(() => {
        clearTimeout(authenticationTimer); this.peers.delete(peer);
        for (const session of attached) if (this.sessions.get(session) === peer) {
          this.sessions.delete(session);
          const work = this.runtime.interruptSession(session).catch(() => {});
          this.cancelled.add(work); void work.finally(() => this.cancelled.delete(work));
        }
      });
    });
    await new Promise<void>((resolve, reject) => { this.server!.once('error', reject); this.server!.listen(this.endpoint, resolve); });
    if (process.platform !== 'win32') await chmod(this.endpoint, 0o600);
    await atomicJSON(this.descriptor, { schemaVersion: 1, socket: this.endpoint, token: this.token });
    return this.descriptor;
  }
  async checkBuffer(session: string, project: string, proposal: Proposal, signal?: AbortSignal) {
    const peer = this.sessions.get(session);
    if (!peer) throw new Error('편집기 연결이 없어 파일 수정을 보류합니다.');
    const response = await peer.call('checkBuffer', {
      session, path: path.join(project, proposal.path), before: proposal.before,
      missing: proposal.baseHash.startsWith('missing:'),
    }, signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000));
    if (response?.matches !== true) throw new Error('저장하지 않은 편집기 변경이 있습니다. Ctrl+S로 저장한 뒤 다시 요청하세요.');
  }
  async close() {
    this.stopping = true; await rm(this.descriptor, { force: true });
    for (const peer of this.peers) peer.close();
    await new Promise<void>(resolve => { if (!this.server?.listening) resolve(); else this.server.close(() => resolve()); });
    await Promise.allSettled([...this.cancelled]);
    if (process.platform !== 'win32' && this.endpoint) await rm(this.endpoint, { force: true });
  }
}
