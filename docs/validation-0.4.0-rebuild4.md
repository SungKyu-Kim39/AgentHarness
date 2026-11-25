# Ned 0.4.0 rebuild4 검증

Linux에서 TypeScript(`npm run typecheck`), NSIS 무경고 컴파일(`tests/ned-installer.test.mjs`)과 89건의 단위·통합 회귀 테스트(`tests/skill-routing.test.ts`, `tests/ned-instructions.test.ts`, `tests/ned-names.test.ts`, `tests/ned-040-features.test.ts`, `tests/session-memory.test.ts`, `tests/native-runtime.test.ts`, `tests/subagents.test.ts`, `tests/patch-file.test.ts`, `tests/delete-file.test.ts`, `tests/core.test.ts`, `tests/openviking-diagnostics.test.ts`, `tests/release-policy.test.mjs`)를 통과했습니다. `REA` 기본 대화 모드 등록·`REA` 모드 키워드 없는 즉시 `rea_ghidra`/`rea_inspect` 허용 및 중단·재연결·하위 에이전트 유지·`Plan`/`Build` 모드 도구 차단 및 REA 전환 경고·`AgentOwner` `bind`/`session/mode` 동기화, 정적 HTTP 프리뷰의 심볼릭 링크·민감 파일(`.env`, `.git`, `.ned`)·원시 경로 이탈(`../`, `%2e%2e`) 차단과 Python 미설치 동작, OpenViking 0.5.5 Phase 1/2 실패·`skipped`·`not_found`·종료 직전 연결 해제 시 `/commit` 미발사, 컴팩션 프롬프트 건너뛰기 및 비-REA 전문 도구 취소·재연결 이어하기, `applyBatch` 크래시 복구 저널·시작 시 진단 노출·승인 거절 시 체크포인트 미생성을 확인했습니다.

Windows Server의 기준은 공개 0.4.0 rebuild3입니다. 설치본 검사 묶음에는 `skill-routing`(REA 대화 모드 및 Plan/Build 경고 포함)을 추가했고, 설치 검증에는 `resources`는 복구됐지만 `Ned.exe`와 최상위 Electron 런타임 파일(`ffmpeg.dll`)이 `.ned-upgrade-backup`에 남은 부분 복구 분할 상태에서 잠금 차단 시 백업이 보존되고, 잠금 해제 후 같은 경로에서 재시도해 정상 업그레이드·사용자 데이터 보존이 완료되는 시나리오를 포함합니다. 직원 PC의 실제 Windows 10·11 GUI(Zed 대화 모드 드롭다운에서 `Build`/`Plan`/`REA` 전환 포함)와 사내 모델·임베딩·PyPI 미러·망 차단은 별도의 현장 수용 항목입니다.

## 설치 파일과 Windows 결과

제품 소스는 `8de1cf93c30fb80e033bd75e5f80df454ee2d316`입니다. Windows Server에 최종 EXE를 새로 설치해 61건 중 61건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.0-rebuild3에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551458764 bytes, SHA-256 `fbf85591b1adbacd3bb6d3def6e12f53c012c8ef8efef21cc4fd65665aa0feaa`입니다. 준비본과 추출본의 65724개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.0-rebuild4-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.0-rebuild4-installer-audit.json) · [반입 TGZ](../downloads/README.md)
