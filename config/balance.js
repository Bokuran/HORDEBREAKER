      window.TBH = window.TBH || {};
      TBH.config = TBH.config || {};
      TBH.config.balance = {
        startGold: 0,
        hero: { maxLevel:100, dmgGrowth:1.05, milestoneEvery:25, milestoneMult:2, costGrowth:1.13 },
        enemy: { hpBase:10, hpGrowth:1.18, hpSoftcapWave:60, hpLateGrowth:1.10, endgameWave:100, hpEndgameGrowth:1.016, goldBase: 2, goldGrowth: 1.12, goldEndgameGrowth:1.025, countBase: 5, countPerWave: .5, countMax: 12, spawnBase: 1.45, spawnMin: .55, speedBase: 34, speedPerWave: .4, speedMaxBonus: 30 },
        boss: { hpMult: 10, goldMult: 8, timer: 45, finalMult: 2, spawnHpMult: 2.8 },
        elite: { hpMult: 1.5, goldMult: 1.8, waveRemainder: 3 },
        combat: {
          defCap: 60, armorConstant: 250, armorWaveScale: 3,
          monsterDmgPow: .5, monsterDmgScale: 1.7, bossDmgMult: 1.4,
          normalHitCapPct: .45, bossHitCapPct: .70,
          monsterAtkInt: 1.25, bossAtkInt: 1.1
        },
        atlas: { maxNodes:18, goldPerNode:.03, hpPerNode:.06, dmgPerNode:.04, lootPerNode:.015, nodeCosts:[500,1200,2500,5000,10000,20000,40000,80000,160000,320000,640000,1300000,2600000,5200000,10500000,21000000,42000000,84000000] },
        progression: { xpBase:18, xpWave:2, xpGrowth:1.08 },
        divine: { bossGemChance:.28, shopCost:5, statMult:10.5, levels:[20,40,60,80,100], prices:[5,8,12,17,23] },
        economy: { waveBonusMult: 2.5 },
        drops: { chance: .10, bossChance: 1, bossExtraChance: .35, inventoryCap: 60, itemLevelScale: .10, sellBase: 6, sellPerLevel: 3, offlineItemCap: 3 },
        crit: { baseChance: 5, baseDamage: 150 },
        offline: { minSeconds:60, maxSeconds:14400, efficiency:.35, killsPerBossAttempt:50, maxGemAttempts:8, maxGems:4 }
      };
