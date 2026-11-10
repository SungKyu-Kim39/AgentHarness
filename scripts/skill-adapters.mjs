// These are static-document adaptations, never executable OpenCode plugins.
export const policies = {
  'cpp-pro': '먼저 실제 컴파일러·SDK·C++ 표준·ABI·예외/RTTI 정책을 조사한다. C++20/23, concepts, GCC 플래그, sanitizer를 기존 프로젝트에 강제하지 않는다. VxWorks 지원 유지 여부가 미결이면 해당 변경만 보류하고 분석은 계속한다. compile_commands.json과 SDK 헤더가 없으면 의미 분석의 정확도 제한을 밝힌다. MSVC/VxWorks에서 지원하지 않는 검증을 실행했다고 기록하지 않는다.',
  'cpp-testing': '기존 테스트 프레임워크와 컴파일러를 우선한다. GoogleTest·CMake·sanitizer는 런타임에 포함됐다는 뜻이 아니다. 반입된 로컬 패키지만 사용하고 FetchContent나 자동 패키지 복구로 다운로드하지 않는다. 실제 테스트 실행기가 없으면 테스트 코드와 실행 계획만 제안하고 미실행으로 기록한다.',
  'legacy-modernizer': '기존 동작의 특성화 테스트·의존성·플랫폼 제약부터 확인한다. 웹 트래픽 전환·마이크로서비스·80% 커버리지·상용 모니터링을 일률적으로 요구하지 않는다. 임베디드/VxWorks→Windows 포팅은 스레드·스케줄링·엔디언·정렬·소켓·시간·파일 경로·ABI와 롤백을 검토한다. 독점 SDK는 자동 반입하지 않는다.',
  'api-design': '실제 사내 API 계약과 서버 제약을 먼저 읽는다. 예제는 로컬 코드 설계 참고이며 외부 API 호출·배포·인증 설정 권한을 부여하지 않는다. 호환성·입력 검증·인증/인가·오류 응답·재시도/멱등성을 확인하고 키와 개인정보를 예제·로그에서 제거한다.',
  'codebase-onboarding': '호스트의 승인된 프로젝트 읽기·검색과 실제 Graphify/REA 결과만 사용한다. 텍스트 검색을 의미 분석으로 표현하지 않는다. 먼저 기존 프로젝트 지침·Conductor 트랙을 읽는다. 온보딩 설명은 대화로 제공하며 CLAUDE.md 등 추가 문서는 요청에 필요할 때만 승인된 편집으로 제안한다. 전역 설정·개인 설정·엔진 권한을 수정하지 않는다.',
  'database-migrations': '대상 DB와 버전을 확인하고 실제 백업·복구 절차를 정한다. 예제 ORM/DB 런타임은 설치되지 않는다. 로컬에 이미 반입된 실행 파일과 의존성만 사용한다. 스키마·데이터 변경, reset, 배포는 명시적 대상·영향·백업·사용자 승인이 필요하다. 자동 복구나 다운그레이드가 가능하다고 추정하지 않는다.',
  'error-handling-patterns': '기존 예외/Result/오류 코드 정책과 ABI를 존중한다. 로그의 키·토큰·개인정보를 제거한다. 재시도에는 횟수·기한·멱등성·취소를 둔다. 파일 수정·명령의 승인이나 중지 상태가 불명확하면 자동 재시도하지 않는다. 외부 결제/네트워크 예제는 패턴 설명이며 연결할 서비스가 아니다.',
  'architecture-decision-records': '실제 범위·호환성·데이터 보존에 영향을 주는 결정만 짧게 기록한다. 기존 Conductor spec/plan·ADR을 재사용한다. 팀 리뷰·알림·티켓 생성은 사용자가 요구하거나 기존 팀 정책이 있을 때만 다루며 메시지를 자동 전송하지 않는다. ADR 파일 생성·상태 변경은 승인된 프로젝트 편집이다.',
  'differential-review': '프로젝트 안의 변경 전후·호스트 스냅샷·사용자가 제공한 diff를 근거로 보안 회귀를 조사한다. Git 실행기가 없으면 blame/이력을 실행한 것으로 기록하지 않는다. 실제 호출자·권한·입력·자원 수명과 테스트 근거를 확인하고 분석 한계를 밝힌다. 다른 플러그인·하위 에이전트에 자동 위임하지 않는다. 보고서는 대화로 제공할 수 있고 파일은 요청에 필요할 때 프로젝트 안에 승인된 편집으로 제안한다.',
  'session-handoff': '작업 중 확인한 사실·사용자 결정·변경·검증·미결 사항을 근거와 함께 인계한다. 대화·지식 저장소·프로젝트 문서 사이의 자동 복사를 하지 않는다. 영속 문서가 필요하면 승인된 프로젝트 편집으로 제안한다.',
};

