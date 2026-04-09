import React from "react";
import "../styles/Navbar.css";

const Navbar = ({ activeTab, setActiveTab, user, onLoginClick, onLogout }) => {
  const tabs = [
    { id: "convert", label: "Convert", icon: "⇄" },
    { id: "add", label: "Add", icon: "+" },
    { id: "subtract", label: "Subtract", icon: "−" },
    { id: "divide", label: "Divide", icon: "÷" },
    { id: "compare", label: "Compare", icon: "⚖" },
    { id: "history", label: "History", icon: "◷" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">∞</span>
        <span className="brand-name">Quantity Measurement App</span>
      </div>

      <div className="navbar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="navbar-user">
        {user ? (
          <div className="user-info">
            <div className="user-avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
            <span className="user-name">{user.name}</span>
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="btn-login" onClick={onLoginClick}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;