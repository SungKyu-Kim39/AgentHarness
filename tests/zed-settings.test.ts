import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {prepareEditor} from '../distribution/ned/profile';import {validateManagedZedSettings} from '../distribution/ned/zed-settings';
test('rebuild1 missing profile names are repaired without resetting UI; incomplete native capabilities are rejected',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-zed-settings-'));t.after(()=>rm(root,{recursive:true,force:true}));await mkdir(path.join(root,'editor/config'),{recursive:true});
 await writeFile(path.join(root,'editor/config/settings.json'),JSON.stringify({buffer_font_size:23,agent:{dock:'left',profiles:{write:{tools:{fetch:false}}}}}));
 const native={baseUrl:'http://127.0.0.1:12345/v1',token:'ephemeral',defaultModel:'m',models:[{name:'m',display_name:'test',max_tokens:32000,max_output_tokens:4096,capabilities:{tools:true,images:false,parallel_tool_calls:false,prompt_cache_key:false as const,interleaved_reasoning:false as const,chat_completions:true as const,max_tokens_parameter:true as const}}]};
 await prepareEditor(root,'/Ned.exe','/resources','/descriptor','http://127.0.0.1:9',native);
 const text=await readFile(path.join(root,'editor/config/settings.json'),'utf8'),value=JSON.parse(text);validateManagedZedSettings(text);
 assert.equal(value.buffer_font_size,23);assert.equal(value.agent.dock,'left');assert.equal(value.agent.profiles.write.name,'Write');assert.equal(value.agent.profiles.ask.name,'Ask');assert.equal(value.agent.profiles.minimal.name,'Minimal');
 delete value.agent.profiles.write.name;assert.throws(()=>validateManagedZedSettings(JSON.stringify(value)),/agent.profiles.write.name/);
 value.agent.profiles.write.name='Write';delete value.language_models.openai_compatible.Intranet.available_models[0].capabilities.prompt_cache_key;
 assert.throws(()=>validateManagedZedSettings(JSON.stringify(value)),/prompt_cache_key/);
});
