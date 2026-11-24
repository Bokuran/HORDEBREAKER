import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsDir = path.join(root, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
for (const file of jsFiles) {
  new vm.Script(fs.readFileSync(path.join(jsDir, file), 'utf8'), { filename: `js/${file}` });
}

const tbh = { config: {} };
const storage = new Map();
const sandbox = {
  window: { TBH: tbh },
  TBH: tbh,
  console,
  localStorage: { getItem: key => storage.has(key) ? storage.get(key) : null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) },
  document: { getElementById: () => ({ style: {}, getContext: () => ({}) }) },
  matchMedia: () => ({ matches: false })
};
vm.createContext(sandbox);
for (const file of ['balance.js', 'heroes.js', 'monsters.js', 'levels.js', 'items.js', 'expansion.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'config', file), 'utf8'), sandbox, { filename: `config/${file}` });
}

const c = sandbox.window.TBH.config;
assert.equal(c.heroes.length, 8, 'Expected eight hero classes after adding Barbarian and Druid');
assert.deepEqual(Array.from(c.heroes.filter(h => h.role === 'tank'), h => h.id), ['paladin', 'barbarian'], 'Roster must contain two tanks');
assert.deepEqual(Array.from(c.heroes.filter(h => h.role === 'healer'), h => h.id), ['necro', 'druid'], 'Roster must contain two healers');
assert.equal(c.levels.length, 20, 'Expected twenty campaign zones');
assert.equal(new Set(c.levels.flatMap(z=>Object.values(z.bosses))).size,40,'Each of the 40 boss stages must have a distinct boss');
assert.equal(new Set(c.levels.flatMap(z=>z.monsters)).size,40,'Each location needs its own two regular opponents');
assert.equal(new Set(c.levels.map(z=>z.bg.src)).size,20,'Each zone has a unique background');
assert.equal(new Set(c.levels.map(z=>z.iconArt)).size,20,'Each zone has a unique heraldic icon');
for(const z of c.levels){
  for(const src of [z.bg.src,z.iconArt,...[...z.monsters,...Object.values(z.bosses)].map(id=>c.monsters[id].sprite.src)]){
    assert.ok(fs.existsSync(path.join(root,src)), 'Missing campaign art '+src);
    if(src.endsWith('.svg'))assert.match(fs.readFileSync(path.join(root,src),'utf8'),/<svg[^>]*viewBox=/);
  }
}
for(const it of c.items.filter(i=>i.slot!=='talisman')) assert.ok(it.classes?.length,'Class restrictions required for '+it.id);
for(const art of ['bow','dagger','mace','fists','wand','sickle','robe','coat'])assert.ok(fs.existsSync(path.join(root,'assets/items/'+art+'.svg')),'Missing item art '+art);
assert.equal(c.partyCap, 4, 'Expected four active party slots');
assert.ok(c.balance.enemy.goldGrowth >= 1.10 && c.balance.enemy.goldGrowth <= 1.13, 'Gold growth should be deliberately slower to prevent currency inflation');
assert.equal(c.balance.atlas.nodeCosts.length, 18, 'Atlas should have eighteen upgrade ranks per branch');
assert.equal(c.balance.atlas.maxNodes,18,'All branches should share the same Atlas level cap');
assert.ok(c.balance.hero.costGrowth <= 1.14, 'Hero upgrade cost progression should be softened');
assert.ok(c.balance.boss.spawnHpMult > 1, 'Boss HP multiplier should be explicit in balance config');
assert.ok(c.balance.elite.hpMult > 1 && c.balance.elite.goldMult > 1, 'Elite enemy tuning must be configured');

const refs = new Set();
for (const file of ['heroes.js', 'monsters.js', 'levels.js']) {
  const source = fs.readFileSync(path.join(root, 'config', file), 'utf8');
  for (const match of source.matchAll(/assets\/[A-Za-z0-9_./-]+\.(?:webp|png)/g)) refs.add(match[0]);
}
for (const ref of [...refs, 'assets/logo.webp']) {
  assert.ok(fs.existsSync(path.join(root, ref)), `Missing asset: ${ref}`);
}

// Only the current, individual WebP artwork is shipped; legacy atlases/source crops are removed.
const imageFiles = [];
const walkAssets = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkAssets(full);
    else if (/\.(?:png|jpe?g|webp)$/i.test(entry.name)) imageFiles.push(path.relative(root, full).replaceAll(path.sep, '/'));
  }
};
walkAssets(path.join(root, 'assets'));
const expectedImages = new Set([
  'assets/logo.webp',
  ...['forest','waste','caves','peaks','castle','crystal','volcano','cursed'].map(n => `assets/zones/${n}.webp`),
  ...['paladin','archer','mage','monk','rogue','necro','crystal_golem','flame_demon','shadow_wraith'].map(n => `assets/characters/${n}.webp`),
  'assets/characters/druid_generated.webp', 'assets/characters/barbarian_generated.webp',
  'assets/items/divine_icons_generated.webp',
  ...['sword','axe','staff','blade','vest','mail','shield','plate','coin','fang','feather','seal'].map(n => `assets/items/${n}.webp`)
]);
for(const file of ["assets/zones/campaign/city.webp","assets/zones/campaign/gate.webp","assets/zones/campaign/waste.webp","assets/zones/campaign/mountains.webp","assets/zones/campaign/peaks.webp","assets/zones/campaign/elfwood.webp","assets/characters/campaign/city_a.webp","assets/characters/campaign/city_b.webp","assets/characters/campaign/city_champion.webp","assets/characters/campaign/city_lord.webp","assets/characters/campaign/gate_a.webp","assets/characters/campaign/gate_b.webp","assets/characters/campaign/gate_champion.webp","assets/characters/campaign/gate_lord.webp","assets/characters/campaign/forest_b.webp","assets/characters/campaign/forest_champion.webp","assets/characters/campaign/waste_a.webp","assets/characters/campaign/waste_b.webp","assets/characters/campaign/waste_champion.webp","assets/characters/campaign/waste_lord.webp","assets/characters/campaign/mountains_a.webp","assets/characters/campaign/mountains_b.webp","assets/characters/campaign/mountains_lord.webp","assets/characters/campaign/peaks_a.webp","assets/characters/campaign/peaks_b.webp","assets/characters/campaign/peaks_lord.webp","assets/characters/campaign/elfwood_champion.webp","assets/characters/campaign/elfwood_lord.webp"])expectedImages.add(file);
for(const file of ["assets/characters/campaign/forest_a.webp","assets/characters/campaign/forest_lord.webp","assets/characters/campaign/highlands_lord.webp","assets/characters/campaign/deepwood_a.webp","assets/items/bow.webp","assets/items/dagger.webp","assets/items/mace.webp","assets/items/fists.webp","assets/items/wand.webp","assets/items/sickle.webp","assets/items/robe.webp","assets/items/coat.webp"])expectedImages.add(file);
for(const src of ["assets/characters/campaign/highlands_a.webp","assets/characters/campaign/highlands_b.webp","assets/characters/campaign/highlands_champion.webp","assets/characters/campaign/deepwood_b.webp","assets/characters/campaign/marsh_lord.webp","assets/characters/campaign/crystal_a.webp","assets/characters/campaign/citadel_lord.webp"])expectedImages.add(src);
assert.deepEqual(new Set(imageFiles), expectedImages, 'Only the new, referenced WebP game art should be shipped');
assert.ok(!fs.existsSync(path.join(root, 'assets/zones/source')), 'Unused source crops should not be shipped');
for (const legacy of ['assets/bg_atlas.png','assets/bg_atlas.webp','assets/boss_atlas.png','assets/boss_atlas.webp','assets/expansion.png','assets/expansion.webp','assets/heroes.png']) {
  assert.ok(!fs.existsSync(path.join(root, legacy)), `Legacy sprite atlas must be removed: ${legacy}`);
}


for (const name of ['forest','waste','caves','peaks','castle','crystal','volcano','cursed']) {
  assert.ok(fs.existsSync(path.join(root, `assets/zones/${name}.webp`)), `Missing zone background: ${name}`);
}
for (const name of ['paladin','archer','mage','monk','rogue','necro','crystal_golem','flame_demon','shadow_wraith']) {
  assert.ok(fs.existsSync(path.join(root, `assets/characters/${name}.webp`)), `Missing character sprite: ${name}`);
}
for (const name of ['sword','axe','staff','blade','vest','mail','shield','plate','coin','fang','feather','seal']) {
  assert.ok(fs.existsSync(path.join(root, `assets/items/${name}.webp`)), `Missing item icon: ${name}`);
}
assert.ok(!fs.existsSync(path.join(root, 'assets/characters/barbarian_placeholder.svg')), 'Unused Barbarian placeholder must be removed');
assert.ok(!fs.existsSync(path.join(root, 'assets/characters/druid_placeholder.svg')), 'Unused Druid placeholder must be removed');
for (const id of ['barbarian', 'druid']) {
  const hero=c.heroes.find(h=>h.id===id);
  assert.equal(hero.sprite.src, 'assets/characters/'+id+'_generated.webp', id+' must use the generated hero illustration');
  assert.ok(fs.existsSync(path.join(root,hero.sprite.src)), 'Missing generated '+id+' character artwork');
  assert.equal(hero.sprite.fb?.src,'assets/characters/'+id+'.svg','Keep the original SVG as an image fallback');
  const svg=fs.readFileSync(path.join(root,hero.sprite.fb.src),'utf8');
  assert.match(svg, /<svg[^>]*viewBox="0 0 256 320"/, id+' portrait must have an image viewBox');
  assert.ok((svg.match(/<path/g)||[]).length>25, id+' portrait must include detailed SVG illustration layers');
}

