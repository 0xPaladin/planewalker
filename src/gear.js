import*as Details from "./data.js"
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, SpliceOrPush, WeightedString, capitalize, chance} from "./random.js"

const Form = 'Armor,Arrow,Aura,Bane,Beast,Blade,Blast,Blessing,Blob,Blood,Bolt,Bond,Boon,Brain,Burst,Call,Charm,Circle,Claw,Cloak,Cone,Crown,Cube,Cup,Curse,Dagger,Dart,Demon,Disturbance,Door,Eye,Eyes,Face,Fang,Feast,Finger,Fissure,Fist,Gate,Gaze,Glamer,Globe,Golem,Guard,Guide,Guise,Halo,Hammer,Hand,Heart,Helm,Horn,Lock,Mantle,Mark,Memory,Mind,Mouth,Noose,Oath,Oracle,Pattern,Pet,Pillar,Pocket,Portal,Pyramid,Ray,Rune,Scream,Seal,Sentinel,Servant,Shaft,Shield,Sigil,Sign,Song,Spear,Spell,Sphere,Spray,Staff,Storm,Strike,Sword,Tendril,Tongue,Tooth,Trap,Veil,Voice,Wall,Ward,Wave,Weapon,Weave,Whisper,Wings,Word'
const Noun = 'Acid,Aether,Air,Anger,Ash,Avarice,Balance,Blight,Blood,Bone,Bones,Brimstone,Clay,Cloud,Copper,Cosmos,Dark,Death,Deceit,Despair,Destiny,Dimension,Doom,Dust,Earth,Ember,Energy,Envy,Fear,Fire,Fog,Force,Fury,Glory,Gluttony,Gold,Greed,Hate,Hatred,Health,Heat,History,Hope,Ice,Iron,Justice,Knowledge,Lead,Lies,Life,Light,Lightning,Lore,Love,Lust,Metal,Might,Mist,Moon,Mud,Nature,Oil,Pain,Perception,Plane,Plant,Poison,Quicksilver,Revulsion,Rot,Salt,Shadow,Sight,Silver,Smoke,Soil,Soul,Souls,Sound,Spirit,Stars,Steam,Steel,Stone,Storm,Sun,Terror,Time,Treasure,Truth,Vanity,Venom,Vermin,Void,Water,Will,Wind,Wisdom,Wood,Youth'
const Adjective = 'All-Knowing,All-Seeing,Arcane,Befuddling,Binding,Black,Blazing,Blinding,Bloody,Bright,Cacophonous,Cerulean,Concealing,Confusing,Consuming,Crimson,Damnable,Dark,Deflecting,Delicate,Demonic,Devastating,Devilish,Diminishing,Draining,Eldritch,Empowering,Enlightening,Ensorcelling,Entangling,Enveloping,Erratic,Evil,Excruciating,Expanding,Extra-Planar,Fearsome,Flaming,Floating,Freezing,Glittering,Gyrating,Helpful,Hindering,Icy,Illusory,Incredible,Inescapable,Ingenious,Instant,Invigorating,Invisible,Invulnerable,Liberating,Maddening,Magnificent,Many-Colored,Mighty,Most Excellent,Omnipotent,Oozing,Penultimate,Pestilential,Piercing,Poisonous,Prismatic,Raging,Rejuvenating,Restorative,Screaming,Sensitive,Shimmering,Shining,Silent,Sleeping,Slow,Smoking,Sorcerer’s,Strange,Stupefying,Terrible,Thirsty,Thundering,Trans-planar,Transmuting,Ultimate,Uncontrollable,Unseen,Unstoppable,Untiring,Vengeful,Vexing,Violent,Violet,Viridian,Voracious,Weakening,White,Wondrous,Yellow'
const FNA = {
  Form,
  Noun,
  Adjective
}

const Templates = 'Noun.Form,Adjective.Form,Adjective.Noun,Form.of.Noun,Form.of.Adjective.Noun/3,3,3,2,2'

const Challenges = ['Cypher', 'Fight', 'Mechanism', 'People', 'Obstacle']
const Actions = ["Finesse", "Move", "Muscle", "Sneak", "Notice", "Shoot", "Study", "Tinker", "Bond", "Command", "Focus", "Sway", "Phyique", "Insight", "Resolve"]

const DieRank = ["d4","d6","d8","d10","d12","d14"]

