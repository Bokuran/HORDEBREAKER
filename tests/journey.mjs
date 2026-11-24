import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ogg': 'audio/ogg' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const output = process.env.JOURNEY_ARTIFACTS;
if (output) await fs.mkdir(output, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => window.TBH?.S?.party?.length);
    await page.evaluate(() => { TBH.ui.setPaused(true); TBH.audio.setMuted(true); });
    // Hide only the pause overlay for deterministic screenshots; simulation stays paused.
    await page.addStyleTag({ content: '#pauseOverlay { display: none !important; }' });
    for (const [wave, party, auto] of [[1, ['paladin'], true], [5, ['paladin'], true], [10, ['paladin', 'archer', 'mage', 'necro'], true], [5, ['paladin'], false]]) {
      const result = await page.evaluate(({ wave, party, auto }) => {
        const T = TBH, B = T.battleState;
        T.S.party = [...party]; T.S.order = [...party]; T.S.settings.auto = auto;
        for (const id of party) { T.S.heroes[id].rec = true; T.S.heroes[id].lvl = 50; }
        T.battle.resetVisuals(); T.battle.startWave(wave, { silent: true });
        for (const id of party) {
          const h = B.hs[id]; h.cool = 999; h.sk.a1 = 999; h.sk.a2 = 999;
        }
        let engaged = false;
        for (let tick = 0; tick < 600; tick++) {
          T.battle.update(.05);
          if (B.monsters.some(m => !m.dead) && B.combatUntil > B.time && !B.cameraMoving) { engaged = true; break; }
        }
        // Finish the encounter through the normal kill/reward and clear-wave paths.
        while (B.spawnLeft > 0) { T.battle.spawn(B.bossWave); B.spawnLeft--; }
        for (const m of B.monsters) if (!m.dead) T.battle.kill(m);
        T.battle.update(.01);
        const delay = B.t, next = B.next, before = B.travel;
        let previous = party.map(id => B.hs[id].x), wentBack = false;
        for (let tick = 0; tick < 80; tick++) {
          T.battle.update(.05);
          for (let i = 0; i < party.length; i++) {
            const x = B.hs[party[i]].x;
            if (x < previous[i] - .001) wentBack = true;
            previous[i] = x;
          }
        }
        const drawnText = [], fillText = T.bx.ctx.fillText;
        T.bx.ctx.fillText = function (text, ...args) { drawnText.push(String(text)); return fillText.call(this, text, ...args); };
        try { T.battle.render(); } finally { T.bx.ctx.fillText = fillText; }
        return { engaged, delay, next, before, travel: B.travel, moving: B.cameraMoving, wentBack, state: B.state, wave: T.S.wave, remaining: B.t, drawnText, x: previous, width: T.bx.W };
      }, { wave, party, auto });
      assert.ok(result.engaged, `${name}: encounter must stop travel before victory`);
      assert.equal(result.delay, 5, 'Victory keeps the original five-second delay');
      assert.equal(result.next, auto ? wave + 1 : wave, 'Auto progression/repeat mechanics must stay unchanged');
      assert.equal(result.state, 'inter');
      assert.equal(result.wave, wave, 'Next wave must not start early');
      assert.ok(Math.abs(result.remaining - 1) < .001);
      assert.equal(result.wentBack, false, `${name}: heroes must never return to the left after victory`);
      assert.ok(result.moving && result.travel > result.before, 'Scenery and walking animation must continue between battles');
      assert.ok(result.x.every(x => x > 0 && x < result.width), 'The whole party must remain on screen');
      assert.ok(!result.drawnText.some(text => /СЛЕДУЮЩАЯ ВОЛНА|передышка/.test(text)), 'No countdown panel may be drawn');
      if (output && auto) {
        await page.evaluate(async () => {
          const T = TBH;
          await Promise.all([T.waves.zoneFor(T.S.wave).zone.bg.src, ...T.partyDefs().map(h => h.sprite.src)].map(src => T.loadImage(src)));
          T.battle.render();
        });
        await page.locator('#stageWrap').screenshot({ path: path.join(output, `${name}-wave-${wave}-travel.png`) });
      }
      const nextWave = await page.evaluate(() => {
        for (let tick = 0; tick < 22; tick++) TBH.battle.update(.05);
        return { wave: TBH.S.wave, state: TBH.battleState.state };
      });
      assert.equal(nextWave.wave, auto ? wave + 1 : wave);
      assert.equal(nextWave.state, 'fight');
    }
    // Reduced motion keeps the same timing without animated scenery.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = await page.evaluate(() => {
      const B = TBH.battleState;
      B.monsters = []; B.spawnLeft = 0; B.projs = [];
      TBH.battle.clearWave();
      const before = B.travel;
      for (let i = 0; i < 40; i++) TBH.battle.update(.05);
      return { before, after: B.travel, moving: B.cameraMoving, state: B.state };
    });
    assert.equal(reduced.after, reduced.before);
    assert.equal(reduced.moving, false);
    assert.equal(reduced.state, 'inter');
    assert.deepEqual(errors, [], 'Browser runtime errors');
    await page.close();
    console.log(`${name}: normal/boss victory, solo/full party, five-second travel, next zone, repeat and reduced motion OK`);
  }
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
