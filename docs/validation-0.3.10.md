# Ned 0.3.10 검증

- 호스트와 ACP 번들 빌드 및 TypeScript 검사를 통과했습니다.
- Windows Server 소스 검사에서 CMD·PowerShell 명령의 출력과 비정상 종료 코드 전달,
  승인 거절, 대화별 작업 중지 범위를 확인했습니다.
  [Windows 셸 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/44219874835)
- 고정 OpenViking 0.5.5의 실제 Studio 작업 화면을 Chromium에서 확인했습니다. 창 수명
  검사는 렌더링 지연 후 진단 화면과 재시도를 포함합니다.
- 실제 OpenViking 새 저장소에서 시작과 재시작 시 스킬 등록 없이 프로젝트 지식이
  동작하는지 확인했습니다. 구버전 이관 검사에서는 기존 프로젝트·개인 지식과 스킬
  자료가 남고 재실행 때 다시 색인하지 않는 것을 확인했습니다.

- 사용자 글로벌 스킬을 설치 리소스 교체 뒤 다른 프로젝트에서 조회했습니다. 작은
  검증용 설치본 두 개를 실제 Windows NSIS 설치 절차로 업데이트해 `SKILL.md`와
  참고 문서의 내용이 유지되는 것도 확인했습니다.
  [글로벌 스킬 업데이트 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/44222175100)

[Zed 터미널 Windows 타입 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/44221555467)

Windows 10/11용 설치본의 실제 메뉴와 Studio 창은 별도 확인 범위입니다.
현재 게시된 배포본은 0.3.9입니다.
