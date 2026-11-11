# OpenViking offline tokenizer repair

2026-11-11 KST. 0.2.2/0.2.3/0.2.4의 OpenViking import가 `cl100k_base.tiktoken` 다운로드를 시도하는 문제를 고치는 누적 오프라인 패치다. Windows 내부 socketpair 수정도 함께 포함한다.

## 확인한 원인

사용자 Windows 출력에서 `openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken` 요청과 외부 DNS 차단을 확인했다. Python 패키지 설치만으로 토크나이저 데이터의 오프라인 사용을 보장하지 못했다.

고정 LiteLLM 1.102.4 wheel의 rank 데이터 3개는 CRLF였다. 예를 들어 cl100k cache의 SHA-256은 `59d2daf6609eaece5e7c81dca8f275226a54ee4644913ba9995cc6093ea3a8b7`인데 tiktoken 0.14.0이 요구하는 공식 데이터 해시는 `223921b76ee99bde995b7ff738513eef100fb51d18c93597a113bcffe865b2a7`이다. tiktoken은 잘못된 캐시를 삭제한 뒤 외부 다운로드를 시도한다. LiteLLM이 `TIKTOKEN_CACHE_DIR`를 자신의 디렉터리로 덮어쓰는 경로도 확인했다. 기존 Linux 검증 환경의 해당 cache는 이미 올바른 LF 데이터였으므로 이 Windows 새 설치 경로를 놓쳤다.

## 수정 범위

- 공식 constructor의 URL/SHA-256과 일치하는 데이터 **6개, 총 8,465,407 bytes**로 인코더 **7종**을 포함한다. 모델 가중치를 추가하지 않는다.
- 원본 URL/해시, 같은 바이트를 제공하는 공개 패키지 archive의 URL/해시, 라이선스와 출처를 `tokenizer-runtime-lock.json` 및 `tokenizers/assets.json`에 남긴다. 빌드 PC만 자료를 확보하며 직원 PC에서 다운로드하지 않는다.
- app 전용 cache를 검증한 뒤 `TIKTOKEN_CACHE_DIR`와 `CUSTOM_TIKTOKEN_CACHE_DIR`를 함께 지정한다. 고정 데이터만 읽는 loader를 사용하여 누락·손상·미등록 데이터는 **온라인 fallback 없이** 오류로 처리한다.
- LiteLLM 안의 cl100k/p50k/o200k 파일도 공식 해시와 같은 LF bytes로 교체한다. 기존 실행이 삭제한 알려진 cache도 복구한다. 모델 주소·키·등록 ID를 바꾸는 수정이 아니다.
- tiktoken MIT와 GPT-2 원본 Modified MIT 고지를 보존한다. GPT-2 어휘 자료는 정적 토큰 계산용이며 GPT-2 생성 모델을 탑재하지 않는다. 전체 번들의 기존 라이선스 검토 미확인 항목은 유지한다.

## 기존 설치본 적용

1. L-Vibe를 완전히 종료한다.
2. `L-Vibe-openviking-tokenizer-fix-1.tgz`를 반입하고 별도 폴더에 압축 해제한다.
3. **APPLY_FIX.cmd**를 실행한다. `applied` 또는 `already-applied`를 확인한다.
4. **CHECK_IMPORT.cmd**를 실행하여 `OPENVIKING_IMPORT_OK`, `TOKENIZERS_OK 7`, `EXIT_CODE=0`을 확인한 뒤 앱을 다시 실행한다.

이 패치에 이전 loopback 수정도 들어 있으므로 첫 패치를 따로 반복할 필요가 없다. 지원 원본 manifest는 `8d2fbf5aef25d431433feb5f34f09cbf908c025476cb7ac024f6e3674b473a3d`와 `42f101caef4f976cc20bc3df5f1b3a25356f1a75d3f0297b79af77379733c901`이다. 새 Python manifest는 `17b94d19b5cd9efe52c68d0c339682e1fb144fb6e2d7900a607221ad9847d70b`다. 암호화 설정·대화·프로젝트·지식 데이터는 읽거나 수정하지 않는다. 런타임 복구 사본은 `%APPDATA%\L-Vibe\openviking\patch-backups`에 보관한다.

모듈 검사 성공은 실제 사내 모델 인증·기존 지식 DB·전체 서비스 시작 성공을 대신하지 않는다. 실패하면 마지막 오류/EXIT_CODE를 확인하며 API 키나 설정 JSON을 지원 채팅/공개 저장소에 보내지 않는다. 최종 파일·해시·게시 정보는 [다운로드 안내](../downloads/README.md)를 따른다.

## 검증

동일 수정 소스의 `npm run verify`는 **58개 통과, 실패·건너뜀 0**이다. 별도 installer audit 3개 검사도 통과했다. 빈 HOME·TEMP, 잘못된 상속 cache와 외부 HTTP/DNS 차단 상태에서 **SDK를 먼저 import**하고 인코더 7종의 한글 round-trip을 검사했다. 검사한 Python HTTP/DNS/소켓 경로의 외부 요청 시도는 **0건**이다. 누락/손상/미등록 데이터를 로컬 오류로 거부하고 온라인 재시도나 손상 파일 삭제를 하지 않는 것도 확인했다.

누적 패치의 삭제된 cache 복구, 이전 base, 변조/알 수 없는 설치본 거부, 중단 상태 재개, 반복 적용, manifest 쓰기 실패 시 rollback과 사용자 데이터 보존을 실제 임시 파일로 검사했다. Windows의 실제 패치 적용/재시작 결과는 별도로 확인하며 Linux 재현을 Windows 실행 수용으로 계산하지 않는다.

실제 패치 파일 21개/23개 항목의 내용·ASCII 이름과 생성한 복구 코드의 적용/반복 적용을 확인했다. 원본 manifest에서 데이터 파일 1개가 삭제된 상태에 실제 패치를 적용하여 런타임 13개 파일과 새 manifest를 복구했다. 설정 보존도 확인했다. 생성 소스는 `32fb2bc52bff994cfb99fba3647138a3c9e56a0d`, TGZ는 **10,535,142 bytes**, SHA-256 `f651f2e9282e53ceb587637a1f41f5cefba5ac5e62cc00cb473bb0903e4b9e86`이다. 이는 Windows에서 실제 패치를 실행한 검사를 뜻하지 않는다.
