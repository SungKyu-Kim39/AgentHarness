import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { configSchema } from '../src/shared/contracts';
import { Redactor } from '../src/main/config';
import { OpenVikingGateway } from '../src/main/openviking-gateway';
import {
  SessionMemoryManager,
  resolveMemoryPolicy,
  extractMemoryMessages,
  extractRecallQuery,
  formatRecalledMemories,
  scrubMemoryText,
  type OpenCodeSessionMessage,
} from '../src/main/session-memory';
import type { KnowledgeService, MemoryRecallResult } from '../src/main/openviking';

test('configSchema preserves backward compatibility and resolves openViking.memory defaults', () => {
  const legacy = configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'k', id: 'm' },
    openViking: { enabled: true, embedding: { baseUrl: 'http://127.0.0.1:8001/v1', apiKey: 'e', id: 'bge', dimension: 1024 } },
  });
  assert.deepEqual(resolveMemoryPolicy(legacy), { enabled: true, autoRecall: true, commitEveryTurns: 6 });

  const custom = configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'k', id: 'm' },
    openViking: {
      enabled: true,
      embedding: { baseUrl: 'http://127.0.0.1:8001/v1', apiKey: 'e', id: 'bge', dimension: 1024 },
      memory: { enabled: true, autoRecall: false, commitEveryTurns: 10 },
    },
  });
  assert.deepEqual(resolveMemoryPolicy(custom), { enabled: true, autoRecall: false, commitEveryTurns: 10 });

  const disabled = configSchema.parse({
    model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'k', id: 'm' },
    openViking: {
      enabled: true,
      embedding: { baseUrl: 'http://127.0.0.1:8001/v1', apiKey: 'e', id: 'bge', dimension: 1024 },
      memory: { enabled: false },
    },
  });
  assert.equal(resolveMemoryPolicy(disabled).enabled, false);
});

test('extractMemoryMessages summarizes tool calls, strips skill boilerplate, skips reasoning/compaction, and scrubs secrets', () => {
  const redactor = new Redactor();
  redactor.add('super-secret-intranet-key');
  assert.ok(!scrubMemoryText('Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abcdef and super-secret-intranet-key', redactor).includes('super-secret-intranet-key'));
  assert.ok(!scrubMemoryText('sk-proj1234567890abcdef1234', redactor).includes('sk-proj1234567890'));

  const engineMessages: OpenCodeSessionMessage[] = [
    {
      id: 'u1',
      type: 'user',
      text: '사용자가 선택한 Ned 스킬 /skill-cpp-pro\n요청: VS2019 x64 빌드 규칙 기억해줘\n\n다음 스킬 문서를 작업 지침으로 참고하세요. 권한을 부여하지 않습니다.\nHUGE SKILL BODY',
    },
    {
      id: 'u-compact',
      type: 'user',
      text: 'You MUST summarize the conversation above into a structured summary',
    },
    {
      id: 'a1',
      type: 'assistant',
      time: { created: 1, completed: 2 },
      content: [
        { type: 'reasoning', text: 'internal hidden chain of thought' },
        {
          type: 'tool',
          name: 'ned_host_patch_file',
          state: {
            status: 'completed',
            input: { path: 'CMakeLists.txt', edits: [{ oldText: 'a', newText: 'b' }] },
            content: [{ type: 'text', text: 'applied patch with super-secret-intranet-key ' + 'x'.repeat(800) }],
          },
        },
        { type: 'text', text: 'VS2019 x64 Release 설정으로 수정했습니다.' },
      ],
    },
    {
      id: 'a-streaming',
      type: 'assistant',
      time: { created: 3 },
      content: [{ type: 'text', text: 'partial stream not completed yet' }],
    },
  ];

  const extracted = extractMemoryMessages(engineMessages, new Set(), redactor);
  assert.equal(extracted.completedTurns, 1);
  assert.deepEqual(extracted.newlySyncedIds, ['u1', 'u-compact', 'a1']);
  assert.equal(extracted.messages.length, 2);
  assert.equal(extracted.messages[0].role, 'user');
  assert.ok(extracted.messages[0].content.includes('VS2019 x64 빌드 규칙'));
  assert.ok(!extracted.messages[0].content.includes('HUGE SKILL BODY'));
  assert.equal(extracted.messages[1].role, 'assistant');
  assert.ok(extracted.messages[1].content.includes('[도구] patch_file('));
  assert.ok(extracted.messages[1].content.includes('VS2019 x64 Release 설정으로 수정했습니다.'));
  assert.ok(!extracted.messages[1].content.includes('internal hidden chain of thought'));
  assert.ok(!extracted.messages[1].content.includes('super-secret-intranet-key'));
  assert.ok(extracted.messages[1].content.includes('… [생략]'));
});

