---
name: qa-only
description: "수정과 구분하여 실제 사용자 흐름·시각 상태·실패·회귀를 검증한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 독립 관점 QA

1. 현재 실행 환경과 대상 버전을 확인하고 실제 사용자 시나리오를 정한다.
2. 승인된 로컬 도구로 핵심 흐름과 실패·취소·경계·키보드·시각 상태를 확인한다.
3. 수정 권한으로 간주하지 않고 재현 단계·기대/실제·증거·미실행을 보고한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
