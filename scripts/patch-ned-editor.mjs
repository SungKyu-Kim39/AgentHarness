import {readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {editorVersion} from './ned-editor-version.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const root=path.resolve(import.meta.dirname,'..');
const identity=await editorVersion(root);
const directory=path.resolve(process.argv[2]??'');
const lock=JSON.parse(await readFile(path.join(root,'ned-editor-source-lock.json'),'utf8'));
const outputs=[];
for(const [file,expected] of Object.entries(lock.files)){
 const filename=path.join(directory,file),bytes=await readFile(filename);
 if(sha(bytes)!==expected)throw Error('Unreviewed editor source: '+file);
 let text=bytes.toString('utf8');
 if(file.endsWith('app_menus.rs')){
  for(const [before,after]of [['name: "Zed".into()','name: "Ned".into()'],['"About Zed"','"About Ned"'],['"Quit Zed"','"Quit Ned"'],['"Hide Zed"','"Hide Ned"']]){
   if(text.split(before).length!==2)throw Error('Editor menu source changed: '+before);
   text=text.replace(before,after);
  }
 }else{
  const at=text.indexOf('fn open_about_window('),end=text.indexOf('\nfn quit(',at);if(at<0||end<at)throw Error('About source boundary changed');
  let block=text.slice(at,end);
  const iconStart=block.indexOf('    fn about_window_icon('),iconEnd=block.indexOf('\n    struct AboutWindow',iconStart);
  block=block.slice(0,iconStart)+`    fn about_window_icon(_release_channel: ReleaseChannel) -> Arc<Image> {\n        let bytes = include_bytes!("../resources/ned-icon.png").as_slice();\n        Arc::new(Image::from_bytes(ImageFormat::Png, bytes.to_vec()))\n    }\n`+block.slice(iconEnd);
  const msgStart=block.indexOf('            let release_channel_name ='),msgEnd=block.indexOf('            let commit =',msgStart);
  if(msgStart<0||msgEnd<msgStart)throw Error('About message source changed');
  block=block.slice(0,msgStart)+`            let full_version: SharedString = AppVersion::global(cx).to_string().into();\n            let message: SharedString = "${identity.about}".into();\n`+block.slice(msgEnd);
  block=block.replace('.child(Headline::new(self.message.clone()))','.child(Headline::new(self.message.clone()))\n                            .child(Label::new("사내 모델을 사용하는 바이브 코딩 환경"))\n                            .child(Label::new("Based on Zed 1.28.1").size(LabelSize::Small))');
  block=block.replace('height: px(300.)','height: px(420.)');
  block=block.replaceAll('"Commit"','"Zed source commit"').replaceAll('"Version"','"Zed editor version"').replaceAll('About Zed','About Ned');
  block=block.replaceAll('Commit: {}','Zed source commit: {}').replaceAll('Version: {}','Zed editor version: {}');
  text=text.slice(0,at)+block+text.slice(end);
 }
 await writeFile(filename,text,'utf8');outputs.push({file,originalSha256:expected,sha256:sha(Buffer.from(text))});
}
await copyFile(path.join(root,'assets/ned-icon.png'),path.join(directory,'crates/zed/resources/ned-icon.png'));
const record={schemaVersion:1,product:'Ned editor',version:identity.version,buildRevision:identity.revision||undefined,upstream:lock.upstream,changes:outputs,iconSha256:sha(await readFile(path.join(root,'assets/ned-icon.png')))};
await writeFile(path.join(directory,'NED_EDITOR_CHANGES.json'),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
