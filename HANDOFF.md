# Ned 개발 인계

새 PC나 Codex 세션에서 개발을 이어갈 때 확인할 정보입니다. 현재 배포 버전은 **Ned 0.3.7**입니다. Zed, 전용 OpenCode 엔진, Aegis·Conductor·OpenViking과 개발 도구를 한 번에 설치해 사내 모델로 사용하는 폐쇄망 환경을 목표로 합니다.

## 현재 배포 기준

[0.3.7 릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.7)는 공개 prerelease입니다. 소스·태그는 `448b2e648e89f6c8001c508eaf121a4fc0c2c236`, 반입 파일 커밋은 `f0e7b9b0132e46aef406657689a99e8b542b8517`입니다. 릴리스 본문의 고정 Git LFS 링크에서 파일을 받습니다.

| 파일 | 크기 | SHA-256 |
| --- | ---: | --- |
| 설치 EXE | 1,040,612,708 bytes | `9dd37851029e0afa077468e71912c33cc98b9887aaae030d199080ce9f9d4b1b` |
| 반입 TGZ | 1,169,734,854 bytes | `8365eae5018d6a801d838a8d74e5169a40de18a1c5ab70a857a966d12c89680a` |

공개 EXE·TGZ와 체크섬·메타데이터 여덟 개를 인증 없이 전체 다운로드해 크기·해시를 대조했습니다. 릴리스 페이지 HTTP 200과 두 링크도 확인했습니다. [다운로드 안내](downloads/README.md), [공개 검증](downloads/Ned-0.3.7-public-verification.json), [릴리스 상태](downloads/Ned-0.3.7-release-state.json)에 기록이 있습니다.

`main`은 검증한 배포 기준, `work`는 개발 브랜치입니다. 사용자는 이 공개 저장소 `SungKyu-Kim39/AgentHarness`에 작업 단위 커밋·푸시와 배포 기준의 main 반영을 승인했습니다. 새 세션에서는 원격 두 브랜치와 로컬 변경부터 확인하고 이력을 보존해 진행합니다. 이미 게시한 EXE·TGZ·태그는 덮어쓰지 않습니다.

## 구현에서 유지할 사항

- 편집기는 Zed v1.28.1, 엔진은 OpenCode 2.2.6입니다. 개인 Zed·OpenCode 설정을 읽거나 기존 엔진에 연결하지 않습니다. 별도 서버를 만드는 기본 `opencode acp`도 사용하지 않습니다.
- 모델 요청은 기본 시간 제한 없이 기다립니다. 서버 대기열이 길다는 사용자 요구를 반영한 정책입니다. 서비스 준비·종료 확인 시간과 모델 생성 대기는 구분합니다.
- 중앙 JSON에는 여러 LLM과 thinking·토큰 한도를 등록하며 임베딩은 한 개만 지정합니다. 실제 키·사용자 자료·개발 캐시는 커밋하지 않습니다.
- 사용자 직접 편집·저장은 일반 IDE 동작입니다. AI 쓰기는 호스트 권한, 프로젝트 범위, 외부 변경, 미저장 버퍼와 스냅샷을 확인합니다. 고정 명령과 자식 프로세스 종료도 호스트가 관리합니다.
- `ask`·`edits`·`full`은 `permissions.json`에 별도로 저장합니다. 전체 권한에서도 충돌·버퍼·범위·중지 확인을 유지합니다. 임시 대화·프로젝트 허용과 지속 권한을 혼동하지 않습니다.
- 새 도구는 `ned_host_*`, 리소스는 `resources/ned`를 사용합니다. 과거 대화와 OpenViking 내부 namespace는 자료 보존을 위해 유지합니다. 옛 패치 이름과 대상 경로도 바꾸지 않습니다.
- 실행기·설치기·트레이는 `assets/ned-icon.png`와 `ned-icon.ico`를 씁니다. 번들 Zed는 아이콘 리소스만 교체하며 실행 코드·공급자 버전 정보는 보존합니다.

## 코드 위치

