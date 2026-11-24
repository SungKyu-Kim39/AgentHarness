# Ned 0.3.16 검증 기록

Ned 0.3.16의 Linux 단위·라이브 브라우저 테스트, 문서 일관성 검사, Windows Server 설치·업데이트 검증 및 남은 사내 Windows 10/11 PC 수용 검사 범위를 구분해 기록합니다.

## Linux 단위·라이브 검사

- `npm run typecheck`: TypeScript 전체 검사 통과.
- `node scripts/verify-current-docs.mjs`: 버전(`0.3.16`), 번들 스킬 수(`74`) 문서 동기화 및 `docs/ned-auto-routing-guide.md` 무링크 검사 통과.
- 라이브 Chrome 브라우저 검증: 배포본과 동일한 `mcp/node`(`node_modules` 상위 폴더 없음) 배치에서 `browser_check`(`playwright` 및 `devtools` 백엔드 모두) 실행 시 스냅샷·콘솔 오류·PNG 스크린샷(6개 콘텐츠 항목) 정상 반환 확인.
- 대상 단위 테스트 통과:
  - `tests/mcp-boundary.test.ts` & `tests/mcp-client.test.ts`: `mcp/node` 배치에서 형제 패키지(`playwright-core/lib/utilsBundle`) 정상 로딩 및 비정상 종료 시 마스킹된 진단 마커(`MODULE_NOT_FOUND`) 기록 검증(Windows 설치 업그레이드 번들에 포함).
  - `tests/core.test.ts`: UTF-8 BOM 설정 JSON 가져오기, 짧은/플레이스홀더 API 키 평문 오탐 방지, `atomicJSON` 동시 쓰기 직렬화, `.ned`·`.vscode` 쓰기 차단 및 `.ned/skills` 읽기 허용 검증.
  - `tests/external-read.test.ts`: 전체 권한 모드에서 `.ssh`·`Ned-Launcher`·`L-Vibe` 외부 읽기 차단 검증.
  - `tests/subagents.test.ts`: 하위 에이전트 `scope()`의 `contextText` 전달을 통한 `rea_ghidra` 전문 도구 게이트 통과 및 미요청 GUI 도구 차단 검증.
  - `tests/skill-routing.test.ts` & `tests/skills.test.ts`: 재시작 없는 실시간 글로벌 스킬 및 프로젝트 `.ned/skills` 자동 라우팅 로드 검증.
  - `tests/zed-history.test.ts`: Zed 대화 가져오기 후 임시 `zed-source.db` 자동 삭제 및 기존 DB 백업(`ned-before.db`) 보존 검증.
  - `tests/native-runtime.test.ts`: 시작 설정 화면(`prepareNative`)에서 잘못된 JSON 파일 선택 시 실패 사유 표시 검증.

## 남은 사내 Windows 10/11 PC 수용 테스트

- 실제 사내 Windows 10/11 PC(Edge/Chrome 설치 환경)에서 로컬 개발 서버 대상 `ned_host_browser_check`(`playwright`·`devtools`) 실행 및 종료 확인
- Visual Studio 2022가 설치된 PC에서 `inspect_build`·`build_project` 탐색 및 빌드 실행 확인
- 사내 VLM·임베딩 서버 연결 상태에서 자연어 자동 스킬(`.ned/skills` 포함)·도구 연결 및 6턴 자동 대화 기억 추출·회상 확인
- Windows 10/11 GUI 환경에서 외부망 차단 및 전체 권한 모드 고위험 명령 승인창 표시 확인
