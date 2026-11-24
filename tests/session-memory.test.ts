import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
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

  // Sync 1 turn in s2, then close -> close preserves uncommittedTurns on disk without racing OpenViking shutdown.
  await manager.syncAndMaybeCommit('s2');
  await manager.close();
  assert.deepEqual(committed, ['ned-s1']);

  // Persisted sync/status files must contain NO raw conversation text and retain uncommitted s2.
  const syncRaw = await readFile(path.join(root, 'openviking', 'memory-sync.json'), 'utf8');
  assert.ok(!syncRaw.includes('빌드 스크립트'));
  assert.equal(JSON.parse(syncRaw).sessions.s2.uncommittedTurns, 1);

  // On next launch once OpenViking is ready, flushPendingCommits() safely commits deferred s2.
  const restarted = new SessionMemoryManager({
    root,
    policy: { enabled: true, autoRecall: true, commitEveryTurns: 2 },
    knowledge: () => fakeKnowledge,
    fetchSessionInfo: async id => sessionInfo[id],
    fetchSessionMessages: async id => sessionMsgs[id] ?? [],
  });
  await restarted.flushPendingCommits();
  assert.deepEqual(committed, ['ned-s1', 'ned-s2']);
  await restarted.close();

  const status = JSON.parse(await readFile(path.join(root, 'openviking', 'memory-status.json'), 'utf8'));
  assert.equal(status.commitsScheduled, 1);
  assert.equal(status.recallsInjected, 0);

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

test('turn and session opt-out skip both recall and capture/commit across reloads', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ned-optout-memory-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const appended: Array<{ sessionId: string; messages: Array<{ role: string; content: string }> }> = [];
  const committed: string[] = [];
  const recallQueries: string[] = [];

  const fakeKnowledge: KnowledgeService = {
    state: () => ({ status: 'ready', indexedFiles: 0 }),
    isReady: () => true,
    configure: async () => {},
    search: async () => '{}',
    read: async () => '{}',
    index: async () => '',
    close: async () => {},
    ensureMemorySession: async () => {},
    appendSessionMessages: async (sessionId, messages) => { appended.push({ sessionId, messages }); },
    commitMemorySession: async sessionId => { committed.push(sessionId); return {}; },
    recallMemories: async query => {
      recallQueries.push(query);
      return { items: [{ uri: 'viking://user/local-user/memories/a.md', abstract: 'saved note', score: 0.9 }] };
    },
  };

  const turnSessionMsgs: OpenCodeSessionMessage[] = [
    { id: 'u1', type: 'user', text: '이건 기억하지 마. 임시 테스트 계정 정보 확인해줘.' },
    { id: 'a1', type: 'assistant', time: { created: 1, completed: 2 }, content: [{ type: 'text', text: '임시 확인 결과입니다.' }] },
  ];
  const sessionOptOutMsgs: OpenCodeSessionMessage[] = [
    { id: 'su1', type: 'user', text: '이 세션은 기억하지 마. 비공개 보안 검토 시작하자.' },
    { id: 'sa1', type: 'assistant', time: { created: 10, completed: 11 }, content: [{ type: 'text', text: '보안 검토를 진행합니다.' }] },
  ];

  const makeManager = () => new SessionMemoryManager({
    root,
    policy: { enabled: true, autoRecall: true, commitEveryTurns: 1 },
    knowledge: () => fakeKnowledge,
    fetchSessionInfo: async () => ({}),
    fetchSessionMessages: async id => id === 'turn-s' ? turnSessionMsgs : sessionOptOutMsgs,
  });

  const manager = makeManager();
  await manager.load();

  // Turn opt-out skips BOTH recall AND capture/commit.
  assert.equal(await manager.recallContext([{ role: 'user', content: '이건 기억하지 마. 임시 테스트 계정 확인해줘.' }], 512), undefined);
  assert.equal(recallQueries.length, 0);
  await manager.syncAndMaybeCommit('turn-s', true);
  assert.equal(appended.length, 0);
  assert.equal(committed.length, 0);

  // Subsequent normal turn in the same session resumes both recall and capture/commit.
  turnSessionMsgs.push(
    { id: 'u2', type: 'user', text: '이제 일반 빌드 규칙 정리해줘' },
    { id: 'a2', type: 'assistant', time: { created: 3, completed: 4 }, content: [{ type: 'text', text: '일반 빌드 규칙입니다.' }] },
  );
  assert.ok(await manager.recallContext([{ role: 'user', content: '이제 일반 빌드 규칙 정리해줘' }], 512));
  assert.equal(recallQueries.length, 1);
  await manager.syncAndMaybeCommit('turn-s');
  assert.equal(appended.length, 1);
  assert.equal(appended[0].messages.length, 2);
  assert.ok(appended[0].messages.every(m => !m.content.includes('임시 테스트')));
  assert.equal(committed.length, 1);

  // Session-level opt-out skips recall AND capture for the initial turn and all later turns even after restart.
  assert.equal(
    await manager.recallContext([
      { role: 'user', content: '이 세션은 기억하지 마. 비공개 보안 검토 시작하자.' },
      { role: 'assistant', content: '보안 검토를 진행합니다.' },
      { role: 'user', content: '다음 단계 체크리스트 보여줘' },
    ], 512),
    undefined,
  );
  assert.equal(recallQueries.length, 1);
  await manager.syncAndMaybeCommit('sess-s', true);
  await manager.close();
  assert.equal(appended.length, 1);
  assert.equal(committed.length, 1);

  // Reload from memory-sync.json and add another normal-looking turn to opted-out session -> still excluded!
  sessionOptOutMsgs.push(
    { id: 'su2', type: 'user', text: '다음 보안 항목 확인해줘' },
    { id: 'sa2', type: 'assistant', time: { created: 12, completed: 13 }, content: [{ type: 'text', text: '보안 항목 결과입니다.' }] },
  );
  const reloaded = makeManager();
  await reloaded.load();
  reloaded.onSessionActivated('sess-s');
  // Even after compaction replaces the original opt-out message from chatMessages, recall remains disabled for sess-s.
  assert.equal(
    await reloaded.recallContext([{ role: 'user', content: '다음 보안 항목 확인해줘' }], 512),
    undefined,
  );
  assert.equal(recallQueries.length, 1);
  await reloaded.syncAndMaybeCommit('sess-s', true);
  await reloaded.close();
  assert.equal(appended.length, 1);
  assert.equal(committed.length, 1);

  // formatRecalledMemories must scrub secrets stored in legacy/manual profile or abstracts.
  const redactor = new Redactor();
  redactor.add('stored-intranet-secret-777');
  const scrubbedRecall = formatRecalledMemories(
    {
      profile: '키 stored-intranet-secret-777 사용',
      items: [{ uri: 'viking://user/local-user/memories/a.md', abstract: 'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U', score: 0.9 }],
    },
    3500,
    redactor,
  );
  assert.ok(scrubbedRecall);
  assert.ok(!scrubbedRecall.includes('stored-intranet-secret-777'));
  assert.ok(!scrubbedRecall.includes('eyJhbGciOi'));
  assert.ok(scrubbedRecall.includes('[REDACTED_JWT]'));
});

