const element = ['void/cosmos', 'death/darkness', 'fire/metal/smoke', 'earth', 'plants/fungus', 'water/ice', 'air/storm', 'light/stars']
const magic = ['necromancy', 'evocation', 'conjuration', 'illusion', 'enchantment', 'transformation', 'warding', 'healing', 'divination']
const aspect = ['war/destruction', 'hate/envy', 'power/strength', 'trickery/dexterity', 'time/constitution', 'lore/intelligence', 'nature/wisdom', 'culture/charisma', 'luck/fortune', 'love/admiration', 'peace/balance', 'glory/divinity']
const creature = ['Aberration', 'Animal', 'Construct', 'Dragon', 'Fey', 'Humanoid', 'Magical Beast', 'Monstrous Humanoid', 'Ooze', 'Outsider', 'Plant', 'Undead', 'Vermin']
const challenges = ['Soldier', 'Diplomat', 'Engineer', 'Explorer', 'Rogue', 'Scholar']

const Outsiders = {
  "Outsiders" : ["Aasimon", "Archon", "Baatezu", "Eladrin", "Elemental", "Genie", "Gehreleth", "Guardinal", "Modron", "Rilmani", "Slaad", "Tanar'ri", "Yugoloth"],
  "Celestial" : ["Aasimon", "Archon", "Eladrin", "Guardinal"],
  "Fiend" : ["Baatezu","Gehreleth","Tanar'ri", "Yugoloth"],
  "Neutral" : ["Modron", "Rilmani", "Slaad"],
  "Inner" : ["Elemental", "Genie"]
} 


let factions = {
  "sigil": ["Athar", "Believers of the Source", "Bleak Cabal", "Doomguard", "Dustmen", "Fated", "Fraternity of Order", "Free League", "Harmonium", "Mercykillers", "Revolutionary League", "Sign of One", "Society of Sensation", "Transcendent Order", "Xaositects"],
  "outsiders": ["Aasimon", "Archon", "Baatezu", "Eladrin", "Elemental", "Genie", "Gehreleth", "Guardinal", "Modron", "Rilmani", "Slaad", "Tanar'ri", "Yugoloth"],
  "good": ["Believers of the Source", "Harmonium", "Sign of One", "Aasimon", "Archon", "Eladrin"],
  "lawful": ["Fraternity of Order", "Harmonium", "Mercykillers", "Archon", "Baatezu", "Modron"],
  "chaotic": ["Free League", "Revolutionary League", "Xaositects", "Eladrin", "Gehreleth", "Slaad", "Tanar'ri"],
  "evil": ["Bleak Cabal", "Doomguard", "Fated", "Mercykillers", "Baatezu", "Gehreleth", "Slaad", "Tanar'ri", "Yugoloth"]
}

const alignment = {
  "good": ["LG", "NG", "CG"],
  "neutral": ["NG", "LN", "NN", "CN", "NE"],
  "evil": ["LE", "NE", "CE"],
  "lawful": ["LG", "LN", "LE"],
  "chaotic": ["CG", "CN", "CE"],
  "byLeter": {
    "L": "lawful",
    "C": "chaotic",
    "N": "neutral",
    "G": "good",
    "E": "evil"
  }
}

const MagicXElements = {
  'necromancy': ['void', 'death'],
  'evocation': ['fire', 'air'],
  'conjuration': ['earth', 'plants', 'water'],
  'illusion': ['light'],
  'divination': ['void', 'cosmos']
}

export {alignment, element, magic, aspect, creature,Outsiders, factions, challenges}
