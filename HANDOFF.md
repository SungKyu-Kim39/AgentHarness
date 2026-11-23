# Ned 개발 인계

새 PC나 Codex 세션에서 개발을 이어갈 때 확인할 정보입니다. 최신 사전 릴리스는 **Ned 0.3.12 rebuild1**입니다. Zed, 전용 OpenCode 엔진, Aegis·Conductor·OpenViking과 개발 도구를 한 번에 설치해 사내 모델로 사용하는 폐쇄망 환경을 목표로 합니다.

## 0.3.12 rebuild1 배포 기준

소스 `074905951678e2c406f3a0d893fb33394b276134`를 사용했습니다. Windows 새 설치·0.3.12 업데이트와 27개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.12-rebuild1.md)


## 0.3.12 배포 기준

소스 `38fef304308afac4c7ed85a8270b29a9d884698c`를 사용했습니다. Windows 새 설치·0.3.11 업데이트와 26개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.12.md)

### 0.3.12 주요 변경

- 권한 정책을 확정 매트릭스에 맞춰 정비했습니다: `run_terminal`은 `isHighRiskShellCommand` 최소 고위험 가드만 전체 권한에서 명시적 승인(`approveExplicit`)을 요구하고 일반 개발·빌드·테스트 명령은 자동 승인합니다. 외부 파일 읽기(`ExternalRead`)는 `ask`·`edits`에서 승인창 후 허용, `full`에서 자동 승인하며 보호 경로·외부 쓰기는 차단합니다. `knowledge_remember`·`knowledge_forget`도 `this.options.approve`로 통일해 `full`에서 자동 승인합니다.
- 승인 팝업·파일/폴더 선택창이 Zed 뒤로 숨지 않도록 [`distribution/ned/topmost-dialog.ts`](distribution/ned/topmost-dialog.ts)의 활성 모니터 중앙 `screen-saver` 최상단 소유자 창을 적용했고, Python 환경 선택창도 최상단 레벨로 올렸습니다.
- OpenViking Studio는 차단 URL(`STUDIO_BLOCKED_REQUEST`), `did-fail-load`, 콘솔 경고·오류, `#app` DOM 요약을 `openviking/studio-status.json`에 상시 기록하며 초기 렌더 타임아웃을 30초로 늘리고 동일 origin `blob:` 및 `font-src` CSP를 보완했습니다.
- OpenViking 저장/검색 실패 원인은 임베딩 모델 연결 오류로 확인됐으며, `vikingErrorCode`에 `OV_FORBIDDEN`·`OV_TIMEOUT`·`OV_EMBEDDING`·`OV_SERVER_ERROR`·`OV_TLS`를 추가하고 `OpenVikingGateway` 오류 코드 전달과 `openviking/request-diagnostics.json` 상시 기록(민감 정보 마스킹, 500자 제한)을 적용했습니다.
- 설치본을 전체 설치본 단일 배포로 단순화했습니다(`install-reversing-pack.ps1`, `NED_CORE`, Core/리버싱 팩 빌드·CI 단계 제거, `ReaGhidra` 번들 경로 단일화, `docs/archive/offline-packs.md` 보관). 기본 대화 시 특수 도구 스키마 지연 로딩은 유지합니다. 트레이 메뉴의 변경 사항 링크도 `NED_VERSION` 기반으로 수정했습니다.

[0.3.12 변경 사항](docs/changes-0.3.12.md) · [0.3.12 검증 기록](docs/validation-0.3.12.md)

## 0.3.11 배포 기준

제품 소스는 `6222c4c312351ce2b45fd131851d132512092694`입니다. Windows Server에서 13개 검사를 통과했고 0.3.10 업데이트, 사용자 데이터 보존, Core 재설치 후 리버싱 팩 보존을 확인했습니다. GitHub 릴리스의 12개 첨부 파일을 인증 없이 전체 다운로드해 SHA-256을 대조했습니다. 편집기와 설치본 후보는 Actions 아티팩트로 전달하고, 최종 바이너리는 GitHub 릴리스에서 제공합니다.

