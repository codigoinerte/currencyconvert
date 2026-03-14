const CRYPTO_IDS = ['BTC', 'ETH', 'SOL'];

export function formatMoney(amount, currency) {
  if (amount == null || isNaN(amount)) return '—';
  if (CRYPTO_IDS.includes(currency)) {
    return `${Number(amount).toFixed(4)} ${currency}`;
  }
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${Number(amount).toFixed(2)} ${currency}`;
  }
}

export function formatPrice(price, currency) {
  if (price == null || isNaN(price)) return '—';
  if (CRYPTO_IDS.includes(currency)) {
    return price >= 1000
      ? `$${Number(price).toLocaleString('en', { maximumFractionDigits: 0 })}`
      : `$${Number(price).toFixed(2)}`;
  }
  return Number(price).toFixed(4);
}

export function formatVolume(vol) {
  if (!vol) return '—';
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
  return `$${vol.toFixed(2)}`;
}

export function formatDate(ts) {
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

export function formatChange(pct) {
  if (pct == null || isNaN(pct)) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${Number(pct).toFixed(2)}%`;
}
