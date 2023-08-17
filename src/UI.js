//array from 
const BuildArray = (n,f)=>Array.from({
  length: n
}, f)

/*
  UI Resources  
*/

const Main = ()=>{}

const Site = (app) => {
  const {html,areas,area} = app
  const {view, iframe, generated} = app.state
  const {region} = area
  const {delves} = region

  //content of an area 
  let ccolors = ["hazard","red","discovery","blue","creature","orange","leader","purple"]
  const perContent = ([c,i]) => html`
  <div class="flex items-center tc pointer ${"bg-"+ccolors[ccolors.indexOf(c)+1]} br2 white b dim pa1">
    <span>${i}</span>
    <img src=${"img/"+c+".png"} width="17" height="17"></img>
  </div>
  `

  const perArea = (a,i) => html`
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

const Region = (app) => {
  const {html,areas,area} = app
  const {view} = app.state
  const {children, people} = area

  //hex button 
  const hexButton = (id,n)=>html`<div class="f6 white link dim dib bg-gray tc br2 pa1" style="min-width:45px;"><span class="hex-marker">${n > 1 ? n : ""}⬢</span></div>`

  const dropdownOptions = {
    "wilderness" : ["Random Encounter","Explore"],
    "hazard" : ["Random Encounter","Explore"],
    "resource" : ["Random Encounter","Explore"],
    "creature" : ["Random Encounter","Explore"],
    "dungeon" : ["Random Encounter","Explore"],
    "faction" : ["Explore","Get a Job","Generate a NPC"],
    "settlement" : ["Explore","Get a Job","Generate a NPC"],
    "portal" : ["New Portal"],
  }
  
  //handle drowdown for every features 
  //${BuildArray(c.size,(v,j)=>j).map(j => html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>area.showChild(c,j)}>Show Site ${c.size > 1 ? j+1 : ""}</div>`)} 
  const dropdown = ([where,text,n,i]) => html`
  <div class="pointer dropdown f5 mv1">
    <div class="flex items-center">
      ${hexButton(n)}
      <div class="mh1">${text}</div>
    </div>
    <div class="dropdown-content bg-white ba bw1 pa1">
      ${dropdownOptions[where].map(opt => html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>area.random(opt,where,i)}>${opt}</div>`)}
    </div>
  </div>
  `

  let _view = view.split(".")
  //main region data 
  return html`
  <div class="flex items-end mv2">
    <h2 class="pointer dim ma0">${area.parent.name} ::</h2>
    <div class="dropdown">
      <div class="flex items-end pointer underline-hover">
        <h3 class="ma0 mh1">${area.name}</h3>
        <span class="f5 link dim dib bg-gray white tc br2 mh1 pa1 ph2">✎</span>
      </div>
      <div class="f4 dropdown-content bg-white ba bw1 pa1">
        <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=> area.random("self")}>Randomize</div>
        <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=> area.save()}>Save</div>
        <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=> area.random("neighbor") }>Similar Neighbor</div>
      </div>
    </div>
  </div>
  <div class="flex items-center ma1">
    <h3 class="ma0">${area.terrain[0]}, ${area.alignment} [${area.safety}]</h3>
  </div>
  <div class="ma2">${area.view[_view[2]].map(dropdown)}</div>
  `
}

const Area = (app) => {
  const {html,areas,area} = app
  const {view, iframe, generated} = app.state

  const GenSplice = (i) => {
    generated.splice(i,1)
    app.setState({generated})
  }

  //svg div 
  const svg = html`
  <svg id="map" height="600px" width="600px" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
    <g id="hex"></g>
  </svg>
  `

  //iframe 
  const iDiv = html`
  ${area.iframe != iframe ? html`<div class="dib br2 bg-light-blue dim pointer tc b white pa1" onClick=${()=>app.setState({iframe:area.iframe})}>Back</div>` : ""}
  <iframe id="i-map" src=${iframe} height="600px" width="600px"></iframe>
  `

  const sub = {Region,Site}
  const subView = sub[view.split(".")[1]]
  //return final UI 
  return html`
    <div class="overflow-auto flex flex-wrap justify-center items-start">
      <div class="bg-white-70 br2 mw6 h-100 mh2 pa1">
        ${subView(app)}
        ${generated.length >0 ? html`<h3 class="mh2 mv0">Generated</h3>` : ""}
        ${generated.map(([what,data],i)=>html`
        <div class="mh2 flex justify-between items-center">
          <div>${what}: ${data.short}</div>
          <div class="pointer white hover-red link dim dib bg-gray tc br2 pa1" onClick=${()=>GenSplice(i)}>X</div>
        </div>`)}
      </div>
      <div class="bg-white-70 br2 pa2 ph4">
        ${!iframe ? svg : iDiv}
      </div>
    </div>
  `
}


const Explorers = (app)=>{
  const {html} = app

  return html`
  <div>
    <div class="br2 bg-green dim pointer tc b white mh1 pa2" onClick=${()=>app.newExplorer()}>Create a New Explorer</div>
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

export {Main, Area, Dialog, About, Explorers}
