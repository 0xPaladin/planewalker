const chance = new Chance()
const rInt = (RNG,min,max)=>RNG.integer({
  min,
  max
})
const sumDice = (RNG,dice)=>RNG.rpg(dice, {
  sum: true
})

/*
  Honeycomb
  https://abbekeultjes.nl/honeycomb/
*/
import "../lib/honeycomb-grid.min.js"

const {defineHex, Grid, rectangle} = Honeycomb
const Neighboors = [[1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1]]

//Create a hex class:
const Hex = Honeycomb.defineHex({
  dimensions: 30,
  origin: 'topLeft'
})

const BaseGrid = (width,height) => new Grid(Hex, rectangle({ width, height}))

//create a random grid based upon picking random Neighboors
const RandomGrid = (seed=chance.integer(),n)=>{
  const RNG = new Chance(seed)
  n = n || 10 + sumDice(RNG, '2d20')

  const ids = ["0.0"]

  while (ids.length < n) {
    //pick Neighboor 
    const _N = RNG.pickone(Neighboors)
    //pick hex - split to xy and then add Neighboor 
    const qr = RNG.pickone(ids).split(".").map((v,j)=>Number(v) + _N[j]).join(".")
    //check if exists 
    if (!ids.includes(qr)) {
      //if not push to ids and set to last 
      ids.push(qr)
    }
  }

  return new Grid(Hex,ids.map(id=>id.split(".").map(Number)))
}

//create a random grid based a walk, trying to pick the last chosen id 
const RandomWalk = (seed=chance.integer(),n)=>{
  const RNG = new Chance(seed)
  n = n || 10 + sumDice(RNG, '2d20')

  const ids = ["0.0"]
  let last = "0.0", i = 0;

  while (ids.length < n) {
    let use = i < 3 ? last : RNG.pickone(ids)
    //pick Neighboor 
    const _N = RNG.pickone(Neighboors)
    //pick hex - split to xy and then add Neighboor 
    const qr = use.split(".").map((v,j)=>Number(v) + _N[j]).join(".")
    //check if exists 
    if (!ids.includes(qr)) {
      //if not push to ids and set to last 
      ids.push(qr)
      i = 0 
    }
    i++
  }

  return new Grid(Hex,ids.map(id=>id.split(".").map(Number)))
}

//create a chain of ids for a terrain 
const Chain = (RNG,hex,n)=>{
  const ids = [];
  
  const claim = (id) => {
    ids.push(id)
    hex.splice(hex.indexOf(id),1)
  }

  //claim first hex
  claim(RNG.pickone(hex))
  while (ids.length < n) {
    //pick Neighboor 
    const _N = RNG.pickone(Neighboors)
    //pick hex - split to xy and then add Neighboor 
    const id = RNG.pickone(ids).split(",").map((v,j)=>Number(v) + _N[j]).join(",")
    //check if exists 
    if (!ids.includes(id) && hex.includes(id)) {
      //if not push to ids and set to last 
      claim(id)
    }
  }

  return [ids,hex]
}

export {BaseGrid as Grid,RandomGrid,Chain,RandomWalk}