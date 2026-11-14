# Ned 라이선스 정책

Ned 자체 코드는 MIT로 배포합니다. 함께 제공하는 Zed, OpenViking, 개발 도구에는 각 프로젝트의 라이선스가 적용됩니다. 따라서 설치 묶음 전체를 MIT 소프트웨어로 취급할 수는 없습니다. 이 문서는 구성 요소별 조건과 아직 확인이 필요한 항목을 정리한 기록입니다.

## 현재 편집기와 도구에 적용되는 조건

**Zed v1.28.1은 주로 GPL-3.0-or-later이며, 명시된 일부 구성 요소에는 Apache-2.0이 적용됩니다.** Ned는 공식 Windows 바이너리를 바탕으로 관리형 편집기를 구성합니다. 0.3.3부터 작업표시줄 아이콘에 필요한 Windows 리소스만 교체하며, 실행 코드와 공급자 버전 정보는 보존합니다. 수정본에는 원본 서명이 유지되지 않습니다. 반입 묶음에는 고정 태그의 대응 소스, GPL·Apache 원문, 제3자 고지와 함께 원본·수정본 해시, 변경 스크립트, 아이콘을 제공합니다. Ned 글자 아이콘은 별도로 생성했으며, 코드 라이선스와 타사 상표 사용권은 구분합니다.

OpenCode 엔진과 ACP 코드는 MIT입니다. Zed와는 로컬 ACP로 연결합니다. OpenViking의 AGPL, Serena·Git·DLL·브라우저의 개별 조건도 계속 적용됩니다. 대응 소스는 폐쇄망 수령인이 직접 이용할 수 있도록 반입 자료에 포함해야 합니다. 인터넷 링크만 제공하는 방식으로 대신하지 않습니다.

Ned로 업무 프로젝트를 개발하거나 개인 대화를 주고받았다는 사실만으로 해당 자료가 공개 대상이 되지는 않습니다. 소스 제공 의무는 실제 수정·결합·전달 형태와 해당 라이선스의 적용 범위를 기준으로 판단합니다.

**agent-desktop 1.2.0은 Apache-2.0입니다.** 고정 Windows 바이너리와 같은 커밋의 원문 라이선스와 대응 소스를 반입 묶음에 제공합니다. MSVC 의존성에는 기존에 고정한 CPython 배포본의 `vcruntime140.dll`을 사용하고, 같은 폴더에 `LICENSE.CPython-Windows.txt`를 둡니다. DLL에는 원래 조건이 적용되며, Microsoft 재배포 자격 확인도 별도로 필요합니다. 당시 함께 추가한 기본 스킬 2개에도 출처·라이선스·변경 고지를 유지하고 오프라인 호스트 어댑터를 제공합니다.

0.3.7에서는 실행에 필요하지 않은 소스 아카이브를 설치 리소스에서 TGZ의 `source/`로 옮겼습니다. 원래 경로와 해시는 `runtime-optimization.json`에 기록합니다. 설치 공간을 줄이기 위한 배치 변경이며, 대응 소스를 함께 전달해야 한다는 조건은 그대로입니다.

아래는 공통 런타임의 상세 검토 기록입니다. Chrome 바이너리 재배포 조건과 MSVC DLL 배포 주체의 자격 등 남은 항목도 함께 확인해야 합니다.

---

# 기존 공통 런타임 라이선스 검토 기록

검토일: 2026-11-11 KST. 대상은 **0.2.3/0.2.4 및 같은 실행 구성 요소 버전을 사용하는 0.2.5/0.2.6 후보**의 고정 런타임·스킬과 저장소 소스입니다. 패키지 메타데이터뿐 아니라 설치에 포함된 라이선스 원문·소스 고지·빌드 스크립트를 대조했습니다. 0.2.5는 정적 토크나이저 어휘 자료와 그 고지, L-Vibe launcher/호스트·진단·배포 안내를 추가/수정합니다. 이 문서는 전체 의존성의 법적 적합성 인증이 아니며 현재 미확인 항목을 함께 기록합니다.

## 적용 정책

