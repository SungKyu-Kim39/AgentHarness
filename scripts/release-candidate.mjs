// Authorized release orchestration. No existing release, tag or binary is replaced.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,cp,stat,appendFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileHash} from './installer-audit.mjs';
import {sourceEditorInputs} from './ned-source-editor.mjs';
const root=path.resolve(import.meta.dirname,'..');
const branch=process.env.GITHUB_REF_NAME;
const run=(cmd,args,options={})=>execFileSync(cmd,args,{cwd:root,stdio:'inherit',...options});
const capture=(cmd,args)=>execFileSync(cmd,args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const json=async file=>JSON.parse((await readFile(path.join(root,file),'utf8')).replace(/^\ufeff/,''));
const gh=args=>JSON.parse(capture('gh',args));
const sha=()=>capture('git',['rev-parse','HEAD']);
const push=()=>run('git',['-c','credential.helper=!gh auth git-credential','push','origin','HEAD:refs/heads/'+branch]);
async function commit(files,message){
 run('git',['add','--',...files]);
 if(capture('git',['diff','--cached','--name-only'])){run('git',['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m',message]);push();}
}
async function output(key,value){if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,key+'='+value+'\n');}
function checkedID(name){const value=process.env[name];if(!/^\d+$/.test(value??''))throw Error('Missing immutable workflow run: '+name);return value;}
const {version}=await json('package.json');
const revision=process.env.NED_BUILD_REVISION??'';
if(!/^0\.3\.[1-9]\d+$/.test(version)||(revision&&!/^rebuild[1-9][0-9]*$/.test(revision))||(branch!==`codex/ned-${version}`&&branch!=='AG-work'))throw Error('Unexpected release version or branch');
const artifactVersion=version+(revision?'-'+revision:'');
const editorArtifactVersion=['0.3.12','0.3.13','0.3.14'].includes(version)&&/^rebuild[1-9][0-9]*$/.test(revision)?version:artifactVersion;
const prefix=`Ned-${artifactVersion}`;
const mode=process.argv[2];
if(mode==='candidate'){
 const editorRun=checkedID('NED_EDITOR_RUN');
 if(['0.3.11','0.3.12','0.3.13','0.3.14'].includes(version))run(process.execPath,['scripts/verify-current-docs.mjs']);
 run('python3',['scripts/release-inputs.py']);
 run('git',['-c','credential.helper=!gh auth git-credential','lfs','pull','--include=downloads/astryx/*.zip']);
 run(process.execPath,['scripts/ned-package.mjs','release-prepare']);
 const old=await json('release-runtime-lock.json');if(old.version!==version)throw Error('Runtime preparation did not record '+version);
 run('gh',['run','watch',editorRun,'--exit-status','--interval','30']);
 const editor=gh(['api',`repos/${process.env.GH_REPO}/actions/runs/${editorRun}`]);
 if(editor.conclusion!=='success'||editor.path!=='.github/workflows/windows-offline-smoke.yml'||editor.head_branch!==branch)throw Error('Unverified editor build');
 run('git',['diff','--exit-code',editor.head_sha,'HEAD','--','scripts/patch-ned-editor.mjs','scripts/ned-editor-version.mjs','ned-editor-source-lock.json','assets/ned-icon.png','package.json']);
 run('gh',['run','download',editorRun,'--pattern',`ned-editor-${editorArtifactVersion}-*`,'--dir','.cache/ned/editor-download']);
 const {readdir}=await import('node:fs/promises');const records=(await readdir(path.join(root,'.cache/ned/editor-download'),{recursive:true})).filter(name=>path.basename(name)===`build-${editorArtifactVersion}.json`);
 if(records.length!==1)throw Error('Ambiguous editor artifact');const editorFolder=path.dirname(records[0]);
 for(const name of [`Ned-editor-${editorArtifactVersion}.exe`,`zed-ned-editor-source-v1.28.1-${editorArtifactVersion}.tar.gz`,`build-${editorArtifactVersion}.json`])await cp(path.join(root,'.cache/ned/editor-download',editorFolder,name),path.join(root,'downloads/editor',name));
 const editorInputs=await sourceEditorInputs(root);
 if(editorInputs.build.sourceCommit!==editor.head_sha)throw Error('Editor artifact source mismatch');
 run(process.execPath,['scripts/windows-test-bundle.mjs']);
 const fixtureGroups=['upgrade'];
 const artifactTransport=['0.3.11','0.3.12','0.3.13','0.3.14'].includes(version);
 await commit(['release-runtime-lock.json',...(artifactTransport?[]:Object.keys(editorInputs.files).map(name=>`downloads/editor/${name}`)),
  `downloads/editor/${editorInputs.identity.metadata}`,
  ...fixtureGroups.flatMap(name=>[`downloads/${prefix}-windows-${name}-test.cjs`,`downloads/${prefix}-windows-${name}-test.cjs.sha256`])],
  `build: pin Ned ${artifactVersion} runtime, source editor and Windows fixtures`);
 const source=sha();
 run(process.execPath,['scripts/ned-package.mjs','release'],{env:{...process.env,NED_AUDIT_DISCARD_STAGE:'1'}});
 const audit=await json('release/ned/installer-audit.json');if(audit.sourceCommit!==source||audit.payloadComparison?.allStagedBytesVerified!==true)throw Error('Incomplete installer audit');
 const directory=`downloads/candidates/${source}`;await mkdir(path.join(root,directory),{recursive:true});
 for(const [from,to]of [...(artifactTransport?[]:[[`${prefix}-win-x64.exe`,`${prefix}-win-x64.exe`]]),['installer-audit.json',`${prefix}-installer-audit.json`],['payload-manifest.json',`${prefix}-payload-manifest.json`]])await cp(path.join(root,'release/ned',from),path.join(root,directory,to));
 await commit([directory],`build: record immutable Ned ${artifactVersion} installer candidate`);
 const state='.cache/ned/release-state';await mkdir(path.join(root,state),{recursive:true});
 await cp(path.join(root,'.cache/ned/handover-sources'),path.join(root,state,'handover-sources'),{recursive:true});
 await cp(path.join(root,`.cache/ned/installer-audit-checkpoint-${artifactVersion}.json`),path.join(root,state,`installer-audit-checkpoint-${artifactVersion}.json`));
 for(const item of (await json('ghidra-runtime-lock.json')).artifacts.filter(a=>a.kind.endsWith('-source')))await cp(path.join(root,'.cache/ghidra',item.file),path.join(root,state,item.file));
 await writeFile(path.join(root,state,'candidate.json'),JSON.stringify({sourceCommit:source,candidateCommit:sha(),editorRun,installer:audit.installer},null,2)+'\n');
 await output('version',artifactVersion);
 await output('source_sha',source);await output('candidate_commit',sha());
}else throw Error('Unsupported release phase');