[다운로드](downloads/README.md) · [변경 사항](docs/changes-0.3.11.md) · [검증 기록](docs/validation-0.3.11.md) · [사내 서명](docs/license-policy.md#ned-0311-사내-서명)

## 0.3.10 배포 기준

소스 `7cc5cef166690c64b64e545cda1b38e034bd285d`를 사용했습니다. Windows 새 설치·0.3.9 업데이트와 12개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/archive/validations/validation-0.3.10.md)


버전 구현을 맡으면 설치 EXE·반입 TGZ·문서·체크섬과 GitHub 릴리스까지 한 작업으로
마무리합니다. 고정 Zed 빌드 후 설치 후보를 생성하고, Windows에서 해당 EXE의 SHA-256을
맞춰 새 설치·직전 버전 업데이트·변경 기능을 검증합니다. 이후 같은 EXE를 TGZ에 넣고
공개 첨부를 검증합니다. [0.3.10 변경 사항](docs/archive/releases/changes-0.3.10.md)

## 0.3.9 배포 기준

제품 소스 `c5381da2dee6ea1e7901a8edb199c94d39bd8e1a`, Windows 실행 44204486724: 52건 중 52건 통과·0건 제외·실패 0건입니다. EXE·TGZ 해시와 공개 다운로드 검증은 downloads/의 0.3.9 자료를 따릅니다.

## 0.3.9 구현 구조

사용자가 누적 요구와 구현을 승인했습니다. `codex/ned-0.3.9` 작업 트리에서 기본 스킬의
사전 준비·변경분 적용, 지식 서비스의 비동기 시작, 단계·경과 시간·파일 검사 진행,
Studio 표시 확인·실패 재시도, CMD/PowerShell 선택, 개인 Zed Agent DB 가져오기,
EGM 7종과 읽기 전용 Goldfish 역할을 구현했습니다. 스킬은 74종입니다.
Zed 필수 프로필 name·capability와 첫 메시지 프록시 경로 호환성도 보완했습니다.
[변경 사항](docs/archive/releases/changes-0.3.9.md), [검증 기록](docs/archive/validations/validation-0.3.9.md)을 먼저 읽습니다.

0.3.9용 소스 빌드 편집기와 runtime lock, 설치 감사 및 Windows 실행기 검증을 완료했습니다. 실제 직원 Windows GUI와 사내 모델 수용은 별도입니다.
Linux 전체 232건 중 202건 통과·30건 제외·실패 0건이며 후속 SDK·데이터 대상 8건과
실제 Chromium Studio 표시를 확인했습니다. 이전 배포물과 태그는 그대로 보존합니다. 새 편집기 작업은 version별 artifact와 build 메타데이터를
만들며 원격 work 브랜치에 자동 커밋하는 방식을 제거했습니다.

스킬은 `scripts/prepare-skill-seed.ts`가 생성하고 `src/main/skill-seed.ts`가 서비스 정지 중
배치합니다. 로컬 준비와 벡터 색인은 구분합니다. YAML 2.8.1 ISC를 고정해 SDK 직렬화 차이와
사용자 메타데이터 수정을 구분합니다. 수정본·추가 파일은 보존하며 교체 기록으로 중단을 복구합니다.
개인 대화는 `distribution/ned/zed-history.ts`에서 원본 readOnly SQLite snapshot과 트랜잭션으로
병합합니다. 직렬화 0.3.0만 지원하고 모델·sandbox 승인은 초기화합니다.
Goldfish는 새로운 호스트 소유 세션과 제한된 읽기 도구를 사용하고 자동 스킬 주입을 생략합니다.

## 0.3.8 rebuild1 배포 기준

[릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.8-rebuild1)의 EXE·TGZ·체크섬·감사 자료 7개를 게시했고 인증 없는 전체 다운로드 해시를 확인했습니다. [다운로드 안내](downloads/README.md), [배포 상태](downloads/Ned-0.3.8-rebuild1-release-state.json), [검증 기록](docs/archive/validations/validation-0.3.8-rebuild1.md)을 기준으로 이어갑니다.

