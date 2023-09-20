/*
  Useful Random Functions 
*/
import {RandBetween, BuildArray, WeightedString, chance} from "./random.js"

const _human = {
  base: 'People',
  short: 'Human',
  lair: 'Camp',
  tags: []
}

import*as Names from "./names.js"

class PrimeWorld {
  constructor(app, opts={}) {
    this.app = app
    this.opts = opts
    this.class = ["prime"]
    this.children = []

    let {id=chance.hash()} = opts
    this.id = id
    //save to app 
    this.app.areas[this.id] = this

    //start generation 
    let RNG = new Chance(this.id)

    //function to create regions 
    const makeRegions = (total,isLand)=>{
      let res = []
      while (total > 0) {
        //generate region size 
        let r = RandBetween(1, 4, RNG)
        r = r > total ? total : r
        //reduce land 
        total -= r
        //terrain 
        let terrain = WeightedString(isLand ? "islands,costal,wetland,barren,lowlands,woodland,standard,highlands/1,1,1,2,3,4,4,4" : "costal,ocean,deep ocean/1,2,1", RNG)
        //push to lR 
        res.push({
          id: RNG.hash(),
          parent: this.id,
          scale: r - 1,
          terrain
        })
      }
      return res
    }

    //percentage water 
    this.water = RandBetween(50, 85, RNG)
    //regions based upon water / land 
    this.waterRegions = makeRegions(this.water, false)
    let landP = 100 - this.water
    let land = makeRegions(landP, true)

    //assign continents / land 
    let continents = this.continents = []
    while (land.length > 0){
      //land 
      let n = RandBetween(1, land.length, RNG)
      //always add a small waterside 
      let coast = {
        id: RNG.hash(),
        parent: this.id,
        scale: 0,
        terrain : "costal"
      }

      //make continets  
      continents.push({
        cultures: [],
        children: [coast,...land.splice(0, n).map(l=>{
          l.ci = continents.length
          return l
        }
        )],
        get people () { 
          return this.children.map(c => c.lookup("people")).flat() 
        }
      })
    }

    //now generate regions and cultures 
    this.continents.forEach(c=>{
      //make region 
      c.children = c.children.map(o=>new app.gen.Region(app,o))

      //get people for name 
      c.name = Names.Cultural.getState(RNG.pickone(c.people).nameBase,RNG.natural())

      //mash people into cultures 
      let ppl = c.people.map(p => p.id)
      while (ppl.length > 0) {
        let n = RandBetween(1, ppl.length,RNG)
        let cppl = ppl.splice(0, n)
        let nB = RNG.pickone(cppl)
        let nameBase = c.people.find(p => nB == p.id).nameBase
        
        c.cultures.push({
          name : Names.Cultural.getBase(nameBase,RNG.natural(),true),
          ppl : cppl,
          nameBase
        })
      }
    }
    )

    this.name = Names.Cultural.getState(RNG.pickone(this.people).nameBase,RNG.natural())

    console.log(this)
  }

  get land() {
    return this.continents.map(c=>c.children).flat()
  }

  get people () {
    return this.continents.map(c => c.people).flat()
  }

  get cultures() {
    return this.continents.map(c=>c.cultures).flat()
  }

  get pantheons () {
    return this._pantheons.map(p => this.app.factions[p.id])
  }

  portal() {
    return WeightedString("Inner,Outer,Ethereal,Outlands/2,2,1,1")
  }
}

export {PrimeWorld}
