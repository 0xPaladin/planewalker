// return string with 1st char capitalized
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

import {RandBetween, SumDice, Likely, WeightedString, BuildArray, Hash, chance} from "./random.js"

/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"

/*
  NPC Data 
*/
const Occupations = {
  "Commoner" : ['Beggar','Farmer','Herder','Laborer','Servant','Driver','Porter','Guide'],
  "Merchant": ['raw materials/supplies', 'raw materials/supplies', 'general goods/outfitter', 'general goods/outfitter', 'grain/livestock', 'ale/wine/spirits', 'clothing/jewelry', 'weapons/armor', 'spices/tobacco', 'labor/slaves', 'books/scrolls', 'magic supplies/items'],
  "Diplomat" : ["Envoy","Musician","Artist","Merchant"], 
  "Engineer" : ["Smith","Tinker","Physician","Herbalist"], 
  "Explorer" : ["Scout","Navigator","Hunter"],
  "Tradesman" : ["Tailor","Wright","Baker","Jeweler"],
  "Rogue" : ["Thug","Thief","Con Artist","Spy"],
  "Scholar" : ["Scribe","Scholar","Acolyte","Arcanist"],
  "Soldier" : ["Soldier","Archer","Bodyguard"],
}

/*
Impoverished lifestyle, per week 5 sp
Common lifestyle, per week 20 sp, 8g mo 
Rich lifestyle, per week 200 sp, 80g mo 
*/
const ToHire = {
  "Commoner" : 8,
  "Diplomat" : 30, 
  "Engineer" : 40, 
  "Explorer" : 16,
  "Tradesman" : 25,
  "Rogue" : 20,
  "Scholar" : 40,
  "Soldier" : 30,
}

const Skilled = {
  //Diplomat 
  "Envoy" : "Bond,Sway",
  "Musician" : "Sway,Command", 
  "Artist" : "Sway,Focus",
  "Merchant" : "Sway,Finesse",
  //Engineer
  "Smith" : "Tinker,Focus",
  "Tinker" : "Tinker,Study", 
  "Physician" : "Tinker,Notice", 
  "Herbalist" : "Tinker,Finesse", 
  //Explorer
  "Scout" : "Sneak,Notice", 
  "Navigator" : "Move,Notice", 
  "Hunter" : "Study,Shoot", 
  //Tradesman 
  "Tailor" : "Tinker,Finesse",  
  "Wright" : "Tinker,Muscle", 
  "Baker" : "Tinker,Study", 
  "Jeweler" : "Tinker,Finesse", 
  //Rogue
  "Thug" : "Muscle,Sneak",
  "Thief" : "Finesse,Sneak",  
  "Con Artist" : "Sway,Finesse",
  "Spy" : "Sway,Notice", 
  //Scholar
  "Scribe" : "Finesse,Study", 
  "Scholar" : "Study,Focus", 
  "Acolyte" : "Sway,Focus", 
  "Arcanist" : "Study,Focus", 
  //Soldier
  "Soldier" : "Muscle,Command", 
  "Archer" : "Shoot,Notice",//
  "Bodyguard" : "Muscle,Move",
}

const AlternateTitles = {
  "Musician" : "actor",
  "Tinker" : "locksmith,architect,engineer,inventor",
  "Physician" : "apothecary,alchemist",
  "Herbalist" : "vinter,perfumer",
  "Scout" : "warden",
  "Navigator" : "cartographer,courier",
  "Hunter" : "trapper",
  "Tailor" : "cobbler,tailor,weaver",
  "Wright" : "potter,carpenter,mason,wheelwright",
  "Baker" : "baker,chandler",
  "Thief" : "cutpurse,burglar",
  "Scribe" : "clerk,administrator",
  "Scholar" : "sage,historian",
  "Acolyte" : "missionary,mendicant,preacher",
  "Arcanist" : "channeler",
  "Soldier" : "militia,recruit,foot soldier,knight"
}

const Adventurers = {
  "Arcane" : "Wizard/1",
  "Devout" : "Cleric/1",
  "Rogue" : "Rogue,Bard/4,2",
  "Skilled" : "Artificer/1",
  "Warrior" : "Fighter,Ranger,Barbarian,Monk/5,4,2,2"
}

const DieRank = ["d4","d6","d8","d10","d12","d14"]

