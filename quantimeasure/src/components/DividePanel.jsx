import React, { useState } from "react";
import { unitCategories, formatNumber } from "../utils/units";
import "../styles/Panels.css";

const DividePanel = ({ addToHistory, user, onLoginClick }) => {
  const [category, setCategory] = useState("length");
  const [value1, setValue1] = useState("");
  const [unit1, setUnit1] = useState("meter");
  const [value2, setValue2] = useState("");
  const [unit2, setUnit2] = useState("meter");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);

  const categories = Object.entries(unitCategories);
  const currentUnits = Object.entries(unitCategories[category].units);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const units = Object.keys(unitCategories[cat].units);
    setUnit1(units[0]); setUnit2(units[0]);
    setResult(null); setError(""); setSaved(false); setPendingEntry(null);
  };

  const handleDivide = () => {
    if (!value1 || !value2 || isNaN(value1) || isNaN(value2)) return;
    setError("");
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    if (v2 === 0) { setError("Cannot divide by zero!"); return; }
    let quotient;
    if (category === "temperature") {
      quotient = v1 / v2;
    } else {
      const b1 = v1 * unitCategories[category].units[unit1].toBase;
      const b2 = v2 * unitCategories[category].units[unit2].toBase;
      quotient = b1 / b2;
    }
    const formatted = formatNumber(quotient);
    setResult(formatted);
    setSaved(false);
    setPendingEntry({
      type: "Divide",
      expression: `${v1} ${unitCategories[category].units[unit1]?.symbol} ÷ ${v2} ${unitCategories[category].units[unit2]?.symbol}`,
      result: formatted,
      category,
    });
  };

  const handleSave = () => {
    if (!user) { onLoginClick(); return; }
    if (pendingEntry) { addToHistory(pendingEntry); setSaved(true); }
  };

  return (
    <div className="panel divide-panel">
      <div className="panel-header">
        <h2 className="panel-title">Divide Quantities</h2>
        <p className="panel-subtitle">Find ratios between measurements</p>
      </div>
      <div className="category-grid">
        {categories.map(([key, cat]) => (
          <button key={key} className={`category-btn ${category === key ? "active" : ""}`} onClick={() => handleCategoryChange(key)}>
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>
      <div className="operation-body">
        <div className="operand-row">
          <div className="operand-block">
            <label className="unit-label">Dividend</label>
            <input className="value-input" type="number" placeholder="Enter value..." value={value1} onChange={(e) => { setValue1(e.target.value); setResult(null); setError(""); setSaved(false); }} />
            <select className="unit-select" value={unit1} onChange={(e) => { setUnit1(e.target.value); setResult(null); setSaved(false); }}>
              {currentUnits.map(([key, unit]) => <option key={key} value={key}>{unit.label} ({unit.symbol})</option>)}
            </select>
          </div>
          <div className="operator-badge divide-op">÷</div>
          <div className="operand-block">
            <label className="unit-label">Divisor</label>
            <input className="value-input" type="number" placeholder="Enter value..." value={value2} onChange={(e) => { setValue2(e.target.value); setResult(null); setError(""); setSaved(false); }} />
            <select className="unit-select" value={unit2} onChange={(e) => { setUnit2(e.target.value); setResult(null); setSaved(false); }}>
              {currentUnits.map(([key, unit]) => <option key={key} value={key}>{unit.label} ({unit.symbol})</option>)}
            </select>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button className="action-btn divide-btn" onClick={handleDivide} disabled={!value1 || !value2}>
          Calculate Ratio →
        </button>
        {result !== null && (
          <div className="result-card">
            <div className="result-equation">
              <span className="eq-value">{value1}</span>
              <span className="eq-unit">{unitCategories[category].units[unit1]?.symbol}</span>
              <span className="eq-arrow">÷</span>
              <span className="eq-value">{value2}</span>
              <span className="eq-unit">{unitCategories[category].units[unit2]?.symbol}</span>
              <span className="eq-arrow">=</span>
              <span className="eq-value highlight">{result}</span>
              <span className="eq-unit ratio-label">(ratio)</span>
            </div>
            <button className={`save-history-btn ${saved ? "saved" : ""}`} onClick={handleSave} disabled={saved}>
              {saved ? "✓ Saved to History" : user ? "🕓 Save to History" : "🔒 Sign in to Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default DividePanel;