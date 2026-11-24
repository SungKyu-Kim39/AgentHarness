---
name: python-intranet-venv
description: 사내 PyPI 미러 라우팅으로 프로젝트 전용 .venv를 구성하고 설치된 패키지의 실제 API·독스트링을 오프라인으로 조회해 정확한 Python 코드를 작성한다.
---

# 사내 PyPI `.venv` 구성과 로컬 패키지 API 역추적

외부 인터넷이 차단된 사내 환경에서도 사내 PyPI 미러가 라우팅되어 있다면, 프로젝트 내부 `.venv`에 필요한 패키지를 안전하게 설치하고 실제 설치된 패키지의 시그니처를 확인해 환각 없는 코드를 작성한다.

## 작업 절차

1. **현재 환경 확인**: 먼저 `manage_python_venv(operation: "status")`로 프로젝트 `.venv` 존재 여부, 설치 패키지 목록, 사내 PyPI 정책(`respectSystemPipConfig`, `indexUrl`)을 확인한다.
2. **가상환경 생성·패키지 설치**: 필요한 패키지가 없으면 `manage_python_venv(operation: "install", packages: [...])` 또는 `requirementsPath`로 호스트 승인을 받아 `.venv`에만 설치한다. URL·VCS·로컬 경로 지정자는 사용하지 않으며 표준 PEP 508 패키지 이름과 버전 제약만 사용한다.
3. **실물 API 역추적(오프라인 Context7)**: 최신 오픈소스 패키지나 사내 전용 Python 라이브러리의 함수 시그니처·매개변수·반환 타입이 불확실하면 추측하지 말고 `python_package_docs(package, symbol 또는 query)`로 실제 설치된 wheel의 AST 시그니처와 독스트링을 먼저 확인한다.
4. **오프라인 실행·테스트**: 스크립트 실행과 `pytest` 검증은 `manage_python_venv(operation: "run" | "test")`로 오프라인 환경(`PIP_NO_INDEX=1`)에서 실행하고 실제 종료 코드와 출력을 확인한다.

## 주의 사항

- Ned의 내부 OpenViking/MCP Python 런타임을 프로젝트 실행 환경으로 수정하지 않는다.
- 패키지 설치 및 실행 권한은 호스트 승인 정책이 결정하며, 이 스킬 지침은 권한을 부여하지 않는다.
