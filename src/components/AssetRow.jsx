import { formatPrice, formatChange } from '../utils/formatters';

export default function AssetRow({ asset, price, change24h, isSelected, onClick }) {
  const changeClass = change24h == null ? 'neutral' : change24h >= 0 ? 'positive' : 'negative';

  return (
    <div
      className={`asset-row${isSelected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <div
        className="asset-icon"
        style={{
          background: `${asset.color}22`,
          color: asset.color,
        }}
      >
        {asset.icon}
      </div>

      <div className="asset-info">
        <div className="asset-name">{asset.name}</div>
        <div className="asset-id">{asset.id}</div>
      </div>

      <div className="asset-price-col">
        <div className="asset-price">
          {price != null ? formatPrice(price, asset.type === 'crypto' ? asset.id : 'USD') : '—'}
        </div>
        <div className={`asset-change ${changeClass}`}>
          {change24h != null ? formatChange(change24h) : ''}
        </div>
      </div>
    </div>
  );
}
