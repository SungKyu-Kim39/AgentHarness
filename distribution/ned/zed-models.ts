import {createServer,request,type ClientRequest,type Server} from 'node:http';
import {randomBytes,createHash} from 'node:crypto';
import {ModelGateway,type ModelFailure} from '../../src/main/model-gateway';
import type {AgentConfig} from '../../src/shared/contracts';

export interface ZedConnection {
  baseUrl: string;
  token: string;
  models: {name:string;display_name:string;max_tokens:number;max_output_tokens:number;capabilities:{tools:boolean;images:boolean;parallel_tool_calls:boolean;chat_completions:true;max_tokens_parameter:true}}[];
  defaultModel: string;
}
function wireOptions(options: Record<string,unknown>) {
  const names: Record<string,string>={parallelToolCalls:'parallel_tool_calls',reasoningEffort:'reasoning_effort',topP:'top_p',topK:'top_k',minP:'min_p',presencePenalty:'presence_penalty',frequencyPenalty:'frequency_penalty'};
  return Object.fromEntries(Object.entries(options).filter(([key])=>!['model','messages','tools','tool_choice','stream','baseURL','apiKey','APIKey','headers','timeout','headerTimeout','chunkTimeout'].includes(key)).map(([key,value])=>[names[key]??key,value]));
}
/** Transport for Zed's built-in agent. No Ned tools, instructions, skills or compaction policy. */
export class ZedModels {
  private server?: Server;
  private gateways: ModelGateway[]=[];
  private requests=new Set<ClientRequest>();
  private connection?: ZedConnection;
  private stopped=false;
  private ready?: Promise<ZedConnection>;
  constructor(private config:AgentConfig,private diagnostic?:(failure:ModelFailure)=>void){}
  start(){if(this.stopped)return Promise.reject(Error('Zed 모델 연결을 중지했습니다.'));return this.ready??=this.boot();}
  private async boot():Promise<ZedConnection>{
    const models=this.config.models??[{...this.config.model,name:this.config.model.id}];
    const entries=new Map<string,{id:string;gateway:ModelGateway;options:Record<string,unknown>}>();
    const catalog:ZedConnection['models']=[];
    try{
      for(const model of models){
        if(this.stopped)throw Error('Zed 모델 연결을 중지했습니다.');
        const provider=model.providerID?this.config.providers?.[model.providerID]:undefined;
        const definition=model.modelKey?provider?.models[model.modelKey]:undefined;
        const settings={...provider?.settings,...definition?.settings};
        const gateway=new ModelGateway({...this.config,model},{timeout:settings.timeout,headerTimeout:settings.headerTimeout,chunkTimeout:settings.chunkTimeout},this.diagnostic,undefined,definition?.limit?.output??4096,'native');
        this.gateways.push(gateway);await gateway.start();
        const name='model_'+createHash('sha256').update(JSON.stringify([model.name,model.providerID,model.modelKey,model.id])).digest('hex').slice(0,24);
        const options=wireOptions({...settings,...definition?.body});
        entries.set(name,{id:model.id,gateway,options});
        catalog.push({name,display_name:model.name,max_tokens:definition?.limit?.context??32768,max_output_tokens:definition?.limit?.output??4096,
          capabilities:{tools:definition?.capabilities?.tools??true,images:!!definition?.capabilities?.input?.includes('image'),parallel_tool_calls:!!options.parallel_tool_calls,chat_completions:true,max_tokens_parameter:true}});
      }
      const token=randomBytes(32).toString('hex');
      this.server=createServer(async(req,res)=>{
        if(req.method!=='POST'||req.url!=='/v1/chat/completions'){res.writeHead(403).end();return;}
        if(req.headers.authorization!=='Bearer '+token){res.writeHead(401).end();return;}
        let upstream:ClientRequest|undefined;
        const cancel=()=>{upstream?.destroy();if(upstream)this.requests.delete(upstream);};
        res.once('close',cancel);req.once('aborted',cancel);
        try{
          const chunks:Buffer[]=[];let size=0;
          for await(const bytes of req){size+=bytes.length;if(size>32*1024*1024){res.writeHead(413).end();return;}chunks.push(bytes);}
          const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const selected=entries.get(body.model);if(!selected){res.writeHead(403).end();return;}
          if(this.stopped||res.destroyed)return;
          const data=Buffer.from(JSON.stringify({...body,...selected.options,model:selected.id}));
          upstream=request(selected.gateway.baseUrl+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+selected.gateway.token,'Content-Type':'application/json','Content-Length':data.length}},response=>{
            res.writeHead(response.statusCode??502,{'Content-Type':response.headers['content-type']??'application/json','Cache-Control':'no-store'});
            response.on('error',()=>res.destroy());response.pipe(res);
          });
          this.requests.add(upstream);upstream.once('close',()=>{if(upstream)this.requests.delete(upstream);});
          upstream.once('error',()=>{if(!res.headersSent)res.writeHead(502).end(JSON.stringify({error:{message:'Zed 모델 연결 실패',code:'NED_ZED_MODEL_TRANSPORT'}}));else res.destroy();});
          upstream.end(data);
        }catch{if(!res.headersSent)res.writeHead(400).end();else res.destroy();}
      });
      this.server.requestTimeout=0;
      await new Promise<void>((resolve,reject)=>{this.server!.once('error',reject);this.server!.listen(0,'127.0.0.1',resolve);});
      if(this.stopped)throw Error('Zed 모델 연결을 중지했습니다.');
      const address=this.server.address();if(!address||typeof address==='string')throw Error('Zed 모델 포트 할당 실패');
      const selected=models.findIndex(m=>m.name===this.config.defaultModel);
      this.connection={baseUrl:`http://127.0.0.1:${address.port}/v1`,token,models:catalog,defaultModel:catalog[Math.max(0,selected)].name};
      return this.connection;
    }catch(error){await this.dispose();throw error;}
  }
  ports(){return [...this.gateways.map(g=>Number(new URL(g.baseUrl||'http://127.0.0.1:1').port)),...(this.connection?[Number(new URL(this.connection.baseUrl).port)]:[])];}
  private async dispose(){for(const operation of this.requests)operation.destroy();this.server?.closeAllConnections();await new Promise<void>(r=>{if(!this.server?.listening)r();else this.server.close(()=>r());});await Promise.all(this.gateways.map(g=>g.close()));}
  async close(){this.stopped=true;await this.ready?.catch(()=>{});await this.dispose();}
}
