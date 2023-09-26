var DB = localforage.createInstance({
  name: "Characters"
});

import {RandBetween, SumDice, Likely, BuildArray,DiceArray, Hash, chance} from "../random.js"
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
  "Physique": ["Finesse", "Move", "Muscle", "Sneak"],
  "Insight": ["Notice", "Shoot", "Study", "Tinker"],
  "Resolve": ["Bond", "Command", "Focus", "Sway"]
}
const AllActions = ["Finesse", "Move", "Muscle", "Sneak", "Notice", "Shoot", "Study", "Tinker", "Bond", "Command", "Focus", "Sway"]

const ClassAdvance = {
  "Artificer": ["Tinker,Tinker,Focus"],
  "Barbarian": ["Muscle,Muscle,Move"],
  "Bard": ["Sway,Sway,Bond"],
  "Cleric": ["Focus,Study,Notice"],
  "Fighter": ["Muscle,Shoot,Command"],
  "Monk": ["Muscle,Move,Focus"],
  "Ranger": ["Shoot,Shoot,Notice"],
  "Rogue": ["Move,Finesse,Sway"],
  "Wizard": ["Focus,Focus,Study"],
}

//weapon, armor, equipment, power  
const StartingGear = {
  "Artificer": ["Equipment.Tools", "Power.Design"],
  "Barbarian": ["Weapon.Heavy Melee", "Magical.Attire"],
  "Bard": ["Equipment.Implements", "Power.Spell"],
  "Cleric": ["Armor.Medium", "Power.Blessing"],
  "Fighter": ["Weapon.Melee", "Armor.Medium"],
  "Monk": ["Power.Maneuver", "Magical.Jewelry"],
  "Ranger": ["Weapon.Ranged", "Equipment.Gear"],
  "Rogue": ["Equipment.Documents", "Magical"],
  "Wizard": ["Power.Spell", "Equipment.Implements"],
}
const DieRank = ["d4", "d6", "d8", "d10", "d12", "d14"]
const XP = [0, 6, 15, 24, 36, 51, 69, 90, 114, 141, 171, 204, 240, 279, 321, 366, 414, 465, 519, 576]
//cost in gp - per month 
const Cost = [150, 330, 600, 870, 1230, 1680, 2220, 2850, 3570, 4380, 5280, 6270, 7350, 8520, 9780, 11130, 12570, 14100, 15720, 17430]

class Explorer {
  constructor(app, opts={}) {
    let {id=chance.hash()} = opts

    this.app = app
    this.id = id
    this.opts = opts
    this.class = ["explorer"]

    this.state = {
      xp: 0,
      action: 0,
      health: [2, 2],
      hired: null,
      coin: 0,
      quests: [],
      inventory: [],
      magic: new Set(),
    }

    let RNG = new Chance(this.id)

    //explorer stuff 
    this._actions = {}

    //always generate but overwrite 
    this.people = app.gen.Encounter({
      id: this.id,
      what: "PCs"
    })
    this.name = Names.Diety(RNG)
    this._classes = [app.gen.Professions.adventurer(RNG)[0]]

    //add initial Gear
    StartingGear[this._classes[0]].forEach(g=>{
      let id = RNG.natural()
      let[gen,what] = g.split(".")
      let item = app.gen[gen]({
        id,
        what,
        rank: 1
      })
      //add to known
      app.game.known.add(id)
      //add to inventory
      this.state.inventory.push(item.data.slice())
    }
    )

    //starting location 
    let region = RNG.pickone(app.regions.filter(r=>r.plane && r.plane[0] == "Outlands"))
    let fi = region.lookup("settlement")[0].id
    this.state.location = [region.id, fi]

    //save to app 
    this.app.characters[this.id] = this
  }

  /*
    Simple get functions for view 
  */

  get level() {
    let _xp = this.state.xp
    return XP.reduce((lv,xp,i)=>xp <= _xp ? i + 1 : lv, 1)
  }

  get classes() {
    return this._classes
  }

