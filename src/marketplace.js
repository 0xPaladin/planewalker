/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, capitalize, chance} from "./random.js"

import*as Gear from "./gear.js"

const AllResources = ["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"]

/*
  Market Pricing 
*/
const Pricing = (data, sale = false, need =[], surplus=[])=>{
  let [id,base,what,rank] = data

  //'resource,essence,material,Weapon,Armor,Equipment,Potion,Magical,Power
  const index = {
    Resource: AllResources,
    Materials: ["martial", "potions", "clothing", "equipment", "jewelry"],
    Equipment: ["Documents", "Gear", "Implements", "Supplies", "Tools", "Instrument"],
    Armor: ["Light", "Medium", "Heavy", "Shield"],
    Weapon: ["Simple", "Light Melee", "Melee", "Heavy Melee", "Light Ranged", "Ranged", "Heavy Ranged"],
    Potion: ["Other", "Healing"]
  }

  const prices = {
    Resource: [2, 2, 5, 4, 10],
    Materials: [1, 1, 0.5, 1, 2.5],
    Essence: [5],
    Equipment: [5, 20, 20, 10, 20, 20],
    Armor: [3, 25, 120, 1],
    Weapon: [1, 1, 2, 5, 1, 2, 5],
    Potion: [2.5, 1],
    Magical: [50],
    Power: [50]
  }

  //based on rank 
  let multiplier = [1, 2, 4, 8, 16, 32][rank]
  multiplier *= need.join().includes(what) ? 2 : surplus.join().includes(what) ? 0.5 : 1 
  multiplier *= (sale ? 0.5 : 1)

  let variance = chance.weighted([0.7, 0.8, 0.95, 1.1, 1.2], [1, 2, 4, 2, 1]) + RandBetween(1, 10) / 100

  //price index and price 
  let pi = index[base] ? base == "Resource" ? AllResources.reduce((v,r,i)=>r.includes(what) ? i : v, 0) : index[base].indexOf(what) > -1 ? index[base].indexOf(what) : 0 : 0
  let p = prices[base][pi] * multiplier * variance 

  return Number(p.toFixed(1))
}

//items for marketplace 
const Marketplace = (region,sid,scale)=>{
  let bought = region.app.game.bought 
  let Gen = Gear
  let time = Math.floor(region.app.game.time / 30)
  let RNG = new Chance(Hash([region.id, "market" , sid, time]))

  //needs and surplus 
  let surplus = region.lookup("resource").map(r => r.specifics[0])
  let need = AllResources.filter(r => !surplus.includes(r))
  need = [RNG.pickone(need)]

  //final stock qty and market  
  let Qty = {}, M = {
    time,
    surplus,
    need,
    pages:'Resource,Materials,Weapon,Armor,Equipment,Potion,Magical,Power,NPC'.split(",")};

  //setup market categories 
  M.pages.forEach(c => M[c] = [])

  //maker functions 
  const MakeNPC = (rarity,o={}) => {
    let id = RNG.natural()
    let opts = Object.assign(o,{id,rarity})
    let npc = region.NPC(opts)
    npc.qty = 1 
    //add to stock 
    Qty[id] = npc 
  }
  //make items for the marketplace 
  const MakeLoot = (gen,what,rank,qty)=> {
    let opts = {id:RNG.natural(),what,rank}
    let loot = Gen[gen](...(gen == "Materials" ? [region, opts] : [opts]))
    loot.price = Pricing(loot.data,false,need,surplus)
    //add to stock 
    Qty[loot.text] = Qty[loot.text] || loot 
    Qty[loot.text].qty = Qty[loot.text].qty ? Qty[loot.text].qty+qty : qty
  }

  //what is always avialble 
  region.lookup("resource").map(r => r.short).forEach(r => MakeLoot("Resource", r, 0, 99))
  BuildArray(3, ()=>MakeLoot("Materials", "Materials", 0, 1))
  "Light,Medium,Heavy,Shield".split(",").forEach(e=>MakeLoot("Armor", e, 0, 1))
  "Simple,Light Melee,Melee,Heavy Melee,Light Ranged,Ranged,Heavy Ranged".split(",").forEach(e=>MakeLoot("Weapon", e, 0, 1))
  "Documents,Gear,Implements,Tools".split(",").forEach(e=>MakeLoot("Equipment", e, 0, 99))
  BuildArray(2,()=>MakeNPC(0))
  let Animals = ["Commoner,Porter","Soldier,Soldier"]
  Animals.map(trade=> MakeNPC(0,{what:"Animal",trade,size:"large"}))

  //market size based upon settlements
  let max = scale + 2
  //number of items at rank 
  let _ranks = BuildArray(max, (v,i)=>Math.pow(2, max - i))

  //build stock 
  let cat = 'Resource,Essence,Materials,Weapon,Armor,Equipment,Potion,Magical,Power,NPC'
  let stock = _ranks.map((n,i)=>BuildArray(n, ()=>[WeightedString(cat+'/0,1,1.5,1,1,1.5,1,0.5,1,1', RNG), i])).flat().forEach(([what,rank])=>{
    //don't need rank 0 basic stuff 
    if (rank == 0 && what == "Equipment") {
      return
    }

    let item = 'Essence,Materials'.includes(what) ? MakeLoot("Materials", what, rank, 1) : what == "NPC" ? MakeNPC(rank) : MakeLoot(what, undefined, rank, 1)
  })
  //add stock to final market arrays 
  Object.values(Qty).forEach(s => {
    let what = s.data[1]
    //check if bought 
    let bid = Hash([region.id,what == "NPC" ? s.id : s.text])
    s.qty -= (bought[bid] || 0) 
    if(s.qty <= 0){
      return
    }
    
    //assign to market 
    M[what].push(s)
  })

  //sort final arrays 
  let _Sort = (arr,i = 2)=>arr.sort((a,b)=>a.data[i].localeCompare(b.data[i]))
  M.pages.forEach(c => _Sort(M[c]))
  
  return M
}

