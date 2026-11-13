import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateGuiExecutable} from '../distribution/desktop-launch';
function pe(subsystem=2){const bytes=Buffer.alloc(256);bytes.write('MZ');bytes.writeUInt32LE(64,60);bytes.write('PE\0\0',64);bytes.writeUInt16LE(0x20b,88);bytes.writeUInt16LE(subsystem,156);return bytes;}
test('launch validates PE GUI subsystem and excludes managed, console, script and administrative executables',()=>{
 assert.doesNotThrow(()=>validateGuiExecutable(pe(),'C:\\Windows\\System32\\calc.exe'));
 assert.doesNotThrow(()=>validateGuiExecutable(pe(),'C:\\Apps\\Business App.exe'));
 assert.throws(()=>validateGuiExecutable(pe(3),'C:\\Apps\\console.exe'),/GUI/);
 for(const name of ['Ned.exe','zed.exe','cmd.exe','powershell.exe','regedit.exe','mshta.exe','pythonw.exe','node.exe'])assert.throws(()=>validateGuiExecutable(pe(),'C:\\Apps\\'+name),/대상/);
 assert.throws(()=>validateGuiExecutable(Buffer.from('not an exe'),'C:\\Apps\\bad.exe'),/GUI/);
 const dll=pe();dll.writeUInt16LE(0x2000,86);assert.throws(()=>validateGuiExecutable(dll,'C:\\Apps\\dll.exe'),/GUI/);
 const corrupt=pe();corrupt.writeUInt32LE(0xfffffff0,60);assert.throws(()=>validateGuiExecutable(corrupt,'C:\\Apps\\bad.exe'),/GUI/);
});
