import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PrivateMcpClient } from '../src/main/mcp-client';

const server = `
const readline = require('node:readline');
let denied = false;
const send = value => process.stdout.write(JSON.stringify({jsonrpc:'2.0',...value})+'\\n');
const input = readline.createInterface({input:process.stdin});
input.on('close',()=>process.exit());
input.on('line',line=>{
 const m=JSON.parse(line);
 if(m.id===777 && m.error) {denied=m.error.code===-32601;return;}
 if(m.method==='initialize') {send({id:m.id,result:{protocolVersion:'2025-06-18',serverInfo:{name:'fixture',version:'1'}}});return;}
 if(m.method==='tools/list') {send({id:m.id,result:{tools:[{name:'read'},{name:'hang'}]}});return;}
 if(m.method==='notifications/initialized') {send({id:777,method:'sampling/createMessage',params:{messages:[]}});return;}
 if(m.method==='tools/call' && m.params.name==='read') {
  const bytes=Buffer.from(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:'한글 응답 '+denied}]}})+'\\n');
  const cut=bytes.indexOf(Buffer.from('한'))+1;
  process.stdout.write(bytes.subarray(0,cut)); setTimeout(()=>process.stdout.write(bytes.subarray(cut)),10);
 }
});
`;
async function fixture(t: { after(fn: () => Promise<unknown>): void }) {
  const root = await mkdtemp(path.join(tmpdir(), 'l-vibe-private-mcp-')); t.after(() => rm(root, { recursive: true, force: true }));
  const client = new PrivateMcpClient({ executable: process.execPath, args: ['-e', server], cwd: root, env: {}, allowedTools: ['read', 'hang'], timeout: 5000 });
  t.after(() => client.close()); return client;
}
test('private MCP negotiates stdio, preserves fragmented Unicode and refuses server sampling', async t => {
  const client = await fixture(t);
  const result = await client.call('read', {});
  assert.equal(result.content[0].text, '한글 응답 true');
  await assert.rejects(client.call('write_file', { path: '../outside' }), /등록되지 않은/);
});
test('MCP cancellation confirms process exit before allowing a cancelled call to finish', async t => {
  const client = await fixture(t); await client.start();
  const abort = new AbortController(); const operation = client.call('hang', {}, abort.signal);
  setTimeout(() => abort.abort(), 20);
  await assert.rejects(operation, /중지/); assert.equal(client.stoppingUnconfirmed, false);
  await assert.rejects(client.call('read', {}), /준비되지/);
});
