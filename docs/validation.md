# Desktop 전환 초기 검증

날짜: 2026-11-10. 대상: OpenCode Desktop 기반 L-Vibe의 첫 구현 단계. 이 결과는 Windows 설치·실행이나 1.0 완료 판정이 아니다.

| 검증 | 관찰 결과 |
| --- | --- |
| 설계 원격 반영 | `20b00a9f7470652b0044c23f27d6dce4973c5a4f`, origin/work를 git ls-remote로 확인 |
| 초기 구현 원격 반영 | `a6c300b93789ea526e7826bcafc04581a47f8269`, origin/work의 동일 SHA 확인 |
| 공식 소스 | v2.2.6 / dc2ffcf8bf26f9e669b6aa22b95f50e12be15e06 |
| 소스 archive | 75,208,595 bytes, SHA-256 dfa26f59cc4f20424ada95199e0d50fc9d86fe8eda1f7264cf5962f7366de71f |
| 준비·무결성 | 실제 고정 원본에 16개 파일 패치·overlay 적용, 재실행 및 경계 파일/overlay 검증 |
| 타입·회귀 | npm run verify: 타입 검사, 테스트 25개 통과·실패 0·skip 0, Desktop 경계 검증 통과 |
| 새 패치 테스트 | 실제 원본의 결정적인 계획·변경 TS 구문·적용 파일 해시·혼합 버전 적용 전 거부·부트 환경 계약 |
| 기존 엔진 테스트 | 1.19.5와 localhost 합성 모델/MCP의 승인·수정·반복·재출력 회귀. v2.2.6 실제 엔진 검증을 의미하지 않음 |
| 배포 차단 | desktop build를 요청하면 미완료 조건을 열거하고 종료. 설치본을 성공 생성한 것으로 표시하지 않음 |

검증 환경은 Linux 6.18.57 x86_64 개발 실행기와 Node.js v24.22.1이다. 테스트 API는 로컬 합성 서버이며 사내 endpoint나 실제 키는 사용하지 않았다.

upstream 전체 Bun 의존성 설치·공식 전체 lint/typecheck·Desktop 실제 실행·Win10/11 설치/ACL·DNS/TCP·실제 사내 모델·OpenViking 등 서비스 연결 수용 검증은 미실행이다. [구현 계획](implementation-plan.md)의 다음 단계와 [배포 차단 목록](../distribution/readiness.json)을 따른다.