제품 소스는 `1be374cb1af9f16923688d5499d86ba771218dd4`, 반입 파일 커밋은 `16d75164ff44ba2bbf9662d5e78801270816196d`, 검사·감사 소스는 `8b894aed9ee6a5b4a5859c1868cd20f2abe9b4ef`입니다. EXE는 1,534,583,160 bytes, SHA-256 `74291ef0eaf204f562c3e14e6b24a62852ada5f66cb83013617a066d50bbb1d3`입니다. TGZ는 1,913,956,648 bytes, SHA-256 `dfd20c9b57473ca6c80b7aeb1c9fa84deb6585d2ac6b4648f4af889d242680b3`입니다. 대응 소스 두 묶음과 수정 편집기 소스는 TGZ의 source/에 있습니다. 기존 게시 파일과 태그는 불변이며 이후 수정은 새 빌드 식별자로 구분합니다.

서브에이전트는 `distribution/subagents.ts`의 호스트 소유 OpenCode 하위 세션입니다. 조사·지정 파일 구현 역할, 전역 동시 두 개, 부모 권한 상속과 중지 확인을 적용합니다. `distribution/ned/agent.ts`와 `message-delivery.ts`는 부모의 첫 답변 뒤 도착한 통합 답변도 실제 ACP 화면에 한 번만 전달합니다. `tests/subagents*.test.ts`, `message-delivery.test.ts`를 확인합니다. 제품 스킬의 외부 Agent 설치 금지는 유지하며 Codex 개발용 `.agents/` 규칙은 바꾸지 않았습니다.

기본 Zed Agent의 연결은 `distribution/ned/zed-models.ts`에 있습니다. Zed 자체 하네스이며 OpenCode·ACP·Ned 스킬·MCP·OpenViking·요약 재시도를 사용하지 않습니다. 모델 주소·기본 요청 옵션을 공유하고 실제 키 대신 실행별 로컬 토큰을 전달합니다. 자체 프로필과 권한을 유지합니다. [두 Agent 안내](docs/zed-native-agent.md)를 참고하세요.

Astryx 0.7.16 스킬·281개 참조와 Windows React 시작 프로젝트를 추가해 스킬은 67종입니다. 원본 CLI를 실행하거나 직원 PC에서 의존성을 받지 않습니다. `astryx-offline-lock.json`, `distribution/astryx-starter`, `downloads/astryx`를 확인합니다. `skills:bundle`은 검토된 Astryx 항목을 보존하고 실패 시 복구하며, `adapt-subagent-skills.mjs`로 호스트 위임 지침과 해시를 갱신합니다.

Ned 메뉴·About은 Windows 소스 빌드 43966924528의 편집기입니다. 컴포넌트 커밋 `0b05464`, `downloads/editor`의 바이너리·대응 소스·build.json과 `ned-editor-source-lock.json`을 함께 유지합니다. `scripts/ned-source-editor.mjs`가 고정 입력을 검증하고 아이콘을 적용합니다. 큰 수정 대응 소스는 TGZ에만 두고 설치 폴더에는 작은 변경 기록·위치·해시 안내를 둡니다.

Linux 전체 211건은 199건 통과·12건 제외·실패 0건이며 후속 집중 검사 8건도 통과했습니다. [최종 Windows 실행 44013048470](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/44013048470)은 설치 파일 교체 없이 32건 모두 통과했습니다. 앞선 native 검사 지연은 테스트의 DB 정리 순서를 고친 뒤 같은 EXE로 재검증했습니다. 실제 직원 Win10/11 GUI·사내 모델과 전체 DNS/TCP 수용은 별도이며 releaseReady는 false입니다.

