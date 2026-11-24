# Ned에서 새 스킬과 MCP를 추가하는 방법

대상은 Ned 0.3.16입니다. 스킬은 작업 방법을 담은 문서이고, MCP는 프로그램을 실행해 실제 도구를 제공하는 연결 방식입니다. 문서를 추가하는 일과 실행 권한을 추가하는 일은 절차가 다릅니다.

현재 Ned에는 임의 MCP를 등록하는 사용자 메뉴가 없습니다. `agent-config.json`의 모델 설정에 `mcp`나 `plugins`를 넣어 활성화하는 방식도 지원하지 않습니다. 필요한 런타임을 검토하고 설치본에 고정하는 배포 방식입니다. **전체 권한**은 이미 지원하는 도구의 승인창을 생략하는 옵션이며, 새 실행 파일이나 플러그인을 설치하는 권한은 아닙니다.

## 사용자 글로벌 스킬 등록

Ned를 처음 실행해 사용자 프로필을 만든 뒤, 탐색기 주소창에
`%APPDATA%\Ned\skills`를 입력하고 아래처럼 저장합니다. 폴더가 없다면 만드세요.

```text
%APPDATA%\Ned\skills\team-review\SKILL.md
```

```markdown
---
name: team-review
description: 사내 코드 리뷰 기준으로 변경 사항을 확인합니다.
---

변경된 코드부터 읽고 실제 결함과 테스트 결과를 파일 위치와 함께 정리합니다.
```

폴더 이름과 `name`은 같아야 합니다. 영문 소문자, 숫자와 하이픈을 사용하고
`description`에 적용할 작업을 적습니다. 참고 Markdown이나 텍스트 파일을 같은
스킬 폴더의 `references` 등에 둘 수 있습니다. 0.3.16부터는 Ned를 다시 실행하지 않아도
바로 카탈로그·슬래시 명령(`/skill-team-review`)·자동 스킬 라우팅에 반영됩니다. 기본 스킬과 같은 이름을 쓰면 기본 스킬이 우선합니다.

사용자 스킬 폴더는 프로그램 설치 폴더와 분리합니다. Ned를 업데이트하거나 설치 위치를
바꿔도 파일이 유지됩니다. 스킬 파일은 지침으로 읽으며 명령 실행과 파일 수정은
기존 Ned 승인 정책을 따릅니다.

## 프로젝트 전용 스킬(`.ned/skills`) 및 일반 지침 추가

특정 프로젝트에서만 쓸 스킬은 프로젝트 루트 아래 `.ned/skills/<스킬-ID>/SKILL.md`에 저장합니다.

```text
project/
  .ned/
    skills/
      review-checklist/
        SKILL.md
```

```markdown
---
name: review-checklist
description: 팀의 코드 리뷰 기준으로 변경 사항을 확인한다.
---

# 팀 코드 리뷰 기준

1. 요청한 동작과 변경 파일을 먼저 확인한다.
2. 오류 처리와 자원 해제, 기존 호출자에 미치는 영향을 검토한다.
3. 확인한 결함은 파일 경로와 근거를 함께 설명한다.
4. 실제로 실행하지 않은 빌드·테스트를 통과했다고 쓰지 않는다.
```

`.ned/skills`에 둔 프로젝트 스킬은 해당 프로젝트를 열었을 때 `skill_catalog`, `read_skill`, `/skill-review-checklist`, 자연어 자동 스킬 라우팅(`review-checklist 기준으로 검토해줘`)에서 바로 인식되며, 같은 이름의 사용자 글로벌 스킬보다 우선합니다. 안전을 위해 AI 도구가 `.ned` 폴더 내부 파일을 임의로 수정·삭제하는 것은 호스트에서 차단합니다.

스킬 형식 없이 일반 Markdown 문서(예: `docs/team-guide.md`)로 두고 필요할 때 경로를 지정해 읽게 하는 방식도 그대로 사용할 수 있습니다. 실행 스크립트·설치 명령·API 키를 지침에 넣지 않으며, 문서에 쓰인 명령은 권한을 부여하지 않습니다. 개인 대화·기밀 문서를 공용 지침 폴더에 복사할 때는 저장소의 공유 범위도 확인하세요.