  get inventory() {
    //equipped 
    let magic = this.state.magic
    let gen = this.app.gen
    let mayOffload = this.allies.length > 0

    return this.state.inventory.filter(item=>item[1] != "NPC").map(d=>{
      let item = this.app.gen[d[1]]({
        what: d[2]
      })
      item.data = d
      item.isKnown = this.app.game.known.has(d[0])
      //die for actions 
      item.die = DieRank[d[3]]
      //if power 
      item.options = !this.isHired ? null : "Power,Magical".includes(d[1]) ? !magic.has(d[0]) ? ["Bond"] : null : null
      item.maySell = magic.has(d[0]) ? false : true

      return item
    }
    )
  }

  get toUnbond() {
    let magic = this.state.magic
    let coin = this.state.coin
    return coin < 10 ? [] : this.inventory.filter(item=>magic.has(item.id))
  }

  get allies() {
    let coin = this.state.coin
    let E = this.app.gen.Encounter

    return this.state.inventory.filter(item=>item[1] == "NPC").map(d=>{
      let npc = E()
      npc.data = d
      npc.options = ["Let Go"]
      if (coin >= npc.price) {
        npc.options.unshift("Add Month " + npc.price + "g")
      }

      return npc
    }
    )
  }

  get health() {
    return this.state.health[0]
  }

  get coin() {
    return this.state.coin
  }

  get load() {
    let {Bond, Command, Muscle} = this.actions
    let items = this.inventory
    let allies = this.allies

    let _load = items.reduce((sum,item)=>sum + item.enc, 0)
    let allyLoad = allies.reduce((sum,a)=>sum + a.load, 0)
    let maxLoad = 8 + 2 * Muscle[0]
    let maxAllies = 1 + Math.max(0, Bond[0], Command[0])

    return {
      items: [_load, allyLoad + maxLoad],
      allies: [allies.length, maxAllies]
    }
  }

  get mayAct() {
    return this.state.action < this.app.game.time && this.isHired
  }

  /*
    Location 
  */
  get location() {
    let[rid,fi] = this.state.location
    let r = this.app.areas[rid]
    let atFeature = fi == 0 ? r.portal : r.children.find(c=>c.id == fi)
    return {
      region: r,
      atFeature
    }
  }

  /*
    Marktplace Actions / Buying 
  */

  mayBuy(what, cost) {
    let coin = this.state.coin
    let[c,max] = what == "item" ? this.load.items : this.load.allies

    return c < max && coin > cost
  }

  marketBuy(item, rid) {
    //reduce coin 
    this.state.coin -= item.price
    //add 
    let data = item.data.slice()
    if (data[1] == "NPC") {
      //hired for a month 
      data[6] = this.app.game.time + 30
    }
    //add to known and inventory
    if('Power,Magical'.includes(data[1])){
      this.app.game.known.has(data[0])
    }
    this.state.inventory.push(data)
    //reduce qty in region market by pushing to bought 
    let bid = Hash([rid, data[1] == "NPC" ? item.id : item.text])
    this.app.game.bought[bid] = this.app.game.bought[bid] ? this.app.game.bought[bid] + 1 : 1
    //save and refresh 
    this.app.save("characters", this.id)
    this.app.notify(`${this.name} has bought ${item.text}`)
  }

  marketSell(item, val) {
    //remove from inventory
    let i = this.state.inventory.map(item=>item[0]).indexOf(item.id)
    this.state.inventory.splice(i, 1)
    //give coin
    this.state.coin += val
    //save and refresh 
    this.app.save("characters", this.id)
    this.app.notify(`Sold ${item.text} for ${val}g`)
  }

  /*
    Cost and Hiring 
  */
  get cost() {
    return Cost[this.level - 1]
  }

  get isHired() {
    let {hired} = this.state

    return hired != null && this.app.game.time - hired <= 30
  }

  hire() {
    let game = this.app.game
    //cost in gold  
    let cost = this.cost
    if (game.coin < cost || this.isHired)
      return

    //pay cost for the month 
    game.coin -= cost
    //hire 
    this.state.hired = game.time
    //save and refresh 
    this.app.save("characters", this.id)
  }

  /*
    Values for action / save display 
  */

  get saves() {
    let _act = this.actions
    return Object.fromEntries(Object.entries(ActionsBySave).map((([save,acts])=>{
      let val = acts.reduce((sum,a)=>sum + (_act[a][0] > 0 ? 1 : 0), 0)
      return [save, [val, DieRank[val]]]
    }
    )))
  }

