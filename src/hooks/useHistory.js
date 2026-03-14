import { useState } from 'react';

const KEY = 'fxdash_history';
const MAX = 18;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}

export function useHistory() {
  const [entries, setEntries] = useState(load);

  function addEntry(entry) {
    const updated = [entry, ...entries].slice(0, MAX);
    setEntries(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  }

  function clearHistory() {
    setEntries([]);
    localStorage.removeItem(KEY);
  }

  return { entries, addEntry, clearHistory };
}
