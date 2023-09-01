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
import * as Gen from './generate.js';

/*
  Declare the main App 
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      show: "Main",
      reveal : [],
      dialog: "",
      iframe: null,
      generated: [],
      toGenerate : "",
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
    
    let lastSave = localStorage.getItem("lastSave")
    if(!lastSave) {
      lastSave = chance.hash()
      localStorage.setItem("lastSave",lastSave)
    }
    let RNG = chance

    //load all planes 
    Object.entries(Gen.POI.OuterPlanes).forEach(([id,p]) => new Gen.Plane(this,Object.assign({id:RNG.hash()},p)))
    Object.entries(Gen.POI.InnerPlanes).forEach(([id,p]) => new Gen.Plane(this,Object.assign({id:RNG.hash()},p)))

    const MakeRegion = (parent,layer) => new Gen.Region(this,{parent,layer,id:RNG.hash()})

    //random regions for fun and exploration 
    Object.values(Gen.POI.OuterPlanes).forEach(p => MakeRegion(p.name,p.layers ? p.layers[0] : p.name))
    Object.values(Gen.POI.InnerPlanes).forEach(p => MakeRegion(p.name,p.name))
    BuildArray(12, () => {
      let p = chance.pickone(Object.values(Gen.POI.OuterPlanes))
      MakeRegion(p.name,p.layers ? chance.pickone(p.layers) : p.name)
    })
    BuildArray(12, () => {
      let p = chance.pickone(Object.values(Gen.POI.InnerPlanes))
      MakeRegion(p.name,p.name)
    })

    //randomly create 3 pantheons
    BuildArray(3,() => new Gen.Pantheon(this,{id:RNG.hash()}))

    //randomly create 5 factions 
    BuildArray(5,() => new Gen.Faction(this,{id:RNG.hash()}))

    //load factions 
    let factions = Object.entries(Gen.Factions).reduce((all,f,i)=>{
      let what = f[1].class == "Sigil" ? 0 : 1
      all[what].push(f) 
      return all 
    },[[],[]])
    
    //randomly pick 5 
    factions.forEach(F => {
      RNG.shuffle(F).slice(0,5).forEach(([name,f])=> {
        let opts = Object.assign({template:name,name,id:RNG.hash()})
        new Gen.Faction(this,opts)
      })
    })

    //random characters 
    BuildArray(5,() => new Gen.Explorer(this))

    //set all portals 
    this.regions.forEach(r => r.portal = chance)

    //load saved 
    this.pullSaved() 
    
    console.log(this.areas,this.factions,this.characters)
  }

  // Lifecycle: Called just before our component will be destroyed
  componentWillUnmount() {}

  save () {
    let lastSave = localStorage.getItem("lastSave")
    
    let regions = this.regions.map(r => {
      r.save()
      return r.id 
    })
    let data = {regions}

    DB.Games.setItem(lastSave,data)
  }

  async pullSaved() {
    //iterate
    await DB.Areas.iterate((o,id)=>{
      let opts = Object.assign({id},o)
      new Gen.Region(this,opts)
    }
    )
    await DB.Factions.iterate((o,id)=>{
      let opts = Object.assign({id},o)
    }
    )
  }

  //main function for updating state 
  updateState(what, val) {
    let s = {}
    s[what] = val
    this.setState(s)
  }

  //main functions for setting view - usine set/get of show 

  refresh () {
    this.show = this.state.show
  }

  set show (what) {
    this.updateState("show",what)
  }

  get show () {
    let [what,id] = this.state.show.split(".")
    return UI[what] ? UI[what](this) : this[what][id].UI ? this[what][id].UI() : ""
  }

  get dialog () {
    let what = this.state.dialog
    return what == "" ? "" : UI[what](this)
  }

  //getter functions 

  get planes() {
    return Object.values(this.areas).filter(p=>p.class[0] == "plane")
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

  async loadSaved(what) {
    let {toGenerate} = this.state

    let _what = what == "Region" ? "Regions" : what == "Pantheon" ? "Factions" : ""
    let opts = await DB[_what].getItem(toGenerate)
    opts.id = toGenerate

    //create object 
    let O = new Gen[what](this,opts)

    if (what == "Region") {
      this.setArea(R.id)
    }

    this.setView(O.UI)
  }

  addObject(what) {
    if (what == "Pantheon") {
      new Pantheon(this)
      this.setView("Factions")
      console.log(this.factions)
    }
  }

  generate(parent=this.state.plane) {
    let {terrainTypes, toGenerate} = this.state
    let[pid,l] = parent.split(".")

    let opts = {
      parent,
      terrain: toGenerate == "random" ? chance.pickone(terrainTypes) : toGenerate,
    }

    let R = new Region(this,opts)
    this.setArea(R.id)
  }

  //main page render 
  render(props, {show}) {
    let view = show.split(".")[0]

    //final layout 
    return html`
    <div class="relative flex flex-wrap items-center justify-between ph3 z-2">
      <div>
        <h1 class="pointer underline-hover mv2" onClick=${()=>this.show = "Main"}>Planewalker</h1>
      </div>
      <div>
        ${!["Factions","Planes","Pantheons","Explorers","areas","factions"].includes(view) ? "" : html`<div class="pointer f5 link dim ba bw1 pa1 dib black mh1" onClick=${()=>this.show = "Main"}>Home</div>`}
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
