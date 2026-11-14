---
name: web-game-foundations
description: "게임 루프·상태·입력·저장·성능·HUD의 경계를 설계한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 웹 게임 구조

1. 기존 엔진·프로젝트와 브라우저 지원 범위를 확인한다.
2. 시간·프레임·입력·상태·저장·취소와 DOM HUD의 경계를 명시한다.
3. 핵심 루프·실패·진행을 작은 프로토타입으로 검증하고 필요하지 않은 엔진·의존성을 추가하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
