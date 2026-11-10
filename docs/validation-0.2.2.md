# L-Vibe 0.2.2 — 소스 검증 후보

MCP 6종의 실제 Linux 연동은 [MCP 검증 기록](mcp-validation.md)에 기재한다. 이 문서는 Windows 설치 EXE/TGZ 발행이나 Windows 수용 완료를 의미하지 않는다. 공개된 다운로드는 이전 0.2.1이며 6종 MCP가 포함되지 않는다.

Windows용 Python·MCP별 site-packages·MinGit·clangd·MSVC DLL을 확보하고 20,726개 staging 파일의 SHA-256을 전수 대조했다. 고정 Chrome for Testing 파일은 빌드 환경 정책에서 차단되어 번들이 미완성이다. 불완전한 상태에서 EXE/TGZ를 포장하는 경로는 오류로 중단한다. 실제 설치 리소스의 MCP 무결성 기록이 없거나 이전 0.2.1 기록을 재사용해도 TGZ를 생성하지 않는다.

`npm run verify`에서 45개 테스트와 기본 스킬 34개 무결성 검사를 통과했다. 공식 Desktop 타입 검사는 2개 프로젝트·2,549개 파일에서 오류가 없고 main/preload/renderer 빌드도 성공했다. 종료 확인 실패 시 다른 서비스를 정리하고 새 실행을 차단하는 오류 경로를 포함한다. 일반 회귀 검사에는 원형 0.1의 반복·재출력 검사도 있으므로 새 Desktop의 미구현 기능 완료로 계산하지 않는다.

Windows 10/11 설치·실제 DLL 로딩·6종 도구 호출·ACL·DPAPI·Job Object의 자식 종료·DNS/TCP 관찰·실제 사내 모델 검증과 새 Desktop의 남은 기능은 수용 전제다. `releaseReady`는 false다.
