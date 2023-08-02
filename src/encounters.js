const chance = new Chance()

//https://www.completecompendium.com/

const airAnimals = ['pteranadon', 'condor', 'eagle/owl', 'hawk/falcon', 'crow/raven', 'heron/crane/stork', 'gull/waterbird', 'songbird/parrot','chicken/duck/goose','bee/hornet/wasp','locust/dragonfly/moth','gnat/mosquito/firefly']
const earthAnimals = ['dinosaur/megafauna','elephant/mammoth','ox/rhinoceros','bear/ape/gorilla','deer/horse/camel','cat/lion/panther','dog/wolf/boar/pig','snake/lizard/armadillo','mouse/rat/weasel','ant/centipede/scorpion','snail/slug/worm','termite/tick/louse']
const waterAnimals = ['whale/narwhal','squid/octopus','dolphin/shark','alligator/crocodile','turtle','shrimp/crab/lobster','fish','frog/toad','eel/snake','clam/oyster/snail','jelly/anemone','insect/barnacle']
const oddities = ['many-heads/no-head','profuse sensory organs','many limbs/tentacles/feelers','shape changing','bright/garish/harsh','web/network','crystalline/glassy','gaseous/misty/illusory','volcanic/explosive','magnetic/repellant','multilevel/tiered','absurd/impossible']
const elements = ['void','death/darkness','fire/metal/smoke','earth/stone','plants/fungus','water/ice/mist','air/wind/storm','stars/cosmos']
const magicTypes = ['necromancy','evocation/destruction','conjuration/summoning','illusion/glamor','enchantment/artifice','transformation','warding/binding','restoration/healing','divination/scrying']


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
  Chimera(RNG=chance) {
    return [Encounters._animal(RNG),Encounters._animal(RNG)].join("/")
  },
  Creature(RNG=chance) { 
    const aew = RNG.weighted(['a', 'e', 'w', 'c'], [3,6,2,1])

    return Encounters.size(RNG,1) + (aew == 'c' ? Encounters.Chimera(RNG) : Encounters._animal(RNG,aew))
  },
  Archon(RNG=chance) {
    const archons = ["Lantern", "Hound", "Warden","Sword", "Trumpet", "Throne", "Tome"]
    const napp = ["3d6","1d6","1d6","1d6","1d3",1,1]
    const what = RNG.weighted(archons, [7, 19, 16, 11, 14, 5, 3])
    return what + " Archon"
  },
  Slaad(RNG=chance) {
    const slaad = ["Red","Blue","Green","Gray","Death"]
    const napp = ["3d6","2d6","1d6","1d6","1d4","1d2"]
    const what = RNG.weighted(slaad, [30,20,15,10,4])
    return what + " Slaad"
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
  "Tanar'ri"(RNG=chance) {
    const tanarri = ["Manes","Dretch","Rutterkin","Bar-Lgura","Nabassu","Babau","Uridezu","Armanite","Maurezhi","Bulezau","Vrock","Chasme","Hezrou","Goristo","Glabrezu","Nalafeshnee","Alkilith","Marilith","Wastrilith","Balor"]
    const napp = ["50d10","4d10",1,"2d6",1,1,1,"2d10",1,"3d4","2d4",1,"1d6",1,1,1,"1d3","1d2",1,1]
    const what = RNG.weighted(tanarri, [7,1,2,1,1,5,2,3,2,5,1,3,4,1,2,2,1,1,1,.1])
    return what + " Tanar'ri"
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
  Undead(RNG=chance) {
    return RNG.weighted(["Banshee","Death Knight","Ghost","Ghoul","Lich","Mummy","Revenant","Shadow","Vampire","Weight","Wraith"],[1,1,2,6,1,2,2,3,2,6,6])
  },
  Monster(RNG=chance) {
    return RNG.weighted(["Aboleth","Beholder","Couatl","Displacer Beast","Gargoyle","Harpy","Medusa","Mind Flayer","Minotaur","Myconid","Naga","Rakshasa","Treant"],[1,1,1,2,4,4,1,1,4,4,4,1,2])
  },
  Planar (RNG=chance) {
    let what = RNG.weighted(["Human","Elf","Dwarf","Gnome","Halfling","Githzerai","Other"],[3,2,2,1,1,1,2])
    what = what != "Other" ? what : RNG.pickone(["Giant","Undead","Monster","Fairy","Lizardfolk","Orc","Hobgoblin","Gnoll","Goblin","Kobold","Aarakocra","Bugbear","Centaur","Drow"])
    return Encounters[what] ? Encounters[what](RNG) : what
  },
  Petitioner(RNG=chance){
    return Encounters.Planar(RNG)+" [petitioner]"
  },
  Random(RNG=chance, o={}) {
    let creatures = ["Petitioner", "Outsider", "Planar", "Elemental", "Khaasta", "Kuldurath", "Fhorge", "Rilmani Ferrumach", "Rilmani Cuprilach", "Rilmani Aurumach", "Creature"]
    let _what = RNG.weighted(creatures, [6, 16, 16, 16, 4, 3, 7, 5, 2, 1, 20])
    let what = ""

    //determine lair type 
    let _i = creatures.indexOf(_what)
    let lair = [0, 1, 2, 7, 8, 9].includes(_i) ? "Outpost" : "Lair"

    //use sub generators 
    if (_what == "Outsider") {
      _what = RNG.weighted(["Archon", "Guardinal", "Slaad", "Modron", "Baatezu", "Yugoloth", "Tanar'ri"], [29, 6, 6, 6, 28, 5, 16]) 
    }
    what = Encounters[_what] ? Encounters[_what](RNG) : _what 
    if(_what == "Creature"){
      what += " [" + RNG.pickone(["axiomatic","celestial","anarchic","fiendish"]) + "]"
    }

    return {
      what,
      lair
    }
  }
}

export default Encounters