수정 빌드는 `NED_BUILD_REVISION=rebuild1 node scripts/ned-package.mjs release`로 만들었습니다. `rebuild` 역사 모드를 사용하지 않습니다. 문서·검사가 진행된 뒤 같은 EXE를 감사·묶음 생성할 때만 `NED_REBUILT_SOURCE_COMMIT`으로 제품 소스를 명시합니다. 설치 EXE를 다시 빌드하지 않은 감사 소스와 제품 소스를 혼동하지 않습니다.

## 0.3.8 배포 기준

[릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.8)의 EXE·TGZ는 소스 `35e7771c1d5dc731953aa10b436bd2a423c87303`에서 생성했습니다. 반입 파일 커밋은 `bd4c4639dadfeef1a531833dcc9f823908a818bc`입니다. EXE 1,511,354,669 bytes의 SHA-256은 `860d7cef5230ba632201f3bd51b134b58896f7f10f592d667a1cfaf1efaf7d27`, TGZ 1,837,611,541 bytes는 `dcc0c46cf970811168770e609c4de9540c00643724cb6986bd57bc8778be951c`입니다. [다운로드 안내](downloads/README.md)와 [배포 상태](downloads/Ned-0.3.8-release-state.json)를 기준으로 이어갑니다.

GitHub Release의 EXE·TGZ·체크섬·manifest·audit 첨부 7개를 모두 공개했습니다. [익명 전체 다운로드 검사](downloads/Ned-0.3.8-public-verification.json)와 GitHub의 asset digest가 일치했습니다. 게시 작업은 [43872146785](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/43872146785)에서 완료했습니다. `main`과 `work`에 배포 기록을 반영합니다.

요약 출력 한도 복구, OpenViking Studio, 실패 OVPack의 원본 보존 재시도, Git 스테이징·로컬 커밋, Ghidra/Java, 전체 권한의 외부 읽기와 프로젝트별 Conda 환경 선택을 반영했습니다. Conda 선택은 로컬에 보존하고 OpenViking에 참고 기록으로 비동기 색인합니다. 지식 문서만으로 실행 환경을 바꾸지 않습니다. [기능 안내](docs/python-conda.md)를 참고하세요.

Linux 전체 회귀 199건 중 189건 통과·10건 환경별 제외·실패 0건이며 추가 집중 검사 10건도 통과했습니다. 최종 앱 파일 59,694개를 준비본과 전부 대조했습니다. [Windows 실행 43869521183](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/43869521183)은 설치 후 파일 교체 없이 SDK 이관·삭제·요약·Git·Ghidra·대규모 패키지·Conda 20건 모두 통과했습니다. 실제 직원 Win10/11·사내 모델 전체 수용과는 구분합니다.

공통 감독기의 stdin daemon 종료 충돌은 `scripts/sidecar-supervisor.py`에서 수정합니다. `scripts/release-supervisor.mjs`가 최적화 후 해당 Ned 소유 파일만 교체하고 manifest·최적화 보고서·release-runtime-lock에 해시를 고정합니다. 현재 OpenViking 최적화 manifest는 `8ee132a83b1bd421620a5b8f4f5ae97c868d2b33a8e2b1a871e001825b2de7a0`입니다. 원본 SDK 파일과 배포 후보는 보존합니다.

첫 대화 HTTP 400은 중복 system 메시지 호환성을 수정하고 비밀 없는 진단을 추가했습니다. 사내 서버의 정확한 거절 원인은 미확정입니다. 기존 모델 실패와 임베딩 성공 로그는 약 5시간 차이이므로 동시 부하를 입증하지 않습니다. 모델 생성 대기에 임의의 제한을 추가하지 않습니다.

새 EXE는 기존 후보를 덮어쓰지 않고 별도 소스 커밋 디렉터리에서 검증했습니다. `downloads/candidates/`의 첫 후보는 공통 감독기 수정 전이므로 직원 배포용으로 사용하지 않습니다. `python-source-probe`·`runtime_source_probe` 결과도 최종 설치본 검사와 혼동하지 않습니다. [0.3.8 검증 기록](docs/archive/validations/validation-0.3.8.md)에 중간 실패와 최종 결과를 함께 남겼습니다.

