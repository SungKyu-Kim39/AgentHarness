# L-Vibe 0.2.2 — 소스 검증 후보

MCP 6종의 실제 Linux 연동은 [MCP 검증 기록](mcp-validation.md)에 기재한다. 이 문서는 Windows 설치 EXE/TGZ 발행이나 Windows 수용 완료를 의미하지 않는다. 공개된 다운로드는 이전 0.2.1이며 6종 MCP가 포함되지 않는다.

Windows용 Python·MCP별 site-packages·MinGit·clangd·MSVC DLL을 확보하고 20,726개 staging 파일의 SHA-256을 전수 대조했다. 고정 Chrome for Testing 파일은 빌드 환경 정책에서 차단되어 번들이 미완성이다. 불완전한 상태에서 EXE/TGZ를 포장하는 경로는 오류로 중단한다. 실제 설치 리소스의 MCP 무결성 기록이 없거나 이전 0.2.1 기록을 재사용해도 TGZ를 생성하지 않는다.

`npm run verify`에서 45개 테스트와 기본 스킬 34개 무결성 검사를 통과했다. 공식 Desktop 타입 검사는 2개 프로젝트·2,549개 파일에서 오류가 없고 main/preload/renderer 빌드도 성공했다. 종료 확인 실패 시 다른 서비스를 정리하고 새 실행을 차단하는 오류 경로를 포함한다. 일반 회귀 검사에는 원형 0.1의 반복·재출력 검사도 있으므로 새 Desktop의 미구현 기능 완료로 계산하지 않는다.

Windows 10/11 설치·실제 DLL 로딩·6종 도구 호출·ACL·DPAPI·Job Object의 자식 종료·DNS/TCP 관찰·실제 사내 모델 검증과 새 Desktop의 남은 기능은 수용 전제다. `releaseReady`는 false다.

## 새 관리형 환경에서 작업 재개 — 2026-11-10 UTC

초기 커밋만 있던 로컬 폴더를 원격 `work`의 `6832d44`로 fast-forward하고 필요한 개발 캐시와 검증 환경을 다시 준비했다. Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, 빌드용 CPython 3.12.14다. 직원용 Windows Python은 고정 3.12.16을 유지한다.

- `npm run verify`: **48개 통과, 실패·건너뜀 0**, 타입 검사·기본 스킬 34개 무결성·공식 Desktop overlay 검증 통과. 기존 45개에 설치 검증 회귀 검사 3개를 추가했다. 실제 로컬 OpenViking 등록/재시작과 고정 v2 엔진의 승인 검사를 포함한다.
- OpenViking/Python 63,060개, REA 9,019개 파일을 각 staging manifest와 대조했다. MCP 20,726개 파일의 manifest는 기존 미완성 해시를 유지하며 누락은 `browser/chrome-win64/chrome.exe` 하나다. 이 상태를 `mcp:verify`가 오류로 거부하는 것을 다시 확인했다.
- `npm run audit:installer`를 추가했다. EXE archive 검사·추출 후 앱 버전/AMD64·OpenViking·REA·MCP·스킬·CLI·설정 예제를 검증하여 audit를 작성한다. TGZ 생성은 해당 EXE 크기/해시, 현재 앱 ASAR/실행 파일·모든 런타임 manifest·CLI와 audit를 다시 대조한다. 변조 파일, 미완성 MCP, 경로 이탈, 다른 EXE/staging/오래된 앱·런타임의 audit를 거부하는 회귀 검사를 통과했다.
- TGZ의 OpenCode 라이선스를 정식 생성 소스 경로에서 가져오고 고정 upstream 해시를 확인하도록 수정했다.

`storage.googleapis.com`의 고정 Chrome과 `api.github.com`의 고정 Ghostty archive 요청은 CONNECT HTTP 403이다. 사용자가 두 도메인을 추가했다고 알린 뒤에도 현재 실행 환경의 spec/observed revision은 모두 1, 추가 허용 목록은 빈 배열이고 실제 두 요청도 계속 403이었다. Desktop workspace의 `bun install --frozen-lockfile`은 완료되지 않았지만, 이미 확보한 해시 검증 archive를 `desktop-dependencies.py`로 복원한 뒤 공식 Desktop 전체 타입 검사 **2개 프로젝트·2,549개 파일 오류 0**과 `npm run build`의 main/preload/renderer 빌드 성공을 확인했다. 원본 CSS 최적화·dynamic import·plugin timing 경고가 남는다. Windows용 Electron 44.9.1과 NSIS 3.0.4.1도 정상 확보했다.

위 48개 회귀 검사와 공식 Desktop 전체 타입 검사/빌드는 각각 별도의 결과다. Chrome이 없어 0.2.2 EXE/TGZ 패키징 및 실제 EXE의 새 audit 자동화는 계속 미수행이다. 새 MCP 6종의 별도 Linux 실호출 기록도 이전 검증 환경의 결과이며 이번 환경에서 재실행했다고 표현하지 않는다.

복구/검증 로그와 Linux 테스트 의존성 목록은 `.cache/resume-2026-11-10/`에 보관했다. 환경 허용 설정 후 인계서 §8의 순서로 Desktop 의존성 설치, Chrome 확보, 완성 bundle 검증·빌드·EXE 실검사·TGZ 생성을 진행한다. 공개 설치본은 계속 0.2.1이며 `releaseReady`도 false다.
