# Ned 0.3.13

Ned 0.3.13 사전 릴리스입니다.

## 주요 변경 사항

- **OpenViking 개인화 대화 기억 및 VLM 요약 활성화**:
  - Ned 에이전트(OpenCode/ACP) 대화의 사용자 메시지·최종 응답·도구 호출 요약(길이 제한·민감 정보 마스킹)을 OpenViking 세션에 자동 수집하고, 세션 전환·종료 시 및 일정 턴마다(기본 6턴) 백그라운드에서 VLM으로 장기 기억을 추출합니다.
  - 매 사용자 요청마다 관련 개인 기억과 프로필을 자동 검색해 참고 컨텍스트로 주입하며, 기존 `knowledge_search`·`personal_knowledge_search`·`knowledge_remember` 도구도 함께 유지합니다.
  - 설정 JSON의 `openViking.memory`(`enabled`, `autoRecall`, `commitEveryTurns`)로 제어할 수 있고(기본 켜짐), OpenViking Studio에서 추출된 기억을 조회·삭제할 수 있습니다.
  - `knowledge_remember`와 `knowledge_index`도 즉시 벡터 색인 후 백그라운드 `semantic_and_vectors` VLM 의미 요약을 실행합니다.
- **"저장하지 않은 편집기 변경" 버퍼 가드 오탐 근본 수정**:
  - UTF-8 BOM(`\uFEFF`) 및 단독 `\r` 개행을 Zed 버퍼 로딩 규칙과 동일하게 정규화해 비교합니다.
  - Zed 메모리 `BufferStore`의 파일 감시자 리로드 지연 시 짧은 재시도 후 판단하고, CP949/EUC-KR 등 비-UTF-8 파일은 버퍼 가드 전에 인코딩 오류로 정확히 안내합니다.
  - 실제 미저장 편집이나 Zed 기본 Agent 패널에 보류 중인 변경(Keep/Reject)이 있을 때는 계속 수정을 차단하며 안내 문구를 보강했습니다.

자세한 변경 내역은 [changes-0.3.13.md](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/changes-0.3.13.md)를 참고하세요.

## 검증 요약

설치 파일 60,115개를 준비본과 대조했습니다. Windows Server에서 새 설치, 0.3.12-rebuild2 업데이트와 사용자 글로벌 스킬 보존을 확인했고 설치본 대상 검사 37건이 통과했습니다. 직원 PC의 Windows 10·11 GUI와 실제 사내 모델 검증은 남아 있어 사전 릴리스로 제공합니다.

[Windows 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/45150343959) · [검증 기록](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/validation-0.3.13.md)


## 설치 안내

1. 실행 중인 Ned와 개인 Zed를 모두 종료합니다.
2. `Ned-0.3.13-windows-x64.tgz`를 새 폴더에 풀고 `Ned-0.3.13-win-x64.exe`를 실행합니다.
3. 기존 설정·대화·지식과 사용자 글로벌 스킬은 그대로 유지됩니다.
