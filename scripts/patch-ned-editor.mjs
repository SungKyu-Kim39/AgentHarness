import {readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {editorVersion} from './ned-editor-version.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const root=path.resolve(import.meta.dirname,'..');
const identity=await editorVersion(root);
const directory=path.resolve(process.argv[2]??'');
const lock=JSON.parse(await readFile(path.join(root,'ned-editor-source-lock.json'),'utf8'));
function replaceOne(text, before, after) {
 if(text.split(before).length!==2)throw Error('Editor terminal source changed: '+before.slice(0,75));
 return text.replace(before,after);
}
function patchTerminalPanel(source) {
 let text=replaceOne(source,'        let assistant_enabled = self.assistant_enabled;','        let workspace = self.workspace.clone();\n        let assistant_enabled = self.assistant_enabled;');
 text=replaceOne(text,'                            .menu(move |window, cx| {\n                                let focus_handle = focus_handle.clone();',
  '                            .menu({\n                                let workspace = workspace.clone();\n                                move |window, cx| {\n                                let focus_handle = focus_handle.clone();');
 text=replaceOne(text,`                                    menu.context(focus_handle.clone())
                                        .action(
                                            "New Terminal",
                                            workspace::NewTerminal::default().boxed_clone(),
                                        )`,`                                    let menu = menu.context(focus_handle.clone());
                                    let managed = cfg!(windows) && std::env::var_os("NED_MANAGED_TERMINAL").is_some()
                                        && workspace.read_with(cx, |workspace, cx| !workspace.project().read(cx).is_remote()).unwrap_or(false);
                                    let menu = if managed {
                                        let powershell = workspace.clone();
                                        let cmd = workspace.clone();
                                        menu.entry("PowerShell", None, move |window, cx| {
                                            Self::open_ned_shell(&powershell, false, window, cx);
                                        }).entry("CMD", None, move |window, cx| {
                                            Self::open_ned_shell(&cmd, true, window, cx);
                                        })
                                    } else {
                                        menu.action("New Terminal", workspace::NewTerminal::default().boxed_clone())
                                    };
                                    menu`);
 text=replaceOne(text,'                                Some(menu)\n                            }),','                                Some(menu)\n                                }\n                            }),');
 const marker='    fn add_terminal_shell(\n';
 const shellMethod=`    fn open_ned_shell(workspace: &WeakEntity<Workspace>, cmd: bool, window: &mut Window, cx: &mut App) {
        let system = std::env::var_os("SystemRoot")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from(r"C:\\Windows"))
            .join("System32");
        let (program, args, title) = if cmd {
            (system.join("cmd.exe"), vec!["/D".into()], "CMD")
        } else {
            (system.join("WindowsPowerShell/v1.0/powershell.exe"), vec!["-NoLogo".into(), "-NoProfile".into()], "PowerShell")
        };
        let shell = Shell::WithArguments { program: program.to_string_lossy().into_owned(), args, title_override: Some(title.into()) };
        let _ = workspace.update(cx, |workspace, cx| {
            let project = workspace.project().read(cx);
            if project.is_remote() {
                return;
            }
            let cwd = project.active_project_directory(cx).map(|path| path.to_path_buf());
            if let Some(panel) = workspace.panel::<Self>(cx) {
                panel.update(cx, |panel, cx| {
                    panel.add_terminal_with_shell(false, cwd, RevealStrategy::Always, Some(shell), window, cx)
                }).detach_and_log_err(cx);
            }
        });
    }

`;
 text=replaceOne(text,marker,shellMethod+marker);
 return replaceOne(text,`    ) -> Task<Result<WeakEntity<Terminal>>> {
        let workspace = self.workspace.clone();
        self.spawn_pending_terminal(window, cx, async move |terminal_panel, cx| {
            if workspace.update(cx, |workspace, cx| !is_enabled_in_workspace(workspace, cx))? {
                anyhow::bail!("terminal not yet supported for collaborative projects");
            }
            let project = workspace.read_with(cx, |workspace, _| workspace.project().clone())?;
            let terminal = if force_local {`,`    ) -> Task<Result<WeakEntity<Terminal>>> {
        self.add_terminal_with_shell(force_local, cwd, reveal_strategy, None, window, cx)
    }

    fn add_terminal_with_shell(
        &mut self,
        force_local: bool,
        cwd: Option<PathBuf>,
        reveal_strategy: RevealStrategy,
        shell: Option<Shell>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> Task<Result<WeakEntity<Terminal>>> {
        let workspace = self.workspace.clone();
        self.spawn_pending_terminal(window, cx, async move |terminal_panel, cx| {
            if workspace.update(cx, |workspace, cx| !is_enabled_in_workspace(workspace, cx))? {
                anyhow::bail!("terminal not yet supported for collaborative projects");
            }
            let project = workspace.read_with(cx, |workspace, _| workspace.project().clone())?;
            let terminal = if let Some(shell) = shell {
                project.update(cx, |project, cx| project.create_terminal_shell_with(cwd, shell, cx)).await
            } else if force_local {`);
}
function patchProjectTerminals(text) {
 text=replaceOne(text,'        self.create_terminal_shell_internal(cwd, false, cx)\n    }',
  `        self.create_terminal_shell_internal(cwd, false, None, cx)
    }

    pub fn create_terminal_shell_with(
        &mut self,
        cwd: Option<PathBuf>,
        shell: Shell,
        cx: &mut Context<Self>,
    ) -> Task<Result<Entity<Terminal>>> {
        self.create_terminal_shell_internal(cwd, false, Some(shell), cx)
    }`);
 text=replaceOne(text,'self.create_terminal_shell_internal(working_directory, true, cx)','self.create_terminal_shell_internal(working_directory, true, None, cx)');
 text=replaceOne(text,'        force_local: bool,\n        cx: &mut Context<Self>,','        force_local: bool,\n        shell_override: Option<Shell>,\n        cx: &mut Context<Self>,');
 const at=text.indexOf('    fn create_terminal_shell_internal(');
 return text.slice(0,at)+replaceOne(text.slice(at),
   '        let settings = TerminalSettings::get(settings_location, cx).clone();',
   `        let mut settings = TerminalSettings::get(settings_location, cx).clone();
        if let Some(shell) = shell_override {
            settings.shell = shell;
        }`);
}
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
 }else if(file.endsWith('terminal_panel.rs')){
  text=patchTerminalPanel(text);
 }else if(file.endsWith('terminals.rs')){
  text=patchProjectTerminals(text);
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
