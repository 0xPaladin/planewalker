var DB = localforage.createInstance({
  name: "Characters"
});

import {RandBetween, SumDice, Likely,BuildArray, chance} from "../random.js"
import*as Names from "../names.js"

/*
  Encumberance 
Gems, jewelry, and other small
objects usually aren’t tracked as items, though every full
100 coins counts as one item

A hero can carry a number of Readied items equal
to half their Strength attribute, rounded down.

hero can carry a number of Stowed items equal to
their full Strength score.

Gear Bundles
Item Cost Enc
Artisan’s Equipment 50 sp 5
Criminal Tools 100 sp 3
Dungeoneering Kit 200 sp 6
Noble Courtier Outfit 1,000 sp 2
Performer’s Implements 100 sp 3
Wilderness Travel Gear 100 sp 5

Type Enc
One day of food or water 1
One week of carefully-packed food 4
One night’s load of fire fuel 4
One day’s fodder for a horse or large beast 4
One day’s fodder for a mule or small beast 2
Daily water for a large beast 8
Daily water for a small beast 4

Pack Animal and Porter Loads
Type Enc
Riding horse or warhorse, with laden rider 5
Riding horse or warhorse, pack only 20
Heavy pack horse 30
Mule or donkey 15
Professional porter 12
Two porters carrying a shared litter 30


Beasts and Transport
Item Cost
Horse, riding 200 sp
Horse, draft 150 sp
Horse, battle-trained 2,000 sp
Mule 30 sp
Cow 10 sp
Ox, plow-trained 15 sp
Chicken 5 cp
Pig 3 sp
Dog, working 20 sp
Sheep or goat 5 sp
River ferry, per passenger 5 cp
Ship passage, per expected day 2 sp
Carriage travel, per mile 2 cp
Rowboat 30 sp
Small fishing boat 200 sp
Merchant ship 5,000 sp
War galleon 50,000 sp

Hirelings and Day Labor
Item Cost/day
Bard of Small Repute 2 sp
Dragoman or Skilled Interpreter 10 sp
Elite Courtesan 100 sp
Farmer 1 sp
Guard, ordinary 2 sp
Guard, sergeant, for every ten guards 10 sp
Lawyer or Pleader 10 sp
Mage of Minor Abilities 200 sp
Mundane Physician 10 sp
Porter willing to go into the wilds 5 sp
Porter only for relatively safe roads 1 sp
Navigator 5 sp
Sage, per question answered 200 sp
Sailor 1 sp
Scribe or Clerk 3 sp
Skilled Artisan 5 sp
Unskilled Laborer 1 sp
Veteran Sellsword 10 sp
Wilderness Guide 10 sp

Services and Living Expenses
Item Cost
Impoverished lifestyle, per week 5 sp
Common lifestyle, per week 20 sp
Rich lifestyle, per week 200 sp
Noble lifestyle, per week 1,000 sp
Magical healing of wounds 10 sp/hp*
Magical curing of a disease 500 sp*
Lifting a curse or undoing magic 1,000 sp*
Casting a minor spell 250 sp*
Bribe to overlook a minor crime 10 sp
Bribe to overlook a major crime 500 sp
Bribe to overlook a capital crime 10,000 sp
Hire someone for a minor crime 50 sp
Hire someone for a major crime 1,000 sp
Hire someone for an infamous crime 25,000 sp
*/

/*
  CLASSIC
  const Abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
const ShortAbilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]

const Skills = {
  "Academics" : "Intelligence",
  "Athletics" : "Dexterity",
  "Battle" : "Intelligence",
  "Boating" : "Dexterity",
  "Common Knowledge" : "Intelligence",
  "Driving" : "Dexterity",
  "Faith" : "Wisdom",
  "Fighting" : "Dexterity",
  "Gambling" : "Intelligence",
  "Healing" : "Intelligence",
  "Intimidation" : "Charisma",
  "Notice" : "Intelligence",
  "Occult" : "Intelligence",
  "Performance" : "Charisma",
  "Persuasion": "Charisma",
  "Piloting" : "Dexterity",
  "Repair" : "Intelligence",
  "Riding" : "Dexterity",
  "Science" : "Intelligence",
  "Shooting" : "Dexterity",
  "Spellcasting" : "Intelligence",
  "Stealth" : "Dexterity",
  "Survival" : "Intelligence",
  "Taunt" : "Intelligence",
  "Thievery" : "Dexterity"
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

  DASH
  Analyze: You observe, gather, scrutinize and study information and anticipate outcomes.
  Finesse: You employ dexterous manipulation or subtle misdirection. 
  Focus: You concentrate to accomplish a task that requires great strength of mind.
  Hunt: You navigate, carefully track targets and shoot.
  Move: You quickly shift to a new position or get out of danger. 
  Muscle: you use your force to move, overcome or wreck the obstacle in front of you.
  Sneak: You traverse skillfully and quietly.
  Sway: You influence with respect, guile, charm, or argument.
  Tinker: You understand, create, or repair complex mechanisms or organisms.

  CHARGE

  *Physique*
  Finesse
  Move 
  Muscle
  Sneak

  *Insight*
  Notice, you observe the situation and anticipate outcomes.
  Shoot, you carefully track and shoot at a target
  Study, you scrutinize details and interpret evidence.
  Tinker

  *Resolve* 
  Bond, you reassure and socialize with friends and contacts.
  Command, you compel swift obedience with skills and respect.
  Focus
  Sway   
*/

