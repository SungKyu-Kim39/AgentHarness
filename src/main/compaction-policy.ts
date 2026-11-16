/** Match the pinned engine's final summary instruction, never transcript/tool text. */
const nudge = 'The previous response did not fill in the required summary template. Do not call tools. Return the summary as text using the exact section headings from the template.';
const content = (message: any) => typeof message?.content === 'string' ? message.content : Array.isArray(message?.content)
  ? message.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') : '';
const instruction = (message: any) => message?.role === 'user' &&
  (content(message).startsWith('You MUST summarize the conversation above into a structured summary') || content(message).startsWith('Update the existing checkpoint in the conversation above into one consolidated summary.')) &&
  content(message).includes('## Next Move') && content(message).includes('## Relevant Files') && content(message).includes('Do not continue the task or call tools.');
export function isCompaction(body: any) {
  if (!Array.isArray(body?.messages)) return false;
  const last = body.messages.at(-1);
  return instruction(last) || last?.role === 'user' && content(last) === nudge && instruction(body.messages.at(-2));
}
export function summaryRequest(body: any, outputLimit: number, retry: boolean, disableThinking: boolean) {
  const supplied = body.max_completion_tokens ?? body.max_tokens;
  // Never raise the engine's context-aware output ceiling or invent server limits.
  const ceiling = typeof supplied === 'number' && supplied > 0 ? Math.min(supplied, outputLimit) : outputLimit;
  const target = Math.max(32, Math.floor(ceiling * (retry ? 0.2 : 0.4)));
  const prompt = `대화를 다음 작업자가 이어갈 요약으로 정리하세요. ${target} 토큰 이내로 짧게 작성하세요. 설명·추론·코드 복사·도구 호출을 생략하고, 미해결 사용자 요구·결정·현재 작업 상태·다음 행동·필수 경로만 보존하세요. 파일에서 다시 확인할 상세 내용은 경로로 대신하세요. 다음 제목을 그대로 사용하고 불필요한 절은 생략하세요:\n## Objective\n## Requirements\n## Decisions\n## Work State\n### Completed\n### Active\n### Blocked\n## Next Move\n## Relevant Files\n## Important Context`;
  const messages = body.messages.slice();
  const index = instruction(messages.at(-1)) ? messages.length - 1 : messages.length - 2;
  messages[index] = { role: 'user', content: prompt };
  const result = { ...body, messages, tool_choice: 'none', ...(disableThinking ? {
    reasoning_effort: 'none', chat_template_kwargs: { ...body.chat_template_kwargs, enable_thinking: false },
  } : {}) };
  delete result.tools; delete result.functions; delete result.function_call;
  if (body.max_completion_tokens !== undefined) { result.max_completion_tokens = ceiling; delete result.max_tokens; }
  else result.max_tokens = ceiling;
  return result;
}
export function summaryOutcome(bytes: Buffer, streaming: boolean): 'length' | 'complete' | 'invalid' {
  try {
    const replies = streaming ? bytes.toString('utf8').split(/\r?\n/).filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trim()).filter(line => line && line !== '[DONE]').map(line => JSON.parse(line)) : [JSON.parse(bytes.toString('utf8'))];
    let terminal = '', text = '';
    for (const reply of replies) {
      if (reply.error) return 'invalid';
      for (const choice of reply.choices ?? []) {
        if (choice.index !== undefined && choice.index !== 0) return 'invalid';
        const message = choice.delta ?? choice.message;
        if (message?.tool_calls?.length || message?.function_call) return 'invalid';
        if (typeof message?.content === 'string') text += message.content;
        if (choice.finish_reason) terminal = choice.finish_reason;
      }
    }
    return terminal === 'length' ? 'length' : terminal === 'stop' && text.trim() ? 'complete' : 'invalid';
  } catch { return 'invalid'; }
}

// Keep server-reported token accounting across the text-only retry. Missing
// usage is never guessed; unrelated vendor fields stay as the final response.
function addUsage(previous: any, current: any): any {
  if (!previous) return current;
  const result = { ...current };
  for (const [key, value] of Object.entries(previous)) {
    if (['prompt_tokens', 'completion_tokens', 'total_tokens', 'input_tokens', 'output_tokens', 'cached_tokens', 'reasoning_tokens', 'audio_tokens', 'accepted_prediction_tokens', 'rejected_prediction_tokens'].includes(key) && typeof value === 'number' && Number.isFinite(value))
      result[key] = value + (typeof current?.[key] === 'number' ? current[key] : 0);
    else if (['prompt_tokens_details', 'completion_tokens_details', 'input_tokens_details', 'output_tokens_details'].includes(key) && value && typeof value === 'object' && !Array.isArray(value)) result[key] = addUsage(value, current?.[key]);
  }
  return result;
}
export function summaryUsage(bytes: Buffer, streaming: boolean): any {
  try {
    const data = streaming ? bytes.toString('utf8').split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trim())
      .filter(line => line && line !== '[DONE]').map(line => JSON.parse(line)) : [JSON.parse(bytes.toString('utf8'))];
    return data.slice().reverse().find((reply: any) => reply.usage)?.usage;
  } catch { return undefined; }
}
export function withSummaryUsage(bytes: Buffer, streaming: boolean, previous: unknown): Buffer {
  if (!previous) return bytes;
  if (!streaming) { const reply = JSON.parse(bytes.toString('utf8')); return Buffer.from(JSON.stringify({ ...reply, usage: addUsage(previous, reply.usage) })); }
  let merged = false;
  const result = bytes.toString('utf8').replace(/^data:([^\r\n]*)/gm, (line, raw) => {
    if (!raw.trim() || raw.trim() === '[DONE]') return line;
    const reply = JSON.parse(raw);
    if (!reply.usage) return line;
    merged = true; return 'data: ' + JSON.stringify({ ...reply, usage: addUsage(previous, reply.usage) });
  });
  // A server that omits final usage cannot supply accurate retry totals. Expose
  // only its reported earlier usage, without inventing final token consumption.
  return merged ? Buffer.from(result) : bytes;
}
