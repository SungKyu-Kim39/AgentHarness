---
name: react-three-fiber-game
description: "React와 React Three Fiber의 장면·상태·DOM UI를 구분해 구현한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## React 3D 구성

1. 기존 React/R3F/Three 버전과 상태·Canvas 경계를 읽는다.
2. 프레임마다 React 상태 갱신을 남발하지 않고 렌더 루프·자원 수명·Suspense·resize를 검토한다.
3. 입력·HUD·오류·자산 로드·정리와 시각 결과를 검증한다. 새 패키지를 온라인 설치하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
