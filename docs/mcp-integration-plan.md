> 이 문서는 초기 구성의 조사·구현 기록입니다. 아래 버전과 결과는 당시 기준이며, 현재 배포 상태는 [Ned 0.3.7 검증 기록](validation-0.3.7.md)에서 확인할 수 있습니다.

# MCP 6종 기본 연동

이 문서는 2026-11-10에 검토한 MCP 6종의 연동 계획을 정리합니다. 각 서버에서 사용할 도구를 선별하고 호스트 MCP 중계를 거치도록 구성했습니다. 개인 PC의 엔진이나 브라우저 프로필은 재사용하지 않습니다.

| 서비스 | 고정 구성 | 기본 허용 범위 |
|---|---|---|
| Serena | serena-agent 2.1.0 + clangd 23.1.0 | 프로젝트 복사본의 C/C++ 심볼 개요·정의·참조. REPL/편집/activation/dashboard 제외 |
| Git | mcp-server-git 2026.11.4 + MinGit 2.56.0.windows.4 | 설정·훅·외부 object 경로를 제외한 복사본의 상태/diff/log/show |
| Playwright | @playwright/mcp 0.0.85 | 승인한 localhost HTTP 개발 페이지의 접근성 스냅샷·콘솔·스크린샷 |
| MarkItDown | markitdown-mcp 0.0.1a8 | 선택 파일 복사본의 PDF/Office/텍스트 변환. 웹 URI·클라우드·OCR 제외 |
| Chrome DevTools | chrome-devtools-mcp 1.12.0 | 로컬 스냅샷·콘솔·스크린샷, 선택한 경우 재탐색과 5초 성능 trace. CrUX/통계/업데이트 제외 |
| DuckDB Local | mcp-server-motherduck 1.1.0 + DuckDB 1.5.6 | 선택 CSV/Parquet/DuckDB 복사본의 제한된 SELECT. MotherDuck/S3/HTTP/확장 설치·로드/DB 전환 제외 |

Python은 별도 site-packages로 구성하여 Serena의 MCP SDK 2.2.0과 다른 서버의 SDK 요구가 OpenViking 또는 서로의 환경을 바꾸지 않게 합니다. Windows 마커로 의존성을 해결하고 URL·버전·해시·라이선스를 고정합니다. 순수 Python sdist는 빌드 PC에서 wheel로 완성합니다. 직원 PC에서 npm/pip/uvx/다운로드를 실행하지 않습니다. GPL 구성 요소의 대응 소스를 함께 제공합니다.

브라우저의 Windows 배포 목표는 Chrome for Testing 157.0.8103.50의 전용 프로필·절대 경로입니다. 일반 사용자 브라우저와 확장을 읽지 않습니다. localhost/127.0.0.1의 명시적 포트 한 개에서 GET/HEAD만 허용하며 앱 내부 API 포트, 다른 origin·리다이렉트, POST, CONNECT, WebSocket을 호스트 프록시에서 차단합니다. 페이지 자체 스크립트는 실행되므로 탐색과 성능 재탐색·화면 캡처 여부를 네이티브 승인에 고정합니다. 클릭·입력·evaluate·업로드·브라우저 설치 도구는 노출하지 않습니다. 인증·쿠키·개인 프로필을 전달하지 않습니다. 현재 범위에는 사내/외부 사이트나 HTTPS 탐색을 포함하지 않습니다.

Serena의 입력은 호스트가 만든 스냅샷·설정·컴파일 DB이며 `.clangd`와 사용자 LSP/activation 설정을 신뢰하지 않습니다. clangd 파일 시스템 overlay와 컴파일 옵션 정규화로 외부 include/플러그인 경로를 제한합니다. SDK 또는 include/매크로 정보가 없거나 제거되면 정확도 제한을 표시합니다. 텍스트 검색으로 대체하면 그 사실을 명시합니다.

Serena의 `_send_usage_info`를 제거하고 LSP `shell=True`를 고정 clangd argv의 직접 실행으로 교체합니다. `fallthrough:false` VFS는 복사본·전용 임시 폴더·고정 clangd 리소스만 제공합니다. LLVM의 메모리 PCH는 VFS 밖의 가상 절대 경로를 사용하므로 전용 TEMP 폴더의 디스크 PCH를 사용합니다. 대소문자가 다른 `.SeReNa`도 복사하지 않습니다. 컴파일 DB 제공 여부와 일치한 단위 수를 결과에 기록합니다.

Git은 복사한 index에서 추적 경로를 읽는 호스트 내부 준비 도구로 `vendor` 등 검색 제외 폴더의 추적 파일도 채웁니다. 실제 삭제 파일은 채우지 않습니다. 추적 파일은 20,000개·파일당 64 MiB·전체 256 MiB 한도이며 비추적 탐색은 일반 호스트 파일 목록의 한도를 명시합니다. 외부 worktree·링크·한도 초과는 거부합니다.

DuckDB는 읽기 전용이라는 도구 힌트만 믿지 않습니다. 문장 분류·외부 접근 제한·허용 파일 경로·확장 차단·설정 잠금·메모리/시간/행 수 제한을 적용합니다. 프로세스는 앱 전용 환경과 수명 관리 아래 두며 종료가 불명확하면 같은 작업을 재개하지 않습니다.

DuckDB 초기화 중 허용 파일을 고정한 뒤 외부 접근을 끄고 설정을 잠급니다. 사용자 SQL은 그 후에 받으며 15초·256 MiB·200행/50,000자와 spill 금지를 적용합니다. MarkItDown은 압축 Office 해제 크기도 제한합니다. ONNXRuntime 통계를 끄고 Windows MSVC DLL을 앱 내부에 포함합니다. `.pth`를 실행하지 않고 검토한 pywin32 경로만 설정합니다.

Python 감사 훅으로 접근을 추가 검사합니다. 다만 네이티브 코드의 모든 I/O를 제한하는 OS 샌드박스와는 범위가 다릅니다. Windows Job Object의 실제 자식 종료·파일 범위·DNS/TCP 관찰은 실환경 검증 대상입니다. MCP는 필요할 때 시작하고 호출 후 종료합니다. OpenViking의 앱 동반 시작/종료와는 별개입니다.

초기 빌드 환경에서는 공식 브라우저 호스트 `storage.googleapis.com`에 접근할 수 없어 브라우저 확보가 지연됐습니다. 이후 고정 바이너리를 확보한 과정과 검사 결과는 [MCP 검증 기록](mcp-validation.md)에 정리했습니다. Windows·사내 모델·DNS/TCP 실환경 검증은 별도로 필요합니다.

전체 manifest와 버전·해시·라이선스·대응 소스를 기록합니다. 첫 MCP 실행에서 고정 manifest·추가 파일·파일 해시를 검사하며 서버의 sampling/elicitation은 거부합니다. 불완전한 번들로 EXE/TGZ를 새로 포장하지 않습니다. 공개된 0.2.1 EXE에는 이 6종이 없습니다. [소스 0.2.2 검증 기록](mcp-validation.md)을 따릅니다.
