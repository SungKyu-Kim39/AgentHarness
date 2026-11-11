# L-Vibe 다운로드

**0.2.3 Windows x64 검증 후보**입니다. 한글 파일명 깨짐을 수정하여 배포 파일·폴더 이름을 영문 ASCII로 통일했습니다. MCP 6종·고정 브라우저·기본 스킬 34개를 포함합니다. Windows 10/11 및 실제 사내 모델 수용 검증은 남아 있습니다.

[0.2.3 설치 EXE](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.3-win-x64.exe)

[0.2.3 폐쇄망 반입 TGZ — EXE·설정 예제·소스·라이선스 포함](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.3-windows-x64.tgz)

| 파일 | bytes | SHA-256 |
|---|---:|---|
| EXE | 1,055,821,027 | [해시 파일](L-Vibe-0.2.3-win-x64.exe.sha256) |
| TGZ | 1,121,442,442 | [해시 파일](L-Vibe-0.2.3-windows-x64.tgz.sha256) |

압축을 해제하면 `GETTING_STARTED.txt`, `VALIDATION_REPORT.md`, `READINESS.json`을 확인할 수 있습니다. 한국어 UI와 안내 내용은 유지합니다. 비 ASCII 배포 경로가 들어오면 다음 빌드와 패키징이 실패하도록 검사합니다.

실제 EXE에서 추출한 **94,201개 파일·8,739개 폴더**, ASAR 내부 **11,584개 경로**가 모두 ASCII입니다. OpenViking 63,060개·REA 9,019개·MCP 21,031개·스킬 34개/259개 파일의 해시도 검사했습니다. TGZ의 전체 27개 항목/24개 파일은 모두 ASCII이며 체크섬 목록 자체를 제외한 23개 파일을 전수 대조했습니다. 포함된 L-Vibe 소스 archive의 473개 항목도 ASCII입니다. 소스 체크포인트는 `93c3df35e9c6a1000ff972148de6aac99d29c9c9`입니다.

[설치 안내](../docs/offline-setup.md) · [0.2.3 검증 보고서](../docs/validation-0.2.3.md) · [실제 EXE 검사 기록](L-Vibe-0.2.3-runtime-audit.json) · [TGZ 검사 기록](L-Vibe-0.2.3-bundle-audit.json)

게시 커밋 `b6315e6da768755d55ca2c16215c623a8b2a0c1d`의 공개 EXE/TGZ 주소에서 **HTTP 200**을 확인하고 두 파일 전체를 스트리밍하여 크기·SHA-256을 다시 계산했습니다. 로컬 산출물 및 Git LFS object ID와 일치합니다. [공개 다운로드 검사 기록](L-Vibe-0.2.3-public-audit.json)을 참고하세요.

설치 후 `settings.enc.json`만 있다면 기존 설정을 보존했거나 최초 가져오기가 끝난 상태입니다. `config-import.json`은 임시 파일이며 자동 삭제합니다. [설정 복구·교체 안내](../docs/configuration-recovery.md)에 재설치 없는 변경 방법을 정리했습니다.

자체 코드는 MIT이며 전체 묶음의 라이선스는 복수입니다. [라이선스 정책 재검토](../docs/license-policy.md)에 GPL/AGPL/LGPL·스킬·Chrome/MSVC의 조건과 미확인 항목을 기록했습니다. 이 두 안내는 0.2.3 게시 후 추가한 저장소 문서이며 기존 EXE/TGZ 바이트는 변경하지 않았습니다.

Serena/clangd·Git·Playwright·MarkItDown·Chrome DevTools·DuckDB를 통제된 로컬 도구로 제공합니다. 기본 스킬은 임베딩 JSON 설정 후 최초 실행에서 OpenViking skills에 자동 등록하며, 변경 없는 재실행의 중복 색인과 사용자 편집본 덮어쓰기를 방지합니다.

파일은 Git LFS로 저장합니다. 위 링크로 다운로드할 때 Git LFS 설치는 필요하지 않습니다. 소스를 clone하여 실제 바이너리도 받으려면 Git LFS가 필요하며 작은 pointer 파일을 설치본으로 사용하지 마세요.

이전 0.2.2는 같은 기능이지만 TGZ 안내 파일에 한글 이름을 사용합니다. 파일명 깨짐을 피하려면 0.2.3을 사용하세요. 0.2.1은 스킬 34개/자동 등록이 있지만 새 MCP 6종은 없습니다. 0.2.0은 스킬 18개이며 자동 등록 기능이 없습니다. 이전 파일은 같은 폴더에 보존합니다.
