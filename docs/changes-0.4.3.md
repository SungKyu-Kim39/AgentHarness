# Ned 0.4.3 변경 사항

0.4.1 정식 릴리스 이후 0.4.2와 세 차례 rebuild에서 보완한 사용자 MCP와 슬래시 메뉴를 정식 릴리스에 포함했습니다.

- Ned Agent에서 `/`를 입력하면 **Commands**에는 `/compact`, **Skills**에는 글로벌·프로젝트 스킬, **MCP Server Commands**에는 켜진 사용자 MCP가 표시됩니다. 사용자 MCP를 켜거나 끄면 열린 대화의 목록에도 반영됩니다.
- 트레이의 **사용자 MCP 관리**에서 사내 Streamable HTTP 서버를 등록하고 사용할 도구를 고릅니다. `https://127.0.0.1:18081/mcp` 같은 이 PC의 주소도 등록할 수 있습니다. 연결 확인에서 입력 형식과 HTTPS 인증서 오류를 구분해 표시합니다.
- 사용자 MCP는 선택한 요청에만 제공됩니다. **MCP Server Commands**에서 `/mcp-…`를 선택해 요청을 작성하고, 호출하기 전에 서버와 전달할 인자를 확인합니다.
- 0.4.2 rebuild3에서 제자리 업데이트할 때 기존 설정, 대화, OpenViking 지식, 글로벌 스킬과 사용자 MCP 등록을 보존합니다.

[사용자 스킬과 MCP 안내](extension-guide.md) · [검증 기록](validation-0.4.3.md)
