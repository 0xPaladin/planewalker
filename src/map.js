const chance = new Chance()
const rInt = (RNG,min,max)=>RNG.integer({
  min,
  max
})
const sumDice = (RNG,dice)=>RNG.rpg(dice, {
  sum: true
})
/*
  Use Honeycomb for Hex tools 
*/
import {Grid,RandomGrid,Chain} from "./hex.js"

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
const Terrain = (seed,primary,hex)=>{
  const RNG = new Chance(seed)
  const T = [];

  const hexIds = hex.toArray().map(({q, r})=> [q,r].join(",")) 
  //Divide hexes along terrains : 40,30,20,10 
  // get primary terrain 
  const [pids,remains] = primary == "water" ? Chain(RNG,hexIds,40) : RNG.bool() ? Chain(RNG,hexIds,40) : [[],hexIds]
  //shuffle remaining terrains and ids 
  const terrain = [40,30,20,10].map((n,i) => Array.from({length:n},()=> i==0 ? primary : i != 3 ? TerrainTypes[primary][i-1] : RNG.pickone(TerrainTypes[primary][2]))).flat()
  const byId = pids.concat(RNG.shuffle(remains))

  //track roughness 
  const rough = {
    "water": [],
    "rough": [],
    "forest": [],
    "easy": []
  }
  
  byId.forEach((qr,i)=>{
    let t = terrain[i]
    let s = t == "water" ? "" : RNG.pickone(TerrainSymbols[t])
    let symbol = s != "" ? ["relief", s[0], RNG.pickone(s.slice(1))].join("-") : ""
    //number of symbol placement 
    let nsp = ["forest", "plains", "swamp"].includes(t) ? rInt(RNG, 5, 15) : t == "water" ? 0 : 1
    let jitter = Array.from({
      length: nsp
    }, ()=>[rInt(RNG, -20, 20), rInt(RNG, -20, 20)])

    //set terrain to hex 
    const h = hex.getHex(qr.split(",").map(Number))
    h.terrain = {
      type : t,
      sub: RNG.d100(),
      symbol,
      jitter,
    } 
    T.push(h.terrain)
    
    //track hex rough terrain 
    if (rough[t]) {
      rough[t].push(qr)
    } else if (["mountains", "desert", "swamp"].includes(t)) {
      rough.rough.push(qr)
    } else {
      rough.easy.push(qr)
    }
  }
  )

  return [T,rough]
}

/*
  Features 
*/
import Encounters from "./encounters.js"

const Features = {
  landmark (RNG) {
    return "Landmark: "+RNG.weighted(["oddity","plant/tree-based","earth/rock-based","water-based","faction-based","megalith/obelisk/statue"],[1,3,3,2,1,1])
  },
  ruin (RNG) {
    return "Ruin: "+RNG.weighted(["tomb/crypt/necropolis","shrine/temple","mine/quarry/excavation","ancient outpost","ancient settlement"],[2,4,2,2,2])
  },
  resource (RNG) {
    const type = RNG.weighted(["game/hide/fur","timber/clay","herb/spice/dye","copper/tin/iron","silver/gold/gems"],[3,2,2,2,1])
    const special = RNG.d100()
    return "Resource: "+type
  },
  outpost (RNG) {
    return RNG.weighted(["tollhouse/checkpoint","meeting/trading post","camp/roadhouse/inn","tower/fort/base"],[2,3,3,1])
  },
  hazard (RNG) {
    return "Hazard: "+RNG.weighted(["tectonic/volcanic","unseen pitfall (chasm, crevasse, abyss, rift)","ensnaring (bog, mire, tarpit, quicksand, etc.)","defensive (trap created by local creature /faction)","meteorological (blizzard, thunderstorm, sandstorm, etc.)","seasonal (fire, flood, avalanche, etc.)","impairing (mist, fog, murk, gloom, miasma, etc.)"],[1,2,2,1,3,1,1])
  },
  obstacle (RNG) {
    return "Obstacle: "+RNG.weighted(["defensive (barrier created by local creature /faction)","impenetrable (cliff, escarpment, crag, bluff, etc.)","penetrable (dense forest/jungle, etc.)","traversable (river, ravine, crevasse, chasm, abyss, etc.)"],[2,3,3,3])
  },
  area (RNG) {
    let type = RNG.pickone(["obstacle","hazard"])
    return "Large Area "+Features[type](RNG)
  },
  dungeon (RNG) {
    return "Dungeon: "+RNG.weighted(["caves/caverns","ruined settlement","prison","mine","crypt/tomb","lair/den/hideout","stronghold/fortress","temple/sanctuary","archive/laboratory","origin unknown"],[1,1,1,1,1,1,1,1,1,3])
  },
  faction (RNG) {
    //https://mojobob.com/roleplay/monstrousmanual/
    const sigil = ["Athar","Believers of the Source","Bleak Cabal","Doomguard","Dustmen","Fated","Fraternity of Order","Free League","Harmonium","Mercykillers","Revolutionary League","Sign of One","Society of Sensation","Transcendent Order","Xaositects"]
    const planars = ["Aasimon","Archon","Baatezu","Eladrin","Gehreleth","Guardinal","Modrons","Rilmani","Slaad","Tanar'ri","Yugoloth"]
    return RNG.pickone( RNG.bool() ? sigil : planars)+" Outpost"
  },
  creature (RNG) {
    let C = Encounters.Random(RNG)
    return C.lair+": "+C.what
  },
  lair (RNG) {
    return Features.creature(RNG)
  },
  random (seed,i,safety) {
    const RNG = new Chance([seed,"feature",i].join("."))

    const fR = RNG.d12() + safety
    let f = fR <= 4 ? "creature" : fR <= 7 ? ["hazard", "obstacle", "area"][fR - 5] : fR <= 11 ? "site" : fR == 12 ? "faction" : "settlement"
    //get sub 
    if (f == "site") {
      f = RNG.pickone(["dungeon", "lair", "ruin", "outpost", "landmark", "resource"])
    }
    const what = f == "lair" ? "creature" : f == "obstacle" ? "hazard" : f

    return {
      i,
      what,
      text : Features[f] ? Features[f](RNG) : f 
    }
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
    let _f = Features.random(seed,F.length,safety)
    //pick hex id 
    let id = ["settlement","outpost"].includes(_f.what) ? pickId("easy") : pickId()
    places[id] = _f
    F.push(_f)
  }
}

