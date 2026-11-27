import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { app, BrowserWindow, ipcMain, session } from 'electron';
import type { UserMcp } from '../user-mcp';

function view(nonce: string) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; form-action 'none'; base-uri 'none'">
<title>사용자 MCP 관리</title><style nonce="${nonce}">
:root{color-scheme:light dark;font:15px 'Segoe UI',sans-serif}body{margin:0;background:Canvas;color:CanvasText}main{max-width:900px;margin:auto;padding:24px 28px}h1{font-size:23px;margin:0 0 5px}h2{font-size:18px;margin:0 0 14px}p{margin:6px 0 16px;line-height:1.5}header,footer,.row{display:flex;gap:12px;align-items:center;justify-content:space-between}button,input,select{font:inherit}button{padding:6px 11px;border:1px solid ButtonBorder;border-radius:5px;background:ButtonFace;color:ButtonText}button:enabled{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid Highlight;outline-offset:3px}.primary{background:Highlight;color:HighlightText;border-color:Highlight}.row{padding:13px 0;border-bottom:1px solid ButtonBorder;align-items:start}.row>div:first-child{min-width:0}.actions{display:flex;align-items:center;gap:8px;white-space:nowrap}.label{display:block;font-weight:600;overflow-wrap:anywhere}small,.detail{font-size:13px;color:GrayText;overflow-wrap:anywhere}.detail{display:block;margin-top:3px}#message{min-height:21px;overflow-wrap:anywhere}#message.error{color:light-dark(#a12a27,#ffb4aa)}form{max-width:740px}form>label{display:grid;gap:4px;margin-bottom:12px}input:not([type=checkbox]),select{padding:6px 8px;min-width:0}fieldset{border:1px solid ButtonBorder;border-radius:5px;max-height:200px;overflow:auto;margin:12px 0}fieldset label{display:block;margin:4px 0;overflow-wrap:anywhere}[hidden]{display:none!important}
</style></head><body><main>
<section id="listView"><header><div><h1>사용자 MCP 관리</h1><p>켜진 서버는 에이전트 입력창의 / 목록에서 선택할 수 있습니다.</p></div><button id="add" class="primary">등록</button></header><div id="entries"></div></section>
<section id="editView" hidden><form id="form"><h2 id="editTitle">MCP 등록</h2>
<label>Server name<input id="name" required maxlength="80" placeholder="예: 사내 문서 검색"></label>
<label>명령 ID <small>영문 소문자·숫자·하이픈. 예: doc-search → /mcp-doc-search</small><input id="id" required maxlength="48" pattern="[a-z0-9]+(?:-[a-z0-9]+)*"></label>
<label>URL <small>사내 또는 이 PC의 Streamable HTTP 주소</small><input id="url" type="url" required maxlength="2048" placeholder="https://127.0.0.1:18081/mcp"></label>
<label>인증 헤더<select id="header"><option value="">없음</option><option>Authorization</option><option>X-API-Key</option></select></label>
<label id="secretLabel" hidden>인증 값 <small id="secretHint">Authorization이면 Bearer 접두사를 포함한 헤더 값을 입력하세요.</small><input id="secret" type="password" autocomplete="new-password" maxlength="4096"></label>
<fieldset id="tools" hidden><legend>사용할 도구</legend><div id="toolChoices"></div></fieldset>
<footer><button id="back" type="button">취소</button><div class="actions"><button id="check" type="button">연결 확인</button><button id="save" class="primary" type="submit" disabled>저장</button></div></footer>
</form></section><p id="message" role="status" aria-live="polite"></p></main>
<script nonce="${nonce}">
const find = id => document.getElementById(id);
const fields = ['name','id','url','header','secret'].map(find);
let editing, receipt, busy = false;
const status = (text, error = false) => { find('message').textContent = text; find('message').classList.toggle('error', error); };
const invalidate = () => { receipt = undefined; find('tools').hidden = true; find('save').disabled = true; };
const syncAuth = () => {
  find('secretLabel').hidden = !find('header').value;
  find('secretHint').textContent = editing && editing.endpoint.authHeader === find('header').value ? '같은 주소에서 값을 비우면 기존 값을 유지합니다.' : 'Authorization이면 Bearer 접두사를 포함한 헤더 값을 입력하세요.';
};
const show = entry => {
  editing = entry;
  find('editTitle').textContent = entry ? 'MCP 설정 변경' : 'MCP 등록';
  find('name').value = entry?.name || ''; find('id').value = entry?.id || ''; find('id').readOnly = !!entry;
  find('url').value = entry?.endpoint.url || ''; find('header').value = entry?.endpoint.authHeader || ''; find('secret').value = '';
  invalidate(); syncAuth(); status(''); find('listView').hidden = true; find('editView').hidden = false; find('name').focus();
};
const render = async () => {
  const data = await window.nedMcp.request('list');
  const entries = find('entries'); entries.replaceChildren();
  find('add').disabled = data.storeError;
  if (data.storeError) { status('저장된 사용자 MCP 설정을 읽을 수 없습니다. 기존 설정은 보존했습니다.', true); return; }
  if (!data.servers.length) { const p = document.createElement('p'); p.textContent = '등록된 MCP가 없습니다.'; entries.append(p); }
  for (const item of data.servers) {
    const row = document.createElement('div'); row.className = 'row';
    const summary = document.createElement('div');
    const name = document.createElement('strong'); name.className = 'label'; name.textContent = item.name;
    const detail = document.createElement('span'); detail.className = 'detail'; detail.textContent = '/mcp-' + item.id + ' · ' + item.endpoint.url;
    summary.append(name, detail);
    const actions = document.createElement('div'); actions.className = 'actions';
    const switchLabel = document.createElement('label');
    const toggle = document.createElement('input'); toggle.type = 'checkbox'; toggle.role = 'switch'; toggle.checked = item.enabled;
    toggle.setAttribute('aria-label', item.name + ' 사용'); switchLabel.append(toggle, ' 사용');
    toggle.onchange = () => work(async () => { await window.nedMcp.request('toggle', { id: item.id, enabled: toggle.checked }); await render(); status(toggle.checked ? '사용을 켰습니다.' : '사용을 껐습니다.'); }, () => { toggle.checked = item.enabled; });
    const edit = document.createElement('button'); edit.textContent = '설정'; edit.onclick = () => { if (!busy) show(item); };
    const remove = document.createElement('button'); remove.textContent = '삭제'; remove.onclick = () => work(async () => { if (await window.nedMcp.request('remove', item.id)) { await render(); status('등록을 삭제했습니다.'); } });
    actions.append(switchLabel, edit, remove); row.append(summary, actions); entries.append(row);
  }
};
async function work(run, failed) {
  if (busy) return;
  busy = true;
  try { await run(); } catch (error) { failed?.(); status(error.message.replace(/^Error invoking remote method ['"].+?['"]:\\s*(?:Error:\\s*)?/, ''), true); }
  finally { busy = false; }
}
const back = async () => { editing = undefined; invalidate(); find('secret').value = ''; find('editView').hidden = true; find('listView').hidden = false; await render(); find('add').focus(); };
find('add').onclick = () => { if (!busy) show(); };
find('back').onclick = () => work(back);
for (const field of fields) field.addEventListener('input', () => { invalidate(); syncAuth(); });
find('check').onclick = () => work(async () => {
  if (!find('form').reportValidity()) return;
  invalidate(); status('서버의 도구 목록을 확인하고 있습니다.');
  const input = { id: find('id').value, name: find('name').value, endpoint: { url: find('url').value } };
  const header = find('header').value, secret = find('secret').value;
  if (header && secret) input.endpoint.auth = { header, value: secret };
  else if (header && editing?.endpoint.authHeader === header) input.keepAuth = true;
  else if (header) { status('인증 값을 입력하세요.', true); return; }
  for (const field of fields) field.disabled = true;
  try {
    const { receipt: confirmed, tools } = await window.nedMcp.request('check', input);
    const container = find('toolChoices'); container.replaceChildren();
    for (const tool of tools) {
      const label = document.createElement('label'), checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.value = tool.name; checkbox.checked = editing?.tools.includes(tool.name) || false;
      label.append(checkbox, ' ' + tool.name + (tool.description ? ' · ' + tool.description : '')); container.append(label);
    }
    receipt = confirmed; find('tools').hidden = false; find('save').disabled = !tools.length;
    status(tools.length ? '사용할 도구를 선택하고 저장하세요.' : '서버가 제공하는 도구가 없습니다.');
  } finally { for (const field of fields) field.disabled = false; }
});
find('form').onsubmit = event => {
  event.preventDefault();
  void work(async () => {
    if (!receipt) return;
    const names = [...find('toolChoices').querySelectorAll('input:checked')].map(input => input.value);
    if (!names.length || names.length > 12) { status('도구를 1개 이상, 12개 이하로 선택하세요.', true); return; }
    await window.nedMcp.request('save', { receipt, names, replace: !!editing });
    await back(); status('저장했습니다. 사용을 켜면 / 목록에 표시됩니다.');
  });
};
if (typeof window.nedMcp?.request === 'function') void work(render);
else {
  find('add').disabled = true;
  status('사용자 MCP 관리 창을 초기화하지 못했습니다. Ned를 다시 실행하세요. [NED_MCP_UI_PRELOAD]', true);
}
</script></body></html>`;
}

export class UserMcpWindow {
  private window?: BrowserWindow;
  open(registry: UserMcp, icon: string) {
    if (this.window && !this.window.isDestroyed()) { this.window.focus(); return; }
    const nonce = randomBytes(18).toString('hex');
    const isolated = session.fromPartition('ned-mcp-' + nonce, { cache: false });
    isolated.setPermissionRequestHandler((_contents, _permission, done) => done(false));
    const win = new BrowserWindow({ title: '사용자 MCP 관리', width: 820, height: 700, minWidth: 575, minHeight: 460, show: false, icon,
      webPreferences: { preload: path.join(app.getAppPath(), 'user-mcp-preload.cjs'), session: isolated, contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true, devTools: false } });
    this.window = win;
    win.removeMenu();
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', event => event.preventDefault());
    win.webContents.on('will-redirect', event => event.preventDefault());
    const abort = new AbortController();
    ipcMain.handle('ned-user-mcp', async (event, action: string, input: any) => {
      if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame) throw Error('MCP 관리 창에서만 사용할 수 있습니다.');
      abort.signal.throwIfAborted();
      if (action === 'list') return registry.list();
      if (action === 'check') return registry.check(input, abort.signal);
      if (action === 'save') return registry.register(input);
      if (action === 'toggle') return registry.toggle(input?.id, input?.enabled);
      if (action === 'remove') {
        const item = registry.list().servers.find(entry => entry.id === input);
        if (!item) return false;
        const { dialog } = await import('electron');
        const result = await dialog.showMessageBox(win, { type: 'question', message: item.name + ' MCP 등록을 삭제하시겠습니까?', buttons: ['취소', '삭제'], cancelId: 0, defaultId: 0, noLink: true, signal: abort.signal });
        if (result.response !== 1 || abort.signal.aborted) return false;
        await registry.remove(input); return true;
      }
      throw Error('지원하지 않는 사용자 MCP 설정 요청입니다.');
    });
    win.once('closed', () => {
      abort.abort(); registry.clearChecks(); ipcMain.removeHandler('ned-user-mcp');
      this.window = undefined;
      void isolated.clearStorageData().catch(() => {});
    });
    void win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(view(nonce)))
      .then(() => { if (!win.isDestroyed()) win.show(); }, () => this.close());
  }
  close() { if (this.window && !this.window.isDestroyed()) this.window.close(); }
}
