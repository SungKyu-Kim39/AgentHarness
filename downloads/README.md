# Ned 0.3.6 수정 빌드 1

**앱 버전은 0.3.6 그대로다.** `rebuild1`은 수정 배포 파일을 구분하는 표시다.

- [폐쇄망 반입 TGZ · EXE/설정/안내/소스](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.6-rebuild1-windows-x64.tgz) (1,175,951,945 bytes)
- [수정 설치 EXE 단독](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.6-rebuild1-win-x64.exe) (1,176,899,012 bytes)
- [TGZ SHA-256](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.6-rebuild1-windows-x64.tgz.sha256) · [EXE SHA-256](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.6-rebuild1-win-x64.exe.sha256)
- [릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.6-rebuild1) · [검증 기록](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.6-rebuild1-validation.json)

설치할 `Ned` 폴더와 상위 폴더가 없어도 설치기가 자동으로 만든다. 알림 영역 메뉴 이름은 **프로젝트 폴더 열기**로 간소화했다. 드라이브·바탕화면·즐겨찾기 등의 프로젝트 폴더를 선택할 수 있다.

Ned·개인 Zed를 완전히 종료한 뒤 이 수정 EXE를 실행한다. 기존 0.3.6 위에 설치할 수 있으며 삭제·재설치가 필요하지 않다. 설정·대화·지식·편집기 환경은 사용자 데이터 폴더에 유지한다. 설치 위치를 다른 드라이브로 옮기는 경우에는 기존 제거 후 새 위치에 설치한다.

현재 소스에서 호스트를 다시 컴파일하고 원본과 메뉴 이름 한 곳만 달라졌는지 확인했다. 검증된 원본 런타임을 재사용하며 새 설치기를 생성했다. EXE를 다시 해제하여 전체 앱 파일 해시·구성 요소 manifest·ASCII 경로·호스트 초기화를 검사하고, TGZ의 EXE와 대응 소스도 대조했다. 관련 검사9개와 타입 검사를 통과했으며 Windows/Wine 실행 검사1개는 제외했다. 실제 Windows 설치·폴더 생성·화면 동작은 배포 PC에서 추가 확인한다.

원본 0.3.6 파일과 태그는 보존한다. 수정 빌드의 대응 소스·태그·해시는 별도로 제공한다. 제품 버전과 모델 대기 정책은 변경하지 않았다.

빌드 소스: `5dab50279b91fdb0bb135793df699b57410c6e3d` · 검증 코드: `319192941efc7ffc1aee783b204ccd86904b58c6`

---

# Ned 0.3.6 Windows x64

[릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.6) · [검증 기록](Ned-0.3.6-validation.json)

- [폐쇄망 반입 TGZ · EXE/설정/안내/소스](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.6-windows-x64.tgz) (1,173,759,060 bytes)
- [설치 EXE 단독](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.6-win-x64.exe) (1,176,898,071 bytes)
- [TGZ SHA-256](Ned-0.3.6-windows-x64.tgz.sha256) · [EXE SHA-256](Ned-0.3.6-win-x64.exe.sha256)

설치 위치 화면에서 `D:\Programs\Ned` 같은 쓰기 가능한 전용 폴더를 선택할 수 있다. 업데이트는 기존 설치 위치를 기본으로 사용한다. 설치 드라이브를 옮길 때는 기존 Ned를 제거한 뒤 새 위치에 설치한다. 설정·대화·지식·편집기 환경은 `%APPDATA%\Ned`에 유지하며 설치 드라이브 변경으로 자동 이동하지 않는다. 관련 없는 파일이 있는 폴더와 드라이브 루트는 거절한다.

Windows 폴더 선택 문제 대응: **알림 영역 Ned → 프로젝트 폴더 열기 · 바탕화면 / 즐겨찾기**를 사용한다. 실제 Windows 사용자 폴더에서 고른 경로를 전용 편집기로 전달한다. 편집기 내부 Open Folder는 내부 경로 선택창으로 전환한다. 보고된 네이티브 콜백 예외 경로를 피하는 변경이며 정확한 종료 원인은 아직 확정되지 않았다.

`ned_host_desktop_snapshot`의 실제 compact 응답 형식을 처리하고 캡처 전후 창 신원을 확인한다. 이전 스냅샷 전용 패치를 추가 적용하지 않는다. 권한 선택·설정 자동 재시작·기존 환경 보존을 유지한다. 모델 응답 대기의 기본 제한은 추가하지 않았다.

