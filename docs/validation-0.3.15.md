# Ned 0.3.15 검증 기록

Ned 0.3.15의 Linux 단위 테스트, 문서 일관성 검사, Windows Server 설치·업데이트 검증 및 남은 사내 Windows 10/11 PC 수용 검사 범위를 구분해 기록합니다.

## Linux 단위·정적 검사

- `npm run typecheck`: TypeScript 전체 검사 통과.
- `node scripts/verify-current-docs.mjs`: 버전(`0.3.15`), 번들 스킬 수(`74`) 문서 동기화 및 `docs/ned-auto-routing-guide.md` 무링크 검사 통과.
- 대상 단위 테스트 통과:
  - `tests/terminal.test.ts`: 중첩 셸(`cmd /c`, `powershell -Command`), `-enc`, `Start-Process`, `iex`/`Invoke-Expression`, PowerShell 축약 옵션(`-Rec -Fo`), `Net.WebClient` 고위험 차단 및 일반 중첩 조회 명령 허용 검증.
  - `tests/patch-file.test.ts`: 75 KB 대용량 `propose_edit`·`knowledge_index` 승인 미리보기 60,000자 미만 유지 및 정상 승인·적용 검증.
  - `tests/skill-routing.test.ts`: 2턴 후속 대화의 데스크톱·리버싱 도구 유지, 무관한 후속 턴 비노출, `/skill-agent-desktop-windows`·`/skill-rea-ghidra` 호스트 매칭 검증.
  - `tests/session-memory.test.ts`: 동일 밀리초 워터마크 경계 비누락 및 500세션 초과 시 오래된 커밋 완료 세션 자동 정리 검증.
  - `tests/subagents.test.ts`: 2,000건 누적 시 오래된 종료 작업 자동 회전 및 신규 하위 에이전트 실행 성공 검증.
  - `tests/release-policy.test.mjs`: `scripts/release-policy.mjs`의 `0.3.7`~`0.3.20` 및 rebuild 리비전 정책 검증.
  - 기존 회귀 대상(`tests/buffer-check.test.ts`, `tests/permission-policy.test.ts`, `tests/openviking-diagnostics.test.ts`) 통과.

## 남은 사내 Windows 10/11 PC 수용 테스트

- 실제 사내 VLM·임베딩 서버 연결 상태에서 자연어 요청별 자동 스킬·도구 연결, 6턴 대화 후 자동 기억 추출·회상 및 OpenViking Studio Home VLM 토큰 집계 확인
- 트레이 메뉴의 자동 대화 기억 상태 실시간 갱신(`준비 중` → `켜짐`, OpenViking 오류 시 `오류`) 및 `사용 안내 → 자연어 자동 도구 연결 소개·안내` 열림 확인
- 전체 권한 모드에서 일반 명령 무팝업 실행과 중첩 셸/고위험 명령 승인 팝업 확인
- Windows 10/11 GUI 환경에서 대용량 파일 `propose_edit`/`knowledge_index` 승인창 표시 및 외부망 차단 확인

## 설치 파일과 Windows 결과

제품 소스는 `0bb5233db20ba3ba9f7befe746c48143a81ffae4`입니다. Windows Server에 최종 EXE를 새로 설치해 43건 중 43건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.3.14에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1535047388 bytes, SHA-256 `921bbd9a841e2bdfddd1084c0cb03e3b8d91bfa6dcdfb7583c9bfcb0c9c3b061`입니다. 준비본과 추출본의 60122개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.3.15-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.3.15-installer-audit.json) · [반입 TGZ](../downloads/README.md)
