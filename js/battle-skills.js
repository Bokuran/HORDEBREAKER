(function(){
  const T=window.TBH,bx=T.bx,U=T.util,B=bx.B;
  const K=bx.K,gy=bx.gy,ARC=()=>bx.MELEE_ARC*K();
  const skillHit=(st,mult)=>{const crit=Math.random()*100<st.crit;return{dmg:Math.ceil(st.dmg*mult*(crit?st.critDmg/100:1)-1e-9),crit}};
  const HERO_SKILLS=bx.HERO_SKILLS={
    paladin:{a1:{cd:14},a2:{cd:20}},
    monk:{a1:{cd:10},a2:{cd:18}},
    rogue:{a1:{cd:12},a2:{cd:16}},
    archer:{a1:{cd:13},a2:{cd:16}},
    mage:{a1:{cd:15},a2:{cd:19}},
    necro:{a1:{cd:11},a2:{cd:18}},
    barbarian:{a1:{cd:16},a2:{cd:21}},
    druid:{a1:{cd:15},a2:{cd:19}}
  };
  T.skills={heroes:{
    paladin:{passive:{icon:"🛡",name:"Железная воля",desc:"При HP<30% входящий урон −30%"},a1:{icon:"🛡",name:"Щит веры",cd:14,desc:"Всему отряду −45% урона на 4с"},a2:{icon:"✦",name:"Священный удар",cd:20,desc:"AoE 220% урона вокруг Паладина"}},
    monk:{passive:{icon:"👊",name:"Поток ударов",desc:"Каждое попадание +3% урона (до +30%); сбрасывается при получении урона"},a1:{icon:"💨",name:"Шквал",cd:10,desc:"3 быстрых удара по 80%"},a2:{icon:"☯",name:"Внутренний фокус",cd:18,desc:"Лечит себя на 25% и +30% скор. атаки на 5с"}},
    rogue:{passive:{icon:"🗡",name:"Казнь",desc:"Цели ниже 30% HP получают от разбойника +40% урона"},a1:{icon:"🌀",name:"Веер клинков",cd:12,desc:"Бьёт до 3 ближайших целей по 120%"},a2:{icon:"💀",name:"Смертельный удар",cd:16,desc:"300% урона, гарантированный крит"}},
    archer:{passive:{icon:"🎯",name:"Меткий глаз",desc:"Каждый 3-й выстрел — гарантированный крит"},a1:{icon:"🏹",name:"Град стрел",cd:13,desc:"Урон всем монстрам на поле"},a2:{icon:"➤",name:"Пронзающий выстрел",cd:16,desc:"320% урона одной цели"}},
    mage:{passive:{icon:"✦",name:"Аркановая мощь",desc:"Каждая 5-я атака усиленная ×1.5"},a1:{icon:"🔥",name:"Огненный шторм",cd:15,desc:"AoE 140% урона по группе"},a2:{icon:"❄",name:"Ледяная волна",cd:19,desc:"Урон всем + замедление на 5с"}},
    necro:{passive:{icon:"☠",name:"Последний шанс",desc:"Один раз за волну воскрешает первого павшего союзника с 50% здоровья и даёт 0,75с защиты"},a1:{icon:"✚",name:"Массовое исцеление",cd:11,desc:"Лечит весь отряд"},a2:{icon:"☠",name:"Проклятие",cd:18,desc:"Цель получает +30% урона на 6с"}},
    barbarian:{passive:{icon:"🪓",name:"Неукротимый",desc:"Получает на 18% меньше урона; при HP ниже 40% снижение усиливается ещё на 18%"},a1:{icon:"📣",name:"Боевой рёв",cd:16,desc:"Провоцирует врагов на 4с и получает на 45% меньше урона на это время"},a2:{icon:"💥",name:"Сокрушительный замах",cd:21,desc:"Наносит 240% урона ближайшей цели и 150% соседним врагам"}},
    druid:{passive:{icon:"🌿",name:"Сила природы",desc:"Все исцеления Друида восстанавливают на 20% больше здоровья"},a1:{icon:"🌱",name:"Цветение жизни",cd:15,desc:"Восстанавливает всем союзникам 16% их максимального здоровья"},a2:{icon:"🍃",name:"Корни жизни",cd:19,desc:"Лечит самого раненого союзника на 35% максимального HP и даёт щит на 3с"}}
  }};
  bx.skillIcon=(hd,slot)=>{const m=T.skills&&T.skills.heroes&&T.skills.heroes[hd.id];return (m&&m[slot]&&m[slot].icon)||"✦"};
  bx.heroSwingPos=(hd,h)=>{const k=K(),s=T.getSprite(hd,"hero")[0],sc=bx.scaleOf(s);return {x:h.x+12*k,y:gy()-s.h*sc*0.55}};
  bx.heroSkillTick=(hd,h,dt,st)=>{
    const kit=HERO_SKILLS[hd.id];if(!kit)return;
    const k=K(),findTarget=()=>hd.range==="ranged"?bx.rangedTarget():bx.frontMonster();let fm=findTarget();
    // Distant/off-screen monsters should not trigger global hero skills
    // before the party has reached a visible combat encounter.
    const inEncounterRange=m=>bx.visibleEnemy(m)&&(hd.range==="ranged"||m.x-h.x<=Math.min(bx.W*.52,300*k));
    for(const kk of Object.keys(h.buffs||{}))if(typeof h.buffs[kk]==="number"){h.buffs[kk]-=dt;if(h.buffs[kk]<=0)delete h.buffs[kk]}
    if(h.buffs?.bossSlow>0)h.cool+=dt*.35;
    if(h.buffs?.bossPoison>0){h.poisonClock=(h.poisonClock||0)+dt;if(h.poisonClock>=1){h.poisonClock-=1;bx.applyBossHit(h,Math.max(1,Math.ceil(h.maxHp*.018)),"#a4d95e",{bossId:"campaign_poison"});if(h.dead)return}}else h.poisonClock=0;
    if(h.buffs?.haste>0)h.cool-=dt*0.30;
    if(h.buffs?.darkPact>0)h.cool-=dt*0.25;
    h.sk.a1-=dt;h.sk.a2-=dt;
    const druidNeedsHeal=hd.id!=="druid"||bx.livingHeroes().some(x=>{const a=B.hs[x.id];return !a.dead&&a.maxHp>0&&a.hp<a.maxHp*.94});
    if(h.sk.a1<=0&&inEncounterRange(fm)&&druidNeedsHeal){h.sk.a1=kit.a1.cd;h.castIcon=bx.skillIcon(hd,"a1");h.castT=1.0;T.events.emit("sfx",{name:"heroSkill",arg:{id:hd.id,slot:"a1"}});bx.skillFx(hd,h,"a1",fm);
      if(hd.id==="paladin"){for(const x of bx.livingHeroes())B.hs[x.id].buffs.shieldT=4;bx.float("🛡 Щит веры",h.x,gy()-58*K(),"#ffd866",true);}
      else if(hd.id==="monk"){for(let i=0;i<3;i++){T.battle.damage(fm,Math.ceil(st.dmg*0.8),{crit:false,color:"#ff7a3d",heroId:hd.id});}bx.float("💨 Шквал",h.x,gy()-58*K(),"#ff7a3d",true);}
      else if(hd.id==="rogue"){const list=[...B.monsters].filter(m=>!m.dead).sort((a,b)=>Math.abs(a.x-h.x)-Math.abs(b.x-h.x)).slice(0,3);for(const m of list){T.battle.damage(m,Math.ceil(st.dmg*1.2),{crit:false,color:"#b06cff",heroId:hd.id});}bx.float("🌀 Веер клинков",h.x,gy()-58*K(),"#b06cff",true);}
      else if(hd.id==="archer"){for(const m of B.monsters)if(bx.visibleEnemy(m)){const hit=skillHit(st,0.55);T.battle.damage(m,hit.dmg,{crit:hit.crit,color:"#f2eadb",heroId:hd.id})}bx.float("🏹 Град стрел",h.x,gy()-58*K(),"#f2eadb",true);}
      else if(hd.id==="mage"){const dmg=Math.ceil(st.dmg*1.4);for(const m of B.monsters){if(bx.visibleEnemy(m)&&Math.abs(m.x-fm.x)<260*K())T.battle.damage(m,dmg,{crit:false,color:"#ff7a3d",heroId:hd.id})}bx.shake(2,.2);bx.float("🔥 Огненный шторм",h.x,gy()-58*K(),"#ff7a3d",true);}
      else if(hd.id==="necro"){const heal=Math.ceil(st.dmg*1.6);for(const x of bx.livingHeroes()){bx.applyHeal(B.hs[x.id],heal,false,"necro");}bx.float("✚ Массовое исцеление",h.x,gy()-58*K(),"#78ff7a",true)}
      else if(hd.id==="barbarian"){h.buffs.taunt=4;h.buffs.shieldT=Math.max(h.buffs.shieldT||0,4);bx.float("📣 БОЕВОЙ РЁВ · ПРОВОКАЦИЯ",h.x,gy()-58*K(),"#e88a55",true);}
      else if(hd.id==="druid"){for(const x of bx.livingHeroes()){const ally=B.hs[x.id];bx.applyHeal(ally,Math.ceil(ally.maxHp*.16),false,"druid",true);}bx.float("🌱 ЦВЕТЕНИЕ ЖИЗНИ",h.x,gy()-58*K(),"#91e58a",true);}
    }
    fm=findTarget();
    const druidNeedsRescue=hd.id!=="druid"||!!bx.mostInjuredExcept("druid")||(h.hp<h.maxHp*.65);
    const paladinHasTarget=hd.id!=="paladin"||B.monsters.some(m=>!m.dead&&Math.abs(m.x-h.x)<140*K());
    if(h.sk.a2<=0&&inEncounterRange(fm)&&druidNeedsRescue&&paladinHasTarget){h.sk.a2=kit.a2.cd;h.castIcon=bx.skillIcon(hd,"a2");h.castT=1.0;T.events.emit("sfx",{name:"heroSkill",arg:{id:hd.id,slot:"a2"}});bx.skillFx(hd,h,"a2",fm);
      if(hd.id==="paladin"){for(const m of B.monsters){if(!m.dead&&Math.abs(m.x-h.x)<140*K()){const hit=skillHit(st,2.2);T.battle.damage(m,hit.dmg,{crit:hit.crit,color:"#ffd866",heroId:hd.id});}}bx.shake(3,.25);bx.float("✦ Священный удар",h.x,gy()-58*K(),"#ffd866",true)}
      else if(hd.id==="monk"){bx.applyHeal(h,Math.ceil(h.maxHp*0.25),false);h.buffs.haste=5;bx.float("☯ Внутренний фокус",h.x,gy()-58*K(),"#78ff7a",true)}
      else if(hd.id==="rogue"){T.battle.damage(fm,Math.ceil(st.dmg*3.0*st.critDmg/100),{crit:true,color:"#ff4d62",heroId:hd.id});bx.float("💀 Смертельный удар",h.x,gy()-58*K(),"#ff4d62",true)}
      else if(hd.id==="archer"){const hit=skillHit(st,3.2);T.battle.damage(fm,hit.dmg,{crit:hit.crit,color:"#f2eadb",heroId:hd.id});bx.float("➤ Пронзающий",h.x,gy()-58*K(),"#ffd866",true)}
      else if(hd.id==="mage"){const dmg=Math.ceil(st.dmg*1.1);for(const m of B.monsters){if(bx.visibleEnemy(m)){T.battle.damage(m,dmg,{crit:false,color:"#38dfff",heroId:hd.id});m.buffs=m.buffs||{};m.buffs.chilled=5}}bx.float("❄ Ледяная волна",h.x,gy()-58*K(),"#38dfff",true)}
      else if(hd.id==="necro"){const t=fm;t.buffs=t.buffs||{};t.buffs.cursed=6;bx.float("☠ Проклятие",t.x,gy()-58*K(),"#b06cff",true);}
      else if(hd.id==="barbarian"){const center=fm.x;for(const m of B.monsters){if(m.dead||Math.abs(m.x-center)>150*K())continue;const mult=m===fm?2.4:1.5;const hit=skillHit(st,mult);T.battle.damage(m,hit.dmg,{crit:hit.crit,color:"#e88a55",heroId:hd.id});}bx.shake(3,.25);bx.float("💥 СОКРУШИТЕЛЬНЫЙ ЗАМАХ",h.x,gy()-58*K(),"#e88a55",true);}
      else if(hd.id==="druid"){const ally=bx.mostInjuredExcept("druid")||h;if(ally&&!ally.dead){bx.applyHeal(ally,Math.ceil(ally.maxHp*.35),false,"druid");ally.buffs=ally.buffs||{};ally.buffs.shieldT=Math.max(ally.buffs.shieldT||0,3);bx.float("🍃 КОРНИ ЖИЗНИ",ally.x,gy()-58*K(),"#91e58a",true)}}
    }
  };
  const BOSS_SKILLS=bx.BOSS_SKILLS={
    crystal_titan:{a1:{cd:11,icon:"❄"},a2:{cd:22,hpBelow:0.55,icon:"💎"}},
    flame_lord:{a1:{cd:12,icon:"☄"},a2:{cd:20,hpBelow:0.45,icon:"🔥"}},
    shadow_king:{a1:{cd:12,icon:"🌑"},a2:{cd:20,hpBelow:0.6,icon:"👥"}}
  };
  Object.assign(BOSS_SKILLS,{
  "city_champion": {
    "color": "#d9aa63",
    "a1": {
      "icon": "🗡",
      "name": "Удар из засады",
      "effect": "rear",
      "power": 0.85,
      "cd": 10
    },
    "a2": {
      "icon": "💰",
      "name": "Последний куш",
      "effect": "drain",
      "power": 0.7,
      "cd": 19,
      "hpBelow": 0.48
    }
  },
  "city_lord": {
    "color": "#c7d4e3",
    "a1": {
      "icon": "⚔",
      "name": "Рыцарский вызов",
      "effect": "front",
      "power": 1.1,
      "cd": 11
    },
    "a2": {
      "icon": "🛡",
      "name": "Стальной бастион",
      "effect": "guard",
      "power": 5,
      "cd": 20,
      "hpBelow": 0.55
    }
  },
  "gate_champion": {
    "color": "#e8bd75",
    "a1": {
      "icon": "🏹",
      "name": "Залп дезертиров",
      "effect": "edges",
      "power": 0.75,
      "cd": 12
    },
    "a2": {
      "icon": "📯",
      "name": "Тревожный горн",
      "effect": "summon",
      "power": 1,
      "cd": 21,
      "hpBelow": 0.48
    }
  },
  "gate_lord": {
    "color": "#d6a17c",
    "a1": {
      "icon": "🔨",
      "name": "Таранный удар",
      "effect": "push",
      "power": 0.85,
      "cd": 13
    },
    "a2": {
      "icon": "🪨",
      "name": "Обвал ворот",
      "effect": "all",
      "power": 0.95,
      "cd": 22,
      "hpBelow": 0.55
    }
  },
  "forest_champion": {
    "color": "#9bda58",
    "a1": {
      "icon": "🕸",
      "name": "Липкая паутина",
      "effect": "slowAll",
      "power": 0.35,
      "cd": 10
    },
    "a2": {
      "icon": "☠",
      "name": "Ядовитая кладка",
      "effect": "summonPoison",
      "power": 2,
      "cd": 23,
      "hpBelow": 0.48
    }
  },
  "forest_lord": {
    "color": "#75d879",
    "a1": {
      "icon": "🌿",
      "name": "Живые корни",
      "effect": "slowFront",
      "power": 0.7,
      "cd": 11
    },
    "a2": {
      "icon": "🌳",
      "name": "Соки древнего леса",
      "effect": "healGuard",
      "power": 0.08,
      "cd": 19,
      "hpBelow": 0.55
    }
  },
  "waste_champion": {
    "color": "#e9bd69",
    "a1": {
      "icon": "🦂",
      "name": "Жало царя",
      "effect": "poisonFront",
      "power": 0.65,
      "cd": 12
    },
    "a2": {
      "icon": "🏜",
      "name": "Песчаный панцирь",
      "effect": "guardHit",
      "power": 0.55,
      "cd": 20,
      "hpBelow": 0.48
    }
  },
  "waste_lord": {
    "color": "#edc184",
    "a1": {
      "icon": "🌪",
      "name": "Барханный вихрь",
      "effect": "pushSlow",
      "power": 0.5,
      "cd": 13
    },
    "a2": {
      "icon": "🐍",
      "name": "Кольца змея",
      "effect": "weakest",
      "power": 1.15,
      "cd": 21,
      "hpBelow": 0.55
    }
  },
  "mountains_champion": {
    "color": "#c2dbef",
    "a1": {
      "icon": "🪶",
      "name": "Когти с высоты",
      "effect": "rear",
      "power": 1,
      "cd": 10
    },
    "a2": {
      "icon": "🌬",
      "name": "Шквал крыльев",
      "effect": "push",
      "power": 0.7,
      "cd": 22,
      "hpBelow": 0.48
    }
  },
  "mountains_lord": {
    "color": "#b9b5ad",
    "a1": {
      "icon": "🗿",
      "name": "Каменный кулак",
      "effect": "front",
      "power": 1.3,
      "cd": 11
    },
    "a2": {
      "icon": "⛰",
      "name": "Горный обвал",
      "effect": "allGuard",
      "power": 0.7,
      "cd": 23,
      "hpBelow": 0.55
    }
  },
  "peaks_champion": {
    "color": "#9fdaff",
    "a1": {
      "icon": "🐺",
      "name": "Укус вожака",
      "effect": "slowFront",
      "power": 0.8,
      "cd": 12
    },
    "a2": {
      "icon": "🌕",
      "name": "Зов зимней стаи",
      "effect": "summonRage",
      "power": 2,
      "cd": 19,
      "hpBelow": 0.48
    }
  },
  "peaks_lord": {
    "color": "#a1eaff",
    "a1": {
      "icon": "❄",
      "name": "Ледяная метель",
      "effect": "slowAll",
      "power": 0.55,
      "cd": 13
    },
    "a2": {
      "icon": "👑",
      "name": "Морозный трон",
      "effect": "guardSlow",
      "power": 0.65,
      "cd": 20,
      "hpBelow": 0.55
    }
  },
  "elfwood_champion": {
    "color": "#a2dc86",
    "a1": {
      "icon": "🏹",
      "name": "Терновая стрела",
      "effect": "poisonRear",
      "power": 0.65,
      "cd": 10
    },
    "a2": {
      "icon": "🌹",
      "name": "Кольцо шипов",
      "effect": "edges",
      "power": 1.05,
      "cd": 21,
      "hpBelow": 0.48
    }
  },
  "elfwood_lord": {
    "color": "#65d6aa",
    "a1": {
      "icon": "🍃",
      "name": "Душащая лоза",
      "effect": "slowWeak",
      "power": 0.65,
      "cd": 11
    },
    "a2": {
      "icon": "🌱",
      "name": "Сердце корней",
      "effect": "healSummon",
      "power": 0.06,
      "cd": 22,
      "hpBelow": 0.55
    }
  },
  "elfcity_champion": {
    "color": "#d1c5ff",
    "a1": {
      "icon": "🗡",
      "name": "Лунная дуэль",
      "effect": "strongest",
      "power": 0.95,
      "cd": 12
    },
    "a2": {
      "icon": "⚔",
      "name": "Приказ полководца",
      "effect": "summonGuard",
      "power": 1,
      "cd": 23,
      "hpBelow": 0.48
    }
  },
  "elfcity_lord": {
    "color": "#d8a4ff",
    "a1": {
      "icon": "🌙",
      "name": "Лунное затмение",
      "effect": "healCutAll",
      "power": 0.45,
      "cd": 13
    },
    "a2": {
      "icon": "✨",
      "name": "Осквернённый обряд",
      "effect": "drainAll",
      "power": 0.6,
      "cd": 19,
      "hpBelow": 0.55
    }
  },
  "deepwood_champion": {
    "color": "#c583cf",
    "a1": {
      "icon": "🧿",
      "name": "Терновое проклятие",
      "effect": "markWeak",
      "power": 0.55,
      "cd": 10
    },
    "a2": {
      "icon": "🕷",
      "name": "Круг ведьмы",
      "effect": "poisonAll",
      "power": 0.45,
      "cd": 20,
      "hpBelow": 0.48
    }
  },
  "deepwood_lord": {
    "color": "#9aa8db",
    "a1": {
      "icon": "🌑",
      "name": "Сумеречные ветви",
      "effect": "edgesSlow",
      "power": 0.65,
      "cd": 11
    },
    "a2": {
      "icon": "🌲",
      "name": "Чаща оживает",
      "effect": "healSummon",
      "power": 0.09,
      "cd": 21,
      "hpBelow": 0.55
    }
  },
  "highlands_champion": {
    "color": "#d6aa88",
    "a1": {
      "icon": "🪨",
      "name": "Град валунов",
      "effect": "edges",
      "power": 0.85,
      "cd": 12
    },
    "a2": {
      "icon": "⛏",
      "name": "Раскол хребта",
      "effect": "pushGuard",
      "power": 0.8,
      "cd": 22,
      "hpBelow": 0.48
    }
  },
  "highlands_lord": {
    "color": "#efc28c",
    "a1": {
      "icon": "🦅",
      "name": "Пикирование грифона",
      "effect": "weakest",
      "power": 1.05,
      "cd": 13
    },
    "a2": {
      "icon": "🌬",
      "name": "Вихрь перевала",
      "effect": "pushRage",
      "power": 0.65,
      "cd": 23,
      "hpBelow": 0.55
    }
  },
  "dwarf_champion": {
    "color": "#f4ac65",
    "a1": {
      "icon": "💣",
      "name": "Осадный снаряд",
      "effect": "rearSplash",
      "power": 0.75,
      "cd": 10
    },
    "a2": {
      "icon": "⚙",
      "name": "Подкрепление мастера",
      "effect": "summonGuard",
      "power": 2,
      "cd": 19,
      "hpBelow": 0.48
    }
  },
  "dwarf_lord": {
    "color": "#ffcf76",
    "a1": {
      "icon": "🔨",
      "name": "Удар наковальни",
      "effect": "markFront",
      "power": 0.8,
      "cd": 11
    },
    "a2": {
      "icon": "ᚱ",
      "name": "Рунная перековка",
      "effect": "healGuard",
      "power": 0.1,
      "cd": 20,
      "hpBelow": 0.55
    }
  },
  "mines_champion": {
    "color": "#9cbd98",
    "a1": {
      "icon": "⛏",
      "name": "Зубья рудоеда",
      "effect": "drain",
      "power": 0.85,
      "cd": 12
    },
    "a2": {
      "icon": "🪨",
      "name": "Рудная лавина",
      "effect": "all",
      "power": 0.9,
      "cd": 21,
      "hpBelow": 0.48
    }
  },
  "mines_lord": {
    "color": "#a8c6dc",
    "a1": {
      "icon": "⛓",
      "name": "Железные цепи",
      "effect": "slowRear",
      "power": 0.7,
      "cd": 13
    },
    "a2": {
      "icon": "⚙",
      "name": "Перегрузка ядра",
      "effect": "rageAll",
      "power": 0.6,
      "cd": 22,
      "hpBelow": 0.55
    }
  },
  "crystal_champion": {
    "color": "#b3b6ff",
    "a1": {
      "icon": "🎵",
      "name": "Хрустальный резонанс",
      "effect": "markAll",
      "power": 0.4,
      "cd": 10
    },
    "a2": {
      "icon": "💎",
      "name": "Преломление песни",
      "effect": "edgesGuard",
      "power": 0.8,
      "cd": 23,
      "hpBelow": 0.48
    }
  },
  "crystal_lord": {
    "color": "#8ee9ff",
    "a1": {
      "icon": "💠",
      "name": "Алмазное копьё",
      "effect": "strongest",
      "power": 1.2,
      "cd": 11
    },
    "a2": {
      "icon": "🔷",
      "name": "Несокрушимая грань",
      "effect": "guardHit",
      "power": 0.85,
      "cd": 19,
      "hpBelow": 0.55
    }
  },
  "marsh_champion": {
    "color": "#a5db69",
    "a1": {
      "icon": "🐸",
      "name": "Топкий яд",
      "effect": "poisonWeak",
      "power": 0.6,
      "cd": 12
    },
    "a2": {
      "icon": "🧪",
      "name": "Зелье трясины",
      "effect": "healCutAll",
      "power": 0.7,
      "cd": 20,
      "hpBelow": 0.48
    }
  },
  "marsh_lord": {
    "color": "#a0c966",
    "a1": {
      "icon": "🐍",
      "name": "Три головы",
      "effect": "triple",
      "power": 0.48,
      "cd": 13
    },
    "a2": {
      "icon": "☣",
      "name": "Гнилое дыхание",
      "effect": "poisonAll",
      "power": 0.7,
      "cd": 21,
      "hpBelow": 0.55
    }
  },
  "cursed_champion": {
    "color": "#de7eac",
    "a1": {
      "icon": "🌘",
      "name": "Ночная охота",
      "effect": "weakest",
      "power": 1.15,
      "cd": 10
    },
    "a2": {
      "icon": "🩸",
      "name": "Кровавая погоня",
      "effect": "drainRage",
      "power": 0.85,
      "cd": 22,
      "hpBelow": 0.48
    }
  },
  "cursed_lord": {
    "color": "#a68add",
    "a1": {
      "icon": "🥀",
      "name": "Проклятые корни",
      "effect": "healCutAll",
      "power": 0.55,
      "cd": 11
    },
    "a2": {
      "icon": "🕯",
      "name": "Поглощение жизни",
      "effect": "drainAll",
      "power": 0.85,
      "cd": 23,
      "hpBelow": 0.55
    }
  },
  "ruins_champion": {
    "color": "#d5caac",
    "a1": {
      "icon": "👑",
      "name": "Приговор короля",
      "effect": "markFront",
      "power": 1,
      "cd": 12
    },
    "a2": {
      "icon": "💀",
      "name": "Павшая свита",
      "effect": "summonRage",
      "power": 2,
      "cd": 19,
      "hpBelow": 0.48
    }
  },
  "ruins_lord": {
    "color": "#b99be8",
    "a1": {
      "icon": "☠",
      "name": "Печать династии",
      "effect": "markAll",
      "power": 0.55,
      "cd": 13
    },
    "a2": {
      "icon": "📖",
      "name": "Некротический ритуал",
      "effect": "healSummon",
      "power": 0.11,
      "cd": 20,
      "hpBelow": 0.55
    }
  },
  "volcano_champion": {
    "color": "#ff9c55",
    "a1": {
      "icon": "🐉",
      "name": "Пепельное дыхание",
      "effect": "edgesPoison",
      "power": 0.65,
      "cd": 10
    },
    "a2": {
      "icon": "🔥",
      "name": "Крылья пожара",
      "effect": "pushRage",
      "power": 0.85,
      "cd": 21,
      "hpBelow": 0.48
    }
  },
  "volcano_lord": {
    "color": "#ff7148",
    "a1": {
      "icon": "🌋",
      "name": "Магматический разлом",
      "effect": "all",
      "power": 0.75,
      "cd": 11
    },
    "a2": {
      "icon": "🔥",
      "name": "Расплавленное ядро",
      "effect": "rageAll",
      "power": 0.95,
      "cd": 22,
      "hpBelow": 0.55
    }
  },
  "hellcanyon_champion": {
    "color": "#f47d6a",
    "a1": {
      "icon": "🪓",
      "name": "Клеймо палача",
      "effect": "markWeak",
      "power": 0.85,
      "cd": 12
    },
    "a2": {
      "icon": "⚒",
      "name": "Приговор бездны",
      "effect": "execute",
      "power": 1.35,
      "cd": 23,
      "hpBelow": 0.48
    }
  },
  "hellcanyon_lord": {
    "color": "#c58bf2",
    "a1": {
      "icon": "👻",
      "name": "Похищение души",
      "effect": "drainRear",
      "power": 0.8,
      "cd": 13
    },
    "a2": {
      "icon": "🕳",
      "name": "Пир пожирателя",
      "effect": "drainAll",
      "power": 1,
      "cd": 19,
      "hpBelow": 0.55
    }
  },
  "fortress_champion": {
    "color": "#db8b91",
    "a1": {
      "icon": "🚩",
      "name": "Чёрный приказ",
      "effect": "summon",
      "power": 2,
      "cd": 10
    },
    "a2": {
      "icon": "⚔",
      "name": "Стальной строй",
      "effect": "guardRage",
      "power": 5,
      "cd": 20,
      "hpBelow": 0.48
    }
  },
  "fortress_lord": {
    "color": "#bb91e8",
    "a1": {
      "icon": "🔒",
      "name": "Печать врат",
      "effect": "slowAll",
      "power": 0.65,
      "cd": 11
    },
    "a2": {
      "icon": "⛓",
      "name": "Цепи бездны",
      "effect": "edgesGuard",
      "power": 1,
      "cd": 21,
      "hpBelow": 0.55
    }
  },
  "citadel_champion": {
    "color": "#f085b6",
    "a1": {
      "icon": "😈",
      "name": "Герцогский указ",
      "effect": "healCutAll",
      "power": 0.65,
      "cd": 12
    },
    "a2": {
      "icon": "🩸",
      "name": "Адская десятина",
      "effect": "drainRage",
      "power": 1.1,
      "cd": 22,
      "hpBelow": 0.48
    }
  },
  "citadel_lord": {
    "color": "#ff5980",
    "a1": {
      "icon": "🔥",
      "name": "Корона преисподней",
      "effect": "markAll",
      "power": 0.75,
      "cd": 13
    },
    "a2": {
      "icon": "🌑",
      "name": "Конец света",
      "effect": "cataclysm",
      "power": 1.05,
      "cd": 23,
      "hpBelow": 0.55
    }
  }
});
  // Campaign skills share small effect primitives, never a legacy boss identity.
  bx.campaignBossCast=(m,s,color)=>{
    const k=K(),y=gy(),heroes=bx.livingHeroes().map(h=>B.hs[h.id]).sort((a,b)=>b.x-a.x);
    if(!heroes.length)return;
    const front=heroes[0],rear=heroes[heroes.length-1],weak=[...heroes].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],strong=[...heroes].sort((a,b)=>b.maxHp-a.maxHp)[0],edges=[...new Set([front,rear])];
    const hit=(h,p=s.power)=>{if(h.dead)return 0;const old=h.hp;bx.applyBossHit(h,Math.max(2,Math.ceil(m.dmg*p)),color,m);bx.burst(h.x,y-28*k,color,9,120);return Math.max(0,old-h.hp)};
    const buff=(h,id,t)=>{if(!h.dead){h.buffs=h.buffs||{};h.buffs[id]=Math.max(h.buffs[id]||0,t)}};
    const hits=(list,p)=>list.reduce((n,h)=>n+hit(h,p),0);
    const status=(list,id,t,p=s.power)=>{for(const h of list){hit(h,p);buff(h,id,t)}};
    const guard=(t=5)=>m.buffs.campaignGuard=t;
    const rage=()=>m.buffs.rage=5;
    const heal=p=>{m.hp=Math.min(m.maxHp,m.hp+Math.ceil(m.maxHp*p));bx.ring(m.x,y-35*k,"#78ff7a",65*k)};
    const drain=list=>{const amount=hits(list);m.hp=Math.min(m.maxHp,m.hp+Math.min(Math.ceil(m.maxHp*.06),Math.ceil(amount*2)))};
    const push=()=>B.advance=Math.max(0,B.advance-95*k);
    const summon=(count)=>{const pool=T.waves.mobPool(T.S.wave),BAL=T.config.balance;const active=B.monsters.filter(x=>!x.dead&&x.summoned).length;for(let i=0;i<Math.min(count,Math.max(0,3-active));i++){const def=pool[i%pool.length],hp=Math.ceil(T.waves.enemyHp(T.S.wave,false,def)*.65),x=m.x+U.rand(12,42)*k;B.monsters.push({def,boss:false,summoned:true,hp,maxHp:hp,x,slot:(i+3)%6,jit:0,spd:(BAL.enemy.speedBase+8)*k*(def.speedMult||1)*2.5,dmg:Math.max(1,Math.ceil(Math.pow(hp,BAL.combat.monsterDmgPow)*BAL.combat.monsterDmgScale)),atkT:U.rand(.8,1.4),flash:0,lunge:0,dead:false,deathT:0,seed:U.rand(6.28),flying:!!def.flying,buffs:{},castT:0,castIcon:""});bx.ring(x,y-25*k,color,38*k)}};
    switch(s.effect){
      case "front":hit(front);break;case "rear":hit(rear);break;case "weakest":hit(weak);break;case "strongest":hit(strong);break;
      case "edges":hits(edges);break;case "all":hits(heroes);break;case "triple":hits(heroes.slice(0,3));break;case "rearSplash":hit(rear);if(heroes.length>1)hit(heroes[heroes.length-2],s.power*.5);break;
      case "guard":guard(s.power);break;case "guardHit":guard();hit(front);break;case "allGuard":hits(heroes);guard();break;case "edgesGuard":hits(edges);guard();break;case "healGuard":heal(s.power);guard();break;case "guardRage":guard(s.power);rage();break;
      case "push":push();hits(edges);break;case "pushSlow":push();status(heroes,"bossSlow",4);break;case "pushGuard":push();hit(front);guard();break;case "pushRage":push();hits(edges);rage();break;
      case "slowAll":status(heroes,"bossSlow",4);break;case "slowFront":status([front],"bossSlow",5);break;case "slowWeak":status([weak],"bossSlow",5);break;case "slowRear":status([rear],"bossSlow",5);break;case "edgesSlow":status(edges,"bossSlow",4);break;case "guardSlow":guard();status(heroes,"bossSlow",4);break;
      case "poisonFront":status([front],"bossPoison",5);break;case "poisonRear":status([rear],"bossPoison",5);break;case "poisonWeak":status([weak],"bossPoison",5);break;case "poisonAll":status(heroes,"bossPoison",4);break;case "edgesPoison":status(edges,"bossPoison",4);break;
      case "markFront":status([front],"bossMark",6);break;case "markWeak":status([weak],"bossMark",6);break;case "markAll":status(heroes,"bossMark",5);break;case "healCutAll":status(heroes,"bossHealCut",5);break;
      case "summon":summon(s.power);break;case "summonPoison":summon(s.power);status([front],"bossPoison",5,.35);break;case "summonRage":summon(s.power);rage();break;case "summonGuard":summon(s.power);guard();break;case "healSummon":heal(s.power);summon(1);break;
      case "drain":drain([front]);break;case "drainRear":drain([rear]);break;case "drainAll":drain(heroes);break;case "drainRage":drain([weak]);rage();break;case "rageAll":hits(heroes);rage();break;
      case "execute":hit(weak,s.power*(weak.hp/weak.maxHp<.35?1.3:1));break;
      case "cataclysm":status(heroes,"bossMark",5);push();rage();break;
      default:throw new Error("Unknown boss skill "+s.effect);
    }
    m.castColor=color;bx.ring(m.x,y-35*k,color,66*k);bx.burst(m.x,y-35*k,color,24,160);bx.shake(2,.22);bx.float(s.icon+" "+s.name,m.x,y-86*k,color,true);T.events.emit("sfx","boom");
  };
  bx.bossSkillTick=(m,dt)=>{
    if(!m||!m.boss||m.dead)return;const mechanic=m.def.mechanic||m.def.id,kit=BOSS_SKILLS[mechanic];if(!kit)return;
    const k=K(),BAL=T.config.balance;
    m.sk=m.sk||{a1:U.rand(4,kit.a1.cd),a2:U.rand(6,kit.a2.cd)};
    m.buffs=m.buffs||{};
    if(kit.color){for(const slot of ["a1","a2"]){const s=kit[slot];m.sk[slot]-=dt;if(m.sk[slot]<=0&&(!s.hpBelow||m.hp/m.maxHp<=s.hpBelow)){m.sk[slot]=s.cd;m.castIcon=s.icon;m.castT=1.2;bx.campaignBossCast(m,s,kit.color)}}return}
    if(mechanic==="flame_lord"){m._aura=(m._aura||0)+dt;if(m._aura>=2.6){m._aura=0;const fh=bx.frontHero();if(fh){const dmg=Math.max(2,Math.ceil(m.dmg*0.25));bx.applyBossHit(fh,dmg,"#ff7a3d",m);bx.slash(m.x-14*k,gy()-30*k,-1,"#ff7a3d",U.clamp(Math.abs(fh.x-m.x),20*k,ARC()),4);bx.burst(fh.x,gy()-30*K(),"#ff7a3d",6,60)}}}
    const hpPct=m.hp/m.maxHp;
    m.sk.a1-=dt;if(m.sk.a1<=0){m.sk.a1=kit.a1.cd;m.castIcon=kit.a1.icon;m.castT=1.2;
      if(mechanic==="crystal_titan"){
        for(const x of bx.livingHeroes()){const h=B.hs[x.id];B.projs.push({type:"boss",style:"shard",x:m.x-24*k,y:gy()-46*k,targetHero:h,dmg:Math.max(2,Math.ceil(m.dmg*0.65)),color:"#38dfff",spd:430*k,bossId:mechanic,done:false})}
        bx.ring(m.x,gy()-30*k,"#38dfff",44*k);bx.shake(2,.2);bx.float("❄ Ледяной шип",m.x,gy()-76*K(),"#38dfff",true);T.events.emit("sfx","fire");
      }else if(mechanic==="flame_lord"){
        const targets=bx.livingHeroes().sort((a,b)=>b.x-a.x).slice(0,2);
        for(const hd of targets){const h=B.hs[hd.id];const ox=U.rand(-14,14);B.projs.push({type:"boss",style:"rain",x:h.x+ox,ox:ox,y:-20,targetHero:h,dmg:Math.max(2,Math.ceil(m.dmg*0.55)),color:"#ff7a3d",spd:560*k,bossId:mechanic,done:false})}
        bx.shake(2,.25);bx.float("☄ Огненный дождь",m.x,gy()-76*K(),"#ff7a3d",true);T.events.emit("sfx","boom");
      }else{
        B.advance=Math.max(0,B.advance-140*k);
        B.projs.push({type:"boss",style:"wave",x:m.x-30*k,y:gy()-26*k,dmg:Math.max(2,Math.ceil(m.dmg*0.5)),color:"#b06cff",spd:400*k,bossId:mechanic,hit:{},done:false});
        for(const x of bx.livingHeroes()){B.hs[x.id].buffs.shadowMark=5}
        bx.burst(m.x,gy()-30*k,"#b06cff",22,180);bx.shake(3,.3);bx.float("🌑 Тёмный импульс",m.x,gy()-76*K(),"#b06cff",true);T.events.emit("sfx","boom");
      }
    }
    m.sk.a2-=dt;if(m.sk.a2<=0&&hpPct<=kit.a2.hpBelow){m.sk.a2=kit.a2.cd;m.castIcon=kit.a2.icon;m.castT=1.2;
      if(mechanic==="crystal_titan"){
        for(const x of bx.livingHeroes()){const h=B.hs[x.id];bx.applyBossHit(h,Math.max(2,Math.ceil(m.dmg*1.1)),"#38dfff",m)}
        m.buffs.crystalShell=6;bx.ring(m.x,gy()-30*k,"#38dfff",120*k);bx.ring(m.x,gy()-30*k,"#a8f0ff",70*k);bx.burst(m.x,gy()-30*k,"#38dfff",30,220);bx.shake(5,.4);
        bx.float("💎 КРИСТАЛЛИЧЕСКИЙ ВЗРЫВ",m.x,gy()-86*K(),"#38dfff",true);T.events.emit("sfx","boom");
      }else if(mechanic==="flame_lord"){
        m.buffs.rage=6;
        bx.ring(m.x,gy()-30*k,"#ff7a3d",90*k);bx.burst(m.x,gy()-30*k,"#ff7a3d",30,200);bx.souls(m.x,gy()-20*k);bx.shake(4,.35);
        bx.float("🔥 ЯРОСТЬ",m.x,gy()-86*K(),"#ff4d62",true);T.events.emit("sfx","bossdie");
      }else{
        const def=T.waves.mobPool(T.S.wave)[0];
        for(let i=0;i<2;i++){const hp=Math.ceil(T.waves.enemyHp(T.S.wave,false,def)*0.8);const sx=m.x+U.rand(-40,40);
          B.monsters.push({def,boss:false,summoned:true,hp,maxHp:hp,x:sx,slot:(i+3)%6,jit:0,spd:(BAL.enemy.speedBase+8)*k*(def.speedMult||1)*2.5,dmg:Math.max(1,Math.ceil(Math.pow(hp,BAL.combat.monsterDmgPow)*BAL.combat.monsterDmgScale)),atkT:U.rand(.8,1.4),flash:0,lunge:0,dead:false,deathT:0,seed:U.rand(6.28),flying:!!def.flying,sk:null,buffs:{},castT:0,castIcon:""});
          bx.ring(sx,gy()-30*k,"#b06cff",34*k);bx.souls(sx,gy()-16*k);}
        bx.burst(m.x,gy()-30*k,"#b06cff",24,180);bx.shake(3,.3);
        bx.float("👥 ПРИЗЫВ ТЕНЕЙ",m.x,gy()-86*K(),"#b06cff",true);T.events.emit("sfx","boss");
      }
    }
  };
})();