var DB = localforage.createInstance({
  name: "Regions"
});

/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, chance} from "./random.js"

//array from 
const BuildArray = (n,f)=>Array.from({
  length: n
}, f)

/*
  Names 
*/
const NamesByTerrain = {
  "water": ['Bay', 'Bluffs', 'Downs', 'Expanse', 'Lake', 'Morass', 'Reach', 'Sea', 'Slough', 'Sound'],
  "swamp": ['Bog', 'Fen', 'Heath', 'Lowland', 'Marsh', 'Moor', 'Morass', 'Quagmire', 'Slough', 'Swamp', 'Thicket', 'Waste', 'Wasteland', 'Woods'],
  "desert": ['Bluffs', 'Desert', 'Dunes', 'Expanse', 'Flats', 'Foothills', 'Hills', 'Plains', 'Range', 'Sands', 'Savanna', 'Scarps', 'Steppe', 'Sweep', 'Upland', 'Waste', 'Wasteland'],
  "plains": ['Expanse', 'Fells', 'Flats', 'Heath', 'Lowland', 'March', 'Meadows', 'Moor', 'Plains', 'Prairie', 'Savanna', 'Steppe', 'Sweep'],
  "forest": ['Expanse', 'Forest', 'Groves', 'Hollows', 'Jungle', 'March', 'Thicket', 'Woods'],
  "hills": ['Bluffs', 'Cliffs', 'Downs', 'Foothills', 'Heights', 'Hills', 'Mounds', 'Range', 'Scarps', 'Steppe', 'Sweep', 'Upland', 'Wall'],
  "mountains": ['Cliffs', 'Expanse', 'Foothills', 'Heights', 'Mountains', 'Peaks', 'Range', 'Reach', 'Scarps', 'Steppe', 'Teeth', 'Upland', 'Wall']
}
const NameAdjective = ['Ageless', 'Ashen', 'Black', 'Blessed', 'Blighted', 'Blue', 'Broken', 'Burning', 'Cold', 'Cursed', 'Dark', 'Dead', 'Deadly', 'Deep', 'Desolate', 'Diamond', 'Dim', 'Dismal', 'Dun', 'Eerie', 'Endless', 'Fallen', 'Far', 'Fell', 'Flaming', 'Forgotten', 'Forsaken', 'Frozen', 'Glittering', 'Golden', 'Green', 'Grim', 'Holy', 'Impassable', 'Jagged', 'Light', 'Long', 'Misty', 'Perilous', 'Purple', 'Red', 'Savage', 'Shadowy', 'Shattered', 'Shifting', 'Shining', 'Silver', 'White', 'Wicked', 'Yellow']
const NameNoun = ['Ash', 'Bone', 'Cabal', 'Darkness', 'Dead', 'Death', 'Desolation', 'Despair', 'Devil', 'Doom', 'Dragon', 'Fate', 'Fear', 'Fire', 'Fury', 'Ghost', 'Giant', 'God', 'Gold', 'Heaven', 'Hell', 'Honor', 'Hope', 'Horror', 'King', 'Life', 'Light', 'Lord', 'Mist', 'Peril', 'Queen', 'Rain', 'Refuge', 'Regret', 'Savior', 'Shadow', 'Silver', 'Skull', 'Sky', 'Smoke', 'Snake', 'Sorrow', 'Storm', 'Sun', 'Thorn', 'Thunder', 'Traitor', 'Troll', 'Victory', 'Witch']
const NameForms = ["adj. .t", "t. of .noun", "The .t. .adj", "noun. .t", "noun.'s .adj. .t", "adj. .t. of .noun"]

const Name = (seed,terrain)=>{
  let RNG = new Chance(seed)
  terrain = terrain || RNG.pickone(Object.keys(NamesByTerrain))

  let name = {
    terrain,
    t: RNG.pickone(NamesByTerrain[terrain]),
    adj: RNG.pickone(NameAdjective),
    noun: RNG.pickone(NameNoun)
  }

  let form = RNG.weighted(NameForms, [4, 3, 1, 2, 1, 1])
  name.short = form.split(".").map(w=>name[w] || w).join("")

  return name
}

