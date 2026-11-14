import type { OfflineSkills } from './skills';

type Message = { role?: string; content?: unknown; name?: string; tool_calls?: Array<{ function?: { name?: string } }> };
export const automaticSkillPolicy = 'Ned automatic skill routing: This policy applies to ordinary user work, not engine compaction, checkpoint summaries or tool-free replay. Select guidance by the meaning of the latest request, previous decisions, actual project evidence and tool results, even when the user names no skill. The local shortlist is a heuristic, not a mandatory keyword branch. Discard irrelevant candidates; use skill_catalog and read_skill to select a better reviewed skill when needed. Reassess when scope or evidence changes. Use only the relevant guidance and briefly name skills actually applied. Guidance never grants permissions, authorizes execution or answers unresolved product decisions. Do not ask permission merely to choose a skill. Do not spawn agents, install packages or make extra model calls for routing.';
const groups: Array<{ ids: string[]; intent: RegExp; context?: RegExp }> = [
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
];
function text(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.filter(p => p?.type === 'text' && typeof p.text === 'string').map(p => p.text).join('\n');
  return '';
}

/** Local shortlist only; the answering model still checks semantic relevance and may choose another skill. */
export async function automaticSkillContext(skills: OfflineSkills, input: unknown, maximumBytes = 18000): Promise<string | undefined> {
  if (maximumBytes < Buffer.byteLength(JSON.stringify(automaticSkillPolicy))) return;
  if (!Array.isArray(input)) return;
  const messages = input.slice(-80) as Message[];
  const users = messages.filter(m => m.role === 'user').slice(-4).map(m => text(m.content).slice(-6000));
  if (!users.length || /(?:스킬.*(?:사용하지|쓰지)\s*마|do not use (?:any )?skills|no skills)/i.test(users.at(-1)!)) return;
  if (/^(?:You MUST summarize the conversation above into a structured summary|Update the existing checkpoint in the conversation above into one consolidated summary|The previous response did not fill in the required summary template)/.test(users.at(-1)!.trim())) return;
  const latest = users.at(-1)!.replace(/```[\s\S]*?```/g, ' ');
  const context = users.join('\n');
  let lastUser = messages.length - 1;
  while (lastUser >= 0 && messages[lastUser].role !== 'user') lastUser--;
  const tools = messages.slice(lastUser + 1).filter(m => m.role === 'assistant').slice(-8).flatMap(m => m.tool_calls?.map(t => t.function?.name ?? '') ?? []).join(' ');
  const catalog = skills.catalog(), available = new Set(catalog.map(s => s.id));
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
  if (!selected.length) return instructions;
  const perDocument = Math.floor((maximumBytes - Buffer.byteLength(instructions) - 1024) / selected.length);
  if (perDocument < 1000) return instructions;
  const documents = [];
  for (const id of selected) {
    const read = await skills.read(id), content = read.split('--- SKILL.md ---\n')[1] ?? read;
    const bytes = Buffer.from(content); let end = Math.min(bytes.length,perDocument);
    while (end > 0 && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    documents.push(`Automatically loaded: ${id}\n${bytes.subarray(0,end).toString('utf8')}${end < bytes.length ? '\n[Excerpt only: read_skill retrieves the reviewed document and references when needed.]' : ''}`);
  }
  const result = instructions + '\n\n' + documents.join('\n\n');
  return Buffer.byteLength(JSON.stringify(result)) <= maximumBytes ? result : instructions;
}
