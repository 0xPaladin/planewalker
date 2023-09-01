import {RandBetween, SumDice, Likely, WeightedString, BuildArray, chance} from "./random.js"

/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"

/*
  NPC Data 
*/
const Occupations = {
  "Outsider": ['hermit/prophet', 'fugitive/outlaw/exile', 'fugitive/outlaw/exile', 'barbarian', 'barbarian', 'beggar/vagrant/refugee', 'beggar/vagrant/refugee', 'herder/hunter/trapper', 'herder/hunter/trapper', 'diplomat/envoy', 'rare humanoid', 'otherworldly/arcane'],
  "Criminal": ['bandit/brigand/thug', 'bandit/brigand/thug', 'cutpurse/thief', 'cutpurse/thief', 'bodyguard/tough', 'bodyguard/tough', 'burglar', 'con artist/swindler', 'dealer/fence', 'racketeer', 'lieutenant', 'boss/kingpin'],
  "Commoner": ['layabout/simpleton', 'beggar/urchin', 'beggar/urchin', 'child', 'child', 'housewife/husband', 'farmer/herder/hunter', 'farmer/herder/hunter', 'laborer/servant', 'driver/porter/guide', 'sailor/guard', 'apprentice/adventurer'],
  "Tradesperson": ['musician/troubador', 'artist/actor/acrobat', 'cobbler/furrier/tailor', 'weaver/basketmaker', 'potter/carpenter', 'mason/baker/chandler', 'cooper/wheelwright', 'tanner/ropemaker', 'stablekeeper/herbalist', 'vintner/jeweler', 'inkeep/tavernkeep', 'smith/armorer'],
  "Merchant": ['raw materials/supplies', 'raw materials/supplies', 'general goods/outfitter', 'general goods/outfitter', 'grain/livestock', 'ale/wine/spirits', 'clothing/jewelry', 'weapons/armor', 'spices/tobacco', 'labor/slaves', 'books/scrolls', 'magic supplies/items'],
  "Specialist": ['clerk/scribe', 'undertaker', 'perfumer', 'navigator/guide', 'spy/diplomat', 'cartographer', 'locksmith/tinker', 'architect/engineer', 'physician/apothecary', 'sage/scholar', 'alchemist/astrologer', 'inventor/wizard'],
  "Religious": ['heretic/apostate', 'zealot', 'mendicant/pilgrim', 'mendicant/pilgrim', 'acolyte/novice', 'acolyte/novice', 'monk/nun/cultist', 'preacher/prophet', 'missionary', 'templar/protector', 'priest/cult leader', 'high priest'],
  "Security": ['militia', 'militia', 'scout/warden', 'watch/patrol', 'watch/patrol', 'raw recruit', 'foot soldier', 'foot soldier', 'archer', 'officer/constable', 'cavalry/knight', 'hero/general'],
  "Authority": ['courier/messenger', 'town crier', 'tax collector', 'clerk/administrator', 'clerk/administrator', 'armiger/gentry', 'armiger/gentry', 'magistrate/judge', 'guildmaster', 'lesser nobility', 'greater nobility', 'ruler/warlord'],
  "Follower": ['Arcanist', 'Channeler', 'Opportunist', 'Healer', 'Cleanser', 'Purifier', 'Scout', 'Skirmisher', 'Opener', 'Defender', 'Deterrer', 'Agitator', 'Forager', 'Miner', 'Herbalist', 'Protector', 'Schemer', 'Chronomancer', 'Brute'],
  "Companion": ['Bulwark', 'Controller', 'Executioner', 'Mender']
}

const Adventurers = {
  "Arcane" : "Wizard,Artificer,Sorcerer/4,2,2",
  "Devout" : "Cleric,Druid,Champion/4,2,2",
  "Skilled" : "Rogue,Monk,Bard/4,2,2",
  "Warrior" : "Fighter,Ranger,Barbarian/4,3,2"
}

