# L-Vibe 0.2.7 — model transport, thinking variants and edit approval

2026-11-11 KST. 사용자 제보의 세션 압축 ECONNRESET, thinking 옵션 형식 및 파일 수정 승인 혼동을 다룬 검증 후보다.

- 모델 중계의 고정 180초 fetch 제한을 제거했다. Node HTTP 전송에 전체/헤더/조각별 제한을 적용하고 provider/model settings를 반영한다. 요청 한도 32 MiB, JSON 완전 수신 후 전달, SSE 중단의 명시적 오류 및 본문·키 없는 마지막 실패 진단을 추가했다.
- 모델 options/객체형 variants를 현재 엔진의 settings/body/배열로 정규화한다. 기본 variant 선택을 보존하며 실제 고정 엔진→로컬 합성 서버에서 off/low/medium/xhigh의 parallel_tool_calls/reasoning_effort/chat_template_kwargs 전송을 확인했다.
- OpenCode 자동 승인과 네이티브 파일 수정 승인을 구분해 표시한다. 네이티브 승인에 요청 단위 자동 수정 승인을 추가했다. 프로젝트·세션·작업 세대 일치와 중지/새 요청 후 늦은 승인 거부를 검사한다. 영구 전체 수정 허용이나 명령 권한을 추가하지 않았다.

고정 OpenCode/Electron/Python/OpenViking/MCP 및 토크나이저 구성은 0.2.6과 같다. Python manifest `1dee469d101abd55b8c350640c1d86098aded233cbd1fcbf21a0af4d83d147d9`를 유지한다. 공개 배포에 실제 사용자 설정·대화·API 키를 포함하지 않는다.

검사 환경은 Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, Python 3.12.14다. 합성 서버로 연결 중단을 재현했으며 실제 사내 모델/프록시가 연결을 끊는 원인은 사용자의 재검증이 필요하다. 모든 thinking 강도에 대한 실제 Qwen 지원을 확인했다고 주장하지 않는다. Windows 10/11 전체 수용은 미완료이며 `releaseReady: false`다.

최종 검사·실제 EXE 추출·TGZ 무결성·공개 다운로드 결과는 완료 후 추가한다.
