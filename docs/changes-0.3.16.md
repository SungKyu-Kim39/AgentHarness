# Ned 0.3.16 변경 사항

Ned 0.3.16은 실사용 중 확인된 `ned_host_browser_check` 워커 즉시 종료 결함을 근본 수정하고, 2차 프로젝트 전면 재검토(Goldfish Zero-Knowledge Review)에서 도출한 보안·안전 경계, 한글 Windows 호환성, 자연어 자동 라우팅, 리소스 수명 관리 및 빌드 도구 확장 항목을 일괄 반영한 릴리스입니다.

## `ned_host_browser_check` 즉시 종료(`MCP 프로세스가 종료되었습니다.`) 근본 수정

- **원인**: 설치본의 Node MCP 번들은 `resources/runtime/windows-x64/mcp/node`(상위 경로에 `node_modules` 디렉토리명 없음)에 배치되는데, [`src/main/mcp-extensions.ts`](../src/main/mcp-extensions.ts)가 워커 실행 시 `NODE_PATH`를 지정하지 않아 `@playwright/mcp/cli.js`의 형제 패키지 로딩(`require('playwright-core/lib/utilsBundle')`)이 `MODULE_NOT_FOUND`로 즉시 종료되었습니다. 또한 `PATH`가 빈 문자열로 전달되어 Windows에서 Playwright·Puppeteer가 브라우저 종료 시 호출하는 `taskkill.exe` 및 `ComSpec` 실행 경로가 누락되어 있었습니다.
- **수정**:
  - [`src/main/mcp-extensions.ts`](../src/main/mcp-extensions.ts)에서 `playwright`·`devtools` 실행 환경에 `NODE_PATH: paths.node`를 명시하고, 개인 프로필 격리(`HOME`·`USERPROFILE`·`APPDATA`·`LOCALAPPDATA`·`TEMP`·`TMP`를 전용 작업 폴더로 고정)를 유지한 채 Windows `System32` 경로와 `ComSpec`·`SystemDrive`·`PATHEXT`·`ProgramFiles*`·`ProgramData` 환경 변수를 전달했습니다.
  - Python 기반 MCP 워커(`document_read`, `data_query`)와 OpenViking·Graphify·REA 실행 환경에 `PYTHONUTF8='1'`, `PYTHONIOENCODING='utf-8'`을 강제해 한글 Windows(CP949) 파이프 인코딩 오류를 차단했습니다.
  - MCP 자식 프로세스 비정상 종료 시 민감 정보(URL·경로·토큰)를 제외한 표준 오류 마커(`MODULE_NOT_FOUND`, `EACCES`, `Target closed` 등)를 `diagnostics/mcp-extensions-status.json`과 오류 메시지에 함께 남기도록 진단을 보강했습니다.
  - [`scripts/test-mcp-live.ts`](../scripts/test-mcp-live.ts)와 [`tests/mcp-boundary.test.ts`](../tests/mcp-boundary.test.ts)(Windows 업그레이드 번들 포함)가 실제 배포본과 동일한 `mcp/node` 경로 배치에서 형제 패키지 로딩과 종료 진단을 검증하도록 강화했습니다.

## 설정·마스킹·파일 원자성 및 한글 Windows 안정성 보강

- **UTF-8 BOM 설정 JSON 허용 및 가져오기 실패 사유 안내**:
  - [`src/main/config.ts`](../src/main/config.ts)의 `ConfigVault`가 Windows 메모장·PowerShell 5.1이 저장한 UTF-8 BOM(`\uFEFF`) 포함 JSON을 정상 파싱하도록 개선했습니다.
  - [`distribution/native-control.ts`](../distribution/native-control.ts)의 `prepareNative`에서 잘못된 설정 JSON 파일을 가져왔을 때 기존 암호화 설정을 보존하면서 다음 안내창에 구체적 실패 사유(`선택한 설정 JSON 가져오기 실패: ...`)를 표시합니다.
