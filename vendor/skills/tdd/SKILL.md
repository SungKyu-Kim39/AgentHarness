---
name: tdd
description: "필요한 동작을 관찰 가능한 테스트로 정의하고 실패·최소 구현·정리 순서로 개발한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 행동 중심 TDD

1. 변경해야 하는 실제 외부 동작과 가장 적절한 검증 경계를 정한다.
2. 작은 동작 하나의 실패를 확인한 뒤 최소 구현하고 같은 관찰이 성공하는지 확인한다.
3. 내부 호출·구현을 그대로 복제하는 테스트와 모든 로직을 대체하는 mock을 피한다.
4. 원래 재현과 관련 회귀를 확인한다. 문서·가벼운 가역 변경에 불필요한 테스트를 강제하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
