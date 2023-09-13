function last(array) {
  return array[array.length - 1];
}
// return string with 1st char capitalized
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

import {NameBases} from './data.js';
/*
  Useful Random Functions 
*/
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, WeightedString, chance} from "./random.js"
function P(probability,RNG) {
  if (probability >= 1) return true;
  if (probability <= 0) return false;
  return Likely(probability*100,RNG);
}

/*
  Manage Markov Chains 
  Based on Azgaar Map 
  https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/modules/names-generator.js#L261
*/
// chars that serve as vowels
const VOWELS = `aeiouyɑ'əøɛœæɶɒɨɪɔɐʊɤɯаоиеёэыуюяàèìòùỳẁȁȅȉȍȕáéíóúýẃőűâêîôûŷŵäëïöüÿẅãẽĩõũỹąęįǫųāēīōūȳăĕĭŏŭǎěǐǒǔȧėȯẏẇạẹịọụỵẉḛḭṵṳ`;
function vowel(c) {
  return VOWELS.includes(c);
}
let chains = [];

// calculate Markov chain for a namesbase
const calculateChain = function(string) {
  const chain = [];
  const array = string.split(",");

  for (const n of array) {
    let name = n.trim().toLowerCase();
    const basic = !/[^\u0000-\u007f]/.test(name);
    // basic chars and English rules can be applied

    // split word into pseudo-syllables
    for (let i = -1, syllable = ""; i < name.length; i += syllable.length || 1,
    syllable = "") {
      let prev = name[i] || "";
      // pre-onset letter
      let v = 0;
      // 0 if no vowels in syllable

      for (let c = i + 1; name[c] && syllable.length < 5; c++) {
        const that = name[c]
          , next = name[c + 1];
        // next char
        syllable += that;
        if (syllable === " " || syllable === "-")
          break;
        // syllable starts with space or hyphen
        if (!next || next === " " || next === "-")
          break;
        // no need to check

        if (vowel(that))
          v = 1;
        // check if letter is vowel

        // do not split some diphthongs
        if (that === "y" && next === "e")
          continue;
        // 'ye'
        if (basic) {
          // English-like
          if (that === "o" && next === "o")
            continue;
          // 'oo'
          if (that === "e" && next === "e")
            continue;
          // 'ee'
          if (that === "a" && next === "e")
            continue;
          // 'ae'
          if (that === "c" && next === "h")
            continue;
          // 'ch'
        }

        if (vowel(that) === next)
          break;
        // two same vowels in a row
        if (v && vowel(name[c + 2]))
          break;
        // syllable has vowel and additional vowel is expected soon
      }

      if (chain[prev] === undefined)
        chain[prev] = [];
      chain[prev].push(syllable);
    }
  }

  return chain;
};

// update chain for specific base
const updateChain = i=>(chains[i] = NameBases[i] || NameBases[i].b ? calculateChain(NameBases[i].b) : null);

// update chains for all used bases
const clearChains = ()=>(chains = []);

