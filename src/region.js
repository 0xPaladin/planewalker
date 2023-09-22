var DB = localforage.createInstance({
  name: "Areas"
});

/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, capitalize, chance} from "./random.js"

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
  "waterside": ["swamp/forest", "plains", "hills", "desert/mountains"],
  "swamp": ["swamp", "waterside/forest", "plains/forest", "plains"],
  "desert": ["desert", "hills", "plains/mountains", "waterside"],
  "plains": ["plains", "forest", "waterside/hills", "swamp/desert"],
  "forest": ["forest", "plains", "hills/waterside", "swamp/mountains"],
  "hills": ["hills", "mountains", "plains/desert/forest", "waterside"],
  "mountains": ["mountains", "hills", "forest", "desert/waterside"],
}
const SpecialTerrains = {
  "underwater": "plains,hills,forest,mountains/",
  "underground": "",
  "planeWater": "",
  "planeFire": "",
  "planeAir": "",
}
const Biomes = {
  name: ["Marine", "Hot desert", "Cold desert", "Savanna", "Grassland", "Tropical seasonal forest", "Temperate deciduous forest", "Tropical rainforest", "Temperate rainforest", "Taiga", "Tundra", "Glacier", "Wetland"],
  habitability: [0, 4, 10, 22, 30, 50, 100, 80, 90, 12, 4, 0, 12]
}

const CalculateBiome = (region)=>{
  let RNG = new Chance(region.id)

  //climate 
  let climate = region.climate = RNG.weighted(["cold", "temperate", "tropical"], [1, 3, 1])

  //primary terrain 
  let tB = region.parent.terrain ? WeightedString(region.parent.terrain.base, RNG) : RNG.pickone(["islands", "costal", "lake", "barren", "wetland", "woodland", "lowlands", "highlands", "standard"])
  let terrain = region.terrain = region.opts.terrain && region.opts.terrain != "random" ? region.opts.terrain : tB

  //relative altitude - low, standard, high 
  let rA = region._rA = RNG.pickone([0, 1, 2])

  //biome is based upon terrain and climate 
  let _terrain = ["islands", "costal", "lake"].includes(terrain) ? RNG.weighted(["barren", "wetland", "woodland", "lowlands", "highlands", "standard"], [1, 1, 2, 2, 1, 3]) : terrain
    , biome = ""
    , moisture = -1;
  if (_terrain == "barren") {
    biome = climate == "cold" ? "Tundra/Cold desert" : "Hot desert"
    moisture = 0
  } else if (_terrain == "wetland") {
    biome = climate == "cold" ? "Taiga" : "Wetland"
    moisture = 3
  } else if (_terrain == "woodland") {
    biome = climate == "cold" ? "Taiga/Temperate deciduous forest" : climate == "tropical" ? "Tropical seasonal forest/Tropical rainforest" : "Temperate deciduous forest/Temperate rainforest"
  } else if (_terrain == "highlands") {
    biome = climate == "cold" ? ["Tundra", "Tundra", "Glacier"][rA] : climate == "tropical" ? ["Temperate rainforest", "Temperate deciduous forest", "Grassland"][rA] : ["Taiga/Tundra", "Taiga/Tundra", "Glacier"][rA]
    moisture = biome == "Glacier" ? 0 : -1
  } else {
    biome = climate == "cold" ? "Taiga/Tundra/Grassland" : climate == "tropical" ? "Tropical rainforest/Tropical seasonal forest/Savanna" : "Grassland/Temperate deciduous forest/Temperate rainforest"
  }

  //pick biome 
  region.biome = RNG.pickone(biome.split("/"))

  //moisture 
  region.moisture = moisture != -1 ? moisture : region.biome.includes("rainforest") ? 3 : region.biome.includes("forest") || region.biome == "Taiga" ? 2 : 1

  //habitability 
  // base suitability derived from biome habitability
  region.s = Biomes.habitability[Biomes.name.indexOf(region.biome)]
}

