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
import * as UI from './UI.js';
import {ShowOutlands, Resize} from './map.js';

/*
  Declare the main App 
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      view: "Main",
      showDialog: "",
      poi : {},
      region : {}
    };

    //use in other views 
    this.html = html
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    //check if freash load - display about
    let lastLoad = localStorage.getItem("lastLoad")
    //show map 
    ShowOutlands(this)
    //resize and shift everything 
    addEventListener("resize", (event) => {
      Resize(this)
    });
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
    if(view == "Hex"){
      this.hex.removeClass('hidden')
      this.map.addClass('hidden')
    }
    else if (view == "Main") {
      this.hex.addClass('hidden')
      this.map.removeClass('hidden')
    }
  }

  //main page render 
  render(props, {view}) {
    //get view as array 
    let _view = view.split(".")[0]

    const showHome = () => html`<a class="ml2 f5 link dim ba bw1 pa1 dib black" href="#" onClick=${()=> this.setView("Main")}>Outlands</a>`

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
        <div class="absolute w-100 z-1 pa2">
          ${UI[_view](this)}
        </div>
        ${UI.Dialog(this)}
      </div>
      `
  }
}

render(html`<${App}/>`,document.getElementById("app"));