const NPCs = {
  adventurer (RNG = chance, base) {
    let what = RNG.shuffle(["Arcane","Devout","Skilled","Warrior"]).slice(0,RandBetween(1,2,RNG))
    if(base && !what.includes(base)) {
      what[0] = base 
    }
    
    return what.map(b => WeightedString(Adventurers[b],RNG))
  } ,
  occupation(RNG=chance, type) {
    type = type || RNG.weighted(Object.keys(Occupations), [1, 1, 3, 2, 1, 1, 1, 1, 1, 12, 1])
    let o = RNG.pickone(RNG.pickone(Occupations[type]).split("/"))
    let short = type == "Merchant" ? type + " of " + o : o
    return [type, short]
  },
  common(RNG=chance, type) {
    let o = NPCs.occupation(RNG, type)
    let p = Encounters.PC(RNG)

    let competence = ["liability", "incompetent", "competent", "adept", "exceptional", "masterful"]
    let competent = RNG.weighted(competence, [1, 2, 4, 3, 1, 1])

    let short = p + " " + o[1]

    return {
      short,
      people: p,
      occupation: o,
      competent
    }
  }
}

// fake lookup for monster compendium 
const MC = {}

//https://www.completecompendium.com/

const airAnimals = ['pteranadon', 'condor', 'eagle/owl', 'hawk/falcon', 'crow/raven', 'heron/crane/stork', 'gull/waterbird', 'songbird/parrot', 'chicken/duck/goose', 'bee/hornet/wasp', 'locust/dragonfly/moth', 'gnat/mosquito/firefly']
const earthAnimals = ['dinosaur/megafauna', 'elephant/mammoth', 'ox/rhinoceros', 'bear/ape/gorilla', 'deer/horse/camel', 'cat/lion/panther', 'dog/wolf/boar/pig', 'snake/lizard/armadillo', 'mouse/rat/weasel', 'ant/centipede/scorpion', 'snail/slug/worm', 'termite/tick/louse']
const waterAnimals = ['whale/narwhal', 'squid/octopus', 'dolphin/shark', 'alligator/crocodile', 'turtle', 'shrimp/crab/lobster', 'fish', 'frog/toad', 'eel/snake', 'clam/oyster/snail', 'jelly/anemone', 'insect/barnacle']
const oddities = ['many-heads/no-head', 'profuse sensory organs', 'many limbs/tentacles/feelers', 'shape changing', 'bright/garish/harsh', 'web/network', 'crystalline/glassy', 'gaseous/misty/illusory', 'volcanic/explosive', 'magnetic/repellant', 'multilevel/tiered', 'absurd/impossible']