/*
  Name Generation
*/
// generate name using Markov's chain
const getBase = function(base, min, max, dupl, RNG) {
  if (base === undefined) {
    ERROR && console.error("Please define a base");
    return;
  }
  if (!chains[base])
    updateChain(base);

  const data = chains[base];
  if (!data || data[""] === undefined) {
    tip("Namesbase " + base + " is incorrect. Please check in namesbase editor", false, "error");
    ERROR && console.error("Namebase " + base + " is incorrect!");
    return "ERROR";
  }

  if (!min)
    min = NameBases[base].min;
  if (!max)
    max = NameBases[base].max;
  if (dupl !== "")
    dupl = NameBases[base].d;

  //ra random value from array 
  let v = data[""]
    , cur = RNG.pickone(v)
    , w = "";
  for (let i = 0; i < 20; i++) {
    if (cur === "") {
      // end of word
      if (w.length < min) {
        cur = "";
        w = "";
        v = data[""];
      } else
        break;
    } else {
      if (w.length + cur.length > max) {
        // word too long
        if (w.length < min)
          w += cur;
        break;
      } else
        v = data[last(cur)] || data[""];
    }

    w += cur;
    cur = RNG.pickone(v);
  }

  // parse word to get a final name
  const l = last(w);
  // last letter
  if (l === "'" || l === " " || l === "-")
    w = w.slice(0, -1);
  // not allow some characters at the end

  let name = [...w].reduce(function(r, c, i, d) {
    if (c === d[i + 1] && !dupl.includes(c))
      return r;
    // duplication is not allowed
    if (!r.length)
      return c.toUpperCase();
    if (r.slice(-1) === "-" && c === " ")
      return r;
    // remove space after hyphen
    if (r.slice(-1) === " ")
      return r + c.toUpperCase();
    // capitalize letter after space
    if (r.slice(-1) === "-")
      return r + c.toUpperCase();
    // capitalize letter after hyphen
    if (c === "a" && d[i + 1] === "e")
      return r;
    // "ae" => "e"
    if (i + 2 < d.length && c === d[i + 1] && c === d[i + 2])
      return r;
    // remove three same letters in a row
    return r + c;
  }, "");

  // join the word if any part has only 1 letter
  if (name.split(" ").some(part=>part.length < 2))
    name = name.split(" ").map((p,i)=>(i ? p.toLowerCase() : p)).join("");

  if (name.length < 2) {
    ERROR && console.error("Name is too short! Random name will be selected");
    name = RNG.pickone(NameBases[base].b.split(","));
  }

  return name;
};

// generate short name for base
const getBaseShort = function(base,RNG) {
  const min = NameBases[base].min - 1;
  const max = Math.max(NameBases[base].max - 2, min);
  return getBase(base, min, max, "", RNG);
};

// generate state name based on capital or random name and culture-specific suffix
const getState = function(base, RNG) {
  if (base === undefined)
    return ERROR && console.error("Please define a base");
  
  let name = getBaseShort(base,RNG)

  // exclude endings inappropriate for states name
  if (name.includes(" "))
    name = capitalize(name.replace(/ /g, "").toLowerCase());
  // don't allow multiword state names
  if (name.length > 6 && name.slice(-4) === "berg")
    name = name.slice(0, -4);
  // remove -berg for any
  if (name.length > 5 && name.slice(-3) === "ton")
    name = name.slice(0, -3);
  // remove -ton for any

  if (base === 5 && ["sk", "ev", "ov"].includes(name.slice(-2)))
    name = name.slice(0, -2);
    // remove -sk/-ev/-ov for Ruthenian
  else if (base === 12)
    return vowel(name.slice(-1)) ? name : name + "u";
    // Japanese ends on any vowel or -u
  else if (base === 18 && P(0.4,RNG))
    name = vowel(name.slice(0, 1).toLowerCase()) ? "Al" + name.toLowerCase() : "Al " + name;
  // Arabic starts with -Al

  // no suffix for fantasy bases
  if (base > 32 && base < 42)
    return name;

  // define if suffix should be used
  if (name.length > 3 && vowel(name.slice(-1))) {
    if (vowel(name.slice(-2, -1)) && P(0.85,RNG))
      name = name.slice(0, -2);
      // 85% for vv
    else if (P(0.7,RNG))
      name = name.slice(0, -1);
      // ~60% for cv
    else
      return name;
  } else if (P(0.4,RNG))
    return name;
  // 60% for cc and vc

  // define suffix
  let suffix = "ia";
  // standard suffix

  const rnd = Math.random()
    , l = name.length;
  if (base === 3 && rnd < 0.03 && l < 7)
    suffix = "terra";
    // Italian
  else if (base === 4 && rnd < 0.03 && l < 7)
    suffix = "terra";
    // Spanish
  else if (base === 13 && rnd < 0.03 && l < 7)
    suffix = "terra";
    // Portuguese
  else if (base === 2 && rnd < 0.03 && l < 7)
    suffix = "terre";
    // French
  else if (base === 0 && rnd < 0.5 && l < 7)
    suffix = "land";
    // German
  else if (base === 1 && rnd < 0.4 && l < 7)
    suffix = "land";
    // English
  else if (base === 6 && rnd < 0.3 && l < 7)
    suffix = "land";
    // Nordic
  else if (base === 32 && rnd < 0.1 && l < 7)
    suffix = "land";
    // generic Human
  else if (base === 7 && rnd < 0.1)
    suffix = "eia";
    // Greek
  else if (base === 9 && rnd < 0.35)
    suffix = "maa";
    // Finnic
  else if (base === 15 && rnd < 0.4 && l < 6)
    suffix = "orszag";
    // Hungarian
  else if (base === 16)
    suffix = rnd < 0.6 ? "yurt" : "eli";
    // Turkish
  else if (base === 10)
    suffix = "guk";
    // Korean
  else if (base === 11)
    suffix = " Guo";
    // Chinese
  else if (base === 14)
    suffix = rnd < 0.5 && l < 6 ? "tlan" : "co";
    // Nahuatl
  else if (base === 17 && rnd < 0.8)
    suffix = "a";
    // Berber
  else if (base === 18 && rnd < 0.8)
    suffix = "a";
  // Arabic

  return validateSuffix(name, suffix);
};

