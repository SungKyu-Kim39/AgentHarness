# L-Vibe

Windows 10·11 x64 폐쇄망에서 프로젝트 코드 분석·수정과 개발 문서 작성을 돕는 Electron 데스크톱 앱입니다. 제품명·설치 경로·데이터 경로를 **L-Vibe**로 적용했고, 지정된 네이비 LIG 로고를 유지했습니다.

현재 산출물은 **0.1 검증 후보**입니다. [검증 보고서](docs/validation.md)의 Windows 실검증과 미구현 항목이 남아 있으므로 1.0 출시 완료로 분류하지 않습니다. 기존 PC의 OpenCode·Zed·플러그인·설정은 읽거나 복제하지 않습니다.

## 직원 PC에서 사용

1. `L-Vibe-0.1.0-Setup.exe`와 사내에서 작성한 `agent-config.json`을 같은 배포 폴더에 둡니다.
2. 설치 EXE를 일반 사용자로 실행합니다. 앱 기본 경로는 `%LOCALAPPDATA%\Programs\L-Vibe`, 사용자 데이터는 `%APPDATA%\L-Vibe`입니다.
3. 설정이 없으면 설치기 옆 JSON을 사용자 데이터 폴더의 준비 파일로 가져옵니다. 첫 실행에서 검증·암호화 후 준비 평문을 삭제합니다. 설정 화면에서 파일을 선택하여 가져오는 방법도 지원합니다.
4. 프로젝트 폴더를 열고 작업을 요청합니다. 파일 수정은 변경 비교를 확인한 뒤 승인합니다.
5. 반복 감지나 수동 중지 후 **중지 확인됨** 상태에서만 답변 재출력을 사용할 수 있습니다. 자동 재출력은 하지 않습니다.

직원 PC에서 npm·pip·uvx·Bun 설치나 Git clone을 수행하는 기능은 없습니다. 모델 가중치와 개인 플러그인은 포함하지 않습니다. 명령 실행과 Serena 의미 분석은 현재 비활성화되어 있습니다.

설정 예시(실제 배포 파일명은 `agent-config.json`):

```json
{
  "schemaVersion": 1,
  "model": {
    "baseUrl": "https://사내-모델-서버/v1",
    "apiKey": "사내에서-발급한-키",
    "id": "서버에-등록된-정확한-ID"
  }
}
```

`baseUrl`은 API 기준 경로이며 `/chat/completions`는 앱이 붙입니다. 모델 목록을 조회하거나 표시 이름에서 ID를 추측하지 않습니다. 기존 설정·손상된 설정·복호화 실패 파일을 자동 덮어쓰지 않습니다. API Key는 렌더러로 전달하지 않으며 Windows Electron `safeStorage`로 보호합니다. 원래 배포 JSON은 사용자가 관리하는 평문 파일이므로 설치 후에도 그대로 남습니다.

## 개발·빌드 PC

Node.js 24와 npm, 압축 해제용 `tar`가 필요합니다. 아래 다운로드는 빌드 PC에서만 수행합니다.

```sh
npm ci
npm run vendor:fetch
npm run verify
npm run vendor:verify
npm run dev
```

프록시를 사용하는 Node 24 환경에서는 환경에 맞게 `NODE_USE_ENV_PROXY=1`을 설정합니다. Electron 45는 개발 런타임을 지연 다운로드하므로 필요한 경우 `node node_modules/electron/install.js`를 빌드 PC에서 실행합니다.

```sh
npm run package:win
```

`release/L-Vibe-0.1.0-Setup.exe`를 생성합니다. 설치기는 Electron 45.2.3과 OpenCode 1.19.5 Windows x64를 포함하는 전체 설치본입니다. 현재 후보는 서명되지 않았으며 Windows 실행·업데이트·네트워크 실검증 전입니다. `vendor:verify`는 런타임·지침 원본·라이선스 해시가 맞지 않으면 패키징을 중단합니다. 개인 설정 JSON은 빌드 입력·EXE에 포함하지 않습니다.

## 구조

| 위치 | 역할 |
| --- | --- |
| `src/renderer` | 세 열 UI, 실제 도구 상태·승인·호스트 스냅샷 diff |
| `src/preload` | 고정 IPC 요청·상태 구독만 노출 |
| `src/main/index.ts` | 출처 검사, 창 격리, 탐색·팝업·렌더러 외부 통신 차단 |
| `src/main/host.ts` | 작업·중지·재출력·세션 승인 수명 |
| `src/main/engine.ts` | 앱 전용 OpenCode 프로세스·임의 localhost 포트·실행별 인증 |
| `src/main/broker.ts` | 인증된 MCP 중계, 읽기·검색·수정 승인 경계 |
| `src/main/files.ts` | 범위 검사, 수정 제안, 충돌 검사, 원자적 저장·재읽기 |
| `src/main/adapters.ts` | 순수 Aegis 지침·Conductor 문서 어댑터 |
| `src/main/replay.ts` | 도구 정의가 없는 별도 모델 HTTP 요청 |
| `vendor-lock.json` | 원본 커밋·배포 사용 여부·다운로드 무결성·파일 해시 |

엔진은 실제 프로젝트 밖의 앱 전용 빈 작업 폴더에서 실행합니다. 개인 홈·XDG·PATH를 상속하지 않고 별도 폴더를 사용하며 기본 도구·LSP·실행 플러그인을 비활성화합니다. 프로젝트 파일은 호스트 MCP 도구로만 전달합니다. 설정 파일만으로 엔진의 모든 직접 I/O·네트워크를 통제한다고 주장하지 않습니다.

엔진 DB·작업 기록·재출력 답변은 사용자 데이터 아래에 보관합니다. 버전이 다르거나 손상된 기록은 보존하고 새 기록 저장을 차단합니다. 일반 문서 파일·Conductor 트랙 등 프로젝트 산출물의 쓰기에도 승인이 필요합니다. 대화 자동 업로드·공용 지식 서비스는 연결하지 않았습니다.

설계 전체는 [요구사항](docs/requirements.md), 어댑터의 원본과 다른 동작은 [어댑터 명세](docs/adapters.md), 출시 전 검증은 [Windows 검증 절차](docs/windows-acceptance.md)에 기록했습니다.
