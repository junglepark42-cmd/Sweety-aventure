from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]
count=0
for hero in ['unicorn','dino']:
 hashes=set()
 for pose,n in {'idle':4,'run':6,'jump':2,'land':2,'hurt':2,'win':4}.items():
  for i in range(n):
   p=root/f'assets/characters/{hero}/{pose}-{i:02}.png';im=Image.open(p);assert im.mode=='RGBA',p
   assert im.size==(256,256),p
   box=im.getchannel('A').getbbox();assert box and min(box[:2])>=8 and max(box[2:])<=248,(p,box)
   assert im.getpixel((0,0))[3]==0,p
   hashes.add(hashlib.sha256(im.tobytes()).hexdigest());count+=1
 assert len(hashes)==20,hero
for p in (root/'assets').rglob('*.png'):
 im=Image.open(p);im.verify()
 if p.parent.name in ['platforms','collectibles','enemies']:
  im=Image.open(p);assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255),p
for f in json.loads((root/'assets/runtime-files.json').read_text()): assert (root/f).is_file(),f
print(f'PASS: {count} distinct, padded RGBA character frames; all runtime resources present; objects have real alpha.')
