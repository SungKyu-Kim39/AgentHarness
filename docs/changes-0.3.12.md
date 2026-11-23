# Ned 0.3.12 변경 사항

- **권한 정책 정비 (터미널·외부 읽기·지식 저장)**:
  - CMD·PowerShell(`run_terminal`)은 기존 1인자 읽기 화이트리스트를 **최소 고위험 가드**로 전환했습니다. 일반 개발·빌드·테스트·조회 명령(`npm`, `node`, `python`, `pytest`, `git`, `msbuild`, 플래그·파이프 포함)은 **전체 권한** 모드에서 팝업 없이 실행하며, 디스크·파티션(`format`, `diskpart`), 레지스트리·서비스·방화벽·시스템 권한(`reg`, `sc`, `netsh`, `icacls`, `takeown`), 시스템 경로(`C:\Windows`, `Program Files`) 변경, 프로젝트 외부 강제 재귀 삭제(`Remove-Item -Recurse -Force`, `rm -rf`, `rd /s`), 파괴적 원격 Git(`git push --force`), 외부 네트워크 전송(`Invoke-WebRequest`, `curl`, `iwr`)만 전체 권한에서도 명시적 승인창을 유지합니다.
  - 프로젝트 외부 로컬 파일·폴더 읽기(`read_external_file`, `list_external_directory`)는 **승인 요청**·**프로젝트 파일 자동 승인** 모드에서 승인 후 허용하고 **전체 권한** 모드에서 자동 승인합니다. `%APPDATA%\Ned`(키·자격증명·글로벌 스킬 폴더 포함)와 개인 프로필 경로는 항상 차단하며, 외부 파일 생성·수정·삭제는 기존과 같이 원천 차단합니다.
  - OpenViking 지식 저장·갱신·삭제(`knowledge_remember`, `knowledge_forget`)는 **승인 요청**·**프로젝트 파일 자동 승인** 모드에서 승인창을 유지하고 **전체 권한** 모드에서는 팝업 없이 처리합니다.
- **승인창·선택창 최상단 표시**:
  - Windows에서 백그라운드 트레이 프로세스가 띄우는 승인 팝업과 파일·폴더 선택창이 Zed 창 뒤로 가려지지 않도록 활성 모니터 중앙의 투명 최상단 소유자 창(`screen-saver` 레벨)을 거쳐 화면 맨 앞에 표시합니다. Python Conda 환경 선택창도 최상단으로 올립니다.
- **OpenViking Studio 진단 강화 및 보완**:
  - 차단된 요청 URL(`onBeforeRequest`), 로드 실패(`did-fail-load`), 렌더러 콘솔 경고·오류(`console-message`), 실패 시점의 현재 URL과 `#app` DOM 요약을 `%APPDATA%\Ned\openviking\studio-status.json`에 상시 기록합니다(토큰·개인 경로 마스킹).
  - 비허용 요청 차단으로 UI 부팅이 막힌 경우 `STUDIO_RENDER_TIMEOUT` 대신 `STUDIO_BLOCKED_REQUEST`로 구분합니다.
  - 동일 origin `blob:` 리소스 허용(인증 헤더 제외), `font-src` CSP `blob:` 보완, `/studio` 경로 프리로드 호환을 반영하고 초기 렌더 타임아웃을 15초에서 30초로 늘렸습니다.
- **OpenViking 요청 오류 세분화 및 상시 진단**:
  - `OV_FORBIDDEN`, `OV_TIMEOUT`, `OV_EMBEDDING`, `OV_SERVER_ERROR`, `OV_TLS` 오류 코드를 추가하고, `OpenVikingGateway`의 임베딩 모델 연결·HTTP 실패가 `OV_REQUEST`로 가려지지 않고 세부 코드로 전달되도록 보완했습니다.
  - 실패한 OpenViking 요청의 `HTTP <status> <route>`와 토큰·개인 경로를 마스킹한 응답 본문(최대 500자)을 `%APPDATA%\Ned\openviking\request-diagnostics.json`에 상시 기록합니다.
- **전체 설치본 단일화 및 트레이 메뉴 정리**:
  - Core 설치 EXE와 별도 리버싱 팩 TGZ(`INSTALL.ps1`) 이원화를 제거하고 전체 설치본(Full EXE/TGZ) 단일 배포로 단순화했습니다. 기존 0.3.11 Core+팩 설치 환경에서 제자리 업데이트할 때 남아 있는 `%APPDATA%\Ned\packs\reversing\0.3.11` 폴더는 충돌 없이 무시합니다.
  - 기본 대화에서 리버싱(REA/Ghidra)·데스크톱(`agent-desktop`) 도구 스키마를 요청 시에만 노출하는 지연 로딩은 그대로 유지합니다.
  - 알림 영역 **사용 안내** 메뉴의 버전 변경 사항 링크가 현재 설치 버전(`changes-0.3.12.md`)을 열도록 수정하고 지식 저장·검색 안내를 추가했습니다.
