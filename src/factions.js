var DB = localforage.createInstance({
  name: "Factions"
});

/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, chance} from "./random.js"

//Core Data 
import*as Details from "./data.js"
//Encounters 
import*as Encounters from "./encounters.js"

/*
  Data Unique to Factions
*/

const PLOTS = {
  "Ambitious Organizations": "Attack someone by stealthy means,Attack someone directly,Absorb or buy out someone important,Influence a powerful institution,Establish a new rule,Claim territory or resources,Negotiate a deal,Observe a potential foe in great detail/2,1,2,1,1,2,2,1",
  "Planar Forces": "Turn an organization (corrupt or infiltrate with influence),Give dreams of prophecy,Lay a Curse on a foe,Extract a promise in exchange for a boon,Attack indirectly - through intermediaries,Rarely - when the stars are right - attack directly,Foster rivalries with similar powers,Expose someone to a Truth - wanted or otherwise/2,1,2,2,2,1,1,1",
  "Arcane Enemies": "Learn forbidden knowledge,Cast a spell over time and space,Attack a foe with magic (directly or otherwise),Spy on someone with a scrying spell,Recruit a follower or toady,Tempt someone with promises,Demand a sacrifice/2,2,2,2,2,1,1",
  "Hordes": "Assault a bastion of civilization,Embrace internal chaos,Change direction suddenly,Overwhelm a weaker force,Perform a show of dominance,Abandon an old home and find a new one,Grow in size by breeding or conquest,Appoint a champion,Declare war and act upon that declaration without hesitation or deliberation/2,1,1,2,1,1,2,1,1",
  "Cursed Places": "Vomit forth a lesser monster,Spread to an adjacent place,Lure someone in,Grow in intensity or depth,Leave a lingering effect on an inhabitant or visitor,Hide something from sight,Offer power,Dampen magic or increase its effects,Confuse or obfuscate truth or direction,Corrupt a natural law/2,1,1,2,1,1,1,1,1,1"
}

const FRONTS = {
  "Misguided Good": {
    "impulse": "to do what is “right” no matter the cost",
    "type": "Ambitious Organizations"
  },
  "Thieves Guild": {
    "impulse": "to take by subterfuge",
    "type": "Ambitious Organizations"
  },
  "Cult": {
    "impulse": "to infest from within",
    "type": "Ambitious Organizations"
  },
  "Religious Organization": {
    "impulse": "to establish and follow doctrine",
    "type": "Ambitious Organizations"
  },
  "Corrupt Government": {
    "impulse": "to maintain the status quo",
    "type": "Ambitious Organizations"
  },
  "Cabal": {
    "impulse": "to absorb those in power, to grow",
    "type": "Ambitious Organizations"
  },
  "God": {
    "impulse": "to gather worshippers",
    "type": "Planar Forces"
  },
  "Immortal Prince": {
    "impulse": "to release imprisoned immortals",
    "type": "Planar Forces"
  },
  "Elemental Lord": {
    "impulse": "to tear down creation to its component parts",
    "type": "Planar Forces"
  },
  "Force of Chaos": {
    "impulse": "to destroy all semblance of order",
    "type": "Planar Forces"
  },
  "Choir of Angels": {
    "impulse": "to pass judgement",
    "type": "Planar Forces"
  },
  "Construct of Law": {
    "impulse": "to eliminate perceived disorder",
    "type": "Planar Forces"
  },
  "Lord of the Undead": {
    "impulse": "to seek true immortality",
    "type": "Arcane Enemies"
  },
  "Power-mad Wizard": {
    "impulse": "to seek magical power",
    "type": "Arcane Enemies"
  },
  "Sentient Artifact": {
    "impulse": "to find a worthy wielder",
    "type": "Arcane Enemies"
  },
  "Ancient Curse": {
    "impulse": "to ensnare",
    "type": "Arcane Enemies"
  },
  "Chosen One": {
    "impulse": "to fulfill or resent their destiny",
    "type": "Arcane Enemies"
  },
  "Dragon": {
    "impulse": "to hoard gold and jewels, to protect the clutch",
    "type": "Arcane Enemies"
  },
  "Wandering Barbarians": {
    "impulse": "to grow strong, to drive their enemies before them",
    "type": "Hordes"
  },
  "Vermin": {
    "impulse": "to breed, to multiply and consume",
    "type": "Hordes"
  },
  "Underground Dwellers": {
    "impulse": "to defend the complex from outsiders",
    "type": "Hordes"
  },
  "Plague of the Undead": {
    "impulse": "to spread",
    "type": "Hordes"
  },
  "Abandoned Tower": {
    "impulse": "to draw in the weak-willed",
    "type": "Cursed Places"
  },
  "Spawning Ground": {
    "impulse": "to spawn",
    "type": "Cursed Places"
  },
  "Elemental Vortex": {
    "impulse": "to grow, to tear apart reality",
    "type": "Cursed Places"
  },
  "Dark Portal": {
    "impulse": "to disgorge demons",
    "type": "Cursed Places"
  },
  "Shadowland": {
    "impulse": "to corrupt or consume the living",
    "type": "Cursed Places"
  },
  "Place of Power": {
    "impulse": "to be controlled or tamed",
    "type": "Cursed Places"
  }
}

