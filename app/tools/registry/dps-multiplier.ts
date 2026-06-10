import { Calculator } from "./types";
export const dpsMultiplier: Calculator = {
  id: "dps-multiplier",
  title: "MMORPG DPS Optimization Matrix",
  emoji: "⚔️",
  desc: "Calculate scaling inflection points across Base DMG, Attack Speed, and critical multipliers.",
  category: "gaming",
  fields: [
    { key: "base", label: "Base Weapon Damage", type: "number", defaultValue: 150 },
    { key: "speed", label: "Attack Speed (Hits/Sec)", type: "number", defaultValue: 1.5 },
    { key: "critChance", label: "Critical Hit Chance (%)", type: "number", defaultValue: 30 },
    { key: "critDamage", label: "Critical Damage Multiplier", type: "number", defaultValue: 2.0 }
  ],
  compute: (inputs) => {
    const critWeight = 1 + (Math.min(100, Math.max(0, inputs.critChance)) / 100) * (inputs.critDamage - 1);
    return [{ label: "Sustained Theoretical DPS Output", value: (inputs.base * inputs.speed * critWeight).toFixed(2), color: "#8be9fd" }];
  }
};
