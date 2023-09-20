/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, capitalize, chance} from "./random.js"

import * as Gear from "./gear.js"

/*
  Market Pricing 
*/
const Pricing = (base,what,rank)=>{
  //'resource,essence,material,Weapon,Armor,Equipment,Potion,Magical,Power
  const index = {
    resource: ["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"],
    material: ["martial", "potions", "clothing", "equipment", "jewelry"],
    Equipment: ["Documents", "Gear", "Implements", "Supplies", "Tools", "Instrument"],
    Armor: ["Light", "Medium", "Heavy", "Shield"],
    Weapon: ["Simple", "Light Melee", "Melee", "Heavy Melee", "Light Ranged", "Ranged", "Heavy Ranged"],
    Potion: ["Other", "Healing"]
  }

  const prices = {
    resource: [20, 20, 50, 40, 100],
    material: [10, 10, 5, 10, 25],
    essence: [50],
    Equipment: [50, 200, 200, 100, 200, 200],
    Armor: [30, 250, 1200, 10],
    Weapon: [2, 10, 20, 50, 10, 20, 50],
    Potion: [25, 10],
    Magical: [200],
    Power: [200]
  }

  //based on rank 
  const multiplier = [1, 2, 4, 8, 16, 32][rank]

  let variance = chance.weighted([0.7, 0.8, 0.95, 1.1, 1.2], [1, 2, 4, 2, 1]) + RandBetween(1, 10) / 100

  //price index and price 
  let pi = index[base] ? base == "resource" ? index.resource.reduce((v,r,i)=>r.includes(what) ? i : v, 0) : index[base].indexOf(what) > -1 ? index[base].indexOf(what) : 0 : 0
  let p = prices[base][pi] * multiplier * variance

  return Math.floor(p)
}

const Resource = (base,what,rank) => {
  let r = {
    base,
    what,
    rank
  }
  r.text = "resource" == base ? capitalize(what) : [capitalize(base), ": ", base == "essence" ? what[2] : what].join("")

  if(base == "essence") {
    r.d = chance.weighted([6,8,10,12],[2,5,2,1])
  }
  return 
}

//items for marketplace 
const Marketplace = (region)=>{
  let time = Math.floor(region.app.game.time / 30)
  let RNG = new Chance(Hash([region.id, "market", time].join(".")))

  //make items for the marketplace 
  const MakeItem = (obj,qty)=> Object.assign(obj,{qty})

  //base available 
  const base = {
    resource: region.lookup("resource").map(r=>r.short),
    essence: region.children.filter(c=>c.essence).map(c=>c.essence),
    material: ["martial", "potions", "clothing", "equipment", "jewelry"],
    _Armor: ["Light", "Medium", "Heavy", "Shield"],
    _Weapon: ["Simple", "Light Melee", "Melee", "Heavy Melee", "Light Ranged", "Ranged", "Heavy Ranged"],
    _Equipment : "Documents,Gear,Implements,Supplies,Tools,Instrument"
  }

  //what is always avialble 
  let Resources = [...base.resource.map(r=>MakeItem(Resource("resource",r,0), -1)), ...base.material.map(r=>MakeItem(Resource("material",r,0), -1))]
  let Martial = [...base._Armor.map(e=>MakeItem(Gear.Armor({what:e}),1)),...base._Weapon.map(e=>MakeItem(Gear.Weapon({what:e}),1))]
  let Equipment = base._Equipment.split(",").map(e=>MakeItem(Gear.Equipment({what:e}),-1))
  let Magical = []

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
  let _stock = 'resource,essence,material,Weapon,Armor,Equipment,Potion,Magical,Power/'
  _stock += base.resource.length > 0 ? '2,0.5,2,0.75,0.75,1.5,1,0.5,1' : '0,1,2,1,1,2,1,0.5,1'

  //build stock 
  let qty = {}
  let stock = _ranks.map((n,i)=>BuildArray(n, ()=>[WeightedString(_stock, RNG), i])).flat().forEach(([what,rank])=>{
    //don't need rank 0 basic stuff 
    if (rank == 0 && ["resource", "material", "Weapon", "Armor", "Equipment"].includes(what)) {
      return
    }

    //assign What Array
    let Item = 'resource,essence,material'.includes(what) ? Resources : 'Weapon,Armor'.includes(what) ? Martial : 'Potion,Magical,Power'.includes(what) ? Magical : Equipment
    let item = base[what] ? MakeItem(Resource(what,RNG.pickone(base[what]),rank), 1) : region.app.gen[what]({id:RNG.natural(),rank})

    //update quantity and push as required
    let qid = [item.text, rank].join()
    qty[qid] = qty[qid] ? qty[qid] + 1 : 1
    item.qty = qty[qid]
    if (item.qty == 1) {
      Item.push(item)
    } else {
      let _item = Item.find(i=>[i.text, i.rank].join() == qid)
      _item.qty = item.qty
    }
  }
  )

  return {
    time,
    Resources: Resources.sort((a,b)=>a.text.localeCompare(b.text)),
    Martial: Martial.sort((a,b)=>a.text.localeCompare(b.text)),
    Equipment: Equipment.sort((a,b)=>a.text.localeCompare(b.text)),
    Magical: Magical.sort((a,b)=>a.text.localeCompare(b.text))
  }
}

const UI = (region)=>{
  let {html} = region.app
  let d = region.app.state.dialog
  let[what,id,ui,_page="Resources"] = d.split(".")
  let {name} = region
  let M = Marketplace(region)
  //pages of marketplace 
  let pages = ["Resources", "Martial", "Equipment", "Magical"]

  //show market page 
  const ShowPage = (p)=>region.app.updateState("dialog", [what, id, ui, p].join("."))

  //pricing varies
  let price = (s)=>Pricing(s.base, s.what, s.rank)

  return html`<div style="width:600px">
      <h3 class="ma0 mb1">${name} Marketplace</h3>
      <div class="flex justify-center">${pages.map(p=>html`<div class="${p == _page ? "bg-gray white" : "bg-light-gray"} pointer b hover-bg-gray hover-white pa2" onClick=${()=>ShowPage(p)}>${p}</div>`)}</div>
      <div class="w-100 pa2">
        <div class="b fl w-50">Item</div><div class="b fl w-25">Qty</div><div class="b fl w-25">Price</div>
        ${M[_page].map(s=>html`<div class="fl w-50">${s.text} [${s.rank}]</div><div class="fl w-25">${s.qty == -1 ? "unl" : s.qty}</div><div class="fl w-25">${price(s)}</div>`)}
      </div>
    </div>`
}

export {UI as MarketUI}