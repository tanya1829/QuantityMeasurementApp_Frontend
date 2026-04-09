import React, { useState } from "react";
import { unitCategories, formatNumber } from "../utils/units";
import "../styles/Panels.css";

const SubtractPanel = ({ addToHistory, user, onLoginClick }) => {
  const [category, setCategory] = useState("length");
  const [value1, setValue1] = useState("");
  const [unit1, setUnit1] = useState("meter");
  const [value2, setValue2] = useState("");
  const [unit2, setUnit2] = useState("meter");
  const [resultUnit, setResultUnit] = useState("meter");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);

  const categories = Object.entries(unitCategories);
  const currentUnits = Object.entries(unitCategories[category].units);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const units = Object.keys(unitCategories[cat].units);
    setUnit1(units[0]); setUnit2(units[0]); setResultUnit(units[0]);
    setResult(null); setSaved(false); setPendingEntry(null);
  };

  const handleSubtract = () => {
    if (!value1 || !value2 || isNaN(value1) || isNaN(value2)) return;
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    let diff;
    if (category === "temperature") {
      diff = v1 - v2;
    } else {
      const b1 = v1 * unitCategories[category].units[unit1].toBase;
      const b2 = v2 * unitCategories[category].units[unit2].toBase;
      diff = (b1 - b2) / unitCategories[category].units[resultUnit].toBase;
    }
    const formatted = formatNumber(diff);
    setResult(formatted);
    setSaved(false);
    setPendingEntry({
      type: "Subtract",
      expression: `${v1} ${unitCategories[category].units[unit1]?.symbol} − ${v2} ${unitCategories[category].units[unit2]?.symbol}`,
      result: `${formatted} ${unitCategories[category].units[resultUnit]?.symbol}`,
      category,
    });
  };

  const handleSave = () => {
    if (!user) { onLoginClick(); return; }
    if (pendingEntry) { addToHistory(pendingEntry); setSaved(true); }
  };

  return (
    <div className="panel subtract-panel">
      <div className="panel-header">
        <h2 className="panel-title">Subtract Quantities</h2>
        <p className="panel-subtitle">Find the difference between measurements</p>
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
            <label className="unit-label">Value 1</label>
            <input className="value-input" type="number" placeholder="Enter value..." value={value1} onChange={(e) => { setValue1(e.target.value); setResult(null); setSaved(false); }} />
            <select className="unit-select" value={unit1} onChange={(e) => { setUnit1(e.target.value); setResult(null); setSaved(false); }}>
              {currentUnits.map(([key, unit]) => <option key={key} value={key}>{unit.label} ({unit.symbol})</option>)}
            </select>
          </div>
          <div className="operator-badge subtract-op">−</div>
          <div className="operand-block">
            <label className="unit-label">Value 2</label>
            <input className="value-input" type="number" placeholder="Enter value..." value={value2} onChange={(e) => { setValue2(e.target.value); setResult(null); setSaved(false); }} />
            <select className="unit-select" value={unit2} onChange={(e) => { setUnit2(e.target.value); setResult(null); setSaved(false); }}>
              {currentUnits.map(([key, unit]) => <option key={key} value={key}>{unit.label} ({unit.symbol})</option>)}
            </select>
          </div>
        </div>
        <div className="result-unit-row">
          <label className="unit-label">Result in</label>
          <select className="unit-select result-unit-select" value={resultUnit} onChange={(e) => setResultUnit(e.target.value)}>
            {currentUnits.map(([key, unit]) => <option key={key} value={key}>{unit.label} ({unit.symbol})</option>)}
          </select>
        </div>
        <button className="action-btn subtract-btn" onClick={handleSubtract} disabled={!value1 || !value2}>
          Calculate Difference →
        </button>
        {result !== null && (
          <div className="result-card">
            <div className="result-equation">
              <span className="eq-value">{value1}</span>
              <span className="eq-unit">{unitCategories[category].units[unit1]?.symbol}</span>
              <span className="eq-arrow">−</span>
              <span className="eq-value">{value2}</span>
              <span className="eq-unit">{unitCategories[category].units[unit2]?.symbol}</span>
              <span className="eq-arrow">=</span>
              <span className="eq-value highlight">{result}</span>
              <span className="eq-unit">{unitCategories[category].units[resultUnit]?.symbol}</span>
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
export default SubtractPanel;