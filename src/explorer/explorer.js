/*
  V0.3
*/

/*
  Storage - localforage
  https://localforage.github.io/localForage/
*/
import "../lib/localforage.min.js"
const DB = {}
DB.Games = localforage.createInstance({
  name: "Games"
});
DB.Areas = localforage.createInstance({
  name: "Areas"
});
DB.Factions = localforage.createInstance({
  name: "Factions"
});

/*
  Chance RNG
*/
import "../lib/chance.min.js"
import {BuildArray} from "./random.js"
/*
  SVG
  https://svgjs.dev/docs/3.0/getting-started/
*/

/*
  UI Resources  
*/
//Preact
import {h, Component, render} from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
// Initialize htm with Preact
const html = htm.bind(h);

/*
  App Sub UI
*/
import*as UI from './UI.js';
import*as Gen from './generate.js';

/*
  Game Object 
*/
let Game = {
  "id": "",
  "name": "",
  "time": 0,
  //days 
  "coin": 2000,
  //gold 
  "factions": new Set(),
  "areas": new Set(),
  "characters": new Set(),
  "log": []
}

/*
  Declare the main App 
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      show: "Main",
      reveal: [],
      dialog: "",
      iframe: null,
      saveName: "",
      savedGames: [],
      generated: [],
      toGenerate: "",
    };

    //use in other views 
    this.html = html
    //keep generator functions 
    this.gen = Gen
    //keep poi 
    this.poi = Gen.POI
    //global store for generated areas / factions 
    this.areas = {}
    this.factions = {}
    this.characters = {}
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    //align background symbols
    let box = SVG("#plane-symbols").bbox()
    SVG("#background").attr('viewBox', [box.x, box.y, box.width, box.height].join(" "))

    this.generate()

    //updated saved game list 
    let sG = this.state.savedGames
    DB.Games.iterate((g,id)=>{
      sG.push([g.name, id])
      this.updateState("savedGames", sG)
    }
    )
  }

  // Lifecycle: Called just before our component will be destroyed
  componentWillUnmount() {}

  /*
    Core Save Load and Generate 
  */

  generate(id=chance.hash()) {
    //reset 
    this.areas = {}
    this.factions = {}
    this.characters = {}

    let RNG = new Chance(id)

    //core region maker for planes 
    const MakeRegion = (plane)=>new Gen.Region(this,{
      plane,
      id: RNG.hash()
    })

    //load all planes 
    BuildArray(2, ()=>Object.values(Gen.POI.OuterPlanes).forEach(p=>MakeRegion([p.name, p.layers ? p.layers[0] : p.name].join(","))))
    BuildArray(4, ()=>Object.values(Gen.POI.InnerPlanes).forEach(p=>MakeRegion([p.name, p.name].join(","))))

    //load factions 
    let factions = [[], []]
    Object.entries(Gen.Factions).forEach(([name,f])=>factions[f.class == "Sigil" ? 0 : 1].push(name))
    //randomly pick 5 
    factions.forEach(F=>{
      RNG.shuffle(F).slice(0, 5).forEach(name=>new Gen.Faction(this,{
        template: name,
        name,
        id: RNG.hash()
      }))
    }
    )

    //prime world and pantheon
    BuildArray(5, ()=>new Gen.PrimeWorld(this,{
      id: RNG.hash()
    }))
    //randomly create 5 factions 
    BuildArray(5, ()=>new Gen.Faction(this,{
      id: RNG.hash()
    }))

    //random not linked to id 
    //random characters 
    BuildArray(5, ()=>new Gen.Explorer(this))

    //set all portals 
    this.regions.forEach(r=>r.portal = chance)

    //update game  
    Game.id = id
    Game.name = Gen.Names.Region(id).short

    console.log(this.areas, this.factions, this.characters)
    this.refresh()
  }

  save() {
    let sets = ["factions", "areas", "characters"]
    let save = {}

    //save game handle sets 
    Object.keys(Game).forEach(k=>{
      save[k] = sets.includes(k) ? [...Game[k]] : Game[k]
    }
    )
    DB.Games.setItem(Game.id, save)
    //save sets 
    Game.characters.forEach(id=>this.characters[id].save())
    //refresh 
    this.refresh()
  }

  async load(id) {
    let sets = ["factions", "areas", "characters"]
    //pull game 
    let game = await DB.Games.getItem(id)
    if (!game) {
      return
    }

    //first generate 
    this.generate(id)
    //write state 
    Object.keys(Game).forEach(k=>{
      Game[k] = sets.includes(k) ? new Set(game[k]) : game[k]
    }
    )
    //refresh 
    this.refresh()

    //load saved 
    this.pullSaved()
  }

  async pullSaved() {
    //iterate
    Game.characters.forEach(id=>Gen.Explorer.load(this, id))
  }

  /*
    Game Functions 
  */

  addRegion(what,where,opts) {
    opts.id = chance.hash()
    if(what == "plane"){
      opts.plane = where
      if(opts.terrain && opts.terrain == "random"){
        delete opts.terrain
      }
    }

    new Gen.Region(this,opts)
    //add id to game 
    Game.areas.add(opts.id)
    this.refresh()
  }
  
  act(f, opts) {
    //call the function 
    f(opts)
    //save
    //refresh 
    this.refresh()
  }

  /*
    Get functions 
  */

  get game() {
    return Game
  }

  get primes() {
    return Object.values(this.areas).filter(p=>p.class[0] == "prime")
  }

  get planes() {
    return [...Object.values(Gen.POI.OuterPlanes),...Object.values(Gen.POI.InnerPlanes)].map(p => {
      p.children = this.regions.filter(r => r.plane && r.plane[0] == p.name)
      p.rLayers = p.layers ? p.layers.map(l => [l,p.children.filter(r =>r.plane[1] == l)]) : [[p.name,p.children]]
        
      return p 
    })
  }

  get regions() {
    return Object.values(this.areas).filter(p=>p.class[0] == "region")
  }

  get pantheons() {
    return Object.values(this.factions).filter(p=>p.class[0] == "pantheon")
  }

  get activeFactions() {
    return Object.values(this.factions).filter(f=>f.class[0] == "faction")
  }

  get explorers() {
    return Object.values(this.characters).filter(p=>p.class[0] == "explorer")
  }

  /*
    Render functions 
  */

  //main function for updating state 
  updateState(what, val) {
    let s = {}
    s[what] = val
    this.setState(s)
  }

  //main functions for setting view - usine set/get of show 

  refresh() {
    this.show = this.state.show
  }

  set show(what) {
    this.updateState("show", what)
  }

  get show() {
    let[what,id] = this.state.show.split(".")
    return UI[what] ? UI[what](this) : this[what][id].UI ? this[what][id].UI() : ""
  }

  get dialog() {
    let what = this.state.dialog
    return what == "" ? "" : UI[what](this)
  }

  /*
    Render 
  */

  //main page render 
  render(props, {show}) {
    let view = show.split(".")[0]

    //final layout 
    return html`
    <div class="relative flex flex-wrap items-center justify-between ph3 z-2">
      <div>
        <h1 class="pointer underline-hover mv2" onClick=${()=>this.show = "Main"}>Planewalker</h1>
      </div>
      <div class="flex items-center">
        <div class="ba br1 mh1 pa1"><b>Day:</b> ${Game.time} <b>Coin:</b> ${Game.coin}g</div>
        <input type="text" value=${Game.name} onChange=${(e)=>Game.name = e.target.value}>${Game.name}</input>
        ${!["Factions", "Planes", "Pantheons", "Explorers", "areas", "factions"].includes(view) ? "" : html`<div class="pointer f5 link dim ba bw1 pa1 dib black mh1" onClick=${()=>this.show = "Main"}>Home</div>`}
      </div>
    </div>
    <div class="absolute z-1 w-100 pa2">
      ${this.show}
    </div>
    ${this.dialog}
    `
  }
}

render(html`<${App}/>`, document.getElementById("app"));
