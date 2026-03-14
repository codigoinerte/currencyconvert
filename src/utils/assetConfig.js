export const ASSETS = [
  { id: 'BTC', name: 'Bitcoin',     type: 'crypto', icon: '₿',  color: '#f7931a', coinId: 'bitcoin'  },
  { id: 'ETH', name: 'Ethereum',    type: 'crypto', icon: 'Ξ',  color: '#627eea', coinId: 'ethereum' },
  { id: 'SOL', name: 'Solana',      type: 'crypto', icon: '◎',  color: '#9945ff', coinId: 'solana'   },
  { id: 'USD', name: 'US Dollar',   type: 'fiat',   icon: '$',  color: '#22c87a' },
  { id: 'EUR', name: 'Euro',        type: 'fiat',   icon: '€',  color: '#4d8ef7' },
  { id: 'GBP', name: 'Libra Est.',  type: 'fiat',   icon: '£',  color: '#a78bfa' },
  { id: 'PEN', name: 'Sol Peruano', type: 'fiat',   icon: 'S/', color: '#f5a623' },
  { id: 'MXN', name: 'Peso MX',     type: 'fiat',   icon: '$',  color: '#22c87a' },
];

export const CRYPTO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
};

export const isCrypto = (assetId) => !!CRYPTO_IDS[assetId];

export const getAsset = (id) => ASSETS.find((a) => a.id === id);
