/* Deterministic simulation. Rendering, input and audio are separate. */
(function(root){
'use strict';
const GROUND=555, FINISH=10000, SPEED=210, GRAVITY=1550;
function level(){
 const platforms=[],items=[],enemies=[];
 // A gentle introduction, then regular, well-spaced challenges.
 for(let i=0;i<12;i++){
  const x=850+i*740,y=GROUND-(i%3===2?170:130);
  platforms.push({x,y,w:220,moving:i>2&&i%2===1,phase:i*.8});
  for(let j=0;j<3;j++) items.push({x:x+45+j*65,y:y-40,type:'star',used:false});
 }
 for(let x=420;x<FINISH-180;x+=135)items.push({x,y:GROUND-65-(Math.floor(x/540)%2)*65,type:'candy',used:false});
 for(let i=0;i<10;i++)enemies.push({x:1550+i*780,y:GROUND,w:42,h:45,type:i%3===2?'crystal':'pudding',used:false});
 return {platforms,items,enemies};
}
function platformY(pl,t){return pl.y+(pl.moving?Math.sin(t*1.6+pl.phase)*25:0)}
class Game{
 constructor(){this.reset()}
 reset(){Object.assign(this,level());this.p={x:130,y:GROUND,vy:0,jumps:0,on:true,support:-1};this.time=0;this.score=0;this.stars=0;this.combo=0;this.comboTime=0;this.lives=3;this.inv=0;this.land=0;this.mode='play';this.paused=false;this.events=[];this.jumpBuffer=0;this.coyote=.1;return this}
 jump(){if(this.mode!=='play'||this.paused)return false;const p=this.p;if(p.jumps>=2){this.jumpBuffer=.1;return false}p.vy=p.jumps===0?-760:-700;p.jumps++;p.on=false;p.support=-1;this.land=0;this.events.push({type:'jump',double:p.jumps===2,x:p.x,y:p.y});return true}
 hit(x){if(this.inv>0||this.mode!=='play')return false;this.lives--;this.inv=1.8;this.combo=0;this.events.push({type:'hurt',x,y:this.p.y-40});if(this.lives===0)this.end(false);return true}
 end(win){if(this.mode!=='play')return;this.mode=win?'win':'lose';if(win)this.score+=this.lives*350;this.events.push({type:this.mode,x:this.p.x,y:this.p.y-40})}
 step(dt){
  if(this.mode!=='play'||this.paused)return;
  if(dt>1/60+.00001)throw new Error('Use fixed steps of at most 1/60 second');
  const p=this.p,oldT=this.time,wasOn=p.on;
  this.time+=dt;this.inv=Math.max(0,this.inv-dt);this.land=Math.max(0,this.land-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
  this.comboTime=Math.max(0,this.comboTime-dt);if(!this.comboTime)this.combo=0;
  if(p.on&&p.support>=0){const pl=this.platforms[p.support];p.y+=platformY(pl,this.time)-platformY(pl,oldT)}
  const oldY=p.y; p.x+=SPEED*dt;p.vy+=GRAVITY*dt;p.y+=p.vy*dt;p.on=false;p.support=-1;
  let surface=GROUND,support=-1;
  if(p.vy>=0){for(let i=0;i<this.platforms.length;i++){
   const pl=this.platforms[i],yy=platformY(pl,this.time),prev=platformY(pl,oldT);
   if(p.x+22>pl.x&&p.x-22<pl.x+pl.w&&oldY<=Math.max(yy,prev)+2&&p.y>=yy&&yy<surface){surface=yy;support=i}
  }
  if(p.y>=surface){p.y=surface;p.vy=0;p.jumps=0;p.on=true;p.support=support;if(!wasOn){this.land=.14;this.events.push({type:'land',x:p.x,y:p.y})}}
  }
  if(p.on){this.coyote=.1;if(this.jumpBuffer>0){this.jumpBuffer=0;this.jump()}}else{this.coyote=Math.max(0,this.coyote-dt);if(!this.coyote&&p.jumps===0)p.jumps=1}
  const body={l:p.x-22,r:p.x+22,t:p.y-80,b:p.y-3};
  for(const o of this.items){if(o.used)continue;const dx=o.x-Math.max(body.l,Math.min(o.x,body.r)),dy=o.y-Math.max(body.t,Math.min(o.y,body.b));if(dx*dx+dy*dy<22*22){o.used=true;this.combo++;this.comboTime=3;this.score+=(o.type==='star'?100:25)+Math.min(10,this.combo)*5;if(o.type==='star')this.stars++;this.events.push({type:'collect',kind:o.type,x:o.x,y:o.y})}}
  for(const e of this.enemies){if(e.used)continue;const ex=e.x+(e.type==='pudding'?Math.sin(this.time*2)*12:0);if(body.r>ex-e.w/2&&body.l<ex+e.w/2&&body.b>e.y-e.h&&body.t<e.y){if(this.hit(ex))e.used=true}}
  if(this.mode==='play'&&p.x>=FINISH)this.end(true);
 }
 drain(){return this.events.splice(0)}
}
const api={Game,GROUND,FINISH,SPEED,platformY};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SweetyCore=api;
})(typeof window==='undefined'?globalThis:window);
