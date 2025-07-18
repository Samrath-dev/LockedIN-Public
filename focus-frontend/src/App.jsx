// src/App.jsx
import React, { useContext } from 'react';
import Dashboard from './pages/Dashboard';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import './styles/global.css'; // ensure this import is here

function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);

  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={dark} onChange={toggle} />
      <span className="slider" />
    </label>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <div style={{ padding: 20 }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1>Focus Mode Dashboard</h1>
          <ThemeToggle />
        </header>
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}