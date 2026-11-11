# L-Vibe 다운로드

**Windows OpenViking 시작 오류 수정:** 0.2.4 전체 설치본에 asyncio 내부 loopback 충돌 수정을 포함했습니다. 기존 0.2.2/0.2.3 설치본에는 [오프라인 수정 패치 (약 3.2 MB)](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-openviking-loopback-fix-1.tgz)를 사용할 수 있습니다. 압축 해제 후 앱을 종료하고 `APPLY_FIX.cmd`를 실행합니다. [적용 안내](../docs/openviking-windows-loopback-fix.md) · [체크섬](L-Vibe-openviking-loopback-fix-1.tgz.sha256) · [검사 기록](L-Vibe-openviking-loopback-fix-1-audit.json). 0.2.4에는 별도 패치가 필요하지 않습니다.

**0.2.4 Windows x64 검증 후보**입니다. OpenViking 시작 수정·안전한 단계별 진단을 포함하며 배포 파일·폴더 이름은 영문 ASCII입니다. MCP 6종·고정 브라우저·기본 스킬 34개를 포함합니다. 사용자 Windows의 패치 적용 후 결과, Windows 10/11 전체 수용 및 실제 사내 모델 검증은 별도입니다.

[0.2.4 설치 EXE](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.4-win-x64.exe)

[0.2.4 폐쇄망 반입 TGZ — EXE·설정 예제·진단·복구·소스·라이선스 포함](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.4-windows-x64.tgz)

| 파일 | bytes | SHA-256 |
|---|---:|---|
| EXE | 1,055,825,166 | [해시 파일](L-Vibe-0.2.4-win-x64.exe.sha256) |
| TGZ | 1,121,480,970 | [해시 파일](L-Vibe-0.2.4-windows-x64.tgz.sha256) |

압축을 해제하면 `GETTING_STARTED.txt`, `VALIDATION_REPORT.md`, `READINESS.json`을 확인할 수 있습니다. 한국어 UI와 안내 내용은 유지합니다. 비 ASCII 배포 경로가 들어오면 다음 빌드와 패키징이 실패하도록 검사합니다.

`CONFIGURATION_RECOVERY.txt`, `LICENSE_POLICY.txt`, `WINDOWS_DIAGNOSTICS.txt`와 `CHECK_OPENVIKING.cmd`/모듈 검사 스크립트도 함께 제공합니다. 설치 후 추가 다운로드 없이 진단할 수 있습니다. 새 전체 EXE의 안전한 시작 진단은 `%APPDATA%\L-Vibe\openviking\startup-status.json`에 기록합니다. 이 기록에 실제 키·Python 원래 출력·모델 요청/응답을 넣지 않습니다.

실제 EXE에서 추출한 **94,201개 파일·8,739개 폴더**, ASAR 내부 **11,584개 경로**가 모두 ASCII입니다. OpenViking 63,060개·REA 9,019개·MCP 21,031개·스킬 34개/259개 파일의 해시도 검사했습니다. TGZ의 전체 33개 항목/30개 파일은 모두 ASCII이며 체크섬 목록 자체를 제외한 29개 파일을 전수 대조했습니다. 포함된 L-Vibe 소스 archive의 496개 항목도 ASCII입니다. 소스 체크포인트는 `0976c3eba95c4d21015b97856e9d415d1c4dbbe2`입니다.

[설치 안내](../docs/offline-setup.md) · [0.2.4 검증 보고서](../docs/validation-0.2.4.md) · [실제 EXE 검사 기록](L-Vibe-0.2.4-runtime-audit.json) · [TGZ 검사 기록](L-Vibe-0.2.4-bundle-audit.json)

설치 후 `settings.enc.json`만 있다면 기존 설정을 보존했거나 최초 가져오기가 끝난 상태입니다. `config-import.json`은 임시 파일이며 자동 삭제합니다. [설정 복구·교체 안내](../docs/configuration-recovery.md)에 재설치 없는 변경 방법을 정리했습니다.

자체 코드는 MIT이며 전체 묶음의 라이선스는 복수입니다. [라이선스 정책 재검토](../docs/license-policy.md)에 GPL/AGPL/LGPL·스킬·Chrome/MSVC의 조건과 미확인 항목을 기록했습니다. 0.2.4에는 복구·라이선스·진단 안내도 TGZ 안에 포함합니다.

Serena/clangd·Git·Playwright·MarkItDown·Chrome DevTools·DuckDB를 통제된 로컬 도구로 제공합니다. 기본 스킬은 임베딩 JSON 설정 후 최초 실행에서 OpenViking skills에 자동 등록하며, 변경 없는 재실행의 중복 색인과 사용자 편집본 덮어쓰기를 방지합니다.

파일은 Git LFS로 저장합니다. 위 링크로 다운로드할 때 Git LFS 설치는 필요하지 않습니다. 소스를 clone하여 실제 바이너리도 받으려면 Git LFS가 필요하며 작은 pointer 파일을 설치본으로 사용하지 마세요.

이전 0.2.3은 ASCII 이름을 사용하지만 Windows OpenViking loopback 수정이 기본 포함되어 있지 않습니다. 0.2.2는 TGZ 안내 파일에 한글 이름도 사용합니다. 기존 0.2.2/0.2.3에는 위 작은 패치를 사용하거나 0.2.4로 업데이트하세요. 0.2.1은 MCP 6종이 없으며 0.2.0은 기본 스킬 자동 등록도 없습니다. 이전 파일은 같은 폴더에 보존합니다.
