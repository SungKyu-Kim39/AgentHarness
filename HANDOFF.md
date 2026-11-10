# L-Vibe 작업 인계 — 다른 PC에서 이어가기

작성 기준: 2026-11-10 UTC. 이 문서는 **개발 작업 인계서**다. 직원용 설치 안내는 [docs/offline-setup.md](docs/offline-setup.md)를 따른다.

## 1. 먼저 알아야 할 현재 상태

| 항목 | 상태 |
|---|---|
| 최종 제품명 | **L-Vibe**. 이전 명칭 LIG Agent/L-Harness로 되돌리지 않는다 |
| 개발 방향 | 공식 **OpenCode Desktop 기반 배포판**. 독립 Electron UI를 새로 만드는 초기 방향은 폐기했다 |
| 저장소 / 브랜치 | https://github.com/SungKyu-Kim39/AgentHarness / **work** |
| MCP 통합의 마지막 구현 커밋 | **a5dd07a572845a65940e7c9f592f49f2ce57fcae** |
| 소스 버전 | **0.2.2** |
| 실제 공개된 설치 파일 | **0.2.1 EXE/TGZ**. 새 MCP 6종이 포함되지 않는다 |
| 0.2.2 EXE/TGZ | **아직 생성·발행하지 않았다** |
| 바로 다음 작업 | 고정 Windows 브라우저 확보 → 완성된 MCP 번들 검증 → EXE 생성·실제 내용 검사 → TGZ 생성·게시 |
| 출시 수용 | `releaseReady: false`. Windows/사내 모델 수용 및 일부 기능이 남아 있다 |

다음 작업자는 [MCP 검증 기록](docs/mcp-validation.md), [0.2.2 검증 상태](docs/validation-0.2.2.md), [출시 차단 항목](distribution/readiness.json)을 먼저 읽는다. 이 문서 이후 추가 커밋이 있을 수 있으므로 현재 `work`의 로그도 확인한다.

**새 환경 재개 기록:** 원격 개발 소스, Bun/Node, Windows OpenViking·REA·MCP staging 및 Linux 회귀 검증 환경을 복원했다. 설치 검증 자동화를 보강한 뒤 `npm run verify` **48개 통과, 실패/건너뜀 0**을 재현했다. 현재 환경은 `storage.googleapis.com`과 `api.github.com`의 정책 403 때문에 브라우저 및 Desktop 의존성 설치가 막혀 있다. 두 호스트 허용 후 §8을 재개한다. 0.2.2 EXE/TGZ는 계속 미생성이다.

**후속 진행:** 검증된 기존 Ghostty/CLI 캐시에 `desktop-dependencies.py`를 다시 적용해 공식 Desktop 타입 검사 **2개 프로젝트·2,549개 파일 오류 0**과 main/preload/renderer 빌드를 통과했다. Windows Electron **44.9.1** 및 NSIS **3.0.4.1**도 확보했다. 사용자가 두 도메인 추가를 알린 뒤에도 이 채팅의 실행 환경은 `spec_revision: 1`, `observed_spec_revision: 1`, `allowed_hosts: []`였고 두 URL 모두 CONNECT 403이었다. 설정 수정과 현재 실행 환경에 대한 적용을 구분해 확인해야 한다. 현재 패키징에 남은 다운로드 차단은 고정 Chrome이며, 이 파일은 캐시에 없다.

### 이어받는 AI에게 붙여 넣을 요청

> 이 저장소의 HANDOFF.md를 먼저 읽고 L-Vibe 작업을 이어가라. work 브랜치를 사용한다. 마지막 구현 기준은 a5dd07a이며 소스는 0.2.2, 공개 설치본은 0.2.1이다. MCP 6종 소스의 Linux 실호출과 45개 회귀 검사는 통과했지만 0.2.2 EXE/TGZ는 없다. 현재 다음 목표는 Windows 브라우저 번들을 확보해 오프라인 설치 EXE/TGZ를 완성하고 실제 파일·해시를 확인해 게시하는 것이다. 새 PC에 없는 캐시·테스트 런타임부터 확인하고, 기존 잠금 버전을 유지하라. 직원 PC에서 추가 설치나 다운로드하게 만들지 말라. 실제 키·사용자 데이터·캐시는 공개 저장소에 넣지 말고, 단계별 커밋·푸시를 계속하라. 완료된 항목을 처음부터 다시 구현하지 말고, 확인되지 않은 설치·수용·게시 결과를 완료했다고 말하지 말라.

## 2. 사용자가 확정한 요구사항과 작업 방식

