# Ned 0.4.2 rebuild3 검증

고정된 Zed 소스에 스킬 범주를 추가하고, 해당 소스로 Windows용 편집기를 다시 빌드합니다. 설치된 ACP의 명령 목록에서 기본 명령, 글로벌·프로젝트 스킬, 활성 MCP의 범주를 각각 확인합니다. MCP 토글 뒤 목록 갱신과 슬래시 선택을 거친 호출 승인도 검사합니다.

편집기 자체의 About 화면에는 기본 버전 `0.4.2`가 표시됩니다. 설치본과 릴리스는 `0.4.2 rebuild3`입니다. 편집기와 대응 소스는 빌드 당시의 해시를 보존하고 별도 rebuild3 메타데이터로 고정합니다.

## 설치 파일과 Windows 결과

제품 소스는 `1f847f881e3a0c66450a3b8e72e348fa56ded9b9`입니다. Windows Server에 최종 EXE를 새로 설치해 69건 중 69건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.2-rebuild2에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551501477 bytes, SHA-256 `f8a0d2342eabacb42a05b7c221aa065a841f49bdf0d0eb3ab0a2b98cf4f7a278`입니다. 준비본과 추출본의 65745개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.2-rebuild3-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.2-rebuild3-installer-audit.json) · [반입 TGZ](../downloads/README.md)