- **짧거나 플레이스홀더인 API 키의 오탐 마스킹 방지**:
  - [`src/main/config.ts`](../src/main/config.ts)의 `Redactor`가 공백 키를 무시하고, `"1"`, `"local"`, `"EMPTY"`, `"none"` 등 6자 미만 또는 플레이스홀더 문자열이 평문 도구 출력 전체를 `[REDACTED]`로 훼손하지 않도록 방어했습니다(`Redactor.object`의 키 기반 마스킹은 그대로 유지).
- **동일 파일 동시 쓰기 직렬화 및 Windows `rename` 재시도**:
  - [`src/main/config.ts`](../src/main/config.ts)의 `atomicJSON`에 파일 경로별 직렬화 큐와 Windows Defender·인덱서 잠금(`EPERM`/`EACCES`/`EBUSY`) 대응 백오프 재시도를 적용했습니다.
- **정적 분석(`graphify_analyze`·`rea_inspect`) 취소 즉시 전파**:
  - [`distribution/host-tools.ts`](../distribution/host-tools.ts)에서 대화 취소 및 권한 변경 `AbortSignal`을 `graphify`·`rea` 자식 프로세스에 즉시 연결해 불필요한 대기 없이 종료되도록 보완했습니다.

## 자연어 자동 라우팅·하위 에이전트·안전 경계 및 도구 확장

- **프로젝트(`.ned/skills`) 및 실시간 글로벌 스킬 자동 라우팅 반영**:
  - [`src/main/skills.ts`](../src/main/skills.ts)에 짧은 캐시를 둔 `activeCatalog(project?)`를 추가하고 [`src/main/skill-routing.ts`](../src/main/skill-routing.ts)·[`distribution/native-control.ts`](../distribution/native-control.ts)와 연결해, 앱 재시작 없이 새로 추가한 글로벌 스킬과 현재 프로젝트의 `.ned/skills/<id>/SKILL.md`가 자연어 자동 스킬 라우팅에서도 즉시 탐색·주입되도록 개선했습니다.
- **하위 에이전트(`spawn_subagent`)의 전문 도구 문맥 정합성 확보**:
  - [`distribution/subagents.ts`](../distribution/subagents.ts)의 `scope()`가 하위 에이전트 고유의 `title`·`prompt` 문맥(`contextText`)을 호스트 도구 게이트에 전달해, 부모 대화 턴이 넘어간 뒤에도 리버싱 조사 하위 에이전트가 할당받은 `rea_ghidra`·`rea_inspect`를 정상 호출할 수 있습니다.
- **외부 읽기 민감 경로 및 프로젝트 내부 설정 쓰기 보호 강화**:
  - [`distribution/host-tools.ts`](../distribution/host-tools.ts)의 `ExternalRead` 차단 목록에 `.ssh`, `.aws`, `.gnupg`, `.kube`, `.docker`, `.npmrc`, `.pypirc`, `.netrc`, `.git-credentials`, `Ned-Launcher`, 구 `L-Vibe` 및 개인 `opencode` 경로를 추가했습니다.
  - [`src/main/files.ts`](../src/main/files.ts)의 쓰기 보호 대상에 `.ned`와 `.vscode`를 추가해 모델이 프로젝트 스킬·에디터 실행 구성을 임의로 변조하지 못하게 차단했습니다(`.ned/skills` 읽기는 유지).
- **Visual Studio 2022(`17.x`) MSBuild 지원 및 리소스 정리**:
  - [`distribution/vs-build.ts`](../distribution/vs-build.ts)의 `vswhere` 탐색 범위를 `[15.0,18.0)`으로 넓혀 기존 VS2017/2019에 더해 **Visual Studio 2022** MSBuild까지 지원합니다.
  - [`distribution/python-projects.ts`](../distribution/python-projects.ts)의 완료된 작업 메모리 상한(64건), [`distribution/ned/zed-history.ts`](../distribution/ned/zed-history.ts)의 임시 `zed-source.db` 정리, [`scripts/ned-package.mjs`](../scripts/ned-package.mjs)의 로컬·릴리스 문서 패키징 구성을 정비했습니다.

