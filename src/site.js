const chance = new Chance()
const rInt = (RNG,min,max)=>RNG.integer({
  min,
  max
})
const DiceSum = (RNG=chance,dice)=>{
  const [_dice,b=0] = dice.split("+")
  return RNG.rpg(_dice, {
    sum: true
  }) + Number(b)
}

/*
  Use Honeycomb for Hex tools 
*/
import {RandomWalk} from "./hex.js"

/*
  Data for generation 
*/

const Areas = ["1d6+1", "1d8+7", "1d10+15", "1d12+25"]
const Types = ['caves/caverns', 'ruined settlement', 'prison', 'mine', 'crypt/tomb', 'lair/den/hideout', 'stronghold/fortress', 'temple/sanctuary', 'archive/laboratory', 'origin unknown']
const Situation = ['aboveground', 'part aboveground, part below', 'belowground', 'extraordinary (floating, ephemeral, etc.)']
const Entrance = ['sealed shut', 'purposely hidden', 'concealed by natural feature/terrain', 'buried (in earth, rubble, etc.)', 'blocked by obstacle/out of reach', 'clear/obvious']
const Ruination = ['arcane disaster', 'damnation/curse', 'natural disaster (earthquake, etc.)', 'plague/famine/drought', 'overrun by monsters', 'hubris', 'war/invasion', 'depleted resources', 'better prospects elsewhere']
const themes = {
  "a": ['nature/growth', 'law/order', 'beauty/wonder', 'healing/recovery', 'protection/defense', 'completion', 'inheritance/legacy', 'balance/harmony', 'light/life', 'prophecy', 'divine influence', 'transcendence'],
  "b": ['burglary/theft', 'desire/obsession', 'secrets/deception', 'imitation/mimicry', 'inversion/reversal', 'element', 'transformation', 'shadow/spirits', 'cryptic knowledge', 'madness', 'magic', 'magic'],
  "c": ['pride/hubris', 'hunger/gluttony', 'greed/avarice', 'wildness/savagery', 'devotion/sacrifice', 'forbidden knowledge', 'control/dominance', 'pain/torture', 'wrath/war', 'tragedy/loss', 'chaos/corruption', 'darkness/death'],
  "d": ['constructs/robots', 'unexpected sentience', 'space/time travel', 'advanced technology', 'utter insanity', 'alien life', 'cosmic alignment', 'other planes/dimension(s)', 'demons/devils', 'unspeakable horrors', 'elder gods', 'advanced technology'],
}
const Themes = themes.a.concat(themes.b, themes.c, themes.d)
const elements = ['void', 'death/darkness', 'fire/metal/smoke', 'earth/stone', 'plants/fungus', 'water/ice/mist', 'air/wind/storm', 'stars/cosmos']
const magicTypes = ['necromancy', 'evocation/destruction', 'conjuration/summoning', 'illusion/glamor', 'enchantment/artifice', 'transformation', 'warding/binding', 'restoration/healing', 'divination/scrying']

const Random = {
  element(RNG=chance) {
    return RNG.pickone(RNG.weighted(elements, [1, 1, 2, 2, 1, 2, 2, 1]).split("/"))
  },
  magic(RNG=chance) {
    return RNG.weighted(magicTypes, [1, 2, 1, 1, 1, 1, 1, 1, 1])
  },
  theme(RNG=chance) {
    const what = RNG.pickone(themes[RNG.weighted(Object.keys(themes), [3, 4, 3, 2])])
    return Themes.indexOf(what)
  },
  danger (RNG) {
    return RNG.weighted(["leader","creature","hazard"],[1,6,5])
  },
  contents(RNG=chance) {
    const _what = RNG.weighted(["1d4.danger","1.danger","1.danger,1.discovery","1d4.danger,1.discovery","1.discovery","1d4.danger,1d4.discovery","1.danger,1d4.discovery","1d4.discovery"],[1,3,2,1,2,1,1,1])
    const what = _what.split(",").map(w=> {
      let [d,_w] = w.split(".")
      d = d.includes("d") ? DiceSum(RNG,d) : Number(d)

      //if danger roll for what 
      _w = _w != "danger" ? [d,_w].join(" ") : Array.from({length:d},()=> Random.danger(RNG))
      
      return _w
    }).flat()

    return what 
  },
  site(RNG=chance, sz) {
    const a = DiceSum(RNG, Areas[sz])
    const themes = Array.from({
      length: 2 + sz
    }, ()=>Random.theme(RNG))
    const sp = themes.reduce((s,t,i)=>{
      const _t = Themes[t]
      s[i] = Random[_t] ? Random[_t](RNG) : null
      return s
    }
    , {})

    //get hex 
    const hex = RandomWalk(RNG.seed, a).toArray()

    //contents 
    let contents = Array.from({length:a},()=> Random.contents(RNG))

    return {
      sz,
      a,
      themes : themes.map((t,i)=> sp[i] ? sp[i] : Themes[t]),
      sp,
      hex,
      contents
    }
  }
}

const Site = (seed=chance.integer(),sz)=>{
  let RNG = new Chance(seed)
  sz = sz || RNG.weighted([0, 1, 2, 3, 4], [4, 4, 2, 1, 1])

  const sites = sz != 4 ? [Random.site(RNG, sz)] : Array.from({
    length: DiceSum(RNG, "1d4+1")
  }, ()=>Random.site(RNG, RNG.weighted([0, 1, 2], [3, 4, 3])))

  return sites
}

export {Site}
