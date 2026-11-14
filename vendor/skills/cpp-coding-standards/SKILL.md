---
name: cpp-coding-standards
description: "C/C++ 수명·소유권·오류·경계·동시성 품질을 기존 컴파일러와 SDK 제약에 맞춰 검토한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## C++ 코드 품질

1. 먼저 실제 VS2017/2019·C++ 표준·VxWorks SDK·빌드 옵션을 조사하고 지원되지 않는 언어 기능을 강제하지 않는다.
2. RAII·명시적 소유권·const·범위 검사·초기화·정수 변환과 ABI 호환성을 검토한다.
3. 잠금·스레드 수명·예외 경계·자원 해제를 실제 호출 경로와 실패 조건으로 확인한다.
4. 지원되는 기존 테스트·컴파일러·분석 도구만 사용하고 sanitizer·SDK 설치나 자동 리타게팅은 하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
