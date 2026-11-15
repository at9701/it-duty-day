// 3D 職訓中心：中庭周圍九間主題實習教室，後面是還沒開的進階專科大樓。WASD／方向鍵或點地板走路，靠近師傅或傳送點按 E 說話。
window.initVillage3D=function(api){
 const host=document.getElementById('stage');host.className='v3d';
 host.innerHTML='<span class="how">WASD／方向鍵或點地板走路，靠近師傅或傳送點按 E</span><button class="btn tip" id="v3tip" hidden></button>';
 const tip=document.getElementById('v3tip');
 let R;try{R=new THREE.WebGLRenderer({antialias:true});}catch(e){host.className='';host.innerHTML='<p class="lead">這台電腦開不了 3D，請改用 2D 版。</p>';return;}
 R.setPixelRatio(Math.min(devicePixelRatio||1,1.5));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
 host.insertBefore(R.domElement,host.firstChild);
 const sc=new THREE.Scene();sc.background=new THREE.Color(0x0e1626);sc.fog=new THREE.Fog(0x0e1626,48,100);
 const cam=new THREE.PerspectiveCamera(36,16/9,.5,200);
 sc.add(new THREE.HemisphereLight(0xcfe6ff,0x1a2740,.78));
 const sun=new THREE.DirectionalLight(0xdfeaff,.6);sun.position.set(14,30,16);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 const s=sun.shadow.camera;s.left=-30;s.right=30;s.top=30;s.bottom=-30;s.far=90;sc.add(sun);
 const mats={};const M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
 const add=(g,m,x,y,z,p)=>{const o=new THREE.Mesh(g,typeof m==='object'?m:M(m));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(p||sc).add(o);return o;};
 const box=(w,h,d,c,x,y,z,p)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
 const cyl=(r1,r2,h,c,x,y,z,p,n)=>add(new THREE.CylinderGeometry(r1,r2,h,n||16),c,x,y,z,p);
 const sph=(r,c,x,y,z,p)=>add(new THREE.SphereGeometry(r,16,12),c,x,y,z,p);
 const flat=(g,c,y)=>{const o=new THREE.Mesh(g,M(c));o.rotation.x=-Math.PI/2;o.position.y=y;o.receiveShadow=true;sc.add(o);return o;};
 // 文字牌：永遠面向鏡頭，深色半透明底、亮色邊框
 function label(lines,bg,fg,w){const cv=document.createElement('canvas');cv.width=512;cv.height=lines.length>1?176:112;const x=cv.getContext('2d');const holo=bg==='#ffffff';
  const r=22,rr=()=>{x.beginPath();x.moveTo(r+6,6);x.arcTo(506,6,506,cv.height-6,r);x.arcTo(506,cv.height-6,6,cv.height-6,r);x.arcTo(6,cv.height-6,6,6,r);x.arcTo(6,6,506,6,r);x.closePath();};
  rr();x.fillStyle=holo?'rgba(10,22,40,.86)':bg;x.fill();if(holo){x.lineWidth=5;x.strokeStyle='#39d6ff';x.stroke();}
  x.fillStyle=holo?'#eaf8ff':fg;x.textAlign='center';x.textBaseline='middle';
  const fit=(t,wt,px)=>{do{x.font=wt+' '+px+'px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';px-=2;}while(x.measureText(t).width>476&&px>18);};
  if(lines.length>1){fit(lines[0],700,64);x.fillText(lines[0],256,62);x.fillStyle=holo?'#7fdcff':fg;fit(lines[1],400,42);x.fillText(lines[1],256,130);}
  else{x.font='700 60px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';x.fillText(lines[0],256,58);}
  const t=new THREE.CanvasTexture(cv);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false}));sp.scale.set(w,w*cv.height/512,1);return sp;}
 // 地面：深色機房地板、發光的線路
 const anim=[];const B=c=>new THREE.MeshBasicMaterial({color:c});const CY=0x39d6ff;
 const glow=(g,y)=>{const o=new THREE.Mesh(g,B(CY));o.rotation.x=-Math.PI/2;o.position.y=y;sc.add(o);return o;};
 flat(new THREE.CircleGeometry(95,48),0x172335,0);{const gr=new THREE.GridHelper(190,95,0x24405c,0x1f3147);gr.position.y=.012;sc.add(gr);}
 flat(new THREE.RingGeometry(10.4,12.6,64),0x24344a,.02);glow(new THREE.RingGeometry(10.32,10.42,64),.03);glow(new THREE.RingGeometry(12.58,12.68,64),.03);
 flat(new THREE.CircleGeometry(6.2,40),0x2b3d55,.03);glow(new THREE.RingGeometry(6.15,6.3,48),.035);
 const N=api.courses.length,RS=16.4,blocks=[],AN=i=>Math.PI-(i-(N-1)/2)*.41;
 // 線路：從中庭連到每間教室和大門，上面有光點在跑
 const trace=(a,r0,r1,col,k)=>{const len=r1-r0,p=new THREE.Mesh(new THREE.PlaneGeometry(1.8,len),M(0x24344a));p.rotation.x=-Math.PI/2;p.rotation.z=-a;p.position.set(Math.sin(a)*(r0+len/2),.02,Math.cos(a)*(r0+len/2));p.receiveShadow=true;sc.add(p);
  [-.82,.82].forEach(o=>{const e=new THREE.Mesh(new THREE.PlaneGeometry(.07,len),B(col));e.rotation.x=-Math.PI/2;e.rotation.z=-a;e.position.set(Math.sin(a)*(r0+len/2)+Math.cos(a)*o,.03,Math.cos(a)*(r0+len/2)-Math.sin(a)*o);sc.add(e);});
  for(let j=0;j<1;j++){const d=new THREE.Mesh(new THREE.BoxGeometry(.22,.06,.5),B(col));d.rotation.y=a;sc.add(d);anim.push(t=>{const u=(t*.22+j*.5+k*.13)%1,r=r1-u*len;d.position.set(Math.sin(a)*r,.07,Math.cos(a)*r);});}};
 api.courses.forEach((c,i)=>trace(AN(i),6.3,14,new THREE.Color(c.rc).getHex(),i));trace(0,12.6,23,CY,3);
 // 中庭：會轉的全像核心
 cyl(2.6,2.8,.4,0x33465f,0,.2,0,null,24);cyl(2.2,2.2,.06,B(0x10283c),0,.42,0,null,24);cyl(.5,.7,.5,0x33465f,0,.65,0,null,12);
 {const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,1),new THREE.MeshBasicMaterial({color:CY,wireframe:true}));core.position.y=2.5;sc.add(core);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(.6,0),new THREE.MeshBasicMaterial({color:0x8ff0ff,transparent:true,opacity:.55}));inner.position.y=2.5;sc.add(inner);
  const rings=[0,1,2].map(k=>{const r=new THREE.Mesh(new THREE.TorusGeometry(1.6+k*.28,.025,6,48),B(k===1?0x4fe08a:CY));r.position.y=2.5;sc.add(r);return r;});
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.9,2.1,1.9,24,1,true),new THREE.MeshBasicMaterial({color:CY,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));beam.position.y=1.4;sc.add(beam);
  const pl=new THREE.PointLight(CY,.9,16);pl.position.y=3;sc.add(pl);
  anim.push(t=>{core.rotation.set(t*.3,t*.5,0);inner.rotation.set(-t*.6,t*.4,0);rings.forEach((r,k)=>r.rotation.set(Math.PI/2+Math.sin(t*.7+k*2)*.5,t*(.4+k*.2),0));core.position.y=inner.position.y=2.5+Math.sin(t*1.5)*.12;});}
 blocks.push([0,0,2.9]);
 const hall=label(['中庭'],'#ffffff','#1c2a36',2.4);hall.position.set(0,4.7,0);sc.add(hall);
 // 人
 function person(shirt,hair,skin){const g=new THREE.Group();const L=[box(.2,.62,.22,0x3a4656,-.13,.31,0,g),box(.2,.62,.22,0x3a4656,.13,.31,0,g)];
  cyl(.3,.34,.74,shirt,0,.98,0,g);const A=[box(.14,.58,.16,shirt,-.4,1,0,g),box(.14,.58,.16,shirt,.4,1,0,g)];
  sph(.3,skin||0xf2c9a4,0,1.64,0,g);const h=sph(.315,hair,0,1.7,-.04,g);h.scale.set(1,.82,1);
  sph(.04,0x1c2a36,-.11,1.66,.27,g);sph(.04,0x1c2a36,.11,1.66,.27,g);g.userData={L,A};sc.add(g);return g;}
 // 攤位
 // 九間實習教室：沒有屋頂和前牆，從鏡頭看得到裡面。每間的擺設照課程主題
 const WD=0xb98a56,DK=0x26313c,GY=0x8b8f97,WH=0xf4f1ea;
 const scr=(g,x,y,z,w,h,c,ry)=>{const o=add(new THREE.BoxGeometry(w,h,.05),B(c),x,y,z,g);o.castShadow=false;if(ry)o.rotation.y=ry;return o;};
 const mon=(g,x,y,z,c,ry)=>{const m=new THREE.Group();m.position.set(x,y,z);if(ry)m.rotation.y=ry;g.add(m);box(.62,.44,.06,DK,0,.34,0,m);scr(m,0,.34,.035,.54,.36,c);box(.08,.14,.06,DK,0,.07,0,m);box(.3,.03,.2,DK,0,.015,0,m);return m;};
 const desk=(g,x,z,w,d)=>{box(w,.07,d,0xe9d7b4,x,.78,z,g);box(w-.1,.7,.06,WD,x,.4,z-d/2+.05,g);box(.06,.75,d-.1,WD,x-w/2+.05,.38,z,g);box(.06,.75,d-.1,WD,x+w/2-.05,.38,z,g);};
 const PROPS={
  hw(g){desk(g,.7,-1.1,2.6,.9);box(.45,.8,.85,0x4b5059,1.5,1.22,-1.1,g);box(.02,.6,.6,B(0x2f9e7a),1.27,1.22,-1.1,g);box(.5,.06,.4,0x2f9e7a,.5,.85,-1.05,g);box(.3,.05,.12,0x3b6fd0,.05,.85,-.95,g);box(.35,.22,.22,0xd6453d,-.4,.93,-1.1,g);
   [[-1.7,-1.2,.2],[-1.6,-1.15,-.15],[-1.65,-1.2,.1]].forEach((q,k)=>{box(.7,.5,.6,k%2?0xd8d3c4:0xc9c3b4,q[0],.35+k*.5,q[1],g).rotation.y=q[2];});
   box(1.6,.06,.3,WD,.7,2.05,-1.6,g);[0x3b6fd0,0xc9860c,0x2f9e7a,0xd6453d].forEach((c,k)=>box(.25,.3,.22,c,.1+k*.4,2.23,-1.6,g));},
  os(g){for(let r=0;r<2;r++)for(let k=0;k<3;k++){const x=-.5+k*1.05,z=-1.15+r*1.25;desk(g,x,z,.9,.55);const m=mon(g,x,.82,z-.05,(r+k)%3===1?0x16212b:0x2a7fd4);if((r+k)%3===1){const ln=scr(m,-.12,.42,.04,.22,.03,0x4fe08a);anim.push(t=>{ln.visible=(t*2+k)%1<.6;});}box(.34,.06,.34,0x5b6672,x,.45,z+.5,g);}
   box(2.6,1.1,.05,WH,.55,1.9,-1.7,g);box(2.7,1.2,.03,GY,.55,1.9,-1.72,g);},
  net(g){[.6,1.65].forEach((x,r)=>{box(.95,2.3,.9,DK,x,1.25,-1.2,g);for(let k=0;k<7;k++){box(.8,.06,.02,0x5b6672,x,.45+k*.28,-.74,g);for(let j=0;j<4;j++){const d=scr(g,x-.3+j*.2,.53+k*.28,-.74,.06,.06,(j+k)%3?0x4fe08a:0xf2c14e);anim.push(t=>{d.visible=Math.sin(t*(4+j+k*.7)+r*2+j)>-.3;});}}});
   [[0x3b6fd0,2.5],[0xf2c14e,2.6],[0xd6453d,2.7]].forEach(q=>box(3.6,.05,.05,q[0],0,q[1],-1.68,g));box(.05,1.2,.05,0x3b6fd0,.1,2,-1.68,g);
   cyl(.06,.06,3.2,GY,-1.9,1.7,-1.4,g,8);const dish=new THREE.Group();dish.position.set(-1.9,3.3,-1.4);g.add(dish);const dd=cyl(.5,.12,.22,WH,0,0,.2,dish,16);dd.rotation.x=Math.PI/2;anim.push(t=>{dish.rotation.y=t*.8;});
   box(.5,.3,.4,0x5b6672,-1.2,.25,-1.3,g);box(.6,.3,.4,0x5b6672,-1.1,.55,-1.25,g);},
  sec(g){for(let r=0;r<2;r++)for(let k=0;k<3;k++){box(.92,.62,.08,DK,-.3+k*1,1.35+r*.72,-1.68,g);const s=scr(g,-.3+k*1,1.35+r*.72,-1.63,.82,.52,r===1&&k===1?0xd6453d:[0x1f4f7a,0x24634f,0x2a3f6a][k]);if(r===1&&k===1)anim.push(t=>{s.visible=t%1.2<.8;});}
   desk(g,.7,-.9,2.4,.6);mon(g,.2,.82,-.95,0x1f4f7a);mon(g,1.2,.82,-.95,0x24634f);
   box(.25,1,.25,0xf2c14e,-2,.6,1.3,g);const arm=new THREE.Group();arm.position.set(-2,1,1.3);g.add(arm);for(let k=0;k<5;k++)box(.44,.1,.1,k%2?0xd6453d:WH,.3+k*.44,0,0,arm);anim.push(t=>{arm.rotation.z=(Math.sin(t*.8)*.5+.5)*1.1;});
   const sh=cyl(.55,.55,.1,0xd6453d,1.9,1.3,1.2,g,6);sh.rotation.x=Math.PI/2;const s2=cyl(.36,.36,.12,WH,1.9,1.3,1.2,g,6);s2.rotation.x=Math.PI/2;cyl(.05,.05,.8,GY,1.9,.5,1.2,g,8);
   box(.2,.14,.3,DK,-2.1,2.6,-1.5,g).rotation.y=-.6;},
  db(g){[[-.2,0x8a5cc2],[1,0x6f46a8],[2.1,0xa884d6]].forEach((q,i)=>{for(let k=0;k<3+(i===1);k++){cyl(.5,.5,.36,q[1],q[0]-.4,.3+k*.46,-1.1,g,20);cyl(.52,.52,.05,0xe7dcf5,q[0]-.4,.5+k*.46,-1.1,g,20);}});
   for(let k=0;k<3;k++){box(.6,1.5,.6,0x9aa3ad,-1.9,.85,-1.3+k*.65,g);for(let j=0;j<3;j++){box(.04,.4,.5,0xb9c1ca,-1.59,.4+j*.48,-1.3+k*.65,g);box(.05,.05,.16,DK,-1.56,.45+j*.48,-1.3+k*.65,g);}}
   const cube=box(.34,.34,.34,B(0xd9c6f2),.6,2.6,-1.1,g);cube.castShadow=false;anim.push(t=>{cube.rotation.set(t,t*1.3,0);cube.position.y=2.6+Math.sin(t*2)*.12;});},
  code(g){box(2.4,1.3,.05,WH,.5,1.8,-1.7,g);box(2.5,1.4,.03,GY,.5,1.8,-1.72,g);[[0x3b6fd0,.5,2.2,1.2],[0xd6453d,.2,1.95,.9],[0x2f9e7a,.6,1.7,1.5],[0x26313c,.1,1.45,.7]].forEach(q=>scr(g,q[1],q[2],-1.66,q[3],.06,q[0]));
   desk(g,.9,-.6,2,.7);mon(g,.5,.82,-.7,0x16212b,.2);mon(g,1.3,.82,-.7,0x16212b,-.2);cyl(.08,.07,.16,WH,1.75,.9,-.45,g,10);box(.5,.03,.18,DK,.9,.83,-.4,g);
   const bb=sph(.55,0xf08a3c,-1.6,.35,-.9,g);bb.scale.set(1.1,.7,1.1);sph(.38,0xf08a3c,-1.6,.75,-1.25,g).scale.set(1,.9,.6);
   cyl(.2,.16,.36,0xc97b4a,2,.28,-1.4,g,10);sph(.36,0x4f9a57,2,.75,-1.4,g);sph(.22,0x63ad66,1.85,1.05,-1.4,g);
   const cur=scr(g,.42,1.2,-.62,.05,.09,0x4fe08a);anim.push(t=>{cur.visible=t%1<.5;});},
  trouble(g){desk(g,.8,-1,2.2,.8);box(.45,.8,.8,0x4b5059,1.5,1.22,-1,g);mon(g,.5,.82,-1.05,0x2a55c8);scr(g,.5,1.2,-1.01,.2,.04,WH);
   for(let k=0;k<4;k++){const s=sph(.16,0x8f959c,0,0,0,g);s.castShadow=false;anim.push(t=>{const u=(t*.5+k/4)%1;s.position.set(1.5+Math.sin(u*6+k)*.12,1.7+u*1.3,-1);s.scale.setScalar(.6+u);});}
   const q=label(['？'],'#c9860c','#ffffff',.9);q.scale.set(.8,.8,1);q.position.set(.5,2.2,-1);g.add(q);anim.push(t=>{q.position.y=2.2+Math.sin(t*2.5)*.1;});
   box(1.5,1.2,.06,0xcdb88f,-1.4,1.7,-1.7,g);[[-1.8,2,0xd6453d],[-1.3,1.9,0x3b6fd0],[-1.6,1.45,0x2f9e7a],[-1,1.55,0xf2c14e]].forEach(q=>scr(g,q[0],q[1],-1.66,.3,.3,q[2]));
   box(.6,.3,.35,0xd6453d,-1.6,.25,-1.1,g);box(.08,.1,.3,DK,-1.6,.45,-1.1,g);box(.34,.06,.34,0x5b6672,.6,.45,-.2,g);},
  svc(g){box(3.2,1,.6,0xd0568a,.3,.6,-.6,g);box(3.3,.07,.72,WH,.3,1.13,-.6,g);box(.24,.1,.3,0xd6453d,1.3,1.21,-.6,g);mon(g,-.3,1.16,-.65,0x2a7fd4);cyl(.07,.07,.1,0xf2c14e,.5,1.2,-.5,g,10);
   const n=label(['服務中'],'#17a07a','#ffffff',1.5);n.position.set(.3,2.5,-1.6);g.add(n);
   for(let k=0;k<3;k++){box(.5,.08,.5,0x3b6fd0,1.2+k*.0-0+k*.62-.6,.45,1.1,g);box(.5,.5,.07,0x3b6fd0,.6+k*.62,.72,1.33,g);box(.06,.42,.06,GY,.6+k*.62,.22,1.1,g);}
   cyl(.2,.16,.36,0xc97b4a,-2,.28,-1.4,g,10);sph(.4,0x4f9a57,-2,.8,-1.4,g);
   const bub=label(['…'],'#ffffff','#1c2a36',.8);bub.position.set(-1.2,2.5,.9);g.add(bub);anim.push(t=>{bub.material.opacity=.5+Math.sin(t*3)*.5;});bub.material.transparent=true;},
  gov(g){box(2.2,2.3,.45,WD,.9,1.25,-1.5,g);for(let r=0;r<4;r++){box(2.05,.05,.42,0x8a623c,.9,.42+r*.52,-1.48,g);for(let k=0;k<9;k++)box(.16,.34+((k*7+r*3)%4)*.03,.3,[0x8a8f3c,0xd6453d,0x3b6fd0,0x2f9e7a,0xc9860c][(k+r)%5],.02+k*.21,.62+r*.52,-1.42,g);}
   box(1.4,1.1,.06,0xc99b6a,-1.4,1.7,-1.7,g);[[-1.8,1.95],[-1.35,1.9],[-1,1.95],[-1.7,1.45],[-1.2,1.4]].forEach(q=>scr(g,q[0],q[1],-1.66,.32,.4,WH));
   desk(g,-.9,-.3,1.5,.7);cyl(.14,.2,.06,0xc9a23c,-.9,.84,-.3,g,12);cyl(.03,.03,.7,0xc9a23c,-.9,1.2,-.3,g,8);const bm=new THREE.Group();bm.position.set(-.9,1.55,-.3);g.add(bm);box(1,.04,.04,0xc9a23c,0,0,0,bm);[-.48,.48].forEach(x=>{cyl(.18,.12,.05,0xc9a23c,x,-.3,0,bm,12);box(.015,.3,.015,0xc9a23c,x,-.15,0,bm);});anim.push(t=>{bm.rotation.z=Math.sin(t*1.2)*.12;});}
 };
 const HAIR=[0x4a3526,0x2b2b33,0x6b4a2a,0x1f1f24,0x9a9a9a,0x3a2a55,0x55402c,0x7a3b2a,0x6a6a6a];
 const stalls=api.courses.map((c,i)=>{const a=AN(i),x=Math.sin(a)*RS,z=Math.cos(a)*RS,g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=a+Math.PI;sc.add(g);
  const rcH=new THREE.Color(c.rc).getHex();box(5,.12,4,0x2a3a50,0,.06,0,g);box(4.6,.02,3.6,c.col,0,.13,0,g);[[0,1.97,5,.06],[0,-1.97,5,.06],[-2.47,0,.06,4],[2.47,0,.06,4]].forEach(q=>{const e=box(q[2],.03,q[3],B(rcH),q[0],.135,q[1],g);e.castShadow=false;});
  box(5,3,.16,0x33455c,0,1.56,-1.9,g);box(4.7,2.5,.04,0xe9eef3,0,1.45,-1.8,g);{const e=box(5,.12,.2,B(rcH),0,3.1,-1.9,g);e.castShadow=false;}box(.16,1.15,4,0x33455c,-2.5,.63,0,g);box(.16,1.15,4,0x33455c,2.5,.63,0,g);[-2.5,2.5].forEach(x=>{const e=box(.2,.06,4,B(rcH),x,1.23,0,g);e.castShadow=false;});
  [-2.5,2.5].forEach(x=>{cyl(.09,.09,3.2,0x4b5d75,x,1.6,1.95,g,8);const tip=sph(.14,B(rcH),x,3.25,1.95,g);tip.castShadow=false;});
  (PROPS[c.id]||(()=>{}))(g);
  const m=person(c.rc,HAIR[i%HAIR.length]);sc.remove(m);m.position.set(-.2,.12,.9);g.add(m);
  const sign=label([c.npc,c.name],'#ffffff','#1c2a36',4.3);sign.position.set(x,4.9,z);sc.add(sign);
  blocks.push([x,z,2.5]);blocks.push([x+Math.sin(a)*1.6,z+Math.cos(a)*1.6,2.4]);return {c,x,z,a,m,mk:null,fx:Math.sin(a)*(RS-3.6),fz:Math.cos(a)*(RS-3.6)};});
 // 外圍：光柵圍欄、進階專科大樓、大門、資料柱
 const RF=24.5;
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2;if(Math.abs(a-Math.PI)<.8||a<.13||a>Math.PI*2-.13)continue;cyl(.12,.14,1.3,0x3a4c64,Math.sin(a)*RF,.65,Math.cos(a)*RF,null,6);const tp=box(.16,.1,.16,B(CY),Math.sin(a)*RF,1.34,Math.cos(a)*RF);tp.castShadow=false;
  const r=new THREE.Mesh(new THREE.BoxGeometry(2.35,.05,.03),new THREE.MeshBasicMaterial({color:CY,transparent:true,opacity:.55}));r.position.set(Math.sin(a+.049)*RF,.9,Math.cos(a+.049)*RF);r.rotation.y=a+.049;sc.add(r);}
 box(34,9,5,0x1c2b40,0,4.5,-25.5);box(34.4,.3,5.4,0x4b5d75,0,9.1,-25.5);{const e=box(34.4,.1,.1,B(CY),0,9.3,-22.85);e.castShadow=false;}
 const wins=[];for(let r=0;r<3;r++)for(let k=0;k<14;k++){if(r===0&&(k===6||k===7))continue;const on=(k*5+r*3)%7;wins.push(scr(sc,-15.6+k*2.4,2+r*2.5,-22.97,1.7,1.5,on<2?0x16283c:on<5?0x2f86b8:0x39d6ff));}
 anim.push(t=>{const k=Math.floor(t*1.5)%wins.length;wins[k].visible=Math.sin(t*9)>-.6;});
 box(3.8,3.3,.2,0x0f1a28,0,1.65,-22.95);[[0,3.35,3.9,.08],[-1.95,1.65,.08,3.4],[1.95,1.65,.08,3.4]].forEach(q=>scr(sc,q[0],q[1],-22.83,q[2],q[3],0xf2c14e));scr(sc,0,1.7,-22.83,.5,.6,0xf2c14e);
 {const l=label(['進階專科大樓','從中庭搭電梯'],'#ffffff','#ffffff',6);l.position.set(0,10.9,-23);sc.add(l);}
 [-2.6,2.6].forEach(x=>{box(.5,4,.5,0x33455c,x,2,21.5);const e=box(.12,4,.12,B(CY),x,2,21.78);e.castShadow=false;});box(5.9,.5,.5,0x33455c,0,4.1,21.5);{const e=box(5.9,.08,.08,B(CY),0,3.82,21.78);e.castShadow=false;}
 {const l=label(['資訊職訓中心'],'#ffffff','#ffffff',4.6);l.position.set(0,5.3,21.5);sc.add(l);}
 let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<60;i++){const a=rnd()*Math.PI*2,r=i<8?19.5+rnd()*2:27+rnd()*40,x=Math.sin(a)*r,z=Math.cos(a)*r,h=r<23?2.2:3+rnd()*9;
  if(r<23&&(api.courses.some((c,k)=>Math.abs(((a-AN(k)+Math.PI*5)%(Math.PI*2))-Math.PI)<.2)||Math.abs(x)<3))continue;
  if(z<-19&&Math.abs(x)<20)continue;
  if(r<23){cyl(.1,.14,h,0x4b5d75,x,h/2,z,null,8);const b=sph(.24,B(0xbfefff),x,h+.2,z);b.castShadow=false;blocks.push([x,z,.5]);}
  else{const w=1.6+rnd()*2.4;box(w,h,w,0x1a2a40,x,h/2,z);const c=[CY,0x4fe08a,0xf2c14e,0xd0568a][i%4];for(let k=0;k<3;k++){const e=box(w+.04,.08,w+.04,B(c),x,h*(.3+k*.25),z);e.castShadow=false;const ph=rnd()*6;anim.push(t=>{e.visible=Math.sin(t*1.3+ph+k)>-.7;});}}}
 // 飄在空中的資料光點
 for(let i=0;i<12;i++){const a=rnd()*Math.PI*2,r=4+rnd()*20,d=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),B(i%3?CY:0x4fe08a));const y0=1+rnd()*6,sp=.3+rnd()*.5;sc.add(d);anim.push(t=>{d.position.set(Math.sin(a+t*.03)*r,((y0+t*sp)%7)+.6,Math.cos(a+t*.03)*r);});}
 // ===== 區域 =====
 // 為了不卡，場景切成好幾個區域，一次只畫玩家所在的那一個：
 // 0 中庭、1 進階大樓的傳送大廳、2 以後是六條路線各一間。區域之間用傳送點移動。
 const G0=new THREE.Group();[...sc.children].forEach(o=>{if(!o.isLight)G0.add(o);});sc.add(G0);
 const Z=[{g:G0,ox:0,circ:21.8,blocks,pads:[],name:'中庭'}];
 stalls.forEach(s=>{s.zi=0;s.zg=G0;s.lx=s.x;});
 let BZ=0;{const push=anim.push.bind(anim);anim.forEach(f=>f.z=0);anim.push=f=>{f.z=BZ;return push(f);};}
 const mkZone=(name,o)=>{const g=new THREE.Group();g.position.x=300+Z.length*120;g.visible=false;sc.add(g);const z=Object.assign({g,ox:g.position.x,blocks:[],pads:[],name},o);Z.push(z);BZ=Z.length-1;return z;};
 const spr=(z,lines,bg,fg,w,x,y,zz)=>{const l=label(lines,bg,fg,w);l.position.set(x,y,zz);z.g.add(l);return l;};
 const floorText=(txt,col,w)=>{const cv=document.createElement('canvas');cv.width=txt.length*112+40;cv.height=160;const x=cv.getContext('2d');x.font='900 104px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=10;x.strokeStyle='rgba(8,16,30,.9)';x.strokeText(txt,cv.width/2,84);x.fillStyle=col;x.fillText(txt,cv.width/2,84);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*160/cv.width),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;return m;};
 const plant=(g,x,z)=>{cyl(.26,.2,.42,0x4b5d75,x,.21,z,g,10);sph(.42,0x3f9a6a,x,.85,z,g);sph(.26,0x55b57e,x+.12,1.2,z-.05,g);};
 // 傳送點：站上去按 E。pad(所在區域, x, z, 顏色, 牌子文字, 提示文字, 目的區域)
 const pad=(z,x,zz,col,lines,txt,to)=>{const g=z.g;cyl(1.3,1.4,.14,0x33455c,x,.07,zz,g,24);const o=new THREE.Mesh(new THREE.RingGeometry(1.05,1.22,32),B(col));o.rotation.x=-Math.PI/2;o.position.set(x,.16,zz);g.add(o);
  const bm=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,3.2,24,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}));bm.position.set(x,1.7,zz);g.add(bm);anim.push(t=>{bm.material.opacity=.1+Math.sin(t*2)*.05;});
  spr(z,lines,'#ffffff','#fff',lines.length>1?3.4:Math.max(2.4,lines[0].length*.6),x,lines.length>1?4.3:2.5,zz);const P={x:z.ox+x,z:zz,txt,to};z.pads.push(P);return P;};
 const TC={'系統與基礎設施':'#39d6ff','網路與通訊':'#4fe08a','資訊安全':'#ff7b6b','資料庫與資料平台':'#c79bff','軟體開發與整合':'#3fd6c8','IT 營運與治理':'#f2c14e'};
 const TRK=[];api.adv.forEach(c=>{if(!TRK.includes(c.track))TRK.push(c.track);});
 // --- 1 傳送大廳：圓形平台，六個傳送點排成弧形 ---
 BZ=0;pad(Z[0],9.5,9.5,0xf2c14e,['進階專科大樓'],'搭電梯到進階專科大樓',1);
 {const z=mkZone('進階專科大樓',{circ:12.6,cz:0}),g=z.g;
  cyl(13.4,13.8,.3,0x182538,0,-.15,0,g,48);{const o=new THREE.Mesh(new THREE.RingGeometry(13.1,13.3,64),B(CY));o.rotation.x=-Math.PI/2;o.position.y=.02;g.add(o);}
  {const o=new THREE.Mesh(new THREE.RingGeometry(2.6,2.74,48),B(CY));o.rotation.x=-Math.PI/2;o.position.y=.03;g.add(o);const a=floorText('進階專科大樓','#39d6ff',4);a.position.set(0,.05,-.4);g.add(a);const b=floorText('選一條路線，站上傳送點','#bfefff',3.9);b.position.set(0,.05,.8);g.add(b);}
  for(let k=0;k<16;k++){const a=k/16*Math.PI*2,x=Math.sin(a)*13.2,zz=Math.cos(a)*13.2;cyl(.16,.2,2.6,0x33455c,x,1.3,zz,g,8);const e=sph(.2,B(CY),x,2.75,zz,g);e.castShadow=false;}
  TRK.forEach((t,k)=>{const a=(k-(TRK.length-1)/2)*.5,x=Math.sin(a)*9,zz=-Math.cos(a)*9,n=api.adv.filter(c=>c.track===t).length;
   pad(z,x,zz,new THREE.Color(TC[t]).getHex(),[t,n+' 位大師'],'前往「'+t+'」',2+k);
   const ln=new THREE.Mesh(new THREE.PlaneGeometry(.12,6.2),B(new THREE.Color(TC[t]).getHex()));ln.rotation.x=-Math.PI/2;ln.rotation.z=-a;ln.position.set(Math.sin(a)*5.8,.03,-Math.cos(a)*5.8);g.add(ln);});
  pad(z,0,8.6,0xf2c14e,['回中庭'],'搭電梯回中庭',0);}
 // ===== 教室布景 =====
 const FNT='"PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';
 const cvTex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);return new THREE.CanvasTexture(c);};
 const panel=(g,x,y,zz,w,h,draw,frame)=>{const W=Math.round(w/h*384);if(frame!==false){const f=box(w+.16,h+.16,.08,0x1b2430,x,y,zz-.05,g);f.castShadow=false;}const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:cvTex(W,384,draw)}));m.position.set(x,y,zz);g.add(m);return m;};
 const mkT=x=>(s,px,py,size,col,al)=>{x.font='700 '+(size||26)+'px '+FNT;x.fillStyle=col||'#9fc3d8';x.textAlign=al||'left';x.textBaseline='alphabetic';x.fillText(s,px,py);};
 const rr=(x,a,b,w,h,r,fill,stroke)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();if(fill){x.fillStyle=fill;x.fill();}if(stroke){x.strokeStyle=stroke;x.lineWidth=3;x.stroke();}};
 const wave=(x,x0,y0,w,h,col,seed,fill)=>{x.beginPath();for(let i=0;i<=40;i++){const v=.5+.28*Math.sin(i*.45+seed)+.18*Math.sin(i*1.3+seed*2.1);x[i?'lineTo':'moveTo'](x0+w*i/40,y0+h*(1-v));}if(fill){x.lineTo(x0+w,y0+h);x.lineTo(x0,y0+h);x.closePath();x.globalAlpha=.3;x.fillStyle=col;x.fill();x.globalAlpha=1;}else{x.strokeStyle=col;x.lineWidth=4;x.stroke();}};
 const steps=(x,T,arr,x0,y,w,col,done)=>{const bw=(w-(arr.length-1)*22)/arr.length;arr.forEach((s,i)=>{const ok=done===undefined||i<done;rr(x,x0+i*(bw+22),y,bw,58,10,ok?col:'#14324a',ok?null:col);T(s,x0+i*(bw+22)+bw/2,y+39,24,ok?'#0b1c2c':'#e6f3ff','center');if(i){x.fillStyle=col;x.beginPath();const ax=x0+i*(bw+22)-17;x.moveTo(ax,y+19);x.lineTo(ax+12,y+29);x.lineTo(ax,y+39);x.fill();}});};
 const gauge=(x,cx,cy,r,v,col)=>{x.lineWidth=22;x.lineCap='round';x.strokeStyle='#14324a';x.beginPath();x.arc(cx,cy,r,Math.PI,2*Math.PI);x.stroke();x.strokeStyle=col;x.beginPath();x.arc(cx,cy,r,Math.PI,Math.PI*(1+v));x.stroke();x.lineCap='butt';};
 const rows=(x,T,arr,x0,y0,w,dy)=>arr.forEach((r,i)=>{T(r[0],x0,y0+i*dy,28,'#e6f3ff');T(r[1],x0+w,y0+i*dy,26,r[2]||'#4fe08a','right');x.fillStyle='#1c3a52';x.fillRect(x0,y0+i*dy+12,w,2);});
 // 後牆大螢幕：每條路線畫不同的內容
 const SCR={
 '系統與基礎設施':(x,c,T,S)=>{T('機櫃使用率',S(0),46);[.62,.8,.45,.92,.7,.55,.84,.38].forEach((v,i)=>{x.fillStyle='#14324a';x.fillRect(S(0)+i*49,100,36,190);x.fillStyle=v>.85?'#ff7b6b':c;x.fillRect(S(0)+i*49,290-v*190,36,v*190);});
  T('CPU／記憶體',S(1),46);wave(x,S(1),90,390,200,c,3,1);wave(x,S(1),90,390,200,c,3);wave(x,S(1),90,390,200,'#4fe08a',11);
  T('備份作業',S(2),46);rows(x,T,[['每日增量','完成'],['每週完整','完成'],['異地複寫','完成'],['還原演練','排程中','#f2c14e']],S(2),104,390,56);
  T('虛擬化平台',S(3),46);T('128',S(3),200,130,c);T('台運作中',S(3)+240,200,30,'#e6f3ff');T('主機 12 台・叢集 3 組',S(3),266,28);},
 '網路與通訊':(x,c,T,S)=>{T('網路拓樸',S(0),46);const L=[[2,96],[4,180],[8,268]],P=L.map(l=>Array.from({length:l[0]},(_,i)=>[S(0)+390*(i+.5)/l[0],l[1]]));x.strokeStyle='#2f6f55';x.lineWidth=3;P[1].forEach((d,i)=>{P[0].forEach(a=>{x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(d[0],d[1]);x.stroke();});[0,1].forEach(j=>{const a=P[2][i*2+j];x.beginPath();x.moveTo(d[0],d[1]);x.lineTo(a[0],a[1]);x.stroke();});});P.forEach((r,l)=>r.forEach(n=>rr(x,n[0]-22+l*4,n[1]-14+l*2,44-l*8,28-l*4,6,l?'#14324a':c,c)));
  T('流量 Gbps',S(1),46);wave(x,S(1),90,390,200,c,5,1);wave(x,S(1),90,390,200,c,5);wave(x,S(1),130,390,160,'#39d6ff',8);
  T('VLAN 規劃',S(2),46);rows(x,T,[['VLAN 10','辦公'],['VLAN 20','伺服器'],['VLAN 30','訪客','#f2c14e'],['VLAN 99','管理','#39d6ff']],S(2),104,390,56);
  T('無線訊號',S(3),46);[.3,.5,.7,.9,1].forEach((v,i)=>{x.fillStyle=i<4?c:'#14324a';x.fillRect(S(3)+i*44,250-v*130,30,v*130);});T('-52',S(3)+240,210,64,'#e6f3ff');T('dBm',S(3)+240,250,26);T('AP 86 台・用戶 1,240',S(3),292,24);},
 '資訊安全':(x,c,T,S)=>{T('全球威脅情資',S(0),46);for(let i=0;i<27;i++)for(let j=0;j<10;j++){if(Math.sin(i*.55+1)*Math.cos(j*.8-.4)+Math.sin(i*.23+j*.5)*.6>.05){x.fillStyle='#2a4a66';x.beginPath();x.arc(S(0)+i*15,84+j*22,4,0,7);x.fill();}}[[60,120],[150,180],[250,110],[330,210],[200,250]].forEach((p,i)=>{x.strokeStyle=c;x.lineWidth=2;x.beginPath();x.moveTo(S(0)+p[0],p[1]);x.quadraticCurveTo(S(0)+(p[0]+300)/2,20,S(0)+300,160);x.stroke();x.fillStyle=c;x.beginPath();x.arc(S(0)+p[0],p[1],7,0,7);x.fill();});x.fillStyle='#4fe08a';x.beginPath();x.arc(S(0)+300,160,9,0,7);x.fill();
  T('即時告警',S(1),46);[['高','異常登入嘗試','#ff7b6b'],['中','可疑指令碼執行','#f2c14e'],['低','連接埠掃描','#39d6ff'],['訊','特徵碼已更新','#4fe08a']].forEach((r,i)=>{rr(x,S(1),74+i*56,44,40,8,r[2]);T(r[0],S(1)+22,104+i*56,26,'#0b1c2c','center');T(r[1],S(1)+60,104+i*56,28,'#e6f3ff');});
  T('威脅等級',S(2),46);gauge(x,S(2)+195,250,130,.62,'#f2c14e');T('中',S(2)+195,240,84,'#f2c14e','center');T('警戒',S(2)+195,286,28,'#e6f3ff','center');
  T('事件處理',S(3),46);steps(x,T,['偵測','分析','圍堵'],S(3),90,390,c,2);steps(x,T,['根除','復原','檢討'],S(3),176,390,c,0);T('處理中 2 件・今日結案 7 件',S(3),288,24);},
 '資料庫與資料平台':(x,c,T,S)=>{T('資料模型',S(0),46);[[0,74,'客戶',['編號 PK','名稱','電話']],[230,74,'訂單',['編號 PK','客戶 FK','日期']],[115,200,'明細',['訂單 FK','數量']]].forEach(b=>{rr(x,S(0)+b[0],b[1],160,36+b[3].length*26,8,'#14324a',c);x.fillStyle=c;x.fillRect(S(0)+b[0],b[1],160,34);T(b[2],S(0)+b[0]+80,b[1]+26,24,'#0b1c2c','center');b[3].forEach((f,i)=>T(f,S(0)+b[0]+12,b[1]+58+i*26,20,'#e6f3ff'));});x.strokeStyle='#e6f3ff';x.lineWidth=3;x.beginPath();x.moveTo(S(0)+160,120);x.lineTo(S(0)+230,134);x.moveTo(S(0)+310,188);x.lineTo(S(0)+260,200);x.stroke();
  T('每月營運報表',S(1),46);[.4,.55,.5,.7,.62,.85,.78,.95].forEach((v,i)=>{x.fillStyle=i===7?'#e6f3ff':c;x.fillRect(S(1)+i*49,290-v*200,36,v*200);});
  T('資料來源占比',S(2),46);[[0,.45,c],[.45,.75,'#39d6ff'],[.75,.92,'#4fe08a'],[.92,1,'#f2c14e']].forEach(a=>{x.strokeStyle=a[2];x.lineWidth=44;x.beginPath();x.arc(S(2)+110,180,78,a[0]*6.283-1.57,a[1]*6.283-1.57);x.stroke();});[['交易',c],['會員','#39d6ff'],['紀錄','#4fe08a'],['外部','#f2c14e']].forEach((r,i)=>{x.fillStyle=r[1];x.fillRect(S(2)+250,96+i*48,24,24);T(r[0],S(2)+286,118+i*48,26,'#e6f3ff');});
  T('資料管線',S(3),46);steps(x,T,['擷取','轉換','載入'],S(3),90,390,c);T('昨夜批次',S(3),206,28,'#e6f3ff');T('成功',S(3)+390,206,28,'#4fe08a','right');T('資料量',S(3),258,28,'#e6f3ff');T('3,284 萬筆',S(3)+390,258,28,c,'right');},
 '軟體開發與整合':(x,c,T,S)=>{T('程式碼',S(0),46);rr(x,S(0),66,390,230,8,'#0a1622');const K=['#c79bff','#3fd6c8','#e6f3ff','#f2c14e','#9fc3d8'];for(let i=0;i<8;i++){T(String(i+1),S(0)+30,96+i*27,18,'#4b6a82','right');let px=S(0)+44+[0,18,36,36,18,36,18,0][i];for(let j=0;j<[3,4,3,5,2,4,2,1][i];j++){const w=30+((i*7+j*13)%5)*16;x.fillStyle=K[(i+j*2)%5];x.fillRect(px,84+i*27,w,12);px+=w+10;}}
  T('持續整合',S(1),46);steps(x,T,['提交','建置','測試'],S(1),80,390,c,3);steps(x,T,['掃描','部署'],S(1),160,255,c,1);T('第 482 次建置・進行中',S(1),270,26,'#e6f3ff');
  T('待審合併請求',S(2),46);rows(x,T,[['修正登入逾時','已核可'],['新增匯出功能','審查中','#f2c14e'],['升級相依套件','審查中','#f2c14e'],['重構報表模組','待審','#9fc3d8']],S(2),104,390,56);
  T('測試涵蓋率',S(3),46);gauge(x,S(3)+195,250,130,.87,c);T('87%',S(3)+195,240,76,c,'center');T('通過 1,206・失敗 0',S(3)+195,288,24,'#e6f3ff','center');},
 'IT 營運與治理':(x,c,T,S)=>{T('風險矩陣',S(0),46);for(let i=0;i<5;i++)for(let j=0;j<5;j++){const v=i+(4-j);x.fillStyle=v>=6?'#ff7b6b':v>=4?'#f2c14e':'#4fe08a';x.globalAlpha=.85;x.fillRect(S(0)+40+i*54,72+j*42,50,38);x.globalAlpha=1;}[[3,1],[1,3],[2,2],[4,0]].forEach(p=>{x.fillStyle='#0b1c2c';x.beginPath();x.arc(S(0)+65+p[0]*54,91+p[1]*42,9,0,7);x.fill();});T('可能性 →',S(0)+40,306,20);
  T('服務水準達成率',S(1),46);gauge(x,S(1)+195,250,130,.96,'#4fe08a');T('98.6%',S(1)+195,238,64,'#4fe08a','center');T('本月工單 1,482 件',S(1)+195,288,24,'#e6f3ff','center');
  T('專案時程',S(2),46);[['需求',0,.3],['建置',.2,.45],['測試',.55,.25],['上線',.8,.2]].forEach((r,i)=>{T(r[0],S(2),104+i*54,26,'#e6f3ff');x.fillStyle='#14324a';x.fillRect(S(2)+80,82+i*54,310,28);x.fillStyle=i<2?c:'#8a6f2a';x.fillRect(S(2)+80+r[1]*310,82+i*54,r[2]*310,28);});x.fillStyle='#ff7b6b';x.fillRect(S(2)+80+.5*310,70,3,220);
  T('持續改善循環',S(3),46);[['規劃',c],['執行','#39d6ff'],['查核','#4fe08a'],['行動','#ff7b6b']].forEach((r,i)=>{x.strokeStyle=r[1];x.lineWidth=30;x.beginPath();x.arc(S(3)+120,182,88,i*1.5708-1.5+.06,(i+1)*1.5708-1.5-.06);x.stroke();x.fillStyle=r[1];x.fillRect(S(3)+260,90+i*50,24,24);T(r[0],S(3)+296,112+i*50,28,'#e6f3ff');});}};
 const bigScreen=(g,t)=>{const c=TC[t];const m=new THREE.Mesh(new THREE.PlaneGeometry(15,2.36),new THREE.MeshBasicMaterial({map:cvTex(2036,320,(x,W,H)=>{x.fillStyle='#0b1c2c';x.fillRect(0,0,W,H);x.fillStyle=c;x.fillRect(0,0,300,H);const T=mkT(x);T(t,150,150,Math.min(46,268/t.length*1.02),'#0b1c2c','center');T('進階專科教室',150,206,26,'#0b1c2c','center');x.fillStyle='#1c3a52';for(let i=1;i<4;i++)x.fillRect(318+i*428-14,30,2,H-60);SCR[t](x,c,T,i=>330+i*428);})}));m.position.set(0,2.6,-9.2);g.add(m);};
 const rack=(g,x,zz,c,seed,cables)=>{const r=new THREE.Group();r.position.set(x,0,zz);g.add(r);box(.98,2.2,.9,0x1b2430,0,1.1,0,r);const f=box(.86,2,.04,0x0e151d,0,1.12,.45,r);f.castShadow=false;const e=box(1,.04,.92,B(c),0,2.22,0,r);e.castShadow=false;
  for(let q=0;q<7;q++){const u=box(.78,.2,.03,0x2b3644,0,.32+q*.27,.47,r);u.castShadow=false;const d=scr(r,-.28+((q*37+seed)%5)*.07,.32+q*.27,.48,.06,.06,q%3?0x4fe08a:c);anim.push(tt=>{d.visible=Math.sin(tt*(2+q%4)+q*1.7+seed)>-.3;});}
  if(cables)[0xf2c14e,0x39d6ff,0xff7b6b,0x4fe08a,0xf2c14e,0x39d6ff].forEach((cc,q)=>{const w=box(.03,.5+(q*7%4)*.22,.03,B(cc),-.3+q*.12,1.4-(q*7%4)*.11,.5,r);w.castShadow=false;});return r;};
 const pedestal=(g,x,zz,c)=>{cyl(.95,1.05,.3,0x33455c,x,.15,zz,g,24);const e=cyl(.8,.8,.04,B(c),x,.31,zz,g,24);e.castShadow=false;const d=cyl(.66,.66,.05,0x26313c,x,.32,zz,g,24);d.castShadow=false;};
 const holo=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o||.55,depthWrite:false});
 const DECOR={
 '系統與基礎設施':(g,c,blk)=>{[-11.7,-10.6,-9.5,-8.4,8.4,9.5,10.6,11.7].forEach((x,i)=>rack(g,x,-8.72,c,i*3));
  // 冷氣機與不斷電系統
  box(1.1,2.1,1.7,0xdfe6ee,-11.7,1.05,3.1,g);box(.06,1.2,1.3,0x26313c,-11.13,1.3,3.1,g);{const f=new THREE.Group();f.position.set(-11.08,1.3,3.1);g.add(f);[0,1,2].forEach(i=>{const b=box(.03,1,.16,0x8fa3b8,0,0,0,f);b.rotation.x=i*Math.PI/3;b.castShadow=false;});anim.push(tt=>{f.rotation.x=tt*5;});}{const e=box(1.12,.05,1.72,B(c),-11.7,2.12,3.1,g);e.castShadow=false;}blk(-11.7,3.1,1.25);
  box(1.1,1.5,1.5,0x26313c,-11.7,.75,5.6,g);for(let q=0;q<5;q++){const d=scr(g,-11.13,.35+q*.24,5.6,.05,.14,q<4?0x4fe08a:0x2b3644);d.rotation.y=Math.PI/2;d.scale.x=10;}{const s=scr(g,-11.13,1.2,6.05,.05,.2,0xf2c14e);s.rotation.y=Math.PI/2;s.scale.x=6;}blk(-11.7,5.6,1.2);
  // 儲存櫃與維護推車
  box(2.6,1.3,.95,0x1b2430,10.6,.65,6.5,g);for(let r=0;r<2;r++)for(let q=0;q<6;q++){const b=box(.34,.42,.04,0x3b4b63,9.55+q*.42,.42+r*.52,6.99,g);b.castShadow=false;const d=scr(g,9.55+q*.42,.26+r*.52,7.02,.08,.04,(q+r)%4?0x4fe08a:c);anim.push(tt=>{d.visible=Math.sin(tt*(4+q)+r*2+q)>-.5;});}{const e=box(2.62,.04,.97,B(c),10.6,1.32,6.5,g);e.castShadow=false;}blk(9.9,6.5,1.1);blk(11.3,6.5,1.1);
  box(.9,.06,.6,0x8fa3b8,10.4,.95,3.4,g);box(.9,.06,.6,0x8fa3b8,10.4,.4,3.4,g);[[-.4,-.25],[.4,-.25],[-.4,.25],[.4,.25]].forEach(p=>{cyl(.03,.03,.9,0x5b6672,10.4+p[0],.5,3.4+p[1],g,6);});mon(g,10.4,.98,3.4,0x16324a);box(.4,.04,.16,0x26313c,10.4,1,3.62,g);blk(10.4,3.4,.75);
  // 高架地板通風磚
  [[-6.5,5.2],[6.5,5.2],[-3.4,6.6],[3.4,6.6]].forEach(p=>{const tl=box(1.3,.02,1.3,0x0f1a26,p[0],.07,p[1],g);tl.castShadow=false;for(let q=0;q<5;q++){const s=box(1.05,.012,.07,B(0x245a78),p[0],.085,p[1]-.44+q*.22,g);s.castShadow=false;}});},
 '網路與通訊':(g,c,blk)=>{[-11.6,-10.4,-9.2].forEach((x,i)=>rack(g,x,-8.72,c,i*5,true));
  // 天線塔與光纖線盤
  cyl(.09,.12,3.6,0x8fa3b8,10.4,1.8,-8.7,g,8);[0,1,2].forEach(i=>{const a=box(.22,.8,.12,0xdfe6ee,10.4+Math.sin(i*2.1)*.24,2.9,-8.7+Math.cos(i*2.1)*.24,g);a.rotation.y=i*2.1;});{const l=sph(.1,B(0xff5544),10.4,3.68,-8.7,g);l.castShadow=false;anim.push(tt=>{l.visible=Math.sin(tt*4)>0;});}cyl(.5,.5,.25,0x26313c,10.4,.12,-8.7,g,12);
  [[8.7,0xf2c14e],[12,0xff8a3c]].forEach(p=>{const s=cyl(.55,.55,.5,p[1],p[0],.62,-8.7,g,18);s.rotation.x=Math.PI/2;[-.3,.3].forEach(d=>{const w=cyl(.72,.72,.06,0x5b6672,p[0],.72,-8.7+d,g,18);w.rotation.x=Math.PI/2;});});
  // 無線基地台
  pedestal(g,-10.2,4.9,c);cyl(.07,.07,2.3,0x8fa3b8,-10.2,1.45,4.9,g,8);cyl(.5,.5,.12,0xf4f1ea,-10.2,2.66,4.9,g,20);{const d=sph(.06,B(0x4fe08a),-10.2,2.74,4.9,g);d.castShadow=false;}[0,1,2].forEach(i=>{const r=new THREE.Mesh(new THREE.RingGeometry(.55,.62,32),holo(c,.6));r.rotation.x=-Math.PI/2;r.position.set(-10.2,2.7,4.9);g.add(r);anim.push(tt=>{const p=(tt*.5+i/3)%1;r.scale.setScalar(1+p*3.2);r.material.opacity=.6*(1-p);});});blk(-10.2,4.9,1.2);
  // 立體網路拓樸
  pedestal(g,10.2,4.9,c);{const h=new THREE.Group();h.position.set(10.2,1.9,4.9);g.add(h);const pts=[[0,0,0]];for(let i=0;i<6;i++)pts.push([Math.cos(i*1.047)*1.1,Math.sin(i*2.3)*.4,Math.sin(i*1.047)*1.1]);const lp=[];pts.forEach((p,i)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(i?.14:.26,12,8),B(i?c:0xffffff));s.position.set(p[0],p[1],p[2]);h.add(s);if(i){lp.push(0,0,0,p[0],p[1],p[2]);const n=pts[1+i%6];lp.push(p[0],p[1],p[2],n[0],n[1],n[2]);}});const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));h.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:c})));anim.push(tt=>{h.rotation.y=tt*.5;});}blk(10.2,4.9,1.2);
  // 地上的封包線路
  {const l=box(18.6,.02,.08,B(c),0,.08,7.25,g);l.castShadow=false;[-10.2,10.2].forEach(x=>{const v=box(.08,.02,1.4,B(c),x,.08,6.55,g);v.castShadow=false;});[0,1,2,3].forEach(i=>{const p=box(.26,.14,.16,B(i%2?0xffffff:0xf2c14e),0,.16,7.25,g);p.castShadow=false;anim.push(tt=>{const u=(tt*.18+i/4)%1;p.position.x=(i%2?1:-1)*(9.3-u*18.6);});});}
  // 交換器堆疊
  [[-12,3],[12,3]].forEach(p=>{box(.9,.7,1.5,0x26313c,p[0],.35,p[1],g);for(let q=0;q<3;q++){box(.8,.14,1.3,0x3b4b63,p[0],.78+q*.17,p[1],g);for(let j=0;j<6;j++){const d=scr(g,p[0]-Math.sign(p[0])*.41,.78+q*.17,p[1]-.5+j*.2,.05,.05,0x4fe08a);d.rotation.y=Math.PI/2;anim.push(tt=>{d.visible=Math.sin(tt*(5+j)+q*3+j)>-.2;});}}blk(p[0],p[1],1);});},
 '資訊安全':(g,c,blk)=>{
  panel(g,-10.4,2.2,-9.2,4.2,2.6,(x,W,H)=>{const T=mkT(x);x.fillStyle='#1a0f14';x.fillRect(0,0,W,H);x.fillStyle='#ff7b6b';x.fillRect(0,0,W,58);T('紅隊：攻擊路徑',W/2,42,34,'#1a0f14','center');['偵察','取得初始存取','提升權限','橫向移動','達成目標'].forEach((s,i)=>{rr(x,60,78+i*60,W-120,46,8,i<3?'#5a2630':'#2a1a20','#ff7b6b');T((i+1)+'　'+s,84,111+i*60,28,'#ffe3df');});});
  panel(g,10.4,2.2,-9.2,4.2,2.6,(x,W,H)=>{const T=mkT(x);x.fillStyle='#0c1a2a';x.fillRect(0,0,W,H);x.fillStyle='#39d6ff';x.fillRect(0,0,W,58);T('藍隊：防禦縱深',W/2,42,34,'#0c1a2a','center');['邊界防護','端點偵測與回應','身分與存取控管','日誌集中與監控','備份與復原'].forEach((s,i)=>{rr(x,60,78+i*60,W-120,46,8,'#14324a','#39d6ff');T(s,W/2,111+i*60,28,'#e6f3ff','center');});});
  // 盾牌全像
  pedestal(g,-10.2,4.9,c);{const h=new THREE.Group();h.position.set(-10.2,1.95,4.9);g.add(h);const sh=new THREE.Shape();sh.moveTo(0,1);sh.lineTo(.8,.68);sh.lineTo(.8,0);sh.quadraticCurveTo(.7,-.8,0,-1.1);sh.quadraticCurveTo(-.7,-.8,-.8,0);sh.lineTo(-.8,.68);sh.lineTo(0,1);const ge=new THREE.ExtrudeGeometry(sh,{depth:.14,bevelEnabled:false});ge.translate(0,0,-.07);h.add(new THREE.Mesh(ge,holo(c,.45)));h.add(new THREE.LineSegments(new THREE.EdgesGeometry(ge),new THREE.LineBasicMaterial({color:0xffffff})));
   [-1,1].forEach(s=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.06),B(0xffffff));b.position.set(0,-.25,s*.11);h.add(b);const a=new THREE.Mesh(new THREE.TorusGeometry(.17,.045,8,16,Math.PI),B(0xffffff));a.position.set(0,-.05,s*.11);h.add(a);});anim.push(tt=>{h.rotation.y=tt*.8;h.position.y=1.95+Math.sin(tt*1.5)*.08;});}blk(-10.2,4.9,1.2);
  // 保險庫與警示燈
  box(2.2,2.1,1.5,0x3b4b63,10.5,1.05,5.4,g);box(2,1.9,.06,0x55677f,10.5,1.05,6.17,g);{const w=new THREE.Group();w.position.set(10.5,1.05,6.26);g.add(w);const d=cyl(.62,.62,.1,0x8fa3b8,0,0,0,w,24);d.rotation.x=Math.PI/2;const t=new THREE.Mesh(new THREE.TorusGeometry(.36,.05,8,20),M(0xdfe6ee));t.position.z=.12;w.add(t);[0,1,2].forEach(i=>{const s=box(.74,.06,.05,0xdfe6ee,0,0,.12,w);s.rotation.z=i*Math.PI/3;s.castShadow=false;});anim.push(tt=>{w.rotation.z=Math.sin(tt*.6)*1.2;});}{const d=scr(g,11.35,1.5,6.2,.14,.2,0x4fe08a);anim.push(tt=>{d.visible=Math.sin(tt*3)>-.6;});}
  cyl(.2,.24,.14,0x26313c,10.5,2.17,5.4,g,12);{const l=cyl(.16,.16,.26,B(0xff3b30),10.5,2.37,5.4,g,12);l.castShadow=false;const bm=new THREE.Mesh(new THREE.BoxGeometry(2.6,.12,.3),holo(0xff3b30,.3));bm.position.set(10.5,2.37,5.4);g.add(bm);anim.push(tt=>{bm.rotation.y=tt*3;});}blk(10.5,5.5,1.6);
  // 地板雷達
  [[-5.6,5.9],[5.6,5.9]].forEach((p,i)=>{[1.5,1,.5].forEach(r=>{const o=new THREE.Mesh(new THREE.RingGeometry(r-.03,r,40),holo(c,.7));o.rotation.x=-Math.PI/2;o.position.set(p[0],.08,p[1]);g.add(o);});const w=new THREE.Mesh(new THREE.CircleGeometry(1.5,20,0,.9),holo(c,.28));w.rotation.x=-Math.PI/2;w.position.set(p[0],.09,p[1]);g.add(w);anim.push(tt=>{w.rotation.z=-tt*1.6+i*2;});[[.6,.5],[-.8,.3],[.2,-1]].forEach((d,j)=>{const b=new THREE.Mesh(new THREE.CircleGeometry(.09,10),holo(0xffffff,.9));b.rotation.x=-Math.PI/2;b.position.set(p[0]+d[0],.1,p[1]+d[1]);g.add(b);anim.push(tt=>{b.material.opacity=.3+.6*Math.max(0,Math.sin(tt*2+j*2+i));});});});
  // 監控主控台
  [[-12,3],[12,3]].forEach(p=>{const s=-Math.sign(p[0]);box(.9,.85,2.2,0x26313c,p[0],.42,p[1],g);[-.6,.1,.8].forEach((d,j)=>{const m=mon(g,p[0]+s*.1,.86,p[1]+d-.1,j===1?0x4a1c22:0x16324a,s*Math.PI/2);m.scale.setScalar(1.15);});blk(p[0],p[1]-.5,.85);blk(p[0],p[1]+.5,.85);});},
 '資料庫與資料平台':(g,c,blk)=>{
  // 磁帶櫃
  [-10.3,10.3].forEach((x0,s)=>{box(4.2,2.4,.8,0x1b2430,x0,1.2,-8.75,g);const e=box(4.22,.04,.82,B(c),x0,2.42,-8.75,g);e.castShadow=false;for(let r=0;r<3;r++){const sh=box(4,.05,.1,0x55677f,x0,.42+r*.7,-8.32,g);sh.castShadow=false;for(let q=0;q<11;q++){const b=box(.24,.5,.1,(q*5+r*3+s)%4?0x4b5d75:c,x0-1.75+q*.35,.72+r*.7,-8.32,g);b.castShadow=false;}}const arm=box(.12,2.2,.12,B(0xffffff),x0,1.2,-8.22,g);arm.castShadow=false;anim.push(tt=>{arm.position.x=x0+Math.sin(tt*.7+s*2)*1.8;});});
  // 資料庫圓柱
  [[-11,3.4,3],[-9.5,5,4],[-11,6.5,2]].forEach((p,i)=>{for(let q=0;q<p[2];q++){cyl(.72,.72,.44,0x4b3f7a,p[0],.3+q*.56,p[1],g,24);const r=cyl(.74,.74,.07,B(c),p[0],.565+q*.56,p[1],g,24);r.castShadow=false;anim.push(tt=>{r.visible=Math.sin(tt*2-q*.9+i)>-.75;});}blk(p[0],p[1],.95);});
  // 資料方塊
  pedestal(g,10.2,4.9,c);{const h=new THREE.Group();h.position.set(10.2,1.95,4.9);g.add(h);const ge=new THREE.BoxGeometry(.36,.36,.36),ed=new THREE.EdgesGeometry(ge),lm=new THREE.LineBasicMaterial({color:0xffffff}),ms=[holo(c,.55),holo(0x39d6ff,.55),holo(0xffffff,.5)];for(let a=-1;a<2;a++)for(let b=-1;b<2;b++)for(let d=-1;d<2;d++){const m=new THREE.Mesh(ge,ms[(a+b+d+3)%3]);m.position.set(a*.46,b*.46,d*.46);h.add(m);if((a+b+d)%2===0){const l=new THREE.LineSegments(ed,lm);l.position.copy(m.position);h.add(l);}}h.rotation.x=.5;anim.push(tt=>{h.rotation.y=tt*.6;});}blk(10.2,4.9,1.2);
  // 資料管線
  {box(18.4,.14,.16,0x55677f,0,.1,7.25,g);[-9.5,10.2].forEach(x=>box(.16,.14,1.5,0x55677f,x,.1,6.5,g));[-6,-2,2,6].forEach(x=>{const j=box(.3,.22,.26,0x8fa3b8,x,.12,7.25,g);j.castShadow=false;});[0,1,2,3,4].forEach(i=>{const p=box(.2,.2,.2,B(i%2?0xffffff:c),0,.3,7.25,g);p.castShadow=false;anim.push(tt=>{const u=(tt*.14+i/5)%1;p.position.x=-9.2+u*18.6;p.rotation.y=tt*2;});});}
  // 報表看板
  [[-12,.9],[12,.9]].forEach((p,i)=>{const s=-Math.sign(p[0]);cyl(.06,.06,1.5,0x8fa3b8,p[0],.75,p[1],g,8);cyl(.35,.4,.08,0x26313c,p[0],.04,p[1],g,12);const m=panel(g,p[0]+s*.08,1.7,p[1],1.9,1.25,(x,W,H)=>{const T=mkT(x);x.fillStyle='#0b1c2c';x.fillRect(0,0,W,H);T(i?'查詢效能':'容量趨勢',30,60,44,'#e6f3ff');if(i)[.9,.6,.75,.4,.5,.3].forEach((v,j)=>{x.fillStyle=TC['資料庫與資料平台'];x.fillRect(40+j*88,340-v*230,60,v*230);});else{wave(x,30,110,W-60,230,TC['資料庫與資料平台'],2,1);wave(x,30,110,W-60,230,TC['資料庫與資料平台'],2);}},false);m.rotation.y=s*Math.PI/2.6;box(2,1.35,.06,0x1b2430,p[0],1.7,p[1],g).rotation.y=s*Math.PI/2.6;blk(p[0],p[1],.7);});},
 '軟體開發與整合':(g,c,blk)=>{
  panel(g,-10.4,2.2,-9.2,4.2,2.6,(x,W,H)=>{const T=mkT(x);x.fillStyle='#10202e';x.fillRect(0,0,W,H);['待辦','進行中','審查','完成'].forEach((s,i)=>{const cx=20+i*(W-40)/4,cw=(W-40)/4-12;rr(x,cx,16,cw,H-32,10,'#182c40');T(s,cx+cw/2,54,28,'#e6f3ff','center');const n=[4,2,2,3][i];for(let j=0;j<n;j++){rr(x,cx+10,72+j*74,cw-20,62,6,['#f2c14e','#3fd6c8','#c79bff','#ff9a8b','#4fe08a'][(i*2+j)%5]);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(cx+20,86+j*74,cw-56,7);x.fillRect(cx+20,102+j*74,cw-84,7);}});});
  panel(g,10.4,2.2,-9.2,4.2,2.6,(x,W,H)=>{const T=mkT(x);x.fillStyle='#eef2f5';x.fillRect(0,0,W,H);T('系統架構',30,50,32,'#26313c');const bx=(s,a,b,w,col)=>{rr(x,a,b,w,60,10,'#ffffff',col);T(s,a+w/2,b+40,26,'#26313c','center');};bx('瀏覽器',40,90,150,'#17a07a');bx('閘道',240,90,130,'#2e86c1');bx('服務甲',430,50,150,'#c0392b');bx('服務乙',430,150,150,'#c0392b');bx('快取',240,250,130,'#c9860c');bx('資料庫',430,270,150,'#7d3c98');x.strokeStyle='#26313c';x.lineWidth=4;[[190,120,240,120],[370,110,430,80],[370,130,430,180],[305,150,305,250],[505,210,505,270]].forEach(l=>{x.beginPath();x.moveTo(l[0],l[1]);x.lineTo(l[2],l[3]);x.stroke();});});
  // 休息區：沙發、懶骨頭、茶几
  box(1,.45,3,0x2a7d76,-11.6,.32,5,g);box(.3,1,3,0x226660,-12.15,.6,5,g);[3.6,6.4].forEach(zz=>box(1,.3,.3,0x226660,-11.6,.7,zz>5?6.6:3.4,g));[[-11.6,4.3,0xf2c14e],[-11.6,5.6,0xff9a8b]].forEach(p=>{const s=box(.6,.18,.6,p[2],p[0],.63,p[1],g);s.rotation.y=.3;});blk(-11.8,4.2,1);blk(-11.8,5.8,1);
  [[-9.3,3.5,0xff8a3c],[-9.1,6.5,0xc79bff]].forEach(p=>{const s=sph(.62,p[2],p[0],.34,p[1],g);s.scale.y=.6;const t=sph(.4,p[2],p[0]-.15,.62,p[1]-.2,g);t.scale.y=.7;blk(p[0],p[1],.7);});
  cyl(.55,.55,.08,0xe9d7b4,-10,.42,5,g,20);cyl(.08,.2,.4,0x5b6672,-10,.2,5,g,8);cyl(.07,.06,.13,0xf4f1ea,-10.2,.52,4.9,g,10);cyl(.07,.06,.13,0xf4f1ea,-9.8,.52,5.2,g,10);box(.36,.03,.26,0x26313c,-10,.48,4.75,g);blk(-10,5,.6);
  // 咖啡吧與黃色小鴨
  box(.9,.95,2.4,0x26313c,11.9,.47,3.2,g);box(1,.06,2.5,0xe9d7b4,11.9,.98,3.2,g);box(.5,.7,.5,0x8fa3b8,11.95,1.36,2.5,g);{const e=scr(g,11.69,1.5,2.5,.05,.12,0x4fe08a);e.rotation.y=Math.PI/2;e.scale.x=4;}cyl(.09,.08,.16,0xf4f1ea,11.75,1.09,3.1,g,10);cyl(.09,.08,.16,0xf4f1ea,11.95,1.09,3.4,g,10);
  sph(.15,0xf7d038,11.8,1.14,4,g);sph(.1,0xf7d038,11.74,1.32,4,g);{const b=box(.1,.04,.08,0xff8a3c,11.63,1.31,4,g);b.castShadow=false;}blk(11.9,2.6,.9);blk(11.9,3.8,.9);
  // 持續整合流水線
  {const names=['建置','測試','掃描','部署'],ls=[];names.forEach((s,i)=>{const x=6.4+i*1.45;cyl(.3,.36,1,0x33455c,x,.5,6,g,12);const l=sph(.26,new THREE.MeshBasicMaterial({color:0x2b3644}),x,1.22,6,g);l.castShadow=false;ls.push(l);if(i){const a=box(.7,.05,.05,B(c),x-.72,.6,6,g);a.castShadow=false;}blk(x,6,.5);});const ft=floorText('建置　測試　掃描　部署','#bfefff',5.6);ft.position.set(8.58,.09,7);g.add(ft);anim.push(tt=>{const n=Math.floor(tt*1.2)%6;ls.forEach((l,i)=>l.material.color.setHex(i<n?0x4fe08a:i===n?0xf2c14e:0x2b3644));});}
  // 站立白板
  {const f=box(.08,1.9,.08,0x8fa3b8,-6.3,.95,6.9,g);box(.08,1.9,.08,0x8fa3b8,-3.9,.95,6.9,g);panel(g,-5.1,1.35,6.9,2.4,1.2,(x,W,H)=>{const T=mkT(x);x.fillStyle='#eef2f5';x.fillRect(0,0,W,H);T('本週衝刺目標',30,70,54,'#26313c');['完成登入模組重構','修正三個已知錯誤','補上自動化測試'].forEach((s,i)=>{x.strokeStyle='#17a07a';x.lineWidth=6;x.strokeRect(36,120+i*84,44,44);if(i<2){x.beginPath();x.moveTo(44,142+i*84);x.lineTo(56,156+i*84);x.lineTo(76,126+i*84);x.stroke();}T(s,104,158+i*84,44,'#26313c');});});blk(-5.1,6.9,1.3);}},
 'IT 營運與治理':(g,c,blk)=>{
  // 法規書櫃
  box(4.2,2.5,.6,0x2b3644,-10.3,1.25,-8.85,g);{const e=box(4.22,.04,.62,B(c),-10.3,2.52,-8.85,g);e.castShadow=false;}for(let r=0;r<3;r++){const sh=box(4,.06,.2,0x55677f,-10.3,.3+r*.74,-8.5,g);sh.castShadow=false;let x=-12.2;for(let q=0;q<13&&x<-8.6;q++){const w=.18+((q*7+r*3)%4)*.05,h=.46+((q*5+r)%3)*.08,col=[0x1f4e79,0x7b2d26,0x2e6b4f,0x8a6f2a,0x4b3f7a,0xdfe6ee][(q*3+r*2)%6];if((q+r*4)%7!==6){const b=box(w,h,.16,col,x+w/2,.33+r*.74+h/2,-8.5,g);b.castShadow=false;const lb=scr(g,x+w/2,.33+r*.74+h*.7,-8.41,w*.6,.08,0xffffff);}x+=w+.04;}}
  panel(g,10.4,2.2,-9.2,4.2,2.6,(x,W,H)=>{const T=mkT(x);x.fillStyle='#132233';x.fillRect(0,0,W,H);[['資訊安全','管理制度'],['資訊服務','管理制度'],['個人資料','保護管理']].forEach((s,i)=>{const a=30+i*(W-60)/3,w=(W-60)/3-16;rr(x,a,40,w,H-80,6,'#f4f1ea','#8a6f2a');x.strokeStyle='#c9a646';x.lineWidth=2;x.strokeRect(a+12,52,w-24,H-104);T('證書',a+w/2,104,34,'#8a6f2a','center');T(s[0],a+w/2,164,30,'#26313c','center');T(s[1],a+w/2,204,30,'#26313c','center');x.fillStyle='#c0392b';x.beginPath();x.arc(a+w/2,270,26,0,7);x.fill();x.fillStyle='#c9a646';x.beginPath();x.arc(a+w/2,270,15,0,7);x.fill();});});
  // 會議桌
  {const t=cyl(1.5,1.5,.1,0xa98f66,-10,.8,4.9,g,28);t.scale.z=1.3;cyl(.25,.5,.76,0x5b6672,-10,.38,4.9,g,12);[[-1.9,-1.1],[-1.9,1.1],[1.9,-1.1],[1.9,1.1],[0,-2.45],[0,2.45]].forEach((p,i)=>{const ch=new THREE.Group();ch.position.set(-10+p[0],0,4.9+p[1]);ch.rotation.y=Math.atan2(-p[0],-p[1]);g.add(ch);box(.5,.08,.5,0x26313c,0,.48,0,ch);box(.5,.55,.08,0x26313c,0,.8,-.25,ch);cyl(.05,.05,.46,0x5b6672,0,.24,0,ch,8);});
   box(.4,.03,.28,0x26313c,-10.5,.87,4.3,g);{const s=scr(g,-10.5,1.02,4.15,.4,.26,0x16324a);s.rotation.x=-.25;}box(.3,.02,.4,0xffffff,-9.5,.86,5.4,g);box(.3,.02,.4,0xffffff,-9.4,.86,4.5,g).rotation.y=.4;cyl(.07,.06,.13,0xf4f1ea,-10.3,.92,5.6,g,10);cyl(.16,.2,.1,0x26313c,-10,.9,4.9,g,12);{const e=cyl(.1,.1,.03,B(c),-10,.96,4.9,g,12);e.castShadow=false;}blk(-10,4,1.9);blk(-10,5.8,1.9);}
  // 天平
  pedestal(g,10.2,4.9,c);cyl(.07,.1,1.9,0xc9a646,10.2,1.25,4.9,g,10);sph(.13,0xc9a646,10.2,2.25,4.9,g);{const bm=new THREE.Group();bm.position.set(10.2,2.1,4.9);g.add(bm);box(2,.07,.07,0xc9a646,0,0,0,bm);[-1,1].forEach(s=>{const pn=new THREE.Group();pn.position.set(s,0,0);bm.add(pn);cyl(.012,.012,.7,0xdfe6ee,-.2,-.35,0,pn,4);cyl(.012,.012,.7,0xdfe6ee,.2,-.35,0,pn,4);cyl(.36,.3,.07,0xc9a646,0,-.72,0,pn,18);const b=box(.26,.2,.2,s<0?0x1f4e79:0x7b2d26,0,-.6,0,pn);bm.userData[s]=pn;});anim.push(tt=>{const a=Math.sin(tt*.9)*.12;bm.rotation.z=a;bm.userData[-1].rotation.z=-a;bm.userData[1].rotation.z=-a;});}blk(10.2,4.9,1.2);
  // 服務台看板與檔案櫃
  {box(.08,1.3,.08,0x8fa3b8,6.2,.65,6.9,g);box(.08,1.3,.08,0x8fa3b8,8.4,.65,6.9,g);panel(g,7.3,1.5,6.9,2.6,1.3,(x,W,H)=>{const T=mkT(x);x.fillStyle='#0b1c2c';x.fillRect(0,0,W,H);x.fillStyle=TC['IT 營運與治理'];x.fillRect(0,0,W,76);T('服務台',W/2,56,48,'#0b1c2c','center');[['等候中','3','#f2c14e'],['處理中','5','#39d6ff'],['今日結案','41','#4fe08a']].forEach((r,i)=>{const a=20+i*(W-40)/3,w=(W-40)/3;T(r[1],a+w/2,240,130,r[2],'center');T(r[0],a+w/2,320,40,'#e6f3ff','center');});});blk(7.3,6.9,1.3);}
  [2.6,3.7].forEach((zz,i)=>{box(.9,1.5,1,0x55677f,-12,.75,zz-1.6+i*.02,g);});[[12,2.2],[12,3.3]].forEach(p=>{box(.9,1.5,1,0x55677f,p[0],.75,p[1],g);for(let q=0;q<3;q++){const d=box(.04,.38,.8,0x8fa3b8,p[0]-.46,.3+q*.46,p[1],g);d.castShadow=false;const h=box(.05,.05,.24,0x26313c,p[0]-.5,.36+q*.46,p[1],g);h.castShadow=false;}blk(p[0],p[1],.8);});[1,2.12].forEach(zz=>{for(let q=0;q<3;q++){const d=box(.04,.38,.8,0x8fa3b8,-11.54,.3+q*.46,zz,g);d.castShadow=false;const h=box(.05,.05,.24,0x26313c,-11.5,.36+q*.46,zz,g);h.castShadow=false;}blk(-12,zz,.8);});}};
 // 每間都有的：地板格線、牆柱、踢腳燈
 const roomBase=(g,t,c)=>{const dim=new THREE.Color(TC[t]).multiplyScalar(.55).getHex();for(let i=-3;i<=3;i++){const l=box(.04,.012,16.4,B(dim),i*3.4,.062,-.5,g);l.castShadow=false;}for(let j=-2;j<=2;j++){const l=box(24.4,.012,.04,B(dim),0,.062,-.5+j*3.3,g);l.castShadow=false;}
  [-12.75,-7.75,7.75,12.75].forEach(x=>{box(.5,4.2,.2,0x26313c,x,2.1,-9.2,g);const e=box(.1,3.8,.05,B(c),x,2.1,-9.08,g);e.castShadow=false;});
  [-1,1].forEach(s=>{const e=box(.06,.08,17.6,B(c),s*12.82,.1,-.5,g);e.castShadow=false;for(let q=0;q<4;q++){box(.36,1.7,.4,0x26313c,s*13,.85,-6.5+q*4.4,g);}});{const e=box(25.6,.08,.06,B(c),0,.1,-9.22,g);e.castShadow=false;}};
 // --- 2 以後：每條路線一間房間 ---
 TRK.forEach((t,k)=>{const cs=api.adv.filter(c=>c.track===t),col=new THREE.Color(TC[t]).getHex(),z=mkZone(t,{rect:[-12.3,-8.3,12.3,7.6],cz:0}),g=z.g;
  box(26,.2,18,0x182538,0,-.1,-.5,g);box(24.6,.04,16.6,new THREE.Color(TC[t]).multiplyScalar(.22).getHex(),0,.02,-.5,g);box(21,.02,13,new THREE.Color(TC[t]).multiplyScalar(.32).getHex(),0,.05,-.9,g);
  box(26,4.2,.3,0x33455c,0,2.1,-9.4,g);{const e=box(26,.1,.34,B(col),0,4.25,-9.4,g);e.castShadow=false;}
  [-13,13].forEach(x=>{box(.3,1.4,18,0x33455c,x,.7,-.5,g);const e=box(.34,.08,18,B(col),x,1.44,-.5,g);e.castShadow=false;});box(26,.8,.3,0x33455c,0,.4,8.4,g);
  box(15.3,2.66,.1,0x1b2430,0,2.6,-9.27,g).castShadow=false;bigScreen(g,t);{const e=scr(g,0,2.6,-9.17,15,.05,col);e.material=holo(col,.5);anim.push(tt=>{e.position.y=1.46+((tt*.2)%1)*2.28;});}
  roomBase(g,t,col);plant(g,-12.2,7.3);plant(g,12.2,7.3);
  DECOR[t](g,col,(x,zz,r)=>z.blocks.push([z.ox+x,zz,r]));
  const cols=cs.length>4?Math.ceil(cs.length/2):cs.length,rows=cs.length>4?2:1;
  cs.forEach((c,i)=>{const r=Math.floor(i/cols),ci=i%cols,nrow=r===rows-1?cs.length-cols*r:cols,x=(ci-(nrow-1)/2)*5.2,zz=rows>1?(r?.3:-4.9):-2.7;
   const sg=new THREE.Group();sg.position.set(x,0,zz);g.add(sg);const rcH=new THREE.Color(c.rc).getHex();
   box(2,.8,.75,0x3b4b63,0,.4,.75,sg);box(2.06,.06,.81,0x55677f,0,.83,.75,sg);{const e=box(2.06,.05,.05,B(rcH),0,.6,1.14,sg);e.castShadow=false;}
   mon(sg,.5,.86,.75,0x16324a,Math.PI);box(.3,.03,.22,0xdfe6ee,-.45,.87,.8,sg);cyl(.07,.06,.13,0xf4f1ea,-.85,.92,.6,sg,10);
   box(.5,.08,.5,0x26313c,0,.48,-.75,sg);box(.5,.55,.08,0x26313c,0,.8,-1,sg);cyl(.05,.05,.46,0x5b6672,0,.24,-.75,sg,8);
   const m=person(rcH,HAIR[(i+k+3)%HAIR.length]);sc.remove(m);m.position.set(0,0,-.15);sg.add(m);
   spr(z,[c.name,c.npc],'#ffffff','#1c2a36',3.6,x,3.05,zz);
   z.blocks.push([z.ox+x,zz+.75,1.15]);stalls.push({c,x:z.ox+x,z:zz,lx:x,a:0,m,mk:null,adv:true,my:4.05,mw:1.8,zi:2+k,zg:g,fx:z.ox+x,fz:zz+2.2});});
  pad(z,0,5.6,0xf2c14e,['回傳送大廳'],'回傳送大廳',1);});
 BZ=-1;
 let zone=0;
 function ride(L){const from=zone;zone=L.to;const z=Z[zone];Z.forEach((q,i)=>q.g.visible=i===zone);
  const back=z.pads.find(p=>p.to===from)||z.pads[0],cx=z.ox,cz=z.cz||0,dx=cx-back.x,dz=cz-back.z,d=Math.hypot(dx,dz)||1;
  me.position.set(back.x+dx/d*2.8,0,back.z+dz/d*2.8);me.rotation.y=Math.atan2(dx,dz);target=null;want=null;path=[];ring.visible=false;
  sun.position.set(z.ox+14,30,16);sun.target.position.set(z.ox,0,0);sun.target.updateMatrixWorld();v3dRefresh();}
 sc.add(sun.target);
 // 玩家
 const me=person(0x17a07a,0x33271f);me.position.set(0,0,10);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.42,24),new THREE.MeshBasicMaterial({color:0x39d6ff,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;ring.visible=false;sc.add(ring);
 // 師傅頭上的標記：只更新目前區域的
 window.v3dRefresh=()=>stalls.forEach(s=>{if(s.zi!==zone)return;const t=api.tier(s.c),lk=s.adv&&api.locked(s.c);if(s.mk)s.zg.remove(s.mk);s.mk=label([lk?'未開放':t>=0?api.TIER[t]+'通過':'來上課'],lk?'#5b6672':t>=0?'#17a07a':'#c9860c','#ffffff',s.mw||2.2);s.my=s.my||6.3;s.mk.position.set(s.lx,s.my,s.z);s.zg.add(s.mk);});
 // 操作
 const keys={};let target=null,want=null,near=null,nearL=null,path=[];const act=()=>{if(near)api.talk(near.c);else if(nearL)ride(nearL);};
 const KM={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
 addEventListener('keydown',e=>{if(api.busy())return;if(KM[e.code]){keys[e.code]=1;target=null;want=null;path=[];ring.visible=false;if(e.code.startsWith('Arrow'))e.preventDefault();}
  if((e.code==='KeyE'||e.code==='Enter')&&(near||nearL)&&document.activeElement.tagName!=='BUTTON'){e.preventDefault();act();}});
 addEventListener('keyup',e=>{delete keys[e.code];});addEventListener('blur',()=>{for(const k in keys)delete keys[k];});
 const ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0),v2=new THREE.Vector2(),hit=new THREE.Vector3();
 R.domElement.addEventListener('pointerdown',e=>{if(api.busy())return;const b=R.domElement.getBoundingClientRect();v2.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(v2,cam);
  if(!ray.ray.intersectPlane(gp,hit))return;const s=stalls.find(s=>s.zi===zone&&Math.hypot(hit.x-s.x,hit.z-s.z)<3),P=Z[zone].pads.find(p=>Math.hypot(hit.x-p.x,hit.z-p.z)<1.6);
  path=[];if(s){target=[s.fx,s.fz];want=s;if(zone>1){const ox=Z[zone].ox,fr=stalls.filter(q=>q.zi===zone&&q.z>-3&&q.z<1).map(q=>q.x),S1=me.position.z>-1.3,S2=s.fz>-1.3;if(fr.length&&S1!==S2){const gx=[-4,-3,-2,-1,0,1,2,3,4].map(k=>ox+k*2.6).filter(x=>fr.every(f=>Math.abs(f-x)>2)).sort((a,b)=>Math.abs(a-me.position.x)+Math.abs(a-s.fx)-Math.abs(b-me.position.x)-Math.abs(b-s.fx))[0];path=[[gx,S1?-2.2:2.9],[s.fx,s.fz]];target=[gx,S1?Math.max(2.9,Math.min(me.position.z,3.1)):-2.2];}}}else if(P){target=[P.x,P.z];want=P;}else{target=[hit.x,hit.z];want=null;}{const e=path.length?path[path.length-1]:target;ring.position.set(e[0],.05,e[1]);}ring.visible=true;});
 tip.onclick=act;
 function step(dt){const z=Z[zone];let dx=0,dz=0;for(const k in keys){dx+=KM[k][0];dz+=KM[k][1];}
  if(!dx&&!dz&&target){dx=target[0]-me.position.x;dz=target[1]-me.position.z;if(Math.hypot(dx,dz)<.3&&path.length){target=path.shift();dx=target[0]-me.position.x;dz=target[1]-me.position.z;}else if(Math.hypot(dx,dz)<.3){target=null;ring.visible=false;dx=dz=0;if(want){const w=want;want=null;if(w.to!==undefined){ride(w);return;}api.talk(w.c);}}}
  const l=Math.hypot(dx,dz),mv=l>0;
  if(mv){dx/=l;dz/=l;let nx=me.position.x+dx*6.5*dt,nz=me.position.z+dz*6.5*dt;
   z.blocks.forEach(b=>{const d=Math.hypot(nx-b[0],nz-b[1]),r=b[2]+.35;if(d<r&&d>0){nx=b[0]+(nx-b[0])/d*r;nz=b[1]+(nz-b[1])/d*r;}});
   if(z.rect){nx=Math.max(z.ox+z.rect[0],Math.min(z.ox+z.rect[2],nx));nz=Math.max(z.rect[1],Math.min(z.rect[3],nz));}else{const d=Math.hypot(nx-z.ox,nz);if(d>z.circ){nx=z.ox+(nx-z.ox)*z.circ/d;nz*=z.circ/d;}}
   if(Math.hypot(nx-me.position.x,nz-me.position.z)<.01*dt*60&&target){target=null;want=null;path=[];ring.visible=false;}
   me.position.x=nx;me.position.z=nz;let da=Math.atan2(dx,dz)-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*12);}
  const t=performance.now()/1000,sw=mv?Math.sin(t*11)*.6:0;me.userData.L[0].rotation.x=sw;me.userData.L[1].rotation.x=-sw;me.userData.A[0].rotation.x=-sw;me.userData.A[1].rotation.x=sw;
  for(let i=0;i<anim.length;i++)if(anim[i].z===zone)anim[i](t);
  near=null;let bd=zone>1?2.5:3.4;stalls.forEach((s,i)=>{if(s.zi!==zone)return;const d=Math.hypot(me.position.x-s.fx,me.position.z-s.fz);if(d<bd){bd=d;near=s;}s.m.position.y=(s.adv?0:.12)+Math.sin(t*2+i)*.03;if(s.mk)s.mk.position.y=s.my+Math.sin(t*3+i)*.08;});
  nearL=null;if(!near)z.pads.forEach(L=>{if(Math.hypot(me.position.x-L.x,me.position.z-L.z)<1.5)nearL=L;});
  if(near){tip.textContent='跟'+near.c.npc+'說話（E）';tip.hidden=false;}else if(nearL){tip.textContent=nearL.txt+'（E）';tip.hidden=false;}else tip.hidden=true;
  const px=me.position.x-z.ox,pz=me.position.z;
  if(zone===0){const fx=px*.6,fz=pz*.55-5.5;cam.position.set(fx,29,fz+29);cam.lookAt(fx,1,fz);}
  else if(zone===1){const fx=z.ox+px*.4,fz=pz*.4-2;cam.position.set(fx,22,fz+21);cam.lookAt(fx,1,fz);}
  else{const fx=z.ox+px*.5,fz=pz*.5-2;cam.position.set(fx,21,fz+18);cam.lookAt(fx,1.2,fz);}}
 function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<1.1?52:38;cam.updateProjectionMatrix();}
 if(window.ResizeObserver)new ResizeObserver(size).observe(host);addEventListener('resize',size);size();
 let last=performance.now();(function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(!host.clientWidth)return;if(!api.busy())step(dt);R.render(sc,cam);})(last);
 window.v3dState=()=>({x:me.position.x,z:me.position.z,zone,zname:Z[zone].name,near:near&&near.c.id,lift:nearL&&nearL.txt,pads:Z[zone].pads.map(p=>[p.x,p.z,p.to])});window.v3dGo=id=>{const s=stalls.find(q=>q.c.id===id),v=new THREE.Vector3(s.x,1,s.z).project(cam),b=R.domElement.getBoundingClientRect();return[b.left+(v.x+1)/2*b.width,b.top+(1-v.y)/2*b.height];};window.v3dRide=to=>ride({to:to===undefined?(zone?0:1):to});
};
