# L-Vibe

Windows 10·11 x64 폐쇄망용 **OpenCode Desktop 기반 바이브 코딩 배포판**입니다. 공식 Desktop/엔진 v2.2.6을 고정하고, 사내 모델 설정·승인 중계·로컬 서비스를 결합합니다. 기존 PC의 OpenCode·Zed·개인 설정·플러그인을 읽거나 복제하지 않습니다.

현재 0.2.0은 설치·모델·로컬 도구의 **검증 후보**입니다. Win10/Win11 및 실제 사내 모델 수용 검증을 완료한 1.0 배포판은 아닙니다. 남은 항목은 [출시 상태](distribution/readiness.json)에 명시합니다.

## 폐쇄망에서 설치

1. 반입한 `L-Vibe-0.2.0-windows-x64.tgz`를 압축 해제합니다.
2. `L-Vibe-0.2.0-win-x64.exe`로 일반 사용자에게 설치합니다.
3. 자동으로 열린 설정 JSON을 편집하고 저장합니다.
4. L-Vibe를 실행하고 프로젝트 폴더와 모델을 선택합니다.

자세한 내용은 [설치 안내](docs/offline-setup.md)를 확인하세요. 직원 PC에서 npm·pip·uvx·Bun·Git clone이나 런타임 설치를 실행하지 않습니다. 모델 가중치는 포함하지 않으며, 설정한 사내 모델 API가 필요합니다. 설치·업데이트·기본 제거는 사용자 데이터 폴더를 유지합니다.

## 모델 설정

[agent-config.example.json](agent-config.example.json)은 OpenCode v2의 `providers → settings / models` 형식입니다.

- `settings.baseURL`: `/v1` 등을 포함한 API 기준 경로입니다.
- `settings.apiKey`: 사내 API 키입니다. `APIKey` 표기도 인식합니다.
- `models.<별칭>.modelID`: 서버에 등록된 정확한 ID입니다.
- `model`: `{ "providerID": "intranet", "model": "model-1" }`처럼 기본 모델의 별칭을 선택합니다.
- `capabilities`, `cost`, `limit`를 유지하고 공식 모델 선택창에 등록합니다.
- 임베딩은 별도의 `openViking.embedding` 한 개이며 LLM 선택과 독립적입니다.

첫 실행은 JSON을 검증하고 Electron safeStorage로 암호화 저장한 후 준비 평문을 삭제합니다. 실제 키는 렌더러·엔진·로그에 넣지 않습니다. 엔진은 실행별 토큰으로 호스트 중계를 사용합니다. 기존 설정 교체는 알림 영역 L-Vibe 메뉴에서 파일을 선택하여 명시적으로 수행합니다. 배포 원본 JSON은 사용자가 관리하는 파일입니다.

## 현재 연결된 기능

- 앱 전용 엔진, 임의 localhost 포트·인증, 앱과 함께 시작·종료하는 수명 관리.
- 네이티브 선택기로 허용한 프로젝트만 읽는 MCP 중계, 읽기·텍스트 검색, 수정 승인·충돌 검사·호스트 스냅샷.
- OpenViking 0.5.4와 단일 임베딩, 선택한 프로젝트 파일의 승인 후 색인·검색. 개인 대화 자동 업로드 없음.
- morluto/rea 6.8.0의 제한된 정적 분석, Graphify 0.9.105의 네트워크 없는 AST 추출.
- Aegis·Conductor 순수 지침 어댑터와 선별한 오프라인 개발 스킬 18개.

Serena/clangd 의미 분석, 승인된 명령 실행, 새 Desktop의 반복 감지·답변 재출력은 아직 연결되지 않았습니다. 텍스트 검색·AST 결과를 Serena 의미 분석 성공으로 표시하지 않습니다. 외부 DNS/TCP 관찰, Windows 설치·업데이트·ACL·자식 프로세스 검증과 실제 사내 Qwen 테스트가 남아 있습니다.

## 빌드 PC

Node 24, Python 3.12, tar와 고정 Bun 1.4.4를 사용합니다. 아래 의존성 다운로드·설치는 모두 빌드 PC에서 수행하며 직원 PC로 전가하지 않습니다.

```sh
npm ci
npm run desktop:prepare
# 준비된 upstream 소스에서 Bun 의존성을 frozen lock으로 설치합니다.
# GitHub API 제한 시 desktop-dependencies.py가 동일 해시의 공식 codeload 아카이브를 준비합니다.
python3 scripts/desktop-dependencies.py
npm run bundle:python
npm run bundle:rea
npm run verify
npm run build
npm run package:win
npm run bundle:offline
```

`desktop-dependencies.py`는 CLI·Windows native prebuild·Ghostty의 고정 버전/해시를 검증합니다. Python은 Windows wheel 의존성과 Windows 전용 markers를 모두 해석해 완성된 배포본을 구성하며 가상환경을 복사하지 않습니다. REA는 별도 npm lock으로 고정합니다. `bundle:offline`은 커밋된 소스·EXE·설정 예제·안내·해시·라이선스·대응 소스를 TGZ로 묶습니다. 빌드 성공과 출시 수용 검증은 구분합니다.

원형 `src/renderer`, `src/preload`와 `dev:prototype`, `build:prototype`, `start:prototype`는 이관 전 비교·회귀 검증용입니다. 원형 테스트를 새 Desktop 검증으로 계산하지 않습니다. 새 소스는 `distribution/` overlay, `upstream-lock.json`, `scripts/desktop.mjs`로 관리합니다.

설계는 [아키텍처](docs/architecture.md), [요구사항](docs/requirements.md), [구현 계획](docs/implementation-plan.md), [Windows 수용 절차](docs/windows-acceptance.md)를 참고하세요. OpenViking의 AGPL-3.0 대응 소스와 각 구성 요소의 라이선스를 배포 묶음에 포함합니다.
