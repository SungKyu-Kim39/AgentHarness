Ned OpenViking export fix 2

대상: 기존 OpenViking 0.5.0(http://127.0.0.1:1935)의 개인 자료를
Ned로 가져오기 전에 내보내는 작은 독립 도구이다. Ned 재설치는 필요 없다.

1. 새 폴더에 이 묶음을 압축 해제한다. 이전 도구와 섞지 않는다.
2. 기존 서버를 실행한 채 기존 환경의 색인/기억 갱신 등 쓰기를 잠시 멈춘다.
3. EXPORT_PERSONAL.cmd를 실행하고 기존 OpenViking 서버의 키를 입력한다.
   사내 LLM/임베딩 키가 아니다. 인증을 쓰지 않는 서버만 Enter를 누른다.
4. status: exported, EXIT_CODE=0 및 .ovpack/.sha256 생성을 확인한다.
5. 기존 Zed를 종료하고 Ned에서 개인 공통 지식 가져오기 메뉴로 .ovpack을 선택한다.

파일 목록 읽기로 인증/사용자 범위를 확인한다. 기존 stat 선확인에서
실패하던 경우를 위해 stat의 통계/잠금/메타데이터 처리를 내보내기
필수 조건에서 제거했다. 원본 export API의 인증/범위 검사는 그대로 적용한다.
서버가 목록 조회도 실패하면 원인을 해결할 때까지 내보내지 않는다.

오류가 계속되면 CHECK_EXPORT.cmd를 실행하고 같은 기존 서버 키를 입력한다.
출력 JSON에는 health/ready/stat/list의 HTTP 상태, 고정 오류 분류,
서버 버전/인증 모드와 선택 범위의 일치 여부만 있다. 키, 사용자 ID,
자료 이름/내용, 원본 서버 오류는 출력하지 않는다. 이 JSON만 지원에 전달한다.
진단은 GET만 수행하며 내보내기/가져오기/모델 질문을 요청하지 않는다.

EXPORT_PACK HTTP_500으로 바뀌고 벡터 내보내기가 문제라면
EXPORT_PERSONAL_NO_VECTORS.cmd를 명시적으로 실행할 수 있다.
문서/기억은 포함하고 Ned에서 벡터를 재계산한다. 자동 재시도하지 않는다.
EXPORT_PREFLIGHT의 오류는 벡터 옵션과 무관하다.

다른 로컬 주소/범위는 다음처럼 지정한다.
EXPORT_PERSONAL.cmd --base-url http://127.0.0.1:1935 --account default --user default
CHECK_EXPORT.cmd --base-url http://127.0.0.1:1935 --account default --user default

원본 DB/인증 설정은 수정하지 않는다. 내보내기에 고정 응답 대기 시간을
두지 않으며 Ctrl+C로 중지할 수 있다. 같은 이름의 출력은 덮어쓰지 않는다.
OVPack에는 개인 기억/자료/대화가 포함될 수 있으므로 로컬에 보관하고
지원 채팅이나 공개 GitHub로 보내지 않는다. 도구 실행에는 설치된 Ned
(없으면 기존 L-Vibe)의 번들 Python만 사용하며 pip/인터넷은 필요 없다.
