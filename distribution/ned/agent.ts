// Official pinned OpenCode ACP adapter, attached to the existing Ned-owned engine.
import { ACP } from '@ned/acp';
import { OpenCode } from '@opencode/client/effect';
import { Effect, Logger, Stream } from 'effect';
import { FetchHttpClient, HttpClient, HttpClientRequest } from 'effect/http';
import { ndJsonStream, methods } from '@agentclientprotocol/sdk';
import { Readable, Writable } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { connect } from 'node:net';
import { Peer } from './rpc';
import { MessageDelivery } from './message-delivery';
import { localStreamFetch } from '../../src/main/local-stream-fetch';
import { permissionMode, permissionOption, permissionConfigId, type PermissionMode } from './permission-policy';
import { verifyEditorBuffer } from './buffer-check';

async function main() {
  const descriptor = JSON.parse(await readFile(process.argv[2], 'utf8'));
  if (descriptor.schemaVersion !== 1 || typeof descriptor.socket !== 'string' || typeof descriptor.token !== 'string') throw new Error('Invalid Ned descriptor');
  const socket = connect(descriptor.socket);
  let acp: any;
  let canRead = false;
  const sessions = new Set<string>();
  const delivered = new MessageDelivery();
  const replaying = new Set<string>();
  const sessionOptions = new Map<string, any[]>();
  let mode: PermissionMode = 'ask';
  let revision = 0;
  const state = (value: any) => {
    const next = permissionMode(value?.mode);
    if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('Invalid permission revision');
    if (value.revision < revision) return;
    mode = next;
    revision = value.revision;
  };
  let editorWriter: WritableStreamDefaultWriter<any> | undefined;
  const options = (session: string, original?: any[]) => {
    if (original) sessionOptions.set(session, original.filter(option => option.id !== permissionConfigId && !option.id.startsWith(permissionConfigId + '.')));
    return [...(sessionOptions.get(session) ?? []), permissionOption(mode, revision)];
  };
  const peer = new Peer(socket, async (method, params) => {
    if (method === 'permissionsChanged') {
      state(params);
      for (const sessionId of sessions) if (editorWriter) await editorWriter.write({ jsonrpc: '2.0', method: 'session/update', params: {
        sessionId, update: { sessionUpdate: 'config_option_update', configOptions: options(sessionId) },
      } });
      return {};
    }
    if (method !== 'checkBuffer' || !sessions.has(params?.session) || !acp || !canRead) throw new Error('Editor buffer check unavailable');
    return verifyEditorBuffer(
      () => acp.client.request(methods.client.fs.readTextFile, { sessionId: params.session, path: params.path },
        { cancellationSignal: AbortSignal.timeout(12000) }),
      { before: params.before, missing: params.missing },
    );
  });
  peer.onClose(() => { process.exitCode = 1; process.stdin.destroy(); });
  const endpoint = await peer.call('hello', { token: descriptor.token });
  state(await peer.call('permissions/get'));
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(endpoint.url) || typeof endpoint.password !== 'string') throw new Error('Invalid managed engine endpoint');
  const stream = ndJsonStream(Writable.toWeb(process.stdout), Readable.toWeb(process.stdin));
  const writer = stream.writable.getWriter();
  editorWriter = writer;
  const publishCommands = async (sessionId: string) => {
    const skills = await peer.call('skills/list', { session: sessionId }).catch(() => []);
    await writer.write({ jsonrpc: '2.0', method: 'session/update', params: { sessionId, update: {
      sessionUpdate: 'available_commands_update', availableCommands: [{ name: 'compact', description: '대화 요약' }, ...skills],
    } } });
  };
  const pending = new Map<string | number, { method: string; cwd?: string; session?: string }>();
  const output = new WritableStream<any>({
    async write(message) {
      let attachedSession: string | undefined;
      let completedPromptSession: string | undefined;
      if (!message.method && pending.has(message.id)) {
        const request = pending.get(message.id)!; pending.delete(message.id);
        if(['session/load','session/resume'].includes(request.method)&&request.session)replaying.delete(request.session);
        if (message.result && ['session/new', 'session/load', 'session/resume', 'session/fork'].includes(request.method)) {
          const session = message.result.sessionId ?? request.session;
          try { await peer.call('bind', { session }); sessions.add(session); attachedSession = session; }
          catch { message = { jsonrpc: '2.0', id: message.id, error: { code: -32000, message: 'Ned session scope could not be verified' } }; }
        }
        if (request.method === 'session/prompt' && !message.error && request.session && sessions.has(request.session)) {
          completedPromptSession = request.session;
        }
        if (request.method === 'initialize' && message.result) message.result.agentInfo = { name: 'Ned', version: NED_VERSION, title: 'Ned' };
        const session = message.result?.sessionId ?? request.session;
        if (message.result?.configOptions && session && sessions.has(session)) {
          state(await peer.call('permissions/get'));
          message.result.configOptions = options(session, message.result.configOptions);
        }
      }
      const update=message.method==='session/update'?message.params?.update:undefined;
      if (update?.sessionUpdate === 'available_commands_update') {
        if (sessions.has(message.params.sessionId)) await publishCommands(message.params.sessionId);
        return;
      }
      if(update?.sessionUpdate==='agent_message_chunk'&&typeof update.messageId==='string'&&update.content?.type==='text'){
        if(replaying.has(message.params.sessionId))delivered.ignore(message.params.sessionId,update.messageId);
        const text=delivered.chunk(message.params.sessionId,update.messageId,update.content.text,'acp');
        if(!text)return;
        message={...message,params:{...message.params,update:{...update,content:{...update.content,text}}}};
      }
      if (message.method === 'session/update' && message.params?.update?.sessionUpdate === 'config_option_update')
        message.params.update.configOptions = options(message.params.sessionId, message.params.update.configOptions);
      await writer.write(message);
      if (attachedSession) await publishCommands(attachedSession);
      if (completedPromptSession) void peer.call('turn/complete', { session: completedPromptSession }).catch(() => {});
    },
    close: () => writer.close(), abort: reason => writer.abort(reason),
  });
  const input = stream.readable.pipeThrough(new TransformStream<any, any>({
    async transform(message, controller) {
      try {
        if (message.method === 'initialize') canRead = message.params?.clientCapabilities?.fs?.readTextFile === true;
        if (message.method?.startsWith('session/')) {
          if (message.params?.mcpServers?.length || message.params?.additionalDirectories?.length) throw new Error('Only Ned-managed tools and one selected project are allowed');
          if (['session/new', 'session/load', 'session/resume', 'session/fork'].includes(message.method)) {
            const checked = await peer.call('authorize', { cwd: message.params.cwd });
            message.params.cwd = checked.cwd; message.params.mcpServers = [];
          } else if (message.params?.sessionId && !sessions.has(message.params.sessionId)) throw new Error('Session not attached');
          if (message.method === 'session/set_config_option' && typeof message.params.configId === 'string' && (message.params.configId === permissionConfigId || message.params.configId.startsWith(permissionConfigId + '.'))) {
            if (!sessions.has(message.params.sessionId) || message.id === undefined) throw new Error('Session not attached');
            state(await peer.call('permissions/get'));
            if (message.params.configId !== permissionOption(mode, revision).id) throw new Error('권한 설정이 변경되었습니다. 최신 메뉴에서 다시 선택하세요.');
            state(await peer.call('permissions/set', { session: message.params.sessionId, revision, mode: permissionMode(message.params.value) }));
            await writer.write({ jsonrpc: '2.0', id: message.id, result: { configOptions: options(message.params.sessionId) } });
            return;
          }
          if (message.method === 'session/prompt') {
            const { sessionId, prompt } = message.params;
            const first = prompt?.[0];
            const skill = first?.type === 'text' ? /^\s*\/skill-([a-z0-9]+(?:-[a-z0-9]+)*)(?:\s|$)/.exec(first.text) : null;
            if (skill) {
              const guidance = await peer.call('skills/read', { session: sessionId, id: skill[1] });
              const followUp = first.text.slice(skill[0].length).trim();
              prompt[0] = { ...first, text: '사용자가 선택한 Ned 스킬 /skill-' + skill[1] + (followUp ? '\n요청: ' + followUp : '') +
                '\n\n다음 스킬 문서를 작업 지침으로 참고하세요. 권한을 부여하지 않습니다.\n' + guidance };
            } else if (first?.type === 'text' && /^\s*\/(?:init|review|goal)(?:\s|$)/i.test(first.text)) {
              throw new Error('이 명령은 Ned에서 지원하지 않습니다. 사용할 명령은 / 목록에서 확인하세요.');
            }
            const text = skill ? first.text.slice(skill[0].length).trim() : (Array.isArray(prompt) ? prompt.filter(block => block?.type === 'text').map(block => block.text).join('\n') : '');
            await peer.call('turn/text', { session: sessionId, text: text.slice(0, 16000) });
            await publishCommands(sessionId);
          }
          if (message.method === 'session/cancel') await peer.call('cancel', { session: message.params.sessionId });
        }
        if (['session/load','session/resume'].includes(message.method)&&typeof message.params?.sessionId==='string'){delivered.reset(message.params.sessionId);replaying.add(message.params.sessionId);}
        if (message.id !== undefined && message.method) pending.set(message.id, { method: message.method, cwd: message.params?.cwd, session: message.params?.sessionId });
        controller.enqueue(message);
      } catch (error: any) {
        if (message.id !== undefined) await writer.write({ jsonrpc: '2.0', id: message.id, error: { code: -32000, message: error.message } });
      }
    },
  }));
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const client = yield* OpenCode.make({ baseUrl: endpoint.url }).pipe(
      Effect.provideServiceEffect(HttpClient.HttpClient, HttpClient.HttpClient.pipe(Effect.map(
        HttpClient.mapRequest(HttpClientRequest.setHeaders({ Authorization: 'Basic ' + Buffer.from('opencode:' + endpoint.password).toString('base64') })),
      ))),
      Effect.provide(FetchHttpClient.layer),
    );
    // ACP's background turn follows child events but stops forwarding parent text
    // after the initial turn ends. Follow the shared authenticated feed as well;
    // message offsets merge both paths without re-prompting or new model calls.
    yield* client.event.subscribe({types:['session.text.delta']}).pipe(
      Stream.runForEach(event=>Effect.promise(async()=>{
        if(event.type!=='session.text.delta'||!sessions.has(event.data.sessionID)||replaying.has(event.data.sessionID))return;
        const text=delivered.chunk(event.data.sessionID,event.data.assistantMessageID,event.data.delta,'event');
        if(text)await writer.write({jsonrpc:'2.0',method:'session/update',params:{sessionId:event.data.sessionID,update:{sessionUpdate:'agent_message_chunk',messageId:event.data.assistantMessageID,content:{type:'text',text}}}});
      })),Effect.forkScoped,
    );
    acp = yield* ACP.connect(client, { readable: input, writable: output });
    yield* Effect.promise(() => acp.closed);
  })).pipe(Effect.provide(Logger.layer([])), Effect.provideService(FetchHttpClient.Fetch, localStreamFetch(endpoint.url))));
  peer.close();
}
declare const NED_VERSION: string;
main().catch(() => { process.stderr.write('Ned agent connection failed. Restart Ned or check the local service status.\n'); process.exitCode = 1; process.stdin.destroy(); });