검사45개 통과, 선택적 Windows/Wine 실행1개 제외. 고정 NSIS 컴파일·타입·빌드·스킬36개·실제 Linux OpenCode/ACP 연동과 설치 EXE/TGZ 해시·ASCII·소스 대응 검사를 수행했다. 실제 Windows 설치·폴더 선택·데스크톱 조작·사내망 전체 수용은 별도 확인 대상이다.

[설치 안내](../docs/offline-setup.md) · [검증 범위](../docs/validation-0.3.6.md) · [라이선스](../docs/license-policy.md)

---

# Ned 0.3.5 Windows x64

[릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.5) · [검증 기록](Ned-0.3.5-validation.json) · [공개 다운로드 전체 검사](Ned-0.3.5-public-verification.json)

- [폐쇄망 반입 TGZ · EXE/설정/안내/소스](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.5-windows-x64.tgz) (1,173,739,258 bytes)
- [설치 EXE 단독](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.5-win-x64.exe) (1,176,894,920 bytes)
- [TGZ SHA-256](Ned-0.3.5-windows-x64.tgz.sha256) · [EXE SHA-256](Ned-0.3.5-win-x64.exe.sha256)

대화 입력창의 권한 선택 항목 또는 **알림 영역 Ned 우클릭 → 권한 → 전체 권한**을 선택한다. 지원하는 파일 수정·빌드·지식 전달·데스크톱 관찰/조작·앱 실행의 반복 승인창을 생략한다. **프로젝트 파일 자동 승인**, **승인 요청**도 선택할 수 있다. 선택 즉시 적용되며 새 대화·프로젝트·재시작·업데이트 후에도 유지한다. 별도의 확인창이나 모델 JSON 편집은 필요 없다. 원래 모델·추론 선택 메뉴는 유지한다.

Ned·개인 Zed를 종료하고 EXE로 업데이트한다. 기존 모델 설정·대화·지식·편집기 환경을 보존한다. 권한 모드의 첫 기본값은 승인 요청이며 전체 권한은 사용자가 직접 선택한다. 파일 도구의 범위·충돌·저장하지 않은 버퍼·중지 확인은 계속 적용한다. 이전 기본값이나 오래된 UI가 해제한 전체 권한을 다시 적용하지 못하도록 정책 버전을 검사한다. 상세 범위는 [권한 안내](../docs/approval-modes.md)를 따른다.

빌드·타입·기본 스킬36개 검증, 집중 검사39개(실패0/선택적 Wine 실행1개 제외), 실제 Linux OpenCode/ACP의 메뉴 설정·자동 수정·모델 선택 유지·해제 동기화·이전 선택 거절 검사를 통과했다. 실제 설치 EXE의 앱 번들 초기화/구성 요소 해시/ASCII 경로와 TGZ 내부 EXE/소스를 대조했다. Windows 실제 메뉴 렌더링과 사내망 전체 수용은 별도 배포 확인 대상이다. 0.3.4의 시작 오류/내보내기 수정도 포함하며 이전 패치를 추가 적용하지 않는다.

[설치 안내](../docs/offline-setup.md) · [검증 범위](../docs/validation-0.3.5.md) · [라이선스](../docs/license-policy.md)

---

# Ned 0.3.4 Windows x64

[GitHub 릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.4) · [검사 기록](Ned-0.3.4-validation.json) · [공개 다운로드 전체 검증](Ned-0.3.4-public-verification.json)

- [폐쇄망 반입 TGZ · EXE/설정 JSON/안내/진단/소스](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.4-windows-x64.tgz) (1,173,699,552 bytes)
- [설치 EXE 단독](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.4-win-x64.exe) (1,176,868,983 bytes)
- [TGZ SHA-256](Ned-0.3.4-windows-x64.tgz.sha256) · [EXE SHA-256](Ned-0.3.4-win-x64.exe.sha256) · [설치기 감사](Ned-0.3.4-installer-audit.json) · [TGZ 대조](Ned-0.3.4-bundle-verification.json)

