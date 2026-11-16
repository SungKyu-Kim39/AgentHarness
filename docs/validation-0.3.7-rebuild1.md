# Ned 0.3.7 수정 빌드 1 검증 기록

이 빌드는 앱 버전 0.3.7을 유지하면서 OpenViking 0.5.5, Ned 저장소 이름 이관, 파일 삭제 도구를 반영합니다. 원본 0.3.7 설치 파일·TGZ·태그는 덮어쓰지 않습니다. 수정 배포 파일에는 `rebuild1`을 붙입니다.

## 변경 내용

- 새 OpenViking 계정·프로젝트 지식 URI·기본 스킬 패키지·소유 메타데이터에는 `ned`를 사용합니다. 기존 계정은 원본 백업, SDK 내보내기·복원, 별도 agent 영역 보존, 재색인·일관성 검사를 거쳐 전환합니다. 이관과 실패 복구는 [업데이트 안내](openviking-0.5.5-update.md)에 설명합니다.
- 고정 Windows x64 OpenViking을 0.5.4에서 0.5.5로, 해당 의존 조건에 맞춰 LiteLLM을 1.103.10으로 변경합니다. 기존 344개 Python 패키지의 의존 조건과 전체 파일 해시를 대조합니다. 직원 PC에서 다운로드나 pip 설치를 요구하지 않습니다.
- `ned_host_delete_file`을 추가합니다. 기존 프로젝트의 2 MiB 이하 UTF-8 텍스트 파일 하나를 삭제하며, 수정과 같은 권한 모드·미저장 버퍼 검사·충돌 검사·원본 스냅샷을 사용합니다. [사용·복구 설명](ned-user-guide.md#file-deletion)을 제공합니다.
- 상세 사용자 설명서를 TGZ의 `USER_GUIDE.md`로 포함합니다. 과거 자료를 식별하는 호환 코드·배포 기록·개인 자료와 백업은 무차별 치환하지 않습니다.

## 확인한 실행과 근거

실제 OpenViking 0.5.4 SDK로 만든 합성 프로젝트·개인 자료·기본 스킬 두 개를 0.5.5로 옮기는 Linux 통합 검사를 통과했습니다. 프로젝트별 읽기 경계, 개인 지식 검색·읽기, 새 이름의 스킬 등록, 원본 백업의 바이트, 재시작 시 불필요한 재색인 생략을 확인했습니다. LLM·임베딩 응답은 localhost 합성 서버만 사용했습니다.

별도로 실제 0.5.0 SDK의 개인 OVPack을 0.5.5로 가져오는 검사를 실행했습니다. 벡터 포함과 파일 전용 내보내기를 모두 검사하고, 기존 서버의 stat HTTP 500을 주입한 경우에도 같은 사용자 범위의 목록 조회·내보내기·가져오기·읽기가 이어지는지 확인했습니다. 실제 직원의 개인 자료를 이 검증에 사용하지 않았습니다.

삭제 도구의 대상 검사, 승인 거절·취소, 미저장 버퍼, 승인 중 외부 변경, 자동 승인 모드, 빈 파일의 실제 삭제, BOM·CRLF 원본 보관, 큰 파일의 제한된 승인 미리보기를 검사했습니다. 스냅샷 저장이 실패하면 삭제하지 않습니다. 이관 상태 복구와 충돌·링크 경로 거절도 대상 테스트에서 검사합니다.

TypeScript 검사와 기본 스킬 66개의 원본·해시 검사를 통과했습니다. 작업공간의 고정 설치 도구 캐시를 지정한 전체 회귀 검사(`ELECTRON_BUILDER_CACHE="$PWD/.cache/ned/builder-cache" npm test`)는 166건 중 157건 통과, 실패 0건, 9건 건너뜀으로 끝났습니다. 실행 시간은 587.6초입니다. 건너뛴 항목은 별도 REA·원형 Desktop·이전 엔진·agent-desktop·Wine·편집기 바이너리 fixture가 필요한 검사입니다. 현재 엔진·실제 SDK 이관·자료 읽기·삭제·권한·NSIS 컴파일 검사는 실행했습니다.

최종 설치 파일 검사 결과, 소스 커밋·파일 해시·Windows 실행 기록은 해당 배포의 `INSTALLER_AUDIT.json`, `PAYLOAD_MANIFEST.json`, 저장소 `downloads/Ned-0.3.7-rebuild1-*` 검증 기록에 남깁니다. 이 문서가 포함된 TGZ를 만든 뒤 완료한 외부 검증은 저장소의 후속 기록으로 제공합니다.

## 런타임과 배포물

OpenViking wheel SHA-256은 `42b55e84fd5a67d33813a6e3cfed483353751d576fee3ec9f449cca1a412334c`, 대응 소스는 `038fa5cdd1c175ce7e8e08791fad999fda08f65a5ac7326ab1aa3b1a471d1d7d`입니다. 고정 출처와 LiteLLM wheel은 `openviking-upgrade-lock.json`에 있습니다.

기준 런타임은 기존 0.3.6 수정 빌드 1의 고정 설치 파일에서 해시로 확인한 뒤 재사용합니다. 새 OpenViking·LiteLLM을 적용하고, 원문 바이트가 같은 Python SDK ZIP 최적화를 유지합니다. 최종 원시·최적화 manifest는 `python-runtime-lock.json`과 `release-runtime-lock.json`에 고정합니다. 대응 소스와 라이선스는 TGZ에 함께 전달합니다.

Windows 자동 검증에서는 설치된 실제 이전·현재 Python으로 이관 검사를 실행하도록 구성했습니다. 해당 실행 파일의 인터넷 송신은 Windows 방화벽으로 차단하고 localhost 합성 모델만 사용합니다. Windows Server 자동 실행 결과와 직원용 Windows 10·11 GUI 검증은 구분합니다.

## 남아 있는 수용 범위

실제 직원 PC의 Windows 10·11 편집기 GUI, 사내 Qwen·BGE 서버의 긴 대기열, 기존 개인 자료 전체 이관과 모든 런타임의 DNS·TCP 관찰은 별도 수용 확인이 필요합니다. 합성 서버·설치 아카이브 검사·Windows Server 실행만으로 이를 완료했다고 표시하지 않으며, `releaseReady`는 false로 유지합니다.