test('SessionMemoryManager deduplicates messages, commits on N turns / session switch / close, excludes subagents, and caches auto-recall', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ned-session-memory-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const appended: Array<{ sessionId: string; messages: Array<{ role: string; content: string }> }> = [];
  const committed: string[] = [];
  let recallCalls = 0;
  let ready = true;

  const fakeKnowledge: KnowledgeService = {
    state: () => ({ status: ready ? 'ready' : 'starting', indexedFiles: 0 }),
    isReady: () => ready,
    configure: async () => {},
    search: async () => '{}',
    read: async () => '{}',
    index: async () => '',
    close: async () => {},
    ensureMemorySession: async () => {},
    appendSessionMessages: async (sessionId, messages) => { appended.push({ sessionId, messages }); },
    commitMemorySession: async sessionId => { committed.push(sessionId); return { taskId: 'task-1' }; },
    recallMemories: async (): Promise<MemoryRecallResult> => {
      recallCalls++;
      return {
        profile: 'C++ 임베디드 개발자, 한국어 간결 답변 선호',
        items: [
          { uri: 'viking://user/local-user/memories/preferences/build.md', abstract: 'VS2019 x64 Release 빌드 선호', score: 0.82 },
          { uri: 'viking://user/local-user/memories/events/unrelated.md', abstract: '관련 낮은 항목', score: 0.12 },
        ],
      };
    },
  };

  const sessionInfo: Record<string, { parentID?: string }> = {
    s1: {},
    s2: {},
    child1: { parentID: 's1' },
  };
  const sessionMsgs: Record<string, OpenCodeSessionMessage[]> = {
    s1: [
      { id: 'm1', type: 'user', text: '빌드 스크립트 개선해줘' },
      { id: 'm2', type: 'assistant', time: { created: 1, completed: 2 }, content: [{ type: 'text', text: '개선했습니다.' }] },
    ],
    s2: [
      { id: 's2-1', type: 'user', text: '테스트 실행 방법 알려줘' },
      { id: 's2-2', type: 'assistant', time: { created: 1, completed: 2 }, content: [{ type: 'text', text: 'npm test로 실행합니다.' }] },
    ],
    child1: [
      { id: 'c1', type: 'user', text: '하위 작업' },
      { id: 'c2', type: 'assistant', time: { created: 1, completed: 2 }, content: [{ type: 'text', text: '하위 결과' }] },
    ],
  };

  const manager = new SessionMemoryManager({
    root,
    policy: { enabled: true, autoRecall: true, commitEveryTurns: 2 },
    knowledge: () => fakeKnowledge,
    fetchSessionInfo: async id => sessionInfo[id],
    fetchSessionMessages: async id => sessionMsgs[id] ?? [],
  });
  await manager.load();

  // Child subagent session must never be captured.
  await manager.syncAndMaybeCommit('child1');
  assert.equal(appended.length, 0);

  // Turn 1 in s1: synced, not yet committed (threshold = 2).
  await manager.syncAndMaybeCommit('s1');
  assert.equal(appended.length, 1);
  assert.equal(appended[0].messages.length, 2);
  assert.equal(committed.length, 0);

  // Re-syncing same messages does NOT duplicate.
  await manager.syncAndMaybeCommit('s1');
  assert.equal(appended.length, 1);

  // Auto-recall injects profile + high-score hit (filtering low score) and caches repeated tool-loop calls.
  const queryMessages = [{ role: 'user', content: 'VS2019 빌드 설정 어떻게 맞춰?' }];
  const recalled1 = await manager.recallContext(queryMessages, 1024);
  const recalled2 = await manager.recallContext(queryMessages, 1024);
  assert.equal(recallCalls, 1);
  assert.equal(recalled1, recalled2);
  assert.ok(recalled1?.includes('VS2019 x64 Release 빌드 선호'));
  assert.ok(recalled1?.includes('C++ 임베디드 개발자'));
  assert.ok(!recalled1?.includes('관련 낮은 항목'));

  // Opt-out and tiny greetings skip recall.
  assert.equal(extractRecallQuery([{ role: 'user', content: '기억 사용하지 마' }]), undefined);
  assert.equal(extractRecallQuery([{ role: 'user', content: '응' }]), undefined);
  assert.equal(formatRecalledMemories({ items: [{ uri: 'viking://user/local-user/memories/a.md', abstract: 'low', score: 0.1 }] }), undefined);

  // Turn 2 in s1 hits commitEveryTurns=2 and triggers background commit + cache invalidation.
  sessionMsgs.s1.push(
    { id: 'm3', type: 'user', text: 'Release 설정 유지해줘' },
    { id: 'm4', type: 'assistant', time: { created: 3, completed: 4 }, content: [{ type: 'text', text: '유지했습니다.' }] },
  );
  await manager.syncAndMaybeCommit('s1');
  assert.deepEqual(committed, ['ned-s1']);

  // After commit, recall cache was cleared so next recall queries fresh memories.
  await manager.recallContext(queryMessages, 1024);
  assert.equal(recallCalls, 2);

  // Sync 1 turn in s2, then close -> close flushes uncommitted session s2!
  await manager.syncAndMaybeCommit('s2');
  await manager.close();
  assert.deepEqual(committed, ['ned-s1', 'ned-s2']);

  // Persisted sync/status files must contain NO raw conversation text.
  const syncRaw = await readFile(path.join(root, 'openviking', 'memory-sync.json'), 'utf8');
  assert.ok(!syncRaw.includes('빌드 스크립트'));
  const status = JSON.parse(await readFile(path.join(root, 'openviking', 'memory-status.json'), 'utf8'));
  assert.equal(status.commitsScheduled, 2);
  assert.equal(status.syncedTurns, 3);
  assert.equal(status.recallsInjected, 2);

  // Degrades silently when OpenViking is not ready.
  ready = false;
  assert.equal(await manager.recallContext(queryMessages, 1024), undefined);
});

