/*
  Useful Functions 
*/
import {BuildArray, SpliceOrPush, chance} from "./random.js"

/*
  UI Resources  
*/

const Main = (app)=>{
  const {html} = app
  const {savedGames} = app.state 

  return html`
  <div class="flex flex-column justify-center m-auto mw6">
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Planes"}>Explore the Planes</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Factions"}>Factions</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Pantheons"}>Pantheons</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.generate()}>Generate New</div>
    <div class="dropdown">
      <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70  br2 mv1 pa2">Load</div>
      <div class="w-100 dropdown-content bg-white ba bw1 pa1">
        ${savedGames.map(([name,id])=> html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>app.load(id)}>Load ${name}</div>`)}
      </div>
    </div>
    
  </div>
  `
}

//Main Explorer Display
const Explorers = (app)=>{
  const {html, characters, game} = app

  const Character = (C) => html`
  <div class="bg-white-70 br2 mw6 ma1 pa1">
    <div class="flex flex-wrap justify-between">
      <h3 class="ma0 mv1">${C.name}</h3>
      <div class="pointer b white underline-hover br1 pa1 ${C.isHired ? "bg-green" : "bg-light-blue"}" onClick=${()=> C.hire()}>${C.isHired ? "Hired" : "Hire"}</div>
    </div>
    <div class="ph1">
      <div class="flex justify-between">
        <div>${C.people.short}</div>
        <div>${C.cost/10} gp/month</div>
      </div>
      <div>LV: ${C.level} ${C.level>1 ? C.classes.join("/") : C.classes[0]}</div>
      <div class="flex justify-center">
        ${Object.entries(C.saves).map(([save,val],i)=> html`
        <div class="mh2">
          <div class="f4"><b>${save}</b> +${val}</div>
          ${C.actionsBySave[i].map(a => html`<div><b>${a[0]}</b> ${a[1]}</div>`)}
        </div>`)}
      </div>
      <div><b>Location:</b> <span class="link pointer dim underline-hover blue mh1" onClick=${()=>app.show = ["areas", C.location.id].join(".")}>${C.location.parent.name}, ${C.location.name}</span></div>
    </div>
  </div>
  `

  //final html
  return html`
  <div class="flex justify-center">
    ${Object.values(characters).map(Character)}
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

  const PlaneRegions = (p) => html`
  <div class="ba br2 mv1 pa1">
    <h2 class="mv1" onClick=${()=>app.updateState("reveal", SpliceOrPush(reveal,p.name))}><span class="pointer underline blue">${p.name}</span> [${p.children.length}]</h2>
    <div class=${reveal.includes(p.name) ? "" : "hidden"}>
      ${p.rLayers.map(([lName,regions])=>html`
      <div class="bt mv1 pa1">
        <div class="flex items-center justify-between">
          <h3 class="mv0">${lName}</h3>
          <div class="dropdown">
            <div class="link pointer underline-hover b white tc bg-light-blue br2 pa1">Add Region</div>
            <div class="dropdown-content bg-white ba bw1 pa1">
              ${terrains.map(t=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>app.addRegion("plane",[p.name,lName].join(","),{terrain:t})}>${t}</div>`)}
            </div>
          </div>
        </div>
        ${regions.map(r=>html`<div class="link pointer dim underline-hover blue mh1" onClick=${()=>app.show = ["areas", r.id].join(".")}>${r.name}</div>`)}
      </div>`)}
    </div>
  </div>
  `

  return html`
  <div class="flex justify-center">
    <div class="flex flex-column mw6 bg-white-70 db br1 mh1 pa1"><h2 class="ma0">Inner Planes</h2>${innerP.map(PlaneRegions)}</div>
    <div class="flex flex-column mw6 bg-white-70 db br1 mh1 pa1"><h2 class="ma0">Outer Planes</h2>${outerP.map(PlaneRegions)}</div>
  </div>
  `
}

//Manage faction display 
const Factions = (app)=>{
  const {html, activeFactions} = app
  const {toGenerate} = app.state
  const _fronts = app.gen.Fronts

  //pull lists for selection of new factions 
  const [_Sigil,_Outsiders] = Object.entries(app.gen.Factions).reduce((all,f,i)=>{
    let what = f[1].class == "Sigil" ? 0 : 1
    all[what].push(f)
    return all
  }
  , [[], []])

  //create a new faction 
  const newFaction = (opts = {})=>{
    new app.gen.Faction(app,opts)
    app.refresh()
  }

  //lists of existing factions 
  const outsiders = activeFactions.filter(f=>f.hasClass("Outsider"))
  const sigil = activeFactions.filter(f=>f.hasClass("Sigil"))
  const created = activeFactions.filter(f=>f.class.length == 1)

  //final html
  return html`
  <div class="flex justify-center">
    <div class="ma1">
      <div class="flex flex items-center justify-between">
        <h2 class="mv1">Sigil</h2>
        <div class="flex">
          <select class="pa1" value=${toGenerate} onChange=${(e)=> app.updateState("toGenerate",e.target.value)}>
            ${_Sigil.map(([name,f])=>html`<option value=${name}>${name}</option>`)}
          </select>
          <div class="dim pointer underline-hover b white bg-gray br2 pa1" onClick=${()=>newFaction({template:toGenerate, name:toGenerate})}>Add</div>
        </div>
      </div>
      ${sigil.map(f => f.UI)}
    </div>
    <div class="ma1">
      <div class="flex flex items-center justify-between">
        <h2 class="mv1">Outsiders</h2>
        <div class="flex">
          <select class="pa1" value=${toGenerate} onChange=${(e)=> app.updateState("toGenerate",e.target.value)}>
            ${_Outsiders.map(([name,f])=>html`<option value=${name}>${name}</option>`)}
          </select>
          <div class="dim pointer underline-hover b white bg-gray br2 pa1" onClick=${()=>newFaction({template:toGenerate, name:toGenerate})}>Add</div>
        </div>
      </div>
      ${outsiders.map(f => f.UI)}
    </div>
    <div class="ma1 ${created.length == 0 ? "hidden" : ""}">
      <div class="flex flex items-center justify-between">
        <h2 class="mv1">Non-Aligned</h2>
        <div class="flex">
          <select class="pa1" value=${toGenerate} onChange=${(e)=> app.updateState("toGenerate",e.target.value)}>
            ${_fronts.map(name=>html`<option value=${name}>${name}</option>`)}
          </select>
          <div class="dim pointer underline-hover b white bg-gray br2 pa1" onClick=${()=>newFaction({front:toGenerate})}>Add</div>
        </div>
      </div>
      ${created.map(f => f.UI)}
    </div>
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