0.3.3에서 발생한 `Cannot find module './impl/format'` 시작 오류를 수정한 전체 설치본이다. JSONC ESM 하위 모듈을 번들에 포함하며 **0.3.3용 시작 패치는 추가 적용하지 않는다.** OpenViking 내보내기 도구 수정과 `CHECK_EXPORT.cmd`도 반입 TGZ에 포함한다. 기존 파일 수정 자동 승인·편집기 설정 보존·Ned 아이콘 기능을 유지한다.

Ned와 개인 Zed를 종료하고 새 폴더에 압축 해제한 EXE로 업데이트한다. 기존 설정·대화·지식·편집기 환경을 유지한다. 최초 설치는 EXE 옆 `agent-config.json`을 준비하고, 기존 저장 설정의 변경은 Ned 설정 가져오기 메뉴를 사용한다.

새 버전 집중 검사는 20개 통과(실패 0, 선택적 Wine 설치 실행 1개 제외)했고 타입/빌드/스킬36개 검사가 통과했다. 실제 EXE에서 추출한 앱 번들의 모듈 초기화와 구성 요소 해시, ASCII 경로 및 TGZ 내부 EXE·대응 소스를 대조했다. 실제 Windows/사내망 전체 수용 결과와 구분한다. 원본 0.3.3 배포 파일과 패치는 아래에 그대로 보존한다.

[설치 안내](../docs/offline-setup.md) · [검증 범위](../docs/validation-0.3.4.md) · [라이선스](../docs/license-policy.md)

---

# Ned 0.3.3 Windows x64

## 0.3.3 실행 오류 수정 패치

`Cannot find module './impl/format'`은 0.3.3 JSONC 라이브러리 번들 오류다. [실행 수정 패치 1 · 약 4.2MB](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-jsonc-startup-fix-1.tgz)를 새 폴더에 압축 해제한다. Ned·개인 Zed를 종료하고 `APPLY_FIX.cmd`를 실행하여 `applied` 또는 `already-applied`, `EXIT_CODE=0`을 확인한 뒤 기존 바로가기로 실행한다. 설정·대화·지식·편집기 환경을 유지하며 원래 앱 번들을 백업한다. 복구는 `ROLLBACK_FIX.cmd`이다. 원본 0.3.3 EXE/TGZ는 변경하지 않았으므로 해당 설치본에는 이 패치가 필요하다. [적용 안내](../docs/ned-jsonc-startup-fix-1.txt) · [SHA-256](Ned-jsonc-startup-fix-1.tgz.sha256) · [검증](Ned-jsonc-startup-fix-1-validation.json).

## OpenViking 자료 내보내기 수정 도구 2

`EXPORT_PREFLIGHT HTTP_500`이면 [독립 수정 도구 2 · 약 8KB](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-openviking-export-fix-2.tgz)를 **새 폴더**에 압축 해제하고 `EXPORT_PERSONAL.cmd`를 실행한다. 재설치 없이 기존 서버를 켜 둔 채 사용한다. 같은 인증/범위의 최소 목록 조회로 선확인하며 원본 DB·인증은 바꾸지 않는다. 오류가 계속되면 `CHECK_EXPORT.cmd`의 안전한 JSON만 확인한다. preflight 오류에 벡터 옵션은 영향을 주지 않는다. [SHA-256](Ned-openviking-export-fix-2.tgz.sha256) · [검증](Ned-openviking-export-fix-2-validation.json) · [이관 안내](../docs/openviking-personal-migration.md). 기존 v0.3.3 EXE/TGZ는 그대로 보존한다.

[GitHub 릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.3) · [검사 기록](Ned-0.3.3-validation.json) · [공개 다운로드 확인](Ned-0.3.3-public-verification.json)

- [폐쇄망 반입 TGZ · EXE/JSON/안내/진단/소스](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.3-windows-x64.tgz) (1,173,675,928 bytes)
- [설치 EXE 단독](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.3-win-x64.exe) (1,176,861,330 bytes)
- [TGZ SHA-256](Ned-0.3.3-windows-x64.tgz.sha256) · [EXE SHA-256](Ned-0.3.3-win-x64.exe.sha256) · [실제 설치기 감사](Ned-0.3.3-installer-audit.json) · [TGZ 대조](Ned-0.3.3-bundle-verification.json)

최초 설치 EXE 옆 `agent-config.json` 자동 준비, **현재 대화·프로젝트의 파일 수정 자동 승인**, 데스크톱 연결 복구와 승인한 GUI 앱 실행을 추가했다. 편집기·대화창 글꼴/크기/배치·키맵·작업공간 상태를 업데이트 후에도 보존하고 Windows 편집기 창 아이콘에도 Ned 이미지를 적용한다.

