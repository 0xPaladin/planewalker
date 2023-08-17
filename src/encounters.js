import {RandBetween, SumDice, Likely, chance} from "./random.js"

/*
  Contains setting data : elements, magic types, etc 
*/
import * as Details from "./data.js"

/*
  NPC Data 
*/
const Occupations = {
  "Outsider": ['hermit/prophet','fugitive/outlaw/exile','fugitive/outlaw/exile','barbarian','barbarian','beggar/vagrant/refugee','beggar/vagrant/refugee','herder/hunter/trapper','herder/hunter/trapper','diplomat/envoy','rare humanoid','otherworldly/arcane'],
  "Criminal": ['bandit/brigand/thug','bandit/brigand/thug','cutpurse/thief','cutpurse/thief','bodyguard/tough','bodyguard/tough','burglar','con artist/swindler','dealer/fence','racketeer','lieutenant','boss/kingpin'],
  "Commoner": ['layabout/simpleton','beggar/urchin','beggar/urchin','child','child','housewife/husband','farmer/herder/hunter','farmer/herder/hunter','laborer/servant','driver/porter/guide','sailor/guard','apprentice/adventurer'],
  "Tradesperson": ['musician/troubador','artist/actor/acrobat','cobbler/furrier/tailor','weaver/basketmaker','potter/carpenter','mason/baker/chandler','cooper/wheelwright','tanner/ropemaker','stablekeeper/herbalist','vintner/jeweler','inkeep/tavernkeep','smith/armorer'],
  "Merchant": ['raw materials/supplies','raw materials/supplies','general goods/outfitter','general goods/outfitter','grain/livestock','ale/wine/spirits','clothing/jewelry','weapons/armor','spices/tobacco','labor/slaves','books/scrolls','magic supplies/items'],
  "Specialist": ['clerk/scribe','undertaker','perfumer','navigator/guide','spy/diplomat','cartographer','locksmith/tinker','architect/engineer','physician/apothecary','sage/scholar','alchemist/astrologer','inventor/wizard'],
  "Religious": ['heretic/apostate','zealot','mendicant/pilgrim','mendicant/pilgrim','acolyte/novice','acolyte/novice','monk/nun/cultist','preacher/prophet','missionary','templar/protector','priest/cult leader','high priest'],
  "Security": ['militia','militia','scout/warden','watch/patrol','watch/patrol','raw recruit','foot soldier','foot soldier','archer','officer/constable','cavalry/knight','hero/general'],
  "Authority": ['courier/messenger','town crier','tax collector','clerk/administrator','clerk/administrator','armiger/gentry','armiger/gentry','magistrate/judge','guildmaster','lesser nobility','greater nobility','ruler/warlord'],
}

const NPCs = {
  occupation (RNG=chance,type) {
    type = type || RNG.weighted(Object.keys(Occupations),[1,1,3,2,1,1,1,1,1])
    let o = RNG.pickone(RNG.pickone(Occupations[type]).split("/"))
    let short = type == "Merchant" ? type + " of" + o : o 
    return [type,short]
  },
  common (RNG = chance) {
    let o = NPCs.occupation(RNG)
    let p = Encounters.PC(RNG)

    let competence = ["liability","incompetent","competent","adept","exceptional","masterful"]
    let competent = RNG.weighted(competence,[1,2,4,3,1,1])

    let short = p +" "+ o[1]

    return {
      short,
      people : p,
      occupation : o,
      competent
    }
  }
}

// fake lookup for monster compendium 
const MC = {}

//https://www.completecompendium.com/

const airAnimals = ['pteranadon', 'condor', 'eagle/owl', 'hawk/falcon', 'crow/raven', 'heron/crane/stork', 'gull/waterbird', 'songbird/parrot','chicken/duck/goose','bee/hornet/wasp','locust/dragonfly/moth','gnat/mosquito/firefly']
const earthAnimals = ['dinosaur/megafauna','elephant/mammoth','ox/rhinoceros','bear/ape/gorilla','deer/horse/camel','cat/lion/panther','dog/wolf/boar/pig','snake/lizard/armadillo','mouse/rat/weasel','ant/centipede/scorpion','snail/slug/worm','termite/tick/louse']
const waterAnimals = ['whale/narwhal','squid/octopus','dolphin/shark','alligator/crocodile','turtle','shrimp/crab/lobster','fish','frog/toad','eel/snake','clam/oyster/snail','jelly/anemone','insect/barnacle']
const oddities = ['many-heads/no-head','profuse sensory organs','many limbs/tentacles/feelers','shape changing','bright/garish/harsh','web/network','crystalline/glassy','gaseous/misty/illusory','volcanic/explosive','magnetic/repellant','multilevel/tiered','absurd/impossible']

