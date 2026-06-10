import { Calculator } from "./types";
export const adsenseRevenue: Calculator = {
  id: "adsense-revenue",
  title: "Google AdSense Revenue Estimator",
  emoji: "💰",
  desc: "Calculate projected monthly passive earnings based on regional traffic and industry niche CPC.",
  category: "finance",
  fields: [
    { key: "traffic", label: "Monthly Page Views (PV)", type: "number", defaultValue: 50000 },
    { key: "ctr", label: "Expected Click-Through Rate (CTR %)", type: "number", defaultValue: 2 },
    { key: "cpc", label: "Average Cost-Per-Click (CPC in USD)", type: "number", defaultValue: 0.45 }
  ],
  compute: (inputs) => {
    const clicks = inputs.traffic * (inputs.ctr / 100);
    const monthlyEarnings = clicks * inputs.cpc;
    return [
      { label: "Projected Monthly Revenue", value: `$${monthlyEarnings.toFixed(2)}`, color: "#50fa7b" },
      { label: "Estimated Annual Revenue", value: `$${(monthlyEarnings * 12).toFixed(2)}`, color: "#50fa7b" }
    ];
  }
};
