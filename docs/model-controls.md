# 모델 옵션과 응답 대기 설정

모델 JSON을 바꾼 뒤에는 알림 영역의 **설정 JSON 가져와 적용 (자동 재시작)**으로 적용합니다. 이미 저장한 설정은 EXE 옆 JSON만 편집해서는 갱신되지 않습니다. 이 문서의 옵션 호환과 대기 정책은 0.2.7부터 지원합니다.

## Thinking 강도 설정

번들 OpenCode 2.2.6의 형식은 `settings`, `body`, 배열형 `variants`입니다. 아래 예제를 `providers.<provider ID>.models.<model alias>`에 넣고 기존 `name`, `modelID`, `capabilities`, `limit`는 유지합니다.

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

이전 OpenCode 형식인 모델 `options`와 객체형 `variants`도 가져올 수 있습니다. 0.2.7부터는 가져오기와 저장 설정 로딩 시 현재 형식으로 정리합니다. `options.chat_template_kwargs`와 `options.extraBody`는 `body`로 옮기며, 같은 키를 직접 지정한 `settings`·`body`가 이전 `options`보다 우선합니다. 0.2.6 이전 설치본에는 이 호환 처리가 없습니다.

기본 variant는 최상위 `model`에 `{"providerID":"provider alias","model":"model alias","variant":"off"}`로 지정합니다. 기존 세션은 이전 모델 선택을 유지할 수 있으므로 대화의 모델·variant 선택도 확인하세요. 목록에 OpenCode의 기본 variant가 함께 보일 수 있습니다.

HTTP 요청에는 `parallel_tool_calls`, `reasoning_effort`, `chat_template_kwargs`로 전달합니다. `enable_thinking`은 thinking을 켜고 끄는 값이며, low·medium·xhigh 강도는 사내 게이트웨이와 서버가 지원해야 동작합니다. 합성 서버에서는 전송 형식을 검사했습니다. 실제 Qwen의 강도별 동작은 해당 서버에서 확인해야 합니다. 강도를 URL로 나누어 제공하는 서버라면 URL마다 provider를 등록합니다.

## 긴 대기열과 세션 압축

사내 서버가 혼잡하면 응답 헤더나 첫 토큰을 받기 전까지 오래 기다릴 수 있습니다. Ned는 시간이 지났다는 이유만으로 모델 요청을 중단하지 않습니다. 호스트와 OpenCode 엔진의 전체 요청·첫 헤더·응답 조각 대기 제한을 기본 해제하고, Node HTTP 전송과 TCP keepalive를 사용합니다. 사용자가 중지하거나 앱을 종료하면 연결을 닫으며, 실제 연결 오류는 따로 처리합니다. 요청 크기 한도는 32 MiB입니다.

기본 JSON에 대기 시간을 추가할 필요는 없습니다. 이전에 유한한 제한을 지정했다면 `providers.<provider ID>.settings`와 해당 모델의 settings를 아래처럼 바꿉니다. 실제 `baseURL`·`apiKey`는 유지하세요.

```json
{
  "timeout": false,
  "headerTimeout": false,
  "chunkTimeout": false
}
```

서버가 연결을 유지하면 응답을 기다립니다. 서버나 중계기가 연결을 끊으면 오류로 기록합니다. API가 대기열 순번을 제공하지 않으면 순번을 추정해서 표시하지 않습니다.

OpenViking의 모델 중계와 모델 처리를 기다리는 로컬 API, 고정 OpenAI SDK의 VLM backend, 기존 프로토타입 답변 재작성 코드에도 고정 응답 대기 제한을 두지 않습니다. OpenViking SDK는 JSON에 양수 timeout을 요구하므로 검증 후 앱 어댑터에서 HTTPX·OpenAI가 지원하는 `None`으로 바꿉니다. SDK 원본 파일은 유지합니다. 서비스 준비·종료 확인은 모델 생성 대기와 다른 단계로 처리합니다. Zed/ACP의 답변 재출력 통합은 후속 구현 항목입니다.

## 연결 오류 확인

마지막 중계 실패는 `%APPDATA%\Ned\model-gateway-status.json`에 남습니다. 요청·응답 본문, URL, 헤더와 API 키는 저장하지 않습니다. 이 파일은 현재 서비스 상태가 아니라 마지막 실패 기록입니다.

오류 코드는 `LV_MODEL_TOTAL_TIMEOUT`, `LV_MODEL_HEADER_TIMEOUT`, `LV_MODEL_CHUNK_TIMEOUT`, `LV_MODEL_UPSTREAM_RESET`, `LV_MODEL_CONNECTION`, `LV_MODEL_HTTP`로 나눕니다. `elapsedMs`, 바이트 수와 HTTP 상태도 함께 확인할 수 있습니다.

중간에 끊긴 응답을 성공으로 표시하거나 호스트에서 임의 재시도하지 않습니다. 엔진의 기존 재시도 정책은 별도로 동작하므로 실패를 확정하기 전까지 압축 상태가 `running`으로 보일 수 있습니다. 오류가 반복되면 작업을 중지하고 실패 코드와 서버 상태를 확인하세요.

## 파일 수정 승인과의 관계

Zed에서 직접 저장하는 동작은 AI 수정 승인과 별개입니다. 현재 Ned의 지속 권한은 **승인 요청**, **프로젝트 파일 자동 승인**, **전체 권한**이며 대화 입력창이나 알림 영역에서 선택합니다. 선택은 업데이트·재시작 후에도 유지됩니다. 자세한 범위는 [권한 안내](approval-modes.md)에 정리했습니다.

승인 요청 모드에서는 파일 수정창의 체크박스로 이번 요청에 한해 후속 수정을 허용할 수 있습니다. 호스트가 실제 사용자 메시지 ID와 프로젝트·세션을 확인하므로 다음 요청이 이전 승인을 이어받지 않습니다. 새 요청·중지·재시작과 변경 실패 시 해제하며 충돌·스냅샷 검사는 계속합니다. 이 임시 승인에는 지식·MCP·명령 실행 권한이 포함되지 않습니다.

0.3.3부터 제공하는 **현재 대화·프로젝트 자동 승인**은 같은 대화의 새 메시지에도 적용됩니다. 다른 대화·프로젝트 사용, 중지·재시작 또는 **파일 수정 자동 승인 모두 해제**로 끝납니다. 저장하지 않은 버퍼도 계속 확인합니다. 임시 승인을 엔진의 `always`나 영구 설정으로 저장하지 않습니다.
