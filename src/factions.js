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
import {Encounter} from "./encounters.js"

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
    "type": "Ambitious Organizations",
    "alignment" : ["good"]
  },
  "Thieves Guild": {
    "impulse": "to take by subterfuge",
    "type": "Ambitious Organizations",
    "alignment" : ["evil","chaotic"]
  },
  "Cult": {
    "impulse": "to infest from within",
    "type": "Ambitious Organizations",
    "alignment" : ["evil","chaotic","lawful"]
  },
  "Religious Organization": {
    "impulse": "to establish and follow doctrine",
    "type": "Ambitious Organizations",
    "alignment" : ["good","lawful","neutral","evil","chaotic"]
  },
  "Corrupt Government": {
    "impulse": "to maintain the status quo",
    "type": "Ambitious Organizations",
    "alignment" : ["lawful","evil","neutral"]
  },
  "Cabal": {
    "impulse": "to absorb those in power, to grow",
    "type": "Ambitious Organizations",
    "alignment" : ["lawful","evil"]
  },
  "God": {
    "impulse": "to gather worshippers",
    "type": "Planar Forces",
    "alignment" : ["good","lawful","neutral","evil","chaotic"]
  },
  "Immortal Prince": {
    "impulse": "to release imprisoned immortals",
    "type": "Planar Forces",
    "alignment" : ["lawful","chaotic","evil","neutral"]
  },
  "Elemental Lord": {
    "impulse": "to tear down creation to its component parts",
    "type": "Planar Forces",
    "alignment" : ["chaotic","evil"]
  },
  "Force of Chaos": {
    "impulse": "to destroy all semblance of order",
    "type": "Planar Forces",
    "alignment" : ["chaotic","evil"]
  },
  "Choir of Angels": {
    "impulse": "to pass judgement",
    "type": "Planar Forces",
    "alignment" : ["good","lawful"]
  },
  "Construct of Law": {
    "impulse": "to eliminate perceived disorder",
    "type": "Planar Forces",
    "alignment" : ["lawful"]
  },
  "Lord of the Undead": {
    "impulse": "to seek true immortality",
    "type": "Arcane Enemies",
    "alignment" : ["evil"],
    "minions" : ["Undead"]
  },
  "Power-mad Wizard": {
    "impulse": "to seek magical power",
    "type": "Arcane Enemies",
    "alignment" : ["evil","chaotic"]
  },
  "Sentient Artifact": {
    "impulse": "to find a worthy wielder",
    "type": "Arcane Enemies",
    "alignment" : ["good","lawful","neutral","evil","chaotic"]
  },
  "Ancient Curse": {
    "impulse": "to ensnare",
    "type": "Arcane Enemies",
    "alignment" : ["evil","chaotic"]
  },
  "Chosen One": {
    "impulse": "to fulfill or resent their destiny",
    "type": "Arcane Enemies",
    "alignment" : ["good","lawful","neutral","evil","chaotic"]
  },
  "Dragon": {
    "impulse": "to hoard gold and jewels, to protect the clutch",
    "type": "Arcane Enemies",
    "alignment" : ["good","lawful","neutral","evil","chaotic"],
    "minions" : ["Dragon"]
  },
  "Wandering Barbarians": {
    "impulse": "to grow strong, to drive their enemies before them",
    "type": "Hordes",
    "alignment" : ["neutral","evil","chaotic"]
  },
  "Vermin": {
    "impulse": "to breed, to multiply and consume",
    "type": "Hordes",
    "alignment" : ["evil","chaotic"],
    "minions" : ["Vermin"]
  },
  "Underground Dwellers": {
    "impulse": "to defend the complex from outsiders",
    "type": "Hordes",
    "alignment" : ["good","lawful","neutral","evil","chaotic"]
  },
  "Plague of the Undead": {
    "impulse": "to spread",
    "type": "Hordes",
    "alignment" : ["evil","chaotic"],
    "minions" : ["Undead"]
  },
  "Abandoned Tower": {
    "impulse": "to draw in the weak-willed",
    "type": "Cursed Places",
    "alignment" : ["evil","chaotic"]
  },
  "Spawning Ground": {
    "impulse": "to spawn",
    "type": "Cursed Places",
    "alignment" : ["evil","chaotic"]
  },
  "Elemental Vortex": {
    "impulse": "to grow, to tear apart reality",
    "type": "Cursed Places",
    "alignment" : ["evil","chaotic"]
  },
  "Dark Portal": {
    "impulse": "to disgorge demons",
    "type": "Cursed Places",
    "alignment" : ["evil","chaotic"]
  },
  "Shadowland": {
    "impulse": "to corrupt or consume the living",
    "type": "Cursed Places",
    "alignment" : ["evil","chaotic"]
  },
  "Place of Power": {
    "impulse": "to be controlled or tamed",
    "type": "Cursed Places",
    "alignment" : ["good","lawful","neutral","evil","chaotic"]
  }
}

