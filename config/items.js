(function(){
  window.TBH = window.TBH || {};
  TBH.config = TBH.config || {};
  TBH.config.slots = { weapon:{name:"Оружие",icon:"🗡"}, armor:{name:"Броня",icon:"🛡"}, talisman:{name:"Талисман",icon:"🧿"} };
  TBH.config.statMeta = {
    dmgPct:{label:"урон/лечение",suffix:"%",icon:"⚔",weight:3},
    atkSpd:{label:"скор. атаки",suffix:"%",icon:"⚡",weight:3},
    crit:{label:"шанс крита",suffix:"%",icon:"🎯",weight:4},
    critDmg:{label:"сила крита",suffix:"%",icon:"💥",weight:1.5},
    goldPct:{label:"золото",suffix:"%",icon:"🪙",weight:2},
    hpFlat:{label:"HP героя",suffix:"",icon:"❤",weight:.15},
    armor:{label:"броня героя",suffix:"",icon:"🛡",weight:.3},
  };
  TBH.config.rarities = [
    {id:"common",name:"Обычный",color:"#c8d0d8",mult:1,weight:55,bossWeight:15},
    {id:"uncommon",name:"Необычный",color:"#78ff7a",mult:1.35,weight:28,bossWeight:35},
    {id:"rare",name:"Редкий",color:"#38b6ff",mult:1.8,weight:12,bossWeight:30},
    {id:"epic",name:"Эпический",color:"#b06cff",mult:2.4,weight:4,bossWeight:15},
    {id:"legendary",name:"Легендарный",color:"#ffb020",mult:3.2,weight:1,bossWeight:5},
    {id:"divine",name:"Божественный",color:"#ff334f",mult:10.5,weight:0,bossWeight:0}
  ];
  // Оружие и броня имеют список разрешённых классов; талисманы универсальны.
  TBH.config.items = [
    {id:"rusty_sword",classes:["paladin","rogue","barbarian"],slot:"weapon",name:"Ржавый меч",icon:"🗡",art:"sword",stats:{dmgPct:10}},
    {id:"war_axe",classes:["paladin","barbarian"],slot:"weapon",name:"Боевой топор",icon:"🪓",art:"axe",stats:{dmgPct:14,crit:1}},
    {id:"spark_staff",classes:["mage","monk","necro","druid"],slot:"weapon",name:"Посох искр",icon:"🔮",art:"staff",stats:{dmgPct:12,atkSpd:2}},
    {id:"moon_blade",classes:["paladin","rogue","barbarian"],slot:"weapon",name:"Лунный клинок",icon:"🌙",art:"blade",stats:{dmgPct:18,critDmg:12}},
    {id:"leather_vest",classes:["paladin","archer","monk","rogue","barbarian","druid"],slot:"armor",name:"Кожаный жилет",icon:"🥋",art:"vest",stats:{hpFlat:30,armor:20}},
    {id:"chainmail",classes:["paladin","barbarian"],slot:"armor",name:"Кольчуга",icon:"⛓",art:"mail",stats:{hpFlat:50,armor:30}},
    {id:"guard_shield",classes:["paladin","barbarian"],slot:"armor",name:"Щит стража",icon:"🛡",art:"shield",stats:{hpFlat:75,armor:40}},
    {id:"dragon_plate",classes:["paladin","barbarian"],slot:"armor",name:"Драконья броня",icon:"🐉",art:"plate",stats:{hpFlat:120,armor:50}},
    {id:"lucky_coin",slot:"talisman",name:"Монетка удачи",icon:"🪙",art:"coin",stats:{goldPct:8}},
    {id:"wolf_fang",slot:"talisman",name:"Коготь волка",icon:"🐺",art:"fang",stats:{crit:3,critDmg:10}},
    {id:"wind_feather",slot:"talisman",name:"Перо ветра",icon:"🪶",art:"feather",stats:{atkSpd:5}},
    {id:"greed_seal",slot:"talisman",name:"Печать алчности",icon:"💰",art:"seal",stats:{goldPct:12,dmgPct:4}}
,
    {"id":"hunter_bow","slot":"weapon","name":"Лук следопыта","icon":"🏹","art":"bow","stats":{"dmgPct":12,"atkSpd":2},"classes":["archer"]},
    {"id":"shadow_dagger","slot":"weapon","name":"Кинжал теней","icon":"🗡","art":"dagger","stats":{"dmgPct":11,"crit":3},"classes":["rogue"]},
    {"id":"sun_mace","slot":"weapon","name":"Булава рассвета","icon":"⚒","art":"mace","stats":{"dmgPct":15},"classes":["paladin","barbarian"]},
    {"id":"monk_fists","slot":"weapon","name":"Рунные кастеты","icon":"✊","art":"fists","stats":{"dmgPct":10,"atkSpd":5},"classes":["monk"]},
    {"id":"soul_wand","slot":"weapon","name":"Жезл душ","icon":"✦","art":"wand","stats":{"dmgPct":15,"crit":1},"classes":["mage","necro"]},
    {"id":"thorn_sickle","slot":"weapon","name":"Серп терновника","icon":"☘","art":"sickle","stats":{"dmgPct":13,"atkSpd":2},"classes":["druid"]},
    {"id":"woven_robe","slot":"armor","name":"Мантия ткачей рун","icon":"✧","art":"robe","stats":{"hpFlat":45,"armor":24},"classes":["mage","necro","druid","monk"]},
    {"id":"scout_coat","slot":"armor","name":"Куртка разведчика","icon":"🛡","art":"coat","stats":{"hpFlat":42,"armor":26},"classes":["archer","rogue","monk","druid"]}
  ];
})();