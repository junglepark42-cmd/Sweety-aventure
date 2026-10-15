from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
hero=Image.open(root/'assets/characters/unicorn/idle-00.png')
for size in [192,512]:
 im=Image.new('RGBA',(size,size),'#442364');h=hero.resize((round(size*.85),round(size*.85)),Image.Resampling.LANCZOS);im.alpha_composite(h,((size-h.width)//2,(size-h.height)//2));im.convert('RGB').save(root/f'assets/interface/icon-{size}.png',optimize=True)
manifest={'name':'Sweety Adventure — La Forêt des Bonbons','short_name':'Sweety','id':'./','start_url':'./','scope':'./','display':'fullscreen','orientation':'landscape','background_color':'#38204f','theme_color':'#38204f','lang':'fr','description':'Une aventure gourmande avec la licorne et le dinosaure Sweety.','icons':[{'src':f'./assets/interface/icon-{s}.png','sizes':f'{s}x{s}','type':'image/png','purpose':'any'} for s in [192,512]]}
(root/'manifest.webmanifest').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
files=['index.html','css/game.css','js/core.js','js/audio.js','js/game.js','manifest.webmanifest']+[str(p.relative_to(root)) for p in sorted((root/'assets').rglob('*')) if p.suffix in ['.png','.webp']]
version=hashlib.sha256(b''.join((root/p).read_bytes() for p in files)).hexdigest()[:16]
sw="""/* Atomic, local-only offline app shell. */
const CACHE='sweety-__VERSION__';
const FILES=__FILES__;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sweety-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const key=event.request.mode==='navigate'?new URL('./index.html',self.registration.scope).href:event.request;
  const hit=await cache.match(key);return hit||fetch(event.request);
 }));
});
""".replace('__VERSION__',version).replace('__FILES__',json.dumps(['./']+['./'+p for p in files]))
(root/'service-worker.js').write_text(sw)
(root/'assets/runtime-files.json').write_text(json.dumps(files,indent=2)+'\n')
print('Cache',version,'files',len(files),'bytes',sum((root/p).stat().st_size for p in files))
