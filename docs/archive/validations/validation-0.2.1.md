> 이 문서는 당시 L-Vibe의 배포·검토 기록입니다. 버전·경로·해시는 당시 값을 유지합니다. 최신 구성은 [Ned 0.3.7 검증 기록](validation-0.3.7.md)을 참고하세요.

# L-Vibe 0.2.1 설치 후보 검증 — 2026-11-10 UTC

기본 스킬 34개와 OpenViking 최초 실행 등록을 추가한 후보입니다. 런타임 코드 체크포인트는 `0e1377d`입니다. OpenCode Desktop/CLI는 v2.2.6, 고정 upstream `dc2ffcf8bf26f9e669b6aa22b95f50e12be15e06`을 유지합니다. 새로운 MCP·실행형 플러그인은 설치하지 않았습니다.

## 코드와 실제 연동

- 빌드 환경: Linux x86_64, Node 24.22.1, Bun 1.4.4. 목표: Windows x64, Electron 44.9.1, CPython 3.12.16, OpenViking 0.5.4.
- 공식 Desktop 타입 검사: 2개 프로젝트, 2,549개 파일, 오류 없음.
- `npm run verify`: 타입 검사·스킬 무결성·40개 테스트·고정 Desktop overlay 검증 통과. 이 수에는 0.1 원형의 엔진·답변 재출력 테스트도 포함됩니다. 새 Desktop에서 아직 구현하지 않은 기능은 별도로 확인해야 합니다.
- 기본 스킬 목록·파일 해시 검증: 34개. 새 스킬·참조 문서를 실제 호스트 중계에서 읽고 변조·실행 스크립트·경로 이탈을 거부합니다.
- 실제 고정 v2 엔진의 `/api/skill`에서 설치 리소스의 기본 34개 ID가 모두 발견됩니다. 초기 비동기 활성화 이전 응답과 완료 상태를 구분합니다.
- 실제 OpenViking 0.5.4 프로세스에 기본 34개 패키지를 ZIP으로 업로드하고 `/api/v1/skills`로 설치했습니다. 본문·참조·라이선스의 저장 결과와 무결성 manifest를 대조했습니다.
- 같은 데이터로 OpenViking을 종료·재시작한 뒤 등록본을 확인했습니다. 변경 없는 기본 스킬로 인한 추가 임베딩/모델 요청은 없었습니다.
- 기존 프로젝트의 승인된 파일 색인·검색과 다른 프로젝트 URI 거부를 계속 확인했습니다.
- 별도 테스트에서 기본 패키지 갱신, 외부 편집/다른 소유자 보존, 부분 실패 재시도, 손상된 등록 기록 보존, 변조 번들/취소 거부를 확인했습니다.

모델 endpoint는 localhost OpenAI 호환 합성 서버입니다. 실제 사내 주소·키로 요청하지 않았습니다. 합성 서버 결과가 통계 스킬의 분석 정확도나 사내 Qwen의 도구 선택 품질을 증명하지 않습니다. 일반 명령 실행·Serena/clangd·새 Desktop의 반복 감지/답변 재출력 등 기존 미완료 항목은 그대로 남습니다.

## 배포 산출물

- `node scripts/desktop.mjs build` 및 `package` 완료. 설치 EXE: `L-Vibe-0.2.1-win-x64.exe`, **647,049,461 bytes**.
- EXE SHA-256: `5da6867a77147e48ef8e3bdef1ac7cc13522f383e79624e069b808f40f577b37`.
- `7zz t` 결과: NSIS-3 Unicode / Deflate / Solid, **Everything is Ok**, 73,010개 파일, 해제 크기 1,950,823,061 bytes.
- EXE에서 `resources/l-vibe/skills`와 `skills-lock.json`을 직접 추출하여 34개 스킬·259개 파일의 해시를 전수 대조했습니다. 스킬 manifest SHA-256: `2aec810670e3f3999ff63fcb8688fd0bc33c7180fd9e1eac6b33c288a88c4f4c`.
- 설치 입력 OpenViking/Python 63,060개 파일과 REA 9,019개 파일을 각 manifest SHA-256과 전수 대조했습니다. Windows CLI SHA-256은 `d55839bfc180fd573341265c750eaee72c3ebb2e57f3e2b3eca9cf3449b93507`로 고정 원본과 같습니다.
- NSIS manifest는 `asInvoker`, 실제 앱 PE machine은 AMD64입니다. 설치 프로그램을 Windows에서 실행해 확인한 결과는 아닙니다. 배포 서명은 없습니다.
- TGZ는 이 EXE·설정 예제·검증 상태·런타임 검사 기록·라이선스·대응 소스·커밋된 앱 소스를 묶습니다. TGZ 자체의 SHA-256은 옆의 `.sha256` 파일에 별도로 제공하여 자기 참조를 피합니다.

`releaseReady`는 Windows 실환경 검증 전이므로 false입니다.

## 남은 실환경 검증

Windows 10/11 일반 사용자 설치·첫 실행·업데이트·ACL·DPAPI·자식 프로세스 종료와 실제 DNS/TCP 관찰, 실제 사내 LLM/임베딩 서버 검증은 아직 실행하지 않았습니다. 설치 EXE 생성과 Linux 연동 검증을 Windows 또는 1.0 실환경 검증 완료로 취급하지 않습니다. 0.2.0의 이전 설치 검증 기록은 [별도 보고서](validation-offline-candidate.md)에 유지합니다.
