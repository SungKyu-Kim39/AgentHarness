# Ned 기본 스킬 79종

기본 스킬은 폐쇄망에 반입한 로컬 지침입니다. Ned Agent가 작업과 문맥에 맞춰 읽으며, 문서 자체가 실행 권한이나 외부 설치 권한을 부여하지 않습니다. EGM 설계·검토 워크플로는 사용자가 필요할 때 명시적으로 요청합니다.

빌드 때 OpenViking 0.5.5용 준비 자료를 만들고 실행 시 변경분만 확인합니다. 이전 등록 개수와 이번 확인·재사용·신규·갱신은 별개입니다. 사용자 수정본과 추가 파일은 보존합니다. 지식 서비스는 대화 시작을 막지 않습니다. 로컬 준비와 검색 벡터 완료를 같은 상태로 표시하지 않습니다.

전체 요청 예시는 [상세 사용 안내서](ned-user-guide.md#skill-catalog), 설계·검토 절차는 [EGM](egm.md), 버전 동작은 [변경 사항](changes-0.4.0.md)에서 확인합니다.

| ID | 용도 |
| --- | --- |
| agent-desktop | 승인한 창의 접근성 트리·qualified ref·의미 기반 동작·결과 확인 |
| agent-desktop-windows | Windows UIA 지원 범위·권한·대화형 세션·안전한 재관찰 |
| goal-framing | 자연어 아이디어를 목적·범위·수용 기준으로 정리 |
| writing-plans | 여러 파일 변경을 검증 가능한 단계로 나누기 |
| test-driven-development | 실패 재현·회귀 테스트·최소 구현 |
| systematic-debugging | 오류 로그와 재현으로 원인을 검증 |
| verification-before-completion | 실제 실행 근거와 미실행 검증 구별 |
| requesting-code-review | 변경 영향·버그·회귀 위험 검토 |
| skill-creator | 팀의 반복 개발 절차를 프로젝트 스킬로 제안 |
| security-best-practices | 언어·프레임워크에 맞는 보안 점검 |
| security-threat-model | 신뢰 경계·데이터 흐름·공격 경로 검토 |
| frontend-design | 목적에 맞는 UI·레이아웃·상호작용 설계 |
| webapp-testing | 사용자 흐름·브라우저 검증 계획과 테스트 코드 |
| mcp-builder | 작은 도구 인터페이스와 검증 가능한 서버 구현 |
| developer-documents | 요구사항·설계·운영·검증 문서의 구조화 |
| ui-accessibility | 키보드·포커스·상태·반응형 동작 검토 |
| react-best-practices | 렌더링·데이터 흐름·성능 검토 |
| composition-patterns | 재사용 가능한 구성과 복잡성 관리 |
| postgres-best-practices | SQL·인덱스·트랜잭션·권한 검토 |
| rag-search-quality | 임베딩·청킹·관련성·회귀 평가; OpenViking에 원리 적용 |
| cpp-pro | C++ 코드·자원 수명·동시성·빌드 문제; 기존 SDK·컴파일러 표준 유지 |
| cpp-testing | C++ 회귀·특성화·GoogleTest/CTest·sanitizer; 반입된 로컬 도구만 사용 |
| legacy-modernizer | 기존 동작 조사·점진 이행·플랫폼 제약·롤백 검증 |
| codebase-onboarding | 처음 여는 저장소의 진입점·구조·데이터 흐름·규칙을 실제 파일로 확인 |
| api-design | REST 경로·응답·오류·페이지 처리·호환성·멱등성 검토 |
| database-migrations | 스키마·데이터 변경의 백업·호환성·복구·검증; 변경은 승인 대상 |
| error-handling-patterns | 예외·Result·오류 코드·취소·제한된 재시도·자원 정리 |
| architecture-decision-records | 대안·선택 근거·결과·되돌리기를 기존 트랙 또는 짧은 ADR로 정리 |
| differential-review | 변경 전후의 보안 회귀·영향 범위·공격 조건·테스트 근거 검토 |
| session-handoff | 장기 작업의 사용자 결정·확인한 사실·변경·검증·미결 사항을 근거와 함께 인계 |
| explore-data | CSV·JSON·테이블 결과의 단위·키·결측·중복·분포·품질 조사 |
| validate-data | 조인·분모·기간·편향·계산·시각화·결론의 근거와 재현성 검토 |
| data-visualization | 로컬 결과의 차트·축·단위·불확실성·접근성; 외부 CDN 없는 산출물 |
| statistical-analysis | 분포·이상치·가설 검정·효과 크기·신뢰 구간·표본·인과 해석의 한계 |
| ab-testing | 가설·무작위 배정·MDE·검정력·표본 수·가드레일·중지 규칙; 로컬 계산 예제 |
| web-design-guidelines | 로컬 고정 UI 규칙으로 접근성·포커스·폼·상태·반응형·성능·한국어 사용성 검토 |
| inherit-legacy-style | 기존 프로젝트를 수정하면서 이름·구조·오류 처리·상태 관례를 유지하고 스타일 이탈을 줄인다. |
| change-impact | 여러 파일·플랫폼·설정·데이터·API 변경 전후에 실제 의존성과 회귀·복구 범위를 확인한다. |
| cpp-coding-standards | C/C++ 수명·소유권·오류·경계·동시성 품질을 기존 컴파일러와 SDK 제약에 맞춰 검토한다. |
| mcp-dependency-review | MCP 구성의 가변 패키지·원격 다운로드·실행 경계를 서버 실행 없이 정적으로 검토한다. |
| codebase-design | 작은 호출 계약 뒤에 복잡성을 모으고 변경·테스트·자원 소유권을 명확히 한다. |
| domain-modeling | 업무 용어·상태·규칙·데이터의 관계를 정리하고 코드와 팀의 언어를 일치시킨다. |
| diagnosing-bugs | 오류·성능 저하를 정확한 증상·재현·가설별 관찰로 조사하고 최소 수정한다. |
| tdd | 필요한 동작을 관찰 가능한 테스트로 정의하고 실패·최소 구현·정리 순서로 개발한다. |
| code-review | 변경을 요구사항 충족과 코드·안전·검증 품질의 두 관점에서 검토한다. |
| plan-eng-review | 넓은 작업의 설계·경계·실패·테스트·운영 위험을 구현 전에 정리한다. |
| review | diff의 논리·데이터·보안·성능 회귀를 실제 호출과 경계 조건으로 찾는다. |
| qa-only | 수정과 구분하여 실제 사용자 흐름·시각 상태·실패·회귀를 검증한다. |
| retro | 완료한 긴 작업의 결과·실패 원인·반복 낭비와 다음 개선을 정리한다. |
| humanize-korean | 보고서·소개문·가이드의 번역투와 기계적인 표현을 의미와 장르를 보존하며 다듬는다. |
| humanizer | 영문 글의 상투적 전개·과장·반복·불필요한 수사를 줄이고 작성자의 뜻을 보존한다. |
| unslop | 이미 만든 화면의 간격·색상·타이포그래피·구성·내용 밀도와 상호작용을 개선한다. |
| copywriting | 제품 소개·공지·랜딩 문구를 독자와 근거에 맞춰 작성한다. |
| copy-editing | 기존 소개문·안내·홍보 글의 명확성·근거·흐름·독자 적합성을 개선한다. |
| product-marketing | 제품 목적·대상·문제·효용·차별점과 근거를 정리한다. |
| onboarding | 비개발자가 설치·설정·첫 성과에 도달하는 단계와 안내를 단순화한다. |
| game-studio | 게임·교육용 시뮬레이션의 핵심 동작·스택·자산·테스트 경로를 정한다. |
| web-game-foundations | 게임 루프·상태·입력·저장·성능·HUD의 경계를 설계한다. |
| phaser-2d-game | 기존 Phaser 프로젝트의 장면·충돌·입력·애니메이션·자원을 구현한다. |
| three-webgl-game | 로컬 Three.js 프로젝트의 장면·카메라·렌더 루프·자산·해제를 구현한다. |
| react-three-fiber-game | React와 React Three Fiber의 장면·상태·DOM UI를 구분해 구현한다. |
| web-3d-asset-pipeline | GLB/glTF와 텍스처·LOD·메모리·로딩 크기를 검토한다. |
| game-ui-frontend | 플레이 화면을 가리지 않는 HUD·메뉴·상태·키보드 UX를 만든다. |
| sprite-pipeline | 반입된 스프라이트의 크기·앵커·프레임·애니메이션 일관성을 정리한다. |
| game-playtest | 시작·입력·장면 전환·HUD·충돌·성능을 실제 사용자 관점으로 확인한다. |
| modern-web-guidance | 웹 UI와 HTML/CSS/브라우저 API 구현에 선별 반입한 표준·접근성·성능 가이드를 적용한다. |
| astryx | React 19 UI·컴포넌트·레이아웃·테마·접근성; 로컬 참조와 오프라인 시작 프로젝트 |
| egm-brainstorm | 독립 검토자와 아이디어·요구사항·대안을 검토하고 합의한 개념 문서를 만듭니다. |
| egm-draft | 요구사항을 단계별로 검토하며 구현 전 설계 문서를 작성합니다. |
| egm-resolve | 설계 리뷰 지적 사항을 사용자와 검토하고 합의한 문서 수정을 반영합니다. |
| egm-bootstrap | 기존 코드와 근거를 읽어 코드베이스 문서를 작성하거나 갱신합니다. |
| egm-review | 설계안을 독립된 읽기 전용 Goldfish Agent로 단계별 검토합니다. |
| egm-review-loop | 지정한 검토 기준과 검토자로 독립 리뷰를 실행합니다. EGM 공용 원본 자료도 제공합니다. |
| egm-drift-report | 승인한 설계 문서와 현재 코드 사이의 차이를 근거와 함께 보고합니다. |
| python-intranet-venv | 프로젝트별 `.venv`와 사내 PyPI 미러 패키지 설치, 오프라인 패키지 API 역추적을 안내합니다. |
| data-app-builder | `marimo`·`Streamlit`·`FastAPI` 로컬 루프백 데이터 앱 작성과 `browser_check` 시각 검증을 안내합니다. |
| spec-driven-dev | `specs/<feature>/{spec.md,plan.md,tasks.md}` 기반 명세 우선 개발과 체크포인트·worktree 연계를 안내합니다. |
| korean-office-docs | 한글(HWP/HWPX)·Excel·Word·PowerPoint 양방향 문서 생성·읽기와 PDF 표 추출을 안내합니다. |
| architecture-diagramming | `.drawio` mxGraph XML 및 오프라인 Mermaid SVG/PNG 다이어그램 작성을 안내합니다. |

정확한 원본 커밋·라이선스·파일 해시는 설치된 skills/manifest.json과 고정 lock에 있습니다. 스킬 추가·교체는 [확장 안내](extension-guide.md)를 따릅니다.