/*
  Minion Choices 
*/
const MinionList = 'Aberration,Animal,Dragon,Fey,Magical Beast,Undead,Vermin,Genie,Giant,People,Folk/1,1,1,1,1,1,1,1,1,1,1'
const NeedSpecifics = 'Aberration,Dragon,Magical Beast,Genie,Giant'

/*
  Manage Ranks 
*/
const RANKS = ["3,2,1", "5,4,2", "7,6,3", "9,6,4"]
const RANKINDEX = [-1, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3]

/*
  Base Faction Class
*/

class Faction {
  constructor(app, opts={}) {
    this.app = app

    this.id = opts.id || chance.hash()
    this.opts = opts
    this.gen = "Faction"
    //use templates 
    this._template = opts.template
    //has classes just like an html element 
    this.class = ["faction"]

    //initial state 
    this.state = {
      rank : 0,
      magic : 0,
      leader : [null],
      plot : []
    }

    //for UI 
    this.generated = [] 
    //state that does not change 
    this._minions = []
    this._children = []
    this._form = null 
    this.alignment = null 

    //check for template 
    if (opts.template) {
      this.class.push(this.template.class)
      this.alignment = this.template.alignment.join("/")
      //minions 
      let m = this.template.class == "Sigil" ? "PCs" : this.template.class == "Outsider" ? opts.template : null 
      if(m) {
        this._minions.push(m)
      }
    }

    //start generation 
    let RNG = new Chance(this.id)

    //core stats 
    this._stats = RNG.shuffle(["Cunning", "Force", "Wealth"])
    //stat rank 
    let _rank = RNG.weighted([3, 5, 7, 9], [4, 6, 2, 1]) + RNG.pickone([0, 1])
    this.state.rank = opts.rank || _rank    
    this.rMod = [0, RNG.pickone([0, 1]), RNG.pickone([0, 1])]

    //magic level 
    this.state.magic = RNG.weighted(["Low", "Medium", "High"], [2, 3, 1])

    //pull fronts from template, or random 
    let _fronts = this.template.fronts ? this.template.fronts.split(",") : Object.keys(FRONTS)
    //set type of front 
    this._front = opts.front ? opts.front : RNG.pickone(_fronts)

    //generate faction based upon front 
    if(!opts.template && !opts.pantheon){
      this.alignment = RNG.pickone(this.front.alignment)
      this._minions = this.front.minions ? this.front.minions : [WeightedString(MinionList,RNG)]
      this._form = [RNG.natural(),this._minions[0] || null]
    }  

    //set the current plot 
    this.completePlot()

    //establish leader and home 
    this._home = null 
    if(!opts.pantheon) {
      //set leader 
      this.state.leader = this.front.type == "Cursed Places" ? [null] : [RNG.natural(),this.rank < 6 ? 3 : 4]
      
      //set home region
      let hal = RNG.pickone(Details.alignment[RNG.pickone(this.alignment.split("/"))])
      //home region  
      let _home = RNG.pickone([...app.regions.filter(r => r.plane && r.plane[0] == "Outlands"), ...app.regions.filter(r=>r.plane && r.parent.tags.includes(hal))])
      this._home = _home.id 
      //add a claim 
      this.addClaim(_home)
    }

    //save to app 
    this.app.factions[this.id] = this
  }

