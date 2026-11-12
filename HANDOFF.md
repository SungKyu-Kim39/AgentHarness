# Ned 개발 인계

현재 제품명은 **Ned**, 버전은 0.3.0 전환 후보이다. 사용자 목표는 비개발자를 포함한 직원에게 Zed·OpenCode·Aegis·Conductor·OpenViking·기본 도구를 한 번에 설치·설정하는 폐쇄망 프로그램을 제공하는 것이다.

## 유지해야 할 결정

- 검은 배경의 흰색 볼드 Ned 생성 아이콘: `assets/ned-icon.png`, `ned-icon.ico`.
- 편집기는 고정 Zed v1.28.1, 엔진은 OpenCode 2.2.6이다. 개인 설정을 읽지 않는다. 기본 `opencode acp`는 별도 서버를 시작하므로 사용하지 않는다.
- 모델 요청 대기는 기본 시간 제한이 없다. 사내 대기열이 길다는 사용자의 명시적 요구이다.
- 여러 LLM과 thinking·토큰 한도는 중앙 JSON, 임베딩은 한 개이다. API 키·사용자 자료·개발 캐시는 커밋하지 않는다.
- 사용자 직접 저장은 일반 IDE 동작이다. AI 쓰기·명령은 호스트 승인·범위·충돌·종료 확인을 거친다.
- 현재 `work` 브랜치의 공개 origin `SungKyu-Kim39/AgentHarness`에 중간 커밋·푸시하는 권한을 사용자가 이미 승인하였다.

## 소스 진입점

| 경로 | 역할 |
|---|---|
| `distribution/ned/main.ts` | Ned Electron 실행기·설정 대화상자·트레이·Zed 수명 |
| `distribution/ned/agent.ts` | 공식 ACP를 기존 호스트 엔진에 연결 |
| `distribution/ned/owner.ts`, `rpc.ts` | 실행별 로컬 인증·프로젝트/세션 귀속·버퍼 확인 |
| `distribution/ned/profile.ts` | 전용 Zed 설정·프로필·편집기 HTTP 차단 프록시 |
| `distribution/ned/migration.ts` | 원본 보존·덮어쓰기 없는 L-Vibe 데이터 복사 |
| `distribution/native-control.ts` | 설정 vault·모델 게이트웨이·OpenViking·엔진 소유 |
| `distribution/host-tools.ts`, `vs-build.ts` | 수정 승인·MCP·설치된 VS2017/2019 MSBuild |
| `scripts/ned-build.mjs` | Node 호환 ACP·실행기 번들 |
| `ned-runtime-lock.json` | Zed 바이너리·원본 소스·버전·해시 |

내부 `l_vibe_host` 도구 ID와 `resources/l-vibe`는 기존 중계·번들 호환을 위해 유지한다. 공개 제품명과 신규 사용자 경로는 Ned이다. 과거 다운로드·복구 패치는 대상 L-Vibe 이름을 유지한다.

## 빌드 PC와 검사

Node 24·Python 3.12와 기존 고정 Bun/OpenCode 의존성·런타임이 필요하다. `npm ci`, 기존 `desktop:prepare`와 `scripts/desktop-dependencies.py`로 고정 소스/의존성을 준비한다. Python·REA·MCP·토크나이저 런타임은 기존 고정 번들 스크립트와 manifest로 준비·검증한다. 직원 PC에는 이 작업을 요구하지 않는다.

Windows 패키지에는 `npm run ned:prepare`, `npm run package:win`, `npm run bundle:offline`을 사용한다. `ned:prepare`는 고정 Zed 아카이브를 빌드 PC에서만 다운로드·검증한다. Linux에서는 Inno Setup 6.4.3 지원 추출기가 필요하다. `ned-build-tools-lock.json`의 고정 소스(기본 upstream + 검토한 PR 197)를 CMake·Boost·LZMA로 빌드하고 `NED_INNOEXTRACT`에 절대 경로를 지정하거나 `.cache/ned/tools/innoextract-build/innoextract`에 둔다. 추출 산출물의 `app`과 `code$GetInstallDir`를 빌드 스크립트가 병합한다. 직원 PC에는 추출기나 CMake를 넣지 않는다.

`npm run build` 후 `npm run typecheck`, `npm test`를 실행한다. ACP 실제 연동은 `tests/ned.integration.test.ts`, 빌드 승인 제어는 `tests/vs-build.test.ts`에서 확인한다. 테스트에 실제 엔진 경로가 없으면 skip이므로 완료로 오인하지 않는다.

[현재 검증](docs/validation-0.3.0.md)·[Windows 수용](docs/windows-acceptance.md)·[라이선스](docs/license-policy.md)를 읽고 남은 설치·UI·실제 모델·MSBuild·DNS/TCP 검증을 이어간다. EXE 생성만으로 출시 완료 처리하지 않는다.

이전 L-Vibe 0.2.7의 상세 인계·해시·Windows 런타임 이력은 [당시 인계서](https://github.com/SungKyu-Kim39/AgentHarness/blob/31748467fcbd0639f70db923ac9d9aea8c268b9f/HANDOFF.md)와 버전별 검증 문서를 보존하여 참고한다.
