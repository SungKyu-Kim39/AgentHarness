# Ned 0.4.0 rebuild2 변경 사항

제품 버전은 0.4.0입니다. 이번 수정 빌드는 `0.4.0-rebuild1`이 반영된 `main` 브랜치 전체를 재검토해 실행 경계, 대용량 파일·다중 파일 복구, OpenViking 비동기 기억 복구, NSIS 업그레이드 복구, 설정·도구 명세 정합성을 보완했습니다.

- **읽기 전용 도구의 프로젝트 Python 미승인 실행 차단**: `code_audit` 기본 검사에서 프로젝트 `.venv` Ruff 실행을 제외하고, `venv-ruff`를 명시 요청한 경우에만 호스트 승인·`-I` 격리·`ProjectFiles.resolve()` 경로 검증·`--` 구분자를 적용합니다. `document_read(mode: "docling")` 역시 프로젝트 Python 호출 전에 호스트 승인과 `-I` 격리를 거칩니다. `manage_python_venv(operation: "freeze")`에도 `-I` 격리를 추가했습니다.
- **160 KB stdout 절단 결함 해소**: `OwnedCommand`에 최대 4 MiB까지 제한적으로 상향 가능한 `maxStdoutBytes` 옵션을 추가해 `project_checkpoint` 복원과 `worktree_sandbox` 적용 시 160 KB~2 MiB 텍스트 파일이 잘리지 않도록 고쳤습니다. `ast_search`, `code_audit`, `document_read`/`document_write`(HWP/HWPX·PDF 표·Docling·Office) 워커는 구조화 JSON 결과를 임시 작업 폴더의 `result.json` 파일로 교환해 대용량 출력 파싱 실패를 없앴습니다.
- **다중 파일 쓰기 부분 실패 시 자동 롤백과 동시성 보강**: `ProjectFiles.applyBatch`를 추가해 `project_checkpoint` 복원, `worktree_sandbox` 적용, `ast_search(apply: true)`, `spec_workflow(init)` 도중 중간 파일에서 충돌·취소가 발생하면 먼저 반영한 파일을 역순으로 원상 복구합니다. `ProjectCheckpoints.diff()`는 격리된 `GIT_INDEX_FILE`을 사용해 인덱스 경합을 없애고, `restore()`는 대상 검증과 승인 후에만 안전 체크포인트를 생성합니다. `ast_search(apply: true)`는 스냅샷 이후 외부 변경 여부와 200건 상한 절단 여부를 검사합니다.
- **Worktree·하위 Agent 수명 정리**: `WorktreeSandbox.get()`이 상위 심볼릭 링크 환경에서도 정상 동작하도록 `realpath` 비교를 보정하고, `AD` 상태 처리와 수동 삭제된 worktree `prune` 정리를 지원합니다. `Subagents.load()`에서 `worktreeId`/`worktreePath` 형식을 검증하며, `spawn()` 실패·사전 취소 시 새로 만든 worktree를 자동 정리합니다.
- **OpenViking 비동기 기억 작업 복구 및 증분 동기화**: `OpenVikingService.getTaskStatus()`(`/api/v1/tasks/{task_id}`)를 연결해 `SessionMemoryManager`가 비동기 커밋 작업의 완료·실패를 확인하고, 실패 시 제한 횟수 내에서 미커밋 턴을 복구해 재시도하며 진행 중 작업에는 중복 커밋을 방지합니다. `fetchSessionInfo` 실패 시 fail-closed로 전환했고, 연속 동기화 접두사 워터마크와 페이지 커서 기반 증분 동기화를 적용했습니다.
- **NSIS 인플레이스 업그레이드 복구**: `distribution/ned/installer.nsi`가 기존 `resources`·`locales`·`Ned.exe`를 삭제하지 않고 `.ned-upgrade-backup`으로 이동한 뒤 설치·검증이 실패하면 이전 설치본을 자동 복구합니다. `agent-desktop.exe` 잠금 사전 검사도 추가했습니다.
- **오프라인 Mermaid·API·문서·설정 정합성 보강**: `diagram_generate` 오프라인 Chromium에 DNS 차단(`--host-resolver-rules=MAP * ~NOTFOUND`)·QUIC/WebRTC 비활성화·CSP·MCP 런타임 무결성 검사를 추가하고 `mermaid.min.js`를 외부 스크립트로 분리했습니다. `requestJSON`이 누락된 `Content-Type`을 `application/json`으로 임의 채우지 않도록 고쳐 `api_contract_test` 검증 정확도를 높였고, 다중 경로 매개변수(`/items/{id}-{sub}`) 정규식을 수정했습니다. `office-worker.py`의 병합 셀 열 너비 계산을 `get_column_letter`로 보정하고, `python-inspector.py`는 얕은 깊이·`__init__` 우선 정렬로 대형 패키지 핵심 API 누락을 줄였습니다. `agent-config.example.json`, `host-tools.ts`, `native-control.ts`, `python-intranet-venv` 스킬, 자동 라우팅 문서를 `0.4.0` 정책과 일치시켰습니다.

## 다음 교차 검토에서 확인할 항목

- 실제 Windows 10·11 직원 PC에서 `0.4.0-rebuild1` → `0.4.0-rebuild2` 업그레이드, 중단 시 `.ned-upgrade-backup` 복구 경로, 사내 PyPI 단일 HTTPS 미러 설치와 `python_app_preview`·`browser_check` 연계 동작.
- 실제 Windows 10·11에서 `diagram_generate`(Mermaid PNG/SVG)·`document_write`(XLSX/DOCX/PPTX/HWPX) 결과물의 한글 폰트 및 Office/한컴오피스 호환성.
- 실제 사내 LLM·임베딩 서버와 OpenViking 0.5.5 환경에서 장시간 대화의 `/api/v1/tasks/{task_id}` 완료·실패 복구 및 외부망 차단 최종 수용 확인.
