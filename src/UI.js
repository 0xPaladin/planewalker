import {DisplayRegion} from './map.js';
//import poi 
import {POI} from "./poi.js"

/*
  UI Resources  
*/

const Main = ()=>{}

const Hex = (app)=>{
  const {html, region, site} = app
  const {view, poi, hex, encounter} = app.state
  let _view = view.split(".")

  //get hex data if selected 
  const {q,r} = hex
  const _qr = [q,r].join(",")

  const rEncounter = () => app.setState({encounter : region.encounter()}) 
  
  const hasShow = (p) => {
    return !["dungeon","ruin"].includes(p.what) ? "" : html`<span class="mh2" onClick=${()=>region.ShowSub(app,p)}>[<span class="blue link underline-hover pointer">Show More</span>]</span>`
  }

  const siteData = () => html`
  <div class="f6 mh1">${region.seed.split(".")[1]}</div>
  <div class="bb bw2 flex items-center justify-between ma1">
    <div class="f4">${region.primary}, ${region.alignment} [${region.safety}]</div>
    <div class="br2 bg-light-blue dim pointer tc b white ma1 pa1" onClick=${()=>app.setView("Hex")}>Return to Region</div>
  </div>
  <div class="mh2 pt2">
    <div class="f4">${site.text}</div>
    ${site.site.map(s=>html`
    <div>Themes: ${s.themes.join(", ")}
      ${s.contents.map((c,i)=>html`<div>Area #${i+1}: ${c.join(", ")}</div>`)}
    </div>`)}
  </div>
  `

  const regionData = () => html`
    <div class="f6 mh1">${region.seed.split(".")[1]}</div>
    <div class="flex items-center ma1">
      <div class="f4">${region.primary}, ${region.alignment} [${region.safety}]</div>
    </div>
    <div class="pa2">${Object.entries(region.places).map(([qr,p])=> html`<div class="ma1 ${qr==_qr ? "underline": ""}">Hex [${qr}] - ${p.name || p.text}${hasShow(p)}</div>`)}</div>
    <div class="br2 bg-green dim pointer tc b white ma1 pa2" onClick=${()=>rEncounter()}>Random Encounter</div>
    ${encounter == "" ? "" : html`<div class="mh2">Random Encounter: ${encounter.what}</div>` }
  `

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
