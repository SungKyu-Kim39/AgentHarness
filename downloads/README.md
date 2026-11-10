# L-Vibe 다운로드

**0.2.2 Windows x64 검증 후보**입니다. MCP 6종·고정 브라우저·기본 스킬 34개를 포함합니다. Windows 10/11 및 실제 사내 모델 수용 검증은 남아 있습니다.

[0.2.2 설치 EXE](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.2-win-x64.exe)

[0.2.2 폐쇄망 반입 TGZ — EXE·설정 예제·소스·라이선스 포함](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.2-windows-x64.tgz)

| 파일 | bytes | SHA-256 |
|---|---:|---|
| EXE | 1,055,821,574 | [해시 파일](L-Vibe-0.2.2-win-x64.exe.sha256) |
| TGZ | 1,121,427,289 | [해시 파일](L-Vibe-0.2.2-windows-x64.tgz.sha256) |

EXE를 직접 추출해 OpenViking 63,060개·REA 9,019개·MCP 21,031개·스킬 34개/259개 파일의 해시를 검사했습니다. TGZ 내부 23개 파일의 체크섬과 대응 소스도 대조했습니다. 소스 체크포인트는 `b8722666e20e0525d320e636f5b41e689e2879b3`입니다. 공개 다운로드 두 주소 모두 HTTP 200, 전체 바이트 수와 SHA-256이 로컬 산출물과 일치함을 확인했습니다.

[설치 안내](../docs/offline-setup.md) · [0.2.2 검증 보고서](../docs/validation-0.2.2.md) · [실제 EXE 검사 기록](L-Vibe-0.2.2-runtime-audit.json)

Serena/clangd·Git·Playwright·MarkItDown·Chrome DevTools·DuckDB를 통제된 로컬 도구로 제공합니다. 기본 스킬은 임베딩 JSON 설정 후 최초 실행에서 OpenViking skills에 자동 등록하며, 변경 없는 재실행의 중복 색인과 사용자 편집본 덮어쓰기를 방지합니다.

파일은 Git LFS로 저장합니다. 위 링크로 다운로드할 때 Git LFS 설치는 필요하지 않습니다. 소스를 clone하여 실제 바이너리도 받으려면 Git LFS가 필요하며 작은 pointer 파일을 설치본으로 사용하지 마세요.

이전 0.2.1 EXE/TGZ는 같은 폴더에 유지합니다. 스킬 34개와 자동 등록이 있지만 새 MCP 6종은 없습니다. 이전 0.2.0은 스킬 18개이며 자동 등록 기능이 없습니다.
