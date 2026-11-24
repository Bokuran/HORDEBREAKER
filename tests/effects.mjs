import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.EFFECTS_ARTIFACTS;
if (output) await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.waitForFunction(() => window.TBH?.S?.party?.length);
    await page.evaluate(async () => {
      TBH.ui.setPaused(true); TBH.audio.setMuted(true);
      for (const hd of TBH.config.heroes) TBH.getSprite(hd, 'hero');
      TBH.getSprite(TBH.config.monsters.city_b, 'mob');
      await Promise.all([...TBH.config.heroes.map(h => h.sprite.src), TBH.config.monsters.city_b.sprite.src, TBH.waves.zoneFor(1).zone.bg.src].map(src => TBH.loadImage(src)));
    });
    await page.addStyleTag({ content: '#pauseOverlay{display:none!important}' });
    for (const id of ['paladin', 'archer', 'mage', 'monk', 'rogue', 'necro', 'barbarian', 'druid']) {
      for (const slot of ['a1', 'a2']) {
        const result = await page.evaluate(({ id, slot }) => {
          const T = TBH, B = T.battleState, bx = T.bx, k = bx.K();
          T.S.party = [id, id === 'paladin' ? 'archer' : 'paladin']; T.S.order = [...T.S.party];
          for (const hero of T.S.party) { T.S.heroes[hero].rec = true; T.S.heroes[hero].lvl = 20; }
          T.events.emit('heroes'); T.battle.resetVisuals(); T.battle.startWave(1, { silent: true });
          B.spawnLeft = 1; B.spawnT = 999; B.monsters = [];
          for (const [i, hero] of T.S.party.entries()) {
            const h = B.hs[hero]; h.x = bx.W * .35 - i * 50 * k; h.home = h.x;
            h.hp = h.maxHp * .5; h.sk.a1 = h.sk.a2 = 999; h.cool = 999; h.dead = false;
          }
          const def = T.config.monsters.city_b;
          B.monsters = [bx.W * .35 + 90 * k, bx.W * .35 + 150 * k, bx.W + 50].map((x, i) => ({ def, x, hp: 1e9, maxHp: 1e9, dead: false, slot: i, buffs: {}, atkT: 999, spd: 0, baseSpd: 0, dmg: 1, flash: 0, lunge: 0, castT: 0, seed: 0 }));
          const hd = T.config.heroes.find(d => d.id === id), h = B.hs[id];
          const stats = { ...T.derived.heroStats(id), crit: 0 };
          h.sk[slot] = 0;
          bx.heroSkillTick(hd, h, 0, stats);
          const kinds = B.fx.map(f => f.kind), damage = B.monsters.map(m => 1e9 - m.hp);
          const rain = B.fx.filter(f => f.kind === 'rain').map(f => ({ x: f.x, offset: f.offset, targetX: f.target.x, valid: B.monsters.includes(f.target) }));
          bx.updateFx(.25);
          for (const m of B.monsters) m.flash = Math.max(0, m.flash - .25);
          T.battle.render();
          return { kinds, rain, damage, expectedRainDamage: Math.ceil(stats.dmg * .55 - 1e-9), heroX: h.x, cooldown: h.sk[slot] };
        }, { id, slot });
        assert.ok(result.kinds.length, `${id} ${slot} must create its visual effect`);
        assert.ok(result.cooldown > 0);
        if (id === 'archer' && slot === 'a1') {
          assert.equal(result.rain.length, 6, 'Three arrows for each of the two visible enemies');
          assert.ok(result.rain.every(f => f.valid && f.x === f.targetX && f.x + f.offset > result.heroX));
          assert.deepEqual(result.damage, [result.expectedRainDamage, result.expectedRainDamage, 0], 'Damage must stay unchanged and exclude off-screen enemies');
        }
        if (output) await page.locator('#stageWrap').screenshot({ path: path.join(output, `${width}-${id}-${slot}.png`) });
        const completed = await page.evaluate(() => {
          const B = TBH.battleState, hp = B.monsters.map(m => m.hp);
          TBH.bx.updateFx(3); TBH.battle.render();
          return { count: B.fx.length, unchanged: B.monsters.every((m, i) => m.hp === hp[i]) };
        });
        assert.equal(completed.count, 0, 'Visual effects must expire');
        assert.ok(completed.unchanged, 'Cosmetic arrows must never apply damage a second time');
      }
      // Real basic attacks use the new flight or melee renderer as well.
      const normal = await page.evaluate(id => {
        const T = TBH, B = T.battleState, bx = T.bx;
        B.fx = []; B.parts = []; B.projs = []; B.texts = [];
        for (const hero of T.S.party) { B.hs[hero].sk.a1 = B.hs[hero].sk.a2 = 999; B.hs[hero].hp = B.hs[hero].maxHp; }
        const h = B.hs[id]; h.cool = 0;
        let seen = false;
        for (let tick = 0; tick < 600; tick++) {
          T.battle.update(.025); T.battle.render();
          if (B.fx.some(f => f.heroId === id) || B.projs.some(p => p.heroId === id)) { seen = true; break; }
        }
        return seen;
      }, id);
      assert.ok(normal, `${id}: basic attack must create a visible class effect`);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = await page.evaluate(() => {
      const T = TBH, B = T.battleState, bx = T.bx, hd = T.config.heroes.find(h => h.id === 'archer');
      B.fx = []; bx.skillFx(hd, B.hs.archer, 'a1', B.monsters[0]);
      const count = B.fx.length, visible = B.monsters.filter(bx.visibleEnemy).length;
      bx.updateFx(.2); T.battle.render();
      for (let i = 0; i < 500; i++) bx.heroFx('mage', 100, 100);
      const bounded = B.fx.length <= 96;
      T.battle.resetVisuals();
      return { count, visible, bounded, reset: B.fx.length };
    });
    assert.equal(reduced.count, reduced.visible);
    assert.ok(reduced.bounded); assert.equal(reduced.reset, 0);
    assert.deepEqual(errors, [], 'Browser runtime errors');
    await page.close();
    console.log(`${width}px: all 8 basic attacks, 16 skills, enemy-bound arrow rain, unchanged damage, cleanup and reduced motion OK`);
  }
} finally { await browser.close(); }
