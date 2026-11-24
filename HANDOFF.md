# Ned 개발 인계

새 PC나 Codex 세션에서 개발을 이어갈 때 확인할 정보입니다. 최신 사전 릴리스는 **Ned 0.3.16**입니다. Zed, 전용 OpenCode 엔진, Aegis·Conductor·OpenViking과 개발 도구를 한 번에 설치해 사내 모델로 사용하는 폐쇄망 환경을 목표로 합니다.

## 0.3.16 배포 기준

소스 `b8d6e307f01a2bca07fb3c69392732a4a1bfd2a0`를 사용했습니다. Windows 새 설치·0.3.15 업데이트와 47개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.16.md)


- `ned_host_browser_check` 워커 즉시 종료(`MODULE_NOT_FOUND` 및 Windows `System32`·`ComSpec` 실행 환경 누락) 근본 수정과 종료 진단 마커 기록(`src/main/mcp-extensions.ts`, `scripts/test-mcp-live.ts`, `tests/mcp-boundary.test.ts`, `scripts/windows-test-bundle.mjs`)을 반영했습니다.
- UTF-8 BOM 설정 JSON 허용·가져오기 실패 사유 안내(`src/main/config.ts`, `distribution/native-control.ts`), 짧은/플레이스홀더 API 키 평문 오탐 마스킹 방지, `atomicJSON` 경로별 직렬화 및 Windows `rename` 재시도, Python/OpenViking/Graphify/REA 파이프 UTF-8 강제 및 `AbortSignal` 즉시 취소를 적용했습니다.
- 재시작 없는 글로벌·프로젝트(`.ned/skills`) 자동 스킬 라우팅(`src/main/skills.ts`, `src/main/skill-routing.ts`), 하위 에이전트 `rea_*` 문맥 전달(`distribution/subagents.ts`, `distribution/host-tools.ts`), 외부 읽기 민감 경로(`.ssh`·`.aws`·`Ned-Launcher`·`L-Vibe` 등) 및 `.ned`/`.vscode` 쓰기 보호(`src/main/files.ts`), VS2017/2019/2022 MSBuild 지원(`distribution/vs-build.ts`), `PythonProjects` 완료 기록 정리 및 Zed 대화 가져오기 임시 스냅샷 삭제(`distribution/ned/zed-history.ts`)를 완료했습니다.

## 0.3.15 배포 기준

소스 `0bb5233db20ba3ba9f7befe746c48143a81ffae4`를 사용했습니다. Windows 새 설치·0.3.14 업데이트와 43개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.15.md)


- 대용량 `propose_edit`·`knowledge_index` 승인 미리보기 절단(`distribution/host-tools.ts`), 전체 권한 모드 고위험 셸 가드(`isHighRiskShellCommand`) 우회 차단(중첩 `cmd /c`·`powershell -Command`, `-EncodedCommand`/`-File`, `iex`/`Invoke-Expression`, 위험한 `Start-Process`, PowerShell 약어 옵션, `Net.WebClient`), 세션별 `graphify`/`rea_inspect` 자식 프로세스 격리를 적용했습니다.
- 슬래시 스킬(`/skill-...`) 및 2턴 후속 대화의 전문 도구 노출·호스트 판정 일치(`distribution/ned/agent.ts`, `src/main/skill-routing.ts`, `distribution/native-control.ts`), 장시간 세션 메시지 조회 확장(50페이지·`order=asc`), `subagents.json`(2,000건 회전)·`memory-sync.json`(500세션 정리)·`watermarkCreatedAt <` 경계 보정, 트레이 자동 대화 기억 상태 실시간 갱신(`distribution/ned/main.ts`)을 반영했습니다.
- 버전 정책 단일화(`scripts/release-policy.mjs`), 링크 없는 자연어 자동 도구 연결 소개·안내·상세 문서(`docs/ned-auto-routing-guide.md`, TGZ `AUTO_ROUTING_GUIDE.md` 및 트레이 메뉴 포함), 기존 사용자 안내 문서 0.3.15 전면 최신화를 완료했습니다.

## 0.3.14 배포 기준

소스 `05ef6c8747c49e478df484f9270fd105030d2074`를 사용했습니다. Windows 새 설치·0.3.13 업데이트와 42개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.14.md)


- [P0] 개인화 대화 기억 턴·세션 opt-out 회상+수집/커밋 통합 적용, 회상 쿼리 시크릿 마스킹 및 JWT/PEM/AWS/DB URL/공백 포함 비밀번호 패턴 보강, 트레이 자동 대화 기억 상태 표시와 문서 고지 명확화(`src/main/session-memory.ts`, `distribution/native-control.ts`, `distribution/ned/main.ts`, `docs/knowledge-notes.md`, `docs/ned-user-guide.md`).
- [P1] OpenViking 백그라운드 `semantic_and_vectors` 실패 진단 로깅(`OV_SEMANTIC_REFRESH_FAILED`), 409 1회 백오프 재시도(`OV_SEMANTIC_RETRY`), `saveNote` 실패 시 기존 타이머 보존, 상위 `index`/하위 노트 prefix 병합, 종료 시 미완료 대기 건수 기록(`OV_SEMANTIC_PENDING_SHUTDOWN`) 보강(`src/main/openviking.ts`).
- [P2] `commitEveryTurns` 범위 클램핑(`1`~`50`, 기본 `6`), 400+ 메시지 장시간 세션 워터마크 중복 수집 차단, 긴 세션 ID SHA-256 접미사 충돌 방지, `buffer-check.ts` 일시적 RPC 오류 재시도 보강(`src/shared/contracts.ts`, `src/main/session-memory.ts`, `distribution/ned/buffer-check.ts`).