function replace(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`Pinned skill adaptation no longer matches: ${label}`);
  return text.replace(before, after);
}

export function adaptDocument(id, document, original, description) {
  if (!policies[id]) return original;
  let text = original;
  if (id === 'cpp-pro' && document === 'SKILL.md') {
    text = replace(text, '2. **Design with concepts** — Create type-safe interfaces using C++20 concepts', '2. **Design compatible interfaces** — Use the existing C++ standard; concepts only when supported', id);
    text = replace(text, '- Use concepts for template constraints', '- Use constraints compatible with the existing compiler and standard', id);
    text = replace(text, '- Run AddressSanitizer and UndefinedBehaviorSanitizer', '- Run supported, locally available sanitizers through an approved executor; otherwise record not run', id);
  }
  if (id === 'cpp-pro' && document === 'references/build-tooling.md') {
    text = replace(text, '# Dependencies with FetchContent\ninclude(FetchContent)\n\nFetchContent_Declare(\n    fmt\n    GIT_REPOSITORY https://github.com/fmtlib/fmt.git\n    GIT_TAG 10.1.1\n)\nFetchContent_MakeAvailable(fmt)', '# L-Vibe: resolve a previously imported local package; never download.\n# CMAKE_PREFIX_PATH must point to an approved local dependency prefix.\nfind_package(fmt CONFIG REQUIRED)', id);
    const cut = text.indexOf('## Conan Package Manager');
    if (cut < 0) throw new Error('Missing pinned C++ online-package appendix');
    text = text.slice(0, cut) + '## Offline dependencies and validation\n\nUse the project\'s reviewed local dependency set. Online Conan installation and GitHub-hosted CI examples were omitted in this L-Vibe adaptation. Local tools in the examples are optional prerequisites, not bundled capabilities.\n';
  }
  if (id === 'cpp-testing' && document === 'SKILL.md') {
    text = replace(text, 'include(FetchContent)\n# Prefer project-locked versions. If using a tag, use a pinned version per project policy.\nset(GTEST_VERSION v1.17.0) # Adjust to project policy.\nFetchContent_Declare(\n  googletest\n  # Google Test framework (official repository)\n  URL https://github.com/google/googletest/archive/refs/tags/${GTEST_VERSION}.zip\n)\nFetchContent_MakeAvailable(googletest)', '# L-Vibe: use a previously imported local GoogleTest package.\n# A missing package is an unmet prerequisite, not permission to download.\nfind_package(GTest CONFIG REQUIRED)', id);
  }
  if (id === 'legacy-modernizer') {
    text = text.replaceAll('Target 80%+ coverage of existing behavior.', 'Agree coverage for the actual changed behavior and risk.').replaceAll('(target 80%+)', '(scope matched to actual risk)');
    text = text.replaceAll('# Install: pip install mutmut', '# Optional: use an already imported local mutmut executable; no package installation.');
  }
  // npx may silently download missing packages. Examples use only an existing local
  // executable; the adapter requires resolving its Windows .cmd counterpart.
  if (id === 'database-migrations' || id === 'codebase-onboarding') text = text.replaceAll('npx prisma ', './node_modules/.bin/prisma ').replaceAll('npx drizzle-kit ', './node_modules/.bin/drizzle-kit ');
  if (id === 'architecture-decision-records' && document === 'SKILL.md') {
    const start = text.indexOf('### Automation (adr-tools)'); const end = text.indexOf('## Review Process', start);
    if (start < 0 || end < 0) throw new Error('Missing pinned ADR automation section');
    text = text.slice(0, start) + '### Local document workflow\n\nUse the bundled decision templates and approved host edits to propose an ADR and its index entry. No adr-tools installation is needed. Supersede accepted decisions with a new record instead of overwriting their rationale.\n\n' + text.slice(end);
    text = text.replace('- [ ] At least 2 senior engineers reviewed', '- [ ] Reviewers required by the existing team policy consulted').replace('- [ ] Team notified', '- [ ] Team notification handled only if explicitly requested');
  }
  if (id === 'differential-review' && document === 'SKILL.md') {
    text = replace(text, '│  └─ Or delegate to: differential-review:adversarial-modeler agent\n│     (Autonomous attacker modeling with concrete exploit scenarios)', '│  └─ Perform the adversarial analysis locally; no agent plugin is required', id);
    const start = text.indexOf('## Agents'); const end = text.indexOf('## Quality Checklist', start);
    if (start < 0 || end < 0) throw new Error('Missing pinned agent section');
    text = text.slice(0, start) + text.slice(end);
    const integration = text.indexOf('## Integration'); const example = text.indexOf('## Example Usage', integration);
    if (integration < 0 || example < 0) throw new Error('Missing pinned integration section');
    text = text.slice(0, integration) + '## L-Vibe integration\n\nUse the bundled security and code review guidance selectively. No audit-context-building or issue-writer plugin is installed.\n\n---\n\n' + text.slice(example);
    text = text.replaceAll('Always generate comprehensive markdown report file', 'Provide an evidence-based report; propose a project file only when useful and approved').replaceAll('Always write report', 'Preserve findings in the answer or an approved project report').replaceAll('Report file generated', 'Findings and analysis limits delivered').replaceAll('Always generate the output file', 'Provide the report in the answer or an approved project file').replaceAll('Output report only to chat (file required)', 'Write outside the approved project or claim unperformed history analysis');
  }
  if (id === 'differential-review' && document === 'reporting.md') {
    const start = text.indexOf('**Priority order for output:**'); const end = text.indexOf('**Filename format:**', start);
    if (start < 0 || end < 0) throw new Error('Missing pinned report output locations');
    text = text.slice(0, start) + 'Return the report in the conversation. If a persistent report is needed, propose a file inside the approved project through the host editor. Do not write to Desktop, a global skills directory, or a temporary fallback.\n\n' + text.slice(end);
    const tail = text.indexOf('## Integration with issue-writer');
    if (tail < 0) throw new Error('Missing pinned report integration');
    text = text.slice(0, tail) + '## Write failure\n\nIf an approved project write fails, report the failure and provide the report in the conversation. Do not retry outside the approved project.\n';
  }
  if (document === 'SKILL.md') {
    // Official Desktop discovers SKILL.md directly, so the safety mapping must
    // also be inside the document, not just in the host catalog metadata.
    text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
    text = `---\nname: ${id}\ndescription: ${JSON.stringify(description)}\n---\n\n# L-Vibe offline adaptation\n\nThis is a reviewed static skill, not an executable plugin. Read only the relevant references. Local guidance needs no external Internet; citation URLs are attribution only. The model connection remains the configured intranet API.\n\n${policies[id]}\n\nUse approved project reads/searches and host-mediated edits. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, change permissions, spawn agents, or send messages. A command, compiler, browser, database, test runner or SDK mentioned below is not installed by this skill. Use an approved local executor if available; otherwise report verification as not run. Local node_modules examples require an existing package and the appropriate Windows executable path. User decisions and host policy take precedence. See ADAPTATION.md for provenance and modifications.\n\n---\n\n${text}`;
  }
  return text;
}