//Site Display 
const Site = (app)=>{
  const {html, areas, area} = app
  const {view, iframe, generated} = app.state
  const {region} = area
  const {delves} = region

  //content of an area 
  let ccolors = ["hazard", "red", "discovery", "blue", "creature", "orange", "leader", "purple"]
  const perContent = ([c,i])=>html`
  <div class="flex items-center tc pointer ${"bg-" + ccolors[ccolors.indexOf(c) + 1]} br2 white b dim pa1">
    <span>${i}</span>
    <img src=${"img/" + c + ".png"} width="17" height="17"></img>
  </div>
  `

  const perArea = (a,i)=>html`
  <div class="flex items-center justify-between">
    <div class="flex items-center"> 
      <div class="f6 link dim dib bg-gray br2 tc white b pa1" style="min-width:45px;">#${i + 1}</div>
      <div class="mh2">${a.text}</div>
    </div> 
    <div class="flex items-center">${Object.entries(a.contents).map(perContent)}</div>
  </div>`

  //show site data for ruins/dungeons 
  return html`
  <div class="bb bw2 flex items-center justify-between ma1">
    <div class="f4">${region.name}, ${region.terrain}, ${region.alignment} [${region.safety}]</div>
    <div class="br2 bg-light-blue dim pointer tc b white ma1 pa1" onClick=${()=>app.setArea(region.id)}>Return to Region</div>
  </div>
  <div class="mh2 pt2">
    <div class="f4">${area.text}</div>
    <div><span class="b">Themes:</span> ${area.themes.join(", ")}</div>
    <div class="f5 ba mv1 pa1">
      ${area.children.map(perArea)}
    </div>
  </div>
  `
}

const Dialog = (app)=>{
  let {showDialog} = app.state

  return showDialog == "" ? "" : app.html`<div class="absolute ma6 pa2 o-80 bg-washed-blue br3 shadow-5 z-2">${this[showDialog](app)}</div>`
}

const About = (app)=>{
  return app.html`
        <div>
          <h2 class="ma0 i">Deep in the 'Verse...</h2>
          <p class="i">A ringworld spins around a standard yellow-orange star. 
          Not a titanic ringworld that encircles the whole star, but a more mundane one. 
          It is comprised of 777 plates each 6000 km wide and long. It only has a dameter of 1.48 million kilometers, 
          but it has an area equivalent to 55 Earths. 
          </p>
          <p class="i">It is maintained (ruled) by the Seven, a group of cosmically powered AIs, 
          that initially seeded the ring with life so that they could play as gods. 
          Unfortunately their first experiment didn't end well. The Cataclysm left most plates devoid of life, 
          but the Seven have decided to try again. 
          </p>
          <p class="i">You are one of their proxies, given dominion over one (or a number) of plates. 
          While the land is established, the rest is your canvas - you will shape its features, creatures, people and it's future. 
          </p>
          <div class="mh6">
            <a class="tc f6 link dim dib pv2 br2 white bg-dark-green w-100" href="#0" onClick=${()=>app.showDialog("")}>Continue</a>
          </div>
          <p class="tc">The goal of this project is to create the most interesting fantasy world that you can. 
          There is no PvP, focus on creative world building. 
          </p>
          <div class="mh6">
            <a class="tc f6 link dim dib pv2 br2 white bg-dark-green w-100" href="https://www.stargaze.zone/launchpad/stars1avmaqtmxw9g43mgpxzuhv074gmzm5wharxrvlsfp4ze7246gyqdqtr9a0l">Get a Realm on Stargaze</a>
          </div>
        </div>
        `
}

export {Main, Planes, Dialog, About, Explorers, Pantheons, Factions}