const Rarity = {
  //type 
  'Aberration': '/Cloaker,Grell,Yuan-ti/Aboleth,Mind Flayer,Roper/Beholder,Deepspawn,Rakshasa,Morkoth/',
  'Animal': 'small,medium/large/huge/gargantuan',
  'Construct': '//Marut,Kolyarut,Zelekhut,Clay Golem,Stone Golem/Quarut,Varakhut,Flesh Golem,Iron Golem/',
  'Dragon': 'Kobold/Dragon-kin,Half-dragon,Wyrmling/Very Young,Young,Juvenile/Young Adult,Adult,Mature Adult,Old/Very Old,Wyrm,Great Wyrm',
  'Fey': '/Brownie,Gremlin,Satyr/Dryad,Nereid,Nymph,Pech,Sylph,Will-O-Wisp//',
  'Magical Beast': 'Ankheg,Griffon,Hippogriff,Stirge/Bulette,Carrion Crawler,Owlbear,Shambling Mound,Wyvern/Basilisk,Chimera,Cockatrice,Displacer Beast,Dragonne,Hell Hound,Hydra,Manticore,Naga,Nightmare,Otyugh,Rust Monster,Umber Hulk/Behir,Catoblepas,Gorgon,Mimic,Pegasus,Peryton,Remorhaz,Roc,Purple Worm/',
  'Ooze': 'tiny,small/medium,large/huge/gargantuan',
  'Plant': '/Black Pudding,Gas Spore,Myconid,Mold Men,Shrieker,Thornslinger,Yellow Musk Creeper,Shambling Mound/Treant,Brown Pudding,Choke Creaper,Hangman Tree,Mantrap,Phycomid,Violet Fungus//',
  'Undead': '/Ghoul,Skeleton,Zombie/Shadow,Wight,Ghost,Mummy,Vampire,Wraith,Banshee/Revenant,Death Knight,Lich/',
  'Vermin': 'tiny,small/medium,large/huge/gargantuan',
  //Sub generators 
  'Genie': '//Jann,Dao/Djinni,Efreeti,Marid/',
  'Giant': '//Fire Giant,Stone Giant,Hill Giant/Cyclops,Ettin,Frost Giant,Cloud Giant,Storm Giant/',
  'People': 'Human,Elf,Dwarf,Gnome,Halfling,Goblin,Kobold,Orc/Lizardfolk,Drow,Bugbear,Gnoll,Hobgoblin,Ogre,Troll/Aarakocra,Centaur,Dragon-kin,Grippli,Kenku,Myconid,Thri-kreen,Wemic,Harpy,Minotaur,Gargoyle/Doppelganger,Treant/',
  'Folk': '_animal/_chimera///',
  'PCs': 'Human,Elf,Dwarf/Gnome,Halfling,Goblin,Kobold,Orc,Bugbear,Lizardfolk,Hobgoblin/Air Genasi,Earth Genasi,Fire Genasi,Water Genasi,Aasimar,Bariaur,Githzerai,Tiefling,Drow,Gnoll,Centaur,Dragon-kin//',
  //Outsiders 
  'Aasimon': '/Agathinon//Light Aasimon,Deva,Planetar/Solar',
  'Archon': 'Lantern,Hound/Warden,Sword/Trumpet,Throne,Tome//',
  'Baatezu': 'Barbazu,Lemure,Nupperibo,Spinagon/Erinyes,Hamatula,Kocrachon,Osyluth/Amnizu,Gelugon/Cornugon,Pit Fiend/',
  'Eladrin': 'Coure,Shiere/Bralani/Firre,Ghaele/Tulani/',
  'Elemental': 'Least/Lesser/ /Greater/',
  'Gehreleth': '///Farastu,Kelubar,Shator/',
  'Guardinal': 'Cervidal,Equinal/Avoral/Lupinal,Ursinal/Leonal/',
  'Modron': 'Monodrone,Duodrone/Tridrone,Quadrone/Pentadrone,Decaton,Nonaton,Octon/Septon,Hexton,Quinton,Quarton,Tertian,Secundus/',
  'Rilmani': 'Plumach/Ferrumach/Abiorach,Cuprilach/Argenach,Aurumach/',
  'Slaad': '/Red/Blue/Green,Gray/Death',
  "Tanar'ri": 'Dretch,Manes,Chasme,Hezrou/Bar-Lgura,Babau,Bulezau,Vrock/Alkilith,Armanite,Glabrezu/Marilith,Balor,Nabassu,Nalafeshnee,Rutterkin,Wastrilith/Goristo',
  'Yugoloth': 'Hydroloth,Mezzoloth/Canoloth,Dergoloth,Piscoloth/Yagnoloth/Arcanaloth,Nycaloth,Ultroloth/',
}

