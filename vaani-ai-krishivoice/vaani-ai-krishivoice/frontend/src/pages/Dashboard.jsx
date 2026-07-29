import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { BarChart3, MessageSquare, Languages, Wrench } from 'lucide-react';
import api from '../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const chartTextColor = '#8b98a9';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .analytics()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-vaani-muted">Loading analytics…</div>;
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-vaani-muted">
        Couldn't load analytics from the backend ({error}). Make sure the backend server is
        running on the URL set in <code>VITE_API_BASE_URL</code>.
      </div>
    );
  }

  const langLabels = summary.byLang.map((l) => `${l.source_lang}→${l.target_lang}`);
  const langCounts = summary.byLang.map((l) => l.count);

  const intentLabels = summary.byIntent.map((i) => i.intent);
  const intentCounts = summary.byIntent.map((i) => i.count);

  const statCards = [
    { icon: MessageSquare, label: 'Total Conversation Turns', value: summary.totalConversations },
    { icon: Languages, label: 'Language Pairs Used', value: summary.byLang.length },
    { icon: Wrench, label: 'Distinct Intents Detected', value: summary.byIntent.length },
    { icon: BarChart3, label: 'Active Days (last 7)', value: summary.last7days.length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <s.icon className="w-5 h-5 text-vaani-primary mb-3" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-vaani-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Conversations by Language Pair</h2>
          {langLabels.length ? (
            <Bar
              data={{
                labels: langLabels,
                datasets: [{ label: 'Conversations', data: langCounts, backgroundColor: '#22c55e' }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: chartTextColor }, grid: { color: '#232f42' } },
                  y: { ticks: { color: chartTextColor }, grid: { color: '#232f42' } },
                },
              }}
            />
          ) : (
            <p className="text-sm text-vaani-muted">No conversations yet — try the Translator page first.</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Intent Breakdown</h2>
          {intentLabels.length ? (
            <Doughnut
              data={{
                labels: intentLabels,
                datasets: [
                  {
                    data: intentCounts,
                    backgroundColor: ['#22c55e', '#38bdf8', '#f59e0b', '#a78bfa', '#f472b6', '#facc15'],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{ plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } } }}
            />
          ) : (
            <p className="text-sm text-vaani-muted">No intent data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
