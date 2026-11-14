
// =====================================================================
// 3D 畫面層：吃上面的 FLOORS/ROOMS/S，用 Three.js 畫出來。遊戲邏輯一行沒動。
// =====================================================================
window.BLK3={};// key -> Set(tile) 家具擋住的格子，walk() 會看
(function(){
const canvas=document.getElementById('gl');
// 畫質：高＝圓潤造型（人物、家具倒角、柔和陰影）；低＝原本的積木造型，給舊電腦用
let HQ=true;try{HQ=localStorage.getItem('itduty_gfx')!=='low'}catch(e){}
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.25,window.devicePixelRatio||1));renderer.shadowMap.enabled=true;renderer.shadowMap.type=HQ?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.92;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0b0e14);scene.fog=new THREE.Fog(0x0b0e14,34,60);
const camera=new THREE.PerspectiveCamera(42,1,0.1,200);
const hemi=new THREE.HemisphereLight(0xfff3e2,0xb9a58c,0.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe6c2,0.95);sun.position.set(14,22,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.camera.near=1;sun.shadow.camera.far=60;sun.shadow.bias=-0.0008;scene.add(sun);sun.target.position.set(24,0,9);scene.add(sun.target);
const amb=new THREE.AmbientLight(0xffffff,0.25);scene.add(amb);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshLambertMaterial({color:0x2a3546}));ground.rotation.x=-Math.PI/2;ground.position.set(24,-0.08,9);scene.add(ground);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();extCam.aspect=w/h;extCam.updateProjectionMatrix();}
// ---------- 共用素材 ----------
const geo=new THREE.BoxGeometry(1,1,1);
const RGEO=(()=>{const g=new THREE.BoxGeometry(1,1,1,2,2,2),P=g.attributes.position,N=g.attributes.normal,r=0.1,v=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);c.set(Math.max(-0.5+r,Math.min(0.5-r,v.x)),Math.max(-0.5+r,Math.min(0.5-r,v.y)),Math.max(-0.5+r,Math.min(0.5-r,v.z)));v.sub(c);if(v.lengthSq()>1e-9){v.normalize();N.setXYZ(i,v.x,v.y,v.z);P.setXYZ(i,c.x+v.x*r,c.y+v.y*r,c.z+v.z*r);}}return g;})();
const MAT={};const mat=c=>MAT[c]||(MAT[c]=new THREE.MeshLambertMaterial({color:c}));
const BMAT={};const bmat=c=>BMAT[c]||(BMAT[c]=new THREE.MeshBasicMaterial({color:c}));
const hx=s=>typeof s==='number'?s:parseInt(String(s).replace('#',''),16);
function wallTex(upper,band,tile){const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');g.fillStyle=upper;g.fillRect(0,0,64,64);
 if(tile){g.strokeStyle='rgba(120,150,170,.35)';for(let i=0;i<=64;i+=16){g.beginPath();g.moveTo(i+.5,0);g.lineTo(i+.5,64);g.moveTo(0,i+.5);g.lineTo(64,i+.5);g.stroke();}}
 else{g.fillStyle='rgba(0,0,0,.05)';g.fillRect(0,0,64,2);}
 g.fillStyle=band;g.fillRect(0,40,64,24);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,40,64,2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,60,64,4);
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.encoding=THREE.sRGBEncoding;return new THREE.MeshLambertMaterial({map:t});}
// 牆色依房型：上半米白＋護牆板
const WALLMATS={stair:wallTex('#e2e4e8','#9aa3ad'),office:wallTex('#ece7dc','#5b8fd6'),meet:wallTex('#efe8dc','#b08a5a'),lobby:wallTex('#f3eee3','#c9a24a'),clinic:wallTex('#f1f3f0','#7fb5a0'),shop:wallTex('#f4efe6','#d98c3a'),exec:wallTex('#efe6da','#8a2a2a'),ward:wallTex('#f0f5f6','#6fb6d6'),imaging:wallTex('#e9ecf1','#8a94a8'),server:wallTex('#dfe3e8','#2f8f8a'),hall:wallTex('#f1ede4','#7fb5a0'),wc:wallTex('#f6fafc','#6fb6d6',true)};
const FLOORC={stair:['#8492ab','#7b89a3'],office:['#9db4de','#91a9d6'],meet:['#cfb98d','#c5ae80'],lobby:['#e6c88d','#ddbd7e'],clinic:['#8ccfb6','#80c6ac'],shop:['#efb564','#e6a955'],exec:['#a9705a','#9f6650'],ward:['#efbd9b','#e7b18d'],imaging:['#93abe0','#869fd8'],server:['#4b5568','#444e60'],hall:['#dcc394','#d3b886'],wc:['#a3d2e6','#96c9df']};
const TEXC={};function checker(c1,c2){const k=c1+c2;if(TEXC[k])return TEXC[k];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=c1;g.fillRect(0,0,64,64);g.fillStyle=c2;g.fillRect(0,0,32,32);g.fillRect(32,32,32,32);g.strokeStyle='rgba(0,0,0,.15)';g.strokeRect(0.5,0.5,63,63);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return TEXC[k]=new THREE.MeshLambertMaterial({map:t});}
// ---------- 靜態物件合批 ----------
let STATIC=new Map();const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_p=new THREE.Vector3(),_s=new THREE.Vector3();
let FG=null;// 目前樓層的 group
function addInst(key,material,x,y,z,w,h,d,shadow,rg){if(rg)key='R'+key;let g=STATIC.get(key);if(!g){g={material,shadow,list:[],geo:rg?RGEO:geo};STATIC.set(key,g);}_p.set(x+w/2,y+h/2,z+d/2);_s.set(w,h,d);_m4.compose(_p,_q,_s);g.list.push(_m4.clone());}
let DEV=[];const DEV3={};function reg(kind,x,y,z,a){DEV.push({kind,x,y,z,a});}
function box(x,y,z,w,h,d,c,shadow=true,dyn=false){if(dyn){const m=new THREE.Mesh(geo,mat(c));m.scale.set(w,h,d);m.position.set(x+w/2,y+h/2,z+d/2);m.castShadow=shadow;m.receiveShadow=true;FG.add(m);return m;}addInst('L'+c+(shadow?'s':''),mat(c),x,y,z,w,h,d,shadow,HQ&&Math.max(w,h,d)<=1.6&&Math.min(w,h,d)>=0.04&&h<=1.1&&!(w>=1&&w%1===0)&&!(d>=1&&d%1===0));}
function emit(x,y,z,w,h,d,c,dyn=false){if(dyn){const m=new THREE.Mesh(geo,bmat(c));m.scale.set(w,h,d);m.position.set(x+w/2,y+h/2,z+d/2);FG.add(m);return m;}addInst('B'+c,bmat(c),x,y,z,w,h,d,false);}
function flushStatic(){STATIC.forEach(g=>{const im=new THREE.InstancedMesh(g.geo||geo,g.material,g.list.length);g.list.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.castShadow=g.shadow;im.receiveShadow=true;FG.add(im);});STATIC=new Map();}
let LEDS=[],ledMesh=null;const ledCol=new THREE.Color();
function flushLEDs(){if(!LEDS.length)return;ledMesh=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffffff}),LEDS.length);LEDS.forEach((l,i)=>{_p.set(l.x+l.w/2,l.y+l.h/2,l.z+l.d/2);_s.set(l.w,l.h,l.d);_m4.compose(_p,_q,_s);ledMesh.setMatrixAt(i,_m4);ledCol.setHex(l.color);ledMesh.setColorAt(i,ledCol);});ledMesh.instanceMatrix.needsUpdate=true;FG.add(ledMesh);}
let _ledT=0;function tickLEDs(now){if(!ledMesh||now-_ledT<100)return;_ledT=now;const t=now/1000;for(let i=0;i<LEDS.length;i++){const l=LEDS[i];let on;if(l.alarm)on=Math.floor(t*l.rate+l.phase)%2===0;else{const v=Math.sin(t*l.rate*6.3+l.phase)*Math.sin(t*1.7+l.phase*0.7);on=v>-0.2;}ledCol.setHex(on?l.color:0x1a2230);ledMesh.setColorAt(i,ledCol);}ledMesh.instanceColor.needsUpdate=true;}
let BLK=new Set();const blk=(x,z,w=1,d=1)=>{for(let i=Math.floor(x);i<Math.ceil(x+w);i++)for(let j=Math.floor(z);j<Math.ceil(z+d);j++)BLK.add(j*W+i);};
// ---------- 家具元件（座標都是世界座標，x 向右、z 向下） ----------
const desk=(x,z,c=0x6b4b32)=>{blk(x+0.1,z+0.2,0.8,0.5);
 box(x+0.08,0.56,z+0.18,0.84,0.04,0.54,0x9a7655);box(x+0.08,0.6,z+0.18,0.84,0.005,0.54,0xa98563,false);// 桌面
 [[0.1,0.2],[0.86,0.2],[0.1,0.66],[0.86,0.66]].forEach(([a,b])=>box(x+a,0,z+b,0.04,0.56,0.04,0x3b4454));box(x+0.12,0.2,z+0.2,0.76,0.32,0.02,c);// 腳、擋板
 monitor(x+0.29,0.6,z+0.24);box(x+0.28,0.6,z+0.52,0.34,0.015,0.11,0x2b3242);box(x+0.29,0.615,z+0.53,0.32,0.006,0.09,0x6b7585,false);box(x+0.67,0.6,z+0.55,0.06,0.02,0.08,0x2b3242);// 鍵盤滑鼠
 box(x+0.72,0,z+0.26,0.16,0.42,0.38,0x2b3242);emit(x+0.77,0.36,z+0.645,0.04,0.02,0.005,0x5fd3a6);box(x+0.74,0.3,z+0.645,0.12,0.02,0.005,0x1b2230,false);// 主機
 box(x+0.12,0.6,z+0.48,0.12,0.04,0.14,0x3b4454);box(x+0.13,0.64,z+0.49,0.1,0.02,0.05,0x2b3242,false);// 電話
 box(x+0.5,0.005,z+0.22,0.08,0.03,0.05,0xf4f6f8,false);};
const chair=(x,z,flip=false,c=0x3c4656)=>{blk(x+0.3,z+0.3,0.4,0.4);reg('seat',x+0.5,0.3,z+0.5,flip?0:Math.PI);const bz=flip?z+0.3:z+0.64;
 box(x+0.3,0.02,z+0.48,0.4,0.03,0.04,0x222222,false);box(x+0.48,0.02,z+0.3,0.04,0.03,0.4,0x222222,false);[[0.3,0.48],[0.66,0.48],[0.48,0.3],[0.48,0.66]].forEach(([a,b])=>box(x+a,0,z+b,0.04,0.03,0.04,0x111111,false));// 五爪腳
 box(x+0.48,0.05,z+0.48,0.04,0.2,0.04,0x6b7585);box(x+0.3,0.25,z+0.3,0.4,0.06,0.4,c);box(x+0.32,0.31,z+0.32,0.36,0.02,0.36,0x4a5566,false);// 椅墊
 box(x+0.32,0.33,bz,0.36,0.36,0.05,c);box(x+0.34,0.35,bz+(flip?-0.01:0.01),0.32,0.3,0.04,0x4a5566,false);box(x+0.47,0.28,bz+(flip?0.01:0.02),0.06,0.06,0.03,0x6b7585,false);// 椅背
 box(x+0.28,0.36,z+0.36,0.04,0.03,0.24,0x2b3242,false);box(x+0.68,0.36,z+0.36,0.04,0.03,0.24,0x2b3242,false);box(x+0.29,0.28,z+0.46,0.02,0.08,0.03,0x2b3242,false);box(x+0.69,0.28,z+0.46,0.02,0.08,0.03,0x2b3242,false);};
const rack=(x,z,i)=>{reg('server',x+0.5,2.08,z+0.5);blk(x+0.15,z+0.15,0.7,0.7);const body=[0x2b3240,0x343b4a,0x3d4452][i%3];box(x+0.15,0,z+0.15,0.7,2,0.7,body);box(x+0.18,0.05,z+0.85,0.64,1.9,0.05,0x1b2230);box(x+0.22,0.1,z+0.89,0.56,1.8,0.02,0x5a6a80);
 let yy=0.15;const kinds=[[0.08,0x1f2a38],[0.12,0x24303f],[0.06,0x2d3a4a],[0.18,0x1c2430],[0.1,0x263241]];let k=i;
 while(yy<1.8){const [h,c]=kinds[k%kinds.length];k++;box(x+0.25,yy,z+0.86,0.5,h,0.02,c);const n=k%2?3:2;for(let j=0;j<n;j++)LEDS.push({x:x+0.3+j*0.08,y:yy+h/2,z:z+0.89,w:0.05,h:0.025,d:0.01,color:(k%5===0&&j===0)?0xf2b84b:0x5fd3a6,phase:i*7+k*3+j*5,rate:0.6+((k*13+j*7)%10)/10});yy+=h+0.04;}
 box(x+0.2,2.0,z+0.2,0.6,0.08,0.6,0x1b2230);box(x+0.35,1.88,z+0.91,0.3,0.1,0.01,0xe6e9ef);if(i%5===0)LEDS.push({x:x+0.76,y:1.6,z:z+0.91,w:0.04,h:0.04,d:0.01,color:0xef6b6b,phase:i,rate:2.5,alarm:true});};
const plant=(x,z)=>{blk(x+0.3,z+0.3,0.4,0.4);box(x+0.32,0,z+0.32,0.36,0.32,0.36,0xc9b79a);box(x+0.3,0.3,z+0.3,0.4,0.04,0.4,0xb8a585,false);box(x+0.34,0.32,z+0.34,0.32,0.02,0.32,0x4a3020,false);
 box(x+0.47,0.32,z+0.47,0.06,0.25,0.06,0x5a3a20,false);[[0.28,0.5,0.28],[0.42,0.62,0.44],[0.3,0.75,0.36],[0.4,0.88,0.34]].forEach(([a,y,b],i)=>box(x+a,y,z+b,0.44-i*0.04,0.16,0.4-i*0.04,i%2?0x3a9a5a:0x2f7d4a));};
const printer=(x,z)=>{reg('printer',x+0.5,0.82,z+0.5);blk(x+0.15,z+0.2,0.7,0.6);box(x+0.2,0,z+0.25,0.6,0.42,0.5,0x9aa3ad);box(x+0.22,0.04,z+0.74,0.56,0.1,0.02,0x7c8595,false);box(x+0.22,0.16,z+0.74,0.56,0.1,0.02,0x7c8595,false);// 機櫃＋紙匣
 box(x+0.15,0.42,z+0.2,0.7,0.36,0.6,0xe3e7ec);box(x+0.2,0.55,z+0.79,0.4,0.05,0.12,0xb8c0ca);box(x+0.22,0.6,z+0.8,0.36,0.005,0.1,0xffffff,false);// 本體＋出紙
 box(x+0.2,0.78,z+0.25,0.6,0.04,0.45,0xcfd6dc);box(x+0.62,0.6,z+0.8,0.2,0.12,0.02,0x2b3242);emit(x+0.64,0.62,z+0.82,0.1,0.07,0.004,0x5fd3a6);emit(x+0.77,0.65,z+0.82,0.03,0.03,0.004,0xf2b84b);};
const board=(x,z)=>{box(x,0.9,z,1.6,0.9,0.06,0xf4f6f8);emit(x+0.15,1.45,z+0.06,0.8,0.05,0.01,0x2a7fd4);emit(x+0.15,1.25,z+0.06,0.5,0.05,0.01,0xc0392b);};
const tv=(x,z,w=1.6)=>{reg('display',x+w/2,1.4,z+0.05);box(x,0.95,z,w,0.9,0.06,0x111111);emit(x+0.06,1.0,z+0.06,w-0.12,0.78,0.01,0x2a7fd4);};
const counter=(x,z,w,c=0xf1efe9,top=0xcfd6dc)=>{blk(x,z+0.1,w,0.7);box(x,0,z+0.1,w,0.95,0.7,c);box(x,0,z+0.78,w,0.08,0.03,0x8a94a8,false);box(x+0.02,0.45,z+0.8,w-0.04,0.08,0.01,0x9fb6c2,false);// 本體、踢腳、腰帶
 box(x-0.05,0.95,z+0.05,w+0.1,0.05,0.8,top);box(x-0.05,1.0,z+0.75,w+0.1,0.18,0.1,top);// 檯面、前方高台
 for(let i=0;i+0.9<=w;i+=1.4){box(x+i+0.2,0.85,z+0.3,0.12,0.1,0.2,0x2b3242,false);box(x+i+0.5,0.96,z+0.25,0.14,0.04,0.2,0x2b3242,false);}};
const monitor=(x,y,z)=>{reg('pc',x+0.21,y+0.3,z+0.02);box(x+0.13,y,z+0.02,0.16,0.012,0.1,0x2b3242,false);box(x+0.19,y+0.012,z+0.05,0.04,0.11,0.03,0x2b3242,false);// 底座
 box(x,y+0.08,z,0.42,0.27,0.035,0x1b2230);emit(x+0.02,y+0.1,z+0.036,0.38,0.23,0.004,0xe8eef6);emit(x+0.02,y+0.29,z+0.04,0.38,0.035,0.004,0x2a7fd4);emit(x+0.04,y+0.24,z+0.04,0.18,0.015,0.004,0x9aa6b8);emit(x+0.04,y+0.21,z+0.04,0.26,0.015,0.004,0x9aa6b8);emit(x+0.04,y+0.12,z+0.04,0.1,0.06,0.004,0x5fd3a6);emit(x+0.18,y+0.12,z+0.04,0.1,0.06,0.004,0xf2b84b);};
const bed=(x,z,sheet=0xf7f9fb)=>{blk(x+0.1,z+0.15,1.7,0.7);
 [[0.15,0.18],[1.7,0.18],[0.15,0.75],[1.7,0.75]].forEach(([a,b])=>{box(x+a,0,z+b,0.06,0.18,0.06,0x5a6270);box(x+a-0.01,0,z+b-0.01,0.08,0.05,0.08,0x222222,false);});
 box(x+0.1,0.18,z+0.15,1.7,0.1,0.7,0x8a94a8);box(x+0.12,0.28,z+0.17,1.66,0.16,0.66,0xe8ecf0);box(x+0.6,0.44,z+0.16,1.2,0.05,0.68,sheet);box(x+0.13,0.44,z+0.18,0.5,0.03,0.64,0xf7f9fb,false);box(x+0.16,0.47,z+0.28,0.32,0.08,0.44,0xffffff);// 床架、床墊、被、枕
 box(x+0.05,0.18,z+0.13,0.07,0.55,0.74,0xb8c2d0);box(x+1.78,0.18,z+0.13,0.07,0.4,0.74,0xb8c2d0);// 床頭床尾
 box(x+0.4,0.5,z+0.12,0.9,0.04,0.03,0xaab4bf,false);box(x+0.4,0.5,z+0.85,0.9,0.04,0.03,0xaab4bf,false);box(x+0.42,0.28,z+0.12,0.03,0.22,0.03,0xaab4bf,false);box(x+1.25,0.28,z+0.12,0.03,0.22,0.03,0xaab4bf,false);// 床欄
 box(x+0.08,0,z+0.04,0.12,0.02,0.12,0x5a6270,false);box(x+0.13,0,z+0.08,0.025,1.35,0.025,0xb8c2d0,false);box(x+0.05,1.33,z+0.08,0.18,0.02,0.02,0xb8c2d0,false);box(x+0.17,1.1,z+0.06,0.08,0.18,0.05,0xd6efff,false);box(x+0.2,0.6,z+0.08,0.01,0.5,0.01,0xd6efff,false);};// 點滴架
const curtain=(x,z,w)=>{box(x,1.3,z,w,0.04,0.04,0x8a94a8);box(x,0.6,z-0.03,0.08,0.7,0.1,0x9ad0e8);};
const shelf=(x,z,cols)=>{blk(x+0.1,z+0.1,0.8,0.5);box(x+0.1,0,z+0.1,0.8,1.6,0.5,0xd8dde3);for(let i=0;i<3;i++){box(x+0.1,0.3+i*0.45,z+0.55,0.8,0.04,0.1,0x9aa3ad);cols.forEach((c,j)=>box(x+0.16+j*0.26,0.34+i*0.45,z+0.5,0.2,0.3,0.14,c));}};
const fridge=(x,z)=>{blk(x+0.1,z+0.1,0.8,0.6);box(x+0.1,0,z+0.1,0.8,1.8,0.6,0xe3ebef);emit(x+0.16,0.2,z+0.7,0.68,1.5,0.01,0xbfe0ff);box(x+0.16,0.2,z+0.72,0.68,1.5,0.01,0x9ad0e8);for(let i=0;i<4;i++)box(x+0.2,0.35+i*0.4,z+0.6,0.6,0.03,0.1,0xd0d8de);};
const sofa=(x,z,w,c=0x4a5566)=>{blk(x,z+0.1,w,0.7);box(x,0,z+0.1,w,0.4,0.7,c);box(x,0.4,z+0.1,w,0.4,0.18,c);box(x,0.4,z+0.1,0.14,0.3,0.7,c);box(x+w-0.14,0.4,z+0.1,0.14,0.3,0.7,c);};
const bench=(x,z,w)=>{blk(x,z+0.25,w,0.5);box(x+0.05,0.18,z+0.45,w-0.1,0.05,0.06,0x6b7585);box(x+0.12,0,z+0.45,0.06,0.2,0.06,0x6b7585,false);box(x+w-0.18,0,z+0.45,0.06,0.2,0.06,0x6b7585,false);box(x+0.08,0,z+0.36,0.14,0.02,0.24,0x6b7585,false);box(x+w-0.22,0,z+0.36,0.14,0.02,0.24,0x6b7585,false);
 const n=Math.max(2,Math.floor(w/0.55));const sw=w/n;for(let i=0;i<n;i++){const sx=x+i*sw+0.04;reg('wseat',sx+sw/2-0.04,0.27,z+0.46,Math.PI);box(sx,0.24,z+0.27,sw-0.08,0.06,0.42,0x4f8fd6);box(sx,0.3,z+0.66,sw-0.08,0.32,0.05,0x4f8fd6);box(sx+0.02,0.3,z+0.27,sw-0.12,0.01,0.38,0x6aa7ff,false);}};
const cart=(x,z,c=0x6aa7ff)=>{blk(x+0.2,z+0.2,0.6,0.6);[[0.22,0.22],[0.72,0.22],[0.22,0.72],[0.72,0.72]].forEach(([a,b])=>box(x+a,0,z+b,0.06,0.08,0.06,0x222222,false));
 box(x+0.2,0.08,z+0.2,0.6,0.82,0.6,c);for(let i=0;i<4;i++){box(x+0.24,0.14+i*0.19,z+0.8,0.52,0.15,0.015,0xf4f6f8,false);box(x+0.44,0.2+i*0.19,z+0.815,0.12,0.025,0.015,0x5a6270,false);}
 box(x+0.18,0.9,z+0.18,0.64,0.04,0.64,0xdfe3e8);box(x+0.15,0.92,z+0.3,0.03,0.12,0.4,0x8a94a8,false);box(x+0.3,0.94,z+0.3,0.14,0.1,0.14,0xffffff,false);box(x+0.5,0.94,z+0.35,0.2,0.04,0.25,0x9ad0e8,false);box(x+0.78,0.4,z+0.3,0.08,0.3,0.3,0xf2d27a,false);};
const bookshelf=(x,z,w)=>{blk(x,z+0.05,w,0.4);box(x,0,z+0.05,w,1.9,0.4,0x4e352c);for(let i=0;i<4;i++){const cols=[0x8a2a2a,0x2a4a8a,0x2f7d4a,0xb08a5a,0xdfe3e8];for(let j=0;j<Math.floor(w/0.14);j++)box(x+0.04+j*0.14,0.12+i*0.45,z+0.1,0.1,0.33,0.3,cols[(i+j)%cols.length]);box(x,0.45+i*0.45,z+0.05,w,0.03,0.4,0x3a2820);}};
const extinguisher=(x,z)=>{box(x,0.08,z,0.2,0.5,0.14,0xd63c3c);box(x+0.07,0.58,z+0.03,0.06,0.08,0.06,0x222222);box(x-0.03,0,z-0.02,0.26,0.06,0.18,0x8a94a8);};
const sign=(x,z,color=0x2a7fd4)=>{box(x,1.05,z,0.55,0.22,0.03,0xf4f6f8);emit(x+0.04,1.09,z+0.03,0.08,0.14,0.01,color);};
const clock=(x,z)=>{box(x,1.15,z,0.34,0.34,0.03,0xf4f6f8);box(x+0.15,1.3,z+0.03,0.04,0.12,0.01,0x222222);box(x+0.17,1.31,z+0.03,0.1,0.03,0.01,0x222222);};
const poster=(x,z,c)=>{box(x,0.85,z,0.6,0.8,0.03,0xf4f6f8);emit(x+0.08,0.95,z+0.03,0.44,0.5,0.01,c);};
const machine=(x,z,kind)=>{// 影像設備：MRI/CT 圓環＋床，X光 床＋吊臂，內視鏡／核醫 主機
 blk(x,z+0.1,2,0.9);
 if(kind==='mri'||kind==='ct'){const ring=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.22,10,28),mat(kind==='mri'?0xe8ecf0:0xdfe6ea));ring.position.set(x+1.0,0.75,z+0.5);ring.castShadow=true;FG.add(ring);box(x+0.2,0,z+0.2,1.6,0.3,0.6,0xcfd6dc);box(x+0.05,0.55,z+0.35,1.9,0.12,0.3,0xf7f9fb);emit(x+0.9,1.35,z+0.42,0.2,0.05,0.02,kind==='mri'?0x5fd3a6:0x6aa7ff);}
 else if(kind==='xray'){box(x+0.2,0,z+0.2,1.6,0.6,0.6,0xcfd6dc);box(x+0.1,0.6,z+0.15,1.8,0.08,0.7,0xf7f9fb);box(x+0.9,0,z+0.85,0.12,2.2,0.12,0x8a94a8);box(x+0.5,2.1,z+0.4,0.9,0.1,0.5,0x8a94a8);box(x+0.75,1.6,z+0.45,0.5,0.5,0.4,0xdfe6ea);}
 else{box(x+0.2,0,z+0.15,1.0,1.4,0.7,0xe3ebef);emit(x+0.3,0.9,z+0.86,0.6,0.35,0.01,0x4f8fd6);box(x+1.3,0,z+0.2,0.6,0.9,0.6,0xcfd6dc);monitor(x+1.4,0.95,z+0.3);}};
const orTable=(x,z)=>{blk(x+0.1,z+0.1,1.8,0.8);box(x+0.7,0,z+0.35,0.5,0.5,0.4,0x8a94a8);box(x+0.1,0.5,z+0.25,1.8,0.12,0.6,0x3f8f74);box(x+0.95,0,z+0.85,0.08,2.3,0.08,0x8a94a8);box(x+0.3,2.2,z+0.3,1.3,0.08,0.4,0x8a94a8);box(x+0.5,1.8,z+0.3,0.9,0.1,0.9,0xdfe6ea);emit(x+0.55,1.78,z+0.35,0.8,0.01,0.8,0xfff6d6);};
const analyzer=(x,z)=>{reg('workstation',x+0.5,1.35,z+0.4);blk(x+0.05,z+0.1,0.9,0.7);box(x+0.05,0,z+0.1,0.9,0.85,0.7,0xe3ebef);box(x+0.1,0.85,z+0.15,0.8,0.5,0.5,0xdfe6ea);emit(x+0.2,0.95,z+0.66,0.5,0.3,0.01,0x5fd3a6);LEDS.push({x:x+0.8,y:1.2,z:z+0.66,w:0.04,h:0.04,d:0.01,color:0xf2b84b,phase:x*3,rate:1.1});};

// ---------- 細節零件：資訊設備 ----------
const cardReader=(x,y,z)=>{reg('reader',x+0.06,y+0.03,z+0.05);box(x,y,z,0.12,0.03,0.09,0x2b3242);box(x+0.01,y+0.03,z+0.06,0.1,0.004,0.01,0x111111,false);emit(x+0.09,y+0.031,z+0.015,0.015,0.004,0.015,0x5fd3a6);};// 健保卡讀卡機
const scanner=(x,y,z)=>{reg('scanner',x+0.05,y+0.15,z+0.05);box(x,y,z,0.1,0.03,0.1,0x2b3242,false);box(x+0.03,y+0.03,z+0.03,0.05,0.12,0.05,0x3b4454,false);box(x+0.02,y+0.13,z+0.01,0.07,0.04,0.09,0x3b4454,false);emit(x+0.03,y+0.14,z+0.1,0.05,0.015,0.004,0xef6b6b);};// 條碼槍
const labelPrinter=(x,y,z)=>{reg('printer',x+0.09,y+0.14,z+0.1);box(x,y,z,0.18,0.12,0.2,0xe3e7ec);box(x+0.02,y+0.12,z+0.02,0.14,0.02,0.16,0x9aa3ad,false);box(x+0.04,y+0.04,z+0.2,0.1,0.005,0.04,0xffffff,false);emit(x+0.13,y+0.08,z+0.201,0.025,0.015,0.004,0x5fd3a6);};
const deskPhone=(x,y,z)=>{reg('phone',x+0.07,y+0.06,z+0.08);box(x,y,z,0.14,0.04,0.16,0x3b4454,false);box(x+0.01,y+0.04,z+0.01,0.12,0.025,0.05,0x2b3242,false);emit(x+0.03,y+0.041,z+0.08,0.08,0.004,0.04,0x6aa7ff);};
const wallJack=(x,z,y=0.25)=>{box(x,y,z,0.1,0.1,0.02,0xf4f6f8,false);box(x+0.02,y+0.05,z+0.02,0.025,0.025,0.005,0x2b3242,false);box(x+0.055,y+0.05,z+0.02,0.025,0.025,0.005,0x2b3242,false);};
const wallAP=(x,z,y=1.12)=>{reg('ap',x+0.13,y+0.11,z+0.05);box(x,y,z,0.26,0.22,0.04,0xf4f6f8,false);box(x+0.03,y+0.03,z+0.04,0.2,0.16,0.005,0xe3e7ec,false);emit(x+0.12,y+0.04,z+0.045,0.03,0.015,0.004,0x5fd3a6);};
const sanitizer=(x,z,y=0.85)=>{box(x,y,z,0.1,0.2,0.07,0xf4f6f8,false);box(x+0.01,y+0.1,z+0.07,0.08,0.06,0.005,0x6fb6d6,false);box(x+0.04,y-0.03,z+0.03,0.02,0.03,0.02,0x8a94a8,false);};
const idfBox=(x,z)=>{reg('switch',x+0.4,1.25,z+0.2);box(x,0.25,z,0.8,1.0,0.25,0x8a94a8);box(x+0.03,0.28,z+0.25,0.74,0.94,0.01,0x9aa3ad,false);box(x+0.7,0.7,z+0.26,0.03,0.12,0.02,0x2b3242,false);for(let i=0;i<4;i++){box(x+0.08,0.4+i*0.18,z+0.26,0.55,0.08,0.005,0x2b3242,false);for(let j=0;j<4;j++)LEDS.push({x:x+0.12+j*0.12,y:0.44+i*0.18,z:z+0.265,w:0.03,h:0.015,d:0.005,color:0x5fd3a6,phase:i*5+j*3+x,rate:0.8+(j%3)*0.3});}box(x+0.1,1.1,z+0.26,0.6,0.08,0.005,0xf2b84b,false);};
const cow=(x,z)=>{reg('cow',x+0.5,1.05,z+0.5);blk(x+0.25,z+0.25,0.5,0.5);[[0.25,0.25],[0.7,0.25],[0.25,0.7],[0.7,0.7]].forEach(([a,b])=>box(x+a,0,z+b,0.05,0.06,0.05,0x222222,false));box(x+0.27,0.06,z+0.27,0.46,0.03,0.46,0x8a94a8,false);box(x+0.47,0.06,z+0.47,0.06,0.7,0.06,0xb8c2d0);box(x+0.4,0.15,z+0.4,0.2,0.2,0.2,0x3b4454,false);// 底座、立柱、電池
 box(x+0.25,0.76,z+0.3,0.5,0.03,0.4,0xdfe3e8);box(x+0.3,0.79,z+0.45,0.4,0.015,0.2,0x2b3242,false);box(x+0.3,0.79,z+0.33,0.4,0.24,0.02,0x1b2230);emit(x+0.32,0.81,z+0.35,0.36,0.2,0.004,0xe8eef6);emit(x+0.32,0.98,z+0.35,0.36,0.03,0.004,0x2a7fd4);scanner(x+0.72,0.76,z+0.55);};
const wheelchair=(x,z)=>{blk(x+0.25,z+0.25,0.5,0.5);const wh=(wx,wz)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.03,14),mat(0x2b3242));m.rotation.z=Math.PI/2;m.position.set(wx,0.22,wz);FG.add(m);};wh(x+0.25,z+0.52);wh(x+0.75,z+0.52);
 box(x+0.3,0.3,z+0.35,0.4,0.04,0.36,0x3b4454);box(x+0.3,0.34,z+0.68,0.4,0.36,0.03,0x3b4454);box(x+0.28,0.34,z+0.4,0.03,0.2,0.3,0x8a94a8,false);box(x+0.69,0.34,z+0.4,0.03,0.2,0.3,0x8a94a8,false);box(x+0.32,0.06,z+0.22,0.36,0.02,0.1,0x8a94a8,false);[[0.32,0.25],[0.64,0.25]].forEach(([a,b])=>box(x+a,0,z+b,0.04,0.08,0.04,0x222222,false));box(x+0.3,0.7,z+0.7,0.04,0.04,0.12,0x2b3242,false);box(x+0.66,0.7,z+0.7,0.04,0.04,0.12,0x2b3242,false);};
// ---------- 文字招牌（貼圖，同字共用） ----------
const TXT={};function textMat(text,bg,fg,wpx=256,hpx=64){const k=text+bg+fg+wpx;if(TXT[k])return TXT[k];const c=document.createElement('canvas');c.width=wpx;c.height=hpx;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,wpx,hpx);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,wpx,4);g.fillStyle=fg;let fs=Math.floor(hpx*0.58);g.font='700 '+fs+'px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';while(g.measureText(text).width>wpx-16&&fs>10){fs--;g.font='700 '+fs+'px "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';}g.textAlign='center';g.textBaseline='middle';g.fillText(text,wpx/2,hpx/2+2);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return TXT[k]=new THREE.MeshBasicMaterial({map:t});}
function textPlate(x,y,z,w,h,text,bg='#1f3a5a',fg='#ffffff',hang=false){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),textMat(text,bg,fg,Math.round(256*w/Math.max(h*4,0.01))>512?512:256,64));m.position.set(x+w/2,y+h/2,z+0.012);FG.add(m);box(x-0.02,y-0.02,z-0.02,w+0.04,h+0.04,0.03,0x2b3242,false);if(hang){box(x+0.15,y+h,z,0.02,0.25,0.02,0x8a94a8,false);box(x+w-0.17,y+h,z,0.02,0.25,0.02,0x8a94a8,false);}return m;}
const DEPT_BG=k=>({clinic:'#2f7d5a',ward:'#2a6fa8',imaging:'#2a4f8a',exec:'#7a2a2a',office:'#5a4a3a',meet:'#5a4a3a',lobby:'#7a5a1a',shop:'#b0601a',server:'#1f4a4a'}[k]||'#3b4454');