const Professions = {
  adventurer (RNG = chance, base = "random") {
    let what = RNG.shuffle(["Arcane","Devout","Rogue","Skilled","Warrior"]).slice(0,RandBetween(1,2,RNG))
    if(base != "random" && !what.includes(base)) {
      what[0] = base 
    }
    
    return what.map(b => WeightedString(Adventurers[b],RNG))
  } ,
  trade (RNG=chance, type = "random") {
    let trade = WeightedString("Commoner,Diplomat,Engineer,Explorer,Tradesman,Rogue,Scholar,Soldier/30,5,5,10,15,15,5,15",RNG)
    trade = type != "random" ? type : trade
    let o = RNG.pickone(Occupations[trade])
    o+= o == "Merchant" ? ","+RNG.pickone(Occupations.Merchant) : ""
    //find an alternate 
    let alt = AlternateTitles[o] && Likely(50,RNG) ? capitalize(RNG.pickone(AlternateTitles[o].split(","))) : null 
    return [trade,o,alt]
  },
}

// fake lookup for monster compendium 
const MC = {}

//https://www.completecompendium.com/

const airAnimals = ['pteranadon', 'condor', 'eagle/owl', 'hawk/falcon', 'crow/raven', 'heron/crane/stork', 'gull/waterbird', 'songbird/parrot', 'chicken/duck/goose', 'bee/hornet/wasp', 'locust/dragonfly/moth', 'gnat/mosquito/firefly']
const earthAnimals = ['dinosaur/megafauna', 'elephant/mammoth', 'ox/rhinoceros', 'bear/ape/gorilla', 'deer/horse/camel', 'cat/lion/panther', 'dog/wolf/boar/pig', 'snake/lizard/armadillo', 'mouse/rat/weasel', 'ant/centipede/scorpion', 'snail/slug/worm', 'termite/tick/louse', 'alligator/crocodile', 'frog/toad']
const waterAnimals = ['whale/narwhal', 'squid/octopus', 'dolphin/shark', 'turtle', 'shrimp/crab/lobster', 'fish', 'eel/snake', 'clam/oyster/snail', 'jelly/anemone', 'arthropod/barnacle']
const oddities = ['many-heads/no-head', 'profuse sensory organs', 'many limbs/tentacles/feelers', 'shape changing', 'bright/garish/harsh', 'web/network', 'crystalline/glassy', 'gaseous/misty/illusory', 'volcanic/explosive', 'magnetic/repellant', 'multilevel/tiered', 'absurd/impossible']