Ned와 개인 Zed를 완전히 종료하고 새 폴더에 압축 해제한 EXE로 업데이트한 다음 위의 0.3.3 실행 수정 패치를 적용한다. 기존 모델 설정·대화·지식은 보존한다. 저장 설정이 있는 PC는 EXE 옆 JSON으로 덮어쓰지 않는다. 0.3.1용 이전 수정 패치는 적용하지 않는다. 파일 수정 승인창의 **현재 대화·프로젝트 자동 승인**으로 켜고 알림 영역에서 해제한다. 앱 실행·화면 조작·빌드는 각각 별도 승인이다.

전체 회귀 119개와 마지막 변경 집중 36개·설정 정책 4개 검사가 통과했다. 실제 설치 EXE의 파일/구성 요소 해시와 Ned 아이콘을 검사했고, TGZ 내부 EXE가 같은 해시임을 대조했다. 사용자 Windows 진단에서는 네이티브/감독 MCP와 창 18개 조회가 성공했으며, 새 Ned에서의 실제 계산기 조작·작업표시줄 표시는 아직 별도 확인 대상이다. 아이콘 리소스를 바꾼 관리형 Zed 이미지의 실행 코드·버전 정보는 보존했으며 수정본은 unsigned다. 원본 소스/고지/변경 스크립트와 해시를 포함한다.

[설치 안내](../docs/offline-setup.md) · [승인 모드](../docs/approval-modes.md) · [데스크톱 도구](../docs/agent-desktop.md) · [검증 범위](../docs/validation-0.3.3.md) · [라이선스](../docs/license-policy.md). 1.0 수용 완료를 선언한 릴리스는 아니다.

---

# Ned 0.3.2 Windows x64

[GitHub 릴리스](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.2) · [공개 다운로드 확인](Ned-0.3.2-public-verification.json)

- [폐쇄망 반입 TGZ · 약 1.17GB](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.2-windows-x64.tgz)
- [설치 EXE 단독](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.2-win-x64.exe)
- [TGZ SHA-256](Ned-0.3.2-windows-x64.tgz.sha256) · [EXE SHA-256](Ned-0.3.2-win-x64.exe.sha256) · [설치기 추출 감사](Ned-0.3.2-installer-audit.json) · [묶음 검증](Ned-0.3.2-bundle-verification.json) · [검사 기록](Ned-0.3.2-validation.json)

설정 가져오기 후 자동 재시작, Windows ACP 콘솔 감독 프로세스, 빈 시작 화면, `ned_host_*` 도구·MCP 이름, 기본 한국어 AGENTS 지침을 포함한다. Ned/Zed를 완전히 종료한 뒤 새 폴더에 반입 TGZ를 해제하고 EXE로 설치한다. 기존 설정·이력·지식은 유지한다. 새 0.3.2 설치에는 아래의 이전 패치를 별도로 적용하지 않는다.

첫 실행 시 `%APPDATA%\Ned\editor\config\AGENTS.md`에 한국어 기본 지침을 추가하며, 기존 내용과 같은 지침은 보존한다. [설치 안내](../docs/offline-setup.md) · [소개](../docs/ned-introduction.md) · [검증 범위](../docs/validation-0.3.2.md). 전체 검사 110개와 마지막 한국어 집중 검사가 통과했으며 실제 추출본의 ASCII 경로·구성 요소 해시를 확인했다. 전체 Win10/Win11·사내망 수용 완료를 선언한 1.0 릴리스는 아니다.

---

# Ned latest repair patch

[Ned 설정 자동 적용·Windows ACP 수정 패치 1 (약 4.2MB)](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-config-restart-fix-1.tgz)은 원본 0.3.1 또는 시작 수정 패치 1 적용본에 사용한다. Ned/Zed 완전 종료 → 새 폴더에 압축 해제 → `APPLY_FIX.cmd` → `applied`/`already-applied`, `EXIT_CODE=0` 확인 → Ned 실행 순서다. 시작 수정도 포함하며 기존 설정·키·지식은 유지한다. [안내](../docs/ned-config-restart-fix-1.md) · [해시](Ned-config-restart-fix-1.tgz.sha256) · [검증](Ned-config-restart-fix-1-validation.json). 사용자가 Windows ACP 모델 목록·대화와 JSON 가져오기 후 자동 재시작·적용 성공을 확인하였다. 도구 이름 Ned 통일은 후속 전체 0.3.2 설치본에 포함한다.

