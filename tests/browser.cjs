const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{createServer}=require('./server.cjs');
const out=path.resolve(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port+'/Sweety-aventure/?test=1';
 const opts={headless:true,args:['--no-sandbox']};if(process.env.SWEETY_BROWSER){opts.executablePath=process.env.SWEETY_BROWSER;opts.args.push('--no-zygote','--single-process')}
 const browser=await chromium.launch(opts),context=await browser.newContext({viewport:{width:1280,height:720},hasTouch:true});
 const page=await context.newPage(),errors=[],bad=[],passed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url()+':'+r.status())});
 const status=()=>page.evaluate(()=>__sweetyStatus());
 const check=async(name,fn)=>{await fn();passed.push(name);console.log('PASS',name)};
 const shot=name=>page.screenshot({path:path.join(out,name+'.png')});
 async function boot(){await page.goto(url);await page.waitForFunction(()=>window.__sweetyStatus?.().ready)}
 async function start(){await page.locator('#home [data-action=select]').tap();await page.locator('#select [data-action=tutorial]').tap();await page.locator('#tutorial [data-action=start]').tap()}
 try{
 await boot();
 await check('all 49 game images load; all menu character images are complete',async()=>{const s=await status();assert.equal(s.loaded,49);assert.equal(s.total,49);await page.waitForFunction(()=>[...document.querySelectorAll('#home img')].every(i=>i.complete&&i.naturalWidth));assert.equal(s.screen,'home')});await shot('01-home');
 await check('sound toggle persists across reload',async()=>{await page.locator('#home [data-action=sound]').tap();assert.equal((await status()).sound,false);await boot();assert.equal((await status()).sound,false)});
 await check('records button and return',async()=>{await page.locator('#home [data-action=records]').tap();assert.equal((await status()).screen,'records');await page.locator('#records [data-action=home]').tap()});
 await page.locator('#home [data-action=select]').tap();await page.locator('[data-hero=dino]').tap();assert.equal((await status()).hero,'dino');await shot('02-select');await page.locator('#select [data-action=tutorial]').tap();await shot('03-tutorial');await page.locator('#tutorial [data-action=start]').tap();
 await check('touch jump, double jump, third jump rejected',async()=>{await page.locator('[data-action=jump]').tap();assert.equal((await status()).jumps,1);await page.locator('[data-action=jump]').tap();assert.equal((await status()).jumps,2);await page.locator('[data-action=jump]').tap();assert.equal((await status()).jumps,2)});await shot('04-double-jump');
 await check('pause freezes x, y and platform time, resume works',async()=>{await page.locator('[data-action=pause]').tap();const a=await status();await page.waitForTimeout(350);const b=await status();assert.equal(b.time,a.time);assert.equal(b.x,a.x);assert.equal(b.y,a.y);await shot('05-pause');await page.locator('[data-action=resume]').tap();await page.waitForTimeout(100);assert((await status()).time>a.time)});
 await page.evaluate(()=>__sweetyTest.start());
 await check('full original level completes with three lives and collected stars',async()=>{
  const result=await page.evaluate(()=>{const t=__sweetyTest,g=t.game;for(let i=0;i<3200&&g.mode==='play';i++){const e=g.enemies.find(e=>!e.used&&e.x>g.p.x-40);if(e&&e.x-g.p.x<100&&g.p.on)g.jump();t.step()}return __sweetyStatus()});assert.equal(result.mode,'win');assert.equal(result.lives,3);assert(result.stars>0);assert(result.score>1000);assert.equal(result.record,result.score);assert((await page.locator('#end-mascot').getAttribute('src')).includes('/win-'));console.log('Completion',JSON.stringify(result));
 });await shot('06-victory');
 const best=(await status()).record;await boot();await page.locator('#home [data-action=records]').tap();assert.equal(Number(await page.locator('#record-value').innerText()),best);passed.push('best score persists across reload');await page.locator('#records [data-action=home]').tap();await start();
 await check('three collisions cause defeat',async()=>{await page.evaluate(()=>__sweetyTest.step(3200));assert.equal((await status()).mode,'lose');assert.equal((await status()).lives,0);assert.equal((await status()).record,best)});await shot('07-defeat');
 await page.locator('#end [data-action=start]').tap();await page.evaluate(()=>__sweetyTest.step(350));await shot('08-level');
 await check('keyboard Space jumps',async()=>{await page.evaluate(()=>__sweetyTest.start());await page.keyboard.press('Space');assert.equal((await status()).jumps,1)});
 await check('two simultaneous touch points trigger a double jump',async()=>{await page.evaluate(()=>__sweetyTest.start());const session=await context.newCDPSession(page);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:500,y:400,id:1},{x:1140,y:600,id:2}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await status()).jumps,2);await session.detach()});
 await page.locator('[data-action=pause]').tap();await page.locator('#pause [data-action=home]').tap();
 await check('landscape layouts remain in viewport at 844x390, 1024x600 and 1920x1080',async()=>{for(const [width,height]of [[844,390],[1024,600],[1920,1080]]){await page.setViewportSize({width,height});await page.waitForTimeout(80);const valid=await page.locator('#home button').evaluateAll(bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.width>=44&&r.height>=44}));assert(valid,width+'x'+height);await shot('09-landscape-'+width)}});
 await check('portrait rotation prompt appears',async()=>{await page.setViewportSize({width:390,height:844});assert(await page.locator('#rotate').isVisible());await shot('10-portrait')});
 await page.setViewportSize({width:1280,height:720});
 await check('service worker installs all resources and the game reopens offline',async()=>{await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller&&__sweetyStatus?.().ready);const count=await page.evaluate(async()=>{const keys=await caches.keys();const cache=await caches.open(keys.find(k=>k.startsWith('sweety-')));return(await cache.keys()).length});assert(count>=58);await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.__sweetyStatus?.().ready);assert.equal((await status()).loaded,49);await start();await page.locator('[data-action=jump]').tap();assert.equal((await status()).jumps,1);await shot('11-offline');await context.setOffline(false)});
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);passed.push('no browser exceptions or HTTP errors');
 fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify({browser:await browser.version(),androidDeviceTested:false,passed,errors,bad},null,2));console.log('PASS',passed.length,'browser checks');
 }catch(e){await shot('FAILURE');throw e}finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
