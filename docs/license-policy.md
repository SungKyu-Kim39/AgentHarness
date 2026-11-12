# Ned 라이선스 정책

Ned 자체 코드는 MIT를 유지한다. 번들 전체를 MIT로 재허가하지 않는다. **Zed v1.28.1은 주로 GPL-3.0-or-later이며 명시된 Apache-2.0 구성 요소가 함께 있다.** 공식 Windows 바이너리와 일치하는 고정 태그의 대응 소스, GPL·Apache 원문과 제3자 고지를 반입 묶음에 포함한다. 새 Ned 글자 아이콘을 생성하여 사용하며, 코드 라이선스를 타사 상표 사용권으로 표현하지 않는다.

OpenCode 엔진·ACP는 MIT이며 Zed와 로컬 ACP로 연결한다. OpenViking의 AGPL, Serena·Git·DLL·브라우저 등 각자의 조건은 계속 적용된다. 외부 링크만으로 폐쇄망 수령인에게 대응 소스를 제공했다고 주장하지 않는다. 업무 프로젝트와 개인 대화가 이 도구를 사용했다는 이유만으로 공개 대상이 되는 것은 아니다. 실제 수정·결합·전달 형태를 기준으로 적용 조건을 확인한다.

**agent-desktop 1.2.0은 Apache-2.0**이다. 이 바이너리의 MSVC 의존성을 위해 기존에 고정한 CPython 배포본의 `vcruntime140.dll`과 원문 `LICENSE.CPython-Windows.txt`도 같은 폴더에 포함한다. DLL은 Apache 라이선스로 바꾸지 않으며 기존 Microsoft 재배포 검토 항목은 계속 적용한다. 고정 Windows 바이너리와 일치하는 커밋의 소스 archive·원문 라이선스를 설치 리소스에 포함한다. 기본 추가 스킬 2개에도 출처·라이선스·변경 고지를 유지하며 외부 설치를 요구하지 않는 호스트 어댑터를 제공한다.

아래는 기존 런타임에 대한 상세 검토 기록이다. Zed 추가는 위 조건을 함께 적용한다. 기존 Chrome 바이너리 재배포 조건, MSVC DLL 배포 주체의 자격 등 미확인 항목은 해결된 것으로 바꾸지 않는다.

---

# 기존 공통 런타임 라이선스 검토 기록

검토일: 2026-11-11 KST. 대상은 **0.2.3/0.2.4 및 같은 실행 구성 요소 버전을 사용하는 0.2.5/0.2.6 후보**의 고정 런타임·스킬과 저장소 소스다. 패키지 메타데이터뿐 아니라 설치에 포함된 라이선스 원문·소스 고지·빌드 스크립트를 대조했다. 0.2.5는 정적 토크나이저 어휘 자료와 그 고지, L-Vibe launcher/호스트·진단·배포 안내를 추가/수정한다. 이 문서는 전체 의존성의 법적 적합성 인증이 아니며 현재 미확인 항목을 함께 기록한다.

## 적용 정책

L-Vibe가 작성한 코드에는 루트 [MIT 라이선스](../LICENSE)를 적용한다. 번들 전체를 MIT로 재허가하지 않는다. OpenCode·라이브러리·스킬·브라우저·DLL·로고는 각 권리자 조건을 유지한다. 코드의 MIT 허가는 LIG 명칭·로고의 상표/브랜드 사용권을 부여하지 않는다.

기업 내부에서 사용하는 행위와 계열사·협력사·고객·공개 저장소에 재배포하는 행위는 구분한다. 폐쇄망이라는 이유로 GPL/AGPL·재배포 약정이 사라지지 않는다. 적용 범위는 법인 경계·실제 수정/결합 방식·전달 대상에 따라 판단한다.

MIT/GPL/AGPL 등 위 오픈소스 라이선스는 조건을 지키는 기업·상업적 이용을 허용한다. 소스 제공·고지·재배포 의무와 별도 상용 바이너리의 약정은 함께 확인한다.

단순히 이 도구로 개발했다는 이유로 사용자의 업무 프로젝트·대화·API 키를 인터넷에 공개해야 하는 것은 아니다. 소스 제공 의무는 해당 라이선스가 적용되는 프로그램·수정본·결합물의 범위를 따진다. 프로그램 사용·출력과 라이선스가 적용되는 원본 코드를 복사해 제품에 넣는 행위는 각각 검토한다. 사내 모델 서비스의 이용 조건도 별도다.

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

