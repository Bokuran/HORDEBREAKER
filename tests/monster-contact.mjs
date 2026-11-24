import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.CONTACT_ARTIFACTS;
if (output) await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.waitForFunction(() => window.TBH?.S?.party?.length);
    await page.evaluate(() => { TBH.ui.setPaused(true); TBH.audio.setMuted(true); });
    await page.addStyleTag({ content: '#pauseOverlay { display: none !important; }' });
    for (const id of ['city_b', 'city_champion']) {
      await page.waitForFunction(id => {
        const T = TBH;
        return T.getSprite(T.config.monsters[id], 'mob')[0].img && T.getSprite(T.config.heroes.find(h => h.id === 'paladin'), 'hero')[0].img;
      }, id);
      for (const speed of [1, 2, 3]) {
        for (const slot of [0, 1, 2]) {
          const result = await page.evaluate(({ id, speed, slot }) => {
            const T = TBH, B = T.battleState, bx = T.bx;
            T.S.party = ['paladin']; T.S.order = ['paladin'];
            T.S.heroes.paladin.rec = true; T.S.heroes.paladin.lvl = 100;
            T.battle.resetVisuals(); T.battle.startWave(id === 'city_b' ? 1 : 5, { silent: true });
            const pool = T.waves.mobPool;
            T.waves.mobPool = () => [T.config.monsters[id]];
            try { T.battle.spawn(id !== 'city_b'); } finally { T.waves.mobPool = pool; }
            B.spawnLeft = 0;
            const m = B.monsters[0], h = B.hs.paladin;
            m.slot = slot; m.dmg = 1; m.hp = m.maxHp = 1e9;
            if (m.sk) m.sk = { a1: 999, a2: 999 };
            h.cool = 999; h.sk.a1 = 999; h.sk.a2 = 999;
            const samples = [], hits = [], hitHero = bx.hitHero;
            bx.hitHero = (...args) => { hits.push(B.time); return hitHero(...args); };
            const dt = speed / 60;
            try {
              for (let tick = 0; tick < Math.ceil(16 / dt); tick++) {
                T.battle.update(dt);
                if (tick * dt > 13) samples.push({ enemy: m.x, hero: h.x });
              }
            } finally { bx.hitHero = hitHero; }
            const sprite = T.getSprite(m.def, 'mob')[0], spr = bx.spr, flips = [];
            bx.spr = (s, x, y, scale, options) => { if (s === sprite) flips.push(options.flip); return spr(s, x, y, scale, options); };
            try { T.battle.render(); } finally { bx.spr = spr; }
            const spread = key => Math.max(...samples.map(s => s[key])) - Math.min(...samples.map(s => s[key]));
            return { enemyDrift: spread('enemy'), heroDrift: spread('hero'), hits: hits.length, flips, gap: m.x - h.x, moving: B.cameraMoving, dead: h.dead };
          }, { id, speed, slot });
          const label = `${width}px ${id} speed=${speed} slot=${slot}`;
          console.log(label, JSON.stringify(result));
          assert.ok(result.enemyDrift < .01, `${label}: enemy contact position must settle without shaking or creeping`);
          assert.ok(result.heroDrift < .01, `${label}: enemy contact must not push the hero back and forth`);
          assert.ok(result.hits >= 2, `${label}: enemy must actually attack at its stopping distance`);
          assert.equal(result.moving, false, `${label}: scenery must stay still during contact`);
          assert.equal(result.dead, false);
          if (id === 'city_b') assert.ok(result.flips.length && result.flips.every(f => f === false), 'Left-facing rat artwork must face the hero without mirroring');
          if (output && id === 'city_b' && speed === 1 && slot === 0) {
            await page.locator('#stageWrap').screenshot({ path: path.join(output, `rat-contact-${width}.png`) });
          }
        }
      }
    }
    assert.deepEqual(errors, [], 'Browser runtime errors');
    await page.close();
  }
} finally { await browser.close(); }
