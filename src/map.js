/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, chance} from "./random.js"
/*
  Use Honeycomb for Hex tools 
*/
import {MakeGrid, BaseHex, Chain} from "./hex.js"

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
  "forest": [["deciduous", 2, 3], ["conifer", 2], ["acacia", 2]],
  "hills": [["hill", 2, 3, 4, 5]],
  "mountains": [["mount", 2, 3, 4, 5, 6], ["mountSnow", 1, 2, 3, 4, 5, 6], ["vulcan", 1, 2, 3]]
}
//palm,2, coniferSnow,1

//generate terrains based on a parent terrain 
const Terrain = (seed,primary,ids)=>{
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
    let s = t == "water" ? "" : RNG.pickone(TerrainSymbols[t])
    let symbol = s != "" ? ["relief", s[0], RNG.pickone(s.slice(1))].join("-") : ""
    //number of symbol placement 
    let nsp = ["forest", "plains", "swamp"].includes(t) ? RandBetween(5, 15, RNG) : t == "water" ? 0 : 1
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
import Encounters from "./encounters.js"
import * as Details from "./data.js"

const Features = {
  special (RNG) {
    const type = RNG.weighted(['element','magic','aspect'],[3,2,1])
    const what = RNG.pickone(Details[type])
    return [type,what]
  },
  hazard(RNG) {
    const site = RNG.weighted(["tectonic/volcanic", "unseen pitfall (chasm, crevasse, abyss, rift)", "ensnaring (bog, mire, tarpit, quicksand, etc.)", "defensive (trap created by local creature /faction)", "meteorological (blizzard, thunderstorm, sandstorm, etc.)", "seasonal (fire, flood, avalanche, etc.)", "impairing (mist, fog, murk, gloom, miasma, etc.)"], [1, 2, 2, 1, 3, 1, 1])
    //special nature 
    const sp = Likely(10) ? Features.special(RNG) : null
    
    return {
      site,
      text : "Hazard: " + site,
      sub: "hazard",
      sz : RNG.weighted([2,3,4],[5,4,1]),
      sp,
      tags : sp ? [sp] : []
    }
  },
  obstacle(RNG) {
    const site = RNG.weighted(["defensive (barrier created by local creature /faction)", "impenetrable (cliff, escarpment, crag, bluff, etc.)", "penetrable (dense forest/jungle, etc.)", "traversable (river, ravine, crevasse, chasm, abyss, etc.)"], [2, 3, 3, 3])
    //special nature 
    const sp = Likely(10) ? Features.special(RNG) : null
    
    return {
      text : "Obstacle: " + site,
      site,
      sub: "obstacle",
      sz : RNG.weighted([1,2,3],[5,4,1]),
      sp,
      tags : sp ? [sp] : []
    }
  },
  area(RNG) {
    let what = Features[RNG.pickone(["obstacle", "hazard"])](RNG)

    //generate site 
    let _s = Site(RNG.seed)
    
    return Object.assign(what,{
      text : "Large Area " + what.text,
      sz : _s.sz 
    }) 
  },
  landmark(RNG) {
    const site = RNG.weighted(["oddity", "plant/tree-based", "earth/rock-based", "water-based", "faction-based", "megalith/obelisk/statue"], [1, 3, 3, 2, 1, 1])
    //special nature 
    const sp = Likely(10) ? Features.special(RNG) : null
    
    return {
      site,
      text : "Landmark: " + site,
      sz : RNG.weighted([1,2,3],[5,4,1]),
      sp,
      tags : sp ? [sp] : []
    }
  },
  resource(RNG) {
    const site = RNG.weighted(["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"], [3, 2, 2, 2, 1])
    //special nature 
    const sp = Likely(10) ? Features.special(RNG) : null
    
    //generate site 
    let _s = Site(RNG.seed)
    
    return {
      site,
      text : "Resource: " + site,
      res : RNG.d100(),
      sz : _s.sz, 
      sp,
      tags : sp ? [sp] : []
    }
  },
  ruin(RNG) {
    const site = RNG.weighted(["tomb/crypt/necropolis", "shrine/temple", "mine/quarry/excavation", "ancient outpost", "ancient settlement"], [2, 4, 2, 2, 2])

    //generate site 
    let _s = Site(RNG.seed)

    return {
      site,
      text : "Ruin: " + site,
      sz : _s.sz,
    }
  },
  dungeon(RNG) {
    const site = RNG.weighted(["caves/caverns", "ruined settlement", "prison", "mine", "crypt/tomb", "lair/den/hideout", "stronghold/fortress", "temple/sanctuary", "archive/laboratory", "origin unknown"], [1, 1, 1, 1, 1, 1, 1, 1, 1, 3])

    //generate site 
    let _s = Site(RNG.seed)
    
    return {
      site,
      text : "Dungeon: " + site,
      sz : _s.sz,
    }
  },
  creature(RNG) {
    const {lair, short} = Encounters.Random(RNG)
    
    return {
      text : lair + ": " + short,
      who: short,
      hasJobs : lair == "Camp",
      sz : RNG.weighted([2,3,4],[5,4,1])
    }
  },
  lair(RNG) {
    //add site 
    return Object.assign(Features.creature(RNG))
  },
  outpost(RNG) {
    const who = RNG.weighted(["tollhouse/checkpoint", "meeting/trading post", "camp/roadhouse/inn", "tower/fort/base"], [2, 3, 3, 1])
    const text = "Outpost: " + who
    return {
      text,
      who
    }
  },
  faction(RNG) {
    //https://mojobob.com/roleplay/monstrousmanual/
    const sigil = ["Athar", "Believers of the Source", "Bleak Cabal", "Doomguard", "Dustmen", "Fated", "Fraternity of Order", "Free League", "Harmonium", "Mercykillers", "Revolutionary League", "Sign of One", "Society of Sensation", "Transcendent Order", "Xaositects"]
    const planars = ["Aasimon", "Archon", "Baatezu", "Eladrin", "Gehreleth", "Guardinal", "Modrons", "Rilmani", "Slaad", "Tanar'ri", "Yugoloth"]
    const who = RNG.pickone(RNG.bool() ? sigil : planars)
    const text = "Enclave: " + who
    return {
      text,
      who
    }
  },
  settlement(RNG, safety=0, a="neutral") {
    const r = RNG.d12() + safety
    const who = r < 5 ? "Hamlet" : r < 8 ? "Village" : r < 10 ? "Keep" : r < 12 ? "Town" : "City"

    //based of parent alignment
    const alignment = RNG.weighted(...Aligment[a])

    const text = who + " [" + alignment + "]"
    return {
      text,
      who
    }
  },
  random(seed, i, safety) {
    const RNG = new Chance([seed, "feature", i].join("."))

    const fR = RNG.d12() + safety
    let f = fR <= 4 ? "creature" : fR <= 7 ? ["hazard", "obstacle", "area"][fR - 5] : fR <= 11 ? "site" : fR == 12 ? "faction" : "settlement"
    //get sub 
    if (f == "site") {
      f = RNG.pickone(["dungeon", "lair", "ruin", "outpost", "landmark", "resource"])
    }
    const what = f == "lair" ? "creature" : f == "obstacle" ? "hazard" : f
    const data = Features[f] ? Features[f](RNG, safety) : {
      text: f
    }

    //base Difficulty
    let diff = Difficulty(RNG)

    return Object.assign({
      i,
      what,
      diff
    }, data)
  }
}

const SetFeatures = (seed,n,safety=0,rough,places)=>{
  const RNG = new Chance(seed)
  const F = []

  //create an Array of all available hex ids 
  let hexAll = rough.water.concat(rough.rough, rough.forest, rough.easy)
  Object.keys(places).forEach(id=>hexAll.splice(hexAll.indexOf(id), 1))

  const pickId = (from="all")=>{
    //picks from if it exists 
    let id = from == "all" ? RNG.pickone(hexAll) : RNG.pickone(rough[from] || hexAll)
    //remove from choices 
    let i = hexAll.indexOf(id)
    //loop 
    if (i == -1) {
      return pickId(from)
    } else {
      hexAll.splice(i, 1)
      return id
    }
  }

  while (F.length < n) {
    let _f = Features.random(seed, F.length, safety)
    //pick hex id 
    let id = ["settlement", "outpost"].includes(_f.what) ? pickId("easy") : pickId()
    places[id] = _f
    F.push(_f)
  }
}

/*
  Handle generation of sub features 
*/
import {Site} from "./site.js"
/*
  Enable jobs and quests 
*/
import*as Quests from "./quests.js"

/*
  Core Class for a Region 
  Generates from options 
*/

class Region {
  constructor(app, o={}) {
    //link to app 
    this.app = app

    //ten by ten grid - 100 hexes each 3 miles across 
    //creates .hex and .ids 
    Object.assign(this, BaseHex)

    //pull data from options to be used for generation 
    let {seed=chance.integer(), primary, alignment=["neutral"], places={}} = o
    //establish seeded random 
    const RNG = new Chance(seed)

    //save seed 
    this.seed = seed
    //primary terrain 
    this.primary = primary || RNG.pickone(Object.keys(TerrainTypes))
    //create terrain - .terrain and .rough 
    Object.assign(this, Terrain(this.seed, this.primary, this.ids))

    //safety 
    Object.assign(this,Safety(this.seed, alignment)) 

    //number of features 
    let nF = SumDice("6d3", RNG)
    //add features to places 
    SetFeatures(this.seed, nF, this.safety._safety, this.rough, places)
    this.places = places
  }

  //get people inhabiting region 
  get creatures () {
    return Object.entries(this.places).reduce((ppl,[qr,p])=>{
      if (["creature", "lair","faction"].includes(p.what)) {
        ppl.push(qr)
      } 
      return ppl
    }
    , [])
  }
  
  get people() {
    return Object.entries(this.places).reduce((ppl,[qr,p])=>{
      if (["outpost", "settlement", "city", "faction"].includes(p.what)) {
        ppl.push(qr)
      } else if (["creature", "lair"].includes(p.what) && p.hasJobs) {
        ppl.push(qr)
      }
      return ppl
    }
    , [])
  }

  //get sites for exploration and uses for jobs 
  get sites() {
    return Object.entries(this.places).reduce((s,[qr,p])=>{
      if (["hazard", "obstacle", "area", "dungeon", "ruin", "landmark", "resource"].includes(p.what)) {
        s.push(qr)
      }
      return s
    }
    , [])
  }

  //get tags for a chosen hex 
  getTags (qr) {
    let i = this.ids.indexOf(qr)
    let terrain = this.terrain[i]
    let place = this.places[qr]

    return [terrain.type].concat(place ? place.tags || [] : [])
  }

  newExplore(hex) {
    //generate an explore value 
    return ["Explore",Quests.SetExplore(hex)]
  }

  encounter({place}) {
    let makeObj = (short) => {
      return {short}
    }
    
    //get available creatures 
    let c = chance.pickone(this.creatures)
    //set basic result - with random 
    let E = ["Encounter",c.length > 0 && chance.bool() ? makeObj(this.places[c].who) : Encounters.Random()]
    
    if(place){
      if(["creature", "lair", "faction"].includes(place.what)){
        E[1] = makeObj(place.who)
      }
    }
       
    return E
  }

  job({place}) {
    return ["Job",Quests.Jobs(this, place)]
  }

  showSub(qr) {
    const what = this.places[qr]
    //generate site 
    const seed = [this.seed, what.what, what.i].join(".")
    let site = what.site = Site(seed)
    this.app.site = what
    //set terrain
    site[0].hex.forEach(h=>h.terrain = {
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
    site[0].hex.forEach((hex,i)=>{
      RenderHex(app, hex, g)
      g.text("#" + (i + 1)).move(hex.x, hex.y).addClass('dText')
    }
    )

    //move to center 
    const box = g.bbox()
    let x = (-box.x)
    let y = (-box.y)
    g.attr({
      "transform": "translate(" + x + "," + y + ")"
    })

    //set view 
    this.app.setView("Hex.Site")
  }

  //hex for display 
  get dHex () {
    return this.ids.map((qr,i) => {
      let hex = this.hex.getHex(qr.split(",").map(Number))
      let {x,y} = hex
      let terrain = this.terrain[i]
      let place = this.places[qr]
      
      return {hex,x,y,qr,i,terrain,place}
    })
  }

  display() {
    //get hex group 
    const g = SVG('#hex')
    //empty  
    let d = [".hex",".relief",".place"]
    d.forEach(w => g.find(w).forEach(c => c.remove()))

    //display - three times for layering 
    let dHex = this.dHex
    dHex.forEach(hex=>RenderHex(hex, g, this.app))
    dHex.forEach(hex=>RenderTerrain(hex, g))
    dHex.forEach(hex=>RenderPlaces(hex, g, this.app))

    //screen position 
    console.log(this)
    this.app.setState({
      region: this.app.state.region
    })
    //size svg 
    let hbox = g.bbox()
    SVG('#submap').size(hbox.width, hbox.height)
  }
}

/*
  Rendering UI 
*/

const RenderHex = (hex,g,app)=>{
  // create a polygon from a hex's corner points
  const polygon = g.polygon(hex.hex.corners.map(({x, y})=>`${x},${y}`)).addClass('hex').addClass(hex.terrain.type).data({
    hex
  }).click(function() {
    let qr = this.data('hex').qr
    app.setHex(qr)
  })
}

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

const Resize = (app)=>{
  const groups = [app.map]
  //get to the middle - x only 
  const svgSize = [window.innerWidth, window.innerHeight]
  //map and hex reposition 
  groups.forEach(g=>{
    const box = g.bbox()
    let x = (-box.x) + (svgSize[0] - box.width) / 2;
    let y = (-box.y) + (svgSize[1] - box.height) / 2;
    g.attr({
      "transform": "translate(" + x + "," + y + ")"
    })
  }
  )
}

//import poi 
import {POI} from "./poi.js"

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
      app.setRegion(_poi, true)
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

export {ShowOutlands, Resize, Region}

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
