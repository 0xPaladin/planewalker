/*
  Useful Functions 
*/
import {BuildArray, SpliceOrPush, chance} from "../random.js"

/*
  UI Resources  
*/

const Main = (app)=>{
  const {html} = app
  const {savedGames} = app.state 

  return html`
  <div class="flex flex-column justify-center m-auto mw6">
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Planes"}>Explore the Planes</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Explorers"}>Explorers</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Factions"}>Factions</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Pantheons"}>Pantheons</div>
    <a class="f3 tc link black pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" href="index.html">Shape the Planes</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.generate()}>New Game</div>
    <div class="dropdown">
      <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70  br2 mv1 pa2">Load</div>
      <div class="dropdown-content w-100 bg-white ba bw1 pa1">
        ${savedGames.map(([name,id])=> html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>app.load(id)}>Load ${name}</div>`)}
      </div>
    </div>
    
  </div>
  `
}

//Main Explorer Display
const Explorers = (app)=>{
  const {html, characters, game} = app

  //final html
  return html`
  <div class="flex flex-wrap justify-center">
    ${Object.values(characters).map(c => c.UI)}
  </div>
  `
}

//Main PLane Display
const Planes = (app)=>{
  const {html, planes, primes, areas} = app
  const {reveal} = app.state

  let terrains = ["random","islands","costal","lake","barren", "wetland", "woodland", "lowlands","highlands"]
  let innerP = planes.filter(p => p.tags.includes("inner"))
  let outerP = planes.filter(p => p.tags.includes("outer"))

  const PrimeRegions = (p) => html`
  <div class="ba br2 mv1 pa1">
    <h2 class="mv1" onClick=${()=>app.updateState("reveal", SpliceOrPush(reveal,p.id))}><span class="pointer underline blue">${p.name}</span> [${p.land.length}]</h2>
    <div class="ph2 ${reveal.includes(p.id) ? "" : "hidden"}">
      <div>Water: ${p.water}%</div>
      ${p.continents.map(c=>html`
      <div class="bt mv1 pa1">
        <h3 class="mv0">${c.name}</h3>
        ${c.children.map(r=>html`<div class="link pointer dim underline-hover blue mh1" onClick=${()=>app.show = ["areas", r.id].join(".")}>${r.name}</div>`)}
      </div>`)}
    </div>
  </div>
  `

  const PlaneRegions = (p) => html`
  <div class="ba br2 mv1 pa1">
    <h2 class="mv1" onClick=${()=>app.updateState("reveal", SpliceOrPush(reveal,p.name))}><span class="pointer underline blue">${p.name}</span> [${p.children.length}]</h2>
    <div class=${reveal.includes(p.name) ? "" : "hidden"}>
      ${p.rLayers.map(([lName,regions])=>html`
      <div class="bt mv1 pa1">
        <div class="flex items-center justify-between">
          <h3 class="mv0">${lName}</h3>
        </div>
        ${regions.map(r=>html`<div class="link pointer dim underline-hover blue mh1" onClick=${()=>app.show = ["areas", r.id].join(".")}>${r.name}</div>`)}
      </div>`)}
    </div>
  </div>
  `

  return html`
  <div class="flex justify-center">
    <div class="flex flex-column mw6 bg-white-70 db br1 mh1 pa1"><h2 class="ma0">Primes</h2>${primes.map(PrimeRegions)}</div>
    <div class="flex flex-column mw6 bg-white-70 db br1 mh1 pa1"><h2 class="ma0">Inner Planes</h2>${innerP.map(PlaneRegions)}</div>
    <div class="flex flex-column mw6 bg-white-70 db br1 mh1 pa1"><h2 class="ma0">Outer Planes</h2>${outerP.map(PlaneRegions)}</div>
  </div>
  `
}

//Manage faction display 
const Factions = (app)=>{
  const {html, activeFactions} = app
  const {toGenerate} = app.state

  //create a new faction 
  const newFaction = (opts = {})=>{
    new app.gen.Faction(app,opts)
    app.refresh()
  }

  //pull lists for selection of new factions 
  const [Sigil,Outsiders] = Object.entries(app.gen.Factions).reduce((all,[name,f],i)=>{
    all[f.class == "Sigil" ? 0 : 1].push(name)
    return all
  }
  , [[], []])

  //used in selection 
  const Select = {
    Sigil,Outsiders,
    "Non-Aligned" : app.gen.Fronts
  }

  //lists of existing factions 
  const Existing = {
    Sigil : activeFactions.filter(f=>f.hasClass("Sigil")),
    Outsiders : activeFactions.filter(f=>f.hasClass("Outsider")),
    "Non-Aligned" : activeFactions.filter(f=>f.class.length == 1)
  }

  //final html
  return html`
  <div class="flex flex-wrap justify-center">
    ${Object.entries(Existing).map(([title,eF])=> html`
    <div class="ma1">
      <div class="flex flex items-center justify-between">
        <h2 class="mv1">${title}</h2>
        <div class="flex">
          <select class="pa1" value=${toGenerate} onChange=${(e)=> app.updateState("toGenerate",e.target.value)}>
            ${Select[title].map(name=>html`<option value=${name}>${name}</option>`)}
          </select>
          <div class="dim pointer underline-hover b white bg-gray br2 pa1" onClick=${()=>newFaction({template:toGenerate, name:toGenerate})}>Add</div>
        </div>
      </div>
      ${eF.map(f => f.UI)}
    </div>
    `)}
  </div>
  `
}

//Manage pantheon display 
const Pantheons = (app)=>{
  const {html, pantheons} = app

  const newPantheon = ()=>{
    new app.gen.Pantheon(app)
    app.refresh()
  }

  //final html
  return html`
  <div class="m-auto mw6">
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>newPantheon()}>Add New Pantheon</div>
  </div>
  <div class="flex flex-wrap justify-center">
    ${pantheons.map(p=>html`
    <div class="bg-white-40 ba br2 mh1 pa1">
      <h3 class="mv1">${p.name}</h3>
      <div class="ph1">${p.children.map((c,i)=>c.UI)}</div>
    </div>`)}
  </div>
  `
}

const Dialog = (app)=>{
  let[what,id,ui] = app.state.dialog.split(".")

  return app.html`
  <div class="fixed z-2 top-1 left-1 bottom-1 right-1 flex items-center justify-center">
    <div class="overflow-y-auto o-90 bg-washed-blue br3 shadow-5 pa2">
      <div class="fr pointer dim underline-hover hover-red bg-gray br2 white b pa1" onClick=${()=>app.updateState("dialog","")}>X</div>
      ${app[what][id][ui]}
    </div>
  </div>`
}

export {Main, Planes, Dialog, Explorers, Pantheons, Factions}
