/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, chance} from "./random.js"

/*
  Use Honeycomb for Hex tools 
*/
import {HexFromIds} from "./hex.js"

/*
  Hex layout
*/
const Neighboors = [[1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1]]
//create a random grid based a walk, trying to pick the last chosen id 
const RandomWalk = (seed=chance.integer(),n)=>{
  const RNG = new Chance(seed)
  n = n || 10 + SumDice('2d20', RNG)

  const ids = ["0.0"]
  let last = "0.0"
    , i = 0;

  while (ids.length < n) {
    let use = i < 3 ? last : RNG.pickone(ids)
    //pick Neighboor 
    const _N = RNG.pickone(Neighboors)
    //pick hex - split to xy and then add Neighboor 
    const qr = use.split(".").map((v,j)=>Number(v) + _N[j]).join(".")
    //check if exists 
    if (!ids.includes(qr)) {
      //if not push to ids and set to last 
      ids.push(qr)
      i = 0
      last = qr
    }
    i++
  }

  return ids
}

class Area {
  constructor (app, opts = {}) {
    this.app = app 
    this.opts = opts 

    //if parent wil have i for index of its child 
    this._parent = opts.parent || ""

    //establish id && name 
    this.id = opts.id ? opts.id : opts.name ? [opts.name,chance.natural()].join(".") : chance.natural().toString(16)
    //has classes just like an html element 
    this.class = ["area"]

    this.terrain = []

    
    this.i = opts.i || 0

    //child areas 
    this._children = []

    //save to app 
    this.app.areas[this.id] = this 
  }

  //parent and children 
  get parent () {
    return this._parent == "" ? null : this.app.areas[this._parent]
  }

  get children () {
    return this._children.map(id => this.app.areas[id])
  }

  get name() {
    return this.opts.name ? this.opts.name : this._name ? this._name.short : ""
  }
  
  //class functionality 
  addClass (c) {
    this.class.push(c)
  }
  
  rmClass (c) {
    let i = this.class.indexOf(c)
    if(i != -1)
      this.class.splice(i,1)
  }
  
  hasClass (c) {
    return this.class.includes(c)
  }
  
  //get total size based upon all children 
  get size () {
    return this.children.reduce((sum,c) => sum+c.size,0)
  }
  //enter and exit functionality - usually overridden 
  onEnter () {}
  onExit () {}
  //hex layout 
  setHex () {
    //get hex layout  
    this.hexIds = RandomWalk(this.id, this.childDisplay.length)
    this.hex = HexFromIds(this.hexIds).toArray()
  }
  
  //which children to display 
  get childDisplay () {
    return this.children
  }
  
  display () {
    if(this.iframe)
      return
    
    //get group to display 
    let g = SVG("#hex")
    let app = this.app

    //empty hex 
    g.find(".hex").forEach(h=>h.remove())
    g.find(".dText").forEach(h=>h.remove())
    
    //assume hex display 
    this.hex.forEach((hex,i) => {
      // create a polygon from a hex's corner points
      const polygon = g.polygon(hex.corners.map(({x, y})=>`${x},${y}`)).addClass('hex').data({
        i
      }).click(function() {
        app.selectHex(this.data('i'))
      })

      //simple id 
      g.text("#" + (i + 1)).move(hex.x, hex.y).addClass('dText')
    })
    
    const box = g.bbox()
    SVG("#map").attr('viewBox', [box.x,box.y,box.width,box.height].join(" "))
  }
}

export {Area}