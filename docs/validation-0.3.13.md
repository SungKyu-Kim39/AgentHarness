# Ned 0.3.13 검증 기록

## 검증 범위 구분

- Linux 단위·통합 테스트: `npm run typecheck`, `tests/buffer-check.test.ts`, `tests/session-memory.test.ts` 및 기존 편집·권한·OpenViking 진단 테스트 34건 통과.
- Windows Server 설치본 검사: GitHub Actions `windows-2022`에서 최종 EXE 새 설치, `0.3.12-rebuild2` 제자리 업데이트, 사용자 글로벌 스킬·설정 보존, 오프라인 Python/OpenViking/MIME·설치본 테스트 번들 실행.
- 미검증(직원 PC 수용 항목): Windows 10/11 실제 GUI 환경, 실제 사내 VLM·임베딩 서버를 통한 장시간 세션 기억 추출 및 Studio Home VLM 토큰 그래프 확인, 사내 폐쇄망 외부 차단 검증.
