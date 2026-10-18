export const value = v => v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
export function headers(data){
 if(!data.length) throw new Error('This sheet is empty. Choose a sheet with a header row and records.');
 const h=data[0].map(x=>value(x).trim());
 if(h.some(x=>!x)||new Set(h).size!==h.length) throw new Error('Column headers must be unique and cannot be empty.');
 return h;
}
export function compare(before,after,key){
 const bh=headers(before),ah=headers(after);
 if(!bh.includes(key)||!ah.includes(key))throw new Error('Choose an identifier column present in both sheets.');
 const addedColumns=ah.filter(x=>!bh.includes(x)),removedColumns=bh.filter(x=>!ah.includes(x));
 const columns=[...bh,...addedColumns];
 const index=(data,h,label)=>{
  const m=new Map();data.slice(1).forEach((cells,i)=>{
   const id=value(cells[h.indexOf(key)]).trim();
   if(!id)throw new Error(`${label}: empty identifier on row ${i+2}. Fill it in or choose another column.`);
   if(m.has(id))throw new Error(`${label}: duplicate identifier "${id}" on row ${i+2}. Each record needs a unique identifier.`);
   m.set(id,Object.fromEntries(h.map((c,j)=>[c,value(cells[j])])));
  });return m;
 };
 const b=index(before,bh,'Original file'),a=index(after,ah,'Updated file');
 const rows=[...new Set([...b.keys(),...a.keys()])].map(key=>{
  const old=b.get(key),current=a.get(key);
  const changes=old&&current?columns.filter(c=>!(c in old)||!(c in current)||old[c]!==current[c]):[];
  return {key,before:old,after:current,changes,status:!old?'added':!current?'removed':changes.length?'changed':'unchanged'};
 });return {rows,columns,addedColumns,removedColumns};
}
export function parseCSV(text){
 text=text.replace(/^\uFEFF/,'');
 const line=text.split(/\r?\n/)[0]||'';
 const delimiter=[',',';','\t'].sort((a,b)=>line.split(b).length-line.split(a).length)[0];
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||!cell)quoted=!quoted;else cell+=c;}
  else if(c===delimiter&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x!==''))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw new Error('A quoted CSV field is not closed. Check the file and try again.');
 row.push(cell);if(row.some(x=>x!==''))rows.push(row);
 if(rows.some(r=>r.length>rows[0].length))throw new Error('Some CSV rows have more cells than the header. Check the delimiter or quoted fields.');
 return rows;
}
