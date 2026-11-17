import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm}from'node:fs/promises';
import {tmpdir}from'node:os';import path from'node:path';import{parse}from'jsonc-parser';
import{terminalShell,supportedTerminal,setDefaultTerminal,ensureTerminalTasks}from'../distribution/ned/terminal';
import{prepareEditor}from'../distribution/ned/profile';
test('CMD selection survives an update; both independent terminals preserve JSONC and use the selected project',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-terminal-'));t.after(()=>rm(root,{recursive:true,force:true}));const editor=path.join(root,'editor');await mkdir(path.join(editor,'config'),{recursive:true});
 const file=path.join(editor,'config/settings.json');await writeFile(file,'// USER_NOTE\n{"terminal":{"font_size":19}}');
 await setDefaultTerminal(editor,'cmd');await prepareEditor(root,'/Ned','/resources','/descriptor','http://127.0.0.1:9');
 const value=parse(await readFile(file,'utf8'));assert.deepEqual(value.terminal.shell,terminalShell('cmd'));assert.equal(value.terminal.font_size,19);assert.match(await readFile(file,'utf8'),/USER_NOTE/);
 assert.ok(supportedTerminal({args:['/D'],program:terminalShell('cmd').program}));assert.ok(!supportedTerminal({program:'cmd.exe',args:['/C','untrusted']}));
 const tasksFile=path.join(editor,'config/tasks.json');await writeFile(tasksFile,'// MY_TASK\n[{"label":"custom","command":"my-build"},]');
 await ensureTerminalTasks(editor,'win32');await ensureTerminalTasks(editor,'win32');const tasks=parse(await readFile(tasksFile,'utf8'));assert.equal(tasks.length,3);assert.equal(tasks[0].command,'my-build');
 for(const task of tasks.slice(1)){assert.equal(task.cwd,'$ZED_WORKTREE_ROOT');assert.equal(task.use_new_terminal,true);}
 assert.match(await readFile(tasksFile,'utf8'),/MY_TASK/);
});
