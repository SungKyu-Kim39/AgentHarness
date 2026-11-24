---
name: architecture-diagramming
description: 코드 구조와 시스템 설계를 오프라인에서 편집 가능한 .drawio 설계도와 선명한 Mermaid SVG/PNG 이미지로 생성한다.
---

# 오프라인 아키텍처 다이어그램 및 `.drawio` 설계도 생성

외부 온라인 렌더링 서버나 CDN 없이 코드와 설계 문서를 시각적 산출물로 변환한다.

## 작업 절차

1. **실제 근거 수집**: 다이어그램을 그리기 전에 `list_files`, `read_file`, `semantic_symbols`, `graphify_analyze`, `ast_search` 등으로 실제 모듈과 호출 흐름을 확인한다. 코드에 없는 구성요소를 지어내지 않는다.
2. **용도별 출력 형식 선택 (`diagram_generate`)**:
   - **직원이 직접 수정할 설계도 (`.drawio`)**: `format: "drawio"`를 사용한다. 구조화된 `{ title, direction, groups, nodes, edges }` 스펙 또는 Mermaid flowchart 문법을 넘기면 계층 좌표가 자동 계산된 Draw.io Desktop 호환 mxGraph XML을 생성한다.
   - **문서·위키·보고서 삽입용 이미지 (`mermaid-svg` / `mermaid-png`)**: `format: "mermaid-svg"` 또는 `"mermaid-png"`을 사용하면 네트워크가 차단된 로컬 격리 브라우저에서 한글 폰트가 깨지지 않는 선명한 이미지를 렌더링한다.
3. **가독성 원칙**:
   - 한 다이어그램에 노드가 너무 많으면(20개 초과) 상위 계층 아키텍처와 상세 시퀀스 다이어그램으로 나눈다.
   - 그룹(경계)과 데이터/권한 흐름 방향(`LR` 또는 `TB`)을 일관되게 유지한다.
