import path from 'node:path';
// Pin the static ESM entry for this dependency only; leave other Node resolutions unchanged.
export const hostAliases = { 'jsonc-parser': path.resolve(import.meta.dirname, '../node_modules/jsonc-parser/lib/esm/main.js') };
