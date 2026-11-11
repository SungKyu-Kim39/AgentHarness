# L-Vibe 0.2.3 — ASCII package paths

0.2.2 TGZ를 일부 Windows 압축 도구로 해제했을 때 한글 파일명이 깨지는 문제를 수정한다. `GETTING_STARTED.txt`, `VALIDATION_REPORT.md`, `READINESS.json`을 사용하며 제품이 배포하는 파일·폴더 이름은 printable ASCII로 제한한다. 한국어 문서 내용과 UI 문구는 유지한다.

`package-paths.mjs`가 배포 디렉터리·Git 소스 트리·실제 tar 헤더를 검사한다. EXE를 추출한 파일·폴더와 ASAR 내부 경로도 검사한다. 누락된 ASCII 검사 기록이나 이전 버전 audit로 새 TGZ를 생성할 수 없다. 비 ASCII 경로가 발견되면 생성/게시 단계가 실패한다.

## 코드·빌드 검증 — 2026-11-11 KST

- 환경: Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, 빌드용 CPython 3.12.14. Windows Python은 3.12.16, Electron은 44.9.1, 공식 OpenCode Desktop/CLI는 v2.2.6 (`dc2ffcf8bf26f9e669b6aa22b95f50e12be15e06`)이다.
- `npm run verify`: **51개 통과, 실패·건너뜀 0**. 타입 검사·스킬 34개 무결성·공식 Desktop overlay 검사도 통과했다. 실제 로컬 OpenViking 등록/재시작 및 고정 v2 엔진 승인 검사를 포함한다.
- 추가 회귀 검사는 한국어 문서 내용 허용/한글 파일명 거부, 실제 TGZ 헤더의 Unicode 폴더 거부, 커밋된 비 ASCII 소스 파일명 거부를 확인한다. ASCII 검사 기록이 없는 installer audit의 재사용도 거부한다.
- 공식 Desktop 타입 검사: **2개 프로젝트·2,549개 파일 오류 0**. main/preload/renderer 빌드 성공. 원본 CSS·dynamic import·plugin timing 경고는 남는다.
- `npm run mcp:verify`: 고정 Chrome 157.0.8103.50을 포함한 **21,031개 파일, complete=true, 누락 0개**. 런타임 버전과 잠금 해시는 0.2.2와 동일하다.

51개에는 초기 원형의 반복/재출력 검사도 있다. 새 Desktop의 해당 기능이나 MCP 6종의 별도 Linux 실호출을 이번 변경에서 새로 완료했다고 계산하지 않는다. 기존 MCP 실호출은 [검증 기록](mcp-validation.md)을 따른다.

## 실제 설치 EXE 검사

`npm run package:win`과 `npm run audit:installer` 모두 종료 코드 **0**이다. L-Vibe 자체 배포 서명은 없다. EXE를 Windows에서 실행한 검사가 아니라 Linux에서 NSIS archive를 검사·추출한 결과다.

| 항목 | 결과 |
|---|---|
| EXE | `L-Vibe-0.2.3-win-x64.exe` |
| 크기 | **1,055,821,027 bytes** |
| SHA-256 | `a3229dc9342a68628eb5e4eaa4f8b5173a6dd010490380f62e3bd0dff34decb2` |
| 실제 추출 경로 | **94,201개 파일·8,739개 폴더, 모두 ASCII** |
| ASAR 내부 경로 | **11,584개, 모두 ASCII** |
| 앱 ASAR SHA-256 | `46b6a52db9e69a392047c01f61075f0f4eb7b33d572b184a465fac5174422af6` |
| 앱 EXE SHA-256 | `83e6b3f56f1725bf1df117af4ec4066fda68ed46e90186aedc3ad463c09d1d68` |
| CLI SHA-256 | `d55839bfc180fd573341265c750eaee72c3ebb2e57f3e2b3eca9cf3449b93507` |

