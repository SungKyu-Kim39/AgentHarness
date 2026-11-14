# 기존 OpenViking 지식 가져오기

기존 OpenViking 0.5.0의 사용자 자료는 `.ovpack`으로 내보내 Ned의 로컬 OpenViking 0.5.4로 가져올 수 있습니다. 가져온 개인 기억과 문서는 같은 Windows 사용자의 모든 Ned 프로젝트에서 읽기 전용으로 검색합니다. 아래 절차는 Ned 0.3.5와 내보내기 수정 도구 2 이후 구성에 적용합니다.

## 옮기는 자료와 보존 범위

기존 DB를 Ned DB 위에 복사하지 않습니다. 원본 서버와 저장소를 유지하고 내보낸 OVPack도 별도로 보관합니다. Ned는 승인한 사본과 SHA-256을 사용자 데이터 폴더에 남깁니다. 개인 OpenCode·Zed 설정과 플러그인은 이관하지 않습니다.

| 원본 사용자 하위 영역 | 가져온 뒤 사용하는 범위 |
| --- | --- |
| `memories` | 개인 기억 검색·읽기 |
| `resources` | 개인 문서 검색·읽기 |
| `skills` | 참고 자료로 검색·읽기. 스크립트·플러그인을 설치하지 않습니다. |
| `peers` 아래 각 peer의 `memories` | 해당 기억 검색·읽기 |
| `sessions` | 패키지에 보관합니다. Ned 채팅 세션으로 변환하거나 개인 검색에 넣지 않습니다. |
| `privacy`와 기타 관리 자료 | 패키지에 보관하되 모델 검색·읽기 도구에 노출하지 않습니다. |

OVPack은 원본 SDK의 내보내기 형식이므로 DB의 모든 내부 파일과 실행 상태를 복제하는 백업은 아닙니다. 이관 후에도 원본 저장소를 보관하세요.

## 기존 서버에서 내보내기

1. 기존 OpenViking을 켜고 색인·기억 갱신 등 다른 쓰기 작업을 잠시 멈춥니다.
2. 반입 묶음의 `EXPORT_PERSONAL.cmd`와 `export-openviking-personal.py`를 같은 쓰기 가능한 폴더에 둡니다.
3. `EXPORT_PERSONAL.cmd`를 실행합니다. 기본 주소는 `http://127.0.0.1:1935`, account·user는 각각 `default`입니다.
4. 인증을 쓴다면 **기존 OpenViking 서버의 API 키**를 입력합니다. 사내 LLM·임베딩 키와 다릅니다. 인증이 없으면 Enter를 누릅니다. 입력은 숨기고 파일에 기록하지 않습니다.
5. `status: exported`, `EXIT_CODE=0`과 `openviking-personal-YYYYMMDD-HHMMSS.ovpack`, `.sha256` 파일을 확인합니다.

주소·사용자가 다르면 `--base-url http://127.0.0.1:1935 --account default --user default`를 지정합니다. 명시한 루프백 HTTP 서버에서 최소 목록을 먼저 확인하고 `/api/v1/pack/export`로 벡터 포함 내보내기를 요청합니다. 프록시·리다이렉트와 명령행 API 키 인자는 사용하지 않습니다.

도구는 Ned 번들 Python의 표준 라이브러리를 사용합니다. 추가 패키지나 인터넷이 필요하지 않으며, Ned가 없으면 기존 L-Vibe의 Python도 지원합니다. OVPack에는 개인 자료와 대화가 들어갈 수 있으므로 지원 채팅이나 공개 GitHub에 올리지 마세요.

## Ned로 가져오기

1. Ned를 기존 사내 LLM·단일 임베딩 설정으로 실행합니다. 별도 이관용 JSON 항목은 필요 없습니다. L-Vibe 0.2.6 이후의 가져오기 기능을 유지합니다.
2. 알림 영역에서 **개인 공통 지식 가져오기 (.ovpack)**를 선택합니다.
3. 파일을 지정하면 고정 사본을 검사합니다. 원본 사용자 영역·파일 수·SHA-256·검색 범위를 확인한 뒤 승인합니다.
4. 완료 메시지와 **개인 공통 지식 가져오기 상태**에서 `ready`를 확인합니다.

지원 형식은 단일 사용자 루트 `viking://user/<user-id>`의 OVPack v3입니다. 최대 압축 크기는 512 MiB, 검사하는 비압축 총량은 2 GiB입니다. 전체 DB 패키지와 현재 Ned 사용자인 `local-user`의 패키지는 받지 않습니다. 원본 사용자 ID를 개인 account 안에 유지하며 기존 자료나 기본 스킬은 덮어쓰지 않습니다.

0.5.0과 0.5.4는 모두 형식 버전 3과 벡터 스냅샷을 지원합니다. SDK가 provider·model·input·query/document 매개변수·차원을 비교해 호환되면 벡터를 재사용하고, 아니면 사내 임베딩 API로 재계산합니다. 이름과 차원만 같다고 재사용을 강제하지 않습니다.

