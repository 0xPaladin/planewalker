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
//Planes 
import {Region} from './region.js';

const ByDietyAlignment = {
  "good": 'Misguided Good,Religious Organization,God,Choir of Angles,Construct of Law',
  "neutral": 'Thieves Guild,Religious Organization,Cabal,God,Immortal Prince,Choir of Angels,Chosen One,Construct of Law',
  "evil": 'Thieves Guild,Cult,Religious Organization,Cabal,God,Immortal Prince,Elemental Lord,Force of Chaos,Construct of Law,Chosen One,Dragon,Lord of the Undead'
}

const Domains = {
  "primary": {
    "all": ['Agriculture/Aquaculture', 'Air/Sky', 'Ambition', 'Balance', 'Change/Transformation', 'Chaos/Corruption', 'Charity/Generosity', 'Control/Restraint', 'Creation', 'Darkness', 'Death/Decay', 'Destruction', 'Earth', 'Family/Community', 'Fate/Destiny', 'Fire', 'Greed/Avarice', 'Hate', 'Home/Hearth', 'Law/Order', 'Life/Growth', 'Light', 'Love', 'Lust', 'Moon', 'Nature', 'Pain/Strife/Suffering', 'Peace/Healing', 'Pleasure', 'Sloth', 'Stars', 'Sun', 'Technology/Invention', 'Travel/Trade', 'Trickery/Deceit', 'Void', 'War/Violence', 'Water/Sea', 'Work/Labor'],
    "good": [4, 2, 0, 0, 0, 0, 10, 2, 10, 0, 0, 0, 2, 10, 0, 0, 0, 0, 10, 0, 10, 10, 8, 0, 2, 2, 0, 10, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 2],
    "lawful": [8, 2, 4, 0, 0, 0, 2, 6, 2, 0, 0, 0, 2, 8, 0, 0, 0, 0, 8, 14, 0, 6, 2, 0, 2, 0, 0, 4, 0, 0, 2, 6, 8, 4, 0, 0, 0, 2, 8],
    "neutral": [2, 2, 0, 10, 8, 0, 0, 2, 2, 2, 2, 0, 6, 2, 6, 2, 0, 0, 2, 0, 2, 2, 2, 0, 6, 10, 0, 0, 2, 2, 6, 2, 2, 6, 0, 2, 0, 6, 2],
    "chaotic": [0, 2, 2, 0, 8, 10, 0, 0, 0, 0, 0, 8, 2, 2, 0, 8, 6, 6, 0, 0, 0, 0, 0, 8, 2, 0, 4, 0, 8, 4, 0, 2, 0, 0, 6, 2, 8, 2, 0],
    "evil": [0, 2, 2, 0, 0, 4, 0, 2, 0, 8, 8, 8, 2, 0, 0, 8, 8, 8, 0, 0, 0, 0, 0, 2, 2, 0, 6, 0, 2, 2, 2, 2, 2, 0, 8, 2, 8, 2, 0],
  },
  "secondary": {
    "all": ['Alacrity/Dexterity', 'Art/Craft', 'Chance/Luck', 'Charm/Charisma', 'Civilization', 'Desert', 'Dominance/Mastery', 'Dreams/Prophecy', 'Entropy/Decay', 'Fauna/Wildlife', 'Flora/Plant Life', 'Forge/Kiln', 'Freedom', 'Glory', 'Gluttony/Appetite', 'Health/Constitution', 'Highland/Mountains', 'Hope', 'Joy', 'Madness', 'Might/Strength', 'Nobility/Pride', 'Ocean/Sea', 'Outcasts/Orphans', 'Peasantry/Humility', 'Poison/Narcotics', 'Portals/Gates/Doors', 'Protection/Security', 'Purification', 'Rebirth/Renewal', 'Relief/Succor', 'Rivers/Waterways', 'Roads/Crossroads', 'Sorrow/Regret', 'Stability/Tradition', 'Storm/Tempest', 'Submission/Servitude', 'Theft', 'Thresholds/Transition', 'Torment/Suffering', 'Undeath', 'Underworld/Underground', 'Wetlands/Marsh', 'Wilderness', 'Will/Wisdom', 'Wine/Drink', 'Wits/Intelligence', 'Woodlands/Forest', 'Wrath/Anger'],
    "good": [2, 4, 0, 4, 2, 2, 0, 2, 0, 4, 4, 2, 6, 0, 0, 6, 2, 8, 4, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 8, 8, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 2, 2, 0],
    "lawful": [2, 4, 0, 2, 8, 2, 2, 0, 0, 0, 0, 6, 2, 4, 0, 2, 2, 4, 0, 0, 2, 6, 2, 0, 4, 0, 2, 8, 6, 0, 0, 2, 8, 0, 6, 0, 2, 0, 2, 0, 0, 0, 2, 2, 2, 0, 2, 2, 0],
    "neutral": [2, 2, 8, 2, 0, 2, 0, 2, 2, 6, 6, 2, 2, 0, 0, 2, 2, 2, 2, 0, 2, 0, 2, 4, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 2, 2, 2, 2, 4, 2, 4, 2, 0],
    "chaotic": [2, 0, 6, 2, 0, 2, 2, 2, 0, 0, 0, 0, 4, 4, 8, 0, 2, 0, 2, 4, 4, 0, 2, 0, 0, 4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 8, 0, 6, 2, 6, 4, 2, 2, 2, 0, 6, 0, 2, 8],
    "evil": [2, 2, 0, 2, 2, 2, 8, 2, 6, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 4, 0, 2, 0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 6, 0, 8, 8, 6, 2, 2, 0, 0, 2, 2, 8],
  }
}