const Threat = {
    //type 
  'Aberration': '/Cloaker,Grell,Yuan-ti/Aboleth,Mind Flayer,Rakshasa,Roper,Yuan-ti,Deepawn,Morkoth/Aboleth,Mind Flayer,Rakshasa,Beholder/',
  'Animal': 'small,medium/large/huge/gargantuan',
  'Construct': '//Flesh Golem,Clay Golem/Marut,Kolyarut,Zelekhut,Stone Golem,Quarut,Varakhut,Iron Golem/',
  'Dragon': 'Kobold,Dragon-kin/Half-dragon,Wyrmling,Very Young,Young/Juvenile,Young Adult,Adult/Mature Adult,Old,Very Old/Wyrm,Great Wyrm',
  'Fey': 'Brownie,Gremlin/Satyr,Dryad,Nereid,Nymph,Pech,Sylph,Will-O-Wisp///',
  'Magical Beast': 'Stirge/Bulette,Chimera,Carrion Crawler,Cockatrice,Displacer Beast,Shambling Mound,Griffon,Dragonne,Manticore,Naga,Rust Monster,Nightmare,Hell Hound,Hippogriff,Stirge,Wyvern,Mimic,Pegasus,Peryton/Ankheg,Bulette,Owlbear,Wyvern,Basilisk,Hydra,Otyugh,Umber Hulk,Behir,Catoblepas,Gorgon,Remorhaz/Roc,Purple Worm/',
  'Ooze': 'tiny,small,medium/large/huge/gargantuan',
  'Plant': '/Black Pudding,Gas Spore,Myconid,Mold Men,Shrieker,Thornslinger,Yellow Musk Creeper,Shambling Mound/Treant,Brown Pudding,Choke Creaper,Hangman Tree,Mantrap,Phycomid,Violet Fungus//',
  'Undead': '/Ghoul,Skeleton,Zombie/Shadow,Wight,Ghost,Mummy,Vampire,Wraith,Banshee/Revenant,Death Knight,Lich/',
  'Vermin': 'tiny,small/medium,large/huge/gargantuan',
  //Sub generators 
  'Genie': '/Jann/Jann,Djinni/Dao,Efreeti,Marid/',
  'Giant': '//Cyclops,Ettin,Hill Giant/Fire Giant,Frost Giant,Stone Giant,Cloud Giant/Storm Giant',
  'People': 'Human,Elf,Dwarf,Gnome,Halfling,Goblin,Kobold,Orc,Lizardfolk,Drow,Bugbear,Gnoll,Hobgoblin,Aarakocra,Centaur,Dragon-kin,Grippli,Kenku,Myconid,Thri-kreen,Wemic,Harpy/Ogre,Troll,Doppelganger,Minotaur,Gargoyle/Treant//',
  'PCs': 'Human,Elf,Dwarf,Gnome,Halfling,Goblin,Kobold,Orc,Lizardfolk,Drow,Bugbear,Gnoll,Hobgoblin,Centaur,Dragon-kin////',
  'Folk': '_animal,_chimera////',
  //Outsiders 
  'Aasimon': '//Agathinon,Light Aasimon/Deva/Planetar,Solar',
  'Archon': 'Lantern//Hound,Warden/Sword,Trumpet,Throne',
  'Baatezu': 'Lemure,Nupperibo/Barbazu,Osyluth,Spinagon/Amnizu,Barbazu,Erinyes,Hamatula,Kocrachon/Cornugon,Gelugon,Pit Fiend/',
  'Eladrin': '/Coure/Bralani,Firre,Shiere/Ghaele/Tulani',
  'Elemental': 'Least/Lesser, /Greater//',
  'Gehreleth': '//Farastu,Kelubar,Shator//',
  'Guardinal': '/Cervidal/Avoral,Cervidal,Equinal,Lupinal/Leonal,Ursinal/',
  'Modron': 'Monodrone,Duodrone/Tridrone,Quadrone/Pentadrone,Decaton,Nonaton,Octon/Septon,Hexton,Quinton,Quarton,Tertian/Secundus',
  'Rilmani': '/Plumach,Abiorach,Ferrumach/Ferrumach,Cuprilach,Argenach/Aurumach/',
  'Slaad': '//Red,Blue/Green,Gray/Death',
  "Tanar'ri": 'Dretch,Manes/Armanite,Bar-Lgura,Bulezau,Rutterkin/Alkilith,Babau,Bar-Lgura,Bulezau,Chasme,Hezrou,Nabassu,Vrock/Balor,Glabrezu,Nalafeshnee,Wastrilith/Goristo',
  'Yugoloth': '//Canoloth,Dergoloth,Hydroloth/Mezzoloth,Piscoloth,Arcanaloth,Nycaloth,Yagnoloth/Ultroloth',
}

const Split = (val,str)=>{
  let base = str.split("/")
  let max = base.reduce((m,s,i)=>s.length > 0 ? i : m, 0)

  return {
    val,
    base: base[base[val] == undefined || base[val].length == 0 ? max : val].split(","),
    max,
    delta: val - max
  }
}

