> Ned 0.3.1 기준: Zed 편집기와 전용 OpenCode 엔진을 사용한다. 이전 Windows 실행 증거는 승계 주장하지 않으며 [현재 검증 상태](validation-0.3.1.md)를 함께 확인한다.

# Ned configuration recovery

Ned 0.3.1의 설정 파일 수명과 기존 설치본에서 설정을 교체하는 절차다. 재설치 없이 진행할 수 있다.

## 파일이 없는 이유

- `%APPDATA%\Ned\config-import.json`: 최초 가져오기용 **임시 평문 JSON**이다. 설정 검증·암호화 저장이 성공하면 삭제한다.
- `%APPDATA%\Ned\settings.enc.json`: Windows 사용자 보호 기능으로 암호화한 **저장 설정**이다. 직접 편집하는 파일이 아니다.
- 설치 시 저장 설정이 이미 있으면 기존 설정을 보존하며 임시 JSON 생성과 메모장 실행을 건너뛴다. 업데이트·기본 제거 후 재설치에도 같은 규칙을 적용한다. 손상된 저장 설정도 자동 덮어쓰지 않는다.

따라서 `settings.enc.json`은 있고 `config-import.json`은 없는 상태는 예상된 상태다. 파일 존재만으로 저장 내용의 유효성·복호화 성공·모델 연결 성공까지 확인되지는 않는다. 설치 전부터 있던 저장 설정 때문에 건너뛴 경우와 첫 앱 실행에서 임시 파일이 처리된 경우는 생성 시점/실행 상태를 함께 확인해야 한다.

## 모델 설정을 변경하는 방법

1. 반입 TGZ의 `agent-config.json`을 별도 파일로 복사한다. TGZ를 보관하지 않았다면 `%LOCALAPPDATA%\Programs\Ned\resources\l-vibe\agent-config.example.json`을 복사한다.
2. 복사본을 메모장 등으로 편집한다. 모든 LLM provider·모델과 단일 `openViking.embedding`을 실제 사내 주소·키·ID로 채운다. 이 가져오기는 전체 설정 교체이므로 유지할 provider도 함께 넣는다. 예제의 `REPLACE_...` 값과 `.internal.example` 주소를 실제 운영 값으로 사용하지 않는다.
3. 앱이 실행된다면 진행 중인 작업을 마친 뒤 Windows 알림 영역의 Ned 아이콘을 오른쪽 클릭한다. 아이콘이 접혀 있으면 숨겨진 아이콘 표시를 연다.
4. **설정 JSON 가져와 교체 (편집기 종료 후 재실행)**을 선택하고 편집한 JSON을 지정한다. 검증·암호화 저장 후 편집기에서 파일 저장을 확인하고 Ned를 종료·재실행한다. 모델 선택창은 이미 등록한 모델 사이를 전환하는 용도다.
5. 앱이 시작 단계의 설정 오류 창에 머무른다면 **설정 JSON 가져와 교체**를 선택하고 같은 JSON을 지정한다. 저장 설정이 없는 첫 실행에서는 **설정 JSON 가져오기**로 표시한다.

저장 설정을 지우거나 암호문을 직접 편집할 필요가 없다. 다른 Windows 사용자의 암호화 파일을 복사하면 복호화되지 않을 수 있다. 사용자 대화·DB·프로젝트를 삭제할 필요도 없다.

선택하여 가져온 원본 JSON은 사용자가 관리하는 평문 파일이다. 앱은 자신의 `config-import.json` 준비 사본만 삭제한다. 실제 키를 넣은 원본의 보관·폐기는 사용자가 관리하며 키나 파일 내용을 지원 채팅/공개 저장소로 보내지 않는다.

## 앱은 열리지만 모델이 표시되지 않는 경우

OpenViking 시작 패치는 런타임만 고치며 LLM 설정을 초기화하거나 새 모델을 등록하지 않는다. 설치 폴더에 `agent-config.json`을 놓거나 수정하는 것만으로 이미 저장된 설정이 바뀌지 않는다. 위 알림 영역 메뉴로 명시적으로 가져온다.

입력창의 모델 선택 목록이 비어 있는 경우와 모델은 있지만 요청이 실패하는 경우를 구분한다. 전체 목록이 비어 있으면 Desktop/엔진 모델 목록 연동도 확인해야 하며 API 키 오류로 단정하지 않는다. 모델이 보인다면 선택 후 실제 요청의 오류 문구를 확인한다. 설정 파일·암호화 파일을 삭제하여 재설정하는 절차는 필요하지 않다.

기본 `model.providerID`는 `providers`의 키, `model.model`은 해당 provider의 `models` 키와 같아야 한다. 예를 들어 provider 키가 `Qwen think_off`이고 모델 별칭이 `model-1`이면 `"model": { "providerID": "Qwen think_off", "model": "model-1" }`로 지정한다. 서버 전송 ID는 그 안의 `modelID`에 둔다. `providers` 블록 뒤에 다른 최상위 항목이 이어지면 쉼표도 필요하다.

`사내 코딩 모델`은 예제의 표시 이름이다. `providers.<key>.name`과 `models.<key>.name`을 바꿔 표시할 수 있으며 이름만으로 주소·키·서버 ID의 적용 여부를 판정하지 않는다. 다른 JSON을 가져왔다면 해당 파일의 표시 이름과 실제 연결 결과를 함께 확인한다.

JSON은 마지막 항목 뒤에 쉼표를 쓰지 않고 열린 객체를 모두 닫아야 한다. provider 한 개 뒤의 `},`에서 파일을 끝내면 문법 오류다. 반면 `providerID: intranet`인데 provider 키는 `Qwen think_off`인 경우는 JSON 문법과 별개인 참조 오류다. 실제 파일에는 Markdown의 코드 블록 표시도 넣지 않는다.

## 구현 근거

설치기의 저장 설정 보존 분기는 [Ned installer](../distribution/ned/installer.nsi)에 있다. 임시 파일 삭제와 암호화 교체는 [ConfigVault](../src/main/config.ts), 시작 오류 창과 알림 영역 메뉴는 [Ned main.ts](../distribution/ned/main.ts)에 있다. 이 문서는 코드 경로 확인이며 사용자 Windows PC의 설치 로그나 복호화 결과를 대신하지 않는다.
