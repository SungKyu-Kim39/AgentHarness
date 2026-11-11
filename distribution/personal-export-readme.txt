L-Vibe personal knowledge export helper

기존 OpenViking 0.5.0의 개인 지식을 로컬 OVPack 파일로 내보내는 도구이다.
이 압축 파일에는 도구만 들어 있으며 사용자 지식이나 API 키는 포함하지 않는다.

1. 쓰기 가능한 폴더에 압축을 해제한다.
2. 기존 OpenViking 서버를 http://127.0.0.1:1935 에서 실행한다.
   내보내는 동안 기존 환경의 색인/기억 갱신 작업은 멈춘다.
3. EXPORT_PERSONAL.cmd를 실행한다. 현재 설치된 L-Vibe의 번들 Python을 사용한다.
4. 기존 로컬 OpenViking 서버의 API 키가 있으면 입력한다.
   사내 LLM/임베딩 API 키와 구분한다. 인증을 쓰지 않으면 Enter를 누른다.
5. status가 exported, EXIT_CODE가 0인지 확인한다.
   같은 폴더에 생성된 .ovpack과 .sha256을 함께 보관한다.

기본 account/user는 default이다. 주소가 다르면 다음처럼 실행한다.
EXPORT_PERSONAL.cmd --base-url http://127.0.0.1:1935 --account default --user default

이 도구는 기존 DB를 변경하거나 L-Vibe로 자동 가져오지 않는다.
가져오기와 모든 프로젝트에서의 개인 검색에는 L-Vibe 0.2.6 이상이 필요하다.
내보내기 자체는 기존 L-Vibe 0.2.x 설치본의 Python으로 수행할 수 있다.

OVPack에는 개인 기억/문서/대화 등 민감한 자료가 포함될 수 있다.
사용자 PC에서 보관하며 지원 채팅이나 공개 GitHub에 올리지 않는다.
원본 저장소도 그대로 보존한다. 같은 이름의 기존 파일은 덮어쓰지 않는다.
도구는 외부 인터넷/패키지 설치를 요구하지 않는다.