const Generators = {
  size(RNG=chance, what) {
    const p = [20, 30, 10, 25][what]
    return RNG.bool({
      likelihood: p
    }) ? RNG.pickone(["Small ", "Large "]) : ""
  },
  _animal(RNG=chance, aew='') {
    if (aew == '')
      aew = RNG.weighted(['a', 'e', 'w'], [3, 6, 2])

    if (aew == 'a')
      return RNG.pickone(RNG.pickone(airAnimals).split("/"))
    else if (aew == 'e')
      return RNG.pickone(RNG.pickone(earthAnimals).split("/"))
    else if (aew == 'w')
      return RNG.pickone(RNG.pickone(waterAnimals).split("/"))
  },
  _chimera(RNG=chance) {
    return [Generators._animal(RNG), Generators._animal(RNG)].join("/")
  },
  Elemental(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    const what = RNG.pickone(["Air", "Earth", "Fire", "Water"])
    return ["Outsider",[RNG.pickone(base), what, "Elemental"].join(" "),[]] 
  },
  Giant(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["People",RNG.pickone(base),[]]
  },
  Genie(RNG=chance, o={}) {
    return RNG.weighted(["Jann", "Djinni", "Dao", "Efreeti", "Marid"], [4, 2, 2, 1, 1])
  },
  Lycanthrope(RNG=chance, o={}) {
    return "Were" + RNG.weighted(["bear", "boar", "bat", "fox", "rat", "tiger", "wolf"], [2, 2, 1, 1, 2, 1, 4])
  },
  /*
    Crature Type Generators 
  */
  Aberration(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Aberration", RNG.pickone(base),[]]
  },
  Animal(RNG=chance,o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    let size = RNG.pickone(base)

    //air earth water 
    const aew = RNG.weighted(['a', 'e', 'w', 'c'], [3, 6, 2, 1])

    let what = (aew == 'c' ? Generators._chimera(RNG) : Generators._animal(RNG, aew))
    return ["Animal", what + " ["+size+"]",[]]
  },
  Construct(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Construct", RNG.pickone(base),[]]
  },
  Dragon(RNG=chance, o={}) {
    //base may be creature or age 
    let {base, rarity, max, delta} = o
    //age 
    let age = 'Wyrmling,Very Young,Young,Juvenile,Young Adult,Adult,Mature Adult,Old,Very Old,Wyrm,Great Wyrm'
    let what = RNG.pickone(base)
    
    let _color = RNG.bool() ? ["White", "Black", "Green", "Blue", "Red"] : ["Brass", "Copper", "Bronze", "Silver", "Gold"]
    let color = RNG.weighted(_color, [2, 3, 3, 3, 1])
    return ["Dragon",  [color,age.includes(what) ? "Dragon" : what].join(" "), []]
  },
  Fey(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Fey", RNG.pickone(base),[]]
  },
  "Magical Beast"(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Magical Beast", RNG.pickone(base),[]]
  },
  Outsider(RNG=chance,o={}) {
    let {base, rarity, max, delta, type} = o
    let text = ["Archon","Slaad"].includes(type) ? [RNG.pickone(base),type].join(" ") : RNG.pickone(base)
    
    return ['Outsider', text,[type]]
  },
  Ooze(RNG=chance, o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    return ["Ooze", ["Ooze",Generators._animal(RNG),"["+RNG.pickone(base)+"]"].join(" "),[]]
  },
  People(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["People", RNG.pickone(base),[]]
  },
  Plant(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Plant", RNG.pickone(base),[]]
  },
  Undead(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Undead", RNG.pickone(base),[]]
  },
  Vermin(RNG=chance, o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    let animal = RNG.bool() ? ["Ant", "Bee", "Beetle", "Centipede", "Dragonfly", "Fly", "Leech", "Termite", "Tick", "Wasp"] : ["Rat", "Slug", "Snake", "Toad"]
    return ["Vermin",[RNG.pickone(animal),"["+RNG.pickone(base)+"]"].join(" "),[]]
  },
  /*
    Major generators 
  */
  Folk(RNG=chance,o={}) {
    let what = Generators[RNG.pickone(o.base)](RNG)+"-folk"
    return ["People",what,[]]
  },
  PCs(RNG=chance,o={}) {
    let {base, rarity, max, delta} = o
    return ["People", RNG.pickone(base),[]]
  },
  CreatureSpecial(RNG, what, nature, p=50) {
    //add special nature 
    if (["Animal", "Magical Beast", "Vermin"].includes(what.base)) {
      what.short += Likely(p) ? " [" + RNG.pickone(nature) + "]" : ""
    }
    return what
  },
  Lair(base, short) {
    let lair = ['Aberration', 'Dragon', 'Fey', 'Humanoid', 'Monstrous Humanoid','People', 'Outsider', 'Undead'].includes(base) ? "Camp" : "Lair"

    return lair
  }
}

