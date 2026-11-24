---
name: data-app-builder
description: marimo 리액티브 노트북, Streamlit, Uvicorn 기반의 사내 로컬 데이터 웹앱을 만들고 루프백 프리뷰 서버와 브라우저 점검으로 자가 검증한다.
---

# 대화형 데이터 앱 구축과 로컬 자가 검증

CSV·Parquet·Excel 데이터를 탐색하거나 사내 공유용 분석 대시보드를 만들 때 순수 Python 기반의 `marimo` 또는 `streamlit` 앱으로 작성하고 로컬에서 직접 렌더링을 검증한다.

## 작업 절차

1. **데이터 구조 확인**: 대용량 CSV·Parquet 파일은 `data_query`(DuckDB) 또는 소량 샘플 읽기로 스키마, 단위, 결측치, 이상치를 먼저 확인한다.
2. **의존성 준비**: `manage_python_venv(operation: "status")`로 `marimo` 또는 `streamlit`·`pandas`·`plotly` 등 설치 여부를 확인하고, 없으면 사내 PyPI 미러를 통해 `manage_python_venv(operation: "install")`로 `.venv`에 설치한다.
3. **순수 Python 앱 작성**: `marimo`는 `.py` 단일 파일 형식이므로 Git diff와 `patch_file` 부분 수정에 유리하다. 외부 CDN 폰트·스크립트 URL을 넣지 않고 100% 폐쇄망 로컬 자산으로만 렌더링되도록 작성한다.
4. **루프백 프리뷰 및 자가 점검**: `python_app_preview(operation: "start", framework, entry)`로 `127.0.0.1` 루프백 서버를 기동한 뒤, 반환된 로컬 주소를 `browser_check`로 열어 콘솔 오류, 접근성 구조, 화면 캡처를 직접 확인한다.
5. **정리**: 확인이 끝나거나 사용자가 종료를 요청하면 `python_app_preview(operation: "stop", id)`로 프리뷰 서버를 깔끔히 중지한다.
