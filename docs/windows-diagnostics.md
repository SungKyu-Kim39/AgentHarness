> Ned 0.3.1 기준: Zed 편집기와 전용 OpenCode 엔진을 사용한다. 이전 Windows 실행 증거는 승계 주장하지 않으며 [현재 검증 상태](validation-0.3.1.md)를 함께 확인한다.

# Ned Windows diagnostics

Ned는 기존 0.2.5/0.2.6에서 제공하던 Windows asyncio 내부 TCP socketpair 수정과 토크나이저 오프라인 자료/캐시 수정을 포함합니다. 이 전체 설치본에 이전 작은 패치를 추가 적용할 필요는 없습니다.

## OpenViking 시작 실패

시작 경고는 다음 단계를 구분해 경고에 코드를 표시합니다.

| 코드 | 확인할 단계 |
|---|---|
| OV_BUNDLE | 설치된 번들 manifest·파일 읽기·무결성 검사 |
| OV_CONFIGURATION | 사용자 데이터 폴더·임시 실행 설정·로컬 중계 준비 |
| OV_PROCESS_START | 번들 Python 실행 경로·권한·프로세스 생성 |
| OV_PROCESS_EXIT | Python의 조기 종료, 종료 숫자/hex 및 모듈·DLL·설정·tokenizer_cache 오류 분류 |
| OV_HEALTH_TIMEOUT | 프로세스가 시작됐지만 45초 안에 로컬 health 응답을 확인하지 못함 |

기록 파일은 `%APPDATA%\Ned\openviking\startup-status.json`입니다. 성공 시 ready, 실패 시 단계/안전한 분류·숫자를 기록합니다. 원래 Python 출력, 실제 API 키·요청/응답·대화 본문은 기록하지 않습니다. 기록 파일 저장 자체가 실패하면 경고에 표시합니다. 이 파일은 시작 시점 기록이며 계속 실행 중임을 보증하는 상태 파일은 아닙니다.

앱을 종료하고 반입 TGZ를 해제한 폴더의 **CHECK_OPENVIKING.cmd**를 실행하면 설치된 Python·실제 OpenViking SDK와 인코더 7종을 검사합니다. 함께 제공한 `openviking-import-check.py`와 같은 폴더에 두고 실행하세요. 추가 설치나 인터넷이 필요하지 않으며, 실제 모델 설정·키를 읽지 않고 임시 HOME과 설치된 네트워크 정책을 사용합니다. `OPENVIKING_IMPORT_OK`, `TOKENIZERS_OK 7`, `EXIT_CODE=0`을 확인하세요. 이 결과는 서비스 준비·사내 API 인증 성공을 대신하지 않습니다.

토크나이저 cache는 설치 리소스의 tokenizers/assets.json과 고정 파일을 사용합니다. LiteLLM이 다른 cache로 덮어쓰지 않도록 지정하며, 누락/손상 시 온라인 재시도를 하지 않습니다. 기존 0.2.4/이전 설치본은 최신 누적 패치 또는 0.2.5 전체 설치본으로 복구합니다. 외부 DNS 차단을 풀거나 공개 모델 API 키를 추가할 필요가 없습니다.

실패 시 경고 코드, startup-status.json, CHECK_OPENVIKING의 마지막 오류와 EXIT_CODE로 원인을 구분하세요. 전체 설정 JSON이나 API 키를 지원 채팅·공개 저장소에 보내지 마세요. 앱의 암호화 설정·DB·지식을 삭제하거나 무결성 검사를 끄지 않습니다.

업무를 먼저 진행해야 한다면 관리하는 JSON에서 `openViking.enabled`만 false로 바꾸고 기존 embedding 설정은 보존한 채 명시적으로 가져올 수 있습니다. 이 동안 OpenViking 색인/검색·기본 스킬 자동 등록은 꺼집니다. 저장 설정은 직접 편집하지 않으며 CONFIGURATION_RECOVERY.txt를 참고하세요.


## 개인 지식 가져오기

기존 0.2.6에서 도입한 개인 지식 가져오기는 알림 영역 메뉴에서 별도로 실행합니다. 시작 health와 기본 스킬 등록 상태와 구분합니다. OV_PERSONAL_UPLOAD는 파일 전달, OV_PERSONAL_IMPORT는 SDK 가져오기, OV_PERSONAL_VERIFY는 가져온 영역 존재 확인 단계입니다. HTTP 숫자가 있으면 함께 확인합니다. 등록 기록과 원본 사본은 사용자 데이터의 openviking/personal-imports.json 및 personal-<sha256>.ovpack에 보존합니다. 실패/충돌 영역은 자동 덮어쓰지 않습니다. PERSONAL_KNOWLEDGE_MIGRATION.txt의 절차를 따르며 실제 개인 OVPack과 API 키를 지원 채팅/공개 저장소에 보내지 않습니다.

## 모델 응답·압축 실패

모델 중계의 마지막 실패는 `%APPDATA%\Ned\model-gateway-status.json`에서 확인한다. code, phase, elapsedMs, requestBytes/responseBytes, upstreamStatus/osError만 기록하며 요청·응답 본문이나 API 키는 저장하지 않는다. LV_MODEL_UPSTREAM_RESET은 사내 서버가 응답 도중 연결을 끊은 경우다. 대기 시간과 thinking 설정 및 네이티브 수정 자동 승인은 MODEL_CONTROLS.txt를 따른다. 이 실패 기록이 없는 ECONNRESET은 다른 계층의 연결 문제일 수 있다.

## Desktop connection diagnosis (0.3.3)

`diagnostics/desktop-status.json`은 고정 도구 이름·실패 분류·종료 확인 여부만 기록한다. 원본 오류나 창 제목은 포함하지 않는다. `CHECK_DESKTOP.cmd`는 Windows PowerShell 기반이며 번들 Python이 불완전해도 실행할 수 있다. Python 표준 라이브러리 2개·pywin32 bootstrap·Python EXE·감독기 해시를 검사하고 네이티브 CLI/MCP 상태만 확인한다. 설치 파일 누락과 UIA/MCP 응답 실패를 구분하고, 확인 없이 외부망 차단·승인·무결성 검사를 풀지 않는다.

## Legacy export preflight 500

`EXPORT_PREFLIGHT HTTP_500`은 OVPack 생성 전의 기존 서버 읽기 선확인 단계다. 벡터 제외 옵션은 이 단계에 영향을 주지 않는다. 독립 `Ned-openviking-export-fix-2.tgz`를 새 폴더에서 사용한다. 목록 선확인도 실패하면 `CHECK_EXPORT.cmd`의 JSON만 확인한다. health가 healthy여도 선택 사용자 루트/저장소가 준비됐다는 뜻은 아니다. 이 도구는 버전/인증 모드, health/ready/stat/list의 HTTP 상태와 고정 오류 코드만 보고하며 로그 원문·자료·키는 출력하지 않는다. 내보내기/모델 질문은 요청하지 않는다. 기존 v0.3.3 설치 EXE/TGZ는 유지한다.
