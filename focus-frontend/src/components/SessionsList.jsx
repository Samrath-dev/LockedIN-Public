import React from 'react'

// same helper for consistency
function formatMMSS(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SessionsList({ sessions }) {
  return (
    <ul className="session-list">
      {sessions.map((s, i) => (
        <li key={i}>
          <strong>{new URL(s.url).hostname}</strong> —
          {formatMMSS(s.duration)} —{' '}
          {new Date(s.startTime).toLocaleString()}
        </li>
      ))}
    </ul>
  )
}