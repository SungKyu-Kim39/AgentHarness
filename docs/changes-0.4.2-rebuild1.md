# Ned 0.4.2 rebuild1 변경 사항

사용자 MCP 관리 창에서 `Cannot read properties of undefined (reading 'request')`가 표시되어 연결 확인과 등록을 진행할 수 없던 문제를 수정했습니다. 관리 창의 초기화 모듈이 Electron 내장 통신 기능을 사용하도록 빌드를 고쳤습니다.

관리 창을 열 때 초기화에 실패하면 안내를 표시합니다. 빌드 과정과 설치 EXE에서 추출한 파일 모두에서 관리 창의 통신 기능을 검사합니다.

[등록과 사용법](extension-guide.md) · [검증 기록](validation-0.4.2-rebuild1.md)