/*
  Safety and Alignment 
*/
const Aligment = {
  "good": [["evil", "chaotic", "neutral", "lawful", "good"], [1, 2, 2, 2, 5]],
  "lawful": [["evil", "chaotic", "neutral", "lawful", "good"], [2, 1, 2, 5, 2]],
  "neutral": [["evil", "chaotic", "neutral", "lawful", "good"], [1, 2, 6, 2, 1]],
  "chaotic": [["evil", "chaotic", "neutral", "lawful", "good"], [2, 7, 0, 1, 2]],
  "evil": [["evil", "chaotic", "neutral", "lawful", "good"], [5, 2, 2, 2, 1]]
}
const AligmentMod = {
  "good": -3,
  "lawful": -5,
  "neutral": 0,
  "chaotic": 5,
  "evil": 3
}

const Safety = (seed,a=["neutral"])=>{
  const RNG = new Chance(seed)
  //based of parent alignment
  const alignment = RNG.weighted(...Aligment[RNG.pickone(a)])
  //safety roll mod by alignment
  const sR = RNG.d12() + AligmentMod[alignment]
  const _safety = sR <= 1 ? 3 : sR <= 3 ? 2 : sR <= 9 ? 1 : 0
  const safety = ["perlous", "dangerous", "unsafe", "safe"][_safety]

  return {
    alignment,
    _safety,
    safety
  }
}

/*
  Terrain generation 
*/
const TerrainTypes = {
  "water": ["plains", "forest", ["swamp", "desert", "hills"]],
  "swamp": ["plains", "forest", ["water"]],
  "desert": ["hills", "plains", ["water", "mountains"]],
  "plains": ["forest", "hills", ["water", "swamp", "desert"]],
  "forest": ["plains", "hills", ["water", "swamp", "mountains"]],
  "hills": ["mountains", "plains", ["water", "desert", "forest"]],
  "mountains": ["hills", "forest", ["desert"]]
}

//Terrain Symbols
const TerrainSymbols = {
  "water": [],
  "swamp": [["swamp", 2, 3]],
  "desert": [["dune", 2], ["cactus", 1, 2, 3], ["deadTree", 1, 2]],
  "plains": [["grass", 2]],
  "forest": [["deciduous", 2, 3], ["conifer", 2]],
  "hills": [["hill", 2, 3, 4, 5]],
  "mountains": [["mount", 2, 3, 4, 5, 6], ["mount", 2, 3, 4, 5, 6], ["mountSnow", 1, 2, 3, 4, 5, 6], ["vulcan", 1, 2, 3]]
}
const TerrainSymbolsTropical = {
  "water": [],
  "swamp": [["swamp", 2, 3]],
  "desert": [["dune", 2], ["cactus", 1, 2, 3], ["deadTree", 1, 2]],
  "plains": [["grass", 2]],
  "forest": [["deciduous", 2, 3], ["palm", 2], ["acacia", 2], ["acacia", 2], ["acacia", 2]],
  "hills": [["hill", 2, 3, 4, 5]],
  "mountains": [["mount", 2, 3, 4, 5, 6], ["mountSnow", 1, 2, 3, 4, 5, 6], ["vulcan", 1, 2, 3]]
}
const TerrainSymbolsCold = {
  "water": [],
  "swamp": [["swamp", 2, 3]],
  "desert": [["dune", 2], ["deadTree", 1, 2]],
  "plains": [["grass", 2]],
  "forest": [["deciduous", 2, 3], ["conifer", 2], ["coniferSnow", 1], ["coniferSnow", 1], ["coniferSnow", 1]],
  "hills": [["hill", 2, 3, 4, 5]],
  "mountains": [["mountSnow", 1, 2, 3, 4, 5, 6], ["vulcan", 1, 2, 3]]
}