function validateSuffix(name, suffix) {
  if (name.slice(-1 * suffix.length) === suffix)
    return name;
  // no suffix if name already ends with it
  const s1 = suffix.charAt(0);
  if (name.slice(-1) === s1)
    name = name.slice(0, -1);
  // remove name last letter if it's a suffix first letter
  if (vowel(s1) === vowel(name.slice(-1)) && vowel(s1) === vowel(name.slice(-2, -1)))
    name = name.slice(0, -1);
  // remove name last char if 2 last chars are the same type as suffix's 1st
  if (name.slice(-1) === s1)
    name = name.slice(0, -1);
  // remove name last letter if it's a suffix first letter
  return name + suffix;
}
function addSuffix(name) {
  const suffix = P(0.8) ? "ia" : "land";
  if (suffix === "ia" && name.length > 6)
    name = name.slice(0, -(name.length - 3));
  else if (suffix === "land" && name.length > 6)
    name = name.slice(0, -(name.length - 5));
  return validateSuffix(name, suffix);
}

/*
  Regions 
*/
//"islands", "costal", "lake", "barren", "wetland", "woodland", "lowlands","highlands","standard"
const ByTerrain = {
  "islands" : ['Sea','Islands','Sound'],
  "costal" : ['Sea','Bay','Downs','Reach','Slough', 'Sound'],
  "lake" : ['Lake',],
  "barren": ['Bluffs', 'Desert', 'Dunes', 'Expanse', 'Flats', 'Foothills', 'Hills', 'Plains', 'Range', 'Sands', 'Savanna', 'Scarps', 'Steppe', 'Sweep', 'Upland', 'Waste', 'Wasteland'],
  "wetland" : ['Bog', 'Fen', 'Heath', 'Lowland', 'Marsh', 'Moor', 'Morass', 'Quagmire', 'Slough', 'Swamp', 'Thicket', 'Waste', 'Wasteland', 'Woods'],
  "woodland" :['Expanse', 'Forest', 'Groves', 'Hollows', 'Jungle', 'March', 'Thicket', 'Woods'],
  "lowlands" : ['Expanse', 'Fells', 'Flats', 'Heath', 'Lowland', 'March', 'Meadows', 'Moor', 'Plains', 'Prairie', 'Savanna', 'Steppe', 'Sweep'],
  "highlands" : ['Cliffs', 'Expanse', 'Foothills', 'Heights', 'Mountains', 'Peaks', 'Range', 'Reach', 'Scarps', 'Steppe', 'Teeth', 'Upland', 'Wall'],
  "standard" : ['Bluffs', 'Downs', 'Foothills', 'Hills', 'Mounds', 'Range', 'Scarps', 'Steppe', 'Sweep'],
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

const Diety = (RNG)=>{
  return RNG.pickone(DietyNames.a).slice(0, -1) + RNG.pickone(DietyNames.b).slice(1)
}


//generate cultural names 
const Cultural = {getBase,getBaseShort,getState}

export {Region, Diety, Cultural}
