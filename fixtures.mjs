import ExcelJS from 'exceljs';
import fs from 'node:fs/promises';
const dir='../../outputs/sheet-diff';
for(const [name,rows] of [['original',[['SKU','Product','Stock'],['A01','Shirt',10],['A02','Coat',5],['A03','Socks',4]]],['updated',[['Stock','SKU','Product'],[5,'A02','Coat'],[8,'A01','Shirt'],[3,'A04','Hat']]]]){
const w=new ExcelJS.Workbook();w.addWorksheet('Inventory').addRows(rows);w.addWorksheet('Second sheet').addRows([['ID','Name'],['1','Demo']]);await w.xlsx.writeFile(`${dir}/${name}.xlsx`);
}
await fs.writeFile(`${dir}/duplicates.csv`,'SKU,Product,Stock\nA01,Shirt,8\nA01,Coat,5');
