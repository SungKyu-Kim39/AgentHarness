// Exercise the real distributed DesktopTools class, without native GUI/model access.
import vm from 'node:vm';
import {createRequire,isBuiltin} from 'node:module';
const require=createRequire(import.meta.url);
function desktopClass(bytes){
 const entry=new Error('STOP_BEFORE_APP_START');
 const context=vm.createContext({module:{exports:{}},exports:{},Buffer,URL,URLSearchParams,TextEncoder,TextDecoder,AbortController,AbortSignal,structuredClone,setTimeout,clearTimeout,setInterval,clearInterval,console,
  process:{pid:process.pid,platform:process.platform,versions:process.versions,env:{}},
  require(id){if(id==='electron')return{app:{setName(){throw entry}}};if(!isBuiltin(id))throw new Error('Unexpected distributed import');return require(id);}});
 try{new vm.Script(Buffer.from(bytes).toString('utf8')).runInContext(context,{timeout:10000});throw new Error('No app boundary');}
 catch(error){if(error!==entry)throw error;}
 return vm.runInContext('DesktopTools',context);
}
export async function verifySnapshotBackport(original,patched){
 const target={id:'fixture-window',pid:1234,app_name:'Notepad',process_instance:'fixture-instance',title:'Fixture'};
 const reply=data=>({content:[{type:'text',text:JSON.stringify({ok:true,data})}],structuredContent:{ok:true,data}});
 async function exercise(bytes,fixed){
  let live={...target},replace=false,actions=0;
  const tools=new (desktopClass(bytes))('/fixture','/fixture',async()=>true);
  const context={home:'/fixture',project:'/fixture-project',refs:new Map(),client:{call:async name=>{
   if(name==='desktop_list_windows')return reply([live]);
   if(name==='desktop_snapshot'){if(replace)live={...target,process_instance:'replacement'};return reply({app:target.app_name,window:{id:target.id,title:'updated caption'},complete:true,snapshot_id:'actual',tree:{ref_id:'@actual:e1',role:'button'}});}
   actions++;return reply({});
  }}};
  tools.sessions.set('s',context);
  if(!fixed){let failed=false;try{await tools.call('desktop_snapshot',{window_id:target.id},'s','/fixture-project');}catch(error){failed=error.message.includes('관찰된 창의 신원');}if(!failed)throw new Error('Original failure not reproduced');return;}
  await tools.call('desktop_snapshot',{window_id:target.id},'s','/fixture-project');
  if(context.refs.size!==1)throw new Error('Missing valid snapshot ref');
  await tools.call('desktop_click',{ref_id:'@actual:e1'},'s','/fixture-project');
  if(actions!==1)throw new Error('Qualified action not dispatched');
  replace=true;let refused=false;
  try{await tools.call('desktop_snapshot',{window_id:target.id},'s','/fixture-project');}catch(error){refused=error.message.includes('대상 창이 변경');}
  if(!refused||context.refs.size!==0||actions!==1)throw new Error('Replaced process or stale refs accepted');
 }
 await exercise(original,false);await exercise(patched,true);
 return{originalCompactFailureReproduced:true,patchedCompactSnapshotAccepted:true,qualifiedMockActionDispatched:true,postCaptureProcessReplacementRefused:true,oldRefsCleared:true,nativeGuiActions:0};
}
