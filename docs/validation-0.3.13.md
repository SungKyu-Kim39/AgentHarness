# Ned 0.3.13 검증 기록

## 검증 범위 구분

- Linux 단위·통합 테스트: `npm run typecheck`, `tests/buffer-check.test.ts`, `tests/session-memory.test.ts` 및 기존 편집·권한·OpenViking 진단 테스트 34건 통과.
- Windows Server 설치본 검사: GitHub Actions `windows-2022`에서 최종 EXE 새 설치, `0.3.12-rebuild2` 제자리 업데이트, 사용자 글로벌 스킬·설정 보존, 오프라인 Python/OpenViking/MIME·설치본 테스트 번들 실행.
- 미검증(직원 PC 수용 항목): Windows 10/11 실제 GUI 환경, 실제 사내 VLM·임베딩 서버를 통한 장시간 세션 기억 추출 및 Studio Home VLM 토큰 그래프 확인, 사내 폐쇄망 외부 차단 검증.

## 설치 파일과 Windows 결과

제품 소스는 `08b395b638d05ae1645d0006074dcdf9cf25d1d3`입니다. Windows Server에 최종 EXE를 새로 설치해 37건 중 37건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.3.12-rebuild2에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1535018495 bytes, SHA-256 `a498d94a8530ec9c15f35be23553e9fcec812ab2a4723a723fd907f006aa02b3`입니다. 준비본과 추출본의 60115개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.3.13-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.3.13-installer-audit.json) · [반입 TGZ](../downloads/README.md)