L-Vibe가 작성한 코드에는 루트 [MIT 라이선스](../LICENSE)를 적용합니다. 번들 전체를 MIT로 재허가하지 않습니다. OpenCode·라이브러리·스킬·브라우저·DLL·로고는 각 권리자 조건을 유지합니다. 코드의 MIT 허가는 LIG 명칭·로고의 상표/브랜드 사용권을 부여하지 않습니다.

기업 내부에서 사용하는 행위와 계열사·협력사·고객·공개 저장소에 재배포하는 행위는 구분합니다. 폐쇄망이라는 이유로 GPL/AGPL·재배포 약정이 사라지지 않습니다. 적용 범위는 법인 경계·실제 수정/결합 방식·전달 대상에 따라 판단합니다.

MIT/GPL/AGPL 등 위 오픈소스 라이선스는 조건을 지키는 기업·상업적 이용을 허용합니다. 소스 제공·고지·재배포 의무와 별도 상용 바이너리의 약정은 함께 확인합니다.

단순히 이 도구로 개발했다는 이유로 사용자의 업무 프로젝트·대화·API 키를 인터넷에 공개해야 하는 것은 아닙니다. 소스 제공 의무는 해당 라이선스가 적용되는 프로그램·수정본·결합물의 범위를 따집니다. 프로그램 사용·출력과 라이선스가 적용되는 원본 코드를 복사해 제품에 넣는 행위는 각각 검토합니다. 사내 모델 서비스의 이용 조건도 별도입니다.

## 확인한 주요 구성 요소

| 구성 | 확인한 라이선스 | 유지할 조건/근거 |
|---|---|---|
| L-Vibe 자체 코드, OpenCode Desktop/CLI 2.2.6 | MIT | 저작권·허가문 유지. OpenCode 원문은 TGZ `licenses/OpenCode-LICENSE`, 버전/커밋은 `upstream-lock.json` |
| Electron 44.9.1, Node/Python 및 포함 라이브러리 | MIT/PSF 및 구성 요소별 고지 | Electron의 Chromium 등 하위 구성은 별도 고지. 포함된 라이선스/credits를 보존 |
| OpenViking 0.5.4 | **AGPL-3.0** | 해당 프로그램의 배포·수정·대응 소스 조건. 수정 버전을 네트워크로 제공하면 13조의 소스 접근 제안도 검토 |
| tiktoken 0.14.0 및 고정 토크나이저 데이터 | MIT, GPT-2 원본 어휘는 **Modified MIT** | `tokenizers/LICENSE.tiktoken.txt`와 `LICENSE.gpt2.txt` 원문·공식 데이터 SHA-256/미러 출처 유지. 정적 토큰 계산 자료이며 GPT-2 생성 모델 가중치를 탑재하지 않음 |
| Serena 2.1.0 | **GPL-3.0-or-later** | 해당 프로그램·수정분의 대응 소스/빌드·설치 자료와 GPL 고지 |
| MinGit 2.56.0.windows.4 | **GPL-2.0** 및 하위 구성별 조건 | Git 원문 `runtime/windows-x64/mcp/git/LICENSE.txt`, 대응 소스 보존. 하위 DLL/도구도 각각 검토 |
| Graphify 0.9.105 | Apache-2.0 | 저작권·라이선스·관련 NOTICE 및 수정 고지 |
| REA 6.8.0 | 자체 코드는 MIT | `rea/THIRD_PARTY_NOTICES.md`의 하위 구성 별도. 실제 포함된 Frida는 LGPL-2.0 WITH WxWindows-exception-3.1, OpenPGP.js는 LGPL-3.0+ |
| Playwright MCP, Chrome DevTools MCP, Conductor | Apache-2.0 | 원문·관련 고지/수정 표시 유지 |
| MarkItDown/MCP, Git MCP, DuckDB/로컬 MotherDuck MCP | MIT | 실제 wheel의 dist-info 원문과 저작권 유지. MotherDuck 클라우드 서비스의 이용 허가를 의미하지 않음 |
| Aegis 및 기본 스킬 다수 | MIT 또는 Apache-2.0 | `vendor/skills/manifest.json`과 각 스킬 LICENSE/ADAPTATION 원문 유지 |
| Trail of Bits `differential-review` 스킬 | **CC-BY-SA-4.0** | 출처·변경 표시와 해당 각색 문서의 동일조건변경허락. 앱의 MIT로 재표기하지 않음 |
| CairoSVG / pystray 등 | **LGPL-3.0-or-later / LGPLv3** 등 | 실제 배포 형태에 따른 소스 제공·교체 가능성·재결합 조건 검토 |
| Chrome for Testing 157.0.8103.50 | Google Chrome 조건 + Chromium/제3자 고지 | `browser/chrome-win64/ABOUT`은 Google 저작권과 `chrome://terms`, `chrome://credits`를 지시함. Chromium의 오픈소스 허가만으로 전체 Chrome 바이너리 재배포 허가를 확정하지 않음 |
| MSVC runtime 14.51.36231 | Microsoft Distributable Code 조건 | 첨부 문구는 적법한 Visual Studio 라이선스와 원형 재배포 조건을 명시. wheel 다운로드 가능 여부와 재배포 자격은 별개 |

