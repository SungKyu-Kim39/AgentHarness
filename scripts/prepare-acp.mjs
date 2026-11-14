// Build-machine dependency closure for the fixed ACP source; never an employee-PC install path.
import { readFile, writeFile, mkdir, access, symlink, rm } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const exists=p=>access(p).then(()=>true,()=>false);
const upstreamLock=JSON.parse(await readFile(path.join(root,'upstream-lock.json'),'utf8'));
const source=path.join(root,'.cache/l-vibe-desktop/source');
const archive=path.join(root,'.cache/ned/opencode-source.tgz');
await mkdir(path.dirname(archive),{recursive:true});
if(!await exists(path.join(source,'packages/cli/src/acp/agent.ts'))) {
 if(!await exists(archive))execFileSync('curl',['-fsSL','--retry','2','--max-time','240',upstreamLock.archive.url,'-o',archive],{stdio:'inherit'});
 if(hash(await readFile(archive))!==upstreamLock.archive.sha256)throw Error('Pinned upstream source archive mismatch');
 await mkdir(source,{recursive:true});execFileSync('tar',['-xzf',archive,'--strip-components=1','-C',source]);
}
const sourceLock=JSON.parse(await readFile(path.join(root,'ned-acp-lock.json'),'utf8'));
for(const [name,expected]of Object.entries(sourceLock.files))if(hash(await readFile(path.join(source,name)))!==expected)throw Error('ACP source changed: '+name);
const deps=path.join(root,'.cache/ned/acp-deps');await mkdir(deps,{recursive:true});
for(const file of ['package.json','package-lock.json'])await writeFile(path.join(deps,file),await readFile(path.join(root,'scripts/acp-build',file)));
const fingerprint=hash(await readFile(path.join(deps,'package-lock.json')));
if(!await exists(path.join(deps,'node_modules/effect/package.json'))||await readFile(path.join(deps,'installed-lock.sha256'),'utf8').catch(()=>'')!==fingerprint){
 execFileSync(process.platform==='win32'?'npm.cmd':'npm',['ci','--prefix',deps,'--ignore-scripts','--no-audit','--no-fund','--cache',path.join(root,'.cache/npm')],{cwd:root,stdio:'inherit'});
 await writeFile(path.join(deps,'installed-lock.sha256'),fingerprint);
}
const modules=path.join(deps,'node_modules');
await mkdir(path.join(modules,'@opencode'),{recursive:true});
for(const name of ['client','schema','protocol','util','tui']) {
 const link=path.join(modules,'@opencode',name);
 if(!await exists(link))await symlink(path.join(source,'packages',name),link,process.platform==='win32'?'junction':'dir');
}
const sourceModules=path.join(source,'node_modules');
if(!await exists(sourceModules))await symlink(modules,sourceModules,process.platform==='win32'?'junction':'dir');
console.log('Verified 192 pinned upstream ACP source files and prepared locked build-only dependencies.');
