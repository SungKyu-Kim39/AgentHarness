# Codex development skills for Ned

이 디렉터리는 Ned를 작성하는 Codex 프로젝트의 개발 지침이다. Ned 설치본의 기본 스킬과 OpenViking 등록 목록은 별도로 관리된다.

저장소 루트를 Codex 프로젝트로 열면 프로젝트 전용 .agents/skills/ 구조를 사용할 수 있다. AGENTS.md의 작업별 연결도 함께 따른다. 실행 중인 세션의 스킬 목록이 즉시 갱신되지 않으면 해당 SKILL.md를 직접 읽어 적용하고, 자동 발견은 이 저장소에서 시작한 다음 세션에서 확인한다. 설치만으로 런타임 로딩 성공을 주장하지 않는다.

## 선택한 6개

| 스킬 | 원본 | Ned 개발에 적용하는 부분 |
| --- | --- | --- |
| inherit-legacy-style | ECC | 기존 코드의 관례 조사와 불필요한 형식 변경 방지 |
| change-impact | ECC | 호스트·ACP·설정·번들·문서까지 실제 영향 경로 조사 |
| mcp-dependency-review | ECC | 구성과 lock의 정적 검토, 버전·해시·실행 경계 확인 |
| diagnosing-bugs | Matt Pocock | 실제 증상을 검출하는 재현과 가설별 검증 |
| codebase-design | Matt Pocock | 작은 인터페이스, 명시적 자원 소유권, 검증 가능한 모듈 |
| code-review | Matt Pocock | 요구사항 일치와 코드·검증 품질을 나누어 리뷰 |

ECC 원본: https://github.com/affaan-m/ECC/tree/d2ef2680594f9a17526a6e1a2e18b3d242c5d17b

Matt Pocock 원본: https://github.com/mattpocock/skills/tree/5863806dd4e15c63174bee4e7515a4256792ecfa

각 스킬에 고정 커밋의 원문 references/upstream.md와 MIT LICENSE를 보존했다. sources는 skills-lock.json에 기록했다. 이 디렉터리의 lock은 루트의 제품용 skills-lock.json과 다르다. 원본 파일의 Git blob SHA와 로컬 SHA-256, 어댑터의 SHA-256을 함께 기록한다.

## 어댑터 변경 사항

- 원본 Read/Glob/Grep/Bash 도구명은 실제 Codex의 파일 읽기·rg·명령 실행 기능에 대응한다. 없는 MCP·셸·이슈 트래커를 가정하거나 자동 설치하지 않는다.
- 기존 사용자 승인 범위 안에서 진행한다. 매 단계 확인 질문, 스타일 선택 Q&A, 별도 CLAUDE.md/settings.json 훅 설치를 강제하지 않는다.
- 리뷰 두 관점은 기본적으로 같은 에이전트가 순차 수행한다. 자동 서브에이전트 실행, 다중 모델 호출, 강제 병렬 설계는 포함하지 않는다.
- 문서 경로는 기존 구조를 재사용한다. 작업마다 별도 보고서, 스타일 파일, 워크스페이스 산출물을 생성하지 않는다.
- 실제 Windows나 사내 서버가 없을 때 읽기 전용 코드 조사와 독립 재현은 계속하고, 결과의 검증 범위와 남은 불확실성을 보고한다.
- 디버깅을 이유로 무한 재시도, 실행 중인 사용자 앱 강제 종료, 사내 모델 대기 시간 제한을 도입하지 않는다.
- 디자인 용어는 한국어로 설명할 수 있다. 원본의 특정 영어 어휘 강제 규칙은 적용하지 않는다.
- 외부 설치기, 실행 훅, 업데이트, 통계 전송, 이슈 트래커 설정은 추가하지 않았다. 스킬은 로컬 Markdown과 라이선스 파일이다.

UI 디자인·웹 가이드·한국어 윤문·마케팅·게임 스킬은 현재 호스트/배포 개발의 핵심 범위에 맞춰 이번 추가에서 제외했다. 필요 작업이 생기면 별도 선별한다.

## 유지보수

원본 갱신은 자동으로 하지 않는다. 고정 커밋의 변경을 읽고, 어댑터 차이를 검토한 뒤 원문·라이선스·Git blob SHA·SHA-256을 함께 갱신한다. 기존 Ned 제품 스킬 번들 스크립트에 이 개발용 디렉터리를 입력으로 추가하지 않는다.
