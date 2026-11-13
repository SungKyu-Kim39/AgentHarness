import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProjectOpener, projectOpenCommand } from '../distribution/ned/project-open';
import { editorSettings } from '../distribution/ned/profile';
test('folder dispatch pins the bundled CLI, private profile and literal project argument', () => {
  const command = projectOpenCommand('D:\\Apps\\Ned\\resources', 'C:\\Private\\editor', 'D:\\Work\\a & b', 'win32');
  assert.equal(command.file, 'D:\\Apps\\Ned\\resources\\zed\\bin\\zed.exe');
  assert.deepEqual(command.args, ['--user-data-dir','C:\\Private\\editor','--reuse','--','D:\\Work\\a & b']);
  assert.equal(command.cwd, 'C:\\Private\\editor\\home');
  assert.throws(() => projectOpenCommand('relative','C:\\editor','D:\\work','win32'));
  assert.equal(editorSettings('/exe','/agent','/owner','http://127.0.0.1:1',undefined,'win32').use_system_path_prompts,false);
});
test('project picker cancellation, concurrent clicks, failed dispatch and editor exit never authorize a folder', async () => {
  const opener = new ProjectOpener(); let alive = true, chosen: string | undefined, fail = false, dispatches = 0;
  const confirmed: string[] = [];
  const options = { alive:()=>alive, choose:async()=>chosen, canonical:async(p:string)=>p+'/canonical', dispatch:async()=>{dispatches++;if(fail)throw Error('failed');}, selected:(p:string)=>{confirmed.push(p);} };
  await opener.open(options); assert.equal(dispatches,0);
  chosen='/work';fail=true;await assert.rejects(opener.open(options),/failed/);assert.deepEqual(confirmed,[]);
  fail=false;await opener.open(options);assert.deepEqual(confirmed,['/work/canonical']);
  alive=false;await opener.open(options);assert.equal(dispatches,2);
  alive=true;await assert.rejects(opener.open({...options,canonical:async()=>{alive=false;return '/work';}}),/종료/);assert.equal(dispatches,2);
  alive=true;let release!:(value:string)=>void;
  const pending=opener.open({...options,choose:()=>new Promise(resolve=>{release=resolve;})});
  await opener.open(options);assert.equal(dispatches,2);release('/one');await pending;assert.equal(dispatches,3);
});
