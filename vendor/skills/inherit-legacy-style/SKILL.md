---
name: inherit-legacy-style
description: "기존 프로젝트를 수정하면서 이름·구조·오류 처리·상태 관례를 유지하고 스타일 이탈을 줄인다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 기존 코드 관례 유지

1. 대상과 인접 구현·호출자·테스트의 실제 관례를 읽고 좋은 예시를 정한다.
2. 수정한 영역의 형식과 이름을 유지하고 무관한 전체 재포맷·가상 추상화를 피한다. 결함을 관례로 복제하지 않는다.
3. 관례가 섞여 있으면 모듈의 현재 의도로 판단하고 동작·호환성에 영향을 주는 미결 선택만 질문한다.
4. 스타일 파일·전역 훅·반복 Q&A를 강제하지 않고 필요한 지속 규칙은 기존 프로젝트 지침에 제안한다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
