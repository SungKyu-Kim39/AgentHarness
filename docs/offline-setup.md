# L-Vibe 0.2.5 Windows x64 설치

이 묶음은 OpenCode Desktop 기반 L-Vibe의 검증 후보입니다. Windows 10·11 및 실제 사내 모델 서버의 수용 검증은 아직 완료되지 않았습니다. 상세 미완료 항목은 함께 제공한 READINESS.json을 확인하세요.

1. 반입한 L-Vibe-0.2.5-windows-x64.tgz를 압축 해제합니다. Windows의 tar 또는 TGZ를 지원하는 압축 도구를 사용할 수 있습니다.
2. 기존 L-Vibe가 실행 중이면 완전히 종료한 뒤 폴더 안의 L-Vibe-0.2.5-win-x64.exe를 실행합니다. 일반 사용자에게 설치하며 관리자 권한을 요구하지 않습니다.
3. 저장 설정이 없는 첫 설치에서는 메모장이 설정 JSON을 엽니다. 사내 주소·키·서버 모델 ID를 입력하고 저장한 뒤 메모장을 닫습니다. 사용하지 않을 보조 provider는 삭제하세요. 기존 settings.enc.json이 있으면 보존하며 JSON 준비와 메모장 실행을 건너뜁니다.
4. 바탕화면 또는 시작 메뉴의 L-Vibe를 실행합니다. 프로젝트 폴더를 선택하고 작업을 요청합니다. 모델 선택창에서 등록한 LLM을 바꿀 수 있습니다.

설치 EXE, Electron, 앱 전용 OpenCode 엔진, Python, OpenViking, REA, Graphify와 MCP 6종의 실행 구성 요소가 함께 제공됩니다. 직원 PC에서 npm·pip·uvx·Git clone·추가 런타임 설치를 실행할 필요가 없습니다. 모델 가중치는 포함하지 않으며, 구성한 사내 모델 API에 연결되어야 합니다.

0.2.3부터 배포 파일·폴더 이름과 설치 리소스 경로는 ASCII 영문 이름을 사용합니다. 시작 안내는 GETTING_STARTED.txt, 검증 보고서는 VALIDATION_REPORT.md, 출시 상태는 READINESS.json입니다. 압축 내부와 포함된 앱 소스 경로도 검사합니다. 안내 내용과 앱의 한국어 표시는 유지됩니다.

0.2.5에는 Windows OpenViking 내부 loopback 수정과 토크나이저의 오프라인 자료·캐시 경로/줄바꿈 수정이 함께 포함되어 있습니다. 별도 패치를 적용하지 않고 설치합니다. 시작 실패 시 경고 코드와 %APPDATA%\L-Vibe\openviking\startup-status.json을 확인하세요. 반입 폴더의 CHECK_OPENVIKING.cmd는 추가 설치 없이 실제 SDK와 인코더 7종을 검사합니다. WINDOWS_DIAGNOSTICS.txt에 단계별 안내가 있습니다.

정적 토크나이저 자료 6개는 공식 SHA-256을 검증해 포함합니다. 모델 가중치가 아니며 사내 Qwen/BGE 설정은 기존 JSON을 사용합니다. 자료가 없거나 손상되면 온라인 다운로드로 복구하지 않고 로컬 오류로 멈춥니다.

## JSON 설정

저장 설정이 없는 최초 설치에서 편집하는 임시 파일은 %APPDATA%\L-Vibe\config-import.json입니다. TGZ 폴더의 agent-config.json은 배포 원본이며 설치기가 이 파일을 준비 사본으로 복사합니다. 기존 암호화 설정 settings.enc.json이 있으면 준비 파일을 새로 만들지 않고 메모장도 열지 않습니다. 업데이트·재설치에서도 기존 설정을 보존합니다.

