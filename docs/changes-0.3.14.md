# Ned 0.3.14 변경 사항

Ned 0.3.14는 0.3.13에서 도입한 개인화 대화 기억, 백그라운드 VLM 의미 요약, 버퍼 가드의 프라이버시·안정성·경계값 처리를 보강한 릴리스입니다.

## [P0] 개인화 대화 기억 프라이버시·시크릿 보호 보강

- **"기억하지 마" opt-out을 회상과 수집·커밋 양쪽에 일관 적용**:
  - [`src/main/session-memory.ts`](../src/main/session-memory.ts)에서 턴 단위 제외 표현("이건 기억하지 마", "메모리 쓰지 마", "기억에서 빼줘", `don't remember` 등)이 포함된 사용자 메시지는 개인 기억 회상(`recallContext`)뿐 아니라 자동 수집·커밋(`extractMemoryMessages`)에서도 해당 턴의 사용자 메시지·어시스턴트 응답 모두를 제외합니다.
  - 세션 단위 제외 표현("이 세션은 기억하지 마", "이번 대화는 저장하지 마", "이번 세션 메모리 꺼줘" 등)이 감지되면 해당 세션의 이후 모든 턴을 회상과 수집에서 제외하며, 상태 파일(`memory-sync.json`)에 `sessionOptedOut`을 보존해 세션을 다시 열어도 유지됩니다.
- **회상 쿼리 마스킹 추가 및 시크릿 패턴 확장**:
  - `extractRecallQuery`에서 OpenViking·사내 임베딩 서버로 쿼리를 보내기 전에 `scrubMemoryText`를 적용합니다. 마스킹 후 실질 질의어가 남지 않으면 회상을 건너뜁니다.
  - `scrubMemoryText`에 JWT(`eyJ...`), PEM 개인키 블록(`-----BEGIN ... PRIVATE KEY-----`), AWS 액세스 키(`AKIA...`), DB·URL 자격증명(`://user:pass@`), 공백이 포함된 따옴표 비밀번호(`password: "..."` / `password='...'`) 패턴을 추가해 회상 쿼리와 저장 페이로드 양쪽에서 민감 정보를 차단합니다.
- **자동 수집 기본 활성화 UX 및 문서 고지 명확화**:
  - Windows 트레이 메뉴([`distribution/ned/main.ts`](../distribution/ned/main.ts))에 `자동 대화 기억 · 켜짐 (N턴마다 추출 · 자동 회상)` 또는 `자동 대화 기억 · 꺼짐 (설정 JSON으로 변경)` 상태 표시 항목을 추가했습니다.
  - [지식 쌓기 안내](knowledge-notes.md)와 [Ned 사용 안내](ned-user-guide.md)에 `openViking.memory` 기본값(`enabled: true`, `autoRecall: true`, `commitEveryTurns: 6`), 턴·세션 opt-out 방법, JSON 비활성화 방법을 명확히 정리했습니다.

## [P1] OpenViking 백그라운드 VLM 요약 안정성 및 진단 보강

- **백그라운드 `semantic_and_vectors` 실패 진단 로깅 및 409 재시도**:
  - [`src/main/openviking.ts`](../src/main/openviking.ts)에서 백그라운드 의미 요약 실패 예외를 삼키던 `.catch(() => {})`를 제거하고, `request-diagnostics.json`에 실패 원인과 URI를 기록합니다(`OV_SEMANTIC_REFRESH_FAILED`).
  - `409`/pathlock 충돌(`OV_CONFLICT`) 발생 시 `OV_SEMANTIC_RETRY`를 기록하고 1회 짧은 백오프(기본 2.5초) 후 자동 재시도합니다.
- **타이머 복구·상위/하위 URI 병합·종료 시 대기 건수 기록**:
  - `saveNote`·`deleteNote`에서 `vectors_only` 쓰기나 삭제가 성공한 직후에만 기존 예약 타이머를 교체·해제하도록 순서를 조정해, 쓰기 실패 시 기존 정상 예약이 유실되지 않게 했습니다.
  - 상위 디렉토리 `index`의 재귀 `semantic_and_vectors` 갱신이 예약·실행될 때 하위 노트 URI 타이머가 중복 발송되지 않도록 prefix 기반 병합(coalescing)을 적용했습니다.
  - `stop()` 시점에 대기 중인 의미 요약 타이머가 있으면 종료 전 `request-diagnostics.json`에 미완료 건수(`OV_SEMANTIC_PENDING_SHUTDOWN`)를 남깁니다.

## [P2] 경계값 방어 및 버퍼 가드 일시적 RPC 오류 재시도

- **`session-memory.ts` 경계값 방어**:
  - `commitEveryTurns`가 `NaN`·비정수·`<= 0`이면 기본 `6`으로 보정하고, 유효 값은 `1`~`50` 범위로 클램핑합니다([`src/shared/contracts.ts`](../src/shared/contracts.ts) 스키마 상한도 `50`으로 일치시켰습니다).
  - 400개 초과 장시간 세션에서 `syncedIds` 앞부분이 절삭될 때 오래된 메시지가 다시 수집되지 않도록 세션별 워터마크(`watermarkCount`, `watermarkCreatedAt`)를 함께 기록·검사합니다.
  - `buildOvSessionId`가 96자를 초과하거나 문자 정규화가 필요한 세션 ID에 짧은 SHA-256 해시 접미사를 붙여 절삭 충돌을 방지합니다.
- **`buffer-check.ts` 일시적 RPC 오류 재시도**:
  - [`distribution/ned/buffer-check.ts`](../distribution/ned/buffer-check.ts)에서 `readTextFile()`이 `-32002`(열리지 않은 파일) 외의 일시적 RPC/IO 오류를 반환할 때도 `AbortSignal` 취소나 비복구 오류(인코딩·바이너리·잘못된 인자 등)가 아니면 기존 재시도 예산(`[120, 250, 400]` ms) 안에서 재시도한 뒤 최종 실패 시에만 오류를 반환합니다.