const UI = (region)=>{
  let {html, game} = region.app
  let d = region.app.state.dialog
  let[what,id,ui,eid="0",_page="Resource"] = d.split(".")
  //get region info 
  let {isKnown} = region.view()
  let toDiscover = region.children.filter(c => !isKnown.includes(c.id)).map(c=>c.id)
  //buyer 
  let buyer = region.characters.find(c=>c.id == eid)
  let _forSale = buyer.inventory.filter(item => item.maySell)
  //marketplace of region 
  let settlement = buyer.location.atFeature
  let M = Marketplace(region,settlement.id,settlement.scale)

  let pages = M.pages 
  if(eid != "0"){
    pages.push("Explorer","Sell Items")
  }

  //add price to sale item 
  const addPrice = (item) => {
    item.price = Pricing(item.data,true,M.need,M.surplus)
    return item 
  }
  //may buy something  
  const _mayBuy = (price) => buyer.mayBuy(_page == "NPC" ? "npc" : "item",price)

  //show market page 
  const ShowPage = (p)=>region.app.updateState("dialog", [what, id, ui, eid, p].join("."))

  //explorer side of market place allows transfer of coin and learning dark 
  const ExplorerMarket = () => html`
  <div>
    ${_mayBuy(5) && toDiscover.length>0 ? html`<div class="bg-green br2 pointer tc b white underline-hover ma1 pa2" onClick=${()=>buyer.takeAction("learnDark",toDiscover)}>Learn Dark of the Region (5g)</div>`: ""}
    ${buyer.toUnbond.map(p => html`<div class="bg-green br2 pointer tc b white underline-hover ma1 pa2" onClick=${()=>buyer.takeAction("unbond",p)}>${buyer.name} Unbond > ${p.text} (10g)</div>`)}
    ${game.coin > 100 ? html`<div class="bg-green br2 pointer tc b white underline-hover ma1 pa2" onClick=${()=>buyer.takeAction("transferCoin",100)}>Transfer 100g to ${buyer.name}</div>` : ""} 
  </div>
  `

  //each market place lists items - allows purchase if buyes have coin 
  //add explorer items to sell to market 
  const ForSale = (item) => html`<div class="pointer underline-hover b tc bg-light-gray br2 mv1 pa1" onClick=${()=>buyer.marketSell(item,item.price)}>1x ${item.text || item.short} (${item.price}g)</div>`
  //manage basic items for purchase 
  const Explore = (item)=> html`<div class="${_mayBuy(item.price) ? "pointer underline-hover" : ""} b tc bg-light-gray br2 mv1 pa1" onClick=${()=> _mayBuy(item.price) ? buyer.marketBuy(item,region.id) : null}>${item.qty}x ${item.text || item.short} (${item.price}g)</div>`
  //build market place doesn't do buying 
  const Build = (item)=>html`<div class="b tc bg-light-gray br2 mv1 pa1">${item.qty}x ${item.text || item.short} (${item.price}g)</div>`

  return html`
  <div class="fr pointer dim underline-hover hover-red bg-gray br2 white b pa1" onClick=${()=>region.app.updateState("dialog","")}>X</div>
  <div style="width:600px">
      <h3 class="ma0 mb1">${buyer.name} @ ${region.name} Marketplace</h3>
      <div class="mh5">
        <div class="flex flex-wrap justify-center">${pages.map(p=>html`<div class="${p == _page ? "bg-gray white" : "bg-light-gray"} pointer b hover-bg-gray hover-white pa2" onClick=${()=>ShowPage(p)}>${p}</div>`)}</div>
      </div>
      <div class="w-100 pa2">
        ${_page == "Explorer" ? ExplorerMarket() : _page == "Sell Items" ? _forSale.map(item => ForSale(addPrice(item))) : M[_page].map(s=>game.mode == "Explorer" ?  Explore(s) : Build(s))}
      </div>
    </div>`
}

export {UI as MarketUI}
