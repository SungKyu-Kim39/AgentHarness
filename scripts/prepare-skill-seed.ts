// Prepare model-independent OpenViking 0.5.5 skill files on the build machine.
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { loadBundledSkillPackages } from '../src/main/openviking-skills';
import { preparedSkillFiles } from '../src/main/skill-seed';
const root=path.resolve(import.meta.dirname,'..'), output=path.join(root,'vendor/skill-seed');
const packages=await loadBundledSkillPackages(path.join(root,'vendor/skills'),path.join(root,'skills-lock.json'));
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
const files:Record<string,string>={};
for(const pkg of packages)for(const [name,bytes]of preparedSkillFiles(pkg)){
  const relative=pkg.name+'/'+name,target=path.join(output,relative);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes);
  files[relative]=createHash('sha256').update(bytes).digest('hex');
}
await writeFile(path.join(output,'manifest.json'),JSON.stringify({schemaVersion:1,openViking:'0.5.5',indexStatus:'not-indexed',sourceManifestSha256:createHash('sha256').update(await readFile(path.join(root,'vendor/skills/manifest.json'))).digest('hex'),count:packages.length,files},null,2)+'\n');
console.log(`Prepared ${packages.length} skill packages without model calls; vectors are not claimed as ready.`);
