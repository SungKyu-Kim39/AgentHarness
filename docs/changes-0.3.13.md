# Ned 0.3.13 변경 사항

Ned 0.3.13은 OpenViking의 VLM 기반 개인화 대화 기억·의미 요약을 활성화하고, 저장된 파일에서도 "저장하지 않은 편집기 변경" 가드가 오탐으로 막던 문제를 근본 수정했습니다.

## OpenViking 개인화 대화 기억 및 VLM 의미 요약

- **Ned 에이전트 대화 자동 수집·기억 추출**:
  - OpenCode/ACP 기반 Ned 주 대화 세션에서 사용자 메시지, 에이전트 최종 응답, 도구 호출 요약(출력 원문은 길이 제한 및 토큰·키 마스킹 적용)을 OpenViking 세션(`/api/v1/sessions`)에 자동으로 기록합니다. Zed 기본 에이전트 대화와 하위 서브에이전트(`parentID`가 있는 세션)·EGM Goldfish 검토 세션은 수집 대상에서 제외합니다.
  - 세션 전환·종료 시와 긴 대화의 일정 턴마다(기본 6턴) 백그라운드에서 OpenViking 세션 커밋(`/api/v1/sessions/{id}/commit`)을 실행해 사내 VLM으로 프로필·선호·경험 기억을 추출합니다. 사내 모델 대기열 때문에 사용자 대화가 지연되지 않도록 비동기로 처리합니다.
  - `OpenVikingGateway`에서 OpenViking 0.5.5 내부 기억 추출 도구(`read`, `search`, `ls`, `create_working_memory`, `update_working_memory`)만 명시적으로 허용하고 그 외 도구나 비텍스트 파트는 계속 403으로 차단합니다. OpenViking 런타임 설정의 VLM HTTP 대기 제한도 긴 사내 대기열에 맞춰 늘렸습니다.
- **매 요청 관련 기억 자동 회상 + 수동 도구 유지**:
  - 매 사용자 요청마다 OpenViking 개인 기억(`viking://user/local-user/memories`)과 프로필에서 관련 항목을 찾아 길이 제한(3,500 bytes) 안에서 참고 컨텍스트로 주입합니다. 같은 턴 안의 반복 도구 호출에서는 캐시를 재사용해 지연과 중복 조회를 줄였습니다.
  - 기존 `knowledge_search`·`personal_knowledge_search`·`knowledge_remember`·`knowledge_forget` 도구는 그대로 유지하며, `personal_knowledge_search`와 `personal_knowledge_read`에서도 자동 추출된 개인 기억을 함께 검색·열람할 수 있습니다.
  - 기억은 참고 자료이며 현재 사용자 요청과 프로젝트 규칙이 항상 우선하고, 저장된 텍스트가 실행 권한이나 도구 승인을 부여하지 않습니다.
- **기본 켜짐과 사용자 통제**:
  - 기존 설정 JSON을 수정하지 않아도 `openViking.enabled: true` 환경에서는 기본 활성화됩니다(`openViking.memory`: `enabled: true`, `autoRecall: true`, `commitEveryTurns: 6`). 설정 JSON에서 `openViking.memory.enabled: false` 또는 `autoRecall: false`로 끌 수 있으며, OpenViking Studio에서 추출된 기억을 조회·편집·삭제할 수 있습니다.
  - 동기화 상태와 진단 카운터(원문 제외)는 `%APPDATA%\Ned\openviking\memory-sync.json`과 `memory-status.json`에 기록합니다.
- **지식 저장·색인 시 VLM 의미 요약 활성화**:
  - `knowledge_remember`(`saveNote`)와 `knowledge_index`(`index`)는 기존처럼 즉시 벡터 색인을 마쳐 도구 응답과 즉시 검색을 보장한 뒤, 백그라운드에서 `semantic_and_vectors` 모드로 VLM 의미 요약(L0/L1)을 생성합니다. 이제 OpenViking Studio Home에서도 VLM 입력·출력 토큰 사용량이 정상 집계됩니다.

## "저장하지 않은 편집기 변경" 버퍼 가드 오탐 근본 수정

- **UTF-8 BOM·단독 CR 개행 정규화**:
  - Zed 1.28.1은 파일을 버퍼로 읽을 때 선두 UTF-8 BOM(`\uFEFF`)을 제거하고 `\r\n`과 단독 `\r`을 모두 `\n`으로 정규화합니다. 기존 `checkBuffer`는 Node의 원문 문자열과 `\r\n`만 치환해 비교했기 때문에 UTF-8 BOM이 포함된 Windows 파일이나 단독 `\r`이 있는 파일이 저장돼 있고 탭이 닫혀 있어도 항상 미저장 변경으로 오탐됐습니다.
  - [`distribution/ned/buffer-check.ts`](../distribution/ned/buffer-check.ts)에서 Zed와 동일한 정규화(선두 BOM 제거, `\r\n|\r` → `\n`)로 비교하도록 수정했습니다.
- **Zed `BufferStore` 리로드 지연 재시도**:
  - Zed ACP `read_text_file`은 탭을 닫은 뒤에도 세션 동안 `Buffer` 엔티티를 메모리에 유지합니다. 직전 디스크 쓰기 후 파일 감시자가 버퍼를 다시 읽기 전 짧은 지연으로 인한 오탐을 막기 위해 불일치 시 짧은 간격(120ms·250ms·400ms)으로 최대 3회 재확인합니다.
- **비-UTF-8 파일 조기 구분 및 진단 개선**:
  - CP949/EUC-KR 등 비-UTF-8 텍스트 파일은 Zed가 자동 인코딩 감지로 정상 디코딩하는 반면 Node UTF-8 디코딩에서는 대체 문자(`\uFFFD`)가 생겨 잘못된 "저장하지 않은 편집기 변경" 오류를 냈습니다. 이제 `propose_edit`·`patch_file` 단계에서 먼저 UTF-8 여부를 검증해 명확한 인코딩 안내를 반환합니다.
  - 실제 미저장 버퍼나 Zed 기본 Agent 패널에 보류 중인 변경(Keep/Reject)이 남아 있는 경우에는 계속 안전하게 수정을 차단하며, 원문을 제외한 불일치 진단을 `%APPDATA%\Ned\buffer-check-diagnostics.json`에 기록합니다.
