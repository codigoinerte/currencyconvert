import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MAX_HISTORY = 18;

const useDashboardStore = create(
  persist(
    (set) => ({
      // ── Dashboard state ──────────────────────────────────────
      activeAsset:   'BTC',
      quoteCurrency: 'USD',
      period:        '1D',
      theme:         'dark',

      setAsset:    (asset)  => set({ activeAsset: asset }),
      setQuote:    (quote)  => set({ quoteCurrency: quote }),
      setPeriod:   (period) => set({ period }),
      toggleTheme: ()       => set((s) => ({
        theme: s.theme === 'dark' ? 'light' : 'dark',
      })),

      // ── History ──────────────────────────────────────────────
      history: [],

      addHistoryEntry: (entry) =>
        set((s) => ({ history: [entry, ...s.history].slice(0, MAX_HISTORY) })),

      removeHistoryEntry: (timestamp) =>
        set((s) => ({ history: s.history.filter((e) => e.timestamp !== timestamp) })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name:    'fxdash_store',
      storage: createJSONStorage(() => localStorage),
      // Only persist history and theme — runtime state resets on load
      partialize: (s) => ({ history: s.history, theme: s.theme }),
    }
  )
);

export default useDashboardStore;
