(function(){
  window.TBH = window.TBH || {};
  TBH.config = TBH.config || {};
  TBH.config.heroes = [
    { id:"paladin", name:"Паладин", flavor:"Несокрушимый защитник: принимает удар на себя и прикрывает союзников священным щитом.", color:"#ffd866", role:"tank",
      baseDmg:8, atkSpeed:.8, baseHp:400, hpPerLevel:46, baseRegen:1.2, costBase:40, recruitCost:0,
      range:"melee", projectile:null, projColor:"#ffd866", splash:0,
      sprite:{ src:"assets/characters/paladin.webp", region:[0,0,1,1], full:true, pixelHeight:112 } },
    { id:"archer", name:"Лучница", flavor:"Меткий стрелок: быстрые атаки с дальней дистанции.", color:"#4fd873",
      baseDmg:10, atkSpeed:1.65, baseHp:150, hpPerLevel:18, baseRegen:.5, costBase:65, recruitCost:150,
      range:"ranged", projectile:"arrow", projColor:"#e8d8a8", splash:0,
      sprite:{ src:"assets/characters/archer.webp", region:[0,0,1,1], full:true, pixelHeight:112 } },
    { id:"mage", name:"Маг", flavor:"Маг стихий: наносит мощный урон по группе врагов.", color:"#ff5a3d",
      baseDmg:42, atkSpeed:.55, baseHp:120, hpPerLevel:14, baseRegen:.4, costBase:900, recruitCost:2500,
      range:"ranged", projectile:"fire", projColor:"#ff8a3d", splash:52,
      sprite:{ src:"assets/characters/mage.webp", region:[0,0,1,1], full:true, pixelHeight:112 } },
    { id:"monk", name:"Монах", flavor:"Серия молниеносных ударов. Хрупкий, но очень быстрый.", color:"#ff7a3d",
      baseDmg:12, atkSpeed:2.2, baseHp:180, hpPerLevel:20, baseRegen:.6, costBase:300, recruitCost:2000,
      range:"melee", projectile:null, projColor:"#ff7a3d", splash:0,
      sprite:{ src:"assets/characters/monk.webp", region:[0,0,1,1], full:true, pixelHeight:112 } },
    { id:"rogue", name:"Разбойник", flavor:"Мастер теней: быстрые атаки и усиление критических ударов.", color:"#8a5cff",
      baseDmg:16, atkSpeed:1.9, baseHp:160, hpPerLevel:18, baseRegen:.5, costBase:500, recruitCost:1800,
      range:"melee", projectile:null, projColor:"#b06cff", splash:0,
      sprite:{ src:"assets/characters/rogue.webp", region:[0,0,1,1], full:true, pixelHeight:112 } },
    { id:"necro", name:"Некромант", flavor:"Повелитель смерти: исцеляет союзников, проклинает врагов и один раз за волну возвращает павшего бойца.", color:"#b06cff", role:"healer",
      baseDmg:26, atkSpeed:.8, baseHp:140, hpPerLevel:16, baseRegen:.7, costBase:2500, recruitCost:8000,
      range:"ranged", projectile:"orb", projColor:"#78ff7a", splash:40,
      sprite:{ src:"assets/characters/necro.webp", region:[0,0,1,1], full:true, pixelHeight:112 } },
    { id:"barbarian", name:"Варвар", flavor:"Несокрушимый громила с Севера. Провоцирует врагов, выдерживает натиск и сокрушает ближайших противников.", color:"#d9784a", role:"tank",
      baseDmg:14, atkSpeed:.68, baseHp:560, hpPerLevel:62, baseRegen:1.5, costBase:2200, recruitCost:6500,
      range:"melee", projectile:null, projColor:"#e88a55", splash:0,
      sprite:{ src:"assets/characters/barbarian_generated.webp", region:[0,0,1,1], full:true, pixelHeight:112, fb:{src:"assets/characters/barbarian.svg"} } },
    { id:"druid", name:"Друид", flavor:"Хранитель живого леса. Усиливает любое своё исцеление и поддерживает отряд силами природы.", color:"#78c66b", role:"healer",
      baseDmg:18, atkSpeed:1.05, baseHp:210, hpPerLevel:23, baseRegen:1.0, costBase:2600, recruitCost:7200,
      range:"ranged", projectile:"orb", projColor:"#91e58a", splash:0,
      sprite:{ src:"assets/characters/druid_generated.webp", region:[0,0,1,1], full:true, pixelHeight:112, fb:{src:"assets/characters/druid.svg"} } }
  ];
})();