assert.ok(fs.existsSync(path.join(root, 'assets/audio/main_theme.ogg')), 'Missing generated music');
const audioSource = fs.readFileSync(path.join(jsDir, 'audio.js'), 'utf8');
assert.match(audioSource, /barbarian\(\)/, 'Barbarian needs a distinct procedural sound');
assert.match(audioSource, /druid\(\)/, 'Druid needs a distinct procedural sound');
assert.match(audioSource, /necroRevive\(\)/, 'Necromancer revival needs a distinct procedural sound');
for (const name of ['click','swing','hit','crit','hero_hit','heal','coin','death','boss','bossdie','wave','fire','arrow','hammer','boom','equip','lvl','recruit','chest','fail','drop']) {
  assert.ok(fs.existsSync(path.join(root, `assets/audio/sfx_${name}.ogg`)), `Missing SFX: ${name}`);
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(index, /id="bossTimerFill"/, 'Boss timer bar missing');
assert.match(index, /id="bossFill"/, 'Boss HP bar missing');
assert.match(index, /type="image\/webp" href="assets\/logo\.webp/, 'WebP favicon MIME type mismatch');

// New progression and interface regressions.
assert.match(index, /data-tab=\"heroes\"[^>]*>⚔ Герои/, 'Heroes navigation tab missing');
assert.match(index, /АТЛАС РАЗВИТИЯ/, 'Camp atlas missing');
assert.match(index, /ОБМЕННИК БОЖЕСТВЕННЫХ РЕЛИКВИЙ/, 'Divine exchange missing');
const styleSource = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
assert.match(styleSource, /squadManageCard\.reserveCard,\.squadManageCard\.recruitCard\{grid-template-columns:48px minmax\(0,1fr\) auto/, 'Reserve and recruit layout must dedicate a full track to hero descriptions');
assert.ok(c.rarities.some(r => r.id === 'divine'), 'Divine rarity must exist');
assert.equal(c.balance.divine.bossGemChance, .28, 'Boss diamond drop chance must be configured');

// Runtime regression test: auto-equip and sell-spare must preserve reserve gear.
vm.runInContext(fs.readFileSync(path.join(jsDir, 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
const runtime = sandbox.window.TBH;
runtime.load();
const state = runtime.S;
assert.deepEqual(Array.from(state.party), ['paladin'], 'Fresh game must auto-form the default party with the free Paladin');

// Formation order is player-controlled; hero HP does not force a tank position.
state.heroes.archer.rec = true;
state.heroes.archer.lvl = 50;
state.party = ['paladin', 'archer'];
assert.ok(runtime.derived.heroStats('archer').maxHp > runtime.derived.heroStats('paladin').maxHp, 'Test precondition: upgraded archer has higher effective HP');
assert.equal(runtime.formation()[0].id, 'paladin', 'Default party order must be preserved instead of auto-selecting a tank');
runtime.setOrder(['archer','paladin']);
assert.equal(runtime.formation()[0].id, 'archer', 'Player must be able to place any hero at the front');
runtime.setOrder(['paladin','archer']);
// Heroes gain levels through kills, and Atlas nodes replace legacy camp upgrades.
state.heroes.paladin.lvl = 1;
state.heroes.paladin.xp = 0;
const xpBefore = state.heroes.paladin.xp;
runtime.progression.awardKill(1, false);
assert.ok(state.heroes.paladin.xp > xpBefore || state.heroes.paladin.lvl > 1, 'A monster kill must grant hero XP');
state.gold = 10000;
const goldMultBeforeAtlas = runtime.derived.goldMult();
assert.equal(runtime.econ.buyAtlasNode('gold'), true, 'Gold Atlas node should be purchasable with gold');
assert.ok(runtime.derived.goldMult() > goldMultBeforeAtlas, 'Gold Atlas node must improve gold rewards');
assert.equal(runtime.econ.buyAtlasNode('health'), true, 'Health Atlas node should be purchasable with gold');
assert.ok(runtime.derived.heroStats('paladin').maxHp > 400, 'Health Atlas node must increase hero max HP');
const dmgBeforeAtlas = runtime.derived.heroStats('paladin').dmg;
assert.equal(runtime.econ.buyAtlasNode('damage'), true, 'Damage Atlas node should be purchasable');
assert.ok(runtime.derived.heroStats('paladin').dmg > dmgBeforeAtlas, 'Damage Atlas must increase hero base damage');
const dropBeforeAtlas = runtime.derived.dropChance();
assert.equal(runtime.econ.buyAtlasNode('loot'), true, 'Loot Atlas node should be purchasable');
assert.ok(runtime.derived.dropChance() > dropBeforeAtlas, 'Loot Atlas must improve equipment drop chance');
state.atlas = { gold: 0, health: 0, damage: 0, loot: 0 };
state.gold = 10000;
state.heroes.paladin.lvl = 1;
state.heroes.paladin.xp = 0;
state.party = ['paladin'];
state.party = ['paladin'];
state.heroes.archer.rec = true;
state.heroes.archer.lvl = 3;
state.heroes.paladin.lvl = 2;
const reserveItem = {
  uid: 'reserve-archer-weapon', defId: 'hunter_bow', slot: 'weapon', rarity: 'common',
  ilvl: 3, stats: { dmgPct: 18, critDmg: 12 }, value: 20
};
const activeUpgrade = {
  uid: 'active-paladin-weapon', defId: 'war_axe', slot: 'weapon', rarity: 'common',
  ilvl: 2, stats: { dmgPct: 14, crit: 1 }, value: 25
};
state.heroes.archer.equip.weapon = reserveItem.uid;
state.equipped[reserveItem.uid] = reserveItem;
state.inventory = [activeUpgrade];
assert.ok(runtime.items.bestUids().has(reserveItem.uid), 'Reserve equipment must be protected from spare-item sale');
runtime.items.autoEquip();
assert.equal(state.heroes.archer.equip.weapon, reserveItem.uid, 'Auto-equip must not clear reserve hero equipment');
assert.deepEqual(state.equipped[reserveItem.uid], reserveItem, 'Reserve item must remain equipped');
assert.equal(state.heroes.paladin.equip.weapon, activeUpgrade.uid, 'Active hero should receive the better eligible item');
assert.ok(!state.inventory.some(item => item.uid === activeUpgrade.uid), 'Assigned item must leave inventory');
const goldBeforeHeroSale = state.gold;
assert.equal(runtime.econ.sellHero('archer'), true, 'A hired reserve hero should be sellable');
assert.equal(state.heroes.archer.rec, false, 'Sold hero should return to the recruitable roster');
assert.ok(state.inventory.some(item => item.uid === reserveItem.uid), 'Hero equipment must return to inventory when dismissed');
assert.equal(state.gold - goldBeforeHeroSale, Math.floor(c.heroes.find(h => h.id === 'archer').recruitCost * .35), 'Hero sale should refund 35% of recruit cost');
state.heroes.archer.rec = true;


// Equipping with a full bag must return old gear without selling any unrelated item.
const oldWeapon = { uid: 'old-paladin-weapon', defId: 'rusty_sword', slot: 'weapon', rarity: 'common', ilvl: 1, stats: { dmgPct: 10 }, value: 10 };
const selectedWeapon = { uid: 'selected-paladin-weapon', defId: 'war_axe', slot: 'weapon', rarity: 'common', ilvl: 2, stats: { dmgPct: 14, crit: 1 }, value: 25 };
state.heroes.paladin.equip.weapon = oldWeapon.uid;
state.equipped[oldWeapon.uid] = oldWeapon;
state.inventory = [selectedWeapon, ...Array.from({ length: c.balance.drops.inventoryCap - 1 }, (_, i) => ({
  uid: `filler-${i}`, defId: 'rusty_sword', slot: 'weapon', rarity: 'common', ilvl: i + 1,
  stats: { dmgPct: 10 + i }, value: 100 + i
}))];
const beforeFullBag = new Set(state.inventory.map(item => item.uid));
const goldBeforeEquip = state.gold;
assert.equal(state.inventory.length, c.balance.drops.inventoryCap, 'Test precondition: bag is full');
assert.equal(runtime.items.equip(selectedWeapon.uid, 'paladin'), true, 'Equip should succeed with a full bag');
assert.equal(state.heroes.paladin.equip.weapon, selectedWeapon.uid, 'Selected weapon must be equipped');
assert.ok(state.equipped[selectedWeapon.uid], 'Selected weapon must be in equipped map');
assert.ok(state.inventory.some(item => item.uid === oldWeapon.uid), 'Replaced weapon must return to the bag');
for (const uid of beforeFullBag) if (uid !== selectedWeapon.uid) assert.ok(state.inventory.some(item => item.uid === uid), `Unrelated bag item ${uid} must not be lost`);
assert.equal(state.inventory.length, c.balance.drops.inventoryCap, 'Bag should remain at its cap after swapping gear');
assert.equal(state.gold, goldBeforeEquip, 'Equipping must not silently sell an unrelated item');

// Regression: full inventory may not sacrifice an unrelated item when unequipping.
state.inventory = Array.from({ length: c.balance.drops.inventoryCap }, (_, i) => ({
  uid: 'unequip-full-' + i, defId: 'rusty_sword', slot: 'weapon', rarity: 'common',
  stats: { dmgPct: 10 }, value: 5, ilvl: 1
}));
const equippedBeforeUnequip = state.heroes.paladin.equip.weapon;
const fullBagBeforeUnequip = state.inventory.map(it => it.uid);
assert.equal(runtime.items.unequip('paladin', 'weapon'), false, 'Unequip must refuse a full bag');
assert.equal(state.heroes.paladin.equip.weapon, equippedBeforeUnequip, 'Equipped item must stay equipped');
assert.deepEqual(state.inventory.map(it => it.uid), fullBagBeforeUnequip, 'Unequip must not silently sell unrelated items');
state.inventory = [];

// Regression: auto-equip must never replace a higher-DPS talisman with a higher generic weighted-score talisman.
state.heroes.paladin.equip.talisman = 'fast-feather';
state.equipped['fast-feather'] = {
  uid: 'fast-feather', defId: 'wind_feather', slot: 'talisman', rarity: 'common',
  stats: { atkSpd: 5 }, value: 10, ilvl: 1
};
state.inventory.push({
  uid: 'wolf-test', defId: 'wolf_fang', slot: 'talisman', rarity: 'common',
  stats: { crit: 3, critDmg: 10 }, value: 10, ilvl: 1
});
runtime.events.emit('heroes');
const dpsBeforeSafeAuto = runtime.derived.heroStats('paladin').dps;
runtime.items.autoEquip();
assert.equal(state.heroes.paladin.equip.talisman, 'fast-feather', 'Auto-equip must keep the higher actual DPS talisman');
assert.ok(runtime.derived.heroStats('paladin').dps >= dpsBeforeSafeAuto, 'Auto-equip must not lower actual hero DPS');
state.inventory = [];
state.heroes.paladin.equip.talisman = null;
delete state.equipped['fast-feather'];
runtime.events.emit('heroes');

// An imported/legacy over-cap inventory is trimmed back to the configured cap on the next loot.
state.inventory = Array.from({ length: c.balance.drops.inventoryCap + 7 }, (_, i) => ({
  uid: `overcap-${i}`, defId: 'leather_vest', slot: 'armor', rarity: 'common', ilvl: 1,
  stats: { hpFlat: 30, defPct: 2 }, value: 100
}));
const goldBeforeTrim = state.gold;
runtime.items.handleDrop({ uid: 'incoming-overcap-drop', defId: 'leather_vest', slot: 'armor', rarity: 'common', ilvl: 1, stats: { hpFlat: 30, defPct: 2 }, value: 300 }, null, null, 'test');
assert.equal(state.inventory.length, c.balance.drops.inventoryCap, 'Over-cap inventory must be restored to the cap after receiving loot');
assert.equal(state.gold - goldBeforeTrim, 800, 'Overflow must sell exactly the eight excess items without losing the new drop');
assert.ok(state.inventory.some(item => item.uid === 'incoming-overcap-drop'), 'Incoming item must survive overflow trimming');
state.inventory = [{ uid: 'forge-test', defId: 'war_axe', slot: 'weapon', rarity: 'common', ilvl: 2, stats: { dmgPct: 10, crit: 2 }, value: 50, enhance: 0 }];
state.gold = 100000;
const forgeStatBefore = state.inventory[0].stats.dmgPct;
assert.equal(runtime.items.enhance('forge-test'), true, 'Gold should be spendable to temper equipment');
assert.equal(state.inventory[0].enhance, 1, 'Tempering rank should persist on the item');
assert.ok(state.inventory[0].stats.dmgPct > forgeStatBefore, 'Tempering should improve item stats');

// Runtime regression tests for the shared incoming-damage path.
vm.runInContext(fs.readFileSync(path.join(jsDir, 'battle-base.js'), 'utf8'), sandbox, { filename: 'js/battle-base.js' });
vm.runInContext(fs.readFileSync(path.join(jsDir, 'battle-fx.js'), 'utf8'), sandbox, { filename: 'js/battle-fx.js' });
const bx = runtime.bx;
runtime.getSprite = () => [{ w: 16, h: 32, img: false }];
const archer = runtime.battleState.hs.archer;
Object.assign(archer, { maxHp: 100, hp: 100, dead: false, buffs: { shieldT: 1 }, sk: { mom: 0 }, x: 100 });
bx.applyBossHit(archer, 50, '#fff', { bossId: 'flame_lord' });
assert.equal(archer.hp, 72, 'Boss damage should pass through the party shield (55% damage)');

const paladin = runtime.battleState.hs.paladin;
Object.assign(paladin, { maxHp: 100, hp: 20, dead: false, buffs: {}, sk: { mom: 0 }, x: 100 });
bx.applyBossHit(paladin, 10, '#fff', { bossId: 'flame_lord' });
assert.equal(paladin.hp, 13, 'Paladin low-health passive should reduce boss damage by 30%');

Object.assign(archer, { maxHp: 100, hp: 100, dead: false, buffs: { shadowMark: 1 }, sk: { mom: 0 }, x: 100 });
bx.applyBossHit(archer, 1000, '#fff', { bossId: 'shadow_king' });
assert.equal(archer.hp, 30, 'Shadow King mark must not bypass the boss hit cap');

Object.assign(archer, { maxHp: 100, hp: 100, dead: false, buffs: {}, sk: { mom: 0 }, x: 100 });
bx.hitHero(archer, { dmg: 1000 });
assert.equal(archer.hp, 55, 'Normal monster hits must respect the normal hit cap');

// Necromancer revives the first fallen party member exactly once per wave at 50% HP.
state.heroes.necro.rec = true;
state.party = ['paladin', 'necro'];
runtime.battleState.necroReviveUsed = false;
const reviveTarget = runtime.battleState.hs.paladin;
const reviveNecro = runtime.battleState.hs.necro;
Object.assign(reviveTarget, { maxHp: 200, hp: 0, dead: false, deadAge: 0, deadX: 100, x: 100, buffs: {} });
Object.assign(reviveNecro, { maxHp: 140, hp: 140, dead: false, x: 80, buffs: {} });
runtime.bx.killHero(reviveTarget);
assert.equal(reviveTarget.dead, false, 'First fallen ally should be revived while Necromancer is alive');
assert.equal(reviveTarget.hp, 100, 'Necromancer should restore exactly 50% max HP');
const rescuedHp = reviveTarget.hp; runtime.bx.applyBossHit(reviveTarget, 50, '#fff', { bossId: 'flame_lord' });
assert.equal(reviveTarget.hp, rescuedHp, 'Brief resurrection protection should prevent an immediate repeat kill');
assert.equal(runtime.battleState.necroReviveUsed, true, 'Revive passive must be consumed after the first rescue');
assert.equal(reviveTarget.buffs.reviveGrace, 0.75, 'Resurrected ally should receive a short protection window');
const secondTarget = runtime.battleState.hs.archer;
Object.assign(secondTarget, { maxHp: 100, hp: 0, dead: false, deadAge: 0, deadX: 100, x: 100, buffs: {} });
state.heroes.archer.rec = true; state.party = ['paladin', 'necro', 'archer'];
runtime.bx.killHero(secondTarget);
assert.equal(secondTarget.dead, true, 'Necromancer must not revive a second ally in the same wave');
state.party = ['paladin'];
state.heroes.necro.rec = false; state.heroes.archer.rec = false;
runtime.battleState.necroReviveUsed = false;

const skillSource = fs.readFileSync(path.join(jsDir, 'battle-skills.js'), 'utf8');
assert.match(skillSource, /Последний шанс/ , 'Necromancer passive must describe the one-time resurrection');
assert.match(skillSource, /barbarian:\{passive/ , 'Barbarian tank skills must be configured');
assert.match(skillSource, /druid:\{passive/ , 'Druid healer skills must be configured');
assert.match(skillSource, /bx\.applyBossHit\(fh,dmg/, 'Flame Lord aura must use shared incoming-damage handling');
assert.doesNotMatch(skillSource, /fh\.hp\s*-=\s*dmg/, 'Flame Lord aura must not bypass damage handling');
vm.runInContext(skillSource, sandbox, { filename: 'js/battle-skills.js' });

// The new tank's passive reduction and taunt priority are separate and testable.
state.heroes.barbarian.rec = true; state.party = ['paladin', 'barbarian'];
const barbarianRuntime = runtime.battleState.hs.barbarian;
Object.assign(barbarianRuntime, { id: 'barbarian', maxHp: 200, hp: 200, dead: false, x: 40, buffs: { taunt: 2 }, sk: { a1: 999, a2: 999 } });
assert.equal(runtime.bx.frontHero().id, 'barbarian', 'Active Barbarian taunt must make enemies target him');
assert.ok(Math.abs(runtime.bx.heroPassiveDmgMult(barbarianRuntime, c.heroes.find(h => h.id === 'barbarian')) - 0.82) < 1e-9, 'Barbarian must passively reduce incoming damage by 18%');
barbarianRuntime.hp = 60;
assert.ok(runtime.bx.heroPassiveDmgMult(barbarianRuntime, c.heroes.find(h => h.id === 'barbarian')) < 0.68, 'Barbarian low-health passive should add another damage reduction layer');

// Druid's healing passive adds 20% to its outgoing heals.
state.heroes.druid.rec = true; state.party = ['paladin', 'druid'];
const druidTarget = runtime.battleState.hs.paladin;
Object.assign(druidTarget, { maxHp: 100, hp: 50, dead: false, x: 60, buffs: {} });
runtime.bx.applyHeal(druidTarget, 10, false, 'druid');
assert.equal(druidTarget.hp, 62, 'Druid passive should increase a 10 HP heal to 12 HP');
state.party = ['paladin']; state.heroes.barbarian.rec = false; state.heroes.druid.rec = false;


// Elite encounter schedule and reward multiplier are tested against the battle runtime.
vm.runInContext(fs.readFileSync(path.join(jsDir, 'battle.js'), 'utf8'), sandbox, { filename: 'js/battle.js' });

// Real damage attribution counts HP actually removed and avoids overkill inflation.
const damageLedger = runtime.battleState.damageByHero;
for (const key of Object.keys(damageLedger)) delete damageLedger[key];
const trackedEnemy = { def: c.monsters.shadow_wraith, boss: false, dead: false, hp: 120, maxHp: 120, x: 160, flying: false, buffs: {} };
runtime.battle.damage(trackedEnemy, 80, { heroId: 'archer' });
runtime.battle.damage(trackedEnemy, 80, { heroId: 'paladin' });
assert.equal(runtime.battleState.damageByHero.archer, 80, 'First hero must receive credit for the HP actually removed');
assert.equal(runtime.battleState.damageByHero.paladin, 40, 'Overkill damage must be capped to the target remaining HP');

// Boss buffs must tick exactly once per simulation second (battle.js owns all timers).
const bossRuntime = runtime.battleState;
// Skill critical flags must match the actual damage multiplier, not be visual-only.
const originalDamage = runtime.battle.damage;
const skillHits = [];
runtime.battle.damage = (target, damage, options) => skillHits.push({ damage, crit: !!options?.crit });
const skillTarget = { def: c.monsters.shadow_wraith, boss: false, dead: false, hp: 5000, maxHp: 5000, x: 120, y: 0, buffs: {}, slot: 0 };
bossRuntime.monsters = [skillTarget];
const paladinRuntime = bossRuntime.hs.paladin;
Object.assign(paladinRuntime, { x: 100, dead: false, sk: { a1: 999, a2: 0 }, buffs: {} });
runtime.bx.heroSkillTick(c.heroes.find(h => h.id === 'paladin'), paladinRuntime, 0, { dmg: 100, crit: 100, critDmg: 200 });
assert.equal(skillHits[0]?.damage, 440, 'Paladin 220% skill should apply a real ×2 critical multiplier at 100% crit chance');
assert.equal(skillHits[0]?.crit, true, 'Paladin skill crit marker must match its real multiplier');
skillHits.length = 0;
const archerRuntime = bossRuntime.hs.archer;
Object.assign(archerRuntime, { x: 100, dead: false, sk: { a1: 0, a2: 999 }, buffs: {} });
runtime.bx.heroSkillTick(c.heroes.find(h => h.id === 'archer'), archerRuntime, 0, { dmg: 100, crit: 100, critDmg: 200 });
assert.equal(skillHits[0]?.damage, 110, 'Archer rain-of-arrows 55% hits must apply the critical multiplier');
assert.equal(skillHits[0]?.crit, true, 'Archer rain-of-arrows crit marker must match its real multiplier');
skillHits.length = 0;
Object.assign(archerRuntime, { x: 100, dead: false, sk: { a1: 999, a2: 0 }, buffs: {} });
runtime.bx.heroSkillTick(c.heroes.find(h => h.id === 'archer'), archerRuntime, 0, { dmg: 100, crit: 100, critDmg: 200 });
assert.equal(skillHits[0]?.damage, 640, 'Archer 320% skill should apply a real ×2 critical multiplier at 100% crit chance');
assert.equal(skillHits[0]?.crit, true, 'Archer skill crit marker must match its real multiplier');
runtime.battle.damage = originalDamage;

const timedBoss = { def: c.monsters.crystal_titan, boss: true, dead: false, hp: 100, maxHp: 100, x: 10000, spd: 0, atkT: 999, dmg: 1, slot: 0, buffs: { crystalShell: 6 }, sk: { a1: 99, a2: 99 }, flash: 0, lunge: 0, castT: 0 };
Object.assign(bossRuntime, { monsters: [timedBoss], boss: timedBoss, bossWave: true, waveTotal: 1, spawnLeft: 0, bossT: 100, state: 'fight' });
bossRuntime.hs.paladin.dead = false; bossRuntime.hs.paladin.hp = 100; bossRuntime.hs.paladin.maxHp = 100; bossRuntime.hs.paladin.x = 100;
runtime.battle.update(1);
assert.equal(timedBoss.buffs.crystalShell, 5, 'Boss defensive buff must lose exactly one second per second');

// Session playtime is real elapsed time, independent of combat speed multipliers.
const playBefore = state.stats.play;
Object.assign(bossRuntime, { monsters: [], boss: null, bossWave: false, waveTotal: 0, spawnLeft: 0, state: 'inter', t: 100 });
runtime.battle.update(3, 1);
assert.equal(state.stats.play - playBefore, 1, 'Playtime should increase by real time, not ×3 combat simulation time');

// Flame Lord rage modifies movement and attack damage for its full duration.
const ragingBoss = { def: c.monsters.flame_lord, boss: true, dead: false, hp: 100, maxHp: 100, x: 10000, spd: 100, baseSpd: 100, atkT: 999, dmg: 1, slot: 0, buffs: { rage: 6 }, sk: { a1: 99, a2: 99 }, flash: 0, lunge: 0, castT: 0 };
Object.assign(bossRuntime, { monsters: [ragingBoss], boss: ragingBoss, bossWave: true, waveTotal: 1, spawnLeft: 0, bossT: 100, state: 'fight' });
runtime.battle.update(0.25);
assert.equal(ragingBoss.spd, 130, 'Flame Lord rage should increase movement speed by 30%');
assert.equal(ragingBoss.atkMult, 1.35, 'Flame Lord rage should increase attack damage by 35%');
assert.ok(Math.abs(ragingBoss.buffs.rage - 5.75) < 1e-9, 'Rage duration should tick once per frame');

// Shadow King adds count for lifetime stats/rewards, not toward the boss-wave quota.
const beforeSummonKills = state.stats.kills, beforeWaveKills = bossRuntime.waveKills;
runtime.battle.kill({ def: c.monsters.shadow_wraith, boss: false, summoned: true, elite: false, hp: 1, maxHp: 1, x: 200, dead: false });
assert.equal(state.stats.kills, beforeSummonKills + 1, 'Summoned enemies must count in total kill statistics');
assert.equal(bossRuntime.waveKills, beforeWaveKills, 'Summoned enemies must not inflate the wave completion counter');
state.wave = 3;
runtime.battleState.waveTotal = 5;
runtime.battleState.spawnLeft = 5;
runtime.battle.spawn(false);
const elite = runtime.battleState.monsters.at(-1);
assert.equal(elite.elite, true, 'Wave 3 should spawn one elite enemy');
const eliteBaseReward = runtime.waves.enemyGold(state.wave, false, elite.def);
const goldBeforeElite = state.gold;
const contextMath = vm.runInContext('Math', sandbox);
const originalRandom = contextMath.random;
contextMath.random = () => 0.99; // keep the standard-item drop roll deterministic
runtime.battle.kill(elite);
contextMath.random = originalRandom;
assert.equal(state.gold - goldBeforeElite, Math.ceil(eliteBaseReward * c.balance.elite.goldMult), 'Elite enemy should grant the configured bonus gold');

runtime.battleState.monsters = [];
state.wave = 2;
runtime.battleState.waveTotal = 5;
runtime.battleState.spawnLeft = 5;
runtime.battle.spawn(false);
assert.equal(runtime.battleState.monsters.at(-1).elite, false, 'Ordinary waves should not unexpectedly spawn elites');

const mainSource = fs.readFileSync(path.join(jsDir, 'main.js'), 'utf8');
assert.match(fs.readFileSync(path.join(jsDir, 'core.js'), 'utf8'), /T\.offlineReward=seconds=>/, 'Offline rewards should have one shared calculation');
assert.match(mainSource, /visibilitychange.*T\.offlineReward\(sec\)/, 'Returning to a sleeping tab should use the shared offline reward');
assert.doesNotMatch(mainSource, /7200|dt\*\.35/, 'Tab-sleep rewards must not use conflicting hard-coded limits or efficiency');
assert.match(fs.readFileSync(path.join(jsDir, 'core.js'), 'utf8'), /mobPool\(S\.wave\)/, 'Offline economy must use the current zone enemy pool');

const uiSource = fs.readFileSync(path.join(jsDir, 'ui.js'), 'utf8');
assert.match(uiSource, /Награда уже зачислена и сохранена/, 'Offline reward modal must state that rewards are already saved');
assert.match(uiSource, /S\.maxWave-base-1/, 'World map should count completed waves, not the next unlocked wave');

// Offline income must use the real monster pool of the current zone and obey the configured cap.
state.wave = 21;
const zonePool = runtime.waves.mobPool(state.wave);
assert.equal(zonePool.length, 2, 'Wave 21 should resolve to the two forest enemies');
assert.equal(zonePool[0].id, 'forest_a', 'Wave 21 must use forest economics');
const expectedAvgHp = zonePool.reduce((sum, def) => sum + runtime.waves.enemyHp(state.wave, false, def), 0) / zonePool.length;
const expectedAvgGold = zonePool.reduce((sum, def) => sum + runtime.waves.enemyGold(state.wave, false, def), 0) / zonePool.length;
const expectedKills = Math.min(runtime.derived.totalDps() / expectedAvgHp * 120 * c.balance.offline.efficiency,
  120 / Math.max(c.balance.enemy.spawnMin,runtime.waves.spawnInt(state.wave)) * c.balance.offline.efficiency);
const expectedOfflineGold = Math.floor(expectedKills * expectedAvgGold * runtime.derived.goldMult());
const offlineResult = runtime.offlineReward(120);
assert.equal(offlineResult.gold, expectedOfflineGold, 'Offline reward must use zone-specific HP and gold multipliers');
assert.equal(runtime.offlineReward(c.balance.offline.maxSeconds * 10).seconds, c.balance.offline.maxSeconds, 'Offline duration must respect the configured maximum');
state.wave = 1;

// Imported saves cannot reuse item UIDs even when their nextUid counter is stale or duplicated.
const savedState = JSON.parse(JSON.stringify(runtime.S));
savedState.nextUid = 1;
savedState.heroes.archer.rec = true;
savedState.party = ['paladin', 'archer'];
savedState.order = ['archer', 'archer', 'paladin', 'missing-hero'];
savedState.inventory = [
  { uid: 'i99', defId: 'rusty_sword', slot: 'weapon', rarity: 'common', ilvl: 2, stats: { dmgPct: 10 }, value: 12 },
  { uid: 'i99', defId: 'leather_vest', slot: 'armor', rarity: 'common', ilvl: 2, stats: { hpFlat: 30 }, value: 12 }
];
storage.set('tbh_idle_equipment_v1', JSON.stringify(savedState));
runtime.load();
assert.equal(runtime.S.inventory[0].uid, 'i99', 'First valid item UID should be preserved on import');
assert.notEqual(runtime.S.inventory[1].uid, 'i99', 'Duplicate item UID must be repaired instead of overwriting another item');
assert.equal(runtime.S.nextUid, 100, 'UID counter must advance beyond all imported numeric UIDs');
assert.deepEqual(Array.from(runtime.S.order), ['archer', 'paladin'], 'Imported hero order must be deduplicated and unknown heroes removed');
assert.equal(runtime.items.roll(1, false).uid, 'i100', 'Next generated item UID must not collide with imported items');

// Legacy/imported inventories already above capacity are cleaned on load, not left broken until the next drop.
const overCapSavedState = JSON.parse(JSON.stringify(runtime.S));
overCapSavedState.nextUid = 1;
overCapSavedState.inventory = Array.from({ length: c.balance.drops.inventoryCap + 7 }, (_, i) => ({
  uid: `i${i + 1}`, defId: 'leather_vest', slot: 'armor', rarity: 'common', ilvl: 1,
  stats: { hpFlat: 30, defPct: 2 }, value: 100
}));
const goldBeforeLoadTrim = overCapSavedState.gold;
storage.set('tbh_idle_equipment_v1', JSON.stringify(overCapSavedState));
runtime.load();
assert.equal(runtime.S.inventory.length, c.balance.drops.inventoryCap, 'Over-cap save must be trimmed to the configured inventory cap during load');
assert.equal(runtime.S.gold - goldBeforeLoadTrim, 700, 'Load-time inventory trim must sell exactly the seven excess items');
assert.equal(runtime.S.nextUid, c.balance.drops.inventoryCap + 8, 'UID sequence must remain above all imported item IDs after trimming');

// Damaged rows and malformed optional fields should not destroy an otherwise valid save.
const resilientSave = JSON.parse(JSON.stringify(runtime.S));
resilientSave.gold = '125';
resilientSave.settings = { speed: 99, muted: false, auto: true, autoSell: 'off' };
resilientSave.inventory = [
  { uid: 'i901', defId: 'rusty_sword', slot: 'weapon', rarity: 'common', ilvl: 2, stats: { dmgPct: 10 }, value: 12 },
  null,
  'broken-item-row'
];
resilientSave.equipped = {};
for (const hero of Object.values(resilientSave.heroes)) for (const slot of Object.keys(hero.equip || {})) hero.equip[slot] = null;
storage.set('tbh_idle_equipment_v1', JSON.stringify(resilientSave));
const resilientResult = runtime.load();
assert.equal(resilientResult.hadSave, true, 'A partly damaged save should remain a valid loaded save');
assert.equal(runtime.S.gold, 125, 'Valid gold data should survive malformed optional fields');
assert.equal(runtime.S.settings.speed, 1, 'Invalid game speed should be clamped to the default');
assert.equal(runtime.S.inventory.length, 1, 'Invalid item rows should be ignored without resetting the save');
assert.equal(runtime.S.inventory[0].uid, 'i901', 'Valid inventory rows should remain intact');
assert.deepEqual(Array.from(runtime.S.party), ['paladin', 'archer'], 'Malformed party data must rebuild the party from already recruited heroes');

// Wrong JSON shapes in optional properties are normalized, not treated as fatal save corruption.
const malformedFields = JSON.parse(JSON.stringify(runtime.S));
malformedFields.gold = 200;
malformedFields.heroes = null;
malformedFields.party = { paladin: true };
malformedFields.inventory = { item: 'not-an-array' };
malformedFields.equipped = [];
malformedFields.order = 'not-an-array';
malformedFields.settings = [];
storage.set('tbh_idle_equipment_v1', JSON.stringify(malformedFields));
const normalizedResult = runtime.load();
assert.equal(normalizedResult.hadSave, true, 'Malformed optional field shapes should be normalized');
assert.equal(runtime.S.gold, 200, 'Valid currency should survive optional field normalization');
assert.equal(runtime.S.inventory.length, 0, 'Non-array inventory should normalize to empty inventory');
assert.deepEqual(Array.from(runtime.S.party), ['paladin'], 'Invalid party shape should fall back to the free Paladin');
assert.equal(runtime.S.settings.speed, 1, 'Invalid settings object should fall back to default speed');

// Invalid JSON is a recoverable fresh-start path and must not leave a half-loaded party.
storage.set('tbh_idle_equipment_v1', '{broken json');
const previousSandboxConsole = sandbox.console;
sandbox.console = { ...console, warn: () => {} }; // expected warning for the corrupt-JSON recovery case
const corruptResult = runtime.load();
sandbox.console = previousSandboxConsole;
assert.equal(corruptResult.hadSave, false, 'Unparseable save should be reported as a fresh start');
assert.equal(runtime.S.gold, c.balance.startGold, 'Unparseable save should reset to configured starting gold');
assert.equal(runtime.S.wave, 1, 'Unparseable save should reset to wave 1');
assert.deepEqual(Array.from(runtime.S.party), ['paladin'], 'Corrupt save recovery must create a playable party');
storage.clear();
runtime.load();
runtime.S.gems = c.balance.divine.shopCost;
const divineCountBefore = runtime.S.inventory.length;
assert.equal(runtime.econ.buyDivine(), true, 'Divine exchange should accept the configured diamond cost');
assert.equal(runtime.S.gems, 0, 'Divine exchange should spend the diamonds');
assert.equal(runtime.S.inventory.length, divineCountBefore + 1, 'Divine exchange should add one item');
assert.equal(runtime.S.inventory.at(-1).rarity, 'divine', 'Exchange reward must have divine rarity');
assert.equal(c.rarities.find(r => r.id === 'divine').mult, 10.5, 'Divine gear must be about ten times stronger than common base gear');
assert.equal(c.rarities.find(r => r.id === 'divine').color, '#ff334f', 'Divine rarity must use a crimson frame color');
const divineItem = runtime.S.inventory.at(-1);
const divineStatKey = Object.keys(divineItem.stats)[0];
const divineStatBefore = divineItem.stats[divineStatKey];
const divineUid = divineItem.uid;
runtime.S.inventory = runtime.S.inventory.filter(it => it.uid !== divineUid);
runtime.S.equipped[divineUid] = divineItem;
runtime.S.heroes.paladin.equip[divineItem.slot] = divineUid;
runtime.S.gold = 100000000;
assert.equal(runtime.items.enhance(divineUid), true, 'Equipped items should be temperable from the hero dossier');
assert.equal(divineItem.enhance, 1, 'Equipped item temper rank should increase');
assert.ok(divineItem.stats[divineStatKey] > divineStatBefore, 'Equipped item stats should increase after tempering');
// Old saves created with the former 5.2 divine multiplier should be upgraded once on load.
const oldDivine = { ...divineItem, uid: 'i900001', divineScale: undefined, enhance: 0, stats: { [divineStatKey]: 52 } };
runtime.S.equipped = {};
runtime.S.heroes.paladin.equip[divineItem.slot] = null;
storage.set('tbh_idle_equipment_v1', JSON.stringify({ ...runtime.S, inventory: [oldDivine], equipped: {}, heroes: runtime.S.heroes }));
runtime.load();
assert.ok(runtime.S.inventory[0].stats[divineStatKey] >= 104, 'Legacy divine item stats should migrate to the new divine power tier');

console.log(`OK: ${jsFiles.length} JavaScript modules parsed; 8 heroes (including 2 tanks and 2 healers), 20 zones, 40 campaign bosses, ${expectedImages.size} WebP assets plus authored SVG campaign graphics, no legacy atlases/source crops, reserve-equipment, inventory, kill-based hero XP, flexible formation, Atlas upgrades, divine rarity, save-migration, skill-critical, boss-mechanics, offline-reward and elite-encounter regression tests verified.`);

// Item artwork is kept in uniform square WebP tiles to prevent visual drift.
for (const name of ['sword','axe','staff','blade','vest','mail','shield','plate','coin','fang','feather','seal']) {
  const p = path.join(root, `assets/items/${name}.webp`);
  assert.ok(fs.existsSync(p), `Missing item icon: ${name}`);
  const b = fs.readFileSync(p);
  assert.equal(b.toString('ascii', 0, 4), 'RIFF', `Invalid WebP: ${name}`);
  assert.equal(b.toString('ascii', 8, 12), 'WEBP', `Invalid WebP: ${name}`);
  assert.ok(b.length > 1000, `Suspiciously small item icon: ${name}`);
}
console.log('item icon dimensions and files: OK');


// Local save refresh: keep the original save key/format and rotate a safety copy before overwriting.
for (let i = 1; i <= 3; i++) storage.delete('tbh_autobackup_' + i);
storage.set('tbh_idle_equipment_v1', JSON.stringify({ ...runtime.S, gold: 100, wave: 1 }));
runtime.S.gold = 12345;
assert.equal(runtime.save(), true, 'Local save should return success');
const firstSaved = JSON.parse(storage.get('tbh_idle_equipment_v1'));
assert.equal(firstSaved.gold, 12345, 'Local save must persist current progress');
runtime.S.gold = 23456;
assert.equal(runtime.save(), true, 'Second local save should succeed');
const autoBackup = JSON.parse(storage.get('tbh_autobackup_1'));
assert.ok(autoBackup && autoBackup.raw, 'Automatic local safety backup should be created');
assert.equal(JSON.parse(autoBackup.raw).gold, 100, 'A fresh backup must capture the prior valid save');
assert.equal(JSON.parse(storage.get('tbh_autobackup_1')).raw, autoBackup.raw, 'Second save within 30 seconds must not rotate the backup');
assert.equal(JSON.parse(storage.get('tbh_idle_equipment_v1')).gold, 23456, 'Main save must contain the latest progress');
assert.equal(runtime.saveBackups.get(0).raw, autoBackup.raw, 'Automatic backup API should expose the previous save');

// A new wave must not reset ready skill cooldowns or passive counters.
const battleState = runtime.battleState;
runtime.bx.zoneBg = () => null;
runtime.bx.banner = () => {};
runtime.S.heroes.paladin.rec = true;
runtime.S.party = ['paladin'];
Object.assign(battleState.hs.paladin, { dead: false, hp: 100, maxHp: 100, walkOff: 72, sk: { a1: 0, a2: 7, mom: 3, sharp: 2, arcane: 4 }, buffs: { haste: 1.5 } });
runtime.battleState.damageByHero = { paladin: 99 };
runtime.battle.startWave(1, { silent: true });
assert.deepEqual({ ...battleState.damageByHero }, {}, 'Per-wave damage scoreboard must reset when a new wave begins');
assert.equal(battleState.hs.paladin.sk.a1, 0, 'A fully charged skill must remain ready at the next wave');
assert.equal(battleState.hs.paladin.sk.a2, 7, 'A partially charged skill must keep its remaining cooldown');
assert.equal(battleState.hs.paladin.sk.mom, 3, 'Passive combat counters should not be reset at wave transition');
assert.equal(battleState.hs.paladin.buffs.haste, 1.5, 'Short combat buffs should continue through the inter-wave transition');

// Travel preserves world progress while heroes regroup at their centered homes.
battleState.advance = 90;
Object.assign(battleState.hs.paladin,{x:400,home:80,walkOff:320,lunge:0,castT:0,cool:999});
battleState.monsters = []; battleState.projs = [];
battleState.spawnLeft = 1; battleState.spawnT = 99;
battleState.state = 'inter'; battleState.t = 99; battleState.combatUntil = 0;
const interTravelBefore=battleState.travel;
for(let tick=0;tick<70;tick++)runtime.battle.update(.05);
assert.ok(battleState.advance>=90,'World progress must not reset to the far-left edge');
assert.ok(Math.abs(battleState.hs.paladin.walkOff)<.01,'Melee hero must rejoin its traveling formation');
assert.equal(battleState.hs.paladin.x,battleState.hs.paladin.home);
assert.ok(battleState.travel>interTravelBefore&&battleState.cameraMoving,'Regrouping must preserve traveling scenery');
battleState.state='fight';runtime.battle.update(.1);
assert.ok(Math.abs(battleState.hs.paladin.walkOff)<.01,'A spawn gap must keep the party in formation');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.doesNotMatch(html, /firebase-(?:config|cloud)\.js/, 'Firebase account/cloud scripts must be removed for local-only saves');
assert.ok(!fs.existsSync(path.join(root, 'functions')), 'Firebase Cloud Functions must not ship in the local-only build');
const uiSourceFinal = fs.readFileSync(path.join(jsDir, 'ui.js'), 'utf8');
assert.match(uiSourceFinal, /cv\.width=128;cv\.height=128/, 'Squad portraits must render from a high-resolution backing canvas');
assert.match(html, /data-tab=\"squad\"/, 'Dedicated squad management tab must exist');
assert.match(html, /id=\"damageStats\"/, 'Damage ranking must have a dedicated UI container');
assert.doesNotMatch(html, /id=\"log\"|ЖУРНАЛ НАХОДОК/, 'Inventory journal must be fully removed');
assert.match(uiSourceFinal, /data-unequip-gear/, 'Hero dossier must support unequipping gear');
assert.match(uiSourceFinal, /data-equip-gear/, 'Hero dossier must support equipping gear');
assert.match(uiSourceFinal, /data-hero-prev[\s\S]*data-hero-next/, 'Hero dossier must provide party navigation arrows');
assert.doesNotMatch(uiSourceFinal, /addLog|logHead|logDock/, 'Journal UI handlers and helpers must be removed');
assert.match(fs.readFileSync(path.join(jsDir, 'battle.js'), 'utf8'), /damageByHero\[o\.heroId\]/, 'Combat damage must be attributed to its hero');
assert.match(fs.readFileSync(path.join(jsDir, 'battle-skills.js'), 'utf8'), /heroId:hd\.id/, 'Hero skill damage must be attributed to its caster');
const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
assert.match(css, /\.portrait canvas\{display:block;width:68px;height:68px;image-rendering:auto\}/, 'Hero portraits should render smoothly at a larger display size');
assert.match(css, /safe-area-inset-bottom/, 'Mobile dialogs must respect device safe areas');
assert.match(css, /max-height:min\(90dvh,900px\)/, 'Dialogs must fit within mobile viewport height');
assert.match(fs.readFileSync(path.join(jsDir, 'battle.js'), 'utf8'), /leftClearance=.*modelHalf/);
// A chase must never push the only active melee hero beyond the mobile arena.
const originalArenaWidth = runtime.bx.W, originalArenaScale = runtime.bx.SC;
runtime.bx.W = 360;
runtime.bx.SC = 3;
runtime.S.party = ['paladin'];
runtime.S.order = ['paladin'];
runtime.S.heroes.paladin.rec = true;
runtime.battleState.monsters = [{
  def: c.monsters.shadow_wraith, x: 440, hp: 1e9, maxHp: 1e9,
  dead: false, deathT: 0, slot: 0, atkT: 999, spd: 135, baseSpd: 135,
  buffs: {}, dmg: 1, flash: 0, lunge: 0, castT: 0, boss: false, flying: true
}];
runtime.battleState.state = 'fight';
runtime.battleState.bossWave = false;
runtime.battleState.spawnLeft = 1;
runtime.battleState.spawnT = 999;
runtime.battleState.advance = 0;
runtime.battleState.projs = [];
runtime.battleState.parts = [];
const mobilePaladin = runtime.battleState.hs.paladin;
Object.assign(mobilePaladin, {
  hp: runtime.derived.heroStats('paladin').maxHp,
  maxHp: runtime.derived.heroStats('paladin').maxHp,
  dead: false, walkOff: 900, cool: 999,
  sk: { a1: 999, a2: 999, mom: 0, sharp: 0, arcane: 0 }, buffs: {}
});
for (let tick = 0; tick < 40; tick++) {
  runtime.battle.update(0.05);
  assert.ok(mobilePaladin.x <= 360 - 10 * runtime.bx.K(), 'Mobile melee hero must stay within the visible arena');
}
assert.ok(runtime.battleState.monsters[0].x < 340, 'Enemy must reach the visible arena instead of being fought off-screen');
runtime.bx.W = originalArenaWidth;
runtime.bx.SC = originalArenaScale;

// The new Atlas is a full-width accessible passive tree, not four cramped cards.
for (const branch of ['Gold','Health','Damage','Loot']) {
  assert.match(html, new RegExp('id="atlasScene' + branch + '"'), 'Atlas scene missing: ' + branch);
  assert.match(html, new RegExp('id="atlasTab' + branch + '"'), 'Atlas tab missing: ' + branch);
}
assert.match(html, /id="atlasInvest"/, 'Purchases must be exposed by the Atlas inspector');
assert.match(uiSourceFinal, /atlasStarRoutes/, 'Atlas should draw connections between skill nodes');
assert.match(uiSourceFinal, /atlasSelectedIndex/, 'Atlas nodes must support inspecting previously learned and locked passives');
assert.match(css, /\.atlasConstellation \.atlasSkillNode/, 'Responsive Atlas node styling must be present');
assert.doesNotMatch(fs.readFileSync(path.join(jsDir,'battle.js'),'utf8'), /СЛЕДУЮЩАЯ ВОЛНА|передышка · отряд возвращается/, 'Inter-wave countdown panel must not be rendered');
console.log('Mobile combat bounds, hidden inter-wave countdown and connected passive Atlas structure: OK.');

console.log('Local-only save, rotating backups, seamless wave cooldowns, continuous inter-wave travel, forward-only combat movement, high-resolution hero portraits and responsive modal regressions: OK.');

// Audiovisual regressions: check stable rendering, class feedback and visibility gating.
const battleDrawSource=fs.readFileSync(path.join(jsDir,'battle-draw.js'),'utf8');
const battleSource=fs.readFileSync(path.join(jsDir,'battle.js'),'utf8');
const mainSourceVisual=fs.readFileSync(path.join(jsDir,'main.js'),'utf8');
assert.match(battleDrawSource, /bx\.drawTravelWorld=/, 'Battlefield must include a rendered traveling road');
assert.match(battleDrawSource, /travel\*\.94/, 'Road stones must scroll with traveled distance');
assert.match(battleDrawSource, /ctx\.globalAlpha\*=o\.alpha/, 'Enemy fade must preserve parent canvas transparency');
assert.match(battleSource, /bx\.drawTravelWorld\(G,z\)/, 'Traveling road must be part of the rendered battlefield');
assert.match(battleSource, /ctx\.save\(\);const shake=B\.shake/, 'Screen shake must not leave transparent borders');
assert.match(battleSource, /bx\.heroFx\(hd\.id/, 'Hero-specific impact effects must be used by attacks');
assert.match(battleDrawSource, /p\.kind==="leaf"/, 'Druid leaf particle renderer should be installed');
assert.match(mainSourceVisual, /if\(!document\.hidden\)/, 'Hidden tabs must not continue rendering or advancing battle frames');
assert.doesNotMatch(uiSourceFinal,/E\.on\("gold",\(\)=>renderSquad\(\)\)/, 'Gold drops must not recreate the squad DOM each kill');
for(const id of ['paladin','archer','mage','monk','rogue','necro','barbarian','druid']) {
  assert.match(audioSource,new RegExp('\\b'+id+'\\(\\)\\{'),id+' requires a distinctive class attack sound');
}
assert.match(audioSource,/function stopVoices\(\)/, 'Audio nodes must be cancelled on tab leave');
assert.match(audioSource,/AC\.suspend\(\)/, 'Background audio must suspend its context');
assert.match(audioSource,/visibilitychange/, 'Audio must follow browser visibility');
assert.match(audioSource,/isForeground\(\)\|\|AC\.state!==/, 'SFX must never start when the page lacks focus');
assert.match(audioSource,/128-step adaptive/, 'The score should be original and adaptive per zone');

// Runtime WebAudio mock: playing in foreground, then closing tab, then returning
// must never emit a burst of stale SFX; foreground playback should resume.
let playCount=0,stopCount=0,blocked=0,foregroundFlag=true;
const hooks={};
const audioEvents={};
const makeParam=()=>({setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
class FakeAudioContext {
  constructor(){this.currentTime=1;this.state='running';this.destination={};audioEvents.context=this}
  createGain(){return {gain:makeParam(),connect(){}}}
  createOscillator(){return {frequency:makeParam(),connect(){},start(){playCount++},stop(){stopCount++}}}
  createBufferSource(){return {playbackRate:{value:1},connect(){},start(){playCount++},stop(){stopCount++}}}
  createBiquadFilter(){return {frequency:makeParam(),Q:{value:1},connect(){}}}
  createBuffer(){return {getChannelData:()=>new Float32Array(64)}}
  suspend(){this.state='suspended';blocked++;return Promise.resolve()}
  resume(){this.state='running';return Promise.resolve()}
}
const audioWindow={TBH:{
    events:{on(name,fn){audioEvents[name]=fn}},
    S:{settings:{muted:false,vol:{master:.85,music:.65,sfx:.6}}},
    waves:{zoneFor:()=>({zone:{musicRoot:110}})}
  },AudioContext:FakeAudioContext,
  addEventListener(name,fn){hooks[name]=fn}};
const audioDocument={hidden:false,hasFocus:()=>foregroundFlag,addEventListener(name,fn){hooks[name]=fn}};
vm.runInNewContext(audioSource,{window:audioWindow,document:audioDocument,
  setInterval:()=>1,clearInterval:()=>{},fetch:()=>Promise.reject(new Error('sample unavailable')),
  console:{warn(){},error(){}},Math,Promise,Map,Set,Float32Array},{filename:'audio.js'});
const testAudio=audioWindow.TBH.audio;
testAudio.init();
testAudio.play('heroAttack',{id:'paladin'});
assert.ok(playCount>0,'Foreground attack must produce sound');
audioDocument.hidden=true;hooks.visibilitychange();
const previousPlayCount=playCount;
testAudio.play('heroAttack',{id:'druid'});
assert.equal(playCount,previousPlayCount,'Hidden tab must discard SFX instead of queuing them');
assert.ok(blocked>0&&stopCount>0,'Hidden tab must suspend AudioContext and cancel active voices');
audioDocument.hidden=false;hooks.visibilitychange();
await Promise.resolve();await Promise.resolve();
audioEvents.context.currentTime+=2;
testAudio.play('heroAttack',{id:'druid'});
assert.ok(playCount>previousPlayCount,'Sound should resume normally after returning to game');
foregroundFlag=false;hooks.blur();
const countBeforeBlur=playCount;
testAudio.play('heroAttack',{id:'mage'});
assert.equal(playCount,countBeforeBlur,'Switching to another window must silence game sounds');
console.log('Foreground-only audio, no stale sound bursts, complete hero feedback, traveling arena, detailed art and stable death rendering: OK.');

// Regression: scenery must scroll only during actual forward walking, not while
// enemies are in melee range. The far panorama must move directionally, not bounce.
{
  const bgSource=fs.readFileSync(path.join(jsDir,'battle.js'),'utf8');
  const movementState=runtime.battleState,hero=movementState.hs.paladin;
  assert.doesNotMatch(bgSource,/Math\.sin\(B\.travel\/285\)/, 'The backdrop must not oscillate backwards');
  assert.match(bgSource,/phase=\(\(offset%dw\)/, 'Panorama must tile as the camera travels in one direction');
  assert.doesNotMatch(bgSource,/previousHeroX/, 'Travel should not depend solely on changes in hero screen coordinates');
  assert.match(bgSource,/B.travel\+=Math.min\(Math.max\(0,dt\),.1\)\*125\*k/, 'Scenery must advance while marching even after heroes are camera-centered');
  assert.match(bgSource,/combatLocked/, 'Camera must stop moving for active combat');

  runtime.bx.W=360;runtime.bx.SC=3;
  runtime.S.party=['paladin'];runtime.S.order=['paladin'];
  movementState.state='fight';movementState.bossWave=false;
  movementState.spawnLeft=1;movementState.spawnT=999;
  movementState.advance=0;movementState.travel=0;movementState.combatUntil=-1;
  movementState.projs=[];movementState.parts=[];movementState.beams=[];
  Object.assign(hero,{
    x:25,home:25,walkOff:0,dead:false,lunge:0,castT:0,
    hp:runtime.derived.heroStats('paladin').maxHp,
    maxHp:runtime.derived.heroStats('paladin').maxHp,cool:999,
    sk:{a1:999,a2:999,mom:0,sharp:0,arcane:0},buffs:{}
  });
  movementState.monsters=[{
    def:c.monsters.shadow_wraith,x:340,hp:1e8,maxHp:1e8,dead:false,deathT:0,
    slot:0,atkT:999,spd:130,baseSpd:130,buffs:{},flash:0,lunge:0,castT:0,
    dmg:1,flying:true,seed:0
  }];
  runtime.battle.update(.05);
  const traveled=movementState.travel;
  assert.ok(traveled>0&&movementState.cameraMoving, 'Camera must move left when heroes walk right');
  movementState.monsters[0].x=hero.x+12;
  runtime.battle.update(.05);
  assert.equal(movementState.travel,traveled,'Camera must freeze exactly on combat engagement');
  assert.equal(movementState.cameraMoving,false,'Camera walking flag must turn off for combat');
  movementState.monsters[0].x=340;
  movementState.combatUntil=movementState.time-2;
  movementState.advance=0;hero.walkOff=0;hero.x=25;hero.home=25;hero.lunge=0;
  runtime.battle.update(.05);
  assert.ok(movementState.travel>traveled,'Camera must resume moving after combat when heroes walk again');

  // Regression from the recorded desktop gameplay: once a hero stops moving
  // on screen, the world must STILL scroll in the travel phase.
  movementState.monsters[0].x=1000;
  movementState.monsters[0].spd=0;movementState.monsters[0].baseSpd=0;
  movementState.combatUntil=movementState.time-2;
  movementState.advance=10000;
  hero.x=360*.58;hero.walkOff=0;
  hero.lunge=0;hero.castT=0;
  runtime.battle.update(.05);
  const screenX=hero.x,worldBefore=movementState.travel;
  runtime.battle.update(.05);
  assert.ok(Math.abs(hero.x-screenX)<.01,
    'Hero should remain in the camera-centered formation after the march cap');
  assert.ok(movementState.travel>worldBefore,
    'Backdrop must keep scrolling while heroes walk in place instead of waiting for x-coordinate movement');

  // A spawn gap still represents travel: no enemy is attacking the party.
  movementState.monsters=[];movementState.spawnLeft=1;movementState.spawnT=999;
  movementState.combatUntil=movementState.time-2;
  const gapTravel=movementState.travel;
  runtime.battle.update(.05);
  assert.ok(movementState.travel>gapTravel&&movementState.cameraMoving,
    'Scenery must scroll in the wave approach phase even if the squad already occupies its on-screen position');
}

// The bundled music must start after a gesture, stop when hidden, and restart
// without overlapping or losing the soundtrack on returning to the page.
{
  let themeStarts=0;
  const themeHooks={};
  class FakeThemeContext extends FakeAudioContext {
    decodeAudioData(){return Promise.resolve({duration:70})}
    createBufferSource(){
      const source=super.createBufferSource(),start=source.start;
      source.start=function(...args){if(source.loop)themeStarts++;start.apply(source,args)};
      return source;
    }
  }
  const musicWindow={TBH:{events:{on(){}},S:{settings:{muted:false,vol:{master:.85,music:.65,sfx:.6}}},
    waves:{zoneFor:()=>({zone:{id:'crystal',musicRoot:110}})}},
    AudioContext:FakeThemeContext,addEventListener(name,fn){themeHooks[name]=fn}};
  const musicDocument={hidden:false,hasFocus:()=>true,addEventListener(name,fn){themeHooks[name]=fn}};
  vm.runInNewContext(audioSource,{window:musicWindow,document:musicDocument,
    setInterval:()=>1,clearInterval:()=>{},
    fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(32)}),
    console:{warn(){},error(){}},Math,Promise,Map,Set,Float32Array},{filename:'audio-file-test.js'});
  musicWindow.TBH.audio.init();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(themeStarts,1,'A decoded main_theme.ogg must start one audible loop');
  musicDocument.hidden=true;themeHooks.visibilitychange();
  assert.equal(themeStarts,1,'Hidden tab must not start another music loop');
  musicDocument.hidden=false;themeHooks.visibilitychange();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(themeStarts,2,'Returning to the tab must restart exactly one soundtrack');
  assert.ok(fs.existsSync(path.join(root,'assets/audio/main_theme.ogg')), 'Bundled soundtrack file must exist');
}
console.log('Walking-only directional parallax, combat freeze/resume and reliable audible soundtrack: OK.');





// v40 late-game regressions. Old equipment must migrate and purchased ranks must
// never overwrite legacy progress or grant invalid item levels.
{
  const wave60=runtime.waves.enemyHp(60,false,runtime.waves.mobPool(60)[0]);
  const zone60=runtime.waves.zoneFor(60),mob60=runtime.waves.mobPool(60)[0];
  const oldWave60=Math.ceil(c.balance.enemy.hpBase*Math.pow(c.balance.enemy.hpGrowth,59)*zone60.hpMult*(mob60.hpMult||1));
  assert.equal(wave60,oldWave60,'Balance before wave 60 must be unchanged by the late-game HP softcap');
  const wave100=runtime.waves.enemyHp(100,false,runtime.waves.mobPool(100)[0]);
  const zone100=runtime.waves.zoneFor(100),mob100=runtime.waves.mobPool(100)[0];
  const oldWave100=Math.ceil(c.balance.enemy.hpBase*Math.pow(c.balance.enemy.hpGrowth,99)*zone100.hpMult*(mob100.hpMult||1));
  assert.ok(wave100<oldWave100/10,'Enemy HP at wave 100 must not exponentially outrun level-capped heroes');
  const old=JSON.parse(JSON.stringify(runtime.S));
  old.heroes.paladin.lvl=125;
  old.heroes.paladin.xp=450;
  old.atlas={gold:8,health:8,damage:8,loot:8};
  old.inventory=[{uid:'armor-old-1',defId:'leather_vest',slot:'armor',rarity:'common',
    ilvl:1,stats:{hpFlat:30,defPct:2},value:90,enhance:0}];
  storage.set('tbh_idle_equipment_v1',JSON.stringify(old));
  runtime.load();
  assert.equal(runtime.S.heroes.paladin.lvl,100,'Imported hero levels must clamp at 100');
  assert.equal(runtime.S.heroes.paladin.xp,0,'Level 100 must not accumulate XP');
  assert.equal(runtime.S.atlas.health,8,'Eight already learned nodes must remain learned after expansion');
  assert.equal(runtime.S.inventory[0].stats.armor,20,'Legacy +2% defense must become 20 armor points');
  assert.equal(runtime.S.inventory[0].stats.defPct,undefined,'Do not keep old percent defense in migrated inventory');
  assert.equal(runtime.items.equip('armor-old-1','paladin'),true,'Legacy armor must remain equipable');
  const stats=runtime.derived.heroStats('paladin');
  assert.equal(stats.armor,20,'Hero should show a numeric armor rating');
  assert.ok(stats.defPct>0&&stats.defPct<c.balance.combat.defCap,'Armor reduces damage by diminishing returns internally');
  runtime.progression.awardKill(100,false);
  assert.equal(runtime.S.heroes.paladin.lvl,100,'Kill XP must respect the hero level cap');

  // Existing 8/8 branches must be able to continue buying node 9+.
  runtime.S.gold=10**14;
  assert.equal(runtime.econ.buyAtlasNode('gold'),true,'Ninth gold node must be unlockable');
  assert.equal(runtime.S.atlas.gold,9);
  while(runtime.S.atlas.gold<c.balance.atlas.maxNodes)assert.equal(runtime.econ.buyAtlasNode('gold'),true);
  assert.equal(runtime.econ.buyAtlasNode('gold'),false,'Atlas must stop at the eighteenth node');
  runtime.S.atlas.loot=18;
  assert.ok(runtime.derived.dropChance()<=.45,'All 18 loot nodes must respect the item drop chance cap');

  assert.deepEqual(Array.from(c.balance.divine.levels),[20,40,60,80,100],'Divine store must expose five item levels');
  assert.ok(!Number.isFinite(runtime.econ.divineCost(35)),'No unsupported level may be bought');
  const price80=runtime.econ.divineCost(80);
  assert.equal(price80,17,'Tier 80 must have an explicit gem price');
  runtime.S.gems=price80;
  const previousLength=runtime.S.inventory.length;
  assert.equal(runtime.econ.buyDivine(80),true,'Divine item level 80 must be purchasable');
  assert.equal(runtime.S.gems,0,'Divine shop must charge exactly the selected tier price');
  assert.equal(runtime.S.inventory.length,previousLength+1);
  assert.equal(runtime.S.inventory.at(-1).ilvl,80,'Purchased item level must exactly match selection');
  assert.equal(runtime.econ.buyDivine(100),false,'Insufficient gems must not grant a level 100 item');

  // Offline diamonds use simulated bosses with a conservative hard cap.
  const roll=vm.runInContext('Math',sandbox),original=roll.random;
  roll.random=()=>0;
  const reward=runtime.offlineReward(c.balance.offline.maxSeconds*2);
  roll.random=original;
  assert.equal(reward.seconds,c.balance.offline.maxSeconds,'Offline duration is capped');
  assert.ok(Number.isInteger(reward.gems)&&reward.gems>=0&&reward.gems<=c.balance.offline.maxGems,
    'Offline crystals must be an integer with a strict anti-inflation cap');
  assert.ok(reward.gems>0,'A powerful late-game team should earn crystals offline');
  const maxSpawned=reward.seconds/Math.max(c.balance.enemy.spawnMin,runtime.waves.spawnInt(runtime.S.wave))*c.balance.offline.efficiency;
  assert.ok(reward.kills<=maxSpawned+.001,'Offline farming must obey spawn-speed throughput, not only theoretical DPS');

  const ui=fs.readFileSync(path.join(jsDir,'ui.js'),'utf8'),htmlDoc=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(ui,/Скупщик трофеев/,'Original Atlas node names must remain intact');
  assert.match(ui,/Сокровищница звёзд/,'Ten extra Atlas nodes must be named');
  assert.match(ui,/x:62,y:84/,'Constellation geometry must include later-game nodes');
  assert.match(htmlDoc,/id="divineLevel"/,'Divine shop must have an item-level selector');
  for(const level of [20,40,60,80,100])assert.match(htmlDoc,new RegExp('value="'+level+'"'),'Divine option '+level+' missing');
  assert.match(ui,/offGems/,'Offline reward modal must visibly display earned crystals');
  assert.match(ui,/st\.armor/,'UI should display numeric armor rather than damage reduction percentages');
  assert.ok(fs.existsSync(path.join(root,'assets/items/divine_halo.svg')),'Divine items need a unique celestial icon treatment');
  assert.ok(fs.existsSync(path.join(root,'assets/items/divine_icons_generated.webp')),'Generated divine artifact sheet must be available');
  assert.match(ui,/divineGeneratedIcon/,'Divine items need generated equipment-type-specific icons');
  console.log('Atlas 18x4, hero level 100, numeric legacy armor, tiered divine store and offline diamonds: OK.');
}


// Campaign v41: progression, equipment requirements and save recovery.
{
  assert.equal(runtime.waves.total(),200);
  assert.equal(runtime.waves.victoryWave(),200);
  const route=['city','gate','forest','waste','mountains','peaks','elfwood','elfcity','deepwood','highlands','dwarf'];
  assert.deepEqual(Array.from(c.levels.slice(0,11),z=>z.id),route);
  const bossIds=new Set();
  for(let wave=5;wave<=200;wave+=5){
    const b=runtime.waves.bossDef(wave);
    assert.ok(b.boss&&b.sprite.src&&b.mechanic);
    bossIds.add(b.id);
  }
  assert.equal(bossIds.size,40);
  assert.equal(new Set(Array.from(bossIds,id=>c.monsters[id].mechanic)).size,40,"No campaign boss may inherit a legacy boss identity");
  const skillNames=Array.from(bossIds).flatMap(id=>{const kit=runtime.bx.BOSS_SKILLS[id];assert.ok(kit?.color&&kit.a1.effect&&kit.a2.effect,id);return [kit.a1.name,kit.a2.name]});
  assert.equal(new Set(skillNames).size,80);
  assert.equal(runtime.waves.zoneFor(200).zone.id,'citadel');
  assert.equal(runtime.waves.zoneFor(201).zone.id,'city');
  assert.ok(runtime.items.roll(200,false).ilvl<=100,'All new equipment must remain usable at max hero level');
  const st=runtime.S;
  st.heroes.rogue.rec=true;st.heroes.rogue.lvl=10;
  st.heroes.paladin.rec=true;st.heroes.paladin.lvl=10;
  st.party=['rogue'];
  const make=(id,defId,ilvl)=>({uid:id,defId,slot:'weapon',rarity:'common',ilvl,stats:{dmgPct:15},value:20});
  const axe=make('class-axe','war_axe',1),staff=make('class-staff','soul_wand',1),dagger=make('class-dagger','shadow_dagger',10),high=make('high-dagger','shadow_dagger',20);
  st.inventory=[axe,staff,dagger,high];st.equipped={};
  for(const h of Object.values(st.heroes))for(const slot of Object.keys(h.equip))h.equip[slot]=null;
  assert.equal(runtime.items.equip(axe.uid,'rogue'),false);
  assert.equal(runtime.items.equip(staff.uid,'rogue'),false);
  assert.equal(runtime.items.equip(high.uid,'rogue'),false);
  assert.equal(runtime.equipReason(high,'rogue'),'Требуется уровень 20');
  assert.equal(runtime.items.equip(dagger.uid,'rogue'),true);
  assert.ok(runtime.items.bestUids().has(high.uid),'Future-level gear must not be flagged as spare');
  runtime.items.autoEquip();
  assert.equal(st.heroes.rogue.equip.weapon,dagger.uid,'Auto equip must enforce level and class');
  st.heroes.mage.rec=false;st.heroes.necro.rec=false;
  assert.ok(!runtime.items.bestUids().has(staff.uid),"Unrecruited-only loot must be spare");
  st.settings.autoSell="spare";const saleGold=st.gold;
  assert.ok(runtime.items.sweepAutoSell(true)>0);assert.ok(!st.inventory.some(i=>i.uid===staff.uid));assert.ok(st.gold>saleGold);
  assert.ok(st.inventory.some(i=>i.uid===high.uid),"Future-level gear must survive automatic sale");
  const fists=make("unhired-fists","monk_fists",1);st.heroes.monk.rec=false;const newGold=st.gold;runtime.items.handleDrop(fists,null,null,"test");assert.ok(!st.inventory.some(i=>i.uid===fists.uid));assert.equal(st.gold,newGold+fists.value);
  st.settings.autoSell="off";
  const oldSave=JSON.parse(JSON.stringify(st));
  oldSave.heroes.rogue.equip.weapon='legacy-axe';
  oldSave.equipped={'legacy-axe':make('legacy-axe','war_axe',1)};
  oldSave.inventory=Array.from({length:c.balance.drops.inventoryCap},(_,i)=>make('migration-'+i,'rusty_sword',1));
  oldSave.gearRecovery=false;oldSave.wave=75;oldSave.maxWave=75;
  storage.set('tbh_idle_equipment_v1',JSON.stringify(oldSave));
  runtime.load();
  assert.equal(runtime.S.wave,75);assert.equal(runtime.S.maxWave,75);
  assert.equal(runtime.S.heroes.rogue.equip.weapon,null);
  assert.equal(runtime.S.inventory.length,c.balance.drops.inventoryCap+1);
  assert.ok(runtime.S.inventory.some(i=>i.uid==='legacy-axe'),'Ineligible legacy gear must be recovered, not sold');
  runtime.save();runtime.load();
  assert.ok(runtime.S.inventory.some(i=>i.uid==='legacy-axe'),'Recovered items must survive another load');
  runtime.items.handleDrop(make('new-loot','rusty_sword',1),null,null,'test');
  assert.ok(runtime.S.inventory.some(i=>i.uid==='legacy-axe'),'Incoming loot cannot delete recovered items');
  assert.equal(runtime.S.inventory.length,c.balance.drops.inventoryCap+1);
}
console.log('Campaign 20 zones / 40 bosses, unique graphics, class and level equipment rules and safe migration: OK.');

// v42: verified first batch of painted assets; all map crests remain unchanged.
{
 const paintedZones=["city","gate","waste","mountains","peaks","elfwood"];
 const paintedEnemies=["city_a","city_b","city_champion","city_lord","gate_a","gate_b","gate_champion","gate_lord","forest_b","forest_champion","waste_a","waste_b","waste_champion","waste_lord","mountains_a","mountains_b","mountains_lord","peaks_a","peaks_b","peaks_lord","elfwood_champion","elfwood_lord"];
 for(const id of paintedZones){const z=c.levels.find(z=>z.id===id);assert.equal(z.bg.src,'assets/zones/campaign/'+id+'.webp');assert.ok(fs.existsSync(path.join(root,z.bg.src)));assert.equal(z.iconArt,'assets/zones/icons/'+id+'.svg');}
 for(const id of paintedEnemies){const d=c.monsters[id];assert.equal(d.sprite.src,'assets/characters/campaign/'+id+'.webp');const data=fs.readFileSync(path.join(root,d.sprite.src));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.ok(fs.existsSync(path.join(root,d.sprite.fb.src)));}
}
console.log('Painted campaign art and original location crests: OK.');

// Wide-screen ranged combat: every ranged class shoots a visible opponent,
// even when the front line is hundreds of pixels ahead of the back line.
{
 const B=runtime.battleState,bx=runtime.bx,saveW=bx.W,saveSC=bx.SC;
 bx.W=1800;bx.SC=5;
 const ids=['archer','mage','necro','druid'];
 runtime.S.party=ids;runtime.S.order=ids;
 for(const id of ids){runtime.S.heroes[id].rec=true;runtime.S.heroes[id].lvl=20;}
 runtime.events.emit('heroes');
 const enemy={def:c.monsters.shadow_wraith,x:1250,hp:1e10,maxHp:1e10,dead:false,deathT:0,slot:0,atkT:999,spd:0,baseSpd:0,buffs:{},dmg:1,flash:0,lunge:0,castT:0,boss:false,flying:false};
 const reset=()=>{Object.assign(B,{monsters:[enemy],projs:[],parts:[],texts:[],beams:[],state:'fight',boss:null,bossWave:false,spawnLeft:1,spawnT:999,advance:0,combatUntil:0});for(const id of ids){const hp=runtime.derived.heroStats(id).maxHp;Object.assign(B.hs[id],{x:80,home:80,walkOff:0,dead:false,hp,maxHp:hp,cool:0,lunge:0,castT:0,sk:{a1:999,a2:999,mom:0,sharp:0,arcane:0},buffs:{}})}};
 reset();runtime.battle.update(.05);
 for(const id of ids)assert.ok(B.projs.some(p=>p.heroId===id&&p.target===enemy),id+' must attack a visible distant target');
 reset();enemy.x=bx.W+50;runtime.battle.update(.05);assert.equal(B.projs.length,0,'No ranged shots at an offscreen enemy');
 enemy.x=1250;reset();B.hs.archer.hp*=.5;const injuredHp=B.hs.archer.hp;runtime.battle.update(.05);assert.ok(B.projs.some(p=>p.type==='heal'&&p.targetHero===B.hs.archer)||B.hs.archer.hp>injuredHp+1,'Healers must prioritize injured allies, including heals that arrive within the same frame');
 reset();B.hs.archer.hp*=.99;runtime.battle.update(.05);assert.ok(B.projs.some(p=>p.heroId==='druid'&&p.target===enemy),'Tiny HP deficits must not block druid attacks');
 reset();for(const id of ids)B.hs[id].cool=999;
 const spr=runtime.getSprite(enemy.def,'mob')[0],ty=bx.gy()-spr.h*bx.scaleOf(spr)*.52;
 B.projs=[{type:'arrow',x:enemy.x-40,y:ty,target:enemy,dmg:100,crit:false,heroId:'archer',done:false}];
 const hpBefore=enemy.hp;runtime.battle.update(.3);assert.ok(enemy.hp<hpBefore,'Fast projectile must hit rather than overshoot its target');
 bx.W=saveW;bx.SC=saveSC;
}
console.log('Wide-screen ranged attacks, healer priority, off-screen guard and high-speed projectile impact: OK.');

// The final v47 campaign vector pass covers every previously unfinished enemy and background.
{
  const updatedEnemies=["forest_a","forest_lord","mountains_champion","peaks_champion","elfwood_a","elfwood_b","deepwood_a","deepwood_b","deepwood_champion","deepwood_lord","dwarf_a","dwarf_b","dwarf_champion","dwarf_lord","mines_a","mines_b","mines_champion","mines_lord","crystal_a","crystal_b","crystal_champion","crystal_lord","marsh_a","marsh_b","marsh_champion","marsh_lord","cursed_a","cursed_b","cursed_champion","cursed_lord","ruins_a","ruins_b","ruins_champion","ruins_lord","volcano_a","volcano_b","volcano_champion","volcano_lord","hellcanyon_a","hellcanyon_b","hellcanyon_champion","hellcanyon_lord","fortress_a","fortress_b","fortress_champion","fortress_lord","citadel_a","citadel_b","citadel_champion","citadel_lord"];
  const updatedZones=["elfcity","dwarf","marsh","ruins","hellcanyon","fortress"];
  const uniqueArt=new Set();
  for(const id of updatedEnemies){const source=fs.readFileSync(path.join(root,c.monsters[id].sprite.fb?.src||c.monsters[id].sprite.src),'utf8');assert.ok(source.includes('campaign artwork v47 — '+id),id+' must use updated campaign art');assert.ok(source.includes('<title>'+c.monsters[id].name+'</title>'),id+' art must match its character');assert.ok((source.match(/<(?:path|ellipse|circle|polygon|rect)\b/g)||[]).length>=10,id+' needs a fully layered illustration');uniqueArt.add(source);}
  assert.equal(uniqueArt.size,50);
  for(const id of updatedZones){const z=c.levels.find(z=>z.id===id);const source=fs.readFileSync(path.join(root,z.bg.src),'utf8');assert.ok(source.includes('campaign panorama v47 — '+id),id+' must use its upgraded panorama');assert.match(source,/viewBox="0 0 1600 500"/);}
  assert.equal(new Set(c.levels.flatMap(z=>[...z.monsters,...Object.values(z.bosses)].map(id=>c.monsters[id].sprite.src))).size,80);
}
console.log('Campaign art v47: 50 upgraded enemies, six upgraded panoramas, all 80 enemy asset paths distinct.');

// v48 raster replacement coverage.
{
 const art=["assets/characters/campaign/forest_a.webp","assets/characters/campaign/forest_lord.webp","assets/characters/campaign/highlands_lord.webp","assets/characters/campaign/deepwood_a.webp","assets/items/bow.webp","assets/items/dagger.webp","assets/items/mace.webp","assets/items/fists.webp","assets/items/wand.webp","assets/items/sickle.webp","assets/items/robe.webp","assets/items/coat.webp"];
 for(const src of art){const bytes=fs.readFileSync(path.join(root,src));assert.equal(bytes.toString('ascii',0,4),'RIFF',src);assert.equal(bytes.toString('ascii',8,12),'WEBP',src);assert.ok(bytes.length>6000,src+' must contain substantive artwork');}
 for(const id of ['forest_a','forest_lord','highlands_lord','deepwood_a'])assert.ok(c.monsters[id].sprite.src.endsWith('.webp'),id);
 const ui=fs.readFileSync(path.join(jsDir,'ui.js'),'utf8');for(const art of ['bow','dagger','mace','fists','wand','sickle','robe','coat'])assert.ok(ui.includes('assets/items/'+art+'.webp'),art);
}

// Additional painted campaign sprites.
for(const id of ["highlands_a","highlands_b","highlands_champion","deepwood_b","marsh_lord","crystal_a","citadel_lord"]){const sp=c.monsters[id].sprite;assert.ok(sp.src.endsWith('.webp'),id);const bytes=fs.readFileSync(path.join(root,sp.src));assert.equal(bytes.toString('ascii',0,4),'RIFF',id);assert.equal(bytes.toString('ascii',8,12),'WEBP',id);assert.ok(bytes.length>5000,id);}
