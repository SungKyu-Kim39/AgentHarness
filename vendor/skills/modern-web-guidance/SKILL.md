---
name: modern-web-guidance
description: "웹 UI와 HTML/CSS/브라우저 API 구현에 선별 반입한 표준·접근성·성능 가이드를 적용한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 웹 표준·성능·호환성

1. 실제 지원 브라우저·고정 Chromium/Electron 버전·기존 프로젝트 제약을 먼저 확인한다.
2. 요청한 기능에 해당하는 선별 로컬 참조를 read_skill로 읽고 네이티브 웹 기능·가벼운 대체 구현을 검토한다.
3. 한국어 IME·폼·키보드·포커스·텍스트 크기·반응형·긴 작업·오프스크린 렌더링을 관련 범위에서 검증한다.
4. 원본 온라인 CLI·통계 전송·자동 업데이트·브라우저 AI 모델 다운로드는 포함하지 않는다. 최신 웹 전체가 지원된다고 추정하지 않는다.
5. 적용한 실제 가이드와 주요 대체 구현을 짧게 설명한다. 없는 가이드·실행·브라우저 지원을 만들어내지 않는다.

선별 로컬 가이드 묶음이다. 원본 온라인 CLI·전체 검색 모델을 설치한 것으로 표현하지 않는다. 필요한 references 문서를 read_skill로 선택한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
