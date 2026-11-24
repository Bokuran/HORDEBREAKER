import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.env.ART_ARTIFACTS;
const jobs=JSON.parse(await fs.readFile(path.join(root,'docs/art-v56-prompts.json'),'utf8')).jobs;
const server=http.createServer(async(req,res)=>{
 try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.webp':'image/webp'};
  const data=await fs.readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);
 }catch{res.writeHead(404);res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 if(output)await fs.mkdir(output,{recursive:true});
 for(const width of [1900,390]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.waitForFunction(()=>window.TBH?.S?.party?.length);
  await page.evaluate(()=>{TBH.ui.setPaused(true);TBH.audio.setMuted(true)});
  await page.addStyleTag({content:'#pauseOverlay{display:none!important}'});
  if(width===1900){
   const invalid=await page.evaluate(async jobs=>{
    const C=TBH.config,bad=[];
    for(const j of jobs){
     const sprite=j.type==='enemy'?C.monsters[j.id].sprite:C.levels.find(z=>z.id===j.id).bg;
     if(!sprite.src.endsWith(j.id+'-v56.webp')){bad.push(j.id+': primary asset');continue}
     if(j.type==='enemy'&&sprite.face!=='left')bad.push(j.id+': orientation');
     const img=new Image();img.src=sprite.src;try{await img.decode()}catch{bad.push(j.id+': decode');continue}
     if(j.type==='enemy'){
      const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;const cx=cv.getContext('2d');cx.drawImage(img,0,0);
      const a=cx.getImageData(0,0,cv.width,cv.height).data;let clear=0,solid=0,border=0;
      for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){const v=a[(y*cv.width+x)*4+3];if(v<10)clear++;if(v>200)solid++;if((x===0||y===0||x===cv.width-1||y===cv.height-1)&&v>8)border++}
      if(clear<cv.width*cv.height*.08||solid<cv.width*cv.height*.05||border)bad.push(j.id+': silhouette/alpha');
     }
    }
    return bad;
   },jobs);assert.deepEqual(invalid,[],'All new primary images decode; sprites have transparent margins and visible bodies');
  }
  await page.evaluate(()=>{
   const T=TBH;for(const h of Object.values(T.S.heroes)){h.rec=true;h.lvl=30}
   T.S.inventory=T.config.items.flatMap((d,i)=>['rare','divine'].map((rarity,j)=>({uid:'i'+(9000+i*2+j),defId:d.id,slot:d.slot,rarity,ilvl:20,stats:{...d.stats},value:100})));
   T.events.emit('heroes');T.events.emit('inv');
  });
  await page.locator('.mobileTabs [data-tab="bag"]').click();await page.locator('.itemCard').first().waitFor({state:'visible'});
  await page.locator('.itemCard').first().scrollIntoViewIfNeeded();
  const layout=await page.locator('.itemCard').evaluateAll(cards=>cards.flatMap(card=>{
   const info=card.querySelector('.itemInfo').getBoundingClientRect(),actions=card.querySelector('.itemActions').getBoundingClientRect();
   return [...card.querySelectorAll('.itemStats span')].filter(e=>{const r=e.getBoundingClientRect();return r.right>info.right+1||r.bottom>actions.top+1}).map(()=>card.dataset.uid);
  }));assert.deepEqual(layout,[],'Item stats fit their column and stay above actions');
  for(const [id,art] of [['wind_feather','feather'],['lucky_coin','coin'],['wolf_fang','fang'],['leather_vest','vest'],['chainmail','mail'],['moon_blade','blade']]){
   const uid=await page.evaluate(id=>TBH.S.inventory.find(i=>i.defId===id&&i.rarity==='divine').uid,id);
   assert.match(await page.locator(`.itemCard[data-uid="${uid}"] img`).getAttribute('src'),new RegExp('/'+art+'\\.webp'),'Divine '+id+' retains its silhouette');
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(output)await page.screenshot({path:path.join(output,width+'-inventory.png')});
  await page.locator('.mobileTabs [data-tab="heroes"]').click();await page.locator('.heroRosterIntro').scrollIntoViewIfNeeded();
  if(width===390)assert.ok((await page.locator('.heroRosterIntro').boundingBox()).height<130,'Mobile introduction stays compact');
  if(output)await page.screenshot({path:path.join(output,width+'-heroes.png')});
  await page.locator('.heroTile[data-hid="paladin"]').click();await page.locator('.heroDossier').waitFor({state:'visible'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#modal .ghostBtn').click();
  assert.deepEqual(errors,[]);await page.close();console.log(width+'px: asset alpha, item identity, inventory layout and hero dossier OK');
 }
}finally{await browser.close();await new Promise(r=>server.close(r))}
