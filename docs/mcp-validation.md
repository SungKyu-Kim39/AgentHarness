# MCP 6종 소스 검증 — 2026-11-10 UTC

대상은 work 브랜치의 L-Vibe **0.2.2 소스**다. 0.2.2 EXE/TGZ 발행 기록이 아니다. 공개된 0.2.1 설치본에는 이 6종이 없다.

## 실제 원본 서버 호출

Debian GNU/Linux 13 (trixie) x86_64, Node 24.22.1, CPython 3.12에서 `npx --no-install tsx scripts/test-mcp-live.ts` 전체와 변경 후 해당 단계(`files`, `semantic`, `browser`)를 검증했다. endpoint는 로컬 합성 페이지이며 실제 사내 LLM·임베딩 API로 요청하지 않았다. Python 서비스는 독립 site-packages를 사용한다. Windows 배포본을 Linux 가상환경 복사로 만들지 않는다.

| 원본 MCP | 고정 버전 | 관찰 결과 |
|---|---|---|
| Serena + clangd | 2.1.0 / 23.1.0 | 개요·함수 본문·교차 파일 호출 참조. 컴파일 DB의 분리된 매크로/include 반영. 외부 헤더 심볼 제외. REPL·activation·`.clangd` 설정 제외 |
| Git | 2026.11.4 | status/diff/log/show. 원본 config 보존. 검색 제외 폴더의 추적 파일을 index로 보완하여 거짓 삭제 방지 |
| MarkItDown | MCP 0.0.1a8 / core 0.1.9 | Markdown·PDF·DOCX·PPTX·XLSX 변환. Office 편집/OCR/HWP 검증을 의미하지 않음 |
| DuckDB Local | MotherDuck MCP 1.1.0 / DuckDB 1.5.6 | CSV 집계·Parquet·로컬 DB SELECT. 원본 DB 바이트 보존. CREATE·복수 문장·외부 파일·HTTP·SET 거부 |
| Playwright | MCP 0.0.85 | 접근성 스냅샷·콘솔 오류·PNG 결과 |
| Chrome DevTools | 1.12.0 | 스냅샷·콘솔·PNG 및 재탐색 후 5초 성능 trace. CrUX·업데이트·사용 통계 비활성화 |

브라우저 테스트에는 실행기의 Chromium 156.0.8078.79(`/usr/lib/chromium/chromium`)를 검증 전용으로 지정했다. Windows 배포 설정으로 재사용하지 않는다. Linux 컨테이너 테스트의 `--no-sandbox`도 Windows worker에 적용하지 않는다. 다른 localhost 포트의 fetch와 POST가 대상 서버에 도달하지 않았고 승인/예약 포트 거부 시 페이지 요청이 늘지 않았다. 호출·종료 후 테스트 폴더를 사용하는 MCP·브라우저 자식 프로세스가 남지 않았다.

`test:mcp:live`는 빌드 PC 전용 통합 검사다. 일반 `npm test`와 구분하며 Windows 호출 수용 검사로 계산하지 않는다.

## 최종 회귀와 빌드

- `npm run verify`: **45개 테스트 통과, 실패·건너뜀 0**, 기본 스킬 34개 무결성, 타입 검사와 Desktop overlay 검증 통과.
- 종료 확인 실패를 주입해도 실제 MCP/모델 HTTP 게이트웨이가 닫히고 새 초기화·엔진 실행이 거부되는 추가 검사를 포함한다.
- 공식 Desktop `bun run typecheck`: 2개 프로젝트·2,549개 파일, 오류 없음.
- `node scripts/desktop.mjs build`: main/preload/renderer 빌드 성공. 원본의 CSS 최적화·dynamic import 경고가 남으며 설치 EXE 생성 결과는 아니다.
- MCP 네이티브 제어 번들 `l-vibe-control-DZMe3MXP.js` SHA-256: `be5d56cde135861dfd0da0fc70f340a6ec66a79eba2752bc91b8dabdd599901f`.

## Windows 번들과 제한

Windows x64 wheel을 Windows 플랫폼 마커·CPython 3.12 ABI로 해결하고 서버별 SDK를 분리했다. Playwright 내부 의존성은 원본 MCP가 지정한 `1.66.0-alpha-2026-11-09`이며 stable Playwright로 표현하지 않는다. npm 설치 스크립트·브라우저 자동 다운로드를 사용하지 않는다.

Windows PE import table 698개를 정적으로 조사하여 ONNXRuntime의 MSVCP140/140_1 누락을 찾았다. 고정 `msvc-runtime 14.51.36231`의 재배포 DLL을 변경 없이 앱 내부에 넣고 라이선스·출처·해시를 기록했다. pywin32 GUI/MFC 도구는 노출하거나 실행하지 않는다. PE 이름 대조는 Windows의 실제 DLL 로딩 검증을 대신하지 않는다.

Windows Chrome for Testing 157.0.8103.50을 확보했고 완성 staging의 21,031개 파일을 manifest와 전수 대조했다. `complete=true`, 누락은 없다. 완성 manifest SHA-256은 `002382abd6455f38e943182384b6bddb9e3c1973aae2ef13db6fab1387d901d1`이다. Chrome ZIP SHA-256은 `36088dd9c76c992f6e745fc20f94aca873f69c3331ce25ea3df36835cc4af73f`이며 공식 응답 MD5·ZIP CRC와 대조했다. 이전 정책 403/미완성 manifest 기록은 현재 상태로 사용하지 않는다.

NSIS의 원본 데이터 2 GB 한계를 피하도록 파일별 zlib 모드로 전체 EXE를 생성했다. 실제 EXE archive를 검사·추출한 뒤 MCP 21,031개 파일 전체를 현재 manifest와 대조했다. 상세 EXE·앱·CLI 해시와 48개 회귀 검사 결과는 [0.2.2 검증 상태](validation-0.2.2.md)에 있다. 이 설치 리소스 검사는 위 Linux 실호출 검사와 구분한다.

Windows 10/11 일반 사용자 설치·6종 실호출·DLL·경로/ACL·Job Object 자식 종료·DNS/TCP 관찰, 실제 사내 Qwen·임베딩 검증이 남아 있다. `releaseReady`는 false다.
