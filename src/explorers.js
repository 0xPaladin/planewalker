var DB = localforage.createInstance({
  name: "Explorers"
});

const chance = new Chance()

/*
  Stats : Hardy, Knowledgeable, Resourceful
*/


const Backgrounds = {
  "soldier" : {
    "name" : "Soldier",
    "stats" : [3,1,2],
    "extras" : ["Conditioned","Survival Training"]
  },
  "merchant" : {
    "name" : "Merchant",
    "stats" : [2,3,1],
    "extras" : ["Haggler","Hard Bargain"]
  },
  "explorer" : {
    "name" : "Explorer",
    "stats" : [2,1,3],
    "extras" : ["Experienced Delver","Survival Knowledge"]
  },
  "scoundrel" : {
    "name" : "Scoundrel",
    "stats" : [1,2,3],
    "extras" : ["Off-World Contacts","The Highest Bidders"]
  },
  "navigator" : {
    "name" : "Navigator",
    "stats" : [1,3,2],
    "extras" : ["Sightseer","Pathfinder"]
  },
  "freelancer" : {
    "name" : "Freelancer",
    "stats" : [3,2,1],
    "extras" : ["Work-for-Hire","Well-Travelled"]
  },
}

class Explorer {
  constructor (b) {
    this.id = chance.hash()

    this.state = {
      b,
      stats : this.background.stats.slice(),
      silver : 50,
      scrap : [5,0],
      relics : [1,0],
      quests : [],
      stamina : [5,5], 
      water : [3,3],
      location : ""
    }
  }
  get background () {
    return Backgrounds[this.state.b]
  }
  test (diff, sid) {
    //get skill value based upon stat id 
    let ids = ["H","K","R"] 
    let val = this.state.stats[ids.indexOf(sid)]
    
    let roll = chance.rpg(diff+'d6')
    let pass = roll.reduce((sum,r)=>sum+(r<=val ? 1 : 0)) >= diff
    return {roll,pass}
  }
  save () {
    DB.setItem(this.id,this.state)
  }
  static async load (id) {
    //load state 
    let state = await DB.getItem(id)
    //create new explorer and apply state 
    let E = new Explorer()
    E.id = id 
    Object.assign(E.state,state) 
    return E 
  }
}

export {Explorer}