// ---------- 房型家具組（房間 8 格深）：row1 靠牆、row2 走道、row3-4 / row5-6 兩排島、row7 走道、row8 門口 ----------
const wcRoom=(x,z,women,w)=>{// z = 擺設那排的起點，往南 2 格
 blk(x,z,w,2);
 if(women){for(let k=0;k<2;k++){const sx=x+0.15+k*1.0;box(sx,0,z+0.4,0.04,0.8,1.5,0x6f8ea0);box(sx+0.96,0,z+0.4,0.04,0.8,1.5,0x6f8ea0);box(sx+0.1,0,z+0.4,0.8,0.8,0.05,0x7fa0b4);box(sx+0.3,0,z+0.6,0.44,0.42,0.3,0xf7f9fb);box(sx+0.28,0,z+0.9,0.48,0.38,0.5,0xf7f9fb);box(sx+0.34,0.38,z+0.95,0.36,0.04,0.4,0x3b4454);}
  box(x+2.2,0,z+1.3,0.75,0.75,0.6,0x9fb6c2);box(x+2.25,0.75,z+1.35,0.65,0.1,0.5,0xf7f9fb);box(x+2.5,0.85,z+1.78,0.06,0.18,0.06,0x8b97a8);box(x+2.2,0.9,z+1.94,0.75,0.4,0.02,0x9ad0e8);}
 else{for(let k=0;k<2;k++){box(x+0.25+k*0.6,0.45,z+1.65,0.32,0.5,0.28,0xf7f9fb);box(x+0.3+k*0.6,0.5,z+1.69,0.22,0.3,0.18,0x9ad0e8);box(x+0.2+k*0.6,0,z+1.6,0.42,0.02,0.4,0x8b97a8);}
  box(x+1.4,0,z+0.4,0.04,0.8,1.5,0x6f8ea0);box(x+2.4,0,z+0.4,0.04,0.8,1.5,0x6f8ea0);box(x+1.5,0,z+0.4,0.8,0.8,0.05,0x7fa0b4);box(x+1.7,0,z+0.6,0.44,0.42,0.3,0xf7f9fb);box(x+1.68,0,z+0.9,0.48,0.38,0.5,0xf7f9fb);box(x+1.74,0.38,z+0.95,0.36,0.04,0.4,0x3b4454);
  box(x+2.7,0,z+1.3,1.1,0.75,0.6,0x9fb6c2);box(x+2.75,0.75,z+1.35,1.0,0.1,0.5,0xf7f9fb);box(x+3.2,0.85,z+1.78,0.06,0.18,0.06,0x8b97a8);box(x+2.7,0.9,z+1.94,1.1,0.4,0.02,0x9ad0e8);}};
const stairs3=(x,z)=>{blk(x,z,1.2,2);for(let i=0;i<4;i++)box(x,-0.9+i*0.22,z+i*0.5,1.2,0.22,0.5,i%2?0x6b7585:0x7c8797);box(x,-0.95,z,1.2,0.05,2,0x3b4454);box(x+1.18,0,z,0.06,0.9,2,0x4a5566);box(x+1.18,0.85,z,0.06,0.06,2,0xb8865a);box(x,0,z-0.06,1.24,0.9,0.06,0x4a5566);};
const elev3=(x,z)=>{box(x-0.1,0,z-0.3,2.2,0.6,0.3,0x8b97a8);box(x+0.1,0,z-0.32,0.8,0.55,0.04,0xb8c2d0);box(x+1.1,0,z-0.32,0.8,0.55,0.04,0xb8c2d0);box(x+0.49,0,z-0.33,0.02,0.55,0.04,0x3b4454);box(x+1.49,0,z-0.33,0.02,0.55,0.04,0x3b4454);emit(x+0.9,0.56,z-0.34,0.2,0.06,0.02,0xf2b84b);emit(x+0.1,0.01,z-1.95,0.8,0.02,1.6,0x5a6478);emit(x+1.1,0.01,z-1.95,0.8,0.02,1.6,0x5a6478);box(x+0.95,0.2,z-0.34,0.1,0.25,0.02,0x222222);box(x,-0.01,z-2,2,0.03,2,0x8a93a3,false);};
const bedZ=(x,z,sheet=0xf7f9fb)=>{blk(x+0.15,z+0.1,0.7,1.7);
 [[0.18,0.15],[0.76,0.15],[0.18,1.7],[0.76,1.7]].forEach(([a,b])=>{box(x+a,0,z+b,0.06,0.18,0.06,0x5a6270);box(x+a-0.01,0,z+b-0.01,0.08,0.05,0.08,0x222222,false);});
 box(x+0.15,0.18,z+0.1,0.7,0.1,1.7,0x8a94a8);box(x+0.17,0.28,z+0.12,0.66,0.16,1.66,0xe8ecf0);box(x+0.16,0.44,z+0.6,0.68,0.05,1.2,sheet);box(x+0.18,0.44,z+0.13,0.64,0.03,0.5,0xf7f9fb,false);box(x+0.28,0.47,z+0.16,0.44,0.08,0.32,0xffffff);
 box(x+0.13,0.18,z+0.05,0.74,0.55,0.07,0xb8c2d0);box(x+0.13,0.18,z+1.78,0.74,0.4,0.07,0xb8c2d0);
 box(x+0.12,0.5,z+0.4,0.03,0.04,0.9,0xaab4bf,false);box(x+0.85,0.5,z+0.4,0.03,0.04,0.9,0xaab4bf,false);box(x+0.12,0.28,z+0.42,0.03,0.22,0.03,0xaab4bf,false);box(x+0.85,0.28,z+0.42,0.03,0.22,0.03,0xaab4bf,false);
 box(x+0.88,0,z+0.08,0.12,0.02,0.12,0x5a6270,false);box(x+0.93,0,z+0.13,0.025,1.35,0.025,0xb8c2d0,false);box(x+0.86,1.33,z+0.12,0.18,0.02,0.02,0xb8c2d0,false);box(x+0.9,1.1,z+0.1,0.08,0.18,0.05,0xd6efff,false);
 box(x+0.18,0.0,z+1.85,0.6,0.02,0.02,0x5a6270,false);};
const sideTable=(x,z)=>{box(x,0,z,0.4,0.6,0.4,0xd8dde3);box(x+0.05,0.6,z+0.05,0.3,0.03,0.3,0xf4f6f8);box(x+0.12,0.63,z+0.12,0.14,0.2,0.14,0x9ad0e8);};
const locker=(x,z,w)=>{blk(x,z,w,0.45);box(x,0,z,w,1.3,0.45,0x8a94a8);for(let i=0;i<Math.floor(w/0.45);i++){box(x+0.05+i*0.45,0.05,z+0.45,0.36,1.2,0.02,0x9fb6c2);box(x+0.3+i*0.45,0.6,z+0.47,0.04,0.12,0.02,0x222222);}};
const scrubSink=(x,z)=>{blk(x,z,1,0.5);box(x,0,z,1,0.85,0.5,0xe3ebef);box(x+0.05,0.85,z+0.05,0.9,0.08,0.4,0xcfd6dc);box(x+0.3,0.93,z+0.1,0.06,0.25,0.06,0x8b97a8);box(x+0.65,0.93,z+0.1,0.06,0.25,0.06,0x8b97a8);};
const gownRack=(x,z)=>{box(x,0,z,0.06,1.4,0.06,0x8a94a8);box(x-0.3,1.35,z,0.7,0.04,0.04,0x8a94a8);box(x-0.25,0.6,z-0.03,0.2,0.75,0.08,0xf2d27a);box(x+0.05,0.6,z-0.03,0.2,0.75,0.08,0xf2d27a);};
const slideDoor=(x,z,c=0x9ad0e8)=>{box(x,1.15,z,1,0.12,0.12,0x8a94a8);box(x+0.05,0,z+0.03,0.42,1.15,0.05,c);box(x+0.53,0,z+0.03,0.42,1.15,0.05,c);};
// ---------- 各單位真實格局（房間 8 格深：row1-4 後半、row5-6 中段、row7 走道、row8 門口；門在 row9 中間） ----------
// 共用小零件
const wallSeg=(x,z,w,d,c=0xe6e9ef,h=1.3)=>{blk(x,z,w,d);box(x,0,z,w,h,d,c);};
const thinWall=(x,z,w,d,c=0xe6e9ef,h=1.3)=>{box(x,0,z,w,h,d,c);};// 不擋格子（放在格線上的薄牆要搭配 blk 用）
const GLASS=new THREE.MeshLambertMaterial({color:0xbfe0ff,transparent:true,opacity:0.35,depthWrite:false});
const glassPane=(x,y,z,w,h,d)=>{addInst('glass',GLASS,x,y,z,w,h,d,false);box(x,y+h,z,w,0.05,d,0x8a94a8);box(x,y-0.03,z,w,0.03,d,0x8a94a8);};
const leadDoor=(x,z,busy=true)=>{box(x,1.15,z-0.02,1,0.12,0.16,0x6b7585);box(x+0.05,0,z,0.9,1.15,0.1,0x8a94a8);box(x+0.47,0,z+0.1,0.06,1.15,0.02,0x3b4454);box(x+0.3,1.3,z-0.02,0.4,0.14,0.08,0x222222);emit(x+0.34,1.33,z+0.06,0.32,0.08,0.01,busy?0xef6b6b:0x3a4452);};
const consoleDesk=(x,z,n=2)=>{reg('workstation',x+0.5,1.15,z+0.3);blk(x+0.05,z+0.2,n*0.9,0.6);box(x+0.05,0,z+0.2,n*0.9,0.72,0.6,0x4a5566);for(let i=0;i<n;i++){box(x+0.15+i*0.9,0.72,z+0.22,0.6,0.42,0.05,0x1b2230);emit(x+0.18+i*0.9,0.75,z+0.21,0.54,0.34,0.01,i?0x5fd3a6:0x4f8fd6);}box(x+0.3,0.72,z+0.5,0.4,0.03,0.15,0xdfe3e8);chair(x+0.3,z+0.6);if(n>1)chair(x+1.2,z+0.6);};
const recliner=(x,z,c=0x6aa7ff)=>{blk(x+0.15,z+0.1,0.7,1.6);box(x+0.15,0.3,z+0.1,0.7,0.12,1.0,c);box(x+0.15,0.3,z+1.1,0.7,0.12,0.6,c);box(x+0.15,0.42,z+0.1,0.7,0.6,0.15,c);box(x+0.1,0.3,z+0.3,0.08,0.25,0.7,0x3b4454);box(x+0.82,0.3,z+0.3,0.08,0.25,0.7,0x3b4454);box(x+0.3,0,z+0.5,0.4,0.3,0.4,0x3b4454);};
const dialysisMachine=(x,z)=>{blk(x+0.2,z+0.1,0.6,0.6);box(x+0.2,0,z+0.1,0.6,1.4,0.6,0xf4f6f8);emit(x+0.27,1.0,z+0.71,0.46,0.3,0.01,0x4f8fd6);box(x+0.25,0.5,z+0.71,0.5,0.4,0.01,0xdfe3e8);box(x+0.3,0.55,z+0.73,0.05,0.3,0.01,0xef6b6b);box(x+0.45,0.55,z+0.73,0.05,0.3,0.01,0x6aa7ff);box(x+0.35,1.4,z+0.3,0.06,0.45,0.06,0x8a94a8);box(x+0.25,1.6,z+0.1,0.5,0.03,0.4,0x8a94a8);box(x+0.3,1.3,z+0.15,0.14,0.3,0.14,0xbfe0ff);};
const kiosk=(x,z,c=0x5fd3a6)=>{reg('kiosk',x+0.5,1.3,z+0.5);blk(x+0.3,z+0.3,0.4,0.4);box(x+0.3,0,z+0.3,0.4,1.1,0.35,0x3b4454);box(x+0.28,1.0,z+0.35,0.44,0.3,0.3,0x2b3242);emit(x+0.33,1.05,z+0.66,0.34,0.22,0.01,c);box(x+0.4,0.75,z+0.66,0.2,0.03,0.01,0x111111);};
const queueBoard=(x,z,w=1.2)=>{reg('display',x+w/2,1.4,z+0.05);box(x,1.15,z,w,0.45,0.06,0x111111);emit(x+0.06,1.2,z+0.06,w-0.12,0.35,0.01,0xef6b6b);};
const winCounter=(x,z,w,num)=>{counter(x,z,w,0xf1efe9,0xcfd6dc);glassPane(x,1.01,z+0.35,w,0.6,0.05);textPlate(x+w/2-0.2,1.64,z+0.38,0.4,0.22,String(num),'#2a7fd4');monitor(x+0.2,1.0,z+0.1);cardReader(x+w-0.55,1.0,z+0.6);labelPrinter(x+w-0.35,1.0,z+0.12);scanner(x+0.75,1.0,z+0.55);emit(x+0.15,1.02,z+0.72,w-0.3,0.12,0.004,0x1b2230);};
const packMachine=(x,z)=>{blk(x+0.1,z+0.1,1.6,0.8);box(x+0.1,0,z+0.1,1.6,1.5,0.8,0xe3ebef);box(x+0.2,0.5,z+0.9,1.0,0.7,0.02,0x9ad0e8);emit(x+1.3,1.1,z+0.9,0.3,0.2,0.01,0x5fd3a6);box(x+0.3,0.1,z+0.9,0.5,0.25,0.02,0x3b4454);};
const carm=(x,z)=>{blk(x,z+0.1,2.2,1.2);box(x+0.3,0,z+0.3,1.6,0.3,0.6,0xcfd6dc);box(x+0.15,0.55,z+0.4,1.9,0.1,0.4,0xf7f9fb);const arc=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.08,8,24,Math.PI),mat(0xe8ecf0));arc.position.set(x+1.1,0.75,z+0.6);arc.rotation.y=Math.PI/2;arc.rotation.z=Math.PI;FG.add(arc);box(x+0.95,1.4,z+0.5,0.3,0.2,0.3,0x3b4454);box(x+0.95,0,z+0.5,0.3,0.1,0.3,0x3b4454);box(x+1.9,0,z+1.0,0.3,1.0,0.3,0x8a94a8);box(x+1.6,1.0,z+0.9,0.9,0.5,0.06,0x1b2230);emit(x+1.65,1.05,z+0.96,0.8,0.4,0.01,0x4f8fd6);};
const gamma=(x,z)=>{blk(x,z+0.1,2.4,1.2);box(x+0.4,0,z+0.3,1.6,0.3,0.6,0xcfd6dc);box(x+0.2,0.55,z+0.4,2.0,0.1,0.4,0xf7f9fb);box(x+0,0,z+0.1,0.5,1.8,1.2,0xe8ecf0);box(x+0.5,1.1,z+0.2,1.5,0.35,1.0,0xdfe6ea);box(x+0.5,0.05,z+0.2,1.5,0.1,1.0,0xdfe6ea);box(x+2.0,0,z+0.5,0.4,0.9,0.4,0x8a94a8);emit(x+0.05,1.0,z+1.31,0.4,0.3,0.01,0xf2b84b);};
const mriBore=(x,z)=>{blk(x,z+0.1,2.4,1.4);const ring=new THREE.Mesh(new THREE.TorusGeometry(0.65,0.35,12,32),mat(0xeef1f4));ring.position.set(x+0.8,0.95,z+0.8);ring.rotation.y=Math.PI/2;ring.castShadow=true;FG.add(ring);box(x+0.3,0.0,z+0.3,0.9,0.4,1.0,0xdfe6ea);box(x+1.1,0,z+0.5,1.3,0.35,0.6,0xcfd6dc);box(x+1.0,0.6,z+0.55,1.4,0.1,0.5,0xf7f9fb);emit(x+0.75,1.65,z+0.75,0.1,0.05,0.1,0x5fd3a6);};
const ctRing=(x,z)=>{blk(x,z+0.1,2.4,1.2);const ring=new THREE.Mesh(new THREE.TorusGeometry(0.6,0.22,10,28),mat(0xe8ecf0));ring.position.set(x+0.7,0.85,z+0.7);ring.rotation.y=Math.PI/2;ring.castShadow=true;FG.add(ring);box(x+0.5,0,z+0.5,0.4,0.3,0.4,0xcfd6dc);box(x+0.9,0,z+0.5,1.4,0.35,0.6,0xcfd6dc);box(x+0.8,0.55,z+0.55,1.6,0.1,0.5,0xf7f9fb);emit(x+0.65,1.5,z+0.65,0.1,0.05,0.1,0x6aa7ff);};
const xrayUnit=(x,z)=>{blk(x,z+0.1,2.2,1.2);box(x+0.3,0,z+0.4,1.6,0.6,0.6,0xcfd6dc);box(x+0.2,0.6,z+0.35,1.8,0.08,0.7,0xf7f9fb);box(x+1.9,0,z+1.0,0.12,2.2,0.12,0x8a94a8);box(x+0.9,2.1,z+0.6,1.1,0.1,0.5,0x8a94a8);box(x+0.95,1.6,z+0.6,0.5,0.5,0.4,0xdfe6ea);box(x+0.05,0,z+0.1,0.4,1.6,0.3,0xdfe6ea);};// 壁掛胸腔攝影板在左
const scopeTower=(x,z)=>{reg('workstation',x+0.5,1.6,z+0.3);blk(x+0.2,z+0.2,0.6,0.6);box(x+0.2,0,z+0.2,0.6,1.1,0.6,0xcfd6dc);box(x+0.2,1.1,z+0.25,0.6,0.45,0.06,0x1b2230);emit(x+0.24,1.14,z+0.31,0.52,0.37,0.01,0xef9a9a);box(x+0.25,0.5,z+0.81,0.5,0.2,0.02,0x8a94a8);};
const apronRack=(x,z)=>{box(x,0,z,0.06,1.4,0.06,0x8a94a8);box(x-0.3,1.3,z,0.7,0.04,0.04,0x8a94a8);box(x-0.25,0.5,z-0.03,0.2,0.8,0.1,0x2a4a8a);box(x+0.05,0.5,z-0.03,0.2,0.8,0.1,0x3f8f74);};
const changeBooth=(x,z)=>{blk(x,z,1,1);box(x,0,z,0.06,1.3,1,0x9fb6c2);box(x+0.94,0,z,0.06,1.3,1,0x9fb6c2);box(x,0,z,1,1.3,0.06,0x9fb6c2);box(x,1.25,z+0.9,1,0.04,0.04,0x8a94a8);box(x+0.08,0.1,z+0.86,0.84,1.15,0.06,0xf2c9a0);box(x+0.1,0.45,z+0.1,0.8,0.05,0.3,0x8a6545);};
const crashCart=(x,z)=>cart(x,z,0xef6b6b);
const parallelBars=(x,z,len=2.4)=>{blk(x,z+0.1,len,0.8);[0.1,0.7].forEach(dz=>{box(x,0.85,z+dz,len,0.05,0.05,0x8a94a8);box(x+0.05,0,z+dz-0.02,0.06,0.85,0.09,0x8a94a8);box(x+len-0.1,0,z+dz-0.02,0.06,0.85,0.09,0x8a94a8);});};
const treadmill=(x,z)=>{blk(x+0.1,z+0.1,0.8,1.6);box(x+0.1,0,z+0.1,0.8,0.15,1.6,0x3b4454);box(x+0.15,0.15,z+0.3,0.7,0.02,1.3,0x222222);box(x+0.1,0,z+0.1,0.08,1.1,0.1,0x8a94a8);box(x+0.82,0,z+0.1,0.08,1.1,0.1,0x8a94a8);box(x+0.1,1.05,z+0.05,0.8,0.3,0.15,0x1b2230);emit(x+0.3,1.1,z+0.2,0.4,0.2,0.01,0x4f8fd6);};
const floorMat=(x,z,w,d,c=0x6aa7ff)=>{box(x,0.0,z,w,0.06,d,c);};
const ball=(x,z,c)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.3,12,10),mat(c));m.position.set(x,0.3,z);m.castShadow=true;FG.add(m);};
const therapyTable=(x,z)=>{blk(x+0.1,z+0.1,0.9,1.8);box(x+0.1,0.45,z+0.1,0.9,0.1,1.8,0x4a5566);box(x+0.12,0.55,z+0.12,0.86,0.06,1.76,0x9fb6c2);[[0.15,0.15],[0.85,0.15],[0.15,1.8],[0.85,1.8]].forEach(([a,b])=>box(x+a,0,z+b,0.08,0.45,0.08,0x8a94a8));};
const bioCabinet=(x,z)=>{blk(x+0.05,z+0.1,1.2,0.7);box(x+0.05,0,z+0.1,1.2,0.8,0.7,0xe3ebef);box(x+0.05,0.8,z+0.1,1.2,1.0,0.7,0xdfe6ea);glassPane(x+0.1,0.85,z+0.78,1.1,0.6,0.02);emit(x+0.15,1.5,z+0.79,1.0,0.03,0.01,0xbfe0ff);};
const specimenWin=(x,z)=>{counter(x,z,1.5,0xf1efe9,0xcfd6dc);glassPane(x,1.01,z+0.35,1.5,0.6,0.05);textPlate(x+0.35,1.64,z+0.38,0.8,0.22,'檢體收件','#c07a1a');box(x+0.2,1.0,z+0.5,0.4,0.25,0.3,0xdfe3e8);scanner(x+0.75,1.0,z+0.55);labelPrinter(x+1.1,1.0,z+0.15);monitor(x+0.6,1.0,z+0.1);};
const booksRow=(x,z,w,twoSided)=>{blk(x,z+0.05,w,twoSided?0.9:0.4);box(x,0,z+0.05,w,1.8,twoSided?0.9:0.4,0x6b4b32);const cols=[0x8a2a2a,0x2a4a8a,0x2f7d4a,0xb08a5a,0xdfe3e8,0xf2b84b];for(let i=0;i<4;i++){for(let j=0;j<Math.floor(w/0.14);j++){box(x+0.04+j*0.14,0.12+i*0.42,z+0.1,0.1,0.3,0.3,cols[(i+j)%6]);if(twoSided)box(x+0.04+j*0.14,0.12+i*0.42,z+0.6,0.1,0.3,0.3,cols[(i*3+j)%6]);}box(x,0.42+i*0.42,z+0.05,w,0.03,twoSided?0.9:0.4,0x3a2820);}};
const readingTable=(x,z)=>{blk(x,z+0.2,1.8,0.8);box(x,0.7,z+0.2,1.8,0.06,0.8,0x8a6545);[[0.1,0.25],[1.6,0.25],[0.1,0.85],[1.6,0.85]].forEach(([a,b])=>box(x+a,0,z+b,0.1,0.7,0.1,0x4e352c));box(x+0.8,0.76,z+0.5,0.2,0.3,0.2,0x3b4454);emit(x+0.75,1.06,z+0.45,0.3,0.04,0.3,0xfff6d6);chair(x+0.2,z-0.15,true);chair(x+1.1,z-0.15,true);chair(x+0.2,z+0.95);chair(x+1.1,z+0.95);};
const pillar=(x,z)=>{blk(x+0.3,z+0.3,0.4,0.4);box(x+0.3,0,z+0.3,0.4,1.35,0.4,0xd8d4cb);};
// 「幾個小房間一排」的通用器：period 格一間（含 1 格牆），門在 doorOff 那格，回傳每間左上 x
// ---------- 室內隔間：跟外牆同材質、同高度、同牆帽 ----------
let CURK='hall';const WALLUP={office:0xece7dc,meet:0xefe8dc,lobby:0xf3eee3,clinic:0xf1f3f0,shop:0xf4efe6,exec:0xefe6da,ward:0xf0f5f6,imaging:0xe9ecf1,server:0xdfe3e8,hall:0xf1ede4};
function PW(x,y,z,w,h,d){addInst('wall_'+CURK,WALLMATS[CURK]||WALLMATS.hall,x,y,z,w,h,d,true);box(x,y+h,z,w,0.06,d,0xc9c3b6,false);}
function LINT(x,z,w,d){const FR=0x8a94a8;box(x,0,z-0.02,0.07,1.35,d+0.04,FR);box(x+w-0.07,0,z-0.02,0.07,1.35,d+0.04,FR);box(x,1.27,z-0.02,w,0.08,d+0.04,FR);box(x,1.35,z,w,0.06,d,0xc9c3b6,false);box(x+0.07,0,z,w-0.14,0.012,d,0x6b7585,false);}
// 打開的門扇：鉸鏈在左門柱，往房間裡（北邊）開 90 度
function OPENLEAF(x,z,c=0xa07a52,glass=false){box(x+0.07,0,z-0.84,0.05,1.25,0.84,c);box(x+0.065,0.62,z-0.76,0.06,0.04,0.06,0x2b3242,false);if(glass)box(x+0.064,0.2,z-0.74,0.062,0.95,0.64,0xd6ecf2,false);else box(x+0.064,0.75,z-0.6,0.062,0.32,0.16,0xbfe0ff,false);}
const glassWin=(x,z,len)=>{box(x-0.01,0.5,z,0.24,0.6,len,0x7fa8c0,false);box(x-0.02,0.48,z-0.02,0.26,0.03,len+0.04,0x8a94a8,false);box(x-0.02,1.1,z-0.02,0.26,0.03,len+0.04,0x8a94a8,false);};
// 一排不同寬度的小房間：specs=[{w,door,lead,n}]，右邊一道隔牆、前面（row4）一道牆留門
function subRooms(x0,last,z0,specs0){let x=x0;const out=[];const used=specs0.reduce((a,c)=>a+c.w+1,0);const rest=last-x0+1-used;const specs=specs0.slice();{let left=rest;const seq=[['醫師辦公室',7],['衛材庫房',4],['討論室',6],['值班室',4]];let i=0;while(left>=2){let [nm,mx]=seq[i%seq.length];let ww=Math.min(mx,left);if(left-ww===1||left-ww===2){ww=left;}if(ww<4&&nm!=='衛材庫房')nm='衛材庫房';specs.push({w:ww,door:Math.floor(ww/2),n:nm,filler:true});left-=ww+1;i++;}}for(const sp of specs){if(x+sp.w-1>last)break;
  if(x+sp.w<=last){blk(x+sp.w,z0,1,4);PW(x+sp.w+0.4,0,z0,0.2,1.35,4);PW(x+sp.w,0,z0+3.8,1,1.35,0.2);}
  for(let c=x;c<x+sp.w;c++){if(c===x+sp.door)continue;blk(c,z0+3,1,1);PW(c,0,z0+3.8,1,1.35,0.2);}
  const dx=x+sp.door;LINT(dx,z0+3.8,1,0.2);if(sp.lead)leadDoor(dx,z0+3.85);else OPENLEAF(dx,z0+3.8);
  if(sp.n)textPlate(x+0.1,0.98,z0+4.01,Math.min(sp.w-0.2,Math.max(0.8,sp.n.length*0.2+0.2)),0.18,sp.n,sp.lead?'#2a4f8a':'#3b4454');if(sp.lead)radSign(dx-0.05,1.43,z0+4.0,1.1);
  if(sp.filler&&sp.n==='討論室'){const tw=Math.max(1.6,sp.w-2);blk(x+1,z0+0.6,tw,1.0);box(x+1,0.65,z0+0.6,tw,0.08,1.0,0x7a5a3e);box(x+1.1,0,z0+0.7,0.1,0.65,0.1,0x4e352c);box(x+tw+0.8,0,z0+0.7,0.1,0.65,0.1,0x4e352c);for(let c=x+1.1;c+0.6<=x+1+tw;c+=0.9){chair(c,z0-0.1,true);}tv(x+sp.w/2-0.7,z0+0.02,1.4);}
  else if(sp.filler&&sp.n==='值班室'){bedZ(x,z0+0.1,0xd6dce4);locker(x+1.1,z0+0.05,Math.min(1.8,sp.w-1.3));box(x+sp.w-1,0,z0+2.1,0.8,0.6,0.5,0x8a6545);}
  else if(sp.filler){if(sp.w>=5){for(let c=x;c<x+sp.w;c++){if(c===dx)continue;if((c-x)%3===2){fileCabinet(c,z0);continue;}desk(c,z0+0.05);chair(c+0.05,z0+0.85,false);}textPlate(x+0.2,1.12,z0+0.04,1.4,0.14,'值班醫師・報告區','#3b4454');}else{for(let c=x;c<x+sp.w;c++){if(c===dx)continue;shelf(c,z0+0.05,[0xdfe3e8,0x9ad0e8,0xf2b84b]);if(c+0)shelf(c,z0+1.15,[0xf4f6f8,0x6aa7ff,0xdfe3e8]);}}}
  out.push({x,w:sp.w,d:dx,n:sp.n,filler:!!sp.filler});x+=sp.w+1;}return out;}
// 小床位：沿 z 擺的床＋兩側簾子（恢復區、準備區）
const bay=(x,z,sheet=0xf7f9fb)=>{bedZ(x,z,sheet);box(x+1.1,1.3,z,0.03,0.03,1.8,0x8a94a8,false);box(x+1.09,0.5,z+0.15,0.02,0.75,1.5,0xd6ecf2,false);for(let i=0;i<5;i++)box(x+1.085,0.5,z+0.25+i*0.3,0.03,0.75,0.03,0xc2dde6,false);box(x+0.05,0.75,z-0.02,0.9,0.12,0.04,0xe3e7ec,false);emit(x+0.12,0.8,z+0.025,0.2,0.04,0.004,0x5fd3a6);};
// ---------- 核醫：熱室、注射室、注射後候檢、SPECT、控制室、PET/CT、專用廁所 ----------
const hood=(x,z)=>{blk(x+0.05,z+0.05,1.6,0.6);box(x+0.05,0,z+0.05,1.6,0.85,0.6,0xcfd6dc);box(x+0.05,0.85,z+0.05,1.6,0.75,0.6,0xe3e7ec);glassPane(x+0.1,0.9,z+0.62,1.5,0.5,0.02);for(let i=0;i<4;i++)box(x+0.2+i*0.32,0.86,z+0.2,0.28,0.14,0.18,0x5a6270,false);box(x+0.05,1.6,z+0.05,1.6,0.1,0.6,0xb8c2d0);textPlate(x+0.3,1.42,z+0.66,1.0,0.12,'放射藥物分裝','#2a4f8a');};
const doseCal=(x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.3,12),mat(0x8a94a8));m.position.set(x+0.1,y+0.15,z+0.1);FG.add(m);box(x+0.25,y,z,0.25,0.18,0.15,0x2b3242,false);emit(x+0.27,y+0.04,z+0.151,0.21,0.1,0.004,0x5fd3a6);};
const pig=(x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.12,10),mat(0x5a6270));m.position.set(x,y+0.06,z);FG.add(m);};
const radWaste=(x,z)=>{blk(x+0.3,z+0.3,0.4,0.4);box(x+0.3,0,z+0.3,0.4,0.55,0.4,0xf2c94c);box(x+0.28,0.55,z+0.28,0.44,0.05,0.44,0xe0b030,false);textPlate(x+0.33,0.25,z+0.71,0.34,0.14,'☢','#f2c94c','#1b1b1b');};
const spect=(x,z)=>{// SPECT：圓孔機架正面朝走廊方向、兩個偵測頭（上方＋側邊 90 度）、病床從後面穿過圓孔
 const gx=x+3.0,gz=z+1.0;blk(x+2.1,gz-0.3,1.8,0.6);blk(gx-0.25,z+0.1,0.5,1.9);
 box(x+2.1,0,gz-0.28,1.8,0.3,0.56,0xd8dde3);box(x+2.1,1.4,gz-0.28,1.8,0.22,0.56,0xe8ecf0);box(x+2.1,0.3,gz-0.28,0.3,1.1,0.56,0xe8ecf0);box(x+3.6,0.3,gz-0.28,0.3,1.1,0.56,0xe8ecf0);
 [gz+0.29,gz-0.29].forEach(rz=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(0.56,0.1,10,32),mat(0xcfd6dc));ring.position.set(gx,0.86,rz);FG.add(ring);});
 const disk=new THREE.Mesh(new THREE.RingGeometry(0.46,0.62,32),mat(0x9aa6b8));disk.position.set(gx,0.86,gz+0.285);FG.add(disk);
 box(x+2.1,0.3,gz+0.28,1.8,0.04,0.01,0x2a7fd4,false);box(x+2.1,1.38,gz+0.28,1.8,0.04,0.01,0x2a7fd4,false);emit(x+3.65,1.2,gz+0.285,0.12,0.06,0.003,0x5fd3a6);
 // 偵測頭：上方水平一個、左側直立一個，都伸出到病床上方
 box(gx-0.42,1.06,gz+0.3,0.84,0.24,0.8,0x3b4454);box(gx-0.4,1.05,gz+0.32,0.8,0.01,0.76,0x6aa7ff,false);box(gx-0.08,1.3,gz+0.3,0.16,0.1,0.3,0x5a6270,false);
 box(gx-0.7,0.38,gz+0.3,0.24,0.62,0.8,0x3b4454);box(gx-0.46,0.4,gz+0.32,0.01,0.58,0.76,0x6aa7ff,false);
 // 病床：底座在機架後面，床板穿過圓孔伸到前面
 box(gx-0.2,0,z+0.15,0.4,0.42,0.5,0x5a6270);box(gx-0.24,0.45,z+0.1,0.48,0.07,1.95,0x8a94a8);box(gx-0.22,0.52,z+0.9,0.44,0.06,1.1,0xf7f9fb);box(gx-0.12,0.58,z+1.7,0.24,0.06,0.25,0xffffff,false);
 // 操作手柄、工作站
 box(x+3.95,0.6,gz+0.1,0.06,0.3,0.1,0x2b3242,false);emit(x+4.01,0.78,gz+0.12,0.004,0.06,0.06,0x5fd3a6);
 blk(x+5.6,z+0.1,0.6,0.6);box(x+5.85,0,z+0.35,0.1,1.0,0.1,0x8a94a8);box(x+5.6,1.0,z+0.3,0.6,0.4,0.05,0x1b2230);emit(x+5.62,1.02,z+0.351,0.56,0.36,0.004,0x0f1a24);for(let i=0;i<3;i++)emit(x+5.66+i*0.17,1.06,z+0.355,0.14,0.28,0.003,[0xf2b84b,0xef6b6b,0x6aa7ff][i]);};
