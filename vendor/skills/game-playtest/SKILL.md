---
name: game-playtest
description: "시작·입력·장면 전환·HUD·충돌·성능을 실제 사용자 관점으로 확인한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 게임 플레이 검증

1. 실제 실행 버전과 테스트 경로·입력·성공/실패 조건을 정한다.
2. 이미 반입된 승인된 브라우저로 핵심 행동·재시작·메뉴·화면 크기와 시각 상태를 확인한다.
3. Canvas/WebGL은 DOM 검사만으로 통과시키지 않는다. 실제 스크린샷·행동 결과 또는 미실행을 기록한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
