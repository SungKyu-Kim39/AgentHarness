# MCP 6종 소스 검증 — 2026-11-10 UTC

대상은 work 브랜치의 L-Vibe **0.2.2 소스**다. 0.2.2 EXE/TGZ 발행 기록이 아니다. 공개된 0.2.1 설치본에는 이 6종이 없다.

## 실제 원본 서버 호출

Linux x86_64, Node 24.22.1, CPython 3.12에서 `npx --no-install tsx scripts/test-mcp-live.ts` 전체와 변경 후 해당 단계(`files`, `semantic`, `browser`)를 검증했다. endpoint는 로컬 합성 페이지이며 실제 사내 LLM·임베딩 API로 요청하지 않았다. Python 서비스는 독립 site-packages를 사용한다. Windows 배포본을 Linux 가상환경 복사로 만들지 않는다.

| 원본 MCP | 고정 버전 | 관찰 결과 |
|---|---|---|
| Serena + clangd | 2.1.0 / 23.1.0 | 개요·함수 본문·교차 파일 호출 참조. 컴파일 DB의 분리된 매크로/include 반영. 외부 헤더 심볼 제외. REPL·activation·`.clangd` 설정 제외 |
| Git | 2026.11.4 | status/diff/log/show. 원본 config 보존. 검색 제외 폴더의 추적 파일을 index로 보완하여 거짓 삭제 방지 |
| MarkItDown | MCP 0.0.1a8 / core 0.1.9 | Markdown·PDF·DOCX·PPTX·XLSX 변환. Office 편집/OCR/HWP 검증을 의미하지 않음 |
| DuckDB Local | MotherDuck MCP 1.1.0 / DuckDB 1.5.6 | CSV 집계·Parquet·로컬 DB SELECT. 원본 DB 바이트 보존. CREATE·복수 문장·외부 파일·HTTP·SET 거부 |
| Playwright | MCP 0.0.85 | 접근성 스냅샷·콘솔 오류·PNG 결과 |
| Chrome DevTools | 1.12.0 | 스냅샷·콘솔·PNG 및 재탐색 후 5초 성능 trace. CrUX·업데이트·사용 통계 비활성화 |

브라우저 테스트에는 실행기에 설치된 `/usr/lib/chromium/chromium`을 검증 전용으로 지정했다. Windows 배포 설정으로 재사용하지 않는다. Linux 컨테이너 테스트의 `--no-sandbox`도 Windows worker에 적용하지 않는다. 다른 localhost 포트의 fetch와 POST가 대상 서버에 도달하지 않았고 승인/예약 포트 거부 시 페이지 요청이 늘지 않았다. 호출·종료 후 테스트 폴더를 사용하는 MCP·브라우저 자식 프로세스가 남지 않았다.

`test:mcp:live`는 빌드 PC 전용 통합 검사다. 일반 `npm test`와 구분하며 Windows 호출 수용 검사로 계산하지 않는다.

## Windows 번들과 제한

Windows x64 wheel을 Windows 플랫폼 마커·CPython 3.12 ABI로 해결하고 서버별 SDK를 분리했다. Playwright 내부 의존성은 원본 MCP가 지정한 `1.66.0-alpha-2026-11-09`이며 stable Playwright로 표현하지 않는다. npm 설치 스크립트·브라우저 자동 다운로드를 사용하지 않는다.

Windows PE import table 698개를 정적으로 조사하여 ONNXRuntime의 MSVCP140/140_1 누락을 찾았다. 고정 `msvc-runtime 14.51.36231`의 재배포 DLL을 변경 없이 앱 내부에 넣고 라이선스·출처·해시를 기록했다. pywin32 GUI/MFC 도구는 노출하거나 실행하지 않는다. PE 이름 대조는 Windows의 실제 DLL 로딩 검증을 대신하지 않는다.

staging에는 Python·Git·clangd·Node MCP·worker·라이선스가 있다. 공식 Chrome for Testing 157.0.8103.50의 `storage.googleapis.com`는 빌드 실행기 정책에서 HTTP 403으로 차단되어 확보하지 못했다. 직원 PC 최초 다운로드나 개인 브라우저로 대체하지 않는다. `mcp:verify`, EXE 패키징과 TGZ 생성은 누락 상태를 오류로 처리한다.

Windows 10/11 일반 사용자 설치·6종 실호출·DLL·경로/ACL·Job Object 자식 종료·DNS/TCP 관찰, 실제 사내 Qwen·임베딩 검증이 남아 있다. `releaseReady`는 false다.
