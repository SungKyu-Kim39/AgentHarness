import path from 'node:path';
import { lstat, readFile, writeFile } from 'node:fs/promises';
import { parse, modify, applyEdits, type ParseError } from 'jsonc-parser';
import { writeEditorPreferences } from './editor-preferences';

export type TerminalKind = 'powershell' | 'cmd';
export function terminalShell(kind: TerminalKind, systemRoot = process.env.SystemRoot ?? 'C:\\Windows') {
  return { program: path.win32.join(systemRoot, kind === 'cmd' ? 'System32/cmd.exe' : 'System32/WindowsPowerShell/v1.0/powershell.exe'), args: kind === 'cmd' ? ['/D'] : ['-NoLogo','-NoProfile'] };
}
export function supportedTerminal(value: any) {
  return value && typeof value.program==='string' && Object.keys(value).every(key=>['program','args'].includes(key)) && ['powershell','cmd'].some(kind => {
    const expected=terminalShell(kind as TerminalKind);
    return path.win32.normalize(value.program).toLowerCase()===expected.program.toLowerCase() && JSON.stringify(value.args)===JSON.stringify(expected.args);
  });
}
export async function setDefaultTerminal(data: string, kind: TerminalKind) {
  const file=path.join(data,'config/settings.json'),info=await lstat(file);
  if(!info.isFile()||info.isSymbolicLink()||info.size>2*1024*1024)throw Error('편집기 터미널 설정 경로 오류');
  const text=await readFile(file,'utf8'), errors:ParseError[]=[];
  parse(text.replace(/^\ufeff/,''),errors,{allowTrailingComma:true});if(errors.length)throw Error('편집기 설정 JSONC를 확인하세요.');
  await writeEditorPreferences(file,applyEdits(text,modify(text,['terminal','shell'],terminalShell(kind),{formattingOptions:{insertSpaces:true,tabSize:2}})));
}
/** Task entries appear in Zed's task picker and open independent integrated terminals. */
export async function ensureTerminalTasks(data:string, platform:NodeJS.Platform=process.platform) {
  if(platform!=='win32')return;
  const file=path.join(data,'config/tasks.json');
  const info=await lstat(file).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return undefined;throw e;});
  if(info&&(!info.isFile()||info.isSymbolicLink()||info.size>2*1024*1024))throw Error('터미널 작업 설정 경로 오류');
  const text=info?await readFile(file,'utf8'):'[]\n', errors:ParseError[]=[];
  const tasks=parse(text,errors,{allowTrailingComma:true});if(errors.length||!Array.isArray(tasks))throw Error('터미널 작업 JSONC를 확인하세요. 기존 파일을 보존했습니다.');
  let result=text, index=tasks.length;
  for(const kind of ['powershell','cmd'] as const){
    const label=kind==='cmd'?'Ned: CMD':'Ned: PowerShell';if(tasks.some(t=>t?.label===label))continue;
    const shell=terminalShell(kind);
    result=applyEdits(result,modify(result,[index++],{label,command:shell.program,args:[...shell.args,kind==='cmd'?'/K':'-NoExit'],cwd:'$ZED_WORKTREE_ROOT',use_new_terminal:true,allow_concurrent_runs:true,reveal:'always'},{formattingOptions:{insertSpaces:true,tabSize:2}}));
  }
  if(result!==text)await writeEditorPreferences(file,result);
}
