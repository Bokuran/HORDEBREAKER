(function(){
  window.TBH = window.TBH || {};
  TBH.config = TBH.config || {};
  TBH.config.monsters = {
    crystal_golem:{id:"crystal_golem",name:"Кристальный голем",color:"#38dfff",hpMult:2.2,speedMult:.6,goldMult:1.25,flying:false,sprite:{src:"assets/characters/crystal_golem.webp",region:[0,0,1,1],full:true,pixelHeight:112}},
    flame_demon:{id:"flame_demon",name:"Пламенный демон",color:"#ff5a3d",hpMult:1.2,speedMult:1.1,goldMult:1.15,flying:false,sprite:{src:"assets/characters/flame_demon.webp",region:[0,0,1,1],full:true,pixelHeight:112}},
    shadow_wraith:{id:"shadow_wraith",name:"Теневой призрак",color:"#b06cff",hpMult:1,speedMult:1.25,goldMult:1.1,flying:true,sprite:{src:"assets/characters/shadow_wraith.webp",region:[0,0,1,1],full:true,pixelHeight:112}},
    crystal_titan:{id:"crystal_titan",name:"Кристальный титан",color:"#38dfff",hpMult:1,speedMult:.55,goldMult:1,flying:false,boss:true,sprite:{src:"assets/characters/crystal_golem.webp",region:[0,0,1,1],full:true,pixelHeight:150}},
    flame_lord:{id:"flame_lord",name:"Владыка пламени",color:"#ff5a3d",hpMult:1,speedMult:.7,goldMult:1,flying:false,boss:true,sprite:{src:"assets/characters/flame_demon.webp",region:[0,0,1,1],full:true,pixelHeight:150}},
    shadow_king:{id:"shadow_king",name:"Владыка теней",color:"#b06cff",hpMult:1,speedMult:.65,goldMult:1,flying:false,boss:true,sprite:{src:"assets/characters/shadow_wraith.webp",region:[0,0,1,1],full:true,pixelHeight:150}}
  };
  Object.assign(TBH.config.monsters,{
  "city_a": {
    "id": "city_a",
    "name": "Городской грабитель",
    "color": "#e6bd83",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/city_a.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112,
      "fb": {
        "src": "assets/characters/campaign/city_a.svg"
      }
    }
  },
  "city_b": {
    "id": "city_b",
    "name": "Канализационная крыса",
    "color": "#e6bd83",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/city_b.webp",
      "face": "left",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 72,
      "fb": {
        "src": "assets/characters/campaign/city_b.svg"
      }
    }
  },
  "city_champion": {
    "id": "city_champion",
    "name": "Главарь шайки",
    "color": "#e6bd83",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "city_champion",
    "sprite": {
      "src": "assets/characters/campaign/city_champion.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/city_champion.svg"
      }
    }
  },
  "city_lord": {
    "id": "city_lord",
    "name": "Мятежный рыцарь",
    "color": "#e6bd83",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "city_lord",
    "sprite": {
      "src": "assets/characters/campaign/city_lord.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/city_lord.svg"
      }
    }
  },
  "gate_a": {
    "id": "gate_a",
    "name": "Осадный наёмник",
    "color": "#e5c486",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/gate_a.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112,
      "fb": {
        "src": "assets/characters/campaign/gate_a.svg"
      }
    }
  },
  "gate_b": {
    "id": "gate_b",
    "name": "Одичавший гончий",
    "color": "#e5c486",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/gate_b.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 72,
      "fb": {
        "src": "assets/characters/campaign/gate_b.svg"
      }
    }
  },
  "gate_champion": {
    "id": "gate_champion",
    "name": "Капитан дезертиров",
    "color": "#e5c486",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "gate_champion",
    "sprite": {
      "src": "assets/characters/campaign/gate_champion.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/gate_champion.svg"
      }
    }
  },
  "gate_lord": {
    "id": "gate_lord",
    "name": "Таранный голем",
    "color": "#e5c486",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "gate_lord",
    "sprite": {
      "src": "assets/characters/campaign/gate_lord.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/gate_lord.svg"
      }
    }
  },
  "forest_a": {
    "id": "forest_a",
    "name": "Лесной волк",
    "color": "#b3d279",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/forest_a.webp",
      "face": "left",
      "fb": {"src":"assets/characters/campaign/forest_a.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "forest_b": {
    "id": "forest_b",
    "name": "Ядовитый паук",
    "color": "#b3d279",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/forest_b.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 72,
      "fb": {
        "src": "assets/characters/campaign/forest_b.svg"
      }
    }
  },
  "forest_champion": {
    "id": "forest_champion",
    "name": "Королева пауков",
    "color": "#b3d279",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "forest_champion",
    "sprite": {
      "src": "assets/characters/campaign/forest_champion.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/forest_champion.svg"
      }
    }
  },
  "forest_lord": {
    "id": "forest_lord",
    "name": "Древний древень",
    "color": "#b3d279",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "forest_lord",
    "sprite": {
      "src": "assets/characters/campaign/forest_lord.webp",
      "face": "left",
      "fb": {"src":"assets/characters/campaign/forest_lord.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "waste_a": {
    "id": "waste_a",
    "name": "Барханный налётчик",
    "color": "#ffe1a1",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/waste_a.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112,
      "fb": {
        "src": "assets/characters/campaign/waste_a.svg"
      }
    }
  },
  "waste_b": {
    "id": "waste_b",
    "name": "Песчаный скорпион",
    "color": "#ffe1a1",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/waste_b.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112,
      "fb": {
        "src": "assets/characters/campaign/waste_b.svg"
      }
    }
  },
  "waste_champion": {
    "id": "waste_champion",
    "name": "Царь скорпионов",
    "color": "#ffe1a1",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "waste_champion",
    "sprite": {
      "src": "assets/characters/campaign/waste_champion.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/waste_champion.svg"
      }
    }
  },
  "waste_lord": {
    "id": "waste_lord",
    "name": "Песчаный змей",
    "color": "#ffe1a1",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "waste_lord",
    "sprite": {
      "src": "assets/characters/campaign/waste_lord.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/waste_lord.svg"
      }
    }
  },
  "mountains_a": {
    "id": "mountains_a",
    "name": "Горная гарпия",
    "color": "#d4c5a2",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/mountains_a.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112,
      "fb": {
        "src": "assets/characters/campaign/mountains_a.svg"
      }
    }
  },
  "mountains_b": {
    "id": "mountains_b",
    "name": "Каменный гоблин",
    "color": "#d4c5a2",
    "hpMult": 1.45,
    "speedMult": 0.72,
    "goldMult": 1.18,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/mountains_b.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112,
      "fb": {
        "src": "assets/characters/campaign/mountains_b.svg"
      }
    }
  },
  "mountains_champion": {
    "id": "mountains_champion",
    "name": "Матриарх гарпий",
    "color": "#d4c5a2",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "mountains_champion",
    "sprite": {
      "src": "assets/characters/campaign/mountains_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "mountains_lord": {
    "id": "mountains_lord",
    "name": "Каменный великан",
    "color": "#d4c5a2",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "mountains_lord",
    "sprite": {
      "src": "assets/characters/campaign/mountains_lord.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/mountains_lord.svg"
      }
    }
  },
  "peaks_a": {
    "id": "peaks_a",
    "name": "Морозный волк",
    "color": "#d6f6ff",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/peaks_a.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 72,
      "fb": {
        "src": "assets/characters/campaign/peaks_a.svg"
      }
    }
  },
  "peaks_b": {
    "id": "peaks_b",
    "name": "Ледяной налётчик",
    "color": "#d6f6ff",
    "hpMult": 1.45,
    "speedMult": 0.72,
    "goldMult": 1.18,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/peaks_b.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112,
      "fb": {
        "src": "assets/characters/campaign/peaks_b.svg"
      }
    }
  },
  "peaks_champion": {
    "id": "peaks_champion",
    "name": "Вожак зимней стаи",
    "color": "#d6f6ff",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "peaks_champion",
    "sprite": {
      "src": "assets/characters/campaign/peaks_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "peaks_lord": {
    "id": "peaks_lord",
    "name": "Ледяной король",
    "color": "#d6f6ff",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "peaks_lord",
    "sprite": {
      "src": "assets/characters/campaign/peaks_lord.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/peaks_lord.svg"
      }
    }
  },
  "elfwood_a": {
    "id": "elfwood_a",
    "name": "Осквернённый зверь",
    "color": "#b2f3c0",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/elfwood_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "elfwood_b": {
    "id": "elfwood_b",
    "name": "Лесной изгнанник",
    "color": "#b2f3c0",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/elfwood_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "elfwood_champion": {
    "id": "elfwood_champion",
    "name": "Терновый охотник",
    "color": "#b2f3c0",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "elfwood_champion",
    "sprite": {
      "src": "assets/characters/campaign/elfwood_champion.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/elfwood_champion.svg"
      }
    }
  },
  "elfwood_lord": {
    "id": "elfwood_lord",
    "name": "Хранитель корней",
    "color": "#b2f3c0",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "elfwood_lord",
    "sprite": {
      "src": "assets/characters/campaign/elfwood_lord.webp",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150,
      "fb": {
        "src": "assets/characters/campaign/elfwood_lord.svg"
      }
    }
  },
  "elfcity_a": {
    "id": "elfcity_a",
    "name": "Падший страж",
    "color": "#c8f7da",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/elfcity_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "elfcity_b": {
    "id": "elfcity_b",
    "name": "Лунный дух",
    "color": "#c8f7da",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/elfcity_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "elfcity_champion": {
    "id": "elfcity_champion",
    "name": "Изгнанный полководец",
    "color": "#c8f7da",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "elfcity_champion",
    "sprite": {
      "src": "assets/characters/campaign/elfcity_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "elfcity_lord": {
    "id": "elfcity_lord",
    "name": "Осквернённая жрица",
    "color": "#c8f7da",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "elfcity_lord",
    "sprite": {
      "src": "assets/characters/campaign/elfcity_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "deepwood_a": {
    "id": "deepwood_a",
    "name": "Сумеречный паук",
    "color": "#cbb9e8",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/deepwood_a.webp",
      "face": "left",
      "fb": {"src":"assets/characters/campaign/deepwood_a.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "deepwood_b": {
    "id": "deepwood_b",
    "name": "Проклятый следопыт",
    "color": "#cbb9e8",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/deepwood_b.webp",
      "face": "right",
      "fb": {"src":"assets/characters/campaign/deepwood_b.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "deepwood_champion": {
    "id": "deepwood_champion",
    "name": "Ведьма терновника",
    "color": "#cbb9e8",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "deepwood_champion",
    "sprite": {
      "src": "assets/characters/campaign/deepwood_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "deepwood_lord": {
    "id": "deepwood_lord",
    "name": "Древень сумерек",
    "color": "#cbb9e8",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "deepwood_lord",
    "sprite": {
      "src": "assets/characters/campaign/deepwood_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "highlands_a": {
    "id": "highlands_a",
    "name": "Горный разбойник",
    "color": "#e8bf8f",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/highlands_a.webp",
      "face": "right",
      "fb": {"src":"assets/characters/campaign/highlands_a.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "highlands_b": {
    "id": "highlands_b",
    "name": "Скальный зверь",
    "color": "#e8bf8f",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/highlands_b.webp",
      "face": "right",
      "fb": {"src":"assets/characters/campaign/highlands_b.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "highlands_champion": {
    "id": "highlands_champion",
    "name": "Повелитель скал",
    "color": "#e8bf8f",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "highlands_champion",
    "sprite": {
      "src": "assets/characters/campaign/highlands_champion.webp",
      "face": "right",
      "fb": {"src":"assets/characters/campaign/highlands_champion.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "highlands_lord": {
    "id": "highlands_lord",
    "name": "Грифон перевала",
    "color": "#e8bf8f",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "highlands_lord",
    "sprite": {
      "src": "assets/characters/campaign/highlands_lord.webp",
      "face": "left",
      "fb": {"src":"assets/characters/campaign/highlands_lord.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "dwarf_a": {
    "id": "dwarf_a",
    "name": "Рунный страж",
    "color": "#ffe0a0",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/dwarf_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "dwarf_b": {
    "id": "dwarf_b",
    "name": "Механический дозорный",
    "color": "#ffe0a0",
    "hpMult": 1.45,
    "speedMult": 0.72,
    "goldMult": 1.18,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/dwarf_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "dwarf_champion": {
    "id": "dwarf_champion",
    "name": "Мастер осады",
    "color": "#ffe0a0",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "dwarf_champion",
    "sprite": {
      "src": "assets/characters/campaign/dwarf_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "dwarf_lord": {
    "id": "dwarf_lord",
    "name": "Рунный кузнец",
    "color": "#ffe0a0",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "dwarf_lord",
    "sprite": {
      "src": "assets/characters/campaign/dwarf_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "mines_a": {
    "id": "mines_a",
    "name": "Пещерный ползун",
    "color": "#efbe79",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/mines_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "mines_b": {
    "id": "mines_b",
    "name": "Шахтный призрак",
    "color": "#efbe79",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/mines_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "mines_champion": {
    "id": "mines_champion",
    "name": "Пожиратель руды",
    "color": "#efbe79",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "mines_champion",
    "sprite": {
      "src": "assets/characters/campaign/mines_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "mines_lord": {
    "id": "mines_lord",
    "name": "Железный страж глубин",
    "color": "#efbe79",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "mines_lord",
    "sprite": {
      "src": "assets/characters/campaign/mines_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "crystal_a": {
    "id": "crystal_a",
    "name": "Кристальный голем",
    "color": "#9deaff",
    "hpMult": 1.45,
    "speedMult": 0.72,
    "goldMult": 1.18,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/crystal_a.webp",
      "face": "right",
      "fb": {"src":"assets/characters/campaign/crystal_a.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "crystal_b": {
    "id": "crystal_b",
    "name": "Хрустальный ползун",
    "color": "#9deaff",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/crystal_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "crystal_champion": {
    "id": "crystal_champion",
    "name": "Песнь кристаллов",
    "color": "#9deaff",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "crystal_champion",
    "sprite": {
      "src": "assets/characters/campaign/crystal_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "crystal_lord": {
    "id": "crystal_lord",
    "name": "Алмазный титан",
    "color": "#9deaff",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "crystal_lord",
    "sprite": {
      "src": "assets/characters/campaign/crystal_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "marsh_a": {
    "id": "marsh_a",
    "name": "Болотный упырь",
    "color": "#c5dc82",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/marsh_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "marsh_b": {
    "id": "marsh_b",
    "name": "Ядовитая жаба",
    "color": "#c5dc82",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/marsh_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "marsh_champion": {
    "id": "marsh_champion",
    "name": "Ведьма трясины",
    "color": "#c5dc82",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "marsh_champion",
    "sprite": {
      "src": "assets/characters/campaign/marsh_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "marsh_lord": {
    "id": "marsh_lord",
    "name": "Болотная гидра",
    "color": "#c5dc82",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "marsh_lord",
    "sprite": {
      "src": "assets/characters/campaign/marsh_lord.webp",
      "face": "right",
      "fb": {"src":"assets/characters/campaign/marsh_lord.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "cursed_a": {
    "id": "cursed_a",
    "name": "Теневой призрак",
    "color": "#bcb2ef",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/cursed_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "cursed_b": {
    "id": "cursed_b",
    "name": "Мертвенный зверь",
    "color": "#bcb2ef",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/cursed_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "cursed_champion": {
    "id": "cursed_champion",
    "name": "Князь ночной охоты",
    "color": "#bcb2ef",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "cursed_champion",
    "sprite": {
      "src": "assets/characters/campaign/cursed_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "cursed_lord": {
    "id": "cursed_lord",
    "name": "Владыка проклятых корней",
    "color": "#bcb2ef",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "cursed_lord",
    "sprite": {
      "src": "assets/characters/campaign/cursed_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "ruins_a": {
    "id": "ruins_a",
    "name": "Костяной воин",
    "color": "#e6c2a5",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/ruins_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "ruins_b": {
    "id": "ruins_b",
    "name": "Праховый маг",
    "color": "#e6c2a5",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/ruins_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "ruins_champion": {
    "id": "ruins_champion",
    "name": "Король без трона",
    "color": "#e6c2a5",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "ruins_champion",
    "sprite": {
      "src": "assets/characters/campaign/ruins_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "ruins_lord": {
    "id": "ruins_lord",
    "name": "Лич древней династии",
    "color": "#e6c2a5",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "ruins_lord",
    "sprite": {
      "src": "assets/characters/campaign/ruins_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "volcano_a": {
    "id": "volcano_a",
    "name": "Пламенный бес",
    "color": "#ffcb77",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/volcano_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "volcano_b": {
    "id": "volcano_b",
    "name": "Лавовый голем",
    "color": "#ffcb77",
    "hpMult": 1.45,
    "speedMult": 0.72,
    "goldMult": 1.18,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/volcano_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "volcano_champion": {
    "id": "volcano_champion",
    "name": "Пепельный дракон",
    "color": "#ffcb77",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "volcano_champion",
    "sprite": {
      "src": "assets/characters/campaign/volcano_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "volcano_lord": {
    "id": "volcano_lord",
    "name": "Владыка магмы",
    "color": "#ffcb77",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "volcano_lord",
    "sprite": {
      "src": "assets/characters/campaign/volcano_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "hellcanyon_a": {
    "id": "hellcanyon_a",
    "name": "Адская гончая",
    "color": "#ffb16f",
    "hpMult": 0.85,
    "speedMult": 1.23,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/hellcanyon_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "hellcanyon_b": {
    "id": "hellcanyon_b",
    "name": "Крылатый демон",
    "color": "#ffb16f",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/hellcanyon_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "hellcanyon_champion": {
    "id": "hellcanyon_champion",
    "name": "Палач бездны",
    "color": "#ffb16f",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "hellcanyon_champion",
    "sprite": {
      "src": "assets/characters/campaign/hellcanyon_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "hellcanyon_lord": {
    "id": "hellcanyon_lord",
    "name": "Пожиратель душ",
    "color": "#ffb16f",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "hellcanyon_lord",
    "sprite": {
      "src": "assets/characters/campaign/hellcanyon_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "fortress_a": {
    "id": "fortress_a",
    "name": "Адский рыцарь",
    "color": "#f7a67b",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/fortress_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "fortress_b": {
    "id": "fortress_b",
    "name": "Осадный демон",
    "color": "#f7a67b",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/fortress_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "fortress_champion": {
    "id": "fortress_champion",
    "name": "Генерал Чёрной армии",
    "color": "#f7a67b",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "fortress_champion",
    "sprite": {
      "src": "assets/characters/campaign/fortress_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "fortress_lord": {
    "id": "fortress_lord",
    "name": "Страж Врат Бездны",
    "color": "#f7a67b",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "fortress_lord",
    "sprite": {
      "src": "assets/characters/campaign/fortress_lord.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "citadel_a": {
    "id": "citadel_a",
    "name": "Демон легиона",
    "color": "#ff936f",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": false,
    "sprite": {
      "src": "assets/characters/campaign/citadel_a.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "citadel_b": {
    "id": "citadel_b",
    "name": "Культист бездны",
    "color": "#ff936f",
    "hpMult": 1.05,
    "speedMult": 1.03,
    "goldMult": 1,
    "flying": true,
    "sprite": {
      "src": "assets/characters/campaign/citadel_b.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 112
    }
  },
  "citadel_champion": {
    "id": "citadel_champion",
    "name": "Первый герцог ада",
    "color": "#ff936f",
    "hpMult": 0.86,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": true,
    "boss": true,
    "mechanic": "citadel_champion",
    "sprite": {
      "src": "assets/characters/campaign/citadel_champion.svg",
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  },
  "citadel_lord": {
    "id": "citadel_lord",
    "name": "Владыка демонов",
    "color": "#ff936f",
    "hpMult": 1,
    "speedMult": 0.72,
    "goldMult": 1,
    "flying": false,
    "boss": true,
    "mechanic": "citadel_lord",
    "sprite": {
      "src": "assets/characters/campaign/citadel_lord.webp",
      "face": "right",
      "fb": {"src":"assets/characters/campaign/citadel_lord.svg","region":[0,0,1,1]},
      "region": [
        0,
        0,
        1,
        1
      ],
      "full": true,
      "pixelHeight": 150
    }
  }
});
})();