  /*
    Get functions for information 
  */

  get name() {
    let {opts, _template} = this
    return opts.name ? opts.name : _template ? _template : this._name ? this._name : this._front
  }

  get template() {
    return this._template ? this.app.gen.Factions[this._template] : {}
  }

  set rank (r) {
    this.state.rank = r 
  }

  get rank () {
    return this.state.rank
  }

  get stats() {
    let {rank} = this.state 
    let {_stats, rMod} = this
    let base = RANKS[RANKINDEX[rank]].split(",").map(Number)
    let vals = rMod.map((v,i)=>i == 0 ? rank : base[i] + rMod[i])

    return Object.fromEntries(_stats.map((s,i)=>[s, vals[i] < 0 ? 0 : vals[i]]))
  }

  get home() {
    return this.app.areas[this._home]
  }

  get claims () {
    return this.app.regions.filter(r => r.claims[this.id])
  }

  get form () {
    let [id,what,_rarity=0] = this._form || [null,null,0] 
    let rarity = "PCs,Folk,Aberration,Magical Beast,Vermin".includes(what) ? null : _rarity
    
    return this._form ? Encounter({id,what,rarity}) : null 
  }

  get leader () {
    let [id,rank] = this.state.leader
    
    return id == null ? null : id == "diety" ? this.diety.form : this.minion({id,rank})
  }

  get plot () {
    return this.state.plot[0]
  }

  get hasJobs () {
    return this.front.type != "Cursed Places"
  }

