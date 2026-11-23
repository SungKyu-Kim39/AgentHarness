// Finalize and publish only the exact installer that passed installed Windows tests.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,cp,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileHash} from './installer-audit.mjs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),repo=process.env.GH_REPO,branch=process.env.GITHUB_REF_NAME;
const run=(cmd,args,options={})=>execFileSync(cmd,args,{cwd:root,stdio:'inherit',...options});
const capture=(cmd,args)=>execFileSync(cmd,args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const gh=args=>JSON.parse(capture('gh',args));
const json=async file=>JSON.parse((await readFile(path.join(root,file),'utf8')).replace(/^\ufeff/,''));
const sha=()=>capture('git',['rev-parse','HEAD']);
const exists=file=>access(path.join(root,file)).then(()=>true,()=>false);
async function commit(files,message){run('git',['add','--',...files]);if(capture('git',['diff','--cached','--name-only'])){run('git',['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m',message]);run('git',['-c','credential.helper=!gh auth git-credential','push','origin','HEAD:refs/heads/'+branch]);}}
const {version}=await json('package.json');
const requested=process.env.NED_VERSION??'';
const revision=requested===version?'':requested.startsWith(version+'-')?requested.slice(version.length+1):'';
if(!/^0\.3\.[1-9]\d+$/.test(version)||(requested!==version&&!(['0.3.12','0.3.13','0.3.14'].includes(version)&&/^rebuild[1-9][0-9]*$/.test(revision))))throw Error('Unexpected release version');
const artifactVersion=version+(revision?'-'+revision:'');
const editorArtifactVersion=['0.3.12','0.3.13','0.3.14'].includes(version)&&/^rebuild[1-9][0-9]*$/.test(revision)?version:artifactVersion;
const prefix=`Ned-${artifactVersion}`,tag=`v${artifactVersion}`,groups=['upgrade'];
const validationRun=process.env.NED_VALIDATION_RUN,candidateRun=process.env.NED_CANDIDATE_RUN,source=process.env.NED_CANDIDATE_SOURCE;
if((branch!==`codex/ned-${version}`&&branch!=='AG-work')||!/^\d+$/.test(validationRun??'')||!/^\d+$/.test(candidateRun??'')||!/^[a-f0-9]{40}$/.test(source??''))throw Error('Invalid immutable release inputs');
const validation=gh(['api',`repos/${repo}/actions/runs/${validationRun}`]),candidate=gh(['api',`repos/${repo}/actions/runs/${candidateRun}`]);
for(const item of [validation,candidate])if(item.conclusion!=='success'||item.path!=='.github/workflows/windows-offline-smoke.yml'||item.head_branch!==branch)throw Error('Release requires successful matching workflow runs');
run('git',['merge-base','--is-ancestor',validation.head_sha,'HEAD']);
run('git',['diff','--exit-code',validation.head_sha,'HEAD','--',...groups.flatMap(name=>[`downloads/${prefix}-windows-${name}-test.cjs`,`downloads/${prefix}-windows-${name}-test.cjs.sha256`])]);
run('gh',['run','download',validationRun,'--name','windows-offline-smoke-'+artifactVersion,'--dir','.cache/ned/windows-validation']);
const proof=await json('.cache/ned/windows-validation/windows-offline-smoke.json');
const candidatePath=`downloads/candidates/${source}`;
const audit=await json(`${candidatePath}/${prefix}-installer-audit.json`);
const previousVersion=version==='0.3.14'?(revision?'0.3.14':'0.3.13'):version==='0.3.13'?(revision?'0.3.13':'0.3.12-rebuild2'):artifactVersion==='0.3.12-rebuild2'?'0.3.12-rebuild1':artifactVersion==='0.3.12-rebuild1'?'0.3.12':version==='0.3.12'?'0.3.11':version==='0.3.11'?'0.3.10':'0.3.9';
const actionsTransport=['0.3.11','0.3.12','0.3.13','0.3.14'].includes(version);
const optionalName=`${prefix}-optional-packages.json`;
const optional=version==='0.3.11'?await json(`${candidatePath}/${optionalName}`):undefined;
if(optional&&(optional.sourceCommit!==source||optional.assets.length!==2||proof.coreAndReversingPackVerified!==true||proof.userDataPreserved!==true))throw Error('Optional packages or user data preservation lack installed validation');
if(['0.3.12','0.3.13','0.3.14'].includes(version)&&proof.userDataPreserved!==true)throw Error('User data preservation lacks installed validation');
if(proof.version!==artifactVersion||proof.candidateSource!==source||proof.installerSha256!==audit.installer.sha256||audit.sourceCommit!==source||!audit.payloadComparison?.allStagedBytesVerified||proof.runtimeSourceOverride||proof.upgradedFrom!==previousVersion||proof.userGlobalSkillsPreserved!==true)throw Error('Windows installed bytes/provenance mismatch');
let tests=0,passed=0,skipped=0;
for(const name of groups){
 const text=await readFile(path.join(root,`.cache/ned/windows-validation/windows-${name}-test.txt`),'utf8');
 const field=key=>Number(text.match(new RegExp('^# '+key+' (\\d+)','m'))?.[1]);
 if(!Number.isSafeInteger(field('tests'))||field('tests')<1||field('fail')!==0||field('cancelled')!==0)throw Error('Incomplete installed Windows report: '+name);
 tests+=field('tests');passed+=field('pass');skipped+=field('skipped');
}
const finalManifest=`downloads/${prefix}-bundle-manifest.json`;
const stagedAlready=await exists(finalManifest);
const binaryAsset=name=>name.endsWith('.exe')||name.endsWith('.tgz');
let bundle;
let artifactCommit;
const releaseUrl=`https://github.com/${repo}/releases/tag/${tag}`;
const files=['win-x64.exe','windows-x64.tgz','win-x64.exe.sha256','windows-x64.tgz.sha256','installer-audit.json','payload-manifest.json','bundle-manifest.json'].map(suffix=>prefix+'-'+suffix);
if(optional)files.push(optionalName,...optional.assets.flatMap(item=>[item.name,item.name+'.sha256']));
if(stagedAlready){
  bundle=await json(finalManifest);
  artifactCommit=capture('git',['log','-1','--format=%H','--',finalManifest]);
  if(actionsTransport){
   const recover=process.env.NED_PUBLISH_RECOVERY_RUN;
   if(/^\d+$/.test(recover??'')){
    run('gh',['run','download',recover,'--name',`ned-${artifactVersion}-publish-recovery-${source}`,'--dir','downloads']);
   }else run('gh',['release','download',tag,'--dir','downloads',...files.filter(binaryAsset).flatMap(name=>['--pattern',name])]);
  }else run('git',['-c','credential.helper=!gh auth git-credential','lfs','pull','--include='+files.filter(binaryAsset).map(name=>'downloads/'+name).join(',')]);
}else{
run('gh',['run','download',candidateRun,'--name','ned-'+artifactVersion+'-release-state-'+source,'--dir','.cache/ned/release-state']);
const state=await json('.cache/ned/release-state/candidate.json');if(state.sourceCommit!==source||state.installer.sha256!==audit.installer.sha256)throw Error('Build state mismatch');
await cp(path.join(root,'.cache/ned/release-state/handover-sources'),path.join(root,'.cache/ned/handover-sources'),{recursive:true});
await mkdir(path.join(root,'.cache/ghidra'),{recursive:true});
for(const item of (await json('ghidra-runtime-lock.json')).artifacts.filter(a=>a.kind.endsWith('-source')))await cp(path.join(root,'.cache/ned/release-state',item.file),path.join(root,'.cache/ghidra',item.file));
const output='release/ned';await mkdir(path.join(root,output),{recursive:true});
let binaryDirectory=candidatePath;
if(actionsTransport){
 binaryDirectory='.cache/ned/candidate-binaries';
 run('gh',['run','download',candidateRun,'--name',`ned-${artifactVersion}-installer-assets-${source}`,'--dir',binaryDirectory]);
 run('gh',['run','download',String(state.editorRun),'--pattern',`ned-editor-${editorArtifactVersion}-*`,'--dir','.cache/ned/final-editor']);
 const {readdir}=await import('node:fs/promises');
 const archive=`zed-ned-editor-source-v1.28.1-${editorArtifactVersion}.tar.gz`;
 const editorFile=(await readdir(path.join(root,'.cache/ned/final-editor'),{recursive:true})).find(name=>path.basename(name)===archive);
 const editorBuild=await json(`downloads/editor/build-${editorArtifactVersion}.json`);
 const pinned=editorBuild.files.find(item=>item.name===archive), editorSource=path.join(root,'.cache/ned/final-editor',editorFile??'missing');
 if(!pinned||await fileHash(editorSource)!==pinned.sha256)throw Error('Corresponding editor source does not match build metadata');
 await cp(editorSource,path.join(root,'downloads/editor',archive));
 run('git',['-c','credential.helper=!gh auth git-credential','lfs','pull','--include=downloads/astryx/*.zip']);
}else run('git',['-c','credential.helper=!gh auth git-credential','lfs','pull','--include='+[`${candidatePath}/${prefix}-win-x64.exe`,'downloads/astryx/*.zip',`downloads/editor/*${editorArtifactVersion}*`].join(',')]);
await cp(path.join(root,binaryDirectory,`${prefix}-win-x64.exe`),path.join(root,output,`${prefix}-win-x64.exe`));
for(const [from,to]of [[`${prefix}-installer-audit.json`,'installer-audit.json'],[`${prefix}-payload-manifest.json`,'payload-manifest.json']])await cp(path.join(root,candidatePath,from),path.join(root,output,to));
if(await fileHash(path.join(root,output,`${prefix}-win-x64.exe`))!==audit.installer.sha256)throw Error('Candidate LFS bytes mismatch');
const windows={...proof,workflowRunId:Number(validationRun),workflowCommit:validation.head_sha,tests,passed,skipped,failed:0};
await writeFile(path.join(root,`downloads/${prefix}-windows-offline-smoke.json`),JSON.stringify(windows,null,2)+'\n');
const notesFile=`docs/release-${artifactVersion}.md`;
const notes=await readFile(path.join(root,notesFile),'utf8');
const verificationSummary=`설치 파일 ${audit.payloadComparison.files.toLocaleString('en-US')}개를 준비본과 대조했습니다. Windows Server에서 새 설치, ${previousVersion} 업데이트와 사용자 글로벌 스킬 보존을 확인했고 설치본 대상 검사 ${passed}건이 통과했습니다. 직원 PC의 Windows 10·11 GUI와 실제 사내 모델 검증은 남아 있어 사전 릴리스로 제공합니다.\n\n[Windows 검사](https://github.com/${repo}/actions/runs/${validationRun}) · [검증 기록](https://github.com/${repo}/blob/main/docs/validation-${artifactVersion}.md)\n`;
await writeFile(path.join(root,notesFile),notes.replace('<!-- windows-verification -->',verificationSummary));
const validationFile=`docs/validation-${artifactVersion}.md`;
let record=await readFile(path.join(root,validationFile),'utf8');
record=record.split('\n## 설치 파일과 Windows 결과\n')[0].replace(/현재 게시된 배포본은 .*?\.\n/,'').trimEnd()+'\n';
record+=`\n## 설치 파일과 Windows 결과\n\n제품 소스는 \`${source}\`입니다. Windows Server에 최종 EXE를 새로 설치해 ${tests}건 중 ${passed}건 통과, ${skipped}건 제외, 실패 0건을 확인했습니다. ${previousVersion}에서 제자리 업데이트해 사용자 스킬 원본과 참조 문서의 SHA-256이 유지됐고 제거한 등록·복구 리소스가 설치 폴더에 남지 않았습니다.\n\n설치 EXE는 ${audit.installer.bytes} bytes, SHA-256 \`${audit.installer.sha256}\`입니다. 준비본과 추출본의 ${audit.payloadComparison.files}개 파일을 모두 대조했습니다.\n\n[실행 결과](../downloads/${prefix}-windows-offline-smoke.json) · [설치 감사](../downloads/${prefix}-installer-audit.json) · [반입 TGZ](../downloads/README.md)\n`;
await writeFile(path.join(root,validationFile),record);
let handoff=await readFile(path.join(root,'HANDOFF.md'),'utf8');
const displayVersion=revision?`${version} ${revision}`:version;
handoff=handoff
 .replace(/최신 (?:게시 )?(?:사전 릴리스|배포 기준)[은는] .*?(?:반영했습니다|입니다)\./,`최신 사전 릴리스는 **Ned ${displayVersion}**입니다.`)
 .replace(new RegExp(`## ${version.replaceAll('.','\\.')} 작업 기준 \\(\`AG-work\`\\)|<!-- current-release -->`),`## ${displayVersion} 배포 기준\n\n소스 \`${source}\`를 사용했습니다. Windows 새 설치·${previousVersion} 업데이트와 ${passed}개 설치본 검사를 통과했습니다. [다운로드](downloads/README.md) · [검증 기록](${validationFile})\n`);
await writeFile(path.join(root,'HANDOFF.md'),handoff);
await commit([validationFile,notesFile,'HANDOFF.md',`downloads/${prefix}-windows-offline-smoke.json`],`docs: record installed Windows validation for Ned ${artifactVersion}`);
run(process.execPath,['scripts/ned-package.mjs','bundle'],{env:{...process.env,...(revision?{NED_BUILD_REVISION:revision}:{})}});
bundle=await json('release/ned/bundle-manifest.json');
if(bundle.sourceCommit!==source||bundle.installer.sha256!==audit.installer.sha256)throw Error('Bundle provenance mismatch');
for(const [from,to]of [[`${prefix}-win-x64.exe`,`${prefix}-win-x64.exe`],[`${prefix}-windows-x64.tgz`,`${prefix}-windows-x64.tgz`],[`${prefix}-windows-x64.tgz.sha256`,`${prefix}-windows-x64.tgz.sha256`],['installer-audit.json',`${prefix}-installer-audit.json`],['payload-manifest.json',`${prefix}-payload-manifest.json`],['bundle-manifest.json',`${prefix}-bundle-manifest.json`]]){
 const dest='downloads/'+to;if(await exists(dest))throw Error('Immutable final file exists: '+to);await cp(path.join(root,output,from),path.join(root,dest));
}
await writeFile(path.join(root,`downloads/${prefix}-win-x64.exe.sha256`),audit.installer.sha256+'  '+prefix+'-win-x64.exe\n');
if(optional){
 await cp(path.join(root,candidatePath,optionalName),path.join(root,'downloads',optionalName));
 for(const item of optional.assets){
  const file=path.join(root,binaryDirectory,item.name);
  if((await fileHash(file))!==item.sha256)throw Error('Optional package bytes mismatch');
  await cp(file,path.join(root,'downloads',item.name));
  await writeFile(path.join(root,'downloads',item.name+'.sha256'),item.sha256+'  '+item.name+'\n');
 }
}
const verification={schemaVersion:1,version:artifactVersion,sourceCommit:source,bundleSourceCommit:bundle.bundleSourceCommit,archive:bundle.archive,bytes:bundle.bytes,sha256:bundle.sha256,files:bundle.files,allPathsAscii:true,correspondingSourcesChecked:true,installer:audit.installer,windowsRunId:Number(validationRun)};
await writeFile(path.join(root,`downloads/${prefix}-bundle-verification.json`),JSON.stringify(verification,null,2)+'\n');
let readme=await readFile(path.join(root,'README.md'),'utf8');
readme=readme.replace(/^최신 (?:게시 )?사전 릴리스는 .*$/m,`최신 사전 릴리스는 [Ned ${displayVersion}](${releaseUrl})입니다. [설치 EXE·반입 TGZ](downloads/README.md) · [검증 기록](${validationFile}).`)
 .replace(/최신 배포는 .*?입니다\./,`최신 배포는 [Ned ${displayVersion}](${releaseUrl})입니다.`)
 .replace(/현재 배포 기준은 0\.3\.\d+(?: rebuild\d+)?입니다\./,`현재 배포 기준은 ${displayVersion}입니다.`);
await writeFile(path.join(root,'README.md'),readme);
const optionalLinks=optional?'\n- '+optional.assets.map(item=>`[${item.name.includes('-core-')?'Core 설치 EXE':'리버싱 팩'}](${releaseUrl.replace('/tag/','/download/')}/${item.name}) · [SHA-256](${item.name}.sha256)`).join('\n- '):'';
const oldDownloads=await readFile(path.join(root,'downloads/README.md'),'utf8');
await writeFile(path.join(root,'downloads/README.md'),`# Ned ${displayVersion}\n\nWindows x64 사전 릴리스입니다. Ned와 개인 Zed를 종료하고 TGZ를 새 폴더에 푼 뒤 EXE를 실행합니다. 기존 설정·대화·지식과 사용자 글로벌 스킬은 보존됩니다.\n\n- [반입 TGZ](https://github.com/${repo}/releases/download/${tag}/${prefix}-windows-x64.tgz) · ${bundle.bytes} bytes\n- [설치 EXE](https://github.com/${repo}/releases/download/${tag}/${prefix}-win-x64.exe) · ${audit.installer.bytes} bytes${optionalLinks}\n- [TGZ SHA-256](${prefix}-windows-x64.tgz.sha256) · [EXE SHA-256](${prefix}-win-x64.exe.sha256)\n- [변경 사항](../docs/changes-${version}.md) · [사용 안내](../docs/ned-user-guide.md) · [검증](../${validationFile})\n- [설치 감사](${prefix}-installer-audit.json) · [TGZ 검사](${prefix}-bundle-verification.json) · [Windows 결과](${prefix}-windows-offline-smoke.json) · [공개 다운로드 검증](${prefix}-public-verification.json) · [배포 상태](${prefix}-release-state.json)\n\n---\n\n`+oldDownloads.replace(/최신 사전 릴리스입니다\./,'이전 사전 릴리스입니다.'));
await commit(['README.md','downloads/README.md',...files.filter(name=>!actionsTransport||!binaryAsset(name)).map(name=>'downloads/'+name),`downloads/${prefix}-bundle-verification.json`],`release: record Ned ${artifactVersion} installer and offline bundle`);
artifactCommit=sha();
}
if(bundle.version!==version||(bundle.buildRevision??'')!==revision||bundle.sourceCommit!==source||bundle.installer.sha256!==audit.installer.sha256||
   await fileHash(path.join(root,'downloads',prefix+'-win-x64.exe'))!==audit.installer.sha256||
   await fileHash(path.join(root,'downloads',prefix+'-windows-x64.tgz'))!==bundle.sha256)throw Error('Release files do not match the verified candidate');
for(const item of optional?.assets??[])if(await fileHash(path.join(root,'downloads',item.name))!==item.sha256)throw Error('Optional package does not match verified bytes');
const releaseRecord=()=> {
 const releases=capture('gh',['api','--paginate',`repos/${repo}/releases?per_page=100`,'--jq',`.[] | select(.tag_name == ${JSON.stringify(tag)})`]);
 return releases?JSON.parse(releases):undefined;
};
let release=releaseRecord();
if(!release){
 run('gh',['release','create',tag,'--target',source,'--title',`Ned ${revision?`${version} ${revision}`:version}`,'--draft','--prerelease','--notes-file',`docs/release-${artifactVersion}.md`,...files.map(name=>'downloads/'+name)]);
 release=releaseRecord();
}
if(!release||release.target_commitish!==source||!release.prerelease||release.assets.some(asset=>!files.includes(asset.name)))
 throw Error('Release identity or asset set differs from the verified build');
for(const asset of release.assets){
 if(asset.digest!=='sha256:'+await fileHash(path.join(root,'downloads',asset.name)))throw Error('Existing asset digest mismatch: '+asset.name);
}
const missing=files.filter(name=>!release.assets.some(asset=>asset.name===name));
if(missing.length){
 if(!release.draft)throw Error('Published release needs recovery before verification');
 run('gh',['release','upload',tag,...missing.map(name=>'downloads/'+name)]);
 release=releaseRecord();
}
if(release.assets.length!==files.length)throw Error('Incomplete release upload');
for(const asset of release.assets){
 if(asset.digest!=='sha256:'+await fileHash(path.join(root,'downloads',asset.name)))throw Error('Uploaded asset digest mismatch: '+asset.name);
}
if(release.draft)run('gh',['release','edit',tag,'--notes-file',`docs/release-${artifactVersion}.md`]);
if(release.draft)run('gh',['api','--method','PATCH',`repos/${repo}/releases/${release.id}`,'-F','draft=false','--silent']);
const published=gh(['api',`repos/${repo}/releases/tags/${tag}`]);
if(published.draft||published.assets.length!==files.length||published.assets.some(asset=>!files.includes(asset.name))||gh(['api',`repos/${repo}/commits/${tag}`]).sha!==source)throw Error('Published release identity mismatch');
const verified=[];
for(const asset of published.assets){
 let complete;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(asset.browser_download_url,{redirect:'follow'});if(!response.ok)throw Error('Public download failed: '+asset.name);
   const h=createHash('sha256');let bytes=0;for await(const chunk of response.body){h.update(chunk);bytes+=chunk.length;}
   const digest=h.digest('hex');if(bytes!==asset.size||asset.digest!=='sha256:'+digest)throw Error('Public download hash mismatch: '+asset.name);
   complete={name:asset.name,bytes,sha256:digest,url:asset.browser_download_url};break;
  }catch(error){if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,2000*(attempt+1)));}
 }
 verified.push(complete);
}
await writeFile(path.join(root,`downloads/${prefix}-public-verification.json`),JSON.stringify({schemaVersion:1,version:artifactVersion,releaseUrl,recordedAt:new Date().toISOString(),authenticated:false,verifiedFullDownloads:true,assets:verified},null,2)+'\n');
await writeFile(path.join(root,`downloads/${prefix}-release-state.json`),JSON.stringify({schemaVersion:1,product:'Ned',version:artifactVersion,sourceCommit:source,artifactCommit,releaseUrl,filesPublished:true,releaseAssetsPublished:true,publicDownloadsFullyVerified:true,windowsRunId:Number(validationRun),installer:audit.installer,bundle:{name:bundle.archive,bytes:bundle.bytes,sha256:bundle.sha256},releaseReady:false,isPrerelease:true,releaseAssetCount:verified.length,assets:verified},null,2)+'\n');
await commit([`downloads/${prefix}-public-verification.json`,`downloads/${prefix}-release-state.json`],`docs: verify every public Ned ${artifactVersion} release download`);
run('git',['fetch','origin','main','work']);
for(const target of ['main','work']){run('git',['merge-base','--is-ancestor','origin/'+target,'HEAD']);run('git',['-c','credential.helper=!gh auth git-credential','push','origin','HEAD:refs/heads/'+target]);}
console.log('Published and fully verified '+releaseUrl);