test('scrubMemoryText masks JWT, PEM private keys, AWS keys, DB credentials, and spaced quoted passwords in both recall and storage', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ned-scrub-memory-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const redactor = new Redactor();
  redactor.add('custom-vault-key-999');

  const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
  const pem = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA1234567890secretkeydata\n-----END RSA PRIVATE KEY-----';
  const aws = 'AKIAIOSFODNN7EXAMPLE';
  const dbUrl = 'postgres://dbadmin:Sup3rS3cret!@db.internal:5432/prod';
  const spacedPwd1 = 'password: "my secret pass with spaces"';
  const spacedPwd2 = "password='another spaced secret'";

  const payload = `배포 설정 확인: jwt=${jwt} aws=${aws} db=${dbUrl} ${spacedPwd1} ${spacedPwd2} custom-vault-key-999\n${pem}`;
  const scrubbed = scrubMemoryText(payload, redactor);
  for (const leak of [jwt, 'MIIEpAIBAAKCAQEA1234567890secretkeydata', aws, 'Sup3rS3cret!', 'my secret pass with spaces', 'another spaced secret', 'custom-vault-key-999']) {
    assert.ok(!scrubbed.includes(leak), `secret leaked: ${leak}`);
  }
  assert.ok(scrubbed.includes('[REDACTED_JWT]'));
  assert.ok(scrubbed.includes('[REDACTED_PRIVATE_KEY]'));
  assert.ok(scrubbed.includes('postgres://[REDACTED]:[REDACTED]@db.internal:5432/prod'));

  // Verify recallContext ALSO scrubs secrets before calling recallMemories!
  const seenRecallQueries: string[] = [];
  const savedMessages: Array<{ role: string; content: string }> = [];
  const fakeKnowledge: KnowledgeService = {
    state: () => ({ status: 'ready', indexedFiles: 0 }),
    isReady: () => true,
    configure: async () => {},
    search: async () => '{}',
    read: async () => '{}',
    index: async () => '',
    close: async () => {},
    ensureMemorySession: async () => {},
    appendSessionMessages: async (_s, msgs) => { savedMessages.push(...msgs); },
    commitMemorySession: async () => ({}),
    recallMemories: async query => {
      seenRecallQueries.push(query);
      return { items: [{ uri: 'viking://user/local-user/memories/db.md', abstract: 'DB 가이드', score: 0.8 }] };
    },
  };

  const manager = new SessionMemoryManager({
    root,
    policy: { enabled: true, autoRecall: true, commitEveryTurns: 2 },
    redactor,
    knowledge: () => fakeKnowledge,
    fetchSessionInfo: async () => ({}),
    fetchSessionMessages: async () => [
      { id: 'u1', type: 'user', text: payload },
      { id: 'a1', type: 'assistant', time: { created: 1, completed: 2 }, content: [{ type: 'text', text: '처리했습니다: ' + jwt }] },
    ],
  });
  await manager.load();
  await manager.recallContext([{ role: 'user', content: payload }], 1024);
  await manager.syncAndMaybeCommit('sec-1');
  await manager.close();

  assert.equal(seenRecallQueries.length, 1);
  assert.equal(savedMessages.length, 2);
  for (const text of [seenRecallQueries[0], savedMessages[0].content, savedMessages[1].content]) {
    assert.ok(!text.includes(jwt));
    assert.ok(!text.includes(aws));
    assert.ok(!text.includes('Sup3rS3cret!'));
    assert.ok(!text.includes('my secret pass with spaces'));
    assert.ok(!text.includes('MIIEpAIBAAKCAQEA1234567890secretkeydata'));
    assert.ok(!text.includes('custom-vault-key-999'));
  }
});