const petct=(x,z)=>{blk(x,z+0.1,3.0,1.4);[0.5,1.1].forEach((dx,i)=>{const r=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.3,12,30),mat(i?0xe8ecf0:0xdfe6ea));r.position.set(x+dx,0.95,z+0.8);r.rotation.y=Math.PI/2;r.castShadow=true;FG.add(r);});box(x+0.2,0,z+0.35,1.2,0.4,0.9,0xdfe6ea);box(x+1.3,0,z+0.55,1.6,0.35,0.5,0xcfd6dc);box(x+1.1,0.6,z+0.6,1.9,0.1,0.4,0xf7f9fb);emit(x+0.75,1.62,z+0.75,0.12,0.05,0.1,0x5fd3a6);textPlate(x+0.45,1.25,z+1.43,0.8,0.12,'PET / CT','#2a4f8a');};
function nucSuite(x0,last,z0,zf,door){const rs=subRooms(x0,last,z0,[{w:4,door:1,n:'熱室'},{w:3,door:1,n:'注射室'},{w:6,door:2,n:'注射後候檢'},{w:7,door:3,n:'SPECT',lead:1},{w:3,door:1,n:'控制室'},{w:7,door:3,n:'PET/CT',lead:1},{w:3,door:1,n:'注射後專用廁所'}]);
 rs.forEach(R=>{const x=R.x;switch(R.n){
  case '熱室':hood(x,z0);blk(x+1.8,z0+0.05,2.1,0.6);box(x+1.8,0,z0+0.05,2.1,0.85,0.6,0xcfd6dc);box(x+1.75,0.85,z0,2.2,0.05,0.7,0xb8c2d0);doseCal(x+1.9,0.9,z0+0.15);pig(x+2.7,0.9,z0+0.3);pig(x+2.9,0.9,z0+0.35);pig(x+3.1,0.9,z0+0.28);box(x+3.3,0.9,z0+0.15,0.4,0.25,0.3,0x5a6270,false);radWaste(x+2.8,z0+1.6);textPlate(x+1.9,1.15,z0+0.06,1.5,0.14,'☢ 放射性物質','#f2b84b','#1b1b1b');break;
  case '注射室':recliner(x+0.1,z0+0.2,0x6aa7ff);cart(x+1.9,z0+0.1,0x9fb6c2);box(x+1.3,0.9,z0+0.05,0.2,0.25,0.15,0xf2b84b,false);box(x+1.1,0.9,z0+0.4,0.25,0.12,0.2,0x5a6270,false);break;
  case '注射後候檢':for(let i=0;i<R.w-1;i++){if(x+i===R.d)continue;chair(x+i+0.05,z0+0.0,true,0x6aa7ff);chair(x+i+0.05,z0+1.2,true,0x6aa7ff);}wallTV(x+R.w/2-0.4,0.9,z0+0.03,0.8);textPlate(x+0.3,1.18,z0+0.04,2.2,0.14,'注射後請在此休息 勿離開','#2a4f8a');break;
  case 'SPECT':spect(x,z0);apronRack(x+0.4,z0+0.35);textPlate(x+0.3,1.15,z0+0.04,1.4,0.14,'SPECT 單光子造影','#2a4f8a');break;
  case '控制室':glassWin(x-0.6,z0+0.6,1.6);glassWin(x+R.w+0.4,z0+0.6,1.6);consoleDesk(x+0.05,z0+0.4,2);break;
  case 'PET/CT':petct(x+2.0,z0+0.4);apronRack(x+0.4,z0+0.4);break;
  case '注射後專用廁所':box(x+0.3,0,z0+0.4,0.44,0.42,0.3,0xf7f9fb);box(x+0.28,0,z0+0.7,0.48,0.38,0.5,0xf7f9fb);blk(x+0.3,z0+0.4,0.5,0.8);box(x+1.6,0,z0+0.1,0.8,0.75,0.5,0x9fb6c2);box(x+1.65,0.75,z0+0.15,0.7,0.08,0.4,0xf7f9fb);blk(x+1.6,z0+0.1,0.8,0.5);break;}});
 for(let x=x0+1;x+2.4<=door-2;x+=3){bench(x,z0+5.05,2.4);}winCounter(door+1.3,zf+0.1,Math.min(2.5,last-door-1.5),1);kiosk(door-1.5,zf+0.2,0x5fd3a6);queueBoard(door+1.5,zf+0.02);plant(x0,zf);
 if(door+5<last)for(let x=door+4;x+2.4<=last;x+=3)bench(x,z0+5.05,2.4);}
// ---------- 內視鏡：檢查室、洗消室、恢復區、更衣、報到 ----------
const scopeStand=(x,z)=>{blk(x+0.3,z+0.3,0.4,0.4);box(x+0.35,0,z+0.35,0.3,0.05,0.3,0x5a6270,false);box(x+0.47,0.05,z+0.47,0.06,1.25,0.06,0x8a94a8,false);box(x+0.15,1.0,z+0.45,0.7,0.42,0.05,0x1b2230);emit(x+0.18,1.03,z+0.501,0.64,0.36,0.004,0xd98a8a);emit(x+0.6,1.3,z+0.505,0.18,0.05,0.003,0xffffff);};
const aer=(x,z)=>{blk(x+0.05,z+0.1,0.9,0.7);box(x+0.05,0,z+0.1,0.9,0.85,0.7,0xe3e7ec);box(x+0.08,0.85,z+0.12,0.84,0.12,0.66,0xcfd6dc);box(x+0.1,0.6,z+0.81,0.4,0.18,0.01,0x2b3242,false);emit(x+0.12,0.63,z+0.812,0.36,0.12,0.003,0x5fd3a6);};
function endoSuite(x0,last,z0,zf,door){const n=Math.max(2,Math.min(3,Math.floor((last-x0-8)/6)));const specs=[];for(let i=0;i<n;i++)specs.push({w:5,door:2,n:'檢查室 '+(i+1)});specs.push({w:5,door:2,n:'洗消室'});
 const rs=subRooms(x0,last,z0,specs);
 rs.forEach(R=>{const x=R.x;if(R.n==='洗消室'){aer(x+0.1,z0);aer(x+1.1,z0);blk(x+2.2,z0+0.1,1.6,0.6);box(x+2.2,0,z0+0.1,1.6,0.85,0.6,0x9fb6c2);box(x+2.25,0.85,z0+0.15,0.7,0.08,0.5,0xf7f9fb);box(x+3.05,0.85,z0+0.15,0.7,0.08,0.5,0xf7f9fb);box(x+2.6,0.93,z0+0.15,0.05,0.25,0.05,0x8b97a8,false);box(x+3.4,0.93,z0+0.15,0.05,0.25,0.05,0x8b97a8,false);scopeCabinet(x+4,z0);textPlate(x+0.2,1.18,z0+0.04,1.6,0.14,'內視鏡洗消 每支都要登錄','#2a4f8a');return;}
  // 檢查室：床在中間（頭朝後牆）、左邊螢幕架、右邊內視鏡塔與麻醉監視、後牆櫃子洗手台
  bedZ(x+2,z0+0.05,0xf7f9fb);scopeStand(x+0.8,z0+0.6);scopeTower(x+3.1,z0+0.15);box(x+4.1,0,z0+0.2,0.6,1.0,0.5,0xdfe6ea);emit(x+4.15,0.72,z0+0.71,0.5,0.22,0.004,0x5fd3a6);blk(x+4.1,z0+0.2,0.6,0.5);
  blk(x+0.05,z0+0.05,0.7,0.45);box(x+0.05,0,z0+0.05,0.7,0.85,0.45,0xe3e7ec);box(x+0.08,0.85,z0+0.08,0.64,0.06,0.38,0xf7f9fb);box(x+0.35,0.91,z0+0.08,0.05,0.2,0.05,0x8b97a8,false);chair(x+3.0,z0+1.8,false,0x3f8f74);});
 // 前段：恢復區床位（門左）、更衣間＋候診（門右）、報到櫃台
 const bx1=door-3;let k=0;let x=x0+0.2;for(;x+1.1<=bx1&&k<8;x+=1.25){bay(x,z0+4.05);k++;}for(let xb=Math.ceil(x+0.3);xb+2.4<=bx1;xb+=3)bench(xb,z0+5.05,2.4);textPlate(x0+0.3,1.5,z0+4.0,1.2,0.18,'恢復區 '+k+' 床','#2a6fa8',undefined,true);
 winCounter(door+1.3,zf+0.1,2.2,1);changeBooth(last-2,z0+4);changeBooth(last-1,z0+4);for(let x=door+1;x+2.4<=last-2.5;x+=3)bench(x,z0+5.05,2.4);kiosk(door-1.6,zf+0.2,0x5fd3a6);}
// ---------- 心導管：導管室（C 臂、螢幕牆、鉛屏）、控制室、設備間、刷手台、準備恢復床位 ----------
const carm2=(x,z)=>{blk(x+0.8,z+0.9,4.2,0.9);box(x+2.6,0,z+1.15,0.6,0.55,0.4,0x8a94a8);box(x+0.9,0.55,z+1.0,4.0,0.08,0.6,0x3b4454);box(x+0.95,0.63,z+1.02,3.9,0.04,0.56,0x2f7d5a,false);// 檯
 const arc=new THREE.Mesh(new THREE.TorusGeometry(0.85,0.09,8,28,Math.PI*1.2),mat(0xe8ecf0));arc.position.set(x+3.2,0.95,z+1.3);arc.rotation.y=Math.PI/2;arc.rotation.z=Math.PI*0.9;arc.castShadow=true;FG.add(arc);
 box(x+3.05,1.7,z+1.15,0.3,0.25,0.3,0x3b4454);box(x+3.0,0.2,z+1.1,0.4,0.15,0.4,0x3b4454,false);box(x+3.6,0,z+1.9,0.5,0.9,0.5,0xdfe6ea);// 偵測器、X 光管、底座
 box(x+5.4,0,z+0.15,0.08,1.45,0.08,0x8a94a8,false);for(let i=0;i<3;i++)for(let j=0;j<2;j++){box(x+4.85+i*0.42,0.95+j*0.3,z+0.25,0.4,0.28,0.04,0x1b2230,false);emit(x+4.87+i*0.42,0.97+j*0.3,z+0.291,0.36,0.24,0.003,[0xcfd6dc,0x5fd3a6,0xd98a8a,0x9aa6b8,0xcfd6dc,0x6aa7ff][i*2+j]);}// 螢幕牆
 glassPane(x+2.2,0.75,z+0.55,0.6,0.6,0.02);box(x+2.45,1.35,z+0.55,0.05,0.25,0.02,0x8a94a8,false);// 鉛玻璃屏
 box(x+1.2,0,z+2.0,0.06,1.3,0.06,0x8a94a8,false);box(x+1.1,1.0,z+1.95,0.25,0.3,0.15,0xe3e7ec,false);emit(x+1.13,1.15,z+2.101,0.19,0.1,0.003,0x5fd3a6);};// 顯影劑注射器
function cathSuite(x0,last,z0,zf,door){const n=(last-x0+1)>=33?2:1;const specs=[];for(let i=0;i<n;i++){specs.push({w:8,door:4,lead:1,n:'導管室 '+(i+1)});specs.push({w:3,door:1,n:'控制室'});specs.push({w:2,door:0,n:'設備間'});}
 const rs=subRooms(x0,last,z0,specs);const labs=[];
 rs.forEach(R=>{const x=R.x;if(R.n.startsWith('導管室')){labs.push(R);carm2(x,z0);apronRack(x+0.4,z0+0.35);blk(x+0.05,z0+0.05,1.4,0.5);box(x+0.05,0,z0+0.05,1.4,1.4,0.5,0xe3e7ec);glassPane(x+0.1,0.3,z0+0.56,1.3,1.0,0.01);for(let i=0;i<8;i++)box(x+0.15+i*0.15,0.45+(i%3)*0.3,z0+0.3,0.1,0.18,0.15,[0x6aa7ff,0xf2b84b,0x5fd3a6,0xef6b6b][i%4],false);crashCart(x+7,z0+2);}
  else if(R.n==='控制室'){glassWin(x-0.6,z0+0.5,1.8);consoleDesk(x+0.05,z0+0.4,2);box(x+0.2,0,z0+2.2,0.6,0.9,0.5,0x4a5566);}
  else{blk(x,z0+0.05,2,0.6);for(let i=0;i<2;i++){box(x+0.1+i*0.95,0,z0+0.05,0.85,1.5,0.6,0x3b4454);for(let j=0;j<5;j++)LEDS.push({x:x+0.2+i*0.95,y:0.3+j*0.22,z:z0+0.655,w:0.05,h:0.025,d:0.005,color:j%3?0x5fd3a6:0xf2b84b,phase:j*3+i*7+x,rate:0.7+j*0.2});}textPlate(x+0.1,1.15,z0+0.66,1.7,0.12,'X 光產生器','#3b4454');}});
 // 前段：每間導管室門口一座刷手台；門右邊準備／恢復床位；門左報到與候診
 labs.forEach(L=>{if(L.d-1.8>x0)scrubSink(L.d-1.6,z0+4.1);});
 {let k=0,x=door+2;for(;x+1.1<=last&&k<8;x+=1.25){bay(x,z0+4.05,0xe8f0f4);k++;}for(let xb=Math.ceil(x+0.3);xb+2.4<=last;xb+=3)bench(xb,z0+5.05,2.4);}textPlate(door+2.1,1.5,z0+4.0,1.6,0.18,'準備・恢復區','#2a6fa8',undefined,true);
 winCounter(door-3.6,zf+0.1,2.2,1);for(let x=x0+1;x+2.4<=door-4;x+=3)bench(x,z0+5.05,2.4);kiosk(door-1.2,zf+0.2,0x5fd3a6);}

const roomRow=(x0,last,z0,period,doorOff,wallC=0xe6e9ef)=>{const out=[];const k=Math.floor((last-x0+2)/period);for(let i=0;i<k;i++){const cx=x0+i*period;const inner=period-1;if(cx+inner-1>last)break;
 if(cx+inner<=last){blk(cx+inner,z0,1,4);PW(cx+inner+0.4,0,z0,0.2,1.35,4);PW(cx+inner,0,z0+3.85,1,1.35,0.15);}
 for(let c=0;c<inner;c++){if(c===doorOff)continue;blk(cx+c,z0+3,1,1);PW(cx+c,0,z0+3.85,1,1.35,0.15);}
 LINT(cx+doorOff,z0+3.85,1,0.15);OPENLEAF(cx+doorOff,z0+3.85,0xe3e7ec,true);out.push(cx);}return out;};
// ---------- 急診：急救室、診間、處置室、負壓隔離室、留觀區、護理站、候診、檢傷掛號 ----------
const procLight=(x,z)=>{box(x+0.45,0,z+0.45,0.1,0.05,0.1,0x5a6270,false);box(x+0.48,0.05,z+0.48,0.04,1.2,0.04,0x8a94a8,false);box(x+0.3,1.25,z+0.3,0.4,0.06,0.4,0xdfe6ea,false);emit(x+0.34,1.24,z+0.34,0.32,0.01,0.32,0xfff6d6);};
function erSuite(x0,last,z0,zf,door,w){
 // 後排小房間：依寬度決定放幾間，至少留 6 格給留觀區
 const want=[{w:7,door:3,n:'急救室'},{w:4,door:1,n:'診間 1'},{w:4,door:1,n:'處置室'},{w:4,door:1,n:'診間 2'},{w:4,door:1,n:'負壓隔離室'}];const specs=[];let used=0;
 for(const sp of want){if(used+sp.w+1+6>w)break;specs.push(sp);used+=sp.w+1;}
 const rs=subRooms(x0,x0+used-1,z0,specs);// 不讓它自動補房間
 rs.forEach(R=>{const x=R.x;switch(R.n){
  case '急救室':for(let i=0;i<3;i++){bedZ(x+i*2.2+0.1,z0+0.05,0xe8f0f4);box(x+i*2.2+1.0,0,z0+0.15,0.45,1.05,0.4,0xdfe6ea);emit(x+i*2.2+1.04,0.75,z0+0.56,0.37,0.22,0.004,[0x5fd3a6,0xef6b6b,0xf2b84b][i]);blk(x+i*2.2+1.0,z0+0.15,0.45,0.4);}crashCart(x+6,z0+2);ventilator(x+0.75,z0+1.45);o2tank(x+2.0,z0+2.5);textPlate(x+0.3,1.15,z0+0.04,1.6,0.16,'急救區 RESUS','#c0392b');break;
  case '診間 1':case '診間 2':blk(x+0.1,z0+0.15,1.9,0.6);box(x+0.1,0,z0+0.15,1.9,0.72,0.6,0x8a6545);monitor(x+0.2,0.75,z0+0.2);monitor(x+1.2,0.75,z0+0.2);cardReader(x+0.78,0.72,z0+0.55);chair(x+0.25,z0+0.28,false,0x2b3242);chair(x+0.05,z0+2.2,true,0x9aa3ad);
   blk(x+2.2,z0+0.6,0.7,1.8);box(x+2.2,0.25,z0+0.6,0.7,0.3,1.8,0xb9c2cc);box(x+2.22,0.55,z0+0.62,0.66,0.1,1.76,0xf7f9fb);box(x+2.3,0.65,z0+0.7,0.5,0.08,0.4,0xffffff);box(x+3.2,0,z0+0.1,0.6,0.75,0.45,0xe3ebef);box(x+3.25,0.75,z0+0.15,0.5,0.06,0.35,0xf7f9fb);break;
  case '處置室':bedZ(x+1.5,z0+0.05,0xf7f9fb);procLight(x+0.4,z0+0.6);instTray(x+2.7,z0+1.0);blk(x+2.6,z0+0.05,1.3,0.5);box(x+2.6,0,z0+0.05,1.3,1.2,0.5,0xe3ebef);glassPane(x+2.65,0.4,z0+0.56,1.2,0.7,0.01);box(x+0.1,0,z0+0.05,0.8,0.8,0.45,0xe3ebef);box(x+0.15,0.8,z0+0.1,0.7,0.06,0.35,0xf7f9fb);blk(x+0.1,z0+0.05,0.8,0.45);break;
  case '負壓隔離室':// 裡面用玻璃隔出前室
   bedZ(x+2.2,z0+0.05,0xe8f0f4);box(x+3.1,0,z0+0.2,0.45,1.0,0.4,0xdfe6ea);emit(x+3.14,0.75,z0+0.61,0.37,0.22,0.004,0x5fd3a6);blk(x+3.1,z0+0.2,0.45,0.4);
   box(x+0.1,0.75,z0+1.9,1.7,0.6,0.04,0xbfe0ff,false);box(x+1.8,0,z0+1.9,0.06,1.35,1.1,0x9fb6c2,false);gownRack(x+0.5,z0+2.6);box(x+0.1,0,z0+0.1,0.8,0.8,0.45,0xe3ebef);blk(x+0.1,z0+0.1,0.8,0.45);
   box(x+R.w-0.4,1.0,z0+3.95,0.3,0.2,0.05,0x2b3242,false);emit(x+R.w-0.38,1.05,z0+4.0,0.26,0.1,0.003,0x5fd3a6);textPlate(x+0.3,1.18,z0+0.04,1.6,0.14,'負壓 -2.5 Pa','#2a6fa8');break;}});
 // 留觀區：沿後牆一排簾子床位
 const ox=x0+used;let k=0;for(let x=ox+0.1;x+1.1<=last+0.9&&k<12;x+=1.25){bay(x,z0+0.05,0xe8f0f4);k++;}if(k)textPlate(ox+0.2,1.5,z0+2.0,1.6,0.22,'留觀區 '+k+' 床','#c0392b',undefined,true);
 for(let i=0;i<Math.min(3,Math.floor(k/4));i++)cow(ox+1+i*3,z0+2.2);
 // 中段：左邊候診、右邊島型護理站
 const midL=x0+1,midR=door-2;for(let x=midL;x+2.4<=midR;x+=3){bench(x,z0+4.05,2.4);bench(x,z0+5.05,2.4);}
 const sx=Math.min(last-5,door+2),sw=Math.min(5,last-sx-0.5);if(sw>=2){counter(sx,z0+5.1,sw,0xe8eef0,0xef6b6b);for(let i=0;i<Math.floor(sw/1.6);i++)monitor(sx+0.25+i*1.6,1.0,z0+5.2);deskPhone(sx+sw-0.4,1.0,z0+5.4);scanner(sx+0.9,1.0,z0+5.55);centralMonitor(sx+0.3,1.2,z0+5.12,Math.min(1.6,sw-0.6));for(let i=0;i<Math.floor(sw/1.6);i++)chair(sx+0.3+i*1.6,z0+4.3,false);textPlate(sx+sw/2-0.8,1.5,z0+5.9,1.6,0.26,'急診護理站','#c0392b','#ffffff',true);}
 // 前排：門右邊檢傷站＋掛號窗口、血壓機；門左邊輪椅、推床
 winCounter(door+1.3,zf+0.1,2.2,1);bpMachine(door+3.6,zf);if(door+6.8<=last)winCounter(door+4.6,zf+0.1,2.0,2);textPlate(door+4.7,1.9,zf+0.47,1.8,0.18,'急診掛號批價','#5a3a7a');
 wheelchair(door-2,zf);wheelchair(door-3,zf);if(door-6>=x0)stretcher(door-6,zf);if(door-9>=x0)stretcher(door-9,zf);
 {const fx=sx+sw+1.2;let n=0;for(let x=fx;x+1.9<=last+0.8&&n<3;x+=2.3){stretcher(x,z0+4.1);n++;}if(n){textPlate(fx,1.5,z0+5.2,2.2,0.26,'救護車入口・推床區','#c0392b','#ffffff',true);o2tank(fx+0.2,z0+5.6);o2tank(fx+0.45,z0+5.6);}}
 emit(x0+w/2-1.0,1.5,z0+0.02,2.0,0.3,0.02,0xef6b6b);}
// ---------- 行政辦公室、研究、教學、大會議室、值班宿舍 ----------
const lowPanel=(x,z,w,d)=>{box(x,0,z,w,0.82,d,0x9aa6b8);box(x,0.82,z,w,0.03,d,0x6b7585,false);};
// OA 辦公：四人一組的屏風座位（面對面），組與組之間留走道
function officePods(x0,last,z,c=0x6b4b32){for(let x=x0;x+1<=last;x+=3){if(x+2>last+1)break;for(let i=0;i<2;i++){if(x+i>last)continue;desk(x+i,z,c);chair(x+i+0.05,z-0.25,false);desk(x+i,z+1.1,c);chair(x+i+0.05,z+1.25);}
  lowPanel(x+0.05,z+0.68,Math.min(2,last-x+1)-0.1,0.06);lowPanel(x+Math.min(2,last-x+1)-0.03,z+0.15,0.06,1.6);}}
const safeBox=(x,z)=>{blk(x+0.2,z+0.1,0.6,0.6);box(x+0.2,0,z+0.1,0.6,0.85,0.6,0x3b4454);box(x+0.25,0.05,z+0.7,0.5,0.75,0.02,0x4a5566,false);const m=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.03,16),mat(0xb8a040));m.rotation.x=Math.PI/2;m.position.set(x+0.5,0.55,z+0.73);FG.add(m);box(x+0.62,0.3,z+0.72,0.03,0.15,0.03,0xb8a040,false);};
const kpiBoard=(x,z)=>{box(x,0.6,z,1.8,0.75,0.05,0xf4f6f8);[0.3,0.5,0.4,0.62,0.55].forEach((h,i)=>emit(x+0.15+i*0.18,0.7,z+0.051,0.12,h*0.6,0.004,[0x2a7fd4,0x5fd3a6,0xf2b84b,0x2a7fd4,0xef6b6b][i]));emit(x+1.1,0.75,z+0.051,0.6,0.02,0.004,0xef6b6b);for(let i=0;i<4;i++)emit(x+1.1,0.85+i*0.1,z+0.051,0.55,0.025,0.004,0x9aa6b8);};
const ppeShelf=(x,z)=>{blk(x+0.05,z+0.1,0.9,0.45);box(x+0.05,0,z+0.1,0.9,1.4,0.45,0xe3e7ec);for(let i=0;i<4;i++){box(x+0.05,0.3+i*0.32,z+0.1,0.9,0.02,0.45,0xcfd6dc,false);for(let j=0;j<3;j++)box(x+0.1+j*0.28,0.32+i*0.32,z+0.15,0.24,0.18,0.3,[0xf2d27a,0x9ad0e8,0xffffff,0x5fd3a6][i],false);}};
const foodDisplay=(x,z)=>{blk(x+0.05,z+0.1,1.8,0.55);box(x+0.05,0,z+0.1,1.8,0.8,0.55,0xe3e7ec);glassPane(x+0.1,0.8,z+0.12,1.7,0.5,0.5);for(let i=0;i<6;i++){box(x+0.2+i*0.27,0.82,z+0.25,0.2,0.04,0.2,0xffffff,false);box(x+0.23+i*0.27,0.86,z+0.28,0.14,0.06,0.14,[0xd98c3a,0x5fd3a6,0xef6b6b,0xf2d27a,0x8a6545,0x9ad07a][i],false);}};
const toolShelf=(x,z)=>{blk(x+0.05,z+0.1,0.9,0.5);box(x+0.05,0,z+0.1,0.9,1.5,0.5,0x8a94a8);for(let i=0;i<4;i++){box(x+0.05,0.32+i*0.36,z+0.1,0.9,0.03,0.5,0x6b7585,false);box(x+0.1,0.35+i*0.36,z+0.15,0.35,0.22,0.35,[0xc9a978,0x2a7fd4,0xc9a978,0xef6b6b][i],false);box(x+0.5,0.35+i*0.36,z+0.2,0.35,0.15,0.3,[0x5a6270,0xf2b84b,0x9aa3ad,0xc9a978][i],false);}};
const mediaWall=(x,z,w)=>{box(x,0.2,z,w,1.15,0.06,0x2a4f8a);for(let i=0;i<Math.floor(w/0.5);i++)for(let j=0;j<2;j++)box(x+0.1+i*0.5,0.45+j*0.45,z+0.061,0.3,0.2,0.004,0xffffff,false);textPlate(x+0.2,1.1,z+0.07,Math.min(2,w-0.4),0.18,'醫院 新聞發布','#2a4f8a');};
const tripod=(x,z)=>{box(x+0.45,0,z+0.45,0.04,1.0,0.04,0x2b3242,false);box(x+0.3,0,z+0.55,0.3,0.02,0.02,0x2b3242,false);box(x+0.38,1.0,z+0.4,0.2,0.14,0.22,0x1b2230,false);box(x+0.43,1.03,z+0.62,0.1,0.08,0.06,0x2b3242,false);};
const microscope=(x,y,z)=>{box(x,y,z,0.16,0.03,0.2,0x2b3242,false);box(x+0.05,y+0.03,z+0.14,0.05,0.25,0.05,0xe3e7ec,false);box(x+0.03,y+0.22,z+0.04,0.1,0.06,0.14,0xe3e7ec,false);box(x+0.06,y+0.28,z+0.08,0.04,0.08,0.04,0x2b3242,false);box(x+0.02,y+0.1,z+0.04,0.12,0.02,0.1,0x5a6270,false);};
const freezer80=(x,z)=>{blk(x+0.1,z+0.1,0.8,0.7);box(x+0.1,0,z+0.1,0.8,1.6,0.7,0xe3e7ec);box(x+0.15,0.1,z+0.8,0.7,1.4,0.02,0xdfe3e8,false);box(x+0.75,0.7,z+0.82,0.05,0.25,0.03,0x5a6270,false);box(x+0.2,1.35,z+0.81,0.3,0.12,0.02,0x1b2230,false);emit(x+0.22,1.37,z+0.832,0.26,0.08,0.003,0xef6b6b);textPlate(x+0.2,1.18,z+0.83,0.5,0.1,'-80℃','#2a6fa8');};
const ln2Tank=(x,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.85,16),mat(0xcfd6dc));m.position.set(x+0.5,0.43,z+0.5);m.castShadow=true;FG.add(m);blk(x+0.2,z+0.2,0.6,0.6);const c=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.12,12),mat(0x5a6270));c.position.set(x+0.5,0.92,z+0.5);FG.add(c);box(x+0.35,0.5,z+0.77,0.3,0.12,0.01,0x2a6fa8,false);};
const cageRack=(x,z)=>{blk(x+0.05,z+0.1,0.9,0.55);box(x+0.05,0,z+0.1,0.06,1.5,0.55,0x8a94a8);box(x+0.89,0,z+0.1,0.06,1.5,0.55,0x8a94a8);for(let i=0;i<5;i++)for(let j=0;j<3;j++){box(x+0.12+j*0.26,0.15+i*0.27,z+0.15,0.24,0.2,0.45,0xd6ecf2);box(x+0.13+j*0.26,0.33+i*0.27,z+0.15,0.22,0.02,0.45,0x9aa3ad,false);box(x+0.2+j*0.26,0.2+i*0.27,z+0.61,0.08,0.05,0.005,0xffffff,false);}};
const manikinBed=(x,z)=>{bedZ(x,z,0xd6dce4);box(x+0.35,0.5,z+0.25,0.3,0.12,0.3,0xf1d3b3,false);box(x+0.3,0.5,z+0.6,0.4,0.1,0.7,0x9ad0e8,false);};
function classroom(x0,last,z0,zf,door,w){tv(x0+w/2-1.2,z0+0.02,2.4);board(x0+0.4,z0+0.02);if(last-2.2>x0+w/2+1.4)board(last-2.2,z0+0.02);
 blk(x0+w/2-0.5,z0+1.0,1,0.5);box(x0+w/2-0.5,0,z0+1.0,1,0.95,0.5,0x6b4b32);box(x0+w/2-0.55,0.95,z0+0.95,1.1,0.05,0.6,0x8a6545);monitor(x0+w/2-0.2,1.0,z0+1.0);// 講台
 for(const z of [z0+2.3,z0+3.6,z0+4.9])for(let x=x0+1;x+1.8<=last;x+=2.4){if(x<=door+0.5&&x+1.8>=door-0.5&&z>z0+4)continue;blk(x,z+0.1,1.8,0.45);box(x,0.62,z+0.1,1.8,0.05,0.45,0xd8c3a0);box(x+0.05,0,z+0.15,0.05,0.62,0.35,0x6b7585,false);box(x+1.7,0,z+0.15,0.05,0.62,0.35,0x6b7585,false);chair(x+0.15,z+0.35,false,0x2a7fd4);chair(x+0.95,z+0.35,false,0x2a7fd4);}
 box(x0+w/2-0.15,1.3,z0+3.2,0.3,0.1,0.25,0xe3e7ec,false);}
function auditorium(x0,last,z0,zf,door,w){blk(x0+1,z0,w-2,1.2);box(x0+1,0,z0,w-2,0.25,1.2,0x6b4b32);box(x0+1,0.25,z0,w-2,0.02,1.2,0x8a6545,false);tv(x0+w/2-1.8,z0+0.02,3.6);blk(x0+w/2+2,z0+0.3,0.7,0.5);box(x0+w/2+2,0.25,z0+0.3,0.7,0.9,0.5,0x4e352c);
 for(let z=z0+2;z<=z0+5;z+=1)for(let x=x0+1;x<=last-1;x+=1){if(Math.abs(x-door)<=1)continue;chair(x,z-0.1,false,0x8a2a2a);}textPlate(x0+w/2-1.2,1.1,z0+0.04,2.4,0.2,'國際會議廳','#3a2820');}
function dorm(x0,last,z0,zf,door){const rs=subRooms(x0,last,z0,Array.from({length:Math.floor((last-x0+2)/4)},(_,i)=>({w:3,door:1,n:'值班室 '+(i+1)})));rs.forEach(R=>{if(R.filler)return;bedZ(R.x,z0+0.1,0xd6dce4);locker(R.x+1.2,z0+0.05,1.6);blk(R.x+2.1,z0+1.8,0.8,0.5);box(R.x+2.1,0,z0+1.8,0.8,0.7,0.5,0x8a6545);});
 for(let x=x0+1;x+2.4<=door-1;x+=3)bench(x,z0+5.05,2.4);waterDispenser(door+2,zf);}
function researchLab(r,x0,last,z0,zf,door,w){const nm=r.name;
 if(/生物資料庫/.test(nm)){for(let x=x0;x<=last;x++){if(x%4===3){ln2Tank(x,z0);continue;}freezer80(x,z0);}for(let x=x0+1;x<=last-1;x++){if((x-x0)%4===0)continue;freezer80(x,z0+2.2);}desk(door+2,zf-0.1);chair(door+2.05,zf-0.3,true);textPlate(x0+0.3,1.62,z0+0.03,1.6,0.18,'檢體冷凍庫','#2a6fa8');return;}
 if(/動物/.test(nm)){for(let x=x0;x<=last;x++)cageRack(x,z0);for(let x=x0+1;x<=last-1;x++){if((x-x0)%4===0)continue;cageRack(x,z0+2.2);}bioCabinet(door+2,zf-0.15);textPlate(x0+0.3,1.62,z0+0.03,1.6,0.18,'動物房 SPF','#2f7d4a');return;}
 if(/臨床試驗/.test(nm)){const rs=subRooms(x0,Math.min(last,x0+15),z0,[{w:3,door:1,n:'訪談室 1'},{w:3,door:1,n:'訪談室 2'},{w:3,door:1,n:'檢體處理'},{w:4,door:2,n:'藥品管制室'}]);
  rs.forEach(R=>{if(R.n&&R.n.startsWith('訪談')){blk(R.x+0.6,z0+0.8,1.6,0.8);box(R.x+0.6,0.65,z0+0.8,1.6,0.06,0.8,0x8a6545);box(R.x+1.35,0,z0+1.1,0.1,0.65,0.1,0x4e352c);chair(R.x+0.8,z0+0.05,true);chair(R.x+0.8,z0+1.5);}else if(R.n==='檢體處理'){bioCabinet(R.x,z0);fridge(R.x+2,z0+0.1);}else if(R.n==='藥品管制室'){fridge(R.x,z0+0.1);safeBox(R.x+1,z0);shelf(R.x+2,z0+0.05,[0xf4f6f8,0x6aa7ff,0xf2b84b]);}});
  if(x0+17<=last-1)officePods(x0+17,last-1,z0+2.1);officePods(x0+1,door-2,z0+4.3);return;}
 // 一般實驗室：靠牆排煙櫃、生物安全櫃、冰箱；中間兩排實驗桌（顯微鏡、試管架）
 for(let x=x0;x<=last;x++){if(x%5===0)bioCabinet(x,z0);else if(x%5===2)fridge(x,z0+0.1);else if(x%5===3)freezer80(x,z0);}
 [z0+2.2,z0+4.1].forEach(z=>{for(let x=x0+1;x+2.6<=last;x+=3.4){blk(x,z+0.1,2.6,0.9);box(x,0,z+0.1,2.6,0.85,0.9,0xe3e7ec);box(x-0.05,0.85,z+0.05,2.7,0.05,1.0,0x3b4454);box(x+1.25,0.9,z+0.1,0.1,0.55,0.9,0xcfd6dc);microscope(x+0.3,0.9,z+0.25);microscope(x+1.7,0.9,z+0.6);for(let j=0;j<6;j++)box(x+0.6+j*0.06,0.9,z+0.65,0.03,0.1,0.03,[0xef6b6b,0x6aa7ff,0xf2b84b,0x5fd3a6,0xd08cff,0xffffff][j],false);box(x+2.0,0.9,z+0.2,0.3,0.25,0.3,0xdfe6ea,false);}});
 textPlate(x0+0.3,1.62,z0+0.03,1.4,0.18,nm,'#2a4f8a');}
// 資訊部這類大辦公室：主任座位、四人一組的工位、討論桌、茶水、門口值班台，不是一整片排排坐
function itOffice(r,x0,last,z0,zf,door,w){const zb=z0+0.02;
 // 後牆：檔案櫃、白板（排班）、影印機
 fileCabinet(x0+4,z0);fileCabinet(x0+5,z0);board(x0+6.4,zb);clock(x0+8.6,zb);copier(x0+10,z0);fileCabinet(x0+12,z0);if(w>=22){fileCabinet(x0+13,z0);poster(x0+14.4,zb,0x6aa7ff);}
 // 西側：主任座位，矮隔板圍起來，前面兩張訪客椅
 desk(x0+1,z0+1.3,0x4e352c);desk(x0+2,z0+1.3,0x4e352c);chair(x0+1.55,z0+1.05,false,0x2b2b2b);chair(x0+0.9,z0+2.6);chair(x0+2.1,z0+2.6);fileCabinet(x0,z0);plant(x0,z0+3.2);
 lowPanel(x0+3.5,z0+0.3,0.06,3.4);textPlate(x0+1.0,1.5,zb+0.04,1.3,0.16,'主任','#ffffff','#1b2230');
 // 東側：討論桌＋電視，矮隔板隔開；再過去是茶水區
 const tx=last-4.4;lowPanel(tx-0.8,z0+0.3,0.06,3.4);blk(tx,z0+2.0,3.2,0.9);box(tx,0.65,z0+2.0,3.2,0.06,0.9,0x8a6545);[[0.1,0.1],[3.0,0.1],[0.1,0.7],[3.0,0.7]].forEach(([a,c])=>box(tx+a,0,z0+2.0+c,0.1,0.65,0.1,0x4e352c));
 for(let c=tx+0.1;c+0.7<=tx+3.2;c+=1.0){chair(c,z0+1.2,true);chair(c,z0+2.75);}tv(tx+0.9,zb,1.4);textPlate(tx+0.2,1.95,zb+0.04,1.2,0.14,'討論區','#5a4a3a');
 counter(last-2.2,z0+4.5,2.2,0xe8e2d6,0x8a6545);coffeeMachine(last-2.0,0.95,z0+4.65);cupSet(last-1.4,0.95,z0+4.85,3);waterDispenser(last,z0+5.6);textPlate(last-2.0,1.5,z0+4.62,1.2,0.14,'茶水區','#5a4a3a',undefined,true);
 // 中間：四人一組的工位，兩排，組跟組之間留走道
 const px0=x0+5,px1=tx-2;officePods(px0,px1,z0+2.2);officePods(px0,Math.min(px1,door-2),z0+4.4);if(door+4<=px1)officePods(door+4,px1,z0+4.4);
 // 門口：值班台（兩個位子、電話），來報修的人第一個看到
 {const dx=door+1<=px1-1?door+1:door-2;desk(dx,z0+6.0);desk(dx+1,z0+6.0);chair(dx+0.05,z0+6.15);chair(dx+1.05,z0+6.15);box(dx+0.1,0.61,z0+6.25,0.18,0.06,0.2,0x2b3242,false);box(dx+1.1,0.61,z0+6.25,0.18,0.06,0.2,0x2b3242,false);textPlate(dx+0.3,1.6,z0+6.3,1.3,0.18,'值班台','#ffffff','#2a7fd4',true);}
 plant(last,zf);}
