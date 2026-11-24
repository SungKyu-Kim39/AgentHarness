# Ned 0.4.0 검증

0.4.0은 사내 PyPI 연동 `.venv` 관리, 오프라인 패키지 API 역추적(로컬 Context7), `marimo`/`Streamlit` 로컬 프리뷰, Shadow Git 체크포인트, `git worktree` 병렬 샌드박스, Spec-Driven 워크플로, 다국어 `ast-grep` 검색·로컬 보안 감사, 한글(HWP/HWPX)·MS Office 양방향 문서 생성 및 PDF 표 추출, OpenAPI Mock·계약 검증, 오프라인 `.drawio`/Mermaid 다이어그램 생성과 신규 내장 스킬 5종(총 79개)을 통합한 메이저 배포판입니다.

Linux 단위·통합 테스트와 Windows Server 스모크 검증은 실제 Windows 10·11 직원 PC의 GUI, 사내 모델·임베딩 서버 및 사내 PyPI 미러 수용 시험과 구분합니다. 직원 PC 확인 절차는 [Windows 확인 목록](windows-acceptance.md)을 따릅니다.

## Linux 단위·통합 검증

- `npm run typecheck`: 통과
- `npm run skills:verify`: 통과 (79개 오프라인 스킬 검증)
- `node scripts/verify-current-docs.mjs`: 통과
- [`tests/ned-040-features.test.ts`](../tests/ned-040-features.test.ts) (11/11 통과):
  - `contracts.ts` 사내 PyPI `python` 설정 스키마 허용·오류 URL/호스트 거부
  - `PythonVenvManager` PEP 508 지정자 검증, `.venv` 생성, 사내 패키지 AST API·독스트링 역추적(`python-inspector.py`), 오프라인 스크립트 실행
  - `DataApps` 루프백 전용 HTTP 프리뷰 서버 기동·응답·종료
  - `ProjectCheckpoints` 비-Git 프로젝트 Shadow Git 체크포인트 생성·diff·미저장 버퍼 검증 포함 복원
  - `WorktreeSandbox` 동일 파일 병렬 worktree 격리 수정·diff·안전 반영·정리
  - `SpecWorkflow` `specs/<feature>/` 초기화·REQ/태스크 정합성 검증
  - `AstAuditTools` 구조적 검색·승인 치환 및 SAST/시크릿/Python AST 품질 감사(플레이스홀더 오탐 제외)
  - `DocumentTools` 번들 `kordoc` 기반 HWPX 생성·재읽기 및 매크로 확장자(`.xlsm`) 차단
  - `DiagramTools` 구조화 스펙 및 Mermaid flowchart 기반 `.drawio` mxGraph XML 생성
  - `ApiTools` 로컬 OpenAPI Mock 서버 기동·스키마 계약 검증 및 변경 메서드 명시적 승인 게이트
  - `skill-routing.ts` 79개 카탈로그 자동 라우팅 및 0.4.0 전문 도구 조건부 노출
- [`tests/release-policy.test.mjs`](../tests/release-policy.test.mjs): `0.4.0` 버전 정책 및 `0.3.16-rebuild1 -> 0.4.0` 기준선 확인
- 기존 회귀 테스트 (`python-projects`, `subagents`, `git-tools`, `mcp-boundary`, `permission-policy`, `skills`, `zed-native`, `session-memory`, `ned-installer`, `ned-host-bundle`): 통과

## 남은 검증 범위

- 실제 Windows 10·11 직원 PC에서 사내 PyPI 미러(`pip.ini`/라우팅 및 `python.indexUrl`)를 통한 `.venv` 패키지 설치(`numpy`, `marimo` 등) 및 `python_app_preview` + `browser_check` 연계 GUI 확인
- 실제 Windows 10·11 환경에서 `document_write`(XLSX/DOCX/PPTX/HWPX)와 `diagram_generate`(Mermaid PNG/SVG 및 `.drawio`) 산출물을 Excel/Word/PowerPoint/한컴오피스/Draw.io로 열어 서식 및 한글 폰트 확인
- 실제 사내 LLM·임베딩 서버와 외부망 차단 환경에서의 최종 GUI 수용 확인 (`releaseReady: false` 유지)
