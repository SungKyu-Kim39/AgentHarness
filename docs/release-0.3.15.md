# Ned 0.3.15

Ned 0.3.15 사전 릴리스입니다.

## 주요 변경 사항

- **호스트 안전 경계 보강**:
  - 대용량 `propose_edit`·`knowledge_index` 승인 미리보기를 바이트 수·SHA-256과 함께 절단해 60,000자 상한으로 인한 무음 거절을 해소했습니다.
  - 전체 권한 모드의 고위험 셸 가드(`isHighRiskShellCommand`)에 중첩 셸(`cmd /c`, `powershell -Command`), `-EncodedCommand`/`-File`, 동적 평가(`iex`/`Invoke-Expression`), 위험한 `Start-Process`, PowerShell 약어 옵션(`-Rec -Fo`), `Net.WebClient` 변형 차단을 추가했습니다.
  - `graphify_analyze`·`rea_inspect` 자식 프로세스 취소를 세션 단위로 격리했습니다.
- **자연어 자동 도구 연결·장시간 세션 안정성 및 트레이 상태 개선**:
  - `/skill-...` 슬래시 호출 및 2턴 후속 대화에서 데스크톱·리버싱 전문 도구 노출과 호스트 실행 판정이 일치하도록 보완했습니다.
  - 자동 대화 기억의 엔진 메시지 조회 상한을 5,000메시지(50페이지, `order=asc` 유지)로 확장하고, `memory-sync.json`(500세션)과 `subagents.json`(종료 이력 1,000건 회전)의 장기 누적 상한 문제를 해소했습니다.
  - Windows 트레이 메뉴의 자동 대화 기억 상태 표시가 OpenViking의 실제 런타임 상태(`준비 중` / `켜짐` / `오류` / `꺼짐`)를 실시간 반영하도록 개선했습니다.
- **안내 문서 전면 최신화 및 링크 없는 자동 도구 연결 가이드 추가**:
  - Ned의 핵심 강점인 자연어 의도 분석과 자동 스킬·도구 연결 구조를 링크 없이 독립 문서로 정리한 `AUTO_ROUTING_GUIDE.md`([docs/ned-auto-routing-guide.md](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/ned-auto-routing-guide.md))를 추가하고, 기존 소개·비교·사용 안내서를 모두 0.3.15 기준으로 최신화했습니다.

자세한 변경 내역은 [changes-0.3.15.md](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/changes-0.3.15.md)를 참고하세요.

## 검증 요약

<!-- windows-verification -->

## 설치 안내

1. 실행 중인 Ned와 개인 Zed를 모두 종료합니다.
2. `Ned-0.3.15-windows-x64.tgz`를 새 폴더에 풀고 `Ned-0.3.15-win-x64.exe`를 실행합니다.
3. 기존 설정·대화·지식과 사용자 글로벌 스킬은 그대로 유지됩니다.