function adminOffice(r,x0,last,z0,zf,door,w){const b=r.base;
 // 後牆：檔案櫃一排、主管座位在角落
 for(let x=x0;x<=last-3;x++){if((x-x0)%4===3)continue;fileCabinet(x,z0);}desk(last-1,z0+0.1,0x4e352c);chair(last-0.95,z0+0.9,true,0x2b2b2b);plant(last,z0+0.1);
 officePods(x0+1,last-1,z0+2.2);
 switch(b){
  case 'acct':safeBox(last,zf-1.1);textPlate(x0+0.3,1.62,z0+0.03,1.6,0.18,'會計室・出納','#5a4a3a');break;
  case 'hr':board(last-2.2,z0+0.02);textPlate(last-2.1,1.4,z0+0.09,1.4,0.12,'人才招募公告','#5a4a3a');break;
  case 'ga':toolShelf(last,z0+4.3);box(sideOf(r)-0.06,0.6,z0+4.3,0.05,0.6,0.5,0x8a94a8,false);for(let i=0;i<12;i++)box(sideOf(r)-0.07,0.65+Math.floor(i/4)*0.17,z0+4.35+(i%4)*0.1,0.01,0.05,0.05,0xf2b84b,false);textPlate(x0+0.3,1.62,z0+0.03,1.6,0.18,'總務課・修繕報修','#5a4a3a');break;
  case 'pr':mediaWall(last-2.6,z0+0.02,2.4);tripod(last-1.6,z0+1.0);break;
  case 'qa':kpiBoard(last-2.4,z0+0.02);textPlate(x0+0.3,1.62,z0+0.03,1.6,0.18,'品質指標・病安通報','#5a4a3a');break;
  case 'sw':sofa(last-1.8,z0+4.3,1.7,0x6a8a6a);box(last-1.2,0.4,z0+5.2,0.15,0.08,0.1,0xffffff,false);break;
  case 'ic':ppeShelf(last,z0+4.3);poster(last-1.6,z0+0.02,0x5fd3a6);textPlate(x0+0.3,1.62,z0+0.03,1.6,0.18,'感染管制・手部衛生','#2f7d5a');break;
  case 'nutrition':foodDisplay(last-1.9,z0+4.3);textPlate(x0+0.3,1.62,z0+0.03,1.6,0.18,'營養諮詢・治療飲食','#b0601a');break;}}
const sideOf=r=>r.x+r.w;

function furnish(r,kind){CURK=kind;const x0=r.x,z0=r.y,w=r.w,h=r.h,zb=z0+0.02,last=x0+w-1,zi=z0+2,zi2=z0+4,zf=z0+h-1,door=r.door[0],b=r.base;
 const corners=()=>{plant(x0,zf);if(w>3)plant(last,zf);};
 const deskRow=(from,to,z,c)=>{for(let x=from;x<=to;x++){if((x-x0)%4===0)continue;desk(x,z,c);chair(x+0.05,z-0.25,false);desk(x,z+1.1,c);chair(x+0.05,z+1.25);}};
 const benches=(from,to,z,two=true)=>{for(let x=from;x+2.4<=to+1;x+=3){bench(x,z,2.4);if(two)bench(x,z+1.0,2.4);}};
 const beds=(from,to,z,sheet)=>{for(let x=from;x+1.9<=to+1;x+=2.2){bed(x,z,sheet);curtain(x,z+0.9,2);bed(x,z+1.0,sheet);}};
 // 影像類：左邊鉛牆機房（鉛門＋檢查中燈）、隔玻璃的操作室、更衣小間、候診區、櫃台
 const imagingSuite=(unit,extra)=>{const mw=Math.max(5,Math.min(8,w-6));const mR=x0+mw-1;// 機房 x0..mR
  blk(mR+1,z0,1,4);PW(mR+1.4,0,z0,0.2,1.35,4);PW(mR+1,0,z0+3.8,1,1.35,0.2);glassWin(mR+1.4,z0+1.4,1.2);// 鉛牆＋觀察窗
  for(let c=x0;c<=mR;c++){if(c===mR-1)continue;blk(c,z0+3,1,1);PW(c,0,z0+3.8,1,1.35,0.2);}LINT(mR-1,z0+3.8,1,0.2);leadDoor(mR-1,z0+3.85);radSign(mR-1.05,1.43,z0+4.0,1.1);
  unit(x0+Math.max(0.5,(mw-2.4)/2),z0+0.9);apronRack(x0+0.3,z0+0.4);box(x0+0.1,1.0,z0+3.6,0.5,0.25,0.03,0xf2b84b);
  // 操作室 mR+2..mR+4：控制台面向觀察窗
  const cR=Math.min(last,mR+4);if(cR>mR+2){blk(cR+1<=last?cR+1:cR+1,z0,1,0);for(let c=mR+2;c<=cR;c++){if(c===mR+3)continue;blk(c,z0+3,1,1);PW(c,0,z0+3.85,1,1.35,0.15);}LINT(mR+3,z0+3.85,1,0.15);OPENLEAF(mR+3,z0+3.85);
   if(cR+1<=last){blk(cR+1,z0,1,4);PW(cR+1.4,0,z0,0.2,1.35,4);PW(cR+1,0,z0+3.85,1,1.35,0.15);}
   consoleDesk(mR+2.1,z0+1.0,2);box(mR+2.2,0,z0+0.1,1.2,0.9,0.5,0x4a5566);emit(mR+2.3,0.5,z0+0.61,1.0,0.3,0.01,0x1b2230);poster(mR+3.8,zb,0x8a94a8);}
  // 右側：更衣小間兩間＋儲物
  if(cR+3<=last){changeBooth(cR+2,z0+3);if(cR+4<=last)changeBooth(cR+3,z0+3);locker(cR+2,z0+0.1,Math.min(1.8,last-cR-1.6));}
  // 中段：候診長椅（右半）、輪椅；門口：報到櫃台＋叫號
  benches(Math.max(x0+1,mR+1),last-1,zi2+1.05,false);if(extra)extra(mR,cR);
  winCounter(door+1.3,zf+0.1,Math.min(2.5,last-door-1.5),1);kiosk(door-1.5,zf+0.2,0x5fd3a6);queueBoard(door+1.5,zf+0.02);plant(x0,zf);};
 switch(kind){
 case 'office':{
  if(b==='lib'){// 圖書館：服務台、靠牆書架、中間兩面書架、閱覽桌、電腦區
   counter(x0+0.3,z0+0.2,Math.min(3,w-2));monitor(x0+0.6,1.01,z0+0.35);booksRow(x0+Math.min(3,w-2)+0.6,z0+0.05,Math.max(1,last-x0-Math.min(3,w-2)-0.8),false);
   for(let x=x0+1;x+3<=last;x+=4)booksRow(x,zi+0.55,3,true);
   for(let x=x0+1;x+2.2<=last-2;x+=3)readingTable(x,zi2+0.3);if(w>=8){desk(last-1,zi2+0.0,0x3b4454);chair(last-0.95,zi2-0.25);desk(last-1,zi2+1.1,0x3b4454);chair(last-0.95,zi2+1.25);}
   blk(last-0.9,zf+0.1,0.8,0.6);box(last-0.9,0,zf+0.1,0.8,1.2,0.5,0x8a6545);for(let i=0;i<3;i++)box(last-0.85,0.3+i*0.3,zf+0.6,0.7,0.2,0.02,0xf4f6f8);sign(x0+0.2,zb,0xb08a5a);plant(x0,zf);break;}
  if(b==='research'){researchLab(r,x0,last,z0,zf,door,w);break;}
  if(b==='edu'&&/模擬/.test(r.name)){const rs=subRooms(x0,last,z0,[{w:5,door:2,n:'模擬病房'},{w:3,door:1,n:'控制室'},{w:5,door:2,n:'模擬手術室'},{w:5,door:2,n:'課後討論'}]);
   rs.forEach(R=>{const x=R.x;if(R.n==='模擬病房'){manikinBed(x+2,z0+0.05);box(x+3.2,0,z0+0.2,0.45,1.0,0.4,0xdfe6ea);emit(x+3.24,0.75,z0+0.61,0.37,0.22,0.004,0x5fd3a6);blk(x+3.2,z0+0.2,0.45,0.4);crashCart(x+0.2,z0+0.2);}
    else if(R.n==='控制室'){glassWin(x-0.6,z0+0.5,1.8);glassWin(x+R.w+0.4,z0+0.5,1.8);consoleDesk(x+0.05,z0+0.4,2);}
    else if(R.n==='模擬手術室'){orTable(x+1.5,z0+0.6);box(x+0.2,0,z0+0.2,0.9,1.4,0.6,0xe3ebef);blk(x+0.2,z0+0.2,0.9,0.6);}
    else if(R.n==='課後討論'){blk(x+0.8,z0+0.7,3.2,0.9);box(x+0.8,0.65,z0+0.7,3.2,0.06,0.9,0x8a6545);for(let c=x+0.9;c+0.6<=x+4;c+=0.9){chair(c,z0-0.05,true);}tv(x+R.w/2-0.7,z0+0.02,1.4);}});
   for(let x=x0+1;x+2.4<=last-1;x+=3)bench(x,z0+5.05,2.4);break;}
  if(b==='edu'){classroom(x0,last,z0,zf,door,w);break;}
  if(['hr','acct','ga','pr','qa','sw','ic','nutrition'].includes(b)){adminOffice(r,x0,last,z0,zf,door,w);break;}
  if(w>=16){itOffice(r,x0,last,z0,zf,door,w);break;}
  for(let i=0;i<w;i++){const tx=x0+i;if(i===w-1&&w>3){printer(tx,z0+0.1);continue;}if(i%3===1){blk(tx+0.1,z0+0.05,0.8,0.5);box(tx+0.1,0,z0+0.05,0.8,1.2,0.5,0x8a94a8);box(tx+0.15,0.3,z0+0.55,0.7,0.03,0.02,0x222222);box(tx+0.15,0.75,z0+0.55,0.7,0.03,0.02,0x222222);}}
  deskRow(x0+1,last-1,zi);deskRow(x0+1,last-1,zi2);board(x0+0.4,zb);if(w>5)poster(last-2.2,zb,0x6aa7ff);clock(x0+w/2,zb);corners();break;}
 case 'meet':{if(/國際會議廳/.test(r.name)){auditorium(x0,last,z0,zf,door,w);break;}if(/值班宿舍/.test(r.name)){dorm(x0,last,z0,zf,door);break;}
  // 會議桌最長 10 格、置中；房間很寬時兩側放休息區與茶水區
  const wide=w>=24,mw=wide?16:w;const tw=Math.max(2,Math.min(10,mw-3)),tx=x0+Math.floor((mw-tw)/2);
  if(wide){const rx=x0+mw;const rs=subRooms(rx,last,z0,[{w:5,door:2,n:'會議室 A'},{w:5,door:2,n:'會議室 B'},{w:6,door:3,n:'視訊會議室'}]);
   rs.forEach(R=>{if(R.filler)return;const x=R.x;const t2=R.w-1.6;blk(x+0.8,z0+0.7,t2,1.0);box(x+0.8,0.65,z0+0.7,t2,0.06,1.0,0x8a6545);box(x+0.9,0,z0+0.8,0.1,0.65,0.1,0x4e352c);box(x+0.7+t2,0,z0+0.8,0.1,0.65,0.1,0x4e352c);for(let c=x+0.9;c+0.6<=x+0.8+t2;c+=0.9)chair(c,z0+1.6);tv(x+R.w/2-0.7,z0+0.02,1.4);if(R.n==='視訊會議室'){box(x+R.w/2-0.15,1.42,z0+0.06,0.3,0.12,0.12,0x2b3242,false);box(x+R.w/2-0.15,0.71,z0+1.05,0.3,0.03,0.3,0x2b3242,false);}});
   {let n=0;for(let x=rx+0.6;x+2.2<=last-3&&n<2;x+=3.2,n++){sofa(x,z0+4.3,2.2,0x5a6a7a);blk(x+0.4,z0+5.3,1.4,0.5);box(x+0.4,0,z0+5.3,1.4,0.4,0.5,0x4e352c);}for(let x=rx+7.5;x+1<=last-3.5;x+=2.5){blk(x+0.2,z0+4.6,0.6,0.6);box(x+0.45,0,z0+4.85,0.1,0.7,0.1,0x5a6270);box(x+0.2,0.7,z0+4.6,0.6,0.04,0.6,0xf4efe6);chair(x-0.45,z0+4.5,false,0x8a6545);chair(x+0.45,z0+4.5,false,0x8a6545);}plant(rx+6.6,z0+4.3);}
   const cx=last-2.5;counter(cx,z0+4.2,2.4,0xe8e2d6,0x8a6545);coffeeMachine(cx+0.3,1.0,z0+4.3);cupSet(cx+1.0,1.0,z0+4.5,3);textPlate(cx+0.2,1.5,z0+4.9,1.4,0.14,'茶水區','#5a4a3a',undefined,true);}blk(tx,zi+0.5,tw,2.0);box(tx,0.65,zi+0.5,tw,0.1,2.0,0x7a5a3e);[[0.2,0.1],[tw-0.4,0.1],[0.2,1.7],[tw-0.4,1.7]].forEach(([a,c])=>box(tx+a,0,zi+0.5+c,0.2,0.65,0.2,0x4e352c));
  for(let x=tx+0.1;x+0.8<=tx+tw;x+=1.1){chair(x,zi-0.05,true);chair(x,zi+2.05);}chair(tx-0.95,zi+0.95,false);tv(tx+tw/2-0.8,zb);clock(tx+tw+0.3,zb);
  if(tx-x0>=5){sofa(x0+0.6,zi+0.2,2.2,0x5a6a7a);sofa(x0+0.6,zi+2.4,2.2,0x5a6a7a);blk(x0+1.0,zi+1.3,1.4,0.6);box(x0+1.0,0,zi+1.3,1.4,0.4,0.6,0x4e352c);plant(x0,z0);textPlate(x0+0.4,1.15,zb+0.04,1.4,0.14,'休息區','#5a4a3a');}
  if(!wide&&last-(tx+tw)>=4){const cx=last-2.5;counter(cx,z0+0.2,2.4,0xe8e2d6,0x8a6545);coffeeMachine(cx+0.3,1.0,z0+0.3);cupSet(cx+1.0,1.0,z0+0.5,3);waterDispenser(last,z0+2.2);textPlate(cx+0.2,1.62,zb+0.04,1.4,0.14,'茶水區','#5a4a3a');}
  plant(x0,zf);if(w>3)plant(last,zf);break;}
 case 'lobby':{// 服務台在中央後方、自動報到機一排、抽號、候診長椅、柱子
  const cw=Math.min(6,w-4);const cxL=x0+Math.floor((w-cw)/2);counter(cxL,z0+0.2,cw);for(let i=0;i<Math.floor(cw/2);i++)monitor(cxL+0.4+i*2,1.01,z0+0.35);box(cxL+cw/2-0.6,1.6,zb,1.2,0.3,0.06,0x2a7fd4);emit(cxL+cw/2-0.5,1.65,zb+0.06,1.0,0.2,0.01,0xffffff);
  for(let i=0;i<Math.min(4,Math.floor((cxL-x0-1)/1.2));i++)kiosk(x0+0.5+i*1.2,z0+0.2,0x5fd3a6);tv(last-1.8,zb,1.5);queueBoard(last-3.2,zb);
  benches(x0+1,last-1,zi);benches(x0+1,last-1,zi2);if(w>=12){pillar(x0+Math.floor(w/3),zi2-1);pillar(x0+Math.floor(w*2/3),zi2-1);}kiosk(door-2,zf+0.2,0xf2b84b);corners();break;}
 case 'clinic':{
  if(b==='reg'||b==='cashier'){// 一排有玻璃窗的櫃台（編號）、叫號板、抽號機、候診椅
   const n=Math.max(2,Math.min(6,Math.floor((w-1)/2.2)));for(let i=0;i<n;i++)winCounter(x0+0.4+i*2.2,z0+0.2,1.8,i+1);queueBoard(x0+w/2-0.6,zb,1.2);
   benches(x0+1,last-1,zi);benches(x0+1,last-1,zi2);kiosk(door-2,zf+0.2,b==='reg'?0x5fd3a6:0xf2b84b);if(b==='cashier'){blk(last-0.9,zf+0.2,0.8,0.6);box(last-0.9,0,zf+0.2,0.8,1.3,0.6,0x3b4454);emit(last-0.8,0.8,zf+0.81,0.6,0.3,0.01,0x4f8fd6);}corners();}
  else if(b==='pharmacy'){// 後面調劑區（藥架、包藥機、調劑台），row4 隔牆，前面領藥窗口＋叫號
   for(let i=0;i<w;i++){box(x0+i+0.1,1.2,zb,0.8,0.6,0.2,0xf4f6f8);for(let j=0;j<3;j++)box(x0+i+0.15+j*0.28,1.25,zb+0.05,0.2,0.2,0.12,[0xef6b6b,0x6aa7ff,0xf2b84b,0x5fd3a6][(i+j)%4]);}
   packMachine(x0+0.2,z0+0.1);for(let x=x0+2;x<=last-1;x++){if((x-x0)%4===0)continue;shelf(x,z0+0.05,[0xef6b6b,0x6aa7ff,0xf2b84b]);}
   for(let x=x0+1;x<=last-1;x++){if((x-x0)%5===0)continue;shelf(x,zi,[0x5fd3a6,0xf4f6f8,0xf2b84b]);}
   for(let c=x0;c<=last;c++){if(c===door)continue;blk(c,z0+3,1,1);PW(c,0,z0+3.85,1,1.35,0.15);}LINT(door,z0+3.85,1,0.15);OPENLEAF(door,z0+3.85);
   blk(x0+0.5,zi+0.1,Math.min(3,w-2),0.6);box(x0+0.5,0,zi+0.1,Math.min(3,w-2),0.9,0.6,0xe3ebef);monitor(x0+0.7,0.91,zi+0.2);box(x0+1.5,0.9,zi+0.3,0.3,0.1,0.3,0xdfe3e8);
   benches(x0+1,last-1,zi2+1.05,false);
   const n=Math.max(2,Math.min(4,Math.floor((w-2)/2.6)));for(let i=0;i<n;i++){const wx=x0+0.6+i*2.6;if(wx+1.8>door-0.2&&wx<door+1.2)continue;winCounter(wx,zf+0.1,1.8,i+1);}
   queueBoard(door+1.2,zf+0.02,1.2);kiosk(door-1.6,zf+0.2,0x5fd3a6);sign(x0+0.2,zb,0x5fd3a6);}
  else if(b==='opd'){const k=Math.floor((w+1)/5);const wallC=0xdfe3e8;
   for(let i=0;i<k;i++){const cx=x0+i*5;
    if(cx+4<=last){blk(cx+4,z0,1,4);PW(cx+4.4,0,z0,0.2,1.35,4);PW(cx+4,0,z0+3.85,1,1.35,0.15);box(cx+4.0,0,z0+0.05,0.4,0.9,0.45,0x8a94a8);box(cx+4.6,0,z0+0.05,0.4,0.9,0.45,0x8a94a8);}
    blk(cx,z0+3,1,1);blk(cx+2,z0+3,2,1);PW(cx,0,z0+3.85,1,1.35,0.15);PW(cx+2,0,z0+3.85,2,1.35,0.15);LINT(cx+1,z0+3.85,1,0.15);OPENLEAF(cx+1,z0+3.85,0xe3e7ec,true);
    box(cx+0.15,1.0,z0+4.0,0.7,0.22,0.03,0xf4f6f8);emit(cx+0.2,1.04,z0+4.03,0.14,0.14,0.01,0xef6b6b);
    box(cx+2.3,0,z0+4.02,0.32,0.95,0.2,0x3b4454);emit(cx+2.34,0.7,z0+4.22,0.24,0.18,0.01,0x5fd3a6);box(cx+2.38,0.45,z0+4.22,0.16,0.03,0.02,0x111111);
    blk(cx+0.1,z0+0.15,1.9,0.6);box(cx+0.1,0,z0+0.15,1.9,0.72,0.6,0x8a6545);monitor(cx+0.2,0.75,z0+0.2);monitor(cx+1.2,0.75,z0+0.2);box(cx+0.7,0.72,z0+0.45,0.3,0.03,0.2,0xdfe3e8);cardReader(cx+0.78,0.72,z0+0.55);labelPrinter(cx+1.72,0.72,z0+0.18);scanner(cx+1.6,0.72,z0+0.5);box(cx+0.3,0.72,z0+0.52,0.34,0.015,0.11,0x2b3242);box(cx+1.25,0.72,z0+0.52,0.3,0.015,0.11,0x2b3242);
    chair(cx+0.25,z0+0.28,false,0x2b3242);chair(cx+1.15,z0+0.28,false,0x5b7bb3);chair(cx+0.05,z0+2.3,true,0x9aa3ad);
    blk(cx+3.2,z0+1.1,0.7,1.8);box(cx+3.2,0.25,z0+1.1,0.7,0.3,1.8,0xb9c2cc);box(cx+3.22,0.55,z0+1.12,0.66,0.1,1.76,0xf7f9fb);box(cx+3.3,0.65,z0+1.2,0.5,0.08,0.4,0xffffff);box(cx+3.15,1.3,z0+1.0,0.04,0.04,2.0,0x8a94a8);box(cx+3.1,0.6,z0+1.0,0.1,0.7,0.08,0x9ad0e8);
    box(cx+3.3,0,z0+0.1,0.6,0.75,0.45,0xe3ebef);box(cx+3.35,0.75,z0+0.15,0.5,0.06,0.35,0xf7f9fb);blk(cx+2.2,z0+0.1,0.8,0.5);box(cx+2.2,0,z0+0.1,0.8,1.2,0.5,0x8a94a8);poster(cx+0.3,zb,0x7fb5a0);}
   for(let x=x0+1;x+2.4<=last;x+=3){bench(x,zi2+1.05,2.4);}
   blk(door-0.5,zi2+0.2,1,0.6);box(door-0.5,0,zi2+0.2,1,0.1,0.6,0x3b4454);box(door-0.05,0,zi2+0.45,0.1,1.6,0.1,0x3b4454);tv(door-0.7,zi2+0.5,1.4);plant(last,zf);plant(x0,zf);}
  else if(b==='er'){erSuite(x0,last,z0,zf,door,w);}
  else if(b==='rehab'){// 復健科：平行桿、跑步機、治療床、地墊、抗力球、櫃台
   for(let i=0;i<Math.floor((w-1)/3);i++){const tx=x0+0.3+i*3;if(i%3===0)parallelBars(tx,z0+0.3);else if(i%3===1){treadmill(tx,z0+0.1);treadmill(tx+1.2,z0+0.1);}else{therapyTable(tx,z0+0.1);therapyTable(tx+1.2,z0+0.1);}}
   for(let x=x0+1;x+1.9<=last-1;x+=2.4)therapyTable(x,zi+0.1);
   floorMat(x0+1,zi2+0.2,Math.min(6,w-2),1.6,0x6aa7ff);ball(x0+2,zi2+0.8,0xef6b6b);ball(x0+3.2,zi2+1.3,0x5fd3a6);if(w>=10){parallelBars(x0+8,zi2+0.5,3);}
   counter(door+1.3,zf+0.1,Math.min(2.5,last-door-1.5),0xe8eef0,0x7fb5a0);monitor(door+1.6,1.01,zf+0.25);box(x0+0.2,1.0,zb,1.4,0.5,0.03,0xf4f6f8);emit(x0+0.3,1.1,zb+0.03,1.2,0.3,0.01,0x7fb5a0);plant(x0,zf);}
  else{for(let i=0;i<w;i+=2){desk(x0+i,z0+0.25);chair(x0+i+0.05,z0+0.3);}beds(x0+1,last-1,zi,0xf7f9fb);beds(x0+1,last-1,zi2,0xf7f9fb);corners();}
  break;}
 case 'ward':{
  if(b==='dialysis'){// 洗腎室：開放式，一張躺椅配一台透析機，RO 水室在後右，護理站在門口
   for(let x=x0+0.5;x+1.8<=last-2.5;x+=2.2){recliner(x,z0+0.3);dialysisMachine(x+0.95,z0+0.1);}
   for(let x=x0+0.5;x+1.8<=last-0.5;x+=2.2){recliner(x,zi2+0.2);dialysisMachine(x+0.95,zi2+0.05);}
   wallSeg(last-1.6,z0,0.15,4,0x9fb6c2);wallSeg(last-1.6,z0+3.85,2.6,0.15,0x9fb6c2);box(last-1.2,0,z0+0.3,0.7,1.4,0.7,0xcfd6dc);box(last-0.4,0,z0+0.3,0.7,1.4,0.7,0xcfd6dc);box(last-1.3,0,z0+1.5,0.5,0.9,0.5,0x4a5566);emit(last-1.25,0.5,z0+2.01,0.4,0.2,0.01,0x5fd3a6);box(last-1.4,1.0,z0+4.0,0.9,0.22,0.03,0xf4f6f8);
   counter(door+1.3,zf+0.1,Math.min(3,last-door-1.5),0xe8eef0,0x9fb6c2);monitor(door+1.6,1.01,zf+0.25);box(x0+0.2,0,zf+0.2,0.6,0.1,0.6,0x3b4454);box(x0+0.75,0,zf+0.2,0.08,1.2,0.08,0x3b4454);box(x0+0.55,1.2,zf+0.18,0.5,0.2,0.12,0x111111);// 體重計
   box(x0+0.2,1.3,zb,1.2,0.5,0.03,0xf4f6f8);emit(x0+0.3,1.4,zb+0.03,0.9,0.05,0.01,0x9fb6c2);break;}
  const icu=b==='icu';const sheet=icu?0xe8f0f4:0xd6efe6;const k=Math.floor((w+1)/4);const wallC=0xe6e9ef;
  for(let i=0;i<k;i++){const cx=x0+i*4;if(cx+2>last)break;
   if(cx+3<=last){blk(cx+3,z0,1,4);PW(cx+3.4,0,z0,0.2,1.35,4);PW(cx+3,0,z0+3.85,1,1.35,0.15);}
   blk(cx,z0+3,1,1);blk(cx+2,z0+3,1,1);PW(cx,0,z0+3.85,1,1.35,0.15);PW(cx+2,0,z0+3.85,1,1.35,0.15);LINT(cx+1,z0+3.85,1,0.15);OPENLEAF(cx+1,z0+3.85);
   box(cx+0.15,1.0,z0+4.0,0.7,0.22,0.03,0xf4f6f8);emit(cx+0.2,1.04,z0+4.03,0.1,0.14,0.01,icu?0xef6b6b:0x6fb6d6);
   bedZ(cx,z0+0.1,sheet);bedZ(cx+2,z0+0.1,sheet);if(!icu){sideTable(cx+0.95,z0+0.1);box(cx+1.05,0,z0+0.1,0.28,0.9,0.28,0xcfd6dc);}
   if(icu){box(cx+0.05,0,z0+1.9,0.5,1.0,0.4,0xdfe6ea);emit(cx+0.1,0.75,z0+2.31,0.4,0.2,0.01,0x5fd3a6);box(cx+2.45,0,z0+1.9,0.5,1.0,0.4,0xdfe6ea);emit(cx+2.5,0.75,z0+2.31,0.4,0.2,0.01,0xf2b84b);}
   else{curtain(cx+0.1,z0+0.6,0.9);curtain(cx+2.0,z0+0.6,0.9);}}
  if(r.noWall){// 開放式護理站：櫃台在最前排面向走廊，後面是工作區，兩旁電腦推車、藥車
   const sx=Math.max(x0+1,door-6),sw=Math.max(2,Math.min(5,door-1-sx));counter(sx,zf+0.02,sw,0xe8eef0,0x9fb6c2);for(let i=0;i<Math.floor(sw/1.6);i++)monitor(sx+0.25+i*1.6,1.0,zf+0.12);deskPhone(sx+sw-0.4,1.0,zf+0.3);scanner(sx+0.85,1.0,zf+0.5);labelPrinter(sx+sw-0.8,1.0,zf+0.12);
   textPlate(sx+sw/2-0.9,1.5,zf+0.88,1.8,0.32,r.name,'#2a6fa8','#ffffff',true);for(let i=0;i<Math.floor(sw/1.6);i++)chair(sx+0.3+i*1.6,zf-0.75,false);
   blk(sx+0.1,z0+5.15,1.2,0.6);box(sx+0.1,0,z0+5.15,1.2,0.75,0.6,0xe3e7ec);box(sx+0.05,0.75,z0+5.1,1.3,0.05,0.7,0x9fb6c2);for(let i=0;i<3;i++)box(sx+0.2+i*0.35,0.8,z0+5.25,0.25,0.25,0.35,[0xf2b84b,0x6aa7ff,0xef6b6b][i],false);textPlate(sx+0.15,1.15,z0+5.76,1.1,0.12,'給藥準備','#2a6fa8');
   cow(sx+sw-1,z0+5);cow(sx+sw-2,z0+5);cart(sx-1,zf,0x6aa7ff);
   bench(door+2,zf,2.4);wheelchair(door+5,zf);cart(door+6,zf,0xf4f6f8);textPlate(door+2.1,1.25,zf+0.95,2.2,0.16,'探病時間 11:00–13:00・18:00–20:00','#2a6fa8',undefined,true);}
  else{
  // 護理站：門口正前方 row6 一段櫃台面向病房走道，後面兩張椅子、病歷架、白板；門口左右是治療室／配膳室
  {const sx=Math.max(x0+1,door-2),sw=Math.min(4,last-sx);counter(sx,zi2+1.1,sw,0xe8eef0,0x9fb6c2);for(let i=0;i<Math.floor(sw/2);i++)monitor(sx+0.3+i*2,1.0,zi2+1.2);deskPhone(sx+sw-0.5,1.0,zi2+1.35);scanner(sx+0.85,1.0,zi2+1.55);labelPrinter(sx+sw-0.9,1.0,zi2+1.15);textPlate(sx+sw/2-0.5,1.3,zi2+1.85,1.0,0.22,icu?'護理站 ICU':'護理站','#2a6fa8');cow(last-1,zi2);if(last-2>sx+sw+1)cow(last-2,zi2);chair(sx+0.3,zi2+1.28,true);if(sw>2)chair(sx+1.6,zi2+1.28,true);
   blk(sx+sw+0.1,zi2+1.2,0.5,0.7);box(sx+sw+0.1,0,zi2+1.2,0.5,1.2,0.7,0x8a94a8);for(let j=0;j<4;j++)box(sx+sw+0.6,0.2+j*0.25,zi2+1.25,0.02,0.18,0.6,0xf2b84b);
   if(sx-1>=x0+1){blk(sx-1,zi2+1.2,0.7,0.5);box(sx-1,0,zi2+1.2,0.7,1.1,0.5,0xcfd6dc);box(sx-0.95,0.75,zi2+1.7,0.6,0.5,0.02,0xf4f6f8);}}
  if(!icu){if(door-3>=x0){wallSeg(door-3,zf,2,1,0xe6e9ef);box(door-2.8,1.0,zf-0.02,1.4,0.22,0.03,0xf4f6f8);emit(door-2.7,1.04,zf-0.03,0.2,0.14,0.01,0x6fb6d6);}if(door+3<=last){wallSeg(door+2,zf,2,1,0xe6e9ef);box(door+2.2,1.0,zf-0.02,1.4,0.22,0.03,0xf4f6f8);emit(door+2.3,1.04,zf-0.03,0.2,0.14,0.01,0xf2b84b);}cart(door+1,zf,0x6aa7ff);cart(door-1,zf,0xf4f6f8);}
  else{const dw=r.wide?2:1;blk(door-1,zf,1,1);blk(door+dw,zf,1,1);box(door-1,0,zf,0.08,1.2,1,0x9fb6c2);box(door-1,0,zf,1,1.2,0.08,0x9fb6c2);box(door+dw+0.92,0,zf,0.08,1.2,1,0x9fb6c2);box(door+dw,0,zf,1,1.2,0.08,0x9fb6c2);for(let i=0;i<dw;i++)slideDoor(door+i,zf-0.08,0xbfe0ff);gownRack(door-0.5,zf+0.5);gownRack(door+dw+0.5,zf+0.5);box(door+dw+0.2,0,zf+0.3,0.5,0.85,0.4,0xe3ebef);cart(door+dw+2,zf,0x6aa7ff);textPlate(door+dw/2-0.6,1.3,zf-0.06,1.2,0.16,'內門・穿隔離衣後進入','#2a6fa8');}
  }
  box(x0+0.2,1.3,zb,1.2,0.5,0.03,0xf4f6f8);emit(x0+0.3,1.4,zb+0.03,0.9,0.05,0.01,icu?0xef6b6b:0x6fb6d6);clock(last-0.4,zb);break;}
 case 'imaging':{
  if(b==='xray')imagingSuite(xrayUnit);
  else if(b==='ct')imagingSuite(ctRing);
  else if(b==='mri')imagingSuite(mriBore,(mR,cR)=>{box(x0+0.1,1.0,z0+3.6,0.5,0.25,0.03,0xf2b84b);locker(door-2.9,zf+0.3,1.8);box(door-2.8,1.0,zf-0.02,1.6,0.22,0.03,0xf2b84b);});
  else if(b==='nuc')nucSuite(x0,last,z0,zf,door);
  else if(b==='cath')cathSuite(x0,last,z0,zf,door);
  else if(b==='endo')endoSuite(x0,last,z0,zf,door);
  else if(b==='or'){// 開刀房：獨立手術室（手術台、無影燈、麻醉機、器械桌、無菌櫃）、恢復室、更衣區
   const rr=roomRow(x0,last,z0,6,2,0xe6e9ef);rr.forEach((cx,i)=>{orTable(cx+1.3,z0+1.1);box(cx+0.1,0,z0+0.15,0.9,1.4,0.6,0xe3ebef);emit(cx+0.2,0.9,z0+0.76,0.7,0.35,0.01,i%2?0x5fd3a6:0x6aa7ff);blk(cx+4.1,z0+0.15,0.8,0.5);box(cx+4.1,0,z0+0.15,0.8,1.6,0.5,0xdfe6ea);glassPane(cx+4.15,0.3,z0+0.65,0.7,1.1,0.02);blk(cx+4.2,z0+1.6,0.6,0.5);box(cx+4.2,0.75,z0+1.6,0.6,0.05,0.5,0xcfd6dc);box(cx+4.45,0,z0+1.8,0.1,0.75,0.1,0x8a94a8);box(cx+4.25,0.8,z0+1.7,0.5,0.03,0.3,0x9ad0e8);box(cx+0.15,1.0,z0+4.0,0.7,0.22,0.03,0xf4f6f8);emit(cx+0.2,1.04,z0+4.03,0.14,0.14,0.01,0xef6b6b);});
   for(let x=door+3;x+1.9<=last;x+=2.2){bed(x,zi2+0.1,0xf7f9fb);curtain(x,zi2+1.0,2);}counter(Math.max(x0+0.5,door-4),zi2+1.1,Math.min(3,door-0.8-x0),0xe8eef0,0x3f8f74);monitor(Math.max(x0+0.8,door-3.7),1.01,zi2+1.2);
   {const dw=r.wide?2:1;locker(door-1,zf+0.3,0.9);scrubSink(door+dw,zf+0.3);box(door-1,0,zf,0.08,1.2,1,0xcfd6dc);box(door+dw+0.92,0,zf,0.08,1.2,1,0xcfd6dc);for(let i=0;i<dw;i++)slideDoor(door+i,zf-0.08,0x9fb6c2);textPlate(door+dw/2-0.6,1.3,zf-0.06,1.2,0.16,'限制區・換裝後進入','#2f7d5a');}}
  else if(b==='lab'){// 檢驗科：一大區，後半隔成一間一間的實驗室（各有門和門牌），前半是收件、前處理的開放工作區
   const W_=last-x0+1;const want=[['自動化實驗室',10,'auto'],['血液鏡檢室',6,'hema'],['血庫',6,'bank'],['微生物室',7,'micro'],['分子檢驗室',6,'mol'],['試劑庫',4,'store'],['報告審核室',6,'office']];
   const specs=[];let used=0;for(const [n,ww,k] of want){if(used+ww+1<=W_+1){specs.push({w:ww,door:Math.floor(ww/2),n,k});used+=ww+1;}}if(specs.length)specs[0].w+=Math.max(0,W_+1-used);
   const tubes=(tx,tz)=>{for(let q=0;q<6;q++)box(tx+0.15+q*0.05,0.91,tz,0.03,0.09,0.03,[0xef6b6b,0x8a2a2a,0x6aa7ff,0xf2b84b,0x9ad07a,0xd08cff][q],false);};
   const wk=(dx_)=>{desk(dx_,z0+1.5,0x3b4454);chair(dx_+0.05,z0+1.25,false);monitor(dx_+0.29,0.6,z0+1.75);};
   const KK={};want.forEach(q=>KK[q[0]]=q[2]);subRooms(x0,last,z0,specs).forEach(R=>{if(R.filler)return;R.k=KK[R.n];const x=R.x,n=R.w,dc=x+Math.floor(n/2),side=(k)=>{const c=x+n-1-k;return c===dc?c-1:c;};
    if(R.k==='auto'){const m=Math.min(n,9);for(let k=0;k<m;k++)analyzer(x+k,z0+0.1);PW(x,0.86,z0+0.84,m,0.05,0.22);for(let k=0;k<m;k+=2)box(x+k+0.4,0.91,z0+0.9,0.14,0.07,0.1,0xf2b84b,false);wk(side(0));if(n>=8)wk(x+(x===dc?1:0));}
    else if(R.k==='hema'){analyzer(x,z0+0.1);analyzer(x+1,z0+0.1);fileCabinet(x+n-1,z0);[side(0),x+(x===dc?1:0)].forEach(c=>{desk(c,z0+1.5);chair(c+0.05,z0+1.25,false);microscope(c+0.4,0.6,z0+1.8);box(c+0.12,0.6,z0+1.82,0.2,0.02,0.12,0xf4f6f8,false);});}
    else if(R.k==='bank'){medFridge(x,z0);medFridge(x+1,z0);freezer80(x+2.2,z0);if(n>=6)freezer80(x+3.2,z0);wk(side(0));}
    else if(R.k==='micro'){bioCabinet(x,z0);bioCabinet(x+1.5,z0);blk(x+3.2,z0+0.1,0.8,0.7);box(x+3.2,0,z0+0.1,0.8,1.5,0.7,0xe3e7ec);glassPane(x+3.26,0.3,z0+0.81,0.68,1.0,0.02);emit(x+3.4,1.36,z0+0.81,0.3,0.08,0.01,0xf2b84b);if(n>=6)fileCabinet(x+n-1,z0);const c=side(0);desk(c,z0+1.5);chair(c+0.05,z0+1.25,false);microscope(c+0.4,0.6,z0+1.8);}
    else if(R.k==='mol'){analyzer(x,z0+0.1);blk(x+1.1,z0+0.1,1.6,0.7);box(x+1.1,0,z0+0.1,1.6,0.85,0.7,0xe3ebef);box(x+1.25,0.85,z0+0.25,0.5,0.3,0.45,0xdfe6ea);box(x+1.95,0.85,z0+0.25,0.5,0.22,0.45,0x9aa3ad);emit(x+2.0,0.95,z0+0.701,0.2,0.07,0.004,0x5fd3a6);freezer80(x+n-1,z0);wk(side(1));}
    else if(R.k==='store'){for(let k=0;k<n;k++)shelf(x+k,z0+0.05,[0xf4f6f8,0x6aa7ff,0xf2b84b]);}
    else if(R.k==='office'){fileCabinet(x,z0);fileCabinet(x+1,z0);board(x+2.3,zb);wk(side(0));wk(x+(x===dc?1:0));}});
   // 前半：前處理檯（離心機、試管架），門的左右各一段，不擋門口
   [[x0+1,door-2],[door+4,last-2]].forEach(([a,e])=>{for(let bx=a;bx+3<=e+1;bx+=5){blk(bx,z0+5.3,3,0.9);box(bx,0,z0+5.3,3,0.85,0.9,0xe3ebef);PW(bx-0.03,0.85,z0+5.26,3.06,0.04,0.98);box(bx+0.2,0.89,z0+5.5,0.5,0.32,0.5,0xdfe6ea);box(bx+0.25,1.21,z0+5.55,0.4,0.03,0.4,0x9aa3ad,false);emit(bx+0.3,0.98,z0+6.001,0.2,0.08,0.004,0x5fd3a6);tubes(bx+1.1,z0+5.7);tubes(bx+1.9,z0+5.9);box(bx+2.3,0.89,z0+5.5,0.45,0.2,0.4,0x6aa7ff,false);}});
   textPlate(door-1.6,1.33,z0+4.0,1.3,0.16,'檢驗作業區 非請勿入','#c07a1a');
   specimenWin(door+1.3,zf+0.1);fridge(last,zf+0.1);plant(x0,zf);}
  else if(b==='report'){deskRow(x0+1,last-1,zi,0x3b4454);deskRow(x0+1,last-1,zi2,0x3b4454);for(let x=x0+1;x<=last-1;x++){if((x-x0)%4===0)continue;box(x+0.95,0,zi+0.1,0.04,1.1,2.5,0x9fb6c2);box(x+0.95,0,zi2+0.1,0.04,1.1,2.5,0x9fb6c2);}for(let i=0;i<w;i+=3){box(x0+i+0.1,0.9,zb,1.2,0.9,0.04,0x3b4454);emit(x0+i+0.15,0.95,zb+0.04,1.1,0.8,0.01,0xeef6ff);}}
  else{machine(x0+Math.max(1,Math.floor(w/2)-1),zi,b);for(let i=0;i<w;i+=2){desk(x0+i,z0+0.25,0x3b4454);chair(x0+i+0.05,z0+0.3);}}
  poster(last-0.6,zb,0x8a94a8);break;}
 case 'shop':{const pal={seven:[0x2f7d4a,0xf2b84b,0xef6b6b],buffet:[0xf2b84b,0xef6b6b,0x5fd3a6],bento:[0xd98c3a,0x8a6545,0xf2b84b],noodle:[0xf4f6f8,0xd98c3a,0xef6b6b],tea:[0x5fd3a6,0xf2b84b,0xffffff],cafe:[0x6b4b32,0xf4f6f8,0xd98c3a]}[b]||[0xf2b84b,0xef6b6b,0x6aa7ff];
  if(b==='seven'){for(let i=0;i<w-2;i++)fridge(x0+i,z0+0.1);counter(last-1.9,z0+0.2,1.9,0xf4f6f8,0x2f7d4a);box(last-1.2,1.01,z0+0.35,0.3,0.25,0.3,0x3b4454);for(let x=x0+1;x<=last-1;x++){if((x-x0)%4===0)continue;shelf(x,zi,pal);shelf(x,zi+1.3,[0x6aa7ff,0xf4f6f8,0xef6b6b]);shelf(x,zi2,[0xf2b84b,0x2f7d4a,0xf4f6f8]);shelf(x,zi2+1.3,pal);}
   emit(x0+0.2,1.5,zb,w-0.4,0.12,0.02,0xd98c3a);emit(x0+0.2,1.62,zb,w-0.4,0.12,0.02,0x2f7d4a);emit(x0+0.2,1.38,zb,w-0.4,0.12,0.02,0xef6b6b);}
  else{counter(x0+0.3,z0+0.2,Math.max(1.5,w-1),0xf4f6f8,pal[0]);for(let i=0;i<Math.max(2,w-1)*2;i++)box(x0+0.45+i*0.5,1.01,z0+0.3,0.35,0.12,0.35,pal[(i+1)%3]);if(b==='tea'||b==='cafe'){box(x0+w-1.2,0.95,z0+0.25,0.5,0.6,0.5,0x3b4454);emit(x0+w-1.1,1.3,z0+0.76,0.3,0.1,0.01,0x5fd3a6);}else{box(x0+0.4,0.95,z0+0.25,0.6,0.35,0.6,0xcfd6dc);emit(x0+0.45,1.0,z0+0.86,0.5,0.25,0.01,0xf2b84b);}
   emit(x0+0.3,1.45,zb,Math.min(w-0.6,3),0.4,0.02,pal[0]);
   [zi,zi2].forEach(z=>{for(let x=x0+1.6;x+1.2<=last;x+=3){blk(x,z+0.5,0.8,0.8);box(x,0.7,z+0.5,0.8,0.05,0.8,0xf4f6f8);box(x+0.35,0,z+0.85,0.1,0.7,0.1,0x8a94a8);chair(x-0.6,z+0.6,false,0xd98c3a);chair(x+0.6,z+0.6,false,0xd98c3a);}});}
  corners();break;}
 case 'exec':{const dx=x0+Math.max(1,Math.floor(w/2)-1);blk(dx,zi+0.5,2,0.9);box(dx,0,zi+0.5,2,0.75,0.9,0x3a2820);box(dx-0.05,0.75,zi+0.45,2.1,0.06,1.0,0x4e352c);monitor(dx+0.8,0.81,zi+0.7);box(dx+0.3,0.81,zi+1.1,0.3,0.05,0.2,0xdfe3e8);chair(dx+0.8,zi+1.3,false,0x2b2b2b);chair(dx+0.1,zi-0.15,true,0x5a3a3a);chair(dx+1.1,zi-0.15,true,0x5a3a3a);
  bookshelf(x0+0.1,zb,Math.max(1,Math.min(3,w/2-0.5)));if(w>4)bookshelf(last-Math.min(2,w/2-1.2)+0.9,zb,Math.min(2,w/2-1.2));box(x0+0.15,0,zf+0.1,0.08,1.6,0.08,0x8a94a8);box(x0+0.19,0.9,zf+0.1,0.35,0.6,0.03,0xef6b6b);
  if(w>=4){sofa(x0+0.5,zi2+0.3,Math.min(1.7,w-2),0x5a3a3a);blk(x0+0.8,zi2+1.15,0.9,0.5);box(x0+0.8,0,zi2+1.15,0.9,0.4,0.5,0x4e352c);}
   if(w>=10){// 大間的主管室：會客區多兩張單椅、東側小會議桌配電視、門口是秘書座位
    chair(x0+2.4,zi2+0.9,false,0x5a3a3a);chair(x0+2.4,zi2+1.7,false,0x5a3a3a);
    const tx=last-4.2;if(tx>dx+3){blk(tx,z0+2.0,3.2,0.9);box(tx,0.65,z0+2.0,3.2,0.06,0.9,0x4e352c);[[0.1,0.1],[3.0,0.1],[0.1,0.7],[3.0,0.7]].forEach(([q,c])=>box(tx+q,0,z0+2.0+c,0.1,0.65,0.1,0x3a2820));for(let c=tx+0.1;c+0.7<=tx+3.2;c+=1.0){chair(c,z0+1.2,true,0x5a3a3a);chair(c,z0+2.75,false,0x5a3a3a);}tv(tx+0.9,zb,1.4);}
    const sx=door+2<=last-3?door+2:door-4;desk(sx,z0+5.6,0x4e352c);desk(sx+1,z0+5.6,0x4e352c);chair(sx+0.55,z0+5.35,false);monitor(sx+0.3,0.6,z0+5.85);box(sx+1.2,0.61,z0+5.85,0.18,0.06,0.2,0x2b3242,false);fileCabinet(sx+2,z0+5.3);lowPanel(sx-0.2,z0+5.1,0.06,1.5);textPlate(sx+0.3,1.5,z0+6.1,1.0,0.16,'秘書','#ffffff','#5a3a3a',true);}
   plant(last,z0+0.2);clock(dx+2.4,zb);break;}
 case 'server':{// 機房：機櫃成排、排間是冷熱通道，上方線架；後牆空調箱；東側配電盤、電池櫃、UPS；門口監控台
  const xs=x0+3,xe=last-3,mid=Math.floor((xs+xe)/2);
  [2,4].forEach((dz,ri)=>{for(let x=xs;x<=xe;x++){if(xe-xs>=13&&x===mid)continue;rack(x,z0+dz,x*3+ri*5);}
   PW(xs,2.2,z0+dz+0.36,xe-xs+1,0.03,0.28);for(let x=xs;x<=xe;x+=2)box(x+0.47,2.02,z0+dz+0.47,0.05,0.18,0.05,0x6b7585,false);});
  for(let x=xs;x<=xe;x++){box(x+0.06,0.003,z0+3.06,0.88,0.012,0.88,0x7d95c2,false);for(let k=0;k<3;k++)box(x+0.16,0.016,z0+3.22+k*0.26,0.68,0.004,0.08,0x4f6690,false);}// 冷通道：有孔高架地板
  const crac=(x,t)=>{blk(x,z0,1,0.85);box(x+0.04,0,z0+0.06,0.92,1.9,0.74,0xdfe6ea);box(x+0.1,1.25,z0+0.8,0.8,0.5,0.01,0x4b5566,false);for(let k=0;k<5;k++)box(x+0.12,1.3+k*0.09,z0+0.81,0.76,0.02,0.01,0x8a94a8,false);emit(x+0.3,0.98,z0+0.81,0.34,0.14,0.01,0x5fd3a6);box(x+0.1,0.1,z0+0.8,0.8,0.5,0.01,0xc9d2da,false);textPlate(x+0.2,1.02,z0+0.82,0.2,0.08,t,'#1b2230','#5fd3a6');};
  crac(x0,'22°C');crac(mid,'21°C');if(w>=20)crac(xs+2,'22°C');
  // 東側：配電盤、電池櫃、UPS
  {const px=last-3;blk(px+0.1,z0,0.8,0.5);box(px+0.1,0,z0+0.08,0.8,1.8,0.34,0x9aa3ad);for(let r=0;r<3;r++)for(let c=0;c<4;c++)emit(px+0.2+c*0.16,1.05+r*0.2,z0+0.43,0.1,0.12,0.01,(r+c)%5===0?0xf2b84b:0x2b3242);emit(px+0.3,1.7,z0+0.43,0.4,0.06,0.01,0xef6b6b);
   [last-2,last-1].forEach(bx=>{blk(bx+0.1,z0,0.8,0.8);box(bx+0.1,0,z0+0.08,0.8,1.6,0.7,0x3d4452);for(let k=0;k<4;k++)box(bx+0.16,0.25+k*0.34,z0+0.79,0.68,0.24,0.01,0x4b5566,false);emit(bx+0.2,1.45,z0+0.79,0.2,0.05,0.01,0x5fd3a6);});
   blk(last+0.1,z0,0.8,0.8);reg('ups',last+0.5,1.3,z0+0.5);box(last+0.12,0,z0+0.08,0.78,1.25,0.72,0x4b5566);emit(last+0.3,0.9,z0+0.81,0.34,0.14,0.01,0xf2b84b);emit(last+0.3,1.08,z0+0.81,0.1,0.04,0.01,0x5fd3a6);
   textPlate(px+0.15,1.95,zb+0.04,0.7,0.14,'配電盤','#c0392b');textPlate(last-1.6,1.95,zb+0.04,1.0,0.14,'電池櫃','#5a4a3a');textPlate(last+0.1,1.95,zb+0.04,0.8,0.14,'UPS','#5a4a3a');}
  // 門口監控台：巡檢、看告警
  {const dx=door-3>=x0+1?door-3:door+2;desk(dx,z0+5.6,0x3b4454);desk(dx+1,z0+5.6,0x3b4454);chair(dx+0.55,z0+5.35,false);monitor(dx+0.15,0.6,z0+5.85);monitor(dx+0.7,0.6,z0+5.85);monitor(dx+1.25,0.6,z0+5.85);textPlate(dx+0.3,1.5,z0+6.1,1.2,0.16,'監控台','#ffffff','#2a7fd4',true);}
  box(x0-0.02,1.3,z0+3.2,0.04,0.3,0.4,0xf4f6f8,false);emit(x0+0.021,1.36,z0+3.26,0.004,0.18,0.28,0x1b2230);extinguisher(last+0.7,zf+0.6);
  for(let i=0;i<w;i++)for(let j=0;j<h;j++)box(x0+i+0.02,-0.1,z0+j+0.02,0.96,0.02,0.96,0x4b5566,false);break;}
 }
 // 保險：走道 row 7、兩側邊欄（row 3-6 的頭尾格）、門口那兩格一定要能走；row 2 只在沒有小房間的單位清空
 const cub=['opd','ward','icu','er','endo','or','xray','ct','mri','nuc','cath','pharmacy','dialysis'].includes(b)||(kind==='ward');
 for(let x=r.x;x<r.x+r.w;x++){if(!cub)BLK.delete((r.y+1)*W+x);BLK.delete((r.y+h-2)*W+x);}
 for(let y=r.y+2;y<=r.y+h-3;y++){BLK.delete(y*W+r.x);BLK.delete(y*W+r.x+r.w-1);}
 BLK.delete((r.y+h-2)*W+door);BLK.delete((r.y+h-1)*W+door);if(r.wide){BLK.delete((r.y+h-2)*W+door+1);BLK.delete((r.y+h-1)*W+door+1);}}
