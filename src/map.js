const chance = new Chance()
const rInt = (RNG,min,max) => RNG.integer({min,max})
/*
  Honeycomb
  https://abbekeultjes.nl/honeycomb/
*/
import "../lib/honeycomb-grid.min.js"

const {defineHex, Grid, rectangle} = Honeycomb
const Neighboors = [[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]]

// 1. Create a hex class:
const Hex = Honeycomb.defineHex({
  dimensions: 30,
  origin: 'topLeft'
})

//create a random grid based upon picking random Neighboors
const RandomGrid = (seed = chance.integer(),n) => {
  const RNG = new Chance(seed)   
  n = 10 + RNG.rpg('2d20',{sum:true})
  
  const ids = ["0.0"]

  while (ids.length < n) {
    //pick Neighboor 
    const _N = RNG.pickone(Neighboors)
    //pick hex - split to xy and then add Neighboor 
    const qr = RNG.pickone(ids).split(".").map((v,j) => Number(v)+_N[j]).join(".")
    //check if exists 
    if(!ids.includes(qr)){
      //if not push to ids and set to last 
      ids.push(qr)
    }
  }

  return new Grid(Hex, ids.map(id => id.split(".").map(Number))) 
}

/*
  Terrain generation 
*/
const TerrainTypes = {
  "water" : ["plains","forest",["swamp","desert","hills"]],
  "swamp" : ["plains","forest",["water"]],
  "desert" : ["hills","plains",["water","mountains"]],
  "plains" : ["forest","hills",["water","swamp","desert"]],
  "forest" : ["plains","hills",["water","swamp","mountains"]],
  "hills" : ["mountains","plains",["water","desert","forest"]],
  "mountains" : ["hills","forest",["desert"]]
}

//Terrain Symbols
const TerrainSymbols = {
  "water" : [],
  "swamp" : [["swamp",2,3]],
  "desert" : [["dune",2],["cactus",1,2,3],["deadTree",1,2]],
  "plains" : [["grass",2]],
  "forest" : [["deciduous",2,3],["conifer",2],["acacia",2]],
  "hills" : [["hill",2,3,4,5]],
  "mountains" : [["mount",2,3,4,5,6],["mountSnow",1,2,3,4,5,6],["vulcan",1,2,3]]
}
//palm,2, coniferSnow,1
const AddSymbols = (seed,T) => {
  const RNG = new Chance(seed)
  T.forEach(t => {
    if(t.type == "water") {
      t.jitter = []
      return 
    }
    
    const s = RNG.pickone(TerrainSymbols[t.type])
    t.symbol = ["relief",s[0],RNG.pickone(s.slice(1))].join("-")
    //number of placement 
    let np = ["forest","plains","swamp"].includes(t.type) ? rInt(RNG,5,15) : 1
    t.jitter = Array.from({length:np},()=>[rInt(RNG,-20,20),rInt(RNG,-20,20)])
  })
  return T
}

//generate terrains based on a parent terrain 
const Terrain = (seed, parent, n) => {
  const RNG = new Chance(seed)
  const T = [];

  while(T.length < n){
    const ti = RNG.weighted([-1,0,1,2],[12,9,6,3])
    const type = ti == -1 ? parent : ti == 2 ? RNG.pickone(TerrainTypes[parent][ti]) : TerrainTypes[parent][ti]
    T.push({
      type,
      sub : RNG.d100()
    })
  }

  return AddSymbols(seed,T)
}

//generate random hex region 
const MakeRegion = (o) => {
  let {seed = chance.integer(),parent,n} = o
  const RNG = new Chance(seed)   
  n = n || 10 + RNG.rpg('2d20',{sum:true})
  parent = parent || RNG.pickone(Object.keys(TerrainTypes))
  
  const hex = RandomGrid(seed,n)
  const terrain = Terrain(seed,parent,n)
  hex.toArray().forEach((h,i)=> {
    hex.getHex([h.q,h.r]).terrain = terrain[i]
  })

  return {
    seed,
    n,
    hex,
    parent,
    terrain
  } 
}

const renderSVG = (hex,i,g)=>{
  // create a polygon from a hex's corner points
  const polygon = g 
  .polygon(hex.corners.map(({x, y})=>`${x},${y}`))
    .addClass('hex').addClass(hex.terrain.type).data({
    hex
  }).click(function() {
    console.log(this.data('hex'))
  })

  //add relief 
  let {x,y,terrain} = hex
  let sz = 50
  terrain.jitter.forEach(([jx,jy])=> {
    //position 
    let px = x+jx-sz/2, py = y+jy-sz/2
    g.use(Symbols[terrain.symbol]).addClass('relief').size(sz,sz).move(px,py)
  })
}

