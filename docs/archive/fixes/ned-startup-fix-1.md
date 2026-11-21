# Ned 0.3.1 시작 수정 패치 1

배포 PC에서 조기 종료 위치 `crates/paths/src/paths.rs:204:18`을 확인했습니다. 원래 실행기 프로필에서는 LocalAppData·RoamingAppData의 Windows Known Folder 조회가 `0x80070003`을 반환했습니다. `USERPROFILE/AppData/Local`과 `USERPROFILE/AppData/Roaming`을 만들자 두 조회가 성공하고 전용 홈 안의 경로를 반환했습니다.

해당 소스는 로그 초기화 전 `init_paths`에서 `dirs::cache_dir().expect("failed to determine LocalAppData directory")`를 호출합니다. 이 패치는 LocalLow를 포함한 표준 AppData 구조를 만들고 `APPDATA`·`LOCALAPPDATA`를 맞춥니다. Zed 설정·DB·로그는 기존 `--user-data-dir` 아래에 유지하며 원래 설정·기록·지식은 보존합니다.

표준 프로필의 `--system-specs`에서 나온 `0xc0000005`는 별도 결과입니다. 폴더 조회 수정만으로 모든 네이티브 종료 원인을 해결했다고 판단하지 않았습니다.

## 프로젝트 선택 없이 시작하기

원본 0.3.1은 편집기 전에 프로젝트 선택을 요구하고 취소하면 종료했습니다. 패치는 이 창을 없애고 `restore_on_startup: launchpad`로 빈 시작 화면을 엽니다. 최근 프로젝트나 폴더 열기를 나중에 선택할 수 있습니다.

프로젝트 위치 인자를 전달하지 않고 앱 소유 작업 폴더에서 실행합니다. AI 접근은 기존 네이티브 범위 승인 후 허용하며 앱 관리 폴더는 기본 프로젝트로 사용할 수 없습니다.

## 적용 방법

[L-Vibe가 아닌 Ned 0.3.1용 패치](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-startup-fix-1.tgz)를 사용합니다. 대상은 정확한 원본 Ned 0.3.1 설치본입니다.

1. Ned와 모든 Zed를 종료합니다.
2. 쓰기 가능한 새 폴더에 패치를 풉니다.
3. `APPLY_FIX.cmd`를 실행해 `applied` 또는 `already-applied`, `EXIT_CODE=0`을 확인합니다.
4. 설치된 Ned 바로가기로 실행합니다.

`ROLLBACK_FIX.cmd`는 이 패치의 검증된 백업만 복원합니다. 패치는 원본 `Ned.exe`·`app.asar` 해시를 확인하고 의존성·라이선스 전체 아카이브를 보존한 채 `app.asar`를 원자적으로 교체합니다. 원본 EXE의 아카이브 검증 fuse가 비활성화돼 있음을 확인했으며 fuse나 EXE를 바꾸지 않았습니다. 알 수 없는 버전과 충돌 백업은 거절합니다. 제어판의 설치 버전은 0.3.1로 남습니다. 저장소·모델 주소·키·지식·프로젝트는 변경하지 않습니다.

## 실패가 계속될 때

`editor-startup-status.json`의 `diagnosticRevision: 2`, 네이티브 실패 분류와 고정 Rust 소스 위치를 확인합니다. panic 원문, 환경 값과 임의 경로는 저장하지 않습니다.

갱신한 `CHECK_EDITOR`는 `--system-specs`가 실패해도 일반 GUI 초기화를 검사합니다. 임시 오프라인 프로필을 쓰고 모델 서비스는 시작하지 않습니다.

검사는 표준 AppData, 빈 인자와 launchpad, 연결 전 프로젝트 승인, 소스 위치의 비밀 보호와 허용 목록, 반복 적용, 변조·알 수 없는 호스트 거절, 백업과 복구를 다룹니다. 원래 폴더 오류는 사용자 Windows 진단에서 재현했습니다.

후속 확인에서 사용자는 패치 후 Ned가 시작된다고 보고했습니다. 그 PC의 시작 성공이며 모든 Windows 경로나 네이티브 진단을 검증한 결과는 아닙니다. AppData·시작 화면 수정은 0.3.2 전체 설치본에도 포함했습니다.