  get actions() {
    let lv = this.level
    let _act = this._actions = {}
    let RNG = new Chance(this.id)

    //allways 4 random action advances 
    for (let i = 0; i < 4; i++) {
      let a = RNG.pickone(AllActions)
      _act[a] = _act[a] ? _act[a] + 1 : 1
    }
    //write intial actions based upon level advances 
    ClassAdvance[this._classes[0]].forEach((adv,i)=>{
      if (i >= lv) {
        return
      }
      adv.split(",").forEach(a=>_act[a] = _act[a] ? _act[a] + 1 : 1)
    }
    )

    return Object.fromEntries(AllActions.map(a=>{
      let val = (this._actions[a] || 0)
      return [a, [val, DieRank[val]]]
    }
    ))
  }

  get actionsBySave() {
    return Object.values(ActionsBySave).map((list,i)=>list.map(a=>[a, this.actions[a]]))
  }

  //what inventory may be added during an exploration 
  get mayAddInventory () {
    let {exp,where,selected=[null]} = this.explore
    let {actions,challenge,focus} = exp 

    //get allies with action skill 
    let allies = this.allies.filter(a => a.trade.skills.includes(selected[0])).map(a => [a.id,a])
    //get items with action 
    let items = this.inventory.filter(item => (item.challenge && item.challenge == challenge) || (item.actions && item.actions.includes(selected[0]))).map(item => [item.id,item])

    return Object.fromEntries([...allies,...items])
  }

  /*
    Take action 
  */
  takeAction(act, d) {
    if (act == "View Market") {
      this.app.updateState("dialog", ["areas", this.location.region.id, "marketUI", this.id].join("."))
    } else if (act == "transferCoin") {
      this.app.game.coin -= d
      this.state.coin += d
      //save and refresh 
      this.app.save("characters", this.id)
      this.app.notify(`You have transferred ${d}g to ${this.name}`)
    } else if (act == "UsePortal") {
      let rid = d.location.id 
      let sid = d.location.lookup("settlement")[0].id
      //move there 
      this.state.location = [rid, sid]
      //save & update stae 
      this.app.save("characters", this.id)
      this.app.updateState("dialog", "")
      this.app.show = ["areas", rid].join(".")
      this.app.notify(`${this.name} has used the portal to ${d.location.name}`)
    } else if (act == "Move") {
      let to = d
      //set location 
      this.state.location[1] = to.what == "portal" ? 0 : to.id
      //time to move 
      let time = 1
      this.state.action += time
      //save and refresh 
      this.app.updateState("dialog", "")
      this.app.save("characters", this.id)
    } else if (act == "Explore") {
      let time = 'settlement,dungeon'.includes(d.what) ? 0.125 : 1
      this.explore = {
        where: d,
        exp: this.location.region.explore(d),
        selected : [],
        roll : []
      }
      this.app.updateState("dialog", ["characters", this.id, "ExploreUI"].join("."))
      console.log(time, this.explore)
    } else if (act == "learnDark") {
      //reduce coin 
      this.state.coin -= 5
      //pick id 
      let kid = chance.pickone(d)
      this.app.game.known.add(kid)
      //save and refresh 
      this.app.save("characters", this.id)

      let _what = this.location.region.children.find(c=>c.id == kid)
      this.app.notify(`You have been told of a... ${_what.text}`)
    } else if (act == "Bond") {
      this.state.magic.add(d.id)
      //save and refresh 
      this.app.save("characters", this.id)
    } else if (act == "unbond") {
      //reduce coin 
      this.state.coin -= 10
      //get d and remove from bound magic
      this.state.magic.delete(d.id)
      //save and refresh 
      this.app.save("characters", this.id)
    } else if (act.includes("Add Month")) {
      //pay price 
      let cost = d.price
      this.state.coin -= cost
      //increase time 
      let item = this.state.inventory.find(_item=>_item[0] == d.id)
      item[6] += 30
      //save and refresh 
      this.app.save("characters", this.id)
    } else if (act == "Let Go") {
      let i = this.state.inventory.map(item=>item[0]).indexOf(d.id)
      this.state.inventory.splice(i, 1)
      //save and refresh 
      this.app.save("characters", this.id)
    }
  }

  applyMods() {
  }

  /*
    Save and Load 
  */