const ActionsBySave = {
  "Physique" : ["Finesse","Move","Muscle","Sneak"],
  "Insight" : ["Notice","Shoot","Study","Tinker"],
  "Resolve" : ["Bond","Command","Focus","Sway"]
}
const AllActions = ["Finesse","Move","Muscle","Sneak","Notice","Shoot","Study","Tinker","Bond","Command","Focus","Sway"]

const ClassAdvance = {
  "Artificer": ["Tinker,Tinker,Focus"],
  "Barbarian": ["Muscle,Muscle,Move"],
  "Bard": ["Sway,Sway,Bond"],
  "Cleric": ["Focus,Study,Notice"],
  "Fighter": ["Muscle,Shoot,Command"],
  "Monk": ["Muscle,Move,Focus"],
  "Ranger" : ["Shoot,Shoot,Notice"], 
  "Rogue": ["Move,Finesse,Sway"],
  "Wizard": ["Focus,Focus,Study"],
}

const XP = [0,6,15,24,36,51,69,90,114,141,171,204,240,279,321,366,414,465,519,576]
const Cost = [1500,3300,6000,8700,12300,16800,22200,28500,35700,43800,52800,62700,73500,85200,97800,111300,125700,141000,157200,174300]

class Explorer {
  constructor(app, opts={}) {
    let {id=chance.hash()} = opts

    this.app = app
    this.id = id
    this.opts = opts

    this.class = ["explorer"]

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

    //load actions based upon classes 
    let _act = this._actions = {}
    this.classes.forEach(c => {
      //get the initial advance 
      let advance = ClassAdvance[c][0].split(",")
      advance.forEach(a => {
        _act[a] = _act[a] ? _act[a]+1 : 1 
      })
    })
    //get action count total 
    let aT = Object.values(_act).reduce((sum,v)=>sum+v,0)
    while(aT < 7){
      //only use actions with value less than 2 
      let pick = RNG.pickone(AllActions.filter(a => _act[a] == undefined || _act[a]<2))
      _act[pick] = _act[pick] ? _act[pick]+1 : 1 
      aT++
    }

    //starting location 
    let region = RNG.pickone(app.regions.filter(r => r.plane && r.plane[0] == "Outlands"))

    this.state = {
      action: 0,
      hired : null,
      coin: 0,
      quests: [],
      items: [],
      location: region.id,
      mods : [],
    }

    //save to app 
    this.app.characters[this.id] = this
  }

  /*
    Location 
  */
  get location () {
    let id = this.state.location.split(".")[0]
    return this.app.areas[id]
  }

  /*
    Cost and Hiring 
  */
  get cost () {
    return Cost[this.level-1]
  }

  get isHired () {
    let {hired} = this.state
    
    return hired != null && this.app.game.time-hired <= 30  
  }

  hire () {
    let game = this.app.game 
    //cost in gold  
    let cost = this.cost/10 
    if(game.coin < cost || this.isHired) 
      return

    //pay cost for the month 
    game.coin -= cost 
    //hire 
    this.state.hired = game.time
    game.characters.add(this.id)
    //save and refresh 
    this.app.save()
  }

  get saves () {
    return Object.fromEntries(Object.entries(ActionsBySave).map((([save,acts])=> [save,acts.reduce((sum,a)=> sum+(this.actions[a]>0 ? 1 : 0),0)])))
  }

  get actions () {
    return Object.fromEntries(AllActions.map(a => [a,(this._actions[a] || 0)]))
  }

  get actionsBySave () {
    return Object.values(ActionsBySave).map((list,i) => list.map(a=> [a,this.actions[a]]))
  }

  applyMods () {
    
  }
  
  save() {
    let data = {
      gen : "Explorer",
      opts : this.opts,
      state : this.state
    }
    DB.setItem(this.id, data)
  }
  
  static async load(app,id) {
    //load state 
    let {opts,state} = await DB.getItem(id)
    opts.id = id 
    //create new explorer and apply state 
    let E = new Explorer(app,opts)
    Object.assign(E.state, state)
    E.applyMods()
    
    return E
  }
}

export {Explorer}
