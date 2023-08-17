const element = ['void/cosmos','death/darkness','fire/metal/smoke','earth','plants/fungus','water/ice','air/storm','light/stars']
const magic = ['necromancy','evocation','conjuration','illusion','enchantment','transformation','warding','healing','divination']
const aspect = ['war/destruction','hate/envy','power/strength','trickery/dexterity','time/constitution','lore/intelligence','nature/wisdom','culture/charisma','luck/fortune','love/admiration','peace/balance','glory/divinity']
const creature = ['aberration','animal','construct','dragon','fey','humanoid','magical beast','monstrous humanoid','ooze','outsider','plant','undead','vermin']
const challenges = ['Soldier', 'Diplomat', 'Engineer', 'Explorer', 'Rogue', 'Scholar'] 

let factions = {
  "sigil" : ["Athar", "Believers of the Source", "Bleak Cabal", "Doomguard", "Dustmen", "Fated", "Fraternity of Order", "Free League", "Harmonium", "Mercykillers", "Revolutionary League", "Sign of One", "Society of Sensation", "Transcendent Order", "Xaositects"],
  "outsiders" : ["Aasimon", "Archon", "Baatezu", "Eladrin", "Elemental", "Genie","Gehreleth", "Guardinal", "Modron", "Rilmani", "Slaad", "Tanar'ri", "Yugoloth"],
  "good": ["Believers of the Source","Harmonium","Sign of One","Aasimon","Archon","Eladrin"],
  "lawful": ["Fraternity of Order","Harmonium","Mercykillers","Archon","Baatezu","Modron"],
  "chaotic": ["Free League","Revolutionary League","Xaositects","Eladrin","Gehreleth","Slaad","Tanar'ri"],
  "evil": ["Bleak Cabal","Doomguard","Fated","Mercykillers","Baatezu","Gehreleth","Slaad","Tanar'ri","Yugoloth"]
}

const MagicXElements = {
  'necromancy' : ['void','death'],
  'evocation' : ['fire','air'],
  'conjuration' : ['earth','plants','water'],
  'illusion' : ['light'],
  'divination' : ['void','cosmos']
}

export {element,magic,aspect,creature,factions,challenges}