// ---------- 各區域專屬細節 ----------
const o2tank=(x,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.75,10),mat(0x2f9a5a));m.position.set(x,0.42,z);FG.add(m);box(x-0.03,0.8,z-0.03,0.06,0.08,0.06,0x8a94a8,false);box(x-0.12,0,z-0.12,0.24,0.05,0.24,0x5a6270,false);};
const pump=(x,y,z)=>{box(x,y,z,0.12,0.14,0.08,0xf4f6f8,false);emit(x+0.02,y+0.07,z+0.081,0.08,0.05,0.004,0x5fd3a6);box(x+0.02,y+0.02,z+0.081,0.08,0.03,0.004,0x6aa7ff,false);};
const ventilator=(x,z)=>{blk(x+0.25,z+0.25,0.5,0.5);[[0.27,0.27],[0.68,0.27],[0.27,0.68],[0.68,0.68]].forEach(([a,b])=>box(x+a,0,z+b,0.05,0.06,0.05,0x222222,false));box(x+0.28,0.06,z+0.3,0.44,0.5,0.4,0xe3e7ec);box(x+0.47,0.56,z+0.45,0.06,0.25,0.06,0x8a94a8,false);box(x+0.3,0.8,z+0.45,0.4,0.3,0.04,0x1b2230);emit(x+0.32,0.82,z+0.492,0.36,0.26,0.004,0x0f1a24);emit(x+0.33,1.0,z+0.497,0.34,0.012,0.003,0xf2b84b);emit(x+0.33,0.93,z+0.497,0.34,0.012,0.003,0x5fd3a6);emit(x+0.33,0.86,z+0.497,0.34,0.012,0.003,0x6aa7ff);box(x+0.7,0.4,z+0.4,0.15,0.03,0.03,0x9ad0e8,false);};
const centralMonitor=(x,y,z,w=1.2)=>{box(x,y,z,w,0.45,0.05,0x1b2230);emit(x+0.03,y+0.03,z+0.051,w-0.06,0.39,0.004,0x0b121a);for(let i=0;i<4;i++){const cy=y+0.06+i*0.095;emit(x+0.06,cy,z+0.056,w*0.55,0.012,0.003,[0x5fd3a6,0xf2b84b,0x6aa7ff,0xef6b6b][i]);emit(x+w*0.65,cy-0.01,z+0.056,0.12,0.04,0.003,[0x5fd3a6,0xf2b84b,0x6aa7ff,0xef6b6b][i]);}};
const stretcher=(x,z)=>{blk(x+0.1,z+0.25,1.7,0.5);[[0.2,0.3],[1.7,0.3],[0.2,0.65],[1.7,0.65]].forEach(([a,b])=>box(x+a,0,z+b,0.05,0.12,0.05,0x222222,false));box(x+0.15,0.12,z+0.28,1.6,0.04,0.44,0x8a94a8,false);box(x+0.2,0.16,z+0.32,0.05,0.4,0.05,0xb8c2d0,false);box(x+1.65,0.16,z+0.32,0.05,0.4,0.05,0xb8c2d0,false);box(x+0.1,0.56,z+0.25,1.7,0.08,0.5,0x3b4454);box(x+0.12,0.64,z+0.27,1.66,0.03,0.46,0xf7f9fb,false);box(x+0.1,0.66,z+0.25,1.7,0.03,0.03,0xf2b84b,false);box(x+0.1,0.66,z+0.72,1.7,0.03,0.03,0xf2b84b,false);};
const vending=(x,z,c=0xc0392b)=>{blk(x+0.1,z+0.15,0.8,0.65);box(x+0.1,0,z+0.15,0.8,1.5,0.65,c);box(x+0.15,0.4,z+0.8,0.5,1.0,0.01,0x1b2230,false);for(let i=0;i<4;i++)for(let j=0;j<3;j++)box(x+0.18+j*0.15,0.5+i*0.22,z+0.79,0.1,0.15,0.02,[0xef6b6b,0x6aa7ff,0xf2b84b,0x5fd3a6][(i+j)%4],false);emit(x+0.15,0.42,z+0.811,0.5,0.98,0.002,0x9fb6c2);box(x+0.7,0.8,z+0.8,0.15,0.35,0.02,0x2b3242,false);emit(x+0.72,1.0,z+0.821,0.1,0.06,0.003,0x5fd3a6);box(x+0.15,0.1,z+0.8,0.5,0.15,0.02,0x111111,false);};
const atm=(x,z)=>{blk(x+0.2,z+0.2,0.6,0.6);box(x+0.2,0,z+0.2,0.6,1.3,0.6,0x3b4454);box(x+0.25,0.85,z+0.8,0.5,0.35,0.03,0x1b2230,false);emit(x+0.28,0.88,z+0.83,0.44,0.28,0.004,0x6aa7ff);box(x+0.25,0.72,z+0.8,0.5,0.08,0.12,0x8a94a8,false);box(x+0.2,1.3,z+0.2,0.6,0.15,0.6,0x2a7fd4);};
const fm200=(x,z)=>{blk(x+0.1,z+0.1,0.8,0.5);for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,1.0,10),mat(0xc0392b));m.position.set(x+0.22+i*0.26,0.5,z+0.35);FG.add(m);box(x+0.19+i*0.26,1.0,z+0.32,0.06,0.1,0.06,0x8a94a8,false);}box(x+0.1,1.0,z+0.3,0.8,0.03,0.1,0x8a94a8,false);textPlate(x+0.12,0.55,z+0.47,0.6,0.12,'FM-200','#c0392b');};
const kvmCart=(x,z)=>{blk(x+0.2,z+0.2,0.6,0.6);box(x+0.22,0,z+0.22,0.56,0.06,0.56,0x2b3242,false);box(x+0.47,0.06,z+0.47,0.06,0.65,0.06,0x8a94a8,false);box(x+0.22,0.7,z+0.3,0.56,0.03,0.4,0x3b4454);box(x+0.27,0.73,z+0.45,0.46,0.015,0.2,0x2b3242,false);box(x+0.28,0.73,z+0.32,0.44,0.28,0.02,0x1b2230);emit(x+0.3,0.75,z+0.341,0.4,0.24,0.003,0x0f1a24);emit(x+0.31,0.95,z+0.343,0.25,0.012,0.002,0x5fd3a6);emit(x+0.31,0.92,z+0.343,0.32,0.012,0.002,0x9aa6b8);};
const spareShelf=(x,z)=>{blk(x+0.05,z+0.15,0.9,0.5);box(x+0.05,0,z+0.15,0.9,1.5,0.5,0x8a94a8);for(let i=0;i<4;i++){box(x+0.05,0.32+i*0.36,z+0.15,0.9,0.03,0.5,0x6b7585,false);}
 box(x+0.1,0.02,z+0.2,0.35,0.28,0.38,0xc9a978,false);box(x+0.5,0.02,z+0.2,0.35,0.28,0.38,0xc9a978,false);box(x+0.1,0.35,z+0.25,0.38,0.26,0.06,0x1b2230,false);box(x+0.1,0.35,z+0.33,0.38,0.24,0.06,0x1b2230,false);box(x+0.55,0.35,z+0.25,0.3,0.05,0.12,0x2b3242,false);box(x+0.55,0.4,z+0.25,0.3,0.05,0.12,0x2b3242,false);
 box(x+0.1,0.71,z+0.22,0.2,0.2,0.3,0x2b3242,false);box(x+0.35,0.71,z+0.22,0.2,0.2,0.3,0x2b3242,false);box(x+0.62,0.71,z+0.25,0.22,0.12,0.22,0x2a7fd4,false);for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.06,12),mat([0x6aa7ff,0xf2b84b,0x9aa3ad][i]));m.rotation.x=Math.PI/2;m.position.set(x+0.2+i*0.25,1.2,z+0.35);FG.add(m);}textPlate(x+0.15,1.36,z+0.66,0.7,0.12,'備品・耗材','#3b4454');};
const testBench=(x,z)=>{blk(x+0.05,z+0.15,0.9,0.6);box(x+0.05,0.56,z+0.15,0.9,0.04,0.6,0x8a94a8);[[0.07,0.17],[0.88,0.17],[0.07,0.7],[0.88,0.7]].forEach(([a,b])=>box(x+a,0,z+b,0.04,0.56,0.04,0x3b4454,false));
 box(x+0.12,0.6,z+0.22,0.2,0.42,0.4,0x2b3242,false);box(x+0.32,0.6,z+0.22,0.01,0.42,0.4,0x9aa3ad,false);box(x+0.14,0.7,z+0.3,0.15,0.1,0.05,0x3f8f74,false);box(x+0.15,0.85,z+0.3,0.12,0.04,0.2,0x6aa7ff,false);// 開著的主機
 box(x+0.45,0.6,z+0.55,0.12,0.03,0.08,0xf2b84b,false);box(x+0.6,0.6,z+0.3,0.3,0.015,0.2,0x2b3242,false);box(x+0.62,0.6,z+0.55,0.2,0.02,0.15,0x5a6270,false);for(let i=0;i<5;i++)box(x+0.4+i*0.06,0.6,z+0.25,0.04,0.01,0.12,[0x2a7fd4,0xef6b6b,0xf2b84b,0x5fd3a6,0x9aa3ad][i],false);};
const fileCabinet=(x,z)=>{blk(x+0.1,z+0.2,0.8,0.55);box(x+0.1,0,z+0.2,0.8,1.2,0.55,0x9aa3ad);for(let i=0;i<4;i++){box(x+0.13,0.05+i*0.29,z+0.75,0.74,0.26,0.01,0xaab4bf,false);box(x+0.42,0.15+i*0.29,z+0.76,0.16,0.03,0.02,0x5a6270,false);box(x+0.45,0.22+i*0.29,z+0.76,0.1,0.04,0.01,0xf4f6f8,false);}
 for(let i=0;i<6;i++)box(x+0.14+i*0.12,1.2,z+0.25,0.1,0.28,0.4,[0x2a4f8a,0x8a2a2a,0x2f7d4a,0xf2b84b,0x2a4f8a,0x9aa3ad][i],false);};
