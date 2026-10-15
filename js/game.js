(async function(){'use strict';
const VERSION='2026.10.16-r1',W=1280,H=720;
const {Game,GROUND,FINISH,platformY}=SweetyCore;
const stage=document.querySelector('#stage'),canvas=document.querySelector('#world'),ctx=canvas.getContext('2d',{alpha:false});
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const storage={get(k,d){try{return localStorage.getItem(k)??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}};
let record=Number(storage.get('sweety_adv_record','0'))||0,hero='unicorn',screen='home',game=new Game(),ready=false,ending=false;
let clock=0,last=0,acc=0,particles=[],lastAnimation=-1;
const sound=new SweetyAudio(storage.get('sweety_sound','on')!=='off');
const poses={idle:4,run:6,jump:2,land:2,hurt:2,win:4},images={},files={};
for(const h of ['unicorn','dino'])for(const [pose,count] of Object.entries(poses))for(let n=0;n<count;n++){const k=h+'/'+pose+'-'+String(n).padStart(2,'0');files[k]='assets/characters/'+k+'.png'}
for(const n of ['realm','forest'])files[n]='assets/backgrounds/'+n+'.webp';
for(const n of ['pink-220','mint-220','mint-320'])files[n]='assets/platforms/'+n+'.png';
for(const n of ['star','candy'])files[n]='assets/collectibles/'+n+'.png';
for(const n of ['pudding','crystal'])files[n]='assets/enemies/'+n+'.png';
function resize(){const s=Math.min(innerWidth/W,innerHeight/H);stage.style.transform='scale('+s+')';stage.style.left=(innerWidth-W*s)/2+'px';stage.style.top=(innerHeight-H*s)/2+'px';const d=Math.min(devicePixelRatio||1,2);canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);if(innerHeight>innerWidth&&screen==='play')pause()}
addEventListener('resize',resize);resize();
function show(name){screen=name;all('.screen').forEach(e=>e.classList.toggle('active',e.id===name));$('#hud').classList.toggle('active',name==='play');if(name==='records')$('#record-value').textContent=record;updateSound()}
function updateSound(){all('[data-action=sound]').forEach(e=>{e.textContent='SON : '+(sound.enabled?'ON':'OFF');e.setAttribute('aria-pressed',String(sound.enabled))})}
function start(){game.reset();particles=[];ending=false;acc=0;last=performance.now();show('play');sound.unlock();try{if(document.fullscreenElement&&window.screen.orientation?.lock)window.screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}
function pause(){if(screen==='play'){game.paused=true;show('pause')}}
function resume(){game.paused=false;acc=0;last=performance.now();show('play')}
function jump(){if(screen==='play')game.jump()}
function action(a){if(!ready)return;sound.unlock();if(a==='sound'){sound.set(!sound.enabled);storage.set('sweety_sound',sound.enabled?'on':'off');updateSound()}else if(a==='start')start();else if(a==='pause')pause();else if(a==='resume')resume();else if(a==='jump')jump();else if(['home','select','tutorial','records'].includes(a)){game.paused=true;show(a)}}
all('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();action(b.dataset.action)}));
// Pointer and keyboard handlers share actions; pointerdown supports two fingers.
all('[data-action]').forEach(b=>b.addEventListener('click',e=>{if(e.detail===0)action(b.dataset.action)}));
all('[data-hero]').forEach(b=>{const choose=()=>{hero=b.dataset.hero;all('[data-hero]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)))};b.addEventListener('pointerdown',e=>{e.preventDefault();choose();sound.unlock()});b.addEventListener('click',e=>{if(e.detail===0)choose()})});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();sound.unlock();jump()});
addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)jump()}if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(screen==='play')pause();else if(screen==='pause')resume()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
function frameKey(h,pose,t){const rate={idle:3,run:11,jump:5,land:10,hurt:7,win:5}[pose];return h+'/'+pose+'-'+String(Math.floor(t*rate)%poses[pose]).padStart(2,'0')}
function sprite(h,pose,x,feet,size,t){const image=images[frameKey(h,pose,t)];if(image)ctx.drawImage(image,x-size/2,feet-size*240/256,size,size)}
function tile(key,cam,factor,y,height){const im=images[key];if(!im)return;const width=im.width*height/im.height,shift=cam*factor;let first=Math.floor(shift/width)-1;for(let i=first;i<first+5;i++){const x=i*width-shift;ctx.save();if(i%2){ctx.translate(x+width,y);ctx.scale(-1,1);ctx.drawImage(im,0,0,width,height)}else ctx.drawImage(im,x,y,width,height);ctx.restore()}}
function platform(x,y,w,moving=false){const k=w===320?'mint-320':moving?'mint-220':'pink-220';ctx.drawImage(images[k],x,y-3,w,112);if(moving){ctx.fillStyle='#f7f6bb';ctx.beginPath();ctx.arc(x+w/2,y+72,4,0,Math.PI*2);ctx.fill()}}
function scene(cam,active){ctx.fillStyle='#a5cafa';ctx.fillRect(0,0,W,H);tile('realm',cam,.08,-155,900);tile('forest',cam,.28,10,600);const wash=ctx.createLinearGradient(0,0,0,555);wash.addColorStop(0,'#fff5ef08');wash.addColorStop(1,'#fff5ef00');ctx.fillStyle=wash;ctx.fillRect(0,0,W,555);ctx.fillStyle='#8b4b43';ctx.fillRect(0,640,W,80);for(let i=Math.floor(cam/316)-1;i<Math.floor(cam/316)+6;i++)platform(i*316-cam,GROUND,320);if(active){for(const pl of game.platforms){const x=pl.x-cam;if(x>-240&&x<W+10)platform(x,platformY(pl,game.time),220,pl.moving)}}else{platform(130,535,220);platform(930,535,220)}}
function emit(e){if(e.type==='collect'||e.type==='jump'||e.type==='hurt'||e.type==='win'){const col=e.type==='hurt'?'#ff8bb2':e.kind==='star'?'#ffdc63':'#fff3ca';for(let i=0;i<(e.type==='hurt'?15:8);i++)particles.push({x:e.x,y:e.y,vx:(Math.random()-.5)*130,vy:-90-Math.random()*140,life:.5,c:col})}particles=particles.slice(-100)}
function consume(){for(const e of game.drain()){sound.effect(e.type,e.double??e.kind);emit(e)}if((game.mode==='win'||game.mode==='lose')&&!ending){ending=true;record=Math.max(record,game.score);storage.set('sweety_adv_record',record);$('#end-title').textContent=game.mode==='win'?'BRAVO, AVENTURIER !':'ESSAIE ENCORE !';$('#end-mascot').src=files[frameKey(hero,game.mode==='win'?'win':'hurt',clock)];$('#end-score').textContent=game.score;$('#end-record').textContent='★ RECORD : '+record;show('end')}}
function render(dt){const active=['play','pause','end'].includes(screen),cam=active?Math.max(0,game.p.x-300):0;scene(cam,active);if(active){for(const o of game.items){if(o.used||o.x<cam-70||o.x>cam+W+70)continue;const size=o.type==='star'?43:39;ctx.drawImage(images[o.type],o.x-cam-size/2,o.y-size/2,size,size)}for(const e of game.enemies){if(e.used||e.x<cam-80||e.x>cam+W+80)continue;const ex=e.x+(e.type==='pudding'?Math.sin(game.time*2)*12:0);ctx.drawImage(images[e.type],ex-cam-e.w/2-3,e.y-e.h-2,e.w+6,e.h+6)}for(const p of particles){if(screen==='play'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt}ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x-cam,p.y,3,0,Math.PI*2);ctx.fill()}particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;const pose=game.mode==='win'?'win':game.mode==='lose'||game.inv>1.4?'hurt':game.land>0?'land':!game.p.on?'jump':'run';if(game.inv<=0||Math.floor(game.time*12)%2===0||game.mode!=='play')sprite(hero,pose,game.p.x-cam,game.p.y,160,pose==='jump'?(game.p.vy<0?0:.2):pose==='land'?(.14-game.land):game.time);
 if(screen==='play'){$('#lives').textContent='♥'.repeat(game.lives)+'♡'.repeat(3-game.lives);$('#lives').setAttribute('aria-label',game.lives+' vies');$('#stars').textContent='★ '+game.stars;$('#score').textContent=game.score;$('#progress-fill').style.width=Math.min(100,game.p.x/FINISH*100)+'%';$('#combo').textContent=game.combo>1?'COMBO ×'+Math.min(10,game.combo):'';$('#hint').hidden=game.time>4}
 }
 const anim=Math.floor(clock*5);if(anim!==lastAnimation){lastAnimation=anim;all('[data-mascot]').forEach(e=>e.src=files[frameKey(e.dataset.mascot,'idle',clock)]);$('#end-mascot').src=files[frameKey(hero,game.mode==='win'?'win':'hurt',clock)]}
}
function loop(now){const dt=Math.min(.1,Math.max(0,(now-last)/1000));last=now;clock+=dt;if(ready){if(screen==='play'){acc+=dt;while(acc>=1/60){game.step(1/60);acc-=1/60}consume()}else acc=0;sound.music(screen==='play');render(dt)}requestAnimationFrame(loop)}
let loaded=0;try{await Promise.all(Object.entries(files).map(([key,path])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{if(!im.naturalWidth)return reject(Error(path));images[key]=im;$('#load-progress').value=++loaded/Object.keys(files).length;resolve()};im.onerror=()=>reject(Error(path));im.src='./'+path})));ready=true;$('#loading').classList.add('hidden');show('home');last=performance.now();requestAnimationFrame(loop)}catch(e){$('#load-label').textContent='Une image n’a pas pu charger. Vérifie la connexion.';$('#retry').hidden=false;$('#retry').onclick=()=>location.reload();console.error('Asset load failed',e)}
window.__sweetyStatus=()=>({version:VERSION,ready,loaded,total:Object.keys(files).length,screen,hero,score:game.score,lives:game.lives,stars:game.stars,record,sound:sound.enabled,x:game.p.x,y:game.p.y,jumps:game.p.jumps,on:game.p.on,paused:game.paused,time:game.time,mode:game.mode});
if(new URLSearchParams(location.search).has('test'))window.__sweetyTest={get game(){return game},step(n=1){for(let i=0;i<n&&screen==='play';i++){game.step(1/60);consume()}render(0)},render(){render(0)},start,show};
if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('./service-worker.js').catch(e=>console.warn('Offline cache unavailable',e));
})();
