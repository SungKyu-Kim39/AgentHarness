# L-Vibe 0.2.4 — Windows OpenViking startup fix

2026-11-11 KST. Windows asyncio가 내부 TCP socketpair를 만들 때 기존 모델 중계 포트 제한에 차단되는 실행 경로를 수정한다. [원인과 기존 설치본용 패치](openviking-windows-loopback-fix.md)에 상세 근거를 기록한다. 지정하지 않은 로컬 포트·외부 connect/connect_ex·외부 DNS 차단은 유지한다.

새 Desktop 소스는 실패 단계와 코드·종료 숫자/안전한 오류 분류만 `%APPDATA%\L-Vibe\openviking\startup-status.json`에 기록한다. 원래 Python 출력·실제 API 키·모델 요청/응답은 이 파일에 저장하지 않는다. 0.2.2/0.2.3용 작은 launcher 패치에는 이 Desktop 진단 기능이 포함되지 않는다.

동일 수정 소스의 전체 회귀 검사 **56개 통과, 실패·건너뜀 0**, 타입 검사·스킬 34개·Desktop overlay 검증을 통과했다. 실제 고정 OpenViking 0.5.4의 Windows TCP 방식 import 재현도 통과했다. 빌드 환경은 Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, Python 3.12.14이며 Windows 런타임은 Python 3.12.16/Electron 44.9.1이다. 사용자 Windows의 패치 적용 후 재시작과 사내 모델 결과는 미확인이다.

공식 Desktop 타입 검사는 **2개 프로젝트·2,549개 파일 오류 0**, main/preload/renderer 빌드도 통과했다. 원본 CSS·dynamic import·plugin timing 경고는 남는다. 고정 Windows Python은 344개 wheel/63,060개 파일로 재생성했고 manifest SHA-256은 `42f101caef4f976cc20bc3df5f1b3a25356f1a75d3f0297b79af77379733c901`이다. 원본과 비교해 launch.py의 해시만 바뀌며 별도 기존 설치본용 패치의 새 manifest와 동일하다.

반입 묶음에는 영문 이름의 설정 복구·라이선스·Windows 진단 문서와 CHECK_OPENVIKING.cmd/검사 스크립트를 포함한다. 이 도구는 설치된 번들 Python과 수정된 정책을 사용하며 실제 API 키/설정을 읽지 않고 임시 HOME에서 모듈 import를 검사한다. 실제 Windows 서비스/모델 수용은 별도다.

## 실제 설치 EXE 검사

`npm run package:win`과 `npm run audit:installer` 모두 종료 코드 **0**. NSIS archive를 Linux에서 검사·추출했으며 Windows에서 EXE를 설치/실행한 검사는 아니다. 자체 배포 서명은 없다.

| 항목 | 결과 |
|---|---|
| 설치 파일 | `L-Vibe-0.2.4-win-x64.exe` |
| 크기 | **1,055,825,166 bytes** |
| SHA-256 | `b6f5363d8331c9019029f05c0affba7858cc7c24f49e0d42d7e08751a2fc90b8` |
| 실제 추출 파일/폴더 | **94,201개/8,739개, 모두 ASCII** |
| ASAR 내부 경로 | **11,584개, 모두 ASCII** |
| ASAR SHA-256 | `dd6cd6620b75a5f6875b9dfa23c6740c53cadcb84036d1c5c2516f2f65d81d11` |
| 앱 EXE SHA-256 | `a547ac2c1e74bc199c4714c35718fefa13424a25fbef68b405b54816cc5425b5` |
| CLI SHA-256 | `d55839bfc180fd573341265c750eaee72c3ebb2e57f3e2b3eca9cf3449b93507` |

실제 EXE에서 추출한 OpenViking 63,060개·REA 9,019개·MCP 21,031개·기본 스킬 34개/259개 파일을 각 manifest와 전수 SHA-256 대조했다. MCP manifest는 `002382abd6455f38e943182384b6bddb9e3c1973aae2ef13db6fab1387d901d1`, 스킬 manifest는 `2aec810670e3f3999ff63fcb8688fd0bc33c7180fd9e1eac6b33c288a88c4f4c`다. 실제 ASAR의 제품/버전은 L-Vibe 0.2.4이고 앱/CLI는 AMD64이며 staging·설정 예제·스킬 lock과 일치한다.

TGZ는 이 실제 EXE/audit를 다시 대조한 후 생성한다. TGZ 자체 해시는 옆 `.sha256`, 최종 파일/소스 체크포인트/게시 결과는 [다운로드 안내](../downloads/README.md)를 따른다. 영문 배포 트리와 실제 TGZ 헤더·포함된 L-Vibe 소스 archive의 ASCII 경로를 검사한다.

최종 `L-Vibe-0.2.4-windows-x64.tgz`는 **1,121,480,970 bytes**, SHA-256 `b5bac4ed0735c8e1fce8453fc441a36c731964dbd735c8089529b063a1c6b84d`다. 33개 항목/30개 파일 및 포함된 소스 archive의 496개 항목 경로 모두 ASCII다. 체크섬 목록을 제외한 **29개 파일**을 전수 SHA-256 대조했고 EXE/audit·설정 예제·0.2.4 안내·추가 진단 스크립트·CMD CRLF와 문서도 원본에 대조했다. sourceCommit은 `0976c3eba95c4d21015b97856e9d415d1c4dbbe2`다. 이 TGZ 자체 수치는 생성 후 저장소에 추가한 기록이며 TGZ 안의 보고서는 생성 직전 EXE 검사까지의 기록이다.

공개 게시 커밋 `170512c3f4c2a7e14dcac1beba220092baced506`과 원격 work를 대조했다. TGZ는 공개 주소에서 전체 다운로드하여 HTTP 200·바이트 수·SHA-256이 일치함을 확인했다. EXE 공개 주소는 HEAD HTTP 200·크기, range HTTP 206·첫 65,536 bytes의 PE 헤더를 확인했다. EXE 원격 전체 재다운로드는 수행하지 않았으며 실제 EXE의 전체 해시는 로컬 archive 검사·Git LFS content ID에 대응한다. [공개 다운로드 기록](../downloads/L-Vibe-0.2.4-public-audit.json)을 보존한다. 이것을 Windows 설치/실행 수용으로 계산하지 않는다.

모델 설정 예제·기존 저장 설정 보존 안내와 [라이선스 재검토](license-policy.md)를 유지한다. 구성 요소/의존성 버전은 0.2.3과 동일하며 `releaseReady: false`다. Windows 10/11 전체 수용·사내 모델/SDK·DNS/TCP·자식 종료와 새 Desktop의 반복/재출력·세션 diff·일반 명령 구현/검증은 별도로 남는다.