const waterDispenser=(x,z)=>{blk(x+0.25,z+0.25,0.5,0.5);box(x+0.27,0,z+0.27,0.46,0.95,0.46,0xe3e7ec);box(x+0.32,0.55,z+0.73,0.36,0.25,0.02,0xcfd6dc,false);box(x+0.36,0.65,z+0.74,0.06,0.06,0.03,0x6aa7ff,false);box(x+0.58,0.65,z+0.74,0.06,0.06,0.03,0xef6b6b,false);const m=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.4,12),new THREE.MeshLambertMaterial({color:0x9ad0e8,transparent:true,opacity:0.6}));m.position.set(x+0.5,1.15,z+0.5);FG.add(m);};
const deco=(x,z)=>{blk(x,z,0.5,0.5);box(x+0.1,0,z+0.1,0.3,0.26,0.3,0xc98a5a);box(x+0.12,0.26,z+0.12,0.26,0.03,0.26,0x6b4a2f,false);box(x+0.06,0.3,z+0.08,0.38,0.3,0.36,0x2f8a4a);box(x+0.14,0.55,z+0.02,0.3,0.26,0.3,0x3fa35c);box(x+0.0,0.5,z+0.2,0.26,0.24,0.26,0x277a40);box(x+0.2,0.76,z+0.14,0.2,0.2,0.2,0x4fb86c);};
const wallArt=(x,z,c1,c2)=>{box(x,0.62,z,0.62,0.5,0.02,0xf7f4ec,false);emit(x+0.04,0.9,z+0.021,0.54,0.18,0.004,c1);emit(x+0.04,0.8,z+0.021,0.4,0.04,0.004,0x9aa6b8);emit(x+0.04,0.73,z+0.021,0.48,0.04,0.004,0x9aa6b8);emit(x+0.04,0.66,z+0.021,0.2,0.04,0.004,c2);};
const copier=(x,z)=>{reg('printer',x+0.5,0.9,z+0.5);blk(x+0.05,z+0.15,0.9,0.65);box(x+0.05,0,z+0.15,0.9,0.75,0.65,0xe3e7ec);for(let i=0;i<3;i++)box(x+0.08,0.06+i*0.22,z+0.8,0.84,0.18,0.01,0xcfd6dc,false);box(x+0.08,0.75,z+0.18,0.84,0.12,0.6,0xd8dde3);box(x+0.12,0.87,z+0.22,0.76,0.05,0.5,0x9aa3ad,false);box(x+0.62,0.8,z+0.79,0.25,0.1,0.02,0x2b3242,false);emit(x+0.64,0.82,z+0.811,0.15,0.06,0.003,0x5fd3a6);box(x+0.95,0.5,z+0.3,0.2,0.04,0.35,0xcfd6dc,false);};
const wallTV=(x,y,z,w=0.6)=>{box(x,y,z,w,w*0.58,0.04,0x111111,false);emit(x+0.02,y+0.02,z+0.041,w-0.04,w*0.58-0.04,0.003,0x2a6fa8);};
const headwall=(x,z,w)=>{box(x,0.75,z,w,0.16,0.05,0xe3e7ec,false);for(let i=0;i+0.9<=w+0.01;i+=1.0){box(x+i+0.15,0.8,z+0.05,0.05,0.05,0.01,0x2f9a5a,false);box(x+i+0.25,0.8,z+0.05,0.05,0.05,0.01,0xf4f6f8,false);box(x+i+0.35,0.8,z+0.05,0.05,0.05,0.01,0xf2b84b,false);box(x+i+0.5,0.8,z+0.05,0.1,0.05,0.01,0xef6b6b,false);emit(x+i+0.15,0.88,z+0.05,0.4,0.02,0.003,0xfff6d6);}};
const bpMachine=(x,z)=>{blk(x+0.3,z+0.3,0.4,0.4);box(x+0.32,0,z+0.32,0.36,0.75,0.36,0xe3e7ec);box(x+0.3,0.75,z+0.3,0.4,0.15,0.4,0xdfe6ea);box(x+0.38,0.78,z+0.62,0.24,0.08,0.1,0x2b3242,false);emit(x+0.4,0.5,z+0.68,0.2,0.12,0.004,0x5fd3a6);textPlate(x+0.33,0.92,z+0.66,0.34,0.08,'血壓計','#2a7fd4');};
const heightScale=(x,z)=>{blk(x+0.3,z+0.3,0.4,0.4);box(x+0.3,0,z+0.3,0.4,0.08,0.4,0xe3e7ec);box(x+0.45,0.08,z+0.62,0.08,1.4,0.06,0xdfe3e8,false);box(x+0.4,1.3,z+0.4,0.2,0.03,0.25,0xdfe3e8,false);emit(x+0.4,0.5,z+0.68,0.18,0.08,0.004,0xf2b84b);};
const radSign=(x,y,z,w=1.1)=>textPlate(x,y,z,w,0.16,'☢ 輻射管制區','#f2b84b','#1b1b1b');
const scopeCabinet=(x,z)=>{blk(x+0.05,z+0.1,0.9,0.55);box(x+0.05,0,z+0.1,0.9,1.6,0.55,0xe3e7ec);glassPane(x+0.1,0.2,z+0.66,0.8,1.3,0.01);for(let i=0;i<5;i++){box(x+0.15+i*0.15,0.4,z+0.4,0.025,1.05,0.025,0x2b3242,false);box(x+0.12+i*0.15,1.42,z+0.37,0.08,0.06,0.08,0x3b4454,false);}};
const tubeStation=(x,y,z)=>{box(x,y,z,0.3,0.5,0.15,0xe3e7ec,false);box(x+0.05,y+0.1,z+0.15,0.2,0.25,0.01,0x9aa3ad,false);box(x+0.12,y+0.5,z+0.03,0.08,0.8-y+0.55,0.08,0x9aa3ad,false);emit(x+0.08,y+0.38,z+0.151,0.14,0.05,0.003,0x5fd3a6);};
const instTray=(x,z)=>{box(x,0,z,0.05,0.75,0.05,0x8a94a8,false);box(x+0.5,0,z,0.05,0.75,0.05,0x8a94a8,false);box(x-0.05,0.75,z-0.1,0.65,0.03,0.4,0xcfd6dc,false);box(x,0.78,z-0.05,0.55,0.01,0.3,0x6aa7ff,false);for(let i=0;i<5;i++)box(x+0.05+i*0.1,0.79,z,0.02,0.01,0.18,0xdfe3e8,false);};
const register=(x,y,z)=>{box(x,y,z,0.3,0.12,0.25,0x2b3242,false);box(x+0.02,y+0.12,z+0.02,0.26,0.16,0.04,0x1b2230,false);emit(x+0.04,y+0.14,z+0.061,0.22,0.1,0.003,0x5fd3a6);box(x+0.03,y+0.12,z+0.1,0.24,0.02,0.12,0x5a6270,false);};
const coffeeMachine=(x,y,z)=>{box(x,y,z,0.3,0.4,0.28,0x2b3242,false);box(x+0.05,y+0.05,z+0.28,0.2,0.12,0.02,0x1b2230,false);box(x+0.1,y+0.05,z+0.2,0.1,0.08,0.08,0xffffff,false);emit(x+0.05,y+0.3,z+0.281,0.2,0.05,0.003,0xf2b84b);};
const menuBoard=(x,z,w,title,items,bg)=>{textPlate(x,1.48,z,w,0.2,title,bg);textPlate(x,1.26,z,w,0.16,items,'#1b1b1b','#f2d27a');};
const wallBars=(x,z,len)=>{for(let i=0;i<=Math.floor(len/0.35);i++)box(x,0,z+i*0.35,0.06,1.3,0.06,0x8a6545,false);for(let j=0;j<8;j++)box(x+0.02,0.12+j*0.15,z,0.03,0.03,len,0xb08a5a,false);};
const trainStairs=(x,z)=>{blk(x,z+0.1,1.8,0.8);for(let i=0;i<3;i++)box(x+0.3+i*0.3,0,z+0.15,0.3,0.12+i*0.12,0.7,0x8a6545);for(let i=0;i<3;i++)box(x+1.2+i*0.3,0,z+0.15,0.3,0.36-i*0.12,0.7,0x8a6545);box(x+0.3,0.85,z+0.12,1.8,0.04,0.04,0x8a94a8,false);box(x+0.3,0.85,z+0.84,1.8,0.04,0.04,0x8a94a8,false);box(x+0.3,0,z+0.12,0.04,0.85,0.04,0x8a94a8,false);box(x+2.06,0,z+0.12,0.04,0.85,0.04,0x8a94a8,false);};
const medFridge=(x,z)=>{blk(x+0.2,z+0.2,0.6,0.6);box(x+0.2,0,z+0.2,0.6,1.0,0.6,0xf4f6f8);glassPane(x+0.25,0.1,z+0.81,0.5,0.8,0.01);for(let i=0;i<3;i++)box(x+0.27,0.25+i*0.25,z+0.4,0.46,0.02,0.38,0xdfe3e8,false);emit(x+0.6,0.92,z+0.812,0.12,0.05,0.003,0x6aa7ff);};
const cupSet=(x,y,z,n)=>{for(let i=0;i<n;i++){box(x+i*0.4,y,z,0.06,0.08,0.06,0xffffff,false);box(x+i*0.4+0.1,y,z,0.06,0.18,0.06,0x9ad0e8,false);}};
const plaque=(x,y,z)=>{box(x,y,z,0.3,0.36,0.03,0x8a6545,false);box(x+0.04,y+0.04,z+0.03,0.22,0.28,0.005,0xf2d27a,false);};
const cleaningCart=(x,z)=>{box(x+0.2,0,z+0.25,0.6,0.08,0.5,0x2a7fd4,false);box(x+0.25,0.08,z+0.3,0.25,0.4,0.4,0xf2b84b,false);box(x+0.55,0.08,z+0.3,0.2,0.6,0.4,0x9aa3ad,false);box(x+0.78,0.08,z+0.45,0.03,0.9,0.03,0x8a6545,false);box(x+0.2,0,z+0.85,0.3,0.45,0.05,0xf2b84b,false);textPlate(x+0.22,0.25,z+0.905,0.26,0.12,'小心地滑','#f2b84b','#1b1b1b');};
function detailUnit(r,kind){const x0=r.x,z0=r.y,w=r.w,h=r.h,last=x0+w-1,zb=z0+0.02,zf=z0+h-1,door=r.door[0],b=r.base,sideL=x0,sideR=x0+w;
 const free=x=>x>=x0&&x<=last&&x!==door&&x!==door-1&&x!==door+1;// 門口三格不放落地的東西
 const pick=(cands)=>{for(const x of cands)if(free(x))return x;return null;};
 switch(b){
 case 'office':{// 資訊部：值班表白板、備品架、測試桌、機櫃型 UPS
  textPlate(x0+0.5,1.12,zb+0.07,1.4,0.28,'值班表・分機 2266','#ffffff','#1b2230');textPlate(x0+0.5,0.98,zb+0.07,1.4,0.12,'今日：系統 / 網路 / 資安','#ffffff','#2a7fd4');
  let a=pick([last-1,last-2]);if(a!==null)spareShelf(a,zf);let t=pick([x0+1,x0+2]);if(t!==null)testBench(t,zf);
  box(sideR-0.06,0.75,z0+1.2,0.05,0.55,1.1,0xf4f6f8,false);for(let i=0;i<6;i++)box(sideR-0.07,0.8+(i%3)*0.15,z0+1.3+Math.floor(i/3)*0.45,0.01,0.1,0.35,[0xf2b84b,0xef6b6b,0x6aa7ff][i%3],false);break;}
 case 'hr':case 'acct':case 'ga':case 'pr':case 'qa':case 'sw':case 'ic':case 'nutrition':case 'edu':case 'research':{if(b==='research'||(b==='edu'&&/模擬/.test(r.name)))break;
  let a=pick([x0+1,x0+2]);if(a!==null)fileCabinet(a,zf);let c=pick([x0+3,x0+4]);if(c!==null&&w>=8)fileCabinet(c,zf);let d=pick([last-1,last-2]);if(d!==null)waterDispenser(d,zf);let e=pick([last-3,last-4]);if(e!==null&&w>=8)copier(e,zf);
  if(b==='edu'){wallTV(x0+w/2-0.9,0.8,zb,1.8);}break;}
 case 'server':{let a=pick([x0+1,x0]);if(a!==null)fm200(a,zf);let k=pick([last-1,last-2]);if(k!==null)kvmCart(k,zf);
  box(door+0.95,0.65,z0+h+1.0,0.12,0.2,0.04,0x2b3242,false);emit(door+0.97,0.78,z0+h+1.04,0.08,0.04,0.003,0xef6b6b);textPlate(door-0.9,1.15,z0+h+1.02,0.85,0.14,'機房重地 刷卡進入','#c0392b');
  box(x0+0.2,1.2,zb,0.3,0.12,0.12,0xf4f6f8,false);emit(x0+0.24,1.22,zb+0.121,0.22,0.06,0.003,0x5fd3a6);textPlate(x0+0.55,1.2,zb+0.04,0.6,0.12,'溫濕度 22℃','#1f4a4a');break;}
 case 'meet':case 'boardroom':{if(/國際會議廳|值班宿舍/.test(r.name))break;if(b==='boardroom'){blk(last-0.8,z0+0.3,0.7,0.5);box(last-0.8,0,z0+0.3,0.7,0.95,0.5,0x4e352c);box(last-0.55,0.95,z0+0.45,0.04,0.25,0.04,0x2b3242,false);box(x0+w/2-0.15,1.45,z0+0.06,0.3,0.12,0.12,0x2b3242,false);textPlate(x0+w/2-1.0,1.62,z0+0.03,2.0,0.2,'院務會議','#3a2820');}const tw=Math.max(2,Math.min(10,w-3)),tx0=x0+Math.floor((w-tw)/2);const cx=tx0+tw/2,cz=z0+3.5;box(cx-0.15,0.75,cz-0.15,0.3,0.04,0.3,0x2b3242,false);box(cx-0.1,0.79,cz-0.1,0.2,0.02,0.2,0x3b4454,false);
  cupSet(tx0+0.3,0.75,z0+2.65,Math.floor(tw/0.4)-1);cupSet(tx0+0.3,0.75,z0+4.2,Math.floor(tw/0.4)-1);for(let x=tx0+0.2;x+0.3<=tx0+tw;x+=1.1){box(x,0.75,z0+2.7,0.22,0.08,0.04,0xf4f6f8,false);box(x,0.75,z0+4.3,0.22,0.08,0.04,0xf4f6f8,false);}
  box(x0+w/2-0.15,0.2,z0+3.4,0.3,0.12,0.2,0x2b3242,false);break;}
 case 'lobby':{textPlate(x0+Math.floor((w-Math.min(6,w-4))/2)+0.5,1.25,z0+0.97,1.6,0.22,'服務台 Information','#7a5a1a');
  let v=pick([last-1,last-2]);if(v!==null)vending(v,zf);let v2=pick([last-2,last-3]);if(v2!==null&&v2!==v&&w>=10)vending(v2,zf,0x2a7fd4);let wc1=pick([x0+1,x0+2]);if(wc1!==null){wheelchair(wc1,zf);textPlate(wc1+0.05,1.1,zf+0.95,0.9,0.14,'輪椅借用','#2a7fd4',undefined,true);}
  textPlate(x0+0.3,1.12,zb+0.04,1.3,0.2,'樓層簡介','#1f3a5a');for(let i=0;i<4;i++)textPlate(x0+0.3,0.9-i*0.13,zb+0.04,1.3,0.11,['B1 美食街','1F 大廳・掛號','2F 門診','3F 檢查'][i],'#ffffff','#1f3a5a');break;}
 case 'reg':case 'cashier':{textPlate(x0+w/2-1,1.62,zb+0.08,2.0,0.3,b==='reg'?'掛號 Registration':'批價・繳費 Payment','#5a3a7a');let k=pick([last-1,last-2]);if(k!==null&&b==='reg'){atm(k,zf);textPlate(k+0.2,1.48,zf+0.21,0.6,0.12,'自動繳費','#2a7fd4');}break;}
 case 'seven':{let a=pick([x0+1,x0+2]);if(a!==null)atm(a,zf);coffeeMachine(last-1.7,1.0,z0+0.3);textPlate(x0+0.5,1.62,zb+0.04,Math.min(3,w-1),0.18,'7-ELEVEN','#2f7d4a','#ffffff');break;}
 case 'buffet':case 'bento':case 'noodle':case 'tea':case 'cafe':{const MENU2={buffet:['自助餐','秤重 $1.8/g・白飯 $10'],bento:['便當','排骨 $95・雞腿 $110'],noodle:['麵店','牛肉麵 $150・餛飩 $70'],tea:['手搖飲','紅茶 $30・珍奶 $55'],cafe:['咖啡','美式 $60・拿鐵 $85']}[b];
  menuBoard(x0+0.4,zb+0.05,Math.min(3,w-0.8),MENU2[0],MENU2[1],'#b0601a');register(last-0.9,1.0,z0+0.3);break;}
 case 'exec':case 'vp':{for(let i=0;i<3;i++)box(x0+0.95+i*0.15,0.4,z0+5.3,0.06,0.06,0.06,0xf4f6f8,false);box(x0+1.4,0.4,z0+5.25,0.12,0.1,0.12,0x8a6545,false);
  const dx=x0+Math.max(1,Math.floor(w/2)-1);box(dx+1.6,0.81,z0+2.6,0.2,0.08,0.2,0x7a4b2a,false);box(dx+1.62,0.89,z0+2.62,0.16,0.12,0.16,0x2f7d4a,false);textPlate(dx+0.6,0.82,z0+3.36,0.5,0.08,b==='exec'?'院長':'副院長','#3a2820','#f2d27a');break;}
 case 'er':{textPlate(door+1.6,1.68,z0+h-1+0.47,1.4,0.2,'檢傷分類','#c0392b');break;}
 case 'icu':case 'ward':{const icu=b==='icu';const k=Math.floor((w+1)/4);for(let i=0;i<k;i++){const cx=x0+i*4;if(cx+2>last)break;headwall(cx,zb,3);wallTV(cx+1.2,1.0,zb+0.06,0.5);
   if(icu){ventilator(cx+0.75,z0-0.15);pump(cx+0.86,0.8,z0+0.18);pump(cx+0.86,0.97,z0+0.18);pump(cx+2.86,0.8,z0+0.18);pump(cx+2.86,0.97,z0+0.18);}}
  if(icu){const sx=Math.max(x0+1,door-2);centralMonitor(sx+0.2,1.18,z0+5.2,1.6);}else{let f=pick([door-4,door-5]);if(f!==null&&f>=x0)medFridge(f,z0+5);}
  let c=pick([last-1,last-3]);if(c!==null&&!icu)cleaningCart(c,zf);break;}
 case 'opd':{const k=Math.floor((w+1)/5);for(let i=0;i<k;i++){const cx=x0+i*5;textPlate(cx+0.95,1.32,z0+4.0,0.6,0.16,String(i*7+3).padStart(3,'0'),'#111111','#ef6b6b');}
  let bp=pick([x0+1,x0+2]);if(bp!==null)bpMachine(bp,zf);let hs=pick([last-1,last-2]);if(hs!==null)heightScale(hs,zf);break;}
 case 'xray':case 'ct':case 'mri':case 'nuc':case 'cath':{let wcx=pick([x0+1,x0+2]);if(wcx!==null)wheelchair(wcx,zf);if(b==='cath'){instTray(x0+5.3,z0+2.5);}break;}
 case 'endo':{let wcx=pick([last-1,last-2]);if(wcx!==null)wheelchair(wcx,zf);break;}
 case 'or':{const k=Math.floor((last-x0+2)/6);for(let i=0;i<k;i++){const cx=x0+i*6;if(cx+4>last)break;textPlate(cx+2,1.32,z0+4.0,1.0,0.16,'手術中','#c0392b');emit(cx+2.35,1.5,z0+4.0,0.3,0.06,0.02,0xef6b6b);instTray(cx+0.2,z0+2.5);o2tank(cx+0.3,z0+2.0);}
  textPlate(Math.max(x0+0.5,door-4),1.45,z0+5.15,2.0,0.2,'手術排程・狀態','#2f7d5a');break;}
 case 'lab':{let t=pick([x0+1,x0+2]);if(t!==null)tubeStation(t+0.3,0.8,zf+0.83);break;}
 case 'pharmacy':{textPlate(door-1.6,1.33,z0+4.0,1.2,0.16,'調劑區 非請勿入','#2f7d5a');tubeStation(x0+0.3,0.8,z0+0.02+3.85-0.16);textPlate(x0+w/2-1,1.62,zb+0.08,2.0,0.28,'領藥 Pharmacy','#2f7d5a');break;}
 case 'dialysis':{for(let i=0;i<3;i++)box(x0+0.2,0.95+i*0.1,zb,last-x0-1.8,0.05,0.05,[0x6aa7ff,0xef6b6b,0xdfe3e8][i],false);textPlate(last-1.5,1.32,z0+4.05,0.9,0.14,'RO 水處理','#2a6fa8');break;}
 case 'rehab':{wallBars(sideL+0.02,z0+4.2,2.0);if(w>=12){let ts=pick([last-3,last-4]);if(ts!==null)trainStairs(ts-1,zf);}textPlate(x0+0.3,1.15,zb+0.05,1.2,0.16,'物理治療・職能治療','#5a8a4a');break;}
 }
 // 細節擺完再保險一次：門口兩格要能走
 BLK.delete((r.y+h-2)*W+door);BLK.delete((r.y+h-1)*W+door);if(r.wide){BLK.delete((r.y+h-2)*W+door+1);BLK.delete((r.y+h-1)*W+door+1);}}

// ---------- 蓋一層樓 ----------
let curKey=null,curS=null;
const FPM={};const DGEO=new Set([geo,RGEO]);
// 換樓層：把上一層的幾何全部釋放（材質都是快取的，留著重用）
function disposeGroup(G){G.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!DGEO.has(o.geometry))o.geometry.dispose();});}
// 尋路需要某層的家具位置、但那層還沒畫過時：只算擋格，不建畫面
let DRY=false;const BUILDING=new Set();
function ensureBlk(key){if(BLK3[key]||!FLOORS[key]||BUILDING.has(key))return;const sv={FG,STATIC,LEDS,ledMesh,BLK,mk:markers.slice()};DRY=true;BUILDING.add(key);
 try{buildFloor(key);}finally{DRY=false;BUILDING.delete(key);disposeGroup(FG);FG=sv.FG;STATIC=sv.STATIC;LEDS=sv.LEDS;ledMesh=sv.ledMesh;BLK=sv.BLK;markers.length=0;sv.mk.forEach(m=>markers.push(m));}}
window.ensureBlk=ensureBlk;
function freeNearK(key,x,y,r){const ok=(nx,ny)=>walk(key,nx,ny)&&!!bfs(key,r.door[0],r.y+r.h-1,nx,ny);if(ok(x,y))return [x,y];for(let d=1;d<=4;d++)for(let dy=-d;dy<=d;dy++)for(let dx=-d;dx<=d;dx++){const nx=x+dx,ny=y+dy;if(nx<r.x||nx>=r.x+r.w||ny<r.y||ny>=r.y+r.h)continue;if(ok(nx,ny))return [nx,ny];}return [r.door[0],r.y+r.h-2];}
// 工單標題 → 該去碰哪一種設備（照順序比對，第一個對到的優先）
const DEVRULES=[[/讀卡機|健保卡/,['reader']],[/掃描槍|條碼/,['scanner']],[/給藥車|平板|行動護理車|推車/,['cow']],[/印表機|印不出|列印|標籤|藥袋|處方箋|影印/,['printer']],
 [/叫號|看板|電視|投影|視訊|螢幕牆|跑馬燈/,['display']],[/報到機|繳費機|自助/,['kiosk']],[/UPS|電池|斷電/,['ups']],[/溫度|機櫃|伺服器|備份|巡檢|磁帶|批次|儲存|告警|韌體|版更|服務檢查/,['server']],
 [/交換器|網路孔|弱電/,['switch','ap']],[/WiFi|無線|AP|訊號|斷線|網路慢|連不上網|上不了網/,['ap']],[/PACS|影像|X 光|X光|CT|MRI|心導管|超音波|內視鏡|工作站|儀器|檢驗|LIS/,['workstation','pc']],
 [/電話|分機/,['phone','pc']],[/螢幕|開不了機|當機|很慢|電腦|帳號|密碼|中毒|軟體|安裝|HIS|系統|信箱|PDF|共享|驅動|藍屏|滑鼠|鍵盤/,['pc']]];
const DEVNAME={reader:'讀卡機',scanner:'條碼槍',cow:'電腦推車',printer:'印表機',display:'螢幕看板',kiosk:'自助機',ups:'UPS',server:'機櫃',switch:'弱電箱',ap:'無線 AP',workstation:'工作站',pc:'電腦',phone:'電話'};
function bindTask(t){const key=t.room.key;if(t._dev===key)return;ensureBlk(key);const devs=DEV3[key];if(!devs)return;t._dev=key;const r=t.room;
 const inRoom=d=>d.x>=r.x&&d.x<r.x+r.w&&d.z>=r.y-0.1&&d.z<r.y+r.h+0.2;let kinds=['pc'];for(const [re,k] of DEVRULES){if(re.test(t.title)){kinds=k;break;}}
 let pick=null;for(const k of kinds){const c=devs.filter(d=>d.kind===k&&inRoom(d));if(c.length){pick=c[(t.id*7+3)%c.length];break;}}
 if(!pick&&kinds.includes('switch')){const c=devs.filter(d=>d.kind==='switch');if(c.length)pick=c[0];}
 if(pick){t.devPos=pick;t.devKind=pick.kind;const gx=Math.max(r.x,Math.min(r.x+r.w-1,Math.floor(pick.x))),gz=Math.max(r.y,Math.min(r.y+r.h-1,Math.floor(pick.z)));[t.sx,t.sy]=freeNearK(key,gx,gz,r);}
 else{t.devPos=null;[t.sx,t.sy]=freeNearK(key,t.sx,t.sy,r);}}
window.bindTask=bindTask;window.DEVNAME=DEVNAME;
function buildFloor(key){if(!DRY&&FG){scene.remove(FG);disposeGroup(FG);}
 FG=new THREE.Group();if(!DRY)scene.add(FG);BUILDING.add(key);DEV=[];BLK=new Set();LEDS=[];ledMesh=null;STATIC=new Map();markers.length=0;
 const F=FLOORS[key],g=F.grid;const NZ=WALLROW+1,SZ=SWALL;
 const coreKind=id=>id==='lobby'?'lobby':id.startsWith('wc')?'wc':'stair';
 const zoneOf=(x,y)=>{if(y<=WALLROW){const r=F.rooms.find(r=>x>=r.x-1&&x<=r.x+r.w);return r?KIND(r.id):'hall';}if(y>=SWALL){const c=CORE3.find(c=>x>=c.x-1&&x<=c.x+c.w);return c?coreKind(c.id):'hall';}return 'hall';};
 const fp=(x,z,w,d,kind)=>{const [c1,c2]=FLOORC[kind];const fk=kind+'|'+w+'|'+d;let m=FPM[fk];if(!m){m=checker(c1,c2).clone();m.map=m.map.clone();m.map.needsUpdate=true;m.map.repeat.set(w/2,d/2);FPM[fk]=m;}const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);p.rotation.x=-Math.PI/2;p.position.set(x+w/2,0,z+d/2);p.receiveShadow=true;FG.add(p);};
 F.rooms.forEach(r=>{fp(r.x,r.y,r.w,r.h,KIND(r.id));if(r.noWall)fp(r.x,WALLROW,r.w,1,KIND(r.id));});fp(1,NZ,W-2,SWALL-NZ,'hall');CORE3.forEach(c=>fp(c.x,SWALL+1,c.w,H-SWALL-2,coreKind(c.id)));fp(20,SWALL,8,1,'lobby');
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=g[y][x];
  if(v===1){const zn=zoneOf(x,y);const hg=y>=SWALL?0.55:1.35;addInst('wall_'+zn,WALLMATS[zn]||WALLMATS.hall,x,0,y,1,hg,1,true);box(x,hg,y,1,0.08,1,0xc9c3b6,false);}
  else if(v===3&&y<SWALL&&g[y][x-1]===3){}
  else if(v===3&&y<SWALL&&g[y][x+1]===3){const FR=0x8a94a8;box(x,0,y,0.08,1.35,1,FR);box(x+1.92,0,y,0.08,1.35,1,FR);box(x,1.25,y,2,0.1,1,FR);box(x,1.35,y,2,0.06,1,0xc9c3b6,false);box(x+0.08,0,y,1.84,0.012,1,0x6b7585,false);
   addInst('glass',GLASS,x+0.08,0,y+0.42,0.55,1.22,0.06,false);addInst('glass',GLASS,x+1.37,0,y+0.48,0.55,1.22,0.06,false);box(x+0.08,0,y+0.42,0.55,0.08,0.06,0x8a94a8,false);box(x+1.37,0,y+0.48,0.55,0.08,0.06,0x8a94a8,false);box(x+0.6,0,y+0.42,0.03,1.22,0.06,0x8a94a8,false);box(x+1.37,0,y+0.48,0.03,1.22,0.06,0x8a94a8,false);
   box(x+0.85,1.12,y+1.0,0.3,0.1,0.04,0x2b3242,false);emit(x+0.88,1.14,y+1.04,0.24,0.06,0.003,0xef6b6b);textPlate(x+0.6,0.88,y+1.01,0.8,0.14,'自動門・病床通行','#3b4454');}
  else if(v===3){const FR=0x8a94a8;if(y>=SWALL){box(x,0,y,0.07,0.55,1,FR);box(x+0.93,0,y,0.07,0.55,1,FR);box(x+0.07,0,y,0.86,0.012,1,0x6b7585,false);}
   else{box(x,0,y,0.07,1.35,1,FR);box(x+0.93,0,y,0.07,1.35,1,FR);box(x,1.27,y,1,0.08,1,FR);box(x,1.35,y,1,0.06,1,0xc9c3b6,false);box(x+0.07,0,y,0.86,0.012,1,0x6b7585,false);
    box(x+0.07,0,y-0.84,0.05,1.25,0.84,0xa07a52);box(x+0.065,0.62,y-0.76,0.06,0.04,0.06,0x2b3242,false);box(x+0.064,0.75,y-0.6,0.062,0.32,0.16,0xbfe0ff,false);}}
  else if(v===6){const bx=x===0?-3:W;box(bx,-0.02,y,3,0.04,1,0x4f8f68,false);if(y===NZ)box(bx,0,y-0.1,3,1.0,0.1,0x1f3a2c);if(y===SWALL-1)box(bx,0,y+1,3,1.0,0.1,0x1f3a2c);box(x,-0.02,y,1,0.04,1,0x6f7784,false);
   if(y===NZ+1){addInst('glass',GLASS,bx,1.0,y-1.2,3,0.9,3.4,false);}}
  if(y===NZ&&v!==3&&v!==1&&v!==6&&g[y-1][x]===1)box(x,0.001,y+0.85,1,0.02,0.12,0xe0b84a,false);}
 // 核心：兩端樓梯、電梯廳（兩部）、男女廁
 stairs3(1,SWALL+2);stairs3(45,SWALL+2);elev3(21,H-1);elev3(25,H-1);
 blk(20.3,SWALL+1.3,1.5,0.5);box(20.3,0.35,SWALL+1.3,1.5,0.1,0.5,0x4a5566);box(20.3,0,SWALL+1.3,0.1,0.35,0.5,0x3a4452);box(21.7,0,SWALL+1.3,0.1,0.35,0.5,0x3a4452);box(23.85,1.02,H-1-0.3,0.3,0.18,0.06,0x222222);emit(23.9,1.05,H-1-0.33,0.2,0.12,0.01,0xf2b84b);plant(27,SWALL+1.1);
 wcRoom(30,SWALL+2,false,4);wcRoom(35,SWALL+2,true,3);box(33.1,0.6,SZ-0.03,0.22,0.3,0.03,0x6aa7ff);box(37.1,0.6,SZ-0.03,0.22,0.3,0.03,0xf29bb8);
 // 走廊：北牆扶手（避開門與開放的門診區）、門牌、EXIT、滅火器、公佈欄、時鐘
 {const rail=(x1,x2,z)=>{if(x2-x1<0.5)return;box(x1,0.82,z,x2-x1,0.06,0.06,0xb8865a);for(let x=x1+0.3;x<x2;x+=1.5)box(x,0.78,z+0.02,0.04,0.04,0.08,0x6b7585);};
  let s=1.2;F.rooms.forEach(r=>{if(r.noWall){rail(s,r.x-0.15,NZ);s=r.x+r.w+0.15;return;}rail(s,r.door[0]-0.15,NZ);s=r.door[0]+(r.wide?2.15:1.15);sign(r.door[0]+1.1,NZ,hx(r.c));});rail(s,W-1.2,NZ);
  const exitSign=x=>{box(x,0.62,SZ-0.04,0.5,0.2,0.04,0x1f7a46);emit(x+0.05,0.66,SZ-0.045,0.4,0.12,0.01,0x4ee28a);};exitSign(3.25);exitSign(46.25);
  extinguisher(8,SZ-0.14);extinguisher(40,SZ-0.14);}
 // ---------- 招牌、引導線、洗手液、AP、網路孔、弱電箱、消防栓 ----------
 {const isDoorAt=x=>g[WALLROW][x]===3||g[WALLROW][x]===0;
  F.rooms.forEach(r=>{const k=KIND(r.id);const d=r.door[0];const sw=Math.min(3,Math.max(1.6,r.name.length*0.32+0.4));
   if(!(r.base==='ward'&&r.noWall))textPlate(d+0.5-sw/2,1.44,NZ+0.03,sw,0.36,r.name,DEPT_BG(k),'#ffffff',!!r.noWall);
   if(!r.noWall){sanitizer(d-0.3,NZ);}
   // 房內：後牆網路孔、AP
   for(let x=r.x+0.4;x<r.x+r.w-0.3;x+=2)wallJack(x,r.y);wallAP(r.x+r.w/2+1.0,r.y);
  });
  // 地板彩色引導線：從電梯廳中間拉到幾個常被問路的單位
  const GUIDE={er:[0xef6b6b,'急診'],xray:[0x2a7fd4,'X光'],ct:[0x2a7fd4,'CT'],mri:[0x2a7fd4,'MRI'],lab:[0xf2b84b,'抽血檢驗'],pharmacy:[0x5fd3a6,'領藥'],opd:[0xf29bb8,'門診'],reg:[0xd08cff,'掛號'],cashier:[0xd08cff,'批價'],dialysis:[0x6fb6d6,'洗腎'],rehab:[0x9ad07a,'復健']};
  let lane=0;F.rooms.forEach(r=>{const G2=GUIDE[r.base];if(!G2)return;const lz=SWALL-0.55-lane*0.2;lane++;const cx=24,dx=r.door[0]+0.44+lane*0.04;const xa=Math.min(cx,dx),xb=Math.max(cx,dx);
   emit(xa,0.004,lz,xb-xa+0.12,0.004,0.12,G2[0]);emit(dx,0.004,NZ,0.12,0.004,lz-NZ+0.12,G2[0]);
   const t=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.22),textMat(G2[1],'rgba(0,0,0,0)','#'+G2[0].toString(16).padStart(6,'0'),256,64));{const mk='T'+G2[1]+G2[0];if(!TXT[mk]){TXT[mk]=t.material.clone();TXT[mk].transparent=true;}t.material=TXT[mk];}t.rotation.x=-Math.PI/2;t.position.set(dx+0.06,0.006,NZ+0.6);FG.add(t);});
  // 走廊吊牌：電梯／廁所、兩端樓梯、空橋
  textPlate(21.6,1.5,NZ+2.0,2.4,0.34,'↓ 電梯・廁所','#1f3a5a','#ffffff',true);textPlate(1.6,1.5,NZ+2.0,1.8,0.34,'↙ 樓梯 安全門','#1f7a46','#ffffff',true);textPlate(44.4,1.5,NZ+2.0,1.8,0.34,'樓梯 安全門 ↘','#1f7a46','#ffffff',true);
  if(g[11][W-1]===6)textPlate(W-3.6,1.5,NZ+0.6,2.4,0.34,'空橋 → '+BORD[BORD.indexOf(F.b)+1]+'棟','#2f7d5a','#ffffff',true);if(g[11][0]===6)textPlate(1.2,1.5,NZ+0.6,2.4,0.34,BORD[BORD.indexOf(F.b)-1]+'棟 ← 空橋','#2f7d5a','#ffffff',true);
  // 走廊北牆：AP、弱電箱、消防栓（找沒有門的牆段）
  const wallRun=(x,n)=>{for(let i=-1;i<=n;i++){if(g[WALLROW][x+i]!==1)return false;}return true;};
  {let xx=10;while(xx<W-6&&!wallRun(xx,2))xx++;if(xx<W-6)board(xx,NZ);let cx=Math.floor(W*0.7);while(cx<W-3&&!wallRun(cx,1))cx++;if(cx<W-3)clock(cx,NZ);}
  for(let x=6;x<W-4;x+=11){let xx=x;while(xx<W-3&&!wallRun(xx,1))xx++;if(xx<W-3)wallAP(xx+0.3,NZ);}
  {let xx=W-4;while(xx>4&&!wallRun(xx,1))xx--;if(xx>4){idfBox(xx,NZ);textPlate(xx+0.05,1.28,NZ+0.27,0.7,0.12,'弱電箱 '+F.b+F.f,'#3b4454');}}
  {let xx=Math.floor(W/2)-4;while(xx>4&&!wallRun(xx,1))xx--;if(xx>4){box(xx,0.2,NZ,0.8,0.95,0.18,0xc0392b);box(xx+0.04,0.24,NZ+0.18,0.72,0.87,0.01,0xd9534f,false);textPlate(xx+0.15,0.95,NZ+0.19,0.5,0.14,'消防栓','#c0392b');}}
   // 裝飾：靠北牆的盆栽和衛教海報、各單位門口的地墊
   for(let x=7;x<W-6;x+=10){let xx=x;while(xx<W-3&&!wallRun(xx,0))xx++;if(xx<W-3&&g[NZ][xx]===0&&g[NZ+1][xx]===0)deco(xx+0.25,NZ+0.02);}
   {const PC=[[0x5fb5e6,0xef6b6b],[0xf2b84b,0x5fd3a6],[0xe58fb0,0x5fb5e6]];let k=0;for(let x=12;x<W-8;x+=13){let xx=x;while(xx<W-3&&!wallRun(xx,1))xx++;if(xx<W-3){wallArt(xx+0.2,NZ,PC[k%3][0],PC[k%3][1]);k++;}}}
   F.rooms.forEach(r=>{if(r.door&&r.door[1]===WALLROW&&!r.noWall)box(r.door[0]+0.08,0.004,NZ+0.04,0.84,0.012,0.5,0x7a8aa6,false);});
 }
 F.rooms.forEach(r=>{furnish(r,KIND(r.id));detailUnit(r,KIND(r.id));});
 if(DRY){STATIC=new Map();}else{flushStatic();flushLEDs();}BLK3[key]=BLK;DEV3[key]=DEV;BUILDING.delete(key);
 const freeNear=(x,y,r)=>freeNearK(key,x,y,r);
 (F.npcs||[]).forEach(a=>{a.path=[];a.steps=[];a.px=a.py=0;[a.x,a.y]=freeNear(a.x,a.y,a.room);});
 FG.userData.freeNear=freeNear;if(S)S.tasks.forEach(t=>{if(t.room.key===key&&t.state!=='done'){t._dev=null;bindTask(t);}});
 for(let x=3;x<W-2;x+=5)emit(x,1.42,NZ+1.4,1.6,0.02,0.2,0xfff6d6);
 if(!DRY){renderer.shadowMap.needsUpdate=true;curKey=key;}}
// ---------- 人 ----------
const blobTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const r=g.createRadialGradient(32,32,4,32,32,30);r.addColorStop(0,'rgba(0,0,0,.45)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
// ---------- 人：依角色換裝。靜態部位合成一個 mesh（vertex color），四肢各一個，一個人約 6 個 draw call ----------
const PGEO=geo.toNonIndexed();const BLOBGEO=new THREE.PlaneGeometry(0.9,0.9);const BLOBMAT=new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false});const VCMAT=new THREE.MeshLambertMaterial({vertexColors:true});const _pc=new THREE.Color();
function mergeParts(parts){const P=PGEO.attributes.position.array,N=PGEO.attributes.normal.array,nv=P.length/3;const pos=new Float32Array(parts.length*P.length),nor=new Float32Array(parts.length*P.length),col=new Float32Array(parts.length*P.length);
 parts.forEach(([x,y,z,w,h,d,c],k)=>{_pc.setHex(c);_pc.convertSRGBToLinear();const o=k*P.length;for(let i=0;i<nv;i++){pos[o+i*3]=P[i*3]*w+x;pos[o+i*3+1]=P[i*3+1]*h+y+h/2;pos[o+i*3+2]=P[i*3+2]*d+z;nor[o+i*3]=N[i*3];nor[o+i*3+1]=N[i*3+1];nor[o+i*3+2]=N[i*3+2];col[o+i*3]=_pc.r;col[o+i*3+1]=_pc.g;col[o+i*3+2]=_pc.b;}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));return new THREE.Mesh(g,VCMAT);}
const OUTFIT={
 doctor:{top:0x9ad0e8,pants:0x3b4454,shoe:0x2b2b2b,coat:0xf7f9fb,steth:true,badge:true},
 nurse:{top:0xf7f9fb,pants:0xf7f9fb,shoe:0xf4f6f8,trim:0x6fb6d6,cap:'nurse',badge:true},
 surgeon:{top:0x3f8f74,pants:0x3f8f74,shoe:0xdfe3e8,cap:'scrub',mask:true},
 patient:{top:0x9ad0e8,pants:0x9ad0e8,shoe:0x8a94a8,stripe:0x4f8fd6},
 tech:{top:0x2a4f8a,pants:0x2b3242,shoe:0x2b2b2b,badge:true},
 pharm:{top:0x9fb6c2,pants:0x3b4454,shoe:0x2b2b2b,coat:0xf7f9fb,badge:true},
 researcher:{top:0xdfe3e8,pants:0x3b4454,shoe:0x2b2b2b,coat:0xf7f9fb,badge:true},
 security:{top:0x1f2d4a,pants:0x1f2d4a,shoe:0x111111,cap:'security',belt:0x111111,patch:0xf2b84b},
 volunteer:{top:0xf4f6f8,pants:0x3b4454,shoe:0x2b2b2b,vest:0xf2c94c},
 vendor:{top:0xf4f6f8,pants:0x2b3242,shoe:0x2b2b2b,apron:0xc0392b,cap:'vendor'},
 clerk:{top:0xf4f6f8,pants:0x2b3242,shoe:0x2b2b2b,vest:0x2a3f6a,badge:true},
 exec:{top:0x2b2b2b,pants:0x2b2b2b,shoe:0x111111,collar:0xffffff,tie:0x8a2a2a},
 cleaner:{top:0x7f8c8d,pants:0x5a6270,shoe:0x2b2b2b,apron:0x5a6270},
 it:{pants:0x2b3242,shoe:0x2b2b2b,lanyard:true}};
