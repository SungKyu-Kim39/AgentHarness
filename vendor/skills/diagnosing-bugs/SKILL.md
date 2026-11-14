---
name: diagnosing-bugs
description: "오류·성능 저하를 정확한 증상·재현·가설별 관찰로 조사하고 최소 수정한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## 재현 중심 디버깅

1. 버전·환경·실패 단계를 확인하고 정확한 사용자 증상을 검출하는 작은 피드백 루프를 만든다.
2. 가설과 이를 구분하는 예측을 정리하고 한 번에 한 조건을 바꾸어 원인을 검증한다.
3. 원래 증상이 실패에서 성공으로 바뀌는지 확인하고 실제 결함을 잡는 경계에서 회귀를 검증한다.
4. 환경이 없으면 독립 조사와 fixture를 계속하되 미실행을 밝힌다. 로그의 키·코드·개인 자료를 수집하지 않는다.
5. 사내 모델의 긴 대기를 장애로 단정하거나 기본 생성 제한 시간을 추가하지 않는다. 불명확한 부작용을 재시도하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
