import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { adaptDocument, policies, documentLayouts } from './skill-adapters.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const productVersion = JSON.parse(await readFile('package.json', 'utf8')).version;
const sources = {
  agentDesktop: ['vercel-labs/agent-desktop', '2b0a7334fc111730454b726e6800aa41cdafc093', '.cache/agent-desktop/source'],
  local: ['Ned', productVersion, '.'],
  aegis: ['GanyuanRan/Aegis', 'e5f43c548a06c3f302c521a4c23f258296ccc947', 'vendor/sources/aegis'],
  openai: ['openai/skills', '49f948faa9258a0c61caceaf225e179651397431', '.cache/skill-sources/openai-skills'],
  anthropic: ['anthropics/skills', '2c5958ecac7cee2b583967a2c4981d0f4a75c579', '.cache/skill-sources/anthropic-skills'],
  vercel: ['vercel-labs/agent-skills', '1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62', '.cache/skill-sources/vercel-skills'],
  postgres: ['supabase/agent-skills', 'c9be0e931b7930f7d02126d04774d904c381e7d7', '.cache/skill-sources/postgres-skills'],
  qdrant: ['qdrant/skills', '1d010729e5e573c4736cae520b47b1acce785c02', '.cache/skill-sources/qdrant-skills'],
  jeffallan: ['Jeffallan/claude-skills', '078a25cc5bfd8011459be7b91d004e900c1d02d3', '.cache/skill-research/jeffallan'],
  ecc: ['affaan-m/ECC', 'd2ef2680594f9a17526a6e1a2e18b3d242c5d17b', '.cache/skill-research/ecc'],
  wshobson: ['wshobson/agents', '9c61ab243def98f72da12abd41cfcf5bcd91af9d', '.cache/skill-research/wshobson'],
  trailofbits: ['trailofbits/skills', 'e4dd0bb5b15535f7c5a0834187dffba6ac37e4ff', '.cache/skill-research/trailofbits'],
  anthropicWork: ['anthropics/knowledge-work-plugins', 'e605d8ddbfb688da57dfaaceebd93f12a64ef1d3', '.cache/skill-research/anthropicWork'],
  marketing: ['coreyhaines31/marketingskills', '9d6d7ce8d18eb155dc2f9762435f097e60cdad7c', '.cache/skill-research/marketing'],
  vercelInterface: ['vercel-labs/web-interface-guidelines', '434b7f91364665f2f733b310ec54809bf8f37937', '.cache/skill-research/vercelInterface'],
};
const sourceArchiveHashes = {
  agentDesktop: 'b8e5c536ba6e66f2e82b6863c198e06f1d11fcdfc100d44de0a871a38a82dc7f',
  jeffallan: 'ec911f76f63e1f4fd4b28925474cbae7c9f7b652a26ddba586b1173af94e2870',
  ecc: 'dc15cf3bfbb7985f203ba643290be61c500b0679f5d02255c9277c6ad6ea4cc9',
  wshobson: 'b5bcfff7fcba3c8ae961a860e03b0900a3c8bdfc1773ca0e2d787bc8c5f2c5f2',
  trailofbits: 'ef7634604172b06f8fec967c726d0402f8f616d2dff9eae7eb1156e1c6e3ae4b',
  anthropicWork: '45429c6ef7dba465cba93eec02d4cf09822b9c783630e94c7c5312d7d5fc3fe9',
  marketing: '48a1f6187dff0eb9176e6d38906dbcb5e2581a08716c56f8cc3ee2f17f0791d6',
  vercelInterface: 'f0f61f41f0b53522eb065b268e18a617bf2cacb54d9502ed6b7411cb62de8745',
};
const definitions = [
  ['agent-desktop','agentDesktop','skills/agent-desktop','데스크톱 UI 작업','승인한 창의 접근성 트리·qualified ref·의미 기반 동작·결과 확인'],
  ['agent-desktop-windows','agentDesktop','skills/agent-desktop-windows','Windows UI 자동화','Windows UIA 지원 범위·권한·대화형 세션·안전한 재관찰'],
  ['goal-framing','aegis','skills/goal-framing','요구사항 구체화','자연어 아이디어를 목적·범위·수용 기준으로 정리'],
  ['writing-plans','aegis','skills/writing-plans','구현 계획','여러 파일 변경을 검증 가능한 단계로 나누기'],
  ['test-driven-development','aegis','skills/test-driven-development','테스트 주도 개발','실패 재현·회귀 테스트·최소 구현'],
  ['systematic-debugging','aegis','skills/systematic-debugging','원인 기반 디버깅','오류 로그와 재현으로 원인을 검증'],
  ['verification-before-completion','aegis','skills/verification-before-completion','완료 전 검증','실제 실행 근거와 미실행 검증 구별'],
  ['requesting-code-review','aegis','skills/requesting-code-review','코드 리뷰','변경 영향·버그·회귀 위험 검토'],
  ['skill-creator','openai','skills/.system/skill-creator','스킬 작성','팀의 반복 개발 절차를 프로젝트 스킬로 제안'],
  ['security-best-practices','openai','skills/.curated/security-best-practices','보안 구현 검토','언어·프레임워크에 맞는 보안 점검'],
  ['security-threat-model','openai','skills/.curated/security-threat-model','위협 모델','신뢰 경계·데이터 흐름·공격 경로 검토'],
  ['frontend-design','anthropic','skills/frontend-design','프런트엔드 설계','목적에 맞는 UI·레이아웃·상호작용 설계'],
  ['webapp-testing','anthropic','skills/webapp-testing','웹 앱 테스트','사용자 흐름·브라우저 검증 계획과 테스트 코드'],
  ['mcp-builder','anthropic','skills/mcp-builder','MCP 개발','작은 도구 인터페이스와 검증 가능한 서버 구현'],
  ['developer-documents','local','skills/developer-documents','개발 문서','요구사항·설계·운영·검증 문서의 구조화'],
  ['ui-accessibility','local','skills/ui-accessibility','UI 사용성·접근성','키보드·포커스·상태·반응형 동작 검토'],
  ['react-best-practices','vercel','skills/react-best-practices','React 품질','렌더링·데이터 흐름·성능 검토'],
  ['composition-patterns','vercel','skills/composition-patterns','컴포넌트 구조','재사용 가능한 구성과 복잡성 관리'],
  ['postgres-best-practices','postgres','skills/supabase-postgres-best-practices','PostgreSQL 품질','SQL·인덱스·트랜잭션·권한 검토'],
  ['rag-search-quality','qdrant','skills/qdrant-search-quality','검색 품질','임베딩·청킹·관련성·회귀 평가; OpenViking에 원리 적용'],
  ['cpp-pro','jeffallan','skills/cpp-pro','C++ 구현·성능','C++ 코드·자원 수명·동시성·빌드 문제; 기존 SDK·컴파일러 표준 유지'],
  ['cpp-testing','ecc','skills/cpp-testing','C++ 테스트','C++ 회귀·특성화·GoogleTest/CTest·sanitizer; 반입된 로컬 도구만 사용'],
  ['legacy-modernizer','jeffallan','skills/legacy-modernizer','레거시 개선·포팅','기존 동작 조사·점진 이행·플랫폼 제약·롤백 검증'],
  ['codebase-onboarding','ecc','skills/codebase-onboarding','기존 코드 파악','처음 여는 저장소의 진입점·구조·데이터 흐름·규칙을 실제 파일로 확인'],
  ['api-design','ecc','skills/api-design','API 계약 설계','REST 경로·응답·오류·페이지 처리·호환성·멱등성 검토'],
  ['database-migrations','ecc','skills/database-migrations','DB 마이그레이션','스키마·데이터 변경의 백업·호환성·복구·검증; 변경은 승인 대상'],
  ['error-handling-patterns','wshobson','plugins/developer-essentials/skills/error-handling-patterns','오류 처리·복구','예외·Result·오류 코드·취소·제한된 재시도·자원 정리'],
  ['architecture-decision-records','wshobson','plugins/documentation-generation/skills/architecture-decision-records','설계 결정 기록','대안·선택 근거·결과·되돌리기를 기존 트랙 또는 짧은 ADR로 정리'],
  ['differential-review','trailofbits','plugins/differential-review/skills/differential-review','보안 변경 리뷰','변경 전후의 보안 회귀·영향 범위·공격 조건·테스트 근거 검토'],
  ['session-handoff','local','skills/session-handoff','작업 인계·재개','장기 작업의 사용자 결정·확인한 사실·변경·검증·미결 사항을 근거와 함께 인계'],
  ['explore-data','anthropicWork','data/skills/explore-data','로컬 데이터 탐색','CSV·JSON·테이블 결과의 단위·키·결측·중복·분포·품질 조사'],
  ['validate-data','anthropicWork','data/skills/validate-data','분석 결과 검증','조인·분모·기간·편향·계산·시각화·결론의 근거와 재현성 검토'],
  ['data-visualization','anthropicWork','data/skills/data-visualization','데이터 시각화','로컬 결과의 차트·축·단위·불확실성·접근성; 외부 CDN 없는 산출물'],
  ['statistical-analysis','anthropicWork','data/skills/statistical-analysis','통계 해석','분포·이상치·가설 검정·효과 크기·신뢰 구간·표본·인과 해석의 한계'],
  ['ab-testing','marketing','skills/ab-testing','A/B 실험 설계·판정','가설·무작위 배정·MDE·검정력·표본 수·가드레일·중지 규칙; 로컬 계산 예제'],
  ['web-design-guidelines','vercelInterface','.','UI 품질 검토','로컬 고정 UI 규칙으로 접근성·포커스·폼·상태·반응형·성능·한국어 사용성 검토'],
];
async function tree(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('스킬 심볼릭 링크 차단');
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await tree(file)); else files.push(file);
  } return files.sort();
}
if (process.argv[2] === 'fetch') {
  const skills = [];
  for (const [id, sourceId, directory, name, description] of definitions) {
    const [repo, commit, root] = sources[sourceId];
    const layout = documentLayouts[id];
    try { await readFile(path.join(root, directory, layout?.entry ?? 'SKILL.md')); }
    catch {
      await mkdir(root, { recursive: true }); await mkdir('.cache/skill-sources', { recursive: true });
      const response = await fetch(`https://codeload.github.com/${repo}/tar.gz/${commit}`); if (!response.ok) throw new Error(`skill source HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (sourceArchiveHashes[sourceId] && hash(bytes) !== sourceArchiveHashes[sourceId]) throw new Error(`${sourceId}: source archive hash mismatch`);
      const archive = `.cache/skill-sources/${sourceId}.tgz`; await writeFile(archive, bytes); execFileSync('tar', ['-xzf', archive, '--strip-components=1', '-C', root]);
    }
    const destination = `vendor/skills/${id}`; await rm(destination, { recursive: true, force: true }); await mkdir(destination, { recursive: true });
    const source = path.join(root, directory); const files = []; const modifications = [];
    // Only static Markdown/text is exposed; upstream scripts and executable plugins are excluded.
    for (const file of await tree(source)) if (/\.(md|txt)$/i.test(file) || /^(LICENSE|COPYING)$/i.test(path.basename(file))) {
      const upstreamRelative = path.relative(source, file).split(path.sep).join('/');
      if (layout && !layout.files.includes(upstreamRelative)) continue;
      const relative = upstreamRelative === layout?.entry ? 'SKILL.md' : upstreamRelative;
      const target = path.join(destination, relative);
      if (policies[id] && relative !== 'SKILL.md' && path.basename(relative) === 'SKILL.md') throw new Error(`${id}: unexpected nested Desktop skill`);
      const original = await readFile(file); const adapted = /\.md$/i.test(file) ? Buffer.from(adaptDocument(id, relative, original.toString('utf8'), description)) : original;
      await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, adapted); files.push({ path: relative, sha256: hash(adapted) });
      if (!original.equals(adapted)) modifications.push({ path: relative, ...(upstreamRelative !== relative ? { upstreamPath: upstreamRelative } : {}), upstreamSha256: hash(original), bundledSha256: hash(adapted) });
    }
    let licenses = files.filter(f => /(?:^|\/)(LICENSE|COPYING)/i.test(f.path));
    if (!licenses.length) for (const f of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license.md']) {
      const bytes = await readFile(path.join(root, f)).catch(() => undefined); if (!bytes) continue;
      await writeFile(path.join(destination, f), bytes); const entry = { path: f, sha256: hash(bytes) }; files.push(entry); licenses.push(entry); break;
    }
    if (!licenses.length && sourceId === 'vercel' && /## License\s+MIT/.test(await readFile(path.join(root, 'README.md'), 'utf8'))) {
      const bytes = Buffer.from('Upstream license declaration: https://github.com/' + repo + '/blob/' + commit + '/README.md#license\n\n' + (await readFile('LICENSE', 'utf8')).replace(/Copyright \(c\)[^\n]*/, 'Copyright (c) Vercel contributors'));
      await writeFile(path.join(destination, 'LICENSE.txt'), bytes); const entry = { path: 'LICENSE.txt', sha256: hash(bytes) }; files.push(entry); licenses.push(entry);
    }
    // Vercel distributes its skill guidance as MIT, declared in its skill package metadata.
    if (!licenses.length) throw new Error(`${id}: explicit redistribution license is required`);
    const adapter = 'Read/Grep/Glob→read_file/search_text/list_files; Write/Edit→propose_edit (approval). No online installs, downloads, deployment, hooks, automatic Q&A, or agent spawning. Commands/browser runners require an approved bundled executor; if unavailable, report verification as not run. Project artifacts stay approval-gated.' + (sourceId === 'qdrant' ? ' Apply retrieval-quality principles to OpenViking; Qdrant APIs/database are not installed.' : '') + (policies[id] ? ' ' + policies[id] : '');
    if (policies[id]) {
      const licenseName = sourceId === 'trailofbits' ? 'CC-BY-SA-4.0' : ['anthropicWork','agentDesktop'].includes(sourceId) ? 'Apache-2.0' : 'MIT';
      const notice = `# Ned offline adaptation\n\nUpstream: ${sourceId === 'local' ? 'Ned original guidance' : `https://github.com/${repo}/tree/${commit}/${directory}`}\n\nOriginal authors: ${sourceId === 'local' ? 'Ned contributors' : `${repo} contributors`}\n\nCommit: ${commit}\n\nLicense: ${licenseName}; see ${licenses.map(l => l.path).join(', ')}. Original author attribution and license are retained. This adapted skill and notice are distributed under ${licenseName}; the application license does not replace the upstream license. Modifications by Ned contributors.\n\nModified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.\n\nSpecific policy: ${policies[id]}\n\nChanged documents (hashes are also retained in the manifest):\n\n${modifications.map(m => `- ${m.path}${m.upstreamPath ? ` (upstream ${m.upstreamPath})` : ''}: upstream ${m.upstreamSha256}; bundled ${m.bundledSha256}`).join('\n')}\n`;
      await writeFile(path.join(destination, 'ADAPTATION.md'), notice); files.push({ path: 'ADAPTATION.md', sha256: hash(notice) });
    }
    skills.push({ id, name, description, directory: id, source: sourceId === 'local' ? 'Ned original MIT guidance' : `https://github.com/${repo}/tree/${commit}/${directory}`, commit, license: licenses.map(l => l.path).join(', '), adapter, ...(policies[id] ? { modifications } : {}), files: files.sort((a,b) => a.path.localeCompare(b.path)) });
  }
  const manifest = { schemaVersion: 1, purpose: 'offline vibe coding', skills };
  await writeFile('vendor/skills/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  await writeFile('skills-lock.json', JSON.stringify({ schemaVersion: 1, sources, sourceArchiveHashes, manifestSha256: hash(await readFile('vendor/skills/manifest.json')), count: skills.length }, null, 2) + '\n');
  console.log(`Bundled ${skills.length} offline skills; executable scripts excluded.`);
} else if (process.argv[2] === 'verify') {
  const lock = JSON.parse(await readFile('skills-lock.json', 'utf8'));
  const bytes = await readFile('vendor/skills/manifest.json'); if (hash(bytes) !== lock.manifestSha256) throw new Error('스킬 목록 해시 불일치');
  const manifest = JSON.parse(bytes);
  if (manifest.skills.length !== lock.count || new Set(manifest.skills.map(s => s.id)).size !== lock.count) throw new Error('스킬 개수/ID 불일치');
  const registered = new Set(['manifest.json']);
  for (const skill of manifest.skills) for (const f of skill.files) {
    const relative = path.posix.join(skill.directory, f.path);
    if (relative.startsWith('../') || path.isAbsolute(relative)) throw new Error('스킬 경로 범위 오류');
    registered.add(relative);
    if (hash(await readFile(path.join('vendor/skills', relative))) !== f.sha256) throw new Error(`스킬 해시 불일치: ${skill.id}/${f.path}`);
  }
  for (const file of await tree('vendor/skills')) if (!registered.has(path.relative('vendor/skills', file).split(path.sep).join('/'))) throw new Error(`미등록 스킬 파일: ${file}`);
  console.log(`Verified ${manifest.skills.length} offline skills.`);
} else throw new Error('Usage: node scripts/bundle-skills.mjs fetch|verify');
