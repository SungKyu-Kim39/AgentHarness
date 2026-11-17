import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {brandEditor,verifyEditorIcon} from './ned-editor-branding.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function sourceEditorInputs(root){
 const directory=path.join(root,'downloads/editor'),build=JSON.parse(await readFile(path.join(directory,'build.json')));
 const lock=JSON.parse(await readFile(path.join(root,'ned-editor-source-lock.json')));
 if(build.schemaVersion!==1||build.version!=='0.3.8'||build.buildRevision!=='rebuild1'||build.upstreamCommit!==lock.upstream.commit||!Array.isArray(build.files))throw Error('Unreviewed source-built editor metadata');
 const files={};for(const name of ['Ned-editor-0.3.8-rebuild1.exe','zed-ned-editor-source-v1.28.1-0.3.8-rebuild1.tar.gz']){
  const item=build.files.find(f=>f.name===name),bytes=await readFile(path.join(directory,name));if(!item||bytes.length!==item.bytes||sha(bytes)!==item.sha256)throw Error('Source-built editor hash mismatch: '+name);files[name]={...item,bytesData:bytes};
 }
 const archive=path.join(directory,'zed-ned-editor-source-v1.28.1-0.3.8-rebuild1.tar.gz');
 const change=JSON.parse(execFileSync('tar',['-xOf',archive,'./NED_EDITOR_CHANGES.json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
 if(change.version!=='0.3.8'||change.buildRevision!=='rebuild1'||change.iconSha256!==sha(await readFile(path.join(root,'assets/ned-icon.png')))||change.changes.length!==Object.keys(lock.files).length)throw Error('Source-built editor changes mismatch');
 for(const [file,expected]of Object.entries(lock.files)){const item=change.changes.find(c=>c.file===file);if(item?.originalSha256!==expected||sha(execFileSync('tar',['-xOf',archive,'./'+file],{maxBuffer:2*1024*1024,stdio:['ignore','pipe','pipe']}))!==item.sha256)throw Error('Corresponding source file mismatch: '+file);}
 const binary=files['Ned-editor-0.3.8-rebuild1.exe'].bytesData;
 for(const text of ['About Ned','Quit Ned','Ned 0.3.8 · rebuild 1'])if(!binary.includes(Buffer.from(text)))throw Error('Built editor missing Ned UI');
 for(const text of ['About Zed','Quit Zed'])if(binary.includes(Buffer.from(text)))throw Error('Built editor retains old menu');
 return {build,files,change};
}
export async function installSourceEditor(root,staged){
 const input=await sourceEditorInputs(root),icon=await readFile(path.join(root,'assets/ned-icon.ico'));
 const branded=brandEditor(input.files['Ned-editor-0.3.8-rebuild1.exe'].bytesData,icon);
 branded.record.component='Ned editor based on Zed 1.28.1';
 branded.record.change='Ned icon resources applied to the source-built Ned menu/About editor; unchanged code sections refer to that compiled input, not to the original vendor executable';
 branded.record.sourceBuild=input.build;branded.record.sourceChanges=input.change;
 await writeFile(path.join(staged,'resources/zed/Zed.exe'),branded.bytes);
 await writeFile(path.join(staged,'resources/ned/editor-branding.json'),JSON.stringify(branded.record,null,2)+'\n');
 const sources=path.join(staged,'resources/ned/sources');await mkdir(sources,{recursive:true});
 await writeFile(path.join(sources,'NED_EDITOR_CHANGES.json'),JSON.stringify(input.change,null,2)+'\n');
 await writeFile(path.join(sources,'NED_EDITOR_SOURCE.txt'),'Modified corresponding source: source/zed-ned-editor-source-v1.28.1-0.3.8-rebuild1.tar.gz in the accompanying offline TGZ.\nKeep that source archive with the distribution. Exact archive hash is recorded in ../editor-branding.json sourceBuild.files.\n');
 return branded.record;
}
export async function verifySourceEditor(root,resources){
 const input=await sourceEditorInputs(root),record=JSON.parse(await readFile(path.join(resources,'ned/editor-branding.json'))),bytes=await readFile(path.join(resources,'zed/Zed.exe'));
 if(record.sourceBuild?.sourceCommit!==input.build.sourceCommit||record.originalSha256!==input.files['Ned-editor-0.3.8-rebuild1.exe'].sha256||record.modifiedSha256!==sha(bytes)||JSON.stringify(record.sourceChanges)!==JSON.stringify(input.change))throw Error('Installed source-built editor provenance mismatch');
 if(JSON.stringify(JSON.parse(await readFile(path.join(resources,'ned/sources/NED_EDITOR_CHANGES.json'))))!==JSON.stringify(input.change))throw Error('Installed editor source changes mismatch');
 verifyEditorIcon(bytes,await readFile(path.join(root,'assets/ned-icon.ico')));
 return {sourceCommit:input.build.sourceCommit,upstreamCommit:input.build.upstreamCommit,menuAndAboutFromSource:true,correspondingSourceLocation:'offline TGZ source/zed-ned-editor-source-v1.28.1-0.3.8-rebuild1.tar.gz',windowsGuiAcceptance:false};
}
