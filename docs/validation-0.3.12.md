# Ned 0.3.12 검증

0.3.12 1차 보완 작업은 확정 권한 정책(CMD/PowerShell 최소 고위험 가드, 외부 로컬 파일 읽기 승인·자동 승인, OpenViking 지식 저장·삭제 자동 승인), 승인 팝업 최상단 표시, OpenViking Studio·OpenViking 요청 상시 진단 강화, 전체 설치본 단일화에 집중합니다.

Linux 단위 테스트와 NSIS 컴파일 확인은 실제 Windows 10·11 직원 PC의 GUI, 사내 모델·임베딩 서버, 제자리 업데이트 수용 시험과 구분합니다. 직원 PC 확인 절차는 [Windows 확인 목록](windows-acceptance.md)을 따릅니다.

## Linux 단위 검증 (1차 반영)

- `npm run typecheck`: 통과
- `npm run skills:verify`: 통과 (74개 오프라인 스킬 검증)
- `node scripts/verify-current-docs.mjs`: 통과
- 호스트 esbuild 번들(`distribution/ned/main.ts`, `studio-preload.ts`) 및 `verifyBundledHost` 스모크: 통과
- Linux 전체 테스트(`npm test`): 230건 중 191건 통과, 39건 환경별 제외(Windows·Wine·고정 바이너리 연동), 실패 0건
- 대상 단위·통합 테스트:
  - [`tests/terminal.test.ts`](../tests/terminal.test.ts): 일반 개발·빌드·테스트·파이프·프로젝트 내부 정리 명령의 정상 통과와 디스크·레지스트리·시스템 경로·외부 재귀 삭제·`git push --force`·외부 네트워크 전송 등 고위험 명령 가드 검증
  - [`tests/external-read.test.ts`](../tests/external-read.test.ts): `ask`·`edits` 모드 승인창 호출, `full` 모드 자동 승인, 보호 경로(`%APPDATA%\Ned`, `skills` 포함) 사전 차단, 외부 파일 쓰기·삭제 원천 차단 검증
  - [`tests/permission-policy.test.ts`](../tests/permission-policy.test.ts): `knowledge_remember`·`knowledge_forget`의 `ask`·`edits` 모드 승인창 유지 및 `full` 모드 자동 승인 검증
  - [`tests/topmost-dialog.test.mjs`](../tests/topmost-dialog.test.mjs): 활성 모니터 중앙 `screen-saver` 최상단 소유자 창 생성·포커스·정상/예외 시 정리 검증
  - [`tests/studio-policy.test.ts`](../tests/studio-policy.test.ts)·[`tests/studio-lifecycle.test.mjs`](../tests/studio-lifecycle.test.mjs): 30초 초기 렌더 타임아웃, `STUDIO_BLOCKED_REQUEST` 구분, 차단 URL·`did-fail-load`·콘솔 오류·`#app` DOM 요약 기록 및 민감 정보 마스킹, 동일 origin `blob:` 허용 검증
  - [`tests/openviking-diagnostics.test.ts`](../tests/openviking-diagnostics.test.ts)·[`tests/openviking-gateway.test.ts`](../tests/openviking-gateway.test.ts)·[`tests/openviking-startup.test.ts`](../tests/openviking-startup.test.ts): `OV_FORBIDDEN`·`OV_TIMEOUT`·`OV_EMBEDDING`·`OV_SERVER_ERROR`·`OV_TLS` 분류, 게이트웨이 오류 코드 전달, `request-diagnostics.json` 상시 기록 및 마스킹, `ReaGhidra`의 0.3.11 잔여 팩 폴더 무시 및 번들 경로 단일화 검증
  - [`tests/ned-installer.test.mjs`](../tests/ned-installer.test.mjs): 단일화한 `distribution/ned/installer.nsi`의 NSIS 컴파일(경고 0건) 검증

## 남은 검증 범위

- 실제 사내 Windows 10·11 직원 PC에서 승인 팝업의 Zed 상단 표시, 전체 권한 PowerShell·외부 읽기·지식 저장 무팝업 동작, OpenViking Studio 렌더링 및 진단 로그(`studio-status.json`, `request-diagnostics.json`) 확인
- 실제 사내 LLM·임베딩 서버와 폐쇄망(외부망 차단) 환경에서의 최종 수용 확인 (`releaseReady: false` 유지)

## 설치 파일과 Windows 결과

제품 소스는 `38fef304308afac4c7ed85a8270b29a9d884698c`입니다. Windows Server에 최종 EXE를 새로 설치해 26건 중 26건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.3.11에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1535023457 bytes, SHA-256 `5a6c65895cf2fb79b5e260ab796685f5b6715f1ece4296ade56a70136dba3e88`입니다. 준비본과 추출본의 60120개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.3.12-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.3.12-installer-audit.json) · [반입 TGZ](../downloads/README.md)
