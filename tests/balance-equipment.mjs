import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function game(raw,failBackup=false){
  const storage=new Map(raw?[['tbh_idle_equipment_v1',raw]]:[]),T={config:{}};
  const sandbox={window:{TBH:T},TBH:T,console,document:{getElementById:()=>({style:{},getContext:()=>({})})},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(failBackup&&k==='tbh_balance_backup_v55')throw Error('test quota');storage.set(k,String(v))},removeItem:k=>storage.delete(k)}};
  vm.createContext(sandbox);
  for(const file of ['config/balance.js','config/heroes.js','config/monsters.js','config/levels.js','config/items.js','config/expansion.js','js/core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
  T.load();return {T,storage};
}
const {T}=game(),C=T.config;
const rows=[];
for(let wave=1;wave<=200;wave++){
  for(let n=0;n<T.waves.count(wave);n++)T.progression.awardKill(wave,T.waves.isBoss(wave));
  if([5,10,30,50,53,100,150,200].includes(wave))rows.push({wave,level:T.S.heroes.paladin.lvl});
}
assert.equal(rows.find(r=>r.wave===5).level,4);
assert.ok(rows.find(r=>r.wave===50).level>=25&&rows.find(r=>r.wave===50).level<=30);
assert.equal(rows.at(-1).level,100);
console.log('First-clear XP curve:',JSON.stringify(rows));
for(const hd of C.heroes){T.S.heroes[hd.id].rec=true;T.S.heroes[hd.id].lvl=100;}
for(const def of C.items){
  const item={uid:'matrix-'+def.id,defId:def.id,slot:def.slot,rarity:'common',ilvl:1,stats:{...def.stats},value:10};
  for(const hd of C.heroes){
    const expected=(!def.classes||def.classes.includes(hd.id))&&(def.armorType!=='heavy'||hd.role==='tank');
    assert.equal(T.classOk(item,hd.id),expected,`${def.id} / ${hd.id}`);
    assert.equal(T.classOk({...item,slot:'wrong'},hd.id),false);
    assert.equal(T.classOk({...item,ilvl:101},hd.id),false);
  }
  if(def.stats.dmgPct&&!C.heroes.some(h=>h.role==='healer'&&T.allowedClass(item,h.id)))assert.ok(!T.items.statLines(item).join(' ').includes('лечен'));
}
for(const rarity of C.rarities){
  const it={uid:'heavy-'+rarity.id,defId:'dragon_plate',slot:'armor',rarity:rarity.id,ilvl:1,stats:{hpFlat:100,armor:100},value:20};
  T.S.inventory=[it];assert.equal(T.items.equip(it.uid,'archer'),false);assert.equal(T.items.equip(it.uid,'paladin'),true);
}
const legacy=JSON.parse(JSON.stringify(T.S));delete legacy.balanceVersion;
legacy.wave=53;legacy.maxWave=53;legacy.gold=123456;legacy.gems=7;legacy.party=['paladin','archer'];
for(const h of Object.values(legacy.heroes)){h.lvl=58;h.xp=123;h.equip={weapon:null,armor:null,talisman:null};}
const sword={uid:'legacy-sword',defId:'moon_blade',slot:'weapon',rarity:'rare',ilvl:31,stats:{dmgPct:122.9,critDmg:81.9},value:100,enhance:3};
const plate={uid:'legacy-plate',defId:'dragon_plate',slot:'armor',rarity:'rare',ilvl:10,stats:{hpFlat:300,armor:150},value:100};
const divine={uid:'legacy-divine',defId:'moon_blade',slot:'weapon',rarity:'divine',ilvl:80,stats:{dmgPct:500,critDmg:300},value:500,divineScale:10.5};
legacy.inventory=Array.from({length:65},(_,i)=>({...sword,uid:'bag-'+i}));legacy.inventory.push(divine);
legacy.equipped={ [sword.uid]:sword,[plate.uid]:plate};legacy.heroes.paladin.equip.weapon=sword.uid;legacy.heroes.archer.equip.armor=plate.uid;
const raw=JSON.stringify(legacy),m=game(raw),S=m.T.S;
assert.equal(JSON.parse(m.storage.get('tbh_balance_backup_v55')).raw,raw);
assert.equal(S.wave,53);assert.equal(S.maxWave,53);assert.equal(S.gold,123456);assert.equal(S.gems,7);
let total=123;for(let level=1;level<58;level++)total+=Math.ceil(18*1.08**(level-1));
let retained=S.heroes.paladin.xp;for(let level=1;level<S.heroes.paladin.lvl;level++)retained+=m.T.progression.xpNeed(level);
assert.equal(retained,total,'Migration must preserve every earned XP point');
assert.ok(S.heroes.paladin.lvl<30);
assert.equal(S.heroes.archer.equip.armor,null);
assert.equal(S.inventory.length+Object.keys(S.equipped).length,68,'No item may be sold during migration, even with a full bag');
assert.equal(S.inventory.find(i=>i.uid===divine.uid).ilvl,80,'Purchased divine tiers stay unchanged');
assert.equal((S.equipped[sword.uid]||S.inventory.find(i=>i.uid===sword.uid)).enhance,3);
assert.ok(m.T.save());const migrated=JSON.stringify(S);m.T.load();assert.equal(JSON.stringify(m.T.S),migrated,'Migration must run exactly once');
const blocked=game(raw,true);assert.equal(blocked.T.S.heroes.paladin.lvl,58);assert.equal(blocked.T.save(),false);assert.equal(blocked.storage.get('tbh_idle_equipment_v1'),raw);
// Shared equipped IDs and unrecognized slots may never grant duplicate stats.
const duplicate=JSON.parse(migrated);duplicate.heroes.paladin.lvl=100;duplicate.heroes.barbarian.lvl=100;
duplicate.equipped={[sword.uid]:{...sword,ilvl:1}};duplicate.inventory=[];
duplicate.heroes.paladin.equip={weapon:sword.uid,extra:sword.uid};duplicate.heroes.barbarian.equip={weapon:sword.uid};
const d=game(JSON.stringify(duplicate)).T;
assert.equal(Object.values(d.S.heroes).flatMap(h=>Object.values(h.equip)).filter(uid=>uid===sword.uid).length,1);
assert.equal(d.S.heroes.paladin.equip.extra,undefined);
// Auto equipment must honor class, level, existing items and reserve ownership.
d.S.party=['paladin','archer','necro'];
d.S.inventory=[{...plate,uid:'auto-heavy',ilvl:1},{...sword,uid:'auto-blade',ilvl:1},{...sword,uid:'future-blade',ilvl:101}];
d.items.autoEquip();
for(const hd of C.heroes)for(const [slot,uid] of Object.entries(d.S.heroes[hd.id].equip))if(uid){const it=d.S.equipped[uid];assert.equal(it.slot,slot);assert.ok(d.classOk(it,hd.id));}
console.log('Equipment class/slot/level matrix, all rarities, descriptions, migration backup, XP preservation, full bag, idempotence, quota failure and auto equipment OK.');
