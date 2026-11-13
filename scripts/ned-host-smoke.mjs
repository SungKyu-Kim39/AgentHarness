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
if (process.argv[1] === import.meta.filename) {
  console.log(JSON.stringify(verifyBundledHost(await readFile(process.argv[2]))));
}
