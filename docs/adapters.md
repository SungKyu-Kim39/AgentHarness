# Ned 어댑터의 역할

Ned는 Zed, 고정 OpenCode ACP 어댑터와 앱 전용 엔진을 연결합니다. `opencode acp`로 별도 서버를 만드는 경로는 사용하지 않습니다. 구현은 `distribution/ned`, `distribution/native-control.ts`, `distribution/host-tools.ts`에 있습니다.

## ACP와 파일 편집

에이전트는 로컬 파이프·소켓에서 실행별 토큰으로 호스트에 연결합니다. 호스트는 새 세션의 작업 폴더를 승인·검증한 뒤 연결합니다. 클라이언트가 추가 MCP나 디렉터리를 주입할 수 없으며 실제 모델 키도 전달하지 않습니다. 공식 어댑터의 Bun 파일 읽기 세 곳은 Node 읽기로 바꿔 번들하고 ACP 표준 출력에는 프로토콜만 기록합니다.

사용자의 수동 저장은 Zed가 처리합니다. AI 수정은 호스트의 제안·승인·자동 승인 범위·스냅샷·기준 해시 검사를 거칩니다. 승인 전후 ACP로 편집 버퍼를 읽고 저장하지 않은 변경이 있으면 먼저 저장을 요청합니다. 세션 중지나 연결 종료 시 해당 작업을 취소합니다. `.zed/settings.json`·`tasks.json` 등 실행 설정을 포함한 `.zed` 폴더는 AI 쓰기에서 보호합니다.

## 방법론과 스킬

`read_methodology`, `skill_catalog`, `read_skill`로 필요한 지침을 읽습니다. 기존 `conductor/index.md`, `tracks.md`와 관련 spec·plan은 프로젝트 도구로 조사합니다. 트랙을 만들거나 고칠 때도 `propose_edit` 승인을 적용하며 계획·체크박스는 실제 실행 근거에 맞게 갱신합니다.

원본의 온라인 설치·doctor·원격 갱신을 Ned가 수행한 것으로 표시하지 않습니다. 필수 Q&A를 매번 반복하지 않고 제품 범위를 바꾸는 결정만 확인합니다.

## 분석과 지식

Serena·clangd는 허용한 읽기·심볼 도구로 연결합니다. REPL·수정·실행 기능은 노출하지 않습니다. Graphify는 AST, REA는 지원하는 산출물의 정적 분석을 맡습니다. 의미 분석이 실패해 텍스트 검색으로 바꾸면 그 사실과 한계를 알립니다. C++ 결과에는 컴파일 옵션·헤더·SDK 준비 상태가 영향을 줍니다.

OpenViking은 사용자 폴더에서 실행하며 스킬 등록, 선택한 자료 색인과 개인 OVPack 가져오기를 처리합니다. 프로젝트 지식과 여러 프로젝트에서 쓰는 개인 지식은 범위를 나눕니다. 새 대화를 자동 저장하거나 공용 저장소로 보내지 않습니다.

## MCP와 빌드

개발 MCP는 Serena, Git, Playwright, MarkItDown, Chrome DevTools, DuckDB Local 여섯 종입니다. 도구 허용 목록, 파일 경로와 읽기·실행 범위는 호스트에서 검사합니다. 공개 도구 ID는 `ned_host_*`, 제품 표시는 Ned를 사용합니다.

`inspect_build`는 설치된 VS2017/2019와 프로젝트 구성을 읽습니다. `build_project`는 발견한 구성에서 선택한 MSBuild를 고정 인자로 실행하며 네이티브 권한 정책을 따릅니다. 일반 셸, 패키지 설치와 임의 실행 플러그인은 제공하지 않습니다.
