const chance = new Chance()
const RandBetween = (min,max,RNG=chance)=>RNG.integer({
  min,
  max
})
const SumDice = (dice,RNG=chance)=>{
  let [d,b = 0] = dice.split("+")
  return Number(b) + RNG.rpg(d, {
    sum: true
  })
}
const Likely = (p=50,RNG=chance) => RNG.bool({likelihood:p})
const Difficulty = (RNG=chance) => RNG.weighted([0,1,2,3,4,5],[30,30,20,13,5,2])

export {RandBetween,SumDice,Likely,Difficulty,chance}