//generate terrains based on a parent terrain 
const Terrain = ({seed, primary, ids, climate})=>{
  const RNG = new Chance(seed)

  //Divide hexes along terrains : 40,30,20,10
  let hex = ids.slice()
  // get primary terrain 
  const [pids,remains] = primary == "water" ? Chain(RNG, hex, 40) : RNG.bool() ? Chain(RNG, hex, 40) : [[], hex]
  //shuffle remaining terrains and ids 
  const _terrain = [40, 30, 20, 10].map((n,i)=>Array.from({
    length: n
  }, ()=>i == 0 ? primary : i != 3 ? TerrainTypes[primary][i - 1] : RNG.pickone(TerrainTypes[primary][2]))).flat()
  const byId = pids.concat(RNG.shuffle(remains))

  //track roughness 
  const rough = {
    "water": [],
    "rough": [],
    "forest": [],
    "easy": []
  }

  //build terrain Array
  //get symbol set to use 
  const TS = climate == "cold" ? TerrainSymbolsCold : climate == "tropical" ? TerrainSymbolsTropical : TerrainSymbols

  const terrain = []
  byId.forEach((qr,i)=>{
    let t = _terrain[i]

    //track hex rough terrain 
    if (rough[t]) {
      rough[t].push(qr)
    } else if (["mountains", "desert", "swamp"].includes(t)) {
      rough.rough.push(qr)
    } else {
      rough.easy.push(qr)
    }

    //get symbols and jitter 
    let s = t == "water" ? "" : RNG.pickone(TS[t])
    let symbol = s != "" ? ["relief", s[0], RNG.pickone(s.slice(1))].join("-") : ""
    //number of symbol placement 
    let nsp = t == "forest" ? RandBetween(20, 50, RNG) : ["plains", "swamp"].includes(t) ? RandBetween(5, 15, RNG) : ["cactus", "deadTree"].includes(s[0]) ? RandBetween(3, 5, RNG) : t == "water" ? 0 : 1
    let jitter = Array.from({
      length: nsp
    }, ()=>[RandBetween(-20, 20, RNG), RandBetween(-20, 20, RNG)])

    //set terrain to hex 
    terrain[hex.indexOf(qr)] = {
      type: t,
      sub: RNG.d100(),
      symbol,
      jitter,
    }
  }
  )

  return {
    terrain,
    rough
  }
}

/*
  Features 
*/
import {Encounters, NPCs} from "./encounters.js"
import*as Details from "./data.js"

