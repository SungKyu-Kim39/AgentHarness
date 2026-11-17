// Preserve the independently reviewed static Astryx adapter while rebuilding the original collections.
import {readFile,writeFile,mkdtemp,cp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
const run=file=>execFileSync(process.execPath,[file],{stdio:'inherit'});
const filename='vendor/skills/manifest.json';
const previous=JSON.parse(await readFile(filename)),astryx=previous.skills.find(s=>s.id==='astryx'),extras=previous.skills.filter(s=>s.id==='astryx'||s.id.startsWith('egm-'));
if(!astryx)throw Error('Restore the reviewed Astryx static adapter before rebuilding all skills');
execFileSync(process.execPath,['scripts/bundle-skills.mjs','verify'],{stdio:'inherit'});
const backup=await mkdtemp(path.join(tmpdir(),'ned-skills-build-'));
const inputs=['vendor/skills','skills-lock.json','reviewed-skills-lock.json'];
for(let i=0;i<inputs.length;i++)await cp(inputs[i],path.join(backup,String(i)),{recursive:true});
try {
execFileSync(process.execPath,['scripts/bundle-skills.mjs','fetch'],{stdio:'inherit'});
run('scripts/bundle-reviewed-skills.mjs');
const manifest=JSON.parse(await readFile(filename));if(manifest.skills.some(s=>s.id==='astryx'))throw Error('Duplicate Astryx skill');
for(const entry of extras){if(manifest.skills.some(s=>s.id===entry.id))throw Error('Duplicate reviewed extension skill');manifest.skills.push(entry);await cp(path.join(backup,'0',entry.directory),path.join('vendor/skills',entry.directory),{recursive:true});}const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');await writeFile(filename,bytes);
const lock=JSON.parse(await readFile('skills-lock.json'));lock.count=manifest.skills.length;lock.manifestSha256=createHash('sha256').update(bytes).digest('hex');await writeFile('skills-lock.json',JSON.stringify(lock,null,2)+'\n');
run('scripts/adapt-subagent-skills.mjs');
execFileSync(process.execPath,['scripts/bundle-skills.mjs','verify'],{stdio:'inherit'});

} catch(error) {
 for(let i=0;i<inputs.length;i++){await rm(inputs[i],{recursive:true,force:true});await cp(path.join(backup,String(i)),inputs[i],{recursive:true});}
 throw error;
} finally {await rm(backup,{recursive:true,force:true});}