const Form = ["Imitative", "Hybrid", "Dramatic Coloration", "Multi-limbed", "Elemental", "Symbolic", "Abstract", "Combined"]

const Aligment = {
  "good": [["evil", "chaotic", "neutral", "lawful", "good"], [1, 2, 2, 2, 5]],
  "lawful": [["evil", "chaotic", "neutral", "lawful", "good"], [2, 1, 2, 5, 2]],
  "neutral": [["evil", "chaotic", "neutral", "lawful", "good"], [1, 2, 6, 2, 1]],
  "chaotic": [["evil", "chaotic", "neutral", "lawful", "good"], [2, 7, 0, 1, 2]],
  "evil": [["evil", "chaotic", "neutral", "lawful", "good"], [5, 2, 2, 2, 1]]
}

import*as Names from "./names.js"

//A Diety behaves like a faction 
import {Faction, Fronts} from './factions.js';

class Diety extends Faction {
  constructor(app, opts={}) {
    super(app, opts);

    this.gen = "Faction"
    this.class = ["diety"]

    const {alignment, baseAlignment="neutral", minor=0, parent=null, pantheon} = opts
    this._pantheon = pantheon
    this._parent = parent

    let RNG = new Chance(this.id)

    //name 
    this._name = Names.Diety(RNG)

    //update rank 
    this.state.rank = minor > 0 ? SumDice("1d5+5", RNG) : SumDice("1d3+2", RNG)

    //base alignment
    let _alignment = RNG.weighted(...Aligment[baseAlignment])
    let al = RNG.pickone(Details.alignment[_alignment])
    this.alignment = [_alignment,al]

    //domains 
    this.domains = [RNG.weighted(Domains.primary.all, Domains.primary[_alignment]), RNG.weighted(Domains.secondary.all, Domains.secondary[_alignment])]
    this.domainsShort = this.domains.map(d=>RNG.pickone(d.split("/")))

    //redo front 
    this._front = RNG.pickone(ByDietyAlignment[Details.alignment.byLeter[al.charAt(1)]].split(","))

    //set the current plot 
    this.completePlot()
    
    //body form
    const getForm = (what = null)=>Encounters.ByRarity({what}, RNG)
    
    this.form = getForm()
    this.formSpecial = null

    //home region 
    let _all = app.planes.filter(p=>p.tags.includes(al)).map(_p => _p.children).flat()
    let _outlands = app.planes.find(p=>p.name == "Outlands").children
    let _home = RNG.pickone(RNG.pickone([_outlands,_all]))
    this._home = _home.id   
    //add a claim 
    this.addClaim(_home)

    if (pantheon) {
      this.pantheon.children.push(this)
      
      //update if provided 
      this.formSpecial = this.pantheon.form.includes("Hybrid") ? getForm("Animal") : this.pantheon.form.includes("Elemental") ? RNG.pickone(RNG.pickone(Details.element).split("/")) : null
    }

    //mythos figures 
    let mythos = minor > 0 ? SumDice("2d4", RNG) : minor == 0 && parent == null ? SumDice("1d3", RNG) : 0
    this.mythos = BuildArray(mythos, ()=> RNG.natural()) 

    //minor dieties
    BuildArray(minor, ()=>{
      //pick alignment for minor 
      let bA = Details.alignment.byLeter[RNG.pickone(al)]
      new Diety(app, {
        id : RNG.hash(),
        pantheon,
        parent: this.id,
        baseAlignment: bA
      })
    }
    )
  }

