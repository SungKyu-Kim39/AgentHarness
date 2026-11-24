# Ned 0.3.16 rebuild1 검증

0.3.16 rebuild1은 버전 번호(0.3.16)와 검증된 소스 빌드 편집기(`Ned-editor-0.3.16.exe`, 실행 45415276793)를 그대로 유지한 채, 0.3.16 대상 2회 전면 재검토(Goldfish Zero-Knowledge Review)에서 확인한 15개 영역의 결함과 안전 경계 보완 사항을 모두 반영한 갱신 빌드입니다.

Linux 단위 테스트와 Windows Server 스모크 검증은 실제 Windows 10·11 직원 PC의 GUI, 사내 모델·임베딩 서버 수용 시험과 구분합니다. 직원 PC 확인 절차는 [Windows 확인 목록](windows-acceptance.md)을 따릅니다.

## Linux 단위 검증

- `npm run typecheck`: 통과
- `npm run skills:verify`: 통과 (74개 오프라인 스킬 검증)
- `node scripts/verify-current-docs.mjs`: 통과
- [`tests/mcp-boundary.test.ts`](../tests/mcp-boundary.test.ts): `BrowserProxy`의 IPv6 `[::1]` 대상 허용·예약 포트 차단·`localhost` -> `::1` 자동 폴백과 `mcp/node` 형제 패키지 로딩·종료 마커 진단 확인
- [`tests/zed-native.test.ts`](../tests/zed-native.test.ts): `providers` 스키마의 `defaultModel`(표시명/`providerID/modelKey`) 매칭·미일치 거부, `defaultVariant` 검증, `ZedModels` 요청 파라미터 우선순위 및 `chat_template_kwargs` 병합 확인
- [`tests/session-memory.test.ts`](../tests/session-memory.test.ts): 종료 시 미커밋 턴 디스크 보존 후 재시작 `flushPendingCommits()` 커밋, Compaction 후 영속 `sessionOptedOut` 회상 차단, `formatRecalledMemories` 시크릿 마스킹 확인
- [`tests/permission-policy.test.ts`](../tests/permission-policy.test.ts): `& { Invoke-WebRequest ... }`, 중첩 `$(...)`, `{ Remove-Item -Recurse -Force ... }`, `cmd /c"..."`, `powershell -ec:...`, `shutdown`/`Restart-Computer`/`schtasks` 고위험 셸 가드 및 `NativeRuntime.isProjectAuthorized`/`revokeProjectApprovals` 확인
- [`tests/git-tools.test.ts`](../tests/git-tools.test.ts): 읽기 전용 `git_inspect`에서 `.vscode/settings.json` 경로 필터 허용 및 `.git/config` 차단 확인
- [`tests/desktop-tools.test.ts`](../tests/desktop-tools.test.ts): 프로젝트 변경 시 비참조 관찰 세션 자동 재시작, `ref_id` 교차 프로젝트 차단, 동시 `cancel`/`discard` 단일 소유권 확인
- [`tests/openviking-diagnostics.test.ts`](../tests/openviking-diagnostics.test.ts): `sanitizeVikingDiagnostic`의 짧은/플레이스홀더 키 오마스킹 방지 및 실제 키 마스킹 확인
- [`tests/vs-build.test.ts`](../tests/vs-build.test.ts): MSBuild 호출 인자 `/utf8output` 포함 확인
- [`tests/skills.test.ts`](../tests/skills.test.ts): 무프로젝트 `OfflineSkills.read()`의 실시간 글로벌 스킬 폴백 및 32,000자 페이지 경계 UTF-16 서로게이트 쌍 보존 확인
- [`tests/ned-installer.test.mjs`](../tests/ned-installer.test.mjs): 실행 중 잠금 사전 검사(`CheckInstallNotRunning`) 및 한국어 오류 메시지가 반영된 `installer.nsi` 무경고 컴파일 확인
- [`tests/ned-host-bundle.test.mjs`](../tests/ned-host-bundle.test.mjs) 및 [`tests/release-supervisor.test.mjs`](../tests/release-supervisor.test.mjs): 호스트 번들 스모크 및 런타임 스크립트 manifest 갱신 확인

## 남은 검증 범위

- 실제 Windows 10·11 직원 PC에서 실행 중인 Ned 상태에서 업그레이드 EXE 실행 시 파일 손상 없이 종료 안내창이 뜨는지 GUI 확인
- 실제 사내 LLM·임베딩 서버와 폐쇄망(외부망 차단) 환경에서 `browser_check`(IPv4/IPv6 로컬 서버), 자동 대화 기억(짧은 세션 재시작 커밋 포함), OpenViking Studio, MSBuild 한글 출력의 최종 수용 확인 (`releaseReady: false` 유지)