표의 설치 상대 경로는 `%LOCALAPPDATA%\Programs\L-Vibe\resources\` 아래입니다. 스킬 원문과 manifest는 `resources/l-vibe/skills`에 포함합니다. 원형 0.1의 `vendor/THIRD_PARTY_NOTICES.md`·`vendor-lock.json` 상단만으로 현재 Desktop 번들의 라이선스를 판정하지 않습니다.

## 포함된 대응 소스와 고지

- OpenViking 원본 대응 소스: TGZ `licenses/OpenViking-0.5.4-corresponding-source.tar.gz`와 앱 리소스 `runtime/windows-x64/openviking/licenses/openviking-0.5.4-source.tar.gz`.
- Serena/Git 원본 소스: 앱 리소스 `runtime/windows-x64/mcp/licenses/serena-agent-2.1.0-source.tar.gz`, `git-for-windows-2.56.0.windows.4-source.tar.gz`. 사용한 proxy-tools 소스도 같은 위치에 포함합니다.
- L-Vibe 수정·준비/빌드 스크립트: TGZ `source/L-Vibe-<sourceCommit 첫 12자리>-source.tgz`. 해당 묶음의 `bundle-manifest.json`에서 sourceCommit을 확인하고 실제 소스와 잠금 해시를 대응시킵니다. REA의 별도 고지 및 각 wheel의 dist-info 라이선스도 앱 리소스에 유지합니다.
- 고정 원본 소스 archive와 라이선스 바이트는 ASCII 파일명 수정 과정에서 변경하지 않았습니다. 이들의 포함·해시 검사는 전체 대응 소스 의무 충족 판정과 구분합니다.

AGPL 5조의 aggregate 규정은 별개 저작물의 단순 집합과 결합 저작물을 구분합니다. 프로세스 분리는 검토 근거 중 하나이며 모든 결합 방식의 라이선스 범위를 자동 확정하지 않습니다. 배포 시 수정분·필요한 빌드/설치 자료·적용 라이선스·소스 접근 방법을 수령인이 실제 이용할 수 있게 해야 합니다. 폐쇄망 수령인에게 인터넷 저장소 링크만 주는 방법에 의존하지 않습니다.

## 추가로 확인해야 할 항목

1. **Chrome for Testing 재배포 조건**: 실제 고정 바이너리의 약관/제3자 고지와 L-Vibe 공개·사내 전달 방식의 허용 범위. ABOUT만 보존한 사실로 검토 완료 처리하지 않습니다.
2. **MSVC DLL 재배포 자격**: 배포 주체의 해당 Microsoft 라이선스 보유 여부와 전체 재배포 조건. 이 빌드 환경에서 조직의 사용권을 확인할 수 없습니다.
3. **GPL/AGPL/LGPL 대응 소스 완전성**: 원본 archive 제공 외에 실제 수정분·빌드 자료, MinGit 하위 바이너리, REA/OpenPGP 등 LGPL 의존성의 해당 소스·교체/재결합 조건을 최종 대조해야 합니다. 현재 이를 모두 충족했다고 인증하지 않습니다.
4. **전체 하위 의존성 고지**: 메타데이터의 UNKNOWN/포괄 문구를 실제 원문과 대조하는 최종 inventory가 필요합니다. 예를 들어 `google==3.0.0`의 메타데이터는 UNKNOWN이지만 배포된 `googlesearch/__init__.py` 헤더에서 BSD-3-Clause 문구를 확인했습니다. lock의 원본 메타데이터를 임의로 바꾸지 않습니다.
5. **브랜드 사용권·실제 배포 대상**: LIG 로고 승인과 동일 법인/계열사/협력사/외부 전달 범위를 조직 기준으로 확인합니다.

현재 결론은 **자체 코드는 MIT, 설치 묶음은 복수 라이선스이며 정식 재배포 검토는 미완료**입니다. 기존 `releaseReady: false`를 유지합니다. 남은 항목과 조직의 실제 배포 방식을 확인한 후 최종 배포 적합성을 판단합니다.

## 검토 근거

원본 [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html), [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html), [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html), [LGPL-3.0](https://www.gnu.org/licenses/lgpl-3.0.html), [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode), [Microsoft redistribution](https://learn.microsoft.com/en-us/visualstudio/releases/2022/redistribution)을 식별자로 제공합니다. 판정 근거는 위 표의 **실제 고정 배포본 원문**이며 온라인 최신 버전이나 프로젝트의 대표 라이선스만으로 하위 구성을 덮어쓰지 않습니다. 잠금 자료는 [python-runtime-lock.json](../python-runtime-lock.json), [mcp-runtime-lock.json](../mcp-runtime-lock.json), [rea-runtime-lock.json](../rea-runtime-lock.json), [skills-lock.json](../skills-lock.json)입니다.

0.2.6은 개인 OVPack 가져오기·읽기 전용 개인 검색과 로컬 내보내기 도구를 추가합니다. OpenViking 가상 사용자 컨테이너의 부모 처리 어댑터는 고정 원본 helper hash를 검사하며 SDK 아카이브/소유권/충돌 검사를 유지합니다. 원본 SDK 파일은 변경하지 않고 런처에서 보완합니다. 어댑터를 포함한 L-Vibe 소스와 기존 AGPL 대응 소스는 반입 묶음에 제공합니다. 0.5.0 SDK는 빌드 PC의 이관 검사에만 사용하며 직원 배포 런타임은 0.5.4를 유지합니다. 기존 Chrome/MSVC·copyleft 관련 미확인 항목은 그대로 남습니다.

0.3.3의 JSONC 설정 보존에는 Microsoft jsonc-parser 3.3.1(MIT)을 사용하며 원문을 `ned/licenses/jsonc-parser-MIT.txt`에 포함합니다. 작업표시줄 아이콘 교체 스크립트는 Ned 소스 묶음의 `scripts/ned-editor-branding.mjs`, 고정 원본·수정본·아이콘 해시는 설치 리소스의 `ned/editor-branding.json`에서 확인합니다.


## 0.3.7 추가 스킬과 소스 배치

정적 어댑터 30개를 추가하여 총 66개를 제공합니다. ECC·Matt Pocock·gstack·Humanizer·im-not-ai·Marketing Skills는 고정 원본 MIT 고지를 보존합니다. Unslop은 Damir Sokolovsky(@heydamir)의 CC-BY-4.0 저작자·출처·변경 고지를 유지합니다. Modern Web Guidance 선별 문서에는 CC-BY-4.0, 코드 원본 고지에는 Apache-2.0을 구분해 제공합니다. OpenAI Game Studio는 플러그인 매니페스트의 명시적 MIT 선언을 근거로 출처·저자와 MIT 조건을 함께 제공합니다. 제공 범위는 정적 문서이며 원본의 실행 플러그인·CLI·외부 모델 서비스는 포함하지 않습니다. 각 스킬의 LICENSE·ADAPTATION.md와 reviewed-skills-lock.json에서 고정 커밋·원문 및 변경 해시를 확인할 수 있습니다.

생성형 API SDK는 원문 Python 파일의 모든 바이트를 검증한 로컬 ZIP으로 묶으며, 별도 라이선스와 배포 메타데이터는 보존합니다. 네이티브 라이브러리·자산·경로 의존 패키지는 그대로 둡니다. 원본 런타임과 대응 소스의 적용 조건은 바꾸지 않습니다. EXE를 별도로 전달할 때도 같은 릴리스의 반입 TGZ와 source/ 대응 자료를 함께 제공합니다.