| 경로 | 담당 기능 |
| --- | --- |
| `distribution/ned/main.ts` | 실행기, 설정 창, 트레이, 편집기 실행·종료 |
| `distribution/ned/agent.ts` | ACP와 기존 호스트 엔진 연결 |
| `distribution/ned/owner.ts`, `rpc.ts` | 로컬 인증, 세션·프로젝트 연결, 편집 버퍼 확인 |
| `distribution/ned/profile.ts` | 전용 Zed 설정·프로필과 HTTP 차단 프록시 |
| `distribution/ned/editor-preferences.ts` | JSONC 설정·주석·글꼴·배치 보존 |
| `distribution/ned/migration.ts` | L-Vibe 원본을 보존하는 데이터 복사 |
| `distribution/ned/startup-window.ts`, `startup-view.ts` | Ned 아이콘과 준비 단계를 보여 주는 시작 창 |
| `distribution/native-control.ts` | 설정 저장소, 모델 게이트웨이, 엔진·OpenViking 관리 |
| `distribution/host-tools.ts`, `vs-build.ts` | 도구 중계, 수정 승인과 VS2017/2019 MSBuild |
| `src/main/skills.ts`, `skill-routing.ts` | 스킬 무결성, 긴 문서 읽기, 문맥별 지침 선택 |
| `src/main/runtime-pins.ts` | 원본·최적화 런타임 manifest 고정값 검사 |
| `scripts/ned-build.mjs` | 호스트와 Node 호환 ACP 번들 |
| `scripts/ned-package.mjs`, `ned-release.mjs` | 설치기·반입 묶음 생성과 감사 |
| `scripts/optimize-runtime.py` | 검토한 SDK의 무손실 ZIP 배치 |

루트 `AGENTS.md`와 `.agents/skills/`는 Ned를 개발하는 Codex 지침입니다. 제품에 포함하는 `skills/`, `vendor/skills/`, 루트 `skills-lock.json`과 구분합니다. 개발 스킬은 ECC의 inherit-legacy-style·change-impact·mcp-dependency-review와 Matt Pocock의 diagnosing-bugs·codebase-design·code-review 여섯 개입니다. 출처와 원문·라이선스·해시는 [.agents/README.md](.agents/README.md)에 있습니다.

## 0.3.7에서 바뀐 배포 구성

기본 스킬 30개를 더해 66개가 됐습니다. Modern Web Guidance는 AI 모델 다운로드 문서 다섯 개를 제외한 웹 문서 204개를 고정했습니다. 요청과 최근 대화에서 최대 세 후보를 불러오고, 모델이 실제 목적과 프로젝트 결과를 보고 선택을 조정합니다. 별도 분류 모델은 호출하지 않습니다. context·output 여유가 적으면 엔진의 선택 지침과 `read_skill`을 쓰고, 압축·도구 없는 재출력에는 작업 지침을 넣지 않습니다.

설치 최적화는 0.3.6-rebuild1 EXE의 고정 런타임을 재사용합니다. 기준 SHA-256은 `4ee7e8809c1a838e593c3654e99b1f37715fb625216290b7d89613463ea52252`입니다. SDK 139개·37,876개 소스를 모든 바이트가 같은 ZIP으로 묶고, 원본 `.py`가 있는 bytecode 캐시만 제거했습니다. 실행에 불필요한 대응 소스 다섯 개는 TGZ의 `source/`로 옮겼습니다. 네이티브·자산·경로 의존 패키지는 유지합니다.

준비 결과는 `release-runtime-lock.json`에 고정합니다. MCP와 데스크톱의 검사도 정확히 대응하는 원본·최적화 manifest만 허용합니다. 호스트·ACP는 소스에서 다시 빌드하고 호스트 ASAR에는 사용하지 않는 의존성을 넣지 않습니다. 빌드 의존성은 `scripts/prepare-acp.mjs`와 `scripts/acp-build/package-lock.json`으로 따로 준비합니다.

