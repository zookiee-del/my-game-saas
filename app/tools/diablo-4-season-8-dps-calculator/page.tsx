"use client";

import React, { useState, useMemo, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CharacterClass =
  | "barbarian"
  | "sorcerer"
  | "rogue"
  | "druid"
  | "necromancer"
  | "spiritborn";

type DamageBucket = "multiplicative" | "additive";

interface Skill {
  id: string;
  name: string;
  baseMultiplier: number;
  maxRank: number;
  rank: number;
  rankBonus: number;
  type: "active" | "passive";
  bucket: DamageBucket;
  description: string;
}

interface GearSlot {
  id: string;
  name: string;
  equipped: boolean;
  affixes: Affix[];
}

interface Affix {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  category: DamageBucket;
}

interface BuildPreset {
  id: string;
  name: string;
  className: CharacterClass;
  skills: Record<string, number>;
  gearAffixes: Record<string, number>;
}

interface DPSBreakdown {
  baseDPS: number;
  skillMultiplier: number;
  critContribution: number;
  vulnContribution: number;
  overpowerContribution: number;
  mainStatContribution: number;
  additiveBonus: number;
  multiplicativeBonus: number;
  finalDPS: number;
  effectiveDPS: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CLASS_DATA: Record<
  CharacterClass,
  { name: string; mainStat: string; icon: string; color: string }
> = {
  barbarian: {
    name: "Barbarian",
    mainStat: "Strength",
    icon: "⚔️",
    color: "from-red-600 to-red-800",
  },
  sorcerer: {
    name: "Sorcerer",
    mainStat: "Intelligence",
    icon: "🔮",
    color: "from-blue-600 to-blue-800",
  },
  rogue: {
    name: "Rogue",
    mainStat: "Dexterity",
    icon: "🗡️",
    color: "from-green-600 to-green-800",
  },
  druid: {
    name: "Druid",
    mainStat: "Willpower",
    icon: "🐺",
    color: "from-amber-600 to-amber-800",
  },
  necromancer: {
    name: "Necromancer",
    mainStat: "Intelligence",
    icon: "💀",
    color: "from-purple-600 to-purple-800",
  },
  spiritborn: {
    name: "Spiritborn",
    mainStat: "Strength",
    icon: "🦅",
    color: "from-teal-600 to-teal-800",
  },
};

const SKILL_TREES: Record<CharacterClass, Skill[]> = {
  barbarian: [
    {
      id: "bash",
      name: "Bash",
      baseMultiplier: 0.3,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.06,
      type: "active",
      bucket: "additive",
      description: "A powerful strike that deals damage and generates Fury",
    },
    {
      id: "frenzy",
      name: "Frenzy",
      baseMultiplier: 0.25,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.05,
      type: "active",
      bucket: "additive",
      description: "Rapid attacks that increase attack speed with each hit",
    },
    {
      id: "hammer_of_ancients",
      name: "Hammer of the Ancients",
      baseMultiplier: 1.2,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.12,
      type: "active",
      bucket: "multiplicative",
      description:
        "Slam the ground dealing massive AoE damage to nearby enemies",
    },
    {
      id: "whirlwind",
      name: "Whirlwind",
      baseMultiplier: 0.45,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.05,
      type: "active",
      bucket: "multiplicative",
      description: "Spin rapidly dealing damage to all surrounding enemies",
    },
    {
      id: "death_blow",
      name: "Death Blow",
      baseMultiplier: 1.8,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.18,
      type: "active",
      bucket: "multiplicative",
      description:
        "Execute enemies below 30% health, dealing massive damage",
    },
    {
      id: "berserking",
      name: "Berserking",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.05,
      type: "passive",
      bucket: "multiplicative",
      description: "Increases damage and movement speed while Berserking",
    },
    {
      id: "tough_as_nails",
      name: "Tough as Nails",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.04,
      type: "passive",
      bucket: "additive",
      description: "Increases armor and reflects damage to attackers",
    },
    {
      id: "weapons_master",
      name: "Weapons Master",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.06,
      type: "passive",
      bucket: "multiplicative",
      description: "Increases damage with all weapon types",
    },
  ],
  sorcerer: [
    {
      id: "fireball",
      name: "Fireball",
      baseMultiplier: 0.8,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.08,
      type: "active",
      bucket: "multiplicative",
      description: "Launch a ball of fire that explodes on impact",
    },
    {
      id: "ice_shards",
      name: "Ice Shards",
      baseMultiplier: 0.4,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.04,
      type: "active",
      bucket: "additive",
      description: "Fire shards of ice that pierce through enemies",
    },
    {
      id: "chain_lightning",
      name: "Chain Lightning",
      baseMultiplier: 0.35,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.04,
      type: "active",
      bucket: "additive",
      description: "Lightning that bounces between enemies",
    },
    {
      id: "meteor",
      name: "Meteor",
      baseMultiplier: 2.0,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.2,
      type: "active",
      bucket: "multiplicative",
      description:
        "Call down a meteor from the sky dealing massive damage in an area",
    },
    {
      id: "blizzard",
      name: "Blizzard",
      baseMultiplier: 0.6,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.06,
      type: "active",
      bucket: "multiplicative",
      description: "Summon a devastating blizzard over a large area",
    },
    {
      id: "glass_cannon",
      name: "Glass Cannon",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.1,
      type: "passive",
      bucket: "multiplicative",
      description: "Significantly increases damage but reduces defenses",
    },
    {
      id: "elemental_dominance",
      name: "Elemental Dominance",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.08,
      type: "passive",
      bucket: "multiplicative",
      description: "Increases damage of all elemental skills",
    },
    {
      id: "conjuration_mastery",
      name: "Conjuration Mastery",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.05,
      type: "passive",
      bucket: "additive",
      description: "Increases damage and duration of conjuration skills",
    },
  ],
  rogue: [
    {
      id: "puncture",
      name: "Puncture",
      baseMultiplier: 0.35,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.04,
      type: "active",
      bucket: "additive",
      description: "A quick stab that generates Energy and applies Vulnerable",
    },
    {
      id: "rapid_fire",
      name: "Rapid Fire",
      baseMultiplier: 0.2,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.03,
      type: "active",
      bucket: "additive",
      description: "Fire a rapid volley of arrows at enemies",
    },
    {
      id: "flurry",
      name: "Flurry",
      baseMultiplier: 0.5,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.05,
      type: "active",
      bucket: "multiplicative",
      description: "Dash between enemies striking each one",
    },
    {
      id: "twisting_blades",
      name: "Twisting Blades",
      baseMultiplier: 0.55,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.06,
      type: "active",
      bucket: "multiplicative",
      description:
        "Throw blades that return to you, dealing damage twice",
    },
    {
      id: "rain_of_arrows",
      name: "Rain of Arrows",
      baseMultiplier: 1.5,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.15,
      type: "active",
      bucket: "multiplicative",
      description: "Rain arrows from the sky over a large area",
    },
    {
      id: "exploit",
      name: "Exploit",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.08,
      type: "passive",
      bucket: "multiplicative",
      description: "Increases damage to Vulnerable and Crowd Controlled enemies",
    },
    {
      id: "weapon_mastery",
      name: "Weapon Mastery",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.06,
      type: "passive",
      bucket: "additive",
      description: "Increases critical strike chance with all weapons",
    },
    {
      id: "trapper",
      name: "Trapper",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.05,
      type: "passive",
      bucket: "additive",
      description: "Increases trap damage and duration",
    },
  ],
  druid: [
    {
      id: "wind_shear",
      name: "Wind Shear",
      baseMultiplier: 0.3,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.03,
      type: "active",
      bucket: "additive",
      description: "A gust of wind that damages and generates Spirit",
    },
    {
      id: "shred",
      name: "Shred",
      baseMultiplier: 0.6,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.06,
      type: "active",
      bucket: "multiplicative",
      description: "Dash through enemies in Werebear or Werewolf form",
    },
    {
      id: "tornado",
      name: "Tornado",
      baseMultiplier: 0.7,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.07,
      type: "active",
      bucket: "multiplicative",
      description: "Summon a tornado that moves through enemies",
    },
    {
      id: "pulverize",
      name: "Pulverize",
      baseMultiplier: 1.0,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.1,
      type: "active",
      bucket: "multiplicative",
      description:
        "Werebear slam that deals massive AoE damage and Overpowers",
    },
    {
      id: "lightning_storm",
      name: "Lightning Storm",
      baseMultiplier: 0.9,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.09,
      type: "active",
      bucket: "multiplicative",
      description: "Call lightning bolts from the sky repeatedly",
    },
    {
      id: "wild_impulses",
      name: "Wild Impulses",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.08,
      type: "passive",
      bucket: "multiplicative",
      description: "Increases Wild Shape damage",
    },
    {
      id: "nature_reach",
      name: "Nature's Reach",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.05,
      type: "passive",
      bucket: "additive",
      description: "Increases Storm skill damage and area",
    },
    {
      id: "perfect_storm",
      name: "Perfect Storm",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.07,
      type: "passive",
      bucket: "multiplicative",
      description: "Storm skills deal more damage and apply Vulnerable",
    },
  ],
  necromancer: [
    {
      id: "bone_splinters",
      name: "Bone Splinters",
      baseMultiplier: 0.25,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.03,
      type: "active",
      bucket: "additive",
      description: "Fire bone shards that generate Essence",
    },
    {
      id: "sever",
      name: "Sever",
      baseMultiplier: 0.7,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.07,
      type: "active",
      bucket: "multiplicative",
      description: "Slash through enemies leaving a trail of damage",
    },
    {
      id: "bone_spirit",
      name: "Bone Spirit",
      baseMultiplier: 1.5,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.15,
      type: "active",
      bucket: "multiplicative",
      description:
        "Summon a spirit that explodes dealing massive damage and applying Vulnerable",
    },
    {
      id: "blood_surge",
      name: "Blood Surge",
      baseMultiplier: 1.2,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.12,
      type: "active",
      bucket: "multiplicative",
      description: "Release a nova of blood dealing damage around you",
    },
    {
      id: "blight",
      name: "Blight",
      baseMultiplier: 0.8,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.08,
      type: "active",
      bucket: "multiplicative",
      description: "Corrupt an area causing continuous damage over time",
    },
    {
      id: "commander_of_darkness",
      name: "Commander of Darkness",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.08,
      type: "passive",
      bucket: "multiplicative",
      description: "Shadow skills deal more damage",
    },
    {
      id: "grave_down",
      name: "Grave Down",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.05,
      type: "passive",
      bucket: "additive",
      description: "Skills deal more damage to Vulnerable enemies",
    },
    {
      id: "profane_mortality",
      name: "Profane Mortality",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.07,
      type: "passive",
      bucket: "multiplicative",
      description: "Increase damage of all Necromancy skills",
    },
  ],
  spiritborn: [
    {
      id: "ebon_palms",
      name: "Ebon Palms",
      baseMultiplier: 0.4,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.04,
      type: "active",
      bucket: "additive",
      description: "Strike enemies with burning spirit energy",
    },
    {
      id: "wall_of_wind",
      name: "Wall of Wind",
      baseMultiplier: 0.6,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.06,
      type: "active",
      bucket: "multiplicative",
      description: "Create a wall of wind that damages enemies passing through",
    },
    {
      id: "inner_sight",
      name: "Inner Sight",
      baseMultiplier: 0.5,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.05,
      type: "active",
      bucket: "multiplicative",
      description: "Reveal and mark enemies, increasing damage taken",
    },
    {
      id: "storm_clones",
      name: "Storm Clones",
      baseMultiplier: 0.7,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.07,
      type: "active",
      bucket: "multiplicative",
      description: "Summon clones that duplicate your attacks",
    },
    {
      id: "tempest_rush",
      name: "Tempest Rush",
      baseMultiplier: 0.8,
      maxRank: 5,
      rank: 0,
      rankBonus: 0.08,
      type: "active",
      bucket: "multiplicative",
      description: "Charge through enemies dealing massive damage",
    },
    {
      id: "flowing_weapon",
      name: "Flowing Weapon",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.08,
      type: "passive",
      bucket: "multiplicative",
      description: "Spirit Guards deal increased damage",
    },
    {
      id: "wind_tempered_blade",
      name: "Wind Tempered Blade",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.05,
      type: "passive",
      bucket: "additive",
      description: "Increases damage with all weapon types",
    },
    {
      id: "dynamo",
      name: "Dynamo",
      baseMultiplier: 0,
      maxRank: 3,
      rank: 0,
      rankBonus: 0.07,
      type: "passive",
      bucket: "multiplicative",
      description: "Critical hits generate Spirit",
    },
  ],
};

const GEAR_SLOTS: Record<CharacterClass, GearSlot[]> = {
  barbarian: [
    {
      id: "helm",
      name: "Helm",
      equipped: true,
      affixes: [
        { id: "strength", name: "Strength", value: 100, maxValue: 150, category: "multiplicative" },
        { id: "critical_hit_damage", name: "Critical Hit Damage", value: 0.5, maxValue: 1.0, category: "multiplicative" },
        { id: "damage_reduction", name: "Damage Reduction", value: 0.15, maxValue: 0.3, category: "additive" },
      ],
    },
    {
      id: "chest",
      name: "Chest Armor",
      equipped: true,
      affixes: [
        { id: "vitality", name: "Vitality", value: 100, maxValue: 150, category: "additive" },
        { id: "armor", name: "Armor", value: 0.25, maxValue: 0.4, category: "multiplicative" },
        { id: "life_steal", name: "Life Steal", value: 0.03, maxValue: 0.05, category: "additive" },
      ],
    },
  ],
  sorcerer: [
    {
      id: "wand",
      name: "Wand",
      equipped: true,
      affixes: [
        { id: "intelligence", name: "Intelligence", value: 100, maxValue: 150, category: "multiplicative" },
        { id: "critical_hit_damage", name: "Critical Hit Damage", value: 0.5, maxValue: 1.0, category: "multiplicative" },
        { id: "fire_damage", name: "Fire Damage", value: 0.15, maxValue: 0.3, category: "multiplicative" },
      ],
    },
    {
      id: "orb",
      name: "Orb",
      equipped: true,
      affixes: [
        { id: "cooldown_reduction", name: "Cooldown Reduction", value: 0.15, maxValue: 0.25, category: "additive" },
        { id: "resource_cost_reduction", name: "Resource Cost Reduction", value: 0.2, maxValue: 0.3, category: "multiplicative" },
        { id: "critical_hit_chance", name: "Critical Hit Chance", value: 0.05, maxValue: 0.1, category: "additive" },
      ],
    },
  ],
  rogue: [
    {
      id: "bow",
      name: "Bow",
      equipped: true,
      affixes: [
        { id: "dexterity", name: "Dexterity", value: 100, maxValue: 150, category: "multiplicative" },
        { id: "critical_hit_damage", name: "Critical Hit Damage", value: 0.5, maxValue: 1.0, category: "multiplicative" },
        { id: "arrow_speed", name: "Arrow Speed", value: 0.2, maxValue: 0.3, category: "multiplicative" },
      ],
    },
    {
      id: "quiver",
      name: "Quiver",
      equipped: true,
      affixes: [
        { id: "movement_speed", name: "Movement Speed", value: 0.1, maxValue: 0.15, category: "multiplicative" },
        { id: "vulnerable_damage", name: "Vulnerable Damage", value: 0.25, maxValue: 0.4, category: "multiplicative" },
        { id: "critical_hit_chance", name: "Critical Hit Chance", value: 0.05, maxValue: 0.1, category: "additive" },
      ],
    },
  ],
  druid: [
    {
      id: "claws",
      name: "Claws",
      equipped: true,
      affixes: [
        { id: "willpower", name: "Willpower", value: 100, maxValue: 150, category: "multiplicative" },
        { id: "critical_hit_damage", name: "Critical Hit Damage", value: 0.5, maxValue: 1.0, category: "multiplicative" },
        { id: "werebear_damage", name: "Werebear Damage", value: 0.15, maxValue: 0.3, category: "multiplicative" },
      ],
    },
    {
      id: "totem",
      name: "Totem",
      equipped: true,
      affixes: [
        { id: "spirit_generation", name: "Spirit Generation", value: 0.2, maxValue: 0.3, category: "multiplicative" },
        { id: "transform_duration", name: "Transform Duration", value: 0.25, maxValue: 0.4, category: "additive" },
        { id: "critical_hit_chance", name: "Critical Hit Chance", value: 0.05, maxValue: 0.1, category: "additive" },
      ],
    },
  ],
  necromancer: [
    {
      id: "scythe",
      name: "Scythe",
      equipped: true,
      affixes: [
        { id: "intelligence", name: "Intelligence", value: 100, maxValue: 150, category: "multiplicative" },
        { id: "critical_hit_damage", name: "Critical Hit Damage", value: 0.5, maxValue: 1.0, category: "multiplicative" },
        { id: "necromancy_damage", name: "Necromancy Damage", value: 0.15, maxValue: 0.3, category: "multiplicative" },
      ],
    },
    {
      id: "skull",
      name: "Skull",
      equipped: true,
      affixes: [
        { id: "essence_generation", name: "Essence Generation", value: 0.2, maxValue: 0.3, category: "multiplicative" },
        { id: "shadow_damage", name: "Shadow Damage", value: 0.25, maxValue: 0.4, category: "multiplicative" },
        { id: "critical_hit_chance", name: "Critical Hit Chance", value: 0.05, maxValue: 0.1, category: "additive" },
      ],
    },
  ],
  spiritborn: [
    {
      id: "fists",
      name: "Fists",
      equipped: true,
      affixes: [
        { id: "strength", name: "Strength", value: 100, maxValue: 150, category: "multiplicative" },
        { id: "critical_hit_damage", name: "Critical Hit Damage", value: 0.5, maxValue: 1.0, category: "multiplicative" },
        { id: "spirit_damage", name: "Spirit Damage", value: 0.15, maxValue: 0.3, category: "multiplicative" },
      ],
    },
    {
      id: "focus",
      name: "Focus",
      equipped: true,
      affixes: [
        { id: "spirit_generation", name: "Spirit Generation", value: 0.2, maxValue: 0.3, category: "multiplicative" },
        { id: "clone_damage", name: "Clone Damage", value: 0.25, maxValue: 0.4, category: "multiplicative" },
        { id: "critical_hit_chance", name: "Critical Hit Chance", value: 0.05, maxValue: 0.1, category: "additive" },
      ],
    },
  ],
};

const BUILD_PRESETS: BuildPreset[] = [
  {
    id: "barb_frenzy",
    name: "Frenzy Barbarian",
    className: "barbarian",
    skills: { bash: 5, frenzy: 5, hammer_of_ancients: 3, whirlwind: 4, death_blow: 5, berserking: 3, tough_as_nails: 2, weapons_master: 3 },
    gearAffixes: { strength: 120, critical_hit_damage: 0.75, damage_reduction: 0.25, vitality: 120, armor: 0.35 }
  },
  {
    id: "sorc_meteor",
    name: "Meteor Sorcerer",
    className: "sorcerer",
    skills: { fireball: 3, ice_shards: 2, chain_lightning: 2, meteor: 5, blizzard: 4, glass_cannon: 3, elemental_dominance: 3, conjuration_mastery: 2 },
    gearAffixes: { intelligence: 130, critical_hit_damage: 0.8, fire_damage: 0.25, cooldown_reduction: 0.2, resource_cost_reduction: 0.25 }
  },
  {
    id: "rogue_flurry",
    name: "Flurry Rogue",
    className: "rogue",
    skills: { puncture: 4, rapid_fire: 3, flurry: 5, twisting_blades: 4, rain_of_arrows: 5, exploit: 3, weapon_mastery: 3, trapper: 2 },
    gearAffixes: { dexterity: 125, critical_hit_damage: 0.7, vulnerable_damage: 0.35, movement_speed: 0.15, arrow_speed: 0.25 }
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Diablo4DPSCalculator() {
  const [characterClass, setCharacterClass] = useState<CharacterClass>("barbarian");
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [gear, setGear] = useState<Record<string, Record<string, number>>>({});

  // Initialize skills and gear when class changes
  React.useEffect(() => {
    const initialSkills: Record<string, number> = {};
    SKILL_TREES[characterClass].forEach(skill => {
      initialSkills[skill.id] = skill.rank;
    });
    setSkills(initialSkills);

    const initialGear: Record<string, Record<string, number>> = {};
    GEAR_SLOTS[characterClass].forEach(slot => {
      initialGear[slot.id] = {};
      slot.affixes.forEach(affix => {
        initialGear[slot.id][affix.id] = affix.value;
      });
    });
    setGear(initialGear);
  }, [characterClass]);

  // Calculate DPS based on selected character, skills, and gear
  const dpsBreakdown = useMemo<DPSBreakdown>(() => {
    // Base stats
    const baseAttackSpeed = 1.0; // Attacks per second
    const baseDamage = 100; // Base damage
    const baseCritChance = 0.05 + (gear["chest"]?.critical_hit_chance || 0); // 5% base crit chance plus gear
    const baseCritDamage = 0.5 + (gear["helm"]?.critical_hit_damage || 0); // 50% base crit damage plus gear

    // Calculate skill multiplier
    let additiveMultiplier = 0;
    let multiplicativeMultiplier = 1;

    Object.entries(skills).forEach(([skillId, rank]) => {
      const skill = SKILL_TREES[characterClass].find(s => s.id === skillId);
      if (skill && rank > 0) {
        const skillValue = skill.baseMultiplier + (rank * skill.rankBonus);
        if (skill.bucket === "additive") {
          additiveMultiplier += skillValue;
        } else {
          multiplicativeMultiplier *= (1 + skillValue);
        }
      }
    });

    // Calculate gear bonuses
    let additiveBonus = 0;
    let multiplicativeBonus = 1;

    Object.values(gear).forEach(slotAffixes => {
      Object.entries(slotAffixes).forEach(([affixId, value]) => {
        // Find the corresponding affix to determine its category
        const affixCategory = findAffixCategory(characterClass, affixId);
        if (affixCategory === "additive") {
          additiveBonus += value;
        } else {
          multiplicativeBonus *= (1 + value);
        }
      });
    });

    // Calculate vulnerabilities and other factors
    const vulnBonus = 0.25; // Assume 25% vulnerable damage for this calculation
    const overpowerBonus = 0.20; // Assume 20% overpower damage for this calculation
    const mainStatBonus = 1.5; // Assume 150% main stat bonus for this calculation

    // Calculate final DPS
    const baseDPS = baseDamage * baseAttackSpeed;
    const skillMultiplier = (1 + additiveMultiplier) * multiplicativeMultiplier;
    const critContribution = baseCritChance * baseCritDamage * baseDPS * skillMultiplier;
    const vulnContribution = vulnBonus * baseDPS * skillMultiplier;
    const overpowerContribution = overpowerBonus * baseDPS * skillMultiplier;
    const mainStatContribution = mainStatBonus * baseDPS * skillMultiplier;
    
    const additiveTotal = additiveBonus;
    const multiplicativeTotal = multiplicativeBonus;
    
    const finalDPS = baseDPS * skillMultiplier * (1 + additiveTotal) * multiplicativeTotal * (1 + mainStatContribution) * (1 + critContribution/baseDPS) * (1 + vulnContribution/baseDPS) * (1 + overpowerContribution/baseDPS);

    return {
      baseDPS,
      skillMultiplier,
      critContribution,
      vulnContribution,
      overpowerContribution,
      mainStatContribution,
      additiveBonus,
      multiplicativeBonus,
      finalDPS,
      effectiveDPS: finalDPS
    };
  }, [characterClass, skills, gear]);

  // Helper function to find the category of an affix
  const findAffixCategory = (charClass: CharacterClass, affixId: string): DamageBucket => {
    for (const slot of GEAR_SLOTS[charClass]) {
      for (const affix of slot.affixes) {
        if (affix.id === affixId) {
          return affix.category;
        }
      }
    }
    return "additive"; // Default fallback
  };

  // Handle skill rank changes
  const handleSkillChange = useCallback((skillId: string, rank: number) => {
    setSkills(prev => ({ ...prev, [skillId]: rank }));
  }, []);

  // Handle gear affix changes
  const handleGearChange = useCallback((slotId: string, affixId: string, value: number) => {
    setGear(prev => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        [affixId]: value
      }
    }));
  }, []);

  // Apply a preset build
  const applyPreset = useCallback((preset: BuildPreset) => {
    setCharacterClass(preset.className);
    setSkills(preset.skills);
    
    // Apply gear affixes from preset
    const newGear: Record<string, Record<string, number>> = {};
    GEAR_SLOTS[preset.className].forEach(slot => {
      newGear[slot.id] = { ...slot.affixes.reduce((acc, affix) => {
        acc[affix.id] = preset.gearAffixes[affix.id] || affix.value;
        return acc;
      }, {} as Record<string, number>) };
    });
    setGear(newGear);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-red-500">
          Diablo 4 Season 8 DPS & Build Calculator
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Calculate your damage output and optimize your build
        </p>

        {/* Class Selection */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Select Character Class</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {(Object.keys(CLASS_DATA) as CharacterClass[]).map(cls => (
              <button
                key={cls}
                className={`p-3 rounded-md transition-all ${
                  characterClass === cls
                    ? `bg-gradient-to-r ${CLASS_DATA[cls].color} text-white`
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setCharacterClass(cls)}
              >
                <span className="mr-2">{CLASS_DATA[cls].icon}</span>
                {CLASS_DATA[cls].name}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Builds */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Preset Builds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BUILD_PRESETS.filter(preset => preset.className === characterClass).map(preset => (
              <button
                key={preset.id}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-md text-left transition-colors"
                onClick={() => applyPreset(preset)}
              >
                <h3 className="font-bold text-green-300">{preset.name}</h3>
                <p className="text-sm text-gray-400">Click to load this build</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Section */}
          <div className="lg:col-span-2 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Skills</h2>
            <div className="space-y-4">
              {SKILL_TREES[characterClass].map(skill => (
                <div key={skill.id} className="p-3 bg-gray-700 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-green-300">{skill.name}</h3>
                      <p className="text-sm text-gray-400">{skill.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      skill.bucket === "multiplicative" ? "bg-purple-900 text-purple-200" : "bg-blue-900 text-blue-200"
                    }`}>
                      {skill.type} | {skill.bucket}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-sm mb-1">
                      Rank: {skills[skill.id] || 0}/{skill.maxRank}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={skill.maxRank}
                      value={skills[skill.id] || 0}
                      onChange={(e) => handleSkillChange(skill.id, parseInt(e.target.value))}
                      className="w-full accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      {[...Array(skill.maxRank + 1)].map((_, i) => (
                        <span key={i}>{i}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <p>Base Multiplier: {skill.baseMultiplier.toFixed(2)}</p>
                    <p>Current Value: {((skills[skill.id] || 0) * skill.rankBonus + skill.baseMultiplier).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats & Results Panel */}
          <div className="space-y-6">
            {/* Gear Affixes */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">Gear Affixes</h2>
              <div className="space-y-4">
                {GEAR_SLOTS[characterClass].map(slot => (
                  <div key={slot.id} className="p-3 bg-gray-700 rounded-md">
                    <h3 className="font-bold mb-2">{slot.name}</h3>
                    {slot.affixes.map(affix => (
                      <div key={affix.id} className="mb-2">
                        <label className="block text-sm mb-1">
                          {affix.name}: {(gear[slot.id]?.[affix.id] || 0).toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max={affix.maxValue}
                          step={affix.maxValue > 1 ? 1 : 0.01}
                          value={gear[slot.id]?.[affix.id] || 0}
                          onChange={(e) => handleGearChange(slot.id, affix.id, parseFloat(e.target.value))}
                          className="w-full accent-green-500"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* DPS Calculation Results */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">DPS Calculation</h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-md">
                  <p className="text-sm">Base DPS</p>
                  <p className="text-lg font-bold text-green-300">{dpsBreakdown.baseDPS.toFixed(2)}</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-md">
                  <p className="text-sm">Skill Multiplier</p>
                  <p className="text-lg font-bold text-green-300">{dpsBreakdown.skillMultiplier.toFixed(2)}x</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-md">
                  <p className="text-sm">Critical Damage Contribution</p>
                  <p className="text-lg font-bold text-green-300">{dpsBreakdown.critContribution.toFixed(2)}</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-md">
                  <p className="text-sm">Vulnerable Damage Bonus</p>
                  <p className="text-lg font-bold text-green-300">{dpsBreakdown.vulnContribution.toFixed(2)}</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-md">
                  <p className="text-sm">Overpower Damage Bonus</p>
                  <p className="text-lg font-bold text-green-300">{dpsBreakdown.overpowerContribution.toFixed(2)}</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-md">
                  <p className="text-sm">Additive Bonuses</p>
                  <p className="text-lg font-bold text-green-300">{dpsBreakdown.additiveBonus.toFixed(2)}x</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-md">
                  <p className="text-sm">Multiplicative Bonuses</p>
                  <p className="text-lg font-bold text-green-300">{dpsBreakdown.multiplicativeBonus.toFixed(2)}x</p>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-red-700 to-red-900 rounded-md">
                  <p className="text-sm">FINAL DPS ESTIMATE</p>
                  <p className="text-2xl font-bold text-yellow-300">{dpsBreakdown.finalDPS.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}