export default function groupByDay(sessions) {
  return sessions.reduce((acc, s) => {
    const day = new Date(s.startTime).toLocaleDateString();
    const mins = s.duration / 60;
    if (!acc[day]) acc[day] = 0;
    acc[day] += mins;
    return acc;
  }, {});
}