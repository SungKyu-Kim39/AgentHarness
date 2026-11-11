# L-Vibe

[설치 EXE · 폐쇄망 반입 TGZ 다운로드](downloads/README.md)

[L-Vibe 소개 · 목적과 활용 방법](docs/l-vibe-introduction.md)

[다른 PC에서 개발 이어가기 · 작업 인계서](HANDOFF.md)

Windows 10·11 x64 폐쇄망용 **OpenCode Desktop 기반 바이브 코딩 배포판**입니다. 공식 Desktop/엔진 v2.2.6을 고정하고, 사내 모델 설정·승인 중계·로컬 서비스를 결합합니다. 기존 PC의 OpenCode·Zed·개인 설정·플러그인을 읽거나 복제하지 않습니다.

0.2.5는 설치·모델·로컬 도구의 **검증 후보**입니다. Windows OpenViking의 asyncio loopback 수정에 더해 토크나이저 데이터 6종과 외부 다운로드 없는 로더를 포함합니다. 배포 파일·폴더, 설치 리소스와 포함된 앱 소스 경로는 ASCII를 사용합니다. 고정 브라우저를 포함한 MCP 6종과 기본 스킬 34개를 제공합니다. [0.2.5 검증 상태](docs/validation-0.2.5.md)를 확인하세요. Windows·실제 사내 모델 수용을 완료한 1.0 배포판은 아닙니다.

0.2.5 전체 설치본에는 두 시작 수정이 기본 포함됩니다. 기존 0.2.2/0.2.3/0.2.4 설치본에는 [누적 오프라인 패치](docs/openviking-tokenizer-fix.md)를 사용할 수 있습니다. 설정·대화·지식 데이터는 유지합니다. 사용자는 누적 패치 적용과 앱 실행 성공을 확인했으며 모델 목록 표시는 별도 확인 중입니다.

## 폐쇄망에서 설치

1. 반입한 `L-Vibe-0.2.5-windows-x64.tgz`를 압축 해제합니다.
2. 기존 앱이 실행 중이면 완전히 종료하고 `L-Vibe-0.2.5-win-x64.exe`로 일반 사용자에게 설치합니다.
3. 저장 설정이 없는 첫 설치에서는 자동으로 열린 설정 JSON을 편집하고 저장합니다. 기존 설정이 있으면 보존하며 메모장을 열지 않습니다.
4. L-Vibe를 실행하고 프로젝트 폴더와 모델을 선택합니다.

자세한 내용은 [설치 안내](docs/offline-setup.md)를 확인하세요. 직원 PC에서 npm·pip·uvx·Bun·Git clone이나 런타임 설치를 실행하지 않습니다. 모델 가중치는 포함하지 않으며, 설정한 사내 모델 API가 필요합니다. 설치·업데이트·기본 제거는 사용자 데이터 폴더를 유지합니다.

압축 안의 안내 파일은 `GETTING_STARTED.txt`, 검증 보고서는 `VALIDATION_REPORT.md`, 출시 상태는 `READINESS.json`입니다. 파일·경로 이름만 영문으로 통일하며 한국어 UI와 문서 내용은 유지합니다.

설정 복구·라이선스·Windows 진단 안내와 `CHECK_OPENVIKING.cmd`/검사 스크립트도 함께 제공합니다. 시작 실패 시 `%APPDATA%\L-Vibe\openviking\startup-status.json`의 단계/코드와 [진단 절차](docs/windows-diagnostics.md)를 확인하세요.

`settings.enc.json`이 있고 `config-import.json`이 없는 것은 예상된 상태입니다. 임시 JSON은 암호화 저장 후 삭제합니다. 기존 설정을 바꾸는 절차는 [설정 복구·교체 안내](docs/configuration-recovery.md)를 따르세요.

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

Serena/clangd·Git·Playwright·MarkItDown·Chrome DevTools·DuckDB의 통제된 MCP가 포함됩니다. 실제 Linux 호출과 Windows 설치 리소스 검사를 구분해 검증 기록을 확인하세요. 일반 명령 실행과 새 Desktop의 반복 감지·답변 재출력, Windows 설치·업데이트·ACL·자식 종료·DNS/TCP 관찰과 실제 사내 Qwen 수용 검증은 남아 있습니다.

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
npm run mcp:verify
npm run desktop:prepare
npm run skills:verify
npm run verify
npm run build
npm run package:win
npm run audit:installer
# 소스와 검증 문서를 커밋한 뒤 TGZ를 생성합니다.
npm run bundle:offline
```

`desktop-dependencies.py`는 CLI·Windows native prebuild·Ghostty의 고정 버전/해시를 검증합니다. Python은 Windows wheel 의존성과 Windows 전용 markers를 모두 해석해 완성된 배포본을 구성하며 가상환경을 복사하지 않습니다. REA는 별도 npm lock으로 고정합니다. `bundle:offline`은 커밋된 소스·EXE·설정 예제·안내·해시·라이선스·대응 소스를 TGZ로 묶습니다. 배포 경로가 ASCII가 아니거나 실제 EXE의 ASCII 검사 기록이 없으면 생성을 중단합니다. 빌드 성공과 출시 수용 검증은 구분합니다.

원형 `src/renderer`, `src/preload`와 `dev:prototype`, `build:prototype`, `start:prototype`는 이관 전 비교·회귀 검증용입니다. 원형 테스트를 새 Desktop 검증으로 계산하지 않습니다. 새 소스는 `distribution/` overlay, `upstream-lock.json`, `scripts/desktop.mjs`로 관리합니다.

설계는 [아키텍처](docs/architecture.md), [요구사항](docs/requirements.md), [구현 계획](docs/implementation-plan.md), [Windows 수용 절차](docs/windows-acceptance.md)를 참고하세요. OpenViking의 AGPL-3.0 대응 소스와 각 구성 요소의 라이선스를 배포 묶음에 포함합니다.

자체 코드는 MIT이며 번들은 GPL/AGPL/LGPL·CC-BY-SA 및 브라우저/DLL의 별도 조건을 포함합니다. [라이선스 정책 재검토](docs/license-policy.md)와 [제3자 고지](THIRD_PARTY_NOTICES.md)에 확인한 조건 및 남은 재배포 검토를 기록합니다. 전체 설치 묶음의 라이선스 검토 완료를 의미하지 않습니다.
