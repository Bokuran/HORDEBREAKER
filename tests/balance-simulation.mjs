import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  await page.waitForFunction(()=>window.TBH?.S?.party?.length);
  const rows=await page.evaluate(async()=>{
    const T=TBH,B=T.battleState,C=T.config;T.ui.setPaused(true);T.audio.setMuted(true);
    const ids=['paladin','archer','mage','necro'];
    for(const hd of C.heroes)T.getSprite(hd,'hero');
    for(const wave of [5,25,50,100,150,200])T.getSprite(T.waves.bossDef(wave),'mob');
    await Promise.all([...C.heroes.map(h=>h.sprite.src),...[5,25,50,100,150,200].map(w=>T.waves.bossDef(w).sprite.src)].map(src=>T.loadImage(src)));
    const equipment={paladin:['sun_mace','dragon_plate','wolf_fang'],archer:['hunter_bow','scout_coat','wolf_fang'],mage:['spark_staff','woven_robe','wind_feather'],necro:['soul_wand','woven_robe','wind_feather']};
    const rows=[],random=Math.random;
    try{for(const wave of [5,25,50,100,150,200])for(const rarity of (wave===100?['common','rare','divine']:['rare']))for(const seed of [17,91,250]){
      let rng=seed;Math.random=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);
      T.S.party=wave===5?['paladin']:ids;T.S.order=[...T.S.party];T.S.settings.auto=true;T.S.settings.autoSell='off';
      T.S.inventory=[];T.S.equipped={};T.S.atlas={gold:0,health:0,damage:0,loot:0};T.S.victory=false;
      const lvl=T.progression.levelForWave(wave-1),mult=C.rarities.find(r=>r.id===rarity).mult;
      for(const id of ids){const h=T.S.heroes[id];h.rec=true;h.lvl=lvl;h.xp=0;h.equip={};
        for(const defId of equipment[id]){const def=C.items.find(i=>i.id===defId),uid=id+'-'+def.slot;T.S.equipped[uid]={uid,defId,slot:def.slot,rarity,ilvl:lvl,stats:Object.fromEntries(Object.entries(def.stats).map(([k,v])=>[k,v*(1+(lvl-1)*.1)*mult])),value:1};h.equip[def.slot]=uid;}
      }
      T.events.emit('heroes');T.battle.resetVisuals();
      for(const id of ids)Object.assign(B.hs[id],{lunge:0,sk:{a1:3,a2:6,mom:0,sharp:0,arcane:0}});
      T.battle.startWave(wave,{silent:true});
      let seconds=0;while(seconds<70&&B.state==='fight'){T.battle.update(.05);seconds+=.05}
      rows.push({wave,rarity,seed,level:lvl,result:B.state==='inter'&&B.next===wave+1?'win':B.state==='inter'?'retreat':'timeout',seconds:+seconds.toFixed(2),survivors:T.S.party.filter(id=>!B.hs[id].dead).length});
    }}finally{Math.random=random}return rows;
  });
  console.log(JSON.stringify(rows,null,2));
  if(process.env.BALANCE_REPORT)await fs.writeFile(process.env.BALANCE_REPORT,JSON.stringify(rows,null,2));
  assert.ok(rows.every(r=>Number.isFinite(r.seconds)&&r.result!=='timeout'),'Every simulated boss encounter must finish');
}finally{await browser.close()}