## 추가 전면 재검토 보완 반영 (0.3.16 rebuild1)

동일 0.3.16 버전(검증된 소스 빌드 편집기 `Ned-editor-0.3.16.exe` 유지)에서 코드베이스 전체를 2회 추가 재검토해 확인한 결함과 경계 보완 사항을 모두 반영했습니다.

- **로컬 브라우저 검증(`browser_check`) IPv6 루프백 지원 및 DevTools 오류 진단 보강**:
  - [`src/main/browser-proxy.ts`](../src/main/browser-proxy.ts)에서 `http://[::1]:포트` 대상을 허용(내부 예약 포트 차단 유지)하고, Vite·Next.js 등이 IPv6 루프백(`::1`)에만 바인딩된 환경에서 `http://localhost:포트` 요청이 `127.0.0.1` 연결 거부(`ECONNREFUSED`)를 만나면 외부 DNS 조회 없이 `::1` IP 리터럴로 자동 폴백합니다.
  - [`scripts/mcp-node-worker.cjs`](../scripts/mcp-node-worker.cjs)(릴리스 런타임 manifest 반영 포함)의 호스트 해석 예외 목록에 `::1`을 추가하고, DevTools 워커 동적 `import()` 실패 시 민감 경로를 제외한 `error.code`/`error.name`을 표준 오류 마커로 기록합니다.
- **모델 설정 선택·옵션 병합 정확도 보강**:
  - [`src/shared/contracts.ts`](../src/shared/contracts.ts)에서 `providers` 스키마와 `defaultModel`을 함께 사용할 때 내부 인덱스 접미사(`[1]`, `[2]`) 없이 표시명·`providerID/modelKey`·고유 모델명으로 정확히 매칭하고, 없는 모델명이나 선택 모델에 없는 최상위 `defaultVariant`를 검증 단계에서 거부합니다.
  - [`distribution/ned/zed-models.ts`](../distribution/ned/zed-models.ts)에서 기본 Zed Agent 요청 전달 시 모델 기본 옵션을 먼저 펼치고 요청 본문 파라미터(`temperature`, `max_tokens`, 중첩 `chat_template_kwargs` 등)가 우선 적용되도록 순서를 바로잡았습니다.
- **개인화 대화 기억 종료 보존·Compaction opt-out 유지·회상 마스킹**:
  - [`src/main/session-memory.ts`](../src/main/session-memory.ts)와 [`distribution/native-control.ts`](../distribution/native-control.ts)에서 5턴 이하 짧은 세션으로 앱을 닫을 때 OpenViking 종료 직전에 비동기 `/commit`을 던지고 `uncommittedTurns`를 지워버리지 않고 디스크에 보존한 뒤, 다음 실행에서 OpenViking이 `ready` 상태가 되면 `flushPendingCommits()`로 안전하게 커밋합니다.
  - 대화가 길어져 Compaction으로 초기 메시지가 치환된 이후에도 `memory-sync.json`에 기록된 활성 세션의 `sessionOptedOut` 상태를 확인해 회상을 계속 차단하며, `formatRecalledMemories`가 OpenViking에서 불러온 프로필·초록 본문에도 `scrubMemoryText`를 적용해 잔존 시크릿이 프롬프트에 유입되지 않도록 막습니다.
