# OpenViking Windows loopback fix 1

2026-11-11 KST. 원본 Python manifest가 일치하는 L-Vibe **0.2.2/0.2.3 설치본**의 OpenViking 시작 오류에 대한 오프라인 복구 패치다.

## 확인한 원인

Windows CPython 3.12의 `socket.socketpair()`는 내부 loopback TCP 연결을 사용한다. OpenViking의 의존 모듈 `lark_oapi.ws.client`가 import 중 `asyncio` event loop를 만들면서 이 내부 소켓 쌍을 생성한다. 기존 L-Vibe 필터는 모델 중계 포트 외의 connect를 차단하므로 이 연결도 막는다. 모델 키나 임베딩 ID를 변경해서 해결하는 문제로 볼 수 없다.

사용자가 보낸 Windows 출력은 Python 3.12.16 실행과 RAGFS Rust 바인딩 로딩 성공, 이후 내부 소켓 연결의 `PermissionError: DIAG_NETWORK_BLOCKED`를 확인했다. 최초 지원 진단 명령 역시 모든 connect를 막아 Windows 내부 통신을 차단했다. 이 진단 출력 자체를 실제 앱의 모델 인증 오류로 해석하지 않는다. 실제 실행 스크립트에도 같은 단일 포트 제한이 존재함을 코드에서 확인했다.

수정은 새로 생성한 loopback listener/client의 상호 주소를 확인한 **내부 소켓 쌍 한 개**에만 원래 connect를 사용한다. 글로벌 connect를 잠시 풀거나 일반 localhost 포트를 허용하지 않는다. listener는 즉시 닫고 반환한 두 소켓만 `asyncio`에 제공한다. 다른 로컬 포트·외부 connect/connect_ex 및 외부 DNS는 기존 정책을 유지한다.

## 기존 설치본에 적용

1. L-Vibe를 완전히 종료한다.
2. [L-Vibe-openviking-loopback-fix-1.tgz](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-openviking-loopback-fix-1.tgz)를 반입하고 별도 폴더에 압축 해제한다.
3. **APPLY_FIX.cmd**를 실행한다. 이미 설치된 번들 Python만 사용하며 관리자 권한·npm/pip·인터넷 다운로드를 요구하지 않는다.
4. `status`가 `applied` 또는 `already-applied`이면 L-Vibe를 다시 실행한다.

설정 JSON·암호화 설정·대화·프로젝트·기존 지식은 읽거나 바꾸지 않는다. 원본 manifest와 launcher 해시가 지원 대상과 일치할 때만 `launch.py` 및 `manifest.json`을 함께 교체한다. 실패 시 원본 복구를 시도하며 검증한 원본은 `%APPDATA%\L-Vibe\openviking\patch-backups`에 보관한다. 대상이 다르거나 패치 파일 해시가 다르면 적용하지 않는다. 중단된 알려진 상태의 재개와 반복 적용도 지원한다.

다른 파일을 수동 수정하거나 무결성 검사를 끄지 않는다. 새 앱 버전으로 업데이트하면 그 설치본의 정식 런타임으로 교체된다. 원래 0.2.2/0.2.3 EXE를 다시 설치하면 해당 원본의 launcher로 돌아가므로 이 패치가 다시 필요할 수 있다.

## 계속 시작하지 못할 때

앱을 종료한 뒤 패치 폴더의 **CHECK_IMPORT.cmd**를 실행한다. 설치된 수정 launcher의 정책을 사용하며, 실제 모델 설정/키를 읽지 않고 임시 HOME에서 모듈만 가져온다. `OPENVIKING_IMPORT_OK`는 모듈 검사 성공이며 모델 인증·전체 서비스 준비 성공까지 뜻하지 않는다. 실패하면 마지막 오류와 `EXIT_CODE`로 다음 원인을 구분한다.

새 소스에는 시작 실패 단계(번들·설정 준비·프로세스 실행/종료·health 시간 초과)와 안전한 코드/숫자만 기록하는 `startup-status.json`도 추가했다. 이 작은 패치는 launcher만 고치므로 **기존 Desktop에 새 오류 진단 UI를 추가하지 않는다.** 해당 진단 기능은 새 전체 EXE 빌드가 필요하다.

## 검증 범위

- Windows 방식의 TCP socketpair를 Linux에서 재현하여 `asyncio` self-pipe 성공, 모델 중계 포트 허용, 다른 로컬/외부 연결 및 외부 DNS 차단을 함께 검사했다.
- 동일한 TCP 소켓 정책으로 실제 고정 OpenViking 0.5.4의 server app import 성공을 확인했다. Linux에서 Windows 방식을 재현한 결과이며 Windows DLL 로딩/서비스 실행 수용을 대신하지 않는다.
- 패치의 데이터 보존, 변조/알 수 없는 설치본 거부, 중단 상태 재개, 중복 적용, manifest 교체 실패 시 rollback을 실제 임시 파일에서 검사했다.
- 원본 Python manifest SHA-256: `8d2fbf5aef25d431433feb5f34f09cbf908c025476cb7ac024f6e3674b473a3d`. 수정 원본 코드와 생성 스크립트는 [openviking-launch.py](../scripts/openviking-launch.py), [openviking-hotfix.mjs](../scripts/openviking-hotfix.mjs), [복구 installer](../distribution/openviking-loopback-fix.py)에 있다. 새 해시는 패치의 `PATCH-MANIFEST.json`, 반입 파일 해시는 옆 `.sha256`에 제공한다.
- 사용자 Windows PC의 실제 패치 적용/재시작 결과와 사내 모델 연결 확인은 별도로 남긴다. `releaseReady: false`를 유지한다.
