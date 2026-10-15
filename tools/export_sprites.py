"""Export isolated connected character silhouettes, never guessed grid crops.
Usage: python tools/export_sprites.py SOURCE DESTINATION
The source is an original transparent production atlas, not a poster.
"""
import sys, json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

source, dest = Path(sys.argv[1]), Path(sys.argv[2])
im = Image.open(source).convert('RGBA')
pixels = np.array(im)
alpha = pixels[:, :, 3]
labels, _ = ndimage.label(alpha > 40)
sizes = np.bincount(labels.ravel())
ids = [i for i, size in enumerate(sizes) if i and size > 1500]
assert len(ids) == 20, f'Expected 20 complete silhouettes, found {len(ids)}'
objects=[]
for label in ids:
    yy, xx = np.where(labels == label)
    box=(int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1))
    assert box[0] > 1 and box[1] > 1 and box[2] < im.width-1 and box[3] < im.height-1, 'Source silhouette touches image edge'
    objects.append((label, box, (box[1]+box[3])/2))
objects.sort(key=lambda o:o[2])
ordered=[]
for row in range(4): ordered.extend(sorted(objects[row*5:row*5+5],key=lambda o:o[1][0]))
scale = min(224/max(o[1][2]-o[1][0] for o in ordered),224/max(o[1][3]-o[1][1] for o in ordered))
poses=[('idle',4),('run',6),('jump',2),('land',2),('hurt',2),('win',4)]
names=[f'{pose}-{i:02}' for pose,n in poses for i in range(n)]
dest.mkdir(parents=True,exist_ok=True)
report=[]
for name,(label,box,_) in zip(names,ordered):
    # Keep original alpha around the main silhouette; remove detached noise.
    mask=ndimage.binary_dilation(labels==label,iterations=2)
    clean=pixels.copy();clean[:,:,3]=np.where(mask,alpha,0)
    x0,y0,x1,y1=box
    frame=Image.fromarray(clean).crop((x0-2,y0-2,x1+2,y1+2))
    frame=frame.resize((round(frame.width*scale),round(frame.height*scale)),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',(256,256))
    out.alpha_composite(frame,((256-frame.width)//2,240-frame.height))
    target=dest/(name+'.png');out.save(target,optimize=True)
    report.append({'file':target.name,'source_bounds':box,'anchor':[128,240],'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
(dest/'frames.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'Exported {len(report)} distinct frames to {dest}')