/*
  Handle generation of sub features 
*/
import {Site} from "./site.js"

const ShowSub = (app,what) => {
  const {region} = app
  //generate site 
  const seed = [region.seed,what.what,what.i].join(".")
  let site = what.site = Site(seed)
  app.site = what
  //set terrain
  site[0].hex.forEach(h => h.terrain = {type:what.what})
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
  site[0].hex.forEach((hex,i)=> {
    RenderHex(app, hex, g)
    g.text("#"+(i+1)).move(hex.x, hex.y).addClass('dText')
  })
  
  //move to center 
  const box = g.bbox()
  let x = (-box.x)
  let y = (-box.y)
  g.attr({
    "transform": "translate(" + x + "," + y + ")"
  })

  //set view 
  app.setView("Hex.Site")
}

/*
  Generate Region  
*/
//generate random hex region 
const MakeRegion = (o)=>{
  let {seed=chance.integer(), primary, n, places={}, alignment} = o
  const RNG = new Chance(seed)
  primary = primary || RNG.pickone(Object.keys(TerrainTypes))

  //safety 
  const safety = Safety(seed, alignment)

  //ten by ten grid - 100 hexes each 3 miles across 
  const hex = Grid(10,10)
  const [terrain,rough] = Terrain(seed, primary, hex)

  //number of features 
  let nF = sumDice(RNG, "6d3")
  //add features to places 
  SetFeatures(seed, nF, safety._safety, rough, places)

  return Object.assign({}, safety, {
    seed,
    n,
    hex,
    primary,
    terrain,
    places,
    rough,
    encounter : Encounters.Random,
    ShowSub
  })
}

/*
  Rendering UI 
*/

const RenderHex = (app,hex,g)=>{
  // create a polygon from a hex's corner points
  const polygon = g.polygon(hex.corners.map(({x, y})=>`${x},${y}`)).addClass('hex').addClass(hex.terrain.type).data({
    hex
  }).click(function() {
    app.setHex(this.data('hex'))
  })
}

const RenderTerrain = (hex,i,g)=>{
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

const RenderPlaces = (app, hex,i,g,places)=>{
  let {q, r, x, y} = hex
  //add places 
  let _place = places[[q, r].join(",")]
  if (_place) {
    let p;

    if (["settlement", "outpost", "city"].includes(_place.what)) {
      let sz = 50
      //position 
      let px = x - sz / 2
        , py = y - sz / 2
      p = g.image(_place.what + '.png').addClass('place').size(sz, sz).move(px, py)
    } else if (Symbols[_place.what]) {
      let sz = 25
      //position 
      let px = x - sz / 2
        , py = y - sz / 2

      p = g.group()
      p.circle(sz).addClass('place ' + _place.what).move(px, py)
      p.use(Symbols[_place.what]).addClass('place ' + _place.what).size(sz, sz).move(px, py)
    } else {
      //its a feature
      let sz = 10
      //position 
      let px = x - sz / 2
        , py = y - sz / 2
      p = g.use(Symbols["map-point"]).addClass('place ' + _place.what).size(sz, sz).move(px, py)
    }

    //enable picking 
    p.click(function() {
      app.setHex(hex)
    })
  }
}

//5 miles per hex 
const DisplayRegion = (app)=>{
  //get hex group 
  const g = app.hex = SVG('#hex')
  //empty hex 
  g.find(".hex").forEach(h=>h.remove())
  g.find(".relief").forEach(h=>h.remove())
  g.find(".place").forEach(h=>h.remove())
  //new grid 
  const region = app.region = MakeRegion(app.state.region)

  //display - three times for layering 
  region.hex.forEach((hex,i)=>RenderHex(app, hex, g, region.places))
  region.hex.forEach((hex,i)=>RenderTerrain(hex, i, g, region.places))
  region.hex.forEach((hex,i)=>RenderPlaces(app,hex, i, g, region.places))

  //screen position 
  console.log(region)
  app.setState({region:app.state.region})
  //size svg 
  let hbox = g.bbox()
  SVG('#submap').size(hbox.width, hbox.height)
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
      app.setRegion(_poi,true)
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

export {ShowOutlands, DisplayRegion, Resize}

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
