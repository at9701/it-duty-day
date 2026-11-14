// 3D 訓練村：中央基礎學堂，九位師傅的攤位圍一圈。WASD／方向鍵或點地板走路，靠近師傅按 E 說話。
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
 flat(new THREE.CircleGeometry(95,48),0x7fb86e,0);flat(new THREE.RingGeometry(10.6,13,64),0xdcc793,.02);flat(new THREE.CircleGeometry(6.2,40),0xc9c5ba,.03);{const p=new THREE.Mesh(new THREE.PlaneGeometry(2.4,11),M(0xdcc793));p.rotation.x=-Math.PI/2;p.position.set(0,.02,17.5);p.receiveShadow=true;sc.add(p);}
 const N=api.courses.length,RS=15.2,blocks=[],AN=i=>Math.PI-(i-(N-1)/2)*.41;
 for(let i=0;i<N;i++){const a=AN(i),p=new THREE.Mesh(new THREE.PlaneGeometry(1.8,6),M(0xdcc793));p.rotation.x=-Math.PI/2;p.rotation.z=-a;p.position.set(Math.sin(a)*8.6,.02,Math.cos(a)*8.6);p.receiveShadow=true;sc.add(p);}
 // 中央涼亭：基礎學堂
 cyl(2.6,2.8,.3,0xc9c3b4,0,.15,0,null,8);[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(q=>cyl(.16,.16,3,0x9a6b3f,q[0]*1.6,1.8,q[1]*1.6));
 const roof=add(new THREE.ConeGeometry(3.4,1.6,4),0xc65b4a,0,4.1,0);roof.rotation.y=Math.PI/4;
 box(1.6,.5,.5,0x9a6b3f,0,.55,0);blocks.push([0,0,2.7]);
 const hall=label(['基礎學堂'],'#ffffff','#1c2a36',4.2);hall.position.set(0,5.9,0);sc.add(hall);
 // 人
 function person(shirt,hair,skin){const g=new THREE.Group();const L=[box(.2,.62,.22,0x3a4656,-.13,.31,0,g),box(.2,.62,.22,0x3a4656,.13,.31,0,g)];
  cyl(.3,.34,.74,shirt,0,.98,0,g);const A=[box(.14,.58,.16,shirt,-.4,1,0,g),box(.14,.58,.16,shirt,.4,1,0,g)];
  sph(.3,skin||0xf2c9a4,0,1.64,0,g);const h=sph(.315,hair,0,1.7,-.04,g);h.scale.set(1,.82,1);
  sph(.04,0x1c2a36,-.11,1.66,.27,g);sph(.04,0x1c2a36,.11,1.66,.27,g);g.userData={L,A};sc.add(g);return g;}
 // 攤位
 const HAIR=[0x4a3526,0x2b2b33,0x6b4a2a,0x1f1f24,0x9a9a9a,0x3a2a55,0x55402c,0x7a3b2a,0x6a6a6a];
 const stalls=api.courses.map((c,i)=>{const a=AN(i),x=Math.sin(a)*RS,z=Math.cos(a)*RS,g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=a+Math.PI;sc.add(g);
  box(3.2,.14,2.6,0xcdb88f,0,.07,0,g);box(2.8,.95,.6,0xb98a56,0,.6,.75,g);box(2.9,.08,.74,0xe9d7b4,0,1.11,.75,g);
  box(3.2,2.5,.14,0xf3ead6,0,1.39,-1.1,g);box(.14,2.5,.14,0x9a6b3f,-1.5,1.39,1.05,g);box(.14,2.5,.14,0x9a6b3f,1.5,1.39,1.05,g);
  const rf=box(3.7,.16,3,c.rc,0,2.82,.05,g);rf.rotation.x=.16;box(3.7,.34,.1,c.rc,0,2.42,1.52,g);
  box(.6,.42,.06,0x26313c,.75,1.42,.7,g).rotation.x=-.2;box(.5,.3,.36,c.col,-.8,1.3,.75,g);
  const m=person(c.rc,HAIR[i%HAIR.length]);sc.remove(m);m.position.set(0,.14,-.15);g.add(m);
  const sign=label([c.npc,c.name],'#ffffff','#1c2a36',4.3);sign.position.set(x,4.5,z);sc.add(sign);
  blocks.push([x,z,2.2]);return {c,x,z,a,m,mk:null,fx:Math.sin(a)*(RS-2.7),fz:Math.cos(a)*(RS-2.7)};});
 // 圍籬、樹、進階專科的門
 const GA=[.75,-.75],RF=23;
 for(let i=0;i<96;i++){const a=i/96*Math.PI*2;if(GA.some(g=>Math.abs(((a-g+Math.PI*3)%(Math.PI*2))-Math.PI)<.09))continue;cyl(.09,.09,1,0xb98a56,Math.sin(a)*RF,.5,Math.cos(a)*RF,null,6);const r=box(1.55,.1,.06,0xb98a56,Math.sin(a+.0327)*RF,.72,Math.cos(a+.0327)*RF);r.rotation.y=a+.0327;}
 GA.forEach(a=>{const g=new THREE.Group();g.position.set(Math.sin(a)*RF,0,Math.cos(a)*RF);g.rotation.y=a;sc.add(g);box(.4,3,.4,0x8b8f97,-1.7,1.5,0,g);box(.4,3,.4,0x8b8f97,1.7,1.5,0,g);box(4.2,.5,.5,0x6f747d,0,3.2,0,g);
  for(let k=-3;k<=3;k++)box(.1,2.7,.1,0x4b5059,k*.45,1.35,0,g);const l=label(['進階專科區','籌備中'],'#2c3642','#ffffff',3.6);l.position.set(Math.sin(a)*RF,4.6,Math.cos(a)*RF);sc.add(l);});
 box(.4,3.4,.4,0x9a6b3f,-2.4,1.7,20.5);box(.4,3.4,.4,0x9a6b3f,2.4,1.7,20.5);box(5.8,.5,.5,0xc65b4a,0,3.6,20.5);{const l=label(['資訊訓練村'],'#c65b4a','#ffffff',4.4);l.position.set(0,4.6,20.5);sc.add(l);}
 let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<70;i++){const a=rnd()*Math.PI*2,r=i<10?19+rnd()*2.5:25+rnd()*38,x=Math.sin(a)*r,z=Math.cos(a)*r,h=1.6+rnd()*1.4;
  if(r<23&&api.courses.some((c,k)=>Math.abs(((a-AN(k)+Math.PI*5)%(Math.PI*2))-Math.PI)<.2))continue;
  cyl(.16,.22,h,0x8a623c,x,h/2,z,null,7);sph(1+rnd()*.6,rnd()<.5?0x4f9a57:0x63ad66,x,h+.7,z).scale.y=1.15;if(r<23)blocks.push([x,z,.6]);}
 for(let i=0;i<26;i++){const a=rnd()*Math.PI*2,r=4+rnd()*17;if(r>9.8&&r<18.5)continue;const x=Math.sin(a)*r,z=Math.cos(a)*r;if(r<7)continue;sph(.16,[0xf2c14e,0xe86a8f,0xffffff][i%3],x,.14,z);}
 // 玩家
 const me=person(0x17a07a,0x33271f);me.position.set(0,0,10);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.42,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;ring.visible=false;sc.add(ring);
 // 師傅頭上的標記
 window.v3dRefresh=()=>stalls.forEach(s=>{const t=api.tier(s.c);if(s.mk)sc.remove(s.mk);s.mk=label([t>=0?api.TIER[t]+'通過':'來上課'],t>=0?'#17a07a':'#c9860c','#ffffff',2.2);s.mk.position.set(s.x,5.9,s.z);sc.add(s.mk);});
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
  near=null;let bd=3.6;stalls.forEach((s,i)=>{const d=Math.hypot(me.position.x-s.fx,me.position.z-s.fz);if(d<bd){bd=d;near=s;}s.m.position.y=.14+Math.sin(t*2+i)*.03;if(s.mk)s.mk.position.y=5.9+Math.sin(t*3+i)*.08;});
  if(near){tip.textContent='跟'+near.c.npc+'說話（E）';tip.hidden=false;}else tip.hidden=true;
  const fx=me.position.x*.55,fz=me.position.z*.55-1;cam.position.set(fx,25,fz+27);cam.lookAt(fx,1,fz);}
 function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<1.1?50:36;cam.updateProjectionMatrix();}
 if(window.ResizeObserver)new ResizeObserver(size).observe(host);addEventListener('resize',size);size();
 let last=performance.now();(function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(!host.clientWidth)return;if(!api.busy())step(dt);R.render(sc,cam);})(last);
 window.v3dState=()=>({x:me.position.x,z:me.position.z,near:near&&near.c.id});
};
