# L-Vibe 다운로드

**0.2.5 Windows x64 검증 후보**입니다. OpenViking Windows asyncio loopback 수정과 토크나이저 데이터 6종/인코더 7종·외부 다운로드 없는 로더를 포함합니다. MCP 6종·고정 브라우저·기본 스킬 34개를 제공합니다. 배포 파일·폴더와 포함 앱 소스 경로는 ASCII입니다.

[0.2.5 설치 EXE](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.5-win-x64.exe)

[0.2.5 폐쇄망 반입 TGZ — EXE·설정 예제·진단·복구·소스·라이선스 포함](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.5-windows-x64.tgz)

| 파일 | bytes | SHA-256 |
|---|---:|---|
| EXE | 1,056,735,627 | [해시 파일](L-Vibe-0.2.5-win-x64.exe.sha256) |
| TGZ | 1,122,400,157 | [해시 파일](L-Vibe-0.2.5-windows-x64.tgz.sha256) |

기존 0.2.2/0.2.3/0.2.4 설치본은 [누적 토크나이저 패치 — 약 10.5MB](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-openviking-tokenizer-fix-1.tgz)로 재설치 없이 복구할 수 있습니다. 앱 종료 → 새 폴더에 압축 해제 → APPLY_FIX.cmd → CHECK_IMPORT.cmd 순서입니다. 이전 loopback 수정과 삭제된 cache 복구를 포함하므로 첫 패치를 따로 반복하지 않습니다. **0.2.5에는 두 수정이 기본 포함됩니다.** [적용 안내](../docs/openviking-tokenizer-fix.md) · [패치 해시](L-Vibe-openviking-tokenizer-fix-1.tgz.sha256) · [패치 검사 기록](L-Vibe-openviking-tokenizer-fix-1-audit.json).

사용자는 누적 패치 적용과 L-Vibe 실행 성공을 확인했습니다. 후속 모델 설정 표시 문제는 별도 확인 중이며, 실제 사내 모델 응답·Windows 10/11 전체 수용을 완료한 1.0으로 표시하지 않습니다. `releaseReady: false`입니다.

압축을 해제하면 `GETTING_STARTED.txt`, `VALIDATION_REPORT.md`, `READINESS.json`을 확인할 수 있습니다. `CONFIGURATION_RECOVERY.txt`, `LICENSE_POLICY.txt`, `WINDOWS_DIAGNOSTICS.txt`와 `CHECK_OPENVIKING.cmd`/모듈 검사 스크립트도 제공합니다. 한국어 UI와 안내 내용은 유지하며 직원 PC 추가 설치·다운로드는 요구하지 않습니다.

새 전체 EXE의 안전한 시작 진단은 `%APPDATA%\L-Vibe\openviking\startup-status.json`에 단계·코드만 기록합니다. 실제 키·Python 원래 출력·모델 요청/응답을 넣지 않습니다.

실제 EXE 추출 **94,210개 파일/8,740개 폴더**, ASAR 내부 **11,584개 경로**가 ASCII입니다. OpenViking **63,069개**·REA **9,019개**·MCP **21,031개**·스킬 **34개/259개 파일**의 전수 해시를 검사했습니다. 토크나이저 6종과 LiteLLM vendor 3파일은 공식 해시에 별도 대조했습니다. TGZ **34개 항목/31개 파일**, 소스 archive **515개 항목**도 ASCII이며 체크섬 목록을 제외한 **30개 파일**을 전수 대조했습니다. 소스 체크포인트는 `e031bb8ce8acccf291d5f9f6404b6e29e713d012`입니다.

[설치 안내](../docs/offline-setup.md) · [0.2.5 검증 보고서](../docs/validation-0.2.5.md) · [EXE 검사 기록](L-Vibe-0.2.5-runtime-audit.json) · [TGZ 검사 기록](L-Vibe-0.2.5-bundle-audit.json)

설치 후 `settings.enc.json`만 있는 상태는 예상된 상태입니다. `config-import.json`은 암호화 저장 후 삭제하는 임시 파일입니다. 저장 설정은 설치 폴더의 JSON을 편집하는 것만으로 바뀌지 않습니다. 작업표시줄 알림 영역 L-Vibe 우클릭 → **모델 설정 JSON 가져와 교체 후 재시작**에서 실제 JSON을 선택하세요. 전체 설정을 교체하므로 기존 LLM과 OpenViking 임베딩도 함께 넣습니다. 모델 목록이 비어 있는 경우와 선택/요청 실패는 구분하며 암호화 설정을 삭제하지 않습니다. [설정 복구 안내](../docs/configuration-recovery.md).

자체 코드는 MIT이며 전체 번들은 복수 라이선스를 따릅니다. tiktoken MIT/GPT-2 Modified MIT 원문도 보존합니다. [라이선스 재검토](../docs/license-policy.md)의 GPL/AGPL/LGPL·스킬·Chrome/MSVC 조건과 미확인 항목을 확인하세요.

파일은 **work/downloads의 Git LFS**로 보존합니다. GitHub Releases 게시와 구분합니다. 위 링크로 다운로드할 때 Git LFS 설치는 필요하지 않습니다. 소스를 clone하여 실제 바이너리도 받으려면 Git LFS가 필요하며 작은 pointer 파일을 설치본으로 사용하지 마세요.

이전 0.2.4에는 loopback 수정만 있어 새 토크나이저 패치가 필요합니다. 0.2.2/0.2.3에도 새 누적 패치를 사용하세요. 0.2.2는 일부 한글 TGZ 파일명이 있어 압축 해제 문제가 보고됐으며 0.2.3부터 ASCII를 사용합니다. 0.2.1은 MCP 6종이 없고 0.2.0은 기본 스킬 자동 등록도 없습니다. 이전 파일과 검사 기록은 같은 폴더에 보존합니다.
