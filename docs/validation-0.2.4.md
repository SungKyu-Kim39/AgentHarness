# L-Vibe 0.2.4 — Windows OpenViking startup fix

2026-11-11 KST. Windows asyncio가 내부 TCP socketpair를 만들 때 기존 모델 중계 포트 제한에 차단되는 실행 경로를 수정한다. [원인과 기존 설치본용 패치](openviking-windows-loopback-fix.md)에 상세 근거를 기록한다. 지정하지 않은 로컬 포트·외부 connect/connect_ex·외부 DNS 차단은 유지한다.

새 Desktop 소스는 실패 단계와 코드·종료 숫자/안전한 오류 분류만 `%APPDATA%\L-Vibe\openviking\startup-status.json`에 기록한다. 원래 Python 출력·실제 API 키·모델 요청/응답은 이 파일에 저장하지 않는다. 0.2.2/0.2.3용 작은 launcher 패치에는 이 Desktop 진단 기능이 포함되지 않는다.

동일 수정 소스의 전체 회귀 검사 **56개 통과, 실패·건너뜀 0**, 타입 검사·스킬 34개·Desktop overlay 검증을 통과했다. 실제 고정 OpenViking 0.5.4의 Windows TCP 방식 import 재현도 통과했다. 빌드 환경은 Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, Python 3.12.14이며 Windows 런타임은 Python 3.12.16/Electron 44.9.1이다. 실제 Windows 패치 적용 결과 및 새 전체 EXE/TGZ 검증 수치는 각각 확인 후 갱신한다.

공식 Desktop 타입 검사는 **2개 프로젝트·2,549개 파일 오류 0**, main/preload/renderer 빌드도 통과했다. 원본 CSS·dynamic import·plugin timing 경고는 남는다. 고정 Windows Python은 344개 wheel/63,060개 파일로 재생성했고 manifest SHA-256은 `42f101caef4f976cc20bc3df5f1b3a25356f1a75d3f0297b79af77379733c901`이다. 원본과 비교해 launch.py의 해시만 바뀌며 별도 기존 설치본용 패치의 새 manifest와 동일하다.

반입 묶음에는 영문 이름의 설정 복구·라이선스·Windows 진단 문서와 CHECK_OPENVIKING.cmd/검사 스크립트를 포함한다. 이 도구는 설치된 번들 Python과 수정된 정책을 사용하며 실제 API 키/설정을 읽지 않고 임시 HOME에서 모듈 import를 검사한다. 실제 Windows 서비스/모델 수용은 별도다.

모델 설정 예제·기존 저장 설정 보존 안내와 [라이선스 재검토](license-policy.md)를 유지한다. 구성 요소/의존성 버전은 0.2.3과 동일하며 `releaseReady: false`다. Windows 10/11 전체 수용·사내 모델/SDK·DNS/TCP·자식 종료와 새 Desktop의 반복/재출력·세션 diff·일반 명령 구현/검증은 별도로 남는다.
