# Ned 0.3.14

Ned 0.3.14 사전 릴리스입니다.

## 주요 변경 사항

- **개인화 대화 기억 프라이버시·시크릿 보호 보강**:
  - “이건 기억하지 마”·“메모리 쓰지 마”(턴 단위) 및 “이 세션은 기억하지 마”(세션 단위, 재로드 후 유지) opt-out을 개인 기억 회상뿐 아니라 자동 수집·커밋에도 적용했습니다.
  - 회상 쿼리(`recallContext`)에도 시크릿 마스킹을 적용하고, JWT·PEM 개인키 블록·AWS 키(`AKIA...`)·DB/URL 자격증명(`://user:pass@`)·공백 포함 따옴표 비밀번호를 저장·회상 양쪽에서 마스킹합니다.
  - Windows 트레이 메뉴에 자동 대화 기억 활성 상태와 추출 주기를 표시하고, `openViking.memory` 기본값(`true`, `true`, `6`)과 해제 방법을 문서에 명확히 안내했습니다.
- **OpenViking 백그라운드 VLM 요약 안정성 및 진단 보강**:
  - 백그라운드 `semantic_and_vectors` 갱신 실패를 `request-diagnostics.json`에 기록(`OV_SEMANTIC_REFRESH_FAILED`)하고, `409` 잠금 충돌 시 1회 짧은 백오프 재시도(`OV_SEMANTIC_RETRY`)를 수행합니다.
  - `saveNote` 실패 시 기존 예약 타이머를 보존하고, 상위 `index`와 하위 노트 URI 간 prefix 병합(coalescing) 및 종료 시 미완료 대기 건수 로깅(`OV_SEMANTIC_PENDING_SHUTDOWN`)을 추가했습니다.
- **경계값 방어 및 버퍼 가드 일시적 RPC 오류 재시도**:
  - `commitEveryTurns` 안전 범위 클램핑(`1`~`50`, 기본 `6`), 400+ 메시지 장시간 세션의 워터마크 기반 중복 수집 차단, 긴 세션 ID의 SHA-256 접미사 충돌 방지를 적용했습니다.
  - `buffer-check.ts`에서 일시적 RPC/IO 오류도 `[120, 250, 400]` ms 예산 안에서 재시도하고 `AbortSignal`·비복구 오류는 즉시 실패하도록 보강했습니다.

자세한 변경 내역은 [changes-0.3.14.md](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/changes-0.3.14.md)를 참고하세요.

## 검증 요약

<!-- windows-verification -->

## 설치 안내

1. 실행 중인 Ned와 개인 Zed를 모두 종료합니다.
2. `Ned-0.3.14-windows-x64.tgz`를 새 폴더에 풀고 `Ned-0.3.14-win-x64.exe`를 실행합니다.
3. 기존 설정·대화·지식과 사용자 글로벌 스킬은 그대로 유지됩니다.