## 기본 스킬로 배포하려면

여러 직원에게 자동 선택과 카탈로그 읽기까지 제공하려면 배포 담당자가 Ned 소스에서 추가한 뒤 새 설치본을 만듭니다. 직원 PC의 설치 리소스나 manifest를 직접 고치는 방식은 사용하지 않습니다. 해시가 달라지면 기본 스킬과 런타임 검사가 거절합니다.

담당자는 다음 순서로 작업합니다.

1. 스킬의 원본 저장소·커밋·필요 문서와 라이선스를 정합니다. 최신 브랜치 이름만 기록하지 않고 실제 파일의 SHA-256도 남깁니다.
2. 인터넷 조회, 원격 설치, 자동 갱신, 임의 셸·Python 실행을 요구하는지 검토합니다. Ned에서 제공하지 않는 실행 기능은 지침의 선행 조건으로 남기고, 실행한 것으로 표현하지 않습니다.
3. `reviewed-skills-lock.json`의 `sources`에 출처·고정 파일을, `skills`에 ID·용도·적용 절차를 추가합니다. 기존 항목의 구조를 참고합니다. 원문 라이선스와 `ADAPTATION.md`의 변경 고지를 준비합니다.
4. 빌드 PC에서 필요한 원문을 확보한 뒤 검토합니다. `node scripts/bundle-reviewed-skills.mjs --record-reviewed`는 검토한 새 원문 해시를 기록할 때만 사용합니다. 이후에는 플래그 없이 재생성해 같은 바이트인지 확인합니다.
5. 생성된 `vendor/skills/<ID>`, `vendor/skills/manifest.json`, `skills-lock.json`을 함께 검토합니다. 카탈로그와 자동 선택에 모두 쓰이는 입력입니다. `src/main/skill-routing.ts`의 용도 분류와 설명도 확인해 요청 문맥에서 선택되는지 검사합니다.
6. `npm run skills:verify`, `npm run typecheck`와 관련 카탈로그·자동 선택 테스트를 실행합니다. 변경 사항과 라이선스를 커밋한 뒤 설치본과 반입 TGZ를 다시 빌드합니다.

기본 스킬은 설치본의 로컬 카탈로그에서 읽힙니다. Studio에 둔 자료는 OpenViking의 지식 영역에서 관리합니다.

## 새 MCP를 배포하려면

MCP는 스킬 문서와 달리 파일을 쓰거나 프로세스를 만들 수 있는 실행 프로그램입니다. 표준 MCP의 `command`·`args` 예제를 그대로 Zed 설정에 붙여 넣는 것으로 Ned 호스트에 연결되지는 않습니다. 관리형 Zed의 `context_servers`와 앱 전용 엔진 설정은 Ned가 준비합니다.

추가 요청에는 다음 정보를 적어 배포 담당자에게 전달하면 검토하기 쉽습니다.

```text
Name: local-example-mcp
Source: <repository URL and commit>
Purpose: <어떤 입력을 받아 어떤 결과를 돌려주는가>
Tools: <노출할 도구의 정확한 이름>
Effects: read / file-change / process / network
Runtime: Windows x64, Python or Node version and native DLLs
Network: <실행·첫 사용·업데이트 때 필요한 주소, 또는 none>
License: <원문과 재배포 조건>
Example: <작은 로컬 파일로 재현할 요청>
```

배포 담당자는 다음 연결을 구현합니다.

| 영역 | 확인·수정할 곳 |
| --- | --- |
| Python·Node·브라우저·DLL 확보 | `scripts/bundle-mcp.py`, `scripts/bundle-python.py`, 관련 `*-runtime-lock.json`·`mcp-node-lock.json` |
| MCP 시작과 도구 허용 목록 | `src/main/mcp-extensions.ts`, `src/main/mcp-client.ts` |
| 실행 기능·외부 접속 제한 | `scripts/mcp-python-worker.py`, `scripts/mcp-node-worker.cjs` |
| 모델에 공개할 입력·출력 | `distribution/host-tools.ts`, 확장 도구 스키마와 실제 라우팅 |
| 파일 범위와 승인 | `ProjectFiles`, 호스트 권한 정책, 대상 고정·버퍼·충돌·스냅샷 검사 |
| 번들 무결성과 배포 | 런타임 manifest, `src/main/runtime-pins.ts`, `release-runtime-lock.json`, 설치 파일 감사 |