- Windows 10/11 x64, 일반 사용자 설치, 폐쇄망 사용, 지정한 사내 OpenAI 호환 API에 연결한다. 앱은 바이브 코딩에 특화한다.
- 직원 설치 흐름은 **TGZ 반입 → 압축 해제 → EXE 설치 → 설정 JSON 편집 → 실행**이다. 직원 PC에서 npm/pip/uvx/Bun 설치·git clone·브라우저/LSP 최초 다운로드를 요구하지 않는다.
- 기존 PC의 OpenCode·Zed·개인 플러그인·개인 설정을 읽거나 복제하지 않는다. 앱 전용 엔진·설정·데이터를 사용한다.
- LIG 로고는 `assets/lig-icon.png`, `assets/lig-icon.ico`에 반영했다. 화면 조작용 Agent Desktop과 임의 서드파티 실행형 플러그인은 기본 범위가 아니다.
- 모델 설정은 OpenCode의 `providers → settings / models` 형식을 따른다. 여러 API 주소·키·LLM을 등록하고 선택한다. `APIKey` 표기도 인식하며 임베딩 모델은 `openViking.embedding` **한 개**다. 예제는 [agent-config.example.json](agent-config.example.json)에 있다. 실제 키를 이 파일에 커밋하지 않는다.
- OpenViking은 앱과 함께 시작·종료하고, 기본 스킬 34개를 로컬 OpenViking skills에 자동 등록한다. 변경 없는 재실행의 중복 색인과 사용자 편집본 덮어쓰기를 막는다. 개인 대화는 자동 업로드하지 않는다.
- REA는 사용자가 확인한 **Reverse Engineer Anything / morluto/rea**다. Graphify도 기본 포함한다. Aegis·Conductor는 검토한 지침/호스트 어댑터로 사용한다.
- 프로젝트 안의 읽기·검색은 자동, 수정·명령은 승인한다. MCP로 우회해 수정하거나 개인 설정으로 승인 정책을 덮어쓸 수 없어야 한다. 일반 명령 실행은 아직 차단되어 있다.
- 사용자는 중간 커밋·푸시를 요청했고 **“해당 공개 저장소에 계속 푸시 승인”**이라고 명시했다. 대상은 위 공개 저장소의 `work`다. 실제 API 키·사용자 데이터·개발 캐시는 전송 대상에서 제외한다. 새 PC의 GitHub 인증은 그 PC에서 준비한다.
- 불필요한 재확인을 반복하지 않고 독립적인 작업은 계속한다. 검증은 OS·버전/해시·endpoint 종류·명령·관찰 결과를 남기며, 합성 서버나 Linux 성공을 Windows 수용 완료로 표현하지 않는다.

원래 요구사항과 방향 전환 근거는 [요구사항](docs/requirements.md), [아키텍처](docs/architecture.md), [구현 계획](docs/implementation-plan.md)에 있다. 과거 문서의 초기 상태와 최신 구현이 다르면 위의 최신 검증 기록과 실제 코드를 함께 확인한다.

## 3. 구현되어 있는 것

### 기존 0.2.1 기반

공식 Desktop/엔진, 네이티브 모델 선택·키 보호·프로젝트 범위·수정 승인·충돌 검사·호스트 스냅샷을 연결했다. OpenViking 지식 색인/검색, Graphify의 로컬 AST, REA의 제한된 정적 분석, Aegis·Conductor 지침, 오프라인 스킬 34개와 OpenViking 자동 등록을 포함한다.

기본 스킬에는 계획·TDD·디버깅·검증·리뷰·보안·C++·레거시 개선·프런트엔드·접근성·API/DB·데이터 분석·통계·A/B 테스트·세션 인계 등이 있다. 정확한 목록은 [스킬 manifest](vendor/skills/manifest.json), 출처·선정 근거는 [조사 보고서](docs/offline-extensions-research.md)에 있다. 온라인 스킬 설치 지침과 실행 스크립트를 그대로 기본 활성화하지 않는다.

### 0.2.2 소스에 추가한 MCP 6종

| MCP | 고정 구성 | 외부에 노출한 범위 |
|---|---|---|
| Serena | serena-agent 2.1.0 + clangd 23.1.0 | C/C++ 심볼 개요·정의·참조. 복사본·통제된 컴파일 DB. REPL/편집/activation/dashboard/사용 통계 제외 |
| Git | mcp-server-git 2026.11.4 + MinGit 2.56.0.windows.4 | 정리한 저장소 복사본의 status/diff/log/show. 원본 config·hooks·외부 object 연결 제외. index 기준 추적 파일 보완 |
| Playwright | @playwright/mcp 0.0.85 | 승인한 로컬 HTTP 개발 페이지의 접근성 스냅샷·콘솔·스크린샷 |
| MarkItDown | markitdown-mcp 0.0.1a8 / core 0.1.9 | 선택한 로컬 PDF/Office/텍스트의 Markdown 변환. 편집·웹 URI·클라우드·OCR 제외 |
| Chrome DevTools | chrome-devtools-mcp 1.12.0 | 로컬 스냅샷·콘솔·스크린샷, 선택 시 재탐색 및 5초 성능 trace. CrUX/업데이트/통계 제외 |
| DuckDB Local | mcp-server-motherduck 1.1.0 / DuckDB 1.5.6 | 선택 CSV/TSV/Parquet/로컬 DB 복사본의 단일 SELECT. MotherDuck/S3/HTTP/확장/DB 전환/쓰기 제외 |

