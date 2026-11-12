> Ned 0.3.0 기준: Zed 편집기와 전용 OpenCode 엔진을 사용한다. 이전 Windows 실행 증거는 승계 주장하지 않으며 [현재 검증 상태](validation-0.3.0.md)를 함께 확인한다.

# 폐쇄망 스킬·MCP·플러그인 조사 — 2026-11-10

Ned의 기본 스킬 **소스 번들에 16개를 추가해 총 34개**로 구성했다. 신규 MCP·실행형 플러그인은 설치하거나 활성화하지 않았다. 아래 후보는 사용자 선택용이며 Windows 번들·승인 중계·외부 통신 검증을 완료한 구성이라는 뜻은 아니다.

0.2.0 EXE/TGZ에는 기존 18개가 들어 있다. 이 문서의 34개는 `vendor/skills`와 `skills-lock.json` 기준이며, 0.2.1 설치 후보의 입력이다. 0.2.1은 최초 실행 때 기본 스킬을 OpenViking skills에 자동 등록한다. 공개 파일의 버전과 해시는 [다운로드 안내](../downloads/README.md)에서 확인한다.

## 조사 기준과 근거의 구분

국내 GeekNews·PyTorchKR, 해외 Reddit의 사용 경험과 GitHub 원본을 함께 확인했다. 커뮤니티 소개·작성자의 후기·편집 순위를 독립 성능 검증이나 사용자 전체의 합의로 취급하지 않았다. 개별 스킬의 효과를 사내 Qwen에서 비교 측정한 결과는 아직 없다.

