(function(){window.TBH=window.TBH||{};TBH.config=TBH.config||{};
TBH.config.levelRules={bossEvery:5,loop:true,loopHpMult:3.2,loopGoldMult:2,victoryWave:200};
TBH.config.levels=[
  {
    "id": "city",
    "name": "Город Рассвета",
    "icon": "✦",
    "iconArt": "assets/zones/icons/city.svg",
    "waves": 10,
    "hpMult": 1,
    "goldMult": 1,
    "monsters": [
      "city_a",
      "city_b"
    ],
    "boss": "city_lord",
    "bosses": {
      "5": "city_champion",
      "10": "city_lord"
    },
    "colors": {
      "sky1": "#3e4d56",
      "sky2": "#6c8796",
      "hill1": "#605978",
      "hill2": "#403b50",
      "ground": "#504a64"
    },
    "stars": false,
    "musicRoot": 110,
    "bg": {
      "src": "assets/zones/campaign/city.webp",
      "fb": {
        "src": "assets/zones/campaign/city.svg"
      }
    },
    "terrain": "city"
  },
  {
    "id": "gate",
    "name": "Ворота Рассвета",
    "icon": "✦",
    "iconArt": "assets/zones/icons/gate.svg",
    "waves": 10,
    "hpMult": 1.05,
    "goldMult": 1.04,
    "monsters": [
      "gate_a",
      "gate_b"
    ],
    "boss": "gate_lord",
    "bosses": {
      "5": "gate_champion",
      "10": "gate_lord"
    },
    "colors": {
      "sky1": "#4a4140",
      "sky2": "#817271",
      "hill1": "#624f5a",
      "hill2": "#42353c",
      "ground": "#52424b"
    },
    "stars": false,
    "musicRoot": 98,
    "bg": {
      "src": "assets/zones/campaign/gate.webp",
      "fb": {
        "src": "assets/zones/campaign/gate.svg"
      }
    },
    "terrain": "gate"
  },
  {
    "id": "forest",
    "name": "Изумрудный лес",
    "icon": "✦",
    "iconArt": "assets/zones/icons/forest.svg",
    "waves": 10,
    "hpMult": 1.09,
    "goldMult": 1.08,
    "monsters": [
      "forest_a",
      "forest_b"
    ],
    "boss": "forest_lord",
    "bosses": {
      "5": "forest_champion",
      "10": "forest_lord"
    },
    "colors": {
      "sky1": "#1f3d31",
      "sky2": "#376a56",
      "hill1": "#1e4943",
      "hill2": "#14312d",
      "ground": "#193d38"
    },
    "stars": false,
    "musicRoot": 130.8,
    "bg": {
      "src": "assets/zones/forest.webp"
    },
    "terrain": "forest"
  },
  {
    "id": "waste",
    "name": "Песчаная пустыня",
    "icon": "✦",
    "iconArt": "assets/zones/icons/waste.svg",
    "waves": 10,
    "hpMult": 1.14,
    "goldMult": 1.12,
    "monsters": [
      "waste_a",
      "waste_b"
    ],
    "boss": "waste_lord",
    "bosses": {
      "5": "waste_champion",
      "10": "waste_lord"
    },
    "colors": {
      "sky1": "#523622",
      "sky2": "#905f3b",
      "hill1": "#895036",
      "hill2": "#5b3624",
      "ground": "#72432d"
    },
    "stars": false,
    "musicRoot": 87.3,
    "bg": {
      "src": "assets/zones/campaign/waste.webp",
      "fb": {
        "src": "assets/zones/waste.webp"
      }
    },
    "terrain": "desert"
  },
  {
    "id": "mountains",
    "name": "Каменные горы",
    "icon": "✦",
    "iconArt": "assets/zones/icons/mountains.svg",
    "waves": 10,
    "hpMult": 1.18,
    "goldMult": 1.16,
    "monsters": [
      "mountains_a",
      "mountains_b"
    ],
    "boss": "mountains_lord",
    "bosses": {
      "5": "mountains_champion",
      "10": "mountains_lord"
    },
    "colors": {
      "sky1": "#38444e",
      "sky2": "#617888",
      "hill1": "#425370",
      "hill2": "#2c374a",
      "ground": "#37455d"
    },
    "stars": false,
    "musicRoot": 103.8,
    "bg": {
      "src": "assets/zones/campaign/mountains.webp",
      "fb": {
        "src": "assets/zones/campaign/mountains.svg"
      }
    },
    "terrain": "mountain"
  },
  {
    "id": "peaks",
    "name": "Ледяные горы",
    "icon": "✦",
    "iconArt": "assets/zones/icons/peaks.svg",
    "waves": 10,
    "hpMult": 1.23,
    "goldMult": 1.2,
    "monsters": [
      "peaks_a",
      "peaks_b"
    ],
    "boss": "peaks_lord",
    "bosses": {
      "5": "peaks_champion",
      "10": "peaks_lord"
    },
    "colors": {
      "sky1": "#37505e",
      "sky2": "#618da5",
      "hill1": "#355383",
      "hill2": "#233757",
      "ground": "#2c456d"
    },
    "stars": false,
    "musicRoot": 92,
    "bg": {
      "src": "assets/zones/campaign/peaks.webp",
      "fb": {
        "src": "assets/zones/peaks.webp"
      }
    },
    "terrain": "ice"
  },
  {
    "id": "elfwood",
    "name": "Лес эльфов",
    "icon": "✦",
    "iconArt": "assets/zones/icons/elfwood.svg",
    "waves": 10,
    "hpMult": 1.27,
    "goldMult": 1.24,
    "monsters": [
      "elfwood_a",
      "elfwood_b"
    ],
    "boss": "elfwood_lord",
    "bosses": {
      "5": "elfwood_champion",
      "10": "elfwood_lord"
    },
    "colors": {
      "sky1": "#325548",
      "sky2": "#58957f",
      "hill1": "#2b5f56",
      "hill2": "#1d3f3a",
      "ground": "#244f48"
    },
    "stars": false,
    "musicRoot": 110,
    "bg": {
      "src": "assets/zones/campaign/elfwood.webp",
      "fb": {
        "src": "assets/zones/campaign/elfwood.svg"
      }
    },
    "terrain": "elfwood"
  },
  {
    "id": "elfcity",
    "name": "Город эльфов",
    "icon": "✦",
    "iconArt": "assets/zones/icons/elfcity.svg",
    "waves": 10,
    "hpMult": 1.32,
    "goldMult": 1.28,
    "monsters": [
      "elfcity_a",
      "elfcity_b"
    ],
    "boss": "elfcity_lord",
    "bosses": {
      "5": "elfcity_champion",
      "10": "elfcity_lord"
    },
    "colors": {
      "sky1": "#4a4b5b",
      "sky2": "#81849f",
      "hill1": "#4d477d",
      "hill2": "#332f53",
      "ground": "#403b68"
    },
    "stars": true,
    "musicRoot": 98,
    "bg": {
      "src": "assets/zones/campaign/elfcity.svg"
    },
    "terrain": "elfcity"
  },
  {
    "id": "deepwood",
    "name": "Сумеречная чаща",
    "icon": "✦",
    "iconArt": "assets/zones/icons/deepwood.svg",
    "waves": 10,
    "hpMult": 1.36,
    "goldMult": 1.32,
    "monsters": [
      "deepwood_a",
      "deepwood_b"
    ],
    "boss": "deepwood_lord",
    "bosses": {
      "5": "deepwood_champion",
      "10": "deepwood_lord"
    },
    "colors": {
      "sky1": "#313744",
      "sky2": "#566078",
      "hill1": "#302b4c",
      "hill2": "#201d32",
      "ground": "#28243f"
    },
    "stars": false,
    "musicRoot": 130.8,
    "bg": {
      "src": "assets/zones/campaign/deepwood.svg"
    },
    "terrain": "darkwood"
  },
  {
    "id": "highlands",
    "name": "Скалистое высокогорье",
    "icon": "✦",
    "iconArt": "assets/zones/icons/highlands.svg",
    "waves": 10,
    "hpMult": 1.41,
    "goldMult": 1.36,
    "monsters": [
      "highlands_a",
      "highlands_b"
    ],
    "boss": "highlands_lord",
    "bosses": {
      "5": "highlands_champion",
      "10": "highlands_lord"
    },
    "colors": {
      "sky1": "#544841",
      "sky2": "#927f71",
      "hill1": "#6c5662",
      "hill2": "#483a42",
      "ground": "#5a4852"
    },
    "stars": false,
    "musicRoot": 87.3,
    "bg": {
      "src": "assets/zones/campaign/highlands.svg"
    },
    "terrain": "highland"
  },
  {
    "id": "dwarf",
    "name": "Город дварфов",
    "icon": "✦",
    "iconArt": "assets/zones/icons/dwarf.svg",
    "waves": 10,
    "hpMult": 1.45,
    "goldMult": 1.4,
    "monsters": [
      "dwarf_a",
      "dwarf_b"
    ],
    "boss": "dwarf_lord",
    "bosses": {
      "5": "dwarf_champion",
      "10": "dwarf_lord"
    },
    "colors": {
      "sky1": "#513d28",
      "sky2": "#8d6a46",
      "hill1": "#5b4247",
      "hill2": "#3d2c2f",
      "ground": "#4c373b"
    },
    "stars": false,
    "musicRoot": 103.8,
    "bg": {
      "src": "assets/zones/campaign/dwarf.svg"
    },
    "terrain": "dwarf"
  },
  {
    "id": "mines",
    "name": "Глубинные шахты",
    "icon": "✦",
    "iconArt": "assets/zones/icons/mines.svg",
    "waves": 10,
    "hpMult": 1.5,
    "goldMult": 1.44,
    "monsters": [
      "mines_a",
      "mines_b"
    ],
    "boss": "mines_lord",
    "bosses": {
      "5": "mines_champion",
      "10": "mines_lord"
    },
    "colors": {
      "sky1": "#334040",
      "sky2": "#596f71",
      "hill1": "#3b3e55",
      "hill2": "#272a39",
      "ground": "#313447"
    },
    "stars": false,
    "musicRoot": 92,
    "bg": {
      "src": "assets/zones/caves.webp"
    },
    "terrain": "mine"
  },
  {
    "id": "crystal",
    "name": "Кристальные пещеры",
    "icon": "✦",
    "iconArt": "assets/zones/icons/crystal.svg",
    "waves": 10,
    "hpMult": 1.54,
    "goldMult": 1.48,
    "monsters": [
      "crystal_a",
      "crystal_b"
    ],
    "boss": "crystal_lord",
    "bosses": {
      "5": "crystal_champion",
      "10": "crystal_lord"
    },
    "colors": {
      "sky1": "#383a5c",
      "sky2": "#6265a0",
      "hill1": "#3a2f73",
      "hill2": "#261f4d",
      "ground": "#302760"
    },
    "stars": true,
    "musicRoot": 110,
    "bg": {
      "src": "assets/zones/crystal.webp"
    },
    "terrain": "crystal"
  },
  {
    "id": "marsh",
    "name": "Проклятые болота",
    "icon": "✦",
    "iconArt": "assets/zones/icons/marsh.svg",
    "waves": 10,
    "hpMult": 1.59,
    "goldMult": 1.52,
    "monsters": [
      "marsh_a",
      "marsh_b"
    ],
    "boss": "marsh_lord",
    "bosses": {
      "5": "marsh_champion",
      "10": "marsh_lord"
    },
    "colors": {
      "sky1": "#38442c",
      "sky2": "#61764c",
      "hill1": "#364f41",
      "hill2": "#24352b",
      "ground": "#2d4236"
    },
    "stars": false,
    "musicRoot": 98,
    "bg": {
      "src": "assets/zones/campaign/marsh.svg"
    },
    "terrain": "swamp"
  },
  {
    "id": "cursed",
    "name": "Проклятый лес",
    "icon": "✦",
    "iconArt": "assets/zones/icons/cursed.svg",
    "waves": 10,
    "hpMult": 1.63,
    "goldMult": 1.56,
    "monsters": [
      "cursed_a",
      "cursed_b"
    ],
    "boss": "cursed_lord",
    "bosses": {
      "5": "cursed_champion",
      "10": "cursed_lord"
    },
    "colors": {
      "sky1": "#284036",
      "sky2": "#476f5e",
      "hill1": "#284944",
      "hill2": "#1a312e",
      "ground": "#213d39"
    },
    "stars": true,
    "musicRoot": 130.8,
    "bg": {
      "src": "assets/zones/cursed.webp"
    },
    "terrain": "cursed"
  },
  {
    "id": "ruins",
    "name": "Руины падшего королевства",
    "icon": "✦",
    "iconArt": "assets/zones/icons/ruins.svg",
    "waves": 10,
    "hpMult": 1.67,
    "goldMult": 1.6,
    "monsters": [
      "ruins_a",
      "ruins_b"
    ],
    "boss": "ruins_lord",
    "bosses": {
      "5": "ruins_champion",
      "10": "ruins_lord"
    },
    "colors": {
      "sky1": "#413e46",
      "sky2": "#726c7a",
      "hill1": "#49405e",
      "hill2": "#312a3e",
      "ground": "#3d354e"
    },
    "stars": false,
    "musicRoot": 87.3,
    "bg": {
      "src": "assets/zones/campaign/ruins.svg"
    },
    "terrain": "ruins"
  },
  {
    "id": "volcano",
    "name": "Вулканические земли",
    "icon": "✦",
    "iconArt": "assets/zones/icons/volcano.svg",
    "waves": 10,
    "hpMult": 1.72,
    "goldMult": 1.64,
    "monsters": [
      "volcano_a",
      "volcano_b"
    ],
    "boss": "volcano_lord",
    "bosses": {
      "5": "volcano_champion",
      "10": "volcano_lord"
    },
    "colors": {
      "sky1": "#5d2f1d",
      "sky2": "#a25233",
      "hill1": "#793836",
      "hill2": "#512624",
      "ground": "#652f2d"
    },
    "stars": false,
    "musicRoot": 103.8,
    "bg": {
      "src": "assets/zones/volcano.webp"
    },
    "terrain": "volcano"
  },
  {
    "id": "hellcanyon",
    "name": "Адский каньон",
    "icon": "✦",
    "iconArt": "assets/zones/icons/hellcanyon.svg",
    "waves": 10,
    "hpMult": 1.77,
    "goldMult": 1.68,
    "monsters": [
      "hellcanyon_a",
      "hellcanyon_b"
    ],
    "boss": "hellcanyon_lord",
    "bosses": {
      "5": "hellcanyon_champion",
      "10": "hellcanyon_lord"
    },
    "colors": {
      "sky1": "#572b27",
      "sky2": "#984b45",
      "hill1": "#683141",
      "hill2": "#46212b",
      "ground": "#572936"
    },
    "stars": false,
    "musicRoot": 92,
    "bg": {
      "src": "assets/zones/campaign/hellcanyon.svg"
    },
    "terrain": "canyon"
  },
  {
    "id": "fortress",
    "name": "Подступы к цитадели",
    "icon": "✦",
    "iconArt": "assets/zones/icons/fortress.svg",
    "waves": 10,
    "hpMult": 1.81,
    "goldMult": 1.72,
    "monsters": [
      "fortress_a",
      "fortress_b"
    ],
    "boss": "fortress_lord",
    "bosses": {
      "5": "fortress_champion",
      "10": "fortress_lord"
    },
    "colors": {
      "sky1": "#473541",
      "sky2": "#7c5d72",
      "hill1": "#483049",
      "hill2": "#302031",
      "ground": "#3c283d"
    },
    "stars": false,
    "musicRoot": 110,
    "bg": {
      "src": "assets/zones/campaign/fortress.svg"
    },
    "terrain": "fortress"
  },
  {
    "id": "citadel",
    "name": "Замок владыки демонов",
    "icon": "✦",
    "iconArt": "assets/zones/icons/citadel.svg",
    "waves": 10,
    "hpMult": 1.86,
    "goldMult": 1.76,
    "monsters": [
      "citadel_a",
      "citadel_b"
    ],
    "boss": "citadel_lord",
    "bosses": {
      "5": "citadel_champion",
      "10": "citadel_lord"
    },
    "colors": {
      "sky1": "#442839",
      "sky2": "#774763",
      "hill1": "#3d2644",
      "hill2": "#291a2e",
      "ground": "#332039"
    },
    "stars": true,
    "musicRoot": 98,
    "bg": {
      "src": "assets/zones/castle.webp"
    },
    "terrain": "citadel"
  }
];
})();
