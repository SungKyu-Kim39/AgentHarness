# Ned 0.4.0

폐쇄망 사내 환경(외부 인터넷 차단 + 사내 PyPI 미러 라우팅 지원)에서 바이브코딩 성공률과 실무 문서·설계·검증 생산성을 전면 확장한 Ned 0.4.0 메이저 사전 릴리스입니다.

- **사내 PyPI `.venv` 관리(`manage_python_venv`) 및 오프라인 패키지 API 역추적(`python_package_docs`)**: 직원 PC의 기존 `pip.ini`/라우팅과 중앙 설정 JSON(`python.indexUrl` 등)을 모두 지원해 프로젝트 전용 `.venv`에 패키지를 안전하게 설치하고, 설치된 오픈소스·사내 전용 패키지의 실제 AST 시그니처와 독스트링을 오프라인으로 조회합니다.
- **대화형 데이터 웹앱 프리뷰(`python_app_preview`)**: `marimo`, `streamlit`, `uvicorn`, 정적 `http` 서버를 `127.0.0.1` 루프백 전용으로 기동하고 기존 `browser_check`로 렌더링·콘솔 오류를 자가 점검합니다.
- **Shadow Git 타임머신(`project_checkpoint`) 및 `git worktree` 병렬 샌드박스(`worktree_sandbox`, `spawn_subagent(isolation="worktree")`)**: 사용자의 실제 `.git` 이력을 오염시키지 않는 턴별 자동 체크포인트 복원과 격리 worktree 병렬 구현·비교를 제공합니다.
- **명세 주도 개발(`spec_workflow`), 다국어 AST 검색·치환(`ast_search`) 및 로컬 보안·품질 감사(`code_audit`)**: `specs/<feature>/` 요구사항·태스크 정합성 검증, 번들 `ast-grep-py` 기반 다국어 구조 검색·치환, 오프라인 SAST·시크릿·`bandit`·`.venv` `ruff` 감사를 통합했습니다.
- **한글(HWP/HWPX)·MS Office(XLSX·DOCX·PPTX) 양방향 자동화, `.drawio`/Mermaid 오프라인 다이어그램 및 OpenAPI Mock·계약 검증**: 한컴·오피스 미설치 PC에서도 `kordoc`·`openpyxl`·`python-docx`·`python-pptx`·`pdfplumber`·`mermaid`로 문서를 읽고 생성하며, `api_mock_server`·`api_contract_test`로 사내 API를 모의·검증합니다.
- **기본 스킬 79개 및 자동 라우팅 확장**: 신규 내장 스킬 5종(`python-intranet-venv`, `data-app-builder`, `spec-driven-dev`, `korean-office-docs`, `architecture-diagramming`)과 조건부 도구 노출을 반영했으며, 0.3.16 rebuild1에서 사용자 설정·대화·OpenViking 지식·전역 스킬을 유지한 제자리 업데이트를 지원합니다.

[변경 사항](changes-0.4.0.md) · [자연어 자동 도구 연결 안내](ned-auto-routing-guide.md) · [권한 안내](approval-modes.md)

설치 파일 65,712개를 준비본과 대조했습니다. Windows Server에서 새 설치, 0.3.16-rebuild1 업데이트와 사용자 글로벌 스킬 보존을 확인했고 설치본 대상 검사 48건이 통과했습니다. 직원 PC의 Windows 10·11 GUI와 실제 사내 모델 검증은 남아 있어 사전 릴리스로 제공합니다.

[Windows 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/45522013984) · [검증 기록](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/validation-0.4.0.md)

