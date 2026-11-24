# Ned 0.4.0 변경 사항

Ned 0.4.0은 외부 인터넷이 차단된 사내 폐쇄망 환경(사내 PyPI 미러 라우팅 지원 포함)에서 바이브코딩의 성공률과 사내 실무 문서·설계·검증 생산성을 한 단계 끌어올리기 위해 9대 핵심 기능과 내장 스킬 5종(기본 스킬 총 79개)을 통합한 메이저 업데이트입니다. 기존 0.3.16(0.3.16 rebuild1)의 사용자 데이터 보존, 호스트 권한 정책, 고정 런타임 무결성 검증 원칙을 그대로 유지합니다.

---

## 1. 사내 PyPI 연동 `.venv` 샌드박스 및 의존성 관리 (`manage_python_venv`)

- **양방향 사내 PyPI 설정 지원** ([`src/shared/contracts.ts`](../src/shared/contracts.ts)): 중앙 설정 JSON에 선택적 `python` 블록(`respectSystemPipConfig`, `indexUrl`, `extraIndexUrls`, `trustedHosts`, `allowPackageInstall`)을 추가했습니다. 기본값으로 직원 PC의 기존 `pip.ini`·환경변수·사내 네트워크 라우팅을 그대로 존중하며, 중앙 설정에 사내 미러 주소를 명시해 주입할 수도 있습니다.
- **프로젝트 격리 `.venv` 수명 관리** ([`distribution/python-venv.ts`](../distribution/python-venv.ts)): Conda가 설치되지 않은 직원 PC에서도 번들 CPython 3.12(`--copies`) 또는 선택된 Conda 인터프리터를 기준으로 `<project>/.venv`를 생성하고, 표준 PEP 508 패키지 지정자·`requirements.txt` 검증을 거쳐 호스트 승인 하에 설치·제거·목록 조회(`freeze`)·오프라인 실행(`run`/`test`)을 수행합니다. URL·VCS·로컬 경로·임의 pip 옵션 지시어는 차단합니다.

## 2. 폐쇄망용 로컬 패키지 API·독스트링 역추적 (`python_package_docs`)

- **오프라인 Context7 대체 도구** ([`distribution/python-inspector.py`](../distribution/python-inspector.py)): 프로젝트 `.venv` 또는 선택된 Conda 환경의 `site-packages`에서 `importlib.metadata`와 Python `ast` 정적 파싱으로 실제 설치된 패키지의 버전, 서브모듈, 함수·클래스 시그니처, 타입 어노테이션, 독스트링을 추출합니다.
- **컴파일 확장 모듈 안전 폴백**: `.pyd`/`.so` C 확장 모듈은 네트워크·쓰기·자식 프로세스를 `sys.addaudithook`으로 차단한 격리 프로세스에서 `inspect.signature`로 조회해 최신 오픈소스 및 사내 전용 Python 라이브러리의 API 환각을 줄입니다.

## 3. 대화형 데이터 웹앱·리액티브 노트북 즉시 프리뷰 (`python_app_preview`)

- **루프백 전용 프리뷰 서버** ([`distribution/data-apps.ts`](../distribution/data-apps.ts)): 프로젝트 Python 환경으로 `marimo`, `streamlit`, `uvicorn`, 정적 `http` 서버를 `127.0.0.1` 임의 가용 포트에 기동합니다. 외부 바인딩(`0.0.0.0`)과 통계 전송을 비활성화하며, 반환된 로컬 주소를 기존 `browser_check`로 연결해 콘솔 오류와 화면 렌더링을 에이전트가 직접 자가 검증할 수 있습니다.

## 4. 턴 단위 Shadow Git 타임머신(`project_checkpoint`) 및 `git worktree` 병렬 샌드박스(`worktree_sandbox`)

- **사용자 Git 이력을 오염시키지 않는 체크포인트** ([`distribution/checkpoints.ts`](../distribution/checkpoints.ts)): `%APPDATA%\Ned\checkpoints` 아래 별도 Shadow Git 저장소에 턴 첫 파일 수정 직전 상태를 자동 기록합니다(Git 미초기화 프로젝트에서도 동작). `list`, `create`, `diff`, `restore`를 제공하며 복원 전 미저장 편집기 버퍼 검증, 안전 체크포인트 생성, 승인 및 스냅샷 백업을 거칩니다.
- **격리 Worktree 병렬 실험 및 하위 에이전트 연동** ([`distribution/worktree-sandbox.ts`](../distribution/worktree-sandbox.ts), [`distribution/subagents.ts`](../distribution/subagents.ts)): `spawn_subagent(isolation: "worktree")` 또는 `worktree_sandbox`로 격리된 `git worktree`를 생성해 동일 파일을 A안·B안으로 병렬 수정·비교한 뒤, 채택한 변경만 표준 승인·스냅샷 경로로 본 프로젝트에 반영할 수 있습니다.

## 5. 명세 주도 개발(Spec-Driven Development) 내장 (`spec_workflow`)

- **프로젝트 내 `specs/<feature>/` 구조화 관리** ([`distribution/spec-workflow.ts`](../distribution/spec-workflow.ts)): `spec.md`(`REQ-xx` 요구사항·수용 기준), `plan.md`(설계·영향 계획), `tasks.md`(체크리스트·참조 파일)를 초기화·조회·검증합니다. `verify` 단계에서 요구사항 누락, 미완료 태스크, 프로젝트에 없는 참조 파일을 정적으로 점검합니다.

