> 아래 다운로드는 기존 L-Vibe 배포본이다. Ned 0.3.0 전환 소스·새 아이콘·Zed 실행기를 포함하는 파일로 오인하지 않는다. 신규 산출물은 생성·검증·게시 후 이 페이지에 별도로 기록한다. [Ned 소개](../docs/ned-introduction.md)

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
