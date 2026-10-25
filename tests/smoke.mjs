import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base='http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true});
let failures=0;
await mkdir('test-results',{recursive:true});
for(const viewport of [{width:390,height:844},{width:360,height:800},{width:1280,height:720},{width:768,height:1024}]){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/motion/',{waitUntil:'load'});
  await page.getByRole('button',{name:'ESSAYER AU DOIGT'}).click();
  await page.waitForTimeout(500);
  const hud=await page.locator('#hud').isVisible();
  const canvas=await page.locator('#game').boundingBox();
  if(!hud||!canvas||canvas.width<viewport.width-1)throw Error('Game layout or HUD unavailable');
  await page.mouse.move(viewport.width/2,viewport.height/2);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.screenshot({path:'test-results/game-'+viewport.width+'.png'});
  await page.getByRole('button',{name:'QUITTER'}).click();
  if(!(await page.getByRole('button',{name:'ESSAYER AU DOIGT'}).isVisible()))throw Error('Return to menu failed');
  if(errors.length)throw Error('JS exceptions: '+errors.join('; '));
  console.log('PASS '+viewport.width+'x'+viewport.height);
 }catch(e){failures++;console.error('FAIL '+viewport.width+'x'+viewport.height,e.message)}
 finally{await page.close()}
}
await browser.close();
if(failures)process.exit(1);
