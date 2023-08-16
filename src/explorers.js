var DB = localforage.createInstance({
  name: "Explorers"
});

import {RandBetween, SumDice, Likely, chance} from "./random.js"

const People = (RNG=chance)=>{
  let common = ["Human", "Elf", "Dwarf", "Gnome", "Halfling", "Githzerai", "Aasimar", "Tiefling"]
  let uncommon = ["Aarakocra", "Bugbear", "Centaur", "Githyanki", "Gnoll", "Goblin", "Grippli", "Hobgoblin", "Kobold", "Lizardfolk", "Minotaur", "Myconid", "Orc", "Sahuagin", "Yeti"]

  return RNG.pickone(Likely(60, RNG) ? common : uncommon)
}

const Abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
const Skills = {
  "Strength": [],
  "Dexterity": [],
  "Constitution": [],
  "Intelligence": [],
  "Wisdom": [],
  "Charisma": []
}

class Explorer {
  constructor(id=chance.hash()) {
    this.id = id
    let RNG = new Chance(this.id)

    this.people = People(RNG)

    //generate abilities 
    let abilities = Object.fromEntries(Abilities.map(a=>[a, [0, 0]]))
    //shuffle abilities to pick core and max first
    let ca = RNG.shuffle(Abilities)

    //pick base ability scores 
    abilities[ca[0]] = [4, 4]
    let ap = 5
    for(let i = 1; i < ca.length; i++){
      let n = RNG.d4()
      n = n < ap ? n : ap 
      abilities[ca[i]][0] += n 

      ap -= n
      if(ap == 0)
        break
    }

    //pick ability feats 
    let af = 11

    this.abilities = abilities

    this.state = {
      jink: {},
      quests: [],
      items: [],
      location: ""
    }
  }
  save() {
    DB.setItem(this.id, this.state)
  }
  static async load(id) {
    //load state 
    let state = await DB.getItem(id)
    //create new explorer and apply state 
    let E = new Explorer(id)
    Object.assign(E.state, state)
    return E
  }
}

export {Explorer}
