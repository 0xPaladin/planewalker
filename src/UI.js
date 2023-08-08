/*
  UI Resources  
*/

const Main = ()=>{}

const Hex = (app)=>{
  const {html, region, site, hex} = app
  const {view, poi, qr, regionGen} = app.state
  let _view = view.split(".")

  //track feature ids for ordering 
  let {places={}, explore} = region
  const _hazard = []
    , _encounter = []
    , _site = []
    , _town = [];
  Object.entries(places).forEach(([id,f])=>{
    if (["creature", "lair"].includes(f.what)) {
      _encounter.push(id)
    } else if (["hazard", "obstacle", "area"].includes(f.what)) {
      _hazard.push(id)
    } else if (["dungeon", "ruin", "landmark", "resource"].includes(f.what)) {
      _site.push(id)
    } else if (["outpost", "settlement", "city", "faction"].includes(f.what)) {
      _town.push(id)
    }
  }
  )
  const fOrdered = _town.concat(_site, _encounter, _hazard)

  /*
    Functions for internal sub displays 
  */
  //enable hex conent 
  const Gen = (what)=>{
    regionGen.push(region[what](hex))
    app.setState({
      regionGen
    })
  }
  const GenSplice = (i)=>{
    regionGen.splice(i, 1)
    app.setState({
      regionGen
    })
  }

  //create a buttion with hex symbole and qr, dropdown with actions that may be taken 
  let ppl = region.people ? region.people : []
  const hexButton = (qr)=>html`<div class="f6 link dim dib bg-gray tc br2 pa1" style="min-width:45px;"><span class="hex-marker ${hex.qr ? (qr == hex.qr) ? 'green' : 'white' : 'white'}">⬢</span>${qr}</div>`

  //show blank hex data if clicked on 
  let selectedHex = ()=>html`
  <div class="dropdown f4 bb bw2 pb1">
    <div class="flex items-center">
      ${hexButton(hex.qr)}
      <div class="mh1">${hex.place ? (hex.place.name || hex.place.text) : "Open Terrain: "+hex.terrain.type}</div>
    </div>
    <div class="dropdown-content bg-white ba bw1 pa1">
      <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>Gen("encounter")}>Random Encounter</div>
      <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>Gen("newExplore")}>Explore</div>
      ${ppl.includes(hex.qr) ? html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>Gen("job", hex)}>Get a Job</div>` : ""}
    </div>
  </div>`

  //show site data for ruins/dungeons 
  const siteData = ()=>html`
  <div class="f6 mh1">${region.seed.split(".")[1]}</div>
  <div class="bb bw2 flex items-center justify-between ma1">
    <div class="f4">${region.primary}, ${region.alignment} [${region.safety}]</div>
    <div class="br2 bg-light-blue dim pointer tc b white ma1 pa1" onClick=${()=>app.setView("Hex")}>Return to Region</div>
  </div>
  <div class="mh2 pt2">
    <div class="f4">${site.text}</div>
    ${site.site.map(s=>html`
    <div>Themes: ${s.themes.join(", ")}
      ${s.contents.map((c,i)=>html`<div>Area #${i + 1}: ${c.join(", ")}</div>`)}
    </div>`)}
  </div>
  `

  //show region data 
  const regionData = ()=>html`
    <div class="f6 mh1">${region.seed.split(".")[1]}</div>
    <div class="flex items-center ma1">
      <h3 class="ma0">${region.primary}, ${region.alignment} [${region.safety}]</h3>
    </div>
    <h3 class="mh2 mv0">Region Features</h3>
    <div class="pa2">
      ${hex.i ? selectedHex() : ""} 
      ${fOrdered.map(_qr=>html`
      <div class="pointer flex justify-between ma1" onClick=${()=> app.setHex(_qr)}>
        <div class="flex items-center">
          ${hexButton(_qr)}
          <div class="mh1">${places[_qr].name || places[_qr].text}</div>
        </div>
      </div>`)}
    </div>
    ${regionGen.length >0 ? html`<h3 class="mh2 mv0">Generated</h3>` : ""}
    ${regionGen.map(([what,data],i)=>html`
    <div class="mh2 flex justify-between">
      <div>${what}: ${data.short}</div>
      <div class="link dim underline-hover hover-red pointer" onClick=${()=>GenSplice(i)}>[X]</div>
    </div>`)}
  `

  //return final UI 
  return html`
  <div class="flex flex-wrap items-start justify-center">
    <div class="mw6 mh2">
      <div class="flex items-center justify-between mv2">
        <div class="flex items-end">
          <h2 class="pointer dim ma0" onClick=${()=>app.setView("Main")}>Outlands ::</h2>
          <h3 class="ma0 mh1">${poi.name}</h3>
        </div>
        <div class="br2 bg-green dim pointer tc b white ma1 pa1" onClick=${()=>app.setRegion(poi)}>Random Region</div>
      </div>
      ${region.seed ? _view[1] ? siteData() : regionData() : ""}
    </div>
    <svg id="submap" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
      <g id="hex"></g>
      <g id="site"></g>
    </svg>
  </div>
  `
}

const Explorers = (app)=>{
  const {html, region} = app

  return html`
  <div>
    <div class="br2 bg-green dim pointer tc b white mh1 pa2" onClick=${()=>newRegion()}>Create a New Explorer</div>
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

export {Main, Hex, Dialog, About, Explorers}
