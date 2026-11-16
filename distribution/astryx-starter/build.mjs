// Project-local build only. No package installation, server, or network request.
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
await build({absWorkingDir:root,entryPoints:['src/main.tsx'],outdir:'dist',bundle:true,format:'iife',platform:'browser',target:'es2022',jsx:'automatic',minify:true,define:{'process.env.NODE_ENV':'"production"'},loader:{'.woff2':'file','.woff':'file','.svg':'file','.png':'file'}});
console.log('ASTRYX_BUILD_OK: open index.html in a local browser.');