## Ned 0.3.1 시작 수정 패치 1

기본 0.3.1에서 Windows AppData 경로 오류가 확인됐다. [시작 수정 패치 1 · 약 4.2MB](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-startup-fix-1.tgz)을 새 폴더에 해제하고, Ned/Zed 종료 후 `APPLY_FIX.cmd`를 실행한다. `applied`/`already-applied`, EXIT_CODE=0을 확인하고 Ned를 실행한다. [상세 안내](../docs/ned-startup-fix-1.md) · [해시](Ned-startup-fix-1.tgz.sha256) · [검증 기록](Ned-startup-fix-1-validation.json)

이 패치는 표준 private AppData 구성, 시작 화면/최근 프로젝트 진입, 안전한 panic 위치 진단을 제공한다. 원본을 백업하며 `ROLLBACK_FIX.cmd`로 복구할 수 있다. 모델 설정·대화·지식은 바꾸지 않는다. 실제 GUI 성공은 설치 PC에서 확인 중이다. 아래의 기존 전체 설치 파일은 이 별도 패치를 포함하지 않는다.

---

# Ned 0.3.1 다운로드

Windows x64 검증 후보이다. 시작 안내창, agent-desktop 승인 도구 18종, 기본 스킬 36개와 OpenViking 등록·이관 개선을 포함한다. 실제 Windows·사내 서버·폐쇄망 수용은 별도 확인 대상이며 1.0 완료를 뜻하지 않는다.

