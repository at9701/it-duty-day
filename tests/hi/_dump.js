// 用法：node dump.js <domId> [levels…]  — 把題庫某一門的題目印出來
const fs=require('fs');const s=fs.readFileSync('/home/claude/it-duty-day/src/train.html','utf8');
const id=process.argv[2];let i=s.indexOf("{id:'"+id+"',lv:[[");if(i<0)i=s.indexOf("{id:'"+id+"',ic:");let d=0,j=i;for(;j<s.length;j++){const ch=s[j];if(ch==='{'||ch==='[')d++;else if(ch==='}'||ch===']'){d--;if(d===0)break;}else if(ch==="'"||ch==='`'||ch==='"'){const q=ch;j++;while(s[j]!==q){if(s[j]==='\\')j++;j++;}}}
const o=eval('('+s.slice(i,j+1)+')');const lv=process.argv.slice(3).map(Number);
o.lv.forEach((L,l)=>{if(lv.length&&!lv.includes(l))return;console.log('== L'+l,L.length);L.forEach(q=>console.log('['+q.t+'] '+q.q+(q.code?'\n  CODE: '+q.code.replace(/\n/g,' ⏎ '):'')+'\n  A: '+q.a[0]+'\n  x: '+q.a.slice(1).join(' ｜ ')));});
