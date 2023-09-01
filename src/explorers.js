var DB = localforage.createInstance({
  name: "Characters"
});

import {RandBetween, SumDice, Likely,BuildArray, chance} from "./random.js"
import*as Names from "./names.js"

const Abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
const ShortAbilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]
const Skills = {
  "Strength": [],
  "Dexterity": [],
  "Constitution": [],
  "Intelligence": [],
  "Wisdom": [],
  "Charisma": []
}

const Adventurers = {
  "Arcane": "Wizard,Sorcerer,Warlock/4,2,1",
  "Devout": "Cleric,Druid,Champion/4,2,2",
  "Skilled": "Rogue,Artificer,Bard/4,2,2",
  "Warrior": "Fighter,Ranger,Barbarian,Monk/4,3,2,2"
}

const ClassAbility = {
  "Wizard": ["Intelligence","Constitution"],
  "Sorcerer": ["Charisma","Intelligence"],
  "Warlock": ["Wisdom","Constitution"],
  "Cleric": ["Wisdom","Charisma"],
  "Druid": ["Wisdom","Constitution"],
  "Champion": ["Strength","Wisdom"],
  "Rogue": ["Dexterity","Intelligence"],
  "Artificer": ["Intelligence","Constitution"],
  "Bard": ["Charisma","Dexterity"],
  "Fighter": ["Strength","Dexterity"],
  "Barbarian": ["Constitution","Strength"],
  "Monk": ["Dexterity","Strength"],
  "Ranger" : ["Dexterity","Constitution"]
}

class Explorer {
  constructor(app, opts={}) {
    let {id=chance.hash()} = opts

    this.app = app
    this.id = id
    this.opts = opts

    let RNG = new Chance(this.id)

    this.level = RNG.pickone([1, 2])

    //always generate but overwrite 
    this.people = app.gen.Encounters.ByRarity({
      what: "PCs"
    }, RNG)
    this.name = Names.Diety(RNG)
    this.classes = app.gen.Encounters.NPCs.adventurer(RNG)

    let overwrite = ["people", "name", "level"]
    overwrite.forEach(k=>this[k] = opts[k] ? opts[k] : this[k])

    //generate abilities 
    let av = BuildArray(7,()=>SumDice("3d6",RNG)).sort((a,b)=> b-a)
    //shuffle abilities to pick core and max first
    let ca = this.classes.length > 1 ? [ClassAbility[this.classes[0]][0],ClassAbility[this.classes[1]][0]] : ClassAbility[this.classes[0]].slice()
    ca = RNG.shuffle(ca)
    RNG.shuffle(Abilities).forEach(a => {
      if(!ca.includes(a)){
        ca.push(a)
      }
    })
      
    this._abilities = Object.fromEntries(ca.map((a,i)=>[a,av[i]]))

    this.state = {
      jink: {},
      quests: [],
      items: [],
      location: ""
    }

    //save to app 
    this.app.characters[this.id] = this
  }

  get abilities () {
    return Abilities.map((a,i) => [ShortAbilities[i],a,this._abilities[a]])
  }
  
  save() {
    DB.setItem(this.id, this.state)
  }
  static async load(id) {
    //load state 
    let state = await DB.getItem(id)
    //create new explorer and apply state 
    let E = new Explorer(id)
    Object.assign(E.state, state)
    return E
  }
}

export {Explorer}
