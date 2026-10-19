import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {compare} from '../dist/core.mjs';
import {createComparisonWorkbook} from '../dist/export.mjs';

test('export round trip includes every difference and preserves text values',async()=>{
 const r=compare([['ID','Value'],['001','old'],['002','removed'],['003','same']],[['ID','Value'],['001','=1+1'],['003','same'],['004','new']],'ID');
 const wb=createComparisonWorkbook(ExcelJS,r);
 const loaded=new ExcelJS.Workbook();await loaded.xlsx.load(await wb.xlsx.writeBuffer());
 const sheet=loaded.worksheets[0],rows=[];sheet.eachRow(row=>rows.push(row.values.slice(1)));
 assert.deepEqual(rows[0],['Status','Identifier','Column','Original value','Updated value']);
 assert.equal(rows.length,6);
 assert.deepEqual(rows[1],['changed','001','Value','old','=1+1']);
 assert.equal(sheet.getCell('E2').type,ExcelJS.ValueType.String);
 assert.ok(rows.some(r=>r[0]==='removed'&&r[1]==='002'));
 assert.ok(rows.some(r=>r[0]==='added'&&r[1]==='004'));
 assert.ok(!rows.some(r=>r[1]==='003'));
 assert.equal(sheet.views[0].ySplit,1);
 assert.equal(sheet.autoFilter,'A1:E1');
});

test('schema export does not leak inherited properties into missing cells',()=>{
 const r=compare([['ID','Value'],['1','x']],[['ID','Value','toString'],['1','x','new']],'ID');
 const sheet=createComparisonWorkbook(ExcelJS,r).worksheets[0];
 assert.equal(sheet.getCell('D2').value,'');
 assert.equal(sheet.getCell('E2').value,'new');
});
