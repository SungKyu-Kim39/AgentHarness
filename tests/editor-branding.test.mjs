import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{existsSync}from'node:fs';
import{brandEditor,verifyEditorIcon}from'../scripts/ned-editor-branding.mjs';
const original='.cache/ned/zed-extract/code$GetInstallDir/Zed.exe';
test('the actual pinned editor gets Ned window/taskbar icon resource 1 with code and vendor version unchanged',{skip:!existsSync(original)},async()=>{
 const bytes=await readFile(original),icon=await readFile('assets/ned-icon.ico');const first=brandEditor(bytes,icon),second=brandEditor(bytes,icon);
 assert.equal(first.record.originalSha256,'c9348b84ff3a2632bdec30912e069a584ef31bd23a5ce35afbce76d70975601a');assert.equal(first.record.nonResourceSectionsUnchanged,true);assert.equal(first.record.vendorVersionMetadataPreserved,true);assert.deepEqual(first.bytes,second.bytes);
 assert.doesNotThrow(()=>verifyEditorIcon(first.bytes,icon));assert.throws(()=>verifyEditorIcon(bytes,icon),/icon/);assert.throws(()=>brandEditor(Buffer.from('invalid'),icon));
});
