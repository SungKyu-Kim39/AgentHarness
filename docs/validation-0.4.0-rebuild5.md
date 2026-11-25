# Ned 0.4.0 rebuild5 검증

Windows Server에서는 0.4.0-rebuild4에서 제자리 업데이트하면서 앱 데이터와 사용자 스킬, 설치 폴더에 별도로 둔 파일 및 이전 설치기의 백업에 옮겨진 개인 파일을 확인합니다. 잠금으로 복구를 완료할 수 없는 경우 Electron 런타임 백업이 보존되고 잠금을 해제한 후 같은 위치에서 복구할 수 있는지 확인합니다.

직원 PC의 Windows 10·11 Zed 모드 메뉴 및 사내 OpenViking 서버에서의 수용 확인은 별도로 기록합니다.

## 설치 파일과 Windows 결과

제품 소스는 `35ae913afc548f50b195b2b489956bbdd54e5efa`입니다. Windows Server에 최종 EXE를 새로 설치해 62건 중 62건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.4.0-rebuild4에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1551464980 bytes, SHA-256 `19d42eda6e97bc3110a1f7ee296b5f58aeac8434651f3691eef52ded366ee8f9`입니다. 준비본과 추출본의 65727개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.4.0-rebuild5-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.4.0-rebuild5-installer-audit.json) · [반입 TGZ](../downloads/README.md)