  save() {
    let data = {
      gen: "Explorer",
      opts: this.opts,
      state: this.state
    }
    DB.setItem(this.id, data)
  }

  static async load(app, id) {
    //load state 
    let {opts, state} = await DB.getItem(id)
    opts.id = id
    //create new explorer and apply state 
    let E = new Explorer(app,opts)
    Object.assign(E.state, state)
    E.applyMods()

    return E
  }

  /*
    UI
  */

  get ExploreUI () {
    let html = this.app.html
    let _act = Object.assign({},this.actions,this.saves) 
    let {exp,where,selected=[null]} = this.explore
    let [player=[],against=[]] = this.explore.roll
    let {actions,challenge,focus,dice,rank} = exp 
    //what inventory an be added to explore 
    let mayAdd = this.mayAddInventory
    //dice string 
    let eDice = selected.map(s => _act[s] ? _act[s][1] : mayAdd[s].die)    

    //maange attack defense 
    const SetAtkDef = (v,pa,i) => {
      let PA = this.explore.roll[pa == "p" ? 0 : 1]
      PA[i][2] = 1-v 
      this.app.refresh()
    }
    
    //manage rolling 
    const Roll = () => {
      this.explore.roll = [DiceArray(eDice),DiceArray(dice)]
      this.app.refresh()
    }
    
    //manages selected action / gear / allies 
    const AddSelected = (a,isAction = false) => {
      this.explore.roll = [[],[]]
      if(isAction){
        this.explore.selected[0] = a
      }
      else if (selected.includes(a)){
        this.explore.selected.splice(selected.indexOf(a),1)
      }
      else {
        this.explore.selected.push(a)
      }
      this.app.refresh()
    }

    //displays attack/defense image for a successful roll 
    let dImg = ["./img/explore-swords.svg","./img/explore-shield.svg"]
    const AtkDef = (v,pa,i) => html`
    <div class="flex items-center mh1">
      ${dImg.map((img,j) => html`<div class="${v==j ? "bg-green" : "bg-gray"} pointer pa1" onClick=${()=>SetAtkDef(v,pa,i)}><img class="db" src=${img} height="17"></img></div>`)}
    </div>`
    //displays image of the die with the value of the roll over it 
    const DiceImg = ([d,val = -1,atk],pa,i) => html`
    <div>
      <div class="relative tc mh1">
        <img src=${"./img/"+d+(val != -1 ? "-outline" : "-fill")+".svg"} width="50"></img>
        ${val == -1 ? "" : html`<div class="centered f2 b ${val >= 4 ? "green" : "red"}">${val}</div>`}
      </div>
      ${val > 3 ? AtkDef(atk,pa,i) : "" }
    </div>
    `

    //explore UI - no close button - have to flee  
    return html`
    <div style="width:600px">
      <h3 class="ma0 mb1">${this.name} Exploring ${where.text}</h3>
      <h4 class="ma0 mb1">Challenge > ${challenge}: ${focus} > Difficulty ${rank}</h4>
      <div class="mh5">
        <div class="b">What action do you take?</div>
        ${actions.list.map(a=>html`<div class="${selected.includes(a) ? "bg-green white" : "bg-light-gray"} pointer tc b br2 underline-hover mv1 pa2" onClick=${()=>AddSelected(a,true)}>${a} [${_act[a][1]}]</div>`)}
        ${Object.keys(mayAdd).length == 0 ? "": html`<div class="b">Use the following Allies/Gear</div>`}
        ${Object.values(mayAdd).map(item=>html`<div class="${selected.includes(item.id) ? "bg-green white" : "bg-light-gray"} pointer tc b br2 underline-hover mv1 pa2" onClick=${()=>AddSelected(item.id)}>${item.text}</div>`)}
        <div class="flex items-center justify-center">
          ${player.length > 0 ? player.map((d,i) => DiceImg(d,"p",i)) : eDice.map(d => DiceImg([d]))}
          <span class="f3 mh2"><i>Vs</i></span>
          ${player.length > 0 ? against.map((d,i) => DiceImg(d,"a",i)) : dice.map(d => DiceImg([d]))}
        </div>
        ${eDice.length == 0 ? "" : html`<div class="bg-green white pointer tc b br2 underline-hover mv1 pa2" onClick=${()=>Roll()}>Roll!</div>`}
      </div>
    </div>`
  }

