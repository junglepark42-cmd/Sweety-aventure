import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
let failures=0;
for(const viewport of [{width:360,height:800},{width:390,height:844},{width:768,height:1024},{width:1280,height:720}]){
 const page=await browser.newPage({viewport});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
  await page.getByRole('button',{name:/JOUER AU DOIGT/}).click();
  await page.waitForTimeout(1200);
  if(!(await page.locator('#top').isVisible()))throw Error('Game HUD hidden');
  if(!(await page.locator('#game').isVisible()))throw Error('Canvas hidden');
  if(!(await page.locator('#score').textContent()).includes('0'))throw Error('Score missing');
  await page.screenshot({path:'test-results/touch-'+viewport.width+'.png'});
  await page.locator('#pause').click();
  await page.getByRole('button',{name:/REPRENDRE/}).click();
  if(!(await page.locator('#top').isVisible()))throw Error('Resume failed');
  await page.locator('#pause').click();
  await page.getByRole('button',{name:/ACCUEIL/}).click();
  if(!(await page.getByRole('button',{name:/JOUER AU DOIGT/}).isVisible()))throw Error('Menu return failed');
  if(errors.length)throw Error('JS exceptions: '+errors.join('; '));
  console.log('PASS touch',viewport.width,viewport.height);
 }catch(e){failures++;console.error('FAIL touch',viewport,e.message)}
 await page.close();
}
const cameraPage=await browser.newPage({permissions:[]});
try{
 await cameraPage.goto('http://127.0.0.1:8765/');
 await cameraPage.getByRole('button',{name:/JOUER AVEC LA CAMÉRA/}).click();
 await cameraPage.getByRole('button',{name:/CONTINUER AU DOIGT/}).waitFor({timeout:12000});
 await cameraPage.getByRole('button',{name:/CONTINUER AU DOIGT/}).click();
 if(!(await cameraPage.locator('#top').isVisible()))throw Error('Camera fallback not playable');
 console.log('PASS camera permission denied fallback');
}catch(e){failures++;console.error('FAIL camera fallback',e.message)}
await cameraPage.close();await browser.close();if(failures)process.exit(1);
