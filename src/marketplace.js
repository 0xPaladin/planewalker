/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, capitalize, chance} from "./random.js"

import*as Gear from "./gear.js"

/*
  Market Pricing 
*/
const Pricing = (data)=>{
  let base = data[1] == "Resource" ? data[2] : data[1]
  let what = data[1] == "Resource" ? data[4] : data[2]
  let rank = data[3]

  //'resource,essence,material,Weapon,Armor,Equipment,Potion,Magical,Power
  const index = {
    Resource: ["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"],
    Materials: ["martial", "potions", "clothing", "equipment", "jewelry"],
    Equipment: ["Documents", "Gear", "Implements", "Supplies", "Tools", "Instrument"],
    Armor: ["Light", "Medium", "Heavy", "Shield"],
    Weapon: ["Simple", "Light Melee", "Melee", "Heavy Melee", "Light Ranged", "Ranged", "Heavy Ranged"],
    Potion: ["Other", "Healing"]
  }

  const prices = {
    Resource: [20, 20, 50, 40, 100],
    Materials: [10, 10, 5, 10, 25],
    Essence: [50],
    Equipment: [50, 200, 200, 100, 200, 200],
    Armor: [30, 250, 1200, 10],
    Weapon: [10, 10, 20, 50, 10, 20, 50],
    Potion: [25, 10],
    Magical: [200],
    Power: [200]
  }

  //based on rank 
  const multiplier = [1, 2, 4, 8, 16, 32][rank]

  let variance = chance.weighted([0.7, 0.8, 0.95, 1.1, 1.2], [1, 2, 4, 2, 1]) + RandBetween(1, 10) / 100

  //price index and price 
  let pi = index[base] ? base == "Resource" ? index.Resource.reduce((v,r,i)=>r.includes(data[3]) ? i : v, 0) : index[base].indexOf(what) > -1 ? index[base].indexOf(what) : 0 : 0
  let p = prices[base][pi] * multiplier * variance

  return Math.floor(p)
}

const Resource = (base,what,rank)=>{
  let r = {
    base,
    what,
    rank
  }
  r.text = "resource" == base ? capitalize(what) : [capitalize(base), ": ", base == "essence" ? what[2] : what].join("")

  if (base == "essence") {
    r.d = chance.weighted([6, 8, 10, 12], [2, 5, 2, 1])
  }
  return
}

//items for marketplace 
const Marketplace = (region)=>{
  let bought = region.app.game.bought 
  let Gen = region.app.gen
  let time = Math.floor(region.app.game.time / 30)
  let RNG = new Chance(Hash([region.id, "market" , time]))

  const MakeNPC = (rarity,o={}) => {
    let opts = Object.assign(o,{id:RNG.natural(),rarity})
    let npc = region.NPC(opts)
    npc.qty = 1 
    return npc 
  }
  //make items for the marketplace 
  const MakeLoot = (gen,what,rank,qty)=> {
    let opts = {id:RNG.natural(),what,rank}
    let loot = Gen[gen](...(gen == "Resource" ? [region, opts] : [opts]))
    loot.price = Pricing(loot.data)
    loot.qty = qty 
    return loot 
  }

  //base available 
  const base = {
    _Armor: ["Light", "Medium", "Heavy", "Shield"],
    _Weapon: ["Simple", "Light Melee", "Melee", "Heavy Melee", "Light Ranged", "Ranged", "Heavy Ranged"],
    _Equipment: "Documents,Gear,Implements,Tools"
  }

  //what is always avialble 
  let Resources = [MakeLoot("Resource", "Resource", 0, 99), ...BuildArray(3, ()=>MakeLoot("Resource", "Materials", 0, 1))]
  let Martial = [...base._Armor.map(e=>MakeLoot("Armor", e, 0, 1)), ...base._Weapon.map(e=>MakeLoot("Weapon", e, 0, 1))]
  let Equipment = base._Equipment.split(",").map(e=>MakeLoot("Equipment", e, 0, 99))
  let Magical = []
  let Animals = ["Commoner,Porter","Soldier,Soldier"]
  let Ally = [...BuildArray(2,()=>MakeNPC(0)),...Animals.map(trade=> MakeNPC(0,{what:"Animal",trade,size:"large"}))]

  //market size based upon settlements
  let settlements = region.lookup("settlement")
  let _ranks = settlements.map(s=>s.scale).reduce((m,s)=>{
    //mak rank of what is available 
    let max = s + 2
    //number of items at rank 
    BuildArray(max, (v,i)=>m[i] += Math.pow(2, max - i))
    //return totals 
    return m
  }
  , [0, 0, 0, 0, 0, 0])

  //what is available 
  let _stock = 'Resource,Essence,Materials,Weapon,Armor,Equipment,Potion,Magical,Power,NPC/'
  _stock += region.lookup("resource").length > 0 ? '1.5,0.5,1.5,0.75,0.75,1.5,1,0.5,1,1' : '0,1,1.5,1,1,1.5,1,0.5,1,1'

  //build stock 
  let qty = {}
  let stock = _ranks.map((n,i)=>BuildArray(n, ()=>[WeightedString(_stock, RNG), i])).flat().forEach(([what,rank])=>{
    //don't need rank 0 basic stuff 
    if (rank == 0 && ["Resource", "Equipment"].includes(what)) {
      return
    }

    let item = 'Resource,Essence,Materials'.includes(what) ? MakeLoot("Resource", what, rank, 1) : what == "NPC" ? MakeNPC(rank) : MakeLoot(what, undefined, rank, 1)

    if(what == "NPC") {
      qty[item.id] = item
    }
    else if (qty[item.text]) {
      qty[item.text].qty += 1
    } else {
      item.price = Pricing(item.data)
      qty[item.text] = item
    }
  }
  )
  //add stock to final market arrays 
  Object.values(qty).forEach(s => {
    let what = s.data[1]
    //check if bought 
    let bid = Hash([region.id,what == "NPC" ? s.id : s.text])
    s.qty -= (bought[bid] || 0) 
    if(s.qty <= 0){
      return
    }
    //assign What Array
    let Item = what == "NPC" ? Ally : what == "Resource" ? Resources : 'Weapon,Armor'.includes(what) ? Martial : 'Potion,Magical,Power'.includes(what) ? Magical : Equipment
    Item.push(s)
  })

  //sort final arrays 
  let _Sort = (arr,i = 2)=>arr.sort((a,b)=>a.data[i].localeCompare(b.data[i]))
  return {
    time,
    Resources: _Sort(Resources),
    Martial: _Sort(Martial),
    Equipment: _Sort(Equipment),
    Magical: _Sort(Magical),
    Ally: _Sort(Ally,2),
  }
}

