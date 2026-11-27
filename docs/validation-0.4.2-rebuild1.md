# Ned 0.4.2 rebuild1 검증

Linux Electron 45.2.3에서 0.4.2의 관리 창 초기화 오류를 재현했습니다. 기존 빌드는 preload의 `child_process` 모듈 로딩과 화면의 `nedMcp.request` 호출에서 실패했습니다. 수정본은 `app.asar`를 사용한 Electron 창에서 합성 MCP 서버의 연결 확인, 도구 선택, 등록, 토글, 저장 파일 다시 읽기가 통과했습니다. 빌드 결과와 설치 EXE에서 추출한 preload에 내장 통신 API를 사용하는지도 검사합니다.

Windows Server에서는 설치본의 Electron과 설치 EXE에 포함된 preload를 사용해 관리 창의 연결 확인·도구 선택·저장·토글·등록 재읽기를 실행합니다. 새 설치, 0.4.2 제자리 업데이트와 MCP 등록 파일 보존, 설치된 ACP의 슬래시 호출도 검사합니다. 실제 직원 PC에서의 사내 서버 연결은 현장에서 확인하는 범위입니다.
