// src/components/KPIs.jsx
import React from 'react';

export default function KPIs({ sessions }) {
  const today = new Date().toLocaleDateString();
  const byDay = sessions.reduce((acc, s) => {
    const day = new Date(s.startTime).toLocaleDateString();
    acc[day] = (acc[day] || 0) + s.duration/60;
    return acc;
  }, {});

  const todayMins = byDay[today] || 0;
  const weekMins = sessions
    .filter(s => {
      const d = new Date(s.startTime);
      return d > Date.now() - 7*24*3600*1000;
    })
    .reduce((sum,s) => sum + s.duration/60, 0);

  return (
    <div className="kpis">
      <span>Today: {Math.round(todayMins)} min</span>
      <span>This week: {Math.round(weekMins)} min</span>
    </div>
  );
}