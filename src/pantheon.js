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
import * as Encounters from "./encounters.js"
//Planes 
import {Region} from './region.js';

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

const Diety = (app,id,pantheon,opts={})=>{
  let RNG = new Chance(id)

  const {alignment, baseAlignment="neutral", minor=0, parent=""} = opts
  //base alignment
  let _alignment = RNG.weighted(...Aligment[baseAlignment])
  let al = RNG.pickone(Details.alignment[_alignment])

  //name 
  let name = Names.Diety(RNG)

  //body form
  const getForm = ()=> Encounters.ByRarity({},RNG)

  //plane 
  let p = Object.values(app.poi.OuterPlanes).filter(p=>p.tags.includes(al))
  let plane = RNG.pickone(p)
  let layer = plane.layers ? RNG.pickone(plane.layers) : plane.name

  //create region 
  let rOpts = {
    parent : plane.name,
    layer
  }
  let home = new app.gen.Region(app,rOpts)

  //domains 
  const domains = [RNG.weighted(Domains.primary.all, Domains.primary[_alignment]), RNG.weighted(Domains.secondary.all, Domains.secondary[_alignment])]
  const domainsShort = domains.map(d=>RNG.pickone(d.split("/")))

  //rank 
  const rank = minor > 0 ? SumDice("1d5+5", RNG) : SumDice("1d4+1", RNG)

  let diety = {
    id,
    name,
    rank,
    parent: parent != "" ? pantheon.children.find(d=>d.id == parent) : null,
    form: getForm(),
    alignment: [_alignment, al, Details.alignment.byLeter[al.charAt(1)]],
    domains,
    domainsShort,
    home,
    pantheon
  }

  if(!pantheon){
    return diety
  }

  if (pantheon.form && pantheon.form.includes("Hybrid")) {
    diety.hybrid = Encounters.ByRarity({what:"Animal"},RNG)
  }
  if (pantheon.form && pantheon.form.includes("Elemental")) {
    diety.element = RNG.pickone(RNG.pickone(Details.element).split("/"))
  }

  //push to array 
  pantheon.children.push(diety)

  //minor dieties
  BuildArray(minor, ()=>{
    //pick alignment for minor 
    let bA = Details.alignment.byLeter[RNG.pickone(al)]
    Diety(app,RNG.hash(), pantheon, {
      parent: id,
      baseAlignment: bA
    })
  }
  )

  //mythos figures 
  let mythos = minor > 0 ? SumDice("2d4", RNG) : minor == 0 && parent == "" ? SumDice("1d3", RNG) : 0
  BuildArray(mythos, ()=>{
    pantheon.mythos.push({
      parent: id,
      id: chance.hash(),
      form: getForm()
    })
  }
  )
}


import {Faction, Fronts} from './factions.js';
/*
  Pantheon is a Faction 
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

    let total = SumDice("2d4+1", RNG);
    //loop until pantheon is full 
    while (this.children.length < total) {
      let _id = RNG.hash()
      let m = SumDice("1d4", RNG)

      Diety(app, _id, this, {
        minor: m
      })
    }

    //name 
    this.name = this.children[0].name + " Pantheon"
    //rank is first diety
    this.rank = this.children[0].rank

    this._homes = this.children.map(c => null)

    //save to app 
    this.app.factions[this.id] = this
  }

  get major () {
    return this.children.filter(c => c.rank > 5)
  }

  get minor () {
    return this.children.filter(c => c.rank <= 5)
  }

  addFaction () { 
    return new this.app.gen.Faction(this.app,{pantheon:this.id})
  }

  showHome (i) {
    if(!this._homes[i]){
      let h = this.children[i].home 
      let parent = h.length == 2 ? h[0] : h.slice(0,2).join(".")
      let name = h.length == 2 ? h[1] : h[2]

      let opts = {
        parent,
        name
      }

      let R = new Region(this.app,opts)
      this.app.setArea(R.id)
    }
    else {}
  }
}

export {Faction, Pantheon, Diety, Fronts}
