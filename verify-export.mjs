import ExcelJS from 'exceljs';
import assert from 'node:assert/strict';
const file=process.argv[2];
if(!file)throw new Error('Usage: node verify-export.mjs <comparison.xlsx> (export from examples/original.xlsx and examples/updated.xlsx)');
const w=new ExcelJS.Workbook();await w.xlsx.readFile(file);
const rows=[];w.worksheets[0].eachRow(r=>rows.push(r.values.slice(1)));
assert.equal(rows.length,8);assert.deepEqual(rows[1],['changed','A01','Stock','10','8']);assert.ok(rows.some(r=>r[0]==='added'&&r[1]==='A04'));assert.ok(rows.some(r=>r[0]==='removed'&&r[1]==='A03'));
console.log('Export verified: 7 differences; original and updated values correct.');
