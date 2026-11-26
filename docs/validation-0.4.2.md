# Ned 0.4.2 검증

합성 Streamable HTTP 서버로 도구 목록과 호출, 승인, 새 요청 및 토글에 따른 사용 권한 회수, 도구 계약 변경과 불확실한 응답을 확인합니다. Windows Server에서는 새 설치와 0.4.1 제자리 업데이트, 사용자 데이터와 사용자 MCP 등록 파일 보존을 확인합니다.

직원 PC의 실제 Zed 입력창과 트레이, 사내 운영 MCP의 연결과 인증은 현장 수용 확인 범위입니다.

## 설치 파일과 Windows 결과

제품 소스는 `cee6ea0778e7ed477f0bef109907ce7449c54cbb`입니다. Windows Server에 최종 EXE를 새로 설치해 69건 중 69건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.1에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551493751 bytes, SHA-256 `cf3a66fcf7aa7c36b3b828c527b1d2e2839110a98e4a7f42920cb091f067392f`입니다. 준비본과 추출본의 65736개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.2-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.2-installer-audit.json) · [반입 TGZ](../downloads/README.md)
