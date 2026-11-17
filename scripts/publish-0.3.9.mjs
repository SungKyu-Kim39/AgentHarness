// Finalize and publish only the exact installer that passed installed Windows tests.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,cp,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileHash} from './installer-audit.mjs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),prefix='Ned-0.3.9',repo=process.env.GH_REPO,branch=process.env.GITHUB_REF_NAME;
const run=(cmd,args,options={})=>execFileSync(cmd,args,{cwd:root,stdio:'inherit',...options});
const capture=(cmd,args)=>execFileSync(cmd,args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const gh=args=>JSON.parse(capture('gh',args));
const json=async file=>JSON.parse((await readFile(path.join(root,file),'utf8')).replace(/^\ufeff/,''));
const sha=()=>capture('git',['rev-parse','HEAD']);
const exists=file=>access(path.join(root,file)).then(()=>true,()=>false);
async function commit(files,message){run('git',['add','--',...files]);if(capture('git',['diff','--cached','--name-only'])){run('git',['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m',message]);run('git',['-c','credential.helper=!gh auth git-credential','push','origin','HEAD:refs/heads/'+branch]);}}
const validationRun=process.env.NED_VALIDATION_RUN,candidateRun=process.env.NED_CANDIDATE_RUN,source=process.env.NED_CANDIDATE_SOURCE;
if(!['codex/ned-0.3.9','work'].includes(branch)||!/^\d+$/.test(validationRun??'')||!/^\d+$/.test(candidateRun??'')||!/^[a-f0-9]{40}$/.test(source??''))throw Error('Invalid immutable release inputs');
const validation=gh(['api',`repos/${repo}/actions/runs/${validationRun}`]),candidate=gh(['api',`repos/${repo}/actions/runs/${candidateRun}`]);
for(const item of [validation,candidate])if(item.conclusion!=='success'||item.path!=='.github/workflows/windows-offline-smoke.yml'||item.head_branch!==branch)throw Error('Release requires successful matching workflow runs');
run('git',['merge-base','--is-ancestor',validation.head_sha,'HEAD']);
run('git',['diff','--exit-code',validation.head_sha,'HEAD','--',...['namespace','delete','compaction','native','python','upgrade'].flatMap(name=>[`downloads/${prefix}-windows-${name}-test.cjs`,`downloads/${prefix}-windows-${name}-test.cjs.sha256`])]);
run('gh',['run','download',validationRun,'--name','windows-offline-smoke-0.3.9','--dir','.cache/ned/windows-validation']);
const proof=await json('.cache/ned/windows-validation/windows-offline-smoke.json');
const candidatePath=`downloads/candidates/${source}`;
const audit=await json(`${candidatePath}/${prefix}-installer-audit.json`);
if(proof.version!=='0.3.9'||proof.candidateSource!==source||proof.installerSha256!==audit.installer.sha256||audit.sourceCommit!==source||!audit.payloadComparison?.allStagedBytesVerified||proof.runtimeSourceOverride)throw Error('Windows installed bytes/provenance mismatch');
let tests=0,passed=0,skipped=0;
for(const name of ['namespace','delete','compaction','native','python','upgrade']){
 const text=await readFile(path.join(root,`.cache/ned/windows-validation/windows-${name}-test.txt`),'utf8');
 const field=key=>Number(text.match(new RegExp('^# '+key+' (\\d+)','m'))?.[1]);
 if(!Number.isSafeInteger(field('tests'))||field('tests')<1||field('fail')!==0||field('cancelled')!==0)throw Error('Incomplete installed Windows report: '+name);
 tests+=field('tests');passed+=field('pass');skipped+=field('skipped');
}
run('gh',['run','download',candidateRun,'--name','ned-0.3.9-release-state-'+source,'--dir','.cache/ned/release-state']);
const state=await json('.cache/ned/release-state/candidate.json');if(state.sourceCommit!==source||state.installer.sha256!==audit.installer.sha256)throw Error('Build state mismatch');
await cp(path.join(root,'.cache/ned/release-state/handover-sources'),path.join(root,'.cache/ned/handover-sources'),{recursive:true});
await mkdir(path.join(root,'.cache/ghidra'),{recursive:true});
for(const item of (await json('ghidra-runtime-lock.json')).artifacts.filter(a=>a.kind.endsWith('-source')))await cp(path.join(root,'.cache/ned/release-state',item.file),path.join(root,'.cache/ghidra',item.file));
run('git',['-c','credential.helper=!gh auth git-credential','lfs','pull','--include='+[`${candidatePath}/${prefix}-win-x64.exe`,'downloads/astryx/*.zip','downloads/editor/*0.3.9*'].join(',')]);
const output='release/ned';await mkdir(path.join(root,output),{recursive:true});
for(const [from,to]of [[`${prefix}-win-x64.exe`,`${prefix}-win-x64.exe`],[`${prefix}-installer-audit.json`,'installer-audit.json'],[`${prefix}-payload-manifest.json`,'payload-manifest.json']])await cp(path.join(root,candidatePath,from),path.join(root,output,to));
if(await fileHash(path.join(root,output,`${prefix}-win-x64.exe`))!==audit.installer.sha256)throw Error('Candidate LFS bytes mismatch');
const windows={...proof,workflowRunId:Number(validationRun),workflowCommit:validation.head_sha,tests,passed,skipped,failed:0};
await writeFile(path.join(root,`downloads/${prefix}-windows-offline-smoke.json`),JSON.stringify(windows,null,2)+'\n');
await writeFile(path.join(root,'docs/release-0.3.9.md'),`# Ned 0.3.9\n\n스킬 사전 준비·변경분 적용과 지식 서비스의 백그라운드 시작, 상세 실행 단계, Studio 오류 복구, CMD/PowerShell, 기존 개인 Zed 대화 가져오기와 EGM 7종을 제공합니다. 기본 스킬은 74종입니다. 기본 Zed Agent의 필수 프로필 이름과 모델 통신 프록시 호환성도 보완했습니다.\n\n설치 EXE의 전체 ${audit.payloadComparison.files.toLocaleString('en-US')}개 파일을 준비본과 대조했습니다. Windows Server 설치 후 ${tests}건 중 ${passed}건 통과·${skipped}건 제외·실패 0건입니다. 합성 모델·설치된 런타임을 사용했으며 직원 Win10/11 GUI·실제 사내 모델 수용과는 구분해 사전 릴리스로 제공합니다.\n\n[변경 사항](https://github.com/${repo}/blob/main/docs/changes-0.3.9.md) · [사용 안내](https://github.com/${repo}/blob/main/docs/ned-user-guide.md) · [검증 기록](https://github.com/${repo}/blob/main/docs/validation-0.3.9.md)\n\nTGZ 전체를 새 폴더에 풀고 EXE로 업데이트합니다. 기존 설정·대화·지식과 사용자 수정 스킬은 보존합니다. 첫 개인 Zed 대화 가져오기 전 원본을 보관하고 안내를 확인하세요.\n\n빌드 소스: ${source}\nWindows 검사: https://github.com/${repo}/actions/runs/${validationRun}\n`);
let record=await readFile(path.join(root,'docs/validation-0.3.9.md'),'utf8');
record=record.replace('현재 공개 배포는 0.3.8 rebuild1이며, 0.3.9 EXE·TGZ·릴리스는 생성하거나 게시하지 않았습니다.','0.3.9 설치 EXE를 감사하고 같은 파일을 Windows 실행기에서 설치해 검증했습니다. 반입 TGZ와 사전 릴리스는 이 기록을 포함합니다.');
const at=record.indexOf('## 배포 전 남은 확인');if(at>=0)record=record.slice(0,at);
record+=`## 설치 파일과 Windows 결과\n\n제품 소스는 \`${source}\`입니다. Windows 실행 [${validationRun}](https://github.com/${repo}/actions/runs/${validationRun})에서 검사 중 설치 파일을 교체하지 않고 ${tests}건 중 ${passed}건 통과·${skipped}건 제외·실패 0건을 확인했습니다. 설치 시간은 같은 Windows Server 실행기의 기준/후보 1회 비교이며 직원 PC 성능으로 일반화하지 않습니다.\n\n설치 EXE는 ${audit.installer.bytes} bytes, SHA-256 \`${audit.installer.sha256}\`입니다. 준비본과 추출본의 ${audit.payloadComparison.files}개 파일을 전부 대조했습니다. 0.3.9용 소스 빌드 편집기·대응 소스, 실제 생성한 runtime lock, 준비 스킬과 EGM/Studio lock, YAML ISC 원문을 포함했습니다.\n\nWindows 검사 상세·개수와 설치 측정은 [실행 결과](../downloads/${prefix}-windows-offline-smoke.json), 설치 전체 파일은 [감사 기록](../downloads/${prefix}-installer-audit.json), TGZ 검사·해시는 [다운로드 안내](../downloads/README.md)에 보존합니다.\n\n## 별도 수용 범위\n\n직원 Win10/11 GUI, 실제 사내 Qwen/BGE 첫 메시지·긴 대기열·취소, 실제 개인 DB의 대화 목록·재개와 운영체제별 UI 동작, 외부 DNS/TCP 전체 관찰은 별도 수용 항목입니다. 합성 HTTP·호스트 fixture를 Zed 실제 GUI의 첫 메시지 성공으로 표현하지 않습니다. Goldfish 실제 모델 입력 격리와 검토 품질도 별도입니다. 설치 압축 해제의 코어 사용량과 실제 직원 PC 시작 성능은 측정하지 않았습니다.\n`;
await writeFile(path.join(root,'docs/validation-0.3.9.md'),record);
let handoff=await readFile(path.join(root,'HANDOFF.md'),'utf8');handoff=handoff.replace('현재 변경은 소스 구현 후보이며 설치 파일·릴리스는 게시하지 않았습니다. 실제 Windows GUI와\n사내 모델 수용, 0.3.9 소스 빌드 편집기 반입과 runtime lock/설치 감사는 남았습니다.','0.3.9용 소스 빌드 편집기와 runtime lock, 설치 감사 및 Windows 실행기 검증을 완료했습니다. 실제 직원 Windows GUI와 사내 모델 수용은 별도입니다.');
await writeFile(path.join(root,'HANDOFF.md'),handoff.replace('현재 배포는 **Ned 0.3.8 수정 빌드 1**입니다.','최신 배포 기준은 **Ned 0.3.9**입니다.').replace('## 0.3.9 구현 후보',`## 0.3.9 배포 기준\n\n제품 소스 \`${source}\`, Windows 실행 ${validationRun}: ${tests}건 중 ${passed}건 통과·${skipped}건 제외·실패 0건입니다. EXE·TGZ 해시와 공개 다운로드 검증은 downloads/의 0.3.9 자료를 따릅니다.\n\n## 0.3.9 구현 구조`));
await commit(['docs/validation-0.3.9.md','docs/release-0.3.9.md','HANDOFF.md',`downloads/${prefix}-windows-offline-smoke.json`],'docs: record installed Windows validation for Ned 0.3.9');
run(process.execPath,['scripts/ned-package.mjs','bundle']);
const bundle=await json('release/ned/bundle-manifest.json');
if(bundle.sourceCommit!==source||bundle.installer.sha256!==audit.installer.sha256)throw Error('Bundle provenance mismatch');
for(const [from,to]of [[`${prefix}-win-x64.exe`,`${prefix}-win-x64.exe`],[`${prefix}-windows-x64.tgz`,`${prefix}-windows-x64.tgz`],[`${prefix}-windows-x64.tgz.sha256`,`${prefix}-windows-x64.tgz.sha256`],['installer-audit.json',`${prefix}-installer-audit.json`],['payload-manifest.json',`${prefix}-payload-manifest.json`],['bundle-manifest.json',`${prefix}-bundle-manifest.json`]]){
 const dest='downloads/'+to;if(await exists(dest))throw Error('Immutable final file exists: '+to);await cp(path.join(root,output,from),path.join(root,dest));
}
await writeFile(path.join(root,`downloads/${prefix}-win-x64.exe.sha256`),audit.installer.sha256+'  '+prefix+'-win-x64.exe\n');
const verification={schemaVersion:1,version:'0.3.9',sourceCommit:source,bundleSourceCommit:bundle.bundleSourceCommit,archive:bundle.archive,bytes:bundle.bytes,sha256:bundle.sha256,files:bundle.files,allPathsAscii:true,correspondingSourcesChecked:true,installer:audit.installer,windowsRunId:Number(validationRun)};
await writeFile(path.join(root,`downloads/${prefix}-bundle-verification.json`),JSON.stringify(verification,null,2)+'\n');
const releaseUrl=`https://github.com/${repo}/releases/tag/v0.3.9`;
let readme=await readFile(path.join(root,'README.md'),'utf8');readme=readme.replace(/^0\.3\.9 배포 준비:.*$/m,`최신 사전 릴리스는 [Ned 0.3.9](${releaseUrl})입니다. [설치 EXE·반입 TGZ](downloads/README.md) · [변경 사항](docs/changes-0.3.9.md) · [검증 기록](docs/validation-0.3.9.md).`);readme=readme.replace('현재 배포 기준은 0.3.8 수정 빌드 1입니다.','현재 배포 기준은 0.3.9입니다.');readme=readme.replace(/최신 배포는 \[Ned 0\.3\.8 수정 빌드 1\]\([^\n]+?\)입니다\./,`최신 배포는 [Ned 0.3.9](${releaseUrl})입니다.`);await writeFile(path.join(root,'README.md'),readme);
const oldDownloads=await readFile(path.join(root,'downloads/README.md'),'utf8');
await writeFile(path.join(root,'downloads/README.md'),`# Ned 0.3.9\n\n최신 사전 릴리스입니다. Ned와 개인 Zed를 종료하고 TGZ를 새 폴더에 푼 뒤 EXE로 업데이트합니다. 기존 설정·대화·지식·편집기 환경과 사용자 수정 스킬을 보존합니다.\n\n- [반입 TGZ](https://github.com/${repo}/releases/download/v0.3.9/${prefix}-windows-x64.tgz) — ${bundle.bytes} bytes\n- [설치 EXE](https://github.com/${repo}/releases/download/v0.3.9/${prefix}-win-x64.exe) — ${audit.installer.bytes} bytes\n- [TGZ SHA-256](${prefix}-windows-x64.tgz.sha256) · [EXE SHA-256](${prefix}-win-x64.exe.sha256)\n- [변경 사항](../docs/changes-0.3.9.md) · [사용 안내](../docs/ned-user-guide.md) · [검증](../docs/validation-0.3.9.md)\n- [설치 감사](${prefix}-installer-audit.json) · [TGZ 검사](${prefix}-bundle-verification.json) · [Windows 결과](${prefix}-windows-offline-smoke.json) · [공개 확인](${prefix}-public-verification.json) · [배포 상태](${prefix}-release-state.json)\n\n기본 스킬 74종을 로컬 준비하고 변경분만 적용합니다. 지식 서비스의 준비가 대화를 막지 않으며 구체적인 시작 단계를 표시합니다. Studio 복구, CMD, 기존 개인 Zed 대화 가져오기와 EGM 7종을 포함합니다. 기본 Zed Agent의 필수 name·모델 통신 경로도 보완했습니다.\n\nWindows Server의 설치 후 ${tests}건 중 ${passed}건 통과·${skipped}건 제외·실패 0건입니다. 직원 Win10/11 GUI·실제 사내 모델·전체 외부 DNS/TCP 수용과는 구분합니다. 과거 태그·첨부는 보존합니다.\n\n---\n\n`+oldDownloads.replace('최신 배포입니다.','이전 배포입니다.'));
await commit(['README.md','downloads/README.md',...['win-x64.exe','windows-x64.tgz','win-x64.exe.sha256','windows-x64.tgz.sha256','installer-audit.json','payload-manifest.json','bundle-manifest.json','bundle-verification.json'].map(suffix=>'downloads/'+prefix+'-'+suffix)],'release: record Ned 0.3.9 installer and offline bundle');
const artifactCommit=sha(),files=['win-x64.exe','windows-x64.tgz','win-x64.exe.sha256','windows-x64.tgz.sha256','installer-audit.json','payload-manifest.json','bundle-manifest.json'].map(suffix=>prefix+'-'+suffix);
let release;
try{release=gh(['api',`repos/${repo}/releases/tags/v0.3.9`]);}catch{}
if(release)throw Error('A 0.3.9 release already exists; refusing to replace it');
run('gh',['release','create','v0.3.9','--target',source,'--title','Ned 0.3.9','--draft','--prerelease','--notes-file','docs/release-0.3.9.md',...files.map(name=>'downloads/'+name)]);
release=gh(['api',`repos/${repo}/releases/tags/v0.3.9`]);
for(const name of files){const asset=release.assets.find(a=>a.name===name);if(!asset||asset.digest!=='sha256:'+await fileHash(path.join(root,'downloads',name)))throw Error('Uploaded asset digest mismatch: '+name);}
run('gh',['release','edit','v0.3.9','--draft=false']);
const published=gh(['api',`repos/${repo}/releases/tags/v0.3.9`]);if(published.draft||gh(['api',`repos/${repo}/commits/v0.3.9`]).sha!==source)throw Error('Published release identity mismatch');
const verified=[];
for(const asset of published.assets){
 const response=await fetch(asset.browser_download_url,{redirect:'follow'});if(!response.ok)throw Error('Public download failed: '+asset.name);
 const h=createHash('sha256');let bytes=0;for await(const chunk of response.body){h.update(chunk);bytes+=chunk.length;}
 const digest=h.digest('hex');if(bytes!==asset.size||asset.digest!=='sha256:'+digest)throw Error('Public download hash mismatch: '+asset.name);
 verified.push({name:asset.name,bytes,sha256:digest,url:asset.browser_download_url});
}
await writeFile(path.join(root,`downloads/${prefix}-public-verification.json`),JSON.stringify({schemaVersion:1,version:'0.3.9',releaseUrl,recordedAt:new Date().toISOString(),authenticated:false,verifiedFullDownloads:true,assets:verified},null,2)+'\n');
await writeFile(path.join(root,`downloads/${prefix}-release-state.json`),JSON.stringify({schemaVersion:1,product:'Ned',version:'0.3.9',sourceCommit:source,artifactCommit,releaseUrl,filesPublished:true,releaseAssetsPublished:true,publicDownloadsFullyVerified:true,windowsRunId:Number(validationRun),installer:audit.installer,bundle:{name:bundle.archive,bytes:bundle.bytes,sha256:bundle.sha256},releaseReady:false,isPrerelease:true,releaseAssetCount:verified.length,assets:verified},null,2)+'\n');
await commit([`downloads/${prefix}-public-verification.json`,`downloads/${prefix}-release-state.json`],'docs: verify every public Ned 0.3.9 release download');
run('git',['fetch','origin','main','work']);
for(const target of ['main','work']){run('git',['merge-base','--is-ancestor','origin/'+target,'HEAD']);run('git',['-c','credential.helper=!gh auth git-credential','push','origin','HEAD:refs/heads/'+target]);}
console.log('Published and fully verified '+releaseUrl);
