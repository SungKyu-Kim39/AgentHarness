import {readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileHash} from './installer-audit.mjs';
/** Reviewed Ned-owned file replacement after lossless SDK layout optimization. */
async function replaceRuntimeScript(root, staged, proof, manifestPath, sourcePath, proofKey, reason, component = 'openviking') {
 const relative='runtime/windows-x64/'+component+'/'+manifestPath;
 const directory=path.join(staged,'resources/runtime/windows-x64',component);
 const source=path.join(root,sourcePath),target=path.join(staged,'resources',relative);
 const manifestFile=path.join(directory,'manifest.json'),manifest=JSON.parse(await readFile(manifestFile,'utf8'));
 const entry=manifest.files.find(item=>item.path===manifestPath);
 if(!entry||entry.sha256!==await fileHash(target))throw Error('Script does not match its pinned runtime manifest: '+manifestPath);
 const before=entry.sha256,after=await fileHash(source);
 if(before===after&&proof[proofKey]?.sha256===after)return after;
 await copyFile(source,target);entry.sha256=after;
 await writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');
 proof[proofKey]={path:relative,source:sourcePath,previousSha256:before,sha256:after,reason};
 proof.components[component].manifestSha256=await fileHash(manifestFile);
 await writeFile(path.join(staged,'resources/ned/runtime-optimization.json'),JSON.stringify(proof,null,2)+'\n');
 return after;
}
export function updateReleaseSupervisor(root, staged, proof) {
 return replaceRuntimeScript(root, staged, proof, 'sidecar-supervisor.py', 'scripts/sidecar-supervisor.py', 'supervisorUpdate', 'Preserve child exit status without finalizing a blocked stdin daemon');
}
export function updateReleaseLauncher(root, staged, proof) {
 return replaceRuntimeScript(root, staged, proof, 'launch.py', 'scripts/openviking-launch.py', 'launcherUpdate', 'Ignore Windows Registry MIME overrides for OpenViking Studio static assets');
}
export function updateReleaseMcpNodeWorker(root, staged, proof) {
 return replaceRuntimeScript(root, staged, proof, 'mcp-node-worker.cjs', 'scripts/mcp-node-worker.cjs', 'mcpNodeWorkerUpdate', 'Allow IPv6 ::1 local dev origins and log safe DevTools import error codes', 'mcp');
}
