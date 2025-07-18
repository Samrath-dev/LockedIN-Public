import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SessionsByDay from '../components/SessionsByDay';
import Navbar from '../components/Navbar';
export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/api/sessions')
      .then(res => setSessions(res.data))
      .catch(err => console.error("Error fetching sessions:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!sessions.length) return <p>No sessions recorded yet.</p>;

  return (
     <>
     {/* your app title + KPI bar */}
     <Navbar sessions={sessions} />

     {/* the chart itself */}
     <main>
       <h2>Session History</h2>
       <SessionsByDay sessions={sessions} />
     </main>
   </>
  );
}