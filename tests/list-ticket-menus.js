const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+require('path').resolve(__dirname,'../src/game.html'));await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{const keyOf=pr=>pr?(Object.keys(PROC).find(k=>PROC[k]===pr)||'-'):'NONE';const out=[];
const one=(e,tag)=>{if(!Array.isArray(e)||typeof e[2]!=='string')return;const t={title:e[2],src:e[8]||'call',kind:e[5],tri:e[6],procKey:e[9]};out.push(tag+'\t'+keyOf(procOf(t))+'\t'+(e[1])+'\t'+e[2]);};
[['EV',EV],['EVE',EV_EVE],['NIGHT',EV_NIGHT],['HOL',EV_HOL]].forEach(([n,a])=>a.forEach(e=>one(e,n)));
for(const k in SPEC_EV)SPEC_EV[k].forEach(e=>one(e,'SPEC_'+k));
for(const k in TPL)TPL[k].forEach(e=>{const t={title:e[0],src:'call',tri:e[4]};out.push('TPL_'+k+'\t'+keyOf(procOf(t))+'\t\t'+e[0]);});
return out.join('\n');}));await b.close();})();
