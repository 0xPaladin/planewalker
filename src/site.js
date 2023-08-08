/*
  Contains setting data : elements, magic types, etc 
*/
import * as Details from "./data.js"

/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, chance} from "./random.js"


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

const Random = {
  element(RNG=chance) {
    return RNG.pickone(RNG.pickone(Details.element).split("/"))
  },
  magic(RNG=chance) {
    return RNG.pickone(Details.magic)
  },
  aspect(RNG=chance) {
    return RNG.pickone(Details.aspect).split("/")[0]
  },
  creature(RNG=chance) {
    return RNG.pickone(Details.creature)
  },
  danger (RNG) {
    return RNG.weighted(["leader","creature","hazard"],[1,6,5])
  },
  contents(RNG=chance) {
    const _what = RNG.weighted(["1d4.danger","1.danger","1.danger,1.discovery","1d4.danger,1.discovery","1.discovery","1d4.danger,1d4.discovery","1.danger,1d4.discovery","1d4.discovery"],[1,3,2,1,2,1,1,1])
    const what = _what.split(",").map(w=> {
      let [d,_w] = w.split(".")
      d = d.includes("d") ? SumDice(d,RNG) : Number(d)

      //if danger roll for what 
      _w = _w != "danger" ? [d,_w].join(" ") : Array.from({length:d},()=> Random.danger(RNG))
      
      return _w
    }).flat()

    return what 
  },
  site(RNG=chance, scale) {
    //number of themes based on scale - start with the inhabiting creature type 
    const themes = [Random.creature(RNG)]
    for(let i = 1; i < 2+scale; i++) {
      let _t = RNG.pickone(["creature","element","magic","aspect","aspect"])
      themes.push(Random[_t](RNG))
    }

    //number of areas 
    const sz = SumDice(Areas[scale],RNG)
    
    //get hex 
    const hex = RandomWalk(RNG.seed, sz).toArray()

    //contents 
    let contents = Array.from({length:sz},()=> Random.contents(RNG))

    return {
      sz,
      scale,
      themes, 
      hex,
      contents
    }
  }
}

const Site = (seed=chance.integer(),scale)=>{
  let RNG = new Chance(seed)
  scale = scale || RNG.weighted([0, 1, 2, 3, 4], [4, 4, 2, 1, 1])

  //generate indiviual sites 
  const sites = scale != 4 ? [Random.site(RNG, scale)] : Array.from({
    length: DiceSum(RNG, "1d4+1")
  }, ()=>Random.site(RNG, RNG.weighted([0, 1, 2], [3, 4, 3])))

  //total count of site areas 
  let sz = sites.reduce((sum,s)=>sum+s.sz,0)
  //total tags 
  let tags = sites.map(s => s.themes).flat()

  return {sz,tags,sites}
}

export {Site}
