const Planes = {
  "Outlands" : {
    "name": "Outlands",
    "alignment": ["neutral"],
    "display" : "PerilousShores",
    "childType" : "Region"
  },
}

const Regions = {  
  // Gate Towns 
  "Ecstacy": {
    "name": "Ecstacy",
    "terrain": "plains",
    "alignment": ["neutral","good"],
    "children": [{
      "name" : "Ecstacy",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Faunel": {
    "name": "Faunel",
    "terrain": "plains",
    "alignment": ["neutral"],
    "children": [{
      "name" : "Faunel",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Sylvania": {
    "name": "Sylvania",
    "terrain": "plains",
    "alignment": ["neutral"],
    "children": [{
      "name" : "Sylvania",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Glorium": {
    "name": "Glorium",
    "terrain": "mountains",
    "alignment": ["good", "neutral"],
    "children": [{
      "name" : "Glorium",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Xaos": {
    "name": "Xaos",
    "terrain": "hills",
    "alignment": ["neutral"],
    "children": [{
      "name" : "Xaos",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Bedlam": {
    "name": "Bedlam",
    "terrain": "hills",
    "alignment": ["neutral","evil"],
    "children": [{
      "name" : "Bedlam",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Plague-Mort": {
    "name": "Plague-Mort",
    "terrain": "desert",
    "alignment": ["chaotic", "evil", "neutral"],
    "children": [{
      "name" : "Plague-Mort",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Curst": {
    "name": "Curst",
    "terrain": "hills",
    "alignment": ["evil", "neutral"],
    "children": [{
      "name" : "Curst",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Hopeless": {
    "name": "Hopeless",
    "terrain": "plains",
    "alignment": ["evil", "neutral"],
    "children": [{
      "name" : "Hopeless",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Torch": {
    "name": "Torch",
    "terrain": "hills",
    "alignment": ["evil", "neutral"],
    "children": [{
      "name" : "Torch",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Ribcage": {
    "name": "Ribcage",
    "terrain": "mountains",
    "alignment": ["evil", "lawful"],
    "children": [{
      "name" : "Ribcage",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Rigus": {
    "name": "Rigus",
    "terrain": "hills",
    "alignment": ["lawful","neutral"],
    "children": [{
      "name" : "Rigus",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Automata": {
    "name": "Automata",
    "terrain": "plains",
    "alignment": ["lawful"],
    "children": [{
      "name" : "Automata",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Fortitude": {
    "name": "Fortitude",
    "terrain": "plains",
    "alignment": ["good","neutral","lawful"],
    "children": [{
      "name" : "Fortitude",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Excelsior": {
    "name": "Excelsior",
    "terrain": "hills",
    "alignment": ["good","lawful"],
    "children": [{
      "name" : "Excelsior",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  },
  "Tradegate": {
    "name": "Tradegate",
    "terrain": "forest",
    "alignment": ["good"],
    "children": [{
      "name" : "Tradegate",
      "what" : "settlement",
      "scale" : 3
    }],
    "parent" : "Outlands"
  }
}

const Points = {
  "Sheela Peryroyl's Realm": {
    "name": "Sheela Peryroyl's Realm",
    "marker": "point",
    "p": [626, 272],
    "size": 35,
    "color": "#ffffff",
    "terrain": "plains",
    "alignment": ["good", "neutral"]
  },
  "Realm of the Norns": {
    "name": "Realm of the Norns",
    "terrain": "hills",
    "marker": "point",
    "p": [704, 284],
    "size": 35,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Mausoleum of Chronepsis": {
    "name": "Mausoleum of Chronepsis",
    "terrain": "hills",
    "marker": "point",
    "p": [783, 313],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Ysgard Mountains": {
    "name": "Ysgard Mountains",
    "marker": "point",
    "p": [874, 314],
    "size": 30,
    "color": "#ffffff",
    "terrain": "mountains",
    "alignment": ["neutral"]
  },
  "Eastern Plains": {
    "name": "Eastern Plains",
    "terrain": "plains",
    "marker": "point",
    "p": [681, 346],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Dwarven Mountain": {
    "name": "Dwarven Mountain",
    "terrain": "mountains",
    "marker": "point",
    "p": [818, 344],
    "size": 45,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Ironridge": {
    "name": "Ironridge",
    "terrain": "mountains",
    "marker": "point",
    "p": [788, 365],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Court of Light": {
    "name": "Court of Light",
    "terrain": "plains",
    "marker": "point",
    "p": [660, 423],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Palace of Judgement": {
    "name": "Palace of Judgement",
    "terrain": "plains",
    "marker": "point",
    "p": [628, 421],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Semuanya's Bog": {
    "name": "Semuanya's Bog",
    "terrain": "swamp",
    "marker": "point",
    "p": [516, 426],
    "size": 40,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Thoth's Estate": {
    "name": "Thoth's Estate",
    "terrain": "plains",
    "marker": "point",
    "p": [175, 357],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Thebestys": {
    "name": "Thebestys",
    "terrain": "plains",
    "marker": "point",
    "p": [205, 358],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Shores of Tir fo Thiunn": {
    "name": "Shores of Tir fo Thiunn",
    "terrain": "water",
    "marker": "point",
    "p": [416, 314],
    "size": 45,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Tir na Og": {
    "name": "Tir na Og",
    "terrain": "forest",
    "marker": "point",
    "p": [453, 269],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["neutral"]
  },
  "Forests of Bytopia": {
    "name": "Forests of Bytopia",
    "terrain": "forest",
    "marker": "point",
    "p": [469, 230],
    "size": 30,
    "color": "#ffffff",
    "alignment": ["good", "neutral"]
  },
  
}

export {Planes,Regions}