const Home = (RNG,F,pid=null)=>{
  let al = RNG.pickone(Details.alignment[RNG.pickone(F.alignment.split("/"))])
  //plane 
  let p = pid ? [F.app.poi.OuterPlanes[pid]] : [F.app.poi.OuterPlanes.Outlands, ...Object.values(F.app.poi.OuterPlanes).filter(p=>p.tags.includes(al))]
  let plane = RNG.pickone(p)
  let layer = plane.layers ? RNG.pickone(plane.layers) : plane.name

  //create region 
  let rOpts = {
    parent: plane.name,
    layer
  }
  return new F.app.gen.Region(F.app,rOpts)
}

const Random = {
  "Misguided Good"(F) {
    let RNG = new Chance(F.id)

    let d = F.app.pantheons.map(p=>p.children).flat().filter(p=>p.alignment[1].includes("G"))
    if (RNG.bool() && d.length > 0) {
      F.diety = RNG.pickone(d)
      F._pantheon = F.diety.pantheon.id
    } else {
      F._template = RNG.pickone(Details.factions.good)
    }
  },
  "Thieves Guild"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "chaotic"])
  },
  "Cult"(F) {
    let RNG = new Chance(F.id)

    let d = F.app.pantheons.map(p=>p.children).flat().filter(p=>p.alignment[1].includes("E"))
    if (RNG.bool() && d.length > 0) {
      F.diety = RNG.pickone(d)
      F._pantheon = F.diety.pantheon.id
    } else {
      F._template = RNG.pickone(Details.Outsiders.Fiend)
    }
  },
  "Religious Organization"(F) {
    let RNG = new Chance(F.id)

    let d = F.app.pantheons.map(p=>p.children).flat()
    F.diety = RNG.pickone(d)
    F._pantheon = F.diety.pantheon.id
  },
  "Corrupt Government"(F) {
    let RNG = new Chance(F.id)
    let alignment = F.alignment = RNG.pickone(["evil", "neutral", "lawful"])
  },
  "Cabal"(F) {
    let RNG = new Chance(F.id)
    let alignment = F.alignment = RNG.pickone(["evil", "chaotic", "lawful"])
    F._template = RNG.pickone(Details.factions[alignment])
  },
  "God"(F) {
    let RNG = new Chance(F.id)

    let d = F.app.pantheons.map(p=>p.children).flat()
    F.diety = RNG.pickone(d)
    F._pantheon = F.diety.pantheon.id
  },
  "Immortal Prince"(F) {
    let RNG = new Chance(F.id)

    let opts = {
      baseAlignment: RNG.pickone(["evil", "chaotic", "lawful", "good"])
    }
    //app,id,pantheon,opts={}
    F.diety = F.app.gen.Diety(F.app, RNG.hash(), null, opts)
  },
  "Elemental Lord"(F) {
    let RNG = new Chance(F.id)

    let opts = {
      baseAlignment: RNG.pickone(["evil", "chaotic", "lawful", "good"])
    }
    //app,id,pantheon,opts={}
    F.diety = F.app.gen.Diety(F.app, RNG.hash(), null, opts)
  },
  "Force of Chaos"(F) {
    let RNG = new Chance(F.id)

    let opts = {
      baseAlignment: "chaotic"
    }
    //app,id,pantheon,opts={}
    F.diety = F.app.gen.Diety(F.app, RNG.hash(), null, opts)
  },
  "Choir of Angels"(F) {
    let RNG = new Chance(F.id)

    F._template = RNG.pickone(Details.Outsiders.Celestial)
  },
  "Construct of Law"(F) {
    let RNG = new Chance(F.id)

    if (RNG.bool()) {
      F._template = RNG.pickone(["Archon","Modron","Baatezu"])
    } else {
      let opts = {
        baseAlignment: "lawful"
      }
      //app,id,pantheon,opts={}
      F.diety = F.app.gen.Diety(F.app, RNG.hash(), null, opts)
    }
  },
  "Lord of the Undead"(F) {
    let RNG = new Chance(F.id)

    F.alignment = "evil"
    F._minions.push("Undead")
  },
  "Power-mad Wizard"(F) {
    let RNG = new Chance(F.id)

    F.alignment = "evil"
  },
  "Sentient Artifact"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "good", "chaotic", "neutral", "lawful"])
  },
  "Ancient Curse"(F) {
    let RNG = new Chance(F.id)

    F.alignment = "evil"
  },
  "Chosen One"(F) {
    let RNG = new Chance(F.id)

    let alignment = RNG.pickone(["evil", "good", "chaotic","lawful"])
    F._template = RNG.pickone(Details.factions[alignment])
  },
  "Dragon"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "good"])
    F._minions.push("Dragon")
  },
  "Wandering Barbarians"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "good", "chaotic", "neutral", "lawful"])
  },
  "Vermin"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "chaotic"])
    F._minions.push("Vermin")
  },
  "Underground Dwellers"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "good", "chaotic", "neutral", "lawful"])
  },
  "Plague of the Undead"(F) {
    let RNG = new Chance(F.id)

    F.alignment = "evil"
    F._minions.push("Undead")
  },
  "Abandoned Tower"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "chaotic"])
  },
  "Spawning Ground"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "chaotic"])
  },
  "Elemental Vortex"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "chaotic"])
  },
  "Dark Portal"(F) {
    let RNG = new Chance(F.id)

    F.alignment = "evil"
  },
  "Shadowland"(F) {
    let RNG = new Chance(F.id)

    F.alignment = "evil"
  },
  "Place of Power"(F) {
    let RNG = new Chance(F.id)

    F.alignment = RNG.pickone(["evil", "good", "chaotic", "neutral", "lawful"])
  },
}

