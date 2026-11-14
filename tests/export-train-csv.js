// 用法：node tests/export-train-csv.js 輸出.csv　把專業訓練的題庫匯出成 CSV（給人審題用）
const fs=require('fs'),path=require('path');
const s=fs.readFileSync(path.join(__dirname,'../src/train.html'),'utf8');
const a=s.indexOf('const DOMAINS=['),b=s.indexOf('\n// ===== 存檔');
const {COURSES,ADV,DOM,TIER}=new Function(s.slice(a,b)+';return {COURSES,ADV,DOM,TIER};')();
const strip=t=>String(t||'').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const cell=t=>'"'+strip(t).replace(/"/g,'""')+'"';
const rows=[['類別','課程','師傅','先修（需中級）','級別','題號','題目','程式碼','正確答案','錯誤選項1','錯誤選項2','錯誤選項3','解說','題庫代號']];
const BY={};COURSES.concat(ADV).forEach(c=>BY[c.id]=c);let n=0;
[['基礎',COURSES],['進階',ADV]].forEach(([kind,list])=>list.forEach(c=>{for(let l=0;l<4;l++){let k=0;c.src.forEach(sid=>(DOM[sid].lv[l]||[]).forEach(q=>{k++;n++;
 rows.push([kind,c.name,c.npc,(c.need||[]).map(i=>BY[i].name).join('、'),TIER[l],k,q.q,q.code||'',q.a[0],q.a[1],q.a[2],q.a[3],q.why,sid]);}));}}));
fs.writeFileSync(process.argv[2],'﻿'+rows.map(r=>r.map(cell).join(',')).join('\r\n')+'\r\n');console.log('rows',n);