## 0.3.13 배포 기준

소스 `08b395b638d05ae1645d0006074dcdf9cf25d1d3`를 사용했습니다. Windows 새 설치·0.3.12-rebuild2 업데이트와 37개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.13.md)


- OpenViking 개인화 대화 기억 자동 추출·회상 및 VLM 의미 요약(`src/main/session-memory.ts`, `src/main/openviking.ts`, `src/main/openviking-gateway.ts`, `distribution/native-control.ts`, `distribution/ned/agent.ts`, `distribution/ned/owner.ts`)을 구현했습니다.
- "저장하지 않은 편집기 변경" 버퍼 가드 오탐 근본 수정(`distribution/ned/buffer-check.ts`, `src/main/files.ts`, `distribution/ned/agent.ts`, `distribution/ned/owner.ts`)을 포함했습니다.

## 0.3.12 rebuild2 배포 기준

소스 `f49d866b2ebd8bcf131d22d91841cb6ad93b5d27`를 사용했습니다. Windows 새 설치·0.3.12-rebuild1 업데이트와 29개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.12-rebuild2.md)


## 0.3.12 rebuild1 배포 기준

소스 `074905951678e2c406f3a0d893fb33394b276134`를 사용했습니다. Windows 새 설치·0.3.12 업데이트와 27개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.12-rebuild1.md)


## 0.3.12 배포 기준

소스 `38fef304308afac4c7ed85a8270b29a9d884698c`를 사용했습니다. Windows 새 설치·0.3.11 업데이트와 26개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](docs/validation-0.3.12.md)

### 0.3.12 주요 변경

- 권한 정책을 확정 매트릭스에 맞춰 정비했습니다: `run_terminal`은 `isHighRiskShellCommand` 최소 고위험 가드만 전체 권한에서 명시적 승인(`approveExplicit`)을 요구하고 일반 개발·빌드·테스트 명령은 자동 승인합니다. 외부 파일 읽기(`ExternalRead`)는 `ask`·`edits`에서 승인창 후 허용, `full`에서 자동 승인하며 보호 경로·외부 쓰기는 차단합니다. `knowledge_remember`·`knowledge_forget`도 `this.options.approve`로 통일해 `full`에서 자동 승인합니다.
- 승인 팝업·파일/폴더 선택창이 Zed 뒤로 숨지 않도록 [`distribution/ned/topmost-dialog.ts`](distribution/ned/topmost-dialog.ts)의 활성 모니터 중앙 `screen-saver` 최상단 소유자 창을 적용했고, Python 환경 선택창도 최상단 레벨로 올렸습니다.
- OpenViking Studio는 차단 URL(`STUDIO_BLOCKED_REQUEST`), `did-fail-load`, 콘솔 경고·오류, `#app` DOM 요약을 `openviking/studio-status.json`에 상시 기록하며 초기 렌더 타임아웃을 30초로 늘리고 동일 origin `blob:` 및 `font-src` CSP를 보완했습니다.
- OpenViking 저장/검색 실패 원인은 임베딩 모델 연결 오류로 확인됐으며, `vikingErrorCode`에 `OV_FORBIDDEN`·`OV_TIMEOUT`·`OV_EMBEDDING`·`OV_SERVER_ERROR`·`OV_TLS`를 추가하고 `OpenVikingGateway` 오류 코드 전달과 `openviking/request-diagnostics.json` 상시 기록(민감 정보 마스킹, 500자 제한)을 적용했습니다.
- 설치본을 전체 설치본 단일 배포로 단순화했습니다(`install-reversing-pack.ps1`, `NED_CORE`, Core/리버싱 팩 빌드·CI 단계 제거, `ReaGhidra` 번들 경로 단일화, `docs/archive/offline-packs.md` 보관). 기본 대화 시 특수 도구 스키마 지연 로딩은 유지합니다. 트레이 메뉴의 변경 사항 링크도 `NED_VERSION` 기반으로 수정했습니다.

[0.3.12 변경 사항](docs/changes-0.3.12.md) · [0.3.12 검증 기록](docs/validation-0.3.12.md)

## 배포 작업

고정 편집기와 런타임을 준비하고 전체 설치 EXE를 빌드합니다. Windows에서 EXE 해시와 설치·업데이트 결과를 확인한 뒤 같은 EXE와 대응 소스를 반입 TGZ에 담습니다. 현재 공개 파일과 검증 기록은 다운로드 안내에서 확인합니다. [다운로드](downloads/README.md)

설치 후보 워크플로의 `scripts/release-inputs.py`는 `scripts/ned-bootstrap-lock.json`에 고정된 빌드 입력을 `.cache/ned/bootstrap/installer.exe`에 복원합니다. 제조사가 제공한 런타임과 대응 소스의 버전 및 SHA-256 검사는 빌드 PC에서 수행합니다.