const IsAquatic = 'whale/narwhal/squid/octopus/dolphin/shark/turtle/shrimp/crab/lobster/fish/eel/clam/oyster/snail/jelly/anemone/arthropod/barnacle/Morkoth/Nereid/Marid/Water Genasi/Sahuagin/Sea Fey/Triton/Locathah/Merfolk'

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
  'People': 'Human,Elf,Dwarf,Gnome,Halfling,Goblin,Kobold,Orc/Lizardfolk,Drow,Bugbear,Gnoll,Hobgoblin,Ogre,Troll/Aarakocra,Centaur,Dragon-kin,Grippli,Kenku,Myconid,Thri-kreen,Wemic,Harpy,Minotaur,Gargoyle,Locathah,Sahuagin,Sea Fey,Triton,Merfolk/Doppelganger,Treant/',
  'Folk': '_animal/_chimera///',
  'Human': 'Human////',
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
  'Human': 'Human////',
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
  let min = base.reduce((m,s,i)=> s.length > 0 && m == -1 ? i : m, -1)

  let i = val > max ? max : val < min ? min : val 

  return {
    val,
    base: base[i].split(","),
    min, 
    max,
    delta: val > max ? val-max : val < min ? val-min : 0 
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
      return capitalize(RNG.pickone(RNG.pickone(airAnimals).split("/")))
    else if (aew == 'e')
      return capitalize(RNG.pickone(RNG.pickone(earthAnimals).split("/")))
    else if (aew == 'w')
      return capitalize(RNG.pickone(RNG.pickone(waterAnimals).split("/")))
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
    let size = o.size || RNG.pickone(base)

    //air earth water 
    const aew = RNG.weighted(['a', 'e', 'w', 'c'], [3, 6, 2, 1])

    let what = (aew == 'c' ? Generators._chimera(RNG) : Generators._animal(RNG, aew))
    let tags = aew == "w" || waterAnimals.reduce((isAquatic,a)=> isAquatic || a.includes(what),false) ? ["aquatic"] : []
    if(size != "medium"){
      tags.push(size)
    }
    
    return ["Animal", what + " ["+size+"]",tags]
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
    return ["Dragon",  [color,age.includes(what) ? "Dragon" : what].join(" "), [color,what,age.includes(what)]]
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
  Human () {
    return ["People","Human",[]] 
  },
  Folk(RNG=chance,o={}) {
    let animal = Generators[RNG.pickone(o.base)](RNG)
    let what = capitalize(animal)+"-folk"
    let tags = animal.split("/").reduce((aquatic,a)=> aquatic || IsAquatic.includes(a),false) ? ["aquatic"] : []
    
    return ["People",what,tags]
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
}

//get the string to determine the actual result 
const StringGenerate = {
  Beast(RNG, where) {
    let what = WeightedString('Animal,Vermin/4,1',RNG)
    return [what, where[what]]
  },
  Celestial(RNG, where) {
    let what = WeightedString('Aasimon,Archon,Guardinal,Eladrin/1,2,2,2',RNG)
    return ["Outsider", where[what],what]
  },
  Fiend(RNG, where) {
    let what = WeightedString("Baatezu,Gehreleth,Slaad,Tanar'ri,Yugoloth/4,1,4,4,4",RNG)
    return ["Outsider", where[what],what]
  },
  Monster(RNG, where) {
    let what = WeightedString('Aberration,Construct,Dragon,Magical Beast,Ooze,Plant,Undead,Vermin/1,1,1,3,1,2,2,2',RNG)
    return [what, where[what]]
  },
  Planar(RNG=chance, where) {
    let what = WeightedString('People,Folk/90,10',RNG)
    return [what, where[what]]
  },
  Prime(RNG=chance, where) {
    let what = Likely(75,RNG) ? WeightedString('People,Folk,Animal,Aberration,Dragon,Undead,Outsider/50,20,10,5,5,5,5',RNG) : 'Human'
    return what == "Outsider" ? StringGenerate[RNG.pickone(["Celestial","Fiend"])](RNG,where) : [what, where[what]]
  },
  Petitioner(RNG=chance, where) {
    return StringGenerate.Planar(RNG, where)
  }
}

/*
  Exports 
*/


const Encounter = (o={})=>{
  let id = o.id || chance.hash()
  let RNG = new Chance(id)
  let {threat = null, rarity = null, str=null, size} = o
  let rank = threat !== null ? threat : rarity !== null ? rarity : RNG.weighted([0, 1, 2, 3], [45, 35, 15, 5]) 

  //threat or rarity 
  let TR = threat !== null ? Threat : Rarity
  
  //pick from list 
  let type = o.what != null ? o.what : WeightedString("Petitioner,Planar,Beast,Monster,Celestial,Fiend,Elemental/30,15,20,10,10,10,5",RNG) 

  //pulls string 
  let[gen,_str,_outsider] = o.str != null ? [type, o.str] : TR[type] ? [type, TR[type]] : StringGenerate[type](RNG, TR)
  gen = Generators[gen] ? gen : Details.Outsiders.Outsiders.includes(gen) ? "Outsider" : gen 
  type = _outsider ? _outsider : type 

  //gen result 
  let opts = Object.assign({id,type,size},Split(rank, _str))
  let [base,short,tags=[]] = Generators[gen](RNG, opts)

  //tags 
  if(!tags.includes("aquatic") && IsAquatic.includes(short)){
    tags.push("aquatic")
  }
  tags = [base,...tags]

  //get trade 
  let [_trade,_occ] = o.trade ? o.trade.split(",") : []
  let trade = Professions.trade(RNG, _trade || "random")
  if(_occ){
    trade = [_trade,_occ,null]
  }
  //adventurer 
  let adv = Professions.adventurer(RNG, o.adventurer || "random")
  let prof = o.trade ? trade : o.adventurer ? adv : []

  //extra fluff
  //age 
  let age = WeightedString("child,youth,adult,old,elderly/1,2,4,2,1",RNG)
  tags.push(age)

  //format result 
  return {
    data : [id,"NPC",short,rank,prof,tags],
    get id () {return this.data[0]},
    get nameBase () {return Math.abs(parseInt(Hash(this.data),16)%43) },
    get base () {return this.tags[0]},
    get people () {return this.tags[1]},
    get rank () {return this.data[3]},
    get tags () {return this.data[5]},
    get outsider () {return this.base == "Outsider" ? this.tags[1] : null},
    get trade () { 
      if(this.data[4].length != 3) {
        return null 
      }

      let m = [1, 2, 4, 8, 16, 32][this.rank]
      let [trade,occ,alt] = this.data[4]
      return  {
        short : alt ? alt : occ.includes("Merchant") ? occ.split(",").join(" of ") : occ,
        skills : Skilled[occ] ? Skilled[occ].split(", ") : null,
        toHire : ToHire[trade] * m 
      }
    },
    get adventurer () {return this.trade ? null : this.data[4] },
    get lair () { return 'Fey,People,Outsider'.includes(this.base) },
    get hasJobs () { return 'Dragon,Fey,People,Outsider'.includes(this.base)},
    get short () { return `${this.data[2]} ${this.trade ? this.trade.short : this.adventurer ? this.adventurer.join("/") : ""}`},
    get text () { return `${this.data[2]} ${this.trade ? this.trade.short : this.adventurer ? this.adventurer.join("/") : ""} ${DieRank[this.rank]}`},
    get price () {return this.trade ? this.trade.toHire : null }
  }
}


export {Encounter, Professions}
