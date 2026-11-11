# L-Vibe 0.2.5 — offline tokenizer data

2026-11-11 KST. [OpenViking 토크나이저 원인·복구](openviking-tokenizer-fix.md)에 확인한 CRLF cache, LiteLLM cache 경로 덮어쓰기와 폐쇄망 첫 import 실패를 기록했다. 새 전체 설치본은 데이터 6개/인코더 7종, 공식 SHA-256, app 소유 cache와 온라인 fallback 없는 loader 및 이전 Windows socketpair 수정을 포함한다.

동일 수정 소스의 전체 회귀 검사 **58개 통과, 실패·건너뜀 0**. 빈 HOME/TEMP와 잘못된 상속 cache에서 실제 SDK를 먼저 import하고 인코더 7종을 검증했다. 검사한 Python 네트워크 호출 경로의 외부 요청 시도 0건이며 누락·손상 시 온라인 복구를 거부한다. installer audit 3개 검사도 별도 통과했다.

빌드 환경은 Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, Python 3.12.14다. Windows Python 3.12.16, Electron 44.9.1, OpenCode Desktop/CLI 2.2.6 및 기존 구성 요소 버전은 유지한다. 새 Python 번들은 **63,069개 파일**, manifest SHA-256 `17b94d19b5cd9efe52c68d0c339682e1fb144fb6e2d7900a607221ad9847d70b`다. 토크나이저 어휘 자료는 모델 가중치가 아니며 tiktoken MIT/GPT-2 Modified MIT 원문을 보존한다.

EXE/TGZ와 공식 Desktop 빌드 검증 수치는 실제 생성·검사 후 갱신한다. 사용자 Windows 적용 후 재시작·실제 사내 모델/SDK·Win10/11 전체 수용·DNS/TCP·Job Object와 남은 Desktop 기능은 별도다. `releaseReady: false`를 유지한다.
