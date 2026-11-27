// Exercise the distributed CommonJS bytes without an editor, models or a user profile.
import vm from 'node:vm';
import { createRequire, isBuiltin } from 'node:module';
import { readFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
export function verifyBundledHost(bytes) {
  const reached = new Error('NED_HOST_IMPORTS_INITIALIZED');
  const imports = new Set();
  const electron = { app: { setName(name) {
    if (name !== 'Ned') throw new Error('Unexpected host identity');
    throw reached;
  } } };
  const context = vm.createContext({
    module: { exports: {} }, exports: {}, Buffer, URL, URLSearchParams,
    TextEncoder, TextDecoder, AbortController, AbortSignal, structuredClone,
    setTimeout, clearTimeout, setInterval, clearInterval, console,
    process: { platform: process.platform, env: {}, versions: process.versions },
    require(id) {
      imports.add(id);
      if (id === 'electron') return electron;
      if (!isBuiltin(id)) throw new Error('UNBUNDLED_HOST_IMPORT: ' + id);
      return require(id);
    },
  });
  try { new vm.Script(Buffer.from(bytes).toString('utf8'), { filename: 'distributed-main.cjs' }).runInContext(context, { timeout: 10000 }); }
  catch (error) {
    if (error !== reached) throw error;
    return { passed: true, stoppedBeforeApplicationStartup: true, nonBuiltinImports: [...imports].filter(id => !isBuiltin(id)) };
  }
  throw new Error('Host did not reach its application entry point');
}

/** The sandboxed management preload can use Electron's runtime IPC only. */
export function verifyUserMcpPreload(bytes) {
  const reply = Symbol('Ned MCP IPC reply');
  let api;
  let invoked;
  const electron = {
    contextBridge: { exposeInMainWorld(name, value) { if (name === 'nedMcp') api = value; } },
    ipcRenderer: { invoke(...args) { invoked = args; return reply; } },
  };
  const context = vm.createContext({ exports: {}, require(id) {
    if (id !== 'electron') throw new Error('Unexpected user MCP preload dependency: ' + id);
    return electron;
  } });
  new vm.Script(Buffer.from(bytes).toString('utf8'), { filename: 'user-mcp-preload.cjs' }).runInContext(context, { timeout: 1000 });
  if (typeof api?.request !== 'function' || api.request('list') !== reply || invoked?.[0] !== 'ned-user-mcp' || invoked[1] !== 'list') {
    throw new Error('User MCP preload did not expose the management request bridge');
  }
  return { passed: true, exposed: 'nedMcp.request', channel: 'ned-user-mcp' };
}

if (process.argv[1] === import.meta.filename) {
  console.log(JSON.stringify(verifyBundledHost(await readFile(process.argv[2]))));
}
