import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

// helper to turn seconds into "M:SS"
function formatMMSS(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SessionsByDay({ sessions }) {
  const [selectedDay, setSelectedDay] = useState(null)

  // 1) group sessions by day, summing seconds
  const data = useMemo(() => {
    const byDay = {}
    sessions.forEach(s => {
      const day = new Date(s.startTime).toLocaleDateString()
      byDay[day] = (byDay[day] || 0) + s.duration  // keep in seconds
    })
    return Object.entries(byDay)
      .map(([day, seconds]) => ({ day, seconds }))
      .sort((a, b) => new Date(a.day) - new Date(b.day))
  }, [sessions])

  // 2) breakdown for clicked day
  const breakdown = useMemo(() => {
    if (!selectedDay) return []
    return sessions
      .filter(s => new Date(s.startTime).toLocaleDateString() === selectedDay)
      .map(s => ({
        url: new URL(s.url).hostname,
        seconds: s.duration
      }))
  }, [sessions, selectedDay])

  // theme vars from CSS
  const barFill    = 'var(--bar)'
  const gridBg     = 'var(--card)'
  const gridStroke = 'var(--grid)'
  const tickColor  = 'var(--text)'
  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    borderColor:    'var(--grid)'
  }

  return (
    <div className="sessions-by-day">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, bottom: 32, left: 16 }}
          onClick={({ activeLabel }) => setSelectedDay(activeLabel)}
        >
          <CartesianGrid fill={gridBg} stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: tickColor, fontSize: 12 }}
          />
          <YAxis
            dataKey="seconds"
            tickFormatter={sec => formatMMSS(sec)}
            tick={{ fill: tickColor, fontSize: 12 }}
            unit=""
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: tickColor }}
            labelStyle={{ color: tickColor }}
            formatter={sec => [formatMMSS(sec), '']}
          />
          <Bar
            dataKey="seconds"
            barSize={40}
            radius={[8, 8, 0, 0]}
            fill={barFill}
          />
        </BarChart>
      </ResponsiveContainer>

      {selectedDay && (
        <div className="breakdown">
          <h3>Breakdown for {selectedDay}</h3>
          <button onClick={() => setSelectedDay(null)}>Clear</button>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={breakdown}
              margin={{ top: 16, right: 16, bottom: 64, left: 16 }}
            >
              <CartesianGrid fill={gridBg} stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="url"
                tick={{ fill: tickColor, fontSize: 12 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                dataKey="seconds"
                tickFormatter={sec => formatMMSS(sec)}
                tick={{ fill: tickColor, fontSize: 12 }}
                unit=""
              />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: tickColor }}
                labelStyle={{ color: tickColor }}
                formatter={sec => [formatMMSS(sec), '']}
              />
              <Bar
                dataKey="seconds"
                barSize={30}
                radius={[8, 8, 0, 0]}
                fill={barFill}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}