const Power = (opts={})=>{
  let id = opts.id || chance.hash()
  let RNG = new Chance(id)
  let {rank=Difficulty(RNG), what = RNG.pickone(["Maneuver", "Blessing", "Spell", "Trick", "Design"])} = opts

  //get name form 
  let _n = WeightedString(Templates, RNG).split(".")
  let name = _n.map(w=>FNA[w] ? RNG.pickone(FNA[w].split(",")) : w).join(" ")

  //what challenge is it good for 
  const challenge = RNG.pickone(Challenges)

  //essence based on name 
  let essence = name.split(" ").reduce((all,word)=>{
    Object.entries(Details.essence).forEach(([e,tags])=>{
      if (tags.includes(word)) {
        all.push(e)
      }
    }
    )
    return all
  }
  , [])

  //what,name,rank,action,challenge,essence 
  return {
    data : ["Power", what, name, rank, challenge, essence],
    enc : 1,
    isKnown : false,
    text (html) { return html`${this.data[1]}: ${this.data[2]} ${this.isKnown ? "("+this.data[4]+")" : ""} ${DieRank[this.data[3]]}` } 
  }
}

const Potion = (opts={})=>{
  let id = opts.id || chance.hash()
  let RNG = new Chance(id)
  let {rank=Difficulty(RNG)} = opts
  let potion = {
    id,
    rank,
    enc: 1 / 3,
    used: false,
    base: "Potion"
  }

  let what = potion.what = rank == 0 || Likely(50, RNG) ? "Healing" : RNG.pickone(Actions)

  let val = what == "Healing" ? ["1d2", "1d4", "1d6", "1d8", "1d10", "1d12"][rank] : [0, 0, 1, 3, 9, 30][rank]
  let join = ["of", "of Blessed", "of Heroic", "of Magnificent", "of Epic", "of Transcendent"]

  //what,rank, used, remaining 
  return {
    data : ["Potion", what, rank, false, val],
    enc : 0.25,
    text (html) { return html`Potion ${join[this.data[2]]} ${this.data[1]} (${this.data[4]})`} 
  }
}

const Magical = (opts={})=>{
  let id = opts.id || chance.hash()
  let RNG = new Chance(id)
  let {rank=Difficulty(RNG), what=RNG.pickone(["Attire", "Trinket", "Jewelry"])} = opts

  //what,form,rank,ability 
  let item = ["Magical"]

  //get name form 
  let _n = WeightedString(Templates, RNG).split(".")
  let name = item.name = _n.map(w=>FNA[w] ? RNG.pickone(FNA[w].split(",")) : w).join(" ")

  const Forms = {
    Attire: 'shoes/boots,pants/skirt,dress/robe,shirt/blouse,belt,gloves/gauntlets,cape/cloak,hat/hood,scarf/shawl',
    Trinket: 'pouch/bag/quiver/vial,rope/chain,cup/goblet/chalice,book/scroll,ornament,miniature/statue/figurine,toy,box/case,wand/staff/rod',
    Jewelry: 'earings,ring,bracelet/anklet/armband,brooch/pin,belt,necklace/locket,scepter/orb,circlet/crown',
  }

  let _form = item.form = RNG.pickone(Forms[what].split(","))
  let form = capitalize(RNG.pickone(_form.split("/")))

  return {
    data : ["Magical",what,form,rank],
    enc : 1,
    text (html) { return html`Magical ${this.data[2]} ${DieRank[this.data[3]]}`} 
  }
}

const Equipment = (opts={})=>{
  let eq = 'Documents,Gear,Implements,Tools'
  
  let id = opts.id || chance.hash()
  let RNG = new Chance(id)
  let {rank=Difficulty(RNG), what=WeightedString(eq+"/1,2,1,2", RNG)} = opts

  //['Cypher', 'Fight', 'Mechanism', 'People', 'Obstacle']
  let challenge = ""
  if (what == "Documents") {
    challenge = RNG.pickone(['Cypher', 'People', 'Mechanism'])
  } else if (what == "Gear") {
    challenge = RNG.pickone(['Obstacle'])
  } else if (what == "Tools") {
    challenge = 'Mechanism'
  } else if (what == "Implements") {
    challenge = 'Spell'
  }

  let d = RNG.weighted([4, 6, 8, 10, 12], [1, 2, 4, 2, 1])

  //what,rank,d, challenge, specific 
  return {
    data : ["Equipment", what, rank, d, challenge, ""],
    get enc () { return [0.5,3,1,2][eq.split(",").indexOf(this.data[1])]},
    text (html) { return html`${this.data[1]} (${this.data[4]}) ${DieRank[this.data[2]]}`}
  }
}