function person(a){if(HQ)return person2(a);const lk=a.look||{shirt:a.color,hair:'#2b2b2b',skin:'#f1d3b3',style:0};const role=a.role||(lk.coat?'doctor':'it');const O=OUTFIT[role]||OUTFIT.it;
 const top=O.top!==undefined?O.top:hx(lk.shirt||a.color||'#3f8f74'),pants=O.pants,shoe=O.shoe,hair=hx(lk.hair||'#2b2b2b'),skin=hx(lk.skin||'#f1d3b3');const fem=a.g==='f';
 const g=new THREE.Group();const S=[];const add=(x,y,z,w,h,d,c)=>S.push([x,y,z,w,h,d,c]);
 const blob=new THREE.Mesh(BLOBGEO,BLOBMAT);blob.rotation.x=-Math.PI/2;blob.position.y=-0.29;blob.renderOrder=1;g.add(blob);
 // 軀幹
 add(0,0,0,0.42,0.5,0.28,top);add(0,-0.03,0,0.43,0.06,0.29,pants);
 if(O.stripe)for(let i=-1;i<=1;i++)add(i*0.12,0.02,0.141,0.03,0.46,0.005,O.stripe);
 if(O.trim){add(0,0.42,0.141,0.2,0.06,0.005,O.trim);add(-0.16,0.1,0.141,0.1,0.08,0.005,O.trim);}
 if(O.coat){add(-0.13,-0.25,0.0,0.17,0.75,0.31,O.coat);add(0.13,-0.25,0.0,0.17,0.75,0.31,O.coat);add(0,0.25,-0.005,0.43,0.25,0.3,O.coat);add(0,0.43,0.15,0.1,0.07,0.01,top);add(0.13,0.12,0.157,0.1,0.1,0.01,0xe3e7ec);add(0.13,0.2,0.16,0.02,0.06,0.005,0x2a7fd4);}
 if(O.vest){add(-0.13,0.0,0.0,0.15,0.46,0.3,O.vest);add(0.13,0.0,0.0,0.15,0.46,0.3,O.vest);add(0,0.0,-0.005,0.43,0.46,0.29,O.vest);}
 if(O.apron){add(0,-0.12,0.15,0.34,0.55,0.02,O.apron);add(0,0.43,0.15,0.2,0.04,0.02,O.apron);}
 if(O.collar){add(0,0.36,0.141,0.12,0.14,0.005,O.collar);add(0,0.18,0.146,0.05,0.2,0.006,O.tie);}
 if(O.belt){add(0,0.02,0,0.44,0.05,0.3,O.belt);add(0.12,0.02,0.152,0.05,0.04,0.005,0xb8a040);}
 if(O.patch){add(-0.22,0.38,0,0.02,0.08,0.12,O.patch);add(0.22,0.38,0,0.02,0.08,0.12,O.patch);add(-0.12,0.32,0.143,0.06,0.07,0.005,O.patch);}
 if(O.steth){add(-0.07,0.22,0.16,0.02,0.24,0.01,0x2b3242);add(0.07,0.22,0.16,0.02,0.24,0.01,0x2b3242);add(0,0.2,0.165,0.06,0.04,0.02,0x8a94a8);}
 if(O.badge||O.lanyard){add(-0.06,0.3,0.142,0.015,0.2,0.005,O.lanyard?0x2a7fd4:0x3f8f74);add(0.06,0.3,0.142,0.015,0.2,0.005,O.lanyard?0x2a7fd4:0x3f8f74);add(0,0.18,0.145,0.11,0.13,0.008,0xf4f6f8);add(0,0.26,0.15,0.11,0.03,0.004,O.lanyard?0x2a7fd4:0x3f8f74);}
 // 頭
 add(0,0.5,0,0.08,0.04,0.08,skin);add(0,0.53,0,0.38,0.37,0.35,skin);
 add(-0.08,0.65,0.176,0.055,0.06,0.01,0x1b1b1b);add(0.08,0.65,0.176,0.055,0.06,0.01,0x1b1b1b);add(-0.065,0.665,0.18,0.02,0.02,0.005,0xffffff);add(0.095,0.665,0.18,0.02,0.02,0.005,0xffffff);
 add(-0.08,0.72,0.177,0.07,0.015,0.008,hair);add(0.08,0.72,0.177,0.07,0.015,0.008,hair);add(0,0.58,0.177,0.07,0.015,0.008,0xb0605a);
 if(fem){add(-0.14,0.6,0.176,0.05,0.025,0.005,0xf2a0a0);add(0.14,0.6,0.176,0.05,0.025,0.005,0xf2a0a0);}
 add(-0.195,0.62,0,0.03,0.08,0.08,skin);add(0.195,0.62,0,0.03,0.08,0.08,skin);
 // 頭髮
 const st=lk.style|0;add(0,0.86,0,0.4,0.08,0.38,hair);add(0,0.74,-0.16,0.4,0.16,0.06,hair);add(-0.19,0.76,-0.02,0.04,0.12,0.32,hair);add(0.19,0.76,-0.02,0.04,0.12,0.32,hair);add(0,0.8,0.165,0.4,0.06,0.04,hair);
 if(fem){if(st===0){add(-0.2,0.48,-0.03,0.05,0.35,0.3,hair);add(0.2,0.48,-0.03,0.05,0.35,0.3,hair);add(0,0.42,-0.18,0.42,0.42,0.06,hair);}
  else if(st===1){add(0,0.6,-0.21,0.14,0.22,0.08,hair);add(0,0.75,-0.2,0.08,0.06,0.06,0xe06c8a);}
  else{add(0,0.86,-0.14,0.16,0.14,0.14,hair);add(0,0.5,-0.18,0.38,0.24,0.04,hair);}}
 else{if(st===1){add(-0.08,0.92,0.04,0.12,0.06,0.18,hair);add(0.08,0.93,-0.02,0.1,0.06,0.16,hair);}else if(st===2){add(0.1,0.88,0.12,0.18,0.05,0.1,hair);}}
 if(lk.glasses){add(-0.08,0.65,0.185,0.11,0.09,0.012,0x2b3242);add(0.08,0.65,0.185,0.11,0.09,0.012,0x2b3242);add(-0.08,0.65,0.19,0.08,0.06,0.005,0x9ad0e8);add(0.08,0.65,0.19,0.08,0.06,0.005,0x9ad0e8);add(0,0.68,0.19,0.05,0.015,0.005,0x2b3242);}
 const cap=O.cap||lk.cap||(lk.hat?'hat':null);
 if(cap==='nurse'){add(0,0.92,0.02,0.36,0.08,0.3,0xffffff);add(0,0.95,0.17,0.08,0.05,0.005,0xe06c8a);}
 else if(cap==='scrub'){add(0,0.84,0,0.42,0.14,0.4,0x3f8f74);add(0,0.83,-0.18,0.3,0.06,0.06,0x3f8f74);}
 else if(cap==='security'){add(0,0.9,0,0.44,0.1,0.42,0x1f2d4a);add(0,0.88,0.26,0.44,0.03,0.16,0x111111);add(0,0.93,0.212,0.08,0.05,0.005,0xf2b84b);}
 else if(cap==='vendor'){add(0,0.9,0,0.44,0.08,0.42,O.apron||0xc0392b);add(0,0.88,0.25,0.4,0.03,0.12,O.apron||0xc0392b);}
 else if(cap==='hat'){add(0,0.9,0,0.44,0.1,0.42,0x2a7fd4);add(0,0.9,0.26,0.44,0.03,0.14,0x1b5fa0);}
 if(O.mask){add(0,0.55,0.182,0.3,0.14,0.02,0x9ad0e8);add(-0.18,0.62,0.05,0.02,0.02,0.24,0x9ad0e8);add(0.18,0.62,0.05,0.02,0.02,0.24,0x9ad0e8);}
 const body=mergeParts(S);g.add(body);
 // 四肢：腿（褲＋鞋）、手（袖＋手）
 const limb=(x,y,parts)=>{const p=new THREE.Group();p.position.set(x,y,0);p.add(mergeParts(parts));g.add(p);return p;};
 const sleeve=O.coat||O.vest&&top||top;
 const L1=limb(-0.1,0,[[0,-0.28,0,0.16,0.28,0.2,pants],[0,-0.32,0.03,0.17,0.07,0.26,shoe]]);
 const L2=limb(0.1,0,[[0,-0.28,0,0.16,0.28,0.2,pants],[0,-0.32,0.03,0.17,0.07,0.26,shoe]]);
 const A1=limb(-0.28,0.47,[[0,-0.32,0,0.12,0.32,0.17,sleeve],[0,-0.42,0,0.1,0.1,0.13,skin]]);
 const A2=limb(0.28,0.47,[[0,-0.32,0,0.12,0.32,0.17,sleeve],[0,-0.42,0,0.1,0.1,0.13,skin]]);
 g.userData.limbs=[L1,L2,A1,A2];g.position.y=0.3;g.userData.actor=a;return g;}
// ---------- 圓潤版人物：球、圓柱合成（vertex color），結構和積木版一樣：身體一個 mesh＋四肢 ----------
const SPH=new THREE.SphereGeometry(0.5,12,8),SPL=new THREE.SphereGeometry(0.5,8,6),CYL=new THREE.CylinderGeometry(0.5,0.5,1,12),TAP=new THREE.CylinderGeometry(0.42,0.5,1,12),HEMI=new THREE.SphereGeometry(0.5,12,6,0,Math.PI*2,0,Math.PI/2);
const _mm=new THREE.Matrix4(),_mn=new THREE.Matrix3(),_mv=new THREE.Vector3(),_ms=new THREE.Vector3(),_mq=new THREE.Quaternion();
function mergeG(items){let n=0;items.forEach(it=>{const g=it[0];n+=(g.index?g.index.count:g.attributes.position.count);});const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
 items.forEach(([g,x,y,z,sx,sy,sz,c])=>{_pc.setHex(c);_pc.convertSRGBToLinear();_mv.set(x,y,z);_ms.set(sx,sy,sz);_mm.compose(_mv,_mq,_ms);_mn.getNormalMatrix(_mm);const P=g.attributes.position,N=g.attributes.normal,I=g.index,cnt=I?I.count:P.count;
  for(let k=0;k<cnt;k++){const i=I?I.getX(k):k;_mv.fromBufferAttribute(P,i).applyMatrix4(_mm);pos[o]=_mv.x;pos[o+1]=_mv.y;pos[o+2]=_mv.z;_mv.fromBufferAttribute(N,i).applyMatrix3(_mn).normalize();nor[o]=_mv.x;nor[o+1]=_mv.y;nor[o+2]=_mv.z;col[o]=_pc.r;col[o+1]=_pc.g;col[o+2]=_pc.b;o+=3;}});
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',new THREE.BufferAttribute(nor,3));G.setAttribute('color',new THREE.BufferAttribute(col,3));return new THREE.Mesh(G,VCMAT);}
function person2(a){const lk=a.look||{shirt:a.color,hair:'#2b2b2b',skin:'#f1d3b3',style:0};const role=a.role||(lk.coat?'doctor':'it');const O=OUTFIT[role]||OUTFIT.it;
 const top=O.top!==undefined?O.top:hx(lk.shirt||a.color||'#3f8f74'),pants=O.pants,shoe=O.shoe,hair=hx(lk.hair||'#2b2b2b'),skin=hx(lk.skin||'#f1d3b3');const fem=a.g==='f';
 const g=new THREE.Group();const S=[];const sp=(x,y,z,sx,sy,sz,c)=>S.push([SPH,x,y,z,sx,sy,sz,c]),sl=(x,y,z,sx,sy,sz,c)=>S.push([SPL,x,y,z,sx,sy,sz,c]),cy=(x,y,z,sx,sy,sz,c)=>S.push([CYL,x,y,z,sx,sy,sz,c]),tp=(x,y,z,sx,sy,sz,c)=>S.push([TAP,x,y,z,sx,sy,sz,c]),hm=(x,y,z,sx,sy,sz,c)=>S.push([HEMI,x,y,z,sx,sy,sz,c]),bx=(x,y,z,w,h,d,c)=>S.push([geo,x,y,z,w,h,d,c]);
 const blob=new THREE.Mesh(BLOBGEO,BLOBMAT);blob.rotation.x=-Math.PI/2;blob.position.y=-0.29;blob.renderOrder=1;g.add(blob);
 // 軀幹
 tp(0,0.25,0,0.46,0.5,0.34,top);sp(0,0.48,0,0.4,0.12,0.3,top);sp(0,0.02,0,0.47,0.2,0.35,pants);
 if(O.stripe)for(let i=-1;i<=1;i++)bx(i*0.11,0.26,0.165,0.03,0.42,0.02,O.stripe);
 if(O.trim){bx(0,0.45,0.15,0.2,0.05,0.03,O.trim);bx(-0.13,0.14,0.17,0.09,0.07,0.02,O.trim);}
 if(O.coat){tp(0,0.12,0,0.5,0.76,0.38,O.coat);sp(0,0.49,0,0.43,0.12,0.33,O.coat);bx(0,0.2,0.18,0.07,0.56,0.03,top);bx(0.13,0.16,0.185,0.09,0.09,0.02,0xe3e7ec);}
 if(O.vest){tp(0,0.25,0,0.5,0.46,0.37,O.vest);bx(0,0.26,0.177,0.08,0.44,0.03,top);}
 if(O.apron){bx(0,0.14,0.175,0.3,0.5,0.03,O.apron);bx(0,0.44,0.17,0.18,0.04,0.03,O.apron);}
 if(O.collar){bx(0,0.42,0.165,0.13,0.1,0.03,O.collar);bx(0,0.26,0.178,0.05,0.24,0.02,O.tie);}
 if(O.belt){cy(0,0.05,0,0.49,0.05,0.37,O.belt);bx(0.1,0.05,0.185,0.05,0.04,0.02,0xb8a040);}
 if(O.patch){sl(-0.2,0.42,0,0.08,0.1,0.14,O.patch);sl(0.2,0.42,0,0.08,0.1,0.14,O.patch);bx(-0.11,0.36,0.172,0.06,0.07,0.02,O.patch);}
 if(O.steth){bx(-0.07,0.34,0.19,0.02,0.22,0.02,0x2b3242);bx(0.07,0.34,0.19,0.02,0.22,0.02,0x2b3242);sl(0,0.22,0.2,0.06,0.06,0.03,0x8a94a8);}
 if(O.badge||O.lanyard){const lc=O.lanyard?0x2a7fd4:0x3f8f74;bx(-0.055,0.38,0.178,0.015,0.2,0.02,lc);bx(0.055,0.38,0.178,0.015,0.2,0.02,lc);bx(0,0.24,0.19,0.1,0.12,0.02,0xf4f6f8);bx(0,0.29,0.195,0.1,0.025,0.02,lc);}
 // 頭
 cy(0,0.53,0,0.13,0.08,0.13,skin);sp(0,0.76,0,0.47,0.45,0.43,skin);sl(-0.23,0.75,0,0.06,0.1,0.09,skin);sl(0.23,0.75,0,0.06,0.1,0.09,skin);
 sl(-0.085,0.765,0.195,0.065,0.085,0.04,0x1b1b1b);sl(0.085,0.765,0.195,0.065,0.085,0.04,0x1b1b1b);sl(-0.07,0.785,0.213,0.024,0.026,0.012,0xffffff);sl(0.1,0.785,0.213,0.024,0.026,0.012,0xffffff);
 sl(0,0.675,0.205,0.07,0.022,0.02,0xb0605a);if(fem){sl(-0.15,0.7,0.18,0.07,0.04,0.03,0xf2a0a0);sl(0.15,0.7,0.18,0.07,0.04,0.03,0xf2a0a0);}
 // 頭髮
 const st=lk.style|0;const cap=O.cap||lk.cap||(lk.hat?'hat':null);
 hm(0,0.79,-0.01,0.51,0.48,0.47,hair);sp(0,0.76,-0.07,0.49,0.42,0.38,hair);sp(0,0.93,0.13,0.36,0.1,0.16,hair);
 if(fem){if(st===0){cy(0,0.56,-0.12,0.44,0.44,0.22,hair);sp(-0.21,0.62,-0.02,0.1,0.34,0.26,hair);sp(0.21,0.62,-0.02,0.1,0.34,0.26,hair);}
  else if(st===1){sp(0,0.62,-0.27,0.13,0.3,0.13,hair);sl(0,0.78,-0.25,0.08,0.08,0.08,0xe06c8a);}
  else{sp(0,1.0,-0.1,0.18,0.18,0.18,hair);}}
 else{if(st===1){sl(-0.08,1.0,0.03,0.13,0.1,0.16,hair);sl(0.08,1.01,-0.03,0.12,0.1,0.15,hair);}else if(st===2){sp(0.09,0.95,0.1,0.26,0.1,0.18,hair);}}
 if(lk.glasses){bx(-0.085,0.765,0.225,0.11,0.09,0.012,0x2b3242);bx(0.085,0.765,0.225,0.11,0.09,0.012,0x2b3242);bx(-0.085,0.765,0.23,0.08,0.06,0.008,0x9ad0e8);bx(0.085,0.765,0.23,0.08,0.06,0.008,0x9ad0e8);bx(0,0.78,0.228,0.06,0.015,0.008,0x2b3242);}
 if(cap==='nurse'){cy(0,1.0,0.02,0.3,0.07,0.26,0xffffff);bx(0,1.0,0.15,0.07,0.04,0.02,0xe06c8a);}
 else if(cap==='scrub'){hm(0,0.78,0,0.54,0.52,0.5,0x3f8f74);sp(0,0.78,-0.08,0.5,0.4,0.38,0x3f8f74);}
 else if(cap==='security'){cy(0,1.0,0,0.46,0.1,0.44,0x1f2d4a);bx(0,0.96,0.26,0.36,0.025,0.16,0x111111);bx(0,1.01,0.222,0.08,0.05,0.01,0xf2b84b);}
 else if(cap==='vendor'){cy(0,1.0,0,0.46,0.08,0.44,O.apron||0xc0392b);bx(0,0.97,0.26,0.34,0.025,0.14,O.apron||0xc0392b);}
 else if(cap==='hat'){cy(0,1.0,0,0.46,0.1,0.44,0x2a7fd4);bx(0,0.96,0.26,0.36,0.025,0.15,0x1b5fa0);}
 if(O.mask){sp(0,0.69,0.15,0.32,0.17,0.2,0x9ad0e8);}
 g.add(mergeG(S));
 const limb=(x,y,parts)=>{const p=new THREE.Group();p.position.set(x,y,0);p.add(mergeG(parts));g.add(p);return p;};
 const sleeve=O.coat||O.vest&&top||top;const leg=()=>[[CYL,0,-0.13,0,0.17,0.28,0.19,pants],[SPH,0,-0.27,0.035,0.19,0.11,0.29,shoe]],arm=()=>[[SPL,0,-0.01,0,0.15,0.15,0.17,sleeve],[CYL,0,-0.16,0,0.13,0.3,0.15,sleeve],[SPL,0,-0.35,0,0.12,0.12,0.13,skin]];
 const L1=limb(-0.1,0,leg()),L2=limb(0.1,0,leg()),A1=limb(-0.28,0.46,arm()),A2=limb(0.28,0.46,arm());
 g.userData.limbs=[L1,L2,A1,A2];g.position.y=0.3;g.userData.actor=a;return g;}
function legs(g,sw){const L=g.userData.limbs;if(!L)return;L[0].rotation.x=sw;L[1].rotation.x=-sw;L[2].rotation.x=-sw*0.8;L[3].rotation.x=sw*0.8;}

const SITTERS={doctor:1,clerk:1,tech:1,pharm:1,researcher:1,exec:1,nurse:1,it:1,admin:1,staff:1};
const AG=new Map();// actor -> {g,ang,phase}
function actorG(a){let e=AG.get(a);if(!e){e={g:person(a),ang:0,phase:0};scene.add(e.g);AG.set(a,e);}return e;}

// ---------- 標籤（HTML 投影） ----------
const LB=document.getElementById('labels');const lbPool=new Map();let lbUsed=new Set();const _v=new THREE.Vector3();
function label(id,wx,wy,wz,cls,html,onclick){let el=lbPool.get(id);if(!el){el=document.createElement('div');el.className='lb '+cls;LB.appendChild(el);lbPool.set(id,el);el._html='';}
 if(el._html!==html){el.innerHTML=html;el._html=html;}el.onclick=onclick?e=>{e.stopPropagation();onclick();}:null;el.style.cursor=onclick?'pointer':'';
 _v.set(wx,wy,wz).project(camera);if(_v.z>1||_v.x<-1.2||_v.x>1.2||_v.y<-1.2||_v.y>1.2){el.style.display='none';}else{el.style.display='';el.style.left=((_v.x+1)/2*innerWidth)+'px';el.style.top=((1-_v.y)/2*innerHeight)+'px';}
 lbUsed.add(id);return el;}
function sweepLabels(){for(const [id,el] of lbPool){if(!lbUsed.has(id)){el.remove();lbPool.delete(id);}}lbUsed=new Set();}
// ---------- 鏡頭 ----------
let yaw=0.25,pitch=0.95,dist=16;const camT=new THREE.Vector3(12,0,6);let camFollow=true;
function placeCam(){const cx=camT.x+Math.sin(yaw)*Math.cos(pitch)*dist,cy=camT.y+Math.sin(pitch)*dist,cz=camT.z+Math.cos(yaw)*Math.cos(pitch)*dist;camera.position.set(cx,cy,cz);camera.lookAt(camT.x,camT.y+0.6,camT.z);}
let drag=null,moved=0;
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw,pitch};moved=0;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));yaw=drag.yaw-dx*0.006;pitch=Math.max(0.35,Math.min(1.45,drag.pitch+dy*0.006));});
canvas.addEventListener('pointerup',e=>{const wasDrag=moved>6;drag=null;if(!wasDrag)onClick(e.clientX,e.clientY);});
const touches=new Map();let pinch0=null;
canvas.addEventListener('touchstart',e=>{if(e.touches.length===2){const [a,b]=e.touches;pinch0={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),dist};drag=null;}},{passive:true});
canvas.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch0){const [a,b]=e.touches;const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);dist=Math.max(7,Math.min(30,pinch0.dist*pinch0.d/Math.max(20,d)));moved=99;}},{passive:true});
canvas.addEventListener('touchend',e=>{if(e.touches.length<2)pinch0=null;},{passive:true});
canvas.addEventListener('wheel',e=>{dist=Math.max(7,Math.min(30,dist*(1+Math.sign(e.deltaY)*0.1)));e.preventDefault();},{passive:false});
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitP=new THREE.Vector3();
const markers=[];const RINGGEO=new THREE.RingGeometry(0.2,0.26,24);DGEO.add(RINGGEO);// {mesh,t}
function onClick(cx,cy){if(!S||S.over)return;const P=S.player;if(P.phone||P.guide||S.wc>0||P.transit||S.meeting>0)return;
 ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
 // 先看有沒有點到任務方塊
 const ms=markers.map(m=>m.mesh);const hits=ray.intersectObjects(ms,false);if(hits.length){const t=markers.find(m=>m.mesh===hits[0].object).t;hitTask(t);return;}
 if(!ray.ray.intersectPlane(plane,hitP))return;const x=Math.floor(hitP.x),y=Math.floor(hitP.z);
 if(S.view&&S.view!==P.key){S.view=null;return;}
 const v=G(P.key)[y]&&G(P.key)[y][x];if(v===1||v===undefined)return;
 if(v===4||v===5){if(P.x===x&&P.y===y)openFloorPick(v===4?'elev':'stair');else{if(P.busy)cancelBusy(P);P.steps=[{type:'walk',x,y},{type:'pick',mode:v===4?'elev':'stair'}];P.path=bfs(P.key,P.x,P.y,x,y)||[];if(!P.path.length)P.steps=[];}return;}
 if(v===6){const dir=x===0?-1:1;const nb=BORD[BORD.indexOf(P.b)+dir];if(!nb)return;if(P.busy)cancelBusy(P);P.steps=[{type:'walk',x,y},{type:'transit',dur:4,label:'連通道 → '+BLD[nb].slice(0,2),to:{b:nb,f:P.f,x:dir>0?0:W-1,y:11}}];nextStep(P);return;}
 let tx=x,ty=y;if(!walk(P.key,tx,ty)){let f=null;for(let r=1;r<=2&&!f;r++)for(let dy=-r;dy<=r&&!f;dy++)for(let dx=-r;dx<=r&&!f;dx++)if(walk(P.key,tx+dx,ty+dy)&&G(P.key)[ty+dy][tx+dx]!==1)f=[tx+dx,ty+dy];if(!f)return;[tx,ty]=f;}
 if(P.busy)cancelBusy(P);P.steps=[{type:'walk',x:tx,y:ty}];nextStep(P);}
function doWC(){const P=S.player;if(S.wc>0||P.phone||P.guide)return;if(G(P.key)[P.y][P.x]!==7){const wt=P.g==='f'?WCT_F:WCT;S.view=null;goTo(P,{b:P.b,f:P.f,x:wt[0],y:wt[1]});return;}if(P.busy)cancelBusy(P);P.path=[];P.steps=[];S.wc=5;toast('上廁所，5 分鐘');}
window.addEventListener('keydown',e=>{if(!S||S.over||S.paused)return;if(e.key!==' ')return;const P=S.player;if(P.transit||P.phone||P.guide||S.wc>0)return;if(G(P.key)[P.y][P.x]===7){e.preventDefault();e.stopImmediatePropagation();doWC();}},true);
function hitTask(t){const P=S.player;if(P.phone||P.guide||S.wc>0||P.transit||S.meeting>0)return;if(t.assignee&&t.assignee!==P)return;S.view=null;if(canWork(t,P))startWork(t,P);else goTo(P,siteOf(t));}
window.hitTask3d=hitTask;
// ---------- 每幀 ----------
let lastT=0;const fpsHist=[];let degraded=0;
function tickActors(key,now){const F=FLOORS[key];const list=[...(F.npcs||[]),...S.helpers,S.player].filter(a=>!(a.away>0||a.transit||a.key!==key));const seen=new Set();
 list.forEach(a=>{const e=actorG(a);seen.add(a);e.g.visible=true;const wx=a.x+a.px+0.5,wz=a.y+a.py+0.5;const walking=a.path.length>0;
  if(walking&&a.path[0]){const dx=a.path[0][0]-a.x,dy=a.path[0][1]-a.y;const tgt=Math.atan2(dx,dy);let d=tgt-e.ang;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;e.ang+=d*0.25;}
  else{const dm={d:0,u:Math.PI,l:-Math.PI/2,r:Math.PI/2}[a.dir||'d']||0;let d=dm-e.ang;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;e.ang+=d*0.15;}
  if(walking)e.phase+=0.34*Math.min(2,S.speed);legs(e.g,walking?Math.sin(e.phase)*0.7:0);if(HQ&&!walking){const L=e.g.userData.limbs,ph=now/900+(e.seed||(e.seed=Math.random()*6.28));e.g.scale.y=1+0.012*Math.sin(ph*1.7);if(L){L[2].rotation.z=-0.06-0.03*Math.sin(ph);L[3].rotation.z=0.06+0.03*Math.sin(ph);}}else if(e.g.scale.y!==1){e.g.scale.y=1;const L=e.g.userData.limbs;if(L){L[2].rotation.z=0;L[3].rotation.z=0;}}
  let px=wx,py=0.3+(walking?Math.abs(Math.sin(e.phase))*0.03:0),pz=wz;
  if(a.npc&&HQ){const L=e.g.userData.limbs;if(walking){if(e.seat){e.seat.used=null;e.seat=null;}}
   else{if(!e.seat&&now>(e.seatT||0)){e.seatT=now+3000+Math.random()*5000;const want=a.role==='patient'?'wseat':SITTERS[a.role]?'seat':null;
     if(want&&(a.role!=='nurse'||(e.seed||0)<3.1)){let best=null,bd=7.3;const h=a.home;for(const sd of DEV3[key]||[]){if(sd.kind!==want||sd.used)continue;if(h&&(sd.x<h.x-0.6||sd.x>h.x+h.w+0.6||sd.z<h.y-1.6||sd.z>h.y+h.h+1.6))continue;const d=(sd.x-wx)*(sd.x-wx)+(sd.z-wz)*(sd.z-wz);if(d<bd){bd=d;best=sd;}}
      if(best){best.used=a;e.seat=best;a.next=now+20000+Math.random()*25000;}}}
    if(e.seat&&L){const sd=e.seat,ty=sd.kind==='seat';px=sd.x;pz=sd.z;py=sd.y+0.05;e.ang=sd.a;L[0].rotation.x=L[1].rotation.x=-1.45;L[2].rotation.x=ty?-1.0+0.12*Math.sin(now/110+e.seed):-0.45;L[3].rotation.x=ty?-1.0+0.12*Math.cos(now/130+e.seed):-0.45;}
    else if(L&&a.role==='nurse'){L[3].rotation.x=-0.95;}}}
  e.g.position.set(px,py,pz);e.g.rotation.y=e.ang;});
 for(const [a,e] of AG){if(!seen.has(a))e.g.visible=false;}}
function draw3d(){const now=performance.now();if(!S){renderExterior(now);return;}
 if(S!==curS){curS=S;for(const [a,e] of AG)scene.remove(e.g);AG.clear();curKey=null;document.getElementById('hud').hidden=false;document.getElementById('status').hidden=false;document.getElementById('dock').hidden=false;maybeCoach();}
 const key=viewKey();if(key!==curKey){for(const [a,e] of AG){if(a.key!==key||a.transit){scene.remove(e.g);e.g.traverse(o=>{if(o.geometry&&o.geometry!==BLOBGEO)o.geometry.dispose();});AG.delete(a);}}buildFloor(key);}const F=FLOORS[key];const P=S.player;
 // 鏡頭跟人（看別層時看整層）
 if(S.view&&S.view!==P.key){const fx=window.__fx?(window.__fx[0]+window.__fx[1])/2:W/2;camT.lerp(new THREE.Vector3(fx,0,window.__fz||6),0.2);}else{camT.lerp(new THREE.Vector3(Math.max(7,Math.min(W-7,P.x+P.px+0.5)),0,Math.max(5,Math.min(H-4,P.y+P.py+0.5))),0.1);}
 placeCam();tickActors(key,now);tickLEDs(now);tickGuide(key,now);tickSfx(now);tickFx(key,now);
 // 任務方塊
 const vis=visible().filter(t=>t.room.key===key);markers.forEach(m=>{m.mesh.visible=false;if(m.ring)m.ring.visible=false;});{let n=0;for(const t of S.tasks){if(t._dev!==t.room.key&&t.state!=='done'&&(t.t<=S.time||t.state==='ringing')){bindTask(t);if(++n>=3)break;}}}
 vis.forEach((t,i)=>{let m=markers.find(m=>m.t===t);if(!m){const mesh=new THREE.Mesh(geo,bmat(0xffffff));mesh.scale.set(0.36,0.36,0.36);FG.add(mesh);m={mesh,t};markers.push(m);}
  const late=S.time>t.t+t.pat;m.mesh.material=bmat(t.kind==='prio'?0xef6b6b:late?0xf2b84b:(t.kind==='sched'||t.kind==='backup')?0x5fd3a6:0x6aa7ff);m.mesh.visible=true;if(t.devPos)m.mesh.position.set(t.devPos.x,t.devPos.y+0.42+Math.sin(now/300+t.id)*0.06,t.devPos.z+0.1);else m.mesh.position.set(t.sx+0.5,1.45+Math.sin(now/300+t.id)*0.08,t.sy+0.5);
  if(t.devPos){if(!m.ring){m.ring=new THREE.Mesh(RINGGEO,bmat(0xffffff));m.ring.rotation.x=-Math.PI/2;FG.add(m.ring);}m.ring.material=m.mesh.material;m.ring.visible=true;const sc=1+0.15*Math.sin(now/220+t.id);m.ring.scale.set(sc,sc,sc);m.ring.position.set(t.devPos.x,t.devPos.y+0.02,t.devPos.z+0.1);}m.mesh.rotation.y=now/700;m.mesh.rotation.x=0.6;});
 // 房名＋任務標籤
 const byRoom={};vis.forEach(t=>{(byRoom[t.room.id]=byRoom[t.room.id]||[]).push(t);});const rings=ringing().filter(t=>t.room.key===key);
 F.rooms.forEach(r=>{const ts=(byRoom[r.id]||[]).sort((a,b)=>(a.kind==='prio'?0:1)-(b.kind==='prio'?0:1));let h='<div>'+r.name+(S.fav[r.id]!==undefined?' '+favFace(favOf(r)):'')+'</div>';
  if(ts.length||rings.some(t=>t.room===r)){h+='<div class="tl">';ts.slice(0,3).forEach(t=>{const late=S.time>t.t+t.pat;const left=Math.ceil(t.t+t.pat-S.time);const title=t.title.replace(/^(主任交辦|主任轉來|交辦|簽核)：/,'');const tail=t.assignee?(t.assignee.name.replace(/\(.*\)/,'')+(t.assignee.busy&&t.assignee.busy.task===t?'處理中':'路上')):late?'逾時 '+(-left):'剩 '+left;
   h+='<div class="tk'+(t.kind==='prio'?' prio':'')+(late?' late':'')+((t.kind==='sched'||t.kind==='backup')?' sched':'')+'" data-t="'+t.id+'"><span>'+title+'</span><small>'+(t.devKind?DEVNAME[t.devKind]+'・':'')+tail+'</small></div>';});
   if(ts.length>3)h+='<small style="color:var(--muted)">…還有 '+(ts.length-3)+' 件</small>';rings.filter(t=>t.room===r).forEach(t=>{h+='<div class="ring">☎ 來電中（'+Math.ceil(S.time-t.ringAt)+' 分）</div>';});h+='</div>';}
  const el=label('room_'+r.id,r.x+r.w/2,1.75,r.y+0.1,'room',h,null);
  if(!el._bound){el._bound=true;el.addEventListener('click',e=>{const tk=e.target.closest('.tk');if(!tk)return;e.stopPropagation();const t=S.tasks[+tk.dataset.t];if(t)hitTask(t);});}});
 F.rooms.filter(r=>r.base==='opd').forEach(r=>{const k=Math.floor((r.w+1)/5);for(let i=0;i<k;i++)label('cub_'+r.id+'_'+i,r.x+i*5+0.5,1.35,r.y+4,'core','第 '+(i+1)+' 診',null);});F.rooms.filter(r=>r.base==='ward'||r.base==='icu').forEach(r=>{const k=Math.floor((r.w+1)/4);for(let i=0;i<k&&r.x+i*4+2<=r.x+r.w-1;i++)label('pr_'+r.id+'_'+i,r.x+i*4+0.5,1.35,r.y+4,'core',(r.base==='icu'?'ICU-':'')+String(r.f).padStart(2,'0')+String(i+1).padStart(2,'0'),null);});F.rooms.filter(r=>r.base==='or'||r.base==='icu').forEach(r=>label('vest_'+r.id,r.door[0]+0.5,1.3,r.y+r.h-0.5,'core',r.base==='or'?'更衣區':'前室・穿隔離衣',null));
 label('core_elev',24,1.3,H-1,'core','電梯',null);label('core_stairW',2,1.3,SWALL+2,'core','樓梯 ↕',null);label('core_stairE',46,1.3,SWALL+2,'core','樓梯 ↕',null);label('core_wcM',32,1.3,SWALL+3,'core','男廁',null);label('core_wcF',36.5,1.3,SWALL+3,'core','女廁',null);
 if(F.grid[11][W-1]===6){const nb=BORD[BORD.indexOf(F.b)+1];label('core_brE',W+1,1.4,11.5,'core bridge','空橋 → '+nb+'棟',null);}if(F.grid[11][0]===6){const nb=BORD[BORD.indexOf(F.b)-1];label('core_brW',-1,1.4,11.5,'core bridge',nb+'棟 ← 空橋',null);}
 // NPC 幫忙泡泡
 (F.npcs||[]).forEach((a,i)=>{const t=vis.find(t=>t.room===a.room&&!t.assignee);if(!t||a!==F.npcs.find(n=>n.room===a.room))return;const late=S.time>t.t+t.pat;label('npc_'+i,a.x+a.px+0.5,1.45,a.y+a.py+0.5,'bubble'+(late||fxRooms.has(a.room.id)?' late':''),fxRooms.has(a.room.id)?'都不能用了！':late?'快一點！':'幫忙一下',()=>hitTask(t));});
 // 名牌
 [...S.helpers,S.player].forEach((a,i)=>{if(a.away>0||a.transit||a.key!==key)return;let h='<span style="color:'+a.color+'">'+a.name+'</span>'+(a.phone||a.guide?' ☎':'')+(a===P&&S.eating?' 🍱':'');if(a.busy){const t=a.busy.task;h+='<span class="pg"><i style="width:'+Math.round(Math.max(0,Math.min(1,t.prog/t.dur))*100)+'%;background:'+a.color+'"></i></span>';}label('nm_'+i,a.x+a.px+0.5,1.5,a.y+a.py+0.5,'name',h,null);});
 if(!P.transit&&P.key===key&&!P.busy&&!P.phone&&!P.guide){const here=visible().find(t=>canWork(t,P)&&(!t.assignee||t.assignee===P));if(here)label('hint_sp',P.x+P.px+0.5,0.0,P.y+P.py+0.9,'hintkey',TOUCH?'點這裡：處理':'空白鍵：處理',()=>startWork(here,P));}
 // 廁所：站上去就提示；小七／美食街：到了自動把包包打開
 {const onWC=!P.transit&&P.key===key&&G(key)[P.y][P.x]===7;
  if(S.wc>0)label('hint_wc',P.x+P.px+0.5,0.0,P.y+P.py+0.9,'hintkey','廁所中… 剩 '+Math.ceil(S.wc)+' 分',null);
  else if(onWC&&!P.phone&&!P.guide&&!moving(P))label('hint_wc',P.x+P.px+0.5,0.0,P.y+P.py+0.9,'hintkey',TOUCH?'點這裡：上廁所（5 分）':'空白鍵：上廁所（5 分）',doWC);
  const hr=roomAt(P);const isShop=hr&&MENU[hr.id]&&hr!==OFFICE;if(isShop&&!moving(P)&&S._lastShop!==hr.id){S._lastShop=hr.id;openDrawer('dkBag');}
  if(isShop&&!moving(P)&&S.buying<=0&&!S.eating)label('hint_shop',P.x+P.px+0.5,0.0,P.y+P.py+0.9,'hintkey','🎒 看這裡能買什麼',()=>openDrawer('dkBag'));}
 sweepLabels();
 // 夜班光線
 {const cm=((S.shift.start+S.time)%1440+1440)%1440,hr=cm/60;const up=Math.max(0,Math.min(1,(hr-5.5)/1.5)),dn=Math.max(0,Math.min(1,(19-hr)/1.5));const day=Math.min(up,dn);const edge=day>0&&day<1?1-Math.abs(day*2-1):0;
  hemi.intensity=0.38+0.2*day;sun.intensity=0.45+0.8*day;amb.intensity=0.18+0.07*day;sun.color.setRGB(1,0.95-0.2*edge,0.87-0.37*edge);
  const bg=scene.background;bg.setRGB(0.03+0.10*day+0.08*edge,0.04+0.13*day+0.02*edge,0.06+0.17*day);scene.fog.color.copy(bg);ground.material.color.setRGB(0.07+0.10*day+0.05*edge,0.09+0.12*day,0.12+0.15*day);}
 document.getElementById('transit').hidden=!P.transit||!!S.view;if(P.transit&&!S.view)document.getElementById('transit').textContent=P.transit.label+'\n'+Math.ceil(P.transit.remain)+' 分';
 renderer.render(scene,camera);
 // fps 監看：太慢就降
 const dt=now-lastT;lastT=now;if(dt>0&&dt<500){fpsHist.push(1000/dt);if(fpsHist.length>90){const avg=fpsHist.reduce((a,b)=>a+b)/fpsHist.length;fpsHist.length=0;const fn=document.getElementById('fpsNote');fn.hidden=false;fn.textContent=Math.round(avg)+' fps';if(avg<30&&degraded===0){degraded=1;renderer.setPixelRatio(1);toast('畫面偏慢，已降低解析度');}else if(avg<24&&degraded===1){degraded=2;renderer.shadowMap.enabled=false;toast('已關閉陰影換流暢');}}}}
