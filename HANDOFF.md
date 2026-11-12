# Ned 개발 인계

현재 제품명은 **Ned**, 버전은 0.3.1 전환 후보이다. 사용자 목표는 비개발자를 포함한 직원에게 Zed·OpenCode·Aegis·Conductor·OpenViking·기본 도구를 한 번에 설치·설정하는 폐쇄망 프로그램을 제공하는 것이다.

## 유지해야 할 결정

- 검은 배경의 흰색 볼드 Ned 생성 아이콘: `assets/ned-icon.png`, `ned-icon.ico`.
- 편집기는 고정 Zed v1.28.1, 엔진은 OpenCode 2.2.6이다. 개인 설정을 읽지 않는다. 기본 `opencode acp`는 별도 서버를 시작하므로 사용하지 않는다.
- 모델 요청 대기는 기본 시간 제한이 없다. 사내 대기열이 길다는 사용자의 명시적 요구이다.
- 여러 LLM과 thinking·토큰 한도는 중앙 JSON, 임베딩은 한 개이다. API 키·사용자 자료·개발 캐시는 커밋하지 않는다.
- 사용자 직접 저장은 일반 IDE 동작이다. AI 쓰기·명령은 호스트 승인·범위·충돌·종료 확인을 거친다.
- 현재 `work` 브랜치의 공개 origin `SungKyu-Kim39/AgentHarness`에 중간 커밋·푸시하는 권한을 사용자가 이미 승인하였다.

## 0.3.1 작업 기록

사용자는 agent-desktop 기본 탑재와 최초 실행·OpenViking 등록·기존 자료 내보내기 실패 수정을 요청하였다. agent-desktop 1.2.0/Apache-2.0, 정적 스킬 2개를 추가하였다. 실제 Windows UI 자동화 수용은 아직 필요하다. [변경 검증](docs/validation-0.3.1.md)을 따른다.

초기 사용자 진단: Windows 10.0.19044, 기본 Ned 경로의 Zed 로그 및 Zed/CLI 파일 없음. 후속 레지스트리·파일 검사에서 Ned는 미설치이며 L-Vibe 0.2.7만 등록되어 있음을 확인했다. 새 Ned 설치가 필요하며 이 결과만으로 기존 오류창의 DLL/GPU·파일 삭제 원인을 단정하지 않는다. 종료 코드를 버리고 개인 Zed를 원인으로 단정하던 메시지와 실행 환경 누락, 설치 후 핵심 파일 검사를 보완했다. 등록 오류는 단계·코드·HTTP와 모델 상태를 남긴다. 401/500은 기존 OpenViking 서버의 내보내기 중 발생했으며 인증 선확인과 벡터 없는 내보내기를 추가했다.

로딩창은 `distribution/ned/startup-window.ts`와 `startup-view.ts`다. 전용 sandbox BrowserWindow, IPC/preload 없음, 아이콘/단계 문구만 표시하며 native dialog 중 숨긴다. 모든 모델 서비스 전에 표시한다. 실제 Chromium 렌더링으로 아이콘·문구·넘침을 확인했다. 전체 88개 검사와 추가 UI/보호 검사를 통과했다.

최종 추가: 벡터 없는 OVPack은 import API 성공 뒤에도 임베딩 큐가 진행 중이어서 검색이 비는 결함을 재현했다. `PersonalKnowledge.verifyIndex`에서 시간 제한 없는 system/wait와 검색 영역별 system/consistency를 확인한 뒤 ready로 갱신한다. 실제 벡터 재사용·재계산 양쪽을 포함한 이관 9개 검사를 통과했다. agent-desktop의 PE import 의존성 VCRUNTIME140.dll도 기존 고정 CPython DLL과 원문 고지로 함께 묶는다.

## 소스 진입점

| 경로 | 역할 |
|---|---|
| `distribution/ned/main.ts` | Ned Electron 실행기·설정 대화상자·트레이·Zed 수명 |
| `distribution/ned/agent.ts` | 공식 ACP를 기존 호스트 엔진에 연결 |
| `distribution/ned/owner.ts`, `rpc.ts` | 실행별 로컬 인증·프로젝트/세션 귀속·버퍼 확인 |
| `distribution/ned/profile.ts` | 전용 Zed 설정·프로필·편집기 HTTP 차단 프록시 |
| `distribution/ned/migration.ts` | 원본 보존·덮어쓰기 없는 L-Vibe 데이터 복사 |
| `distribution/native-control.ts` | 설정 vault·모델 게이트웨이·OpenViking·엔진 소유 |
| `distribution/host-tools.ts`, `vs-build.ts` | 수정 승인·MCP·설치된 VS2017/2019 MSBuild |
| `scripts/ned-build.mjs` | Node 호환 ACP·실행기 번들 |
| `ned-runtime-lock.json` | Zed 바이너리·원본 소스·버전·해시 |

