# Ned

[0.4.0 변경 사항](docs/changes-0.4.0.md) · [0.4.0 검증](docs/validation-0.4.0.md) · [자연어 자동 도구 연결 소개·안내(무링크)](docs/ned-auto-routing-guide.md)

최신 사전 릴리스는 [Ned 0.4.0 rebuild6](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.4.0-rebuild6)입니다. [설치 EXE·반입 TGZ](downloads/README.md) · [검증 기록](docs/validation-0.4.0-rebuild6.md).

Ned는 사내 Qwen 모델과 Zed 편집기, OpenCode 에이전트, 개발 도구와 지식 저장소를 한 번에 설치하는 Windows용 바이브 코딩 환경입니다. 직원이 도구마다 설치법을 익히고 설정 파일을 연결하는 수고를 줄이고, 평소처럼 자연어로 요청하면 상황에 맞는 스킬과 도구를 자동으로 연결해 실행하도록 만들었습니다.

Zed에서 코드를 직접 편집하면서 Ned에 코드 조사, 수정, 빌드, 문서 작성을 요청할 수 있습니다. 필요한 런타임과 스킬은 폐쇄망 반입 전에 묶어 두고, 모델 연결 정보는 중앙 JSON에서 관리합니다.

[자연어 자동 도구 연결 가이드](docs/ned-auto-routing-guide.md) · [소개와 활용](docs/ned-introduction.md) · [Zed와의 차이](docs/ned-vs-zed.md) · [설치 안내](docs/offline-setup.md) · [모델 설정](docs/model-controls.md) · [권한 설정](docs/approval-modes.md) · [라이선스](docs/license-policy.md)

AI Agent가 처음이라면 [상세 사용 안내서](docs/ned-user-guide.md) 또는 사내 공유용 링크 없는 단일 문서인 [자연어 자동 도구 연결 소개·안내·상세 가이드](docs/ned-auto-routing-guide.md)를 먼저 읽어 보세요. 기본 Zed와의 차이, 자연어 의도 분석과 자동 도구·스킬 연결 구조, 주요 구성 요소, 스킬 79개의 용도·요청 예시와 첫 작업 순서를 설명합니다.

0.4.0에서는 사내 PyPI 미러 라우팅 연동 `.venv` 관리(`manage_python_venv`)와 오프라인 패키지 API 역추적(`python_package_docs`), `marimo`/`Streamlit` 루프백 데이터 앱 프리뷰(`python_app_preview`), Shadow Git 턴 체크포인트(`project_checkpoint`)와 `git worktree` 병렬 샌드박스(`worktree_sandbox`, `spawn_subagent(isolation="worktree")`), Spec-Driven 워크플로(`spec_workflow`), 다국어 `ast-grep-py` 검색·치환(`ast_search`)과 로컬 정적 보안 감사(`code_audit`), 한글(HWP/HWPX)·MS Office 양방향 문서 생성(`document_write`) 및 PDF 표 추출, OpenAPI 로컬 Mock·계약 검증(`api_mock_server`, `api_contract_test`), `.drawio` 및 오프라인 Mermaid SVG/PNG 렌더링(`diagram_generate`), 내장 스킬 5종(기본 스킬 총 79개)을 통합했습니다.

0.3.16에서는 `ned_host_browser_check` 워커 즉시 종료 근본 수정과 IPv6 루프백 지원, 모델 설정 검증 보강, 개인화 대화 기억 종료 유실 방지, 고위험 셸 가드·NSIS 실행 중 파일 잠금 검사, VS2022 MSBuild 지원을 반영했습니다.

Ned는 [기본 Zed Agent 선택](docs/zed-native-agent.md)과 [Astryx UI 제작](docs/astryx.md), [조사·구현 서브에이전트](docs/subagents.md)를 제공합니다. 기본 Zed Agent는 Ned의 스킬·MCP·지식 기능을 연결하지 않고 Zed 자체 도구를 사용합니다.

## 다운로드

최신 배포는 [Ned 0.4.0 rebuild6](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.4.0-rebuild6)입니다. [설치 EXE와 반입용 TGZ](downloads/README.md)에서 파일과 체크섬을 받을 수 있습니다. 0.3.12부터의 배포 파일을 같은 페이지에서 확인할 수 있습니다.

## 처음 사용하는 방법

