# Ned 0.3.11 검증

검증은 Studio의 실제 작업 화면, Git의 대용량·절단 결과, 스킬 탐색 범위와 ACP 명령, 터미널 환경과 승인, OpenViking 지식 수명·격리, NSIS 업데이트와 선택 팩 보존에 집중합니다.

Windows Server 설치 검증은 사내 Windows 10·11에서 실행하는 실제 GUI, 사내 모델, 코드 서명 및 보안 정책 수용 시험과 구분합니다. 직원 PC에서는 [정식 배포 전 우선 확인 항목](windows-acceptance.md#0311-정식-배포-전-우선-확인)을 따릅니다.

로컬 검사에서 고정 OpenViking 0.5.5의 프로젝트·개인 메모 저장, 검색, 수정, 삭제와 프로젝트 간 격리를 확인했습니다. 실제 Studio 웹 앱은 Chromium에서 렌더링했고, 창 수명 검사는 Electron 모의 환경에서 확인했습니다. 64 MiB가 넘는 Git pack을 복사하지 않고 조회한 결과를 확인했습니다.

## 설치 파일과 Windows 결과

제품 소스는 `6222c4c312351ce2b45fd131851d132512092694`입니다. Windows Server에 최종 EXE를 새로 설치해 13건 중 13건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.3.10에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1535010935 bytes, SHA-256 `2c2ba4e2798fc454280ca8e41d45f86223a03e60f624a461fcaab15144018d2d`입니다. 준비본과 추출본의 60118개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.3.11-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.3.11-installer-audit.json) · [반입 TGZ](../downloads/README.md)
