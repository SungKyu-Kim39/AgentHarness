import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { editorVersion } from '../scripts/ned-editor-version.mjs';

const archive = path.resolve('.cache/ned/archives/zed-source-v1.28.1.tar.gz');
const zed = 'crates/zed/src/zed.rs';
const menus = 'crates/zed/src/zed/app_menus.rs';
const acp = 'crates/acp_thread/src/acp_thread.rs';
const completions = 'crates/agent_ui/src/completion_provider.rs';

test('the pinned editor patch preserves startup and groups Ned Agent slash commands', { skip: !existsSync(archive) }, async t => {
  const lock = JSON.parse(await readFile('ned-editor-source-lock.json', 'utf8'));
  const upstream = lock.upstream.artifacts.find(item => item.file === path.basename(archive));
  assert.equal(createHash('sha256').update(await readFile(archive)).digest('hex'), upstream.sha256);
  const root = await mkdtemp(path.join(tmpdir(), 'ned-editor-source-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const prefix = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).split('\n')[0].replace(/\/$/, '');
  for (const file of Object.keys(lock.files)) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, execFileSync('tar', ['-xOf', archive, prefix + '/' + file], { maxBuffer: 2 * 1024 * 1024 }));
  }
  await mkdir(path.join(root, 'crates/zed/resources'), { recursive: true });
  const before = await readFile(path.join(root, zed), 'utf8');
  execFileSync(process.execPath, ['scripts/patch-ned-editor.mjs', root]);
  const after = await readFile(path.join(root, zed), 'utf8');
  const start = before.indexOf('fn open_about_window('), end = before.indexOf('\nfn quit(', start);
  assert.equal(after.slice(0, start), before.slice(0, start));
  assert.equal(after.slice(after.indexOf('\nfn quit(', start)), before.slice(end));
  assert.ok(after.includes((await editorVersion(process.cwd())).about));
  assert.match(after, /Based on Zed 1\.28\.1/);
  const menu = await readFile(path.join(root, menus), 'utf8');
  assert.match(menu, /"About Ned"/);
  assert.match(menu, /"Quit Ned"/);
  assert.doesNotMatch(menu, /"About Zed"|"Quit Zed"/);
  assert.deepEqual(await readFile(path.join(root, 'crates/zed/resources/ned-icon.png')), await readFile('assets/ned-icon.png'));
  const categories = await readFile(path.join(root, acp), 'utf8');
  assert.match(categories, /"skill" => Some\(Self::Skill\)/);
  const popup = await readFile(path.join(root, completions), 'utf8');
  assert.match(popup, /CommandCategory::Skill\) => \("skills", "Skills"\)/);
  assert.match(popup, /CommandCategory::Mcp\) => \("mcp-commands", "MCP Server Commands"\)/);
  assert.match(popup, /None => \("acp-commands", "Commands"\)/);
  assert.throws(() => execFileSync(process.execPath, ['scripts/patch-ned-editor.mjs', root], { stdio: 'pipe' }), /Command failed/);
});
