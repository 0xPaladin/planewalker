import {RandBetween, SumDice, Likely, Difficulty, WeightedString, chance} from "./random.js"
/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"
import {Faction, NPCs} from "./encounters.js"

/*
  E, Explore: Hunt, Move, Muscle 
  F, Finesse: Finesse, Sneak, Tinker
  W, Will: Analyze, Focus, Sway

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
   
  PACG Skills 
  Athletics, Burglary, Contacts, Crafts, Deceive, Drive, Empathy, Fight, Investigate, Lore, Notice, Physique, Provoke, Rapport, Resources, Shoot, Stealth, Will  

  FATE 
  Arcane
  Acrobatics, 
  Craft
  Diplomacy  
  Fortitude
  Knowledge
  Melee
  Might
  Perception
  Ranged, 
  Stealth, 
  Reflex
  Survival
  Will  

  Professions
  Soldier, Diplomat, Engineer, Explorer, Rogue, Scholar

  Soldier : Monster [Combat (Melee/Ranged/Arcane)] 
  Diplomat : Negotiation [Diplomacy, Knowledge, Will] 
  Engineer : Lock [Craft, Knowledge, Might+], Trap [Craft, Arcane, Fortitude/Reflex]     
  Explorer : Obstacle [Might, Acrobatics, Perception, Survival] 
  Rogue : Thievery [Perception, Stealth, Reflex] 
  Scholar : Cypher [Knowledge, Will] 

  CHALLENGES 
  *Cypher* 
  Design - Study,Focus/Tinker,Notice/Insight  
  Puzzle - Study,Tinker/Focus,Finesse,Notice,Muscle/Move,Insight 
  Curse - Study,Resolve/Insight,Notice,Focus/Physique 
  
  *Mechanisms*
  Lock - Tinker/Finesse,Study/Insight,Notice  
  Trap - Tinker,Notice/Finesse,Study,Insight/Move,Physique,Resolve
  
  *Monster*
  Track - Sneak,Move/Shoot,Study,Notice/Insight,Finesse 
  Attack - Muscle,Shoot/Physique,Move,Resolve/Command 
  
  *Obstacle*
  Labor - Muscle/Study,Focus,Phsyique/Command,Tinker 
  Precarious - Move/Notice,Insight,Physique/Focus,Finesse,Command    
  
  *People*
  Treaty - Bond,Sway/Command,Notice,Study/Finesse 
  Trade - Sway/Bond,Notice,Command,Study/Insight,Resolve 
  Thievery - Insight/Finesse,Sneak,Command/Notice,Sway,Muscle,Shoot  
  
  *Wilderness* 
  Hidden Trails - Study/Notice,Move,Physique/Muscle,Insight,Shoot 
  Environment - Phsyique/Resolve,Move,Notice/Insight   

  [["Hunt", "Move", "Muscle"],["Finesse", "Sneak", "Tinker"],["Analyze", "Focus", "Sway"]]
  
  Monster, Barrier, Weapon, Spell, Armor, Item, Ally, Resource, Trinket 
  Mo,Br,Wp,Sp,Ar,It,Al,Rs,Tk 
*/

const ExploreRewards = {
  "wilderness": "Trinket,item,Resource,Essence/5,2,2,1",
  "landmark": "Trinket,item,Resource,Essence/3,3,2,2",
  "hazard": "Trinket,Resource,Essence,Gear,Implements/3,3,1,2,1",
  "resource": "Resource,Essence,Trinket,Tools/5,1,2,2",
  "encounter": "Trinket,Materials,Essence,martial,Implements/2,3,1,3,1",
  "dungeon": "Trinket,Gold,Essence,Power,item/3,3,1,1,2",
  "settlement": "Trinket,Materials,Resource,item,Ally/3,2,1,2,2",
  "faction": "Trinket,Gold,Documents,Ally/2,1,4,3",
  "martial": "Weapon,Armor/1,1",
  "equipment": "Documents,Gear,Implements,Supplies,Tools/1,2,1,2,2",
  "item": "martial,equipment,Magical,Power/4,4,1,1",
}

//Rewars based upon what action was done 
const Rewards = (where,diff,RNG=chance)=>{
  let what = WeightedString(ExploreRewards[where], RNG)
  //loop to get final result 
  while (ExploreRewards[what]) {
    what = WeightedString(ExploreRewards[what], RNG)
  }

  //get durability 
  let d = "1d" + WeightedString("4,6,8,10,12/2,3,3,1,1")
  //get value 
  let v = diff > 0 ? RNG.rpg(diff + "d6").reduce((sum,r)=>sum + ([0, 1, 1, 1, 1, 2][r]), 0) : 0

  return [what, v, d]
}