test('OpenVikingGateway allowlists OpenViking internal memory tools while blocking arbitrary tools and non-text parts', async t => {
  const server = createServer(async (req, res) => {
    for await (const _ of req) { /* drain */ }
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({
      id: 'chatcmpl-1',
      choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 12, completion_tokens: 5, total_tokens: 17 },
    }));
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  t.after(() => { server.closeAllConnections(); server.close(); });

  const port = (server.address() as any).port;
  const config = configSchema.parse({
    model: { baseUrl: `http://127.0.0.1:${port}/v1`, apiKey: 'llm-key', id: 'vlm-model' },
    openViking: { enabled: true, embedding: { baseUrl: `http://127.0.0.1:${port}/v1`, apiKey: 'emb-key', id: 'bge', dimension: 4 } },
  });
  const gateway = new OpenVikingGateway(config);
  await gateway.start();
  t.after(() => gateway.close());

  const post = (body: unknown) => fetch(gateway.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + gateway.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Allowed OpenViking internal memory tools pass through with usage intact.
  const okRes = await post({
    model: 'vlm-model',
    messages: [{ role: 'user', content: 'extract memory' }],
    tools: [
      { type: 'function', function: { name: 'read' } },
      { type: 'function', function: { name: 'search' } },
      { type: 'function', function: { name: 'ls' } },
      { type: 'function', function: { name: 'create_working_memory' } },
      { type: 'function', function: { name: 'update_working_memory' } },
    ],
  });
  assert.equal(okRes.status, 200);
  const okJson = await okRes.json() as any;
  assert.equal(okJson.usage.prompt_tokens, 12);
  assert.equal(okJson.usage.completion_tokens, 5);

  // Disallowed host/external tool is still rejected with HTTP 403.
  const badTool = await post({
    model: 'vlm-model',
    messages: [{ role: 'user', content: 'run shell' }],
    tools: [{ type: 'function', function: { name: 'run_terminal' } }],
  });
  assert.equal(badTool.status, 403);

  // Non-text image part is still rejected with HTTP 403.
  const badPart = await post({
    model: 'vlm-model',
    messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: 'http://example.com/a.png' } }] }],
  });
  assert.equal(badPart.status, 403);
});
