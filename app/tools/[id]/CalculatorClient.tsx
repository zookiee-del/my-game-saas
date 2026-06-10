"use client";
import React, { useState, useEffect } from "react";
import { calculatorsRegistry } from "../registry";

export default function CalculatorClient({ toolId }: { toolId: string }) {
  const tool = calculatorsRegistry[toolId];

  if (!tool) {
    return <div style={{ color: "#ff5555", padding: "40px", textAlign: "center" }}>Utility Stream Corrupted: Tool Offline.</div>;
  }

  const [inputs, setInputs] = useState<Record<string, number>>({});

  useEffect(() => {
    const defaultStates: Record<string, number> = {};
    tool.fields.forEach(f => { defaultStates[f.key] = f.defaultValue; });
    setInputs(defaultStates);
  }, [tool]);

  const handleInputChange = (key: string, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const results = tool.compute(inputs);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px", background: "#0b1922", border: "1px solid rgba(139,233,253,0.1)", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <span style={{ fontSize: "32px" }}>{tool.emoji}</span>
        <h1 style={{ color: "#8be9fd", fontSize: "24px", margin: 0, fontWeight: 800 }}>{tool.title}</h1>
      </div>
      <p style={{ color: "#cfeffd", fontSize: "14px", opacity: 0.7, marginBottom: "28px", lineHeight: "1.5" }}>{tool.desc}</p>

      <div style={{ display: "grid", gap: "20px" }}>
        {tool.fields.map(field => (
          <div key={field.key}>
            <label style={{ display: "block", color: "#8be9fd", fontSize: "13px", marginBottom: "8px", fontWeight: 600 }}>{field.label}:</label>
            {field.type === "select" ? (
              <select 
                value={inputs[field.key] ?? field.defaultValue} 
                onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
                style={{ width: "100%", padding: "12px", background: "#071019", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "15px", outline: "none", cursor: "pointer" }}
              >
                {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input 
                type="number" 
                value={inputs[field.key] ?? ""} 
                onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
                style={{ width: "100%", padding: "12px", background: "#071019", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "15px", boxSizing: "border-box", outline: "none" }}
              />
            )}
          </div>
        ))}

        <div style={{ background: "#071019", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)", display: "grid", gap: "16px", marginTop: "12px" }}>
          {results.map((res, index) => (
            <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: index !== results.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none", paddingBottom: index !== results.length - 1 ? "12px" : "0" }}>
              <span style={{ fontSize: "14px", color: "#cfeffd", opacity: 0.8 }}>{res.label}:</span>
              <strong style={{ color: res.color || "#ffffff", fontSize: res.color ? "20px" : "16px", fontWeight: 700 }}>{res.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