const Weapon = (opts={})=>{
  let wp = 'Simple,Light Melee,Melee,Heavy Melee,Light Ranged,Ranged,Heavy Ranged'
  
  let id = opts.id || chance.hash()
  let RNG = new Chance(id)
  let {rank=Difficulty(RNG), what=WeightedString(wp+"/4,2,2,1,2,2,1", RNG)} = opts

  const Forms = {
    "Simple": 'Club,Dagger,Hatchet,Staff,Spear,Sling/1,1,1,1,1,1',
    "Light Melee": 'Hand Axe,Mace,Short Sword/1,1,1',
    "Light Ranged": 'Small Bow,Hand Crossbow/1,1',
    "Melee": 'War Axe,War Hammer,Mace,Long Sword/1,1,1,1',
    "Ranged": 'Longbow,Crossbow,Flintlock/10,10,1',
    "Heavy Melee": 'Greatclub,Maul,Greatsword/1,1,1',
    "Heavy Ranged": 'Great Bow,Longarm/10,1',
  }

  let form = WeightedString(Forms[what], RNG)
  let d = RNG.weighted([8, 10, 12], [6, 3, 1])

  //what, detail,rank,d
  return {
    data : ["Weapon", what, form, rank, d],
    get enc () { return [0.5,0.5,1,2,0.5,1,2][wp.split(",").indexOf(this.data[1])] },
    text (html) { return html`${this.data[2]} ${DieRank[this.data[3]]}`}
  } 
}

const Armor = (opts={})=>{
  let ar = 'Light,Medium,Heavy,Shield'
  let id = opts.id || chance.hash()
  let RNG = new Chance(id)
  let {rank=Difficulty(RNG), what=WeightedString(ar+"/4,2,1,4", RNG)} = opts

  const Forms = {
    Light: 'War Shirt,Leather',
    Medium: 'Mail Shirt,Curiass,Scale Mail',
    Heavy: 'Mail Hauberk,Plate Mail',
  }

  let form = what != "Shield" ? RNG.pickone(Forms[what].split(",")) : "Shield"

  let uses = what == "Medium" ? 2 : what == "Heavy" ? 3 : 1

  //what, detail,rank,use
  return {
    data : ["Armor", what, form, rank, uses],
    get enc () { return [1,2,4,1][ar.split(",").indexOf(this.data[1])] },
    text (html) { return html`${this.data[2]} [${this.data[3]}]`}
  } 
}

const Resource = (region,opts={})=>{
  let res = 'Trinket,Materials,Resource,Essence,Gold'
  let id = opts.id || chance.hash()
  let RNG = new Chance(id)
  let {rank=Difficulty(RNG), what=WeightedString(res+"/4,1,2,1,2", RNG)} = opts

  let r = [what]

  /*
  Services and Living Expenses
  Item Cost
  Impoverished lifestyle, per week 5 sp
  Common lifestyle, per week 20 sp
  Rich lifestyle, per week 200 sp
  Noble lifestyle, per week 1,000 sp
  */

  /*
  trinket 	rank
  materials	type,d,rank
  resource 	type,rank
  essence 	type,d,rank
  gold	amt
  */
  let d = RNG.weighted([4, 6, 8, 10, 12], [1, 2, 4, 2, 1])
  if (what == "Resource") {
    r.push(RNG.pickone(region.lookup("resource")).specifics[1])
  } else if (what == "Essence") {
    r.push(RNG.pickone(region.children.filter(c=>c.essence)).essence,d)
  } else if (what == "Materials") {
    r.push(RNG.pickone(["martial", "potions", "clothing", "equipment", "jewelry"]),d)
  }
  else if (what == "Gold") {
    r.push(SumDice(["1d4","2d6","4d6+25","5d20+100","4d100+400"][rank],RNG))
  }
  r.push(rank)

  return {
    data : ["Resource",...r],
    get enc () { return [1,2,2,0.5,this[2]/100][res.split(",").indexOf(this.data[1])] },
    text (html) { return html`${this.data[1]} ${this.data[1]=='Trinket' ? "" : this.data[2]} [${this.data[3]}]`}
  }
}

/*
  Give rewards based upon exploration 
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
  "equipment": "Documents,Gear,Implements,Tools/1,2,1,2",
  "item": "martial,equipment,Magical,Power/4,4,1,1",
}

//Rewars based upon what action was done 
const Rewards = (region,exploration)=>{
  let {diff, where} = exploration
  let what = WeightedString(ExploreRewards[where], RNG)
  //loop to get final result 
  while (ExploreRewards[what]) {
    what = WeightedString(ExploreRewards[what], RNG)
  }

  let Gen = {
    Power,
    Potion,
    Magical,
    Equipment,
    Weapon,
    Armor
  }
  let eq = 'Documents,Gear,Implements,Supplies,Tools'

  let rank = diff > 0 ? RNG.rpg(diff + "d6").reduce((sum,r)=>sum + ([0, 1, 1, 1, 1, 2][r]), 0) : 0
  //get reward 
  exploration.reward = 'Trinket,Resource,Materials,Essence,Gold'.includes(what) ? Resource(region, {
    what,
    rank
  }) : eq.includes(what) ? Equipment({
    what,
    rank
  }) : Gen[what]({
    rank
  })

  //assign text 
  Object.assign({
    text (html) {return html`${this.challenge}, [${this.focus}]; Find: ${this.exploration.short(html)}`}
  },exploration)
}

export {Power, Potion, Equipment, Weapon, Armor, Rewards,Resource,Magical}