window.draw3d=draw3d;
// ---------- 開場：院區外觀 ----------
const extScene=new THREE.Scene();extScene.background=new THREE.Color(0x0b1220);extScene.fog=new THREE.Fog(0x0b1220,60,140);
const extCam=new THREE.PerspectiveCamera(40,1,0.1,300);
extScene.add(new THREE.HemisphereLight(0xcfe0ff,0x1a2230,0.8));const esun=new THREE.DirectionalLight(0xffe8c8,0.7);esun.position.set(30,40,20);extScene.add(esun);
let EXT=null,extDiff=null;
function winTex(w,h,seed){const c=document.createElement('canvas');c.width=w*8;c.height=h*8;const g=c.getContext('2d');g.fillStyle='#d9dde4';g.fillRect(0,0,c.width,c.height);let s=seed;const rn=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const lit=rn()<0.55;g.fillStyle=lit?(rn()<0.5?'#fff2c2':'#cfe6ff'):'#2a3140';g.fillRect(i*8+1,j*8+2,6,4);}const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.magFilter=THREE.NearestFilter;return t;}
function buildExterior(dk){if(EXT){extScene.remove(EXT);EXT.traverse(o=>{if(o.geometry&&o.geometry!==geo)o.geometry.dispose();if(o.material&&o.material.map&&o.material.map.image&&o.material.map.image.width<200){o.material.map.dispose();o.material.dispose();}});}EXT=new THREE.Group();extScene.add(EXT);extDiff=dk;const blds=Object.keys(BLUEPRINT[dk].bld);const n=blds.length;const gap=15,bw=11,bd=8,fh=1.1,nf=12;
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.MeshLambertMaterial({color:0x1d3324}));ground.rotation.x=-Math.PI/2;ground.position.y=-0.02;EXT.add(ground);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(260,7),new THREE.MeshLambertMaterial({color:0x2b2f36}));road.rotation.x=-Math.PI/2;road.position.set(0,0,12);EXT.add(road);
 const x0=-(n-1)*gap/2;
 blds.forEach((b,i)=>{const x=x0+i*gap;const t=winTex(10,nf,17+i*31);const m=new THREE.Mesh(geo,[new THREE.MeshLambertMaterial({map:t}),new THREE.MeshLambertMaterial({map:t}),mat(0x9aa3ad),mat(0x5b6678),new THREE.MeshLambertMaterial({map:t}),new THREE.MeshLambertMaterial({map:t})]);m.scale.set(bw,nf*fh,bd);m.position.set(x,nf*fh/2,0);EXT.add(m);
  const roof=new THREE.Mesh(geo,mat(0x6b7585));roof.scale.set(3,1,2.5);roof.position.set(x-2.5,nf*fh+0.5,0);EXT.add(roof);
  const base=new THREE.Mesh(geo,mat(0xc9c3b6));base.scale.set(bw+1.5,fh*1.05,bd+1.5);base.position.set(x,fh*0.52,0);EXT.add(base);
  const lab=new THREE.Mesh(geo,bmat(0xffffff));lab.scale.set(1.6,0.9,0.1);lab.position.set(x+bw/2-1.6,nf*fh-1,bd/2+0.06);EXT.add(lab);const cross=new THREE.Mesh(geo,bmat(0xef6b6b));cross.scale.set(0.9,0.25,0.12);cross.position.copy(lab.position);EXT.add(cross);const cross2=cross.clone();cross2.scale.set(0.25,0.9,0.12);EXT.add(cross2);
  if(i<n-1){for(let f=1;f<=2;f++){const br=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0x9ad0e8,transparent:true,opacity:0.6}));br.scale.set(gap-bw,fh*0.8,2);br.position.set(x+gap/2,f*fh+fh*0.5,0);EXT.add(br);const brf=new THREE.Mesh(geo,mat(0x4f8f68));brf.scale.set(gap-bw,0.12,2.2);brf.position.set(x+gap/2,f*fh+0.06,0);EXT.add(brf);}}
  for(let k=0;k<4;k++){const tr=new THREE.Mesh(geo,mat(0x2f7d4a));tr.scale.set(1.2,1.6,1.2);tr.position.set(x-bw/2+k*(bw/3),1.4,bd/2+3.5);EXT.add(tr);const tk=new THREE.Mesh(geo,mat(0x7a4b2a));tk.scale.set(0.25,0.8,0.25);tk.position.set(tr.position.x,0.4,tr.position.z);EXT.add(tk);}});
 // 救護車
 const amb1=new THREE.Mesh(geo,mat(0xf4f6f8));amb1.scale.set(2.2,1.1,1);amb1.position.set(x0-3,0.6,8.5);EXT.add(amb1);const st=new THREE.Mesh(geo,bmat(0xef6b6b));st.scale.set(2.2,0.15,1.02);st.position.set(x0-3,0.9,8.5);EXT.add(st);
 const hel=new THREE.Mesh(new THREE.CircleGeometry(2,24),mat(0x3b4454));hel.rotation.x=-Math.PI/2;hel.position.set(x0+(n-1)*gap,nf*fh+0.01,0);EXT.add(hel);const Hm=new THREE.Mesh(geo,bmat(0xffffff));Hm.scale.set(0.3,0.02,1.6);Hm.position.set(hel.position.x-0.5,nf*fh+0.03,0);EXT.add(Hm);const H2=Hm.clone();H2.position.x+=1;EXT.add(H2);const H3=Hm.clone();H3.scale.set(1,0.02,0.3);H3.position.x=hel.position.x;EXT.add(H3);
 extN=n;}
let extN=1;
function renderExterior(now){const dk=(typeof diffKey!=='undefined')?diffKey:'hard';if(dk!==extDiff)buildExterior(dk);const span=(extN-1)*15+30;const a=now/16000;const d=Math.max(44,span*1.15);const lx=-Math.max(9,span*0.28);extCam.position.set(lx+Math.sin(a)*d,15+Math.sin(now/9000)*2,Math.cos(a)*d+6);extCam.lookAt(lx,5,0);extCam.aspect=innerWidth/innerHeight;extCam.updateProjectionMatrix();renderer.render(extScene,extCam);
 document.getElementById('hud').hidden=true;document.getElementById('status').hidden=true;document.getElementById('dock').hidden=true;['drTasks','drBag','drMap'].forEach(id=>document.getElementById(id).hidden=true);sweepLabels();}
// 沒進遊戲時也要一直畫（開場背景）
// ---------- 做錯看得見：出事的單位地板發紅、人在抱怨、畫面跳警告 ----------
const fxRooms=new Set();const fxPl=[];let fxShake=0,_goalT=0;
const fxPlane=i=>{if(!fxPl[i]){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xef6b6b,transparent:true,opacity:0.2,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);fxPl[i]=m;}return fxPl[i];};
window.fxBanner=(e,why)=>{const el=document.getElementById('fxBan');el.innerHTML='<b>⚠ 出事了：'+locName(e.room)+'</b><span></span><small></small>';el.children[1].textContent=e.title;el.children[2].textContent='原因：'+why;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>{el.hidden=true;},9000);
 const v=document.getElementById('vig');v.classList.remove('on');void v.offsetWidth;v.classList.add('on');fxShake=performance.now()+600;sfx('bad');setTimeout(()=>sfx('alert'),450);};
const fltB=[],fltP=[];const SCR=bmat(0xe8eef6),SCR0=SCR.color.clone();
function tickFault(key,now){let n=0;for(const t of S.tasks){if(t.state==='done'||t.t>S.time||t.room.key!==key||!t.devPos||n>=10)continue;const d=t.devPos;
  if(!fltB[n]){fltB[n]=new THREE.Mesh(SPL,new THREE.MeshBasicMaterial({color:0xff4d4d}));fltB[n].scale.setScalar(0.09);scene.add(fltB[n]);fltP[n]=[0,1].map(()=>{const m=new THREE.Mesh(SPL,new THREE.MeshBasicMaterial({color:0x8a8f99,transparent:true,opacity:0.5,depthWrite:false}));scene.add(m);return m;});}
  const b=fltB[n];b.visible=Math.sin(now/170+n)>-0.2;b.position.set(d.x,d.y+0.14,d.z);fltP[n].forEach((m,k)=>{const p=((now/1500)+n*0.37+k*0.5)%1;m.visible=true;m.position.set(d.x+0.05*Math.sin(p*6+k),d.y+0.12+p*0.55,d.z);m.scale.setScalar(0.07+p*0.16);m.material.opacity=0.55*(1-p);});n++;}
 for(let i=n;i<fltB.length;i++){fltB[i].visible=false;fltP[i].forEach(m=>m.visible=false);}
 SCR.color.copy(SCR0).multiplyScalar(0.93+0.07*Math.sin(now/650));}
function tickFx(key,now){tickFault(key,now);fxRooms.clear();let n=0;const F=FLOORS[key];
 for(const c of S.chain){const t=c.effect;if(t.state==='done'||t.t>S.time||t.room.key!==key)continue;const wide=/整層|全院|所有/.test(t.title);const col=/中毒|加密|勒索|惡意|外洩|登入/.test(t.title)?0xb07cff:0xef6b6b;
  (wide?F.rooms:[t.room]).forEach(r=>{if(fxRooms.has(r.id))return;fxRooms.add(r.id);const m=fxPlane(n++);m.material.color.setHex(col);m.material.opacity=0.26+0.14*Math.sin(now/260);m.position.set(r.x+r.w/2,0.03,r.y+r.h/2);m.scale.set(r.w,r.h,1);m.visible=true;});
  label('fx_'+t.id,t.room.x+t.room.w/2,0.9,t.room.y+t.room.h/2,'fxlab','⚠ '+t.title.slice(0,14),()=>hitTask(t));}
 for(let i=n;i<fxPl.length;i++)fxPl[i].visible=false;
 // 表情：每個單位一個人，把對你的印象掛在頭上
 {const done=new Set();(F.npcs||[]).forEach((a,i)=>{const r=a.room;if(done.has(r.id)||a.role==='patient'||a.path.length)return;const v=S.fav[r.id];const face=fxRooms.has(r.id)?'😱':v===undefined?null:v>=75?'😊':v<30?'😠':v<50?'😒':null;if(!face)return;if(S.tasks.some(t=>t.room===r&&t.state!=='done'&&t.t<=S.time&&!t.assignee))return;done.add(r.id);label('emo_'+i,a.x+a.px+0.5,1.5,a.y+a.py+0.5,'emote',face,null);});}
 if(now<fxShake){camera.position.x+=(Math.random()-0.5)*0.25;camera.position.y+=(Math.random()-0.5)*0.18;}
 if(now-_goalT>500){_goalT=now;const g=goals();const h=g.map(x=>'<span class="'+(x.ok?'ok':'no')+'" title="'+x.n+'：'+x.d+'">'+(x.ok?'★':'☆')+' '+x.n.replace('沒有','').replace('沒踩資安和資料紅線','紅線').replace('急件逾時','急件').replace('電話漏接','漏接')+'</span>').join('');const el=document.getElementById('goals');if(el._h!==h){el.innerHTML=h;el._h=h;}}}
// ---------- 導引點：往哪裡走，地上看得到 ----------
const TOUCH=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
const GN=72;const guideMesh=new THREE.InstancedMesh(new THREE.CircleGeometry(0.09,10),new THREE.MeshBasicMaterial({color:0x5fd3a6,transparent:true,opacity:0.85,depthWrite:false}),GN);guideMesh.frustumCulled=false;guideMesh.count=0;scene.add(guideMesh);
const destRing=new THREE.Mesh(new THREE.RingGeometry(0.28,0.36,28),new THREE.MeshBasicMaterial({color:0x5fd3a6,transparent:true,opacity:0.9,depthWrite:false}));destRing.rotation.x=-Math.PI/2;destRing.visible=false;scene.add(destRing);
const _gm=new THREE.Matrix4(),_gq=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0)),_gp=new THREE.Vector3(),_gs=new THREE.Vector3();
function tickGuide(key,now){const P=S.player;const path=(P.key===key&&!P.transit&&P.path)?P.path:[];const n=Math.min(GN,path.length);
 for(let i=0;i<n;i++){const k=1+0.35*Math.sin(now/160-i*0.7);_gp.set(path[i][0]+0.5,0.035,path[i][1]+0.5);_gs.set(k,k,k);_gm.compose(_gp,_gq,_gs);guideMesh.setMatrixAt(i,_gm);}
 guideMesh.count=n;guideMesh.instanceMatrix.needsUpdate=true;
 if(n){const e=path[path.length-1];destRing.visible=true;destRing.position.set(e[0]+0.5,0.04,e[1]+0.5);const k=1+0.18*Math.sin(now/200);destRing.scale.set(k,k,k);}else destRing.visible=false;}
// ---------- 帶路：直接去最急的那一張 ----------
function goUrgent(){if(!S||S.over||S.paused)return;const P=S.player;if(P.phone||P.guide||S.wc>0||P.transit||S.meeting>0)return;
 const ts=visible().filter(t=>!t.assignee||t.assignee===P).sort((a,b)=>((a.kind==='prio'?0:1)-(b.kind==='prio'?0:1))||((a.t+a.pat)-(b.t+b.pat)));
 if(!ts.length){toast('現在沒有等你處理的工單');return;}const t=ts[0];toast('帶你去：'+locName(t.room)+'・'+t.title);hitTask(t);}
document.getElementById('dkNext').onclick=goUrgent;
{const gb=document.getElementById('gfx');const ui=()=>{gb.textContent=HQ?'畫質：高':'畫質：低';};ui();gb.onclick=()=>{HQ=!HQ;try{localStorage.setItem('itduty_gfx',HQ?'high':'low')}catch(e){}ui();renderer.shadowMap.type=HQ?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;scene.traverse(o=>{if(o.material&&o.material.isMaterial)o.material.needsUpdate=true;});
  for(const [a,e] of AG){scene.remove(e.g);e.g.traverse(o=>{if(o.geometry&&o.geometry!==BLOBGEO)o.geometry.dispose();});}AG.clear();curKey=null;toast(HQ?'畫質：高（圓潤造型）':'畫質：低（積木造型，比較順）');};}
window.addEventListener('keydown',e=>{if(e.key==='f'||e.key==='F'){if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;goUrgent();}});
// ---------- 音效（合成音，不用載檔案） ----------
let AC=null,mute=false;try{mute=localStorage.getItem('itduty_mute')==='1'}catch(e){}
const sndBtn=document.getElementById('snd');const sndUI=()=>{sndBtn.textContent=mute?'🔇':'🔊';sndBtn.setAttribute('aria-pressed',mute?'false':'true');};sndUI();
sndBtn.onclick=()=>{mute=!mute;try{localStorage.setItem('itduty_mute',mute?'1':'0')}catch(e){}sndUI();if(!mute)sfx('good');};
const wake=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}else if(AC.state==='suspended')AC.resume();};
window.addEventListener('pointerdown',wake,true);window.addEventListener('keydown',wake,true);
function tone(f,t0,dur,type,vol){const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;const t=AC.currentTime+t0;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.12,t+0.015);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+0.03);}
const SFX={ring:()=>{for(let r=0;r<2;r++)for(let i=0;i<6;i++)tone(i%2?1320:1040,r*0.55+i*0.06,0.06,'square',0.05);},alert:()=>{[0,0.18,0.36].forEach(t=>tone(880,t,0.11,'triangle',0.11));},
 good:()=>{tone(660,0,0.12);tone(880,0.1,0.12);tone(1320,0.2,0.2);},ok:()=>{tone(620,0,0.14);tone(620,0.16,0.16);},bad:()=>{tone(330,0,0.18,'sawtooth',0.07);tone(220,0.16,0.3,'sawtooth',0.07);},done:()=>{tone(784,0,0.09);tone(1175,0.08,0.16);}};
function sfx(n){if(mute||!AC||AC.state!=='running'||!SFX[n])return;try{SFX[n]()}catch(e){}}
window.sfx=sfx;
let _sfxT=0,_sfxS=null,_nRing=0,_nPrio=0,_nDone=0;
function tickSfx(now){if(now-_sfxT<400)return;_sfxT=now;const nr=ringing().length,np=S.tasks.filter(t=>t.kind==='prio'&&t.state!=='done'&&t.state!=='ringing'&&t.t<=S.time).length,nd=S.tasks.filter(t=>t.state==='done').length;
 if(_sfxS===S){if(nr>_nRing)sfx('ring');else if(np>_nPrio)sfx('alert');if(nd>_nDone)sfx('done');}_sfxS=S;_nRing=nr;_nPrio=np;_nDone=nd;}
// ---------- 搖桿（觸控裝置） ----------
{const joy=document.getElementById('joy'),knob=joy.firstElementChild;let jv=null,jt=0;if(TOUCH)joy.hidden=false;
 const set=e=>{const r=joy.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}knob.style.transform='translate('+(x*26)+'px,'+(y*26)+'px)';jv=m<0.25?null:{x,y};};
 joy.addEventListener('pointerdown',e=>{joy.setPointerCapture(e.pointerId);set(e);e.preventDefault();});joy.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')set(e);});
 const end=()=>{jv=null;knob.style.transform='';};joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end);
 setInterval(()=>{if(!jv||!S||S.over||S.paused)return;const P=S.player;if(moving(P)||P.phone||P.guide||P.transit||S.wc>0)return;
  const wx=Math.cos(yaw)*jv.x+Math.sin(yaw)*jv.y,wz=-Math.sin(yaw)*jv.x+Math.cos(yaw)*jv.y;const dx=Math.abs(wx)>=Math.abs(wz)?Math.sign(wx):0,dy=dx?0:Math.sign(wz);const nx=P.x+dx,ny=P.y+dy;
  if(walk(P.key,nx,ny)){if(P.busy)cancelBusy(P);S.view=null;P.steps=[{type:'walk',x:nx,y:ny}];nextStep(P);}},70);}
// ---------- 新手引導 ----------
const COACH=[[null,'歡迎來值班','電話和工單會一直進來，撐到下班為止。先花 20 秒看一下怎麼操作。'],
 ['#dkTasks','工單都在這裡','點「工單」看全部的單，按「處理」人就會自己走過去。紅色的是急件。'],
 ['#dkNext','不知道先做哪一張','按「帶路」會直接帶你去最急的那一張，地上的綠點就是路線。'],
 [null,'移動和視角',TOUCH?'點地板就會走過去，也可以用左下角的搖桿。單指拖曳轉視角，兩指縮放。':'點地板就會走過去，也可以用 WASD 或方向鍵。按住拖曳轉視角，滾輪縮放。走到工單旁邊按空白鍵處理，按 F 帶路。'],
 ['#status','顧好自己','記得吃飯、上廁所。餓太久或憋太久，做事會變慢。'],
 [null,'重點是怎麼處理','每張單都會問你要怎麼做。選完會告訴你對不對、為什麼，下班後還有一張檢討單。']];
let coI=-1,coWas=false;const coEl=document.getElementById('coach'),coHi=document.getElementById('coHi');
function coShow(){const c=COACH[coI];document.getElementById('coT').textContent=c[1];document.getElementById('coP').textContent=c[2];document.getElementById('coN').textContent=(coI+1)+'／'+COACH.length;document.getElementById('coNext').textContent=coI===COACH.length-1?'開始值班':'下一步';
 const el=c[0]&&document.querySelector(c[0]);if(el&&el.getClientRects().length){const r=el.getBoundingClientRect();coHi.hidden=false;coHi.style.cssText='left:'+(r.left-6)+'px;top:'+(r.top-6)+'px;width:'+(r.width+12)+'px;height:'+(r.height+12)+'px';}else coHi.hidden=true;}
function coStart(){if(!S||S.over||coI>=0)return;coWas=S.paused;S.paused=true;coI=0;coEl.hidden=false;coShow();}
function coEnd(){coEl.hidden=true;coI=-1;try{localStorage.setItem('itduty_coach','1')}catch(e){}if(S&&!coWas&&document.getElementById('dlg').hidden)S.paused=false;}
document.getElementById('coNext').onclick=()=>{if(++coI>=COACH.length)coEnd();else coShow();};document.getElementById('coSkip').onclick=coEnd;document.getElementById('help').onclick=coStart;
function maybeCoach(){if(navigator.webdriver)return;let seen=false;try{seen=localStorage.getItem('itduty_coach')==='1'}catch(e){}if(!seen)setTimeout(coStart,600);}
let _idleT=0;(function idle(){requestAnimationFrame(idle);if(!S||S.over||S.paused){if(!S)draw3d();else{const now=performance.now();if(now-_idleT<120&&!drag)return;_idleT=now;placeCam();tickLEDs(now);renderer.render(scene,camera);}}})();// 暫停／結算時降到約 8fps，拖曳鏡頭時照常
window.addEventListener('resize',resize);resize();
// ---------- 右下功能鍵與抽屜 ----------
const DR={dkTasks:'drTasks',dkBag:'drBag',dkMap:'drMap'};
function openDrawer(bid,toggle){const open=document.getElementById(DR[bid]).hidden;for(const b2 in DR){document.getElementById(DR[b2]).hidden=true;document.getElementById(b2).classList.remove('on');}if(open||!toggle){document.getElementById(DR[bid]).hidden=false;document.getElementById(bid).classList.add('on');}}
for(const bid in DR){document.getElementById(bid).onclick=()=>openDrawer(bid,true);}
document.getElementById('dkWC').onclick=()=>{if(!S)return;const P=S.player;if(P.transit||P.phone||P.guide){toast('現在走不開');return;}doWC();};
// 包包內容：由 updateUI 的資料每 0.5 秒刷一次
setInterval(()=>{if(!S)return;const open=visible().length,ring=ringing().length;const ob=document.getElementById('openBadge');ob.hidden=!(open+ring);ob.textContent=ring?'☎'+(open?' '+open:''):open;ob.className='badge'+(ring?' ring':visible().some(t=>t.kind==='prio')?' p':'');
 const items=[...S.carry.map(c=>({n:c.name,i:'☕',s:'想喝再喝'})),...S.inv.map(n=>({n,i:n.includes('乖乖')?'🍘':'🧻',s:'拿去機房放'})),...(S.food&&!S.lunchDone?[{n:S.food.name,i:'🍱',s:S.food.portable?'帶著':'現場吃'}]:[])];
 const bb=document.getElementById('bagBadge');bb.hidden=!items.length;bb.textContent=items.length;const row=document.getElementById('bagRow');const sig=items.map(x=>x.n).join('|');if(row._sig!==sig){row._sig=sig;row.innerHTML=items.length?items.map(x=>'<span class="it"><i>'+x.i+'</i>'+x.n+'<small>'+x.s+'</small></span>').join(''):'<span class="hint">空的。上班路上沒買東西，中午再去 B1 看看。</span>';}
 {const wb=document.getElementById('dkWC'),bd=document.getElementById('wcBadge');const onWC=!S.player.transit&&G(S.player.key)[S.player.y][S.player.x]===7;wb.className='big'+(S.bladder>=100?' crit':S.bladder>=70?' warn':'');wb.lastChild.nodeType===3&&0;wb.childNodes[1].textContent=S.wc>0?'廁所中':onWC?'上廁所':'廁所';bd.hidden=S.bladder<70;bd.textContent=Math.min(100,Math.round(S.bladder))+'%';bd.className='badge'+(S.bladder>=100?' p':'');}
 const n=document.getElementById('bodyBtns').children.length;const dk=document.getElementById('dkBag');if(S._bagN!==undefined&&n>S._bagN){dk.classList.remove('alert');void dk.offsetWidth;dk.classList.add('alert');}S._bagN=n;},500);
// 難度切換 → 外觀跟著變；打卡 → 進樓層
document.querySelectorAll('#diffSeg button').forEach(b=>b.addEventListener('click',()=>{extDiff=null;}));
const _go=document.getElementById('go').onclick;document.getElementById('go').onclick=()=>{_go();yaw=0.25;pitch=0.95;dist=innerWidth<innerHeight?22:16;if(S){camT.set(S.player.x+0.5,0,S.player.y+0.5);}if(innerWidth>=700){document.getElementById('drTasks').hidden=false;document.getElementById('dkTasks').classList.add('on');}};
})();

// ---------- 結算：列印檢討單、下載 CSV（給帶新人的學長用） ----------
(function(){const esc=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const ROLE={duty:'值班人員',spec:'專責工程師',mgr:'主任'},SHIFTN={day:'白班',eve:'小夜',night:'大夜',hol:'假日白班',office:'上班日',officeHol:'假日上班'};
 const clockOf=m=>{const t=((S.shift.start+Math.round(m))%1440+1440)%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
 const resOf=o=>o===1?['✓ 正確','ok']:o===2?['△ 可以但有後果','meh']:['✗ 不建議','bad'];
 function rows(){const D=(S.decisions||[]).map(d=>({...d}));const seen=new Set(D.map(d=>d.title+'|'+d.txt));
  (S.lessons||[]).forEach(l=>{const k=l.task.title+'|'+l.txt;if(seen.has(k))return;D.push({tm:l.task.answeredAt||l.task.t,room:locName(l.task.room),title:l.task.title,q:l.q,txt:l.txt,o:l.sev>=2?0:2,note:l.note,best:l.best,bestNote:l.bestNote});});
  return D.sort((a,b)=>a.tm-b.tm);}
 function sheet(){const D=rows(),P=S.player;const ok=D.filter(d=>d.o===1).length,meh=D.filter(d=>d.o===2).length,bad=D.filter(d=>d.o===0).length;const done=S.tasks.filter(t=>t.state==='done').length;
  const grade=(document.querySelector('#endBox .grade,#endBox [data-grade]')||{}).textContent||((document.getElementById('endBox').innerText.match(/^\s*([SABCD])\s*$/m)||[])[1]||'');
  const who=(typeof newbie!=='undefined'&&newbie)?'新人':ROLE[S.role]||S.role;const today=new Date().toLocaleDateString('zh-TW');
  return `<h1>資訊值班訓練檢討單</h1><div class="meta"><span>姓名：${esc(P.name==='你'?'＿＿＿＿＿＿':P.name)}</span><span>角色：${esc(who)}</span><span>班別：${esc(SHIFTN[S.shiftKeyUsed]||'')}</span><span>醫院規模：${esc(DIFF[diffKey].name)}</span><span>日期：${today}</span>${grade?`<span>評等：${esc(grade)}</span>`:''}</div>
  <div class="sum"><div><b>${done}/${S.tasks.length}</b>完成工單</div><div><b>${ok}</b>做法正確</div><div><b>${meh}</b>可以但有後果</div><div><b>${bad}</b>不建議的做法</div></div>
  <div class="sum"><div><b>${S.missed||0}</b>漏接電話</div><div><b>${(S.complaintsBoss||0)}</b>投訴到主任</div><div><b>${(S.complaintsCEO||0)}</b>投訴到院長</div><div><b>${(S.secViol||0)}</b>資安踩線</div></div>
  <table><tr><th style="width:7%">時間</th><th style="width:15%">單位／工單</th><th style="width:18%">當時的情況</th><th style="width:18%">選了</th><th style="width:9%">結果</th><th>應該怎麼做、為什麼</th></tr>
  ${D.map(d=>{const [rt,rc]=resOf(d.o);return `<tr><td>${clockOf(d.tm)}</td><td>${esc(d.room)}<br>${esc(d.title)}</td><td>${esc(d.q)}</td><td>${esc(d.txt)}<br><span style="color:#555">${esc(d.note)}</span></td><td class="${rc}">${rt}</td><td>${d.o===1?'—':esc(d.best)+'<br><span style="color:#555">'+esc(d.bestNote)+'</span>'}</td></tr>`;}).join('')||'<tr><td colspan="6">這班沒有做法選擇的紀錄。</td></tr>'}</table>
  <p style="font-size:9pt;color:#555;margin-top:6pt">討論建議：先看「✗」那幾題，問新人當下為什麼這樣選，再對照院內 SOP。答案是遊戲預設，請以院內規定為準。</p>
  <div class="sign"><div>新人簽名</div><div>帶訓人員簽名</div><div>日期</div></div>`;}
 function csv(){const D=rows();const q=x=>'"'+String(x==null?'':x).replace(/"/g,'""')+'"';const head=['時間','單位','工單','當時的情況','選了','說明','結果','應該怎麼做','原因'];
  return '﻿'+[head.map(q).join(',')].concat(D.map(d=>[clockOf(d.tm),d.room,d.title,d.q,d.txt,d.note,resOf(d.o)[0],d.o===1?'':d.best,d.o===1?'':d.bestNote].map(q).join(','))).join('\r\n');}
 setInterval(()=>{const end=document.getElementById('end');if(!S||end.hidden||document.getElementById('printBtn'))return;const row=document.querySelector('#endBox .row');if(!row)return;
  const pb=document.createElement('button');pb.id='printBtn';pb.textContent='列印檢討單';pb.onclick=()=>{document.getElementById('printSheet').innerHTML=sheet();setTimeout(()=>window.print(),50);};
  const day=new Date().toISOString().slice(0,10);
  const cb=document.createElement('button');cb.textContent='下載 CSV';cb.onclick=()=>offer('值班檢討_'+day+'.csv',csv(),'text/csv;charset=utf-8');
  const hb=document.createElement('button');hb.textContent='下載檢討單';hb.title='存成網頁檔，用瀏覽器打開就能列印';hb.onclick=()=>offer('值班檢討單_'+day+'.html',sheetDoc(),'text/html;charset=utf-8');
  row.appendChild(pb);row.appendChild(hb);row.appendChild(cb);},500);
 // 在 claude.ai 裡用平台的下載（會跳確認）；單獨開檔或放 GitHub 時用一般下載
 async function offer(filename,data,mime){let d=null;try{if(window.claude&&claude.use)d=await claude.use('downloads');}catch(e){}
  if(d){try{await d.save({filename,data});toast('已存檔：'+filename);}catch(e){if(e&&e.code==='declined')return;toast('這裡不能下載（'+((e&&e.code)||'unavailable')+'）');}return;}
  const blob=new Blob([data],{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);}
 function sheetDoc(){const css=[...document.styleSheets].map(ss=>{try{return [...ss.cssRules].map(r=>r.cssText).join('\n');}catch(e){return '';}}).join('\n');const pr=(css.match(/@media print[^]*?\}\s*\}/)||[''])[0].replace(/@media print\s*\{/,'').replace(/\}\s*$/,'');
  return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>資訊值班訓練檢討單</title><style>body{margin:16px;background:#fff;color:#000}'+pr.replace(/body>\*:not\(#printSheet\)\{display:none!important\}/,'')+'</style></head><body><div id="printSheet">'+sheet()+'</div><p style="font-size:10pt;color:#666" class="noprint">按 Ctrl+P 列印。</p></body></html>';}
 window.__sheet=sheet;window.__csv=csv;})();
