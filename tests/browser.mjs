import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
const root=process.cwd();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.ogg':'audio/ogg'};
const server=http.createServer(async(req,res)=>{
  try{
    const uri=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+(uri.pathname==='/'?'/index.html':uri.pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
    const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
  }catch{res.writeHead(404);res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  await fs.mkdir('browser-artifacts',{recursive:true});
  for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
    const page=await browser.newPage({viewport,deviceScaleFactor:1,isMobile:name==='mobile',hasTouch:name==='mobile'});
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
    await page.waitForFunction(()=>window.TBH?.S?.party?.length>0&&document.querySelector('#zoneName').textContent==='Город Рассвета');
    await page.evaluate(()=>{window.TBH.ui.setPaused(true);window.TBH.audio.setMuted(true)});
    await page.locator('#mapBtn').click();
    await page.locator('.mapNode').first().waitFor({state:'visible'});
    assert.equal(await page.locator('.mapNode').count(),20);
    assert.equal(await page.locator('.mapNode .zoneArt').count(),20);
    assert.match(await page.locator('.mapNode').last().innerText(),/Замок владыки демонов/);
    assert.equal(await page.locator('.mapStage.boss').count(),40);
    await page.screenshot({path:'browser-artifacts/'+name+'-map.png'});
    await page.locator('#modal .ghostBtn').click();
    const logo=await page.locator('.logoImg').evaluate(e=>({fit:getComputedStyle(e).objectFit,loaded:e.complete&&e.naturalWidth>0}));
    assert.equal(logo.fit,'contain');assert.ok(logo.loaded);
    const result=await page.evaluate(async()=>{
      const T=window.TBH,C=T.config;
      const srcs=[...C.levels.flatMap(z=>[z.bg.src,z.iconArt]),...C.levels.flatMap(z=>[...z.monsters,...Object.values(z.bosses)].map(id=>C.monsters[id].sprite.src)),...['bow','dagger','mace','fists','wand','sickle','robe','coat'].map(a=>'assets/items/'+a+'.webp')];
      const broken=(await Promise.all(srcs.map(async src=>{const image=new Image();image.src=src;try{await image.decode();return image.naturalWidth>0?null:src}catch{return src}}))).filter(Boolean);
      const S=T.S;S.heroes.rogue.rec=true;S.heroes.rogue.lvl=10;S.party=['rogue'];
      const make=(id,defId,ilvl)=>({uid:id,defId,slot:'weapon',rarity:'common',ilvl,stats:{dmgPct:12},value:25});
      S.inventory=[make('test-axe','war_axe',1),make('test-high','shadow_dagger',20),make('test-dagger','shadow_dagger',10)];
      T.events.emit('heroes');T.events.emit('party');T.events.emit('inv');
      return {broken,classes:T.items.equip('test-axe','rogue'),high:T.items.equip('test-high','rogue'),width:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    assert.deepEqual(result.broken,[],'Every campaign image must decode in the browser');
    const invalidGearArt=await page.evaluate(async()=>{
      const names=['sword','axe','staff','blade','vest','mail','shield','plate','coin','fang','feather','seal','bow','dagger','mace','fists','wand','sickle','robe','coat'];
      return (await Promise.all(names.map(async name=>{const image=new Image();image.src='assets/items/'+name+'.webp?v=50';await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const w=canvas.width,h=canvas.height,rgba=ctx.getImageData(0,0,w,h).data;const corners=[3,(w-1)*4+3,(h-1)*w*4+3,(w*h-1)*4+3];let opaque=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i]>200)opaque++;return w!==256||h!==256||corners.some(i=>rgba[i]!==0)||opaque<w*h*.05?name:null;}))).filter(Boolean);
    });
    assert.deepEqual(invalidGearArt,[],'All 20 standard item images must have transparent corners and visible artwork at 256x256');
    assert.equal(result.classes,false);assert.equal(result.high,false);
    assert.ok(result.width<=result.viewport+1,'Page must not overflow horizontally');
    await page.locator('.mobileTabs [data-tab="bag"]').click();
    const axe=page.locator('.itemCard[data-uid="test-axe"]'),high=page.locator('.itemCard[data-uid="test-high"]'),dagger=page.locator('.itemCard[data-uid="test-dagger"]');
    await dagger.waitFor({state:'visible'});
    assert.equal(await axe.locator('option[value="rogue"]').count(),0,'Rogue must not appear in axe recipient list');
    assert.ok(await axe.locator('option[value="paladin"]').count(),'Eligible reserve paladin can still equip axe');
    assert.ok(await high.locator('.equipBtn').isDisabled());
    assert.ok(await dagger.locator('.equipBtn').isEnabled());
    await page.screenshot({path:'browser-artifacts/'+name+'-gear.png'});
    await dagger.locator('.equipBtn').click();
    assert.equal(await page.evaluate(()=>window.TBH.S.heroes.rogue.equip.weapon),'test-dagger');
    await page.locator('.mobileTabs [data-tab="camp"]').click();
    const picker=page.locator('#divineLevel');
    await picker.waitFor({state:'visible'});
    const menuStyle=await picker.evaluate(e=>{const normal=Array.from(e.options).find(o=>!o.selected),selected=e.options[e.selectedIndex];return {scheme:getComputedStyle(e).colorScheme,bg:getComputedStyle(normal).backgroundColor,fg:getComputedStyle(normal).color,selectedBg:getComputedStyle(selected).backgroundColor}});
    assert.equal(menuStyle.scheme,'dark');assert.equal(menuStyle.bg,'rgb(33, 24, 46)');assert.equal(menuStyle.fg,'rgb(255, 231, 185)');assert.equal(menuStyle.selectedBg,'rgb(68, 48, 94)');
    await picker.selectOption('80');
    assert.match(await page.locator('#divineInfo').innerText(),/80/);
    assert.match(await page.locator('#divineBuy').innerText(),/17/);
    const artLoaded=await page.evaluate(async()=>{const i=new Image();i.src='assets/ui/relic-sanctuary.svg';await i.decode();return i.naturalWidth>0});
    assert.ok(artLoaded,'Relic sanctuary art must load');
    await picker.scrollIntoViewIfNeeded();
    await page.screenshot({path:'browser-artifacts/'+name+'-relic-shop.png'});
    assert.deepEqual(errors,[],'Browser runtime errors: '+errors.join('; '));
    await page.close();
  }
  console.log('Desktop and mobile Chrome: map, class gear, logo, all campaign graphics decoded, no runtime errors.');
}finally{await browser?.close();await new Promise(r=>server.close(r))}
