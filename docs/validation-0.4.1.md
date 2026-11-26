# Ned 0.4.1 검증

사용자가 사내망에 0.4.0 rebuild6을 반입해 직접 사용했고, 정식 릴리스 승격을 승인했습니다. 이 결과는 rebuild6에 대한 현장 사용 결과입니다. 0.4.1 자동 검증은 새로 생성한 설치 파일을 Windows Server 2022에서 실행한 결과를 아래에 별도로 기록합니다.

검사 범위는 새 설치, rebuild6에서 제자리 업데이트, 설정·대화·지식·글로벌 스킬 시험 파일의 해시 비교, 중단된 업데이트 복구와 제거 시 사용자 파일 보존입니다. 설치 파일과 반입 TGZ의 공개 다운로드는 게시 단계에서 별도로 검사합니다.

[rebuild6 검증 기록](validation-0.4.0-rebuild6.md)

## 설치 파일과 Windows 결과

제품 소스는 `31a50262687e62607273f5f5086f2d251a7927c9`입니다. Windows Server에 최종 EXE를 새로 설치해 65건 중 65건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.0-rebuild6에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551476943 bytes, SHA-256 `e819cca9352fc37d4bcf39e42a4719c2fe9d75d51369a1d162b48af0e42715d6`입니다. 준비본과 추출본의 65733개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.1-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.1-installer-audit.json) · [반입 TGZ](../downloads/README.md)
