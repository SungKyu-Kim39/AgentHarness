# Ned 0.3.16

Ned 0.3.16 사전 릴리스입니다.

## 주요 변경 사항

- **`ned_host_browser_check` 즉시 종료(`MCP 프로세스가 종료되었습니다.`) 근본 해결**:
  - 배포본 `mcp/node` 레이아웃에서 `@playwright/mcp`·`chrome-devtools-mcp`의 형제 패키지 해석을 위한 `NODE_PATH`와 Windows `System32`·`ComSpec` 실행 환경을 보강하고(개인 프로필 격리 유지), 비정상 종료 시 민감 정보를 제외한 진단 마커를 기록하도록 개선했습니다.
- **한글 Windows 호환성·설정 복원력 및 파일 원자성 보강**:
  - Windows 메모장·PowerShell UTF-8 BOM 설정 JSON 허용, 잘못된 설정 파일 가져오기 시 구체적 오류 사유 안내, 짧은/플레이스홀더 API 키의 평문 오탐 마스킹 방지, `atomicJSON` 경로별 직렬화 및 Windows `rename` 잠금 재시도, Python/OpenViking/Graphify/REA 파이프 UTF-8 강제 및 `AbortSignal` 즉시 취소를 반영했습니다.
- **자동 스킬·하위 에이전트 정합성, 보안 경계 및 VS2022 빌드 확장**:
  - 앱 재시작 없는 글로벌 스킬 및 프로젝트 `.ned/skills` 자연어 자동 라우팅 반영, 하위 에이전트(`spawn_subagent`)의 `rea_*` 전문 도구 문맥 전달, 외부 읽기 민감 경로(`.ssh`·`.aws`·`Ned-Launcher`·`L-Vibe` 등) 및 `.ned`/`.vscode` 쓰기 차단, Visual Studio 2017/2019/2022 MSBuild 탐색 확장, Zed 대화 가져오기 임시 스냅샷 정리를 포함했습니다.

자세한 변경 내역은 [changes-0.3.16.md](https://github.com/SungKyu-Kim39/AgentHarness/blob/main/docs/changes-0.3.16.md)를 참고하세요.

## 검증 요약

<!-- windows-verification -->

## 설치 안내

1. 실행 중인 Ned와 개인 Zed를 모두 종료합니다.
2. `Ned-0.3.16-windows-x64.tgz`를 새 폴더에 풀고 `Ned-0.3.16-win-x64.exe`를 실행합니다.
3. 기존 설정·대화·지식과 사용자 글로벌 스킬은 그대로 유지됩니다.
