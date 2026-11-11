# L-Vibe 0.2.6 — personal OpenViking knowledge migration

2026-11-11 KST. 기존 OpenViking 0.5.0의 사용자 영역을 OVPack v3로 내보내고 L-Vibe의 0.5.4에 가져오는 기능을 추가했다. 가져온 자료는 해당 PC 사용자의 모든 프로젝트에서 읽기 전용 개인 도구로 검색한다. 기존 프로젝트 지식 도구의 범위는 유지한다.

## 변경과 경계

- 루프백 서버의 사용자 영역만 내보내는 독립 도구. 키는 로컬에서 입력하며 외부 URL·리다이렉트·기존 출력 덮어쓰기를 거부한다.
- 네이티브 파일 선택·고정 사본 검사·영역/파일 수/SHA-256 확인·승인을 거친 가져오기. `on_conflict=fail`, SDK가 결정하는 벡터 `auto` 정책을 사용한다.
- 원본 OVPack과 상태를 보존한다. 동일 파일 중복 가져오기는 생략하고 실패/충돌을 자동 덮어쓰지 않는다.
- memories/resources/정적 skills/peer memories만 개인 검색·읽기에 노출한다. sessions/privacy 관리 자료는 개인 검색 결과에서 제외한다. 새 대화 자동 업로드·스킬 스크립트 실행·수정 권한 부여는 추가하지 않았다.
- 원본 사용자 ID를 앱 전용 account 안에서 유지한다. 네이티브 계층만 검증한 원본 ID로 요청하며 모델에 사용자 전환 인자를 제공하지 않는다. 프로젝트 도구의 기본 ID는 local-user다.
- 0.5.4 OVPack의 사용자 루트 가져오기가 가상 컨테이너 `viking://user`를 mkdir하려다 실패하는 경로를 확인했다. 고정 원본 helper의 정규화 소스 SHA-256 `91a8134aabc54256c30963c1d565295eaf8b11e9ded02dca53854c0349af27a7`을 검사한 런처 어댑터로 그 가상 부모만 처리한다. SDK archive/소유자/대상 쓰기 권한/충돌 검사는 그대로 실행한다. 원본 SDK 파일은 변경하지 않는다.

## 현재 검사 근거

Linux 테스트 환경에서 실제 OpenViking **0.5.0 서버 → 내보내기 도구 → 0.5.4 서버**의 가져오기, 호환 벡터 재사용, 서로 다른 두 프로젝트의 개인 검색·원문 읽기 및 재시작 후 조회를 확인했다. 최종 전체 검사에서 해당 실제 버전 간 검사는 약 79.5초에 통과했다. 원래 사용자 영역에 대한 다른 사용자의 쓰기 거부, 점·@ 문자가 있는 peer의 기억 조회, 두 프로젝트 및 새 서비스 인스턴스의 재시작 검사를 포함한다. 계정 초기화의 비동기 임베딩과 구분하여 테스트용 추적으로 SDK의 실제 벡터 restore 결정을 확인했다.

사용한 0.5.0 Linux wheel은 `openviking-0.5.0-cp310-abi3-manylinux_2_31_x86_64.whl`, SHA-256 `2831f66c9c1aa3095f24d135c81d08ec943ad245caf93504722d7aa2d9e27f19`다. 별도 테스트 경로에 풀어 사용했으며 직원 배포본에는 0.5.0 SDK를 추가하지 않는다. 모델 endpoint는 가상 응답을 반환하는 로컬 HTTP 서버이며 사용자 자료와 실제 API 키는 사용하지 않았다.

승인 거절·승인 뒤 원본 파일 변경·위험 경로·활성 사용자 영역 거부·중복/실패 처리·개인 범위 밖 결과 제거·종료 후 늦은 승인 거부·로컬 내보내기 검사 5개도 통과했다. 보존한 원본의 SHA와 승인 대상의 일치 여부를 검사한다.

Python 3.12.16/344개 Windows wheel과 토크나이저 6종/인코더 7종은 유지한다. 새 런처를 포함한 Python manifest는 `1dee469d101abd55b8c350640c1d86098aded233cbd1fcbf21a0af4d83d147d9`이며 파일 수는 63,069개다.