같은 파일을 다시 선택하면 완료 기록과 실제 영역을 확인해 중복 가져오기를 생략합니다. 다른 파일이 같은 사용자 영역을 가리키거나 대상·실패 기록과 충돌하면 자동 덮어쓰기·재시도하지 않습니다. 원본과 기록을 보존해 복구 대상을 확인해야 합니다.

API 성공 후에도 임베딩 큐가 남아 있을 수 있습니다. Ned는 모델 처리를 기다리고 검색 영역의 파일·색인 일관성을 확인한 뒤 `ready`로 표시합니다. 그동안 `importing`으로 보일 수 있으며 고정 시간으로 실패시키지 않습니다. 색인 검사 실패는 `OV_PERSONAL_INDEX`로 구분합니다. 이 처리는 벡터 없는 가져오기 직후 검색이 비던 문제를 재현해 0.3.1에 반영했습니다.

## 검색 결과 확인

기존 지식에만 있는 내용으로 요청해 보세요.

> personal_knowledge_search 도구로 내가 이전에 정한 개발 환경과 코딩 규칙을 찾아라. 관련 결과는 personal_knowledge_read로 읽고, 확인한 URI와 근거를 함께 제시하라.

실제 도구 이벤트와 검색 결과·원문을 확인한 뒤 다른 프로젝트에서도 조회해 개인 공통 범위가 맞는지 확인합니다. `knowledge_search`·`knowledge_read`는 현재 프로젝트, `personal_knowledge_search`·`personal_knowledge_read`는 가져온 개인 자료에 사용합니다.

가져온 글은 참고 자료입니다. 그 안의 문장으로 실행 권한이 생기거나 사용자 스킬의 훅·스크립트가 자동 활성화되지는 않습니다. 새 대화·프로젝트 전체를 자동으로 기억에 올리지 않습니다. 기본 스킬 등록과 개인 지식 가져오기·검색 성공도 별도로 확인합니다.

완료·실패 기록은 `%APPDATA%\Ned\openviking\personal-imports.json`, 사본은 같은 폴더의 `personal-<sha256>.ovpack`에 있습니다. 원본 서버 키와 모델 키는 저장하지 않습니다. 실패는 업로드·가져오기·존재 확인·색인 단계와 HTTP 상태로 나누며 서버 응답 원문은 운영 로그에 남기지 않습니다.

## HTTP 401·403·500 확인

`EXPORT_PREFLIGHT HTTP_401`이면 기존 로컬 OpenViking의 키를 확인합니다. Qwen·BGE 키를 대신 넣지 마세요. 403은 해당 키의 account·user 권한도 확인해야 합니다. 키를 공유하거나 인증을 끌 필요는 없습니다.

`EXPORT_PACK HTTP_500`은 기존 서버 내부 오류입니다. 벡터 스냅샷 단계에서 실패한 경우 `EXPORT_PERSONAL_NO_VECTORS.cmd` 또는 `EXPORT_PERSONAL.cmd --without-vectors`를 명시적으로 선택할 수 있습니다. 문서·기억을 보존하고 벡터만 제외해 Ned에서 다시 계산합니다. 자동 전환하지 않으며, 이 방법도 실패하면 기존 서버 traceback을 로컬에서 확인해야 합니다.

내보내기 전체에는 고정 5분 제한을 두지 않고 사용자가 취소할 수 있습니다. 인증·경로 선확인의 로컬 메타데이터 요청에만 30초를 적용합니다.

## `EXPORT_PREFLIGHT HTTP_500`과 수정 도구 2

기존 0.3.3 내보내기는 `fs/stat` 오류에서 OVPack 요청 전 중단했습니다. 이 단계에는 `--without-vectors`가 영향을 주지 않습니다. `/health`가 healthy여도 선택 루트와 저장소 읽기는 실패할 수 있습니다.

[독립 수정 도구 2](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-openviking-export-fix-2.tgz)를 새 폴더에 풀어 `EXPORT_PERSONAL.cmd`를 실행합니다. 재설치나 DB·인증 변경은 필요 없습니다. 같은 인증·사용자 범위의 `fs/ls`를 `simple`, `node_limit=1`로 비재귀 확인한 뒤 원래 export API를 호출합니다. 목록 조회의 401·403·500이나 잘못된 응답은 계속 거절합니다.

실패가 이어지면 **CHECK_EXPORT.cmd**를 사용합니다. health·ready·stat·list의 HTTP 상태, 고정 오류 코드, 버전·인증 방식·요청 범위만 출력합니다. 키·자료 이름·내용·오류 원문은 버리고 GET만 요청합니다. 공유할 때는 이 JSON만 사용하세요.

확인한 배포 PC의 기존 서버는 0.5.0, trusted 모드, `healthy=True`였습니다. stat 500의 내부 원인은 미확정입니다. Linux에서는 stat에 500을 주입해도 같은 인증의 내보내기·현재 SDK 가져오기·개인 검색이 성공하는지 검사했습니다. 실제 사용자 자료 성공은 새 도구에서 별도 확인해야 합니다. 과거 v0.3.3 파일과 태그는 유지합니다.
