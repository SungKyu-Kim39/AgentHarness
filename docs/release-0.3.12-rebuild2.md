# Ned 0.3.12 rebuild2

- 기존 프로젝트 UTF-8 텍스트 파일의 지정 구간만 정확히 교체하는 **부분 편집 도구(`patch_file`)**를 추가했습니다.
- 큰 파일의 일부만 고칠 때 파일 전체를 다시 출력(`propose_edit`)하지 않고 `{ oldText, newText, startLine?, endLine?, replaceAll? }` 단위로 안전하게 수정할 수 있으며, Windows CRLF 줄바꿈 보존, 모호/미일치·무변경 거부, 기존 권한 모드·Zed 미저장 버퍼 검사·SHA-256 충돌 검사·원본 전체 스냅샷·워커 서브에이전트 `writePaths` 제한을 동일하게 적용합니다.
- 0.3.12 및 0.3.12 rebuild1의 권한 정책, 승인 팝업 최상단 표시, OpenViking Studio Windows MIME 정규화, OpenViking 상시 진단, 전체 설치본 단일화와 소스 빌드 편집기(`Ned-editor-0.3.12.exe`)를 그대로 유지합니다.

[변경 사항](changes-0.3.12.md) · [권한 안내](approval-modes.md) · [OpenViking Studio 안내](openviking-studio.md)

<!-- windows-verification -->
