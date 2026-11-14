# Windows에서 Ned 오류 확인하기

Ned는 시작 실패, 모델 연결, 지식 이관과 데스크톱 도구의 오류를 나누어 기록합니다. 먼저 어느 단계에서 실패했는지 확인하면 설정을 지우거나 재설치하기 전에 원인을 좁힐 수 있습니다.

현재 설치본에는 이전 L-Vibe 0.2.5·0.2.6의 Windows asyncio 내부 TCP socketpair 수정과 오프라인 토크나이저 수정이 들어 있습니다. 과거 버전용 작은 패치를 새 설치본에 덧씌우지 마세요.

## OpenViking이 시작되지 않을 때

시작 경고에 표시되는 코드는 다음과 같습니다.

| 코드 | 확인할 단계 |
| --- | --- |
| `OV_BUNDLE` | 설치된 manifest와 파일의 읽기·무결성 검사 |
| `OV_CONFIGURATION` | 데이터 폴더, 임시 실행 설정, 로컬 중계 준비 |
| `OV_PROCESS_START` | Python 경로·권한과 프로세스 생성 |
| `OV_PROCESS_EXIT` | Python 조기 종료, 종료 코드·hex와 모듈·DLL·설정·tokenizer_cache 분류 |
| `OV_HEALTH_TIMEOUT` | 실행 후 45초 안에 로컬 health 응답을 받지 못한 상태 |

기록은 `%APPDATA%\Ned\openviking\startup-status.json`에 저장합니다. 성공하면 `ready`, 실패하면 단계와 오류 분류·숫자를 남깁니다. Python 원문 출력, API 키와 요청·응답·대화 본문은 저장하지 않습니다. 기록 파일을 쓰지 못했을 때는 경고창에 표시합니다. 시작 시점 기록이므로 이후에도 서비스가 계속 실행 중인지는 별도로 확인해야 합니다.

Ned를 닫고 반입 폴더의 **CHECK_OPENVIKING.cmd**를 실행해 보세요. 함께 제공한 `openviking-import-check.py`와 같은 폴더에 있어야 합니다. 설치된 Python·OpenViking SDK와 인코더 7종을 검사하며, 모델 설정·키를 읽지 않고 임시 HOME과 설치된 네트워크 정책을 사용합니다.

`OPENVIKING_IMPORT_OK`, `TOKENIZERS_OK 7`, `EXIT_CODE=0`이 나오면 모듈과 인코더 로딩은 정상입니다. 서비스 준비와 사내 API 인증·검색까지 확인한 결과는 아닙니다.

토크나이저는 설치 리소스의 `tokenizers/assets.json`과 고정 데이터를 사용합니다. LiteLLM이 다른 캐시로 바꾸지 않도록 지정하고, 자료가 없거나 손상되면 온라인 복구를 시도하지 않습니다. 이전 0.2.4 이하 설치본의 복구는 [토크나이저 수정 안내](openviking-tokenizer-fix.md)를 따릅니다.

문의할 때는 경고 코드와 안전한 상태 기록, 검사 마지막 오류와 `EXIT_CODE`를 사용하세요. 전체 설정·키·DB·지식을 보내거나 삭제할 필요는 없습니다. 무결성 검사나 외부 DNS 차단을 풀어서 해결하지 않습니다.

OpenViking 없이 작업을 먼저 해야 한다면 관리 중인 JSON에서 `openViking.enabled`만 `false`로 바꾸고 기존 embedding 설정을 유지한 채 가져올 수 있습니다. 이 동안 색인·검색과 기본 스킬 자동 등록은 중단됩니다. 암호화 파일은 직접 편집하지 말고 [설정 복구 안내](configuration-recovery.md)를 참고하세요.

## 개인 지식 가져오기 오류

개인 지식 가져오기는 서비스 시작이나 스킬 등록과 별도로 실행합니다. `OV_PERSONAL_UPLOAD`는 사본 전달, `OV_PERSONAL_IMPORT`는 SDK 가져오기, `OV_PERSONAL_VERIFY`는 영역 존재 확인 단계입니다. `OV_PERSONAL_INDEX`는 색인 검사 실패를 뜻합니다. HTTP 상태가 있으면 함께 확인합니다.

