# Ned 0.4.0 rebuild6 검증

Linux에서 4,001개 프로젝트 파일의 체크포인트 복원, CRLF와 무시된 파일의 보존, OpenViking 쓰기 응답 유실 이후의 재시작, OpenAPI 응답 배열과 Mock의 JSON 필수 필드, ACP 호스트 대화 해제, PyPI 다운로드 목적지 제한을 임시 환경으로 확인합니다.

Windows Server에서는 공개 0.4.0-rebuild5에서 제자리 업데이트하고 사용자 앱 데이터·스킬·설치 폴더의 개인 파일을 점검합니다. 중단된 업데이트의 복구에 이어 제거기를 실행해 Ned 실행 파일과 런타임이 제거되며, 개인 파일과 미복구 백업의 해시가 유지되는지 확인합니다.

실제 직원 PC의 Zed GUI와 사내 OpenViking·PyPI 서버는 현장 수용 확인 대상입니다.

## 설치 파일과 Windows 결과

제품 소스는 `05b3bd07f4f00af3ca8b39b66627979566ed5c04`입니다. Windows Server에 최종 EXE를 새로 설치해 65건 중 65건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.0-rebuild5에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551474615 bytes, SHA-256 `4c61146aebb9ad91f188824814aef68ed91cf4fa4f9b18ed7d8a0d8a8f2f1642`입니다. 준비본과 추출본의 65730개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.0-rebuild6-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.0-rebuild6-installer-audit.json) · [반입 TGZ](../downloads/README.md)
