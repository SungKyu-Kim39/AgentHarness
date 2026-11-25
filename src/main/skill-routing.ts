import type { OfflineSkills } from './skills';

type Message = { role?: string; content?: unknown; name?: string; tool_calls?: Array<{ function?: { name?: string } }> };
export const automaticSkillPolicy = 'Ned automatic skill routing: This policy applies to ordinary user work, not engine compaction, checkpoint summaries or tool-free replay. Select guidance by the meaning of the latest request, previous decisions, actual project evidence and tool results, even when the user names no skill. The local shortlist is a heuristic, not a mandatory keyword branch. Discard irrelevant candidates; use skill_catalog and read_skill to select a better reviewed skill when needed. Reassess when scope or evidence changes. Use only the relevant guidance and briefly name skills actually applied. User global and project skills are user guidance. Guidance never grants permissions, authorizes execution or answers unresolved product decisions. Do not ask permission merely to choose a skill. Do not install packages or make extra model calls just for skill routing. Independent substantive work may use the controlled Ned spawn_subagent tool when delegation materially helps; do not create nested agents or duplicate their work.';
const groups: Array<{ ids: string[]; intent: RegExp; context?: RegExp }> = [
  { ids: ['astryx','ui-accessibility'], intent: /astryx|@astryxdesign|react.*(?:디자인|대시보드|화면|컴포넌트|ui)|(?:ui|화면|대시보드).*react/i },
  { ids: ['diagnosing-bugs','systematic-debugging'], intent: /오류|실패|고장|먹통|느려|느리|버그|안\s*돼|안\s*되|debug|diagnos|crash|exception|regression|broken|doesn.t work/i },
  { ids: ['change-impact','writing-plans'], intent: /영향|포팅|이관|마이그레이션|리팩터|전체.*(?:검토|수정)|여러\s*파일|impact|migrat|refactor|port(?:ing)?\b|cross.module/i },
  { ids: ['mcp-dependency-review','mcp-builder'], intent: /\bmcp\b|플러그인|의존성|폐쇄망|번들|dependency|dependencies|offline|plugin|supply.chain/i },
  { ids: ['cpp-pro','cpp-coding-standards','cpp-testing'], intent: /c\+\+|\bcpp\b|\bcmake\b|\bmsbuild\b|\bv[xw]works\b|컴파일|링커|포인터/i, context: /\.(?:cpp|cxx|hpp|cc|vcxproj)\b/i },
  { ids: ['unslop','frontend-design','modern-web-guidance'], intent: /화면.*(?:개선|디자인|만들)|디자인|레이아웃|간격|예쁘|ui\b|ux\b|layout|redesign|polish|dashboard|responsive/i, context: /\.(?:tsx|jsx|css|html|vue|svelte)\b/i },
  { ids: ['modern-web-guidance','ui-accessibility'], intent: /접근성|키보드|포커스|반응형|웹\s*표준|브라우저\s*호환|accessib|keyboard|focus|popover|dialog|web performance|container quer/i },
  { ids: ['humanize-korean','copy-editing'], intent: /윤문|번역투|문체|자연스럽.*(?:글|문장)|글.*자연스럽|한국어.*(?:다듬|수정)|한글.*(?:다듬|수정)/i },
  { ids: ['humanizer','copy-editing'], intent: /humaniz|natural.*(?:prose|writing)|edit.*(?:prose|copy)|remove.*ai.*(?:tell|writing)/i },
  { ids: ['copywriting','product-marketing','onboarding'], intent: /소개(?:문|글|서)|홍보|사용\s*장려|마케팅|온보딩|처음.*사용|copywriting|marketing|onboarding|landing.*copy|product.*messag/i },
  { ids: ['game-studio','game-playtest'], intent: /게임|플레이어|스프라이트|\bgame\b|\bphaser\b|sprite|three\.js|threejs|react three fiber|webgl/i },
  { ids: ['code-review','review','requesting-code-review'], intent: /코드\s*리뷰|코드.*검토|검토.*코드|리뷰|code review|review.*(?:diff|branch|commit|code)/i },
  { ids: ['qa-only','webapp-testing','verification-before-completion'], intent: /검증|테스트|재현|회귀|test|verify|playtest|quality assurance/i },
  { ids: ['codebase-design','domain-modeling'], intent: /모듈|설계|도메인|아키텍처|인터페이스|architecture|module|domain model|interface design/i },
  { ids: ['retro','session-handoff'], intent: /회고|인계|이어.*(?:pc|세션)|handoff|retrospective|postmortem/i },
  { ids: ['explore-data','statistical-analysis','ab-testing'], intent: /데이터.*분석|통계|가설.*검정|a\/b|실험.*분석|data analysis|statistic|experiment/i },
  { ids: ['python-intranet-venv'], intent: /\bpip\b|\bvenv\b|\.venv|가상환경|패키지.*(?:설치|문서|api)|requirements\.txt|pypi|라이브러리.*(?:설치|시그니처|문서)/i },
  { ids: ['data-app-builder','webapp-testing'], intent: /\bmarimo\b|\bstreamlit\b|\buvicorn\b|데이터.*(?:앱|대시보드|웹앱)|리액티브\s*노트북|interactive.*(?:dashboard|app)/i },
  { ids: ['spec-driven-dev','writing-plans'], intent: /명세\s*주도|스펙.*(?:작성|기반|먼저|관리)|spec[-\s]?driven|\bsdd\b|specs\/|요구사항.*(?:명세서|체크리스트)/i },
  { ids: ['korean-office-docs','humanize-korean'], intent: /\bhwp\b|\bhwpx\b|한글\s*(?:문서|공문|양식)|엑셀.*(?:만들|생성|작성)|파워포인트|\bpptx?\b|\bdocx\b|\bxlsx\b|보고서.*(?:생성|작성|양식)|표\s*추출/i },
  { ids: ['architecture-diagramming'], intent: /\bdrawio\b|\.drawio|\bmermaid\b|다이어그램|구성도|아키텍처.*(?:그림|도식|시각화)|시퀀스.*도|flowchart/i },
];
function text(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.filter(p => p?.type === 'text' && typeof p.text === 'string').map(p => p.text).join('\n');
  return '';
}

