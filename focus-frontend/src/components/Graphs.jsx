// src/components/Graphs.jsx
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const Graphs = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/sessions')
      .then(res => {
        const formatted = res.data.map(s => ({
          time: new Date(s.endTime).toLocaleTimeString(),
          duration: s.duration
        }));
        setData(formatted);
      })
      .catch(err => console.error("Graph fetch error:", err));
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Focus Duration Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="duration" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graphs;