// Reviewed adapter for REA 6.8.0. Original runtime files remain byte-identical.
import { registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [rea, guard] = process.argv.slice(2);
const sourceUrl = pathToFileURL(resolve(dirname(rea), '../dist/ghidra/GhidraInstallation.js')).href;
const guardOptions = '"-Xbootclasspath/a:' + guard + '" -Djava.security.manager=NedOfflineNetworkGuard';
registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (url !== sourceUrl) return result;
    const source = typeof result.source === 'string' ? result.source : Buffer.from(result.source).toString('utf8');
    if (createHash('sha256').update(source).digest('hex') !== 'cd9a65037258db24cb98351d31726262a0c3dfe568ace13021c304ffbe04520a') throw new Error('NED_REA_GHIDRA_ADAPTER_SOURCE_MISMATCH');
    const needle = '        JAVA_TOOL_OPTIONS: "",';
    if (source.split(needle).length !== 2) throw new Error('NED_REA_GHIDRA_ADAPTER_SHAPE_MISMATCH');
    return { ...result, source: source.replace(needle, '        JAVA_TOOL_OPTIONS: ' + JSON.stringify(guardOptions) + ',') };
  },
});
process.argv = [process.execPath, rea, '--mcp'];
await import(pathToFileURL(rea).href);