[릴리스 안내](https://github.com/SungKyu-Kim39/AgentHarness/releases/tag/v0.3.1)

| 파일 | 직접 다운로드 | bytes |
|---|---|---:|
| 반입 TGZ · EXE/JSON/안내/진단/소스 포함 | [Ned-0.3.1-windows-x64.tgz](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.1-windows-x64.tgz) | 1,173,624,892 |
| 설치 EXE 단독 | [Ned-0.3.1-win-x64.exe](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.1-win-x64.exe) | 1,176,902,415 |
| SHA-256 | [TGZ](Ned-0.3.1-windows-x64.tgz.sha256) · [EXE](Ned-0.3.1-win-x64.exe.sha256) | |

기존 L-Vibe와 Zed를 완전히 종료하고 TGZ의 EXE로 설치한 뒤 **Ned 바로가기**를 실행한다. 기존 설정·기록·지식은 원본을 보존하여 이관한다. 첫 실행은 Ned 아이콘과 단계별 문구를 표시한다. 모델·임베딩 대기는 기본 시간 제한을 두지 않는다.

[검증 보고서](../docs/validation-0.3.1.md) · [실제 설치 EXE 추출 감사](Ned-0.3.1-installer-audit.json) · [반입 manifest](Ned-0.3.1-manifest.json) · [검사 결과](Ned-0.3.1-validation.json) · [공개 다운로드 확인](Ned-0.3.1-public-verification.json) · [설치 안내](../docs/offline-setup.md) · [agent-desktop 범위](../docs/agent-desktop.md)

94,237개 설치 파일의 ASCII 경로와 고정 구성 요소를 실제 EXE에서 대조했다. TGZ 안의 EXE 해시도 일치한다. 빌드 소스는 `38f174d12ef91679138a46e29be562b326e6f8d0`이다. 릴리스의 직접 다운로드 링크는 이 저장소의 LFS 파일을 가리킨다. 현재 연결의 releases 첨부 업로드는 401로 거절되어 별도 첨부 파일은 제공하지 못했다.

---

## OpenViking 내보내기 도구 수정

[Ned-openviking-export-fix-1.tgz](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-openviking-export-fix-1.tgz) · [SHA-256](Ned-openviking-export-fix-1.tgz.sha256)

기존 Ned/L-Vibe에서도 실행할 수 있는 작은 도구 묶음이다. 새 폴더에 압축 해제하고 `EXPORT_PERSONAL.cmd`를 실행한다. **기존 로컬 OpenViking 서버의 키**로 인증한다. `EXPORT_PACK HTTP_500`이 벡터 내보내기에서 발생하면 `EXPORT_PERSONAL_NO_VECTORS.cmd`를 명시적으로 선택할 수 있다. 원본 자료를 변경하거나 자동 재시도하지 않는다. 자세한 내용은 [이관 안내](../docs/openviking-personal-migration.md)를 따른다.

이하 0.3.0 및 L-Vibe 파일은 이전 배포 기록이다. 최신 파일은 이 문서 맨 위의 표에서 받는다.

---

# Ned 다운로드

**Ned 0.3.0 · Zed 기반 전환 검증 후보**이다. Windows 실제 설치·화면·사내 서버·MSBuild·외부망 차단 수용은 미완료이며 1.0 완료를 의미하지 않는다.

| 파일 | 다운로드 | 크기 |
|---|---|---:|
| 폐쇄망 반입 TGZ (설치 EXE·JSON·안내·소스 포함) | [Ned-0.3.0-windows-x64.tgz](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.0-windows-x64.tgz) | 1,128,796,546 bytes |
| 설치 EXE 단독 | [Ned-0.3.0-win-x64.exe](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-0.3.0-win-x64.exe) | 1,132,157,259 bytes |
| TGZ SHA-256 | [검증 파일](Ned-0.3.0-windows-x64.tgz.sha256) | |

TGZ를 압축 해제하고 EXE 설치 → 중앙 JSON 편집 → Ned 실행 → 프로젝트 선택 → Ctrl+Shift+A로 Ned 대화를 연다. 기존 L-Vibe·Zed는 먼저 종료한다. 모델·기록·지식은 원본을 보존하여 이관한다.

[소개](../docs/ned-introduction.md) · [설치·설정](../docs/offline-setup.md) · [검증 상태](../docs/validation-0.3.0.md) · [라이선스](../docs/license-policy.md) · [파일 manifest](Ned-0.3.0-manifest.json) · [실제 EXE 추출 감사](Ned-0.3.0-installer-audit.json) · [공개 다운로드 검증](Ned-0.3.0-public-verification.json)

설치기 SHA-256: `78c6d5e9190ea2175e8e6542ca235b5afa6ecc6dffdec224e0bc4a336fb8b10b`

TGZ SHA-256: `674ea4dc96640282ea21f5dee6586a6ff9167aadb15878c07fa2bfdc9330f711`

빌드 소스: `fd4ad45ec00a8831fc951dab5c27365cc1eb7015`

설치기에서 94,216개 파일의 ASCII 경로와 고정 런타임·34개 스킬을 검사하였다. TGZ 안의 EXE 해시와 소스 묶음도 대조하였다. 실제 Windows 실행 검증과 구분한다.

---

## 이전 L-Vibe 배포 기록

> 아래는 이전 L-Vibe 배포 기록이다. Ned 0.3.0 파일은 위 표에서 받는다. [Ned 소개](../docs/ned-introduction.md)

# L-Vibe 다운로드

**0.2.7 Windows x64 검증 후보**다. 긴 사내 LLM 대기열을 고려하여 호스트·OpenCode 엔진의 모델 응답 대기 제한을 기본 해제했다. OpenViking 모델 중계·SDK/HTTPX·모델 처리 API에도 고정 응답 대기 제한을 두지 않는다. 실제 연결 오류와 사용자 중지는 별도로 처리한다.

[0.2.7 설치 EXE](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.7-win-x64.exe)

[0.2.7 폐쇄망 반입 TGZ — EXE·설정·안내·진단·소스·라이선스 포함](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.7-windows-x64.tgz)

| 파일 | bytes | SHA-256 |
|---|---:|---|
| EXE | 1,056,737,928 | [해시 파일](L-Vibe-0.2.7-win-x64.exe.sha256) |
| TGZ | 1,122,449,144 | [해시 파일](L-Vibe-0.2.7-windows-x64.tgz.sha256) |

앱을 완전히 종료하고 업데이트한다. 기존 모델·임베딩 설정과 사용자 데이터는 보존한다. 새 JSON을 가져올 때는 알림 영역의 **모델 설정 JSON 가져와 교체 후 재시작**을 사용한다. 기존 settings.enc.json은 직접 편집하지 않는다.

## 이번 변경과 사용

- 기본 모델 대기는 무제한이다. 기존 JSON에 유한한 timeout/headerTimeout/chunkTimeout을 직접 지정했다면 false로 바꾼다. 실제 사내 서버/중계기의 연결 종료는 오류 코드로 구분한다.
- 모델 options와 객체형 variants도 현재 엔진의 settings/body/배열 형식으로 변환한다. off/low/medium/xhigh 값의 실제 요청 전달을 검사했으며, 각 강도의 실제 Qwen 지원은 서버 설정에 달려 있다.
- OpenCode 자동 승인과 별도인 네이티브 파일 수정 승인 창에 **이번 요청의 프로젝트 파일 수정 자동 승인**을 추가했다. 실제 사용자 메시지 ID로 대기열 요청을 구분한다. 새 요청·중지·재시작 시 해제하며 범위/충돌/스냅샷 검사는 유지한다.

자세한 설정은 [모델·대기열·승인 안내](../docs/model-controls.md), 실패 분류는 [Windows 진단](../docs/windows-diagnostics.md)을 따른다. 모델 중계의 마지막 실패 기록은 %APPDATA%\L-Vibe\model-gateway-status.json이다. URL·키·요청/응답 본문은 기록하지 않는다.

## 반입과 검증

TGZ를 해제하고 EXE로 일반 사용자 설치한다. 첫 설치는 설정 JSON 편집 후 실행하며, 기존 설정이 있으면 보존한다. 직원 PC에서 추가 패키지 설치나 인터넷 다운로드를 실행하지 않는다. 모델 가중치는 포함하지 않으며 설정한 사내 API가 필요하다.

MCP 6종·고정 브라우저·기본 스킬 34개와 기존 개인 지식 가져오기 기능을 유지한다. 기존 OpenViking 0.5.0 지식은 [이관 안내](../docs/openviking-personal-migration.md)와 [작은 내보내기 도구 ZIP](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-personal-export-1.zip)을 이용한다. 원본과 승인한 사본을 보존하며 새 대화 자동 업로드는 하지 않는다.

전체 회귀 73개 통과 후 대기열 변경 집중 검사 13개와 OpenViking 회귀 6개가 실패·건너뜀 없이 통과했다. 실제 고정 엔진의 185초 무응답 대기 뒤 정상 응답과 사용자 중지의 연결 종료, 실제 SDK/HTTPX의 connect/read/write/pool 제한 해제를 확인했다. 공식 Desktop 2개 프로젝트·2,549개 파일 타입 오류 0, main/preload/renderer 빌드 성공이다.

실제 EXE 추출 94,210개 파일 및 ASAR 11,584개 경로가 모두 ASCII이며 런타임 전수 해시를 확인했다. 실제 ASAR에서 무제한 응답 대기 기본값과 수정 코드를 확인했다. TGZ 38개 항목/35개 파일·34개 체크섬, 소스 548개 항목도 검사했다. 소스 체크포인트는 `924833e321173fe20a237ab0123702a135d6fae4`다.

[0.2.7 검증 보고서](../docs/validation-0.2.7.md) · [EXE 검사 기록](L-Vibe-0.2.7-runtime-audit.json) · [TGZ 검사 기록](L-Vibe-0.2.7-bundle-audit.json) · [설치 안내](../docs/offline-setup.md) · [설정 복구](../docs/configuration-recovery.md)

파일은 **work/downloads의 Git LFS**로 제공한다. GitHub Releases와 구분한다. 위 링크로 받을 때 Git LFS 설치는 필요하지 않다. 소스 clone의 작은 pointer 파일을 설치본으로 사용하지 않는다. 이전 0.2.6과 검사 기록도 보존한다.

자체 코드의 MIT와 전체 번들의 복수 라이선스를 구분한다. [라이선스 정책](../docs/license-policy.md)을 확인한다. 실제 Windows 10/11과 사내 모델의 전체 수용은 미완료이며 releaseReady: false를 유지한다.

공개 게시 커밋 `b953301`의 파일을 검사했다. TGZ는 공개 주소에서 전체 GET하여 HTTP 200·1,122,449,144 bytes·SHA-256 일치를 확인했다. EXE는 HEAD HTTP 200·크기와 range HTTP 206·첫 65,536 bytes의 PE 헤더를 확인했다. EXE 원격 전체 재다운로드는 하지 않았으며 전체 해시는 검증한 로컬 EXE와 업로드한 Git LFS object ID에 대응한다. [공개 다운로드 검사 기록](L-Vibe-0.2.7-public-audit.json).
