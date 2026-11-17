import {test}from'node:test';import assert from'node:assert/strict';
import {mkdtemp,writeFile,rm,symlink}from'node:fs/promises';import{createHash}from'node:crypto';import{tmpdir}from'node:os';import path from'node:path';import{verifyFiles}from'../src/main/parallel-files';
test('bounded bundle verification checks every digest and settles before reporting damaged or escaped inputs',async t=>{
 const root=await mkdtemp(path.join(tmpdir(),'ned-verify-'));t.after(()=>rm(root,{recursive:true,force:true}));const hash=createHash('sha256').update('valid').digest('hex');
 const files=[];for(let i=0;i<12;i++){await writeFile(path.join(root,i+'.txt'),'valid');files.push({path:i+'.txt',sha256:hash});}let count=0;await verifyFiles(root,files,done=>count=done);assert.equal(count,12);
 await writeFile(path.join(root,'0.txt'),'damaged');await assert.rejects(verifyFiles(root,files,()=>count++),/무결성/);const settled=count;await new Promise(r=>setTimeout(r,20));assert.equal(count,settled,'no late progress after failure');
 await assert.rejects(verifyFiles(root,[{path:'../outside',sha256:hash}]),/경로/);
 const external=path.join(root,'../external-'+path.basename(root));await writeFile(external,'valid');t.after(()=>rm(external,{force:true}));await symlink(external,path.join(root,'link'));await assert.rejects(verifyFiles(root,[{path:'link',sha256:hash}]),/범위/);
});
