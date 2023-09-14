/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, chance} from "./random.js"

const _human = {
  base: 'People',
  short: 'Human',
  lair: 'Camp',
  tags: []
}

import {NameBases} from './data.js';
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

    //People
    this.peoples = []
    const AddPeople = ()=>{
      let p = Likely(75, RNG) ? app.gen.Encounters.ByRarity({
        what: "Prime"
      }, RNG) : Object.assign({}, _human)
      p.text = "People: " + p.short

      //naming base 
      p.nameBase = RNG.pickone(NameBases).i

      this.peoples.push(p)
      return this.peoples.length - 1
    } 

    //function to create regions 
    const makeRegions = (total,isLand)=>{
      let res = []
      while (total > 0) {
        //generate peoples 
        let ppl = isLand ? AddPeople() : -1
        //generate region size 
        let r = RandBetween(1, 4, RNG)
        r = r > total ? total : r
        //reduce land 
        total -= r
        //terrain 
        let terrain = WeightedString(isLand ? this.peoples[ppl].tags.includes("aquatic") ? "islands,costal/1,1" : "costal,wetland,barren,lowlands,woodland,standard,highlands/1,1,2,3,4,5,4" : "costal,ocean,deep ocean/1,2,1", RNG)
        //push to lR 
        res.push({
          id: RNG.hash(),
          parent: this.id,
          scale: r - 1,
          terrain,
          ppl
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
      let n = RandBetween(1, land.length)
      //always add a small waterside 
      let coast = {
        id: RNG.hash(),
        parent: this.id,
        scale: 0,
        terrain : "costal",
        ppl : AddPeople()
      }

      let name = Names.Cultural.getState(this.peoples[land[0].ppl].nameBase,RNG)

      //make regions 
      continents.push({
        name,
        cultures: [],
        children: [coast,...land.splice(0, n).map(l=>{
          l.ci = continents.length
          return l
        }
        )]
      })
    }

    this.name = Names.Cultural.getState(RNG.pickone(this.peoples).nameBase,new Chance(this.id))

    //now generate regions, pantheons and cultures 
    let pantheons = [] 
    this.continents.forEach(c=>{
      //make region 
      c.children = c.children.map(o=>new app.gen.Region(app,o))

      //religions / pantheons 
      let _land = c.children.map(r => r.id)
      while (_land.length > 0){
        //land 
        let n = RandBetween(1, _land.length)
        pantheons.push({
          id : RNG.hash(),
          regions : _land.splice(0, n)
        })
      }

      //generate culture - randomly mash people together 
      let ppl = c.children.map(r => r.opts.ppl)
      while (ppl.length > 0) {
        let n = RandBetween(1, ppl.length)
        let cppl = ppl.splice(0, n)
        
        c.cultures.push({
          ppl : cppl,
          nameBase : this.peoples[RNG.pickone(cppl)].nameBase
        })
      }
    }
    )

    //small pantheons get absorbed 
    let [remain,absorbed] = pantheons.reduce((ra,p,i) => {
      if(Likely(p.regions.length < 3 ? 100-p.regions.length*10 : 0,RNG))
      {ra[1].push(i)}
      else {
        ra[0].push(i)
      }
      return ra 
    },[[],[]])
    //make sure some remain 
    remain = remain.length == 0 ? absorbed.splice(0,1) : remain 
    //absorb 
    absorbed.forEach(ai => {
      let ap = pantheons[ai]
      let rp = pantheons[RNG.pickone(remain)]
      rp.regions.push(...ap.regions)
    })
    //splice 
    this._pantheons = pantheons.filter((p,i) => remain.includes(i))

    //make the pantheons 
    this._pantheons.forEach(p => new app.gen.Pantheon(app,{id:p.id,prime:this.id}))

    console.log(this)
  }

  get land() {
    return this.continents.map(c=>c.children).flat()
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
