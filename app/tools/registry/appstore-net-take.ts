import { Calculator } from "./types";
export const appstoreNetTake: Calculator = {
  id: "appstore-net-take",
  title: "App Store Revenue Splitter",
  emoji: "📱",
  desc: "Deconstruct platform commissions (15% vs 30%) and regional tax deductions.",
  category: "finance",
  fields: [
    { key: "gross", label: "Gross App Sales Volume (USD)", type: "number", defaultValue: 10000 },
    { key: "tier", label: "Store Commission Tier", type: "select", defaultValue: 0.15, options: [{ label: "15% (Small Business)", value: 0.15 }, { label: "30% (Standard Tier)", value: 0.30 }] }
  ],
  compute: (inputs) => {
    const commission = inputs.gross * inputs.tier;
    return [{ label: "Your Pure Net Payout", value: `$${(inputs.gross - commission).toFixed(2)}`, color: "#50fa7b" }];
  }
};