6개 원본 서버를 실제 실행하는 어댑터다. 엔진에는 호스트 도구 `semantic_symbols`, `git_inspect`, `document_read`, `data_query`, `browser_check`로 노출한다. 브라우저 backend 2개를 한 도구에서 선택하므로 새 도구 이름 수는 5개다.

브라우저 범위는 localhost/127.0.0.1의 명시적 HTTP 포트 한 개다. 전용 프로필·호스트 프록시를 사용하며 다른 origin, 앱 내부 API 포트, POST, CONNECT, WebSocket을 차단한다. 클릭·입력·임의 JavaScript·파일 업로드·개인 브라우저 연결을 제공하지 않는다. 사내 일반 웹사이트/HTTPS 자동화까지 구현했다고 표현하지 않는다.

Serena의 통계 호출과 `shell=True`를 제거했다. clangd의 redirect-only VFS와 전용 TEMP의 디스크 PCH를 유지한다. DuckDB는 SELECT 문장 분류·허용 파일·외부 접근 차단·설정 잠금·예산을 함께 적용한다. Windows MSVC DLL과 pywin32 경로를 준비했다. Python 감사 훅만으로 네이티브 I/O 전체를 sandbox했다고 가정하지 않는다.

상세 경계와 제한은 [MCP 연동 명세](docs/mcp-integration-plan.md)에 있다. MCP는 호출 시 시작하고 호출 후 종료한다. OpenViking은 앱 동반 서비스다. MCP 종료가 불명확하면 새 실행을 차단하고, 한 서비스 종료 실패가 다른 서비스 정리를 건너뛰지 않도록 보완했다.

## 4. 검증 결과와 아직 안 된 것

마지막 검증 환경은 **Debian 13 x86_64 / Node 24.22.1 / Bun 1.4.4 / Python 3.12 / Chromium 156.0.8078.79**다.

- `npm run verify`: **45개 통과, 실패/건너뜀 0**, 기본 스킬 34개 무결성 및 Desktop overlay 검사 통과.
- 공식 Desktop 타입 검사: 2개 프로젝트·2,549개 파일, 오류 없음. main/preload/renderer 빌드 성공.
- `scripts/test-mcp-live.ts`: 6종 실제 호출. Office/PDF·데이터 파일·C++ 정의/참조·컴파일 DB·외부 헤더 차단·브라우저/성능·승인 거부·포트 차단·자식 종료 검사 통과.
- Windows staging 파일 **20,726개** 해시 대조. 현재 manifest는 **미완성**이며 누락은 `browser/chrome-win64/chrome.exe`다.
- 미완성 manifest SHA-256: `88ca8f878d662d1f1d0c4b85625c47836e191b710f49116b63ff1da21d154457`. 브라우저를 포함해 다시 만들면 값이 바뀌어야 한다. 이 값을 완성 설치본의 값으로 재사용하지 않는다.

아직 필요한 작업:

1. Windows 브라우저 포함 전체 번들 및 **0.2.2 실제 EXE/TGZ** 생성·검사·게시.
2. Windows 10/11 일반 사용자 설치·첫 실행·업데이트·ACL·DPAPI·DLL 로딩·경로·Job Object 자식 종료·DNS/TCP 관찰.
3. 실제 사내 Qwen/임베딩 서버와 실제 C/C++ 프로젝트·SDK의 수용 검사.
4. 새 Desktop의 반복 감지 → 중지 확인 → 수동 도구 없는 재출력 이관, 세션 전체 스냅샷 diff UI, 일반 명령 승인·프로세스 종료 정책 등.

일반 테스트에는 OpenCode 1.19.5 원형의 반복/재출력 검사도 있다. 이를 공식 Desktop v2 기능 완료로 계산하지 않는다. `distribution/readiness.json`을 근거 없이 true로 바꾸지 않는다.

## 5. 다른 PC로 가져오기

### 소스만 먼저 받기