앱이 임시 JSON을 검증·암호화 저장하면 config-import.json을 삭제합니다. 따라서 settings.enc.json만 있는 상태는 예상된 상태입니다. 저장 파일을 직접 편집하지 마세요. 설정을 바꾸려면 아래 알림 영역 메뉴 또는 시작 단계 오류 창에서 편집한 JSON을 명시적으로 가져옵니다. 템플릿이 필요하면 설치 폴더의 resources\l-vibe\agent-config.example.json을 별도 파일로 복사할 수 있습니다. 상세 절차는 함께 제공한 CONFIGURATION_RECOVERY.txt를 참고하세요.

LLM은 OpenCode v2 형식의 providers 객체로 등록합니다.

- providers.<provider ID>.settings.baseURL: API 기준 경로. /v1까지 포함하고 /chat/completions는 붙이지 않습니다.
- providers.<provider ID>.settings.apiKey: 사내에서 발급받은 키. APIKey 표기도 인식합니다. env 목록은 원본 형식과의 호환 메타데이터로 보존하며 개인 PC의 환경 변수를 검색하지 않습니다.
- providers.<provider ID>.models.<별칭>.modelID: 사내 서버에 등록된 정확한 ID. 표시 이름과 구분합니다.
- model: { "providerID": "intranet", "model": "model-1" }처럼 처음 사용할 모델의 별칭을 지정합니다.
- name, capabilities, cost, limit는 OpenCode 모델 구조로 유지합니다. 예제의 context/output 한도는 보수적인 기본값이며 사내 서버의 확인된 한도로 수정할 수 있습니다.
- OpenAI 호환 제공자는 @opencode/ai/providers/openai-compatible을 사용합니다. 임의 npm 제공자 플러그인을 설치하지 않습니다.

임베딩은 openViking.embedding 객체 한 개입니다. baseUrl, apiKey, id, dimension을 실제 임베딩 서버에 맞춥니다. 임베딩 목록이나 두 번째 임베딩 설정은 허용하지 않습니다. 필요하면 openViking.vlm에 별도 사내 문서 해석 모델을 설정할 수 있고, 생략하면 기본 LLM을 사용합니다.

첫 실행이 JSON 문법·필수 값·URL을 확인하고 Windows 사용자 보호 기능으로 암호화 저장한 뒤 가져오기용 평문 사본을 삭제합니다. 오류가 있으면 편집·다시 확인·다른 JSON 가져오기를 선택할 수 있습니다. 키는 화면·엔진 설정·지원용 로그에 전달하지 않습니다. 원래 배포 폴더의 JSON은 사용자가 관리하는 평문이므로 실제 키를 채웠다면 별도로 관리해야 합니다.

설정이 정상인 상태에서 교체하려면 작업을 마친 뒤 알림 영역의 L-Vibe 아이콘을 오른쪽 클릭하고 '모델 설정 JSON 가져와 교체 후 재시작'을 선택합니다. 모델 선택창은 이미 등록한 모델 사이를 전환하는 용도입니다.

## 사용 범위와 데이터

선택한 프로젝트 안의 읽기·텍스트 검색, 승인 후 파일 수정, 변경 전 스냅샷 저장을 지원합니다. 여러 파일 작업에는 Aegis 지침과 관련 Conductor 트랙을 읽고, 필요한 스킬만 사용합니다. REA는 정적 분석만, Graphify는 AST 그래프만 제공합니다. 대상 프로그램·바이트코드를 실행하지 않습니다.

C/C++ 정의·참조 탐색(Serena/clangd), Git 변경·이력 조회, 로컬 PDF/Office 읽기(MarkItDown), CSV·Parquet·로컬 DB 조회(DuckDB), 로컬 웹페이지 점검(Playwright/Chrome DevTools)이 포함됩니다. 웹페이지 점검은 승인을 받은 localhost 또는 127.0.0.1의 HTTP 포트 한 곳을 대상으로 화면·콘솔·스크린샷을 확인합니다. C/C++ 분석은 프로젝트의 빌드 정보와 헤더 구성에 영향을 받습니다.

