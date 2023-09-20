const InnerPlanes = {
  "Ethereal": {
    "name": "Ethereal",
    "layers": ["Ethereal"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "portals": "Inner,Outlands,Astral/5,2.5,2.5",
    "tags": ["NN","inner"],
    "terrain" : {
      "base" : "islands/1",
    },
    "PS" : {
      "base" : "archipelago,island/8,2",
      "difficult" : 25,
    },
  },
  "Plane of Air": {
    "name": "Plane of Air",
    "layers": ["Plane of Air"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "portals": "Ethereal,Plane of Water,Plane of Fire,Plane of Earth,Outlands,Astral/3,2,2,1,1,1",
    "tags": ["NN","inner"],
    "terrain" : {
      "base" : "islands/1",
      "water" : ["Water Globe"],
      "swamp" : ["Dust Front"],
      "plains" : ["Clear Skies"],
      "desert" : ["Sirocco"],
      "forest" : ["Green Tangle"],
      "hills" : ["Debris Field"],
      "mountains" : ["Earthburg"],
    },
    "PS" : {
      "base" : "archipelago,island/8,2",
      "difficult" : 25,
    },
  },
  "Plane of Earth": {
    "name": "Plane of Earth",
    "layers": ["Plane of Earth"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "portals": "Ethereal,Plane of Water,Plane of Fire,Plane of Air,Outlands,Astral/3,2,2,1,1,1",
    "tags": ["NN","inner"],
    "terrain" : {
      "id" : "Plane of Earth",
      "base" : "lake,barren,wetland,woodland,lowlands,highlands,standard/1,1,1,1,2,2,2",
      "water" : ["Encased Sea"],
      "swamp" : ["Soil, Clay, Mud, and Silt"],
      "plains" : ["Sedimentary Rock/Limestone and Sandstone"],
      "desert" : ["Loose Sedimentary Rock/Limestone, Sandstone and Sand"],
      "forest" : ["Mineral Veins"],
      "hills" : ["Metamorphic Rock/Gneiss, Slate and Marble"],
      "mountains" : ["Dense Igneous Rock/Granite, Diorite and Bassalt"],
    },
    "PS" : {
      "base" : "land,lake/9,1",
      "difficult" : 100
    },
  },
  "Plane of Fire": {
    "name": "Plane of Fire",
    "layers": ["Plane of Fire"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "portals": "Ethereal,Plane of Air,Plane of Earth,Plane of Water,Outlands,Astral/3,2,2,1,1,1",
    "tags": ["NN","inner"],
    "terrain" : {
      "base" : "islands/1",
      "water" : ["Roiling Plasma"],
      "swamp" : ["Magma Field"],
      "plains" : ["Bassalt Flats"],
      "forest" : ["Flame Forest"],
    },
    "PS" : {
      "base" : "archipelago,island/8,2",
      "difficult" : 100
    },
  },
  "Plane of Water": {
    "name": "Plane of Water",
    "layers": ["Plane of Water"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "portals": "Ethereal,Plane of Air,Plane of Earth,Plane of Fire,Outlands,Astral/3,2,2,1,1,1",
    "tags": ["NN","inner"],
    "terrain" : {
      "base" : "islands/1",
      "water" : ["Open Water"],
      "swamp" : ["Silt Confluence"],
      "plains" : ["Open Water"],
      "desert" : ["Hypersaline Confluence"],
      "forest" : ["Kelp Tangle"],
      "hills" : ["Debris Confluence"],
      "mountains" : ["Earthburg"],
    },
    "PS" : {
      "base" : "archipelago,island/8,2",
      "difficult" : 50
    },
  },
}

const OuterPlanes = {
  "Outlands": {
    "name": "Outlands",
    "layers": ["Outlands"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "portals": "Outer,Astral/3,1",
    "tags": ["NN","outer"],
    "encounters": {
      "base": "Rilmani,Celestial,Fiend,Modron,Elemental,Fey,Beast,Monster/30,5,5,2,5,3,30,20"
    }
  },
  "Astral": {
    "name": "Astral",
    "layers": ["Astral"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "portals": "Inner,Outer/1,2",
    "tags": ["NN","outer"],
  },
  //Planes of Law
  "Mount Celestia": {
    "name": "Mount Celestia",
    "layers": ["Lunia", "Mercuria", "Venya", "Solania", "Mertion", "Jovar", "Chronias"],
    "alignment": ["lawful", "good"],
    "display": "PerilousShores",
    "tags": ["LG","outer"],
    "encounters": {
      "base": "Archon,Aasimon,Animal,Dragon/4,1,4,1"
    }
  },
  "Arcadia": {
    "name": "Arcadia",
    "layers": ["Abellio", "Buxenus"],
    "alignment": ["lawful"],
    "display": "PerilousShores",
    "tags": ["LN", "LG","outer"],
    "encounters": {
      "base": "Archon,Celestial,Elemental,Dragon,Animal/10,30,10,5,45"
    }
  },
  "Mechanus": {
    "name": "Mechanus",
    "layers": ["Mechanus"],
    "alignment": ["lawful"],
    "display": "PerilousShores",
    "tags": ["LN","outer"],
    "encounters": {
      "base": "Modron,Archon,Dragon,Construct,Elemental,Beast/30,5,5,15,10,35"
    }
  },
  "Acheron": {
    "name": "Acheron",
    "layers": ["Nessus", "Avalas", "Thuldanin", "Tintibulus"],
    "alignment": ["evil", "lawful"],
    "display": "PerilousShores",
    "tags": ["LE", "LN","outer"],
    "encounters": {
      "base": "Fiend,Undead,Beast,Magical Beast/2,2,3,3"
    }
  },
  "Baator": {
    "name": "Baator",
    "layers": ["Avernus", "Dis", "Minauros", "Phlegethos", "Stygia", "Malboge", "Maladomini", "Caina", "Nessus"],
    "alignment": ["evil", "lawful"],
    "display": "PerilousShores",
    "tags": ["LE","outer"],
    "encounters": {
      "base": "Baatezu,Fiend,Dragon,Undead,Beast,Magical Beast,Plant/40,5,10,5,20,15,5"
    }
  },
  //Planes of Chaos
  "Arborea": {
    "name": "Arborea",
    "layers": ["Arvandor", "Ossa", "Pelion"],
    "alignment": ["good"],
    "display": "PerilousShores",
    "tags": ["CG","outer"],
    "encounters": {
      "base": "Eladrin,Fey,Beast,Magical Beast,Plant/30,20,20,20,10"
    }
  },
  "Ysgard": {
    "name": "Ysgard",
    "layers": ["Asgard", "Muspelheim", "Nidavellir"],
    "alignment": ["good", "neutral"],
    "display": "PerilousShores",
    "tags": ["CG", "CN","outer"],
    "encounters": {
      "base": "Eladrin,Giant,Fey,Beast,Magical Beast/1,1,1,1,1"
    }
  },
  "Limbo": {
    "name": "Limbo",
    "layers": ["Limbo"],
    "alignment": ["neutral"],
    "display": "PerilousShores",
    "tags": ["CN","outer"],
    "encounters": {
      "base": "Slaad,Tanar'ri,Elemental,Beast,Ooze/4,1,1,3,1"
    }
  },
  "Pandemonium": {
    "name": "Pandemonium",
    "layers": ["Pandesmos", "Cocytus", "Phlegethon", "Agathion"],
    "alignment": ["evil"],
    "display": "PerilousShores",
    "tags": ["CN", "CE","outer"],
    "encounters": {
      "base": "Fiend,Animal,Vermin,Ooze,Undead,Aberration/2,1,2,2,2,1"
    }
  },
  "Abyss": {
    "name": "Abyss",
    "layers": ["Layer of Infinite Portals"],
    "alignment": ["chaotic", "evil"],
    "display": "PerilousShores",
    "tags": ["CE","outer"],
    "encounters": {
      "base": "Tanar'ri,Fiend,Undead,Beast,Aberration/50,10,15,20,5"
    }
  },
  //Planes of Concord 
  "Elysium": {
    "name": "Elysium",
    "layers": ["Amoria", "Eronia", "Belierin", "Thalasia"],
    "alignment": ["good"],
    "display": "PerilousShores",
    "tags": ["NG","outer"],
    "encounters": {
      "base": "Guardinal,Celestial,Animal,Dragon/4,1,4,1"
    }
  },
  "Bytopia": {
    "name": "Bytopia",
    "layers": ["Dothion", "Shurrock"],
    "alignment": ["good"],
    "display": "PerilousShores",
    "tags": ["LG", "NG","outer"],
    "encounters": {
      "base": "Celestial,Dragon,Animal/3,1,6"
    }
  },
  "Beastlands": {
    "name": "Beastlands",
    "layers": ["Krigala", "Brux", "Karasuthra"],
    "alignment": ["good"],
    "display": "PerilousShores",
    "tags": ["NG", "CG","outer"],
    "encounters": {
      "base": "Animal,Plant,Celestial,Fey,Elemental/5,2,1,1,1"
    }
  },
  "Carceri": {
    "name": "Carceri",
    "layers": ["Othrys", "Cathrys", "Minethys", "Colothys", "Porphatys", "Agathys"],
    "alignment": ["evil"],
    "display": "PerilousShores",
    "tags": ["NE", "CE","outer"],
    "encounters": {
      "base": "Fiend,Undead,Giant,Aberration,Beast,Monster/2,1,2,1,2,2 "
    }
  },
  "Gray Waste": {
    "name": "Gray Waste",
    "layers": ["Oinos", "Nifleim", "Pluton"],
    "alignment": ["evil"],
    "display": "PerilousShores",
    "tags": ["NE","outer"],
    "encounters": {
      "base": "Yugoloth,Fiend,Undead,Giant,Beast,Monster/2,1,2,1,2,2"
    }
  },
  "Gehenna": {
    "name": "Gehenna",
    "layers": ["Khalas", "Chamada", "Mungoth", "Krangath"],
    "alignment": ["evil"],
    "display": "PerilousShores",
    "tags": ["LE", "NE","outer"],
    "encounters": {
      "base": "Yugoloth,Fiend,Beast,Monster/4,2,2,2"
    }
  },
}

const Outlands = {
  // Gate Towns 
  "Ecstacy": {
    "name": "Ecstacy",
    "terrain": "plains",
    "alignment": ["good"],
    "children": [{
      "name": "Ecstacy",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Faunel": {
    "name": "Faunel",
    "terrain": "plains",
    "alignment": ["good"],
    "children": [{
      "name": "Faunel",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Sylvania": {
    "name": "Sylvania",
    "terrain": "plains",
    "children": [{
      "name": "Sylvania",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Glorium": {
    "name": "Glorium",
    "terrain": "mountains",
    "children": [{
      "name": "Glorium",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Xaos": {
    "name": "Xaos",
    "terrain": "hills",
    "children": [{
      "name": "Xaos",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Bedlam": {
    "name": "Bedlam",
    "terrain": "hills",
    "alignment": ["evil"],
    "children": [{
      "name": "Bedlam",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Plague-Mort": {
    "name": "Plague-Mort",
    "terrain": "desert",
    "alignment": ["chaotic", "evil"],
    "children": [{
      "name": "Plague-Mort",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Curst": {
    "name": "Curst",
    "terrain": "hills",
    "alignment": ["evil"],
    "children": [{
      "name": "Curst",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Hopeless": {
    "name": "Hopeless",
    "terrain": "plains",
    "alignment": ["evil"],
    "children": [{
      "name": "Hopeless",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Torch": {
    "name": "Torch",
    "terrain": "hills",
    "alignment": ["evil"],
    "children": [{
      "name": "Torch",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Ribcage": {
    "name": "Ribcage",
    "terrain": "mountains",
    "alignment": ["evil", "lawful"],
    "children": [{
      "name": "Ribcage",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Rigus": {
    "name": "Rigus",
    "terrain": "hills",
    "alignment": ["lawful"],
    "children": [{
      "name": "Rigus",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Automata": {
    "name": "Automata",
    "terrain": "plains",
    "alignment": ["lawful"],
    "children": [{
      "name": "Automata",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Fortitude": {
    "name": "Fortitude",
    "terrain": "plains",
    "alignment": ["good", "lawful"],
    "children": [{
      "name": "Fortitude",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Excelsior": {
    "name": "Excelsior",
    "terrain": "hills",
    "alignment": ["good", "lawful"],
    "children": [{
      "name": "Excelsior",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  "Tradegate": {
    "name": "Tradegate",
    "terrain": "forest",
    "alignment": ["good"],
    "children": [{
      "name": "Tradegate",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  },
  //other Outlands Points
  "Sheela Peryroyl's Realm": {
    "name": "Sheela Peryroyl's Realm",
    "terrain": "plains",
    "parent": "Outlands"
  },
  "Realm of the Norns": {
    "name": "Realm of the Norns",
    "terrain": "hills",
    "parent": "Outlands"
  },
  "Mausoleum of Chronepsis": {
    "name": "Mausoleum of Chronepsis",
    "terrain": "hills",
    "parent": "Outlands"
  },
  "Ysgard Mountains": {
    "name": "Ysgard Mountains",
    "terrain": "mountains",
    "parent": "Outlands"
  },
  "Eastern Plains": {
    "name": "Eastern Plains",
    "terrain": "plains",
    "parent": "Outlands"
  },
  "Dwarven Mountain": {
    "name": "Dwarven Mountain",
    "terrain": "mountains",
    "parent": "Outlands"
  },
  "Ironridge": {
    "name": "Ironridge",
    "terrain": "mountains",
    "parent": "Outlands"
  },
  "Court of Light": {
    "name": "Court of Light",
    "terrain": "plains",
    "parent": "Outlands"
  },
  "Palace of Judgement": {
    "name": "Palace of Judgement",
    "terrain": "plains",
    "parent": "Outlands"
  },
  "Semuanya's Bog": {
    "name": "Semuanya's Bog",
    "terrain": "swamp",
    "parent": "Outlands"
  },
  "Thoth's Estate": {
    "name": "Thoth's Estate",
    "terrain": "plains",
    "parent": "Outlands"
  },
  "Thebestys": {
    "name": "Thebestys",
    "terrain": "plains",
    "parent": "Outlands"
  },
  "Shores of Tir fo Thiunn": {
    "name": "Shores of Tir fo Thiunn",
    "terrain": "water",
    "parent": "Outlands"
  },
  "Tir na Og": {
    "name": "Tir na Og",
    "terrain": "forest",
    "parent": "Outlands"
  },
  "Forests of Bytopia": {
    "name": "Forests of Bytopia",
    "terrain": "forest",
    "alignment": ["good"],
    "parent": "Outlands"
  },
}

const Regions = Object.assign({})

const Factions = {
  "Believers of the Source": {
    'fronts': 'Misguided Good,Religious Organization,Corrupt Government,Cabal,Choir of Angels,Construct of Law',
    "class" : "Sigil",
    "alignment": ["good"],
  },
  "Harmonium": {
    'fronts': 'Misguided Good,Religious Organization,Corrupt Government,Cabal,Choir of Angels,Construct of Law',
    "class" : "Sigil",
    "alignment": ["lawful"],
  },
  "Sign of One": {
    'fronts': 'Misguided Good,Cabal',
    "class" : "Sigil",
    "alignment": ["good"],
  },
  "Aasimon": {
    'fronts': 'Misguided Good,Choir of Angels,Construct of Law',
    "class" : "Outsider",
    "alignment": ["good"],
  },
  "Archon": {
    'fronts': 'Misguided Good,Religious Organization,Choir of Angels,Construct of Law',
    "class" : "Outsider",
    "alignment": ["lawful/good"],
    "home" : "Mount Celestia"
  },
  "Eladrin": {
    'fronts': 'Misguided Good,Choir of Angels',
    "class" : "Outsider",
    "alignment": ["chaotic/good"],
    "home" : "Arborea"
  },
  "Guardinal": {
    'fronts': 'Misguided Good,Corrupt Government,Choir of Angels',
    "class" : "Outsider",
    "alignment": ["neutral/good"],
    "home" : "Elysium"
  },
  "Fraternity of Order": {
    'fronts': 'Misguided Good,Religious Organization,Corrupt Government,Cabal,Choir of Angels,Construct of Law',
    "class" : "Sigil",
    "alignment": ["lawful"],
  },
  "Mercykillers": {
    'fronts': 'Misguided Good,Religious Organization,Corrupt Government,Cabal,Choir of Angels,Construct of Law',
    "class" : "Sigil",
    "alignment": ["lawful"],
  },
  "Baatezu": {
    'fronts': 'Cult,Religious Organization,Corrupt Government,Cabal,God,Choir of Angels,Construct of Law,Power-mad Wizard,Chosen One,Dark Portal,Plague of the Undead',
    "class" : "Outsider",
    "alignment": ["lawful/evil"],
    "home" : "Baator"
  },
  "Modron": {
    'fronts': 'Corrupt Government,Choir of Angels,Construct of Law',
    "class" : "Outsider",
    "alignment": ["lawful/neutral"],
    "home" : "Mechanus"
  },
  "Free League": {
    'fronts': 'Misguided Good,Cabal',
    "class" : "Sigil",
    "alignment": ["chaotic"],
  },
  "Revolutionary League": {
    'fronts': 'Thieves Guild,Cult,Cabal,Elemental Lord,Force of Chaos,Chosen One',
    "class" : "Sigil",
    "alignment": ["chaotic"],
  },
  "Xaositects": {
    'fronts': 'Thieves Guild,Cult,Cabal,Elemental Lord,Force of Chaos',
    "class" : "Sigil",
    "alignment": ["chaotic"],
  },
  "Gehreleth": {
    'fronts': 'Thieves Guild,Cult,Cabal,Immortal Prince,Power-mad Wizard,Dark Portal,Chosen One',
    "class" : "Outsider",
    "alignment": ["chaotic/evil"],
    "home" : "Carceri"
  },
  "Slaad": {
    'fronts': 'Cult,Immortal Prince,Elemental Lord,Force of Chaos,Power-mad Wizard,Chosen One,Dragon,Wandering Barbarians,Dark Portal,Vermin',
    "class" : "Outsider",
    "alignment": ["chaotic/neutral"],
    "home" : "Limbo"
  },
  "Tanar'ri": {
    'fronts': 'Cult,God,Immortal Prince,Force of Chaos,Power-mad Wizard,Chosen One,Dark Portal,Wandering Barbarians,Vermin',
    "class" : "Outsider",
    "alignment": ["chaotic/evil"],
    "home" : "Abyss"
  },
  "Bleak Cabal": {
    'fronts': 'Thieves Guild,Cult,Cabal,Elemental Lord,Force of Chaos,Chosen One,Power-mad Wizard',
    "class" : "Sigil",
    "alignment": ["evil"],
  },
  "Doomguard": {
    'fronts': 'Thieves Guild,Cult,Cabal,Elemental Lord,Force of Chaos,Chosen One,Power-mad Wizard',
    "class" : "Sigil",
    "alignment": ["evil"],
  },
  "Fated": {
    'fronts': 'Thieves Guild,Cabal,Power-mad Wizard,Chosen One',
    "class" : "Sigil",
    "alignment": ["neutral"],
  },
  "Yugoloth": {
    'fronts': 'Thieves Guild,Cult,Immortal Prince,Power-mad Wizard,Chosen One,Dark Portal,Vermin',
    "class" : "Outsider",
    "alignment": ["neutral/evil"],
    "home" : "Gray Waste"
  },
  "Athar": {
    'fronts': 'Misguided Good,Corrupt Government,Cabal,Power-mad Wizard,Chosen One',
    "class" : "Sigil",
    "alignment": ["neutral"],
  },
  "Dustmen": {
    'fronts': 'Misguided Good,Corrupt Government,Cabal,Power-mad Wizard,Chosen One',
    "class" : "Sigil",
    "alignment": ["neutral"],
  },
  "Transcendent Order": {
    'fronts': 'Misguided Good,Corrupt Government,Cabal',
    "class" : "Sigil",
    "alignment": ["neutral"],
  },
}

export {InnerPlanes, OuterPlanes, Regions, Factions}
