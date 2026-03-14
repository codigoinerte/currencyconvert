import useDashboardStore from '../store/useDashboardStore';

const QUOTE_OPTIONS = ['USD', 'EUR', 'GBP', 'PEN', 'MXN'];

export default function TopBar() {
  const { activeAsset, quoteCurrency, theme, setQuote, toggleTheme } = useDashboardStore();

  return (
    <header className="topbar">
      <div className="topbar-logo">
        fx<span>dash</span>
      </div>

      <span className="topbar-pair">
        {activeAsset} / {quoteCurrency}
      </span>

      <div className="topbar-spacer" />

      <select
        className="topbar-quote-select"
        value={quoteCurrency}
        onChange={(e) => setQuote(e.target.value)}
        title="Moneda de cotización"
      >
        {QUOTE_OPTIONS.map((q) => (
          <option key={q} value={q}>{q}</option>
        ))}
      </select>

      <button className="mode-btn" onClick={toggleTheme}>
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
    </header>
  );
}
