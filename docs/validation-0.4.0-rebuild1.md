# Ned 0.4.0 rebuild1 검증

- Linux에서 TypeScript 검사, 문서 일관성 검사, 오프라인 스킬 79개 검증을 수행했습니다.
- 대상 테스트에는 세션 제외 후 다른 세션 활성화, Studio 탐색·렌더러 멈춤, Worktree 충돌, Python 조회 중 패키지 시작 코드 미실행, 프리뷰·Mock 종료, 기본 PyPI 비활성화가 포함됩니다.
- Windows Server의 기준 업그레이드는 공개 0.4.0 설치본입니다. 직원용 Windows 10·11 GUI와 EDR, 사내 PyPI·모델·임베딩 및 실제 망 차단은 별도의 수용 항목입니다.

## 설치 파일과 Windows 결과

제품 소스는 `84c3ac65bbcae25bfe468e1aa3dc0eecb97ac360`입니다. Windows Server에 최종 EXE를 새로 설치해 49건 중 49건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.0에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551432761 bytes, SHA-256 `f78117f5b24b4086b8a753ff6243cfe8e89444bf42e2e222e98b22cfa49537ad`입니다. 준비본과 추출본의 65715개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.0-rebuild1-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.0-rebuild1-installer-audit.json) · [반입 TGZ](../downloads/README.md)
