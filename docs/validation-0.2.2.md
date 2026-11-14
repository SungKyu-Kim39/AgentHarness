> 이 문서는 당시 L-Vibe의 배포·검토 기록입니다. 버전·경로·해시는 당시 값을 유지합니다. 최신 구성은 [Ned 0.3.7 검증 기록](validation-0.3.7.md)을 참고하세요.

# L-Vibe 0.2.2 — 오프라인 설치 검증 후보

공식 OpenCode Desktop/CLI v2.2.6 (`dc2ffcf8bf26f9e669b6aa22b95f50e12be15e06`) 기반입니다. `releaseReady`는 false이며 Windows 실행 실환경 검증 완료를 의미하지 않습니다. MCP 6종의 별도 실제 Linux 호출은 [기존 검증 기록](mcp-validation.md)에 있습니다.

## 코드·빌드 검증 — 2026-11-10 UTC

- 환경: Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, 빌드용 CPython 3.12.14. 직원용 Windows Python은 고정 3.12.16, Electron은 44.9.1입니다.
- `npm run verify`: **48개 통과, 실패·건너뜀 0**, 타입 검사·스킬 34개 무결성·공식 Desktop overlay 검증 통과. 실제 로컬 OpenViking 등록/재시작과 고정 v2 엔진 승인 검사를 포함합니다.
- 병행 빌드 중 원형 엔진 테스트의 정리 hook에서 ENOTEMPTY가 발생했습니다. 호스트·합성 모델 서버를 종료한 뒤 임시 폴더를 삭제하도록 정리 순서를 고치고 전체 48개 검사를 다시 통과했습니다. 검사를 건너뛰거나 승인/종료 조건을 완화하지 않았습니다.
- 공식 Desktop 타입 검사: **2개 프로젝트·2,549개 파일 오류 0**. main/preload/renderer 빌드 성공. 원본 CSS 최적화·dynamic import·plugin timing 경고는 남습니다.
- NSIS 변경 후 고정 원본 Desktop patch 계획 검사 3개 통과, 생성 소스 갱신 및 전체 Desktop 빌드 성공.
- MCP 제어 번들 `l-vibe-control-p_xX6Qxp.js` SHA-256: `411b822f40c8bc4bda23ecf403eeeb8a302a5647e2cede41ca8e1a7889756501`.

48개에는 초기 원형의 반복 감지·답변 재출력 검사도 들어 있습니다. 새 Desktop의 반복 감지·재출력·세션 diff·일반 명령은 아직 구현·검증이 남아 있습니다. MCP 6종의 Linux 실호출 결과는 이전 환경에서 얻었으며 이번 환경에서는 다시 실행하지 않았습니다.

## 완성 Windows 런타임

- OpenViking/Python **63,060개**, REA **9,019개** 파일을 각 manifest와 대조했습니다.
- MCP는 고정 Chrome for Testing **157.0.8103.50**을 포함해 **21,031개 파일, complete=true, 누락 0개**이며 `npm run mcp:verify`를 통과했습니다.
- 완성 MCP manifest SHA-256: `002382abd6455f38e943182384b6bddb9e3c1973aae2ef13db6fab1387d901d1`. 이전 미완성 manifest 값을 사용하지 않습니다.
- Chrome ZIP은 **210,617,577 bytes**, SHA-256 `36088dd9c76c992f6e745fc20f94aca873f69c3331ce25ea3df36835cc4af73f`입니다. 공식 응답 MD5와 대조하고 ZIP 305개 항목의 CRC 검사를 통과했습니다. ABOUT 원문을 포함합니다.
- 실행 환경 정책 revision 2에서 공식 Chrome과 GitHub API 접근이 정상화됐고, `bun install --frozen-lockfile`도 완료했습니다. 고정 Electron 44.9.1·NSIS 3.0.4.1을 확보했습니다.

## 설치 EXE·TGZ

