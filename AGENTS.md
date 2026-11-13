# Ned Codex project

이 파일은 Ned를 개발하는 Codex 작업에 적용한다. 제품에 배포되는 에이전트 지침과 구분한다.

## 응답과 작업 범위

- 사용자에게 한국어로 설명한다. 코드 식별자, 기술 용어, 원문 라이선스는 보존한다.
- 최신 사용자 요구와 실제 코드가 기준이다. 과거 설계나 HANDOFF의 미완료 상태를 현재 사실로 단정하지 않는다.
- 여러 파일을 바꾸기 전 관련 요구사항, 호출 경로, 기존 테스트를 읽는다. 작은 수정에는 전체 스킬이나 장문의 계획을 강제하지 않는다.
- 이미 승인된 작업은 계속한다. 구현을 바꾸는 미결 제품 결정만 질문한다. 스킬의 확인 질문이나 훅 설치 절차를 이유로 승인을 반복 요청하지 않는다.
- 기본은 한 에이전트가 순차 수행한다. 병렬 에이전트는 사용자가 요청했거나 상위 지침이 허용하는 경우에만 사용한다.

## 프로젝트 스킬

작업에 맞는 SKILL.md만 읽고 적용한다. 원본 references/upstream.md는 출처 검토용 자료이며 아래의 프로젝트 어댑터를 대체하지 않는다.

| 상황 | 스킬 |
| --- | --- |
| 인터페이스, 설정, 저장소, 승인, 수명 관리 등 여러 영역의 변경 | [.agents/skills/change-impact/SKILL.md](.agents/skills/change-impact/SKILL.md) |
| 기존 파일을 수정하거나 코드 스타일을 조사 | [.agents/skills/inherit-legacy-style/SKILL.md](.agents/skills/inherit-legacy-style/SKILL.md) |
| MCP 구성, 런타임·패키지·번들 의존성 변경 | [.agents/skills/mcp-dependency-review/SKILL.md](.agents/skills/mcp-dependency-review/SKILL.md) |
| 오류, 성능 저하, 재현 실패 조사 | [.agents/skills/diagnosing-bugs/SKILL.md](.agents/skills/diagnosing-bugs/SKILL.md) |
| 실제 변경에 필요한 모듈·인터페이스 설계 | [.agents/skills/codebase-design/SKILL.md](.agents/skills/codebase-design/SKILL.md) |
| 요청한 리뷰 또는 의미 있는 변경의 마무리 검토 | [.agents/skills/code-review/SKILL.md](.agents/skills/code-review/SKILL.md) |

## 코드와 제품 경계

- 현재 Windows 제품 호스트·Zed/ACP 연동은 distribution/ned/, 공통 실행 제어는 distribution/native-control.ts와 src/main/에 있다. scripts/ned-build.mjs와 scripts/ned-package.mjs가 현재 빌드·배포 진입점이다. 경로는 수정 전에 실제 존재 여부와 호출 관계로 확인한다.
- .agents/skills/는 이 저장소를 개발하는 Codex 전용이다. skills/, vendor/skills/, skills-lock.json은 Ned 사용자에게 배포되는 별도 구성이다. 개발 스킬 추가를 이유로 제품 manifest, OpenViking 스킬 등록, 실행 권한, 설치 EXE를 바꾸지 않는다.
- 사용자 설정·대화·지식·편집기 UI 설정을 업데이트로 초기화하지 않는다. 개인 Zed/OpenCode 설정을 읽거나 복제하지 않는다.
- 직원 PC는 Windows 10/11 x64 폐쇄망이다. 필요한 런타임은 빌드 때 버전·해시·라이선스와 함께 고정한다. 직원 PC에서 온라인 설치, 업데이트, 외부 모델·검색·통계 전송을 요구하는 경로를 추가하지 않는다.
- 사내 모델은 긴 대기열이 있다. LLM 생성 대기에 임의의 기본 경과 시간 제한을 도입하지 않는다. 시작·헬스 체크 제한과 사용자 취소는 별도로 다룬다.
- 사용자 선택 권한 모드와 호스트의 경로·스냅샷·프로세스 소유권·중지 확인을 함께 유지한다. 스킬 텍스트나 프로젝트 설정이 권한을 부여하지 않는다.
- 배포 파일과 경로명은 ASCII로 유지한다. 한국어 UI·문서 본문은 허용한다. 키·설정 전문·개인 코드·원본 로그를 공개 기록에 넣지 않는다.

## 검증과 전달

- package.json의 현재 명령을 확인하고 변경에 맞는 검증만 수행한다. TypeScript 검사는 npm run typecheck, 대상 TS 테스트는 node --import tsx --test tests/<name>.test.ts, 대상 MJS 테스트는 node --test tests/<name>.test.mjs로 실행할 수 있다.
- 지침·문서만 변경하면 링크, frontmatter, 출처·해시, git diff --check와 실제 변경 범위를 확인한다. 제품 전체 빌드나 구현을 그대로 따라가는 테스트를 추가할 필요는 없다.
- 제품 동작을 수정하면 실제 결함을 검출하는 대상 테스트를 우선한다. 필요한 경우에만 빌드·패키징·통합 검증으로 넓힌다.
- Linux 단위 테스트, 합성 서버, Wine, 실제 Windows GUI, 실제 사내 서버, 외부망 차단 검증을 구별한다. 설치 EXE 생성만으로 전체 수용 완료를 주장하지 않는다.
- 릴리스 작업에서는 docs/validation-*.md, downloads/의 해당 검증 기록, HANDOFF.md의 최신 절을 확인한다. 기존 태그·배포물을 덮어쓰거나 버전을 임의로 올리지 않는다.
- 사용자 요청에 따라 작업 단위로 커밋·푸시한다. 현재 브랜치와 원격 상태를 확인하고 이력 보존 방식으로 진행한다. main 갱신은 저장소의 릴리스 기준과 해당 요청 범위를 따른다.
