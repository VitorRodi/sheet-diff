import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {parseCSV,compare} from '../dist/core.mjs';

test('generated CSV examples can be compared by SKU with reordered columns',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'sheet-diff-examples-'));
 try{
  await promisify(execFile)(process.execPath,[fileURLToPath(new URL('../fixtures.mjs',import.meta.url)),dir]);
  const before=parseCSV(await readFile(join(dir,'original.csv'),'utf8'));
  const after=parseCSV(await readFile(join(dir,'updated.csv'),'utf8'));
  assert.deepEqual(compare(before,after,'SKU').rows.map(r=>[r.key,r.status]),[['A01','changed'],['A02','unchanged'],['A03','removed'],['A04','added']]);
 }finally{assert.equal(dirname(resolve(dir)),resolve(tmpdir()));await rm(dir,{recursive:true,force:true});}
});