내부 `l_vibe_host` 도구 ID와 `resources/l-vibe`는 기존 중계·번들 호환을 위해 유지한다. 공개 제품명과 신규 사용자 경로는 Ned이다. 과거 다운로드·복구 패치는 대상 L-Vibe 이름을 유지한다.

기존 safeStorage 설정에는 Electron Local State의 DPAPI 보호 키도 필요하다. 이관 시 전체 앱 소유 프로필을 보존 복사하고, 준비 프로필에서 암호화 설정을 읽지 않은 채 재실행한다. 정상 실행의 Electron userData와 vault 루트는 모두 `%APPDATA%\Ned`이다. 초기 이관 준비만 별도 Ned-Launcher 프로필을 사용한다.

## 빌드 PC와 검사

Node 24·Python 3.12와 기존 고정 Bun/OpenCode 의존성·런타임이 필요하다. `npm ci`, 기존 `desktop:prepare`와 `scripts/desktop-dependencies.py`로 고정 소스/의존성을 준비한다. Python·REA·MCP·토크나이저 런타임은 기존 고정 번들 스크립트와 manifest로 준비·검증한다. 직원 PC에는 이 작업을 요구하지 않는다.

Windows 패키지에는 `npm run ned:prepare`, `npm run package:win`, `npm run bundle:offline`을 사용한다. `ned:prepare`는 고정 Zed 아카이브를 빌드 PC에서만 다운로드·검증한다. Linux에서는 Inno Setup 6.4.3 지원 추출기가 필요하다. `ned-build-tools-lock.json`의 고정 소스(기본 upstream + 검토한 PR 197)를 CMake·Boost·LZMA로 빌드하고 `NED_INNOEXTRACT`에 절대 경로를 지정하거나 `.cache/ned/tools/innoextract-build/innoextract`에 둔다. 추출 산출물의 `app`과 `code$GetInstallDir`를 빌드 스크립트가 병합한다. 직원 PC에는 추출기나 CMake를 넣지 않는다.

`npm run build` 후 `npm run typecheck`, `npm test`를 실행한다. ACP 실제 연동은 `tests/ned.integration.test.ts`, 빌드 승인 제어는 `tests/vs-build.test.ts`에서 확인한다. 테스트에 실제 엔진 경로가 없으면 skip이므로 완료로 오인하지 않는다.

[현재 검증](docs/validation-0.3.1.md)·[Windows 수용](docs/windows-acceptance.md)·[라이선스](docs/license-policy.md)를 읽고 남은 설치·UI·실제 모델·MSBuild·DNS/TCP 검증을 이어간다. EXE 생성만으로 출시 완료 처리하지 않는다.