const Features = {
  _faction(RNG) {
    return RNG.pickone(RNG.bool() ? Details.factions : Details.outsiders)
  },
  special(RNG) {
    const type = RNG.weighted(['element', 'magic', 'aspect'], [3, 2, 1])
    const what = RNG.pickone(Details[type])
    return [type, what]
  },
  hazard(RNG, region) {
    //TODO trap created by local creature /faction
    let h = ["techtonic:gysers/lava-pits/volcanic", "pitfall:chasm/crevasse/abyss/rift", "ensnaring:bog/mire/tarpit/quicksand", "trap:natural/mechancial/magical", "meteorological:blizzard/thunderstorm/sandstorm", "seasonal:fire/flood/avalanche", "impairing:mist/fog/murk/gloom/miasma"]
    const site = RNG.weighted(h, [1, 2, 2, 1, 3, 1, 1])
    const [type,what] = site.split(":").map((w,i)=>i == 0 ? w : RNG.pickone(w.split("/")))
    //faction 
    let faction = type == "trap" ? Features.faction(RNG, region).who : null
    //special nature 
    const special = Likely(10) ? Features.special(RNG) : null

    return {
      specifics: [type, what],
      text: "Hazard: " + what + " [" + type + (faction ? ", " + faction : "") + "]",
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      special,
      faction
    }
  },
  obstacle(RNG, region) {
    //TODO defensive created by local creature /faction
    const site = RNG.weighted(["barrier:natural/constructed/magical", "impenetrable:cliff/escarpment/crag/bluff", "penetrable:forest/jungle/morass", "traversable:river/ravine/crevasse/chasm/abyss"], [2, 3, 3, 3])
    const [type,what] = site.split(":").map((w,i)=>i == 0 ? w : RNG.pickone(w.split("/")))
    //faction 
    let faction = type == "barrier" ? Features.faction(RNG, region).who : null
    //special nature 
    const special = Likely(10) ? Features.special(RNG) : null

    return {
      specifics: [type, what],
      text: "Obstacle: " + what + " [" + type + (faction ? ", " + faction : "") + "]",
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2]),
      special,
      faction
    }
  },
  area(RNG, region, opts = {}) {
    let _what = RNG.weighted(["obstacle", "hazard", "wilderness"], [1, 1, 3])
    _what = opts.what ? opts.what : _what
    
    let data = _what == "wilderness" ? {specifics: "wilderness"} : Features[_what](RNG, region)

    //update data based upon area 
    const a = {
      text: _what == "wilderness" ? "Wilderness: " : "Large Area " + data.text,
      scale: 4,
      siteType: _what == "wilderness" ? "origin unknown" : data.siteType
    }

    return Object.assign(data, a)
  },
  landmark(RNG, region) {
    const site = RNG.weighted(["tree", "earth works", "water-based", "faction", "megalith/obelisk/statue"], [3, 3, 2, 1, 2])
    const what = RNG.pickone(site.split("/"))
    //faction 
    let faction = what == "faction" ? Features.faction(RNG, region).who : null
    //special nature 
    const special = Likely(10) ? Features.special(RNG) : null

    return {
      specifics: site,
      text: "Landmark: " + what + (faction ? " [" + faction + "]" : ""),
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      special,
      faction
    }
  },
  resource(RNG) {
    const site = RNG.weighted(["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"], [3, 2, 2, 2, 1])
    //special nature 
    const special = Likely(10) ? Features.special(RNG) : null

    return {
      specifics: site,
      text: "Resource: " + site,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2]),
      special
    }
  },
  ruin(RNG) {
    const site = RNG.weighted(["tomb/crypt/necropolis", "shrine/temple/sanctuary", "mine/quarry/excavation", "ancient outpost", "ancient settlement"], [2, 4, 2, 2, 2])
    const short = RNG.pickone(site.split("/"))

    //tables to use for generation of areas 
    const type = site == "ancient outpost" ? "stronghold/fortress" : site == "ancient settlement" ? "ruined settlement" : site

    return {
      specifics: site,
      text: "Ruin: " + short,
      siteType: type,
      scale: RNG.weighted([0, 1, 2, 3, 4], [4, 4, 2, 1, 1]),
      short
    }
  },
  dungeon(RNG) {
    const type = RNG.weighted(["caves/caverns", "ruined settlement", "prison", "mine/quarry/excavation", "tomb/crypt/necropolis", "lair/den/hideout", "stronghold/fortress", "shrine/temple/sanctuary", "archive/laboratory", "origin unknown"], [1, 1, 1, 1, 1, 1, 1, 1, 1, 3])
    const short = RNG.pickone(type.split("/"))

    return {
      specifics: type,
      text: "Dungeon: " + short,
      siteType: type,
      scale: RNG.weighted([0, 1, 2, 3, 4], [4, 4, 2, 1, 1]),
      short,
    }
  },
  creature(RNG) {
    const specifics = Encounters.Random(RNG)
    let {lair, short} = specifics

    return {
      specifics,
      text: lair + ": " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([1, 2, 3], [5, 4, 1]),
      who: short,
      hasJobs: lair == "Camp"
    }
  },
  lair(RNG) {
    //add site 
    return Object.assign(Features.creature(RNG))
  },
  outpost(RNG) {
    const who = RNG.weighted(["tollhouse/checkpoint", "meeting/trading post", "camp/roadhouse/inn", "tower/fort/base"], [2, 3, 3, 1])
    const short = RNG.pickone(who.split("/"))

    return {
      specifics: who,
      text: "Outpost: " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1], [5, 5]),
      who,
      short
    }
  },
  faction(RNG, {factions}) {
    const who = factions ? RNG.pickone(factions) : Features._faction(RNG)

    return {
      specifics: who,
      text: "Enclave: " + who,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2]),
      who
    }
  },
  settlement(RNG, {_safety=0, alignment="neutral", water=false}) {
    let names = ["Hamlet", "Village", "Keep", "Town", "City"]
    const r = RNG.d12() + _safety
    const sz = r < 5 ? 0 : r < 8 ? 1 : r < 10 ? 2 : r < 12 ? 3 : 4
    const who = names[sz]

    //develop string for MFCG - use new rng 
    let MR = new Chance(RNG.seed)
    let size = [5, 15, 25, 35, 45][sz]
    let mseed = MR.natural()
    //greens=1&farms=1&citadel=1&urban_castle=1&plaza=1&temple=1&walls=1&shantytown=1&gates=-1&river=1&coast=1&sea=1.8
    let dmfcg = [size, mseed].concat(Array.from({
      length: 9
    }, ()=>ZeroOne(MR)), [water ? 1 : 0, 0, 0])
    //create link string 
    let mids = ["size", "seed", "greens", "farms", "citadel", "urban_castle", "plaza", "temple", "walls", "shantytown", "gates", "river", "coast", "sea"]
    //https://watabou.github.io/city-generator/?size=17&seed=1153323449&greens=1&farms=1&citadel=1&urban_castle=1&plaza=1&temple=1&walls=1&shantytown=1&coast=1&river=1&gates=-1&sea=1.8
    let mfcg = "https://watabou.github.io/city-generator/?" + mids.map((mid,i)=>mid + "=" + dmfcg[i]).join("&")

    //based of parent alignment
    alignment = RNG.weighted(...Aligment[alignment])

    return {
      text: who + " [" + alignment + "]",
      siteType: "origin unknown",
      scale: sz,
      who,
      mfcg
    }
  }
}

