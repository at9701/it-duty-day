const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1280,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('https://cdnjs.cloudflare.com/**',r=>r.fulfill({path:'/tmp/claude-0/-home-claude/87ab8a7b-6576-53a8-a11f-be9c0a9807a7/scratchpad/three.min.js',contentType:'application/javascript'}));
await p.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
await p.goto('file://'+require('path').resolve(__dirname,'../game/index.html'));await p.waitForTimeout(1000);
await p.click('#diffSeg button:nth-child(4)');await p.click('#next1');await p.waitForTimeout(200);await p.click('#go');await p.waitForTimeout(800);
const keys=await p.evaluate(()=>Object.keys(FLOORS));const shots=process.argv.slice(2);
for(const k of keys){await p.evaluate(k=>{S.view=k;},k);await p.waitForTimeout(350);
 const rep=await p.evaluate(k=>{const F=FLOORS[k];const out=[];F.rooms.forEach(r=>{let pockets=0,sites=0;for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){if(!walk(k,x,y))continue;if((y===r.y+1||y===r.y+r.h-2)){sites++;}if(!bfs(k,r.door[0],r.y+r.h-1,x,y))pockets++;}
  const npcBad=F.npcs.filter(a=>a.room===r&&!bfs(k,r.door[0],r.y+r.h-1,a.x,a.y)).length;const tBad=S.tasks.filter(t=>t.room===r&&!bfs(k,r.door[0],r.y+r.h-1,t.sx,t.sy)).length;if(pockets||npcBad||tBad)out.push(r.base+'('+r.name+') pockets='+pockets+' npcBad='+npcBad+' taskBad='+tBad);});return out;},k);
 if(rep.length)console.log(k,rep.join(' | '));
 if(shots.includes(k))await p.screenshot({path:`f_${k}.png`});}
console.log('errors',errs.slice(0,5));await b.close();})();
