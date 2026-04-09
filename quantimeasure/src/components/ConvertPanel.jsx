import React, { useState, useEffect } from "react";
import { unitCategories, convertUnit, formatNumber } from "../utils/units";
import "../styles/Panels.css";

const ConvertPanel = ({ addToHistory, user, onLoginClick }) => {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("kilometer");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState(null);
  const [swapped, setSwapped] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);

  const categories = Object.entries(unitCategories);
  const currentUnits = Object.entries(unitCategories[category].units);

  useEffect(() => {
    const units = Object.keys(unitCategories[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setResult(null);
    setInputValue("");
    setSaved(false);
    setPendingEntry(null);
  }, [category]);

  const handleConvert = () => {
    if (!inputValue || isNaN(inputValue)) return;
    const val = parseFloat(inputValue);
    const converted = convertUnit(val, fromUnit, toUnit, category);
    const formattedResult = formatNumber(converted);
    setResult(formattedResult);
    setSaved(false);
    setPendingEntry({
      type: "Convert",
      expression: `${val} ${unitCategories[category].units[fromUnit]?.symbol} → ${unitCategories[category].units[toUnit]?.symbol}`,
      result: formattedResult,
      category,
    });
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setSwapped(!swapped);
    setResult(null);
    setSaved(false);
  };

  const handleSave = () => {
    if (!user) { onLoginClick(); return; }
    if (pendingEntry) { addToHistory(pendingEntry); setSaved(true); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleConvert();
  };

  return (
    <div className="panel convert-panel">
      <div className="panel-header">
        <h2 className="panel-title">Unit Converter</h2>
        <p className="panel-subtitle">Convert between any units instantly</p>
      </div>

      <div className="category-grid">
        {categories.map(([key, cat]) => (
          <button
            key={key}
            className={`category-btn ${category === key ? "active" : ""}`}
            onClick={() => setCategory(key)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="converter-body">
        <div className="unit-selector-group">
          <div className="unit-block">
            <label className="unit-label">From</label>
            <select
              className="unit-select"
              value={fromUnit}
              onChange={(e) => { setFromUnit(e.target.value); setResult(null); setSaved(false); }}
            >
              {currentUnits.map(([key, unit]) => (
                <option key={key} value={key}>{unit.label} ({unit.symbol})</option>
              ))}
            </select>
            <input
              className="value-input"
              type="number"
              placeholder="Enter value..."
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setResult(null); setSaved(false); }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="swap-btn" onClick={handleSwap} title="Swap units">
            <span className={`swap-icon ${swapped ? "rotated" : ""}`}>⇄</span>
          </button>

          <div className="unit-block">
            <label className="unit-label">To</label>
            <select
              className="unit-select"
              value={toUnit}
              onChange={(e) => { setToUnit(e.target.value); setResult(null); setSaved(false); }}
            >
              {currentUnits.map(([key, unit]) => (
                <option key={key} value={key}>{unit.label} ({unit.symbol})</option>
              ))}
            </select>
            <div className={`result-display ${result !== null ? "has-result" : ""}`}>
              {result !== null
                ? <span className="result-value">{result}</span>
                : <span className="result-placeholder">Result appears here</span>}
            </div>
          </div>
        </div>

        <button className="action-btn convert-btn" onClick={handleConvert} disabled={!inputValue}>
          Convert Now →
        </button>

        {result !== null && (
          <div className="result-card">
            <div className="result-equation">
              <span className="eq-value">{inputValue}</span>
              <span className="eq-unit">{unitCategories[category].units[fromUnit]?.symbol}</span>
              <span className="eq-arrow">=</span>
              <span className="eq-value highlight">{result}</span>
              <span className="eq-unit">{unitCategories[category].units[toUnit]?.symbol}</span>
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

export default ConvertPanel;