export function createComparisonWorkbook(ExcelJS,result){
 const wb=new ExcelJS.Workbook(),s=wb.addWorksheet('Comparison');
  s.addRow(['Status','Identifier','Column','Original value','Updated value']);
  result.rows.filter(r=>r.status!=='unchanged').forEach(r=>{
   const cols=r.changes.length?r.changes:result.columns;
   cols.forEach(c=>s.addRow([r.status,r.key,c,r.before?.[c]??'',r.after?.[c]??'']));
  });
  s.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};s.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2A2A2A'}};s.columns.forEach((c,i)=>c.width=i<2?20:32);s.views=[{state:'frozen',ySplit:1}];s.autoFilter='A1:E1';
 return wb;
}