## 이전 0.3.7 수정 빌드

[수정 빌드 릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.7-rebuild1)를 공개 prerelease로 게시했습니다. 첨부 서버는 작은 체크섬에도 HTTP 401을 반환하므로, EXE·TGZ는 릴리스 본문의 고정 Git LFS 링크에서 받습니다. [릴리스 상태](downloads/Ned-0.3.7-rebuild1-release-state.json)에 공개 페이지·메타데이터 확인과 첨부 실패를 구분해 기록했습니다.

수정 EXE·TGZ는 `0.3.7-rebuild1`로 구분하며, 기존 버전·배포 파일은 보존합니다. 호스트 빌드 소스는 `b096614b23bbc7101ba1659c3313194155b24c26`, 두 반입 파일이 함께 있는 커밋은 `348787c011ed2bc5cac8a0074a75f4376ee601e2`입니다. [다운로드 안내](downloads/README.md)와 [검증 기록](docs/archive/validations/validation-0.3.7-rebuild1.md)을 기준으로 이어갑니다.

OpenViking 0.5.5·LiteLLM 1.103.10, `ned` 계정·스킬 이름의 검증 이관, `ned_host_delete_file`을 반영했습니다. 삭제는 기존 권한 모드와 ACP 버퍼 검사, 파일 충돌 검사, 원본 스냅샷을 사용하며 2 MiB 이하 UTF-8 파일 하나만 지원합니다. [저장소 이관과 원본 보존](docs/openviking-0.5.5-update.md)에 실패·재시작 처리와 백업 위치를 설명합니다.

전체 회귀 검사는 166건 중 157건 통과·실패 0건·9건 건너뜀이며, EXE 추출 앱 파일 56,024개를 준비본과 전부 대조했습니다. EXE 1,045,627,103 bytes의 SHA-256은 `bae628b3cb4febe8e500e24556b674f10fcab27aa5e69b8fa2349a5c838d3eb5`, TGZ 1,182,931,028 bytes는 `e88022adfe329655a5134f68c0b77b20925d26dffca3a912c38e56e6a75adc4c`입니다. 공개 전체 다운로드도 확인했습니다. Windows 결과는 해당 수정 빌드의 별도 기록을 확인하고, Win10/11 GUI·실제 사내 모델 수용과 구분합니다.

Windows Server [실행 43792692526](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/43792692526)에서 설치·오프라인 로딩·실제 구버전 자료 이관 1건·파일 삭제 9건이 모두 통과했습니다. [Windows 결과](downloads/Ned-0.3.7-rebuild1-windows-offline-smoke.json)에 조건을 기록합니다. 최초 두 실행의 중단은 검증 파일의 줄바꿈 변환이었으며, 설치본을 다시 만들지 않고 검증 입력을 보정했습니다.

## 원본 0.3.7 배포 기준

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
- 새 도구는 `ned_host_*`, 리소스는 `resources/ned`를 사용합니다. OpenViking 내부 계정과 등록 이름도 `ned`로 이관하며, 원본 저장소와 스킬 수정본은 보존합니다. 상세 절차는 [0.5.5 업데이트·이름 이관](docs/openviking-0.5.5-update.md)을 따릅니다. 옛 배포 파일과 패치의 대상 식별자는 바꾸지 않습니다.
- 실행기·설치기·트레이는 `assets/ned-icon.png`와 `ned-icon.ico`를 씁니다. 0.3.8 원본까지는 번들 Zed 아이콘 리소스만 교체했습니다. rebuild1은 두 Rust 소스의 메뉴·About을 수정해 빌드하고 그 출력에 아이콘을 적용합니다. 기반 버전·소스·원본 라이선스와 수정 대응 소스를 유지합니다.

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

