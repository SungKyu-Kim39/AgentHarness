# Ned 0.3.12 rebuild1 검증

0.3.12 rebuild1은 실제 사내 Windows PC의 `studio-status.json` 진단에서 확인된 OpenViking Studio 모듈 스크립트 MIME 거부 문제(`Failed to load module script ... MIME type of "text/plain"`)를 해결하는 수정 빌드입니다. 편집기 바이너리는 검증된 `Ned-editor-0.3.12.exe`(실행 45097703655)를 그대로 재사용하며, Electron 호스트와 OpenViking `launch.py` 런타임만 다시 빌드·감사합니다.

Linux 단위 테스트와 Windows Server 스모크 검증은 실제 Windows 10·11 직원 PC의 GUI, 사내 모델·임베딩 서버 수용 시험과 구분합니다. 직원 PC 확인 절차는 [Windows 확인 목록](windows-acceptance.md)을 따릅니다.

## Linux 단위 검증

- `npm run typecheck`: 통과
- `npm run skills:verify`: 통과 (74개 오프라인 스킬 검증)
- `node scripts/verify-current-docs.mjs`: 통과
- Python `scripts/openviking-launch.py` `configure_mime_types()` 검증: `.js`가 `text/plain`으로 오염된 상태에서 `configure_mime_types()` 호출 후 `.js`/`.mjs` → `text/javascript`, `.css` → `text/css`, `.wasm` → `application/wasm`, `.svg` → `image/svg+xml` 반환 확인
- [`tests/studio-policy.test.ts`](../tests/studio-policy.test.ts): `studioResponseHeaders`가 `/studio/assets/index-*.js`의 `content-type: text/plain`을 `text/javascript; charset=utf-8`로 정규화하고 `/api/v1/*`·4xx 응답은 그대로 유지함을 확인
- [`tests/studio-lifecycle.test.mjs`](../tests/studio-lifecycle.test.mjs): `onHeadersReceived`의 `text/plain` `.js` 보정 및 모듈 MIME 거부 콘솔 오류의 `STUDIO_MIME` 분류 확인

## 남은 검증 범위

- 실제 사내 Windows 10·11 PC(레지스트리 `.js` → `text/plain` 환경 포함)에서 OpenViking Studio 정상 렌더링 확인
- 실제 사내 LLM·임베딩 서버와 폐쇄망(외부망 차단) 환경에서의 최종 수용 확인 (`releaseReady: false` 유지)

## 설치 파일과 Windows 결과

제품 소스는 `074905951678e2c406f3a0d893fb33394b276134`입니다. Windows Server에 최종 EXE를 새로 설치해 27건 중 27건 통과, 0건 제외, 실패 0건을 확인했습니다. 0.3.12에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.

설치 EXE는 1535027559 bytes, SHA-256 `bbce9040a31c3445c7ca3463ccc627c9cbdbbe8c379ed9df7c8a7cd370bf1d2f`입니다. 준비본과 추출본의 60122개 파일을 모두 대조했습니다.

[실행 결과](../downloads/Ned-0.3.12-rebuild1-windows-offline-smoke.json) · [설치 감사](../downloads/Ned-0.3.12-rebuild1-installer-audit.json) · [반입 TGZ](../downloads/README.md)
