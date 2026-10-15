/* Original procedural score and effects, no recordings or third-party music. */
(function(){'use strict';
class SweetyAudio{
 constructor(enabled){this.enabled=enabled;this.ctx=null;this.next=0;this.note=0}
 unlock(){if(!this.enabled)return;try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){}}
 tone(f,d=.12,volume=.055,shape='sine',delay=0){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=shape;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+d+.01)}
 effect(type,kind){if(type==='jump')this.tone(kind?880:587,.16,.055,'triangle');if(type==='land')this.tone(180,.08,.025);if(type==='collect'){this.tone(kind==='star'?1046:784,.12,.05);this.tone(kind==='star'?1568:1046,.1,.035,'sine',.07)}if(type==='hurt'){this.tone(155,.24,.07,'triangle');this.tone(116,.24,.045,'triangle',.08)}if(type==='win')[523,659,784,1046].forEach((f,i)=>this.tone(f,.32,.065,'triangle',i*.13));if(type==='lose')[392,330,262].forEach((f,i)=>this.tone(f,.3,.055,'triangle',i*.18))}
 music(active){if(!active||!this.enabled||!this.ctx)return;const t=this.ctx.currentTime;if(t<this.next)return;this.next=t+.3;const tune=[523,659,784,659,587,698,880,698,659,784,1046,784,587,698,784,0];const f=tune[this.note++%tune.length];if(f)this.tone(f,.23,.014,'sine');if(this.note%4===0)this.tone([131,147,165,147][Math.floor(this.note/4)%4],.45,.018,'triangle')}
 set(enabled){this.enabled=enabled;if(!enabled&&this.ctx)this.ctx.suspend();else this.unlock()}
}
window.SweetyAudio=SweetyAudio;
})();
