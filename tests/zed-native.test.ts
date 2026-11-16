import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer,request} from 'node:http';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {ZedModels} from '../distribution/ned/zed-models';
import {EditorNetwork,prepareEditor} from '../distribution/ned/profile';
import {configSchema} from '../src/shared/contracts';
import {isCompaction} from '../src/main/compaction-policy';
async function fixture(t:any){
 const calls:any[]=[];let mode='normal';let enter!:()=>void,closed!:()=>void;
 const entered=new Promise<void>(r=>enter=r),cancelled=new Promise<void>(r=>closed=r);
 const upstream=createServer(async(req,res)=>{
  let text='';for await(const chunk of req)text+=chunk;const body=JSON.parse(text);calls.push({path:req.url,authorization:req.headers.authorization,body});
  if(mode==='queue'){enter();res.once('close',closed);return;}
  res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({choices:[{message:{role:'assistant',content:req.url},finish_reason:isCompaction(body)?'length':'stop'}]}));
 });
 await new Promise<void>(r=>upstream.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+(upstream.address() as any).port;
 const config=configSchema.parse({schemaVersion:2,model:{providerID:'second',model:'m'},providers:{first:{name:'First',settings:{baseURL:url+'/first/v1',APIKey:'PRIVATE_FIRST_KEY'},models:{m:{name:'First Qwen',modelID:'Qwen-same',options:{parallelToolCalls:true,reasoningEffort:'none',chat_template_kwargs:{enable_thinking:false}},limit:{context:65536,output:8192}}}},second:{name:'Second',settings:{baseURL:url+'/second/v1',APIKey:'PRIVATE_SECOND_KEY'},models:{m:{name:'Second Qwen',modelID:'Qwen-same'}}}}});
 const broker=new ZedModels(config),connection=await broker.start(),network=new EditorNetwork(),proxy=await network.start(connection.baseUrl);
 t.after(async()=>{await network.close();await broker.close();upstream.closeAllConnections();await new Promise<void>(r=>upstream.close(()=>r()));});
 const post=(body:any,target=connection.baseUrl+'/chat/completions',token=connection.token,method='POST')=>new Promise<{status:number;body:any}>((resolve,reject)=>{
  const operation=request(proxy,{method,path:target,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}},res=>{let data='';res.on('data',d=>data+=d);res.on('end',()=>resolve({status:res.statusCode!,body:data&&res.headers['content-type']?.includes('application/json')?JSON.parse(data):data}));});operation.once('error',reject);operation.end(JSON.stringify(body));
 });
 return {broker,connection,network,proxy,calls,config,post,entered,cancelled,queue:()=>mode='queue'};
}
test('native Zed can use each configured model through its owned proxy without Ned instructions, tools or compaction retries',async t=>{
 const f=await fixture(t);assert.equal(f.connection.models.length,2);assert.notEqual(f.connection.models[0].name,f.connection.models[1].name);
 assert.equal(f.connection.defaultModel,f.connection.models[1].name);
 const messages=[{role:'system',content:'Native Zed system instructions'},{role:'user',content:'Read this project.'}],tools=[{type:'function',function:{name:'read_file',parameters:{type:'object',properties:{}}}}];
 for(let i=0;i<2;i++)assert.equal((await f.post({model:f.connection.models[i].name,messages,tools})).status,200);
 assert.equal(f.calls[0].path,'/first/v1/chat/completions');assert.equal(f.calls[1].path,'/second/v1/chat/completions');
 assert.equal(f.calls[0].authorization,'Bearer PRIVATE_FIRST_KEY');assert.equal(f.calls[1].authorization,'Bearer PRIVATE_SECOND_KEY');
 assert.deepEqual(f.calls[0].body.messages,messages);assert.deepEqual(f.calls[0].body.tools,tools);assert.equal(f.calls[0].body.model,'Qwen-same');assert.equal(f.calls[0].body.parallel_tool_calls,true);assert.equal(f.calls[0].body.chat_template_kwargs.enable_thinking,false);
 const instruction='You MUST summarize the conversation above into a structured summary.\n## Next Move\n## Relevant Files\nDo not continue the task or call tools.';
 const summary={model:f.connection.models[1].name,messages:[{role:'user',content:instruction}],tools,max_tokens:12000};assert.equal(isCompaction(summary),true);
 const result=await f.post(summary);assert.equal(result.body.choices[0].finish_reason,'length');assert.equal(f.calls.length,3);assert.deepEqual(f.calls[2].body.messages,summary.messages);assert.deepEqual(f.calls[2].body.tools,tools);assert.equal(f.calls[2].body.max_tokens,12000);
 assert.equal((await f.post({model:'unconfigured'})).status,403);assert.equal((await f.post({model:f.connection.defaultModel},undefined,'wrong')).status,401);
 for(const target of ['http://example.invalid/v1/chat/completions',f.connection.baseUrl+'/models',f.connection.baseUrl+'/api/session','http://127.0.0.1:1/v1/chat/completions'])assert.equal((await f.post({},target)).status,403);
 assert.equal(f.calls.length,3);
});
test('native editor settings contain only a run credential and preserve valid Zed model/profile/UI choices after restart',async t=>{
 const f=await fixture(t),root=await mkdtemp(path.join(tmpdir(),'ned-zed-settings-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const profile=await prepareEditor(root,'/Ned.exe','/resources','/descriptor',f.proxy,f.connection),file=path.join(profile.data,'config/settings.json');
 let saved=JSON.parse(await readFile(file,'utf8'));assert.equal(profile.env.INTRANET_API_KEY,f.connection.token);assert.deepEqual(Object.keys(saved.agent_servers),['Ned']);assert.equal(saved.agent.default_profile,'write');assert.equal(saved.agent.default_model.provider,'Intranet');
 assert.deepEqual(saved.context_servers,{});assert.equal(saved.agent.profiles.write.enable_all_context_servers,false);assert.equal(saved.agent.profiles.write.tools.fetch,false);assert.equal(saved.agent.profiles.write.tools.search_web,false);
 for(const secret of ['PRIVATE_FIRST_KEY','PRIVATE_SECOND_KEY',f.connection.token])assert.ok(!JSON.stringify(saved).includes(secret));
 saved.agent.default_profile='ask';saved.agent.default_model.model=f.connection.models[0].name;saved.buffer_font_size=23;saved.agent.dock='left';await writeFile(file,JSON.stringify(saved));
 await prepareEditor(root,'/Ned.exe','/resources','/descriptor',f.proxy,{...f.connection,baseUrl:'http://127.0.0.1:12345/v1',token:'next-run-token'});
 saved=JSON.parse(await readFile(file,'utf8'));assert.equal(saved.agent.default_profile,'ask');assert.equal(saved.agent.default_model.model,f.connection.models[0].name);assert.equal(saved.buffer_font_size,23);assert.equal(saved.agent.dock,'left');assert.equal(saved.language_models.openai_compatible.Intranet.api_url,'http://127.0.0.1:12345/v1');
});
test('closing a queued native model request reaches the upstream and leaves no private model listeners', {timeout:10000},async t=>{
 const f=await fixture(t);f.queue();const pending=fetch(f.connection.baseUrl+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+f.connection.token},body:JSON.stringify({model:f.connection.defaultModel,messages:[]})});
 const caught=assert.rejects(pending);await f.entered;const ports=f.broker.ports();await f.broker.close();await caught;await f.cancelled;
 for(const port of ports)await assert.rejects(fetch('http://127.0.0.1:'+port));
});