OpenViking은 앱과 함께 시작하고 종료합니다. 지식 색인은 선택한 프로젝트의 텍스트 파일에 대해 승인을 받아 수행합니다. 임베딩 입력은 설정한 사내 임베딩 API로 전달됩니다. 개인 대화는 자동 색인하거나 공용 지식으로 올리지 않습니다.

## 기본 스킬 자동 등록

기본 스킬 34개를 포함합니다. 최초 실행에서 JSON의 OpenViking·임베딩 설정으로 서버가 준비되면 기본 스킬을 백그라운드에서 자동 등록합니다. 별도 설치 명령이나 수동 파일 복사는 필요하지 않습니다. OpenViking의 `viking://agent/skills/l-vibe-<스킬 ID>`에 본문·참조 문서·라이선스·출처를 함께 저장합니다. 이 서버와 데이터는 해당 Windows 사용자의 L-Vibe 앱 데이터 안에 있습니다.

알림 영역의 L-Vibe 아이콘을 오른쪽 클릭하고 **OpenViking 기본 스킬 등록 상태**를 선택하면 완료 수·오류를 확인할 수 있습니다. 첫 등록에는 사내 임베딩 및 문서 처리 모델 응답에 따라 시간이 걸립니다. 등록 중에도 앱을 사용할 수 있고 원본 로컬 스킬 목록을 읽을 수 있습니다.

재실행 시 파일·등록본 해시를 확인하여 같은 스킬을 다시 색인하지 않습니다. 앱 업데이트로 바뀐 기본 패키지는 등록 기록과 현재 내용이 일치하는 경우 갱신합니다. OpenViking에서 직접 편집한 사본이나 같은 이름의 사용자 스킬은 자동 덮어쓰지 않고 충돌로 표시합니다. 오류로 남은 항목은 다음 실행에서 재확인합니다. 앱을 종료하면 등록 요청을 취소하고 OpenViking도 함께 종료합니다.

자동 등록 대상은 검증한 기본 배포 스킬입니다. 사용자 대화·프로젝트 파일·외부 Git 저장소를 자동으로 가져오는 기능이 아닙니다. 스킬은 지침이며 컴파일러·브라우저·분석 실행기를 추가하지 않습니다.

앱은 %LOCALAPPDATA%\Programs\L-Vibe에, 설정·대화 DB·스냅샷·로컬 지식은 %APPDATA%\L-Vibe에 저장합니다. 업데이트와 기본 제거는 사용자 데이터를 유지합니다. 다른 Windows 사용자에게 암호화 설정을 그대로 복사하지 마세요.

일반 명령 실행과 새 Desktop의 반복 감지·답변 재출력은 후속 구현입니다. Win10/Win11 설치·업데이트·ACL·자식 프로세스 및 DNS/TCP 관찰·실제 사내 모델 검증이 남아 있습니다. 이 후보를 1.0 완료본으로 취급하지 않습니다.

## 무결성과 라이선스

TGZ 옆의 .sha256은 반입 파일 해시이고, SHA256SUMS.txt는 압축 내부 파일의 SHA-256 목록입니다. PowerShell의 Get-FileHash 명령으로 확인할 수 있습니다. 이 후보에는 배포 서명이 없습니다.

licenses 폴더에 버전·다운로드 해시·라이선스 기록과 OpenViking 대응 소스를 제공합니다. OpenViking은 AGPL-3.0 구성 요소로 별도 프로세스로 포함합니다. source 폴더에는 해당 L-Vibe 소스 체크포인트를 포함합니다.

L-Vibe 자체 코드는 MIT이며 설치 묶음에는 GPL/AGPL/LGPL·CC-BY-SA와 브라우저/DLL의 별도 조건이 함께 적용됩니다. 현재 라이선스 확인 범위와 남은 재배포 검토는 함께 제공한 LICENSE_POLICY.txt와 THIRD_PARTY_NOTICES.md에 기록합니다.