1. 반입용 TGZ를 새 폴더에 풀고 Ned 설치 EXE를 실행합니다. 설치 화면에서 D 드라이브 등 다른 위치를 선택할 수 있으며, 필요한 폴더는 설치기가 만듭니다.
2. 사내 LLM과 임베딩 모델을 설정합니다. 최초 설치 후 편집할 준비 파일은 `%APPDATA%\Ned\config-import.json`입니다. 설치 전에 EXE 옆 `agent-config.json`을 작성해 두었다면 그 내용이 자동으로 복사됩니다.
3. Ned를 실행하고 알림 영역의 **Ned → 프로젝트 폴더 열기**에서 작업할 폴더를 선택합니다.
4. Zed에서 코드를 열고 **Ctrl+Shift+A**로 Ned 대화를 시작합니다.

설정 변경은 **Ned → 설정 JSON 가져와 적용 (자동 재시작)**을 사용합니다. 저장된 설정이 있으면 설치 폴더의 JSON만 고쳐서는 바뀌지 않습니다. [설정 파일의 역할과 변경 절차](docs/configuration-recovery.md)를 확인하세요.

## 코드와 도구를 함께 다루는 방식

Ned는 선택한 프로젝트의 코드를 읽고 검색한 뒤 수정안을 만듭니다. 사용자가 직접 편집하고 Ctrl+S로 저장하는 동작은 일반 IDE와 같습니다. AI가 파일을 바꿀 때는 프로젝트 범위와 외부 변경, 저장하지 않은 편집 내용을 확인합니다.

반복 승인창이 번거롭다면 대화 입력창이나 알림 영역의 **권한** 메뉴에서 **프로젝트 파일 자동 승인** 또는 **전체 권한**을 선택할 수 있습니다. 선택은 재시작과 업데이트 후에도 유지됩니다. 적용 범위는 [권한 안내](docs/approval-modes.md)에 설명했습니다.

기본 구성에는 Aegis·Conductor 지침, 스킬 79개, Serena·clangd, Graphify, REA, Workspace Tools(HWP/HWPX·Office·AST·Bandit·Mermaid)와 개발 MCP 6종이 들어 있습니다. VS2017/2019/2022가 설치된 PC에서는 MSBuild와 솔루션 구성을 찾아 지원하는 빌드 작업을 실행할 수 있습니다. Python은 기존 [프로젝트별 Conda 환경 선택](docs/python-conda.md)과 함께 0.4.0의 사내 PyPI 연동 `.venv` 관리 및 패키지 API 역추적을 지원합니다.

OpenViking은 Ned 실행 중 백그라운드에서 시작하고 Ned와 함께 종료합니다. Ned는 기본·사용자·프로젝트(`.ned/skills`) 스킬을 로컬 파일에서 읽습니다. 0.3.13부터 지식 서비스는 사용자가 선택해 색인한 문서·가져온 개인 지식뿐 아니라 Ned 에이전트(OpenCode/ACP) 주 대화에서 백그라운드 VLM으로 추출한 개인 기억도 함께 검색·자동 회상합니다(`openViking.memory` 설정으로 제어, 턴·세션 opt-out 지원, Studio에서 조회·삭제 가능). 프로젝트 전체 파일을 임의로 업로드하지는 않습니다. [글로벌 스킬 등록](docs/extension-guide.md#사용자-글로벌-스킬-등록), [스킬 안내](docs/bundled-skills.md), [데스크톱 도구](docs/agent-desktop.md)에서 세부 사용법을 볼 수 있습니다.

## 개발과 배포

Ned 호스트는 설정과 승인, 서비스 실행·종료를 관리합니다. Zed는 편집기와 대화 화면을, 전용 OpenCode 엔진은 에이전트 실행을 담당합니다. 모델 가중치는 포함하지 않으며, 답변과 임베딩 계산에는 JSON에 지정한 사내 API를 사용합니다. 긴 서버 대기열을 고려해 모델 응답에 기본 시간 제한을 두지 않습니다.

빌드는 고정 OpenCode 소스와 Windows 런타임을 준비한 뒤 진행합니다. `npm run ned:prepare:acp`로 빌드 의존성을 준비하고, `npm run build`로 호스트와 ACP를, `npm run ned:release`로 설치기를 생성합니다. 자세한 절차와 코드 위치는 [개발 인계](HANDOFF.md), [아키텍처](docs/architecture.md), [어댑터 명세](docs/adapters.md)를 참고하세요.

`work`에서 개발과 검증을 진행하고, 검증한 배포본을 `main`에 반영합니다. 현재 배포 기준은 0.4.0 rebuild6입니다. Windows Server 설치·로딩 검사와 직원 PC의 실제 GUI·사내 모델·외부망 차단 검사는 구분하며, 1.0 전체 검증은 아직 완료하지 않았습니다.
