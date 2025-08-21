import React, { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
// Try one of these depending on your data export; pick the one that matches your repo.
// import updates from '../updatesData.js'; // if it exports an array
import updates from '../RMI_FY25_Relai_updates.json'; // if JSON file

function toSearchable(items) {
  // If you know your fields, list them (e.g., ['title', 'summary', 'description'])
  const sample = items?.[0] || {};
  const knownKeys = ['title', 'summary', 'description', 'name', 'text', 'content'];
  const activeKeys = knownKeys.filter(k => k in sample);

  const fuse = new Fuse(items, {
    keys: activeKeys.length ? activeKeys : ['__all'],
    includeScore: true,
    threshold: 0.35,
  });

  // If no known keys matched, add a synthetic field for search
  const normalizedItems = activeKeys.length
    ? items
    : items.map(it => ({ ...it, __all: JSON.stringify(it) }));

  return { fuse: new Fuse(normalizedItems, fuse.options), keys: activeKeys.length ? activeKeys : ['__all'] };
}

function buildContext(matches, k = 6) {
  const top = matches.slice(0, k).map((m, i) => {
    const obj = m.item || m; // Fuse returns {item}
    return `#${i + 1}\n${JSON.stringify(obj, null, 2)}`;
  });
  return top.join('\n\n');
}

export default function ChatBox() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const items = Array.isArray(updates) ? updates : (updates?.data || updates || []);
  const { fuse } = useMemo(() => toSearchable(items), [items]);

  async function ask() {
    setLoading(true);
    setAnswer('');
    try {
      const results = question?.trim() ? fuse.search(question) : [];
      const context = buildContext(results, 6);

      const res = await fetch('http://localhost:8787/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setAnswer(data.answer || '(no answer)');
    } catch (e) {
      setAnswer(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <h2 className="text-xl font-semibold">Ask the dataset</h2>
      <textarea
        className="w-full border rounded p-2 min-h-[100px]"
        placeholder="Ask a question…"
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={ask}
          disabled={!question.trim() || loading}
        >
          {loading ? 'Thinking…' : 'Ask'}
        </button>
        <button
          className="px-3 py-2 border rounded"
          onClick={() => { setQuestion(''); setAnswer(''); }}
          disabled={loading}
        >
          Clear
        </button>
      </div>
      {answer && (
        <div className="border rounded p-3 whitespace-pre-wrap bg-white">
          {answer}
        </div>
      )}
    </div>
  );
}