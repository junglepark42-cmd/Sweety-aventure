"""Original vector assets and PNG exports. No external artwork dependencies."""
from pathlib import Path
import cairosvg
ROOT=Path(__file__).resolve().parents[1]/'assets'
def save(folder,name,w,h,body):
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'
 p=ROOT/folder/(name+'.svg');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(svg)
 cairosvg.svg2png(bytestring=svg.encode(),write_to=str(p.with_suffix('.png')))

for color,light,dark,name in [('#ff86c6','#ffe0f2','#c6418a','pink'),('#80d876','#d5ffb4','#338b62','mint')]:
 for width in [220,320]:
  save('platforms',f'{name}-{width}',width,112,f'''<defs><linearGradient id="cake" x2="0" y2="1"><stop stop-color="#d28a52"/><stop offset="1" stop-color="#925334"/></linearGradient><linearGradient id="icing" x2="0" y2="1"><stop stop-color="{light}"/><stop offset=".5" stop-color="{color}"/><stop offset="1" stop-color="{dark}"/></linearGradient></defs>
  <rect x="3" y="15" width="{width-6}" height="93" rx="18" fill="url(#cake)" stroke="#64364d" stroke-width="5"/>
  <path d="M 8 63 H {width-8}" stroke="#fff0ba" stroke-width="13"/>
  <path d="M 8 76 H {width-8}" stroke="#e2ad6b" stroke-width="6"/>
  <path d="M 17 3 H {width-17} Q {width-3} 3 {width-3} 17 V 32 Q {width-14} 43 {width-25} 33 Q {width-36} 29 {width-40} 46 Q {width-48} 60 {width-59} 43 Q {width-68} 27 {width-79} 38 H 80 Q 67 26 59 44 Q 48 61 38 43 Q 30 28 20 35 Q 3 42 3 25 V 17 Q 3 3 17 3 Z" fill="url(#icing)" stroke="{dark}" stroke-width="4"/>
  <path d="M 18 12 H {width-18}" stroke="{light}" stroke-width="5" stroke-linecap="round"/>
  {''.join(f'<path d="M{x} 22 l7 -3" stroke="{c}" stroke-width="4" stroke-linecap="round"/>' for x,c in zip(range(22,width-10,26),['#fff4b8','#a265d8','#fff4b8','#ffda67']*4))}
  {''.join(f'<ellipse cx="{x}" cy="94" rx="5" ry="3" fill="#edb979"/>' for x in range(20,width-10,34))}''')
save('collectibles','star',80,80,'<path d="M40 5 51 27 76 31 58 49 62 75 40 63 17 75 22 49 4 31 29 27Z" fill="#ffd85e" stroke="#dc8b38" stroke-width="5" stroke-linejoin="round"/><path d="M38 17 32 34 16 37" fill="none" stroke="#fff6c1" stroke-width="5" stroke-linecap="round"/>')
save('collectibles','candy',80,70,'<path d="M21 19 3 10 8 34 3 59 24 49 M58 19 77 10 72 34 77 59 56 49" fill="#f890ca" stroke="#b7549d" stroke-width="4"/><circle cx="40" cy="34" r="25" fill="#ff8fbe" stroke="#fff2d8" stroke-width="4"/><path d="M40 34c-12-14 16-14 15 0-1 25-40 15-31-7 5-13 22-15 31-4" fill="none" stroke="#fff0ed" stroke-width="5" stroke-linecap="round"/>')
save('enemies','pudding',80,70,'<path d="M9 55C8 34 13 16 28 12L31 5H49L53 13C68 18 72 39 71 55Q65 65 40 65T9 55Z" fill="#ad6755" stroke="#60374a" stroke-width="4"/><path d="M17 23Q17 13 29 13H51Q64 15 64 25Q57 35 50 26Q40 40 31 26Q23 35 17 23Z" fill="#ff9cc8" stroke="#fff2c5" stroke-width="3"/><ellipse cx="28" cy="44" rx="4" ry="6" fill="#432b47"/><ellipse cx="52" cy="44" rx="4" ry="6" fill="#432b47"/><path d="M34 55Q40 60 46 55" fill="none" stroke="#432b47" stroke-width="3"/>')
save('enemies','crystal',80,80,'<path d="M8 69 18 30 29 43 43 9 60 42 69 30 76 70Z" fill="#ae75e7" stroke="#654384" stroke-width="4" stroke-linejoin="round"/><path d="M43 9 45 68 29 43 M60 42 45 68 69 30 M18 30 25 68" fill="none" stroke="#efd3ff" stroke-width="3"/>')
print('Exported original platforms, collectibles and enemies')
