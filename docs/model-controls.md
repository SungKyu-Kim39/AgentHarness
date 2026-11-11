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

0.2.6의 호스트 모델 중계는 180초에 요청을 중단했다. 0.2.7은 전체 요청 기본 900초, 첫 응답 헤더 300초, 응답 조각 사이 대기 900초로 구분한다. Node HTTP 전송을 사용해 숨은 fetch 응답 타이머와 고정 3분 제한을 제거했다. 모델 요청 크기 제한은 4 MiB에서 32 MiB로 늘렸다.

확인된 서버 운영 기준이 있다면 `providers.<provider ID>.settings` 안에 다음을 추가한다. 단위는 밀리초다.

```json
{
  "timeout": 900000,
  "headerTimeout": 600000,
  "chunkTimeout": 900000
}
```

이 값은 이미 존재하는 baseURL/apiKey와 함께 둔다. L-Vibe 호스트는 같은 이름의 모델 settings가 있으면 그 값을 우선한다. 엔진 자체의 타임아웃도 적용되므로 공통 전송 설정은 provider settings에 두는 것을 권장한다. 사내 프록시가 먼저 연결을 끊는 경우에는 클라이언트 대기 시간 증가만으로 해결되지 않는다.

중계 실패의 마지막 분류는 `%APPDATA%\L-Vibe\model-gateway-status.json`에 저장한다. 요청/응답 본문, URL, 헤더, API 키는 기록하지 않는다. 이 파일은 실패 기록이며 현재 서비스 상태가 아니다. `LV_MODEL_TOTAL_TIMEOUT`, `LV_MODEL_HEADER_TIMEOUT`, `LV_MODEL_CHUNK_TIMEOUT`, `LV_MODEL_UPSTREAM_RESET`, `LV_MODEL_CONNECTION`, `LV_MODEL_HTTP`와 elapsedMs/바이트 수/HTTP 숫자로 원인을 구분한다. 연결이 끊긴 출력을 성공으로 표시하거나 압축을 자동 재실행하지 않는다.

## 파일 수정 자동 승인

OpenCode 설정의 자동 승인은 엔진의 권한 요청을 처리한다. L-Vibe의 프로젝트 파일 수정은 별도 네이티브 승인을 거친다. 0.2.7은 설정 설명에 이 차이를 표시하고, 파일 수정 승인 창에 **이번 요청의 프로젝트 파일 수정 자동 승인**을 제공한다.

첫 수정의 대상과 변경 내용을 확인하고 체크한 뒤 승인하면 해당 요청의 같은 프로젝트 후속 수정은 다시 묻지 않는다. 새 요청·중지·앱 재시작 시 해제된다. 다른 프로젝트/세션의 도구 호출에는 그 승인을 사용하지 않는다. 파일 경로·외부 변경 충돌·스냅샷 검사는 생략하지 않으며 변경 적용 실패 시 자동 승인을 해제한다. 지식 색인·개인 지식 가져오기·MCP의 별도 승인·명령 실행 권한에는 적용하지 않는다. 영구적인 전체 수정 허용을 엔진에 저장하지 않는다.