- [GeekNews: Superpowers 소개와 워크플로](https://news.hada.io/topic?id=23620), [사용 후기 토론](https://news.hada.io/topic?id=29552): 계획·TDD·리뷰를 재사용하는 방식이 유용하다는 의견을 확인했다. 이미 Aegis가 같은 역할을 맡으므로 Superpowers 전체를 중복 설치하지 않았다.
- [GeekNews: 스킬 파일 관리 토론](https://news.hada.io/topic?id=33338), [Superlite/Superpowers 비교 토론](https://news.hada.io/topic?id=35647): 팀의 실제 규칙, 필요한 문서만 읽는 방식, 절차·컨텍스트 비용도 고려했다. 공개 벤치마크의 수치를 Ned 성능으로 옮기지 않았다.
- [PyTorchKR: Awesome Claude Skills 소개](https://discuss.pytorch.kr/t/awesome-claude-skills-1-000-claude/11063): 후보 탐색에 활용했다. 목록에 실렸다는 이유만으로 전체 팩이나 외부 SaaS 연동을 포함하지 않았다.
- [Reddit: 자주 쓰는 스킬](https://www.reddit.com/r/ClaudeCode/comments/1q0n9jo/musthave_skills/), [중복·과다 스킬에 관한 경험](https://www.reddit.com/r/ClaudeCode/comments/1rp02ln/what_skills_are_you_using/): 디버깅·검증의 수요와 과도한 지침의 비용을 함께 반영했다.
- [Reddit: Playwright MCP 사용 경험](https://www.reddit.com/r/Playwright/comments/1ra1lm7/is_it_worth_using_playwright_mcpcli_as_a_tester/), [탐색 도구와 회귀 테스트의 차이](https://www.reddit.com/r/Playwright/comments/1v8swyu/are_we_using_playwright_mcp_for_testing_when_its/): 실제 화면 확인과 테스트 초안 작성의 가치를 후보 선정에 반영했다. MCP로 한 번 조작한 결과를 반복 가능한 회귀 테스트 통과로 표시하지 않는다.

외부 인터넷이 필수인 기능은 제외했다. 사내 LLM·단일 임베딩 API는 기존 제품 전제대로 사용한다. 지침에 외부 링크가 남아 있는 경우 출처·참고 문헌이며 실행 중 조회할 필수 자료가 아니다. 모든 스킬을 매 요청마다 읽지 않고 관련 문서만 선택한다.

## 즉시 추가한 스킬

| 스킬 ID | 용도와 선정 이유 | 원본 | 반입 후 조건 |
|---|---|---|---|
| cpp-pro | 자원 수명·동시성·성능·빌드; C/C++ 개발 보강 | Jeffallan/claude-skills | 기존 표준·컴파일러·SDK 유지. 도구 설치 없음 |
| cpp-testing | C++ 회귀·특성화·CTest/GoogleTest 작성 | ECC | 로컬 패키지 사용. FetchContent 다운로드 예제 교체 |
| legacy-modernizer | 기존 동작 파악·점진 개선·포팅·롤백 | Jeffallan/claude-skills | VxWorks 지원 유지 등 미결 결정은 먼저 확인 |
| codebase-onboarding | 진입점·규칙·의존성·데이터 흐름 조사 | ECC | 프로젝트 읽기·실제 Graphify/REA 결과 활용 |
| api-design | API 계약·호환성·입력·오류·멱등성 | ECC | 코드 설계 지침; 외부 API 연결 불필요 |
| database-migrations | DB 변경의 백업·호환성·복구 | ECC | ORM 자동 다운로드 제거; 실제 DB 변경은 승인 |
| error-handling-patterns | 예외/Result/오류 코드·취소·복구 | wshobson/agents | 기존 ABI 존중; 비밀 제거·재시도 예산 명시 |
| architecture-decision-records | 설계 대안·결정 근거·되돌리기 | wshobson/agents | adr-tools 설치 제거; 기존 트랙 우선 |
| differential-review | 변경 전후 보안 회귀와 영향 범위 검토 | Trail of Bits | 자동 위임·외부 출력 경로 제거; 이력 미확인 명시 |
| session-handoff | 긴 작업의 사실·결정·변경·검증·미결 인계 | Ned 원본 | 현재 대화 요약; 영속 문서 변경은 승인 |
| explore-data | 로컬 데이터의 단위·키·결측·분포·품질 | Anthropic knowledge-work-plugins | 커넥터 요구 제거; 로컬 파일/제공 결과 우선 |
| validate-data | 조인·분모·기간·편향·결론 재현성 검토 | Anthropic knowledge-work-plugins | 원본·실행기가 없으면 재계산 미실행 명시 |
| data-visualization | 차트·축·불확실성·시각적 근거 | Anthropic knowledge-work-plugins | Python 예제 지침; Plotly HTML은 JS 포함, CDN 불필요 |
| statistical-analysis | 분포·검정·효과·구간·인과 해석 | Anthropic knowledge-work-plugins | p값 해석 보정; 실제 계산 없이 숫자 생성 금지 |
| ab-testing | 실험 가설·표본·배정·가드레일·중지·판정 | Corey Haines marketingskills | 온라인 계산기 대신 표준 Python 로컬 계산 예제 |
| web-design-guidelines | 폼·포커스·상태·접근성·성능·한국어 UI | Vercel Web Interface Guidelines | 최신 원격 조회 대신 규칙 자체를 로컬에 고정 |

스킬은 정적 문서와 예제다. 컴파일러·SDK·GoogleTest·분석용 Python 패키지·SQL 실행기·브라우저를 설치하거나 실행 권한을 추가하지 않는다. 현재 후보에 승인된 일반 명령 실행기가 없으므로 코드 작성과 결과 검토를 수행하고, 실행 근거가 없으면 테스트·분석을 미실행으로 표시한다. 개인 대화 자동 색인, 파일 변경 승인 생략, 프로젝트 밖 쓰기를 제공하지 않는다.

원본 커밋·새 소스 아카이브 SHA-256·배포 파일 해시는 `skills-lock.json`과 `vendor/skills/manifest.json`에 있다. 변경한 문서는 `modifications`에 원본/배포 해시를 함께 남기고 각 스킬의 `ADAPTATION.md`에 변경 사실·작성자·정책을 기록했다. 실행 스크립트·훅·에이전트·플러그인 코드는 복사하지 않았다.

원본 저장소:

- [Jeffallan](https://github.com/Jeffallan/claude-skills/tree/078a25cc5bfd8011459be7b91d004e900c1d02d3), [ECC](https://github.com/affaan-m/ECC/tree/d2ef2680594f9a17526a6e1a2e18b3d242c5d17b), [wshobson](https://github.com/wshobson/agents/tree/9c61ab243def98f72da12abd41cfcf5bcd91af9d): MIT.
- [Trail of Bits](https://github.com/trailofbits/skills/tree/e4dd0bb5b15535f7c5a0834187dffba6ac37e4ff): **CC-BY-SA-4.0**. 수정한 스킬과 고지도 같은 라이선스로 배포하며 앱의 MIT로 재표기하지 않는다.
- [Anthropic 업무 스킬](https://github.com/anthropics/knowledge-work-plugins/tree/e605d8ddbfb688da57dfaaceebd93f12a64ef1d3): **Apache-2.0**. 앱 실행형 플러그인 설치가 아닌 데이터 지침 4개만 선별했다.
- [Corey Haines](https://github.com/coreyhaines31/marketingskills/tree/9d6d7ce8d18eb155dc2f9762435f097e60cdad7c), [Vercel UI 규칙](https://github.com/vercel-labs/web-interface-guidelines/tree/434b7f91364665f2f733b310ec54809bf8f37937): MIT. UI 규칙의 `command.md`를 스킬 진입 문서로 변환하고 원본 경로를 기록했다.

## 추가로 받은 Zima 글 반영

| 글 | 반영·제외 결정 |
|---|---|
| [코드 품질·리뷰](https://shop.zimaspace.com/ko/blogs/tech-ai-hub/best-10-ai-agent-skills-for-code-quality-review-2026) | 증거 기반 검증·사실 확인·디버깅·리뷰는 기존 Aegis/보안 지침과 이번 differential-review로 담당한다. 비슷한 이름의 팩을 반복 설치하지 않았다. 마켓 목록만으로 원본·라이선스가 확인되지 않은 스킬은 복제하지 않았다. |
| [데이터 분석](https://shop.zimaspace.com/ko/blogs/tech-ai-hub/top-10-ai-skills-for-data-analysis-workflows-in-2026) | 탐색·검증·통계·시각화를 보강했다. 클라우드 웨어하우스·사내 지식 자동 추출·외부 업로드는 포함하지 않았다. Office/XLSX 전용 편집기 구현으로 표현하지 않는다. |
| [A/B 실험](https://shop.zimaspace.com/ko/blogs/tech-ai-hub/10-best-ai-skills-for-a-b-testing-and-experiment-analysis-in-2026) | Corey Haines의 설계 지침과 통계 검토를 선별했다. GrowthBook/PostHog 등 별도 플랫폼은 연결하지 않았다. K-Dense의 원본은 별도 과학 환경·스크립트·온라인 문헌 확인 요구가 있어 그대로 탑재하지 않았다. |
| [UI/UX](https://shop.zimaspace.com/ko/blogs/tech-ai-hub/10-best-ai-design-skills-tools-for-better-ui-ux) | 기존 frontend-design·ui-accessibility에 고정 Vercel 규칙을 보강했다. 검토한 Impeccable 최신 원본은 바이너리 최초 다운로드·CLI·훅·강제 하위 에이전트 흐름을 포함해 전체 설치에서 제외했다. UI/UX Pro Max의 검색 실행기·대규모 데이터 팩도 이번 정적 스킬 추가로 설치했다고 주장하지 않는다. |
| [코딩 SKILL.md](https://shop.zimaspace.com/ko/blogs/tech-ai-hub/top-ai-agent-skills-md-for-coding-in-2026) | frontend-design·webapp-testing·TDD·MCP 작성은 기존 번들을 재사용하고 온보딩·보안 변경 리뷰를 보강했다. Sentry·Cloudflare 서비스 연동은 제외했다. Next/Fastify 전용 팩은 실제 프로젝트 수요·버전에 맞춰 선별할 후보다. |

## 사용자 선택용 MCP 후보

다음은 **외부 인터넷 없이 로컬 모드로 구성 가능한 후보**다. 원본의 `npx ...@latest`, `uvx`, 자동 설치 예제를 직원 PC에서 실행하지 않는다. 선택 후 Windows x64 런타임·하위 의존성·라이선스·해시를 확보하고 호스트 승인/경로/수명 중계와 실제 DNS/TCP 검증을 해야 한다. 이번에는 원본 문서·일부 코드 검토까지만 수행했다.

| 번호 | 후보 | 가치 / 우선순위 | 함께 반입할 것 | 오프라인·승인 조건 |
|---|---|---|---|---|
| 1 | [Serena + clangd](https://github.com/oraios/serena) | C/C++ 정의·참조·호출 영향. **최우선, 기존 설계의 미연결 기능** | 고정 Python 패키지·clangd·필요 DLL | 읽기 tools만 노출. REPL·편집·activation·LSP 다운로드 차단. 실제 include/매크로/SDK 없으면 제한 명시 |
| 2 | [Git MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/git) | 변경·이력·회귀 원인 파악. **우선** | 고정 portable Git/MinGit와 Python 패키지 | status/log/diff/show부터 제한. 개인 Git 설정·외부 diff/textconv/fsmonitor·훅 실행을 차단. commit/reset/checkout 등 변경은 별도 승인; 원격 fetch/push/clone 미제공 |
| 3 | [Playwright MCP](https://github.com/microsoft/playwright-mcp) | 구현한 로컬 웹 UI의 실제 동작·콘솔·스크린샷. **웹 개발 우선** | 고정 Node 실행 환경·MCP 패키지·Windows 브라우저·DLL | 브라우저 절대 경로·전용 테스트 프로필. 최초 다운로드/브라우저 설치 도구 차단. localhost/지정 사내 테스트 대상만 허용하고 변경성 동작 승인. 일반 PC 화면 조작 기능으로 확장하지 않음 |
| 4 | [MarkItDown MCP](https://github.com/microsoft/markitdown/tree/main/packages/markitdown-mcp) | 로컬 PDF/DOCX/PPTX/XLSX를 요구사항·개발 문서의 텍스트로 읽기. **문서 작업 우선** | 고정 Python·선택한 포맷의 완성된 의존성 | 호스트가 승인한 로컬 파일 복사본만 전달. 원본의 http/https/data URI·임의 파일 접근 차단. Azure/외부 LLM 옵션 미사용. Office 편집·HWP·스캔 OCR 지원은 별도 검증 |
| 5 | [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 로컬 웹 성능·메모리·네트워크·콘솔 심층 진단. **3의 대안/보완** | 고정 Node·Chrome for Testing·패키지 | `--no-usage-statistics`, `--no-performance-crux`, `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS` 필요. 브라우저 자체 통신도 통제. 개인 브라우저 연결 미사용 |
| 6 | [DuckDB Local MCP](https://github.com/motherduckdb/mcp-server-motherduck) | CSV/Parquet·로컬 분석 DB 질의. **데이터 업무가 많으면** | 고정 Python·Windows DuckDB 모듈·서버 | 로컬 파일·읽기 모드부터. MotherDuck/S3/HTTP·DB 전환·확장 자동 설치/로드·외부 파일 접근 차단을 별도 구현. SELECT만 허용해도 파일/네트워크가 완전히 통제된다고 보지 않음 |

Playwright 원본은 allowed/blocked origins가 **보안 경계가 아니며 리다이렉트에 적용되지 않는다**고 명시한다. 이 옵션만으로 폐쇄망 보장을 주장하지 않는다. 페이지의 CDN·이미지·서비스워커 등 하위 요청도 호스트/OS 통제와 실제 관찰 대상이다.

MarkItDown 원본은 `convert_to_markdown(uri)`가 로컬 파일과 웹 URI를 다루며 인증 없는 네트워크 노출에 주의해야 한다고 명시한다. Ned에는 임의 URI를 그대로 전달하는 구성을 넣지 않는다. MCP의 읽기/쓰기 힌트만으로 승인 경계를 결정하지 않는다.

권장 조합은 C/C++ 중심이면 **1+2**, 웹 바이브 코딩까지 하면 **3**, 문서 기반 개발이 많으면 **4**, 데이터 분석까지 실행하려면 **6**이다. 5는 성능 분석 수요가 있을 때 추가한다. 새 MCP가 지침만 추가하는 작업보다 큰 이유는 실행 프로세스·파일/브라우저 권한·중지 확인까지 연결해야 하기 때문이다.

## 플러그인과 보류 항목

- [DCP](https://github.com/Tarquinen/opencode-dynamic-context-pruning/tree/master): 도구 결과 중복 제거·컨텍스트 압축은 긴 작업에 유용한 후보지만 **기본 탑재는 보류**한다. 확인한 원본은 OpenCode V2용이며 `autoUpdate: true`가 기본이고 프로젝트 설정이 전역 설정을 덮어쓴다. 업데이트 제거·고정 패키지·설정 우회 방지·사용자 결정/승인/완료 결과 보존·2.2.6 호환성·직접 Node I/O 검토가 필요하다. 원본의 개발 중심이 다른 제품으로 옮겨갔다는 안내도 고려했다. 이번에는 실행형 플러그인 코드를 설치하지 않았다.
- [Memory MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/memory): 로컬 JSONL 기억은 가능하지만 기존 OpenViking·Graphify와 저장소/보존/색인 정책이 중복된다. 명시적인 별도 요구가 있기 전 기본 추가하지 않는다.
- [Sequential Thinking MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking): 로컬 실행이 가능하지만 계획 지침과 중복되고 추가 호출 비용이 있다. 사내 모델에서 개선 근거 없이 우선 탑재하지 않는다.
- 일반 Filesystem MCP: 기존 호스트의 경로 제한·편집 승인·스냅샷과 중복한다. 이를 우회할 별도 쓰기 경로를 만들지 않는다.
- 외부 인터넷/계정이 필요한 Context7 호스팅 조회, Exa/Tavily/Brave/Firecrawl, GitHub 원격 MCP, Slack/Notion/Sentry, 클라우드 메모리·배포 서비스는 제외했다. 자체 호스팅 가능하다는 이유만으로 미구축 서버를 이미 사용할 수 있는 구성으로 계산하지 않았다.

## 검증 범위

Linux 빌드 실행기에서 기본 스킬 파일 해시, 새 정적 문서·참조의 호스트 접근, 변조 문서·스크립트·경로 이탈 거부를 확인한다. 공식 고정 v2 엔진의 설치 리소스 스킬 발견도 실제 API로 확인한다. 코드/지침 검토와 이런 합성·로컬 실행은 사내 Qwen의 스킬 선택 품질, Windows 설치, 전체 외부 통신 차단 검증을 대체하지 않는다. MCP 후보의 런타임·통신·승인 테스트는 선택 후 구현 범위다.

추가 요구에 따라 0.2.1에서 기본 패키지를 실제 OpenViking `/api/v1/skills` API로 등록한다. 참조 문서·라이선스를 포함한 로컬 ZIP만 전달하며 Git URL 설치를 사용하지 않는다. `l-vibe-` 이름으로 사용자 스킬과 구분하고 등록본 revision·패키지 해시를 사용자 데이터에 기록한다. 다른 내용의 기존 사본은 보존한다. 실제 OpenViking 0.5.4 서버와 합성 사내 모델에서 34개 등록 및 재시작 후 추가 임베딩 요청이 없음을 확인했다. 개인 대화·프로젝트 자료 자동 색인은 추가하지 않았다.
