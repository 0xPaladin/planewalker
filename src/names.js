/*
  Regions 
*/
const ByTerrain = {
  "water": ['Bay', 'Bluffs', 'Downs', 'Expanse', 'Lake', 'Morass', 'Reach', 'Sea', 'Slough', 'Sound'],
  "swamp": ['Bog', 'Fen', 'Heath', 'Lowland', 'Marsh', 'Moor', 'Morass', 'Quagmire', 'Slough', 'Swamp', 'Thicket', 'Waste', 'Wasteland', 'Woods'],
  "desert": ['Bluffs', 'Desert', 'Dunes', 'Expanse', 'Flats', 'Foothills', 'Hills', 'Plains', 'Range', 'Sands', 'Savanna', 'Scarps', 'Steppe', 'Sweep', 'Upland', 'Waste', 'Wasteland'],
  "plains": ['Expanse', 'Fells', 'Flats', 'Heath', 'Lowland', 'March', 'Meadows', 'Moor', 'Plains', 'Prairie', 'Savanna', 'Steppe', 'Sweep'],
  "forest": ['Expanse', 'Forest', 'Groves', 'Hollows', 'Jungle', 'March', 'Thicket', 'Woods'],
  "hills": ['Bluffs', 'Cliffs', 'Downs', 'Foothills', 'Heights', 'Hills', 'Mounds', 'Range', 'Scarps', 'Steppe', 'Sweep', 'Upland', 'Wall'],
  "mountains": ['Cliffs', 'Expanse', 'Foothills', 'Heights', 'Mountains', 'Peaks', 'Range', 'Reach', 'Scarps', 'Steppe', 'Teeth', 'Upland', 'Wall']
}
const RegionAdjective = {
  "base": ['Ageless', 'Ashen', 'Blue', 'Broken', 'Burning', 'Cold', 'Deadly', 'Deep', 'Desolate', 'Dim', 'Dun', 'Endless', 'Far', 'Flaming', 'Forgotten', 'Frozen', 'Green', 'Grim', 'Impassable', 'Jagged', 'Long', 'Misty', 'Perilous', 'Purple', 'Red', 'Shattered', 'Shifting', 'Yellow'],
  "good": ['Blessed', 'Diamond', 'Glittering', 'Golden', 'Holy', 'Light', 'Shining', 'Silver', 'White'],
  "evil": ['Black', 'Blighted', 'Cursed', 'Dark', 'Dead', 'Dismal', 'Eerie', 'Fallen', 'Fell', 'Forsaken', 'Savage', 'Shadowy', 'Wicked']
}
const RegionNoun = {
  "base": ['Ash', 'Dragon', 'Fate', 'Fire', 'Ghost', 'Giant', 'King', 'Lord', 'Mist', 'Peril', 'Queen', 'Rain', 'Sky', 'Smoke', 'Snake', 'Storm', 'Thorn', 'Thunder', 'Victory'],
  "good": ['Gold', 'Heaven', 'Honor', 'Hope', 'Life', 'Light', 'Refuge', 'Savior', 'Silver', 'Sun'],
  "evil": ['Bone', 'Darkness', 'Dead', 'Death', 'Desolation', 'Despair', 'Devil', 'Doom', 'Fear', 'Fury', 'Hell', 'Horror', 'Regret', 'Shadow', 'Skull', 'Sorrow', 'Traitor', 'Troll', 'Witch'],
}
const RegionForms = ["(The) .adj. .t", "t. of (the) .noun", "(The) .noun. .t", "(The) .noun.'s .adj. .t", "adj. .t. of (the) .noun"]

const Region = (seed,terrain,alignment)=>{
  let RNG = new Chance(seed)
  terrain = terrain || RNG.pickone(Object.keys(ByTerrain))

  //adjectives based on alignment 
  let adj = RegionAdjective[alignment] ? RegionAdjective.base.concat(RegionAdjective[alignment]) : RegionAdjective.base
  //nouns based on alignment
  let noun = RegionNoun[alignment] ? RegionNoun.base.concat(RegionNoun[alignment]) : RegionNoun.base

  let name = {
    terrain,
    t: RNG.pickone(ByTerrain[terrain]),
    adj: RNG.pickone(adj),
    noun: RNG.pickone(noun)
  }

  let form = RNG.weighted(RegionForms, [4, 3, 2, 1, 1])
  name.short = form.split(".").map(w=>name[w] || w).join("")

  return name
}

/*
  Dieties
*/
const DietyNames = {
  "a": ['A-', 'Ab-', 'Aga-', 'Alha-', 'Appol-', 'Apu-', 'Arne-', 'Asmo-', 'Baha-', 'Bal-', 'Barba-', 'Bol-', 'By-', 'Can-', 'Cinni-', 'Cir-', 'Cyn-', 'Cyto-', 'Dar-', 'Darg-', 'De-', 'Des-', 'Dra-', 'Dul-', 'Elez-', 'Ely-', 'Ez-', 'Fal-', 'Faral-', 'Flo-', 'Fol-', 'Gaili-', 'Garg-', 'Gast-', 'Gil-', 'Gy-', 'Haz-', 'Heca-', 'Her-', 'Hog-', 'Hur-', 'I-', 'Ik-', 'Ilde-', 'In-', 'Jas-', 'Jir-', 'Ju-', 'Krak-', 'Kul-', 'Laf-', 'Long-', 'Ma-', 'Mer-', 'Mercu-', 'Mor-', 'Mune-', 'Munno', 'Murz-', 'Naf-', 'O-', 'Osh', 'Pande-', 'Pander-', 'Par-', 'Per-', 'Quel-', 'Ra-', 'Ragga-', 'Rhi-', 'Satan-', 'Satur-', 'Semi-', 'Sera-', 'She-', 'Shrue-', 'Sloo-', 'Sol-', 'T’-', 'Tcha-', 'Tol-', 'Tub-', 'Tur-', 'U-', 'Vag-', 'Val-', 'Vance-', 'Ver-', 'Vish-', 'Wa-', 'Win-', 'Xa-', 'Yu-', 'Za-', 'Zal-', 'Zan-', 'Zili-', 'Zim-', 'Zuur-', 'Zza-'],
  "b": ['-ak', '-alto', '-ana', '-anti', '-aris', '-ark', '-asta', '-balia', '-bus', '-by', '-cas', '-ce', '-derol', '-deus', '-din', '-dok', '-dor', '-dred', '-driar', '-dula', '-dun', '-dustin', '-er', '-fant', '-fia', '-fonse', '-gad', '-gax', '-glana', '-goria', '-goth', '-heer', '-houlik', '-ia', '-iala', '-iana', '-ingar', '-ista', '-jan', '-jobulon', '-kan', '-kang', '-konn', '-lah', '-leius', '-leo', '-leou', '-lin', '-lonia', '-lonius', '-loo', '-lume', '-ma', '-mas', '-mast', '-mia', '-miel', '-motto', '-moulian', '-mut', '-nak', '-nia', '-nish', '-nob', '-o', '-ol', '-ool', '-pa', '-pheus', '-phim', '-por', '-quint', '-ramis', '-rezzin', '-ro', '-rrak', '-ry', '-sira', '-sta', '-te', '-teria', '-thakk', '-thalon', '-tine', '-toomb', '-torr', '-troya', '-tur', '-tuva', '-u', '-valva', '-vance', '-vilk', '-wink', '-xa', '-yop', '-zant', '-zark', '-zirian', '-zred']
}

const Diety = (RNG)=> {
  return RNG.pickone(DietyNames.a).slice(0, -1) + RNG.pickone(DietyNames.b).slice(1)
}

export {Region, Diety}
