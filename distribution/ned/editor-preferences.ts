import path from 'node:path';
import { lstat, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { parse, parseTree, modify, applyEdits, type ParseError, type Node } from 'jsonc-parser';

const uiKeys = new Set([
  'theme','icon_theme','buffer_font_family','buffer_font_fallbacks','buffer_font_size','buffer_font_weight','buffer_font_features','buffer_line_height',
  'agent_ui_font_family','agent_ui_font_size','agent_buffer_font_family','agent_buffer_font_size','git_commit_buffer_font_size','mermaid_font_family',
  'ui_font_family','ui_font_fallbacks','ui_font_size','ui_font_weight','ui_font_features','tab_size','hard_tabs','vim_mode','base_keymap',
  'relative_line_numbers','preferred_line_length','soft_wrap','show_whitespaces','cursor_blink','cursor_shape','scrollbar','gutter','minimap','indent_guides',
  'project_panel','outline_panel','git_panel','tab_bar','status_bar','tabs','toolbar','centered_layout','window_decorations','use_system_window_tabs',
  'autosave','auto_signature_help','hover_popover_enabled','inlay_hints','inlay_hints_modifiers','multi_cursor_modifier','seed_search_query_from_cursor',
]);
const nestedUI: Record<string, readonly string[]> = {
  agent: ['dock','button','flexible','default_width','default_height','max_content_width','threads_sidebar','expand_edit_card','expand_terminal_card','thinking_display','use_modifier_to_send','message_editor_min_lines','show_turn_stats','show_merge_conflict_indicator','notify_when_agent_waiting','play_sound_when_agent_done','prevent_idle_sleep'],
  collaboration_panel: ['dock','default_width','default_height'], notification_panel: ['dock','default_width','default_height'],
  title_bar: ['show_branch_name','show_project_items','show_menus','show_project_name','show_user_picture'],
  terminal: ['dock','button','default_width','default_height','font_family','font_fallbacks','font_size','font_features','font_weight','line_height','cursor_shape','blinking','scrollbar'],
};
const languageUI = ['tab_size','hard_tabs','preferred_line_length','soft_wrap','show_whitespaces','inlay_hints','indent_guides'];
const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
function decode(text: string, name: string) {
  text=text.replace(/^\ufeff/,'');
  const errors: ParseError[] = [];
  const value = parse(text, errors, { allowTrailingComma: true, allowEmptyContent: true });
  const tree = parseTree(text, [], { allowTrailingComma: true, allowEmptyContent: true });
  let duplicate = false;
  const visit = (node?: Node) => { if (!node) return; if (node.type === 'object') { const names = node.children?.map(p => p.children![0].value) ?? []; if (new Set(names).size !== names.length) duplicate = true; } node.children?.forEach(visit); };
  visit(tree);
  if (value === undefined && !errors.length) return {};
  if (errors.length || duplicate || !object(value)) throw new Error(`편집기 ${name} 설정의 JSONC 문법을 확인하세요. 기존 파일을 보존했습니다.`);
  return value;
}
async function readOwned(file: string) {
  const info = await lstat(file).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return undefined; throw error; });
  if (!info) return undefined;
  if (!info.isFile() || info.isSymbolicLink() || info.size > 2 * 1024 * 1024) throw new Error('편집기 설정은 앱 소유 폴더의 일반 파일이어야 합니다.');
  return readFile(file,'utf8');
}
/** Preserve UI values/comments; replace only managed connection/execution settings. No DB/layout file is rewritten. */
export async function editorPreferences(data: string, managed: Record<string, any>) {
  const file = path.join(data,'config/settings.json'), original = await readOwned(file);
  const legacy = original === undefined ? await readOwned(path.join(data,'appearance.json')) : undefined;
  const saved = original === undefined ? {} : decode(original,'settings.json');
  const fallback = legacy === undefined ? {} : decode(legacy,'appearance.json');
  const chosen = original === undefined ? fallback : saved;
  const desired: Record<string, any> = Object.create(null);
  for (const key of uiKeys) if (Object.hasOwn(chosen,key)) desired[key] = chosen[key];
  for (const [group,keys] of Object.entries(nestedUI)) if (object(chosen[group])) {
    desired[group] = Object.fromEntries(keys.filter(key => Object.hasOwn(chosen[group],key)).map(key => [key,chosen[group][key]]));
  }
  if (object(chosen.languages)) desired.languages = Object.fromEntries(Object.entries(chosen.languages).filter(([,v])=>object(v)).map(([name,v]) => [name,Object.fromEntries(languageUI.filter(k=>Object.hasOwn(v,k)).map(k=>[k,(v as any)[k]]))]));
  for (const [key,value] of Object.entries(managed)) {
    if (key==='restore_on_startup' && ['none','empty_tab','last_workspace','last_session','launchpad'].includes(chosen[key])) desired[key]=chosen[key];
    else if (key==='languages') {
      desired.languages ??= {};
      for (const [language,settings] of Object.entries(value)) desired.languages[language] = { ...desired.languages[language], ...(settings as object) };
    } else desired[key] = object(value) ? { ...desired[key], ...value } : value;
  }
  const bom=original?.startsWith('\ufeff')?'\ufeff':'';
  let updated=(original ?? '{}\n').slice(bom.length);
  if (!parseTree(updated,[],{allowTrailingComma:true,allowEmptyContent:true})) updated+='\n{}\n';
  const options = { formattingOptions: { insertSpaces:true,tabSize:2,eol:updated.includes('\r\n')?'\r\n':'\n' } };
  const reconcile = (at: (string|number)[], before: any, after: any) => {
    if (JSON.stringify(before)===JSON.stringify(after)) return;
    if (object(before) && object(after)) {
      for (const key of Object.keys(before)) if (!Object.hasOwn(after,key)) updated=applyEdits(updated,modify(updated,[...at,key],undefined,options));
      for (const [key,value] of Object.entries(after)) reconcile([...at,key],before[key],value);
    } else updated=applyEdits(updated,modify(updated,at,after,options));
  };
  reconcile([],saved,desired);
  const result=bom+updated;
  if (original !== undefined && result!==original) {
    await writeFile(path.join(data,'config/settings.before-ned-0.3.3.jsonc'),original,{flag:'wx',mode:0o600}).catch((error:NodeJS.ErrnoException)=>{if(error.code!=='EEXIST')throw error});
  }
  return result;
}
export async function ensureEditorKeymap(file: string) {
  if (await readOwned(file)!==undefined) return;
  await writeFile(file,JSON.stringify([{context:'Workspace',bindings:{'ctrl-shift-a':['agent::NewExternalAgentThread',{agent:'Ned'}]}}],null,2)+'\n',{flag:'wx',mode:0o600}).catch((error:NodeJS.ErrnoException)=>{if(error.code!=='EEXIST')throw error});
}

export async function writeEditorPreferences(file: string, text: string) {
  const temp = file+'.'+randomUUID()+'.tmp';
  try { await writeFile(temp,text,{flag:'wx',mode:0o600}); await rename(temp,file); }
  finally { await unlink(temp).catch(()=>{}); }
}
