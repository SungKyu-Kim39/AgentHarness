# Ned 0.3.12 rebuild2 검증

0.3.12 rebuild2는 기존 파일 전체를 덮어쓰는 `propose_edit` 외에 파일 중간의 특정 코드 블록만 안전하게 교체하는 부분 편집 도구 **`patch_file`**을 추가한 수정 빌드입니다. 검증된 소스 빌드 편집기 `Ned-editor-0.3.12.exe`(실행 45097703655)와 0.3.12 rebuild1의 OpenViking MIME 런타임을 유지하며 Electron 호스트와 ACP/테스트 번들을 새로 빌드·감사합니다.

Linux 단위 테스트와 Windows Server 스모크 검증은 실제 Windows 10·11 직원 PC의 GUI, 사내 모델·임베딩 서버 수용 시험과 구분합니다. 직원 PC 확인 절차는 [Windows 확인 목록](windows-acceptance.md)을 따릅니다.

## Linux 단위 검증

- `npm run typecheck`: 통과
- `npm run skills:verify`: 통과 (74개 오프라인 스킬 검증)
- `node scripts/verify-current-docs.mjs`: 통과
- [`tests/patch-file.test.ts`](../tests/patch-file.test.ts): 단일/다중 hunk 부분 편집, Windows CRLF 줄바꿈 보존, 모호 일치 거부 및 `startLine`/`endLine`·`replaceAll` 분기, 미일치·무변경 거부, `ask`·`edits` 권한 모드, `validateEdit` 미저장 버퍼 검사, 전체 원본 스냅샷 저장, 보호 경로·프로젝트 외부 경로 차단 검증
- [`tests/subagents.test.ts`](../tests/subagents.test.ts)·[`tests/permission-policy.test.ts`](../tests/permission-policy.test.ts): 기존 권한·서브에이전트 회귀 검증 통과

## 남은 검증 범위

- 실제 사내 Windows 10·11 PC와 사내 모델 환경에서 긴 소스 파일에 대한 `patch_file` 부분 편집 동작, 승인 팝업 최상단 표시 및 OpenViking Studio 렌더링 확인 (`releaseReady: false` 유지)
