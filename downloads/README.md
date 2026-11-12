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

이하 0.3.0 및 L-Vibe 파일은 이전 배포 기록이다. 최신 파일은 위의 0.3.1 표에서 받는다.

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
