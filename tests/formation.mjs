import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=process.env.FORMATION_ARTIFACTS;
if(output)await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of [1900,390]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  await page.waitForFunction(()=>window.TBH?.S?.party?.length);
  await page.evaluate(async()=>{TBH.ui.setPaused(true);TBH.audio.setMuted(true);for(const hd of TBH.config.heroes)TBH.getSprite(hd,'hero');TBH.getSprite(TBH.config.monsters.city_b,'mob');await Promise.all([...TBH.config.heroes.map(h=>h.sprite.src),TBH.config.monsters.city_b.sprite.src].map(src=>TBH.loadImage(src)))});
  await page.addStyleTag({content:'#pauseOverlay{display:none!important}'});
  for(const party of [['paladin','archer','rogue','necro'],['paladin','monk','rogue','barbarian']])for(const fps of [30,60,120]){
    const result=await page.evaluate(({party,fps})=>{
      const T=TBH,B=T.battleState,bx=T.bx;
      T.S.party=party;T.S.order=[...party];for(const id of party){T.S.heroes[id].rec=true;T.S.heroes[id].lvl=20}
      T.events.emit('heroes');T.battle.resetVisuals();T.battle.startWave(53,{silent:true});B.monsters=[];B.spawnLeft=0;B.spawnT=999;
      for(const id of party){const h=B.hs[id];h.cool=0;h.sk.a1=h.sk.a2=999;h.buffs={}}
      const enemy={def:T.config.monsters.city_b,x:bx.W*.9,hp:1e12,maxHp:1e12,dead:false,slot:0,buffs:{},atkT:999,spd:0,baseSpd:0,dmg:1,flash:0,lunge:0,castT:0,seed:0};B.monsters=[enemy];
      for(let i=0;i<fps*12;i++)T.battle.update(1/fps);
      const damage={...B.damageByHero},combat=party.map(id=>({id,x:B.hs[id].x,home:B.hs[id].home,range:T.config.heroes.find(h=>h.id===id).range}));
      enemy.dead=true;enemy.deathT=0;B.projs=[];for(const id of party){B.hs[id].lunge=0;B.hs[id].castT=0}B.combatUntil=0;
      T.battle.update(1/fps);const travel=B.travel;
      for(let i=0;i<fps*4.6;i++)T.battle.update(1/fps);
      T.battle.render();
      return{damage,combat,state:B.state,travel:B.travel-travel,moving:B.cameraMoving,formation:party.map(id=>{const h=B.hs[id],s=T.getSprite(h.def,'hero')[0];return{id,x:h.x,home:h.home,offset:h.walkOff,depth:h.laneY,width:s.w*bx.scaleOf(s)}}),width:bx.W};
    },{party,fps});
    for(const h of result.combat)if(h.range==='melee')assert.ok(result.damage[h.id]>0,`${width}px ${fps}fps ${h.id} must reach and actually hit a distant enemy: ${JSON.stringify(result)}`);
    assert.equal(result.state,'inter');assert.ok(result.moving&&result.travel>0);
    for(const h of result.formation){assert.ok(Math.abs(h.x-h.home)<1,`${h.id} must rejoin formation: ${JSON.stringify(h)}`);assert.ok(Math.abs(h.depth)<1);assert.ok(h.x-h.width/2>=0&&h.x+h.width/2<=result.width)}
    for(let i=1;i<result.formation.length;i++){const a=result.formation[i-1],b=result.formation[i];assert.ok(a.x-b.x>=(a.width+b.width)/2+2,'Traveling sprites must not overlap')}
    if(output&&fps===60)await page.locator('#stageWrap').screenshot({path:path.join(output,`${width}-${party[1]}-formation.png`)});
  }
  assert.deepEqual(errors,[]);console.log(`${width}px: mixed/full-melee parties, distant enemy damage, regrouping without overlap at 30/60/120 FPS OK`);await page.close();
}}finally{await browser.close()}
