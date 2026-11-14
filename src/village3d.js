// 3D 職訓中心：中庭周圍九間主題實習教室，後面是還沒開的進階專科大樓。WASD／方向鍵或點地板走路，靠近師傅或電梯按 E 說話。
window.initVillage3D=function(api){
 const host=document.getElementById('stage');host.className='v3d';
 host.innerHTML='<span class="how">WASD／方向鍵或點地板走路，靠近師傅或電梯按 E</span><button class="btn tip" id="v3tip" hidden></button>';
 const tip=document.getElementById('v3tip');
 let R;try{R=new THREE.WebGLRenderer({antialias:true});}catch(e){host.className='';host.innerHTML='<p class="lead">這台電腦開不了 3D，請改用 2D 版。</p>';return;}
 R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
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
 // 進階專科大樓內部：放在很遠的地方，搭電梯過去。六條路線各一間房間，沒有屋頂；後排四間小的，左右各一間大的
 const OX=300,blocks2=[],rects=[],rooms=[],H=new THREE.Group();H.position.x=OX;sc.add(H);
 const floorText=(txt,col,w)=>{const cv=document.createElement('canvas');cv.width=txt.length*112+40;cv.height=160;const x=cv.getContext('2d');x.font='900 104px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=10;x.strokeStyle='rgba(8,16,30,.9)';x.strokeText(txt,cv.width/2,84);x.fillStyle=col;x.fillText(txt,cv.width/2,84);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*160/cv.width),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;return m;};
 box(46,.2,33,0x182538,0,-.1,-2,H);{const gr=new THREE.GridHelper(46,23,0x2a4a68,0x20344c);gr.position.set(0,.012,-2);gr.scale.z=33/46;H.add(gr);}
 box(46,9,.5,0x1c2b40,0,4.5,-18.2,H);box(.5,9,33,0x1c2b40,-23,4.5,-2,H);box(.5,9,33,0x1c2b40,23,4.5,-2,H);
 for(let k=0;k<9;k++)scr(H,-20+k*5,6.6,-17.9,3.4,3,k%2?0x16324a:0x1d4466);{const e=box(46,.12,.1,B(CY),0,8.6,-17.9,H);e.castShadow=false;}
 // 牆：w(x0,z0,x1,z1,高度,頂邊顏色)，同時登記成不能穿過的矩形
 const wall=(x0,z0,x1,z1,h,col)=>{const w=Math.abs(x1-x0)||.3,d=Math.abs(z1-z0)||.3,cx=(x0+x1)/2,cz=(z0+z1)/2;box(w,h,d,0x33455c,cx,h/2,cz,H);if(col!=null){const e=box(w+.02,.08,d+.02,B(col),cx,h+.04,cz,H);e.castShadow=false;}rects.push([OX+cx-w/2,cz-d/2,OX+cx+w/2,cz+d/2]);};
 const solid=(x0,z0,x1,z1)=>rects.push([OX+x0,z0,OX+x1,z1]);
 const plant=(x,z,g)=>{cyl(.26,.2,.42,0x4b5d75,x,.21,z,g||H,10);sph(.42,0x3f9a6a,x,.85,z,g||H);sph(.26,0x55b57e,x+.12,1.2,z-.05,g||H);};
 const TC={'系統與基礎設施':'#39d6ff','網路與通訊':'#4fe08a','資訊安全':'#ff7b6b','資料庫與資料平台':'#c79bff','軟體開發與整合':'#3fd6c8','IT 營運與治理':'#f2c14e'};
 const byTrack={};api.adv.forEach(c=>{(byTrack[c.track]=byTrack[c.track]||[]).push(c);});
 // 一位大師的座位：桌子、螢幕、椅子，大師站在桌子後面朝南
 function seat(c,x,z,idx){const g=new THREE.Group();g.position.set(x,0,z);H.add(g);const rcH=new THREE.Color(c.rc).getHex();
  box(2,.8,.75,0x3b4b63,0,.4,.75,g);box(2.06,.06,.81,0x55677f,0,.83,.75,g);{const e=box(2.06,.05,.05,B(rcH),0,.6,1.14,g);e.castShadow=false;}
  mon(g,.5,.86,.75,0x16324a,Math.PI);box(.3,.03,.22,0xdfe6ee,-.45,.87,.8,g);cyl(.07,.06,.13,0xf4f1ea,-.85,.92,.6,g,10);
  box(.5,.08,.5,0x26313c,0,.48,-.75,g);box(.5,.55,.08,0x26313c,0,.8,-1,g);cyl(.05,.05,.46,0x5b6672,0,.24,-.75,g,8);
  const m=person(rcH,HAIR[(idx+3)%HAIR.length]);sc.remove(m);m.position.set(0,0,-.15);g.add(m);
  const sign=label([c.name,c.npc],'#ffffff','#1c2a36',3.1);sign.position.set(OX+x,3.25,z);sc.add(sign);
  blocks2.push([OX+x,z+.75,1.15]);stalls.push({c,x:OX+x,z,a:0,m,mk:null,adv:true,my:4.25,mw:1.7,fx:OX+x,fz:z+2.2});}
 // 一間房間：地板、牆、門上的路線牌、裡面的擺設
 function room(track,x0,z0,x1,z1,door,seats){const col=new THREE.Color(TC[track]).getHex(),w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,cs=byTrack[track]||[];
  box(w,.05,d,new THREE.Color(TC[track]).multiplyScalar(.2).getHex(),cx,.03,cz,H);box(w-1.4,.02,d-1.4,new THREE.Color(TC[track]).multiplyScalar(.3).getHex(),cx,.065,cz,H);
  let io,sx,sz;
  if(door==='s'){wall(x0,z1,cx-1.3,z1,1,col);wall(cx+1.3,z1,x1,z1,1,col);wall(x0,z0,x0,z1,2.3,col);wall(x1,z0,x1,z1,2.3,col);box(.34,2.6,.34,0x4b5d75,cx-1.3,1.3,z1,H);box(.34,2.6,.34,0x4b5d75,cx+1.3,1.3,z1,H);{const e=box(2.9,.14,.2,B(col),cx,2.6,z1,H);e.castShadow=false;}
   io={out:[OX+cx,z1+1.3],in:[OX+cx,z1-1.3]};sx=cx;sz=z1;
   scr(H,cx,2.6,z0+.3,w-2.2,1.5,0x10283c);{const e=scr(H,cx,2.6,z0+.33,w-2.6,.08,col);anim.push(t=>{e.position.y=2+((t*.25)%1)*1.2;});}plant(x0+.8,z0+.9);box(.9,1.6,.5,0x3b4b63,x1-.9,.8,z0+.7,H);for(let k=0;k<3;k++)scr(H,x1-.9,.4+k*.5,z0+.96,.7,.06,col);}
  else{const sgn=door==='e'?1:-1,xd=door==='e'?x1:x0,dz=cz;wall(xd,z0,xd,dz-1.4,1,col);wall(xd,dz+1.4,xd,z1,1,col);wall(x0,z0,x1,z0,2.3,col);wall(x0,z1,x1,z1,1,col);box(.34,2.6,.34,0x4b5d75,xd,1.3,dz-1.4,H);box(.34,2.6,.34,0x4b5d75,xd,1.3,dz+1.4,H);{const e=box(.2,.14,3.1,B(col),xd,2.6,dz,H);e.castShadow=false;}
   io={out:[OX+xd+sgn*1.3,dz],in:[OX+xd-sgn*1.3,dz]};sx=xd;sz=dz;
   scr(H,cx,2.9,z0+.3,w-2.4,1.6,0x10283c);{const e=scr(H,cx,2.9,z0+.33,w-2.8,.08,col);anim.push(t=>{e.position.y=2.25+((t*.25)%1)*1.3;});}
   const ox=door==='e'?x0+.9:x1-.9;plant(ox,z0+1);plant(ox,z1-1);for(let k=0;k<3;k++){box(.8,2,.7,0x26313c,ox,1,cz-1.6+k*1.6,H);for(let j=0;j<5;j++){const dd=scr(H,ox+(door==='e'?.42:-.42),.4+j*.36,cz-1.6+k*1.6,.05,.08,j%2?0x4fe08a:col);dd.rotation.y=Math.PI/2;anim.push(t=>{dd.visible=Math.sin(t*(3+j)+k*2)>-.4;});}}
   box(2.6,.5,1.1,0x3b4b63,cx+(door==='e'?1.2:-1.2),.25,cz,H);box(2.6,.08,1.1,0x55677f,cx+(door==='e'?1.2:-1.2),.54,cz,H);solid(cx+(door==='e'?1.2:-1.2)-1.4,cz-.65,cx+(door==='e'?1.2:-1.2)+1.4,cz+.65);}
  const sg=label([track],TC[track],'#10202e',Math.max(3.4,track.length*.62));sg.position.set(OX+sx,3.6,sz);sc.add(sg);
  rooms.push({x0:OX+x0,z0,x1:OX+x1,z1,out:io.out,in:io.in});cs.forEach((c,k)=>{const s=seats[k]||seats[seats.length-1];seat(c,s[0],s[1],stalls.length);});}
 room('網路與通訊',-13,-17.6,-6.5,-10,'s',[[-9.75,-14.6]]);
 room('資訊安全',-6.5,-17.6,0,-10,'s',[[-4.85,-14.6],[-1.65,-14.6]]);
 room('資料庫與資料平台',0,-17.6,6.5,-10,'s',[[3.25,-14.6]]);
 room('軟體開發與整合',6.5,-17.6,13,-10,'s',[[9.75,-14.6]]);
 room('系統與基礎設施',-22.6,-9,-13,8,'e',[[-20.4,-6],[-16.2,-6],[-20.4,3.6],[-16.2,3.6]]);
 room('IT 營運與治理',13,-9,22.6,8,'w',[[16.2,-6],[20.4,-6],[16.2,3.6],[20.4,3.6]]);
 // 四個角落不開放：後面是機櫃，前面是休息區
 [[-22.6,-17.6,-13,-9],[13,-17.6,22.6,-9]].forEach(q=>{solid(q[0],q[1],q[2],q[3]+.1);box(q[2]-q[0],.06,q[3]-q[1],0x121c2b,(q[0]+q[2])/2,.03,(q[1]+q[3])/2,H);for(let k=0;k<4;k++){const x=q[0]+1.4+k*2.2;box(1.2,2.8,1.4,0x1b2636,x,1.4,q[1]+2.2,H);for(let j=0;j<6;j++){const dd=scr(H,x,.5+j*.38,q[1]+2.92,.8,.05,j%3?0x2f86b8:0x4fe08a);anim.push(t=>{dd.visible=Math.sin(t*(2+j*.6)+k)>-.5;});}}box(q[2]-q[0],1,.3,0x33455c,(q[0]+q[2])/2,.5,q[3],H);});
 [[-22.6,8,-13,14.4],[13,8,22.6,14.4]].forEach(q=>{solid(q[0],q[1]-.1,q[2],q[3]);const cx=(q[0]+q[2])/2;box(q[2]-q[0],.06,q[3]-q[1],0x1f3147,cx,.03,(q[1]+q[3])/2,H);box(3.4,.45,1.1,0x3f6f8f,cx,.25,11,H);box(3.4,.6,.25,0x3f6f8f,cx,.6,11.5,H);box(1.2,.4,1.2,0x55677f,cx,.2,9.3,H);plant(cx-2.6,10.8);plant(cx+2.6,10.8);plant(q[0]+1,13.4);plant(q[2]-1,13.4);});
 // 大廳：中央標誌、服務台
 {const o=new THREE.Mesh(new THREE.RingGeometry(3.3,3.45,48),B(CY));o.rotation.x=-Math.PI/2;o.position.y=.03;H.add(o);const ct=floorText('進階專科大樓','#39d6ff',5);ct.position.set(0,.05,-.3);H.add(ct);const c2=floorText('六條路線，各在一間房間','#bfefff',4.6);c2.position.set(0,.05,1);H.add(c2);
  const l=label(['進階專科大樓'],'#ffffff','#fff',5);l.position.set(OX,9.6,-17.5);sc.add(l);plant(-11.6,-8.2);plant(11.6,-8.2);plant(-11.6,12.6);plant(11.6,12.6);}
 // 電梯：中庭和大樓之間來回
 const lifts=[[9.5,9.5,'搭電梯到進階專科大樓'],[OX,11.6,'搭電梯回中庭']].map((q,k)=>{cyl(1.3,1.4,.14,0x33455c,q[0],.07,q[1],null,24);const o=new THREE.Mesh(new THREE.RingGeometry(1.05,1.22,32),B(0xf2c14e));o.rotation.x=-Math.PI/2;o.position.set(q[0],.16,q[1]);sc.add(o);
  const bm=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,3.2,24,1,true),new THREE.MeshBasicMaterial({color:0xf2c14e,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}));bm.position.set(q[0],1.7,q[1]);sc.add(bm);anim.push(t=>{bm.material.opacity=.1+Math.sin(t*2)*.05;});
  const l=label([k?'回中庭':'進階專科大樓'],'#ffffff','#fff',k?2.4:3.6);l.position.set(q[0],4,q[1]);sc.add(l);return {x:q[0],z:q[1],txt:q[2],to:k?0:1};});
 let zone=0;const ZC=()=>zone?OX:0;
 function ride(L){zone=L.to;const d=lifts[L.to?1:0];me.position.set(d.x,0,d.z-2.2);me.rotation.y=Math.PI;target=null;path=[];want=null;ring.visible=false;sun.position.set(ZC()+14,30,16);sun.target.position.set(ZC(),0,0);sun.target.updateMatrixWorld();}
 sc.add(sun.target);
 // 玩家
 const me=person(0x17a07a,0x33271f);me.position.set(0,0,10);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.42,24),new THREE.MeshBasicMaterial({color:0x39d6ff,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;ring.visible=false;sc.add(ring);
 // 師傅頭上的標記
 window.v3dRefresh=()=>stalls.forEach(s=>{const t=api.tier(s.c),lk=s.adv&&api.locked(s.c);if(s.mk)sc.remove(s.mk);s.mk=label([lk?'未開放':t>=0?api.TIER[t]+'通過':'來上課'],lk?'#5b6672':t>=0?'#17a07a':'#c9860c','#ffffff',s.mw||2.2);s.my=s.my||6.3;s.mk.position.set(s.x,s.my,s.z);sc.add(s.mk);});
 // 操作
 const keys={};let target=null,want=null,near=null,nearL=null,path=[];const act=()=>{if(near)api.talk(near.c);else if(nearL)ride(nearL);};
 const KM={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
 addEventListener('keydown',e=>{if(api.busy())return;if(KM[e.code]){keys[e.code]=1;target=null;path=[];want=null;ring.visible=false;if(e.code.startsWith('Arrow'))e.preventDefault();}
  if((e.code==='KeyE'||e.code==='Enter')&&(near||nearL)&&document.activeElement.tagName!=='BUTTON'){e.preventDefault();act();}});
 addEventListener('keyup',e=>{delete keys[e.code];});addEventListener('blur',()=>{for(const k in keys)delete keys[k];});
 const ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0),v2=new THREE.Vector2(),hit=new THREE.Vector3();
 R.domElement.addEventListener('pointerdown',e=>{if(api.busy())return;const b=R.domElement.getBoundingClientRect();v2.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(v2,cam);
  if(!ray.ray.intersectPlane(gp,hit))return;let s=stalls.find(s=>Math.hypot(hit.x-s.x,hit.z-s.z)<3.2);
  let goal;if(s){goal=[s.fx,s.fz];want=s;}else{goal=[hit.x,hit.z];want=null;}path=[];
  if(zone){const ro=(x,z)=>rooms.find(r=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1),a=ro(me.position.x,me.position.z),b=ro(goal[0],goal[1]);if(a!==b){if(a)path.push(a.in,a.out);if(b)path.push(b.out,b.in);}}
  path.push(goal);target=path.shift();ring.position.set(goal[0],.05,goal[1]);ring.visible=true;});
 tip.onclick=act;
 function step(dt){let dx=0,dz=0;for(const k in keys){dx+=KM[k][0];dz+=KM[k][1];}
  if(!dx&&!dz&&target){dx=target[0]-me.position.x;dz=target[1]-me.position.z;if(Math.hypot(dx,dz)<.3){if(path.length){target=path.shift();dx=target[0]-me.position.x;dz=target[1]-me.position.z;}else{target=null;ring.visible=false;dx=dz=0;if(want){const w=want;want=null;api.talk(w.c);}}}}
  const l=Math.hypot(dx,dz),mv=l>0;
  if(mv){dx/=l;dz/=l;let nx=me.position.x+dx*6.5*dt,nz=me.position.z+dz*6.5*dt;
   (zone?blocks2:blocks).forEach(b=>{const d=Math.hypot(nx-b[0],nz-b[1]),r=b[2]+.35;if(d<r&&d>0){nx=b[0]+(nx-b[0])/d*r;nz=b[1]+(nz-b[1])/d*r;}});
   if(zone){nx=Math.max(OX-22.2,Math.min(OX+22.2,nx));nz=Math.max(-17.2,Math.min(13.6,nz));const P=.38,hitR=(x,z)=>rects.some(r=>x>r[0]-P&&x<r[2]+P&&z>r[1]-P&&z<r[3]+P),ox=me.position.x,oz=me.position.z;if(hitR(nx,nz)){if(!hitR(nx,oz))nz=oz;else if(!hitR(ox,nz))nx=ox;else{nx=ox;nz=oz;}}}else{const d=Math.hypot(nx,nz);if(d>21.8){nx*=21.8/d;nz*=21.8/d;}}
   if(Math.hypot(nx-me.position.x,nz-me.position.z)<.01*dt*60&&target){target=null;path=[];want=null;ring.visible=false;}
   me.position.x=nx;me.position.z=nz;let da=Math.atan2(dx,dz)-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*12);}
  const t=performance.now()/1000,sw=mv?Math.sin(t*11)*.6:0;me.userData.L[0].rotation.x=sw;me.userData.L[1].rotation.x=-sw;me.userData.A[0].rotation.x=-sw;me.userData.A[1].rotation.x=sw;
  anim.forEach(f=>f(t));near=null;let bd=3.4;stalls.forEach((s,i)=>{const d=Math.hypot(me.position.x-s.fx,me.position.z-s.fz);if(d<bd){bd=d;near=s;}s.m.position.y=(s.adv?.16:.12)+Math.sin(t*2+i)*.03;if(s.mk)s.mk.position.y=s.my+Math.sin(t*3+i)*.08;});
  nearL=null;if(!near)lifts.forEach(L=>{if(Math.hypot(me.position.x-L.x,me.position.z-L.z)<1.5)nearL=L;});
  if(near){tip.textContent='跟'+near.c.npc+'說話（E）';tip.hidden=false;}else if(nearL){tip.textContent=nearL.txt+'（E）';tip.hidden=false;}else tip.hidden=true;
  if(zone){const fx=OX+(me.position.x-OX)*.5,fz=me.position.z*.45-4.5;cam.position.set(fx,31,fz+25);cam.lookAt(fx,1,fz);}else{const fx=me.position.x*.6,fz=me.position.z*.55-5.5;cam.position.set(fx,29,fz+29);cam.lookAt(fx,1,fz);}}
 function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<1.1?52:38;cam.updateProjectionMatrix();}
 if(window.ResizeObserver)new ResizeObserver(size).observe(host);addEventListener('resize',size);size();
 let last=performance.now();(function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(!host.clientWidth)return;if(!api.busy())step(dt);R.render(sc,cam);})(last);
 window.v3dState=()=>({x:me.position.x,z:me.position.z,zone,near:near&&near.c.id,lift:!!nearL});window.v3dRide=()=>ride(lifts[zone?1:0]);
};
