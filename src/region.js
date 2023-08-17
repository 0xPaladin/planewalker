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

const Safety = (RNG=chance,{base="neutral", alignment})=>{
  //based of parent alignment
  let _alignment = RNG.weighted(...Aligment[base])
  _alignment = alignment ? alignment : _alignment
  //safety roll mod by alignment
  const sR = RNG.d12() + AligmentMod[_alignment]
  const _safety = sR <= 1 ? 3 : sR <= 3 ? 2 : sR <= 9 ? 1 : 0
  const safety = ["perilous", "dangerous", "unsafe", "safe"][_safety]

  return {
    alignment: _alignment,
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
  special(RNG) {
    const type = RNG.weighted(['element', 'magic', 'aspect'], [3, 2, 1])
    const what = RNG.pickone(Details[type])
    return [type, what]
  },
  hazard(RNG, region) {
    //TODO trap created by local creature /faction
    let hazard = ["barrier:natural/constructed/magical","techtonic:gysers/lava-pits/volcanic", "pitfall:chasm/crevasse/abyss/rift", "ensnaring:bog/mire/tarpit/quicksand", "trap:natural/mechancial/magical", "meteorological:blizzard/thunderstorm/sandstorm", "seasonal:fire/flood/avalanche", "impairing:mist/fog/murk/gloom/miasma"]
    //const obstacle = RNG.weighted(["impenetrable:cliff/escarpment/crag/bluff", "penetrable:forest/jungle/morass", "traversable:river/ravine/crevasse/chasm/abyss"], [2, 3, 3, 3])
    const site = RNG.weighted(hazard, [1,1, 2, 2, 1, 3, 1, 1])
    const [type,what] = site.split(":").map((w,i)=>i == 0 ? w : RNG.pickone(w.split("/")))
    //faction 
    let faction = ["trap","barrier"].includes(type) ? RNG.pickone(region.lookup("faction")).who : null
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
  wilderness(RNG, region, opts={}) {
    const type = RNG.pickone(['element', 'magic', 'aspect'])
    const what = RNG.pickone(Details[type])
    const special = Likely(50) ? [type, what] : null
    
    return {
      specifics: "wilderness",
      text: "Wilderness: ",
      siteType: "origin unknown",
      scale: 4,
      special
    }
  },
  landmark(RNG, region) {
    const site = RNG.weighted(["tree", "earth works", "water-based", "faction", "megalith/obelisk/statue"], [3, 3, 2, 1, 2])
    const what = RNG.pickone(site.split("/"))
    //faction 
    let faction = what == "faction" ? RNG.pickone(region.lookup("faction")).who : null
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
  dungeon(RNG) {
    const ruin = RNG.weighted(["tomb/crypt/necropolis", "shrine/temple/sanctuary", "mine/quarry/excavation", "stronghold/fortress", "ruined settlement", "archive/laboratory"], [2, 4, 2, 2, 2, 1])
    const dungeon = RNG.weighted(["caves/caverns", "ruined settlement", "prison", "mine/quarry/excavation", "tomb/crypt/necropolis", "lair/den/hideout", "stronghold/fortress", "shrine/temple/sanctuary", "archive/laboratory", "origin unknown"], [1, 1, 1, 1, 1, 1, 1, 1, 1, 3])
    const type = RNG.pickone([ruin,dungeon])
    const short = RNG.pickone(type.split("/"))

    return {
      specifics: type,
      text: "Dungeon: " + short,
      siteType: type,
      scale: RNG.weighted([0, 1, 2, 3, 4], [4, 4, 2, 1, 1]),
      short,
    }
  },
  creature(RNG, region) {
    let plane = region.parent.name
    const specifics = Encounters.Random(RNG,{plane})
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
  faction(RNG, {alignment}) {    
    const who = Encounters.Faction(RNG, alignment)

    return {
      specifics: who,
      text: "Faction: " + who,
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
    if (!P) {
      P = new Plane(app,app.poi.Planes[this._parent])
      this._parent = P.id
    }
    P._children.push(this.id)

    this.UI = ["Area.Region.PS"]
    //set class
    this.class[0] = "region"

    //generates all data 
    //pull data from options to be used for generation 
    let {terrain, alignment=[], children=[]} = this.opts

    //establish seeded random 
    const RNG = new Chance(this.id)

    //alignment 
    this.alignment = RNG.pickone(alignment.concat(this.parent.opts.alignment))
    //safety 
    Object.assign(this, Safety(RNG, {
      alignment : this.alignment
    }))

    //climate 
    this.climate = RNG.weighted(["cold", "temperate", "tropical"], [1, 3, 1])
    //primary terrain 
    this.terrain = [terrain || RNG.pickone(Object.keys(TerrainTypes))]
    //name 
    this._name = Name(this.id, this.terrain[0])

    this._portal = this.portal(RNG)

    //automatically generate the following 
    this.addFeature(RNG.hash(),"wilderness",{terrain:this.terrain[0]})
    this.addFeature(RNG.hash(),"resource")
    this.addFeature(RNG.hash(),"faction")
    BuildArray(4-this._safety, ()=>this.addFeature(RNG.hash(),"creature"))
    this.addFeature(RNG.hash(),"dungeon")

    //number of features 
    let nF = SumDice("3d3", RNG) - this._children.length
    //build random 
    if(nF > 0) {
      BuildArray(nF, ()=>this.addFeature())
    }

    //get hex array
    this.setHex(this.size)

    //set PS
    this.PerilousShores()
  }

  random (what,where,i) {
    let app = this.app 
    let {generated} = app.state 
    /*
      "wilderness" : ["Random Encounter","Explore","Get a Job","Generate a NPC"],
    "settlement" : ["Explore","Get a Job","Generate a NPC"]
    */
    if(what == "self") {
      let R = new Region(this.app,this.opts)
      this.app.setArea(R.id)
    }
    else if(what == "neighbor") {
      let opts = JSON.parse(JSON.stringify(this.opts))
      delete opts.name
      delete opts.children
      opts.id = [this.id.split(".")[0], "n", chance.natural()].join(".")
  
      let R = new Region(this.app,opts)
      this.app.setArea(R.id)
    }
    else if(what == "Explore") {
      //generate an explore value 
      generated.push(["Explore", Quests.SetExplore(where,this._safety)])
      app.setState({generated})
    }
    else if (what == "Get a Job") {
      generated.push(["Job", Quests.Jobs(this, where)])
      app.setState({generated})
    }
    else if (what == "Generate a NPC") {
      generated.push(this.NPC(where))
      app.setState({generated})
    }
    else if (what == "Random Encounter") {
      generated.push(this.encounter(where,i))
      app.setState({generated})
    }
    else if (what == "New Portal") {
      generated.push(["Portal", this.portal()])
      app.setState({generated})
    }
  }

  PerilousShores() {
    //alignment = ["neutral","chaotic","evil","good","lawful","perilous","safe"] 
    //terrain = ["difficult","island","archipelago","barren","bay","coast","higland","lake","land","lowland","peninsula","wetland","woodland"]
    //["civilized"]

    let RNG = new Chance(this.id)
    let seed = RNG.natural()

    //start with alignment and safety 
    let tags = [RNG.pickone(["land", "lake"]), this.alignment, this.safety]

    //used in terrain below 
    const LikelyPush = (P,what)=>{
      if (Likely(P, RNG))
        tags.push(what)
    }

    //add terrain tags 
    if (this.terrain == "mountains") {
      tags.push("highland")
      LikelyPush(50, "difficult")
      LikelyPush(75, "land")
    } else if (this.terrain == "hills") {} else if (this.terrain == "forest") {
      tags.push("woodland")
    } else if (this.terrain == "plains") {
      tags.push("lowland")
    } else if (this.terrain == "desert") {
      tags[0] = "land"
      tags.push("barren")
      LikelyPush(50, "difficult")
      LikelyPush(50, RNG.pickone(["lowland", "highland"]))
    } else if (this.terrain == "swamp") {
      tags.push("wetland")
      LikelyPush(65, "lowland")
      LikelyPush(50, "woodland")
    } else if (this.terrain == "water") {
      tags[0] = RNG.pickone(["island", "archipelago", "coast", "bay", "peninsula"])
      LikelyPush(50, "woodland")
      LikelyPush(50, RNG.pickone(["lowland", "highland"]))
    }
    if(this.opts.PS) {
      tags[0] = RNG.pickone(this.opts.PS)
    }

    //count settlements
    let nS = this.children.reduce((sum,c)=>{
      sum += (c.what == "settlement" ? c.scale : ["faction", "outpost"].includes(c.what) ? 1 : 0)
      return sum
    }
    , 0)
    if (nS > 5) {
      tags.push("civilized")
    }

    //get url string 
    this.iframe = "https://watabou.github.io/perilous-shores/?seed=" + seed + "&tags=" + tags.join(",") + "&hexes=1"
  }

  //add a feature to the region 
  addFeature(id = chance.hash(),what,o = {}) {
    const RNG = new Chance(id)

    //always generate f 
    const fR = RNG.d12() + this._safety
    let f = fR <= 4 ? "creature" : fR <= 7 ? "hazard" : fR <= 11 ? "site" : fR == 12 ? "faction" : "settlement"
    //get type of site  
    if (f == "site") {
      f = RNG.pickone(["dungeon", "landmark", "resource"])
    }
    f = what ? what : f

    //assign feature data 
    let data = Features[f](RNG, this, o)

    //terrains 
    const T = this.terrain.concat(TerrainTypes[this.terrain[0]])
    //terrain based on weights 
    let ti = RNG.weighted([0, 1, 2, 3], [40, 30, 20, 10])
    data.terrain = o.terrain ? [o.terrain] : [ti == 3 ? RNG.pickone(T[ti]) : T[ti]]
    if (data.specifics == "wilderness") {
      data.text += data.terrain
    }

    //get site 
    let opts = {
      id,
      what: f,
      parent: this.id,
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
        opts.id = RNG.hash()
        opts.text = f == "wilderness" ? data.text : null

        let s = new Site(this.app,opts)
        return s.id
      }
      )
    }

    //push site to region 
    this._children.push(S.id)
  }

  get view () {
    //Make a format for dropdown options - what,text,n
    let PS = []
    PS.push(...this.lookup("wilderness").map(c => ["wilderness",c.text,1]))
    PS.push(["portal",this._portal.text,1])
    PS.push(...this.lookup("hazard").map(c => ["hazard",c.text,1]))
    PS.push(...this.lookup("resource").map(c => ["wilderness",c.text,1]))
    PS.push(...this.lookup("creature").map((c,i) => ["creature",c.text,1,i]))
    PS.push(...this.lookup("dungeon").map(c => ["dungeon",c.text,1]))
    PS.push(...this.lookup("faction").map(c => ["faction",c.text,1]))
    PS.push(["settlement","Settlements",1])

    return {PS}
  }

  save() {
    let opts = Object.assign({},this.opts)
    opts.name = this.name 
    
    DB.setItem(this.id, opts)
  }

  lookup (what) {
    return this.children.filter(c => c.what == what)
  }

  portal (RNG = chance) {
    let parent = this.parent.portal()
    let self = this.opts.portals ? RNG.weighted(...this.opts.portals) : parent

    let where = RNG.pickone([parent,self]) 
    //check for random plane 
    if(where == "random"){
      where = RNG.pickone(Object.keys(this.app.poi.Planes))
      where = this.app.poi.Regions[where] ? where : "Outlands"
    }
    //if it is a plane, pick a region within 
    if(this.app.poi.Regions[where]) {
      where = RNG.pickone(Object.keys(this.app.poi.Regions[where]))
    }

    let timing = RNG.pickone(["Permanent","On a Schedule"])
    let key = RNG.weighted(["physical","nature","action","thought"],[4,1,2,1])
    let short = [where,", key: ",key].join("")
    let text = ["Portal: ",short,", ",timing].join("")
    
    return {where,key,text,short}
  }

  NPC(where) {
    let npc = NPCs.common()

    if (where == "faction") {
      let who = chance.pickone(this.lookup("faction")).who
      npc.people = who
      let short = npc.short.split(" ")
      short[0] = who
      npc.short = short.join(" ")
    }

    return ["NPC", npc]
  }

  encounter(where,i = -1) {
    let plane = this.parent.name 
    
    const Obj = (short) => Object.assign({short})
    //get available creatures 
    let creature = i == -1 ? chance.bool() ? Encounters.Random(chance,{plane}) : chance.pickone(this.lookup("creature")) : this.lookup("creature")[i]
    //set basic result
    return ["Encounter", Obj(creature.who || creature.short)]
  }

  showChild(place, i) {
    let id = place.size > 1 ? place._children[i] : place.id
    this.app.setArea(id)
  }

}

class Plane extends Area {
  constructor (app, opts) {
    super(app, opts);
  }

  portal () {   
    return this.opts.portals ? chance.bool() ? chance.weighted(...this.opts.portals) : this.opts.name : this.opts.name
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
//map symbols 
SVG.find('symbol').forEach(s=>{
  let id = s.attr('id')
  Symbols[id] = s
}
)

export {Region}

