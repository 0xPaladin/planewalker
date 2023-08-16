import {RandBetween, SumDice, Likely, Difficulty, chance} from "./random.js"
/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"

/*
  E, Explore: Hunt, Move, Muscle 
  F, Finesse: Finesse, Sneak, Tinker
  W, Will: Analyze, Focus, Sway

  Analyze: You observe, gather, scrutinize and study information and anticipate outcomes.
  Finesse: You employ dexterous manipulation or subtle misdirection.
  Focus: You concentrate to accomplish a task that requires great strength of mind.
  Hunt: You navigate, carefully track targets and shoot.
  Move: You quickly shift to a new position or get out of danger. 
  Muscle: Your vigor to resist poison/disease and ability to use force to move, overcome or wreck the obstacle in front of you. 
  Sneak: You traverse skillfully and quietly.
  Sway: You influence with respect, guile, charm, or argument.
  Tinker: You understand, create, or repair complex mechanisms or organisms.

  Analyze:  
  Finesse: Thievery, / 
  Focus: Engineer / 
  Hunt: Explore / Notice, Shoot, Survive
  Move: Explore /  
  Muscle: Combat, Explore / Fight, Might
  Sneak: Thievery / Stealth 
  Sway: Negotiate / Convince, Trade  
  Tinker: Engineer, Know /  

  
   
  Athletics, Burglary, Contacts, Crafts, Deceive, Drive, Empathy, Fight, Investigate, Lore, Notice, Physique, Provoke, Rapport, Resources, Shoot, Stealth, Will  

  Soldier, Diplomat, Engineer, Explorer, Rogue, Scholar
  
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

  Soldier : Monster [Combat (Melee/Ranged/Arcane)] 
  Diplomat : Negotiation [Diplomacy, Knowledge, Will] 
  Engineer : Lock [Craft, Knowledge, Might+], Trap [Craft, Arcane, Fortitude/Reflex]     
  Explorer : Obstacle [Might, Acrobatics, Perception, Survival] 
  Rogue : Thievery [Perception, Stealth, Reflex] 
  Scholar : Cypher [Knowledge, Will] 

  Cypher - Formula, Puzzle 
  Monster
  Mechanisms - Lock, Trap 
  Negotiation - Treaty, Trade
  Obstacle - Physical, Precarious  
  Thievery - B&E, Pickpocket, Thugs 
  Wilderness - Lost, Environment  

  [["Hunt", "Move", "Muscle"],["Finesse", "Sneak", "Tinker"],["Analyze", "Focus", "Sway"]]
  
  Monster, Barrier, Weapon, Spell, Armor, Item, Ally, Resource, Trinket 
  Mo,Br,Wp,Sp,Ar,It,Al,Rs,Tk 
*/

//Set Explore values on places - can be called to reset 
const SetExplore = ({_safety},place)=>{
  let RNG = chance
  let {diff=Difficulty(RNG)} = place
  //["perlous", "dangerous", "unsafe", "safe"]
  let safe = [30, 40, 50, 70][_safety]

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
      let what = RNG.pickone(Likely(safe, RNG) ? ['Track'] : ['Attack'])
      return what
    },
    'Obstacle'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Labor'] : ['Precarious'])
      return what
    },
    'People'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Trade', 'Treaty'] : ['Thieves'])
      return what
    },
    'Wilderness'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Hidden Trails'] : ['Environment'])
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
    "dungeon": [1, 2, 2, 1, 2, 2],
    "area": [0, 2, 0, 1, 2, 5],
    "wilderness": [0, 2, 0, 1, 2, 5],
    "faction": [2, 1, 0, 7, 0, 0],
    "hazard": [1, 1, 0, 0, 4, 4],
    "obstacle": [1, 1, 0, 0, 4, 4],
    "landmark": [1, 2, 2, 4, 0, 1],
    "outpost": [2, 1, 2, 5, 0, 0],
    "resource": [2, 2, 0, 3, 1, 2],
    "ruin": [1, 2, 2, 2, 2, 1],
    "settlement": [2, 1, 1, 6, 0, 0],
  }

  // assign challenge group, difficulty, action 
  let challenge = place ? (place.what == "creature" && place.hasJobs) ? "outpost" : place.what : "wilderness"
  let data = ExArray(types[challenge])
  let short = data[0] + " [" + data[1] + "] " + data[3]

  return {
    data,
    challenge,
    short
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

const RandomFaction = (RNG=chance)=>RNG.pickone(RNG.bool() ? Details.factions : Details.outsiders)

const Jobs = (region,place)=>{
  let RNG = chance

  let who = ["outpost", "settlement", "city"].includes(place.what) ? RandomFaction() : place.who
  let what = RNG.pickone(JobTypes)

  //get the target, don't use the same faction 
  let against = RandomFaction()
  while (against == who) {
    against = RandomFaction()
  }

  let _where = RNG.weighted(["within", "near", "anywhere"], [6, 3, 1])
  let where = _where == "within" ? RNG.pickone(region.sites) : (_where == "near" ? "" : "anywhere") + RNG.integer()

  let short = who + " looking to " + what + " against " + against

  return {
    who,
    what,
    against,
    where,
    short
  }
}

export {SetExplore, Jobs}
