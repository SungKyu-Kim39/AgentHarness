# Ned 0.4.0 rebuild4 검증

Linux에서 TypeScript(`npm run typecheck`), NSIS 무경고 컴파일(`tests/ned-installer.test.mjs`)과 82건의 단위·통합 회귀 테스트(`tests/ned-040-features.test.ts`, `tests/skill-routing.test.ts`, `tests/session-memory.test.ts`, `tests/native-runtime.test.ts`, `tests/subagents.test.ts`, `tests/patch-file.test.ts`, `tests/delete-file.test.ts`, `tests/core.test.ts`, `tests/openviking-diagnostics.test.ts`)를 통과했습니다. 정적 HTTP 프리뷰의 심볼릭 링크·민감 파일(`.env`, `.git`, `.ned`)·원시 경로 이탈(`../`, `%2e%2e`) 차단과 Python 미설치 동작, OpenViking 0.5.5 Phase 1/2 실패·`skipped`·`not_found`·종료 직전 연결 해제 시 `/commit` 미발사, 컴팩션 프롬프트 건너뛰기 및 비-REA 전문 도구 취소·재연결 이어하기, `applyBatch` 크래시 복구 저널·시작 시 진단 노출·승인 거절 시 체크포인트 미생성을 확인했습니다.

Windows Server의 기준은 공개 0.4.0 rebuild3입니다. 설치 검증에는 `resources`는 복구됐지만 `Ned.exe`와 최상위 Electron 런타임 파일(`ffmpeg.dll`)이 `.ned-upgrade-backup`에 남은 부분 복구 분할 상태에서 잠금 차단 시 백업이 보존되고, 잠금 해제 후 같은 경로에서 재시도해 정상 업그레이드·사용자 데이터 보존이 완료되는 시나리오를 포함합니다. 직원 PC의 실제 Windows 10·11 GUI와 사내 모델·임베딩·PyPI 미러·망 차단은 별도의 현장 수용 항목입니다.