이전 L-Vibe 0.2.7의 상세 인계·해시·Windows 런타임 이력은 [당시 인계서](https://github.com/SungKyu-Kim39/AgentHarness/blob/31748467fcbd0639f70db923ac9d9aea8c268b9f/HANDOFF.md)와 버전별 검증 문서를 보존하여 참고한다.

## 0.3.1 최종 배포

빌드 소스: `38f174d12ef91679138a46e29be562b326e6f8d0`. 바이너리·감사·manifest 게시: `fbf2882`. [공개 릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.1), [직접 다운로드](downloads/README.md), [공개 다운로드 검사](downloads/Ned-0.3.1-public-verification.json)를 따른다. EXE는 1,176,902,415 bytes, TGZ는 1,173,624,892 bytes이다. 실제 설치기에서 ASCII 94,237개 파일/8,744개 디렉터리와 런타임·스킬 해시를 검증했고, TGZ 내부 EXE도 동일하다.

GitHub 릴리스 작성·공개는 성공했다. 현재 연결의 `uploads.github.com` 첨부 요청은 HTTP 401로 거절되어 릴리스 본문에 정상 업로드한 Git LFS 파일의 직접 다운로드 링크를 제공했다. 공개 EXE와 TGZ는 HTTP 206, 정확한 전체 크기, MZ/gzip 형식과 로컬 접두부 일치를 확인했다. 실제 Windows·사내 모델 수용은 여전히 사용자 설치 결과로 확인해야 한다.

추가로 모델 endpoint가 응답하지 않는 합성 서버를 두고 실제 OpenViking 로컬 시작을 검사했다. 약 16초 만에 ready였고 ready 전 모델 요청은 0개였다. 기본 스킬 등록은 비동기이며 편집기 시작을 막지 않는다. 임베딩/LLM 응답 대기에는 기본 제한이 없다.

## 시작 실패 후속 조사와 빈 시작 화면

사용자 0.3.1 Windows에서 405ms 후 exit 101, panic, loaderProbe passed, 앱 소유 Zed.log 없음. 공개 진단 도구 `Ned-editor-probe-1.tgz`를 사용해 current layout에서 Local/Roaming Known Folder가 0x80070003, Rust panic이 crates/paths/src/paths.rs:204:18임을 확인했다. standard USERPROFILE/AppData/Local,Roaming 구성에서는 두 API가 성공하고 private home 안으로 해석됐다. Profile Known Folder 자체는 실제 OS 프로필을 반환하므로 환경 변수만으로 모든 OS 경로가 격리됐다고 주장하지 않는다. --system-specs는 standard에서도 0xc0000005로 끝나 정상 GUI 추가 확인이 필요하다.

시작 수정 패치 1 소스는 표준 AppData 생성/환경 정렬, 강제 폴더 선택 제거, restore_on_startup launchpad, 안전한 panic 소스 위치 기록을 포함한다. `scripts/ned-startup-fix.mjs`는 기존 0.3.1 staging의 app.asar를 추출해 main만 교체하고 모든 기존 Node 의존성/고지를 유지한다. exe+asar 원본 해시를 고정하고 기존 fuse가 0임을 확인하며 어떤 fuse도 변경하지 않는다. 설치 EXE를 다시 빌드하기 전 이 작은 패치로 사용자 PC의 정상 GUI를 검증한다.

시작 수정 패치 소스 커밋은 21e0cea, 게시 커밋은 7545551이다. `downloads/Ned-startup-fix-1.tgz`는 4,219,995 bytes, SHA-256 23354b572fa7eead31df52c1cc72db67658730127ca8eaa2fdab26bd59a9cc87. 기존 app.asar SHA fb10ba3a99479c22a24dbefc40f3b83d156ad1112d0e2ab15c023b5d2660d558, 수정 SHA 43478862038e45935aa805c2f8ffaf26fe2971d2e15202c2f2521f6486c2a753. 기존 exe SHA 208c6c7754a2d95ebc053f91f4354052b3bf12b67df6aa230b1c299b1840d354. 원본 0.3.1 staging에서 실제 적용/중복/복구를 검사했고, 새 아카이브는 main.cjs 외 4,199개 파일/6개 고지 파일 바이트가 동일하다(멤버 순서는 재포장으로 바뀜). 공개 다운로드 전체 SHA도 확인했다.

사용자에게 APPLY_FIX 후 Ned 시작 화면 또는 diagnosticRevision 2 진단을 요청한 상태다. 결과 전에는 GUI 성공을 주장하지 않는다. 정상 시작 확인 후 0.3.2 전체 설치 EXE/TGZ를 만들며 현재 published 0.3.1 EXE/TGZ는 덮어쓰지 않는다. source state는 빈 시작 화면까지 구현돼 있으나 package version은 아직 0.3.1로 유지했다. small patch와 전체 설치 버전을 구분한다.

## 2026-11-12: confirmed startup and configuration auto restart

User confirmed Ned starts after startup-fix-1, then requested that successful JSON import automatically restart/apply. Implementing 0.3.2: validate/encrypt before normal WM_CLOSE to exact owned editor PID; respect save/cancel, serialize imports, wait for service shutdown, schedule one Electron relaunch. Invalid imports leave editor live. Native Windows auto-restart verification remains pending; startup success on the deployment PC is now confirmed. Preserve no-default model deadlines.

ACP follow-up: user can launch Ned but selecting Ned in New Agent Thread exits status 0. Two PowerShell Node-mode probes returned only exit 1, with no version/recognized stderr; first --eval probe may have native-argument quoting ambiguity. Do not claim a root cause yet. Actual Linux Electron (not only Node) ACP integration passed 3/3. New stdlib/bundled-Python agent-probe compares direct node, direct ACP initialize, and PowerShell ACP with bounded sanitized diagnostics, no sessions/prompts/config edits.

ACP root-cause evidence received: direct-node exit0 with version; direct-acp initialize ok/alive; PowerShell-acp exit0/not alive with 540 stdout bytes. Shell lifetime differs; do not misclassify intentional direct-probe cleanup exit1. Windows profile now uses existing bundled Python console sidecar-supervisor.py -> Electron Node ACP with fixed argv. Need deployment thread/chat confirmation after cumulative patch.

Published cumulative patch: downloads/Ned-config-restart-fix-1.tgz, 4,204,178 bytes; SHA256 6f546f125f3e7b15d023efd2e24f5d367f72c22642cf6e975036a71b7a80ba2f; updated ASAR 2759e192f297446123fbda4a130d7a1b054f856fa6566d7f60289143c3e35e78. Source e766c333513cb3ce02c2c79e4bbe8cf1b034b82a. Actual original + startup-patched archives apply/idempotence/rollback passed; archive retained all 4,253 entries, 4,199 unchanged files and six unchanged license files, only main.cjs differs. 16/16 focused tests with actual Electron Node via console supervisor passed; packaged/source sidecar-supervisor.py files are identical. Windows patch chat + automatic restart result still pending.

Full 0.3.2 packaging: pin build-start source commit; source TGZ uses the audit commit, not a moving HEAD. NED_AUDIT_DISCARD_STAGE=1 records the five comparison hashes after installer integrity passes, removes only generated win-unpacked to make extraction fit disk, then verifies extracted bytes and all component manifests. No customer data involved. Existing original baseline files preserved in .cache/ned/host-baseline-0.3.1 for small-patch reproducibility.

## Active: public tool namespace rename requested after patch confirmation

User confirmed cumulative patch 1 succeeds on Windows for (1) Ned model list/chat and (2) JSON import -> automatic restart -> new settings applied. Record evidence in downloads/Ned-config-restart-fix-1-validation.json; full Windows acceptance remains false. Then user requested every agent-visible l_vibe tool name be renamed to Ned.

Stopped own in-progress pre-rename 0.3.2 NSIS PID 106674 with TERM at ~12 min because its source was obsolete. Session 75876 exited 1 as expected; this was intentional, not a new product build defect. No 0.3.2 installer was published. Source currently uncommitted rename work: ned_host server, every host permission/tool ID, fallback provider ned_, prototype MCP ned, private Git helper ned_snapshot_tracked_paths, MCP labels/errors and skill reader text Ned. 19 adapted static skill docs and their ADAPTATION/manifest hashes updated; adapter generator updated for reproducibility. resources/ned replaces current resources/l-vibe; pure managedResource helper retains legacy resource fallback for existing installations. Persisted OpenViking account/package/source keys intentionally retain their internal legacy namespaces to preserve knowledge, without exposing legacy tool aliases. Current full build only for the rename: the published host-only patch 1 must not be regenerated with refreshed runtime/skill locks. Historical patch builders now pin original host hashes/commits and refuse new code.

MCP runtime refreshed via scripts/bundle-mcp.py refresh: 21,031 files complete. Python refresh mode added to update reviewed launchers and manifest without package installation. First command used -I and could not import build-local tokenizer_assets; corrected to normal build invocation. Refresh then found optional rea-supervisor.py source absent; corrected with the existing fetch-mode optional-file guard. Session 13514 currently running proper refresh/typecheck/build. Earlier 9/9 naming/ACP/skill focused checks passed, including real model request naming ned_host_read_file and all exposed Markdown without old branding. Need final refresh completion, full tests and live MCP verification, coherent source commit/push, then restart full 0.3.2 packaging with NED_AUDIT_DISCARD_STAGE=1, audit, bundle, artifacts/LFS push, prerelease with direct links.

Disk ~3.9GB free; original 0.3.1 baseline host saved .cache/ned/host-baseline-0.3.1. Old source-frozen pre-rename package log at .cache/ned/package-0.3.2.log (rename it before retry). Current source/app version remains 0.3.2, no public tag yet. New Windows namespace execution not yet tested; previous Windows ACP/restart is confirmed. Preserve no-default model deadlines, all private knowledge/data and existing immutable binary artifacts.

Latest user steering: add exact Speak Korean block to %APPDATA%/Ned/editor/config/AGENTS.md by default. Added editor-instructions.ts append-once/preserve-existing/refuse-symlink helper, called by prepareEditor, and same constant appended to managed engine system text. Tests being added. Runtime refresh/typecheck/build session 13514 finished successfully, 63,069 Python files; updated bundles differ only launch.py/analysis-worker.py and mcp-python-worker.py against preserved pre-rename stage. No native package files changed. Commit attempt failed because vendor/runtime is gitignored/untracked, so remove that pathspec; source scripts and top-level locks capture the changes, no force-add runtime binaries. Full naming suite running session 37248 and live MCP session 45376 started before Korean helper edits; run dedicated fresh Korean/profile/ACP tests afterward.

Latest coherent source HEAD 4c2d55e (full SHA in .cache/ned/proof-0.3.2.json), pushed, after rename commit 6bb361a. Korean directive helper now recognizes CRLF without duplication; 2/2 focused tests passed. Naming/ACP/skill checks 9/9, Korean/profile/naming checks 10/10, full suite 110/110 (644.0 sec, no skip), live MCP all phase passed. The full suite started before Korean test file existed; dedicated fresh checks cover that last change. Test runtime versions recorded in .cache/ned/proof-0.3.2.json. New full package build session 25238 active, source pinned at 4c2d55e, NSIS PID 111425. Old obsolete build was intentionally stopped; do not stop this healthy build absent real new source requirements. NED_AUDIT_DISCARD_STAGE=1 deletes generated win-unpacked only after integrity passes, retaining comparison hashes; audit extracts and verifies all runtime manifests then removes extracted temp. Source TGZ uses report.sourceCommit (not moving HEAD).

Remaining: finish package/audit, npm run bundle:offline, stage downloads EXE/TGZ via hardlinks to avoid duplicates and git LFS pointers; publish validation/hash/audit metadata, public download checks, GitHub prerelease v0.3.2 targeting full source SHA, direct LFS links (release attachment upload previously 401; do not bypass credentials). Existing 0.3.1 artifacts and both published repair TGZs immutable. New namespace needs full installer because runtime/skill hashes changed; host-only config patch is frozen. Current .cache/ned/release-notes-0.3.2.md updated with 110 tests, naming and Korean defaults. Current .cache/ned/rename-runtime-diff.json proves only mcp-python-worker.py / OpenViking launch.py + analysis-worker.py changed from previous runtime, no native packages changed. Verify ASCII TGZ and actual extracted installer. Update final current docs/downloads entry and Handoff with real artifact hashes/URLs. Preserve releaseReady false until full Win10/11/offline acceptance; earlier user's Windows ACP/restart success applies to the published cumulative patch.

## 0.3.2 artifacts ready for publication

Package/audit session 25238 completed successfully. Installer: Ned-0.3.2-win-x64.exe, 1,176,920,431 bytes, SHA256 10b104a14d7e850d2e923e679c23735686b830a582dc7ec81bc224f8de0d0458. Extracted 94,237 ASCII files / 8,743 directories; component hashes all passed; audited source 4c2d55e54bef1bdba577cda3833d1bc402e0299b. Bundle session 61501 completed, stream verification session 50024 passed: Ned-0.3.2-windows-x64.tgz 1,173,693,834 bytes, SHA256 ff4feabaa2d3d6c6c9a317bbe9cde46fc09601a502fdde841c74faed4b3703b2; 22 regular ASCII files, actual nested EXE hash equals audited EXE, source includes Korean defaults + Ned tools, CHECK_AGENT included. Generated bundle assembly directory removed after verification to free disk. Artifact files in downloads are hardlinks to release originals; do not overwrite immutable files. Metadata under downloads/Ned-0.3.2-*.json, hashes alongside. Next: LFS add/push, public ranged download verification, publish GitHub prerelease v0.3.2 targeting full source SHA with .cache/ned/release-notes-0.3.2.md, final documentation/record commit and concise Korean reply. Release attachments upload previously 401; direct Git LFS links are supported.

## Publication complete: Ned 0.3.2

Artifact commit 73235ef uploaded both LFS objects (2.4GB), pushed to work. Public unauthenticated Range downloads returned HTTP206 with exact whole sizes and MZ/gzip signatures for both files. Full remote checksums were not streamed; local whole hashes, nested installer stream hash, LFS pointer OIDs and actual installer extraction were verified. Public proof: downloads/Ned-0.3.2-public-verification.json. Prerelease v0.3.2 is public (not draft), https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.2, target source 4c2d55e54bef1bdba577cda3833d1bc402e0299b. Body has direct EXE/TGZ links; uploads.github.com attachments previously 401, so no attachment upload was retried/bypassed.

All active requests fulfilled: auto config application/relaunch + Windows ACP lifetime fix (user confirmed earlier cumulative patch); all public tool/MCP/policy/guide names Ned; resources/ned current layout with legacy data compatibility; default exact Speak Korean block at %APPDATA%/Ned/editor/config/AGENTS.md, append once, preserve existing content incl CRLF, same engine default. Full 0.3.2 EXE/TGZ built/audited/published. New full Windows execution and broad Win10/11/offline acceptance still not claimed; releaseReady remains false per 1.0 criteria. No running build/test sessions remain. Current artifact hashes/size are in the previous section and downloads metadata. Ignore the obsolete intentionally aborted pre-rename log as historical; the final build succeeded. Final response should give direct TGZ/EXE links and note close Ned/Zed before installing; existing settings/knowledge are preserved and prior patches are already included.