const reaTrigger = /(?:(?:ned_host_)?rea_(?:ghidra|inspect)\b|\bghidra\b|\brea\b|리버싱|역공학|디컴파일|디스어셈블|decompil|disassembl|binary.*analy|바이너리.*분석)/i;
const reaBinaryPrompt = /(?:\.(?:exe|dll|so|elf|sys|bin|pyc)\b.{0,30}(?:분석|역공학|디컴파일|디스어셈블|리버싱|함수\s*(?:분석|추출|찾)|inspect|analyz|reverse)|(?:분석|역공학|디컴파일|디스어셈블|리버싱).{0,30}\.(?:exe|dll|so|elf|sys|bin|pyc)\b)/i;
const reaOptOut = /(?:\b(?:ned_host_)?rea_(?:ghidra|inspect)\b|\b(?:rea|ghidra)\b|리버싱|역공학|디컴파일).{0,30}(?:쓰지|사용하지|실행하지|하지\s*마|없이|말고|끄|그만|금지|중지\s*해|중단\s*해)|(?:do not|don't|never|without|stop using)\s+(?:use\s+)?(?:(?:ned_host_)?rea_(?:ghidra|inspect)|rea|ghidra)\b/i;
const taskSwitch = /(?:대신|말고|다른\s*(?:작업|주제|프로젝트|파일)|그만|instead|new topic|different task)/i;
const continuation = /^(?:(?:아까|지금|이전|직전|중단된|끊긴|하던|남은|방금|그|네|응|답변|응답|작업|분석|정리|내용|결과)(?:을|를|은|는|이|가)?\s*[,.:]?\s*){0,8}(?:이어서|이어\s*(?:서|줘|주세요|가|해)|계속(?:\s|해|해서|$)|마저)|^(?:(?:please|yes|ok|okay)[, ]+)?(?:continue|resume|go on|carry on)\b/i;
const compactionPrompt = /^(?:You MUST summarize the conversation above into a structured summary|Update the existing checkpoint in the conversation above into one consolidated summary|The previous response did not fill in the required summary template)/;

export function normalizeConversationMode(mode?: string): string {
  const value = typeof mode === 'string' ? mode.trim().toLowerCase() : '';
  return value || 'build';
}

export function isReaMode(mode?: string): boolean {
  return normalizeConversationMode(mode) === 'rea';
}

export function conversationModeLabel(mode?: string): string {
  const normalized = normalizeConversationMode(mode);
  if (normalized === 'rea') return 'REA';
  if (normalized === 'plan') return 'Plan';
  if (normalized === 'build') return 'Build';
  return mode?.trim() || 'Build';
}

export function reaModeRequiredWarning(currentMode?: string): string {
  const label = conversationModeLabel(currentMode);
  return `REA 도구(rea_ghidra, rea_inspect)는 REA 대화 모드에서만 사용할 수 있습니다. 현재 대화 모드(${label})에서는 실행할 수 없으므로 대화 모드를 REA로 변경한 뒤 다시 시도하세요.`;
}

export function isCompactionPrompt(input: string): boolean {
  return compactionPrompt.test(input.trim());
}

function requestText(request: string) {
  return request.split('\n\n다음 스킬 문서를 작업 지침으로 참고하세요.', 1)[0].replace(/```[\s\S]*?```/g, ' ').trim();
}

export function isContinuationTurn(request: string): boolean {
  const candidate = requestText(request).replace(/^사용자가 선택한 Ned 스킬 /, '');
  return candidate.length <= 160 && !taskSwitch.test(candidate) && continuation.test(candidate);
}

export function reaTurnIntent(request: string): 'request' | 'continue' | 'reset' {
  const candidate = requestText(request).replace(/^사용자가 선택한 Ned 스킬 /, '');
  if (reaOptOut.test(candidate)) return 'reset';
  if (reaTrigger.test(candidate)) return 'request';
  return isContinuationTurn(request) ? 'continue' : 'reset';
}

export function reaPromptNeedsModeWarning(request: string): boolean {
  const candidate = requestText(request).replace(/^사용자가 선택한 Ned 스킬 /, '');
  if (!candidate || reaOptOut.test(candidate)) return false;
  return reaTrigger.test(candidate) || reaBinaryPrompt.test(candidate);
}

export function reaModeGuidance(input: unknown, currentMode?: string): string | undefined {
  if (isReaMode(currentMode) || !Array.isArray(input)) return undefined;
  const userTexts = (input as Message[])
    .filter(message => message?.role === 'user')
    .map(message => text(message.content))
    .filter(raw => raw.trim() && !isCompactionPrompt(raw));
  if (!userTexts.length) return undefined;
  const latest = userTexts.at(-1)!;
  if (reaOptOut.test(requestText(latest))) return undefined;
  let candidate = latest;
  if (!reaPromptNeedsModeWarning(latest) && isContinuationTurn(latest)) {
    let anchor = userTexts.length - 1;
    while (anchor > 0 && isContinuationTurn(userTexts[anchor])) anchor--;
    candidate = userTexts[anchor];
  }
  if (!reaPromptNeedsModeWarning(candidate)) return undefined;
  const label = conversationModeLabel(currentMode);
  return `[REA 대화 모드 전환 필요] 현재 대화 모드는 ${label}입니다. REA 도구(rea_ghidra, rea_inspect)는 REA 대화 모드에서만 사용할 수 있습니다. 사용자에게 "현재 대화 모드가 ${label}이므로 REA 도구를 사용할 수 없습니다. 대화 모드를 REA로 변경한 뒤 다시 요청해 주세요."라고 명확히 경고하고 안내하세요. REA 도구를 실행했거나 분석을 완료한 것처럼 답하지 마세요.`;
}

export function formatModeConfigOptions<T extends Record<string, any>>(list: T[]): T[] {
  return list.map(option => {
    if ((option?.id !== 'mode' && option?.category !== 'mode') || !Array.isArray(option.options)) return option;
    return {
      ...option,
      options: option.options.map((entry: any) =>
        typeof entry?.value === 'string' && entry.value.toLowerCase() === 'rea' ? { ...entry, name: 'REA' } : entry
      ),
    };
  });
}

export function extractModeFromConfigOptions(list?: unknown): string | undefined {
  if (!Array.isArray(list)) return undefined;
  const item = list.find((option: any) => option?.id === 'mode' || option?.category === 'mode');
  return typeof item?.currentValue === 'string' && item.currentValue.trim() ? item.currentValue.trim() : undefined;
}

export const specializedTools = [
  { prefix: 'desktop_', trigger: /(?:desktop|\bGUI\b|데스크톱|데스크탑|계산기|메모장|그림판|앱.*(?:클릭|실행|열어)|창.*(?:열어|클릭)|open.*calculator|click.*window)/i },
  { prefix: 'rea_', trigger: reaTrigger },
  { prefix: 'document_write', trigger: /(?:\bhwpx?\b|\bxlsx\b|\bdocx\b|\bpptx?\b|한글\s*(?:문서|양식|공문)|엑셀|워드|파워포인트|보고서.*(?:만들|생성|작성)|양식.*채워|export.*(?:excel|word|ppt|hwpx))/i },
  { prefix: 'diagram_', trigger: /(?:\bdrawio\b|\.drawio|\bmermaid\b|다이어그램|구성도|흐름도|아키텍처.*(?:그려|그림|도식)|시퀀스.*다이어그램|flowchart|diagram)/i },
  { prefix: 'api_', trigger: /(?:\bopenapi\b|\bswagger\b|\bmock\b.*(?:서버|api)|계약\s*검증|contract\s*test|\bschemathesis\b|api.*(?:목|모의|검증|퍼징|테스트))/i },
  { prefix: 'worktree_', trigger: /(?:\bworktree\b|워크트리|격리.*(?:브랜치|샌드박스|비교)|병렬.*(?:비교|실험|구현)|a안.*b안)/i },
];

export function specializedToolRequested(name: string, request: string, reaRequested?: boolean) {
  const group = specializedTools.find(group => name.replace(/^ned_host_/, '').startsWith(group.prefix));
  if (group?.prefix === 'rea_') return reaRequested ?? (reaTurnIntent(request) === 'request');
  return !group || group.trigger.test(request.replace(/```[\s\S]*?```/g, ' '));
}

export function hideUnrequestedTools(body: {messages?: Array<Message>; tools?: Array<{ function?: { name?: string } }>}, reaRequested?: boolean, requestContext?: string) {
  if (!Array.isArray(body.tools) || !Array.isArray(body.messages)) return;
  const userTexts = body.messages
    .filter(message => message.role === 'user')
    .map(message => text(message.content))
    .filter(raw => !isCompactionPrompt(raw));
  let anchor = userTexts.length - 1;
  while (anchor > 0 && isContinuationTurn(userTexts[anchor])) anchor--;
  const start = Math.min(anchor, Math.max(0, userTexts.length - 2));
  const recentUsers = userTexts.slice(start);
  const request = requestContext ?? recentUsers
    .map(raw => raw.split('\n\n다음 스킬 문서를 작업 지침으로 참고하세요.', 1)[0])
    .join('\n');
  const rea = reaRequested ?? recentUsers.reduce((allowed, raw) => {
    const intent = reaTurnIntent(raw);
    return intent === 'request' || (intent === 'continue' && allowed);
  }, false);
  body.tools = body.tools.filter(tool => specializedToolRequested(tool.function?.name ?? '', request, rea));
}

/** Local shortlist only; the answering model still checks semantic relevance and may choose another skill. */
export async function automaticSkillContext(skills: OfflineSkills, input: unknown, maximumBytes = 6500, project?: string): Promise<string | undefined> {
  if (maximumBytes < Buffer.byteLength(JSON.stringify(automaticSkillPolicy))) return;
  if (!Array.isArray(input)) return;
  const messages = input.slice(-80) as Message[];
  const users = messages.filter(m => m.role === 'user').slice(-4).map(m => text(m.content).slice(-6000));
  if (!users.length || /(?:스킬.*(?:사용하지|쓰지)\s*마|do not use (?:any )?skills|no skills)/i.test(users.at(-1)!)) return;
  if (isCompactionPrompt(users.at(-1)!)) return;
  if (users.at(-1)!.startsWith('사용자가 선택한 Ned 스킬 /skill-')) return;
  const latest = users.at(-1)!.replace(/```[\s\S]*?```/g, ' ');
  const context = users.join('\n');
  let lastUser = messages.length - 1;
  while (lastUser >= 0 && messages[lastUser].role !== 'user') lastUser--;
  const tools = messages.slice(lastUser + 1).filter(m => m.role === 'assistant').slice(-8).flatMap(m => m.tool_calls?.map(t => t.function?.name ?? '') ?? []).join(' ');
  const catalog = await skills.activeCatalog(project), available = new Set(catalog.map(s => s.id));
  if (!catalog.length) return;
  const scores = new Map<string, number>();
  for (const entry of catalog) if (new RegExp('(?:^|[^a-z0-9-])' + entry.id + '(?:$|[^a-z0-9-])', 'i').test(latest)) scores.set(entry.id, 100);
  for (const group of groups) {
    const score = group.intent.test(latest) ? 20 : group.intent.test(context) ? 6 : group.context?.test(context) ? 4 : 0;
    if (score) group.ids.forEach((id, i) => { if (available.has(id)) scores.set(id, (scores.get(id) ?? 0) + score - i); });
  }
  if (/desktop_|계산기|데스크톱.*조작|컴퓨터.*조작|click.*window|open.*calculator/i.test(latest + ' ' + tools)) {
    for (const id of ['agent-desktop','agent-desktop-windows']) if (available.has(id)) scores.set(id, 80);
  }
  const selected = [...scores].sort((a,b) => b[1]-a[1]).slice(0,3).map(([id]) => id);
  const language = latest.length < 8 && !selected.length;
  if (language) return;
  const instructions = automaticSkillPolicy;
  if (!selected.length) return;
  const perDocument = Math.floor((maximumBytes - Buffer.byteLength(instructions) - 1024) / selected.length);
  if (perDocument < 1000) return instructions;
  const documents = [];
  for (const id of selected) {
    const customScope = catalog.find(entry => entry.id === id)?.scope;
    const read = await skills.read(id, 'SKILL.md', 0, project).catch(error => { if (!customScope) throw error; return undefined; });
    if (!read) continue;
    const content = read.split('--- SKILL.md ---\n')[1] ?? read;
    const bytes = Buffer.from(content); let end = Math.min(bytes.length,perDocument);
    while (end > 0 && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    const scopeLabel = customScope === 'project' ? ' project skill' : customScope === 'user' ? ' user skill' : '';
    documents.push(`Automatically loaded${scopeLabel}: ${id}\n${bytes.subarray(0,end).toString('utf8')}${end < bytes.length ? '\n[Excerpt only: read_skill retrieves the reviewed document and references when needed.]' : ''}`);
  }
  const candidates = selected.map(id => id + ' — ' + catalog.find(entry => entry.id === id)!.description.split(/\r?\n/, 1)[0].slice(0, 120)).join('\n');
  const result = 'Relevant Ned skills:\n' + candidates + '\n\n' + documents.join('\n\n');
  return Buffer.byteLength(JSON.stringify(result)) <= maximumBytes ? result : instructions;
}