아래는 Linux/WSL의 Bash 예시다. Windows PowerShell이면 환경 변수 문법을 해당 셸에 맞춘다. 기존 대용량 EXE/TGZ를 자동 다운로드하지 않으려면 Git LFS smudge를 생략한다.

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone --branch work --single-branch https://github.com/SungKyu-Kim39/AgentHarness.git
cd AgentHarness
git status --short
git log -5 --oneline
git merge-base --is-ancestor a5dd07a572845a65940e7c9f592f49f2ce57fcae HEAD
```

실제 공개 설치본이 필요할 때만 Git LFS를 준비하고 다음을 실행한다.

```sh
git lfs install --local
git lfs pull --include='downloads/L-Vibe-0.2.1-*'
```

일반 GitHub 소스 ZIP이나 LFS 미다운로드 clone의 EXE/TGZ 파일은 작은 pointer일 수 있다. 실제 파일 크기·옆의 `.sha256`과 대조한다. [다운로드 안내](downloads/README.md)를 사용한다. 지금까지 설치본은 **work/downloads의 Git LFS**로 게시했다. GitHub Releases에 새 버전이 있다고 가정하지 않는다.

이미 clone된 폴더도 브랜치 이름만 믿지 말고 실제 커밋을 확인한다. 이 관리형 환경의 초기 `work`는 `1947a47`이었고 LICENSE만 있었다. 로컬 변경이 없는 것을 확인한 뒤 다음으로 원격 개발 소스를 복원했다.

```sh
git status --short
GIT_LFS_SKIP_SMUDGE=1 git fetch origin work:refs/remotes/origin/work
GIT_LFS_SKIP_SMUDGE=1 git merge --ff-only origin/work
```

### Git에 없는 항목

| 경로 | 내용 / 새 PC에서 할 일 |
|---|---|
| `.cache/` | 원본 archive, 생성한 Desktop 소스, 의존성, 빌드 도구, Linux 테스트 환경, 검사 로그. 다시 준비해야 한다 |
| `vendor/runtime/` | 실제 Windows/Linux 런타임. 잠금 파일과 bundle 스크립트로 다시 구성한다 |
| `vendor/sources/` | 초기 원형/원본 검토 소스. 원형 회귀 검사에 필요하면 `vendor:fetch`로 준비한다 |
| `node_modules/` | `npm ci`로 준비한다 |
| `release/` | 로컬 빌드/설치본. 소스 clone에 포함되지 않는다 |
| `.cache/packaged-runtime-audit.json` | 실제 패키지 검사 결과. 새 설치본에서 새로 검증해 작성한다 |

현재 환경에서 `.cache`는 약 10 GB, `vendor/runtime`은 약 2.4 GB, `release/desktop`은 약 3.9 GB다. 크기는 참고값이다. 소스를 clone했다고 이 파일들이 준비되지는 않는다.

이동 시간을 줄이려면 공개 원본의 다운로드 archive와 검증된 staging 런타임만 별도 반출할 수 있다. 가져온 뒤 잠금 해시를 다시 검사한다. `.cache` 전체·개인 프로필·사용자 DB·평문 키를 무차별 복사하지 않는다. Python 가상환경과 `node_modules`는 플랫폼/절대 경로에 묶일 수 있으므로 새 PC에서 재생성하는 것을 기본으로 한다.

Windows의 암호화된 `%APPDATA%\L-Vibe` 설정은 다른 PC/사용자에서 복호화가 보장되지 않는다. 필요한 실제 설정은 GitHub가 아닌 안전한 경로로 관리하고 앱의 명시적 JSON 가져오기를 사용한다. 개발 인계에 사용자 대화 DB는 필요하지 않다.

## 6. 빌드 환경 복구

### 검증된 방향과 버전

현재 스크립트/통합 검사는 Linux 경로를 사용한다. 다른 Windows PC에서는 **WSL2/Linux를 빌드용으로, Windows 10/11 VM/PC를 실행 수용용으로** 구분하는 것이 현재 검증 환경과 가깝다. Windows 네이티브/macOS의 빈 환경 전체 빌드는 확인하지 않았다.

| 구성 | 기준 |
|---|---|
| OpenCode Desktop/CLI | v2.2.6, `dc2ffcf8bf26f9e669b6aa22b95f50e12be15e06` |
| Desktop Electron | **44.9.1**. 루트의 45.2.3은 초기 원형 의존성이므로 혼동하지 않는다 |
| 빌드 도구 | Node 24, Bun **1.4.4**, Python 3.12, pip/packaging, Git, tar/gzip, NSIS/7-Zip 도구 |
| Windows Python | 3.12.16, python-build-standalone의 고정 archive |
| OpenViking / Graphify / REA | 0.5.4 / 0.9.105 / 6.8.0 |
| 기타 잠금 | `upstream-lock.json`, `desktop-runtime-lock.json`, `python-runtime-lock.json`, `rea-runtime-lock.json`, `skills-lock.json`, `mcp-runtime-lock.json`, `mcp-node-lock.json` |

다음은 **인터넷이 허용된 빌드 PC에서의 복구 순서**다. 빈 PC에서 모든 단계를 한 번에 자동 복원한 검증은 아직 없다. 실패하면 단계별로 원인을 해결하되 버전·해시를 임의로 완화하거나 최신 버전으로 바꾸지 않는다.

```sh
# 관리형 환경에서 사용자 홈에 쓸 수 없으면 빌드 캐시만 작업 폴더로 지정한다.
export npm_config_cache="$PWD/.cache/npm"
export ELECTRON_CACHE="$PWD/.cache/electron"
export ELECTRON_BUILDER_CACHE="$PWD/.cache/electron-builder"
export BUN_INSTALL_CACHE_DIR="$PWD/.cache/bun"
export UV_CACHE_DIR="$PWD/.cache/uv"
# Node 24의 fetch가 관리형 환경의 기본 프록시를 사용하게 한다.
export NODE_USE_ENV_PROXY=1
npm ci

