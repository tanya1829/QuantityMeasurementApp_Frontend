import React, { useState } from "react";
import { unitCategories, convertTemperature, formatNumber } from "../utils/units";
import "../styles/Panels.css";

const ComparePanel = ({ addToHistory, user, onLoginClick }) => {
  const [category, setCategory] = useState("length");
  const [value1, setValue1] = useState("");
  const [unit1, setUnit1] = useState("meter");
  const [value2, setValue2] = useState("");
  const [unit2, setUnit2] = useState("kilometer");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);

  const categories = Object.entries(unitCategories);
  const currentUnits = Object.entries(unitCategories[category].units);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const units = Object.keys(unitCategories[cat].units);
    setUnit1(units[0]); setUnit2(units[1] || units[0]);
    setResult(null); setSaved(false); setPendingEntry(null);
  };

  const handleCompare = () => {
    if (!value1 || !value2 || isNaN(value1) || isNaN(value2)) return;
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    let base1, base2;
    if (category === "temperature") {
      base1 = convertTemperature(v1, unit1, "celsius");
      base2 = convertTemperature(v2, unit2, "celsius");
    } else {
      base1 = v1 * unitCategories[category].units[unit1].toBase;
      base2 = v2 * unitCategories[category].units[unit2].toBase;
    }
    const diff = base1 - base2;
    const ratio = base2 !== 0 ? base1 / base2 : null;
    let comparison;
    if (Math.abs(diff) < 1e-10) {
      comparison = { relation: "equal", diff: 0, ratio: 1 };
    } else if (base1 > base2) {
      comparison = { relation: "greater", diffFormatted: formatNumber(Math.abs(diff)), ratio };
    } else {
      comparison = { relation: "less", diffFormatted: formatNumber(Math.abs(diff)), ratio };
    }
    setResult(comparison);
    setSaved(false);
    setPendingEntry({
      type: "Compare",
      expression: `${v1} ${unitCategories[category].units[unit1]?.symbol} vs ${v2} ${unitCategories[category].units[unit2]?.symbol}`,
      result: comparison.relation,
      category,
    });
  };

  const handleSave = () => {
    if (!user) { onLoginClick(); return; }
    if (pendingEntry) { addToHistory(pendingEntry); setSaved(true); }
  };

  const icon = (r) => r === "equal" ? "=" : r === "greater" ? ">" : "<";
  const cls = (r) => r === "equal" ? "equal" : r === "greater" ? "greater" : "less";

  return (
    <div className="panel compare-panel">
      <div className="panel-header">
        <h2 className="panel-title">Compare Quantities</h2>
        <p className="panel-subtitle">See how two measurements stack up</p>
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
            <label className="unit-label">Quantity A</label>
            <input className="value-input" type="number" placeholder="Enter value..." value={value1} onChange={(e) => { setValue1(e.target.value); setResult(null); setSaved(false); }} />
            <select className="unit-select" value={unit1} onChange={(e) => { setUnit1(e.target.value); setResult(null); setSaved(false); }}>
              {currentUnits.map(([key, unit]) => <option key={key} value={key}>{unit.label} ({unit.symbol})</option>)}
            </select>
          </div>
          <div className="operator-badge compare-op">vs</div>
          <div className="operand-block">
            <label className="unit-label">Quantity B</label>
            <input className="value-input" type="number" placeholder="Enter value..." value={value2} onChange={(e) => { setValue2(e.target.value); setResult(null); setSaved(false); }} />
            <select className="unit-select" value={unit2} onChange={(e) => { setUnit2(e.target.value); setResult(null); setSaved(false); }}>
              {currentUnits.map(([key, unit]) => <option key={key} value={key}>{unit.label} ({unit.symbol})</option>)}
            </select>
          </div>
        </div>
        <button className="action-btn compare-btn" onClick={handleCompare} disabled={!value1 || !value2}>
          Compare Now →
        </button>
        {result && (
          <div className={`compare-result-card ${cls(result.relation)}`}>
            <div className="compare-visual">
              <div className="compare-side">
                <span className="compare-val">{value1}</span>
                <span className="compare-unit">{unitCategories[category].units[unit1]?.symbol}</span>
              </div>
              <div className={`compare-relation ${cls(result.relation)}`}>{icon(result.relation)}</div>
              <div className="compare-side">
                <span className="compare-val">{value2}</span>
                <span className="compare-unit">{unitCategories[category].units[unit2]?.symbol}</span>
              </div>
            </div>
            <div className="compare-detail">
              {result.relation === "equal" && <span>Both quantities are equal!</span>}
              {result.relation === "greater" && <span>Value A is larger by <strong>{result.diffFormatted}</strong> base units</span>}
              {result.relation === "less" && <span>Value B is larger by <strong>{result.diffFormatted}</strong> base units</span>}
              {result.ratio && result.relation !== "equal" && (
                <span className="ratio-info"> · Ratio: {formatNumber(result.ratio)}x</span>
              )}
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
export default ComparePanel;