import useDashboardStore from '../store/useDashboardStore';
import { useAssetData }   from '../hooks/useAssetData';
import PriceChart         from './PriceChart';
import MiniStats          from './MiniStats';
import { formatChange }   from '../utils/formatters';

const PERIODS = ['4h', '1D', '1S', '1M'];

export default function ChartPanel() {
  const { activeAsset, quoteCurrency, period, setPeriod } = useDashboardStore();
  const { data, loading, stats } = useAssetData(activeAsset, quoteCurrency, period);

  const changeClass = stats.change >= 0 ? 'positive' : 'negative';

  return (
    <section className="chart-panel">
      <div className="chart-header">
        <div className="chart-header-left">
          <span className="pair-label">{activeAsset} / {quoteCurrency}</span>
          <span className={`pair-change ${changeClass}`}>
            {formatChange(stats.change)}
          </span>
        </div>

        <div className="period-tabs">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={`period-btn${period === p ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-wrapper flex flex-1 h-auto">
        {loading
          ? <div className="chart-loading">Cargando...</div>
          : <PriceChart data={data} period={period} />
        }
      </div>

      <MiniStats stats={stats} quoteCurrency={quoteCurrency} />
    </section>
  );
}
