# L-Vibe configuration recovery

L-Vibe 0.2.3/0.2.4/0.2.5의 설정 파일 수명과 기존 설치본에서 설정을 교체하는 절차다. 재설치 없이 진행할 수 있다.

## 파일이 없는 이유

- `%APPDATA%\L-Vibe\config-import.json`: 최초 가져오기용 **임시 평문 JSON**이다. 설정 검증·암호화 저장이 성공하면 삭제한다.
- `%APPDATA%\L-Vibe\settings.enc.json`: Windows 사용자 보호 기능으로 암호화한 **저장 설정**이다. 직접 편집하는 파일이 아니다.
- 설치 시 저장 설정이 이미 있으면 기존 설정을 보존하며 임시 JSON 생성과 메모장 실행을 건너뛴다. 업데이트·기본 제거 후 재설치에도 같은 규칙을 적용한다. 손상된 저장 설정도 자동 덮어쓰지 않는다.

따라서 `settings.enc.json`은 있고 `config-import.json`은 없는 상태는 예상된 상태다. 파일 존재만으로 저장 내용의 유효성·복호화 성공·모델 연결 성공까지 확인되지는 않는다. 설치 전부터 있던 저장 설정 때문에 건너뛴 경우와 첫 앱 실행에서 임시 파일이 처리된 경우는 생성 시점/실행 상태를 함께 확인해야 한다.

## 모델 설정을 변경하는 방법

1. 반입 TGZ의 `agent-config.json`을 별도 파일로 복사한다. TGZ를 보관하지 않았다면 `%LOCALAPPDATA%\Programs\L-Vibe\resources\l-vibe\agent-config.example.json`을 복사한다.
2. 복사본을 메모장 등으로 편집한다. 모든 LLM provider·모델과 단일 `openViking.embedding`을 실제 사내 주소·키·ID로 채운다. 이 가져오기는 전체 설정 교체이므로 유지할 provider도 함께 넣는다. 예제의 `REPLACE_...` 값과 `.internal.example` 주소를 실제 운영 값으로 사용하지 않는다.
3. 앱이 실행된다면 진행 중인 작업을 마친 뒤 Windows 알림 영역의 L-Vibe 아이콘을 오른쪽 클릭한다. 아이콘이 접혀 있으면 숨겨진 아이콘 표시를 연다.
4. **모델 설정 JSON 가져와 교체 후 재시작**을 선택하고 편집한 JSON을 지정한다. 검증·암호화 저장 후 앱을 다시 시작한다. 모델 선택창은 이미 등록한 모델 사이를 전환하는 용도다.
5. 앱이 시작 단계의 설정 오류 창에 머무른다면 **설정 JSON 가져와 교체**를 선택하고 같은 JSON을 지정한다. 저장 설정이 없는 첫 실행에서는 **설정 JSON 가져오기**로 표시한다.

저장 설정을 지우거나 암호문을 직접 편집할 필요가 없다. 다른 Windows 사용자의 암호화 파일을 복사하면 복호화되지 않을 수 있다. 사용자 대화·DB·프로젝트를 삭제할 필요도 없다.

선택하여 가져온 원본 JSON은 사용자가 관리하는 평문 파일이다. 앱은 자신의 `config-import.json` 준비 사본만 삭제한다. 실제 키를 넣은 원본의 보관·폐기는 사용자가 관리하며 키나 파일 내용을 지원 채팅/공개 저장소로 보내지 않는다.

## 구현 근거

설치기의 저장 설정 보존 분기는 [windows-installer.nsi](../distribution/windows-installer.nsi)에 있다. 임시 파일 삭제와 암호화 교체는 [ConfigVault](../src/main/config.ts), 시작 오류 창과 알림 영역 메뉴는 [native-startup.ts](../distribution/native-startup.ts)에 있다. 이 문서는 코드 경로 확인이며 사용자 Windows PC의 설치 로그나 복호화 결과를 대신하지 않는다.