정확한 경로는 추가할 실행기의 실제 호출 관계로 확인합니다. `scripts/bundle-mcp.py`는 검토한 worker를 직원 런타임으로 복사하며, 최종 manifest에는 그 바이트의 해시도 들어갑니다.

도구 전체를 그대로 공개하지 않고 필요한 기능만 선택합니다. 가능한 분석은 프로젝트 사본에서 수행합니다. 수정·명령 기능은 승인할 실행 파일·인자·작업 폴더와 대상을 고정하고, 취소 후 자식 프로세스 종료를 확인해야 합니다. 알 수 없는 효과는 자동 허용하지 않습니다.

빌드 PC에서 의존성·DLL·브라우저와 소스를 모두 준비하고 해시·라이선스를 기록합니다. 직원 PC에서 `npm install`, `pip install`, `uvx`, `git clone`으로 보충하는 절차는 두지 않습니다. 서버를 한 번 띄워 보았다는 것만으로 검토가 끝나지는 않습니다. 실제 도구 호출, 허용 범위 밖 거절, 승인 거절, 취소·재시작, 오프라인 첫 실행과 실제 DNS·TCP 요청을 각각 확인해야 합니다.

## 추가 후 사용자 확인 순서

1. 배포한 TGZ를 새 폴더에 풀고 EXE로 업데이트합니다. 기존 설정·대화·지식은 유지합니다.
2. 스킬은 `skill_catalog`에서 새 ID와 설명을 확인하고 `read_skill`로 본문을 읽게 합니다. 이름을 생략한 자연어 요청에서도 적절하게 선택되는지 확인합니다.
3. MCP는 작은 시험 프로젝트에서 실제 도구 이름·대상·결과를 확인합니다. 계획에 MCP 이름이 나오는 것과 도구 실행 성공을 구분합니다.
4. 새 기능을 뺀 기존 작업도 확인하고, 결과와 OS·빌드 해시·모델 종류를 검증 기록에 남깁니다.

소스 개발에 필요한 Codex 전용 스킬은 루트 `.agents/skills`입니다. 여기에 파일을 추가해도 직원에게 배포하는 Ned 기본 스킬이 늘어나지는 않습니다.

0.3.8의 Git 스테이징·커밋과 Ghidra는 검토된 호스트 도구로 기본 제공하므로 별도 MCP 설치가 필요하지 않습니다. Ghidra·JDK 잠금 값과 Java 네트워크 가드는 `ghidra-runtime-lock.json`, `scripts/bundle-ghidra.py`, `distribution/rea-ghidra-worker.mjs`에서 확인합니다. 사용법은 [Git·바이너리 분석 안내](git-and-binary-analysis.md)를 따릅니다.

EGM 0.1.1의 7개 워크플로는 0.3.9에 기본 포함됩니다. 직원 PC에서 원본 플러그인 설치기나 의존성 설치를 실행하지 않습니다. 고정 원본과 Ned 어댑터, 읽기 전용 Goldfish 역할을 사용하는 방법은 [EGM 안내](egm.md)를 참고하세요.

## 프로젝트 스킬과 슬래시 명령

프로젝트 전용 스킬은 `<프로젝트>/.ned/skills/<ID>/SKILL.md`에 둡니다. Ned Agent의 입력창에서 `/skill-<ID>`를 고르거나 `skill_catalog`로 목록을 확인할 수 있습니다. 같은 ID이면 번들 스킬, 현재 프로젝트 스킬, 사용자 글로벌 스킬 순으로 적용합니다. 슬래시 목록에는 `/compact`와 사용자·프로젝트 스킬을 표시합니다. 개인 홈의 `.agents/skills`는 Ned 스킬 경로에 포함되지 않습니다.