/*
  Enable jobs and quests 
*/
import*as Quests from "./quests.js"

/*
  Core Class for a Region 
  Generates from options 
*/
import {Area} from "./area.js"
import {Site} from "./site.js"

class Region extends Area {
  constructor(app, opts={}) {
    super(app, opts);

    //check for parent 
    let P = this.parent
    if(!P) {
      P = new Area(app,app.poi.Planes[this._parent])
      this._parent = P.id 
    } 
    P._children.push(this.id)

    this.UI = "Area.Region"
    //set class
    this.class[0] = "region"

    //generates all data 
    //pull data from options to be used for generation 
    let {terrain, alignment=["neutral"], children=[]} = this.opts

    //establish seeded random 
    const RNG = new Chance(this.id)

    //climate 
    this.climate = RNG.weighted(["cold", "temperate", "tropical"], [1, 3, 1])
    //primary terrain 
    this.terrain = [terrain || RNG.pickone(Object.keys(TerrainTypes))]
    //name 
    this._name = Name(this.id, this.terrain[0])
    //safety 
    Object.assign(this, Safety(this.id, alignment))
    //factions 
    this.factions = BuildArray(RNG.pickone([1, 2]), ()=>Features._faction(RNG))

    //number of features 
    let nF = SumDice("3d3", RNG)
    //add an area 
    this.addFeature({
      f: "area",
      what : "wilderness"
    })
    //build random 
    BuildArray(nF, (v,i)=>this.addFeature())

    //get hex array
    this.setHex(this.size)
    
    //set PS
    this.PerilousShores()
  }

  randomize() {
    let R = new Region(this.app,this.opts)
    this.app.setArea(R.id)
  }

