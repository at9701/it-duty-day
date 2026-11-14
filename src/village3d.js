// 3D 職訓中心：中庭周圍九間主題實習教室，後面是還沒開的進階專科大樓。WASD／方向鍵或點地板走路，靠近師傅按 E 說話。
window.initVillage3D=function(api){
 const host=document.getElementById('stage');host.className='v3d';
 host.innerHTML='<span class="how">WASD／方向鍵或點地板走路，靠近師傅按 E</span><button class="btn tip" id="v3tip" hidden></button>';
 const tip=document.getElementById('v3tip');
 let R;try{R=new THREE.WebGLRenderer({antialias:true});}catch(e){host.className='';host.innerHTML='<p class="lead">這台電腦開不了 3D，請改用 2D 版。</p>';return;}
 R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
 host.insertBefore(R.domElement,host.firstChild);
 const sc=new THREE.Scene();sc.background=new THREE.Color(0xbfe3f5);sc.fog=new THREE.Fog(0xbfe3f5,45,95);
 const cam=new THREE.PerspectiveCamera(36,16/9,.5,200);
 sc.add(new THREE.HemisphereLight(0xffffff,0x88a070,.62));
 const sun=new THREE.DirectionalLight(0xfff2d8,.72);sun.position.set(18,30,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 const s=sun.shadow.camera;s.left=-30;s.right=30;s.top=30;s.bottom=-30;s.far=90;sc.add(sun);
 const mats={};const M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
 const add=(g,m,x,y,z,p)=>{const o=new THREE.Mesh(g,typeof m==='object'?m:M(m));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(p||sc).add(o);return o;};
 const box=(w,h,d,c,x,y,z,p)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
 const cyl=(r1,r2,h,c,x,y,z,p,n)=>add(new THREE.CylinderGeometry(r1,r2,h,n||16),c,x,y,z,p);
 const sph=(r,c,x,y,z,p)=>add(new THREE.SphereGeometry(r,16,12),c,x,y,z,p);
 const flat=(g,c,y)=>{const o=new THREE.Mesh(g,M(c));o.rotation.x=-Math.PI/2;o.position.y=y;o.receiveShadow=true;sc.add(o);return o;};
 // 文字牌：永遠面向鏡頭
 function label(lines,bg,fg,w){const cv=document.createElement('canvas');cv.width=512;cv.height=lines.length>1?176:112;const x=cv.getContext('2d');
  x.fillStyle=bg;const r=28;x.beginPath();x.moveTo(r,4);x.arcTo(508,4,508,cv.height-4,r);x.arcTo(508,cv.height-4,4,cv.height-4,r);x.arcTo(4,cv.height-4,4,4,r);x.arcTo(4,4,508,4,r);x.fill();
  x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';
  if(lines.length>1){x.font='700 64px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';x.fillText(lines[0],256,62);x.font='400 42px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';x.fillText(lines[1],256,130);}
  else{x.font='700 60px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';x.fillText(lines[0],256,58);}
  const t=new THREE.CanvasTexture(cv);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false}));sp.scale.set(w,w*cv.height/512,1);return sp;}
 // 地面
 flat(new THREE.CircleGeometry(95,48),0x7fb86e,0);flat(new THREE.RingGeometry(10.4,12.6,64),0xdcc793,.02);flat(new THREE.CircleGeometry(6.2,40),0xc9c5ba,.03);{const p=new THREE.Mesh(new THREE.PlaneGeometry(2.4,11),M(0xdcc793));p.rotation.x=-Math.PI/2;p.position.set(0,.02,17.5);p.receiveShadow=true;sc.add(p);}
 const N=api.courses.length,RS=16.4,blocks=[],AN=i=>Math.PI-(i-(N-1)/2)*.41;
 for(let i=0;i<N;i++){const a=AN(i),p=new THREE.Mesh(new THREE.PlaneGeometry(1.8,6),M(0xdcc793));p.rotation.x=-Math.PI/2;p.rotation.z=-a;p.position.set(Math.sin(a)*8.6,.02,Math.cos(a)*8.6);p.receiveShadow=true;sc.add(p);}
 // 中庭：噴水池和旗桿
 const anim=[];const B=c=>new THREE.MeshBasicMaterial({color:c});
 cyl(2.6,2.7,.5,0xb9b4a6,0,.25,0,null,24);cyl(2.3,2.3,.12,B(0x6fc3e8),0,.5,0,null,24);cyl(.35,.45,1.3,0xb9b4a6,0,.9,0,null,12);cyl(.9,.5,.2,0xb9b4a6,0,1.6,0,null,16);
 for(let k=0;k<6;k++){const d=sph(.13,B(0xcfeeff),0,0,0);anim.push(t=>{const u=((t*.9+k/6)%1),a=k/6*Math.PI*2;d.position.set(Math.sin(a)*u*1.5,1.7+Math.sin(u*Math.PI)*1.1-u*1.1,Math.cos(a)*u*1.5);});}
 blocks.push([0,0,2.7]);cyl(.07,.07,6,0xcfd3d8,-4.6,3,-1.5,null,8);{const f=box(1.5,.9,.04,0x17a07a,-3.8,5.4,-1.5);anim.push(t=>{f.rotation.y=Math.sin(t*2)*.18;});}
 const hall=label(['中庭'],'#ffffff','#1c2a36',2.6);hall.position.set(0,3.6,0);sc.add(hall);
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
  box(5,.12,4,c.col,0,.06,0,g);box(5,.04,.5,c.rc,0,.13,1.75,g);box(5,3,.16,0xf3ead6,0,1.56,-1.9,g);box(5,.45,.2,c.rc,0,2.86,-1.9,g);box(.16,1.15,4,0xf3ead6,-2.5,.63,0,g);box(.16,1.15,4,0xf3ead6,2.5,.63,0,g);box(.2,.1,4,c.rc,-2.5,1.25,0,g);box(.2,.1,4,c.rc,2.5,1.25,0,g);
  (PROPS[c.id]||(()=>{}))(g);
  const m=person(c.rc,HAIR[i%HAIR.length]);sc.remove(m);m.position.set(-.2,.12,.9);g.add(m);
  const sign=label([c.npc,c.name],'#ffffff','#1c2a36',4.3);sign.position.set(x,4.6,z);sc.add(sign);
  blocks.push([x,z,2.5]);blocks.push([x+Math.sin(a)*1.6,z+Math.cos(a)*1.6,2.4]);return {c,x,z,a,m,mk:null,fx:Math.sin(a)*(RS-3.6),fz:Math.cos(a)*(RS-3.6)};});
 // 圍籬、樹、進階專科的門
 const GA=[0],RF=24.5;
 for(let i=0;i<96;i++){const a=i/96*Math.PI*2;if(Math.abs(a-Math.PI)<.8||a<.12||a>Math.PI*2-.15)continue;cyl(.09,.09,1,0xb98a56,Math.sin(a)*RF,.5,Math.cos(a)*RF,null,6);const r=box(1.65,.1,.06,0xb98a56,Math.sin(a+.0327)*RF,.72,Math.cos(a+.0327)*RF);r.rotation.y=a+.0327;}
 // 後面的大樓：進階專科，還沒開
 box(34,7,5,0xe4ddd0,0,3.5,-25.5);box(34.4,.5,5.4,0x8b8f97,0,7.2,-25.5);for(let r=0;r<2;r++)for(let k=0;k<12;k++){if(r===0&&(k===5||k===6))continue;scr(sc,-15.4+k*2.8,2.2+r*2.8,-22.97,1.6,1.5,0x8fc4e6);}
 box(3.4,3.2,.2,0x5b6672,0,1.6,-22.95);box(.1,3.2,.24,DK,0,1.6,-22.93);box(.5,.5,.26,0xf2c14e,0,1.7,-22.9);
 {const l=label(['進階專科大樓','籌備中'],'#2c3642','#ffffff',6);l.position.set(0,8.9,-23);sc.add(l);}
 box(.4,3.4,.4,0x9a6b3f,-2.4,1.7,20.5);box(.4,3.4,.4,0x9a6b3f,2.4,1.7,20.5);box(5.8,.5,.5,0xc65b4a,0,3.6,20.5);{const l=label(['資訊職訓中心'],'#c65b4a','#ffffff',4.4);l.position.set(0,4.6,20.5);sc.add(l);}
 let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<70;i++){const a=rnd()*Math.PI*2,r=i<10?19+rnd()*2.5:25+rnd()*38,x=Math.sin(a)*r,z=Math.cos(a)*r,h=1.6+rnd()*1.4;
  if(r<23&&api.courses.some((c,k)=>Math.abs(((a-AN(k)+Math.PI*5)%(Math.PI*2))-Math.PI)<.2))continue;
  if(z<-19&&Math.abs(x)<20)continue;
  cyl(.16,.22,h,0x8a623c,x,h/2,z,null,7);sph(1+rnd()*.6,rnd()<.5?0x4f9a57:0x63ad66,x,h+.7,z).scale.y=1.15;if(r<23)blocks.push([x,z,.6]);}
 for(let i=0;i<26;i++){const a=rnd()*Math.PI*2,r=4+rnd()*17;if(r>9.8&&r<18.5)continue;const x=Math.sin(a)*r,z=Math.cos(a)*r;if(r<7)continue;sph(.16,[0xf2c14e,0xe86a8f,0xffffff][i%3],x,.14,z);}
 // 玩家
 const me=person(0x17a07a,0x33271f);me.position.set(0,0,10);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.42,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;ring.visible=false;sc.add(ring);
 // 師傅頭上的標記
 window.v3dRefresh=()=>stalls.forEach(s=>{const t=api.tier(s.c);if(s.mk)sc.remove(s.mk);s.mk=label([t>=0?api.TIER[t]+'通過':'來上課'],t>=0?'#17a07a':'#c9860c','#ffffff',2.2);s.mk.position.set(s.x,6,s.z);sc.add(s.mk);});
 // 操作
 const keys={};let target=null,want=null,near=null;
 const KM={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
 addEventListener('keydown',e=>{if(api.busy())return;if(KM[e.code]){keys[e.code]=1;target=null;want=null;ring.visible=false;if(e.code.startsWith('Arrow'))e.preventDefault();}
  if((e.code==='KeyE'||e.code==='Enter')&&near&&document.activeElement.tagName!=='BUTTON'){e.preventDefault();api.talk(near.c);}});
 addEventListener('keyup',e=>{delete keys[e.code];});addEventListener('blur',()=>{for(const k in keys)delete keys[k];});
 const ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0),v2=new THREE.Vector2(),hit=new THREE.Vector3();
 R.domElement.addEventListener('pointerdown',e=>{if(api.busy())return;const b=R.domElement.getBoundingClientRect();v2.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(v2,cam);
  if(!ray.ray.intersectPlane(gp,hit))return;let s=stalls.find(s=>Math.hypot(hit.x-s.x,hit.z-s.z)<3.2);
  if(s){target=[s.fx,s.fz];want=s;}else{target=[hit.x,hit.z];want=null;}ring.position.set(target[0],.05,target[1]);ring.visible=true;});
 tip.onclick=()=>{if(near)api.talk(near.c);};
 function step(dt){let dx=0,dz=0;for(const k in keys){dx+=KM[k][0];dz+=KM[k][1];}
  if(!dx&&!dz&&target){dx=target[0]-me.position.x;dz=target[1]-me.position.z;if(Math.hypot(dx,dz)<.25){target=null;ring.visible=false;dx=dz=0;if(want){const w=want;want=null;api.talk(w.c);}}}
  const l=Math.hypot(dx,dz),mv=l>0;
  if(mv){dx/=l;dz/=l;let nx=me.position.x+dx*6.5*dt,nz=me.position.z+dz*6.5*dt;
   blocks.forEach(b=>{const d=Math.hypot(nx-b[0],nz-b[1]),r=b[2]+.35;if(d<r&&d>0){nx=b[0]+(nx-b[0])/d*r;nz=b[1]+(nz-b[1])/d*r;}});
   const d=Math.hypot(nx,nz);if(d>21.8){nx*=21.8/d;nz*=21.8/d;}
   if(Math.hypot(nx-me.position.x,nz-me.position.z)<.01*dt*60&&target){target=null;ring.visible=false;}
   me.position.x=nx;me.position.z=nz;let da=Math.atan2(dx,dz)-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*12);}
  const t=performance.now()/1000,sw=mv?Math.sin(t*11)*.6:0;me.userData.L[0].rotation.x=sw;me.userData.L[1].rotation.x=-sw;me.userData.A[0].rotation.x=-sw;me.userData.A[1].rotation.x=sw;
  anim.forEach(f=>f(t));near=null;let bd=3.4;stalls.forEach((s,i)=>{const d=Math.hypot(me.position.x-s.fx,me.position.z-s.fz);if(d<bd){bd=d;near=s;}s.m.position.y=.12+Math.sin(t*2+i)*.03;anim.length&&0;if(s.mk)s.mk.position.y=6+Math.sin(t*3+i)*.08;});
  if(near){tip.textContent='跟'+near.c.npc+'說話（E）';tip.hidden=false;}else tip.hidden=true;
  const fx=me.position.x*.6,fz=me.position.z*.55-5.5;cam.position.set(fx,29,fz+29);cam.lookAt(fx,1,fz);}
 function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<1.1?52:38;cam.updateProjectionMatrix();}
 if(window.ResizeObserver)new ResizeObserver(size).observe(host);addEventListener('resize',size);size();
 let last=performance.now();(function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(!host.clientWidth)return;if(!api.busy())step(dt);R.render(sc,cam);})(last);
 window.v3dState=()=>({x:me.position.x,z:me.position.z,near:near&&near.c.id});
};
