import { readFile, writeFile, mkdir, readdir, cp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = {
  local: ['L-Vibe', '0.2.0', '.'],
  aegis: ['GanyuanRan/Aegis', 'e5f43c548a06c3f302c521a4c23f258296ccc947', 'vendor/sources/aegis'],
  openai: ['openai/skills', '49f948faa9258a0c61caceaf225e179651397431', '.cache/skill-sources/openai-skills'],
  anthropic: ['anthropics/skills', '2c5958ecac7cee2b583967a2c4981d0f4a75c579', '.cache/skill-sources/anthropic-skills'],
  vercel: ['vercel-labs/agent-skills', '1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62', '.cache/skill-sources/vercel-skills'],
  postgres: ['supabase/agent-skills', 'c9be0e931b7930f7d02126d04774d904c381e7d7', '.cache/skill-sources/postgres-skills'],
  qdrant: ['qdrant/skills', '1d010729e5e573c4736cae520b47b1acce785c02', '.cache/skill-sources/qdrant-skills'],
};
const definitions = [
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
    try { await readFile(path.join(root, directory, 'SKILL.md')); }
    catch {
      await mkdir(root, { recursive: true }); await mkdir('.cache/skill-sources', { recursive: true });
      const response = await fetch(`https://codeload.github.com/${repo}/tar.gz/${commit}`); if (!response.ok) throw new Error(`skill source HTTP ${response.status}`);
      const archive = `.cache/skill-sources/${sourceId}.tgz`; await writeFile(archive, Buffer.from(await response.arrayBuffer())); execFileSync('tar', ['-xzf', archive, '--strip-components=1', '-C', root]);
    }
    const destination = `vendor/skills/${id}`; await mkdir(destination, { recursive: true });
    const source = path.join(root, directory); const files = [];
    // Only static Markdown/text is exposed; upstream scripts and executable plugins are excluded.
    for (const file of await tree(source)) if (/\.(md|txt)$/i.test(file) || /^(LICENSE|COPYING)$/i.test(path.basename(file))) {
      const relative = path.relative(source, file).split(path.sep).join('/'); const target = path.join(destination, relative);
      await mkdir(path.dirname(target), { recursive: true }); await cp(file, target); files.push({ path: relative, sha256: hash(await readFile(target)) });
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
    const adapter = 'Read/Grep/Glob→read_file/search_text/list_files; Write/Edit→propose_edit (approval). No online installs, downloads, deployment, hooks, automatic Q&A, or agent spawning. Commands/browser runners require an approved bundled executor; if unavailable, report verification as not run. Project artifacts stay approval-gated.' + (sourceId === 'qdrant' ? ' Apply retrieval-quality principles to OpenViking; Qdrant APIs/database are not installed.' : '');
    skills.push({ id, name, description, directory: id, source: sourceId === 'local' ? 'L-Vibe original MIT guidance' : `https://github.com/${repo}/tree/${commit}/${directory}`, commit, license: licenses.map(l => l.path).join(', '), adapter, files: files.sort((a,b) => a.path.localeCompare(b.path)) });
  }
  const manifest = { schemaVersion: 1, purpose: 'offline vibe coding', skills };
  await writeFile('vendor/skills/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  await writeFile('skills-lock.json', JSON.stringify({ schemaVersion: 1, sources, manifestSha256: hash(await readFile('vendor/skills/manifest.json')), count: skills.length }, null, 2) + '\n');
  console.log(`Bundled ${skills.length} offline skills; executable scripts excluded.`);
} else if (process.argv[2] === 'verify') {
  const lock = JSON.parse(await readFile('skills-lock.json', 'utf8'));
  const bytes = await readFile('vendor/skills/manifest.json'); if (hash(bytes) !== lock.manifestSha256) throw new Error('스킬 목록 해시 불일치');
  const manifest = JSON.parse(bytes); for (const skill of manifest.skills) for (const f of skill.files) if (hash(await readFile(path.join('vendor/skills', skill.directory, f.path))) !== f.sha256) throw new Error(`스킬 해시 불일치: ${skill.id}/${f.path}`);
  console.log(`Verified ${manifest.skills.length} offline skills.`);
} else throw new Error('Usage: node scripts/bundle-skills.mjs fetch|verify');
