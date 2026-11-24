---
name: spec-driven-dev
description: 바이브코딩 중 요구사항 누락과 코드 붕괴를 막기 위해 specs/<feature>/ 아래에 spec.md, plan.md, tasks.md를 체계적으로 관리하고 검증한다.
---

# 명세 주도 개발 (Spec-Driven Development)

기능 범위가 넓거나 여러 파일·모듈을 거치는 작업에서는 코드부터 바로 작성하지 않고 프로젝트 내부 `specs/<feature>/` 명세를 기준으로 단계별 구현과 검증을 수행한다.

## 작업 절차

1. **명세 초기화**: `spec_workflow(operation: "init", feature, title, goal)`로 `specs/<feature>/spec.md`, `plan.md`, `tasks.md`를 생성한다. 이미 존재하면 `spec_workflow(operation: "status", feature)`로 현재 진행 상황을 읽는다.
2. **요구사항과 수용 기준 고정 (`spec.md`)**: 검증 가능한 요구사항을 `REQ-01`, `REQ-02` 형식으로 번호를 붙여 정의하고 비목표(Out of Scope)를 명시한다.
3. **설계와 영향 범위 정리 (`plan.md`)**: 실제 코드를 읽은 근거로 변경 파일, 인터페이스 계약, 오류·취소·호환성 위험과 검증 전략을 기록한다.
4. **체크리스트 기반 구현 (`tasks.md`)**: 각 태스크(`- [ ] T01 (REQ-01) ...`)에 연결된 `REQ-xx`와 대상 파일 경로를 백틱으로 표기하고, 실제 구현과 테스트를 통과한 항목만 `[x]`로 갱신한다.
5. **완료 전 정합성 점검**: `spec_workflow(operation: "verify", feature)`를 실행해 연결되지 않은 요구사항, 미완료 태스크, 누락된 참조 파일이 없는지 확인하고, 필요 시 `code_audit`로 보안·품질 회귀까지 점검한다.
