# Ned 0.4.2 rebuild2 검증

보고된 `https://127.0.0.1:18081/mcp` 형태가 기존 코드에서 등록 양식 오류로 거절되는 것을 재현했습니다. 수정본은 신뢰하는 시험 인증서를 사용해 `https://127.0.0.1:<포트>/mcp`에 연결합니다. 관리 창에서 연결 확인, 도구 선택, 저장, 토글, 등록 재읽기를 수행하고 외부 공인 IP와 Ned 내부 포트 차단을 검사합니다.

Windows Server에서는 새 설치, 0.4.2 rebuild1 제자리 업데이트와 MCP 등록 파일 보존, 설치된 ACP의 슬래시 호출도 검사합니다. 실제 직원 PC의 서버 인증서 신뢰 설정은 현장 확인 범위입니다.

## 설치 파일과 Windows 결과

제품 소스는 `a04a027092a9280b7c829158e38d14b880c2b2a5`입니다. Windows Server에 최종 EXE를 새로 설치해 69건 중 69건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.2-rebuild1에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551497818 bytes, SHA-256 `6126c3b6d0797f367d8964af69fed9bce7000e013e12b0ac38772538ecd39b23`입니다. 준비본과 추출본의 65742개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.2-rebuild2-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.2-rebuild2-installer-audit.json) · [반입 TGZ](../downloads/README.md)
