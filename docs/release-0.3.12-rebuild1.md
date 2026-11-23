# Ned 0.3.12 rebuild1

- 일부 Windows 10·11 사내 PC에서 Windows 레지스트리(`HKCR\.js\Content Type`)가 `.js`를 `text/plain`으로 반환해 OpenViking Studio 모듈 스크립트(`/studio/assets/*.js`) 로드가 거부되고 `STUDIO_RENDER_TIMEOUT`이 발생하던 문제를 수정했습니다.
- OpenViking 런처(`launch.py`)에서 Python `mimetypes`의 Windows 레지스트리 조회를 비활성화하고 표준 웹 자산 MIME 타입(`.js`/`.mjs`, `.css`, `.wasm`, `.svg`, `.woff2` 등)을 명시 등록했습니다.
- Ned Electron Studio 호스트(`onHeadersReceived`)에서도 `/studio/` 정적 리소스(HTTP 2xx)의 `Content-Type`을 확장자 기준 표준 MIME 타입으로 정규화하고, 모듈 MIME 거부 콘솔 오류를 `STUDIO_MIME`으로 구분 기록합니다.
- 0.3.12의 권한 정책 정비, 승인 팝업 최상단 표시, OpenViking·Studio 상시 진단, 전체 설치본 단일화와 소스 빌드 편집기(`Ned-editor-0.3.12.exe`)를 그대로 유지합니다.

[변경 사항](changes-0.3.12.md) · [OpenViking Studio 안내](openviking-studio.md) · [권한 안내](approval-modes.md)

설치 파일 60,122개를 준비본과 대조했습니다. Windows Server에서 새 설치, 0.3.12 업데이트와 사용자 글로벌 스킬 보존을 확인했고 설치본 대상 검사 27건이 통과했습니다. 직원 PC의 Windows 10·11 GUI와 실제 사내 모델 검증은 남아 있어 사전 릴리스로 제공합니다.

[Windows 검사](https://github.com/SungKyu-Kim39/AgentHarness/actions/runs/45118621226) · [검증 기록](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/validation-0.3.12-rebuild1.md)