const ByDietyAlignment = {
  "good": 'Misguided Good,Religious Organization,Corrupt Government,God,Choir of Angles,Sentient Artifact,Chosen One,Place of Power',
  "neutral": 'Thieves Guild,Religious Organization,Cabal,God,Immortal Prince,Choir of Angels,Sentient Artifact,Chosen One,Place of Power',
  "evil": 'Thieves Guild,Cult,Religious Organization,Cabal,God,Immortal Prince,Elemental Lord,Force of Chaos,Construct of Law,Power-mad Wizard,Sentient Artifact,Ancient Curse,Chosen One,Dragon,Wandering Barbarians,Plague of the Undead,Abandoned Tower,Spawning Ground,Elemental Vortex,Dark Portal,Shadowland,Place of Power'
}

const RANKS = ["3,2,1", "5,4,2", "7,6,3", "9,6,4"]
const RANKINDEX = [-1, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3]

/*
  Base Faction Class
*/

class Faction {
  constructor(app, opts={}) {
    this.app = app

    let {id=chance.hash(), pantheon=null} = opts
    this.id = id
    this.opts = opts
    //use templates 
    this._template = opts.template

    let RNG = new Chance(this.id)

    //initial state 
    this.leader = null
    this._minions = []
    this._children = []
    this.alignment = "neutral"
    this._stats = RNG.shuffle(["Cunning", "Force", "Wealth"])

    this.rank = RNG.weighted([3, 5, 7, 9], [4, 6, 2, 1]) + RNG.pickone([0, 1])
    this.rMod = [0, RNG.pickone([0, 1]), RNG.pickone([0, 1])]

    this.magic = RNG.weighted(["Low", "Medium", "High"], [2, 3, 1])

    //has classes just like an html element 
    this.class = ["faction"]

    //see if belongs to a pantheon 
    this._pantheon = pantheon
    this.diety = pantheon ? RNG.pickone(app.factions[pantheon].children) : null

    let tmp = this.template
    //pull fronts from template, diety, or random 
    let _fronts = tmp.fronts ? tmp.fronts.split(",") : this.diety ? ByDietyAlignment[this.diety.alignment[2]].split(",") : Object.keys(FRONTS)
    //set type of front 
    this.front = opts.front ? opts.front : RNG.pickone(_fronts)

    let _front = this._front = FRONTS[this.front]
    this.impulse = _front.impulse

    this.plot = [WeightedString(PLOTS[_front.type],RNG), 0, RNG.pickone([4, 8, 12])]

    //generate based upon front 
    if(!opts.template && !pantheon){
      Random[this.front](this)
    }

    tmp = this.template
    if (tmp.class) {
      this.class.push(tmp.class)
    }
    if (tmp.alignment && tmp.alignment[0] != "neutral") {
      this.alignment = tmp.alignment.join("/")
    }

    //check for sigil or outlands 
    if (this.hasClass("Sigil")) {
      this._minions.push("PCs")
    }
    if(Details.Outsiders.Outsiders.includes(this._template)){
      this._minions.push(this._template)
    }
    if (this.diety) {
      let form = this.diety.form
      this._minions.push(form.base == "Outsider" ? form.tags[0] : form.base)
      this.leader = Likely(70, RNG) ? this.diety.form : this.minion(RNG, this.rank < 6 ? 3 : 4)
      this.alignment = this.diety.alignment[0]
    }

    this.leader = this.leader == null ? this.minion(RNG, this.rank < 6 ? 3 : 4) : this.leader
    if(_front.type == "Cursed Places") {
      this.leader = null
      this.noJob = true
    }

    //set home region 
    this.addClaim(Home(RNG, this, tmp.home), ["home", this.rank])

    //save to app 
    this.app.factions[this.id] = this

    console.log(this)
  }

