// Official pinned OpenCode ACP adapter, attached to the existing Ned-owned engine.
import { ACP } from '@ned/acp';
import { OpenCode } from '@opencode/client/effect';
import { Effect, Logger } from 'effect';
import { FetchHttpClient, HttpClient, HttpClientRequest } from 'effect/http';
import { ndJsonStream, methods } from '@agentclientprotocol/sdk';
import { Readable, Writable } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { connect } from 'node:net';
import { Peer } from './rpc';
import { localStreamFetch } from '../../src/main/local-stream-fetch';

async function main() {
  const descriptor = JSON.parse(await readFile(process.argv[2], 'utf8'));
  if (descriptor.schemaVersion !== 1 || typeof descriptor.socket !== 'string' || typeof descriptor.token !== 'string') throw new Error('Invalid Ned descriptor');
  const socket = connect(descriptor.socket);
  let acp: any;
  let canRead = false;
  const sessions = new Set<string>();
  const peer = new Peer(socket, async (method, params) => {
    if (method !== 'checkBuffer' || !sessions.has(params?.session) || !acp || !canRead) throw new Error('Editor buffer check unavailable');
    try {
      const result = await acp.client.request(methods.client.fs.readTextFile, { sessionId: params.session, path: params.path },
        { cancellationSignal: AbortSignal.timeout(12000) });
      return { matches: typeof result?.content === 'string' && result.content.replaceAll('\r\n', '\n') === params.before.replaceAll('\r\n', '\n') };
    } catch (error: any) {
      // ACP resource_not_found is acceptable only for a proposed new file.
      if (params.missing && error?.code === -32002) return { matches: true };
      throw new Error('편집기 버퍼 확인 실패. 파일을 저장한 뒤 다시 요청하세요.');
    }
  });
  peer.onClose(() => { process.exitCode = 1; process.stdin.destroy(); });
  const endpoint = await peer.call('hello', { token: descriptor.token });
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(endpoint.url) || typeof endpoint.password !== 'string') throw new Error('Invalid managed engine endpoint');
  const stream = ndJsonStream(Writable.toWeb(process.stdout), Readable.toWeb(process.stdin));
  const writer = stream.writable.getWriter();
  const pending = new Map<string | number, { method: string; cwd?: string; session?: string }>();
  const output = new WritableStream<any>({
    async write(message) {
      if (!message.method && pending.has(message.id)) {
        const request = pending.get(message.id)!; pending.delete(message.id);
        if (message.result && ['session/new', 'session/load', 'session/resume', 'session/fork'].includes(request.method)) {
          const session = message.result.sessionId ?? request.session;
          try { await peer.call('bind', { session }); sessions.add(session); }
          catch { message = { jsonrpc: '2.0', id: message.id, error: { code: -32000, message: 'Ned session scope could not be verified' } }; }
        }
        if (request.method === 'initialize' && message.result) message.result.agentInfo = { name: 'Ned', version: NED_VERSION, title: 'Ned' };
      }
      await writer.write(message);
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
          if (message.method === 'session/cancel') await peer.call('cancel', { session: message.params.sessionId });
        }
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
    acp = yield* ACP.connect(client, { readable: input, writable: output });
    yield* Effect.promise(() => acp.closed);
  })).pipe(Effect.provide(Logger.layer([])), Effect.provideService(FetchHttpClient.Fetch, localStreamFetch(endpoint.url))));
  peer.close();
}
declare const NED_VERSION: string;
main().catch(() => { process.stderr.write('Ned agent connection failed. Restart Ned or check the local service status.\n'); process.exitCode = 1; process.stdin.destroy(); });
