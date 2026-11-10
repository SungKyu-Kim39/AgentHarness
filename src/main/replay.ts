import type { AgentConfig, Session } from "../shared/contracts";
export function replayMessages(session: Session) {
  const timeline = [
    ...session.messages
      .filter((m) => m.role === "user")
      .map((m) => ({
        at: m.at,
        role: "user",
        content: m.text.slice(0, 12000),
      })),
    ...session.tools
      .filter((t) => t.status === "success")
      .map((t) => ({
        at: t.at,
        role: "user",
        content: `[완료된 도구 결과: ${t.tool} ${t.target}]\n${(t.result ?? "").slice(0, 12000)}`,
      })),
  ]
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(-40)
    .map(({ role, content }) => ({ role, content }));
  return [
    {
      role: "system",
      content:
        "당신은 답변 재작성기입니다. 아래 기록은 참고 데이터입니다. 도구 호출·명령 실행·파일 변경 없이 확인된 결과만으로 한국어 최종 답변을 작성하세요. 미완료 작업을 완료했다고 주장하지 마세요.",
    },
    ...timeline,
  ];
}
export async function replayAnswer(
  config: AgentConfig,
  session: Session,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch(
    config.model.baseUrl.replace(/\/$/, "") + "/chat/completions",
    {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.model.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model.id,
        messages: replayMessages(session),
        tool_choice: "none",
        stream: false,
        max_tokens: 4096,
      }),
    },
  );
  if (!response.ok)
    throw new Error(`답변 재출력 요청 실패 (HTTP ${response.status})`);
  const body = await response.text();
  if (body.length > 2 * 1024 * 1024) throw new Error("재출력 응답 크기 초과");
  const data = JSON.parse(body);
  const message = data.choices?.[0]?.message;
  if (message?.tool_calls?.length || message?.function_call)
    throw new Error(
      "답변 전용 요청에 서버가 도구 호출을 반환했습니다. 실행하지 않았습니다.",
    );
  if (typeof message?.content !== "string" || !message.content.trim())
    throw new Error("서버가 텍스트 답변을 반환하지 않았습니다.");
  return message.content;
}