//5 miles per hex 
const DisplayRegion = (app)=>{
  //get hex group to empty 
  const g = app.hex
  g.find(".hex").forEach(h=>h.remove())
  g.find(".relief").forEach(h=>h.remove())
  //new grid 
  const region = app.region = MakeRegion(app.state.region)
  
  //display 
  region.hex.forEach((hex,i)=> renderSVG(hex,i, g))
  Resize(app)  
  console.log(region)
}

const Resize = (app) =>{
  const groups = [app.map,app.hex]
  //get to the middle - x only 
  const svgSize = [window.innerWidth,window.innerHeight]
  //map and hex reposition 
  groups.forEach(g => {
    const box = g.bbox()
    let x = (-box.x)+(svgSize[0] - box.width)/2;
    let y = (-box.y)+(svgSize[1] - box.height)/2;
    g.attr({
      "transform" : "translate(" + x + "," + y + ")"
    })
  })  
}

const POI = {
  "Ysgard Mountains" : {
    "name" : "Ysgard Mountains",
    "terrain" : "mountains",
    "marker" : "pin",
    "p" : [854,315],
    "size" : 50,
    "color" : "#008000"
  },
  "Glorium" : {
    "name" : "Glorium",
    "terrain" : "mountains",
    "marker" : "point",
    "p" : [940,325],
    "size" : 40,
    "color" : "#ffffff"
  },
  "Plague-Mort" : {
    "name" : "Plague-Mort",
    "terrain" : "desert",
    "marker" : "point",
    "p" : [737,475],
    "size" : 40,
    "color" : "#ffffff"
  },
  "Shores of Tir fo Thiunn" : {
    "name" : "Shores of Tir fo Thiunn",
    "terrain" : "water",
    "marker" : "pin",
    "p" : [420,319],
    "size" : 50,
    "color" : "#008000"
  },
  "Semuanya's Bog" : {
    "name" : "Semuanya's Bog",
    "terrain" : "swamp",
    "marker" : "point",
    "p" : [516,426],
    "size" : 40,
    "color" : "#ffffff"
  },
  "Realm of the Norns" : {
    "name" : "Realm of the Norns",
    "terrain" : "hills",
    "marker" : "point",
    "p" : [704,284],
    "size" : 40,
    "color" : "#ffffff"
  },
  "Forests of Bytopia" : {
    "name" : "Forests of Bytopia",
    "terrain" : "forest",
    "marker" : "pin",
    "p" : [467,230],
    "size" : 50,
    "color" : "#008000"
  },
  "Eastern Plains" : {
    "name" : "Eastern Plains",
    "terrain" : "plains",
    "marker" : "pin",
    "p" : [681,346],
    "size" : 50,
    "color" : "#008000"
  },
}

//main map display 
const Symbols = {}
const ShowOutlands = (app)=>{
  //add map 
  const svg = app.svg = SVG('#map')
  //add two groups 
  const map = app.map = SVG('#outlands')
  app.hex = SVG('#hex')
  //map symbols 
  SVG.find('symbol').forEach(s => {
    let id = s.attr('id')
    Symbols[id] = s 
  })

  //place POI 
  Object.entries(POI).forEach(([id,poi]) => {
    let {p,size,marker} = poi 
    p[0] -= size/2
    p[1] -= size/2 

    //set marker and create click event 
    let what = map.use(Symbols["map-"+marker]).data('poi',poi).addClass('poi '+marker).fill(poi.color).size(size).move(...p)
    what.click(function(e) {
      let _poi = this.data('poi')
      let {terrain,name} = _poi
      console.log(_poi)

      //random region 
      let region = {
        seed : [name,chance.natural()].join('.'),
        parent: terrain
      } 

      //set state and call display 
      app.setState({region,poi:_poi})
      app.setView("Hex")
    })
  })

  //svg.use(symbols[10]).move(200, 200)
  Resize(app)  

  SVG('#outlands').click(function(e) {
    //find exact position of click 
    let {x,y} = e 
    let {translateX,translateY} = this.transform()
    let p = [x-translateX,y-translateY]
    
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