/*
  PerilousShores
*/

const PerilousShores = (region)=>{
  //alignment = ["neutral","chaotic","evil","good","lawful","perilous","safe"] 
  //terrain = ["difficult","island","archipelago","barren","bay","coast","higland","lake","land","lowland","peninsula","wetland","woodland"]
  //["civilized"]

  let RNG = new Chance(region.id)
  let seed = RNG.natural()

  //"islands", "costal", "lake", "barren", "wetland", "woodland", "lowlands","highlands","standard"
  let T = region.terrain
    , B = region.biome
    , P = region.lookup("people").map(p=>p.tags).flat();
  let base = T == "islands" ? RNG.pickone(["island", "archipelago"]) : T == "costal" ? RNG.pickone(["bay", "coast", "peninsula"]) : T == "lake" ? "lake" : "land"
  //give aquatics somehwere to live 
  base = P.includes("aquatic") && base == "land" ? "lake" : base
  //start with base terrain, alignment and safety 
  let tags = [base, region.alignment, region.safety]

  //used in terrain below 
  const LikelyPush = (P,what)=>{
    if (Likely(P, RNG))
      tags.push(what)
  }

  //add terrain tags 
  if (base == "land") {
    tags.push(T)
    if (T != "barren" && Likely(10, RNG)) {
      tags[0] = "lake"
    }
  }
  if ((B.includes("forest") || B == "Taiga") && !tags.includes("woodland")) {
    tags.push("woodland")
  }
  if (["barren", "highlands"].includes(T)) {
    LikelyPush(50, "difficult")
  }

  //check for parent plane stylings, but default to options 
  let pPS = region.parent.PS
  if (!region.opts.terrain && pPS) {
    if (pPS.base) {
      tags[0] = WeightedString(pPS.base, RNG)
    }
  }

  //count settlements
  if (region.lookup("settlement").length > 2) {
    tags.push("civilized")
  }

  //get url string 
  region.iframe = "https://watabou.github.io/perilous-shores/?seed=" + seed + "&tags=" + tags.join(",") + "&hexes=1"
}

/*
  Features 
*/
import {Encounter, Professions} from "./encounters.js"
import*as Details from "./data.js"

const Essence = (RNG)=>RNG.pickone(Object.keys(Details.essence))

