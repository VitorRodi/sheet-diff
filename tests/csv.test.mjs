import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV} from '../dist/core.mjs';

for(const delimiter of [',',';','\t']){
 test(`reads ${JSON.stringify(delimiter)} separated data with Windows and Unix line endings`,()=>{
  for(const eol of ['\n','\r\n','\r']){
   const input=['ID'+delimiter+'Name','1'+delimiter+'"Blue'+delimiter+'coat"','2'+delimiter+'"A ""quoted"" name"'].join(eol)+eol;
   assert.deepEqual(parseCSV(input),[['ID','Name'],['1','Blue'+delimiter+'coat'],['2','A "quoted" name']]);
  }
 });
}

test('preserves trailing empty columns and supports single-column files',()=>{
 assert.deepEqual(parseCSV('ID,Name,Note\n1,Coat,\n'),[['ID','Name','Note'],['1','Coat','']]);
 assert.deepEqual(parseCSV('ID\n001\n002'),[['ID'],['001'],['002']]);
 assert.deepEqual(parseCSV(''),[]);
 assert.deepEqual(parseCSV('\n\r\n'),[]);
});

test('rejects data wider than its header while accepting missing trailing cells',()=>{
 assert.throws(()=>parseCSV('ID,Name\n1,Coat,extra'),/more cells/);
 assert.deepEqual(parseCSV('ID,Name\n1'),[['ID','Name'],['1']]);
});