표의 설치 상대 경로는 `%LOCALAPPDATA%\Programs\L-Vibe\resources\` 아래다. 스킬 원문과 manifest는 `resources/l-vibe/skills`에 포함한다. 원형 0.1의 `vendor/THIRD_PARTY_NOTICES.md`·`vendor-lock.json` 상단만으로 현재 Desktop 번들의 라이선스를 판정하지 않는다.

## 포함된 대응 소스와 고지

- OpenViking 원본 대응 소스: TGZ `licenses/OpenViking-0.5.4-corresponding-source.tar.gz`와 앱 리소스 `runtime/windows-x64/openviking/licenses/openviking-0.5.4-source.tar.gz`.
- Serena/Git 원본 소스: 앱 리소스 `runtime/windows-x64/mcp/licenses/serena-agent-2.1.0-source.tar.gz`, `git-for-windows-2.56.0.windows.4-source.tar.gz`. 사용한 proxy-tools 소스도 같은 위치에 포함한다.
- L-Vibe 수정·준비/빌드 스크립트: TGZ `source/L-Vibe-<sourceCommit 첫 12자리>-source.tgz`. 해당 묶음의 `bundle-manifest.json`에서 sourceCommit을 확인하고 실제 소스와 잠금 해시를 대응시킨다. REA의 별도 고지 및 각 wheel의 dist-info 라이선스도 앱 리소스에 유지한다.
- 고정 원본 소스 archive와 라이선스 바이트는 ASCII 파일명 수정 과정에서 변경하지 않았다. 이들의 포함·해시 검사는 전체 대응 소스 의무 충족 판정과 구분한다.

AGPL 5조의 aggregate 규정은 별개 저작물의 단순 집합과 결합 저작물을 구분한다. 프로세스 분리는 검토 근거 중 하나이며 모든 결합 방식의 라이선스 범위를 자동 확정하지 않는다. 배포 시 수정분·필요한 빌드/설치 자료·적용 라이선스·소스 접근 방법을 수령인이 실제 이용할 수 있게 해야 한다. 폐쇄망 수령인에게 인터넷 저장소 링크만 주는 방법에 의존하지 않는다.

## 추가로 확인해야 할 항목

1. **Chrome for Testing 재배포 조건**: 실제 고정 바이너리의 약관/제3자 고지와 L-Vibe 공개·사내 전달 방식의 허용 범위. ABOUT만 보존한 사실로 검토 완료 처리하지 않는다.
2. **MSVC DLL 재배포 자격**: 배포 주체의 해당 Microsoft 라이선스 보유 여부와 전체 재배포 조건. 이 빌드 환경에서 조직의 사용권을 확인할 수 없다.
3. **GPL/AGPL/LGPL 대응 소스 완전성**: 원본 archive 제공 외에 실제 수정분·빌드 자료, MinGit 하위 바이너리, REA/OpenPGP 등 LGPL 의존성의 해당 소스·교체/재결합 조건을 최종 대조해야 한다. 현재 이를 모두 충족했다고 인증하지 않는다.
4. **전체 하위 의존성 고지**: 메타데이터의 UNKNOWN/포괄 문구를 실제 원문과 대조하는 최종 inventory가 필요하다. 예를 들어 `google==3.0.0`의 메타데이터는 UNKNOWN이지만 배포된 `googlesearch/__init__.py` 헤더에서 BSD-3-Clause 문구를 확인했다. lock의 원본 메타데이터를 임의로 바꾸지 않는다.
5. **브랜드 사용권·실제 배포 대상**: LIG 로고 승인과 동일 법인/계열사/협력사/외부 전달 범위를 조직 기준으로 확인한다.

현재 결론은 **자체 코드는 MIT, 설치 묶음은 복수 라이선스이며 정식 재배포 검토는 미완료**다. 기존 `releaseReady: false`를 유지한다. 남은 항목과 조직의 실제 배포 방식을 확인한 후 최종 배포 적합성을 판단한다.

## 검토 근거

원본 [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html), [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html), [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html), [LGPL-3.0](https://www.gnu.org/licenses/lgpl-3.0.html), [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode), [Microsoft redistribution](https://learn.microsoft.com/en-us/visualstudio/releases/2022/redistribution)을 식별자로 제공한다. 판정 근거는 위 표의 **실제 고정 배포본 원문**이며 온라인 최신 버전이나 프로젝트의 대표 라이선스만으로 하위 구성을 덮어쓰지 않는다. 잠금 자료는 [python-runtime-lock.json](../python-runtime-lock.json), [mcp-runtime-lock.json](../mcp-runtime-lock.json), [rea-runtime-lock.json](../rea-runtime-lock.json), [skills-lock.json](../skills-lock.json)이다.

0.2.6은 개인 OVPack 가져오기·읽기 전용 개인 검색과 로컬 내보내기 도구를 추가한다. OpenViking 가상 사용자 컨테이너의 부모 처리 어댑터는 고정 원본 helper hash를 검사하며 SDK archive/소유권/충돌 검사를 유지한다. 원본 SDK 파일은 변경하지 않고 런처에서 보완한다. 어댑터를 포함한 L-Vibe 소스와 기존 AGPL 대응 소스는 반입 묶음에 제공한다. 0.5.0 SDK는 빌드 PC의 이관 검사에만 사용하며 직원 배포 런타임은 0.5.4를 유지한다. 기존 Chrome/MSVC·copyleft 관련 미확인 항목은 그대로 남는다.
