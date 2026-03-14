import { useState } from 'react';
import AssetList    from './AssetList';
import ConverterForm from './ConverterForm';

const FILTERS = [
  { key: 'all',    label: 'Todos'  },
  { key: 'crypto', label: 'Crypto' },
  { key: 'fiat',   label: 'Fiat'   },
];

export default function ConverterPanel() {
  const [filter, setFilter] = useState('all');

  return (
    <aside className="converter-panel">
      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <AssetList filter={filter} />

      <ConverterForm />
    </aside>
  );
}
