import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { OpenVikingGateway } from '../src/main/openviking-gateway';
import { configSchema } from '../src/shared/contracts';
test('BGE gateway requests float vectors without dimension-reduction parameters, validates size and records only safe codes',async t=>{
  let http=200,dimension=4;const events:any[]=[];
  const server=createServer(async(req,res)=>{let raw='';for await(const b of req)raw+=b;const body=JSON.parse(raw);assert.equal(body.encoding_format,'float');assert.equal(body.dimensions,undefined);
    res.writeHead(http,{'Content-Type':'application/json'}).end(JSON.stringify(http===200?{data:[{embedding:Array(dimension).fill(.5)}]}:{error:'secret-upstream-key'}));});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{server.closeAllConnections();server.close();});
  const config=configSchema.parse({model:{baseUrl:'http://127.0.0.1:9/v1',apiKey:'secret-llm',id:'llm'},openViking:{enabled:true,embedding:{baseUrl:`http://127.0.0.1:${(server.address() as any).port}/v1`,apiKey:'secret-embedding',id:'BGE',dimension:4}}});
  const gateway=new OpenVikingGateway(config,event=>events.push(event));await gateway.start();t.after(()=>gateway.close());
  const call=()=>fetch(gateway.baseUrl+'/embeddings',{method:'POST',headers:{Authorization:'Bearer '+gateway.token,'Content-Type':'application/json'},body:JSON.stringify({model:'BGE',input:['text'],encoding_format:'base64',dimensions:4})});
  assert.equal((await call()).status,200);dimension=3;assert.equal((await call()).status,502);assert.equal(events.at(-1).code,'OV_EMBEDDING_DIMENSION');
  http=401;assert.equal((await call()).status,502);assert.equal(events.at(-1).httpStatus,401);assert.ok(!JSON.stringify(events).includes('secret'));
});