- **고위험 셸 가드·읽기 전용 Git 필터·승인 일관성 및 한글 MSBuild 보강**:
  - [`distribution/host-tools.ts`](../distribution/host-tools.ts)의 `isHighRiskShellCommand`가 PowerShell 스크립트 블록(`& { ... }`, `{ ... }`), 중첩 `$(...)`, 공백 없는 `cmd /c"..."`, `:`/`=` 결합 PowerShell 옵션(`-ec:...`)과 전원·예약 작업 제어 명령(`shutdown`, `Restart-Computer`, `Stop-Computer`, `logoff`, `schtasks`, `*-ScheduledTask`)까지 전체 권한 모드에서 명시적 승인 대상으로 잡도록 강화했습니다.
  - [`src/main/files.ts`](../src/main/files.ts)와 [`distribution/git-tools.ts`](../distribution/git-tools.ts)에서 `ProjectFiles.resolve`의 `ENOENT` 허용(`allowMissing`)과 쓰기 보호를 분리해, 읽기 전용 `git_inspect`가 `.vscode/settings.json`·`.ned/skills/...` 같은 프로젝트 설정·스킬 파일 경로 필터를 정상 조회할 수 있게 수정했습니다(`.git` 메타데이터 필터는 차단 유지).
  - [`distribution/ned/main.ts`](../distribution/ned/main.ts)·[`distribution/ned/owner.ts`](../distribution/ned/owner.ts)·[`distribution/native-control.ts`](../distribution/native-control.ts)에서 `approved-projects.json`에 저장된 프로젝트는 재시작 후 중복 승인창을 띄우지 않고, 트레이 `"프로젝트 폴더 열기"`는 편집기 전달 전 선승인(실패 시 원복)으로 경합을 없애며, `"모든 자동 승인 해제 · 승인 요청으로 전환"` 선택 시에는 프로젝트 승인 캐시까지 함께 초기화합니다.
  - [`distribution/vs-build.ts`](../distribution/vs-build.ts)에서 `MSBuild.exe`에 `/utf8output`과 `StringDecoder('utf8')`을 적용해 한글 Windows 빌드 로그 깨짐을 방지했습니다.
- **설치기 잠금 사전 검사·통합 터미널 작업 등록·자원 수명 및 진단 정리**:
  - [`distribution/ned/installer.nsi`](../distribution/ned/installer.nsi)가 업데이트 시 기존 `resources`를 지우기 전에 실행 중인 `Ned.exe`·`Zed.exe`·`opencode-cli.exe`·번들 `python.exe` 파일 잠금을 `CreateFileW`로 먼저 확인해 실행 중이면 기존 설치를 훼손하지 않고 한국어 안내창과 함께 중단하며, 남은 영문 오류 안내도 한국어로 통일했습니다.
  - [`distribution/ned/profile.ts`](../distribution/ned/profile.ts)의 `prepareEditor()`에서 누락되어 있던 `ensureTerminalTasks(data)` 호출을 연결해 Windows Zed 작업 목록에 `Ned: PowerShell`과 `Ned: CMD`가 정상 등록되도록 수정했습니다.
  - [`distribution/desktop-tools.ts`](../distribution/desktop-tools.ts)(프로젝트 전환 시 비참조 관찰 세션 자동 재시작 및 `discard` 단일 소유권), [`distribution/rea-ghidra.ts`](../distribution/rea-ghidra.ts)(취소·오류 이중 `dispose` 방지), [`src/main/openviking-errors.ts`](../src/main/openviking-errors.ts)(짧은/플레이스홀더 키 진단 오마스킹 방지), [`src/main/openviking.ts`](../src/main/openviking.ts)(비정상 종료 잔여 `runtime-*.json` 정리), [`src/main/skills.ts`](../src/main/skills.ts)(무프로젝트 `read()` 실시간 글로벌 폴백 및 서로게이트 쌍 경계 보정), [`distribution/ned/agent.ts`](../distribution/ned/agent.ts)(세션 추적 상한 64건), [`distribution/ned/zed-history.ts`](../distribution/ned/zed-history.ts)(임시 SQLite `-wal`/`-shm` 정리)를 일괄 정비했습니다.
