# L-Vibe 다운로드

**0.2.6 Windows x64 검증 후보**입니다. 기존 OpenViking 0.5.0의 사용자 지식을 가져와 모든 프로젝트에서 개인 공통 기억으로 읽기 전용 검색하는 기능을 추가했습니다. 기존 모델 설정과 사용자 데이터는 유지합니다. MCP 6종·고정 브라우저·기본 스킬 34개 및 이전 Windows loopback/토크나이저 수정을 포함합니다.

[0.2.6 설치 EXE](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.6-win-x64.exe)

[0.2.6 폐쇄망 반입 TGZ — EXE·설정·내보내기·이관 안내·진단·소스·라이선스 포함](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-0.2.6-windows-x64.tgz)

| 파일 | bytes | SHA-256 |
|---|---:|---|
| EXE | 1,056,739,808 | [해시 파일](L-Vibe-0.2.6-win-x64.exe.sha256) |
| TGZ | 1,122,446,227 | [해시 파일](L-Vibe-0.2.6-windows-x64.tgz.sha256) |

## 기존 개인 지식 이관

1. [작은 내보내기 도구 ZIP — 4,350 bytes](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/L-Vibe-personal-export-1.zip)을 쓰기 가능한 폴더에 해제합니다. 현재 L-Vibe 0.2.x의 번들 Python으로도 실행할 수 있습니다.
2. 기존 OpenViking을 실행한 채 EXPORT_PERSONAL.cmd를 실행합니다. 기본 주소는 http://127.0.0.1:1935, account/user는 default입니다. 인증이 있으면 기존 로컬 OpenViking 서버 키를 PC에서 입력합니다. 사내 LLM/임베딩 키와 구분합니다.
3. status가 exported/EXIT_CODE=0이면 OVPack과 SHA 파일을 PC에 보관합니다. 사용자 자료와 키는 지원 채팅/공개 GitHub에 보내지 않습니다.
4. L-Vibe를 완전히 종료하고 0.2.6으로 업데이트합니다. 저장된 모델·임베딩 설정은 유지하며 이관용 JSON 항목을 추가할 필요는 없습니다.
5. 알림 영역 L-Vibe 우클릭 → **개인 공통 지식 가져오기 (.ovpack)**에서 파일을 선택하고 원본 영역·파일 수·SHA를 확인한 뒤 승인합니다.
6. **개인 공통 지식 가져오기 상태**와 실제 personal_knowledge_search/personal_knowledge_read 도구 결과를 확인합니다.

가져온 memories/resources/정적 skills/peer memories만 개인 도구로 조회합니다. 원본 서버는 유지하고 승인한 OVPack 사본과 상태를 보존합니다. 세션 원문·privacy 관리 자료는 개인 검색에서 제외하며 새 대화를 자동 업로드하지 않습니다. 기존 대상은 자동 덮어쓰지 않고, 벡터는 SDK가 호환성을 확인하여 재사용하거나 재계산합니다. [이관 절차·제한·복구 안내](../docs/openviking-personal-migration.md) · [내보내기 ZIP 해시](L-Vibe-personal-export-1.zip.sha256) · [내보내기 도구 검사 기록](L-Vibe-personal-export-1-audit.json).

내보내기 도구는 공개 HTTP 200·전체 4,350 bytes·SHA-256 일치를 확인했습니다. 0.2.5 이하에는 가져오기 메뉴와 개인 공통 검색 도구가 없습니다.

## 포함 파일과 검사

GETTING_STARTED.txt, VALIDATION_REPORT.md, READINESS.json, PERSONAL_KNOWLEDGE_MIGRATION.txt, CONFIGURATION_RECOVERY.txt, LICENSE_POLICY.txt, WINDOWS_DIAGNOSTICS.txt와 CHECK_OPENVIKING.cmd/EXPORT_PERSONAL.cmd 및 Python 스크립트를 포함합니다. 직원 PC 추가 설치·다운로드 없이 사용합니다. 실제 모델 가중치는 포함하지 않으며 사내 모델 API가 필요합니다.

최종 회귀 검사 **64개 통과/실패·건너뜀 0**. 실제 OpenViking 0.5.0 → 0.5.4 내보내기·가져오기, SDK 벡터 복원 결정, 두 프로젝트의 개인 검색/원문 읽기·재시작 및 다른 사용자의 쓰기 거부를 Linux의 합성 자료·모델로 확인했습니다. 실제 직원 PC 자료 이관과 Windows 10/11 전체 수용은 별도이며 `releaseReady: false`입니다.

실제 EXE 추출 **94,210개 파일/8,740개 폴더**, ASAR **11,584개 경로**가 ASCII입니다. OpenViking **63,069개**·REA **9,019개**·MCP **21,031개**·스킬 **34개/259개 파일**의 전수 해시를 확인했습니다. 토크나이저 6종/인코더 7종과 LiteLLM vendor 3파일도 공식 해시와 일치합니다. TGZ **37개 항목/34개 파일**, 소스 archive **535개 항목**도 ASCII이며 체크섬 목록을 제외한 **33개 파일**을 전수 대조했습니다. 소스 체크포인트는 `8ffa36ea3baec751af55b3f4ab02dfe3274132ef`입니다.

[설치 안내](../docs/offline-setup.md) · [0.2.6 검증 보고서](../docs/validation-0.2.6.md) · [EXE 검사 기록](L-Vibe-0.2.6-runtime-audit.json) · [TGZ 검사 기록](L-Vibe-0.2.6-bundle-audit.json)

## 설정과 이전 버전

설치 후 settings.enc.json만 있는 상태는 예상된 상태입니다. config-import.json은 암호화 저장 후 삭제하는 임시 파일입니다. 저장 설정 교체는 알림 영역의 **모델 설정 JSON 가져와 교체 후 재시작**으로 진행합니다. [설정 복구 안내](../docs/configuration-recovery.md).

자체 코드는 MIT이며 전체 번들은 복수 라이선스를 따릅니다. [라이선스 검토](../docs/license-policy.md)의 GPL/AGPL/LGPL·스킬·Chrome/MSVC 조건과 미확인 항목을 확인하세요.

파일은 **work/downloads의 Git LFS**로 보존합니다. GitHub Releases 게시와 구분합니다. 위 링크로 받는 경우 Git LFS 설치는 필요하지 않습니다. 소스 clone의 작은 LFS pointer 파일을 설치본으로 사용하지 마세요.

이전 버전과 검사 기록은 보존합니다. 0.2.5에는 토크나이저·loopback 수정이 있지만 개인 지식 가져오기는 없습니다. 0.2.4 및 이전 시작 오류에는 [이전 누적 토크나이저 패치](../docs/openviking-tokenizer-fix.md)가 제공되며 새 0.2.6에는 별도 패치가 필요하지 않습니다.
