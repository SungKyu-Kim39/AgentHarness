# Ned 0.3.14 검증 기록

Ned 0.3.14의 Linux 단위 테스트, 문서 일관성 검사, Windows Server 설치·업데이트 검증 및 남은 사내 Windows 10/11 PC 수용 검사 범위를 구분해 기록합니다.

## Linux 단위·정적 검사

- `npm run typecheck`: TypeScript 전체 검사 통과.
- `node scripts/verify-current-docs.mjs`: 버전(`0.3.14`) 및 번들 스킬 수(`74`) 문서 동기화 통과.
- 대상 단위 테스트 통과:
  - `tests/session-memory.test.ts`: 턴·세션 opt-out 회상+수집/커밋 제외(재로드 포함), JWT·PEM·AWS·DB URL·공백 포함 비밀번호 마스킹(회상+저장 양쪽), `commitEveryTurns` 클램핑, 420메시지 워터마크 비재동기화, 긴 세션 ID SHA-256 충돌 방지.
  - `tests/openviking-diagnostics.test.ts`: 백그라운드 `semantic_and_vectors` 실패 진단 로깅(`OV_SEMANTIC_REFRESH_FAILED`), 409 1회 백오프 재시도(`OV_SEMANTIC_RETRY`), `saveNote` 실패 시 기존 타이머 보존, 상위 `index`/하위 노트 prefix 병합, `close()` 시 미완료 대기 건수 로깅(`OV_SEMANTIC_PENDING_SHUTDOWN`).
  - `tests/buffer-check.test.ts`: 일시적 RPC 오류 재시도 복구, 지속 오류 실패, 비복구 오류 및 `AbortSignal` 즉시 실패.
  - 기존 회귀 대상(`tests/openviking-gateway.test.ts`, `tests/patch-file.test.ts`, `tests/delete-file.test.ts`, `tests/permission-policy.test.ts`, `tests/session-edit-approval.test.ts`, `tests/studio-policy.test.ts`) 통과.

## 남은 사내 Windows 10/11 PC 수용 테스트

- 실제 사내 VLM·임베딩 서버 연결 상태에서 6턴 대화 후 자동 기억 추출, 다음 세션 회상, OpenViking Studio Home VLM 토큰 집계 확인
- “이건 기억하지 마” 입력 턴이 회상·저장 모두에서 제외되는지 확인
- 전체 권한 모드에서 일반 PowerShell 명령·지식 저장 무팝업 동작 및 치명적 명령 승인 팝업 확인
- Windows 10/11 GUI 환경에서 OpenViking Studio 정상 렌더링 및 외부망 차단 확인

## 설치 파일과 Windows 결과

제품 소스는 `05ef6c8747c49e478df484f9270fd105030d2074`입니다. Windows Server에 최종 EXE를 새로 설치해 42건 중 42건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.3.13에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1535028745 bytes, SHA-256 `eda81e93c9e33e689a924885801d64fbf5f806c7dce09cbea1092fe4cee78d67`입니다. 준비본과 추출본의 60118개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.3.14-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.3.14-installer-audit.json) · [반입 TGZ](../downloads/README.md)