기록은 `openviking/personal-imports.json`, 승인한 사본은 `personal-<sha256>.ovpack`으로 보관합니다. 실패·충돌 영역을 자동으로 덮어쓰지 않습니다. [이관 안내](openviking-personal-migration.md)에 따라 확인하고 실제 OVPack이나 키는 공유하지 마세요.

## 모델 응답이나 세션 압축이 끊길 때

`%APPDATA%\Ned\model-gateway-status.json`에서 `code`, `phase`, `elapsedMs`, `requestBytes`·`responseBytes`, `upstreamStatus`·`osError`를 확인합니다. 본문과 키는 저장하지 않습니다.

`LV_MODEL_UPSTREAM_RESET`은 사내 서버가 응답 도중 연결을 끊은 경우입니다. 이 기록이 없는 `ECONNRESET`이라면 다른 계층의 연결도 확인해야 합니다. 긴 대기와 thinking 설정은 [모델 제어 안내](model-controls.md)에 설명했습니다.

## 데스크톱 도구의 연결 오류

`diagnostics/desktop-status.json`은 도구 이름·실패 분류·종료 확인 여부를 남기며 창 제목과 원본 오류는 기록하지 않습니다. **CHECK_DESKTOP.cmd**는 Windows PowerShell로 실행하므로 Python import가 실패한 상황에서도 쓸 수 있습니다.

검사는 Python 표준 라이브러리 두 개, pywin32 bootstrap, Python EXE와 감독기의 해시를 확인하고 네이티브 CLI·MCP 상태를 비교합니다. 파일 누락과 UIA·MCP 응답 실패를 구분하는 검사이며 화면을 조작하거나 모델에 질문하지 않습니다. [데스크톱 안내](agent-desktop.md)에 배포 PC에서 확인한 결과가 있습니다.

## 기존 OpenViking 내보내기의 HTTP 500

`EXPORT_PREFLIGHT HTTP_500`은 OVPack 생성 전 기존 서버의 읽기 확인 단계에서 발생한 오류입니다. 벡터 제외 옵션으로 이 단계를 바꾸지는 못합니다. [내보내기 수정 도구 2](openviking-personal-migration.md)를 새 폴더에서 사용하고, 목록 확인도 실패하면 **CHECK_EXPORT.cmd**의 JSON을 확인합니다.

진단은 버전·인증 모드, health·ready·stat·list의 상태와 고정 오류 코드를 출력합니다. 자료 이름·내용·키·원본 오류는 버리고 GET만 요청합니다. health가 정상이어도 저장소와 선택한 사용자 루트 읽기는 별도로 실패할 수 있습니다.

## 폴더 선택 뒤 편집기가 종료될 때

`0xc000041d`는 Windows 사용자 콜백의 치명적 예외입니다. 0.3.5 제보에서는 오류 모듈을 식별하지 못했으므로 GPU·입력기·데스크톱 도구 중 하나로 원인을 단정할 수 없습니다. 장시간 사용 후 종료는 시작 실패와 구분해 편집기 종료로 표시합니다.

0.3.6부터 Windows 편집기는 내부 폴더 선택창을 사용합니다. 실제 바탕화면·즐겨찾기를 탐색하려면 **Ned → 프로젝트 폴더 열기**를 사용하세요. 호스트의 Windows 환경에서 폴더를 선택하고 경로만 전용 편집기로 전달합니다. 실제 파일 시스템 디렉터리가 없는 라이브러리 제목이나 가상 항목은 프로젝트 폴더로 사용할 수 없습니다.

사용자 지정 경로로 설치한 경우 **CHECK_AGENT**, **CHECK_DESKTOP**, **CHECK_OPENVIKING**, **EXPORT_PERSONAL**은 HKCU의 `Uninstall/Ned` `InstallLocation`을 찾아 실행합니다. 과거 패치는 지정된 원본 해시·위치만 대상으로 하므로 0.3.6 이상에 적용하지 않습니다.
