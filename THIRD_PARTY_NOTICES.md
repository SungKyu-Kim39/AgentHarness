# Ned 배포 구성의 라이선스와 출처

Ned 호스트와 이전 L-Vibe 자체 코드에는 루트 MIT 라이선스를 적용합니다. 번들 소프트웨어·스킬·라이브러리·브라우저·런타임·상표·로고는 각 권리자의 조건을 따릅니다. 설치 묶음 전체를 MIT로 재허가하지 않습니다. 검토 근거와 남은 항목은 [라이선스 정책](docs/license-policy.md)에 있습니다.

## 편집기와 호스트

Zed v1.28.1은 주로 GPL-3.0-or-later이며 Apache-2.0 구성 요소도 있습니다. 일치하는 소스와 GPL·Apache·제3자 고지를 오프라인 배포물에 포함합니다. 현재 제품에는 생성한 Ned 글자 아이콘을 사용합니다.

Ned 0.3.3의 설정 보존에는 Microsoft의 jsonc-parser 3.3.1(MIT)을 사용하며 원문은 `ned/licenses/jsonc-parser-MIT.txt`에 넣습니다. 번들 Zed의 Windows 아이콘 리소스만 교체하고 실행 코드와 공급자 버전 정보는 유지합니다. 원본 아카이브·소스를 고정하고 수정 스크립트·아이콘을 Ned 소스에 포함합니다. 수정 이미지는 서명되지 않았으며 Zed 라이선스는 그대로 적용됩니다.

## agent-desktop 1.2.0

저작자는 Vercel Labs contributors, 라이선스는 Apache-2.0이며 고정 커밋은 `2b0a7334fc111730454b726e6800aa41cdafc093`입니다. 네이티브 바이너리는 수정하지 않습니다. Windows의 `VCRUNTIME140.dll`은 고정 CPython standalone에서 복사하고 `LICENSE.CPython-Windows.txt`를 함께 둡니다. 이 DLL에는 Microsoft의 별도 조건이 적용됩니다.

대응 소스와 원문 라이선스를 함께 제공하며, 0.3.7에서는 실행에 필요 없는 소스 아카이브를 TGZ의 `source/`에 보관합니다. 이전 구성의 설치 위치는 `resources/runtime/windows-x64/agent-desktop/`입니다. 도구는 검토한 MCP 기능과 정적 데스크톱·Windows 지침으로 연결합니다. 고정값은 `agent-desktop-lock.json`, 변경 내용은 각 `ADAPTATION.md`에 기록합니다. 원본 셸 훅이나 온라인 npm 초기화는 설치하지 않습니다.

## 공통 런타임

고정 Windows x64 0.2.3·0.2.4·0.2.5·0.2.6에서 검토한 공통 런타임 조건도 적용됩니다. OpenViking은 AGPL-3.0, Serena는 GPL-3.0-or-later, MinGit은 GPL-2.0이며 일부 라이브러리는 LGPL입니다. 각색한 differential-review는 CC-BY-SA-4.0입니다. Google Chrome과 Microsoft 런타임에는 별도 조건이 있습니다.

0.2.5의 오프라인 토크나이저는 tiktoken MIT와 원본 GPT-2 Modified MIT 고지를 보존합니다. 데이터 해시와 패키지 미러 출처는 `tokenizer-runtime-lock.json`과 `tokenizers`에 있습니다.

0.2.6 런처는 고정 OpenViking OVPack helper 소스를 해시로 확인하고 가상 사용자 컨테이너의 부모 생성만 보완합니다. SDK의 소유자·대상·충돌·아카이브 검사는 유지하며 원본 파일을 바꾸지 않습니다. 어댑터는 L-Vibe 소스, SDK는 AGPL 대응 소스로 함께 제공합니다. [당시 이관 검증](docs/validation-0.2.6.md)에 결과가 있습니다.

`vendor/THIRD_PARTY_NOTICES.md`는 과거 0.1 원형의 기록입니다. 현재 배포판의 판단에는 현행 정책과 lock, 실제 패키지의 원문을 사용해야 합니다.

## 0.3.7에 추가한 정적 스킬

추가한 30개는 선별한 오프라인 호스트 지침입니다. 실행형 플러그인을 통째로 설치하지 않습니다.

- ECC, Matt Pocock, gstack, blader/humanizer, epoko77-ai/im-not-ai, coreyhaines31/marketingskills의 MIT 고지를 유지합니다.
- Unslop은 Damir Sokolovsky(@heydamir)의 CC-BY-4.0 저작자·출처·변경 고지를 보존합니다.
- GoogleChrome Modern Web Guidance는 선별 문서의 CC-BY-4.0과 코드의 Apache-2.0 고지를 나누어 제공합니다.
- OpenAI Game Studio는 고정 플러그인 manifest의 MIT 선언, 저자 정보와 표준 MIT 조건을 어댑터에 함께 넣습니다.

정확한 원본·커밋·해시는 `reviewed-skills-lock.json`과 각 `LICENSE`·`ADAPTATION.md`에서 확인할 수 있습니다.

생성형 Python SDK는 원문과 바이트가 같은 ZIP으로 묶으며 저작권·라이선스 메타데이터는 유지합니다. 설치 리소스에서 옮긴 소스는 같은 TGZ의 `source/`에 보관합니다. 원래 위치·해시·새 manifest는 `ned/runtime-optimization.json`에 기록합니다. EXE만 전달할 때도 같은 릴리스의 대응 소스를 함께 제공해야 합니다.

TGZ와 설치 리소스의 라이선스·저작자 고지, dist-info 문서, REA 제3자 고지와 스킬 문서를 보존합니다. 소스와 해시를 확인한 결과와 전체 라이선스 의무 충족 여부는 구분하며, 남은 재배포 검토는 [정책 문서](docs/license-policy.md)를 따릅니다.