const ExploreActions = {
  //Cypher
  "Design": "Study,Focus/Tinker,Notice/Insight",
  "Puzzle": "Study,Tinker/Focus,Finesse,Notice,Muscle/Move,Insight",
  "Curse": "Study,Resolve/Insight,Notice,Focus/Physique",
  //Mechanisms
  "Lock": "Tinker/Finesse,Study/Insight,Notice",
  "Trap": "Tinker,Notice/Finesse,Study,Insight/Move,Physique,Resolve",
  //Monster
  "Thieves": "Insight/Finesse,Sneak,Command/Notice,Sway,Muscle,Shoot",
  "Attack": "Muscle,Shoot/Physique,Move,Resolve/Command",
  //Obstacle
  "Labor": "Muscle/Study,Focus,Phsyique/Command,Tinker",
  "Precarious": "Move/Notice,Insight,Physique/Focus,Finesse,Command",
  //People
  "Treaty": "Bond,Sway/Command,Notice,Study/Finesse",
  "Trade": "Sway/Bond,Notice,Command,Study/Insight,Resolve",
  "Defamation": "Bond,Sway,Command/Insight,Notice,Study/Resolve",
  //Wilderness
  "Track": "Sneak,Move/Shoot,Study,Notice/Insight,Finesse",
  "Hidden Trails": "Study/Notice,Move,Physique/Muscle,Insight,Shoot",
  "Environment": "Phsyique/Resolve,Move,Notice/Insight",
}

const GetActions = (what, RNG = chance) => {
  //all actions in an array of arrays [[common],[uncommon],[rare]] 
  let actions = ExploreActions[what].split("/").map(a=> a.split(","))
  //get the modifier of the action [0,-1,-2]
  let mod = Object.fromEntries(actions.map((step,i) => step.map(a=> [a,-i])).flat())
  //get the primary action 
  let primary = RNG.pickone(RNG.weighted(actions,[5,3,2]))
  //get other options to provide randomness 
  let options = RNG.shuffle(Object.keys(mod).filter(a => a!=primary)).slice(0,3)
  //list of all options 
  let list = RNG.shuffle([primary,...options])

  return { primary, mod, list}
}

//Set Explore values on places - can be called to reset 
const SetExplore = (where,safety,diff)=>{
  let RNG = chance

  //difficulty 
  diff = diff === undefined ? Difficulty(RNG) : diff
  //["perlous", "dangerous", "unsafe", "safe"]
  let safe = [30, 40, 50, 70][safety]

  let what = ""
    , skills = [];
  const focus = {
    'Cypher'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Design', 'Puzzle'] : ['Curse'])
      return what
    },
    'Mechanism'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Lock'] : ['Trap'])
      return what
    },
    'Monster'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Thieves'] : ['Attack'])
      return what
    },
    'Obstacle'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Labor'] : ['Precarious'])
      return what
    },
    'People'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Trade', 'Treaty'] : ['Defamation'])
      return what
    },
    'Wilderness'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Hidden Trails','Track'] : ['Environment'])
      return what
    }
  }

  const ExArray = (weights)=>{
    let c = RNG.weighted(challenges, weights)
    let rank = RNG.bool() ? Difficulty(RNG) : diff
    let check = (rank + 1) * 4 + (SumDice('4d3') - 8)
    return [c, focus[c](), rank, check]
  }

  //exploration challenges  
  const challenges = ['Cypher', 'Monster', 'Mechanism', 'People', 'Obstacle', 'Wilderness']
  const types = {
    "creature": [0, 5, 0, 1, 2, 2],
    "encounter": [0, 5, 0, 1, 2, 2],
    "dungeon": [1, 2, 2, 1, 2, 2],
    "area": [0, 2, 0, 1, 2, 5],
    "wilderness": [0, 2, 0, 1, 2, 5],
    "faction": [2, 1, 0, 7, 0, 0],
    "diety": [3, 1, 1, 5, 0, 0],
    "hazard": [1, 1, 0, 0, 4, 4],
    "obstacle": [1, 1, 0, 0, 4, 4],
    "landmark": [1, 2, 2, 4, 0, 1],
    "outpost": [2, 1, 2, 5, 0, 0],
    "resource": [2, 2, 0, 3, 1, 2],
    "ruin": [1, 2, 2, 2, 2, 1],
    "settlement": [2, 1, 1, 6, 0, 0],
  }

  // assign challenge group, difficulty, action 
  let data = ExArray(types[where])
  let reward = Rewards(where, diff)
  let short = [data[0], "[" + data[1] + "]", data[3] + ";", "Find:", reward[0]].join(" ")

  //get actions 
  let actions = GetActions(data[1],RNG)

  return {
    data,
    actions,
    where,
    short,
    reward
  }
}

/*
  Access - site 
  Acquire - what, site 
  Construct - what, site   
  Decypher - what, site
  Deliver - what, site
  Defend - what, site
  Eliminate
  Explore -  
  Fight Off - 
  Negotiate
  Patrol
  Protect
  Search
  Secure 
*/

const JobTypes = ["Access", "Acquire", "Construct", "Decypher", "Deliver", "Defend", "Eliminate", "Explore", "Fight Off", "Negotiate", "Patrol", "Protect", "Search", "Secure"]

const Jobs = (who=null,where)=>{
  let RNG = chance

  who = who != null ? who : where.lookup("faction").length > 0 && Likely(70, RNG) ? RNG.pickone(where.lookup("faction")) : RNG.pickone(where.app.activeFactions)
  let what = RNG.pickone(JobTypes)

  //get the target, use relations 
  let against = who.relations.enemies.length > 0 && Likely(70, RNG) ? RNG.pickone(who.relations.enemies) : RNG.pickone(who.relations.neutral)

  let _where = RNG.weighted(["within", "near", "anywhere"], [5, 4, 1])

  let short = who.name + " looking to " + what + " against " + against.name

  return {
    who,
    what,
    against,
    where: null,
    short
  }
}

export {SetExplore, Jobs}
