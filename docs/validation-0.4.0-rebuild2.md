# Ned 0.4.0 rebuild2 검증

- Linux에서 TypeScript 검사(`npm run typecheck`), 문서 일관성 검사(`verify-current-docs.mjs`), 오프라인 스킬 79개 검증(`npm run skills:verify`), NSIS 설치기 무경고 컴파일(`tests/ned-installer.test.mjs`), esbuild 호스트 번들 검증을 수행했습니다.
- 대상 테스트에는 160 KB 초과 파일의 체크포인트 복원 및 Worktree 반영, 다중 파일 적용 중 부분 실패 자동 롤백, 수동 삭제된 Worktree 정리, `code_audit(venv-ruff)`·`document_read(mode: "docling")` 프로젝트 Python 실행 승인 게이트, 누락된 `Content-Type` 헤더 검출, OpenViking 비동기 커밋 작업 상태 확인·실패 재시도·증분 커서 동기화, `fetchSessionInfo` 실패 시 fail-closed, `agent-config.example.json` 스키마 검증이 포함됩니다.
- Windows Server의 기준 업그레이드는 공개 `0.4.0-rebuild1` 설치본입니다. 직원용 Windows 10·11 GUI, 사내 PyPI 미러·모델·임베딩 서버 및 실제 외부망 차단 수용은 별도 확인 대상입니다.

## 설치 파일과 Windows 결과

제품 소스는 `dbaba8a35bb6c07ff649e32fe76ec0e72dcc57f8`입니다. Windows Server에 최종 EXE를 새로 설치해 50건 중 50건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.0-rebuild1에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551441736 bytes, SHA-256 `913c423f88b42b70acbf02da621fceb4eb4aec8d5fa4260b7c9cc9a42229b57b`입니다. 준비본과 추출본의 65718개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.0-rebuild2-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.0-rebuild2-installer-audit.json) · [반입 TGZ](../downloads/README.md)