실제 추출한 OpenViking **63,060개**, REA **9,019개**, MCP **21,031개**, 기본 스킬 **34개/259개 파일**을 각 manifest의 SHA-256과 전수 대조했다. 완성 MCP manifest SHA-256은 `002382abd6455f38e943182384b6bddb9e3c1973aae2ef13db6fab1387d901d1`이다. 앱/CLI PE는 AMD64, 실제 ASAR의 제품/버전은 L-Vibe 0.2.3이며 앱 ASAR/EXE·CLI·설정 예제·스킬 lock이 staging 및 원본과 일치한다.

## TGZ 검사와 적용 범위

`npm run bundle:offline`은 위 EXE와 현재 audit를 다시 대조하고 커밋된 소스, 빈 설정 예제, 영문 이름의 안내/검증/출시 상태 문서, 라이선스·대응 소스를 묶는다. 배포 트리·실제 TGZ 헤더·포함된 L-Vibe 소스 archive의 파일·폴더 이름을 검사한다. TGZ 자체 SHA-256은 옆 `.sha256` 파일로 제공한다. 최종 다운로드와 별도 검사 기록은 [다운로드 안내](../downloads/README.md)를 따른다.

실제 생성 명령 종료 코드 **0**. 최종 `L-Vibe-0.2.3-windows-x64.tgz`는 **1,121,442,442 bytes**, SHA-256 `c5ed612dc7f7fe9ad6f5c7c7899eaf83693aa9b7bb0b77d508e58256b5d144e9`다. 실제 TGZ의 27개 항목/24개 파일 및 포함된 L-Vibe 소스 archive의 473개 항목 이름이 모두 ASCII다. 체크섬 목록 자체를 제외한 **23개 파일의 SHA-256**을 전수 대조했다. EXE/audit·설정 예제·0.2.3 안내 내용도 원본과 일치한다. sourceCommit은 `93c3df35e9c6a1000ff972148de6aac99d29c9c9`다. 이 최종 TGZ 수치와 게시 결과는 생성 후 추가한 기록이며 TGZ에 포함된 보고서는 생성 직전 EXE 검사까지의 기록이다.

게시 커밋 `b6315e6da768755d55ca2c16215c623a8b2a0c1d`와 원격 `work`를 대조했다. 공개 EXE/TGZ 두 주소에서 **HTTP 200**, 전체 바이트 수 및 스트리밍 SHA-256이 로컬·Git LFS object ID와 일치함을 확인했다. [공개 다운로드 검사 기록](../downloads/L-Vibe-0.2.3-public-audit.json)을 보존한다.

검사 대상은 제품이 배포·설치하는 상대 경로다. 한국어 UI/문서 내용과 사용자가 선택한 프로젝트·Windows 프로필 경로는 바꾸지 않는다. 고정 원본 라이선스와 원본 대응 소스 archive의 바이트는 유지한다.

## 남은 수용

Windows 10/11 일반 사용자 설치·업데이트·실제 DLL 로딩·6종 도구 호출·ACL·DPAPI·Job Object 자식 종료·DNS/TCP 관찰과 사내 Qwen/임베딩 서버·실제 C/C++ 프로젝트/SDK 검증은 미수행이다. 새 Desktop의 반복/재출력·세션 전체 diff·일반 명령 기능도 후속 작업이다. `releaseReady: false`를 유지한다. 0.2.2 검증은 [이전 기록](validation-0.2.2.md)에 보존한다.

게시 후 설정 파일 수명 안내와 [라이선스 정책 재검토](license-policy.md)를 추가했다. 저장 설정이 있으면 설치기가 메모장을 열지 않고 최초 가져오기용 JSON을 만들지 않는 코드 경로를 확인했다. 조직의 실제 사용권과 대응 소스 완전성을 포함한 정식 재배포 라이선스 검토는 미완료이며 이 문서의 해시 검증으로 대체하지 않는다.
