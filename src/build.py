# 用法：python3 src/build.py
# 2D 原始檔是 src/game.html；3D 版 = head3d.html + game.html 的程式（經 patch_logic.py 調整）+ r3d.js，並內嵌 three.js 與字型
import re
import os,sys
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(HERE);os.chdir(HERE)
src=open('game.html',encoding='utf-8').read()
head=open('head3d.html',encoding='utf-8').read()
r3d=open('r3d.js',encoding='utf-8').read()
i=src.index('<script>')
body=src[i+len('<script>'):]
# 1. loop 改呼叫 draw3d
a="tickNPCs(dt);draw();updateUI();}"
assert body.count(a)==1; body=body.replace(a,"tickNPCs(dt);draw3d();updateUI();}")
# 2. 拿掉 2D canvas 的滑鼠事件
s=body.index("cv.addEventListener('mousemove'"); e=body.index("// handle 'pick' pseudo-step")
body=body[:s]+body[e:]
# 3. walk 看家具
a="const walk=(key,x,y)=>x>=0&&y>=0&&x<W&&y<H&&G(key)[y][x]!==1;"
assert body.count(a)==1
body=body.replace(a,"const walk=(key,x,y)=>x>=0&&y>=0&&x<W&&y<H&&G(key)[y][x]!==1&&!(window.BLK3&&(window.ensureBlk&&ensureBlk(key),BLK3[key])&&BLK3[key].has(y*W+x));")
# 4. 主任人力板在 3D 版放在工單抽屜；bagStat 文字保留
# 4b. 地圖放大
import sys;sys.path.insert(0,".");import patch_logic
body=patch_logic.patch(body)

# 4c. 廁所鍵獨立出來，不放包包
import re
m=re.search(r" if\(!onWC&&S\.wc<=0.*?BB\.appendChild\(b\);\}\n if\(onWC&&S\.wc<=0.*?BB\.appendChild\(b\);\}\n if\(S\.wc>0\)\{.*?BB\.appendChild\(b\);\}\n",body,re.S)
assert m, 'wc buttons not found'
body=body[:m.start()]+body[m.end():]
# 5. 接上 3D 層
assert body.rstrip().endswith('</script>')
body=body.rstrip()[:-len('</script>')]+"\n"+r3d+"\n</script>\n</body>\n</html>\n"
out=head+body

# 6. 打包：Three.js 與字型直接內嵌，院內電腦不用連外網
import base64
three=open('vendor/three-r128.min.js',encoding='utf-8').read()
font=base64.b64encode(open('vendor/press-start-2p-latin-400-normal.woff2','rb').read()).decode()
a='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap">'
assert out.count(a)==1
out=out.replace(a,"<style>@font-face{font-family:'Press Start 2P';font-style:normal;font-weight:400;font-display:swap;src:url(data:font/woff2;base64,"+font+") format('woff2')}</style>")
a='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
assert out.count(a)==1
out=out.replace(a,'<script>/* three.js r128 (MIT) 內嵌 */\n'+three+'\n</script>')
assert 'cdnjs' not in out and 'googleapis' not in out
# 7. 輸出：index.html（首頁）、game/index.html（3D）、2d/index.html（2D）、train/index.html（專業訓練）
H='<p class="hint">一班大概 15 到 30 分鐘。下面選一選，按「下一步」。</p>'
assert out.count(H)==1 and src.count(H)==1
for d in ('game','2d','train'): os.makedirs(os.path.join(ROOT,d),exist_ok=True)
open(os.path.join(ROOT,'game','index.html'),'w',encoding='utf-8').write(out.replace(H,H[:-4]+'電腦比較舊、跑不動的話，可以改玩 <a href="../2d/" style="color:var(--accent)">2D 版</a>。<a href="../" style="color:var(--accent)">回首頁</a></p>'))
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(open('landing.html',encoding='utf-8').read())
open(os.path.join(ROOT,'train','index.html'),'w',encoding='utf-8').write(open('train.html',encoding='utf-8').read())
open(os.path.join(ROOT,'2d','index.html'),'w',encoding='utf-8').write(open('head2d.html',encoding='utf-8').read()+src.replace(H,H[:-4]+'想看立體的醫院可以玩 <a href="../game/" style="color:var(--accent)">3D 版</a>。<a href="../" style="color:var(--accent)">回首頁</a></p>'))
# 選用：--plain 路徑，輸出不含 2D 連結的單檔 3D 版
if '--plain' in sys.argv: open(sys.argv[sys.argv.index('--plain')+1],'w',encoding='utf-8').write(out)
print('built',len(out))