Windows 비교에서는 LZMA가 용량은 줄였지만 설치를 54,182ms에서 90,792ms로 늦춰 채택하지 않았습니다. 최종 zlib는 같은 실행기의 기준 50,497ms에서 38,935ms로 줄었습니다. 설치 파일 수는 94,237개에서 55,926개, 논리 크기는 3,375,883,034에서 3,024,551,545 bytes로 줄었습니다. 실험과 최종 결과는 [0.3.7 검증 기록](docs/validation-0.3.7.md)에 있습니다.

## 빌드 PC 준비

직원 PC에는 아래 작업을 요구하지 않습니다. 빌드 PC에서 Node 24, Python 3.12, 고정 OpenCode 소스와 Windows 런타임·도구를 준비합니다. source와 런타임의 실제 크기·SHA-256은 각 lock 파일과 대조해야 합니다.

```bash
npm ci
npm run ned:prepare:acp
npm run build
npm run typecheck
npm run skills:verify
```

ACP 준비에는 `ned-acp-lock.json`과 일치하는 OpenCode 소스가 먼저 있어야 합니다. helper는 고정 파일 192개와 별도 npm lock을 검사합니다. 전체 upstream Bun 개발 환경과 직원용 런타임은 별도 구성입니다.

Cloud Linux에서 전체 검사를 실행할 때는 NSIS가 쓸 수 있는 캐시를 지정합니다.

```bash
export ELECTRON_BUILDER_CACHE="$PWD/.cache/ned/builder-cache"
npm test
```

0.3.7 재현은 기존 EXE의 LFS 실파일을 준비한 뒤 다음 순서로 진행합니다. 작은 LFS pointer를 EXE로 사용하면 안 됩니다.

```bash
npm run ned:release:prepare
# 새 release-runtime-lock.json을 검토하고 빌드 입력을 커밋합니다.
npm run ned:release
npm run bundle:offline
```

`ned:release:prepare`는 기준 런타임을 추출·최적화해 lock을 만들고, `ned:release`는 검토한 준비본을 확인한 뒤 호스트·ACP와 설치기를 생성합니다. 버전이나 기준 런타임을 바꾸면 해당 고정값과 검사도 다시 검토해야 합니다. `NED_VERBOSE_INSTALLER=1`로 상세 압축 로그를 남길 수 있습니다.

새 Zed 원본을 직접 준비하는 경로는 `npm run ned:prepare`입니다. Linux에서는 Inno Setup 6.4.3을 지원하는 추출기가 필요합니다. `ned-build-tools-lock.json`의 고정 소스와 검토한 PR 197을 CMake·Boost·LZMA로 빌드하고 `NED_INNOEXTRACT`에 경로를 지정하거나 `.cache/ned/tools/innoextract-build/innoextract`에 둡니다. 빌드 스크립트가 추출본의 `app`과 `code$GetInstallDir`를 합칩니다. 직원 배포본에는 추출기와 CMake를 넣지 않습니다.

## 검증 결과를 읽는 기준

0.3.7 전체 Linux 검사는 147개 중 132 통과·15 제외·실패 0이었습니다. 이후 전송·라우팅·스킬 집중 검사 21개, 런타임 해시·경계 검사 11개도 통과했습니다. 제외된 구형 런타임·Wine·네이티브 검사를 통과로 합산하지 않습니다. 실제 엔진 경로가 없는 연동 테스트의 skip 여부도 확인해야 합니다.

실제 EXE에서 추출한 앱 파일 55,925개를 준비본과 전부 대조했습니다. Windows Server [실행 43542694638](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/43542694638)에서는 새 폴더 생성, 자료 폴더 설치 거절, OpenViking·토크나이저 7종·Node 로딩을 확인했습니다. 공개 다운로드는 원격 전체 바이트와 해시를 확인했습니다.

