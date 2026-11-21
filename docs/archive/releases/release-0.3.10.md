# Ned 0.3.10

- Ned Agent에서 CMD·PowerShell 명령을 실행하고 출력과 종료 코드를 확인할 수 있습니다. 터미널 패널의 **+** 메뉴에서 PowerShell 또는 CMD 탭을 엽니다.
- 사용자 글로벌 스킬은 `%APPDATA%\Ned\skills\<스킬-ID>\SKILL.md`에 저장합니다. 프로그램 업데이트 때 이 폴더의 파일을 보존합니다.
- OpenViking Studio의 화면 준비 판정과 다시 불러오기를 보완했습니다.
- OpenViking의 기본 스킬 등록과 신규 개인 공통 지식 `.ovpack` 가져오기를 제거했습니다. 기존 자료는 조회할 수 있고 기본 스킬 74종은 설치 파일에서 사용합니다.
- 트레이 메뉴를 정리했습니다. 기존 설정·대화·프로젝트 지식과 개인 Zed Agent 대화 가져오기는 유지됩니다.

사내 반입은 TGZ 전체를 새 폴더에 풀고 Ned와 개인 Zed를 종료한 뒤, 안에 든 EXE를 실행합니다. [설치 안내](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/offline-setup.md) · [0.3.7 이후 누적 변경](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/upgrade-from-0.3.7.md) · [글로벌 스킬 등록](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/extension-guide.md#사용자-글로벌-스킬-등록)

설치 파일 60,143개를 준비본과 대조했습니다. Windows Server에서 새 설치, 0.3.9 업데이트와 사용자 글로벌 스킬 보존을 확인했고 설치본 대상 검사 12건이 통과했습니다. 직원 PC의 Windows 10·11 GUI와 실제 사내 모델 검증은 남아 있어 사전 릴리스로 제공합니다.

[Windows 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/44236601857) · [검증 기록](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/archive/validations/validation-0.3.10.md)

