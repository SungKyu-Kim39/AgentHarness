// Authorized release orchestration. No existing release, tag or binary is replaced.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,cp,stat,appendFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileHash} from './installer-audit.mjs';
import {sourceEditorInputs} from './ned-source-editor.mjs';
import {isActionsTransportVersion,isRebuiltEditorReusable,isSupportedReleaseVersion,isValidRevision,pinnedEditorRevision} from './release-policy.mjs';
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
if(!isSupportedReleaseVersion(version)||(revision&&!isValidRevision(revision))||(branch!==`codex/ned-${version}`&&branch!=='AG-work'))throw Error('Unexpected release version or branch');
const artifactVersion=version+(revision?'-'+revision:'');
const editorRevision=pinnedEditorRevision(version,revision);
const editorArtifactVersion=version+(editorRevision?'-'+editorRevision:'');
const prefix=`Ned-${artifactVersion}`;
const mode=process.argv[2];
if(mode==='candidate'){
 const editorRun=checkedID('NED_EDITOR_RUN');
 if(isActionsTransportVersion(version))run(process.execPath,['scripts/verify-current-docs.mjs']);
 run('python3',['scripts/release-inputs.py']);
 run('git',['-c','credential.helper=!gh auth git-credential','lfs','pull','--include=downloads/astryx/*.zip']);
 run(process.execPath,['scripts/ned-package.mjs','release-prepare']);
 const old=await json('release-runtime-lock.json');if(old.version!==version)throw Error('Runtime preparation did not record '+version);
 run('gh',['run','watch',editorRun,'--exit-status','--interval','30']);
 const editor=gh(['api',`repos/${process.env.GH_REPO}/actions/runs/${editorRun}`]);
 const reuseEditor=isRebuiltEditorReusable(version,revision);
 if(editor.conclusion!=='success'||editor.path!=='.github/workflows/windows-offline-smoke.yml'||(!reuseEditor&&editor.head_branch!==branch))throw Error('Unverified editor build');
 if(reuseEditor)run('git',['merge-base','--is-ancestor',editor.head_sha,'HEAD']);
 run('git',['diff','--exit-code',editor.head_sha,'HEAD','--','scripts/patch-ned-editor.mjs','scripts/ned-editor-version.mjs','scripts/release-policy.mjs','ned-editor-source-lock.json','assets/ned-icon.png','package.json']);
 const editorArtifacts=gh(['api',`repos/${process.env.GH_REPO}/actions/runs/${editorRun}/artifacts`]).artifacts.filter(item=>!item.expired);
 const artifactName=value=>`ned-editor-${value}-${editor.head_sha}`;
 // This patched editor ran before the source-build job exported build_revision.
 const missedRevision=version==='0.4.2'&&editorRevision==='rebuild3'&&!editorArtifacts.some(item=>item.name===artifactName(editorArtifactVersion));
 const compiledArtifactVersion=missedRevision?version:editorArtifactVersion;
 if(editorArtifacts.filter(item=>item.name===artifactName(compiledArtifactVersion)).length!==1)throw Error('Missing or ambiguous editor artifact');
 const editorFolder='.cache/ned/editor-download';
 run('gh',['run','download',editorRun,'--name',artifactName(compiledArtifactVersion),'--dir',editorFolder]);
 const editorBuild=await json(`${editorFolder}/build-${compiledArtifactVersion}.json`);
 if(editorBuild.sourceCommit!==editor.head_sha)throw Error('Editor artifact source mismatch');
 if(missedRevision){
  if(editorBuild.buildRevision!==undefined)throw Error('Unexpected revision for the compiled editor');
  editorBuild.releaseRevision=editorRevision;
  editorBuild.compiledArtifactVersion=compiledArtifactVersion;
 }
 for(const filename of [value=>`Ned-editor-${value}.exe`,value=>`zed-ned-editor-source-v1.28.1-${value}.tar.gz`]){
  const compiled=filename(compiledArtifactVersion),pinned=filename(editorArtifactVersion);
  const item=editorBuild.files.find(record=>record.name===compiled);
  if(!item)throw Error('Editor artifact manifest does not include '+compiled);
  await cp(path.join(root,editorFolder,compiled),path.join(root,'downloads/editor',pinned));
  item.name=pinned;
 }
 await writeFile(path.join(root,'downloads/editor',`build-${editorArtifactVersion}.json`),JSON.stringify(editorBuild,null,2)+'\n');
 const editorInputs=await sourceEditorInputs(root);
 run(process.execPath,['scripts/windows-test-bundle.mjs']);
 const fixtureGroups=['upgrade'];
 const artifactTransport=isActionsTransportVersion(version);
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
