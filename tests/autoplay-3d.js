// 自動玩：每 300ms 看一次狀態，對話框選第一個「看起來合理」的選項、接電話、去做工單
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const combos=process.argv.slice(2).map(s=>s.split(':'));// role:shift:diff
for(const [role,shift,diff] of combos){const p=await b.newPage({viewport:{width:1280,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text().slice(0,160));});
 
 await p.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
 const fs=require('fs');let html=fs.readFileSync(require('path').resolve(__dirname,'../game/index.html'),'utf8');html=html.replace("renderer.render(scene,camera);\n // fps","/*norender*/\n // fps");
 html=html.replace("function toast(s){","function toast(s){(window.__toasts=window.__toasts||[]).push(Math.round(S?S.time:0)+':'+s);");
 await p.route('file:///home/claude/ap.html',r=>r.fulfill({body:html,contentType:'text/html'}));await p.goto('file:///home/claude/ap.html');await p.waitForTimeout(800);
 await p.click(`#roleSeg button[data-r=${role}]`);await p.click(`#diffSeg button:nth-child(${diff})`);const sb=await p.$(`#shiftSeg button[data-k=${shift}]:not([hidden])`);if(sb)await sb.click();
 await p.click('#next1');await p.waitForTimeout(150);await p.click('#go');await p.waitForTimeout(500);
 await p.evaluate(()=>{S.speed=8;});const t0=Date.now();let last=null,stuck=0,maxStuck=0,ticks=0,floors=new Set();const stalls=[];
 while(Date.now()-t0<300000){ticks++;
  const st=await p.evaluate(()=>{if(!S)return {gone:1};if(S.over)return {over:1};
   const d=document.getElementById('dlg');if(!d.hidden){const bs=[...document.querySelectorAll('#dlgBox button')].filter(b=>!b.disabled);if(bs.length){const pick=bs.find(b=>/★/.test(b.textContent))||bs[0];pick.click();}return {dlg:1,t:S.time};}
   const P=S.player;if(!P.phone&&!P.guide&&!P.transit&&S.wc<=0){const r=ringing()[0];if(r&&!(roomAt(P)===OFFICE)){answerByPhone(r);}
    if(S.bladder>=95&&S.wc<=0&&!P.busy){/* 去廁所 */const wt=P.g==='f'?WCT_F:WCT;if(G(P.key)[P.y][P.x]===7)S.wc=5;else if(!moving(P))goTo(P,{b:P.b,f:P.f,x:wt[0],y:wt[1]});}
    else if(!P.busy&&!moving(P)){const t=visible().filter(t=>!t.assignee||t.assignee===P).sort((a,b)=>(a.kind==='prio'?0:1)-(b.kind==='prio'?0:1))[0];if(t){if(canWork(t,P))startWork(t,P);else goTo(P,siteOf(t));}}}
   return {t:Math.round(S.time),key:P.key,x:P.x,y:P.y,busy:!!P.busy,mv:moving(P),wait:!!(P.transit||P.phone||P.guide||S.wc>0||P.gown>0||S.meeting>0||S.eating||S.buying>0),open:visible().length};});
  if(st.over||st.gone){break;}
  if(st.key)floors.add(st.key);
  const sig=st.key+','+st.x+','+st.y+','+st.busy;if(sig===last&&!st.busy&&!st.dlg&&!st.wait&&st.open>0)stuck++;else{maxStuck=Math.max(maxStuck,stuck);stuck=0;}last=sig;
  if(stuck===8){const why=await p.evaluate(()=>{const P=S.player;const t=visible().filter(t=>!t.assignee||t.assignee===P)[0];const all=visible().map(t=>(t.assignee?t.assignee.name.slice(0,3):'-')+(t.title.slice(0,8)));return JSON.stringify({t:Math.round(S.time),at:P.key+' '+P.x+','+P.y,phone:P.phone,guide:!!P.guide,gown:P.gown,meet:S.meeting,wc:S.wc,eat:S.eating,buy:S.buying,steps:P.steps.length,path:P.path.length,cand:t?[t.title.slice(0,12),t.room.key,t.sx,t.sy,canWork(t,P),walk(t.room.key,t.sx,t.sy)]:null,open:all.slice(0,5),toast:(window.__toasts||[]).slice(-3)});});stalls.push(why);}
  await p.waitForTimeout(150);}
 const end=await p.evaluate(()=>({over:!!(S&&S.over),time:S?Math.round(S.time):-1,len:S?S.shift.len:-1,done:S?S.tasks.filter(t=>t.state==='done').length:0,total:S?S.tasks.length:0,endShown:!document.getElementById('end').hidden,grade:(document.getElementById('endBox').innerText.match(/[SABCD]\s*級|評分[^\n]*/)||[''])[0]}));
 console.log([role,shift,diff].join(':'),JSON.stringify(end),'floors',floors.size,'maxStuck',Math.max(maxStuck,stuck),'errs',JSON.stringify([...new Set(errs)].slice(0,6)));stalls.slice(0,4).forEach(x=>console.log('   stall',x));await p.close();}
await b.close();})();
