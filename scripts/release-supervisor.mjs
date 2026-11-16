import {readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileHash} from './installer-audit.mjs';
/** Reviewed Ned-owned file replacement after lossless SDK layout optimization. */
export async function updateReleaseSupervisor(root, staged, proof) {
 const relative='runtime/windows-x64/openviking/sidecar-supervisor.py';
 const directory=path.join(staged,'resources/runtime/windows-x64/openviking');
 const source=path.join(root,'scripts/sidecar-supervisor.py'),target=path.join(staged,'resources',relative);
 const manifestFile=path.join(directory,'manifest.json'),manifest=JSON.parse(await readFile(manifestFile,'utf8'));
 const entry=manifest.files.find(item=>item.path==='sidecar-supervisor.py');
 if(!entry||entry.sha256!==await fileHash(target))throw Error('Supervisor does not match its pinned runtime manifest');
 const before=entry.sha256,after=await fileHash(source);
 if(before===after&&proof.supervisorUpdate?.sha256===after)return after;
 await copyFile(source,target);entry.sha256=after;
 await writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');
 proof.supervisorUpdate={path:relative,source:'scripts/sidecar-supervisor.py',previousSha256:before,sha256:after,reason:'Preserve child exit status without finalizing a blocked stdin daemon'};
 proof.components.openviking.manifestSha256=await fileHash(manifestFile);
 await writeFile(path.join(staged,'resources/ned/runtime-optimization.json'),JSON.stringify(proof,null,2)+'\n');
 return after;
}
