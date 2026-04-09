import React, { useState } from "react";
import "./styles/App.css";
import Navbar from "./components/Navbar";
import ConvertPanel from "./components/ConvertPanel";
import AddPanel from "./components/AddPanel";
import SubtractPanel from "./components/SubtractPanel";
import DividePanel from "./components/DividePanel";
import ComparePanel from "./components/ComparePanel";
import HistoryPanel from "./components/HistoryPanel";
import LoginModal from "./components/LoginModal";

function App() {
  const [activeTab, setActiveTab] = useState("convert");
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const addToHistory = (entry) => {
    if (user) {
      setHistory((prev) => [...prev, { ...entry, timestamp: new Date() }]);
    }
  };

  const clearHistory = () => setHistory([]);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
  };

  // When user clicks History tab without being logged in, prompt login
  const handleTabChange = (tab) => {
    if (tab === "history" && !user) {
      setShowLogin(true);
      return;
    }
    setActiveTab(tab);
  };

  const panelProps = { addToHistory, user, onLoginClick: () => setShowLogin(true) };

  const renderPanel = () => {
    switch (activeTab) {
      case "convert":   return <ConvertPanel {...panelProps} />;
      case "add":       return <AddPanel {...panelProps} />;
      case "subtract":  return <SubtractPanel {...panelProps} />;
      case "divide":    return <DividePanel {...panelProps} />;
      case "compare":   return <ComparePanel {...panelProps} />;
      case "history":
        if (!user) {
          // Fallback: show login prompt inside panel area
          return (
            <div className="login-required-card">
              <div className="login-required-icon">🔒</div>
              <h3>Sign in to view History</h3>
              <p>Your calculation history is saved when you're signed in. Operations like Convert, Add, Subtract, Divide, and Compare are always free to use.</p>
              <button className="login-required-btn" onClick={() => setShowLogin(true)}>
                Sign In to Continue
              </button>
            </div>
          );
        }
        return <HistoryPanel history={history} clearHistory={clearHistory} />;
      default:          return <ConvertPanel {...panelProps} />;
    }
  };

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
      <main className="main-content">{renderPanel()}</main>
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;