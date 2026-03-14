import useDashboardStore           from '../store/useDashboardStore';
import { formatMoney, formatDate } from '../utils/formatters';

export default function HistoryPanel() {
  const { history, clearHistory, removeHistoryEntry } = useDashboardStore();

  if (!history.length) {
    return (
      <div className="history-panel history-empty">
        Las conversiones aparecerán aquí
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <span className="panel-label">Historial</span>
        <button className="clear-btn" onClick={clearHistory}>Limpiar</button>
      </div>

      <div className="history-grid">
        {history.map((e) => (
          <div key={e.timestamp} className="history-row">
            <div className="h-row-header">
              <span className="h-pair">{e.from} → {e.to}</span>
              <button
                className="h-delete-btn"
                onClick={() => removeHistoryEntry(e.timestamp)}
                title="Eliminar"
              >×</button>
            </div>
            <span className="h-amount">{formatMoney(e.amount, e.from)}</span>
            <span className="h-arrow">↓</span>
            <span className="h-result">{formatMoney(e.result, e.to)}</span>
            <span className="h-time">{formatDate(e.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
