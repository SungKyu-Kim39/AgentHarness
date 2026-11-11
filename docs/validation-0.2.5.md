# L-Vibe 0.2.5 — offline tokenizer data

2026-11-11 KST. [OpenViking 토크나이저 원인·복구](openviking-tokenizer-fix.md)에 확인한 CRLF cache, LiteLLM cache 경로 덮어쓰기와 폐쇄망 첫 import 실패를 기록했다. 새 전체 설치본은 데이터 6개/인코더 7종, 공식 SHA-256, app 소유 cache와 온라인 fallback 없는 loader 및 이전 Windows socketpair 수정을 포함한다.

동일 수정 소스의 전체 회귀 검사 **58개 통과, 실패·건너뜀 0**. 빈 HOME/TEMP와 잘못된 상속 cache에서 실제 SDK를 먼저 import하고 인코더 7종을 검증했다. 검사한 Python 네트워크 호출 경로의 외부 요청 시도 0건이며 누락·손상 시 온라인 복구를 거부한다. installer audit 3개 검사도 별도 통과했다.

빌드 환경은 Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, Python 3.12.14다. Windows Python 3.12.16, Electron 44.9.1, OpenCode Desktop/CLI 2.2.6 및 기존 구성 요소 버전은 유지한다. 새 Python 번들은 **63,069개 파일**, manifest SHA-256 `17b94d19b5cd9efe52c68d0c339682e1fb144fb6e2d7900a607221ad9847d70b`다. 토크나이저 어휘 자료는 모델 가중치가 아니며 tiktoken MIT/GPT-2 Modified MIT 원문을 보존한다.

사용자는 누적 패치가 정상 적용됐고 L-Vibe가 실행됐다고 확인했다. 다만 모델 설정이 표시되지 않는다는 후속 문제가 있어 모델 목록/선택/연결 상태를 별도로 확인 중이다. CHECK_IMPORT 각 성공 줄과 실제 사내 모델 응답까지 확인한 것으로 확대 해석하지 않는다. Win10/11 전체 수용·DNS/TCP·Job Object와 남은 Desktop 기능은 별도이며 `releaseReady: false`를 유지한다.

공식 Desktop 타입 검사는 2개 프로젝트·2,549개 파일 오류 0이며 main/preload/renderer 빌드도 성공했다. 원본 CSS·dynamic import·plugin timing 경고는 남는다. EXE audit는 실제 압축 안의 6종 데이터와 LiteLLM vendor 3파일을 공식 해시에 별도로 대조하고 7종 encoder/lock 확인을 기록하도록 보강했다. 이 기록이 없는 audit로 새 TGZ를 만들 수 없다.

## 실제 설치 EXE 검사

`npm run package:win`과 `npm run audit:installer`가 완료됐다. Linux에서 실제 NSIS archive를 추출한 검사이며 새 EXE를 Windows에서 설치/실행한 검사는 아니다. 자체 배포 서명은 없다.

| 항목 | 결과 |
|---|---|
| 설치 파일 | `L-Vibe-0.2.5-win-x64.exe` |
| 크기 | **1,056,735,627 bytes** |
| SHA-256 | `241703e39356417d497dd324864049d72cb298ae7a37a545d700d9f5fa9d5337` |
| 실제 추출 파일/폴더 | **94,210개/8,740개, 모두 ASCII** |
| ASAR 내부 경로 | **11,584개, 모두 ASCII** |
| ASAR SHA-256 | `c0f7a160e92dde6390dd65fdaf8f2b9fc9d1af835b793fd7a2bc2021598f1ef4` |
| 앱 EXE SHA-256 | `597497db91e908c3bfe7956d52a7048a245b20bd65a5add6991c20f2a01c5877` |
| CLI SHA-256 | `d55839bfc180fd573341265c750eaee72c3ebb2e57f3e2b3eca9cf3449b93507` |

실제 EXE의 OpenViking **63,069개**, REA **9,019개**, MCP **21,031개**, 기본 스킬 **34개/259개 파일**을 manifest와 전수 SHA-256 대조했다. 토크나이저 데이터 **6종/인코더 7종**, LiteLLM vendor **3파일**은 공식 해시에 별도 대조했다. tokenizer lock SHA-256은 `75d2ce8112c9f1e4ccc9654f9243a77c29a95d66f7087ad71e9b50ebdcb8cc02`다. 실제 ASAR 제품/버전은 L-Vibe 0.2.5이며 앱/CLI는 AMD64다.

TGZ는 위 실제 EXE/audit와 커밋된 소스를 대조해 생성한다. 최종 TGZ 해시·소스 체크포인트·게시 결과는 [다운로드 안내](../downloads/README.md)에 기록하며, 묶음 안 보고서는 생성 직전까지의 검사 기록이다.