  neighbor() {
    let opts = this.opts
    opts.name = null
    opts.id = [this.id.split(".")[0],"n",chance.natural()].join(".")
    
    let R = new Region(this.app,opts)
    this.app.setArea(R.id)
  }

  PerilousShores () {
    //alignment = ["neutral","chaotic","evil","good","lawful","perilous","safe"] 
    //terrain = ["difficult","island","archipelago","barren","bay","coast","higland","lake","land","lowland","peninsula","wetland","woodland"]
    //["civilized"]

    let RNG = new Chance(this.id)
    let seed = RNG.natural()

    //start with alignment and safety 
    let tags = [RNG.pickone(["land","lake"]),this.alignment,this.safety]

    //used in terrain below 
    const LikelyPush = (P,what) => {
      if(Likely(P,RNG))
        tags.push(what)
    }
    
    //add terrain tags 
    if(this.terrain == "mountains"){
      tags.push("highland")
      LikelyPush(50,"difficult")
      LikelyPush(75,"land")
    }
    else if(this.terrain == "hills") {
    }
    else if(this.terrain == "forest") {
      tags.push("woodland")
    }
    else if(this.terrain == "plains") {
      tags.push("lowland")
    }
    else if(this.terrain == "desert") {
      tags[0] = "land"
      tags.push("barren")
      LikelyPush(50,"difficult")
      LikelyPush(50,RNG.pickone(["lowland","highland"]))
    }
    else if(this.terrain == "swamp") {
      tags.push("wetland")
      LikelyPush(65,"lowland")
      LikelyPush(50,"woodland")
    }
    else if(this.terrain == "water") {
      tags[0] = RNG.pickone(["island","archipelago","coast","bay","peninsula"])
      LikelyPush(50,"woodland")
      LikelyPush(50,RNG.pickone(["lowland","highland"]))
    }
        
    //count settlements
    let nS = this.children.reduce((sum,c) =>{
      sum+=(c.what == "settlement" ? c.scale : ["faction","outpost"].includes(c.what) ? 1 : 0)
      return sum
    },0)
    if(nS > 5) {
      tags.push("civilized")
    }

    //get url string 
    this.iframe = "https://watabou.github.io/perilous-shores/?seed="+seed+"&tags="+tags.join(",")+"&hexes=1"
  }

  //add a feature to the region 
  addFeature(o={}) {
    let i = this.children.length
    let _id = [this.id, "f", i].join(".")
    const RNG = new Chance(_id)

    const fR = RNG.d12() + this._safety
    let f = fR <= 4 ? "creature" : fR <= 7 ? ["hazard", "obstacle", "area"][fR - 5] : fR <= 11 ? "site" : fR == 12 ? "faction" : "settlement"
    //get sub 
    if (f == "site") {
      f = RNG.pickone(["dungeon", "lair", "ruin", "outpost", "landmark", "resource"])
    }
    f = o.f || f

    //assign feature data 
    let data = Features[f](RNG, this, o)

    //terrains 
    const T = [this.terrain].concat(TerrainTypes[this.terrain])
    //terrain based on weights 
    let ti = i == 0 ? 0 : RNG.weighted([0, 1, 2, 3], [40, 30, 20, 10])
    data.terrain = [ti == 3 ? RNG.pickone(T[ti]) : T[ti]]
    if(data.specifics == "wilderness"){
      data.text += data.terrain
    }

    //get site 
    let opts = {
      id : _id,
      what: f,
      parent: this.id,
      i,
      type: data.siteType,
      scale: data.scale == 4 ? 0 : data.scale
    }

    //create site 
    const S = new Site(this.app,opts)
    Object.assign(S, data)
    S.addClass("feature")
    S.addClass(f)

    //if scale 4 it has multiple sites, otherwise it is just a site 
    if (data.scale == 4) {
      opts.parent = S.id
      opts.scale = null
      let n = SumDice("2d3", RNG)

      S._children = BuildArray(n, (v,j)=>{
        opts.id = [S.id, "s", j].join(".")
        opts.i = j
        opts.text = f == "area" ? data.text : null

        let s = new Site(this.app,opts)
        return s.id
      }
      )
    }

    //push site to region 
    this._children.push(S.id)
  }

