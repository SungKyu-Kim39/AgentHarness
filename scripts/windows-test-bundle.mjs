// Build on the release machine; execute the fixed bytes using the installed Windows Node.
import {build} from 'esbuild';
import {hostAliases} from './ned-host-build.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {isSupportedReleaseVersion,isValidRevision} from './release-policy.mjs';
const root=path.resolve(import.meta.dirname,'..');
const version=JSON.parse(await readFile(path.join(root,'package.json'))).version;
const revision=process.env.NED_BUILD_REVISION??'';
if(!isSupportedReleaseVersion(version)||(revision&&!isValidRevision(revision)))throw Error('Review Windows fixture inputs for this version');
const artifactVersion=version+(revision?'-'+revision:'');
const groups={
 upgrade:['zed-settings','zed-history','terminal-jobs.windows','terminal','external-read','permission-policy','patch-file','buffer-check','mcp-boundary','session-memory','studio-policy','openviking-diagnostics','editor-preferences','editor-git-trust.windows','openviking.integration','skill-routing','python-package-proxy',...(version==='0.4.2'?['user-mcp']:[])],
};
await mkdir(path.join(root,'.cache/ned/windows-tests'),{recursive:true});
for(const [name,tests]of Object.entries(groups)){
 const entry=path.join(root,'.cache/ned/windows-tests',name+'.ts');
 await writeFile(entry,tests.map(test=>'import '+JSON.stringify(path.join(root,'tests',test+'.test.ts'))+';').join('\n'));
 const filename=`downloads/Ned-${artifactVersion}-windows-${name}-test.cjs`;
 await build({entryPoints:[entry],outfile:path.join(root,filename),bundle:true,alias:hostAliases,platform:'node',target:'node22',format:'cjs',legalComments:'eof',logLevel:'warning'});
 const sha=createHash('sha256').update(await readFile(path.join(root,filename))).digest('hex');
 await writeFile(path.join(root,filename+'.sha256'),sha+'  '+path.basename(filename)+'\n');
 console.log(filename,sha);
}
