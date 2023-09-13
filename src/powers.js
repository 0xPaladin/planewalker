import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, SpliceOrPush, WeightedString, chance} from "./random.js"

const Form = 'Armor,Arrow,Aura,Bane,Beast,Blade,Blast,Blessing,Blob,Blood,Bolt,Bond,Boon,Brain,Burst,Call,Charm,Circle,Claw,Cloak,Cone,Crown,Cube,Cup,Curse,Dagger,Dart,Demon,Disturbance,Door,Eye,Eyes,Face,Fang,Feast,Finger,Fissure,Fist,Gate,Gaze,Glamer,Globe,Golem,Guard,Guide,Guise,Halo,Hammer,Hand,Heart,Helm,Horn,Lock,Mantle,Mark,Memory,Mind,Mouth,Noose,Oath,Oracle,Pattern,Pet,Pillar,Pocket,Portal,Pyramid,Ray,Rune,Scream,Seal,Sentinel,Servant,Shaft,Shield,Sigil,Sign,Song,Spear,Spell,Sphere,Spray,Staff,Storm,Strike,Sword,Tendril,Tongue,Tooth,Trap,Veil,Voice,Wall,Ward,Wave,Weapon,Weave,Whisper,Wings,Word'
const Noun = 'Acid,Aether,Air,Anger,Ash,Avarice,Balance,Blight,Blood,Bone,Bones,Brimstone,Clay,Cloud,Copper,Cosmos,Dark,Death,Deceit,Despair,Destiny,Dimension,Doom,Dust,Earth,Ember,Energy,Envy,Fear,Fire,Fog,Force,Fury,Glory,Gluttony,Gold,Greed,Hate,Hatred,Health,Heat,History,Hope,Ice,Iron,Justice,Knowledge,Lead,Lies,Life,Light,Lightning,Lore,Love,Lust,Metal,Might,Mist,Moon,Mud,Nature,Oil,Pain,Perception,Plane,Plant,Poison,Quicksilver,Revulsion,Rot,Salt,Shadow,Sight,Silver,Smoke,Soil,Soul,Souls,Sound,Spirit,Stars,Steam,Steel,Stone,Storm,Sun,Terror,Time,Treasure,Truth,Vanity,Venom,Vermin,Void,Water,Will,Wind,Wisdom,Wood,Youth'
const Adjective = 'All-Knowing,All-Seeing,Arcane,Befuddling,Binding,Black,Blazing,Blinding,Bloody,Bright,Cacophonous,Cerulean,Concealing,Confusing,Consuming,Crimson,Damnable,Dark,Deflecting,Delicate,Demonic,Devastating,Devilish,Diminishing,Draining,Eldritch,Empowering,Enlightening,Ensorcelling,Entangling,Enveloping,Erratic,Evil,Excruciating,Expanding,Extra-Planar,Fearsome,Flaming,Floating,Freezing,Glittering,Gyrating,Helpful,Hindering,Icy,Illusory,Incredible,Inescapable,Ingenious,Instant,Invigorating,Invisible,Invulnerable,Liberating,Maddening,Magnificent,Many-Colored,Mighty,Most Excellent,Omnipotent,Oozing,Penultimate,Pestilential,Piercing,Poisonous,Prismatic,Raging,Rejuvenating,Restorative,Screaming,Sensitive,Shimmering,Shining,Silent,Sleeping,Slow,Smoking,Sorcerer’s,Strange,Stupefying,Terrible,Thirsty,Thundering,Trans-dimensional,Transmuting,Ultimate,Uncontrollable,Unseen,Unstoppable,Untiring,Vengeful,Vexing,Violent,Violet,Viridian,Voracious,Weakening,White,Wondrous,Yellow'
const FNA = {
    Form,
    Noun,
    Adjective
}

const Templates = 'Noun.Form,Adjective.Form,Adjective.Noun,Form.of.Noun,Form.of.Adjective.Noun/3,3,3,2,2'

const Challenges = ['Cypher', 'Fight', 'Mechanism', 'People', 'Obstacle', 'Wilderness']

const Power = (id=chance.hash(),opts={})=>{
    let RNG = new Chance(id)

    //get name form 
    let _n = WeightedString(Templates, RNG).split(".")
    let name = _n.map(w=>FNA[w] ? RNG.pickone(FNA[w].split(",")) : w).join(" ")

    //what challenge is it good for 
    const challenge = RNG.pickone(Challenges)

    //what type of power
    let what = RNG.pickone(["Maneuver", "Blessing", "Spell", "Trick", "Design"])

    let rank = Difficulty(RNG)

    return {
        id,
        rank,
        challenge,
        what,
        name
    }
}

export {Power}

console.log(BuildArray(5, ()=>Power()))