  save() {
    let name = this.name
    DB.setItem(this.id, {
      name
    })
  }

  //get a list of other regions in the poi to load 
  async loadList() {
    let {name} = this.poi
    //pull keys and filter for the ones with the same name as the poi 
    let list = []
    DB.iterate((r,k)=>{
      let[_name,seed] = k.split(".")
      if (_name == name) {
        list.push([k, r._name || seed])
      }
    }
    ).then(()=>{
      //set with the list 
      this.app.setState({
        loadList: list
      })
    }
    )
  }

  //get people inhabiting region 
  get creatures() {
    return this.childDisplay.reduce((ppl,c,i)=>{
      if (["creature", "lair", "faction"].includes(c.what)) {
        ppl.push(i)
      }
      return ppl
    }
    , [])
  }

  get people() {
    return this.childDisplay.reduce((ppl,c,i)=>{
      if (["outpost", "settlement", "city", "faction"].includes(c.what)) {
        ppl.push(i)
      } else if (["creature", "lair"].includes(c.what) && c.hasJobs) {
        ppl.push(i)
      }
      return ppl
    }
    , [])
  }

  //get sites for exploration and uses for jobs 
  get sites() {
    return this.childDisplay.reduce((s,c,i)=>{
      if (["hazard", "obstacle", "area", "dungeon", "ruin", "landmark", "resource"].includes(c.what)) {
        s.push(i)
      }
      return s
    }
    , [])
  }

  //get sites for exploration and uses for jobs 
  get delves() {
    return this.childDisplay.reduce((s,c,i)=>{
      if (["dungeon", "ruin"].includes(c.what)) {
        s.push(i)
      }
      return s
    }
    , [])
  }

  //get tags for a chosen hex 
  getTags(qr) {
    let i = this.ids.indexOf(qr)
    let terrain = this.terrain[i]
    let place = this.places[qr]

    return [terrain.type].concat(place ? place.tags || [] : [])
  }

  newExplore(place) {
    //generate an explore value 
    return ["Explore", Quests.SetExplore(this, place)]
  }

  NPC(place) {
    let npc = NPCs.common()

    if(place.who && !["settlement","outpost"].includes(place.what)) {
      npc.people = place.who
      let short = npc.short.split(" ")
      short[0] = place.who
      npc.short = short.join(" ")
    }
    
    return ["NPC", npc]
    console.log(npc)
  }

  encounter(place) {
    let places = this.childDisplay
    
    let makeObj = (short)=>{
      return {
        short
      }
    }

    //get available creatures 
    let id = this.creatures.length > 0 ? chance.pickone(this.creatures) : -1
    //set basic result - with random 
    let E = ["Encounter", id > -1 && chance.bool() ? makeObj(places[id].who) : Encounters.Random()]

    if (place) {
      if (["creature", "lair", "faction"].includes(place.what)) {
        E[1] = makeObj(place.who)
      }
    }

    return E
  }

  job(place) {
    return ["Job", Quests.Jobs(this, place)]
  }

  showChild (place,i) {
    let id = place.size > 1 ? place._children[i] : place.id
    this.app.setArea(id)
  }