# Linux x64에서 스크립트의 기본 Bun 경로를 준비하는 예시
npm install --prefix .cache/build-tools --no-save --ignore-scripts --package-lock=false @oven/bun-linux-x64@1.4.4
export L_VIBE_BUN="$(pwd)/.cache/build-tools/node_modules/@oven/bun-linux-x64/bin/bun"
"$L_VIBE_BUN" --version

npm run desktop:prepare
(
  cd .cache/l-vibe-desktop/source
  "$L_VIBE_BUN" install --frozen-lockfile
)
python3 scripts/desktop-dependencies.py

python3 -m pip install packaging
npm run bundle:python
npm run bundle:rea
npm run bundle:mcp
npm run skills:verify
```

다른 플랫폼에서는 맞는 Bun 바이너리를 준비해 절대 경로 `L_VIBE_BUN`으로 지정한다. `desktop-dependencies.py`는 고정 CLI·Windows native prebuild·Ghostty를 준비하는 스크립트이며 **Bun workspace 의존성 전체 설치를 대신하지 않는다**. workspace 설치의 GitHub API/native postinstall 문제가 생기면 현재 네트워크 정책과 해당 원본을 확인한다. helper가 준비한 파일이 설치 과정에서 교체되면 다시 helper를 실행하고 잠금/변경을 검토한다.

`vendor/skills`와 `distribution/methodology`는 추적 파일이므로 보통 재생성이 필요 없다. 손상 여부를 먼저 검사한다. 원형 1.19.5 테스트 리소스가 없으면 `npm run vendor:fetch`가 필요할 수 있지만 이것을 새 Desktop 엔진으로 사용하지 않는다.

`bundle-mcp.py resolve`는 잠금 파일 재해결 작업이다. 단순 인계·복구에는 실행하지 않고 기존 lock으로 `fetch`한다. uv는 잠금 재생성이 필요한 경우에만 준비한다. 정상 다운로드를 한 단계씩 완료하고 `git diff`에서 잠금 파일 변화의 이유를 확인한다.

### 생성 소스 수정 주의

`.cache/l-vibe-desktop/source`는 생성물이다. 수정은 `distribution/` 및 `src/main` 등의 원본 overlay에 한다. `desktop:prepare`는 stale 상태에서 생성 소스를 교체하고 `out/dist`도 지울 수 있다. **빌드·패키징 실행 중에는 prepare를 병행하지 않는다.** 런타임 manifest/worker가 바뀌면 `bundle-mcp.py refresh` 또는 필요한 `fetch` 후 prepare → 검사 → build를 순서대로 실행한다. refresh는 빠진 런타임을 완성해 주는 명령이 아니다.

## 7. 테스트 환경과 재검증

일반 검사:

```sh
npm run verify
```

**건너뜀 수를 반드시 확인한다.** 새 PC에서 아래 경로가 없으면 실제 연동 검사가 skip될 수 있다. exit 0만으로 이전의 45개 전체 통과를 재현했다고 말하지 않는다.

- `.cache/openviking/env-linux/bin/python3`: OpenViking/Graphify Linux 검증 환경. Python 3.12 venv에 OpenViking 0.5.4와 `graphifyy[mcp]==0.9.105`를 준비한다.
- `.cache/l-vibe-desktop/source/packages/cli/dist/cli-linux-x64-baseline/bin/opencode`: 고정 v2 CLI. desktop-dependencies helper가 준비한다.
- `vendor/runtime/linux-x64/opencode`, `vendor/sources/`: 초기 원형 실제 엔진/방법론 검사에 쓰인다.
- `vendor/runtime/windows-x64/rea/`: REA 정적 분석 검사에 필요하다.

새 MCP 실호출 검사는 일반 `npm test`와 별도다. [scripts/test-mcp-live.ts](scripts/test-mcp-live.ts)의 고정 경로를 먼저 확인한다.

| 경로 | 필요한 Linux 테스트 구성 |
|---|---|
| `.cache/mcp-linux/serena` | Python 3.12 venv, `serena-agent==2.1.0` |
| `.cache/mcp-linux/git` | Python 3.12 venv, `mcp-server-git==2026.11.4` |
| `.cache/mcp-linux/markitdown` | Python 3.12 venv, 선택한 MarkItDown 0.1.9 변환 extras와 MCP wrapper 0.0.1a8. fixture 작성용 openpyxl/python-pptx도 필요 |
| `.cache/mcp-linux/duckdb` | Python 3.12 venv, `mcp-server-motherduck==1.1.0` |
| `.cache/mcp-linux/clangd/clangd_23.1.0/bin/clangd` | 공식 Linux clangd 23.1.0 ZIP 해제 후 실행 권한 |
| `.cache/mcp-node/node_modules` | `mcp-node-lock.json` 기준 Node MCP. bundle 스크립트가 준비한다 |
| `/usr/bin/git`, `/usr/bin/ps` | 테스트용 실제 OS 명령 |
| `/usr/lib/chromium/chromium` | 빌드 PC의 테스트 브라우저. 새 PC 경로가 다르면 테스트의 paths만 조정한다 |

Linux 테스트 venv 설치는 빌드 PC에만 한다. Windows wheel lock을 Linux에 그대로 설치하거나 Linux venv를 직원 Windows에 복사하지 않는다. MCP별 venv를 합쳐 SDK 의존성을 충돌시키지 않는다. Linux 전이 의존성 전체 freeze는 현재 소스에 별도 보존되어 있지 않으므로 새 환경의 버전과 실제 검사 결과를 기록한다. 원본 MarkItDown wrapper의 전체 extras를 무심코 Windows 번들에 추가하지 않는다.

Linux 테스트 환경을 새로 만드는 예시다. `python3.12`가 준비되어 있어야 하며 별도의 테스트 데이터나 사내 키는 필요하지 않다.

```sh
python3.12 -m venv .cache/openviking/env-linux
.cache/openviking/env-linux/bin/python -m pip install 'openviking==0.5.4' 'graphifyy[mcp]==0.9.105'

