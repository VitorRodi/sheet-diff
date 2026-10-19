import test from 'node:test';
import assert from 'node:assert/strict';
import {compare,parseCSV} from '../dist/core.mjs';
test('ignores delimiter characters inside quoted CSV headers',()=>{
 assert.deepEqual(parseCSV('"Name, description, notes";ID\n"Shirt, blue";001'),[['Name, description, notes','ID'],['Shirt, blue','001']]);
});
test('reads quoted delimiters, escaped quotes, multiline CSV and UTF-8 BOM',()=>{
 assert.deepEqual(parseCSV('\uFEFFID;Text\r\n1;"a;b"\r\n2;"hello\n""world"""'),[['ID','Text'],['1','a;b'],['2','hello\n"world"']]);
 assert.throws(()=>parseCSV('ID,Text\n1,"oops'),/not closed/);
});
test('matches by key, detects changes, additions and removals despite reordered rows',()=>{
 const r=compare([['ID','Name','Stock'],['1','Shirt',10],['2','Coat',5],['3','Socks',4]],[['Stock','ID','Name'],[5,'2','Coat'],[8,'1','Shirt'],[3,'4','Hat']],'ID');
 assert.deepEqual(r.rows.map(x=>[x.key,x.status]),[['1','changed'],['2','unchanged'],['3','removed'],['4','added']]);
 assert.deepEqual(r.rows[0].changes,['Stock']);
});
test('rejects duplicate and empty keys instead of losing records',()=>{
 assert.throws(()=>compare([['ID'],['1'],['1']],[['ID'],['1']],'ID'),/duplicate/i);
 assert.throws(()=>compare([['ID'],['']],[['ID'],['1']],'ID'),/empty/i);
});
test('reports schema changes and preserves meaningful differences',()=>{
 const r=compare([['ID','Value','Old'],['001',' x ',3]],[['ID','Value','New'],['001','x',7]],'ID');
 assert.equal(r.rows[0].status,'changed');assert.deepEqual(r.addedColumns,['New']);assert.deepEqual(r.removedColumns,['Old']);
 assert.ok(r.rows[0].changes.includes('Value'));
});