## 6. 다국어 AST 구조 검색·리팩터링(`ast_search`) 및 로컬 보안·품질 감사(`code_audit`)

- **다국어 AST 검색·치환** ([`distribution/ast-audit.ts`](../distribution/ast-audit.ts), [`distribution/ast-audit-worker.py`](../distribution/ast-audit-worker.py)): 번들 `ast-grep-py`(MIT) 기반으로 Python·TypeScript/TSX·JavaScript·C/C++·C#·Java·Go·Rust·HTML·CSS의 구조적 패턴 검색 및 치환 미리보기를 제공합니다. `apply: true` 시 워커가 직접 쓰지 않고 호스트 승인·버퍼 검사·스냅샷을 거쳐 반영합니다.
- **오프라인 정적 보안·시크릿·품질 감사**: 다국어 SAST 패턴, 하드코딩 시크릿(플레이스홀더 제외), Python AST 품질 검사, 번들 `bandit`(Apache-2.0) 및 프로젝트 `.venv`의 선택적 `ruff` 결과를 통합 보고합니다.

## 7. 한글(HWP/HWPX) 및 MS Office(XLSX·DOCX·PPTX) 양방향 문서 자동화

- **읽기 확장 (`document_read`)**: 기존 MarkItDown 포맷에 더해 번들 `kordoc`(MIT)으로 **`.hwp`/`.hwpx` 한글 문서**를 Markdown으로 읽고, 번들 `pdfplumber`(MIT) 기반 **`mode: "tables"` PDF 정밀 표 추출**, 프로젝트 `.venv`의 **`mode: "docling"`** 레이아웃 분석을 지원합니다.
- **보고서·양식 생성 (`document_write`)** ([`distribution/document-tools.ts`](../distribution/document-tools.ts), [`distribution/office-worker.py`](../distribution/office-worker.py), [`distribution/kordoc-worker.mjs`](../distribution/kordoc-worker.mjs)): MS Office·한컴오피스 미설치 환경에서 수식·차트가 포함된 `.xlsx`, 표·이미지·템플릿 치환을 지원하는 `.docx`, 슬라이드·표·이미지·발표자 노트를 갖춘 `.pptx`, 공문서 생성 및 양식 채우기가 가능한 `.hwpx`를 오프라인으로 생성합니다. 매크로 확장자(`.xlsm`/`.docm`/`.pptm`)는 차단합니다.

## 8. 사내 OpenAPI/Swagger 로컬 Mock 서버(`api_mock_server`) 및 계약 검증(`api_contract_test`)

- **오프라인 API 개발·검증** ([`distribution/api-tools.ts`](../distribution/api-tools.ts)): OpenAPI 3.x / Swagger 2.0 JSON·YAML 명세만으로 `127.0.0.1` 루프백 Mock 서버를 기동하고 요청 로그를 수집합니다.
- **안전 게이트가 적용된 계약 검증**: 응답 상태 코드와 JSON 스키마 일치 여부를 검증하며 `.venv`에 `schemathesis`가 설치된 경우 속성 기반 퍼징까지 연동합니다. 비-루프백 사내 서버 주소나 상태 변경 메서드(`POST`/`PUT`/`PATCH`/`DELETE`)는 전체 권한 모드에서도 명시적 승인 창을 요구합니다.

## 9. 오프라인 다이어그램 렌더링 및 `.drawio` 설계도 생성 (`diagram_generate`)

- **편집 가능한 `.drawio` 및 오프라인 Mermaid SVG/PNG** ([`distribution/diagram-tools.ts`](../distribution/diagram-tools.ts)): 구조화된 JSON 또는 Mermaid flowchart 문법으로 계층 좌표가 자동 계산된 Draw.io Desktop 호환 `.drawio` mxGraph XML을 생성합니다. 또한 네트워크가 차단된 로컬 격리 브라우저에서 번들 `mermaid.min.js`(MIT)로 한글 깨짐 없는 SVG·PNG를 렌더링해 `document_write` 보고서에 바로 삽입할 수 있습니다.

## 10. 자동 스킬 라우팅 확장(기본 스킬 79개) 및 `0.4.0` 경량 번들 고정

- **내장 스킬 5종 추가**: `python-intranet-venv`, `data-app-builder`, `spec-driven-dev`, `korean-office-docs`, `architecture-diagramming`을 기본 카탈로그(74개 → **79개**)에 추가하고 [`src/main/skill-routing.ts`](../src/main/skill-routing.ts)의 자연어 자동 라우팅 및 조건부 도구 노출(`document_write`, `diagram_`, `api_`, `worktree_`)에 연결했습니다.
- **허용적 라이선스·해시 고정 번들**: `workspace-tools-lock.json`(Windows x64 wheel 23종, 전부 MIT/Apache-2.0/BSD/PSF) 및 `workspace-tools-node-lock.json`(`kordoc@4.25.12`, `mermaid@12.3.0`, MIT)을 전용 `resources/runtime/windows-x64/workspace-tools` 계층으로 분리해 기존 런타임 무결성과 0.3.16 rebuild1 → 0.4.0 제자리 업데이트 호환성을 유지합니다.
