import {RandBetween, SumDice, Likely, Difficulty, WeightedString, chance} from "./random.js"
/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"

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
  Labor - Muscle/Study,Focus,Physique/Command,Tinker 
  Precarious - Move/Notice,Insight,Physique/Focus,Finesse,Command    
  
  *People*
  Treaty - Bond,Sway/Command,Notice,Study/Finesse 
  Trade - Sway/Bond,Notice,Command,Study/Insight,Resolve 
  Thievery - Insight/Finesse,Sneak,Command/Notice,Sway,Muscle,Shoot  
  
  *Wilderness* 
  Hidden Trails - Study/Notice,Move,Physique/Muscle,Insight,Shoot 
  Environment - Physique/Resolve,Move,Notice/Insight   

  [["Hunt", "Move", "Muscle"],["Finesse", "Sneak", "Tinker"],["Analyze", "Focus", "Sway"]]
  
  Monster, Barrier, Weapon, Spell, Armor, Item, Ally, Resource, Trinket 
  Mo,Br,Wp,Sp,Ar,It,Al,Rs,Tk 
*/

const DiceDifficulty = [[4,4,6,6],[4,6,6,6,8,8],[6,6,8,8,8,8,10,10],[8,8,10,10,10,10,12,12],[10,10,10,12,12,12,12,12],[12,12,12,12,12,12,12]]

const ExploreActions = {
  //Cypher
  "Track": "Sneak,Move/Shoot,Study,Notice/Insight,Finesse",
  "Design": "Study,Focus/Tinker,Notice/Insight",
  "Puzzle": "Study,Tinker/Focus,Finesse,Notice,Muscle/Move,Insight",
  "Curse": "Study,Resolve/Insight,Notice,Focus/Physique",
  //Mechanisms
  "Device": "Tinker/Finesse,Study/Insight,Notice,Muscle",
  "Trap": "Tinker,Notice/Finesse,Study,Insight/Move,Physique,Resolve",
  //Combat
  "Thieves": "Insight/Finesse,Sneak,Command/Notice,Sway,Muscle,Shoot",
  "Melee": "Muscle/Physique,Move,Resolve/Shoot,Command",
  "Firefight": "Shoot,Move/Sneak,Notice,Command/Muscle,Resolve",
  //Obstacle
  "Labor": "Muscle/Study,Focus,Physique/Command,Tinker",
  "Precarious": "Move/Notice,Insight,Physique/Focus,Finesse,Command",
  "Environment": "Physique/Resolve,Move,Notice/Insight",
  //Diplomacy
  "Treaty": "Bond,Sway/Command,Notice,Study/Finesse",
  "Trade": "Sway/Bond,Notice,Command,Study/Insight,Resolve",
  "Defamation": "Bond,Sway,Command/Insight,Notice,Study/Resolve",
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
const Exploration = (where,safety,diff=null)=>{
  let RNG = chance

  //difficulty 
  diff = diff === null ? Difficulty(RNG) : diff
  //["perlous", "dangerous", "unsafe", "safe"]
  let safe = [30, 40, 50, 70][safety]

  let what = ""
    , skills = [];
  const Focus = {
    'Cypher'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Design', 'Puzzle','Track'] : ['Curse'])
      return what
    },
    'Mechanism'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Device'] : ['Trap'])
      return what
    },
    'Combat'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Thieves'] : ['Melee','Firefight'])
      return what
    },
    'Obstacle'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Labor'] : ['Precarious','Environment'])
      return what
    },
    'Diplomacy'() {
      let what = RNG.pickone(Likely(safe, RNG) ? ['Trade', 'Treaty'] : ['Defamation'])
      return what
    }
  }

  const ExArray = (weights)=>{
    let c = RNG.weighted(challenges, weights)
    let rank = RNG.bool() ? Difficulty(RNG) : diff
    let check = (rank + 1) * 4 + (SumDice('4d3') - 8)
    return [c, Focus[c](), rank, check]
  }

  //exploration challenges  
  const challenges = ['Cypher', 'Combat', 'Mechanism', 'Diplomacy', 'Obstacle']
  const types = {
    "creature": [1, 5, 0, 1, 3],
    "encounter": [1, 5, 0, 1, 3],
    "dungeon": [2, 2, 2, 1, 3],
    "wilderness": [2, 2, 0, 1, 5],
    "faction": [2, 1, 0, 7, 0],
    "diety": [3, 1, 1, 5, 0],
    "hazard": [2, 1, 0, 0, 7],
    "landmark": [1, 2, 2, 4, 1],
    "resource": [3, 2, 0, 3, 2],
    "settlement": [2, 1, 1, 5, 1],
  }

  // assign challenge group, difficulty, action 
  let [challenge,focus,rank,check] = ExArray(types[where])

  //determine cohesion - max stress challenge can take 
  let cohesion = rank == 0 ? 1 : 2*rank

  return {
    challenge,
    focus,
    rank,
    check,
    where,
    diff,
    cohesion,
    //actions to beat challenge 
    get actions () { return GetActions(this.focus) }, 
    //dice to use for the challenge 
    get dice () {
      //keep 
      let k = rank < 1 ? 1 : rank 
      //number to roll 
      let n = rank+1 
      //return dice 
      return {
        k,
        pool : RNG.shuffle(DiceDifficulty[rank]).slice(0,n).map(v => "d"+v)
      } 
    },
    get short () { return `${this.challenge} (${this.focus}) [${this.diff}]; Find: ${this.reward[0]}`}
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

export {Exploration, Jobs}
