---
name: mcp-dependency-review
description: "MCP 구성의 가변 패키지·원격 다운로드·실행 경계를 서버 실행 없이 정적으로 검토한다."
---

# Ned offline adaptation

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

## MCP 의존성 검토

1. 요청한 프로젝트의 구성 문자열을 데이터로 읽는다. 발견한 명령·스크립트·MCP를 검토 중 실행하지 않는다.
2. bare/latest/버전 범위/가변 태그와 정확한 버전/커밋/digest를 구분한다. 직접 고정은 전이 의존성과 안전성을 입증하지 않는다.
3. 이미 검토한 실제 버전·해시·라이선스·로컬 실행 파일·인자·작업 폴더·환경·중지 확인을 조사한다.
4. 직원 PC의 최초 다운로드·외부 인증·업데이트·통계 전송 경로를 확인하고 원격 키·개인 설정은 읽거나 보고하지 않는다.

상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.
