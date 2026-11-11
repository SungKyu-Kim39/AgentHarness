# L-Vibe 0.2.7 — model transport, thinking variants and edit approval

2026-11-11 KST. 사용자 제보의 세션 압축 ECONNRESET, thinking 옵션 형식 및 파일 수정 승인 혼동을 다룬 검증 후보다.

- 모델 중계의 고정 180초 fetch 제한을 제거했다. Node HTTP 전송에 호스트와 엔진의 전체/헤더/조각별 응답 제한을 기본 해제하고 사용자 중지와 실제 연결 오류를 처리한다. 요청 한도 32 MiB, JSON 완전 수신 후 전달, SSE 중단의 명시적 오류 및 본문·키 없는 마지막 실패 진단을 추가했다.
- 모델 options/객체형 variants를 현재 엔진의 settings/body/배열로 정규화한다. 기본 variant 선택을 보존하며 실제 고정 엔진→로컬 합성 서버에서 off/low/medium/xhigh의 parallel_tool_calls/reasoning_effort/chat_template_kwargs 전송을 확인했다.
- OpenCode 자동 승인과 네이티브 파일 수정 승인을 구분해 표시한다. 네이티브 승인에 요청 단위 자동 수정 승인을 추가했다. 프로젝트·세션·작업 세대 일치와 중지/새 요청 후 늦은 승인 거부를 검사한다. 영구 전체 수정 허용이나 명령 권한을 추가하지 않았다.

고정 OpenCode/Electron/Python/OpenViking/MCP 및 토크나이저 구성은 0.2.6과 같다. Python 패키지 버전은 유지하고, 무제한 VLM 응답 대기 런처를 포함한 새 manifest를 생성한다. 공개 배포에 실제 사용자 설정·대화·API 키를 포함하지 않는다.

검사 환경은 Debian 13.6 x86_64, Node 24.22.1, Bun 1.4.4, Python 3.12.14다. 합성 서버로 연결 중단을 재현했으며 실제 사내 모델/프록시가 연결을 끊는 원인은 사용자의 재검증이 필요하다. 모든 thinking 강도에 대한 실제 Qwen 지원을 확인했다고 주장하지 않는다. Windows 10/11 전체 수용은 미완료이며 `releaseReady: false`다.

최종 검사·실제 EXE 추출·TGZ 무결성·공개 다운로드 결과는 완료 후 추가한다.

초기 전체 검사 72개 중 71개가 통과했고, 이관 검사 하나가 서비스 준비 단계에서 실패했다. Vite 빌드와 동시 실행하던 2 CPU/8 GiB 환경이다. 빌드 종료 후 안전한 서비스 상태를 추가한 독립 진단 검사에서는 0.5.0/0.5.4 모두 ready이고 전체 이관이 약 104초에 통과했다. 검사 부하를 분리하여 최종 전체 검사를 재실행한다. 이 결과를 제품 원인 수정 또는 실제 Windows 이관 성공으로 해석하지 않는다.

실제 고정 엔진의 `/api/session/:id/compact` 요청에서 응답을 중간에 끊은 검사는 약 94.4초에 통과했다. 기존 엔진의 재시도 종료 후 사용자 기록에 LV_MODEL_UPSTREAM_RESET이 남고, 네이티브 실패 진단의 phase/body가 일치한다. 추가 호스트 재시도는 넣지 않았으며 기존 엔진 정책과 구분한다. 대기열 요청의 승인 재사용을 막기 위해 네이티브 계층이 최신 실제 사용자 메시지 ID를 확인하도록 보완했다.

사용자가 사내 LLM 대기열이 길어 시간 기준 중단을 해서는 안 된다고 명확히 요청했다. 기본 대기를 무제한으로 바꾸고 OpenViking 모델 중계의 120초 및 SDK 내부 VLM 600초 제한도 제거한다. 로컬 OpenViking 모델 처리 API는 숨은 fetch 제한 없이 기다린다. 서비스 준비·종료 확인은 별도다. 최종 검사는 185초 무응답 뒤 정상 응답과 사용자 중지의 연결 종료, 고정 SDK/HTTPX의 timeout=None을 포함한다.

대기열 대응 런처를 포함한 Python manifest: `179da3acafb3858025d8d13d2688c03dcd34b7ac1326417b4baeb4b92f7fda85`. 이전 SDK 패키지 파일과 토크나이저 구성은 유지한다.

