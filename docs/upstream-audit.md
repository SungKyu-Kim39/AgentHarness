> 과거 L-Vibe 배포·검토 기록이다. 당시 이름·경로·해시를 보존한다. 현재 Ned 구성은 [0.3.0 검증 상태](validation-0.3.0.md)를 따른다.

# Desktop 기반 초기 구현 점검

기준: OpenCode v2.2.6 / `dc2ffcf8bf26f9e669b6aa22b95f50e12be15e06`. archive SHA-256 및 중요 경계 파일은 `upstream-lock.json`에 고정했다. 이 기록은 Windows 배포 검증 결과가 아니다.

## 재사용을 확인한 경계

- `packages/desktop`은 Electron 44.9.1과 Solid 앱을 사용한다. root package manager는 Bun 1.4.4다.
- `SidecarCredentials.ready()`는 렌더러에 origin만 반환한다. 엔진 Basic 자격증명은 native에서 해당 origin의 요청에만 붙이는 기존 코드를 그대로 유지한다.
- 프로젝트·대화·review·파일·질문 UI와 typed IPC는 upstream을 재사용한다. 새 React 화면을 개발하지 않는다.
- v2 설정은 `providers`, `permissions`, `policies`, `plugins`, `mcp.servers`를 사용한다. 1.19.5의 설정 객체와 HTTP 계약을 그대로 연결하지 않는다.

## 초기 패치

- native 상수·제품 ID·packaging·프로토콜·기본 HTML 제목을 L-Vibe로 변경한다.
- Windows installer의 OpenCode 채널 간 기존 설치 이동/삭제 코드를 L-Vibe 전용 경로·최초 JSON 준비 파일 가져오기로 대체한다. 기존 설정을 덮어쓰지 않는다.
- 지정한 PNG/ICO를 Desktop icon 복사 흐름과 favicon에 배치한다.
- 앱 전용 XDG/config 경로를 lazy module 로딩 전에 설정한다. 사용자 셸 환경 가져오기·기존 서버 사전 탐색을 제거한다.
- 초기 설정은 provider/tool/integration/plugin/MCP/skill/websearch 사용을 거부한다. native 설정·gateway·승인 연결이 완료되기 전에 기본 권한을 열지 않는다.
- Sentry 초기화, native updater의 platform 로딩, updater feed 파일 생성을 중단한다. 업데이트 관련 UI/서버의 다른 경로까지 모두 검증됐다는 의미는 아니다.
- 공식 소스의 중요 경계 파일 전체를 먼저 확인한 뒤 패치를 기록한다. 다른 커밋이나 혼합된 경계 파일이면 적용 전 실패한다. 준비된 패치 대상·고정 경계 파일·overlay가 변경되면 검증에 실패한다. upstream의 모든 파일을 지속 감시하는 검증은 아니다.

## 남은 구현과 실제 제약

- upstream v2는 지속적인 background service를 사용하는 경로가 있다. 사전 탐색 제거와 전용 설정 폴더만으로 앱 동반 종료가 구현됐다고 간주하지 않는다. 앱이 소유하는 서버·자식 프로세스 종료로 이관해야 한다.
- native 다중 LLM 선택/키 저장/gateway, OpenViking·REA·Graphify·Serena, 도구 승인·반복 감지·재출력의 v2 연결은 후속 구현이다. 원형에 코드가 있어도 새 Desktop에서 검증되기 전 완료로 표시하지 않는다.
- 자동 승인 검토가 전역 HOME/USERPROFILE 덮어쓰기와 Windows ACL 변경을 포함한 첫 패치를 거부했다. 대체 구현은 둘 다 변경하지 않는다. 자식 프로세스 환경·기존 설정 비상속·Windows sandbox/ACL의 실검증은 출시 조건으로 유지한다.
- 전체 upstream 의존성 설치·Bun lint/typecheck·실제 Desktop 실행·Windows 설치·DNS/TCP·사내 모델 검증은 아직 수행하지 않았다. 현재 검증은 고정 소스 적용·파일 해시·변경 TS 구문·부트 환경 계약에 한정한다.

`distribution/readiness.json`이 미완료 조건을 명시하며 기본 build/package 경로는 이를 확인하고 중단한다. 준비된 소스만으로 설치본을 출시하지 않는다.
