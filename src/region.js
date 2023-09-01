var DB = localforage.createInstance({
  name: "Areas"
});

/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, chance} from "./random.js"

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
   "water","swamp","desert","plains","forest","hills","mountains"
*/
const TerrainTypes = {
  "water": ["plains", "forest", ["swamp", "desert", "hills"]],
  "swamp": ["plains", "forest", ["water"]],
  "desert": ["hills", "plains", ["water", "mountains"]],
  "plains": ["forest", "hills", ["water", "swamp", "desert"]],
  "forest": ["plains", "hills", ["water", "swamp", "mountains"]],
  "hills": ["mountains", "plains", ["water", "desert", "forest"]],
  "mountains": ["hills", "forest", ["desert"]],
}
const SpecialTerrains = {
  "underwater" : "plains,hills,forest,mountains/",
  "underground" : "",
  "planeWater" : "",
  "planeFire" : "",
  "planeAir" : "",
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
import * as Encounters from "./encounters.js"
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
    let faction = ["trap","barrier"].includes(type) && region.lookup("faction").length > 0 ? RNG.pickone(region.lookup("faction")).who : null

    return {
      specifics: [type, what],
      text: "Hazard: " + what + " [" + type + (faction ? ", " + faction : "") + "]",
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      special : Features.special(RNG),
      faction
    }
  },
  wilderness(RNG, region, opts={}) {
    const type = RNG.pickone(['element', 'magic', 'aspect'])
    const what = RNG.pickone(Details[type])
    
    return {
      specifics: "wilderness",
      text: "Wilderness: ",
      siteType: "origin unknown",
      scale: 4,
      special : [type, what],
    }
  },
  landmark(RNG, region) {
    const site = RNG.weighted(["tree", "earth works", "water-based", "faction", "megalith/obelisk/statue"], [3, 3, 2, 1, 2])
    const what = RNG.pickone(site.split("/"))
    //faction 
    let faction = what == "faction" && region.lookup("faction").length > 0 ? RNG.pickone(region.lookup("faction")).who : null

    return {
      specifics: site,
      text: "Landmark: " + what + (faction ? " [" + faction + "]" : ""),
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      special : Features.special(RNG),
      faction
    }
  },
  resource(RNG) {
    const site = RNG.weighted(["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"], [3, 2, 2, 2, 1])
    let what = RNG.pickone(site.split("/"))

    return {
      specifics: [site,what],
      text: "Resource: " + what,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2]),
      special : Features.special(RNG),
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
  encounter(RNG, region) {
    const specifics = region.encounter()[1]
    let {lair, short} = specifics

    return {
      specifics,
      text: lair + ": " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([1, 2, 3], [5, 4, 1]),
      who: short,
      hasJobs: lair == "Camp",
      special : Features.special(RNG),
    }
  },
  faction(RNG, {alignment}) {    
    const who = Encounters.Faction(RNG, alignment)

    return {
      specifics: who,
      text: "Faction: " + who,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2]),
      who,
      special : Features.special(RNG),
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
      mfcg,
      special : Features.special(RNG),
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
import * as Names from "./names.js"
import {Site, Area} from "./site.js"

class Region extends Area {
  constructor(app, opts={}) {
    super(app, opts);

    //check for parent 
    if (!this.parent) {
      let {parent,layer} = this.opts
      this._parent = app.planes.find(p=> p.name == parent).id
    }
    this.parent.children.push(this)

    //set class
    this.class[0] = "region"

    //manage faction assets
    this._assets = []

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
    let tB = this.parent.specialTerrain ? WeightedString(this.parent.specialTerrain.base,RNG) : RNG.pickone(["water","swamp","desert","plains","forest","hills","mountains"])
    this.terrain = [terrain || tB]
    //name 
    this._name = Names.Region(this.id, this.terrain[0])

    //automatically generate the following 
    this.addFeature(RNG.hash(),"wilderness",{terrain:this.terrain[0]})
    this.addFeature(RNG.hash(),"resource")
    
    //number of features 
    let nF = SumDice("3d3", RNG) - this.children.length
    //build random 
    if(nF > 0) {
      BuildArray(nF, ()=>this.addFeature(RNG.hash()))
    }

    //add people for every settlement 
    this._people = this.lookup("settlement").map(s => {
      let p = this.encounter({what:"Petitioner"},RNG)[1]
      p.text = "People: "+p.short

      return p
    })

    //get hex array
    this.setHex(this.size)

    //set PS
    this.PerilousShores()

    //state that is saved 
    this.state = {
      portal : null
    }
  }

