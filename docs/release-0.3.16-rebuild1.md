# Ned 0.3.16 rebuild1

버전을 올리지 않고(0.3.16 유지, 검증된 소스 빌드 편집기 `Ned-editor-0.3.16.exe` 재사용) 2회에 걸친 코드베이스 전면 재검토에서 도출한 결함과 안전 경계 보완 사항을 모두 통합한 0.3.16 갱신 빌드입니다.

- **`ned_host_browser_check` IPv6 루프백(`::1`) 지원 및 DevTools 오류 진단 보강**: IPv6 전용 로컬 개발 서버(`http://[::1]:포트` 및 `http://localhost:포트` -> `::1` 자동 폴백, DNS 미조회)를 지원하고, DevTools MCP 워커 로드 실패 시 안전한 오류 코드·이름 마커를 기록합니다.
- **모델 설정 `defaultModel`/`defaultVariant` 검증 및 `ZedModels` 요청 옵션 우선순위 보정**: `providers` 스키마에서 `[N]` 접미사 없이 `defaultModel`을 매칭·검증하고, `ZedModels`가 요청별 파라미터와 중첩 `chat_template_kwargs`를 보존합니다.
- **개인화 대화 기억 종료 유실 방지·Compaction 후 세션 opt-out 유지·회상 본문 마스킹**: 종료 직전 짧은 세션의 미커밋 턴을 `memory-sync.json`에 보존해 다음 실행에서 OpenViking 준비 직후 안전하게 커밋하며, Compaction 이후에도 세션 opt-out 회상 차단과 회상 본문 시크릿 마스킹을 유지합니다.
- **전체 권한 고위험 셸 가드·읽기 전용 Git 필터·승인 일관성·한글 MSBuild 출력 보강**: PowerShell 스크립트 블록(`& { ... }`), 중첩 `$(...)`, `cmd /c"..."`, `shutdown`/`schtasks`를 고위험 승인 대상으로 보강하고, 읽기 전용 `git_inspect`의 `.vscode`/`.ned` 경로 필터 허용, 재시작 시 승인 프로젝트 유지 및 `"모든 자동 승인 해제"` 동기화, MSBuild `/utf8output` + `StringDecoder`를 적용했습니다.
- **NSIS 실행 중 잠금 사전 검사·통합 터미널 작업 등록 및 자원 수명 정리**: 업데이트 전 실행 중인 Ned/Zed/사이드카 파일 잠금을 검사해 기존 설치 파손을 방지하고 한국어 안내창으로 통일했습니다. `prepareEditor()`의 `ensureTerminalTasks` 호출 누락을 연결하고 `DesktopTools`·`ReaGhidra`·`OfflineSkills`·`OpenVikingService`·`agent.ts`·`zed-history.ts`의 경합·정리 경로를 보강했습니다.

[변경 사항](changes-0.3.16.md) · [자연어 자동 도구 연결 안내](ned-auto-routing-guide.md) · [권한 안내](approval-modes.md)

<!-- windows-verification -->
