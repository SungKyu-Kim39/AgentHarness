---
name: code-review
description: "변경을 요구사항 충족과 코드·안전·검증 품질의 두 관점에서 검토한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 요구사항·규칙 코드 리뷰

1. 기준 commit/branch 또는 현재 작업 diff와 실제 요구사항·프로젝트 관례를 고정한다.
2. 누락·부분 구현·잘못된 동작·요청 밖 변경과 규칙·상태·오류·취소·검증 문제를 별도 관점으로 순차 검토한다.
3. 실제 파일·호출 경로·조건으로 입증할 수 있는 결함을 우선하며 코드 냄새는 휴리스틱으로 표시한다.
4. 근거·영향·최소 조치와 미검증 영역을 보고하고 외부 이슈 트래커나 병렬 에이전트를 요구하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