for service in serena git markitdown duckdb; do
  python3.12 -m venv ".cache/mcp-linux/$service"
done
.cache/mcp-linux/serena/bin/python -m pip install 'serena-agent==2.1.0'
.cache/mcp-linux/git/bin/python -m pip install 'mcp-server-git==2026.11.4'
.cache/mcp-linux/duckdb/bin/python -m pip install 'mcp-server-motherduck==1.1.0'
.cache/mcp-linux/markitdown/bin/python -m pip install 'markitdown[pdf,docx,pptx,xlsx,xls]==0.1.9' 'mcp==2.3.0' uvicorn requests
.cache/mcp-linux/markitdown/bin/python -m pip install --no-deps 'markitdown-mcp==0.0.1a8'
```

clangd Linux 파일은 `https://github.com/clangd/clangd/releases/download/23.1.0/clangd-linux-23.1.0.zip`이다. `.cache/mcp-linux/clangd/` 아래에 ZIP 내부 폴더를 유지해 풀고 `bin/clangd`에 실행 권한을 준다. 테스트 Chromium/Git/ps는 해당 빌드 PC의 정상 패키지 관리 절차로 준비한다. 새 환경의 설치·브라우저 실행 문제는 실제 오류를 확인해 해결한다.

```sh
npm run test:mcp:live
# 필요한 단계만 다시 확인할 때
npm run test:mcp:live -- files
npm run test:mcp:live -- semantic
npm run test:mcp:live -- browser
```

이 스크립트는 단계에 관계없이 공통 Office/데이터 fixture를 먼저 만들므로 MarkItDown·DuckDB venv도 준비되어야 한다. Linux 컨테이너용 `testNoSandbox`를 Windows 제품 기본값으로 옮기지 않는다. 시스템 브라우저를 테스트에 쓴 사실을 직원 PC의 개인 브라우저 재사용 기능으로 바꾸지 않는다.

공식 Desktop 검사와 빌드:

```sh
# 루트에서 L_VIBE_BUN 절대 경로를 이미 설정한 경우
(
  cd .cache/l-vibe-desktop/source/packages/desktop
  PATH="$(dirname "$L_VIBE_BUN"):$PATH" "$L_VIBE_BUN" run typecheck
)
npm run build
```

라이브 테스트는 합성 로컬 endpoint를 사용한다. 실제 사내 키나 실제 프로젝트 비밀을 fixture에 넣지 않는다. 이전 기준 로그는 `.cache/mcp-final-verify.log`, `.cache/mcp-final-desktop-types.log`, `.cache/mcp-final-desktop-build.log`에 있지만 Git으로 이동하지 않는다. 결과 요약은 위 검증 문서에 커밋되어 있다.

## 8. 현재 차단 사항과 0.2.2 패키징 재개