  get RegionOptionsUI() {
    let html = this.app.html
    let {region, atFeature} = this.location
    let {isKnown} = region.view()

    //core options 
    let options = [["Explore", "Explore", atFeature]]
    //add market 
    if (atFeature.what == "settlement") {
      options.push(["View Market", "View Market", atFeature])
    }
    //add moves 
    region.children.forEach(c=>{
      if (c.text != atFeature.text && isKnown.includes(c.id) && !"people".includes(c.what)) {
        options.push(["Move", "Move to " + c.text, c])
      }
    }
    )
    //handle portal moves 
    if (atFeature.what == "portal") {
      options.push(["UsePortal", "Use the Portal to " + region.portal.short, region.portal])
    } else {
      options.push(["Move", "Move to Portal", region.portal])
    }

    //options in a top down button array 
    return html`
    <div class="fr pointer dim underline-hover hover-red bg-gray br2 white b pa1" onClick=${()=>this.app.updateState("dialog", "")}>X</div>
    <div style="width:600px">
      <h3 class="ma0 mb1">${this.name} Options</h3>
      <div class="mh5">
        ${options.map(o=>html`<div class="pointer tc b bg-light-gray br2 underline-hover mv1 pa2" onClick=${()=>this.takeAction(o[0], o[2])}>${o[1]}</div>`)}
      </div>
    </div>`
  }

  get UI() {
    let {app, inventory, allies, load} = this
    let {html, game} = app

    const Allies = ()=>html`
    <div class="flex justify-between">
      <div class="f5 b">Allies</div>
      <div><b>Max</b> ${load.allies[1]}</div>
    </div>
    <div class="ph2">${allies.sort((a,b)=>a.data[2].localeCompare(b.data[2])).map(a=>html`
      <div class="dropdown">
        <div class="pointer link blue underline-hover">${a.text} (${a.timeRemain(game.time)} days)</div>
        <div class="dropdown-content bg-white ba bw1 pa1">
          ${a.options.map(o=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.takeAction(o, a)}>${o}</div>`)}
        </div>
      </div>`)}
    </div>`

    return html`
  <div class="bg-white-70 br2 mw6 ma1 pa1">
    <div class="flex flex-wrap justify-between">
      <h3 class="ma0 mv1">${this.name}</h3>
      <div class="pointer b white underline-hover br1 pa1 ${this.isHired ? "bg-green" : "bg-light-blue"}" onClick=${()=>this.hire()}>${this.isHired ? "Hired" : "Hire"}</div>
    </div>
    <div class="ph1">
      <div class="flex justify-between">
        <div>${this.people.short}</div>
        <div>${this.cost} gp/month</div>
      </div>
      <div>LV: ${this.level} ${this.classes.join("/")}</div>
      <div class="flex justify-center">
        ${Object.entries(this.saves).map(([save,val],i)=>html`
        <div class="mh2">
          <div class="f4"><b>${save}</b> ${val[1]}</div>
          ${this.actionsBySave[i].map(a=>html`<div><b>${a[0]}</b> ${a[1][1]}</div>`)}
        </div>`)}
      </div>
      <div><b>Location:</b> <span class="link pointer dim underline-hover blue mh1" onClick=${()=>app.show = ["areas", this.location.region.id].join(".")}>${this.location.region.parent.name}, ${this.location.region.name}</span></div>
      <div class="flex justify-between">
        <div class="f5 b">Inventory</div>
        <div><b>Load</b> ${load.items.join("|")}</div>
      </div>
      <div class="ph2">${inventory.sort((a,b)=>a.text.localeCompare(b.text)).map(item=>html`
        <div class="flex justify-between">
          ${item.options ? html`
          <div class="dropdown">
            <div class="pointer link blue underline-hover">${item.text}</div>
            <div class="dropdown-content bg-white ba bw1 pa1">
              ${item.options.map(o=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.takeAction(o, item)}>${o}</div>`)}
            </div>
          </div>` : html`<div>${item.text}</div>`}
        </div>`)}
      </div>
      ${allies.length > 0 ? Allies() : ""}
    </div>
  </div>
  `
  }
}

export {Explorer}