대기열 정책 변경 전 전체 회귀 73개가 실패·건너뜀 없이 통과했다. 정책 변경 후 집중 검사 13개도 실패·건너뜀 없이 통과했다. 실제 고정 엔진에서 응답 헤더 없이 185초 기다린 뒤 정상 답변을 받았고, 두 번째 무응답 모델 요청은 사용자 interrupt로 외부 HTTP 연결이 닫혔다(해당 검사 약 191.3초). OpenViking OpenAI/HTTPX 동기·비동기 클라이언트의 timeout=None, 중복 어댑터 초기화, 무응답 JSON 연결 취소 및 리다이렉트 비추적을 확인했다.

이후 OpenViking 회귀 검사 6개가 모두 통과했다(실패·건너뜀 0). 기본 스킬 34개 등록/재시작·프로젝트 범위 검사는 약 135.4초, 실제 0.5.0→0.5.4 개인 지식 이관/두 프로젝트 조회는 약 99.8초였다. 최종 공식 Desktop 타입 검사도 2개 프로젝트·2,549개 파일 오류 0(약 37.8초), main/preload/renderer 빌드 성공이다. 원본 CSS/dynamic import/plugin timing 경고는 유지한다.

별도 SDK 검사에서 실제 동기·비동기 OpenAI 클라이언트 내부 HTTPX의 connect/read/write/pool 네 가지 timeout이 모두 None임을 확인했다(약 11.2초). 설정 객체만 검사한 결과가 아니다. 설치 EXE 검사는 ASAR 내부의 timeout/headerTimeout/chunkTimeout=false 기본값도 확인하도록 보완했다.

## 실제 설치 EXE 검사

`npm run package:win`과 `npm run audit:installer`를 완료했다. Windows 실행 수용과 구분한 Linux NSIS 추출 검사다. 자체 배포 서명은 없다.

- 파일: `L-Vibe-0.2.7-win-x64.exe`
- 크기: 1,056,737,928 bytes
- SHA-256: `2c86d33cf9a3d0953de51adf7ca61dff97cefa29d5b5e17afa092e9cc12ac7ae`
- 실제 파일/폴더: 94,210/8,740, ASAR 경로 11,584, 모두 ASCII
- ASAR SHA-256: `b83ea4bf1c3fe1e1f4b3ddc7c08cca70c81f4539902663e0e7000bc5f9e5b593`
- 실제 native control chunk에서 모델/승인 수정 marker 6개와 timeout/headerTimeout/chunkTimeout=false를 확인했다.
- OpenViking 63,069개, REA 9,019개, MCP 21,031개, 스킬 34개/259개 파일과 토크나이저 6종/인코더 7종/vendor 3파일을 전수 확인했다.

TGZ와 공개 다운로드 결과는 생성/업로드 후 기록한다. Windows 10/11·실제 사내 서버 검증은 여전히 별도다.

## 반입 TGZ 검사

`npm run bundle:offline` 및 `python3 scripts/verify-offline-bundle.py`를 완료했다. `L-Vibe-0.2.7-windows-x64.tgz`, 1,122,449,144 bytes, SHA-256 `15590f5baacbdcec1058b978e7c0fdcd6879dd5fc2668e93f25cf417bc0923af`다. 38개 항목/35개 파일 및 34개 체크섬을 대조했고, 소스 archive 548개 항목과 모든 경로가 ASCII다. 원본 소스 commit의 git archive와 포함 소스가 일치하며 설정은 실제 키 없는 배포 템플릿과 일치한다. 소스 체크포인트: `924833e321173fe20a237ab0123702a135d6fae4`. 공개 업로드/다운로드 검사는 다음 기록을 따른다.

## 공개 다운로드 검사

`python3 scripts/verify-public-downloads.py`를 완료했다. 공개 게시 커밋 `b953301`의 파일을 검사했다. TGZ는 공개 주소에서 전체 GET하여 HTTP 200·1,122,449,144 bytes·SHA-256 일치를 확인했다. EXE는 HEAD HTTP 200·크기와 range HTTP 206·첫 65,536 bytes의 PE 헤더를 확인했다. EXE 원격 전체 재다운로드는 하지 않았으며 전체 해시는 검증한 로컬 EXE와 업로드한 Git LFS object ID에 대응한다. 검사 기록은 `downloads/L-Vibe-0.2.7-public-audit.json`에 보존한다. 실제 직원 PC/사내 Qwen 서버의 재현 검증은 별도이며 releaseReady: false다.