const UI = (region)=>{
  let {html, game} = region.app
  let d = region.app.state.dialog
  let[what,id,ui,_page="Resources"] = d.split(".")
  //get region info 
  let {isKnown} = region.view()
  let toDiscover = region.children.filter(c => !isKnown.includes(c.id)).map(c=>c.id)
  //marketplace of region 
  let M = Marketplace(region)
  //characters that may buy 
  let buyers = region.characters.filter(c=>c.location.atFeature.what == "settlement" && c.isHired)

  //show market page 
  const ShowPage = (p)=>region.app.updateState("dialog", [what, id, ui, p].join("."))

  //pages of marketplace 
  let pages = game.mode == "Explorer" ? ["Resources", "Martial", "Equipment", "Magical","Ally","Explorer"] : ["Resources", "Martial", "Equipment","Magical","Ally"]     

  //explorer side of market place allows transfer of coin and learning dark 
  const ExplorerMarket = () => html`
  <div>
    ${_buyers(5).length && toDiscover.length>0 ? html`<div class="bg-green br2 pointer tc b white underline-hover ma1 pa2" onClick=${()=>_buyers[0].learnDark(5,toDiscover)}>Learn Dark of the Region (5g)</div>`: ""}
    ${buyers.map(b => b.powersToCrystalize.map(p => html`<div class="bg-green br2 pointer tc b white underline-hover ma1 pa2" onClick=${()=>b.crystalize(p)}>${b.name} Crystalize > ${p.text} (10g)</div>`))}
    ${game.coin > 100 ? buyers.map(b => html`<div class="bg-green br2 pointer tc b white underline-hover ma1 pa2" onClick=${()=>b.transferCoin(100)}>Transfer 100g to ${b.name}</div>`) : ""} 
  </div>
  `

  //each market place lists items - allows purchase if buyes have coin 
  const _buyers = (price) => buyers.filter(b=>b.mayBuy(_page == "Ally" ? "npc" : "item",price))
  const Buyers = (item)=>html`
  <div class="dropdown">
    <div class="pointer link blue underline-hover">${item.text || item.short}</div>
    <div class="dropdown-content bg-white ba bw1 pa1">
      ${_buyers(item.price).map(b=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=> b.marketBuy(item,region.id)}>Buy > ${b.name}</div>`)}
    </div>
  </div>`
  const Explore = (item)=>html`<div class="fl w-50">${_buyers(item.price).length > 0 ? Buyers(item) : item.text || item.short}</div><div class="fl w-25">${item.qty == -1 ? "unl" : item.qty}</div><div class="fl w-25">${item.price}</div>`
  //build market place doesn't do buying 
  const Build = (s)=>html`<div class="fl w-50">${s.text || s.short}</div><div class="fl w-25">${s.qty == -1 ? "unl" : s.qty}</div><div class="fl w-25">${s.price}</div>`

  return html`<div style="width:600px">
      <h3 class="ma0 mb1">${region.name} Marketplace</h3>
      <div class="flex justify-center">${pages.map(p=>html`<div class="${p == _page ? "bg-gray white" : "bg-light-gray"} pointer b hover-bg-gray hover-white pa2" onClick=${()=>ShowPage(p)}>${p}</div>`)}</div>
      <div class="w-100 pa2">
        ${_page == "Explorer" ? "" : html`<div class="b fl w-50">Item</div><div class="b fl w-25">Qty</div><div class="b fl w-25">Price</div>`} 
        ${_page == "Explorer" && buyers.length>0 ? ExplorerMarket() : M[_page].map(s=>game.mode == "Explorer" ? Explore(s) : Build(s))}
      </div>
    </div>`
}

export {UI as MarketUI}
