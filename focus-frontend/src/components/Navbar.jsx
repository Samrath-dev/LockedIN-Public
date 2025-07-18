// src/components/Navbar.jsx
import React from 'react';
import KPIs from './KPIs';

export default function Navbar({ sessions }) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--grid)',
        background: 'var(--card)',
      }}
    >
      {/* Left: KPI summary only */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <KPIs sessions={sessions} />
      </div>

      {/* Right: empty (toggle moved up to App) */}
      <div />
    </nav>
  );
}