아직 필요한 검사는 직원 PC의 Win10·Win11 GUI, 실제 사내 Qwen·BGE 대기열과 응답, VS2017/2019 빌드·취소, C++ SDK, OpenViking 등록·실제 자료 검색·이관, UIA 동작과 DNS·TCP 관찰입니다. [Windows 확인 목록](docs/windows-acceptance.md)과 [라이선스 정책](docs/license-policy.md)을 기준으로 이어갑니다. `releaseReady: false`는 전체 1.0 검증을 마치기 전까지 유지합니다.

## 기존 오류를 다시 다룰 때

| 증상 | 확인한 원인과 현재 처리 | 기록 |
| --- | --- | --- |
| 편집기 조기 panic·로그 없음 | 전용 프로필의 표준 AppData 폴더 누락. 0.3.2에 시작 화면과 함께 반영 | [시작 수정](docs/ned-startup-fix-1.md) |
| ACP가 exit code 0으로 종료 | PowerShell 실행 수명이 먼저 종료. 번들 Python 콘솔 감독기로 표준 입출력 유지 | [ACP·설정 수정](docs/ned-config-restart-fix-1.md) |
| `Cannot find module './impl/format'` | jsonc-parser UMD 상대 모듈 누락. 0.3.4부터 ESM과 실제 번들 초기화 검사 | [0.3.4 기록](docs/validation-0.3.4.md) |
| 업데이트 뒤 글꼴·배치 초기화 | 현재 JSONC 대신 일부 키·오래된 appearance 사용. 현재 설정·키맵·DB 경로 보존 | [0.3.3 기록](docs/validation-0.3.3.md) |
| 스냅샷 창 신원 오류 | agent-desktop 축약 응답과 호스트 요구 불일치. 0.3.6에서 캡처 전후 목록으로 검사 | [0.3.6 기록](docs/validation-0.3.6.md) |
| Open Folder 뒤 `0xc000041d` | 정확한 원인 미확정. 내부 선택창과 호스트의 시스템 선택창으로 분리 | [진단](docs/windows-diagnostics.md) |
| 내보내기 선확인 HTTP 500 | 기존 서버 `fs/stat` 단계 실패. 최소 `fs/ls`와 안전한 진단 도구 제공 | [개인 지식 이관](docs/openviking-personal-migration.md) |

배포 PC에서는 시작 수정 뒤 Ned 실행, 누적 패치 뒤 모델 대화와 JSON 자동 적용을 확인했습니다. 데스크톱 진단은 창 18개와 MCP 67개 도구·상태를 읽었지만 실제 계산기 조작 성공까지 확인한 결과는 아닙니다. 기존 OpenViking의 사용자 자료 내보내기 성공도 아직 별도 확인이 필요합니다.

## 사용자 자료와 과거 기록

Ned 데이터는 `%APPDATA%\Ned`에 있습니다. `safeStorage` 설정 이관에는 Electron `Local State`의 DPAPI 키도 필요합니다. 앱 소유 프로필을 원본 보존 방식으로 복사하고, 이관 준비 프로필에서 복호화하지 않은 채 Ned 프로필로 재실행합니다. 처음 준비할 때만 `%LOCALAPPDATA%\Ned-Launcher`를 사용합니다.

설치 위치를 바꿔도 사용자 자료는 자동 이동하지 않습니다. 다른 Windows 계정의 복호화 실패나 손상 기록을 자동 초기화하지 마세요. 사용자 DB·지식을 제거하거나 무결성 검사를 끄는 방식으로 오류를 해결하지 않습니다.

이 문서는 현재 개발에 필요한 정보로 정리했습니다. 이전 단계의 임시 프로세스·실행 세션·상세 해시는 [0.3.7 배포 직후 인계 원문](https://github.com/SungKyu-Kim39/AgentHarness/blob/c940cda42c6d98a8828ccdeac963e67e31ec9a5c/HANDOFF.md)과 버전별 `docs/validation-*`, `downloads/*-validation.json`에서 확인할 수 있습니다. L-Vibe 0.2.7 이전 이력은 [당시 인계서](https://github.com/SungKyu-Kim39/AgentHarness/blob/31748467fcbd0639f70db923ac9d9aea8c268b9f/HANDOFF.md)에 보관합니다.
