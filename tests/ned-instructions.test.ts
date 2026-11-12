import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { ensureEditorInstructions, koreanInstructions } from '../distribution/ned/editor-instructions';
import { prepareEditor } from '../distribution/ned/profile';
import { configSchema } from '../src/shared/contracts';
import { engineConfiguration } from '../distribution/native-control';

test('initial profile includes the exact Korean block; repeated startup preserves custom text without duplication', async t => {
 const root = await mkdtemp(path.join(tmpdir(), 'ned-korean-')); t.after(() => rm(root, { recursive: true, force: true }));
 const directory = path.join(root, 'editor/config'); await mkdir(directory, { recursive: true });
 const custom = '# Team rules\n\nKeep existing conventions.\n'; await writeFile(path.join(directory, 'AGENTS.md'), custom);
 await prepareEditor(root, '/Ned', '/resources', '/descriptor', 'http://127.0.0.1:9');
 const content = await readFile(path.join(directory, 'AGENTS.md'), 'utf8');
 assert.ok(content.startsWith(custom)); assert.ok(content.endsWith(koreanInstructions + '\n'));
 await prepareEditor(root, '/Ned', '/resources', '/descriptor', 'http://127.0.0.1:9');
 assert.equal(await readFile(path.join(directory, 'AGENTS.md'), 'utf8'), content);
 const config = configSchema.parse({ model: { baseUrl: 'http://127.0.0.1:19350/v1', apiKey: 'synthetic', id: 'coding' } });
 const models: any = [{ provider: 'intranet', name: 'Coding', id: 'coding', gateway: { baseUrl: 'http://127.0.0.1:19351/v1', token: 'local' } }];
 assert.ok(engineConfiguration(config, models).agents.build.system.endsWith(koreanInstructions));
});

test('missing instruction file is created, while a linked file outside the profile is preserved', async t => {
 const root = await mkdtemp(path.join(tmpdir(), 'ned-korean-link-')); t.after(() => rm(root, { recursive: true, force: true }));
 await ensureEditorInstructions(root); assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), koreanInstructions + '\n');
 await rm(path.join(root, 'AGENTS.md')); const outside = path.join(root, 'outside.md'); await writeFile(outside, 'preserve');
 await symlink(outside, path.join(root, 'AGENTS.md'));
 await assert.rejects(ensureEditorInstructions(root), /AGENTS.md/);
 assert.equal(await readFile(outside, 'utf8'), 'preserve');
});
