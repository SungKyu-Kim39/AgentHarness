import { createHash } from 'node:crypto';
import { readFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { DesktopLauncher } from './desktop-launch';
import { atomicJSON } from '../src/main/config';
import { PrivateMcpClient, type McpToolResult } from '../src/main/mcp-client';
const text = z.string().min(1).max(10000), ref = z.string().regex(/^@[A-Za-z0-9_-]+:e[0-9]+$/);
const windowID = z.string().min(1).max(256);
const schemas = {
  desktop_status: z.object({}).strict(),
  desktop_list_windows: z.object({}).strict(),
  desktop_list_apps: z.object({}).strict(),
  desktop_launch: z.object({ app: z.string().min(1).max(4096) }).strict(),
  desktop_snapshot: z.object({ window_id: windowID, max_depth: z.number().int().min(1).max(20).default(10) }).strict(),
  desktop_screenshot: z.object({ window_id: windowID }).strict(),
  desktop_focus_window: z.object({ window_id: windowID }).strict(),
  desktop_get: z.object({ ref_id: ref, property: z.enum(['text', 'value', 'title', 'bounds', 'role', 'states']).default('text') }).strict(),
  desktop_is: z.object({ ref_id: ref, property: z.enum(['visible', 'enabled', 'checked', 'focused', 'expanded', 'selected']).default('visible') }).strict(),
  desktop_click: z.object({ ref_id: ref }).strict(),
  desktop_set_value: z.object({ ref_id: ref, value: text }).strict(),
  desktop_clear: z.object({ ref_id: ref }).strict(),
  desktop_select: z.object({ ref_id: ref, value: text }).strict(),
  desktop_toggle: z.object({ ref_id: ref }).strict(),
  desktop_check: z.object({ ref_id: ref }).strict(),
  desktop_uncheck: z.object({ ref_id: ref }).strict(),
  desktop_expand: z.object({ ref_id: ref }).strict(),
  desktop_collapse: z.object({ ref_id: ref }).strict(),
  desktop_scroll: z.object({ ref_id: ref, direction: z.enum(['up','down','left','right']).default('down'), amount: z.number().int().min(1).max(20).default(3) }).strict(),
  desktop_scroll_to: z.object({ ref_id: ref }).strict(),
};
export const desktopToolNames = Object.keys(schemas);
const readOnly = new Set(['desktop_status','desktop_list_windows','desktop_list_apps','desktop_snapshot','desktop_screenshot','desktop_get','desktop_is']);
export const desktopTools = desktopToolNames.map(name => {
  const properties: Record<string, unknown> = {}, required: string[] = [];
  if (['desktop_snapshot','desktop_screenshot','desktop_focus_window'].includes(name)) { properties.window_id = { type: 'string' }; required.push('window_id'); }
  else if (name === 'desktop_launch') { properties.app = { type:'string', description:'calculator, notepad, paint, or an absolute local Windows GUI .exe path from the installed app catalog. No command strings or arguments.' }; required.push('app'); }
  else if (!['desktop_status','desktop_list_windows','desktop_list_apps'].includes(name)) { properties.ref_id = { type: 'string' }; required.push('ref_id'); }
  if (['desktop_set_value','desktop_select'].includes(name)) { properties.value = { type: 'string' }; required.push('value'); }
  if (['desktop_get','desktop_is'].includes(name)) properties.property = { type: 'string' };
  if (name === 'desktop_snapshot') properties.max_depth = { type: 'integer', minimum: 1, maximum: 20 };
  if (name === 'desktop_scroll') Object.assign(properties, { direction: { type:'string', enum:['up','down','left','right'] }, amount:{ type:'integer',minimum:1,maximum:20 } });
  return { name, description: `Pinned offline agent-desktop: ${name.slice(8)}. ${readOnly.has(name) ? 'Desktop observation follows the selected Ned permission mode.' : 'Actions follow the selected Ned permission mode: full access automatically approves; file-edit-only grants do not cover desktop actions.'} First list windows then snapshot one approved window. Use only returned qualified refs. Use desktop_list_apps to discover installed applications and desktop_launch to start an approved GUI app. Launch only confirms process dispatch, not a visible window or completed task. No shell/arguments, managed Ned/Zed, terminal/system/approval windows, global input, clipboard or raw MCP. Observe after actions; never repeat uncertain delivery.`, inputSchema: { type:'object',properties,required,additionalProperties:false } };
});
type Window = { id: string; pid: number; app_name: string; process_instance?: string; title?: string };
const envelope = (reply: McpToolResult): any => reply.structuredContent ?? JSON.parse(reply.content.find(c => c.type === 'text')?.text ?? '{}');
const same = (a: Window, b: Window) => a.id === b.id && a.pid === b.pid && a.app_name === b.app_name && a.process_instance === b.process_instance;
export function permittedDesktopWindow(w: Window) {
  return Number.isInteger(w.pid) && w.pid > 0 && w.pid !== process.pid && typeof w.id === 'string' && !!w.id && typeof w.app_name === 'string' &&
    !/ned|l-vibe|zed|opencode|agent-desktop|electron|powershell|terminal|cmd(?:\.exe)?$|conhost|openconsole|explorer|credential|consent|taskmgr|regedit|mmc|rundll32/i.test(w.app_name);
}
interface DesktopRef { window: Window; role?: string; name?: string }
interface DesktopSession { client: PrivateMcpClient; home: string; project: string; refs: Map<string, DesktopRef> }
/** Native-only, semantic window-scoped surface; no executable plugins or online setup. */
export class DesktopTools {
  private sessions = new Map<string, DesktopSession>(); private queue = Promise.resolve(); private stopped = false;
  private launchAborts = new Map<string,AbortController>();
  private needsObservation = new Set<string>();
  private launcher = new DesktopLauncher();
  private blocked = new Set<string>(); private uncertain = false;
  constructor(private root: string, private resources: string, private approve: (title: string, detail: string, signal?: AbortSignal) => Promise<boolean>) {}
  async call(name: string, input: unknown, session: string, project: string, signal?: AbortSignal) {
    const previous = this.queue; let release!: () => void; this.queue = new Promise(resolve => { release = resolve; }); await previous;
    try {
      if (this.stopped || this.uncertain || this.blocked.has(session)) throw new Error('Desktop 실행이 중지되었거나 종료가 불명확합니다.');
      signal?.throwIfAborted();
      const schema = schemas[name as keyof typeof schemas]; if (!schema) throw new Error('지원하지 않는 Desktop 도구입니다.');
      const args: Record<string, any> = schema.parse(input);
      if (this.needsObservation.has(session) && !readOnly.has(name)) throw new Error('이전 Desktop 동작의 전달 여부가 불명확합니다. 창 목록과 새 snapshot으로 상태를 먼저 확인하세요.');
      if (name === 'desktop_launch') {
        const abort = new AbortController(); this.launchAborts.set(session,abort);
        const launchSignal = signal ? AbortSignal.any([signal,abort.signal]) : abort.signal;
        try {
        const plan = await this.launcher.prepare(args.app);
        launchSignal.throwIfAborted();
        if (!await this.approve('Desktop 앱 실행 승인', JSON.stringify({tool:name,...plan},null,2) + '\n이 프로그램을 일반 사용자 권한으로 실행합니다. 프로그램 자체의 파일·네트워크 접근은 Ned 파일 수정 승인으로 통제되지 않습니다. Ned 종료 시 이 앱을 강제 종료하지 않습니다.', launchSignal)) throw new Error('앱 실행이 거절되었습니다.');
        launchSignal.throwIfAborted();
        if (this.stopped || this.blocked.has(session)) throw new Error('Desktop 실행이 중지되었습니다.');
        return {content:[{type:'text',text:JSON.stringify(await this.launcher.launch(plan,launchSignal))}]};
        } finally { this.launchAborts.delete(session); }
      }
      let context = this.sessions.get(session);
      if (context && context.client.available === false) { await this.discard(session,context); context=undefined; }
      if (context && context.project !== project) throw new Error('Desktop 세션의 프로젝트가 변경되었습니다.');
      if (!context) {
        try { context = await this.create(project); this.sessions.set(session, context); }
        catch(error) { await this.diagnostic(name,'start-failed',!this.uncertain); throw error; }
      }
      const ctx = context;
      const cancel = () => { void ctx.client.close().catch(() => { this.uncertain = true; }); };
      signal?.addEventListener('abort', cancel, { once:true });
      try {
        let target: Window | undefined, observed: DesktopRef | undefined;
        if (args.ref_id) { observed = ctx.refs.get(args.ref_id); target = observed?.window; if (!target) throw new Error('이 세션에서 관찰한 qualified ref만 사용할 수 있습니다.'); }
        if (args.window_id || target) {
          const windows = await this.windows(ctx, signal);
          const live = windows.find(w => w.id === (args.window_id ?? target!.id));
          if (!live || (target && !same(target, live))) throw new Error('대상 창이 바뀌었습니다. 새로 관찰하세요.');
          target = live;
        }
        const fixed = structuredClone(args), selected = target && structuredClone(target);
        if (!await this.approve(readOnly.has(name) ? 'Desktop 관찰 승인' : 'Desktop 동작 승인',
          JSON.stringify({ tool:name, arguments:fixed, element:observed && { role:observed.role, name:observed.name }, target:selected && { app:selected.app_name, window:selected.id, pid:selected.pid, title:selected.title } }, null, 2) + '\n프로젝트 밖의 화면을 관찰하거나 조작합니다. 화면 내용은 선택한 사내 모델로 전달되며 대화 기록에 남을 수 있습니다. Ned 전체 권한 모드에서는 이 승인창을 생략합니다.', signal)) throw new Error('Desktop 실행이 거절되었습니다.');
        signal?.throwIfAborted();
        if (this.stopped || this.blocked.has(session)) throw new Error('Desktop 실행이 중지되었습니다.');
        if (selected) { const live = (await this.windows(ctx, signal)).find(w => w.id === selected.id); if (!live || !same(live, selected)) throw new Error('승인 뒤 대상 창이 변경되었습니다.'); }
        if (name === 'desktop_list_windows') return { content: [{ type:'text', text:JSON.stringify(await this.windows(ctx, signal)) }] };
        const reply = await ctx.client.call(name, fixed, signal);
        if (name === 'desktop_snapshot' && !reply.isError) {
          const data = envelope(reply).data;
          if (!data?.window || !selected || !same(data.window, selected) || !permittedDesktopWindow(data.window)) throw new Error('관찰된 창의 신원을 확인하지 못했습니다.');
          const refs = new Map<string, DesktopRef>();
          const walk = (node: any) => { if (!node || typeof node !== 'object') return; if (typeof node.ref_id === 'string' && ref.safeParse(node.ref_id).success) refs.set(node.ref_id, { window:selected, role:typeof node.role==='string'?node.role.slice(0,100):undefined, name:typeof node.name==='string'?node.name.slice(0,1000):undefined }); for (const c of node.children ?? []) walk(c); };
          walk(data.tree); ctx.refs = refs; this.needsObservation.delete(session);
        }
        return reply;
      } catch (error) {
        if (ctx.client.available === false) {
          if (!readOnly.has(name)) this.needsObservation.add(session);
          await this.discard(session,ctx);
          await this.diagnostic(name,ctx.client.failureCode ?? 'connection-closed',true);
          throw new Error('DESKTOP_CONNECTION_CLOSED: 데스크톱 연결이 종료되어 관찰 참조를 해제했습니다. 다음 status/창 목록 요청은 새 연결을 만듭니다. 실행을 시도한 동작은 전달 여부가 불명확하므로 자동 재시도하지 말고 먼저 화면을 다시 확인하세요.');
        }
        throw error;
      } finally { signal?.removeEventListener('abort', cancel); }
    } finally { release(); }
  }
  private async windows(ctx: DesktopSession, signal?: AbortSignal): Promise<Window[]> {
    const reply = await ctx.client.call('desktop_list_windows', {}, signal);
    if (reply.isError) throw new Error('Desktop 창 목록을 읽지 못했습니다. 대화형 Windows 세션과 접근성 권한을 확인하세요.');
    const data = envelope(reply).data; const list = Array.isArray(data) ? data : data?.windows;
    if (!Array.isArray(list)) throw new Error('Desktop 창 목록 응답 오류');
    return list.filter(permittedDesktopWindow);
  }
  private async create(project: string): Promise<DesktopSession> {
    const platform = process.platform === 'win32' ? 'windows-x64' : 'linux-x64';
    const base = path.join(this.resources, 'runtime', platform, 'agent-desktop');
    const lock = JSON.parse(await readFile(path.join(this.resources, 'ned/locks/agent-desktop.json'), 'utf8'));
    const manifestBytes = await readFile(path.join(base, 'manifest.json'));
    if (createHash('sha256').update(manifestBytes).digest('hex') !== lock.manifests?.[platform]) throw new Error('Desktop 번들 목록 무결성 오류');
    const manifest = JSON.parse(manifestBytes.toString());
    if (manifest.version !== '1.2.0' || !Array.isArray(manifest.files)) throw new Error('Desktop 고정 번들이 없습니다.');
    for (const file of manifest.files) {
      if (!/^[a-zA-Z0-9_.-]+$/.test(file.path) || createHash('sha256').update(await readFile(path.join(base, file.path))).digest('hex') !== file.sha256) throw new Error('Desktop 번들 무결성 오류');
    }
    await mkdir(path.join(this.root, 'desktop'), { recursive:true,mode:0o700 });
    const home = await mkdtemp(path.join(this.root, 'desktop/session-'));
    let client: PrivateMcpClient | undefined;
    try {
      for (const part of ['AppData/Local','AppData/Roaming','AppData/LocalLow','state','tmp']) await mkdir(path.join(home,part),{recursive:true,mode:0o700});
      const env: NodeJS.ProcessEnv = { AGENT_DESKTOP_HOME:path.join(home,'state'),HOME:home,USERPROFILE:home,APPDATA:path.join(home,'AppData/Roaming'),LOCALAPPDATA:path.join(home,'AppData/Local'),XDG_CONFIG_HOME:home,XDG_DATA_HOME:home,XDG_CACHE_HOME:home,TEMP:path.join(home,'tmp'),TMP:path.join(home,'tmp'),PATH:process.platform==='win32'?path.join(process.env.SystemRoot??'C:\\Windows','System32'):path.dirname(process.execPath),DO_NOT_TRACK:'1' };
      for (const key of ['SystemRoot','SYSTEMROOT','WINDIR','DISPLAY','WAYLAND_DISPLAY','DBUS_SESSION_BUS_ADDRESS','XDG_RUNTIME_DIR','XAUTHORITY']) if (process.env[key]) env[key] = process.env[key];
      const executable = path.join(base, process.platform === 'win32' ? 'agent-desktop.exe' : 'agent-desktop');
      const python = path.join(this.resources, 'runtime/windows-x64/openviking/python/python.exe');
      const supervisor = path.join(this.resources, 'runtime/windows-x64/openviking/sidecar-supervisor.py');
      client = new PrivateMcpClient({ executable:process.platform === 'win32' ? python : executable, args:process.platform === 'win32' ? ['-I','-S','-B',supervisor,executable,'mcp'] : ['mcp'],cwd:home,env,allowedTools:desktopToolNames.filter(n=>n!=='desktop_launch'),timeout:45000 });
      await client.start(); return { client,home,project,refs:new Map() };
    } catch (error) {
      try { await client?.close(); } catch (stopError) { this.uncertain=true; throw stopError; }
      await rm(home,{recursive:true,force:true}); throw error;
    }
  }
  private async diagnostic(tool: string, code: string, stopConfirmed: boolean) {
    await atomicJSON(path.join(this.root,'diagnostics','desktop-status.json'),{schemaVersion:1,component:'agent-desktop',recordedAt:new Date().toISOString(),tool,code,stopConfirmed}).catch(()=>{});
  }
  private async discard(session: string, ctx: DesktopSession) {
    try { await ctx.client.close(); ctx.refs.clear(); await rm(ctx.home,{recursive:true,force:true}); if(this.sessions.get(session)===ctx)this.sessions.delete(session); }
    catch(error) { this.uncertain=true; throw error; }
  }
  async cancel(session: string) {
    this.blocked.add(session); this.launchAborts.get(session)?.abort(); const ctx = this.sessions.get(session); if (!ctx) return;
    await this.discard(session,ctx);
  }
  resume(session: string) { this.blocked.delete(session); }
  async close() { this.stopped = true; for(const abort of this.launchAborts.values())abort.abort(); await Promise.all([...this.sessions.keys()].map(id => this.cancel(id))); }
}
