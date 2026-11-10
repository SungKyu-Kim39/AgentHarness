# L-Vibe

Windows 10·11 x64 폐쇄망용 **OpenCode Desktop 기반 사내 바이브 코딩 배포판**입니다. 제품명은 L-Vibe입니다. 공식 화면·세션·파일·diff·모델 선택을 재사용하고, 사내 설정·정책·고정 로컬 서비스를 결합합니다.

**설계 전환 중입니다.** 기준은 [새 아키텍처](docs/architecture.md)와 [구현 계획](docs/implementation-plan.md)입니다. 현재 `src/renderer` 및 아래 기존 Electron 빌드 명령은 독립 UI 원형의 비교·회귀 검증용이며 새 배포판의 완료본이 아닙니다. 공식 Desktop과 서버는 동일 upstream 커밋으로 고정합니다. 기존 PC의 OpenCode·Zed·개인 플러그인·설정은 읽거나 복제하지 않습니다.

새 설계는 여러 사내 LLM 선택과 한 개의 OpenViking 임베딩을 지원하도록 합니다. OpenViking·Serena·REA·Graphify·Aegis·Conductor·선별한 개발 스킬은 폐쇄망 고정 번들 대상으로 관리합니다. 새 Desktop에서 실제 연결·Windows·사내 모델 검증을 마치기 전에는 이관 또는 1.0 완료로 표시하지 않습니다.

모델 JSON은 OpenCode v2의 `providers → settings / models` 형식을 사용합니다. [설정 예제](agent-config.example.json)의 `settings.baseURL`, `settings.apiKey`, `models.<별칭>.modelID`를 사내 값으로 편집합니다. `APIKey` 표기도 허용합니다. `model`은 `{ "providerID": "intranet", "model": "model-1" }`처럼 기본 모델의 별칭을 선택합니다. capabilities·cost·limit는 유지하며, OpenViking 임베딩은 별도의 `openViking.embedding` 한 개입니다. 실제 키는 Git에 넣지 않습니다.

반입 묶음은 TGZ 안에 설치 EXE·자리표시자 설정 JSON·한국어 안내·해시·라이선스를 담습니다. 설치 후 `%APPDATA%\L-Vibe\config-import.json`을 편집하고 실행하면 검증·암호화한 뒤 준비 평문을 삭제합니다. 이전 설정이 있으면 유지하며 교체는 파일 선택으로 명시적으로 수행합니다. 빌드는 Windows 검증 후보를 만들 수 있고, `distribution/readiness.json`은 별도로 출시 검증 상태를 기록합니다.

공식 소스 준비와 초기 패치 검증:

```sh
npm ci
npm run desktop:prepare
npm run verify
```

`upstream-lock.json`의 커밋·archive·경계 파일을 검증한 뒤 `.cache/l-vibe-desktop/source`에 수정 소스를 준비합니다. 원본 전체를 Git에 복제하지 않고 고정 lock과 검토 가능한 overlay를 관리합니다. 이 다운로드는 빌드 PC에서만 수행합니다. 초기 점검과 남은 이관은 [upstream 점검 기록](docs/upstream-audit.md)을 확인하세요.

`dev`, `start`, `build`, `package:win`은 새 Desktop 경로입니다. Windows 검증 전 빌드는 검증 후보로 표시합니다. 아래 원형 기록의 실행 명령은 `dev:prototype`, `build:prototype`, `start:prototype`, `test:ui:prototype`으로 분리했습니다. 원형의 설치본을 새 배포판으로 제공하지 않습니다.

아래는 이관 전 원형의 사용·검증 기록입니다.

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
npm run dev:prototype
```

프록시를 사용하는 Node 24 환경에서는 환경에 맞게 `NODE_USE_ENV_PROXY=1`을 설정합니다. Electron 45는 개발 런타임을 지연 다운로드하므로 필요한 경우 `node node_modules/electron/install.js`를 빌드 PC에서 실행합니다.

```sh
npm run package:win
```

현재 `package:win`은 새 Desktop 경로이며 미완료 이관이 있으면 중단합니다. 과거 원형의 `release/L-Vibe-0.1.0-Setup.exe` 및 Electron 45.2.3 / OpenCode 1.19.5 번들은 새 배포판의 설치본이 아닙니다. 개인 설정 JSON은 빌드 입력·EXE에 포함하지 않습니다.

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