const Features = {
  hazard(RNG, region) {
    //TODO trap created by local creature /faction
    let hazard = ["barrier:natural/constructed/magical", "techtonic:gysers/lava-pits/volcanic", "pitfall:chasm/crevasse/abyss/rift", "ensnaring:bog/mire/tarpit/quicksand", "trap:natural/mechancial/magical", "meteorological:blizzard/thunderstorm/sandstorm", "seasonal:fire/flood/avalanche", "impairing:mist/fog/murk/gloom/miasma"]
    //const obstacle = RNG.weighted(["impenetrable:cliff/escarpment/crag/bluff", "penetrable:forest/jungle/morass", "traversable:river/ravine/crevasse/chasm/abyss"], [2, 3, 3, 3])
    const site = RNG.weighted(hazard, [1, 1, 2, 2, 1, 3, 1, 1])
    const [type,what] = site.split(":").map((w,i)=>i == 0 ? w : RNG.pickone(w.split("/")))
    //faction 
    let faction = ["trap", "barrier"].includes(type) && region.lookup("faction").length > 0 ? RNG.pickone(region.lookup("faction")).who : null

    let short = what + " [" + type + (faction ? ", " + faction : "") + "]"

    return {
      specifics: [type, what],
      short,
      text: "Hazard: " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
      faction
    }
  },
  wilderness(RNG, region, opts={}) {
    return {
      specifics: "wilderness",
      text: "Wilderness",
      siteType: "origin unknown",
      scale: 4,
      difficulty: null,
      essence: Essence(RNG),
    }
  },
  landmark(RNG, region) {
    const site = RNG.weighted(["Great Tree", "Earth Works", "Water-based", "Faction", "Megalith/Obelisk/Statue", "Titanic Skeleton"], [3, 2, 2, 1, 2, 1])
    const what = RNG.pickone(site.split("/"))
    //faction 
    let faction = what == "faction" && region.lookup("faction").length > 0 ? RNG.pickone(region.lookup("faction")).who : null

    let short = what + (faction ? " [" + faction + "]" : "")

    return {
      specifics: site,
      short,
      text: "Landmark: " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
      faction
    }
  },
  resource(RNG) {
    const site = RNG.weighted(["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"], [3, 2, 2, 2, 1])
    let what = RNG.pickone(site.split("/"))

    return {
      specifics: [site, what],
      short: what,
      text: "Resource: " + what,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
    }
  },
  dungeon(RNG) {
    const ruin = RNG.weighted(["tomb/crypt/necropolis", "shrine/temple/sanctuary", "mine/quarry/excavation", "stronghold/fortress", "ruined settlement", "archive/laboratory"], [2, 4, 2, 2, 2, 1])
    const dungeon = RNG.weighted(["caves/caverns", "ruined settlement", "prison", "mine/quarry/excavation", "tomb/crypt/necropolis", "lair/den/hideout", "stronghold/fortress", "shrine/temple/sanctuary", "archive/laboratory", "origin unknown"], [1, 1, 1, 1, 1, 1, 1, 1, 1, 3])
    const type = RNG.pickone([ruin, dungeon])
    const short = RNG.pickone(type.split("/"))

    return {
      specifics: type,
      text: "Dungeon: " + short,
      siteType: type,
      scale: RNG.weighted([0, 1, 2, 3, 4], [4, 4, 2, 1, 1]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
      short,
    }
  },
  encounter(RNG, region) {
    let id = RNG.hash()
    const enc = region.encounter({
      id
    })

    return {
      id,
      siteType: "origin unknown",
      scale: RNG.weighted([1, 2, 3], [5, 4, 1]),
      essence: Essence(RNG),
      difficulty: enc.rank,
      hasJobs: enc.lair == "Camp",
      encounter : enc, 
      get short () { return this.encounter.short},
      get text () { return `${this.encounter.lair}: ${this.encounter.short}`}
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
import*as Names from "./names.js"
import {Site, Area} from "./site.js"
import {MarketUI} from "./marketplace.js"

class Region extends Area {
  constructor(app, opts={}) {
    super(app, opts);

    //check for plane  
    this._plane = opts.plane || null

    //set class
    this.class[0] = "region"

    //state that is saved 
    this.state = {
      portal: null,
      //people
      f: new Map(),
      //features
      claims: {}// faction assets 
    }

    //generates all data 
    //pull data from options to be used for generation 
    let {alignment=[], children=[]} = this.opts

    //establish seeded random 
    const RNG = new Chance(this.id)

    //alignment 
    this.alignment = RNG.pickone(alignment.concat(this.parent.alignment))
    //safety 
    Object.assign(this, Safety(RNG, {
      alignment: this.alignment
    }))

    //terrain, climate, altitude, moisture, biome
    CalculateBiome(this)
    //name 
    this._name = Names.Region(this.id, this.terrain)

    /*
      FEATURES 
      automatically generate the following
    */
    this.state.f.set(RNG.natural(), ["wilderness"])
    this.state.f.set(RNG.natural(), ["resource"])

    //number of features 
    let nF = SumDice("3d3", RNG) - 2
    //build random 
    BuildArray(nF, ()=>this.state.f.set(RNG.natural(), [null]))

    //overal size of the area 
    let size = this.children.reduce((sum,c)=>sum + c.size, 0)

    // cell rural population is suitability adjusted by szie, where size is 1 3mi hex ~ 5.8 sq mi  
    this.pop = Math.round(this.s * size * 5.8)
    //add people for every settlement 
    let nS = this.lookup("settlement").length
    if(nS == 0) {
      this.state.f.set(RNG.natural(), ["settlement"])
      nS++
    }
    BuildArray(nS, ()=>this.state.f.set(RNG.natural(), ["people"]))

    //set children - adds all features / people 
    this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))

    //get hex array
    this.setHex(this.size)

    //set PS
    PerilousShores(this)

    //return 
    return app.areas[this.id]
  }

  /*
    Get functions for region 
  */

  get plane() {
    return this._plane ? this._plane.split(",") : null
  }

  //parent handling of plane  
  get parent() {
    let {areas, poi} = this.app
    let {OuterPlanes, InnerPlanes} = poi

    return this.plane ? OuterPlanes[this.plane[0]] || InnerPlanes[this.plane[0]] : this._parent ? areas[this._parent] : null
  }

  get characters() {
    return this.app.explorers.filter(e=>e.location.region.id == this.id)
  }

  get portal() {
    let[rid,timing,key] = this.state.portal
    let location = this.app.areas[rid]
    timing = ["Permanent", "On a Schedule"][timing]
    key = ["physical", "nature", "action", "thought"][key]
    let short = [location.plane[0] + ", " + location.name, timing].join("; ")
    let text = ["Portal: ", short, "; key: ", key].join("")

    return {
      what : "portal",
      location,
      timing,
      key,
      short,
      text
    }
  }

  get claims() {
    return this.state.claims
  }

  //lookup child 
  lookup(what) {
    let F = this.app.factions
    return what != "faction" ? this.children.filter(c=>c.what == what) : Object.keys(this.claims).map(id=>F[id])
  }

  /*
    Generate Random based upon region 
  */

  random(gen, data) {
    let app = this.app
    let {generated} = app.state

    //handle an array of data 
    data = Array.isArray(data) ? chance.pickone(data) : data
    /*
      "wilderness" : ["Random Encounter","Explore","Get a Job","Generate a NPC"],
    "settlement" : ["Explore","Get a Job","Generate a NPC"]
    */
    if (gen == "Explore") {
      //generate an explore value 
      generated.push(["Explore", this.explore(data)])
      app.setState({
        generated
      })
    } else if (gen == "Get a Job") {
      generated.push(["Job", Quests.Jobs(null, this)])
      app.setState({
        generated
      })
    } else if (gen == "Generate a NPC") {
      generated.push(["NPC",this.NPC(data)])
      app.setState({
        generated
      })
    } else if (gen == "Random Encounter") {
      let enc = this.encounter({
        useLocal: true,
        data
      })
      generated.push(["Encounter",enc])
      app.setState({
        generated
      })
    } else if (gen == "New Portal") {
      this.portal = chance
      app.refresh()
    } else if (gen == "Remove Faction") {
      delete this.claims[data.id]
      app.refresh()
    } else if (gen == "Remove People") {
      //find what was selected and delete 
      let ppl = this.lookup("people")
      ppl.forEach(d=>this.state.f.delete(d.id))
      //update children 
      this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))
      app.refresh()
    } else if (gen == "Remove") {
      //find what was selected and delete 
      this.lookup(data.what).forEach(d=>this.state.f.delete(d.id))
      //update children 
      this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))
      //UI 
      app.refresh()
    } else if (gen == "View Market") {
      app.updateState("dialog", ["areas", this.id, "marketUI"].join("."))
    }
  }

  /*
    Mod features of a region  
  */

  add(what, o={}) {
    let {save=false} = o
    let id = o.id ? o.id : o.RNG ? o.RNG.natural() : chance.natural()

    //["People","Resource","Landmark","Hazard","Encounter","Dungeon"]
    if (what == "Faction") {
      this.app.updateState("show", this.app.state.show + ".AddFaction")
    } else if (what == "AddFaction") {
      let F = this.app.factions[o.id].addClaim(this)
      this.app.updateState("show", this.app.state.show.split(".").slice(0, 2).join("."))
    } else {
      this.state.f.set(id, [what.toLowerCase()])
    }

    if (save) {
      this.app.game.areas.add(this.id)
    }

    //set children 
    this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))

    //refresh UI 
    if (!["Faction", "AddFaction"].includes(what)) {
      this.app.refresh()
    }
  }

  rm(id) {
    this.state.f.delete(id)
    //set children 
    this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))
  }

  //add a feature to the region 
  genFeature(id=chance.natural(), what=null, o={}) {
    let res = null

    if (what == "people") {
      res = this.encounter({
        id,
        what: this._plane ? "Petitioner" : "Prime"
      })
      res.what = "people"
    } else {
      const RNG = new Chance(id)

      //always generate f 
      const fR = RNG.d12() + this._safety
      let f = fR <= 4 ? "encounter" : fR <= 7 ? "hazard" : fR <= 11 ? WeightedString("dungeon,landmark,resource/1,2,1") : "settlement"
      //use provided   
      f = what ? what : f

      //assign feature data 
      let data = Features[f](RNG, this, o)

      const _size = ["1d6+1", "1d8+7", "1d10+15", "1d12+25", "2d8+36"]
      //get site 
      res = Object.assign(data, {
        id,
        what: f,
        parent: this,
        size: SumDice(_size[data.scale], RNG)
      })
    }

    return res
  }

  addSite(what) {
    let opts = {
      id: what.id,
      parent: this.id,
      scale: what.scale == 4 ? 0 : what.scale,
      type: what.siteType
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

  /*
    Save and Load 
  */

  save() {
    let data = {
      gen: "Region",
      opts: Object.assign({}, this.opts, {
        name: this.name
      }),
      state: this.state
    }

    DB.setItem(this.id, data)
  }

  static async load(app, id, Gen) {
    //load state 
    let {opts, state} = await DB.getItem(id)
    opts.id = id
    //if it doesn't exist create it 
    let R = app.areas[id] || new Gen(app,opts)
    Object.assign(R.state, state)
    //update feature map 
    R.state.f = new Map(state.f)
    //update children
    R.children = [...R.state.f.entries()].map(([key,val])=>R.genFeature(key, ...val))

    return R
  }

  /*
    Portals 
  */

  set portal(RNG=chance) {
    let _parent = this._plane ? this.parent.portals || [this.parent.name, "Outlands", "Astral"].join() + "/3,2,1" : "Inner,Outer,Ethereal,Outlands,Astral/2,2,1,1,1"
    //parent portals  
    let parent = RNG.bool() ? WeightedString(_parent, RNG) : this.plane ? this.plane[0] : RNG.pickone(["Outer", "Inner", "Astral"])
    //get portal 
    let where = this.opts.portals ? RNG.pickone([parent, WeightedString(this.opts.portals, RNG)]) : parent
    //check for random plane 
    where = ["Outer", "Inner"].includes(where) ? RNG.pickone(Object.keys(this.app.poi[where + "Planes"])) : where

    //take the plane and pick a region within 
    let region = RNG.pickone(this.app.planes.find(p=>p.name == where).children)
    let location = [region.plane[0], region.name].join(", ")

    let timing = RNG.pickone([0, 1])
    let key = RNG.weighted([0, 1, 2, 3], [4, 1, 2, 1])

    this.state.portal = [region.id, timing, key]
  }

  explore (where) {
    let Gen = this.app.gen
    let _where = where.what ? where.what : where.class[0]
    let diff = where.difficulty || null
    return Gen.Rewards(this, Quests.Exploration(_where, this._safety, diff))
  }

  /*
    Encounter  
  */

  encounter(o={}) {
    let RNG = new Chance(o.id || chance.hash())

    //use local encounters 
    let local = this.lookup("encounter").map(e=>e.encounter).concat(this.lookup("people"))
    if (o.useLocal && local.length > 0 && Likely(85, RNG)) {
      return RNG.pickone(local)
    }

    //pull encounter from parent plane - always Planar, Petitioner, Beast... 
    let {encounters={}} = this.parent
    let base = encounters.base ? encounters.base : "Beast,Monster,Celestial,Fiend,Elemental/30,20,20,20,10"

    //base inital result on safety 
    //all encounters build a list of types of creatures 
    let what = o.what ? o.what : Likely(30 + (this._safety * 10), RNG) ? WeightedString("Planar,Petitioner/25,75", RNG) : WeightedString(base, RNG)
    //see if encounters provides a specific rarity string 
    let str = encounters[what]

    let opts = Object.assign(o,{
      what,
      str
    })

    //set basic result
    return Encounter(opts)
  }

  NPC(o={}) {
    let RNG = new Chance(o.id || chance.hash())
    o.trade = o.trade || "random"
    
    //use local encounters 
    let local = this.lookup("encounter").map(e=>e.encounter).concat(this.lookup("people"))
    let lData = local.length > 0 && Likely(85, RNG) ? RNG.pickone(local).data.slice() : null
    
    let npc = this.encounter(Object.assign({},o))
    //reasign data and profession if picked from base 
    if(!o.what && lData){
      let prof = npc.data[4]
      npc.data = lData.slice()
      npc.data[0] = o.id || RNG.seed
      npc.data[3] = o.rarity === undefined ? npc.data[3] : o.rarity
      npc.data[4] = prof
    }
    
    return npc
  }

  /*
    UI / UX 
  */

  get marketUI() {
    return MarketUI(this)
  }

  //supports UI by pulling a list of viewable features 
  view() {
    let html = this.app.html
    let {mode, known} = this.app.game
    const isKnown = this.children.filter(c=>mode == "Builder" || known.has(c.id) || 'wilderness,settlement,people'.includes(c.what)).map(c=>c.id)

    //Make a format for dropdown options - optins,text,data 
    let res = []
    this.lookup("wilderness").forEach(c=>res.push(["Wilderness", [c]]))
    res.push([this.portal.text, [this.portal]])

    //always add settlement / people data 
    let sHtml = html`
    <div>Settlements</div>
    <div class="mh2">People: ${this.lookup("people").map(p=>p.short).join(", ")}</div>`
    res.push([sHtml, this.lookup("settlement")])

    //pull for display - but don't show what isn't known 
    let f = ["resource", "landmark", "hazard", "encounter", "dungeon", "faction"]
    f.forEach(w=>{
      let feature = this.lookup(w).filter(c=>isKnown.includes(c.id))
      if (["resource", "landmark", "hazard", "encounter"].includes(w) && feature.length > 0) {
        res.push([capitalize(w) + ": " + feature.map(c=>c.short).join(", "),feature])
      } else {
        feature.forEach(c=>res.push([c.text, [c]]))
      }
    }
    )

    return {
      isKnown,
      features: res
    }
  }

  ExplorerUI() {
    let {html, game} = this.app
    let {show,toGenerate} = this.app.state
    let view = show.split(".")

    let {isKnown, features} = this.view()

    //ui for each explorer 
    const explorer = (e)=>html`
    <div class="flex items-center justify-between pa1 bb">
      <div class="dropdown">
        <div class="${e.regionOptions.length > 0 ? "bg-green" : "bg-gray"} br2 pointer b white underline-hover pa1 ph2">${e.name}</div>
        <div class="dropdown-content bg-white ba bw1 pa1">
          ${e.regionOptions.map(o=> html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>e.regionAct(o)}>${o[1]}</div>`)}
        </div>
      </div>
      <div>@ ${e.location.atFeature.text}</div>
      <div>${e.coin}g / ${e.health}♥</div>
    </div>
    `

    const header = html`
    <h3 class="ma0 mh1">${this.name}, ${this.terrain}, ${this.alignment} [${this.safety}]</h3>
    <div class="mh2">
      ${this.characters.map(explorer)}
    </div>
    `

    return {
      header,
      features
    }
  }

  BuilderUI() {
    let {html, game, activeFactions} = this.app
    let {show,toGenerate} = this.app.state
    let view = show.split(".")

    //create feature options 
    const options = {
      "wilderness" : ["Random Encounter", "Explore"],
      "portal" : ["New Portal"],
      "settlement" : ["View Market", "Explore", "Get a Job", "Generate a NPC", "Remove People"],
      "faction" : ["Explore", "Get a Job", "Generate a NPC", "Remove Faction"]
    }

    let {isKnown, features} = this.view()
    features.forEach(f => {
      let what = f[1][0].what
      f.push(options[what] || ["Random Encounter", "Explore", "Remove"])
    })

    
    //things to add to the region 
    const addTo = ["People", "Resource", "Landmark", "Hazard", "Encounter", "Dungeon", "Faction"]

    const header = html`
    <div class="flex items-center ma1">
      <div class="dropdown">
        <div class="flex items-center pointer underline-hover">
          <span class="f5 link dim dib bg-gray white tc br2 mh1 pa1 ph2">✎</span><h3 class="ma0 mh1">${this.name}, ${this.terrain}, ${this.alignment} [${this.safety}]</h3>
        </div>
        <div class="f4 dropdown-content bg-white ba bw1 pa1">
          <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.save("areas", this.id)}>Save</div>
          ${addTo.map(a=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.add(a, {
      save: true
    })}>Add ${a}
          </div>`)}
        </div>
      </div>   
    </div>
    ${view[2] != "AddFaction" ? "" : html`
    <div class="flex mh2">
      <select class="pa1 w-100" value=${toGenerate} onChange=${(e)=>this.app.updateState("toGenerate", e.target.value)}>
        ${activeFactions.map(f=>html`<option value=${f.id}>${f.name}</option>`)}
      </select>
      <div class="pointer white hover-red link dim dib bg-gray tc pa1" onClick=${()=>this.add("AddFaction", {
      id: toGenerate,
      save: true
    })}>Add
      </div>
      <div class="pointer white hover-red link dim dib bg-gray tc pa1" onClick=${()=>this.app.updateState("show", view.slice(0, 2).join("."))}>Cancel</div>
    </div>`}
    `

    return {
      header,
      features
    }
  }

  UI() {
    console.log(this)

    let {html, activeFactions, game} = this.app
    let {generated, show, toGenerate} = this.app.state
    let {header, features} = game.mode == "Explorer" ? this.ExplorerUI() : this.BuilderUI()
    let view = show.split(".")

    //splice generated objects 
    const GenSplice = (i)=>{
      generated.splice(i, 1)
      this.app.updateState("generated", generated)
    }

    //svg div 
    const svg = html`
    <svg id="map" height="600px" width="600px" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
      <g id="hex"></g>
    </svg>
    `

    const Build = (opts,data)=>html`
    <div class="dropdown-content bg-white ba bw1 pa1">
      ${opts.map(o=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.random(o, data)}>${o}</div>`)}
    </div>
    `

    //handle drowdown for every features 
    const dropdown = ([text,data,opts])=>html`
    <div class="pointer dropdown f5 mv1">
      <div class="flex items-center">
        <div class="f6 white link dim dib bg-gray tc br2 pa1" style="min-width:45px;"><span class="hex-marker">⬢</span></div>
        <div class="mh1">${text}</div>
      </div>
      ${game.mode == "Explorer" ? "" : Build(opts, data)}
    </div>
    `

    //return final UI 
    return html`
    <div class="overflow-auto flex flex-wrap justify-center items-start">
      <div class="bg-white-70 br2 mw6 h-100 mh2 pa1">
        <h2 class="pointer underline ma0 mv2" onClick=${()=>this.app.show = "Planes"}>${this.parent.name}${this.opts.layer && this.opts.layer != this.parent.name ? " :: " + this.opts.layer : ""}</h2>
        ${header}
        <div class="ma2">${features.map(dropdown)}</div>
        ${generated.length > 0 ? html`<h3 class="mh2 mv0">Generated</h3>` : ""}
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

export {Area, Site, Region}
