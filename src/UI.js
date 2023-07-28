import {DisplayRegion} from './map.js';

/*
  UI Resources  
*/

const Main = ()=>{}
const Hex = (app)=>{
  DisplayRegion(app)
  const {html, region} = app
  const {poi} = app.state

  //random region 
  const newRegion = ()=>{
    let r = {
      seed: [poi.name, chance.natural()].join('.'),
      parent: region.parent
    }

    //set state and call display 
    app.setState({
      region: r
    })
    app.setView("Hex")
  }

  return html`
  <div class="mh2">
    <div class="flex items-end mv2"><h2 class="pointer dim ma0" onClick=${()=>app.setView("Main")}>Outlands ::</h2><h3 class="ma0 mh1">${poi.name}</h3></div>
    <div class="f6 mh1">${region.seed.split(".")[1]}</div>
    <div class="flex items-center mh1">
      <div><span class="b">Terrain:</span> ${region.parent}</div>
    </div>
    <div class="br2 bg-green dim pointer tc b white mh1 pa2 w-25" onClick=${()=>newRegion()}>New Random Region</div>
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

export {Main, Hex, Dialog, About}
