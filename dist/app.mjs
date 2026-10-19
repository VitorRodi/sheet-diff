import {compare,headers,parseCSV,value} from './core.mjs';
const $=id=>document.getElementById(id);
const state={books:[null,null],data:[null,null],names:['',''],result:null,filter:'all',page:0};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function note(s){$('notice').textContent=s;}
function invalidate(){state.result=null;$('results').hidden=true;}
function sync(){
 invalidate();note('');const previous=$('key').value;
 try{
  const both=state.data.every(Boolean);
  const common=both?headers(state.data[0]).filter(c=>headers(state.data[1]).includes(c)):[];
  $('key').innerHTML=common.length?common.map(c=>`<option>${escape(c)}</option>`).join(''):`<option>${both?'No shared columns':'Upload both files first'}</option>`;
  if(common.includes(previous))$('key').value=previous;
  else if(common.length){const id=common.find(c=>/^(id|sku|code|email|código)$/i.test(c));if(id)$('key').value=id;}
  $('key').disabled=!common.length;$('compare').disabled=!common.length;
  if(both&&!common.length)note('The sheets have no shared column headers. Use the same identifier header in both files.');
 }catch(e){$('compare').disabled=true;$('key').disabled=true;note(e.message);}
}
function checkData(data){
 if(data.length>10001)throw new Error('This worksheet exceeds 10,000 records. Split it into smaller files.');
 if((data[0]?.length||0)>100)throw new Error('This worksheet exceeds 100 columns. Remove unused columns first.');
 headers(data);if(data.length<2)throw new Error('This worksheet has headers but no records. Choose another worksheet.');
 return data;
}
function worksheetRows(sheet){
 const data=[];sheet.eachRow({includeEmpty:false},row=>{
  const cells=[];
  for(let i=1;i<=sheet.columnCount;i++){
   const c=row.getCell(i);let v=c.value;
   if(v&&typeof v==='object'&&!(v instanceof Date)){
    if('formula'in v||'sharedFormula'in v){if(v.result===undefined)throw new Error('A formula has no saved result. Recalculate and save the workbook in Excel first.');v=v.result;}
    else if(v.richText)v=v.richText.map(t=>t.text).join('');else if(v.error)v=v.error;else v=v.text??c.text;
   }
   cells.push(value(v));
  }
  if(cells.some(x=>x!==''))data.push(cells);
 });
 if(data.length){let end=data[0].length;while(end&&data.every(r=>!r[end-1]))end--;for(const r of data)r.length=end;}
 return checkData(data);
}
const uploads=[0,0];
async function loadFile(i,file){
 if(!file)return;const token=++uploads[i];state.names[i]=file.name;
 state.books[i]=null;state.data[i]=null;$('sf'+i).hidden=true;$('name'+i).textContent='Reading file…';sync();
 try{
  if(file.size>5*1024*1024)throw new Error('File exceeds 5 MB. Choose a smaller file.');
  if(!/\.(csv|xlsx)$/i.test(file.name))throw new Error('Use an .xlsx or .csv file. Save older .xls files as .xlsx first.');
  if(/\.csv$/i.test(file.name)){
   const data=checkData(parseCSV(await file.text()));if(token!==uploads[i])return;
   state.data[i]=data;
  }else{
   if(!window.ExcelJS)throw new Error('The Excel reader could not load. Refresh the page and try again.');
   const book=new ExcelJS.Workbook();await book.xlsx.load(await file.arrayBuffer());if(token!==uploads[i])return;
   const sheets=book.worksheets.filter(s=>s.state!=='veryHidden');
   if(!sheets.length)throw new Error('No worksheets found in this workbook.');
   state.books[i]=book;
   $('sheet'+i).innerHTML=sheets.map(s=>`<option value="${s.id}">${escape(s.name)}</option>`).join('');
   $('sf'+i).hidden=false;state.data[i]=worksheetRows(sheets[0]);
  }
  $('name'+i).textContent=`${file.name} · ${state.data[i].length-1} records`;sync();
 }catch(e){if(token!==uploads[i])return;$('name'+i).textContent=file.name;state.data[i]=null;sync();note(`${i?'Updated':'Original'} file: ${e.message||'Could not read this file. Check that it is a valid Excel or CSV file.'}`);}
}
for(let i=0;i<2;i++){
 $('file'+i).addEventListener('change',e=>loadFile(i,e.target.files[0]));
 $('sheet'+i).addEventListener('change',()=>{try{state.data[i]=worksheetRows(state.books[i].getWorksheet(Number($('sheet'+i).value)));$('name'+i).textContent=`${state.names[i]} · ${state.data[i].length-1} records`;sync();}catch(e){state.data[i]=null;$('name'+i).textContent=state.names[i];sync();note(e.message);}});
 const drop=$('drop'+i);drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag');});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');loadFile(i,e.dataTransfer.files[0]);});
}
$('key').addEventListener('change',invalidate);
function run(){
 try{state.result=compare(...state.data,$('key').value);state.page=0;state.filter='all';$('search').value='';note('');$('results').hidden=false;
  const counts={changed:0,added:0,removed:0,unchanged:0};state.result.rows.forEach(r=>counts[r.status]++);
  $('summary').innerHTML=Object.entries(counts).map(([k,v])=>`<div class="stat ${k}"><strong>${v}</strong><span>${k[0].toUpperCase()+k.slice(1)} ${v===1?'record':'records'}</span></div>`).join('');
  $('schema').textContent=[state.result.addedColumns.length?`New columns: ${state.result.addedColumns.join(', ')}.`:'',state.result.removedColumns.length?`Removed columns: ${state.result.removedColumns.join(', ')}.`:''].filter(Boolean).join(' ');
  render();$('results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }catch(e){invalidate();note(e.message);}
}
$('compare').addEventListener('click',run);
function filtered(){const q=$('search').value.toLowerCase();return state.result.rows.filter(r=>(state.filter==='all'?r.status!=='unchanged':r.status===state.filter)&&(!q||[r.key,...Object.values(r.before||{}),...Object.values(r.after||{})].some(v=>v.toLowerCase().includes(q))));}
function render(){
 const result=state.result;if(!result)return;
 const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/50));state.page=Math.min(state.page,pages-1);
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===state.filter);b.setAttribute('aria-pressed',String(b.dataset.filter===state.filter));});
 $('thead').innerHTML='<tr><th scope="col">Status</th>'+result.columns.map(c=>`<th scope="col">${escape(c)}</th>`).join('')+'</tr>';
 $('tbody').innerHTML=rows.slice(state.page*50,(state.page+1)*50).map(r=>`<tr><td><span class="badge ${r.status}">${r.status}</span></td>${result.columns.map(c=>{
  const b=r.before?.[c],a=r.after?.[c];
  const display=v=>v===undefined?'<span class="muted">No column</span>':v===''?'<span class="muted">Empty</span>':escape(v);
  return `<td>${r.changes.includes(c)?`<del aria-label="Original value">${display(b)}</del><ins aria-label="Updated value">${display(a)}</ins>`:display(r.after?a:b)}</td>`;
 }).join('')}</tr>`).join('');
 $('empty').hidden=!!rows.length;
 $('empty').textContent=state.filter==='all'&&!$('search').value&&result.rows.every(r=>r.status==='unchanged')?'No differences found. All records match. Choose Unchanged to review them.':'No records match this view. Try another filter or clear your search.';
 $('page-info').textContent=rows.length?`${state.page*50+1}–${Math.min((state.page+1)*50,rows.length)} of ${rows.length} records`:'0 records';$('prev').disabled=state.page===0;$('next').disabled=state.page>=pages-1;
}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.filter;state.page=0;render();}));$('search').addEventListener('input',()=>{state.page=0;render();});$('prev').addEventListener('click',()=>{state.page--;render();});$('next').addEventListener('click',()=>{state.page++;render();});
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').addEventListener('click',async()=>{
 try{const wb=new ExcelJS.Workbook(),s=wb.addWorksheet('Comparison');
  s.addRow(['Status','Identifier','Column','Original value','Updated value']);
  state.result.rows.filter(r=>r.status!=='unchanged').forEach(r=>{
   const cols=r.changes.length?r.changes:state.result.columns;
   cols.forEach(c=>s.addRow([r.status,r.key,c,r.before?.[c]??'',r.after?.[c]??'']));
  });
  s.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};s.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2A2A2A'}};s.columns.forEach((c,i)=>c.width=i<2?20:32);s.views=[{state:'frozen',ySplit:1}];s.autoFilter='A1:E1';
  download(new Blob([await wb.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'sheet-diff-comparison.xlsx');
 }catch(e){note('The report could not be exported. '+e.message);}
});
$('demo').addEventListener('click',()=>{
 uploads.forEach((_,i)=>{uploads[i]++;$('file'+i).value='';$('sf'+i).hidden=true;state.books[i]=null;});
 const head=['SKU','Product','Category','Stock','Price'];
 state.data[0]=[head,['TS-001','Cotton T-shirt','Tops',24,'29.90'],['JK-002','Denim jacket','Outerwear',12,'89.00'],['DR-003','Linen dress','Dresses',8,'69.90'],['BG-004','Canvas tote','Accessories',6,'24.00'],['SH-005','Classic shirt','Tops',18,'49.90'],['PT-006','Straight trousers','Bottoms',14,'59.90']];
 state.data[1]=[head,['DR-003','Linen dress','Dresses',8,'69.90'],['TS-001','Cotton T-shirt','Tops',18,'29.90'],['JK-002','Denim jacket','Outerwear',12,'95.00'],['SH-005','Classic shirt','Tops',18,'49.90'],['PT-006','Straight trousers','Bottoms',10,'59.90'],['JK-008','Rain jacket','Outerwear',12,'79.90'],['AC-009','Woven belt','Accessories',20,'19.90']];
 $('name0').textContent='inventory-before.xlsx · 6 example records';$('name1').textContent='inventory-after.xlsx · 7 example records';sync();run();
});