  showSub(hex, i) {
    const what = this.places[hex.qr]
    //generate site 
    const seed = [this.seed, what.what, what.i].join(".")
    let site = Site(seed, what)
    site.hex = hex
    this.app.site = site
    //set terrain
    let _hex = site.sites[i].hex
    _hex.forEach(h=>h.terrain = {
      type: what.what
    })
    console.log(site)

    //hide hex 
    SVG('#hex').addClass('hidden')
    //get sub 
    const g = SVG('#site')
    g.removeClass('hidden')
    //empty hex 
    g.find(".hex").forEach(h=>h.remove())
    g.find(".dText").forEach(h=>h.remove())

    //display - hex and simple id 
    _hex.forEach((hex,i)=>{
      RenderHex(hex, g, this.app)
      g.text("#" + (i + 1)).move(hex.x, hex.y).addClass('dText')
    }
    )

    //move to center 
    const box = g.bbox()
    SVG("#submap").attr('viewBox', [box.x, box.y, box.width, box.height].join(" "))

    //set view 
    this.app.setView("Hex.Site." + i)
  }

}

/*
  Rendering UI 
*/

const RenderTerrain = (hex,g)=>{
  //add relief 
  let {x, y, terrain} = hex
  let sz = 50
  terrain.jitter.forEach(([jx,jy])=>{
    //position 
    let px = x + jx - sz / 2
      , py = y + jy - sz / 2
    g.use(Symbols[terrain.symbol]).addClass('relief').size(sz, sz).move(px, py)
  }
  )
}

const RenderPlaces = (hex,g,app)=>{
  let {q, r, x, y, place} = hex
  //add places 
  if (place) {
    let p;

    if (["settlement", "outpost", "city"].includes(place.what)) {
      let sz = 50
      //position 
      let px = x - sz / 2
        , py = y - sz / 2
      p = g.image(place.what + '.png').addClass('place').size(sz, sz).move(px, py)
    } else if (Symbols[place.what]) {
      let sz = 25
      //position 
      let px = x - sz / 2
        , py = y - sz / 2

      p = g.group()
      p.circle(sz).addClass('place ' + place.what).move(px, py)
      p.use(Symbols[place.what]).addClass('place ' + place.what).size(sz, sz).move(px, py)
    } else {
      //its a feature
      let sz = 10
      //position 
      let px = x - sz / 2
        , py = y - sz / 2
      p = g.use(Symbols["map-point"]).addClass('place ' + place.what).size(sz, sz).move(px, py)
    }

    //enable picking 
    p.click(function() {
      app.setHex(hex.qr)
    })
  }
}

//main map display 
const Symbols = {}
const ShowOutlands = (app)=>{
  //add map 
  const svg = app.svg = SVG('#map')
  //add two groups 
  const map = app.map = SVG('#outlands')
  //map symbols 
  SVG.find('symbol').forEach(s=>{
    let id = s.attr('id')
    Symbols[id] = s
  }
  )

  return

  //place POI 
  Object.entries(POI).forEach(([id,poi])=>{
    let {p, size, marker} = poi
    p[0] -= size / 2
    p[1] -= size / 2

    //set marker and create click event 
    let what = map.use(Symbols["map-" + marker]).data('poi', poi).addClass('poi ' + marker).fill(poi.color).size(size).move(...p)
    what.click(function(e) {
      let _poi = this.data('poi')
      console.log(_poi)
      app.setRegion(_poi, {
        mainMap: true
      })
    })
  }
  )

  //svg.use(symbols[10]).move(200, 200)
  Resize(app)

  SVG('#outlands').click(function(e) {
    //find exact position of click 
    let {x, y} = e
    let {translateX, translateY} = this.transform()
    let p = [x - translateX, y - translateY]

    console.log(p)
  })
}

export {Region}

/*
//display 
  grid.forEach((hex,i)=> {
    const qr = [hex.q,hex.r]
    const d = grid.distance(c, qr)
    if(d > 4)return
    
    renderSVG(hex,i, g)
  })

  const grid = new Grid(Hex,rectangle({
  width: 9,
  height: 9
}))

show all symbols 
Object.values(Symbols).forEach((s,i) => {
    let sz = 50
    let x = i%20 * 50 
    let y = Math.floor(i/20) * 75
    let relief = app.svg.use(s).size(sz,sz).move(x,y)
    relief.click(function(){
      console.log(this.node.href)
    } )
  })

  */
