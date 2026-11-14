// Build-PC only. Fetch fixed, reviewed text files; never run upstream installers/plugins.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import path from 'node:path';

const hash = value => createHash('sha256').update(value).digest('hex');
const download = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const specFile = path.join(root,'reviewed-skills-lock.json');
const spec = JSON.parse(await readFile(specFile,'utf8'));
const record = process.argv.includes('--record-reviewed');
const bundle = path.join(root,'vendor/skills');
const manifest = JSON.parse(await readFile(path.join(bundle,'manifest.json'),'utf8'));
const lock = JSON.parse(await readFile(path.join(root,'skills-lock.json'),'utf8'));
const allIds = new Set(spec.skills.map(s=>s.id));
manifest.skills = manifest.skills.filter(s=>!allIds.has(s.id));
if(manifest.skills.length !== 36) throw Error('Expected the reviewed 36-skill baseline before expansion');

async function sourceFile(key,relative) {
  const source = spec.sources[key];
  if(!source || !/^[a-f0-9]{40}$/.test(source.commit) || relative.split('/').some(p=>!p||p==='.'||p==='..')) throw Error('Invalid reviewed source');
  const filename = path.join(root,'.cache/reviewed-skills',key+'-'+source.commit.slice(0,12),relative);
  let bytes = await readFile(filename).catch(error=>{if(error.code==='ENOENT')return undefined;throw error});
  if(!bytes) {
    bytes = (await download('curl',['-fsSL','--retry','2','--max-time','90',`https://raw.githubusercontent.com/${source.repository}/${source.commit}/${relative}`],{maxBuffer:4*1024*1024,encoding:'buffer'})).stdout;
    await mkdir(path.dirname(filename),{recursive:true}); await writeFile(filename,bytes);
  }
  source.files ??= {};
  const digest = hash(bytes);
  if(!source.files[relative] && record) source.files[relative]=digest;
  if(source.files[relative]!==digest)throw Error('Unreviewed source bytes: '+key+'/'+relative+'; deliberately review before recording');
  return bytes;
}
const licenses = {};
for(let offset=0;offset<spec.webReferences.length;offset+=8)await Promise.all(spec.webReferences.slice(offset,offset+8).map(relative=>sourceFile('web',relative)));
for(const [key,source] of Object.entries(spec.sources)) {
  const upstream = await sourceFile(key,source.licensePath);
  if(source.licenseDeclaration) {
    const declaration=JSON.parse(upstream.toString());
    if(declaration.license!=='MIT'||declaration.author?.name!=='OpenAI')throw Error('Game Studio license declaration changed');
    const terms=(await readFile(path.join(root,'LICENSE'),'utf8')).replace(/^Copyright \(c\)[^\n]*/m,'Copyright OpenAI and contributors (upstream author attribution).');
    licenses[key]=Buffer.from(`Upstream explicitly declares MIT in ${source.licensePath}.\nDeclaration source: https://github.com/${source.repository}/blob/${source.commit}/${source.licensePath}\nThe standard MIT terms are reproduced below; no root LICENSE file was supplied by this upstream snapshot.\n\n${terms}`);
  } else licenses[key]=upstream;
}
const policy = 'Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.';

