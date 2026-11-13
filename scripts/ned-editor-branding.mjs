import {createHash} from 'node:crypto';
import * as PE from 'pe-library';
import {Data,Resource} from 'resedit';
const sha=bytes=>createHash('sha256').update(Buffer.from(bytes)).digest('hex');
/** GPUI Windows loads icon resource 1 for its window class; keep code and vendor version unchanged. */
export function brandEditor(bytes,iconBytes) {
 const before=PE.NtExecutable.from(bytes,{ignoreCert:true}),resources=PE.NtExecutableResource.from(before);
 const groups=Resource.IconGroupEntry.fromEntries(resources.entries),icon=Data.IconFile.from(iconBytes);
 if(!groups.some(g=>g.id===1)||!icon.icons.length)throw Error('Pinned editor icon resource 1 is missing');
 const versions=resources.entries.filter(e=>e.type===16).map(e=>[e.id,e.lang,sha(e.bin)]);
 const sections=Object.fromEntries(before.getAllSections().filter(s=>s.info.name!=='.rsrc').map(s=>[s.info.name,sha(s.data??new ArrayBuffer(0))]));
 for(const g of groups)Resource.IconGroupEntry.replaceIconsForResource(resources.entries,g.id,g.lang,icon.icons.map(i=>i.data));
 resources.outputResource(before);const modified=Buffer.from(before.generate());
 const after=PE.NtExecutable.from(modified,{ignoreCert:true});
 const finalVersions=PE.NtExecutableResource.from(after).entries.filter(e=>e.type===16).map(e=>[e.id,e.lang,sha(e.bin)]);
 if(JSON.stringify(versions)!==JSON.stringify(finalVersions))throw Error('Editor branding changed vendor version metadata');
 if(after.newHeader.optionalHeaderDataDirectory.get(4).size!==0)throw Error('Modified editor retains an invalid certificate directory');
 for(const s of after.getAllSections())if(s.info.name!=='.rsrc'&&sections[s.info.name]!==sha(s.data??new ArrayBuffer(0)))throw Error('Editor branding changed a non-resource section');
 verifyEditorIcon(modified,iconBytes);
 return{bytes:modified,record:{schemaVersion:1,component:'Zed v1.28.1 managed editor',change:'Windows icon resources only; Ned taskbar, Alt-Tab and window-class icon',originalSha256:sha(bytes),modifiedSha256:sha(modified),iconSha256:sha(iconBytes),nonResourceSectionsUnchanged:true,vendorVersionMetadataPreserved:true,authenticode:'modified resource image is unsigned; original vendor archive is preserved by the upstream lock'}};
}
export function verifyEditorIcon(bytes,iconBytes) {
 const resources=PE.NtExecutableResource.from(PE.NtExecutable.from(bytes,{ignoreCert:true}));
 const group=Resource.IconGroupEntry.fromEntries(resources.entries).find(g=>g.id===1),expected=Data.IconFile.from(iconBytes);
 if(!group||group.icons.length!==expected.icons.length)throw Error('Managed editor icon count mismatch');
 const actual=group.getIconItemsFromEntries(resources.entries);
 const generated=items=>{const ico=new Data.IconFile();ico.icons=items.map(data=>({data}));return sha(ico.generate())};
 if(generated(actual)!==generated(expected.icons.map(i=>i.data)))throw Error('Managed editor icon pixels do not match Ned');
}