현재 관리형 빌드 실행기의 공식 Chrome 다운로드는 정책 HTTP 403으로 차단되었다. 이 문서 작성 시에도 허용 호스트에 `storage.googleapis.com`가 없었다. **다른 PC까지 차단된다는 뜻은 아니다.** 새 PC에서 정상적인 네트워크 정책과 접근 가능 여부를 먼저 확인한다. 정책 거부가 있으면 해당 환경의 허용 도메인을 변경하고, 우회 프록시나 직원 PC 다운로드로 대체하지 않는다.

새 환경 복구에서도 Chrome의 `storage.googleapis.com`과 Bun이 고정 Ghostty archive를 요청하는 `api.github.com` 모두 CONNECT HTTP 403을 확인했다. 사용자의 도메인 추가 알림 뒤에도 현재 실행 환경의 revision 1과 빈 추가 허용 목록은 그대로였다. Desktop workspace의 `bun install --frozen-lockfile`은 후자에서 중단됐지만, 이미 검증된 로컬 archive를 `desktop-dependencies.py`로 복원해 공식 Desktop 타입 검사/빌드를 완료했다. 빈 캐시에서 workspace 설치가 성공했다고 취급하거나 기존 lock을 바꾸지 않는다. Chrome 허용 후 아래 순서를 실행하면 MCP lock 변경으로 생성 소스가 갱신되므로 build도 다시 수행한다.

고정 Windows 파일:

```text
https://storage.googleapis.com/chrome-for-testing-public/157.0.8103.50/win64/chrome-win64.zip
```

확보 후 순서:

```sh
npm run bundle:mcp
npm run mcp:verify
npm run desktop:prepare
npm run verify
npm run build
npm run package:win
npm run audit:installer
```

새 브라우저 archive 해시와 완성 manifest가 lock에 기록되어야 한다. 이전 미완성 manifest와 값이 다른 것을 확인하고 실제 파일·라이선스·DLL을 검사한다. 최종 source/lock 변경은 커밋·푸시한다. 실패한 해시에 맞춰 기준값을 임의로 바꾸거나 `complete`를 직접 true로 바꾸지 않는다.

EXE 예상 위치:

```text
release/desktop/L-Vibe-0.2.2-win-x64.exe
.cache/l-vibe-desktop/source/packages/desktop/dist/win-unpacked/
```

NSIS/7-Zip 의존성은 빌드 PC에서 확보한다. 현재 커스텀 NSIS 패키징은 Wine에서 Windows 설치 stub를 실행하는 방식이 아니다. 이전 패키징에는 약 10분이 걸린 사례가 있으며 실패/완료를 실제 종료 코드와 파일로 확인한다.

### EXE 검사를 끝낸 뒤 TGZ 생성

1. `7zz t` 또는 동등한 도구로 EXE archive를 검사한다. 실제 EXE에서 리소스를 추출해 OpenViking/Python·REA·스킬·**새 MCP 전체**를 각 고정 manifest와 대조한다. staging 검사만으로 EXE 내부 검사라고 기록하지 않는다.
2. `npm run audit:installer`가 EXE를 실행하지 않고 archive 검사·추출 후 앱 버전/AMD64, OpenViking·REA·MCP·34개 스킬의 manifest/파일 해시, 고정 Windows CLI, 설정 예제를 검사하고 `.cache/packaged-runtime-audit.json`을 만든다. 검사 로그는 `.cache/installer-test.log`, `.cache/installer-extract.log`다. TGZ 생성은 이 audit의 실제 EXE 크기/SHA-256, 앱 ASAR/실행 파일, 모든 런타임 manifest와 CLI를 현재 파일에 다시 대조한다. 다른 EXE나 staging 검증 기록을 재사용하지 않는다. 자동화의 회귀 검사는 통과했지만 **0.2.2 실제 EXE에 대한 실행은 EXE 생성 후 수행해야 한다.**
3. `scripts/offline-bundle.mjs`는 정식 생성 소스인 `.cache/l-vibe-desktop/source/LICENSE`를 사용하며 `upstream-lock.json`의 원본 해시와 일치할 때만 복사한다. 예전 `.cache/opencode-desktop/source`는 설치 번들 생성에 필요하지 않다. 일반 회귀 검사의 원본 fixture로는 계속 사용한다.
4. [docs/validation-0.2.2.md](docs/validation-0.2.2.md)에 실제 OS·명령·EXE 크기/SHA·리소스 검사 결과를 갱신하고 커밋한다. 기존 source/lock 변경도 모두 커밋되어 있어야 한다. bundle 스크립트는 tracked 파일 변경이 남으면 거부한다.
5. 다음을 실행하고 archive 내용·해시·설정 예제·라이선스·대응 소스를 확인한다.

```sh
npm run bundle:offline
```

