const chance = new Chance()
const RandBetween = (min,max,RNG=chance)=>RNG.integer({
  min,
  max
})
const SumDice = (dice,RNG=chance)=>{
  let[d,b=0] = dice.split("+")
  return Number(b) + RNG.rpg(d, {
    sum: true
  })
}
const Likely = (p=50,RNG=chance)=>RNG.bool({
  likelihood: p
})
const ZeroOne = (RNG=chance)=>RNG.bool() ? 1 : 0
const Difficulty = (RNG=chance)=>RNG.weighted([0, 1, 2, 3, 4, 5], [30, 30, 20, 13, 5, 2])


const WeightedString = (str,RNG=chance)=>{
  let[w,p] = str.split("/").map(w=>w.split(","))
  if (w.length != p.length) {
    console.log(str)
  }
  return RNG.weighted(w, p.map(Number))
}

/*
  Non Random Helper Functions 
*/
const Hash = (str)=>{
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
    // Convert to 32bit integer
  }
  return hash.toString(16);
}

const SpliceOrPush = (arr,what)=>{
  let i = arr.indexOf(what)
  if (i > -1) {
    arr.splice(i, 1)
  } else {
    arr.push(what)
  }
  return arr
}

const BuildArray = (n,f)=>Array.from({
  length: n
}, f)

export {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, SpliceOrPush, WeightedString, chance}
