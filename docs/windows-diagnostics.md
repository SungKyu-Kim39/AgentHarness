# L-Vibe Windows diagnostics

0.2.5는 Windows asyncio 내부 TCP socketpair 수정과 토크나이저 오프라인 자료/캐시 수정을 포함합니다. 이 전체 설치본에 이전 작은 패치를 추가 적용할 필요는 없습니다.

## OpenViking 시작 실패

0.2.4는 다음 단계를 구분해 경고에 코드를 표시합니다.

| 코드 | 확인할 단계 |
|---|---|
| OV_BUNDLE | 설치된 번들 manifest·파일 읽기·무결성 검사 |
| OV_CONFIGURATION | 사용자 데이터 폴더·임시 실행 설정·로컬 중계 준비 |
| OV_PROCESS_START | 번들 Python 실행 경로·권한·프로세스 생성 |
| OV_PROCESS_EXIT | Python의 조기 종료, 종료 숫자/hex 및 모듈·DLL·설정·tokenizer_cache 오류 분류 |
| OV_HEALTH_TIMEOUT | 프로세스가 시작됐지만 45초 안에 로컬 health 응답을 확인하지 못함 |

기록 파일은 `%APPDATA%\L-Vibe\openviking\startup-status.json`입니다. 성공 시 ready, 실패 시 단계/안전한 분류·숫자를 기록합니다. 원래 Python 출력, 실제 API 키·요청/응답·대화 본문은 기록하지 않습니다. 기록 파일 저장 자체가 실패하면 경고에 표시합니다. 이 파일은 시작 시점 기록이며 계속 실행 중임을 보증하는 상태 파일은 아닙니다.

앱을 종료하고 반입 TGZ를 해제한 폴더의 **CHECK_OPENVIKING.cmd**를 실행하면 설치된 Python·실제 OpenViking SDK와 인코더 7종을 검사합니다. 함께 제공한 `openviking-import-check.py`와 같은 폴더에 두고 실행하세요. 추가 설치나 인터넷이 필요하지 않으며, 실제 모델 설정·키를 읽지 않고 임시 HOME과 설치된 네트워크 정책을 사용합니다. `OPENVIKING_IMPORT_OK`, `TOKENIZERS_OK 7`, `EXIT_CODE=0`을 확인하세요. 이 결과는 서비스 준비·사내 API 인증 성공을 대신하지 않습니다.

토크나이저 cache는 설치 리소스의 tokenizers/assets.json과 고정 파일을 사용합니다. LiteLLM이 다른 cache로 덮어쓰지 않도록 지정하며, 누락/손상 시 온라인 재시도를 하지 않습니다. 기존 0.2.4/이전 설치본은 최신 누적 패치 또는 0.2.5 전체 설치본으로 복구합니다. 외부 DNS 차단을 풀거나 공개 모델 API 키를 추가할 필요가 없습니다.

실패 시 경고 코드, startup-status.json, CHECK_OPENVIKING의 마지막 오류와 EXIT_CODE로 원인을 구분하세요. 전체 설정 JSON이나 API 키를 지원 채팅·공개 저장소에 보내지 마세요. 앱의 암호화 설정·DB·지식을 삭제하거나 무결성 검사를 끄지 않습니다.

업무를 먼저 진행해야 한다면 관리하는 JSON에서 `openViking.enabled`만 false로 바꾸고 기존 embedding 설정은 보존한 채 명시적으로 가져올 수 있습니다. 이 동안 OpenViking 색인/검색·기본 스킬 자동 등록은 꺼집니다. 저장 설정은 직접 편집하지 않으며 CONFIGURATION_RECOVERY.txt를 참고하세요.
