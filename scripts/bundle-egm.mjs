// Build-machine adapter for the complete pinned EGM document bundle. No upstream installer executes.
import {readFile,writeFile,readdir,mkdir,cp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const revision='72d06f52a2482885d9a64bd24b291c6e8628942c', source='https://github.com/google/elephant-goldfish-model';
const root=path.resolve(import.meta.dirname,'..'),input=path.resolve(process.argv[2]??path.join(root,'.cache/egm-source'));
if(execFileSync('git',['rev-parse','HEAD'],{cwd:input,encoding:'utf8'}).trim()!==revision)throw Error('EGM source revision mismatch');
const sha=b=>createHash('sha256').update(b).digest('hex');
const descriptions={
 'egm-brainstorm':'독립 검토자와 아이디어·요구사항·대안을 검토하고 합의한 개념 문서를 만듭니다.',
 'egm-draft':'요구사항을 단계별로 검토하며 구현 전 설계 문서를 작성합니다.',
 'egm-resolve':'설계 리뷰 지적 사항을 사용자와 검토하고 합의한 문서 수정을 반영합니다.',
 'egm-bootstrap':'기존 코드와 근거를 읽어 코드베이스 문서를 작성하거나 갱신합니다.',
 'egm-review':'설계안을 독립된 읽기 전용 Goldfish Agent로 단계별 검토합니다.',
 'egm-review-loop':'지정한 검토 기준과 검토자로 독립 리뷰를 실행합니다. EGM 공용 원본 자료도 제공합니다.',
 'egm-drift-report':'승인한 설계 문서와 현재 코드 사이의 차이를 근거와 함께 보고합니다.',
};
const shared='vendor/skills/egm-review-loop/references/bundle';
await rm(path.join(root,shared),{recursive:true,force:true});await mkdir(path.join(root,shared),{recursive:true});
async function copyDocs(from,to){await mkdir(to,{recursive:true});for(const e of await readdir(from,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('EGM links are not bundled');if(e.isDirectory())await copyDocs(path.join(from,e.name),path.join(to,e.name));else if(/\.md$|^LICENSE$|^NOTICE$/.test(e.name))await cp(path.join(from,e.name),path.join(to,e.name));}}
for(const folder of ['skills','agents','resources','docs'])await copyDocs(path.join(input,folder),path.join(root,shared,folder));
for(const file of ['README.md','LICENSE','TESTING.md'])await cp(path.join(input,file),path.join(root,shared,file));
const manifestFile=path.join(root,'vendor/skills/manifest.json'),manifest=JSON.parse(await readFile(manifestFile));
manifest.skills=manifest.skills.filter(s=>!Object.hasOwn(descriptions,s.id));
for(const [id,description]of Object.entries(descriptions)){
 const directory=path.join(root,'vendor/skills',id);await mkdir(directory,{recursive:true});await cp(path.join(input,'LICENSE'),path.join(directory,'LICENSE'));
 const adapter='Ned EGM adapter. Read canonical instructions and all requested reviewer/standard documents through read_skill id=egm-review-loop document=references/bundle/<canonical path>. Resolve upstream skills/, agents/, resources/, docs/ against that shared document root, not project files. Use Ned read_file/list_files/propose_edit for approved project documents. Use spawn_subagent role=goldfish reviewer=<persona stem> for every independent Goldfish review; never reuse a reviewer or pass parent conversation, private memory, or unsolicited earlier reports. Respect required stage inputs, user decisions and report completion. Missing reads/results mean incomplete review. At most two child agents execute; additional reviewers queue. Use subagent_status only for completion evidence when needed; results arrive automatically. No upstream task/CLI/plugin installer, network or extra MCP may run. Production code is outside the design workflow. Follow the user\'s explicit implementation instruction after leaving that workflow. For bootstrap document workers, use research children and let the parent write approved documentation. Preserve approval checkpoints. This bundle does not change the default agent or automatically review ordinary requests.';
 await writeFile(path.join(directory,'SKILL.md'),`---\nname: ${id}\ndescription: ${JSON.stringify(description)}\n---\n\n# EGM — Ned\n\n${adapter}\n\nFirst read the complete canonical workflow: read_skill id=egm-review-loop document=references/bundle/skills/${id}/SKILL.md. Use offset to read long documents completely.\n`);
 const files=[];async function walk(folder,relative=''){for(const e of(await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const rel=relative?relative+'/'+e.name:e.name;if(e.isDirectory())await walk(path.join(folder,e.name),rel);else{const bytes=await readFile(path.join(folder,e.name));files.push({path:rel,sha256:sha(bytes)});}}}await walk(directory);
 manifest.skills.push({id,name:id,description,directory:id,source,commit:revision,license:'Apache-2.0',adapter,files});
}
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');await writeFile(manifestFile,bytes);
const lockFile=path.join(root,'skills-lock.json'),lock=JSON.parse(await readFile(lockFile));lock.count=manifest.skills.length;lock.manifestSha256=sha(bytes);await writeFile(lockFile,JSON.stringify(lock,null,2)+'\n');
const metadata=JSON.parse(await readFile(path.join(input,'plugin.json')));
await writeFile(path.join(root,'egm-lock.json'),JSON.stringify({schemaVersion:1,source,revision,version:metadata.version,license:'Apache-2.0',upstreamInstallerExecuted:false,skills:Object.keys(descriptions),files:Object.fromEntries(manifest.skills.filter(s=>s.commit===revision).flatMap(s=>s.files.map(f=>[s.directory+'/'+f.path,f.sha256])))},null,2)+'\n');
console.log(`Pinned EGM ${metadata.version}: seven workflows, full reviewer/standards documents; ${manifest.skills.length} total skills.`);
