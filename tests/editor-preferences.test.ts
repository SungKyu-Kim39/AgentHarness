import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink}from'node:fs/promises';import{tmpdir}from'node:os';import path from'node:path';
import{parse}from'jsonc-parser';import{prepareEditor}from'../distribution/ned/profile';
async function fixture(t:any){const root=await mkdtemp(path.join(tmpdir(),'ned-preferences-'));t.after(()=>rm(root,{recursive:true,force:true}));await mkdir(path.join(root,'editor/config'),{recursive:true});return root;}
const launch=(root:string,version='one')=>prepareEditor(root,'/Ned-'+version,'/resources-'+version,'/descriptor-'+version,'http://127.0.0.1:9');
test('updates keep live JSONC fonts, panel layout, startup choice, keymap and workspace DB while refreshing managed endpoints',async t=>{
 const root=await fixture(t),file=path.join(root,'editor/config/settings.json');
 const original=`// MY_LAYOUT\n{\n "ui_font_size": 22, // MY_FONT\n "agent_ui_font_size":24,"agent_buffer_font_size":20,"agent_ui_font_family":"Malgun Gothic", "buffer_font_size": 19, "buffer_font_family":"Consolas",\n "terminal":{"font_size":18,"shell":{"program":"untrusted"}}, "agent":{"terminal_init_command":"untrusted","tool_permissions":{"default":"allow"},"dock":"left","default_width":520,"threads_sidebar":{"position":"right","default_width":280}},\n "project_panel":{"dock":"right","default_width":310}, "restore_on_startup":"last_session",\n "languages":{"C++":{"tab_size":8,"language_servers":["untrusted"]}},\n "agent_servers":{"Other":{"command":"untrusted"}},"telemetry":{"metrics":true},\n}\n`;
 await writeFile(file,original);await writeFile(path.join(root,'editor/appearance.json'),'{"ui_font_size":10,"theme":"stale"}');
 const keymap='// MY_KEYS\n[{"context":"Workspace","bindings":{"ctrl-shift-a":"custom::Action"}},]\n';await writeFile(path.join(root,'editor/config/keymap.json'),keymap);
 await mkdir(path.join(root,'editor/db'),{recursive:true});const db=path.join(root,'editor/db/workspace.sqlite');await writeFile(db,'opaque-workspace-layout');
 const first=await launch(root);let saved=parse(await readFile(file,'utf8'));
 assert.equal(saved.ui_font_size,22);assert.equal(saved.agent_ui_font_size,24);assert.equal(saved.agent_buffer_font_size,20);assert.equal(saved.agent_ui_font_family,"Malgun Gothic");assert.equal(saved.buffer_font_family,'Consolas');assert.equal(saved.terminal.font_size,18);assert.equal(saved.terminal.shell,undefined);assert.equal(saved.agent.tool_permissions,undefined);assert.equal(saved.agent.dock,'left');assert.equal(saved.agent.default_width,520);assert.equal(saved.agent.threads_sidebar.position,'right');assert.equal(saved.project_panel.dock,'right');assert.equal(saved.restore_on_startup,'last_session');assert.equal(saved.theme,undefined);
 assert.equal(saved.languages['C++'].tab_size,8);assert.ok(!JSON.stringify(saved).includes('untrusted'));assert.equal(saved.telemetry.metrics,false);assert.deepEqual(Object.keys(saved.agent_servers),['Ned']);
 assert.match(await readFile(file,'utf8'),/MY_LAYOUT/);assert.match(await readFile(file,'utf8'),/MY_FONT/);assert.equal(await readFile(path.join(root,'editor/config/settings.before-ned-0.3.3.jsonc'),'utf8'),original);
 // A later user edit wins over any stale appearance snapshot, including after another executable version.
 await writeFile(file,(await readFile(file,'utf8')).replace('"ui_font_size": 22','"ui_font_size": 25'));
 const second=await launch(root,'two');saved=parse(await readFile(file,'utf8'));assert.equal(saved.ui_font_size,25);assert.equal(saved.agent.dock,'left');assert.equal(saved.agent_servers.Ned.command,'/Ned-two');assert.equal(saved.agent_servers.Ned.args[0],'/resources-two/ned/agent.cjs');assert.equal(second.data,first.data);
 assert.equal(await readFile(keymapFile(root),'utf8'),keymap);assert.equal(await readFile(db,'utf8'),'opaque-workspace-layout');assert.equal(await readFile(path.join(root,'editor/config/settings.before-ned-0.3.3.jsonc'),'utf8'),original);
});
function keymapFile(root:string){return path.join(root,'editor/config/keymap.json')}
test('malformed/duplicate editor settings and linked keymaps are preserved without silent resetting',async t=>{
 const root=await fixture(t),file=path.join(root,'editor/config/settings.json');
 for(const text of ['{"ui_font_size":', '{"ui_font_size":18,"ui_font_size":24}']){await writeFile(file,text);await assert.rejects(launch(root),/JSONC/);assert.equal(await readFile(file,'utf8'),text);}
 await writeFile(file,'{}');const other=path.join(root,'other-keys');await writeFile(other,'[]');await symlink(other,keymapFile(root));await assert.rejects(launch(root),/일반 파일/);assert.equal(await readFile(other,'utf8'),'[]');
});
test('a new editor starts blank and creates the default keymap once; appearance is only a missing-file migration fallback',async t=>{
 const root=await fixture(t);await writeFile(path.join(root,'editor/appearance.json'),'{"ui_font_size":21}');
 await launch(root);const file=path.join(root,'editor/config/settings.json');let value=parse(await readFile(file,'utf8'));assert.equal(value.ui_font_size,21);assert.equal(value.restore_on_startup,'launchpad');assert.match(await readFile(keymapFile(root),'utf8'),/NewExternalAgentThread/);
 delete value.ui_font_size;await writeFile(file,JSON.stringify(value));await launch(root);value=parse(await readFile(file,'utf8'));assert.equal(value.ui_font_size,undefined);
});
test('UTF-8 BOM and comment-only editor settings survive managed preference updates',async t=>{
 const root=await fixture(t),file=path.join(root,'editor/config/settings.json');
 await writeFile(file,'\ufeff// UTF8_NOTE\n{"ui_font_size":23,}\n');await launch(root);let text=await readFile(file,'utf8');assert.ok(text.startsWith('\ufeff'));assert.match(text,/UTF8_NOTE/);assert.equal(parse(text.slice(1)).ui_font_size,23);
 await writeFile(file,'// ONLY_NOTE\n');await launch(root);text=await readFile(file,'utf8');assert.match(text,/ONLY_NOTE/);assert.equal(parse(text).restore_on_startup,'launchpad');
});
