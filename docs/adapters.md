# Ned 어댑터 명세

Ned는 Zed 편집기, 공식 고정 OpenCode ACP 번역기와 앱 소유 엔진을 연결한다. `opencode acp`의 별도 서버 생성 경로를 사용하지 않는다. 실제 구현은 `distribution/ned`, `distribution/native-control.ts`, `distribution/host-tools.ts`이다.

## ACP와 편집

로컬 파이프/소켓의 실행별 토큰으로 호스트에 접속한다. 새 세션의 작업 폴더를 호스트가 승인·검증하고 세션을 연결한다. 클라이언트 제공 MCP와 추가 디렉터리는 허용하지 않는다. 실제 API 키는 전송하지 않는다. AI 편집 도구는 실행 설정인 `.zed/settings.json`·`tasks.json`을 포함한 `.zed` 폴더 쓰기를 차단한다. 공식 어댑터의 Bun 파일 읽기 3곳을 Node 읽기로 변환하여 번들한다. ACP 표준 출력에는 프로토콜만 기록한다.

수동 저장은 Zed의 일반 편집 동작이다. AI 수정은 호스트 제안·승인·요청 범위 자동 승인·스냅샷·기준 해시 검사를 유지한다. ACP 파일 읽기로 저장하지 않은 버퍼를 승인 전후 확인하며, 다르면 저장을 요청한다. 세션 중지·연결 종료는 해당 호스트 작업을 취소한다.

## Aegis·Conductor와 스킬

`read_methodology`, `skill_catalog`, `read_skill`로 검토한 지침을 선택하여 읽는다. 기존 `conductor/index.md`, `tracks.md`, 관련 spec/plan은 프로젝트 읽기 도구로 조사한다. 트랙 생성·갱신은 `propose_edit` 승인을 거친다. 계획·체크박스는 실제 실행 근거에 맞게 갱신한다. 원문의 필수 Q&A·온라인 설치·doctor·원격 갱신을 앱 기능으로 표현하지 않는다.

## 분석과 지식

Serena/clangd는 허용한 읽기·심볼 도구만 중계한다. 원본 REPL·수정·실행 도구는 노출하지 않는다. Graphify는 정적 AST, REA는 제한된 산출물 정적 분석이다. 텍스트 검색 대체 시 의미 분석 실패와 제한을 표시한다. 컴파일 옵션·헤더·SDK 없이는 C++ 정확도를 보장하지 않는다.

OpenViking은 사용자 폴더의 로컬 서비스이며 기본 스킬 등록과 명시적 색인·개인 OVPack 가져오기를 수행한다. 프로젝트 지식과 개인 공통 지식을 구분한다. 새 대화를 자동 저장하거나 공용 저장소로 전송하지 않는다.

## 명령과 MCP

6종 MCP는 Serena, Git, Playwright, MarkItDown, Chrome DevTools, DuckDB Local이다. 각 허용 목록·경로·읽기/실행 경계는 기존 MCP 중계에 유지한다. 이름에 `ned_host_`가 남은 것은 기존 내부 프로토콜 호환을 위한 것이며 제품 표시명은 Ned이다.

`inspect_build`는 VS2017/2019와 프로젝트 구성을 읽는다. `build_project`는 발견된 구성만 선택하고 네이티브 승인 후 고정 MSBuild 인자로 실행한다. 일반 셸·패키지 설치·임의 실행 플러그인은 제공하지 않는다.
