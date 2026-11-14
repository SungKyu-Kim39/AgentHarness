---
name: review
description: "diff의 논리·데이터·보안·성능 회귀를 실제 호출과 경계 조건으로 찾는다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 변경 회귀 리뷰

1. 변경 내용과 실제 호출자·데이터 흐름을 읽는다.
2. null·빈 값·중복·동시성·순서·호환성·입출력 경계와 실패 처리를 조사한다.
3. 검증된 버그를 조건·영향·파일 위치로 보고하고 취향 차이를 오류로 단정하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
