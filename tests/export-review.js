// 用法：node tests/export-review.js 輸出檔.html  → 產生「做法選單對照表」，給熟流程的人逐題核對
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+require('path').resolve(__dirname,'../src/game.html'));await p.waitForTimeout(800);
const data=await p.evaluate(()=>{const keyOf=pr=>pr?(Object.keys(PROC).find(k=>PROC[k]===pr)||''):'';const tk={};const add=(k,t)=>{if(!k)return;(tk[k]=tk[k]||[]);if(!tk[k].includes(t))tk[k].push(t);};
const one=(title,src,tri,pk)=>{if(tri)return;if(/平板.*同意書|電子同意書/.test(title)){add('econsent_net',title);add('econsent_app',title);return;}const k=keyOf(procOf({title,src:src||'call',procKey:pk}));add(k,title);if(k==='slow'&&!pk)add('slowapp',title);};
[EV,EV_EVE,EV_NIGHT,EV_HOL].forEach(a=>a.forEach(e=>one(e[2],e[8],e[6],e[9])));for(const k in SPEC_EV)SPEC_EV[k].forEach(e=>one(e[2],e[8],e[6],e[9]));for(const k in TPL)TPL[k].forEach(e=>one(e[0],'call',e[5]));
return Object.keys(PROC).map(k=>({k,dom:PROC[k].dom,tickets:tk[k]||[],steps:Object.keys(PROC[k]).filter(s=>s!=='dom'&&s!=='start').map(s=>({s,q:PROC[k][s].q,opts:PROC[k][s].opts.map(o=>({t:o[0],g:o[1],n:o[4]||''}))}))}));});
await b.close();
const tpl=fs.readFileSync(require('path').resolve(__dirname,'review-template.html'),'utf8');
fs.writeFileSync(process.argv[2],tpl.replace('/*DATA*/',JSON.stringify(data).replace(/</g,'\\u003c')));console.log(data.length,'menus');})();
