# 어댑터 명세

이 문서는 독립 UI 원형의 어댑터를 기록한다. 공식 Desktop 전환의 기준은 [새 아키텍처](architecture.md)이며, 아래 기능은 v2 서버에서 연결·검증되기 전 이관 완료로 간주하지 않는다.

## 공통 경계

원본 URL·커밋·파일 해시·라이선스와 배포 용도는 `vendor-lock.json`을 기준으로 한다. 원본을 직원 PC에서 설치하거나 원격 HEAD를 확인하지 않는다. 원본 스킬은 모델에 전달하는 참고 문서이며 호스트의 승인·경로·네트워크 정책보다 높은 권한을 갖지 않는다. JS/Python 원본 코드를 import하거나 실행 플러그인으로 등록하지 않는다.

모델이 실제 호출할 수 있는 MCP 도구는 `list_files`, `read_file`, `search_text`, `propose_edit`, `methodology` 다섯 가지다. 임의 도구·메서드·REPL·명령은 차단한다. MCP 서버는 127.0.0.1 임의 포트와 실행별 토큰을 사용한다. 모델에는 `l_vibe_` 접두사로 노출한다.

모델 API도 별도 localhost 게이트웨이를 거친다. 게이트웨이는 JSON에 지정된 `/chat/completions` 하나에만 요청하고 리다이렉트를 거부한다. 모델 ID 변경·모델 목록·다른 경로는 차단한다. 실제 모델 키는 호스트에만 있고 엔진에는 실행별 게이트웨이 토큰을 전달한다. 재출력기는 이 실행 경로와 분리된 답변 전용 HTTP 요청이다.

## Aegis 2.15.0

- `methodology(name="aegis")`는 허용 문서 목록과 README를 읽는다.
- `document`로 `establishing-project-context`, `goal-framing`, `writing-plans`, `executing-plans`, `verification-before-completion`, `systematic-debugging`의 `skills/<name>/SKILL.md`만 선택해 읽을 수 있다.
- 온라인 설치·업데이트·doctor·서드파티 플러그인 로딩은 매핑하지 않는다. complete install/doctor 통과를 주장하지 않는다.
- 조사·계획·변경·검증 근거의 원칙을 적용한다. 단순 요청에 문서·트랙·전체 스킬을 강제하지 않는다.
- Git·명령·하위 에이전트 실행은 현재 앱의 도구가 아니므로 원문 명령을 그대로 실행할 수 없다. 읽기/검색은 호스트 도구, 파일 변경은 propose_edit로 매핑한다.

## Conductor

원본은 사용자 지정 저장소의 고정 커밋이다. 현재 고정 원본의 `plugin.json`에는 버전 필드가 없어 원문에 제시된 0.3.0을 이번 검증에서 독립 확인한 버전으로 표시하지 않는다. 커밋을 정확한 식별자로 사용한다.

- `methodology(name="conductor")`는 프로젝트의 `conductor/index.md`, `conductor/tracks.md`가 있으면 함께 읽는다. 관련 spec/plan은 read_file로 이어 읽는다.
- `document`로 setup/new-track/implement/review/status 원본 스킬을 선택한다. Gemini 설치 명령과 원격 플러그인 설치는 실행하지 않는다.
- 관련 트랙의 선택·재사용은 모델이 실제 문서 내용을 조사해 판단한다. 키워드만으로 고정 분기하지 않는다.
- 새 트랙·체크박스·진행 기록을 바꾸려면 propose_edit로 전체 파일을 제안한다. 사용자가 승인해야 파일·필요한 하위 폴더를 생성한다.
- 원문의 매번 확인·필수 Q&A를 강제하지 않는다. 제품 범위를 바꾸는 미결 결정은 구체적으로 질문한다. 세션 자동 승인은 사용자 결정의 답이 아니다.
- 검증 명령을 실행할 수 없는 현재 후보에서는 실행 완료·검증 성공 체크를 허위로 기록하면 안 된다.
- 공식 OpenCode 네이티브 플러그인 설치가 아니다.

## Serena: 실행 비활성화

고정 소스의 pyproject 버전은 2.1.1.dev0다. 소스 검토·해시/라이선스 기록만 완료했다. Python·Windows site-packages·DLL·clangd 런타임이 확보·검증되기 전에는 Serena 도구를 등록하지 않는다. UI capability도 false다. 현재 search_text 결과에는 일반 텍스트 검색임을 명시하며 의미 분석 성공으로 표시하지 않는다.

1.0 연결 시 아래 조건을 모두 충족해야 한다.

1. 고정 Python 절대 경로로 `serena start-mcp-server --agent-interface tools`를 실행하고 dashboard/GUI를 비활성화한다. 빌드 시 확보한 패키지만 사용한다.
2. find_symbol/find_referencing_symbols/get_symbols_overview 등 검토한 읽기 도구만 중계한다. REPL·편집·명령·activation은 등록하지 않는다. 프로젝트 설정의 인터페이스 우선순위로 REPL이 복구되지 않도록 별도 정규화·검증한다.
3. cpp ls_path는 고정 clangd 절대 경로다. 임의 프로젝트 LSP command를 실행하거나 관리형 다운로드를 하지 않는다.
4. compile_commands.json·실제 include/매크로/옵션·SDK 유무를 기록한다. SDK가 없으면 정확도 제한을 표시한다.
5. 실패 시 호스트 텍스트 검색으로 대체했음을 표시한다. 실제 Windows read-only MCP·clangd 검증을 완료하기 전 capability를 활성화하지 않는다.

## 저장·승인

자동 승인 상태는 호스트 메모리에만 존재한다. 엔진 always 승인 API를 호출하지 않는다. 재실행·세션/프로젝트 전환·중지에서 해제한다. 읽기 도구의 결과와 수정 도구의 실제 저장 검증 결과를 별도로 기록한다. 호스트의 제안 스냅샷은 Git 유무와 무관하다. 변경 전후를 사용자 기록에 남기며 외부 변경 시 자동 재기준화·적용하지 않는다.