출력은 `release/desktop/L-Vibe-0.2.2-windows-x64.tgz`와 `.sha256`이다. 설치 EXE를 생성했다는 사실만으로 TGZ 생성·GitHub 게시·Windows 실행까지 완료했다고 말하지 않는다. Windows 수용 전 배포한다면 검증 후보임을 명시하고 `releaseReady: false`를 유지한다.

## 9. 게시·커밋·인증

소스 작업은 단계별로 커밋하고 `git push origin HEAD:work`한 뒤 `git ls-remote origin refs/heads/work`와 로컬 SHA를 대조한다. 공유 저장소이므로 새 PC에서 먼저 다른 작업자의 변경을 확인하고 강제 푸시로 덮어쓰지 않는다.

EXE/TGZ는 검증 후 `downloads/`에 넣고 Git LFS로 올린다. 로컬 Git LFS filter가 준비되지 않았던 환경에서는 다음 형태를 사용했다.

```sh
git -c 'filter.lfs.clean=git-lfs clean -- %f' -c filter.lfs.required=true add downloads/L-Vibe-0.2.2-win-x64.exe downloads/L-Vibe-0.2.2-windows-x64.tgz
# .sha256·다운로드 안내·검증 보고서도 실제 값으로 갱신해 추가한다.
```

LFS object 업로드가 성공한 뒤 source ref를 push한다. 보통 `git lfs install --local` 후 정상 Git pre-push hook을 쓰거나, 필요한 경우 `git lfs push --object-id origin <EXE의 SHA256> <TGZ의 SHA256>`를 사용한다. 토큰을 명령·문서에 직접 넣지 않는다. 게시 뒤 실제 링크의 대상·파일 크기·해시를 확인하고 새 다운로드 링크를 안내한다. GitHub Releases를 새로 쓰려면 실제 release/asset 생성과 검증을 별도로 수행한다.

이전 0.2.1 참고값:

| 파일 | bytes | SHA-256 |
|---|---:|---|
| `L-Vibe-0.2.1-win-x64.exe` | 647049461 | `5da6867a77147e48ef8e3bdef1ac7cc13522f383e79624e069b808f40f577b37` |
| `L-Vibe-0.2.1-windows-x64.tgz` | 715095280 | `fdf3ff92b340766a38d7cbcc58152cc08cab892f3b3d7e2e5d195cbcc5e04df8` |

## 10. 코드와 문서 찾기

| 목적 | 파일 |
|---|---|
| Desktop 원본 적용·준비·빌드 | [distribution/patches.mjs](distribution/patches.mjs), [scripts/desktop.mjs](scripts/desktop.mjs) |
| 앱 전용 엔진·모델·시작/종료 | [distribution/native-control.ts](distribution/native-control.ts), [distribution/native-startup.ts](distribution/native-startup.ts) |
| 승인·프로젝트 호스트 MCP | [distribution/host-tools.ts](distribution/host-tools.ts), [src/main/files.ts](src/main/files.ts) |
| 6종 MCP 어댑터·stdio·프록시 | [src/main/mcp-extensions.ts](src/main/mcp-extensions.ts), [src/main/mcp-client.ts](src/main/mcp-client.ts), [src/main/browser-proxy.ts](src/main/browser-proxy.ts) |
| 통제된 원본 worker·Windows Job | [scripts/mcp-python-worker.py](scripts/mcp-python-worker.py), [scripts/mcp-node-worker.cjs](scripts/mcp-node-worker.cjs), [scripts/sidecar-supervisor.py](scripts/sidecar-supervisor.py) |
| OpenViking·스킬 등록 | [src/main/openviking.ts](src/main/openviking.ts), [src/main/openviking-skills.ts](src/main/openviking-skills.ts), [src/main/skills.ts](src/main/skills.ts) |
| 키·모델 설정 | [src/main/config.ts](src/main/config.ts), [src/shared/contracts.ts](src/shared/contracts.ts), [src/main/model-gateway.ts](src/main/model-gateway.ts) |
| Windows 런타임 확보 | [scripts/bundle-python.py](scripts/bundle-python.py), [scripts/bundle-rea.py](scripts/bundle-rea.py), [scripts/bundle-mcp.py](scripts/bundle-mcp.py) |
| 설치·TGZ | [distribution/native-pack.ts](distribution/native-pack.ts), [distribution/windows-installer.nsi](distribution/windows-installer.nsi), [scripts/offline-bundle.mjs](scripts/offline-bundle.mjs) |
| Windows 수용 | [docs/windows-acceptance.md](docs/windows-acceptance.md), [docs/upstream-audit.md](docs/upstream-audit.md) |

주요 이력: `419197c` = 0.2.1 설치본 게시, `588bcf4` = MCP 잠금/stdio 기반, `9809159` = 6종 연동, `a5dd07a` = 종료 실패 보완 및 최종 0.2.2 소스 검증. 최초 독립 UI 원형과 1.19.5 실행기를 제품의 현재 기반으로 되돌리지 않는다.