  get pantheon() {
    return this._pantheon ? this.app.factions[this._pantheon] : null
  }

  get parent () {
    return this._parent ? this.app.factions[this._parent] : null
  }

  /*
    UI 
  */

  get UI () {
    let {app, generated} = this 
    let {html} = app 

    //splice generated objects 
    const GenSplice = (i)=>{
      generated.splice(i, 1)
      app.refresh()
    }

    const detailDiv = (title,what) => html`<div class="ph2"><b>${title}:</b> ${what}</div>`

    return html`
    <div class="bg-white-50 ba br2 mw6 ma1 pa1">
      <div class="flex items-center justify-between">
        <div class="ma1" onClick=${()=>console.log(this)}><span class="b f4">${this.name}</span> (${this.alignment[1]}) [${this.rank}]</div>
        <div class="dropdown pointer">
          <div class="underline-hover b white bg-light-blue br2 pa1 ml2">Options</div>
          <div class="dropdown-content bg-white ba bw1 pa1">
            <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.save()}>Save</div>
            <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.random("minion",{rank:0})}>Random Minion</div>
            <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.modify("rank",1)}>Increase Rank</div>
            <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.modify("rank",-1)}>Decrease Rank</div>
            <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.modify("plot")}>New Plot</div>
            <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.modify("plot+",1)}>Progress Plot</div>
            <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.modify("plot+",-1)}>Foil Plot</div>
            <div class="link pointer dim underline-hover red ma1" onClick=${()=>this.modify("delete")}>Delete</div>
          </div>
        </div>
      </div>
      <div class="flex justify-around ph2 mb1">${Object.entries(this.stats).map(([name,val]) => html`<div><b>${name}:</b> ${val}</div>`)}</div>
      ${detailDiv("Domains",this.domainsShort.join("/"))}
      ${this.parent ? detailDiv("Parent",this.parent.name) : ""}
      ${detailDiv("Impulse",this.impulse)}
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

/*
  Pantheon Class 
*/

class Pantheon {
  constructor(app, opts={}) {
    this.app = app

    let {id=chance.hash()} = opts
    this.id = id
    this.opts = opts

    this.class = ["pantheon"]
    this.gen = "Pantheon"

    let RNG = new Chance(this.id)

    this.children = []
    this.mythos = []

    this.form = [RNG.weighted(Form, [5, 1, 1, 1, 1, 1, 1, 1])]
    if (this.form[0] == "Combined") {
      this.form = [RNG.weighted(Form, [5, 1, 1, 1, 1, 1, 1, 0]), RNG.weighted(Form, [5, 1, 1, 1, 1, 1, 1, 0])]
    }

    //save to app 
    this.app.factions[this.id] = this

    //make dieties
    let total = SumDice("2d4+1", RNG);
    //loop until pantheon is full 
    while (this.children.length < total) {
      let _id = RNG.hash()
      let m = SumDice("1d4", RNG)

      new Diety(app, {
        id: _id,
        pantheon: this.id,
        minor: m
      })
    }
  }

  get name () {
    return this.children[0].name + " Pantheon"
  }

  get major() {
    return this.children.filter(c=>c.rank > 5)
  }

  get minor() {
    return this.children.filter(c=>c.rank <= 5)
  }
}

export {Faction, Pantheon, Diety, Fronts}