Windows 비교에서는 LZMA가 용량은 줄였지만 설치를 54,182ms에서 90,792ms로 늦춰 채택하지 않았습니다. 최종 zlib는 같은 실행기의 기준 50,497ms에서 38,935ms로 줄었습니다. 설치 파일 수는 94,237개에서 55,926개, 논리 크기는 3,375,883,034에서 3,024,551,545 bytes로 줄었습니다. 실험과 최종 결과는 [0.3.7 검증 기록](docs/archive/validations/validation-0.3.7.md)에 있습니다.

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
| 편집기 조기 panic·로그 없음 | 전용 프로필의 표준 AppData 폴더 누락. 0.3.2에 시작 화면과 함께 반영 | [시작 수정](docs/archive/fixes/ned-startup-fix-1.md) |
| ACP가 exit code 0으로 종료 | PowerShell 실행 수명이 먼저 종료. 번들 Python 콘솔 감독기로 표준 입출력 유지 | [ACP·설정 수정](docs/archive/fixes/ned-config-restart-fix-1.md) |
| `Cannot find module './impl/format'` | jsonc-parser UMD 상대 모듈 누락. 0.3.4부터 ESM과 실제 번들 초기화 검사 | [0.3.4 기록](docs/archive/validations/validation-0.3.4.md) |
| 업데이트 뒤 글꼴·배치 초기화 | 현재 JSONC 대신 일부 키·오래된 appearance 사용. 현재 설정·키맵·DB 경로 보존 | [0.3.3 기록](docs/archive/validations/validation-0.3.3.md) |
| 스냅샷 창 신원 오류 | agent-desktop 축약 응답과 호스트 요구 불일치. 0.3.6에서 캡처 전후 목록으로 검사 | [0.3.6 기록](docs/archive/validations/validation-0.3.6.md) |
| Open Folder 뒤 `0xc000041d` | 정확한 원인 미확정. 내부 선택창과 호스트의 시스템 선택창으로 분리 | [진단](docs/windows-diagnostics.md) |
| 내보내기 선확인 HTTP 500 | 기존 서버 `fs/stat` 단계 실패. 최소 `fs/ls`와 안전한 진단 도구 제공 | [개인 지식 이관](docs/openviking-personal-migration.md) |

배포 PC에서는 시작 수정 뒤 Ned 실행, 누적 패치 뒤 모델 대화와 JSON 자동 적용을 확인했습니다. 데스크톱 진단은 창 18개와 MCP 67개 도구·상태를 읽었지만 실제 계산기 조작 성공까지 확인한 결과는 아닙니다. 기존 OpenViking의 사용자 자료 내보내기 성공도 아직 별도 확인이 필요합니다.

## 사용자 자료와 과거 기록

Ned 데이터는 `%APPDATA%\Ned`에 있습니다. `safeStorage` 설정 이관에는 Electron `Local State`의 DPAPI 키도 필요합니다. 앱 소유 프로필을 원본 보존 방식으로 복사하고, 이관 준비 프로필에서 복호화하지 않은 채 Ned 프로필로 재실행합니다. 처음 준비할 때만 `%LOCALAPPDATA%\Ned-Launcher`를 사용합니다.

설치 위치를 바꿔도 사용자 자료는 자동 이동하지 않습니다. 다른 Windows 계정의 복호화 실패나 손상 기록을 자동 초기화하지 마세요. 사용자 DB·지식을 제거하거나 무결성 검사를 끄는 방식으로 오류를 해결하지 않습니다.

이 문서는 현재 개발에 필요한 정보로 정리했습니다. 이전 단계의 임시 프로세스·실행 세션·상세 해시는 [0.3.7 배포 직후 인계 원문](https://github.com/SungKyu-Kim39/AgentHarness/blob/c940cda42c6d98a8828ccdeac963e67e31ec9a5c/HANDOFF.md)과 버전별 `docs/validation-*`, `downloads/*-validation.json`에서 확인할 수 있습니다. L-Vibe 0.2.7 이전 이력은 [당시 인계서](https://github.com/SungKyu-Kim39/AgentHarness/blob/31748467fcbd0639f70db923ac9d9aea8c268b9f/HANDOFF.md)에 보관합니다.
