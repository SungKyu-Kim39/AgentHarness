---
name: change-impact
description: "여러 파일·플랫폼·설정·데이터·API 변경 전후에 실제 의존성과 회귀·복구 범위를 확인한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 변경 영향 분석

1. 실제 정의·참조·호출·설정·기존 트랙으로 영향 범위를 입증한다. 이름만으로 관계를 추정하지 않는다.
2. 코드·저장 데이터·계약·문서·배포·취소·롤백 중 관련된 항목과 미확인을 짧게 정리한다.
3. 수정 뒤 실제 diff와 요구사항·검증 결과를 대조하고 범위 이탈을 정리한다.
4. 작은 변경에 별도 보고서를 강제하지 않고 기존 Conductor spec/plan·ADR을 필요할 때만 갱신한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
