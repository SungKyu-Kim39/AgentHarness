# L-Vibe model transport and thinking controls

0.2.7부터 적용한다. JSON을 수정한 뒤 알림 영역의 **모델 설정 JSON 가져와 교체 후 재시작**으로 가져온다. EXE 옆 JSON을 편집하는 것만으로 저장 설정이 바뀌지는 않는다.

## thinking 설정

번들 OpenCode 2.2.6의 기본 형식은 `settings`/`body`와 **배열** `variants`다. 아래 내용은 `providers.<provider ID>.models.<model alias>` 안에 넣는다. 기존 `name`, `modelID`, `capabilities`, `limit`는 유지한다.

```json
{
  "settings": {
    "parallelToolCalls": true,
    "reasoningEffort": "none"
  },
  "body": {
    "chat_template_kwargs": { "enable_thinking": false }
  },
  "variants": [
    {
      "id": "off",
      "settings": { "reasoningEffort": "none" },
      "body": { "chat_template_kwargs": { "enable_thinking": false } }
    },
    {
      "id": "low",
      "settings": { "reasoningEffort": "low" },
      "body": { "chat_template_kwargs": { "enable_thinking": true } }
    },
    {
      "id": "medium",
      "settings": { "reasoningEffort": "medium" },
      "body": { "chat_template_kwargs": { "enable_thinking": true } }
    },
    {
      "id": "xhigh",
      "settings": { "reasoningEffort": "xhigh" },
      "body": { "chat_template_kwargs": { "enable_thinking": true } }
    }
  ]
}
```

0.2.7은 이전 OpenCode 형식인 모델 `options`와 객체형 `variants`도 가져오기 시 위 형식으로 정규화한다. `options.chat_template_kwargs`와 `options.extraBody`는 body로 옮기며, 명시한 settings/body가 같은 키의 이전 options보다 우선한다. 기존 저장 설정도 로드 시 정규화한다. 0.2.6 이전 설치본에 이 호환 동작이 있다고 가정하지 않는다.

기본 variant는 최상위 `model`에서 `{"providerID":"provider alias","model":"model alias","variant":"off"}`로 지정할 수 있다. 이미 생성된 세션의 모델 선택은 기존 선택을 유지할 수 있으므로 세션의 모델/variant 선택도 확인한다. OpenCode의 기본 variant가 추가로 표시될 수 있다.

실제 HTTP 요청에는 `parallel_tool_calls`, `reasoning_effort`, `chat_template_kwargs`로 전달된다. `enable_thinking`은 thinking 토글이며 low/medium/xhigh 강도의 실제 동작은 사내 게이트웨이·서버의 지원 여부에 달려 있다. 합성 서버의 전송 검사는 Qwen의 모든 강도 지원을 보증하지 않는다. 강도를 URL로 구분하는 서버라면 해당 URL들을 별도 provider로 등록한다.

## 세션 압축과 대기 시간

사내 모델 서버에 사용자가 많으면 응답 헤더나 첫 토큰이 오기 전 대기열에 오래 머물 수 있다. 0.2.7은 경과 시간만으로 이 요청을 중단하지 않는다. 호스트와 OpenCode 엔진의 전체 요청·첫 헤더·응답 조각 대기 제한은 기본적으로 모두 해제한다. Node HTTP 전송과 TCP keepalive를 사용하며 사용자 중지·앱 종료·실제 연결 오류를 처리한다. 모델 요청 한도는 32 MiB다.

기본 설정에는 응답 대기 시간 항목을 추가할 필요가 없다. 이전에 유한한 값을 직접 지정했다면 `providers.<provider ID>.settings`와 해당 모델 settings에서 다음과 같이 바꾼다. 실제 baseURL/apiKey는 유지한다.

```json
{
  "timeout": false,
  "headerTimeout": false,
  "chunkTimeout": false
}
```

긴 대기 자체는 실패로 판단하지 않는다. 연결이 유지되는 동안 응답을 기다리며, 사용자가 중지하면 진행 중인 모델 HTTP 연결을 닫는다. 사내 서버나 중계기가 실제로 연결을 끊는 경우는 별도 오류로 기록한다. 서버의 대기열 순번은 해당 API가 제공하지 않는 한 추정해 표시하지 않는다.

OpenViking의 모델 중계 및 모델 처리를 기다리는 로컬 API, 고정 OpenAI SDK의 VLM backend, 답변 재작성기에도 고정 응답 대기 제한을 두지 않는다. OpenViking SDK의 JSON은 양수 timeout을 요구하므로 검증 후 backend 구성에서 HTTPX/OpenAI가 지원하는 None으로 변환하는 앱 어댑터를 사용한다. 원본 SDK 파일은 변경하지 않는다. 서비스 준비 확인과 프로세스 종료 확인은 모델 응답 대기와 다른 단계다.

중계 실패의 마지막 분류는 `%APPDATA%\L-Vibe\model-gateway-status.json`에 저장한다. 요청/응답 본문, URL, 헤더, API 키는 기록하지 않는다. 이 파일은 실패 기록이며 현재 서비스 상태가 아니다. `LV_MODEL_TOTAL_TIMEOUT`, `LV_MODEL_HEADER_TIMEOUT`, `LV_MODEL_CHUNK_TIMEOUT`, `LV_MODEL_UPSTREAM_RESET`, `LV_MODEL_CONNECTION`, `LV_MODEL_HTTP`와 elapsedMs/바이트 수/HTTP 숫자로 원인을 구분한다. 호스트 중계는 연결이 끊긴 출력을 성공으로 표시하지 않으며 자체 재시도를 추가하지 않는다. 엔진의 기존 재시도 정책은 별도로 적용되어 실패 확정 전 압축 상태가 running으로 남을 수 있다. 반복 오류가 발생하면 중지하고 실패 코드와 서버 상태를 확인한다.

## 파일 수정 자동 승인

OpenCode 설정의 자동 승인은 엔진의 권한 요청을 처리한다. L-Vibe의 프로젝트 파일 수정은 별도 네이티브 승인을 거친다. 0.2.7은 설정 설명에 이 차이를 표시하고, 파일 수정 승인 창에 **이번 요청의 프로젝트 파일 수정 자동 승인**을 제공한다.

첫 수정의 대상과 변경 내용을 확인하고 체크한 뒤 승인하면 해당 요청의 같은 프로젝트 후속 수정은 다시 묻지 않는다. 새 요청·중지·앱 재시작 시 해제된다. 다른 프로젝트/세션의 도구 호출에는 그 승인을 사용하지 않는다. 호스트가 엔진의 실제 사용자 메시지 ID를 확인하므로 대기열에 등록된 다음 요청도 이전 요청의 자동 승인을 이어받지 않는다. 파일 경로·외부 변경 충돌·스냅샷 검사는 생략하지 않으며 변경 적용 실패 시 자동 승인을 해제한다. 지식 색인·개인 지식 가져오기·MCP의 별도 승인·명령 실행 권한에는 적용하지 않는다. 영구적인 전체 수정 허용을 엔진에 저장하지 않는다.
