"use client";
import React, { useState } from "react";

const brackets = [
  { cap: 11000, rate: 0.10 },
  { cap: 44725, rate: 0.12 },
  { cap: 95375, rate: 0.22 },
  { cap: 182100, rate: 0.24 },
  { cap: 231250, rate: 0.32 },
  { cap: 578125, rate: 0.35 },
  { cap: Infinity, rate: 0.37 }
];

function computeFederalTax(income: number) {
  let tax = 0;
  let previousCap = 0;
  for (const b of brackets) {
    const taxable = Math.max(0, Math.min(income, b.cap) - previousCap);
    tax += taxable * b.rate;
    previousCap = b.cap;
    if (income <= b.cap) break;
  }
  return tax;
}

export default function TaxPage() {
  const [income, setIncome] = useState(75000);
  const [isMonthly, setIsMonthly] = useState(false);

  const annualIncome = isMonthly ? income * 12 : income;
  const federalTax = computeFederalTax(annualIncome);
  const netIncome = annualIncome - federalTax;
  const effectiveRate = annualIncome > 0 ? (federalTax / annualIncome) * 100 : 0;

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px", background: "#0b1922", border: "1px solid rgba(139,233,253,0.1)", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      <h1 style={{ color: "#8be9fd", fontSize: "26px", margin: "0 0 6px 0", fontWeight: 800 }}> USD Income Tax Estimator</h1>
      <p style={{ color: "#cfeffd", fontSize: "14px", opacity: 0.7, marginBottom: "24px" }}>A simplified progressive tax bracket simulator for global contractors, remote builders, and digital nomads.</p>

      <div style={{ display: "grid", gap: "20px" }}>
        <div>
          <label style={{ display: "block", color: "#8be9fd", fontSize: "14px", marginBottom: "8px", fontWeight: 600 }}>Gross Income Amount (USD):</label>
          <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} style={{ width: "100%", padding: "12px", background: "#071019", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "16px", boxSizing: "border-box", outline: "none" }} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#cfeffd", fontSize: "14px", cursor: "pointer" }}>
          <input type="checkbox" checked={isMonthly} onChange={(e) => setIsMonthly(e.target.checked)} style={{ transform: "scale(1.2)" }} /> Input monthly salary instead of annual
        </label>

        <div style={{ background: "#071019", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)", display: "grid", gap: "12px", fontSize: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Projected Annual Gross:</span><strong style={{ color: "#50fa7b", fontSize: "16px" }}>${annualIncome.toLocaleString()}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Estimated Federal Tax:</span><strong style={{ color: "#ff5555" }}>${federalTax.toFixed(2)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1e293b", paddingTop: "12px" }}><span>Net Disposable Income:</span><strong style={{ color: "#50fa7b", fontSize: "18px" }}>${netIncome.toFixed(2)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Effective Tax Rate:</span><strong style={{ color: "#ffb86c" }}>{effectiveRate.toFixed(2)}%</strong></div>
        </div>
      </div>
    </div>
  );
}
