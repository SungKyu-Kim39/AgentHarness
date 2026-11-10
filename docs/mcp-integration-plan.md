# MCP 6종 기본 연동

사용자가 6종 모두 추가하도록 지정했다. 기존 호스트 MCP 중계 안에 검토한 도구만 연결한다. 일반 명령 실행이나 개인 PC의 엔진·브라우저 프로필을 재사용하는 기능으로 확장하지 않는다.

| 서비스 | 고정 구성 | 기본 허용 범위 |
|---|---|---|
| Serena | serena-agent 2.1.0 + clangd 23.1.0 | 프로젝트 복사본의 C/C++ 심볼 개요·정의·참조. REPL/편집/activation/dashboard 제외 |
| Git | mcp-server-git 2026.11.4 + MinGit 2.56.0.windows.4 | 설정·훅·외부 object 경로를 제외한 복사본의 상태/diff/log/show |
| Playwright | @playwright/mcp 0.0.85 | 전용 브라우저의 승인된 탐색·상호작용, DOM/콘솔/스크린샷 |
| MarkItDown | markitdown-mcp 0.0.1a8 | 선택 파일 복사본의 PDF/Office/텍스트 변환. 웹 URI·클라우드·OCR 제외 |
| Chrome DevTools | chrome-devtools-mcp 1.12.0 | 전용 브라우저의 승인된 동작과 콘솔/성능 진단. CrUX/통계/업데이트 제외 |
| DuckDB Local | mcp-server-motherduck 1.1.0 + DuckDB 1.5.6 | 선택 CSV/Parquet/DuckDB 복사본의 제한된 SELECT. MotherDuck/S3/HTTP/확장 설치·로드/DB 전환 제외 |

Python은 별도 site-packages로 구성하여 Serena의 MCP SDK 2.2.0과 다른 서버의 SDK 요구가 OpenViking 또는 서로의 환경을 바꾸지 않게 한다. Windows 마커로 의존성을 해결하고 URL·버전·해시·라이선스를 고정한다. 순수 Python sdist는 빌드 PC에서 wheel로 완성한다. 직원 PC에서 npm/pip/uvx/다운로드를 실행하지 않는다. GPL 구성 요소의 대응 소스를 함께 제공한다.

브라우저는 Chrome for Testing 157.0.8103.50을 전용 프로필·절대 경로로 사용한다. 일반 사용자 브라우저와 확장을 읽지 않는다. 요청은 앱 프록시로 제한하고 리다이렉트·하위 요청도 대상 범위를 검사한다. 동작 승인은 도구·인자·프로젝트·대상 페이지를 고정한다. 임의 evaluate/코드 실행·파일 업로드·브라우저 설치 도구는 노출하지 않는다.

Serena의 입력은 호스트가 만든 스냅샷·설정·컴파일 DB이며 `.clangd`와 사용자 LSP/activation 설정을 신뢰하지 않는다. clangd 파일 시스템 overlay와 컴파일 옵션 정규화로 외부 include/플러그인 경로를 제한한다. SDK 또는 include/매크로 정보가 없거나 제거되면 정확도 제한을 표시한다. 텍스트 검색으로 대체하면 그 사실을 명시한다.

DuckDB는 읽기 전용이라는 도구 힌트만 믿지 않는다. 문장 분류·외부 접근 제한·허용 파일 경로·확장 차단·설정 잠금·메모리/시간/행 수 제한을 적용한다. 프로세스는 앱 전용 환경과 수명 관리 아래 두며 종료가 불명확하면 같은 작업을 재개하지 않는다.

현재 빌드 환경은 공식 브라우저 호스트 `storage.googleapis.com`를 차단한다. 허용 도메인 설정 변경을 요청했으며 다른 구성의 구현·검증을 먼저 진행한다. Windows·사내 모델·DNS/TCP 수용 검증 전에는 1.0 완료로 표시하지 않는다.