const Encounters = {
  size (RNG=chance, what) {
    const p = [20,30,10,25][what]
    return RNG.bool({ likelihood: p }) ? RNG.pickone(["Small ","Large "]) : ""
  },
  _animal(RNG=chance,aew = '') {
    if(aew == '')
      aew = RNG.weighted(['a', 'e', 'w'], [3,6,2])
    
    if (aew == 'a')
      return RNG.pickone(RNG.pickone(airAnimals).split("/"))
    else if (aew == 'e')
      return RNG.pickone(RNG.pickone(earthAnimals).split("/"))
    else if (aew == 'w')
      return RNG.pickone(RNG.pickone(waterAnimals).split("/"))
  },
  Aasimon(RNG=chance) {
    const aasimon = ["Agathinon", "Light", "Deva","Planetar", "Solar"]
    const what = RNG.weighted(aasimon, [45,30,15,5,1])
    return what + " Aasimon"
  },
  Archon(RNG=chance) {
    const archons = ["Lantern", "Hound", "Warden","Sword", "Trumpet", "Throne", "Tome"]
    const napp = ["3d6","1d6","1d6","1d6","1d3",1,1]
    const what = RNG.weighted(archons, [7, 19, 16, 11, 14, 5, 3])
    return what + " Archon"
  },
  Guardinal(RNG=chance) {
    const guardinal = ["Cervidal","Lupinal","Equinal","Avoral","Ursinal","Leonal"]
    const napp = ["1d4+1","1d8","3d6","1d4",1,1]
    const what = RNG.weighted(guardinal, [7,20,12,12,12,17])
    return what + " Guardinal"
  },
  Eladrin(RNG=chance) {
    const eladrin = ["Coure","Bralani","Firre","Ghaele","Shiere","Tulani"]
    const napp = ["2d20","3d8","1d4","1d3","3d8",1] 
    const what = RNG.weighted(eladrin, [18,22,26,12,16,6])
    return what + " Eladrin"
  },
  Rilmani(RNG=chance) {    
    const rilmani = ["Plumach","Abiorach","Ferrumach","Cuprilach","Argenach","Aurumach"]
    const what = RNG.weighted(rilmani, [33,10,30,20,5,2])
    return what + " Rilmani"
  },
  Modron(RNG=chance) {
    const base = RNG.weighted(["Monodrone","Duodrone","Tridrone","Quadrone","Pentadrone","Decaton","Nonaton","Octon"],[1,2,2,4,4,2,2,1])
    return base + " Modron"
  },
  Slaad(RNG=chance) {
    const slaad = ["Red","Blue","Green","Gray","Death"]
    const napp = ["3d6","2d6","1d6","1d6","1d4","1d2"]
    const what = RNG.weighted(slaad, [30,20,15,10,4])
    return what + " Slaad"
  },
  "Tanar'ri"(RNG=chance) {
    const tanarri = ["Manes","Dretch","Rutterkin","Bar-Lgura","Nabassu","Babau","Uridezu","Armanite","Maurezhi","Bulezau","Vrock","Chasme","Hezrou","Goristo","Glabrezu","Nalafeshnee","Alkilith","Marilith","Wastrilith","Balor"]
    const napp = ["50d10","4d10",1,"2d6",1,1,1,"2d10",1,"3d4","2d4",1,"1d6",1,1,1,"1d3","1d2",1,1]
    const what = RNG.weighted(tanarri, [7,1,2,1,1,5,2,3,2,5,1,3,4,1,2,2,1,1,1,.1])
    return what + " Tanar'ri"
  },
  Gehreleth(RNG=chance) {
    const what = RNG.weighted(["Farastu","Kelubar","Shator"],[2,2,1])
    return what + " Gehreleth"
  },
  Yugoloth(RNG=chance) {
    const yugoloth = ["Canoloth","Mezzoloth","Piscoloth","Yagnoloth","Nycaloth","Ultroloth","Arcanaloth","Hydroloth","Dergoloth"]
    const napp = ["1d3","1d4+1","2d4",1,1,1,"1d3","1d6","1d4"]
    const what = RNG.weighted(yugoloth, [16,19,13,10,5,1,3,10,15])
    return what + " Yugoloth"
  },
  Baatezu(RNG=chance) {
    const baatezu = ["Lemure","Nupperibo","Spinagon","Barbazu","Kocrachon","Amnizu","Erinyes","Osyluth","Hamatula","Gelugon","Cornugon","Pit Fiend"]
    const napp = ["10d10","1d100","3d6","20d5","3d6","1d2",1,"2d4","3d4","1d8","1d4","1d2"]
    const what = RNG.weighted(baatezu, [1,1,6,8,3,3,7,4,4,6,5,1])
    return what + " Baatezu"
  },
  Elemental(RNG=chance) {
    //WATER WEIRD, Salamander, Galeb Duhr
    const sz = ["Small","Medium","Large","Huge","Greater","Elder"]
    const napp = ["1d6","1d4","1d2",1,1,1]
    const size = RNG.weighted(sz,[17,20,17,15,13,8]) 
    const what = RNG.pickone(["Air", "Earth", "Fire", "Water"])
    return [size,what,"Elemental"].join(" ")
  },
  Giant(RNG=chance) {
    const giants = ["Ogre","Troll","Ettin","Cyclops","Fire Giant","Frost Giant","Hill Giant","Stone Giant","Cloud Giant","Storm Giant"]
    const napp = [] 
    return RNG.weighted(giants,[25,25,15,15,5,5,5,5,3,1])
  },
  Genie (RNG=chance) {
    return RNG.weighted(["Jann", "Djinni", "Dao", "Efreeti", "Marid"],[4,2,2,1,1])
  },
  Lycanthrope (RNG=chance) {
    return "Were"+RNG.weighted(["bear", "boar", "bat", "fox", "rat", "tiger", "wolf"],[2,2,1,1,2,1,4])
  },
  Faction (RNG=chance, alignment = "neutral") {
    let list = alignment == "neutral" ? RNG.bool() ? Details.factions.sigil : Details.factions.outsiders : Details.factions[alignment]
    return RNG.pickone(list)
  },
  /*
    Crature Type Generators 
  */
  Aberration (RNG=chance) {
    let base = Likely(60,RNG) ? ["Aboleth","Cloaker","Grell","Mind Flayer","Rakshasa","Roper","Yuan-ti"] : ["Beholder","Deepspawn","Morkoth"]
    return ["Aberration",RNG.pickone(base)]
  },
  Animal (RNG=chance) {
    const aew = RNG.weighted(['a', 'e', 'w', 'c'], [3,6,2,1])

    let what = Encounters.size(RNG,1) + (aew == 'c' ? Encounters.Chimera(RNG) : Encounters._animal(RNG,aew))
    return ["Animal",what]
  },
  Construct (RNG=chance) {
    let what = RNG.weighted(["Flesh","Clay","Stone","Iron"],[3,4,2,1])
    return ["Construct",what+" Golem"]
  },
  Dragon (RNG=chance) {
    //age 
    const age = RNG.weighted(["Wyrmling","Very Young","Young","Juvenile","Young Adult","Adult","Mature Adult","Old","Very Old","Ancient","Wyrm","Great Wyrm"],[5,8,16,20,16,12,8,15,4,3,2,1])
    //["Couatl"]
    let base = RNG.bool() ? ["White","Black","Green","Blue","Red"] : ["Brass","Copper","Bronze","Silver","Gold"]
    return ["Dragon",RNG.weighted(base,[2,3,3,3,1])+" Dragon"]
  },
  Fey (RNG=chance) {
    let base = Likely(75,RNG) ? ["Brownie","Dryad","Gremlin","Nereid","Nymph","Pech","Satyr","Sylph","Will O'Wisp"] : ["Phoenix","Unicorn"]
    return ["Fey",RNG.pickone(base)]
  },
  Humanoid (RNG=chance) {
    let _what = RNG.weighted(["Human","Elf","Dwarf","Gnome","Halfling","Githzerai","Aasimar","Tiefling","Drow","Giant","Lycanthrope"],[3,2,2,1,1,1,1,1,1,1,1])
    return ["Humanoid",Encounters[_what] ? Encounters[_what](RNG) : _what ]
  },
  "Magical Beast" (RNG=chance) {
    let common = ["Ankheg","Bulette","Carrion Crawler","Cave Fisher","Griffon","Hippogriff","Owlbear","Shambling Mound","Stirge","Wyvern"]
    let uncommon = ["Basilisk","Cave Fisher","Chimera","Cockatrice","Displacer Beast","Dragonne","Hell Hound","Hydra","Manticore","Naga","Nightmare","Otyugh","Rust Monster","Umber Hulk"]
    let rare = ["Behir","Catoblepas","Dragon Turtle","Gorgon","Hook Horror","Leucrotta","Mimic","Pegasus","Peryton","Remorhaz","Roc","Purple Worm"]
    
    let r = RNG.d10()
    const base = r < 5 ? common : r < 9 ? uncommon : rare
    return ["Magical Beast",RNG.pickone(base)]
  },
  "Monstrous Humanoid" (RNG=chance) {
    let common = ["Aarakocra","Bugbear","Centaur","Githyanki","Gnoll","Goblin","Grippli","Harpy","Hobgoblin","Kobold","Kuo-Toa","Lizardfolk","Medusa","Minotaur","Myconid","Orc","Sahuagin","Yeti"]
    let uncommon = ["Bullywug","Crabman","Doppleganger","Ettercap","Gargoyle","Gibberling","Grimlock","Kenku","Lamia","Locathah","Mold Men","Thri-kreen","Treant","Troglodyte","Wemic"]
    return ["Monstrous Humanoid",RNG.pickone(Likely(60,RNG) ? common : uncommon)]
  },
  Outsider(RNG=chance,{type,weights}){
    //["Moon Dog","Salamander",Imp,"Ki-rin","Xorn"]
    const o = weights ? RNG.weighted(Details.factions.outsiders, weights) : type ? type : RNG.pickone(Details.factions.outsiders)
    console.log(o)
    return  ['Outsider',Encounters[o](RNG)]
  },
  Ooze (RNG=chance) {
    let what = RNG.bool() ? "Ooze "+Encounters._animal(RNG) : RNG.pickone["Olive Slime","Mustard Jelly","Ocher Jelly","Gray Ooze","Gelatinous Cube","Green Slime"]
    return ["Ooze",what]
  },
  Plant (RNG=chance) {
    let common = ["Black Pudding","Gas Spore","Mold Men","Myconid","Shrieker","Thornslinger","Treant","Yellow Musk Creeper"]
    let uncommon = ["Brown Pudding","Choke Creeper","Hangman Tree","Mantrap","Phycomid","Violet Fungus"]
    return ["Plant",RNG.pickone(Likely(60,RNG) ? common : uncommon)]
  },
  Undead(RNG=chance) {
    let common = ["Ghoul","Skeleton","Shadow","Weight","Zombie"]
    let uncommon = ["Ghost","Mummy","Revenant","Vampire","Wraith"]
    let rare = ["Banshee","Death Knight","Lich"]

    let r = RNG.d10()
    return ["Undead",RNG.pickone(r < 5 ? common : r < 9 ? uncommon : rare)]
  },
  Vermin (RNG=chance) {
    let base = RNG.bool() ? ["Ant","Bee","Beetle","Centipede","Dragonfly","Fly","Leech","Termite","Tick","Wasp"] : ["Rat","Slug","Snake","Toad"]
    return ["Vermin",RNG.pickone(base)]
  },
  /*
    Major generators 
  */
  Chimera(RNG=chance) {
    return ["Animal",[Encounters._animal(RNG),Encounters._animal(RNG)].join("/")]
  },
  Creature(RNG=chance) { 
    const base = RNG.weighted(['Aberration','Animal','Construct','Dragon','Magical Beast','Ooze','Plant','Undead','Vermin'],[1,7,1,1,3,1,2,1,3])
    return Encounters[base](RNG)
  },
  Planar (RNG=chance) {
    //['Aberration','Dragon','Fey','Humanoid','Monstrous Humanoid','Undead']
    let base = RNG.weighted(['Aberration','Dragon','Fey','Humanoid','Monstrous Humanoid','Undead'],[1,1,2,10,4,2])
    return Encounters[base](RNG) 
  },
  PC (RNG=chance) {
    let common = ["Human","Elf","Dwarf","Gnome","Halfling","Githzerai","Aasimar","Tiefling"]
    let uncommon = ["Aarakocra","Bugbear","Centaur","Githyanki","Gnoll","Goblin","Grippli","Hobgoblin","Kobold","Lizardfolk","Minotaur","Myconid","Orc","Sahuagin","Yeti"]
    
    return RNG.pickone(Likely(70,RNG) ? common : uncommon)  
  },
  Petitioner(RNG=chance){
    let [base,what] = Encounters.Planar(RNG)
    return [base,what+" [petitioner]"]
  },
  CreatureSpecial (RNG,what,nature,p = 50) {
    //add special nature 
    if(["Animal","Magical Beast","Vermin"].includes(what.base)){
      what.short += Likely(p) ? " ["+RNG.pickone(nature)+"]" : ""
    }
    return what 
  },
  Lair (base, short) {
    let lair = ['Aberration','Dragon','Fey','Humanoid','Monstrous Humanoid','Outsider','Undead'].includes(base) ? "Camp" : "Lair"

    return lair
  },
  Format ([base,short,tags]) {
    return {
      base,
      short,
      lair : Encounters.Lair(base,short),
      tags
    }
  },
  /*
    By plane
  */
  Outlands (RNG=chance, o={}) {
    //['aberration','animal','construct','dragon','fey','humanoid','magical beast','monstrous humanoid','ooze','outsider','plant','undead','vermin']
    let creatures = ["Petitioner", "Outsider", "Planar", "Elemental", "Rilmani", "Creature"]
    let _what = RNG.weighted(creatures, [2, 3, 5, 2, 2, 6])

    let what;
    if(_what == "Outsider"){
      what = Encounters.Outsider(RNG,{weights:[4,5,5,5,0,3,3,5,3,0,5,5,5]})
    }
    else if(["Elemental", "Rilmani"].includes(_what)){
      what = Encounters.Outsider(RNG,{type:_what})
    }
    else {
      what = Encounters[_what](RNG)
    }
    
    //add special to creatures
    Encounters.CreatureSpecial(RNG,what,["axiomatic","celestial","anarchic","fiendish"])

    //format the same  
    return Encounters.Format(what)
  },
  Abyss(RNG=chance, o={}) {
    let creatures = ["Tanar'ri", "Baatezu", "Petitioner", "Outsider", "Planar",  "Creature"]
    let _what = RNG.weighted(creatures, [45, 5, 20, 5, 5, 20])

    let what;
    if(_what == "Outsider"){
      what = Encounters.Outsider(RNG,{weights:[4,5,5,5,0,3,3,5,3,0,5,5,5]})
    }
    else if(["Tanar'ri", "Baatezu"].includes(_what)){
      what = Encounters.Outsider(RNG,{type:_what})
    }
    else {
      what = Encounters[_what](RNG)
    }

    //add special nature 
    Encounters.CreatureSpecial(RNG,what,["anarchic","fiendish"],100)
    
    //format the same  
    return Encounters.Format(what)
  },
  Random(RNG=chance, o={}) {
    let {plane} = o 

    //use plane based encounters 
    if(Encounters[plane]) {
      return Encounters[plane](RNG,o)
    }
    
    //['aberration','animal','construct','dragon','fey','humanoid','magical beast','monstrous humanoid','ooze','outsider','plant','undead','vermin']
    let creatures = ["Petitioner", "Outsider", "Planar", "Elemental", "Creature"]
    let _what = RNG.weighted(creatures, [2, 4, 6, 2, 6])

    let what;
    if(_what == "Outsider"){
      what = Encounters.Outsider(RNG,{weights:[4,5,5,5,0,3,3,5,3,0,5,5,5]})
    }
    else if(["Elemental"].includes(_what)){
      what = Encounters.Outsider(RNG,{type:_what})
    }
    else {
      what = Encounters[_what](RNG)
    }
    
    //format the same  
    return Encounters.Format(what)
  }
}

export {Encounters,NPCs}
