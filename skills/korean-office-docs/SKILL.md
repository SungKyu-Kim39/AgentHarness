---
name: korean-office-docs
description: 오피스·한컴 미설치 폐쇄망 환경에서 HWP·HWPX·PDF 표를 읽고 XLSX·DOCX·PPTX·HWPX 보고서와 양식을 양방향으로 생성·편집한다.
---

# 한글(HWP/HWPX) 및 오피스 문서 양방향 자동화

MS Office나 한컴오피스 설치 없이도 Ned 내장 오프라인 도구를 사용해 사내 문서 읽기, 복잡한 PDF 표 추출, 보고서·양식 생성까지 일관되게 처리한다.

## 작업 절차

1. **원본 문서 읽기**:
   - 일반 PDF·DOCX·PPTX·XLSX·HWP·HWPX 문서는 `document_read(path)`로 Markdown 텍스트를 추출한다.
   - 병합 셀이나 다단 표가 중요한 PDF 사양서는 `document_read(path, mode: "tables", pages)`로 구조화된 표 데이터를 직접 뽑는다.
   - 프로젝트 `.venv`에 `docling`이 설치되어 있으면 `document_read(path, mode: "docling")`으로 레이아웃 정밀 추출을 활용할 수 있다.
2. **보고서·양식 생성 (`document_write`)**:
   - **Excel (`.xlsx`)**: 시트별 헤더·행 데이터·Excel 수식(`=SUM(...)`, `=AVERAGE(...)`)·차트를 `spec.sheets`로 구성한다.
   - **Word (`.docx`)**: 제목·문단·불릿·표·로컬 다이어그램 이미지를 `spec.blocks`로 구성하거나, 기존 양식(`templatePath`)의 `{{키}}` 자리표시자를 `spec.replacements`로 채운다.
   - **PowerPoint (`.pptx`)**: 슬라이드별 제목·핵심 불릿·표·이미지·발표자 노트를 `spec.slides`로 구성한다.
   - **한글 (`.hwpx`)**: Markdown 본문을 공문서 HWPX로 생성하거나, 기존 `.hwpx` 양식(`templatePath`)의 `{{키}}` 자리표시자를 채운다.
3. **시각 자료 결합**: 구조도나 흐름도가 필요한 보고서는 먼저 `diagram_generate(format: "mermaid-png")`로 오프라인 PNG 이미지를 생성한 뒤 `document_write`의 이미지 블록/슬라이드로 삽입한다.
4. **안전 경계**: 매크로 확장자(`.xlsm`, `.docm`, `.pptm`)나 외부 URL 이미지는 사용하지 않으며, 생성된 문서는 호스트 승인과 기존 파일 스냅샷 백업을 거쳐 프로젝트 내부에만 저장한다.
