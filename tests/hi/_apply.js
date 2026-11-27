// 用法：node apply.js <domId> <file.js> ["commit msg"] — 把某一門的高級(2)、專家(3)題目換成檔案裡的
// 檔案格式：module.exports={2:[[t,q,code|0,[正解,錯,錯,錯],why],…],3:[…]}
const fs=require('fs'),cp=require('child_process');const [id,file,msg]=process.argv.slice(2);const Q=require(require('path').resolve(file));
const p='/home/claude/it-duty-day/src/train.html';const L=fs.readFileSync(p,'utf8').split('\n');
const b=L.findIndex(x=>x.trim().startsWith("{id:'"+id+"',")&&x.includes('lv:[['));if(b<0)throw 'no dom '+id;const seps=[];let e=-1;for(let i=b+1;i<L.length;i++){const T=L[i].trim();if(T==='],[')seps.push(i);if(T.startsWith(']]}')){e=i;break;}if(T.startsWith('{id:'))throw 'layout';}
if(seps.length!==3||e<0)throw 'layout '+seps.length;
const old=[2,3].map(l=>{const a=l===2?seps[1]+1:seps[2]+1,z=l===2?seps[2]:e;return new Set(L.slice(a,z).map(x=>(x.match(/\{t:"([^"]+)"/)||[])[1]).filter(Boolean));});
let bad=0;const obj=l=>Q[l].map(r=>{let [t,q,code,a,why]=r;a=a.slice();a[0]=a[0].split('｜')[0];const o={t,q};if(code)o.code=code;o.a=a;o.why=why;if(/<\/?script/i.test(JSON.stringify(r))){console.log('SCRIPT TAG',q);bad++;}if(!t||!q||!why||!Array.isArray(a)||a.length!==4||new Set(a).size!==4){console.log('BAD',l,q);bad++;}return o;});
const O={2:obj(2),3:obj(3)};
[2,3].forEach((l,k)=>{const ts=new Set(O[l].map(x=>x.t));old[k].forEach(t=>{if(!ts.has(t)){console.log('MISSING topic L'+l,t);bad++;}});ts.forEach(t=>{if(!old[k].has(t)){console.log('NEW topic L'+l,t);bad++;}});
 let lg=0,sh=0;O[l].forEach(q=>{const ls=q.a.map(x=>x.length);const o2=Math.max(ls[1],ls[2],ls[3]);if(ls[0]>=o2+4)lg++;if(ls[0]>=o2+8){console.log('   長 L'+l,'+'+(ls[0]-o2),q.a[0]);}if(ls[0]===Math.min(...ls)&&ls[0]<Math.max(...ls)-8)sh++;
  const d=ls[0]-(ls[1]+ls[2]+ls[3])/3;});console.log(id,'L'+l,O[l].length,'題 正解最長',lg,'最短',sh);});
if(bad)throw 'fix first';
const ser=a=>a.map((q,i)=>' '+JSON.stringify(q).replace(/^\{"t":/,'{t:').replace(/,"q":/,',q:').replace(/,"code":/,',code:').replace(/,"a":\[/,',a:[').replace(/,"why":/,',why:')+(i<a.length-1?',':''));
fs.writeFileSync(p,L.slice(0,seps[1]+1).concat(ser(O[2]),['],['],ser(O[3]),L.slice(e)).join('\n'));
if(msg){cp.execSync('cd /home/claude/it-duty-day && python3 src/build.py --plain /home/claude/it-duty-3d-game.html --train /home/claude/it-train.html >/dev/null && git add -A && git -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m "'+msg+'\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_0136T9PMFi58KqakTHwWzmvZ"',{stdio:'inherit'});console.log('committed');}
