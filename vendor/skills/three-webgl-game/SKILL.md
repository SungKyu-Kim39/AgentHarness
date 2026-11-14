---
name: three-webgl-game
description: "로컬 Three.js 프로젝트의 장면·카메라·렌더 루프·자산·해제를 구현한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## Three.js 3D 구현

1. 기존 버전·좌표·카메라·조명·렌더 루프·자산 경로를 읽는다.
2. 시간 기반 업데이트·resize·입력·성능 예산·장면 자원 해제를 명시한다.
3. GLB/glTF는 반입된 로컬 자산을 사용하고 WebGL 결과는 실제 화면으로 확인한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