const Format = ([base,short,tags])=>{
  return {
    base,
    short,
    lair: Generators.Lair(base, short),
    tags
  }
}

//get the string to determine the actual result 
const StringGenerate = {
  Beast(RNG, where) {
    let what = WeightedString('Animal,Vermin/4,1',RNG)
    return [what, where[what]]
  },
  Celestial(RNG, where) {
    let what = WeightedString('Aasimon,Archon,Guardinal,Eladrin/1,2,2,2',RNG)
    return ["Outsider", where[what]]
  },
  Fiend(RNG, where) {
    let what = WeightedString("Baatezu,Gehreleth,Slaad,Tanar'ri,Yugoloth/4,1,4,4,4",RNG)
    return ["Outsider", where[what]]
  },
  Monster(RNG, where) {
    let what = WeightedString('Aberration,Construct,Dragon,Magical Beast,Ooze,Plant,Undead,Vermin/1,1,1,3,1,2,2,2',RNG)
    return [what, where[what]]
  },
  Planar(RNG=chance, where) {
    let what = WeightedString('People,Folk/90,10',RNG)
    return [what, where[what]]
  },
  Petitioner(RNG=chance, where) {
    return StringGenerate.Planar(RNG, where)
  }
}

/*
  Exports 
*/

//Pull a random faction 
const Faction = (RNG=chance,alignment="neutral")=>{
  let list = alignment == "neutral" ? RNG.bool() ? Details.factions.sigil : Details.factions.outsiders : Details.factions[alignment]
  return RNG.pickone(list)
}

const ByRarity = (o={},RNG=chance)=>{
  let {rarity=RNG.weighted([0, 1, 2, 3], [45, 35, 15, 5]), str=null} = o

  //pick from list 
  let type = o.what != null ? o.what : WeightedString("Petitioner,Planar,Beast,Monster,Celestial,Fiend,Elemental/30,15,20,10,10,10,5",RNG)

  //pulls rarity string 
  let[gen,_str] = o.str != null ? [type, o.str] : Rarity[type] ? [type, Rarity[type]] : StringGenerate[type](RNG, Rarity)
  gen = Details.Outsiders.Outsiders.includes(gen) ? "Outsider" : gen 

  let opts = Object.assign({type},Split(rarity, _str))
  //Finish up using the unique genrators 
  return Format(Generators[gen](RNG, opts))
}

const ByThreat = (RNG=chance,o={})=>{
  let {threat=RNG.weighted([0, 1, 2, 3], [45, 35, 15, 5]), str=null} = o

  //pick from list 
  let type = o.what != null ? o.what : WeightedString("Petitioner,Planar,Beast,Monster,Celestial,Fiend,Elemental/30,15,20,10,10,10,5",RNG)

  //pulls rarity string 
  let[gen,_str] = o.str != null ? [type, o.str] : Threat[type] ? [type, Threat[type]] : StringGenerate[type](RNG, Threat)
  gen = Details.Outsiders.Outsiders.includes(gen) ? "Outsider" : gen 

  let opts = Object.assign({threat,type},Split(threat, _str))
  //Finish up using the unique genrators 
  return Format(Generators[gen](RNG, opts))
}


export {ByRarity, ByThreat, Faction, NPCs}
