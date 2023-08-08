/*
  V0.3
*/

/*
  Storage - localforage
  https://localforage.github.io/localForage/
*/
import "../lib/localforage.min.js"
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
import {ShowOutlands, Resize, Region} from './map.js';

/*
  Declare the main App 
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      view: "Main",
      showDialog: "",
      poi: {},
      region: {},
      qr: null,
      regionGen: []
    };

    //use in other views 
    this.html = html
    this.region = {}
    this.hex = {}
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    //check if freash load - display about
    let lastLoad = localStorage.getItem("lastLoad")
    //show map 
    ShowOutlands(this)
    //resize and shift everything 
    addEventListener("resize", (event)=>{
      Resize(this)
    }
    );
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

    SVG('#map').addClass('hidden')

    if (view == "Main") {
      SVG('#map').removeClass('hidden')
    } else if (view == "Hex" && SVG('#hex')) {
      SVG('#site').addClass('hidden')
      SVG('#hex').removeClass('hidden')
    }
  }

  async setRegion(poi, mainMap=false) {
    const changed = poi.name != this.state.poi.name
    let {terrain, name, alignment} = poi
    let _seed = chance.natural()
      , places = {};

    if (mainMap) {
      _seed = poi.seed || chance.natural()
      places = poi.places || {}
    }

    //random region 
    let region = {
      seed: [name, _seed].join('.'),
      primary: terrain,
      places,
      alignment
    }
    //set state and call display 
    this.state.region = Object.assign({}, region)
    this.state.poi = poi
    //redraw hex 
    await this.setView("Hex")
    this.region = new Region(this,region)
    this.region.display()
    //reset hex 
    this.hex = {} 
    this.setState({
      qr : null,
      regionGen : []
    })
  }

  setHex(qr) {
    let i = this.region.ids.indexOf(qr)
    this.hex = this.region.dHex[i]
    this.setState({
      qr
    })
    console.log(this.hex)
  }

  //main page render 
  render(props, {view}) {
    //get view as array 
    let _view = view.split(".")[0]

    const showHome = ()=>html`<a class="ml2 f5 link dim ba bw1 pa1 dib black" href="#" onClick=${()=>this.setView("Main")}>Outlands</a>`

    return html`
      <div>
        <div class="relative flex items-center justify-between ph3 z-2">
          <div>
            <h1 class="mv2"><a class="link underline-hover black" href=".">Planewalker</a></h1>
          </div>
          <div class="flex items-center">
            ${_view != "Main" ? showHome() : ""}
            <a class="ml2 f5 link dim ba bw1 pa1 dib black" href="#" onClick=${()=>this.showDialog("about")}>About</a>
          </div>
        </div>
        <div class="absolute z-1 w-100 pa2">
          ${UI[_view](this)}
        </div>
        ${UI.Dialog(this)}
      </div>
      `
  }
}

render(html`<${App}/>`, document.getElementById("app"));
