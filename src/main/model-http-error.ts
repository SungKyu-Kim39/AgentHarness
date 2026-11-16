/** Parse privately; expose only fixed classifications, field names and counts. */
const fields = ['messages', 'tools', 'tool_choice', 'parallel_tool_calls', 'max_tokens', 'max_completion_tokens', 'reasoning_effort', 'chat_template_kwargs', 'response_format', 'stream', 'stream_options', 'temperature', 'model'] as const;
export function modelRequestShape(body: any) {
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const roles = Object.fromEntries(['system', 'developer', 'user', 'assistant', 'tool'].map(role => [role, messages.filter((m: any) => m?.role === role).length]));
  return { messages: messages.length, roles, tools: Array.isArray(body?.tools) ? body.tools.length : 0,
    fields: fields.filter(field => Object.hasOwn(body ?? {}, field)), streaming: body?.stream === true,
    ...(Number.isSafeInteger(body?.max_tokens) ? { maxTokens: body.max_tokens } : {}),
    ...(Number.isSafeInteger(body?.max_completion_tokens) ? { maxCompletionTokens: body.max_completion_tokens } : {}) };
}
export function classifyModelHttpError(raw: string) {
  let value: any;
  try { value = JSON.parse(raw.slice(0, 65536)); } catch { return { reason: 'unclassified' as const }; }
  const error = value?.error ?? value;
  const text = [error?.message, error?.type, typeof error?.code === 'string' ? error.code : undefined].filter(v => typeof v === 'string').join(' ').slice(0, 16000).toLowerCase();
  const param = typeof error?.param === 'string' && fields.includes(error.param) ? error.param as typeof fields[number] : undefined;
  const reason = /too many|overload|server.{0,16}busy|concurren|queue.{0,30}(?:full|limit|exceed)|rate.?limit|capacity.{0,16}(?:exceed|limit)|max_num_seqs/.test(text) ? 'capacity'
    : /out of memory|insufficient.{0,16}memory|kv.?cache.{0,30}(?:full|space|memory|exceed)/.test(text) ? 'memory'
    : /context.{0,30}(?:length|limit|window)|input.{0,20}token.{0,20}(?:exceed|limit|long)|prompt.{0,20}(?:too long|exceed)/.test(text) ? 'context-limit'
    : /max_(?:completion_)?tokens.{0,60}(?:exceed|greater|less|must|limit|maximum)|max.?output.?tokens/.test(text) ? 'output-limit'
    : /(?:system|developer).{0,40}(?:message|role)|roles? must alternate|chat.{0,12}template/.test(text) ? 'message-format'
    : /tool.{0,50}(?:schema|parser|choice|required|support|invalid)|function.{0,25}(?:schema|name|invalid)/.test(text) ? 'tool-format'
    : /model.{0,50}(?:not found|does not exist|unknown|invalid|not available)/.test(text) ? 'model-id'
    : /extra inputs|extra_forbidden|unsupported|unknown parameter|unrecognized|not permitted|unexpected keyword|reasoning_effort/.test(text) ? 'unsupported-option'
    : /unauthori|api.?key|authentication|permission denied/.test(text) ? 'authentication'
    : 'unclassified';
  return { reason, ...(param ? { field: param } : {}) };
}
export function modelHttpExplanation(reason: string) {
  return ({ capacity: '서버가 동시 요청·대기열 한도와 관련된 오류를 반환했습니다.', memory: '서버가 모델 메모리·KV 캐시 부족을 반환했습니다.',
    'context-limit': '서버가 입력 문맥 한도 초과를 반환했습니다.', 'output-limit': '서버가 출력 토큰 설정을 거절했습니다.',
    'message-format': '서버가 메시지 역할·대화 템플릿 형식을 거절했습니다.', 'tool-format': '서버가 도구 정의·도구 선택 형식을 거절했습니다.',
    'model-id': '서버가 모델 ID를 거절했습니다.', 'unsupported-option': '서버가 지원하지 않는 요청 옵션을 거절했습니다.',
    authentication: '서버가 인증·접근 권한을 거절했습니다.', unclassified: '서버의 구체적인 거절 사유를 안전하게 분류하지 못했습니다.' } as Record<string, string>)[reason] ?? '';
}
