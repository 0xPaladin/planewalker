/*
  V0.3
*/

/*
  Storage - localforage
  https://localforage.github.io/localForage/
*/
import "../lib/localforage.min.js"
var DB = localforage.createInstance({
  name: "Regions"
});

/*
  Chance RNG
*/
import "../lib/chance.min.js"


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
import*as Explorers from './explorers.js';
import*as UI from './UI.js';
import * as POI from "./poi.js"
import {Region} from './region.js';

/*
  Declare the main App 
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      view: "Main",
      showDialog: "",
      toGenerate : "",
      iframe : null,
      area: "",
      hexId: null,
      generated: [],
      explorers : []
    };

    //use in other views 
    this.html = html
    //keep poi 
    this.poi = POI 
    //global store for generated areas 
    this.areas = {}
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    //align background symbols
    let box = SVG("#plane-symbols").bbox()
    SVG("#background").attr('viewBox', [box.x,box.y,box.width,box.height].join(" "))

    //select random region 
    await this.setState({
      toGenerate : chance.pickone(Object.keys(POI.Regions))
    })
    this.generate()
  }

  // Lifecycle: Called just before our component will be destroyed
  componentWillUnmount() {}

  //show the dialog calling which dialog to show 
  showDialog(what) {
    this.setState({
      showDialog: what
    })
  }

  setView(view) {
    this.setState({
      view
    })

    //SVG('#map').addClass('hidden')
  }

  generate (poi = this.state.toGenerate) {
    let opts = POI.Regions[poi]
    let R = new Region(this,opts)
    this.setArea(R.id)
  }

  get area () {
    return this.areas[this.state.area]
  }

  async setArea(id) {
    let A = this.areas[id] 

    //update state 
    await this.setState({
      area : id, 
      view : A.UI,
      iframe : A.iframe || null,
      generated : [] 
    })
    //redraw  
    A.display()

    console.log(A)
  }

  newExplorer () {
    let E = new Explorers.Explorer()
    console.log(E)
  }

  //main page render 
  render(props, {view, toGenerate}) {
    //get view as array 
    let _view = view.split(".")[0]

    const showHome = ()=>html`<a class="ml2 f5 link dim ba bw1 pa1 dib black" href="#" onClick=${()=>this.setView("Main")}>Outlands</a>`

    return html`
    <div class="relative flex items-center justify-between ph3 z-2">
      <div>
        <h1 class="mv2"><a class="link underline-hover black" href=".">Planewalker</a></h1>
      </div>
      <div class="flex items-center">
        <select class="pa1" value=${toGenerate} onChange=${(e)=>this.setState({toGenerate:e.target.value})}>
          ${Object.values(this.poi.Regions).map(p => html`<option value=${p.name}>${p.name}</option>`)}
        </select>
        <a class="f5 link dim ba bw1 pa1 dib black" href="#" onClick=${()=>this.generate()}>Generate</a>
      </div>
    </div>
    <div class="absolute z-1 w-100 ma2 pa2">
      ${UI[_view](this)}
    </div>
    ${UI.Dialog(this)}
    `
  }
}

render(html`<${App}/>`, document.getElementById("app"));
