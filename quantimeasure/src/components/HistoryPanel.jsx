import React, { useState } from "react";
import "../styles/History.css";

const HistoryPanel = ({ history, clearHistory }) => {
  const [filter, setFilter] = useState("All");
  const types = ["All", "Convert", "Add", "Subtract", "Divide", "Compare"];

  const filtered = filter === "All" ? history : history.filter((h) => h.type === filter);
  const reversed = [...filtered].reverse();

  const typeColors = {
    Convert: "#6366f1",
    Add: "#22c55e",
    Subtract: "#f59e0b",
    Divide: "#ec4899",
    Compare: "#06b6d4",
  };

  const typeIcons = {
    Convert: "⇄",
    Add: "+",
    Subtract: "−",
    Divide: "÷",
    Compare: "⚖",
  };

  return (
    <div className="panel history-panel">
      <div className="panel-header history-header">
        <div>
          <h2 className="panel-title">History</h2>
          <p className="panel-subtitle">{history.length} calculation{history.length !== 1 ? "s" : ""} performed</p>
        </div>
        {history.length > 0 && (
          <button className="clear-btn" onClick={clearHistory}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-row">
        {types.map((t) => (
          <button
            key={t}
            className={`filter-btn ${filter === t ? "active" : ""}`}
            onClick={() => setFilter(t)}
            style={filter === t && t !== "All" ? { borderColor: typeColors[t], color: typeColors[t] } : {}}
          >
            {t !== "All" && <span>{typeIcons[t]}</span>}
            {t}
          </button>
        ))}
      </div>

      {reversed.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">◷</div>
          <p>No calculations yet</p>
          <span>Your history will appear here</span>
        </div>
      ) : (
        <div className="history-list">
          {reversed.map((item, index) => (
            <div key={index} className="history-item" style={{ "--type-color": typeColors[item.type] }}>
              <div className="history-type-badge" style={{ background: typeColors[item.type] }}>
                <span>{typeIcons[item.type]}</span>
                {item.type}
              </div>
              <div className="history-content">
                <div className="history-expression">{item.expression}</div>
                <div className="history-result">= {item.result}</div>
              </div>
              <div className="history-category">{item.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;