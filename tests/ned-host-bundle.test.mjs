import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createPackage, extractFile } from '@electron/asar';
import { hostAliases } from '../scripts/ned-host-build.mjs';
import { verifyBundledHost } from '../scripts/ned-host-smoke.mjs';
const common = { bundle:true,platform:'node',format:'cjs',target:'node22',write:false,logLevel:'silent' };
test('shipped host imports initialize from isolated ASAR bytes; UMD regression fails the same gate', async () => {
  const entry = { ...common, entryPoints:['distribution/ned/main.ts'],external:['electron'],define:{NED_VERSION:'"0.3.3"'} };
  const broken = await build({ ...entry,alias:{'jsonc-parser':path.resolve('node_modules/jsonc-parser/lib/umd/main.js')} });
  assert.throws(()=>verifyBundledHost(broken.outputFiles[0].contents),/UNBUNDLED_HOST_IMPORT: \.\/impl\/format/);
  const fixed = await build({ ...entry,alias:hostAliases });
  const folder=await mkdtemp(path.join(tmpdir(),'ned-host-bundle-'));
  try {
    await mkdir(folder+'/app');
    await writeFile(folder+'/app/main.cjs',fixed.outputFiles[0].contents);
    await writeFile(folder+'/app/package.json','{"name":"ned","main":"main.cjs"}');
    await createPackage(folder+'/app',folder+'/app.asar');
    const result=verifyBundledHost(extractFile(folder+'/app.asar','main.cjs'));
    assert.equal(result.passed,true);
    assert.equal(result.stoppedBeforeApplicationStartup,true);
    assert.deepEqual(result.nonBuiltinImports,['electron']);
  } finally { await rm(folder,{recursive:true,force:true}); }
});
test('bundled JSONC parser, formatter and editor retain actual UI preferences with no node_modules', async () => {
  const compiled=await build({...common,entryPoints:['distribution/ned/editor-preferences.ts'],alias:hostAliases});
  const folder=await mkdtemp(path.join(tmpdir(),'ned-jsonc-bundle-'));
  try {
    await writeFile(folder+'/preferences.cjs',compiled.outputFiles[0].contents);
    await mkdir(folder+'/config');
    const original='// retain this comment\n{ "buffer_font_size": 19, "agent": {"dock":"left",}, "agent_servers": {"old":{}}, }\n';
    await writeFile(folder+'/config/settings.json',original);
    const { editorPreferences }=createRequire(import.meta.url)(folder+'/preferences.cjs');
    const updated=await editorPreferences(folder,{agent_servers:{Ned:{command:'managed'}}});
    assert.match(updated,/retain this comment/);
    assert.match(updated,/"buffer_font_size": 19/);
    assert.match(updated,/"dock":\s*"left"/);
    assert.match(updated,/"command": "managed"/);
    assert.doesNotMatch(updated,/"old"/);
    assert.equal(await readFile(folder+'/config/settings.before-ned-0.3.3.jsonc','utf8'),original);
    await writeFile(folder+'/config/settings.json',updated);
    assert.equal(await editorPreferences(folder,{agent_servers:{Ned:{command:'managed'}}}),updated);
  } finally { await rm(folder,{recursive:true,force:true}); }
});
