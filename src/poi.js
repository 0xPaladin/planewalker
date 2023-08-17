const Planes = {
  "Outlands" : {
    "name": "Outlands",
    "alignment": ["neutral"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["random"],[1]]
  },
  "Mount Celestia" : {
    "name": "Mount Celestia",
    "alignment": ["lawful","good"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Bytopia" : {
    "name": "Bytopia",
    "alignment": ["good"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Elysium" : {
    "name": "Elysium",
    "alignment": ["good"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Beastlands" : {
    "name": "Beastlands",
    "alignment": ["good"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Arborea" : {
    "name": "Arborea",
    "alignment": ["good"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Ysgard" : {
    "name": "Ysgard",
    "alignment": ["good","neutral"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Limbo" : {
    "name": "Limbo",
    "alignment": ["neutral"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Pandemonium" : {
    "name": "Pandemonium",
    "alignment": ["evil"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Abyss" : {
    "name": "Abyss",
    "alignment": ["chaotic","evil"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Carceri" : {
    "name": "Carceri",
    "alignment": ["evil"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Gray Waste" : {
    "name": "Gray Waste",
    "alignment": ["evil"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Gehenna" : {
    "name": "Gehenna",
    "alignment": ["evil"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Baator" : {
    "name": "Baator",
    "alignment": ["evil","lawful"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Acheron" : {
    "name": "Acheron Waste",
    "alignment": ["evil","lawful"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Mechanus" : {
    "name": "Mechanus",
    "alignment": ["lawful"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
  "Arcadia" : {
    "name": "Arcadia",
    "alignment": ["lawful"],
    "display" : "PerilousShores",
    "childType" : "Region",
    "portals" : [["Outlands"],[1]]
  },
}

const Outlands = {  
  // Gate Towns 
  "Ecstacy": {
    "name": "Ecstacy",
    "terrain": "plains",
    "alignment": ["good"],
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
    "alignment": ["good"],
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
    "alignment": ["evil"],
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
    "alignment": ["chaotic", "evil"],
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
    "alignment": ["evil"],
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
    "alignment": ["evil"],
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
    "alignment": ["evil"],
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
    "alignment": ["lawful"],
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
    "alignment": ["good","lawful"],
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
  },
  //other Outlands Points
  "Sheela Peryroyl's Realm": {
    "name": "Sheela Peryroyl's Realm",
    "terrain": "plains",
    "parent" : "Outlands"
  },
  "Realm of the Norns": {
    "name": "Realm of the Norns",
    "terrain": "hills",
    "parent" : "Outlands"
  },
  "Mausoleum of Chronepsis": {
    "name": "Mausoleum of Chronepsis",
    "terrain": "hills",
    "parent" : "Outlands"
  },
  "Ysgard Mountains": {
    "name": "Ysgard Mountains",
    "terrain": "mountains",
    "parent" : "Outlands"
  },
  "Eastern Plains": {
    "name": "Eastern Plains",
    "terrain": "plains",
    "parent" : "Outlands"
  },
  "Dwarven Mountain": {
    "name": "Dwarven Mountain",
    "terrain": "mountains",
    "parent" : "Outlands"
  },
  "Ironridge": {
    "name": "Ironridge",
    "terrain": "mountains",
    "parent" : "Outlands"
  },
  "Court of Light": {
    "name": "Court of Light",
    "terrain": "plains",
    "parent" : "Outlands"
  },
  "Palace of Judgement": {
    "name": "Palace of Judgement",
    "terrain": "plains",
    "parent" : "Outlands"
  },
  "Semuanya's Bog": {
    "name": "Semuanya's Bog",
    "terrain": "swamp",
    "parent" : "Outlands"
  },
  "Thoth's Estate": {
    "name": "Thoth's Estate",
    "terrain": "plains",
    "parent" : "Outlands"
  },
  "Thebestys": {
    "name": "Thebestys",
    "terrain": "plains",
    "parent" : "Outlands"
  },
  "Shores of Tir fo Thiunn": {
    "name": "Shores of Tir fo Thiunn",
    "terrain": "water",
    "parent" : "Outlands"
  },
  "Tir na Og": {
    "name": "Tir na Og",
    "terrain": "forest",
    "parent" : "Outlands"
  },
  "Forests of Bytopia": {
    "name": "Forests of Bytopia",
    "terrain": "forest",
    "alignment": ["good"],
    "parent" : "Outlands"
  },
}

const MountCelestia = {
  "Shores of the Silver Sea": {
    "name": "Shores of the Silver Sea",
    "terrain": "water",
    "parent" : "Mount Celestia"
  },
  "Feet of Mount Celestia": {
    "name": "Feet of Mount Celestia",
    "terrain": "hills",
    "parent" : "Mount Celestia"
  },
  "Peaks of Mercuria": {
    "name": "Peaks of Mercuria",
    "terrain": "mountains",
    "parent" : "Mount Celestia"
  },
  "Forests of Venya": {
    "name": "Forests of Venya",
    "terrain": "forest",
    "parent" : "Mount Celestia"
  },
}

const Arcadia = {
  "Ordered Fields of Abellio": {
    "name": "Ordered Fields of Abellio",
    "terrain": "plains",
    "parent" : "Arcadia"
  },
  "Orchards of Abellio": {
    "name": "Orchards of Abellio",
    "terrain": "forest",
    "parent" : "Arcadia"
  },
  "Citadel of the Cloud King": {
    "name": "Citadel of the Cloud King",
    "terrain": "mountains",
    "parent" : "Arcadia"
  },
}

const Elysium = {
  "Fertile Plains of Amoria": {
    "name": "Fertile Plains of Amoria",
    "terrain": "plains",
    "parent" : "Elysium"
  },
  "Gentle Forests of Amoria": {
    "name": "Gentle Forests of Amoria",
    "terrain": "forest",
    "parent" : "Elysium"
  },
  "Teeth of Eronia": {
    "name": "Teeth of Eronia",
    "terrain": "mountains",
    "parent" : "Elysium"
  },
  "Sands of Belierin": {
    "name": "Sands of Belierin",
    "terrain": "desert",
    "parent" : "Elysium"
  },
  "Banks of Oceanus": {
    "name": "Banks of Oceanus",
    "terrain": "water",
    "parent" : "Elysium"
  },
  "Seas of Thalasia": {
    "name": "Seas of Thalasia",
    "terrain": "water",
    "parent" : "Elysium",
    "PS" : ["island","archipelago"]
  },
}

const Bytopia = {
  "Forests of Dothion": {
    "name": "Forests of Dothion",
    "terrain": "forest",
    "parent" : "Bytopia"
  },
  "Shore of Lake Crystal": {
    "name": "Shore of Lake Crystal",
    "terrain": "water",
    "parent" : "Bytopia"
  },
  "Base of a Spire": {
    "name": "Base of a Spire",
    "terrain": "mountains",
    "parent" : "Bytopia"
  },
  "Golden Hills": {
    "name": "Golden Hills",
    "terrain": "hills",
    "parent" : "Bytopia"
  },
  "Rolling Plains of Dothion": {
    "name": "Rolling Plains of Dothion",
    "terrain": "plains",
    "parent" : "Bytopia"
  },
  "Forests of Shurrock": {
    "name": "Forests of Shurrock",
    "terrain": "forest",
    "parent" : "Bytopia"
  },
  "Adamantine Range": {
    "name": "Adamantine Range",
    "terrain": "mountains",
    "parent" : "Bytopia"
  },
}

const Beastlands = {
  "Zhan, The Grand Forest Beyond the World": {
    "name": "Zhan, The Grand Forest Beyond the World",
    "terrain": "forest",
    "parent" : "Beastlands"
  },
  "Black Desert": {
    "name": "Black Desert",
    "terrain": "desert",
    "parent" : "Beastlands"
  },
  "Cat Lord's Prowl": {
    "name": "Cat Lord's Prowl",
    "terrain": "forest",
    "parent" : "Beastlands"
  },
  "Plains of Brux": {
    "name": "Plains of Brux",
    "terrain": "plains",
    "parent" : "Beastlands"
  },
  "Plains of Krigala": {
    "name": "Plains of Krigala",
    "terrain": "plains",
    "parent" : "Beastlands"
  },
  "Banks of Oceanus": {
    "name": "Banks of Oceanus",
    "terrain": "water",
    "parent" : "Beastlands"
  },
}

const GrayWaste = {
  "The Base of Mount Olympus" : {
    "name": "The Base of Mount Olympus",
    "terrain": "mountains",
    "parent" : "Gray Waste"
  },
  "Plains of Pluton" : {
    "name": "Plains of Pluton",
    "terrain": "plains",
    "parent" : "Gray Waste"
  },
  "Annwn" : {
    "name": "Annwn",
    "terrain": "water",
    "parent" : "Gray Waste"
  },
  "Roots of the World Ash" : {
    "name": "Roots of the World Ash",
    "terrain": "forest",
    "parent" : "Gray Waste"
  },
  "The River Styx" : {
    "name": "The River Styx",
    "terrain": "swamp",
    "parent" : "Gray Waste"
  },
  "Glitterhell" : {
    "name": "Glitterhell",
    "terrain": "mountains",
    "parent" : "Gray Waste"
  },
}

const Baator = {
  "Teeth of Avernus" : {
    "name": "Teeth of Avernus",
    "terrain": "mountains",
    "parent" : "Baator"
  },
  "Pits of Minauros" : {
    "name": "Pits of Minauros",
    "terrain": "swamp",
    "parent" : "Baator"
  },
  "Burning Sands of Phlegethos" : {
    "name": "Burning Sands of Phlegethos",
    "terrain": "desert",
    "parent" : "Baator"
  },
}

const Abyss = {
  "Plain of Infinite Portals" : {
    "name": "Plain of Infinite Portals",
    "terrain": "desert",
    "parent" : "Abyss"
  },
}

const Gehenna = {
  "Peaks of Khalas" : {
    "name": "Peaks of Khalas",
    "terrain": "mountains",
    "parent" : "Gehenna"
  },
  "Slopes of Chamada" : {
    "name": "Slopes of Chamada",
    "terrain": "mountains",
    "parent" : "Gehenna"
  },
}


const Regions = Object.assign({},{
  Outlands,
  "Mount Celestia" : MountCelestia,
  Elysium,
  Bytopia,
  Beastlands,
  Arcadia,
  "Gray Waste" : GrayWaste,
  Baator,
  Gehenna,
  Abyss
})

export {Planes,Regions}