  get front () {
    return FRONTS[this._front]
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

  /*
  modify  
  */

  modify(what, val) {
    //modify 
    if (what == "plot") {
      this.state.plot[0] = [WeightedString(PLOTS[this.front.type]), 0, chance.pickone([4, 8, 12])]
    } else if (what == "plot+") {
      if (this.plot[1] == 0 && val == -1) {
        return
      }

      this.plot[1] += val

      if (this.plot[1] >= this.plot[2]) {
        this.completePlot()
      }
    } else if (what == "rank") {
      if ((this.rank == 10 && val == 1) || (this.rank == 3 && val == -1)) {
        return
      }
      this.rank += val 
    } else if (what == "delete") {
      DB.removeItem(this.id)
      this.app.game.factions.delete(this.id)
      delete this.app.factions[this.id]
    }

    this.app.save(what == "delete" ? null : "factions",this.id)
  }

  completePlot() {
    this.state.plot.unshift([WeightedString(PLOTS[this.front.type]), 0, chance.pickone([4, 8, 12])]) 
  }

  /*
    Generate functions
  */
  random(gen, data = {}) {
    let {app, generated} = this

    if(gen == "minion"){
      generated.push(["Minion",this.minion(data)])
    }

    app.refresh()
  }

  /*
    Minions 
    get minions / forces 
  */
  minion(o={}) {
    let RNG = new Chance(o.id || chance.hash())
    let threat= o.rank == undefined ? RNG.weighted([0, 1, 2, 3], [45, 35, 15, 5]) : o.rank
    
    let arr = this._minions.slice() 
    if(this.form){
      arr.push(this.form.base == "Outsider" ? this.form.tags[0] : this.form.base)
    }

    let opts = {
      id : o.id || RNG.seed, 
      what : arr.length == 0 ? null : RNG.pickone(arr),
      threat
    }

    //get trade/adventuer class 
    let prof = threat > 0 ? ["adventuer","random"] : res.base == 'People' ? ["trade",WeightedString("Diplomat,Engineer,Explorer,Rogue,Scholar,Soldier/1,1,2,4,1,4",RNG)] : [null]
    if(prof[0]){
      opts[prof[0]] = prof[1]
    }
    
    //pick the type of minion 
    return this.form && 'People,PCs,Folk,Giant,Aberration,Dragon,Magical Beast,Elemental'.includes(this._form[1]) ? this.form : Encounter(opts)
  }

  /*
    Region interaction  
  */

  //add to region 
  addClaim(region, asset = null) {
    asset = asset == null ? ["base", this.rank, 0, []] : asset

    let claims = region.claims[this.id] || []
    claims.push(asset)

    region.claims[this.id] = claims
  }

  /*
    Class functionality 
  */

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

  /*
    Save and Load 
  */

  save() {
    let opts = Object.assign({
      name: this.name
    }, this.opts)

    let data = {
      gen: this.gen,
      opts,
      state : this.state
    }

    //save 
    DB.setItem(this.id, data)
  }

  static async load(app,id,Gen) {
    //load state 
    let {opts,state} = await DB.getItem(id)
    opts.id = id 
    //if it doesn't exist create it 
    let F = app.factions[id] || new Gen(app,opts)
    //asign state 
    Object.assign(F.state, state)
    
    return F
  }

  /*
    UI 
  */

  get UI () {
    let {app, generated} = this 
    let {html,game} = app 

    let OptionList = [["Increase Rank",()=>this.modify("rank",1)],["Decrease Rank",()=>this.modify("rank",-1)],["New Plot",()=>this.modify("plot")],["Progress Plot",()=>this.modify("plot+",1)],["Foil Plot",()=>this.modify("plot+",-1)],["Delete",()=>this.modify("delete")]]
    if(game.mode != "Explorer"){
      OptionList.push(["Random Minion",()=>this.random("minion",{rank:0})],["Random Soldier",()=>this.random("minion",{rank:1})],["Random Elite",()=>this.random("minion",{rank:2})],["Random Leader",()=>this.random("minion",{rank:3})])
    }
    
    //splice generated objects 
    const GenSplice = (i)=>{
      generated.splice(i, 1)
      app.refresh()
    }

    const detailDiv = (title,what) => html`<div class="ph2"><b>${title}:</b> ${what}</div>`

    return html`
    <div class="bg-white-50 ba br2 mw6 ma1 pa1">
      <div class="flex items-center justify-between">
        <h3 class="ma1" onClick=${()=>console.log(this)}>${this.name} (${this.alignment}) [${this.rank}]</h3>
        <div class="dropdown pointer">
          <div class="underline-hover b white bg-light-blue br2 pa1 ml2">Options</div>
          <div class="dropdown-content bg-white ba bw1 pa1">
            ${OptionList.map(o => html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${o[1]}>${o[0]}</div>`)}
          </div>
        </div>
      </div>
      <div class="flex justify-around ph2 mb1">${Object.entries(this.stats).map(([name,val]) => html`<div><b>${name}:</b> ${val}</div>`)}</div>
      ${detailDiv("Impulse",this.front.impulse)}
      ${this.diety ? detailDiv("Diety",this.diety.name) : ""}
      ${this.leader ? detailDiv("Leader",this.leader.short) : ""}
      <div class="ph2"><b>Plot:</b> ${this.plot[0]} [${this.plot.slice(1).join("/")}]</div>
      <div class="mh2">
        <h4 class="ma0">Claims</h4>
        ${this.claims.map(r => html`<div class="mh1"><span class="link pointer underline-hover blue" onClick=${()=>app.show = ["areas", r.id].join(".")}>${r.parent.name}, ${r.name}</span></div>`)}
      </div>
      ${generated.length == 0 ? "" : html`
      <h4 class="ma0 mt1 mh2">Generated</h4>
      ${generated.map(([what,data],i)=>html`
        <div class="mh2 flex justify-between items-center">
          <div>${what}: ${data.short}</div>
          <div class="pointer white hover-red link dim dib bg-gray tc br2 pa1" onClick=${()=>GenSplice(i)}>X</div>
        </div>`)}
      `}
    </div>`
  }
}

let Fronts = Object.keys(FRONTS)

export {Faction, Fronts}
