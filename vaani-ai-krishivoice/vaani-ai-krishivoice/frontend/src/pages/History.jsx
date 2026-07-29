import React, { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import api from '../services/api.js';

export default function History() {
  const { sessionId } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scope, setScope] = useState('mine'); // 'mine' | 'all'

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = scope === 'mine' ? { sessionId } : {};
      const res = await api.history(params);
      setHistory(res.history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [scope]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportAll() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaani-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Conversation History</h1>
        <div className="flex items-center gap-2">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="bg-vaani-surface border border-vaani-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="mine">This device</option>
            <option value="all">All sessions</option>
          </select>
          <button onClick={load} className="p-2 rounded-lg border border-vaani-border hover:border-vaani-primary/50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportAll}
            disabled={!history.length}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-vaani-border hover:border-vaani-primary/50 disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {loading && <p className="text-vaani-muted">Loading…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!loading && !error && history.length === 0 && (
        <div className="glass-card p-8 text-center text-vaani-muted">No history yet. Have a conversation on the Translator page first.</div>
      )}

      <div className="space-y-3">
        {history.map((row) => (
          <div key={row.id} className="glass-card p-4">
            <div className="flex items-center justify-between text-xs text-vaani-muted mb-2">
              <span className="uppercase tracking-wide">{row.role}</span>
              <span>{new Date(row.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm">
              <span className="text-vaani-muted">[{row.source_lang} → {row.target_lang}]</span>{' '}
              {row.original_text}
            </p>
            {row.translated_text && row.translated_text !== row.original_text && (
              <p className="text-sm text-vaani-accent2 mt-1">→ {row.translated_text}</p>
            )}
            {row.intent && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-vaani-primary/10 text-vaani-primary">
                {row.intent}
              </span>
            )}
            {row.function_called && (
              <span className="inline-block mt-2 ml-2 text-xs px-2 py-0.5 rounded-full bg-vaani-accent/10 text-vaani-accent">
                {row.function_called}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
