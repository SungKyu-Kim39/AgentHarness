---
name: plan-eng-review
description: "넓은 작업의 설계·경계·실패·테스트·운영 위험을 구현 전에 정리한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 구현 전 엔지니어링 검토

1. 기존 구조·문제·성공 기준과 허용 범위를 확인한다.
2. 실패 모드·데이터 손실·호환성·의존성·복구·성능을 관련 범위에서 검토한다.
3. 단순한 접근과 필요한 대안을 비교하고 구현·검증 순서를 짧게 정리한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