for(const definition of spec.skills) {
  const {id,name,description,steps}=definition;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>56||!steps.length)throw Error('Invalid reviewed skill definition');
  const source=spec.sources[definition.source];
  const original=await sourceFile(definition.source,definition.path);
  const sourceUrl=`https://github.com/${source.repository}/blob/${source.commit}/${definition.path}`;
  const destination=path.join(bundle,id);await rm(destination,{recursive:true,force:true});await mkdir(destination,{recursive:true});
  const files=[],modifications=[];
  async function add(relative,bytes,upstream) {
    bytes=Buffer.from(bytes);await mkdir(path.dirname(path.join(destination,relative)),{recursive:true});await writeFile(path.join(destination,relative),bytes);
    files.push({path:relative,sha256:hash(bytes)});
    if(upstream)modifications.push({path:relative,upstreamSha256:hash(upstream),bundledSha256:hash(bytes)});
  }
  const content=`---\nname: ${id}\ndescription: ${JSON.stringify(description)}\n---\n\n# Ned offline adaptation\n\n${policy}\n\n## ${name}\n\n${steps.map((step,index)=>`${index+1}. ${step}`).join('\n')}\n\n${id==='modern-web-guidance'?'선별 로컬 가이드 묶음이다. 원본 온라인 CLI·전체 검색 모델을 설치한 것으로 표현하지 않는다. 필요한 references 문서를 read_skill로 선택한다.\n\n':''}상황과 실제 조사 결과에 따라 적용 범위를 다시 선택한다. 계획이나 스킬 이름의 언급만으로 실행·검증 성공을 주장하지 않는다. See ADAPTATION.md for provenance and modifications.\n`;
  await add('SKILL.md',content,original);
  await add('LICENSE',source.documentLicenseFrom?licenses[source.documentLicenseFrom]:licenses[definition.source]);
  if(source.documentLicenseFrom)await add('CODE-LICENSE.txt',licenses[definition.source]);
  if(id==='modern-web-guidance')for(const relative of spec.webReferences) {
    const bytes=await sourceFile(definition.source,relative);
    const localText=bytes.toString().replace(/`(?:npx|pnpx)[^`]*`/g,'the corresponding local read_skill reference, if bundled; otherwise report it as unavailable').replace(/\b(?:npm|pip|brew) install[^\n`]*/g,'use an already imported reviewed local dependency; no installation or download');
    if(/\b(?:npm|pip|brew) install\b|\bnpx\s/.test(localText))throw Error('Guide needs explicit offline adaptation: '+relative);
    const guide='# Ned local reference\n\n'+policy+'\n\nUpstream: https://github.com/'+source.repository+'/blob/'+source.commit+'/'+relative+'\nLicense: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.\n\n---\n\n'+localText;
    await add('references/'+relative.split('/guides/')[1],guide,bytes);
  }
  if(id==='modern-web-guidance')await add('REFERENCES.md','# Local web guidance index\n\nUse read_skill with the exact document path below. These are frozen references, not evidence that the current browser supports every API. AI-model-download guides are excluded.\n\n'+spec.webReferences.map(relative=>'- references/'+relative.split('/guides/')[1]).join('\n')+'\n');
  const authors=definition.source==='unslop'?'Damir Sokolovsky (@heydamir)':definition.source==='web'?'GoogleChrome modern-web-guidance contributors; Google Chrome, Microsoft Edge, Mozilla Firefox and MDN teams, with the original guide attributions':source.repository+' authors and contributors';
  await add('ADAPTATION.md',`# Ned offline adaptation\n\nOriginal authors: ${authors}\n\nUpstream: ${sourceUrl}\n\nCommit: ${source.commit}\n\nLicense: ${source.license}; see LICENSE${source.codeLicense?' and CODE-LICENSE.txt':''}. Preserve attribution and source links. Modifications by Ned contributors, 2026-11-13. The upstream authors do not endorse Ned.\n\nThis is a selective static host adapter, not an installation of the upstream executable plugin, CLI, agents or validators. The method was condensed for Korean/offline use. Online installation, telemetry, cloud services, automatic update, mandatory Q&A, external issue trackers and parallel-agent procedures were omitted. Tools map to Ned host reads/search, approved project edits and available reviewed runtimes. Missing executors and image generation remain explicitly unavailable.\n\nOriginal main document SHA-256: ${hash(original)}\nBundled main document SHA-256: ${hash(Buffer.from(content))}\n\n${source.licenseDeclaration?'The upstream plugin manifest explicitly declares MIT; the distributed LICENSE identifies that declaration and reproduces MIT terms.\n':''}`);
  manifest.skills.push({id,name,description,directory:id,source:sourceUrl,commit:source.commit,license:'LICENSE',adapter:policy,modifications,files:files.sort((a,b)=>a.path.localeCompare(b.path))});
}
for(const source of Object.values(spec.sources))source.files=Object.fromEntries(Object.entries(source.files??{}).sort(([a],[b])=>a.localeCompare(b)));
await writeFile(specFile,JSON.stringify(spec,null,2)+'\n');
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(bundle,'manifest.json'),bytes);
lock.reviewedSources=spec.sources;lock.reviewedSpecSha256=hash(await readFile(specFile));lock.manifestSha256=hash(bytes);lock.count=manifest.skills.length;
await writeFile(path.join(root,'skills-lock.json'),JSON.stringify(lock,null,2)+'\n');
console.log(`Bundled ${spec.skills.length} reviewed additions; total ${lock.count}. Static text only.`);
