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