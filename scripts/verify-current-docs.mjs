import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const text = file => readFile(new URL('../'+file, import.meta.url), 'utf8');
const {version} = JSON.parse(await text('package.json'));
const {count} = JSON.parse(await text('skills-lock.json'));
for (const file of ['docs/requirements.md','docs/ned-architecture.md','docs/offline-setup.md','docs/ned-user-guide.md','docs/ned-introduction.md','docs/ned-vs-zed.md','docs/ned-auto-routing-guide.md','README.md']) {
  const guide = await text(file);
  assert.ok(new RegExp(`(?:스킬|스킬 \\S+) ${count}(?:개|종)`).test(guide), `Versioned skill count has drifted in ${file}`);
  assert.ok(guide.includes(version), `Current version is absent in ${file}`);
}
const linkFreeGuide = await text('docs/ned-auto-routing-guide.md');
assert.ok(!/\[[^\]]+\]\([^)]+\)|https?:\/\//i.test(linkFreeGuide), 'docs/ned-auto-routing-guide.md must remain strictly link-free');
