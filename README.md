# L-Vibe

[설치 EXE · 폐쇄망 반입 TGZ 다운로드](downloads/README.md)

[다른 PC에서 개발 이어가기 · 작업 인계서](HANDOFF.md)

Windows 10·11 x64 폐쇄망용 **OpenCode Desktop 기반 바이브 코딩 배포판**입니다. 공식 Desktop/엔진 v2.2.6을 고정하고, 사내 모델 설정·승인 중계·로컬 서비스를 결합합니다. 기존 PC의 OpenCode·Zed·개인 설정·플러그인을 읽거나 복제하지 않습니다.

공개된 0.2.1은 설치·모델·로컬 도구의 **검증 후보**입니다. work 브랜치의 0.2.2 소스에는 MCP 6종을 연결했으나 Windows 브라우저 반입 파일 확보가 차단되어 새 EXE/TGZ는 아직 발행하지 않았습니다. [MCP 구현·검증 상태](docs/mcp-validation.md)를 확인하세요. Windows·실제 사내 모델 수용을 완료한 1.0 배포판은 아닙니다.

## 폐쇄망에서 설치

1. 반입한 `L-Vibe-0.2.1-windows-x64.tgz`를 압축 해제합니다.
2. `L-Vibe-0.2.1-win-x64.exe`로 일반 사용자에게 설치합니다.
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
- Aegis·Conductor 순수 지침 어댑터와 오프라인 기본 스킬 34개. 최초 실행에서 OpenViking skills에 참조·라이선스와 함께 자동 등록하며 재실행 중복 색인과 사용자 편집본 덮어쓰기를 방지합니다. [추가 스킬·MCP 조사와 선택 목록](docs/offline-extensions-research.md)을 참고하세요.

공개된 0.2.1 설치본에는 Serena/clangd 의미 분석이 없습니다. 0.2.2 소스의 MCP 연동은 위 검증 기록과 구분해서 확인하세요. 일반 명령 실행과 새 Desktop의 반복 감지·답변 재출력, Windows 설치·업데이트·ACL·자식 종료·DNS/TCP 관찰과 실제 사내 Qwen 수용 검증은 남아 있습니다.

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
npm run bundle:mcp
npm run skills:verify
npm run verify
npm run build
npm run package:win
npm run bundle:offline
```

`desktop-dependencies.py`는 CLI·Windows native prebuild·Ghostty의 고정 버전/해시를 검증합니다. Python은 Windows wheel 의존성과 Windows 전용 markers를 모두 해석해 완성된 배포본을 구성하며 가상환경을 복사하지 않습니다. REA는 별도 npm lock으로 고정합니다. `bundle:offline`은 커밋된 소스·EXE·설정 예제·안내·해시·라이선스·대응 소스를 TGZ로 묶습니다. 빌드 성공과 출시 수용 검증은 구분합니다.

원형 `src/renderer`, `src/preload`와 `dev:prototype`, `build:prototype`, `start:prototype`는 이관 전 비교·회귀 검증용입니다. 원형 테스트를 새 Desktop 검증으로 계산하지 않습니다. 새 소스는 `distribution/` overlay, `upstream-lock.json`, `scripts/desktop.mjs`로 관리합니다.

설계는 [아키텍처](docs/architecture.md), [요구사항](docs/requirements.md), [구현 계획](docs/implementation-plan.md), [Windows 수용 절차](docs/windows-acceptance.md)를 참고하세요. OpenViking의 AGPL-3.0 대응 소스와 각 구성 요소의 라이선스를 배포 묶음에 포함합니다.