  get name() {
    let {opts, _template} = this
    return opts.name ? opts.name : _template ? _template : this._name ? this._name : this.front
  }

  get template() {
    return this._template ? this.app.gen.Factions[this._template] : {}
  }

  get stats() {
    let {_stats, rank, rMod} = this
    let base = RANKS[RANKINDEX[rank]].split(",").map(Number)
    let vals = rMod.map((v,i)=>i == 0 ? rank : base[i] + rMod[i])

    return Object.fromEntries(_stats.map((s,i)=>[s, vals[i] < 0 ? 0 : vals[i]]))
  }

  /*
  modify  
  */

  modify(what, val) {
    if (what == "plot") {
      this.plot = this.opts.plot = [WeightedString(PLOTS[this._front.type]), 0, chance.pickone([4, 8, 12])]
    } else if (what == "plot+") {
      if (this.plot[1] == 0 && val == -1) {
        return
      }

      this.plot[1] += val
      this.opts.plot = this.plot

      if (this.plot[1] >= this.plot[2]) {
        this.completePlot()
      }
    } else if (what == "rank") {
      if ((this.rank == 10 && val == 1) || (this.rank == 1 && val == -1)) {
        return
      }
      this.rank = this.opts.rank = this.rank + val
    } else if (what == "delete") {
      DB.removeItem(this.id)
      delete this.app.factions[this.id]
    }
  }

  completePlot() {
    this.plot = this.opts.plot = [WeightedString(PLOTS[this._front.type]), 0, chance.pickone([4, 8, 12])]
  }

  /*
  handle relationships 
  */

  get relations() {
    let allies = []
      , neutral = []
      , enemies = [];

    const LawVsChaos = (a,b)=>(a.includes("lawful") && b.includes("chaotic")) || (b.includes("lawful") && a.includes("chaotic"))

    let A = this.alignment
    this.app.activeFactions.forEach(f=>{
      let B = f.alignment
        , relation = null;

      if (A.includes("good")) {
        relation = B.includes("good") ? allies : B.includes("evil") ? enemies : neutral
      } else if (A.includes("evil")) {
        relation = B.includes("good") || LawVsChaos(A, B) ? enemies : neutral
      } else if (A.includes("lawful")) {
        relation = B.includes("lawful") ? allies : LawVsChaos(A, B) ? enemies : neutral
      } else if (A.includes("chaotic")) {
        relation = LawVsChaos(A, B) ? enemies : neutral
      } else {
        relation = B.includes("good") ? allies : neutral
      }

      relation.push(f)
    }
    )

    return {
      allies,
      neutral,
      enemies
    }
  }

  //get minions / forces 
  minion(RNG=chance, threat) {
    let E = this.app.gen.Encounters
    //pick the type of minion 
    let what = this._minions.length > 0 ? RNG.pickone(this._minions) : null
    let res = E.ByThreat(RNG, {
      what,
      threat
    })
    //get adventuer class 
    res.adventuer = E.NPCs.adventurer(RNG)
    res.short = [res.short, res.adventuer.join("/")].join(" ")

    return res
  }

  /*
    handle all region interaction  
  */

  get home() {
    return Object.values(this.app.areas).find(r=>r._assets && r._assets.filter(a=>a[0] == this.id && a[1] == "home").length > 0)
  }

  //add to region 
  addClaim(region, asset) {
    let what = [this.id, ...asset, []]
    region._assets.push(what)
  }

  //class functionality 
  addClass(c) {
    this.class.push(c)
  }
  rmClass(c) {
    let i = this.class.indexOf(c)
    if (i != -1)
      this.class.splice(i, 1)
  }
  hasClass(c) {
    return this.class.includes(c)
  }

  save() {
    let opts = Object.assign({
      gen: this.gen,
      name: this.name
    }, this.opts)
    DB.setItem(this.id, opts)
  }
}

let Fronts = Object.keys(FRONTS)

export {Faction, Fronts}
