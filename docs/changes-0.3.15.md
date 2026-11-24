# Ned 0.3.15 변경 사항

Ned 0.3.15는 프로젝트 전면 재검토에서 확인한 보안·안전 경계, 장시간 세션 안정성, 자연어 자동 도구 연결 일관성, 트레이 실시간 상태 표시 및 문서 최신화를 반영한 릴리스입니다.

## 안전 경계 및 호스트 제어 보강

- **대용량 `propose_edit`·`knowledge_index` 승인 대화상자 무음 거절 해소**:
  - [`distribution/host-tools.ts`](../distribution/host-tools.ts)에서 `propose_edit`의 변경 전·후 미리보기(각 12,000자)와 `knowledge_index`의 본문 미리보기(20,000자)를 바이트 수·SHA-256과 함께 안전하게 절단해, 호스트 승인창의 60,000자 상한 때문에 약 30~60 KB 이상 파일 요청이 대화상자 없이 거절되던 문제를 수정했습니다.
- **전체 권한 모드 고위험 셸 가드(`isHighRiskShellCommand`) 우회 차단**:
  - [`distribution/host-tools.ts`](../distribution/host-tools.ts)에서 중첩 셸(`cmd /c`, `powershell -Command`), 인코딩/스크립트 실행(`-EncodedCommand`, `-File`), 동적 평가(`iex`, `Invoke-Expression`), 위험한 프로세스 실행(`Start-Process`/`saps`/`start`의 셸·고위험 대상), PowerShell 약어 옵션(`-Rec`, `-Fo`, `-Path`/`-LiteralPath` 접두사), `New-Object Net.WebClient`/`WebRequest` 변형을 모두 고위험 명령으로 감지해 명시적 승인을 요구합니다.
  - 일반 중첩 조회 명령(`cmd /c dir /b`, `powershell -Command "Get-Date"`)은 계속 정상 명령으로 허용하며, 중복 조건식을 정리했습니다.
- **세션별 분석 자식 프로세스 격리**:
  - [`distribution/host-tools.ts`](../distribution/host-tools.ts)의 `graphify_analyze`·`rea_inspect` 자식 프로세스를 세션 단위로 추적해, 한 대화를 취소해도 다른 세션의 정적 분석 작업이 함께 종료되지 않도록 수정했습니다.

## 자연어 자동 도구 연결 및 장시간 세션 안정성 개선

- **슬래시 스킬(`/skill-...`) 및 후속 턴의 전문 도구 노출·실행 일치**:
  - [`distribution/ned/agent.ts`](../distribution/ned/agent.ts)에서 `/skill-<ID>` 호출 시 스킬명과 모든 텍스트 블록을 호스트 `turn/text`에 함께 전달해, 게이트웨이(`hideUnrequestedTools`)와 호스트(`toolRequested`)의 판정이 어긋나던 문제를 수정했습니다.
  - [`src/main/skill-routing.ts`](../src/main/skill-routing.ts)와 [`distribution/native-control.ts`](../distribution/native-control.ts)가 최근 2개 사용자 턴 문맥을 동일하게 검사하도록 맞춰, 데스크톱·리버싱 작업 중 짧은 후속 지시("응, 공학용으로 바꿔서 계속해")에서도 전문 도구가 유지되도록 개선했습니다.
- **600메시지 초과 장시간 세션 기억 수집 복구 및 누적 상태 파일 회전**:
  - [`distribution/native-control.ts`](../distribution/native-control.ts)의 `fetchAllSessionMessages`가 페이지네이션 커서 요청에도 `order=asc`를 유지하고 최대 50페이지(5,000메시지)까지 중복 없이 조회하도록 수정했습니다.
  - [`src/main/session-memory.ts`](../src/main/session-memory.ts)에서 `watermarkCreatedAt` 비교를 엄격한 `<`로 보정해 동일 밀리초 경계 메시지 누락을 방지하고, 커밋 완료된 과거 세션이 500개를 넘으면 오래된 항목부터 자동 정리합니다.
  - [`distribution/subagents.ts`](../distribution/subagents.ts)에서 `subagents.json`이 2,000건에 도달하면 종료된 오래된 작업 기록을 최신 1,000건으로 자동 회전해 장기 사용 시 하위 에이전트 실행이 영구 차단되지 않도록 개선했습니다.
- **트레이 자동 대화 기억 상태 실시간 반영**:
  - [`distribution/ned/main.ts`](../distribution/ned/main.ts)에서 OpenViking 상태 변경(`onKnowledgeChange`)에 맞춰 트레이 메뉴의 자동 대화 기억 표시(`준비 중` / `켜짐` / `오류` / `꺼짐`)를 실시간으로 갱신합니다.

## 릴리스 정책 중앙화 및 안내 문서 최신화

- **버전 정책 단일화**: [`scripts/release-policy.mjs`](../scripts/release-policy.mjs)를 도입해 빌드·패키징·감사·게시 스크립트 6종에 흩어져 있던 하드코딩 버전 배열을 통합했습니다.
- **링크 없는 자연어 자동 도구 연결 소개·안내·상세 문서 신설**: [`docs/ned-auto-routing-guide.md`](ned-auto-routing-guide.md)를 추가해 반입 TGZ(`AUTO_ROUTING_GUIDE.md`)와 트레이 `사용 안내` 메뉴에 포함했습니다.
- **기존 안내 문서 전면 최신화**: `README.md`, `docs/ned-introduction.md`, `docs/ned-vs-zed.md`, `docs/ned-user-guide.md`, `docs/offline-setup.md`, `docs/approval-modes.md`, `docs/requirements.md`, `docs/ned-architecture.md`의 과거 버전 기준 문구와 구 지식 정책 설명을 0.3.15 기준으로 동기화하고 `scripts/verify-current-docs.mjs` 검증 범위를 확대했습니다.
