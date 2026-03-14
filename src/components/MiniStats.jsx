import { formatPrice, formatChange } from '../utils/formatters';

export default function MiniStats({ stats, quoteCurrency }) {
  return (
    <div className="mini-stats">
      <StatCard
        label="Máximo"
        value={formatPrice(stats.high, quoteCurrency)}
        color="var(--green)"
      />
      <StatCard
        label="Mínimo"
        value={formatPrice(stats.low, quoteCurrency)}
        color="var(--red)"
      />
      <StatCard
        label="Variación"
        value={formatChange(stats.change)}
        color={stats.change >= 0 ? 'var(--green)' : 'var(--red)'}
      />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>
        {value}
      </div>
    </div>
  );
}
