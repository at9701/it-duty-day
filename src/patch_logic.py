# 3D 版專用：把 24x11 的格子改成 36x16（兩端樓梯、電梯廳、男女廁、空橋在走廊兩端、房間 6 格深）
def patch(body):
    R=[]
    def rep(a,b,n=1):
        assert body.count(a)==n,(body.count(a),a[:80]); return body.replace(a,b)
    body=rep("const W=24,H=11,T=32;","const W=48,H=18,T=32;")
    body=rep("const ELEV=[5,7],STAIR=[18,7],WCT=[11,8];",
      "const ELEV=[22,16],STAIR=[3,15],STAIR_E=[44,15],WCT=[31,14],WCT_F=[36,14];const RH=8,WALLROW=9,SWALL=13;\n"
      "const CORE3=[{id:'stairW',x:1,w:3,door:3},{id:'lobby',x:20,w:8,door:null},{id:'wcM',x:30,w:4,door:32},{id:'wcF',x:35,w:3,door:36},{id:'stairE',x:44,w:3,door:46}];\n"
      "const RW={exec:0.55,vp:0.45,meet:0.6,boardroom:0.8,pr:0.7,hr:0.8,acct:0.8,ga:0.8,qa:0.7,sw:0.7,ic:0.7,nutrition:0.7,server:0.9,office:1.1,opd:1.6,er:1.4,lobby:1.4,ward:1.3,icu:1.2,or:1.2,lab:1.1,pharmacy:1.1,cath:1.0};// 房間寬度權重")
    s=body.index(" for(const key in bp.floors){const b=key[0],f=+key.slice(1);const grid=[];")
    e=body.index("  FLOORS[key]={key,b,f,rooms,grid};}")+len("  FLOORS[key]={key,b,f,rooms,grid};}")
    new=""" for(const key in bp.floors){const b=key[0],f=+key.slice(1);const grid=[];for(let y=0;y<H;y++){grid[y]=[];for(let x=0;x<W;x++)grid[y][x]=(x==0||y==0||x==W-1||y==H-1||y==WALLROW||y>=SWALL)?1:0;}
  const specs=bp.floors[key];const n=specs.length;const avail=W-2-(n-1);const bases=specs.map(sp=>{const tok=sp.split(':')[0];let bb=tok.replace(/\\d+$/,'');return UNIT[bb]?bb:tok;});const wts=bases.map(bb=>RW[bb]||1);const tw=wts.reduce((a,c)=>a+c,0);const ws=wts.map(wt=>Math.max(4,Math.floor(avail*wt/tw)));let rest=avail-ws.reduce((a,c)=>a+c,0);while(rest>0){ws[wts.indexOf(Math.max(...wts))]++;rest--;}const xs=[];let xx0=1;ws.forEach(ww=>{xs.push(xx0);xx0+=ww+1;});
  const rooms=specs.map((sp,i)=>{let [tok,name]=sp.split(':');let base=tok.replace(/\\d+$/,'');if(!UNIT[base])base=tok;let id=tok;if(!FIXED_IDS.has(tok)||ROOMS[tok]){id=tok+'_'+b+f;}
   const x=xs[i],w=ws[i];const r={id,base,name:name||UNIT[base][0],b,f,key,x,y:1,w,h:RH,c:UNIT[base][1],door:[x+Math.floor(w/2),WALLROW]};ROOMS[id]=r;
   for(let yy=0;yy<=WALLROW;yy++)for(let xx=x-1;xx<=x+w;xx++){if(xx<0||xx>=W)continue;const inside=xx>=x&&xx<x+w&&yy>=1&&yy<=RH;grid[yy][xx]=inside?2:1;}
   grid[WALLROW][r.door[0]]=3;if((base==='icu'||base==='or')&&r.door[0]+1<x+w){grid[WALLROW][r.door[0]+1]=3;r.wide=true;}if(['opd','er','lobby','reg','cashier','cafe','seven','buffet','bento','noodle','tea','xray','ct','mri','report'].includes(base)||base==='ward'||(n===1&&['er','xray','ct','mri','nuc','endo','cath','lab','pharmacy','dialysis','rehab','lobby','reg','cashier','report'].includes(base))){r.noWall=true;for(let xx=x;xx<x+w;xx++)grid[WALLROW][xx]=0;}return r;});
  CORE3.forEach(c=>{for(let yy=SWALL+1;yy<H-1;yy++)for(let xx=c.x;xx<c.x+c.w;xx++)grid[yy][xx]=0;if(c.door!==null)grid[SWALL][c.door]=3;else for(let xx=c.x;xx<c.x+c.w;xx++)grid[SWALL][xx]=0;});
  [[21,16],[22,16],[25,16],[26,16]].forEach(([x,y])=>grid[y][x]=4);[[3,15],[3,16],[44,15],[44,16]].forEach(([x,y])=>grid[y][x]=5);
  for(let yy=SWALL+1;yy<H-1;yy++){for(let xx=30;xx<=33;xx++)grid[yy][xx]=7;for(let xx=35;xx<=37;xx++)grid[yy][xx]=7;}
  const bi=BORD.indexOf(b);if(f>=1&&f<=2){for(let yy=WALLROW+1;yy<SWALL;yy++){if(bi<BORD.length-1)grid[yy][W-1]=6;if(bi>0)grid[yy][0]=6;}}
  FLOORS[key]={key,b,f,rooms,grid};}"""
    body=body[:s]+new+body[e:]
    # 最近的樓梯
    body=rep("function vertical(steps,cur,f2){if(cur.f===f2)return cur;",
             "function vertical(steps,cur,f2){if(cur.f===f2)return cur;const ST=(cur.x!==undefined&&cur.x>W/2)?STAIR_E:STAIR;")
    body=rep("steps.push({type:'walk',x:STAIR[0],y:STAIR[1]});steps.push({type:'transit',dur:df*1,label:'走樓梯 '+FL(cur.f)+' → '+FL(f2),to:{b:cur.b,f:f2,x:STAIR[0],y:STAIR[1]}});",
             "steps.push({type:'walk',x:ST[0],y:ST[1]});steps.push({type:'transit',dur:df*1,label:'走樓梯 '+FL(cur.f)+' → '+FL(f2),to:{b:cur.b,f:f2,x:ST[0],y:ST[1]}});")
    body=rep("return {b:cur.b,f:f2,x:0,y:0};}","return {b:cur.b,f:f2,x:cur.x,y:0};}")
    body=rep("function route(from,to){const steps=[];let cur={b:from.b,f:from.f};","function route(from,to){const steps=[];let cur={b:from.b,f:from.f,x:from.x};")
    body=rep("steps.push({type:'walk',x:ex,y:7});steps.push({type:'transit',dur:4,label:'連通道 → '+BLD[nb].slice(0,2),to:{b:nb,f:cur.f,x:en,y:7}});cur={b:nb,f:cur.f};",
             "steps.push({type:'walk',x:ex,y:11});steps.push({type:'transit',dur:4,label:'連通道 → '+BLD[nb].slice(0,2),to:{b:nb,f:cur.f,x:en,y:11}});cur={b:nb,f:cur.f,x:en};")
    body=rep("function goTo(a,loc){if(a.busy)cancelBusy(a);const here={b:a.b,f:a.f};","function goTo(a,loc){if(a.busy)cancelBusy(a);const here={b:a.b,f:a.f,x:a.x};")
    body=rep("const to=mode==='elev'?ELEV:STAIR;","const to=mode==='elev'?ELEV:(S.player.x>W/2?STAIR_E:STAIR);")
    # 廁所分男女
    body=rep("goTo(P,{b:P.b,f:P.f,x:WCT[0],y:WCT[1]});","{const wt=P.g==='f'?WCT_F:WCT;goTo(P,{b:P.b,f:P.f,x:wt[0],y:wt[1]});}")
    # 事件點與 NPC 只出現在前後走道（row 2 / row 5），中間留給島式家具
    body=body.replace("sy:room.y+1+Math.floor(rnd()*(room.h-2))","sy:room.y+(rnd()<0.5?1:room.h-2)")
    body=rep("const x=r.x+1+Math.floor(rnd()*(r.w-2)),y=r.y+1+Math.floor(rnd()*(r.h-2));","const x=r.x+1+Math.floor(rnd()*(r.w-2)),y=r.y+(rnd()<0.5?1:r.h-2);")
    body=rep("const tx=r.x+1+Math.floor(rnd()*(r.w-2)),ty=r.y+1+Math.floor(rnd()*(r.h-2));","const tx=r.x+1+Math.floor(rnd()*(r.w-2)),ty=r.y+(rnd()<0.5?1:r.h-2);")
    body=body.replace("OFFICE.y+2","OFFICE.y+1").replace("SERVER.y+2","SERVER.y+1")
    # 門診：每間診間一個醫師一個護理師，候診區幾個病人；NPC 有 home 就只在 home 裡晃
    body=rep(" for(let i=0;i<n;i++){const role=roles[i];const lk=ROLE_LOOK[role]||ROLE_LOOK.clerk;const o={};randomLook(o);const look={...o.look,shirt:lk.shirt,coat:lk.coat,cap:lk.cap,hat:false};\n  const x=r.x+1+Math.floor(rnd()*(r.w-2)),y=r.y+(rnd()<0.5?1:r.h-2);",
      " const plan=[];if(r.base==='opd'){const k=Math.floor((r.w+1)/5);for(let i=0;i<k;i++){plan.push(['doctor',r.x+i*5,r.y+1,{x:r.x+i*5,y:r.y+1,w:4,h:2}]);plan.push(['nurse',r.x+i*5+1,r.y+2,{x:r.x+i*5,y:r.y+1,w:4,h:2}]);}for(let i=0;i<Math.min(4,k);i++)plan.push(['patient',r.x+1+i*3,r.y+6,{x:r.x+1,y:r.y+5,w:r.w-2,h:2}]);}\n  else if(r.base==='ward'||r.base==='icu'){const k=Math.floor((r.w+1)/4);for(let i=0;i<Math.min(k,3);i++)plan.push(['patient',r.x+i*4+1,r.y+1,{x:r.x+i*4,y:r.y+1,w:3,h:2}]);plan.push(['nurse',r.x+1,r.y+6,{x:r.x,y:r.y+4,w:r.w,h:3}]);plan.push(['nurse',r.x+3,r.y+6,{x:r.x,y:r.y+4,w:r.w,h:3}]);plan.push(['doctor',r.x+5,r.y+5,{x:r.x,y:r.y+4,w:r.w,h:3}]);}\n for(let i=0;i<(plan.length||n);i++){const role=plan.length?plan[i][0]:roles[i];const lk=ROLE_LOOK[role]||ROLE_LOOK.clerk;const o={};randomLook(o);const look={...o.look,shirt:lk.shirt,coat:lk.coat,cap:lk.cap,hat:false};\n  const x=plan.length?plan[i][1]:r.x+1+Math.floor(rnd()*(r.w-2)),y=plan.length?plan[i][2]:r.y+(rnd()<0.5?1:r.h-2);const home=plan.length?plan[i][3]:null;")
    body=rep("F.npcs.push({npc:true,role,room:r,b:F.b,f:F.f,key:F.key,x,y,px:0,py:0,","F.npcs.push({npc:true,role,home,room:r,b:F.b,f:F.f,key:F.key,x,y,px:0,py:0,")
    body=rep(" const r=a.room;const tx=r.x+1+Math.floor(rnd()*(r.w-2)),ty=r.y+(rnd()<0.5?1:r.h-2);const p=bfs(a.key,a.x,a.y,tx,ty);",
      " const r=a.room;let tx,ty;if(a.home){tx=a.home.x+Math.floor(rnd()*a.home.w);ty=a.home.y+Math.floor(rnd()*a.home.h);}else{tx=r.x+1+Math.floor(rnd()*(r.w-2));ty=r.y+(rnd()<0.5?1:r.h-2);}const p=bfs(a.key,a.x,a.y,tx,ty);")
    body=rep("if(rr&&rr.base==='or'&&!a._gowned){a._gowned=rr;a.gown=8;toast('進開刀房要換無菌衣、戴帽子口罩：8 分鐘');}",
      "if(rr&&(rr.base==='or'||rr.base==='icu')&&!a._gowned){a._gowned=rr;a.gown=rr.base==='or'?8:4;toast(rr.base==='or'?'進開刀房要換無菌衣、戴帽子口罩：8 分鐘':'進加護病房要穿隔離衣、洗手：4 分鐘');}")

    # 3D 地圖長寬都是 2D 的兩倍：每格走快一倍，走同一段路花的遊戲時間跟 2D 一樣
    body=rep("function stepActor(a,dt){if(a.transit)return;const SPD=(a.spd||5)*0.55*S.speed;","function stepActor(a,dt){if(a.transit)return;const SPD=(a.spd||5)*0.55*S.speed*2;")
    body=rep("m+=Math.abs(st.x-P.x)/4;","m+=Math.abs(st.x-P.x)/8;")

    # 檢討單用：每一個做法選擇都記下來（不只選錯的）
    body=rep("bt.onclick=()=>{S.procN++;let extra=0;","bt.onclick=()=>{S.procN++;{const bo=st.opts.find(x=>x[1]===1)||['','','','',''];(S.decisions=S.decisions||[]).push({tm:S.time,room:locName(t.room),title:t.title,q:st.q.replace(/\\{room\\}/g,t.room.name),txt,o,note,best:bo[0],bestNote:bo[4]});}let extra=0;")
    body=body.replace('background:#3a1520','background:#fff1ef')  # 3D 版是亮色介面
    return body