약 **3,169,734,855 bytes / 94,197개 파일**의 앱 묶음은 기존 NSIS solid 압축의 31비트 data block 한도 때문에 컴파일러 SIGBUS를 재현했습니다. 컴파일러 버전을 유지하고 파일별 zlib 압축으로 변경했습니다. 전체 구성 요소를 한 EXE에 담으며 직원 PC의 추가 다운로드를 요구하지 않습니다.

- `npm run package:win` 종료 코드 **0**. 설치 파일: `L-Vibe-0.2.2-win-x64.exe`, **1,055,821,574 bytes**.
- EXE SHA-256: `205eb11fccdffdfbdbb2d078bde0cf4f19cd53b110f2103c9e21c307f0674876`.
- `npm run audit:installer` 종료 코드 **0**. 실제 EXE를 실행하지 않고 archive 검사·추출하여 **94,201개 파일**을 확인했습니다. 실제 추출한 OpenViking 63,060개·REA 9,019개·MCP 21,031개와 스킬 34개/259개 파일의 manifest·SHA-256을 전수 대조했습니다.
- 앱/CLI PE는 AMD64, 실제 ASAR의 이름/버전은 L-Vibe 0.2.2입니다. 추출 앱 ASAR·실행 파일은 최종 staging과 일치합니다. 설정 예제/스킬 lock도 원본과 동일합니다. CLI SHA-256: `d55839bfc180fd573341265c750eaee72c3ebb2e57f3e2b3eca9cf3449b93507`.
- 앱 ASAR SHA-256: `c195326d1b0189ebf465ef48acead10ba334a05e14b6d6ebfde423e1b1687f26`. 앱 EXE SHA-256: `b9c8cccfb6c2eda8cd99d7515a32fd81696265c6ecbcfaab66d5cdbb32f0b3ab`.
- NSIS는 파일별 zlib 모드이며 컴파일러/번들 버전을 변경하지 않았습니다. L-Vibe 자체의 배포 서명은 없습니다. EXE 정적 검사는 Windows 설치·실행 검증을 대신하지 않습니다.

TGZ는 이 EXE·빈 설정 예제·검증 기록/상태·런타임 audit·라이선스·대응 소스·커밋된 앱 소스를 포함합니다. 실제 EXE 해시와 모든 런타임 manifest/앱/CLI를 다시 확인한 뒤 생성합니다. archive의 SHA-256은 옆 `.sha256` 파일로 제공합니다. 최종 TGZ `L-Vibe-0.2.2-windows-x64.tgz`는 **1,121,427,289 bytes**, SHA-256 `43fa97c107f168b0121b7c7d720b879ac1391e04d01cc01d4a93bbfe24594b8a`입니다. 내부 23개 파일의 체크섬, 0.2.2 설치 안내, EXE와 감사 기록 및 대응 소스를 전부 대조했습니다. sourceCommit은 `b8722666e20e0525d320e636f5b41e689e2879b3`입니다. [다운로드 안내](../downloads/README.md)를 따릅니다. 게시 커밋 `6b624d81b9ebc9bfa75637dcc56e4e201cea9af0`의 공개 EXE/TGZ 주소에서 HTTP 200을 확인하고 전체 파일을 스트리밍하여 바이트 수와 SHA-256을 재계산했습니다. 두 파일 모두 로컬 산출물·Git LFS object ID·옆의 `.sha256`과 일치했습니다. 실제 응답 호스트는 `media.githubusercontent.com`입니다. 원격 전체 다운로드 검증까지 완료했습니다.

## 남은 Windows 수용

Windows 10/11 일반 사용자 설치·첫 실행·업데이트·실제 DLL 로딩·6종 도구 호출·ACL·DPAPI·Job Object 자식 종료·DNS/TCP 관찰·사내 Qwen/임베딩 서버·실제 C/C++ 프로젝트/SDK 검증은 아직 실행하지 않았습니다. 새 Desktop의 남은 기능도 별도 수용 전제입니다. `releaseReady: false`를 유지합니다.
