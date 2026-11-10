---
name: session-handoff
description: "장기 작업의 사용자 결정·확인한 사실·변경·검증·미결 사항을 근거와 함께 인계"
---

# L-Vibe offline adaptation

This is a reviewed static skill, not an executable plugin. Read only the relevant references. Local guidance needs no external Internet; citation URLs are attribution only. The model connection remains the configured intranet API.

작업 중 확인한 사실·사용자 결정·변경·검증·미결 사항을 근거와 함께 인계한다. 대화·지식 저장소·프로젝트 문서 사이의 자동 복사를 하지 않는다. 영속 문서가 필요하면 승인된 프로젝트 편집으로 제안한다.

Use approved project reads/searches and host-mediated edits. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, change permissions, spawn agents, or send messages. A command, compiler, browser, database, test runner or SDK mentioned below is not installed by this skill. Use an approved local executor if available; otherwise report verification as not run. Local node_modules examples require an existing package and the appropriate Windows executable path. User decisions and host policy take precedence. See ADAPTATION.md for provenance and modifications.

---


# 작업 인계와 재개

작업을 다시 시작할 때 추측으로 이전 상태를 복원하지 않는다. 기존 Conductor 트랙·프로젝트 문서·현재 파일과 실제 도구 결과를 읽고 인계 내용과 비교한다. 파일 내용이 달라졌다면 이전 수정 제안을 다시 확인한다.

인계할 때 다음을 필요한 만큼 간결하게 정리한다.

1. **목표와 수용 기준**: 사용자 요청, 유지해야 할 기존 동작, 제외 범위.
2. **사용자 결정**: 실제로 받은 답과 아직 받지 않은 답. 자동 승인은 제품 결정의 답으로 취급하지 않는다.
3. **확인한 사실**: 파일 경로·심볼·도구 호출 ID·결과 등 다시 확인할 근거. 추정과 분리한다.
4. **실제 변경**: 제안·승인 대기·저장 완료를 구분한다. 커밋이 있으면 식별자를 기록한다.
5. **검증**: 실행한 명령과 관찰 결과, 실패, 미실행 항목과 이유. 계획 카드를 실행 근거로 쓰지 않는다.
6. **다음 작업**: 미결 결정에 의존하는 변경과 독립적으로 계속할 수 있는 분석, 알려진 위험.

키·토큰·개인정보·불필요한 원문 대화를 넣지 않는다. 장시간 작업이라는 이유만으로 문서·트랙을 생성하지 않는다. 기본 출력은 현재 대화의 인계 요약이다. 사용자가 영속 문서를 요청하거나 기존 트랙 갱신이 필요한 경우 프로젝트 안의 파일 수정으로 제안하고 호스트 승인을 거친다. 개인 대화를 OpenViking이나 공용 지식에 자동 업로드하지 않는다.

요약을 읽은 뒤에도 실제 작업 상태를 확인한다. 이 스킬은 엔진의 영속 스냅샷·자동 압축·복구 기능을 구현하지 않으며 중지 불명확 상태를 해제하지 않는다. 도구·SDK·네트워크 접근 권한을 추가하지 않는다.