test('boundary guards clamp commitEveryTurns, prevent 400+ message re-sync via watermark, and avoid ovSessionId truncation collisions', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ned-boundary-memory-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const { clampCommitEveryTurns, buildOvSessionId, MAX_SYNCED_IDS_PER_SESSION } = await import('../src/main/session-memory');
  assert.equal(clampCommitEveryTurns(NaN), 6);
  assert.equal(clampCommitEveryTurns(0), 6);
  assert.equal(clampCommitEveryTurns(-5), 6);
  assert.equal(clampCommitEveryTurns(2.5), 6);
  assert.equal(clampCommitEveryTurns(1), 1);
  assert.equal(clampCommitEveryTurns(50), 50);
  assert.equal(clampCommitEveryTurns(999), 50);
  assert.equal(resolveMemoryPolicy({
    model: { baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'k', id: 'm' },
    openViking: { enabled: true, embedding: { baseUrl: 'http://127.0.0.1:8001/v1', apiKey: 'e', id: 'b', dimension: 4 }, memory: { enabled: true, autoRecall: true, commitEveryTurns: Number.NaN } },
  } as any).commitEveryTurns, 6);

  // Two 120-char session IDs sharing first 110 chars must NOT collide and must fit within 96 chars.
  const prefix = 's'.repeat(110);
  const ovA = buildOvSessionId(prefix + '-alpha-001');
  const ovB = buildOvSessionId(prefix + '-beta-0002');
  assert.notEqual(ovA, ovB);
  assert.ok(ovA.length <= 96 && ovB.length <= 96);

  // 420 messages (210 turns) exceed MAX_SYNCED_IDS_PER_SESSION (400): oldest messages must NOT re-sync on later turns!
  const engineMessages: OpenCodeSessionMessage[] = [];
  for (let i = 0; i < 210; i++) {
    engineMessages.push(
      { id: `u_${i}`, type: 'user', text: `질문 번호 ${i}`, time: { created: i * 2 + 1 } },
      { id: `a_${i}`, type: 'assistant', time: { created: i * 2 + 2, completed: i * 2 + 2 }, content: [{ type: 'text', text: `답변 번호 ${i}` }] },
    );
  }
  const appendedTexts: string[] = [];
  const fakeKnowledge: KnowledgeService = {
    state: () => ({ status: 'ready', indexedFiles: 0 }),
    isReady: () => true,
    configure: async () => {},
    search: async () => '{}',
    read: async () => '{}',
    index: async () => '',
    close: async () => {},
    ensureMemorySession: async () => {},
    appendSessionMessages: async (_s, msgs) => { appendedTexts.push(...msgs.map(m => m.content)); },
    commitMemorySession: async () => ({}),
  };

  const manager = new SessionMemoryManager({
    root,
    policy: { enabled: true, autoRecall: false, commitEveryTurns: 50 },
    knowledge: () => fakeKnowledge,
    fetchSessionInfo: async () => ({}),
    fetchSessionMessages: async () => engineMessages,
  });
  await manager.load();
  await manager.syncAndMaybeCommit('long-session');
  assert.equal(appendedTexts.length, 420);

  // Add 1 more turn (messages 420 & 421) and sync again -> ONLY the 2 new messages should append (never u_0!).
  engineMessages.push(
    { id: 'u_210', type: 'user', text: '질문 번호 210', time: { created: 999 } },
    { id: 'a_210', type: 'assistant', time: { created: 1000, completed: 1000 }, content: [{ type: 'text', text: '답변 번호 210' }] },
  );
  await manager.syncAndMaybeCommit('long-session');
  assert.equal(appendedTexts.length, 422);
  assert.equal(appendedTexts.filter(x => x === '질문 번호 0').length, 1);
  assert.equal(appendedTexts.at(-2), '질문 번호 210');

  await manager.close();
  const syncFile = JSON.parse(await readFile(path.join(root, 'openviking', 'memory-sync.json'), 'utf8'));
  assert.equal(syncFile.sessions['long-session'].syncedIds.length, MAX_SYNCED_IDS_PER_SESSION);
  assert.ok(syncFile.sessions['long-session'].watermarkCount >= 22);

  // Same-millisecond timestamp at watermark boundary must NOT skip a new message.
  const boundaryBatch = extractMemoryMessages(
    [
      { id: 'u_same', type: 'user', text: '같은 밀리초 경계 질문', time: { created: 1000 } },
      { id: 'a_same', type: 'assistant', time: { created: 1000, completed: 1000 }, content: [{ type: 'text', text: '같은 밀리초 경계 답변' }] },
    ],
    { syncedIds: new Set<string>(), watermarkCreatedAt: 1000 },
  );
  assert.equal(boundaryBatch.messages.length, 2);
  assert.equal(boundaryBatch.completedTurns, 1);

  // Over 500 committed sessions in memory-sync.json are pruned to 500 on persist.
  const pruneRoot = await mkdtemp(path.join(os.tmpdir(), 'ned-prune-memory-'));
  t.after(() => rm(pruneRoot, { recursive: true, force: true }));
  const seededSessions: Record<string, any> = {};
  for (let i = 0; i < 510; i++) {
    seededSessions[`old_${i}`] = {
      ovSessionId: `ned-old_${i}`,
      syncedIds: [`m_${i}`],
      uncommittedTurns: 0,
      lastCommittedAt: new Date(1700000000000 + i * 1000).toISOString(),
    };
  }
  await mkdir(path.join(pruneRoot, 'openviking'), { recursive: true });
  await writeFile(path.join(pruneRoot, 'openviking', 'memory-sync.json'), JSON.stringify({ schemaVersion: 1, sessions: seededSessions }));
  const pruneManager = new SessionMemoryManager({
    root: pruneRoot,
    policy: { enabled: true, autoRecall: false, commitEveryTurns: 1 },
    knowledge: () => fakeKnowledge,
    fetchSessionInfo: async () => ({}),
    fetchSessionMessages: async () => [
      { id: 'nu1', type: 'user', text: '새 세션 질문', time: { created: 5000 } },
      { id: 'na1', type: 'assistant', time: { created: 5001, completed: 5002 }, content: [{ type: 'text', text: '새 세션 답변' }] },
    ],
  });
  await pruneManager.load();
  await pruneManager.syncAndMaybeCommit('fresh-session', true);
  await pruneManager.close();
  const prunedFile = JSON.parse(await readFile(path.join(pruneRoot, 'openviking', 'memory-sync.json'), 'utf8'));
  assert.equal(Object.keys(prunedFile.sessions).length, 500);
  assert.ok(prunedFile.sessions['fresh-session']);
  assert.equal(prunedFile.sessions['old_0'], undefined);
});
