"use client";
import React, { useState } from "react";

export default function GamePage() {
  const [base, setBase] = useState(100);
  const [atkSpeed, setAtkSpeed] = useState(1.2);
  const [critChance, setCritChance] = useState(25);
  const [critMult, setCritMult] = useState(2);
  const [mulBuff, setMulBuff] = useState(0);

  const avgDamage = base * (1 + (Math.min(100, Math.max(0, critChance)) / 100) * (critMult - 1));
  const dps = avgDamage * atkSpeed * (1 + mulBuff / 100);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px", background: "#0b1922", border: "1px solid rgba(139,233,253,0.1)", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      <h1 style={{ color: "#8be9fd", fontSize: "26px", margin: "0 0 6px 0", fontWeight: 800 }}> DPS Multiplier Simulator</h1>
      <p style={{ color: "#cfeffd", fontSize: "14px", opacity: 0.7, marginBottom: "24px" }}>Deconstruct complex edge returns and optimal scaling curves across independent damage dimensions.</p>

      <div style={{ display: "grid", gap: "14px", fontSize: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>Base Weapon Damage:</span><input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} style={{ padding: "8px", background: "#071019", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", width: "120px" }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>Attack Speed (Per Sec):</span><input type="number" value={atkSpeed} onChange={(e) => setAtkSpeed(Number(e.target.value))} style={{ padding: "8px", background: "#071019", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", width: "120px" }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>Critical Strike Chance (%):</span><input type="number" value={critChance} onChange={(e) => setCritChance(Number(e.target.value))} style={{ padding: "8px", background: "#071019", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", width: "120px" }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>Critical Damage Multiplier (e.g. 2.0 = 200%):</span><input type="number" value={critMult} onChange={(e) => setCritMult(Number(e.target.value))} style={{ padding: "8px", background: "#071019", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", width: "120px" }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>Independent Buffs Boost (% Total DMG):</span><input type="number" value={mulBuff} onChange={(e) => setMulBuff(Number(e.target.value))} style={{ padding: "8px", background: "#071019", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", width: "120px" }} /></div>

        <div style={{ background: "#071019", padding: "20px", borderRadius: "12px", marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span>Expected Per-Hit Mean Damage:</span><strong style={{ color: "#50fa7b" }}>{avgDamage.toFixed(2)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1e293b", paddingTop: "12px" }}><span>Theoretical Sustained DPS:</span><strong style={{ color: "#8be9fd", fontSize: "20px" }}>{dps.toFixed(2)}</strong></div>
        </div>
      </div>
    </div>
  );
}
