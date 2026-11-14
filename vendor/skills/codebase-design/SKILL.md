---
name: codebase-design
description: "작은 호출 계약 뒤에 복잡성을 모으고 변경·테스트·자원 소유권을 명확히 한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 모듈·인터페이스 설계

1. 실제 호출자가 알아야 하는 타입·순서·설정·실패·취소 조건을 포함해 현재 인터페이스를 조사한다.
2. 작은 인터페이스로 충분한 동작을 제공하고 불필요한 전달 계층·미래용 추상화를 추가하지 않는다.
3. 부작용·자원 소유권을 명시하고 필요한 의존성을 주입하며 실제 호출 계약을 테스트한다.
4. 대안은 필요할 때 순차 비교하며 기존 동작·저장 데이터·호환성을 유지한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
