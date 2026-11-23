# Ned 0.3.12

- 권한 정책을 정비해 전체 권한 모드에서 일반 CMD·PowerShell 명령, 프로젝트 외부 로컬 파일 읽기, OpenViking 지식 저장·갱신·삭제가 불필요한 승인 팝업 없이 동작하도록 보완했습니다. 치명적 셸 명령의 최소 고위험 가드와 보호 경로·외부 파일 쓰기 차단은 유지합니다.
- 승인 요청 팝업과 파일·폴더 선택창이 Zed 뒤로 숨지 않도록 활성 모니터 최상단에 표시하고, OpenViking Studio와 OpenViking API 실패 시 민감 정보를 마스킹한 상시 진단 로그와 세부 오류 코드를 기록하도록 개선했습니다.
- Core 설치본과 리버싱 팩 이원화를 제거해 전체 오프라인 설치본 단일 배포로 단순화했습니다. 기본 대화 시 리버싱·데스크톱 도구 스키마 지연 로딩은 그대로 유지합니다.

[변경 사항](changes-0.3.12.md) · [권한 안내](approval-modes.md) · [지식 사용법](knowledge-notes.md)

설치 파일 60,120개를 준비본과 대조했습니다. Windows Server에서 새 설치, 0.3.11 업데이트와 사용자 글로벌 스킬 보존을 확인했고 설치본 대상 검사 26건이 통과했습니다. 직원 PC의 Windows 10·11 GUI와 실제 사내 모델 검증은 남아 있어 사전 릴리스로 제공합니다.

[Windows 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/45107541913) · [검증 기록](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/validation-0.3.12.md)