Windows EXE/TGZ·공식 Desktop 빌드와 공개 다운로드 검사는 실제 완료 후 기록한다. Linux 합성 자료의 성공을 실제 직원 PC 자료 이관·Windows 10/11 전체 수용으로 계산하지 않는다. `releaseReady: false`를 유지한다.

최종 `npm run verify`: **64개 통과, 실패·건너뜀 0**. 타입 검사·기본 스킬 34개·Desktop overlay 검증도 통과했다. 공식 Desktop 타입 검사는 **2개 프로젝트·2,549개 파일 오류 0**(약 22.5초), main/preload/renderer 빌드도 성공했다. 원본 CSS·dynamic import·plugin timing 경고는 남는다. 검사 환경은 Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, Python 3.12.14이며 Windows 런타임은 Python 3.12.16/Electron 44.9.1이다.

## 실제 설치 EXE 검사

`npm run package:win` 및 `npm run audit:installer`를 완료했다. Linux에서 실제 NSIS archive를 추출한 검사이며 Windows 설치/실행 수용과 구분한다. 자체 배포 서명은 없다.

| 항목 | 결과 |
|---|---|
| 설치 파일 | `L-Vibe-0.2.6-win-x64.exe` |
| 크기 | **1,056,739,808 bytes** |
| SHA-256 | `8a37d20f1607c4b21854abec4474ae7a1aabb578848ca58b077261b0a57f7cdd` |
| 실제 추출 파일/폴더 | **94,210개/8,740개, 모두 ASCII** |
| ASAR 내부 경로 | **11,584개, 모두 ASCII** |
| ASAR SHA-256 | `bb9a4cd7fde56f84f4ad3c1770356c10c51a44fbcb4201ae15c3ad7e4f14c10e` |
| 앱 EXE SHA-256 | `0e2b1abd67c853a6b051f0d366790281328f2fcc8b3e5a5323911f1b5d710712` |
| CLI SHA-256 | `d55839bfc180fd573341265c750eaee72c3ebb2e57f3e2b3eca9cf3449b93507` |

OpenViking 63,069개·REA 9,019개·MCP 21,031개·스킬 34개/259개 파일을 각 manifest와 전수 해시 대조했다. 토크나이저 데이터 6종/인코더 7종 및 LiteLLM vendor 3파일도 공식 해시에 별도 대조했다. 실제 ASAR 제품/버전은 L-Vibe 0.2.6이며 앱/CLI는 AMD64다.

최종 TGZ와 소스 체크포인트·게시 검사는 생성 후 [다운로드 안내](../downloads/README.md)와 검사 기록에 추가한다. TGZ 안 보고서는 생성 직전까지의 검사 기록이다.

최종 반입 TGZ: **1,122,446,227 bytes**, SHA-256 `a3942de63c78b0e89d9149f07f7f6c4ddf6d31b30f9020878fcc8191ba3359c6`. 전체 **37개 항목/34개 파일**과 소스 archive **535개 항목**의 경로가 ASCII이며 체크섬 목록을 제외한 **33개 파일**을 전수 대조했다. EXE/audit·설정 예제·CMD CRLF·검사/내보내기 스크립트·이관 문서·tokenizer lock도 원본에 대조했다. sourceCommit은 `8ffa36ea3baec751af55b3f4ab02dfe3274132ef`다. 이 TGZ 자체 수치는 생성 후 추가했으며 내부 보고서는 생성 직전까지의 기록이다.

공개 게시 커밋 `5e575a9aaec4d10882aa671a5a78641b4dd844cc`의 다운로드를 확인했다. TGZ는 공개 주소에서 전체 스트리밍 다운로드하여 **HTTP 200·1,122,446,227 bytes·SHA-256**이 로컬 산출물과 일치했다. EXE는 HEAD HTTP 200·전체 크기와 range HTTP 206·첫 65,536 bytes의 PE 헤더를 확인했다. EXE 원격 전체 재다운로드는 수행하지 않았으며 전체 해시는 검증한 로컬 EXE와 업로드한 Git LFS object ID에 대응한다. [공개 다운로드 검사 기록](../downloads/L-Vibe-0.2.6-public-audit.json)을 보존한다. 실제 직원 PC 자료의 이관·Windows 수용 결과는 별도다.