  get plane () {
    return [this.parent.name,this.opts.layer]
  }

  random (what,data) {
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
    else if(what == "Explore") {
      //generate an explore value 
      generated.push(["Explore", this.rewards(Quests.SetExplore(data==-1 ? "settlement" : data.what,this._safety),data)])
      app.setState({generated})
    }
    else if (what == "Get a Job") {
      generated.push(["Job", Quests.Jobs(null, this)])
      app.setState({generated})
    }
    else if (what == "Generate a NPC") {
      generated.push(this.NPC(data))
      app.setState({generated})
    }
    else if (what == "Random Encounter") {
      generated.push(this.encounter({useLocal:true,data}))
      app.setState({generated})
    }
    else if (what == "New Portal") {
      this.portal = chance
      app.refresh()
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

    //check for parent plane stylings 
    let pPS = this.parent.opts.PS
    if(pPS) {
      if(pPS.base) {
        tags[0] = WeightedString(pPS.base,RNG)
      }
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
  addFeature(id = chance.hash(),what = null,o = {}) {
    const RNG = new Chance(id)

    //always generate f 
    const fR = RNG.d12() + this._safety
    let f = fR <= 4 ? "encounter" : fR <= 7 ? "hazard" : fR <= 11 ? WeightedString("dungeon,landmark,resource/1,2,1") : "settlement"
    //use provided   
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

    const _size = ["1d6+1", "1d8+7", "1d10+15", "1d12+25"]
    //get site 
    let _site = Object.assign(data,{
      id,
      what : f,
      parent: this,
      size : data.scale != 4 ? [SumDice(_size[data.scale],RNG)] : BuildArray(SumDice("2d3",RNG),()=> SumDice(_size[RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2])],RNG))
    }) 
    //push site to region 
    this.children.push(_site)

    //only if dungeon create a site 
    if(f == "dungeon"){
      this.addSite(_site)
    }
  }

  addSite (what) {
    let opts = {
      id : what.id,
      parent : this.id,
      scale : what.scale == 4 ? 0 : what.scale,
      type : what.siteType
    }

    //establish site 
    what.site = new Site(this.app,opts)
    what.site.addClass("feature")
    what.site.addClass(what.what)

    return 
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
  } 

  get view () {
    const options = ["Random Encounter","Explore"]
    
    //Make a format for dropdown options - what,text,n
    let PS = []
    PS.push(...this.lookup("wilderness").map(c => [options,c.text,1,c]))
    PS.push([["New Portal"],this.portal.text,1])
    PS.push(...this.lookup("resource").map(c => [options,c.text,1,c]))
    PS.push(...this.lookup("landmark").map(c => [options,c.text,1,c]))
    PS.push(...this.lookup("hazard").map(c => [options,c.text,1,c]))
    PS.push(...this.lookup("encounter").map((c,i) => [options,c.text,1,c]))
    PS.push(...this.lookup("dungeon").map(c => [options,c.text,1,c]))
    PS.push([["Explore","Get a Job","Generate a NPC"],"Settlements",1,-1])
    PS.push(...this.lookup("faction").map((c,i) => [c.noJob ? options: ["Explore","Get a Job","Generate a NPC"],"Faction: "+c.name,1,c]))
    PS.push(...this._people.map((c,i) => [["Generate a NPC"],c.text,1,c]))

    return {PS}
  }

  save() {
    let data = {
      opts : Object.assign({},this.opts,{name:this.name}),
      state : this.state 
    }
    
    DB.setItem(this.id, data)
  }

  lookup (what) {
    let F = this.app.factions
    return what != "faction" ? this.children.filter(c => c.what == what) : [...new Set(this._assets.map(a => a[0]))].map(id => F[id])  
  }

  /*
    Portals 
  */

  get portal () {
    return this.state.portal 
  }
  
  set portal (RNG = chance) {
    let where = this.opts.portals ? RNG.pickone([parent,WeightedString(this.opts.portals)]) : this.parent.portal()
    //check for random plane 
    where = ["Outer","Inner"].includes(where) ? RNG.pickone(Object.keys(this.app.poi[where+"Planes"])) : where 

    //take the plane and pick a region within 
    let region = RNG.pickone(this.app.planes.find(p => p.name == where).children)
    let location = [region.plane[0],region.name].join(", ")

    let timing = RNG.pickone(["Permanent","On a Schedule"])
    let key = RNG.weighted(["physical","nature","action","thought"],[4,1,2,1])
    let short = [location,timing].join("; ")
    let text = ["Portal: ",short,"; key: ",key].join("")
    
    this.state.portal = {region:region.id,key,text,short}
  }

  //calculate rewards based upon an exploration 
  rewards (explore,where,RNG = chance) {
    where = where == -1 ? this.children[0] : where
    
    let [what,value,dur] = explore.reward
    let [challenge, focus, rank, check] = explore.data

    const addNature = (n) => {
      explore.reward.push(n)
      explore.short = [challenge,"["+focus+"]",check+";","Find:",what,"("+n+")"].join(" ")
    }

    //change Materials, Resource, Essence 
    if(what == "Resource") {
      //push nature of reward 
      let nature = where.what == "resource" ? where.specifics[1] : RNG.pickone(this.lookup("resource")).specifics[1]
      addNature(nature)
    }
    else if (what == "Essence") {
      //use dungeon themes 
      let nature = where.what == "dungeon" ? RNG.pickone(where.site.themes): where.special[1]
      addNature(nature)
    }
    else if (what == "Materials") {
      let nature = RNG.pickone(where.what == "encounter" ? ["martial","potions","clothing"] : ["martial","potions","clothing","equipment","jewelry"]) 
      addNature(nature)
    }
    //
    
    return explore
  }

  NPC(data,RNG=chance) {
    let people = null 
    let occupation = this.app.gen.Encounters.NPCs.occupation(RNG)

    if(data.base) {
      people = data
    }
    else if (data.front) {
      people = data.minion(RNG)
    }
    else {
      people = this._people.length > 0 ? RNG.pickone(this._people) : this.encounter({what:"Planar"},RNG)[1]
    }

    let short = [people.short,occupation[1]].join(" ")
    return ["NPC", {people,occupation,short}]
  }

  encounter(o = {},RNG = chance) {
    let {i = -1, threat = null, rarity = RNG.weighted([0, 1, 2, 3], [45, 35, 15, 5])} = o

    //use local encounters 
    let local = this.lookup("encounter").map(e => e.specifics).concat(this._people)
    if(o.useLocal && local.length > 0 && Likely(70,RNG)){
      return ["Encounter", o.i == undefined ? RNG.pickone(local) : this.lookup("encounter")[o.i].specifics]
    }
    
    //pull encounter from parent plane - always Planar, Petitioner, Beast... 
    let {encounters = {}} = this.parent.opts
    let base = encounters.base ? encounters.base : "Beast,Monster,Celestial,Fiend,Elemental/30,20,20,20,10"

    //base inital result on safety 
    //all encounters build a list of types of creatures 
    let what = o.what ? o.what : Likely(30+(this._safety*10),RNG) ? WeightedString("Planar,Petitioner/25,75",RNG) : WeightedString(base,RNG)
    //see if encounters provides a specific rarity string 
    let str = encounters[what]

    let opts = Object.assign({rarity,threat,what,str})
    let res = threat != null ? Encounters.ByThreat(RNG,opts) : Encounters.ByRarity(opts,RNG)
    //set basic result
    return ["Encounter", res]
  }

  showChild(place, i) {
    let id = place.size > 1 ? place._children[i] : place.id
    this.app.setArea(id)
  }

  UI () {
    console.log(this)
    
    let {html} = this.app
    let {generated} = this.app.state 

    //splice generated objects 
    const GenSplice = (i) => {
      generated.splice(i,1)
      this.app.updateState("generated",generated)
    }

    //svg div 
    const svg = html`
    <svg id="map" height="600px" width="600px" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
      <g id="hex"></g>
    </svg>
    `

    //hex button 
    const hexButton = (id,n)=>html`<div class="f6 white link dim dib bg-gray tc br2 pa1" style="min-width:45px;"><span class="hex-marker">${n > 1 ? n : ""}⬢</span></div>`

    //handle drowdown for every features 
    const dropdown = ([dOpts,text,n,data]) => html`
    <div class="pointer dropdown f5 mv1">
      <div class="flex items-center">
        ${hexButton(n)}
        <div class="mh1">${text}</div>
      </div>
      <div class="dropdown-content bg-white ba bw1 pa1">
        ${dOpts.map(opt => html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.random(opt,data)}>${opt}</div>`)}
      </div>
    </div>
    `

    //return final UI 
    return html`
    <div class="overflow-auto flex flex-wrap justify-center items-start">
      <div class="bg-white-70 br2 mw6 h-100 mh2 pa1">
        <h2 class="pointer underline ma0 mv2" onClick=${()=>this.app.show = "Planes"}>${this.parent.name}${this.opts.layer && this.opts.layer != this.parent.name ? " :: "+this.opts.layer : ""}</h2>
        <div class="flex items-center ma1">
          <div class="dropdown">
            <div class="flex items-end pointer underline-hover">
              <h3 class="ma0 mh1">${this.name}, ${this.terrain[0]}, ${this.alignment} [${this.safety}]</h3>
              <span class="f5 link dim dib bg-gray white tc br2 mh1 pa1 ph2">✎</span>
            </div>
            <div class="f4 dropdown-content bg-white ba bw1 pa1">
              <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=> this.save()}>Save</div>
            </div>
          </div>   
        </div>
        <div class="ma2">${this.view.PS.map(dropdown)}</div>
        ${generated.length >0 ? html`<h3 class="mh2 mv0">Generated</h3>` : ""}
        ${generated.map(([what,data],i)=>html`
        <div class="mh2 flex justify-between items-center">
          <div>${what}: ${data.short}</div>
          <div class="pointer white hover-red link dim dib bg-gray tc br2 pa1" onClick=${()=>GenSplice(i)}>X</div>
        </div>`)}
      </div>
      <div class="bg-white-70 br2 pa2 ph4">
        ${!this.iframe ? svg : html`<iframe id="i-map" src=${this.iframe} height="600px" width="600px"></iframe>`}
      </div>
    </div>
    `
  }
}

/*
  Plane Class
*/

class Plane extends Area {
  constructor (app, opts) {
    super(app, opts);
    //set class
    this.class[0] = "plane"

    if(opts.addClass) {
      opts.addClass.forEach(c => this.addClass(c))
    }
  }

  get name() {
    return this.opts.name  
  }

  get layers () {
    let _layers = this.opts.layers ? this.opts.layers : [this.name]
    let regions = this.app.regions 
    
    return _layers.map(l => [l,regions.filter(r => l == r.plane[1])])
  }

  get specialTerrain () {
    return this.opts.specialTerrain
  }

  addRegion (layer,terrain = "random") {
    let opts = {
      parent : this.name,
      layer : layer
    }
    if(terrain != "random"){
      opts.terrain = terrain
    }

    new Region(this.app,opts)
    //set view 
    this.app.refresh()
  }

  //returns planes to get portals to 
  portal () {   
    let {portals} = this.opts     
    return portals && chance.bool() ? WeightedString(portals) : this.name
  }

  get UI () {
    return html`
    <div class="flex items-center">
      <select class="pa1" value=${toGenerate} onChange=${(e)=>this.updateState("toGenerate", e.target.value)}>
          ${regions.map(r=>html`<option value=${r[0]}>${r[1]}</option>`)}
      </select>
      <div class="pointer f5 link dim ba bw1 pa1 dib black mr1" onClick=${()=>this.loadSaved("Region")}>Load Saved</div>
        <select class="pa1" value=${plane} onChange=${(e)=>this.updateState("plane", e.target.value)}>
          ${_planes.map(p=>html`<option value=${p.join(".")}>${p.join(", ")}</option>`)}
        </select>
        <select class="pa1" value=${toGenerate} onChange=${(e)=>this.updateState("toGenerate", e.target.value)}>
          ${terrainTypes.map(t=>html`<option value=${t}>${t}</option>`)}
        </select>
        <a class="f5 link dim ba bw1 pa1 dib black" href="#" onClick=${()=>this.generate()}>Generate</a>
        <div class="pointer f5 link dim ba bw1 pa1 dib black mh1" onClick=${()=>this.setView("Main")}>Home</div>
    </div>;
    `
  }
}

export {Area,Site,Region,Plane}

