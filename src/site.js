/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"

/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Hash, Difficulty,BuildArray, chance} from "./random.js"

/*
  Data for generation 
*/
const Types = {
  "caves/caverns": {
    "area": [['collapsed area', 'tunnel network', 'cave/gallery/room', 'cavern/chamber', 'cave cluster', 'multi-level cavern', 'different dungeon', 'specialArea'], [1, 1, 4, 2, 1, 1, 1, 1]],
    "specialArea": [['Midden', 'Bottomless Cave', 'Ice Cave', 'Underground Maze', 'Bandit Hideout.Bandit', 'Lair of a Monster.Monster', 'Vast Cavern (holds 1d4 structures)', 'Strange Cavern.Oddity', 'Lake of Lava', 'Portal.Portal', 'different dungeon specialArea'], [1,1,1,1,1,2,1,1,1,1,1]],
  },
  "ruined settlement": {
    "area": [['sewers/midden/dump', 'settlement defenses (walls, moat, etc.)', 'shacks/slums/poor quarter', 'homes/residential quarter', 'watering hole/well/cistern/aqueduct', 'workshops/industrial quarter', 'shops/market/mercantile quarter', 'docks/trading post/caravansary', 'temple/religious quarte', 'specialArea'], [1, 1, 2, 2, 1, 1, 1, 1, 1, 1]],
    "specialArea": [['Graveyard/Necropolis', 'Monument/Statue/Obelisk', 'Gallows/Arena/Theater', 'Main Marketplace/Bazaar', 'Main Plaza/Parade Ground', 'Guardhouse/Barracks', 'Shrine/Temple (element/aspect)', "Shaman’s Hut/Library/Wizard's Tower", 'Leader’s Hut/Palace', 'Dungeon Entrance'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 3]],
  },
  "prison": {
    "area": [['latrine/midden/dump', 'passageway', 'guardpost/checkpoint/gateway', 'cellblock', 'storeroom', 'mess/kitchen/larder', 'yard/common area/well', 'barracks/quarters/kennels', 'workshops', 'specialArea'], [1, 1, 1, 3, 1, 1, 1, 1, 1, 1]],
    "specialArea": [['Burial Pits', 'Oubliette', 'Sealed Cellblock', 'Torture Chamber', 'Quarry/Excavation Site', 'Hall of Judgment', 'Hall of Subjugation', 'Shrine of [Element/Aspect]', 'Administrative Offices', 'Warden’s Quarters', 'Mine Entrance (adjacent dungeon)', 'different dungeon specialArea'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  },
  "mine/quarry/excavation": {
    "area": [['collapsed area', 'waste pits (tailings, etc.)', 'mining tunnel network', 'natural caves/cavern/chasm', 'underground stream/river/pool/lake', 'miners’ quarters/common rooms', 'holding/processing area (for resource)', 'storeroom/workshop', 'different dungeon', 'specialArea'], [1, 1, 3, 1, 1, 1, 1, 1, 1, 1]],
    "specialArea": [['Pit of Doom', 'Labyrinth', 'Excavation Site', 'Great Chasm/Bridge', 'Reservoir/Cistern/Aqueduct/Canal', 'Vast Cavern (holds 1d4 structures)', 'Strange Cavern (oddity)', 'Enchanted Pool (ability)', 'Mother Lode/Treasure Vault', 'Gateway to underlands (wilderness)', 'Extraplaner Portal', 'different dungeon specialArea'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  },
  "tomb/crypt/necropolis": {
    "area": [['collapsed area', 'false treasure vault/tomb (+trap)', 'passage (+trap)', 'crypt-lined passage/chamber', 'passage', 'chamber', 'gallery', 'different dungeon', 'specialArea'], [1, 1, 2, 1, 2, 2, 1, 1, 1]],
    "specialArea": [['Maze', 'Catacombs', 'Well Room', 'Sacrificial Chamber', 'Shrine of [Element/Aspect]', 'Mortuary Temple', 'Necropolis', 'Hall of Offerings', 'Burial Vault', 'Secret Burial Vault', 'Treasure Vault', 'different dungeon specialArea'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  },
  "lair/den/hideout": {
    "area": [['caves/caverns (pXX)', 'ruined settlement (pXX)', 'prison (pXX)', 'mine (pXX)', 'crypt/tomb (pXX)', 'stronghold/fortress (pXX)', 'origin unknown (pXX)'], [3, 3, 1, 1, 1, 1, 2]],
    "specialArea": [['Waste Pit/Midden', 'Burial Ground/Boneyard', 'Guardroom/Ambuscade', 'Storeroom/Larder', 'Well Room/Watering Hole', 'Barracks/Brood Pit', 'Shrine of [Element/Aspect]', 'Armory/Trophy Room', 'Audience Room', '[Occupant]’s Quarters/Lair', 'Strongroom/Treasure Hoard', 'different dungeon specialArea'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  },
  "stronghold/fortress": {
    "area": [['latrine/midden/dump', 'fortified gate/guardpost', 'passageways', 'common quarters', 'storerage/supply', 'mess/kitchen/larder', 'courtyard/well room', 'barracks/stables/kennels/aviary', 'workshops', 'specialArea'], [1, 2, 2, 1, 1, 1, 1, 1, 1, 1]],
    "specialArea": [['Dungeon/Torture Chamber', 'Menagerie/Arena', 'Feasting Hall', 'Shrine/Temple of [Element/Aspect]', 'Armory', 'Trophy Hall/Hall of Ancestors', 'Audience/Throne Room', 'Advisor’s/Lieutenant’s Quarters', 'Leader’s/Lord’s Quarters', 'Secret Room', 'Treasure Chamber', 'different dungeon specialArea'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  },
  "shrine/temple/sanctuary": {
    "area": [['latrine/waste disposal', 'passage', 'alcove-lined passage', 'chamber/gallery', 'dormitory/sleeping cells', 'mess/kitchen/larder', 'storeroom', 'different dungeon', 'specialArea'], [1, 2, 1, 3, 1, 1, 1, 1, 1]],
    "specialArea": [['Vestry', 'Lay Temple', 'Shrine of [Demigod/Saint]', 'Blessed Well/Font/Pool', 'Hall of Offerings', 'Sacrificial Chamber', 'Crypt of [Martyr/Saint]', 'Library/Scriptorium', 'High Priest’s Quarters', 'Sanctum of Mysteries', 'Oracle', 'different dungeon specialArea'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  },
  "archive/laboratory": {
    "area": [['latrine/waste disposal', 'hallway/passage', 'chamber/room', 'mess/kitchen/larder', 'garden/herbarium', 'reading room/study', 'workshops', 'storage/supply closet', 'different dungeon', 'specialArea'], [1, 2, 2, 1, 1, 1, 1, 1, 1, 1]],
    "specialArea": [['Chamber of [Oddity]', 'Specimen Collection', 'Hall of Curiosities', 'Hall of Lore', 'Amphitheater', 'Library/Scriptorium', 'Laboratory', 'Observatory/Scrying Chamber', '[Builder]’s Quarters', 'Summoning Chamber', 'Secret Library', 'different dungeon specialArea'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  },
  "origin unknown": {
    "area": [['caves/caverns', 'prison', 'mine/quarry/excavation', 'tomb/crypt/necropolis', 'stronghold/fortress', 'shrine/temple/sanctuary', 'archive/laboratory'], [3, 1, 1, 2, 1, 2, 2]],
    "specialArea": [['caves/caverns', 'prison', 'mine/quarry/excavation', 'tomb/crypt/necropolis', 'stronghold/fortress', 'shrine/temple/sanctuary', 'archive/laboratory', 'Hall of [Aspect]', 'Vault of [Element]', 'Chamber of [Oddity]', 'Sanctum', 'Treasure Vault'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  }
}

const Areas = ["1d6+1", "1d8+7", "1d10+15", "1d12+25"]
const Situation = ['aboveground', 'part aboveground, part below', 'belowground', 'extraordinary (floating, ephemeral, etc.)']
const Entrance = ['sealed shut', 'purposely hidden', 'concealed by natural feature/terrain', 'buried (in earth, rubble, etc.)', 'blocked by obstacle/out of reach', 'clear/obvious']
const Ruination = ['arcane disaster', 'damnation/curse', 'natural disaster (earthquake, etc.)', 'plague/famine/drought', 'overrun by monsters', 'hubris', 'war/invasion', 'depleted resources', 'better prospects elsewhere']

const Random = {
  element(RNG=chance) {
    return RNG.pickone(RNG.pickone(Details.element).split("/"))
  },
  magic(RNG=chance) {
    return RNG.pickone(Details.magic)
  },
  aspect(RNG=chance) {
    return RNG.pickone(Details.aspect).split("/")[0]
  },
  creature(RNG=chance) {
    return RNG.pickone(Details.creature)
  },
  danger(RNG) {
    return RNG.weighted(["leader", "creature", "hazard"], [1, 6, 5])
  },
  discovery(RNG) {
    return "discovery"
  },
  type(RNG) {
    return RNG.pickone(Object.keys(Types))
  },
  contents(RNG=chance) {
    const _what = RNG.weighted(["1d4.danger", "1.danger", "1.danger,1.discovery", "1d4.danger,1.discovery", "1.discovery", "1d4.danger,1d4.discovery", "1.danger,1d4.discovery", "1d4.discovery"], [1, 3, 2, 1, 2, 1, 1, 1])

    let what = {}
    _what.split(",").map(w=>{
      let[d,_w] = w.split(".")
      d = d.includes("d") ? SumDice(d, RNG) : Number(d)

      //load what by type and nuber
      for (let i = 0; i < d; i++) {
        let c = Random[_w](RNG)
        what[c] = what[c] === undefined ? 1 : what[c] + 1
      }
    }
    )

    return what
  },
  specialArea(RNG, type) {
    let a = RNG.weighted(...Types[type].specialArea)
    
    if (Types[a]) {
      a = Random.specialArea(RNG,a)
    }
    else if (a == "different dungeon specialArea"){
      a = Random.specialArea(RNG,RNG.pickone(Object.keys(Types)))
    }
    
    return a
  },
  area(RNG, type) {
    let a = RNG.weighted(...Types[type].area)

    //randomly select from a different dungeon 
    if(a == "different dungeon"){
      return Random.area(RNG,RNG.pickone(Object.keys(Types)))
    }
    else if (Types[a]) {
      return Random.area(RNG,a)
    }

    //go to special area 
    a = a == "specialArea" ? Random.specialArea(RNG, type) : a 

    //get specifics 
    let text = RNG.pickone(a.split("/"))

    return {
      text,
      contents : Random.contents(RNG)
    }
  }
}

//Defines base Class 
import {Area} from "./area.js"

class Site extends Area {
  constructor(app,opts) {
    super(app,opts);
    
    let {what, type, scale} = opts

    let RNG = new Chance(this.id)

    //class and ui 
    this.UI = ["Area.Site.Hex"]
    this.class[0] = "site"
    
    //type of site 
    this.what = what 
    type = type || Random.type(RNG)
    this.type = type
    this.addClass(type)

    //short version of type 
    this.short = RNG.pickone(RNG.pickone(type).split("/"))
    this.text = opts.text

    //difficulty 
    this.diff = Difficulty(RNG)
    this.diff = opts.diff === undefined ? this.diff : opts.diff

    scale = scale || RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2])
    //number of themes based on scale - start with the inhabiting creature type 
    this.themes = [Random.creature(RNG)]
    for (let i = 1; i < 2 + scale; i++) {
      let _t = RNG.pickone(["creature", "element", "magic", "aspect", "aspect"])
      this.themes.push(Random[_t](RNG))
    }

    //number of areas 
    const na = SumDice(Areas[scale], RNG)

    //areas with contnets
    this.children = BuildArray(na, (v,i)=> Object.assign(Random.area(RNG, type),{i,parent: this}))

    //set hex layout
    this.setHex()
  }

  get region () {
    let p = this.parent
    let what = p.class[0]
    
    while(what != "region"){
      p = p.parent
      what = p.class[0]
    }
    return p 
  }

  get size () {
    let childSize = this.children.reduce((sum,c) => sum+(c.class && c.class[0] == "site" ? 1 : 0),0)
    return childSize > 0 ? childSize : 1  
  }
}

export {Site, Area}
